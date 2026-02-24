from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from google.cloud import vision
from google.oauth2 import service_account
import json
import re
import os

from app.database.session import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import SECRET_KEY, ALGORITHM


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# -----------------------------
# Google Vision Client (Production Safe)
# -----------------------------
def get_vision_client():
    credentials_json = os.getenv("GOOGLE_CREDENTIALS")

    if not credentials_json:
        raise Exception("Google credentials not found in environment variables")

    credentials_dict = json.loads(credentials_json)

    credentials = service_account.Credentials.from_service_account_info(
        credentials_dict
    )

    return vision.ImageAnnotatorClient(credentials=credentials)


# -----------------------------
# Database Dependency
# -----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# Get Current Logged In User
# -----------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# -----------------------------
# Register
# -----------------------------
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# -----------------------------
# Login
# -----------------------------
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# -----------------------------
# Upload Aadhaar (Google Vision OCR)
# -----------------------------
@router.post("/upload-aadhaar")
def upload_aadhaar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        image_bytes = file.file.read()

        client = get_vision_client()
        image = vision.Image(content=image_bytes)

        response = client.text_detection(image=image)

        if response.error.message:
            raise Exception(response.error.message)

        texts = response.text_annotations

        if not texts:
            raise HTTPException(status_code=400, detail="No text detected")

        extracted_text = texts[0].description

        # Aadhaar pattern (with or without spaces)
        aadhaar_match = re.search(r"\d{4}\s?\d{4}\s?\d{4}", extracted_text)

        # DOB pattern
        dob_match = re.search(r"\d{2}/\d{2}/\d{4}", extracted_text)

        if aadhaar_match:
            current_user.aadhaar_number = aadhaar_match.group()

        if dob_match:
            current_user.dob = dob_match.group()

        db.commit()
        db.refresh(current_user)

        return {
            "aadhaar_number": current_user.aadhaar_number,
            "dob": current_user.dob
        }

    except Exception as e:
        print("Vision API Error:", str(e))
        raise HTTPException(status_code=500, detail="Vision API processing failed")
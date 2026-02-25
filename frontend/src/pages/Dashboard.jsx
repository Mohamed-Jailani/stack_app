import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = "https://stackapp-production.up.railway.app";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cardStyle, setCardStyle] = useState({});

  /* ---------------- Spotlight Background ---------------- */
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /* ---------------- 3D Tilt Effect ---------------- */
  const handleCardMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = -(y - rect.height / 2) / 18;
    const rotateY = (x - rect.width / 2) / 18;

    setCardStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
    });
  };

  const handleCardLeave = () => {
    setCardStyle({
      transform: "rotateX(0deg) rotateY(0deg) scale(1)",
    });
  };

  /* ---------------- Upload Handler ---------------- */
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file ❗");
      return;
    }

    setLoading(true);
    setError("");
    setDetails(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const res = await axios.post(`${BACKEND_URL}/upload-aadhaar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDetails(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Upload failed ❌ Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{
        background: `radial-gradient(
          600px at ${mousePosition.x}px ${mousePosition.y}px,
          rgba(168,85,247,0.35),
          transparent 80%
        ), linear-gradient(to bottom right, #0f172a, #1e1b4b)`,
      }}
    >
      <div
        style={{ perspective: "1200px" }}
        className="w-full flex justify-center"
      >
        <div
          onMouseMove={handleCardMove}
          onMouseLeave={handleCardLeave}
          style={{
            ...cardStyle,
            transition: "transform 0.15s ease-out",
            transformStyle: "preserve-3d",
          }}
          className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl rounded-3xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Upload Aadhaar
          </h2>

          {/* File Input */}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full mb-4 text-sm file:mr-4 file:py-2 file:px-4 
                       file:rounded-lg file:border-0 
                       file:text-sm file:font-semibold
                       file:bg-purple-600 file:text-white
                       hover:file:bg-purple-700
                       bg-white/10 border border-white/20 rounded-lg cursor-pointer"
          />

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition duration-300 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>

          {/* Error */}
          {error && (
            <p className="mt-4 text-center text-sm text-red-400">{error}</p>
          )}

          {/* Extracted Details */}
          {details && (
            <div className="mt-6 bg-white/10 border border-white/20 p-4 rounded-xl space-y-3">
              {/* Face Image */}
              {details.face_image && (
                <img
                  src={`${BACKEND_URL}/${details.face_image}`}
                  alt="Extracted Face"
                  className="w-32 h-32 object-cover rounded-xl border border-purple-400 mx-auto"
                />
              )}

              {details.aadhaar_number && (
                <p>
                  <span className="font-semibold text-purple-300">
                    Aadhaar Number:
                  </span>{" "}
                  {details.aadhaar_number}
                </p>
              )}

              {details.dob && (
                <p>
                  <span className="font-semibold text-purple-300">DOB:</span>{" "}
                  {details.dob}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

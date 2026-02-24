import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cardStyle, setCardStyle] = useState({});

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

  const handleCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 18;
    const rotateY = (x - centerX) / 18;

    setCardStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`,
    });
  };

  const handleCardLeave = () => {
    setCardStyle({
      transform: "rotateX(0deg) rotateY(0deg) scale(1)",
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{
        background: `radial-gradient(
          600px at ${mousePosition.x}px ${mousePosition.y}px,
          rgba(168,85,247,0.35),
          transparent 80%
        ), linear-gradient(to bottom right, #0f172a, #1e1b4b)`,
        transition: "background 0.1s ease-out",
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
          className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.5)] rounded-3xl p-10 text-white text-center"
        >
          {/* 🔥 LOGO */}
          <div className="flex justify-center mb-2">
            <img
              src="/logo.png"
              alt="Aadhaar Extractor Logo"
              className="w-28 h-30 object-contain drop-shadow-[0_10px_25px_rgba(168,85,247,0.6)] transition-transform duration-300 hover:scale-110"
            />
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Welcome to Aadhaar Extractor
          </h1>

          <p className="text-gray-300 mb-8 text-sm">
            Securely extract and manage Aadhaar details with ease.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition duration-300 hover:shadow-lg hover:shadow-purple-500/40 font-medium"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="w-full py-3 rounded-lg border border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white transition duration-300 font-medium"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

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
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 18;
    const rotateY = (x - centerX) / 18;

    setCardStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
    });
  };

  const handleCardLeave = () => {
    setCardStyle({
      transform: "rotateX(0deg) rotateY(0deg) scale(1)",
    });
  };

  /* ---------------- Form Handlers ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await axios.post("https://stackapp-production.up.railway.app/login", form);

      localStorage.setItem("token", res.data.access_token);

      setMessage("Login successful 🎉 Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.detail || "Invalid email or password ❌",
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
          className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.5)] rounded-3xl p-8 text-white"
        >
          <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>

          <p className="text-center text-gray-300 mb-6 text-sm">
            Login to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-white placeholder-gray-400"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-white placeholder-gray-400"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium transition duration-300 ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/40"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-300">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-medium text-purple-400 hover:underline"
            >
              Register
            </button>
          </p>

          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                isError ? "text-red-400" : "text-green-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

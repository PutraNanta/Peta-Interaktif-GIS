import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, MapPin, HeartPulse } from "lucide-react";

const bgLogin = process.env.PUBLIC_URL + "/bg-login.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.userId || data.id);
        localStorage.setItem("userRole", data.role || "user");
        localStorage.setItem("userName", data.username || "");
        navigate("/");
      } else {
        alert("❌ Login Gagal: " + (data.message || "Email atau password salah"));
      }
    } catch (err) {
      alert("⚠️ Error Jaringan / Server Mati.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgLogin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "20px 80px 20px 20px",
      }}
    >
      {/* Overlay tipis agar teks tetap terbaca */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 30, 80, 0.25)",
          zIndex: 0,
        }}
      />

      {/* Card Login */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: "44px 40px",
          borderRadius: "24px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.25)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {/* Logo & Judul */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              width: "68px",
              height: "68px",
              background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
              borderRadius: "18px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
              boxShadow: "0 8px 20px rgba(26,115,232,0.35)",
            }}
          >
            <HeartPulse size={34} color="white" />
          </div>
          <h1
            style={{
              margin: "0 0 6px 0",
              color: "#1a1a2e",
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            Peta Kesehatan Bali
          </h1>
          <p style={{ margin: 0, color: "#5f6368", fontSize: "14px" }}>
            Masuk untuk mengakses peta fasilitas kesehatan
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: "18px", textAlign: "left" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: 700,
                color: "#2c3e50",
                fontSize: "13px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #e0e0e0",
                borderRadius: "10px",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s",
                background: "#fafafa",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1a73e8")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "28px", textAlign: "left" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: 700,
                color: "#2c3e50",
                fontSize: "13px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #e0e0e0",
                borderRadius: "10px",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s",
                background: "#fafafa",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1a73e8")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              background: isLoading
                ? "#b0bec5"
                : "linear-gradient(135deg, #1a73e8, #0d47a1)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: isLoading ? "none" : "0 4px 14px rgba(26,115,232,0.4)",
              transition: "all 0.2s",
            }}
          >
            {isLoading ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.5)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Masuk...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Masuk
              </>
            )}
          </button>
        </form>

        {/* Link Register */}
        <p style={{ marginTop: "22px", color: "#5f6368", fontSize: "14px" }}>
          Belum punya akun?{" "}
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "none",
              border: "none",
              color: "#1a73e8",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "14px",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Daftar di sini
          </button>
        </p>

        {/* Branding bawah */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            color: "#9aa0a6",
            fontSize: "12px",
          }}
        >
          <MapPin size={13} />
          Sistem Informasi Geografis — Universitas Udayana
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

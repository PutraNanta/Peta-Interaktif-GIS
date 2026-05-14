import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, MapPin, HeartPulse } from "lucide-react";

const bgLogin = process.env.PUBLIC_URL + "/bg-login.jpg";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Password tidak cocok!");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userName", data.username);
        navigate("/");
      } else {
        setError(data.message || "Registrasi gagal");
      }
    } catch {
      setError("Koneksi ke server gagal. Pastikan backend berjalan.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #e0e0e0",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    background: "#fafafa",
    transition: "border-color 0.2s",
  };

  const fields = [
    { label: "Username", name: "username", type: "text", placeholder: "Nama pengguna Anda" },
    { label: "Email", name: "email", type: "email", placeholder: "email@contoh.com" },
    { label: "Password", name: "password", type: "password", placeholder: "Min. 6 karakter" },
    { label: "Konfirmasi Password", name: "confirm", type: "password", placeholder: "Ulangi password" },
  ];

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
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 30, 80, 0.25)",
          zIndex: 0,
        }}
      />

      {/* Card Register */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "24px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
              borderRadius: "18px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
              boxShadow: "0 8px 20px rgba(26,115,232,0.35)",
            }}
          >
            <HeartPulse size={32} color="white" />
          </div>
          <h1
            style={{
              margin: "0 0 6px 0",
              fontSize: "24px",
              fontWeight: 800,
              color: "#1a1a2e",
              letterSpacing: "-0.5px",
            }}
          >
            Buat Akun
          </h1>
          <p style={{ margin: 0, color: "#5f6368", fontSize: "14px" }}>
            Bergabung dengan Peta Kesehatan Bali
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fde8e8",
              border: "1px solid #f5c6c6",
              color: "#c0392b",
              padding: "12px 15px",
              borderRadius: "10px",
              marginBottom: "18px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div key={f.name} style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#2c3e50",
                  marginBottom: "6px",
                }}
              >
                {f.label}
              </label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#1a73e8")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "#b0bec5"
                : "linear-gradient(135deg, #1a73e8, #0d47a1)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: loading ? "none" : "0 4px 14px rgba(26,115,232,0.4)",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
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
                Mendaftarkan...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Daftar Sekarang
              </>
            )}
          </button>
        </form>

        {/* Link Login & Guest */}
        <div style={{ textAlign: "center", marginTop: "22px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#5f6368" }}>
            Sudah punya akun?{" "}
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                color: "#1a73e8",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Masuk di sini
            </button>
          </p>
          <div style={{ display: "flex", alignItems: "center", margin: "4px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#f0f0f0" }}></div>
            <span style={{ padding: "0 10px", fontSize: "12px", color: "#9aa0a6" }}>ATAU</span>
            <div style={{ flex: 1, height: "1px", background: "#f0f0f0" }}></div>
          </div>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "1px solid #1a73e8",
              color: "#1a73e8",
              padding: "10px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => { e.target.style.background = "#e8f0fe"; }}
            onMouseOut={(e) => { e.target.style.background = "none"; }}
          >
            Lanjutkan sebagai Guest
          </button>
        </div>

        {/* Branding bawah */}
        <div
          style={{
            marginTop: "18px",
            paddingTop: "14px",
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

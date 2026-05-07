import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Password tidak cocok!'); return; }
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('gis_token', data.token);
        localStorage.setItem('gis_user', JSON.stringify({ id: data.userId, role: data.role, username: data.username }));
        navigate('/');
      } else {
        setError(data.message || 'Registrasi gagal');
      }
    } catch {
      setError('Koneksi ke server gagal. Pastikan backend berjalan.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '50px 40px', width: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{
            width: '64px', height: '64px', background: 'linear-gradient(135deg,#e74c3c,#c0392b)',
            borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '15px'
          }}>
            <span style={{ fontSize: '28px' }}>🏥</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#2c3e50' }}>Buat Akun</h1>
          <p style={{ margin: '6px 0 0', color: '#7f8c8d', fontSize: '14px' }}>
            Bergabung dengan Peta Kesehatan Bali
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fde8e8', border: '1px solid #e74c3c', color: '#c0392b',
            padding: '12px 15px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Username', name: 'username', type: 'text', placeholder: 'Nama pengguna Anda' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'email@contoh.com' },
            { label: 'Password', name: 'password', type: 'password', placeholder: 'Min. 6 karakter' },
            { label: 'Konfirmasi Password', name: 'confirm', type: 'password', placeholder: 'Ulangi password' },
          ].map(f => (
            <div key={f.name} style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#2c3e50', marginBottom: '6px' }}>
                {f.label}
              </label>
              <input
                type={f.type} name={f.name} value={form[f.name]}
                onChange={handleChange} placeholder={f.placeholder} required
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: '1.5px solid #e0e0e0', fontSize: '14px', boxSizing: 'border-box',
                  outline: 'none', transition: '0.2s'
                }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', background: loading ? '#ccc' : 'linear-gradient(135deg,#e74c3c,#c0392b)',
            color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700,
            fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px'
          }}>
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#7f8c8d' }}>
          Sudah punya akun?{' '}
          <a href="/" style={{ color: '#e74c3c', fontWeight: 700, textDecoration: 'none' }}>
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
}

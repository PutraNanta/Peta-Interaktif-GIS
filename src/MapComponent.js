import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';

// Fix untuk default marker Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const baliBounds = [[-9.0, 114.4], [-8.0, 115.8]];

// Pembuat Ikon Nomor bergaya PIN Lokasi (Teardrop)
const createNumberedIcon = (color, number) => new L.divIcon({
  className: 'custom-numbered-pin',
  html: `
    <div style="
      background-color: ${color};
      width: 32px; 
      height: 32px; 
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex; 
      justify-content: center; 
      align-items: center; 
      border: 2px solid white; 
      box-shadow: -3px 3px 6px rgba(0,0,0,0.4);
    ">
      <span style="transform: rotate(45deg); color: white; font-weight: 900; font-size: 14px;">${number}</span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 34],
  popupAnchor: [0, -34],
});

// Pemetaan standard colors fallback
const colorMap = {
  rumah: '#3498db',
  kantor: '#95a5a6',
  kesehatan: '#e74c3c',
  pendidikan: '#2ecc71',
  restauran: '#e67e22'
};

// Komponen penangkap klik peta
function LocationMarker({ isEditMode, authKey, onMapClick, clearActiveMarker }) {
  useMapEvents({
    click(e) {
      if (clearActiveMarker) clearActiveMarker();
      if (!isEditMode) return; // Jika mode edit mati, jangan lakukan apapun
      if (!authKey) {
        alert("🔒 AKSES DITOLAK: Anda harus Login untuk menambah poin.");
        return;
      }
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Hook untuk FlyTo (Navigasi 2-Arah)
function MapFocus({ activeMarkerId, markers }) {
  const map = useMap();
  useEffect(() => {
    if (activeMarkerId) {
      const target = markers.find(m => m.id === activeMarkerId);
      if (target) {
        map.flyTo([target.lat, target.lng], 18, { animate: true, duration: 1.5 });
      }
    }
  }, [activeMarkerId, markers, map]);
  return null;
}

// ===== KOMPONEN UTAMA =====
export default function MapComponent({ isAdminMode }) {
  const [markers, setMarkers] = useState([]);
  const [masterTypes, setMasterTypes] = useState([]);

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [accordion, setAccordion] = useState(isAdminMode ? 'login' : 'filter'); 
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [isTableOpen, setIsTableOpen] = useState(true);

  // Modals & Admin States
  const [authKey, setAuthKey] = useState("");
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("");
  const [isEditMode, setIsEditMode] = useState(false); // Toggle Tambah Data
  const [modalData, setModalData] = useState(null); // Data titik baru sebelum disave

  // Form States
  const [selectedType, setSelectedType] = useState("rumah");
  const [customName, setCustomName] = useState("");
  const [dynamicAttrs, setDynamicAttrs] = useState({}); // Polimorfik field
  const [filters, setFilters] = useState({});

  useEffect(() => {
    // 1. Ambil Master Tipe
    const fetchMasters = async () => {
      try {
        const tRes = await fetch("http://localhost:5000/api/tipe");
        const tData = await tRes.json();
        if (tData.status === 'success') {
          setMasterTypes(tData.data);
          // Set default filters to true
          const initialFilters = {};
          tData.data.forEach(t => initialFilters[t.nama_tipe] = true);
          setFilters(initialFilters);
          if (tData.data.length > 0) setSelectedType(tData.data[0].nama_tipe);
        }
      } catch (e) {
        const dummy = [
          {nama_tipe: 'rumah', warna: 'blue'}, {nama_tipe: 'kantor', warna: 'grey'},
          {nama_tipe: 'kesehatan', warna: 'red'}, {nama_tipe: 'pendidikan', warna: 'green'},
          {nama_tipe: 'restauran', warna: 'orange'}
        ];
        setMasterTypes(dummy);
        setFilters({rumah:true, kantor:true, kesehatan:true, pendidikan:true, restauran:true});
      }
    };

    // 2. Ambil Semua Poin
    const fetchPoints = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/points");
        const result = await response.json();
        if (result.status === "success" && result.data) {
          const backendMarkers = [];
          Object.values(result.data).forEach((pointGroup) => {
            pointGroup.forEach((point) => {
              backendMarkers.push({
                id: point.id,
                lat: point.latitude,
                lng: point.longitude,
                name: point.nama,
                alamat: point.alamat,
                tipe_objek: point.tipe_objek,
                atribut_tambahan: point.atribut_tambahan || {}
              });
            });
          });
          setMarkers(backendMarkers);
        }
      } catch (error) { console.error("Fetch Points Error:", error); }
    };

    fetchMasters();
    fetchPoints();
  }, []);

  const handleFilterChange = (type) => setFilters(prev => ({ ...prev, [type]: !prev[type] }));

  // Hapus Data
  const handleDeletePoint = async (markerId) => {
    if(!authKey) { alert("🔒 AKSES DITOLAK."); return; }
    if (!window.confirm("Yakin menghapus poin ini?")) return;
    try {
        const res = await fetch(`http://localhost:5000/api/points/${markerId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${authKey}` }
        });
        const result = await res.json();
        if(result.status === 'success') {
          setMarkers(prev => prev.filter((m) => m.id !== markerId));
        }
    } catch(err) { console.log(err); }
  };

  // Autentikasi Admin
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
         setAuthKey(data.token);
         alert("Login Sukses!");
      } else { alert("Login Gagal!"); }
    } catch(err) { alert("Error Jaringan / Server Mati."); }
  };
  const handleLogout = () => { setAuthKey(""); setPassword(""); setIsEditMode(false); };

  // Logika saat Map Diklik dalam MODE EDIT (Membuat data baru)
  const handleMapClick = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      const locationName = data.display_name || "Lokasi tidak diketahui";
      
      setCustomName("");
      setDynamicAttrs({});
      setModalData({ isEdit: false, lat, lng, defaultAddress: locationName });
    } catch (err) {
      setCustomName("");
      setDynamicAttrs({});
      setModalData({ isEdit: false, lat, lng, defaultAddress: "Gagal menarik alamat" });
    }
  };

  // Logika Menekan Tombol Edit
  const handleEditClick = (pos, e) => {
    e.stopPropagation();
    if (!authKey) return;
    setCustomName(pos.name);
    setSelectedType(pos.tipe_objek);
    setDynamicAttrs(pos.atribut_tambahan || {});
    setModalData({
      isEdit: true,
      id: pos.id,
      lat: pos.lat,
      lng: pos.lng,
      defaultAddress: pos.alamat
    });
  };

  // Simpan Data dari Modal (Bisa POST atau PUT)
  const handleSaveModal = async () => {
    if (!modalData) return;
    const finalName = customName.trim() !== "" ? customName : modalData.defaultAddress;
    
    let finalDynamicAttrs = { ...dynamicAttrs };
    // Mencegah bug select field yang belum sempat disentuh tapi bernilai undefined
    if (selectedType === 'kesehatan') {
      if (!finalDynamicAttrs.fasilitas) finalDynamicAttrs.fasilitas = 'Rumah Sakit';
      if (!finalDynamicAttrs.bpjs) finalDynamicAttrs.bpjs = 'Ya';
    } else if (selectedType === 'pendidikan') {
      if (!finalDynamicAttrs.tingkat) finalDynamicAttrs.tingkat = 'SD';
      if (!finalDynamicAttrs.status) finalDynamicAttrs.status = 'Negeri';
    }

    const pointPayload = {
      nama: finalName,
      alamat: modalData.defaultAddress, 
      latitude: modalData.lat,
      longitude: modalData.lng,
      tipe_objek: selectedType,
      atribut_tambahan: finalDynamicAttrs
    };

    try {
      const url = modalData.isEdit 
        ? `http://localhost:5000/api/points/${modalData.id}` 
        : "http://localhost:5000/api/points";
        
      const backendResponse = await fetch(url, {
        method: modalData.isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authKey}` },
        body: JSON.stringify(pointPayload)
      });
      const result = await backendResponse.json();
      
      if (result.status === "success") {
        const savedMarker = {
          id: modalData.isEdit ? modalData.id : result.data.id,
          lat: pointPayload.latitude,
          lng: pointPayload.longitude,
          name: pointPayload.nama,
          alamat: pointPayload.alamat,
          tipe_objek: pointPayload.tipe_objek,
          atribut_tambahan: pointPayload.atribut_tambahan
        };
        
        if (modalData.isEdit) {
          setMarkers(prev => prev.map(m => m.id === modalData.id ? savedMarker : m));
        } else {
          setMarkers(prev => [...prev, savedMarker]);
        }
        setModalData(null); // Tutup Modal
      } else { alert('Gagal: ' + result.message); }
    } catch (err) { console.error(err); }
  };

  // Komponen Input Form Dinamis Rumpun
  const renderDynamicFields = () => {
    const inputStyle = {width: '100%', padding:'10px', margin:'5px 0 15px 0', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:'6px', fontSize:'13px'};
    const labelStyle = {fontSize: '12px', fontWeight: 'bold', color: '#555'};

    if (selectedType === 'restauran') {
      return (
        <div style={{marginTop: '15px', background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ffe0b2'}}>
          <h4 style={{margin: '0 0 10px 0', color: '#e67e22'}}>Atribut Khusus: Restauran</h4>
          <label style={labelStyle}>Menu Utama / Andalan</label>
          <input type="text" placeholder="Misal: Nasi Goreng, Steak..." value={dynamicAttrs.menu || ''} onChange={e => setDynamicAttrs({...dynamicAttrs, menu: e.target.value})} style={inputStyle} />
          
          <label style={labelStyle}>Jam Buka - Tutup</label>
          <input type="text" placeholder="Misal: 08:00 - 22:00" value={dynamicAttrs.jam_operasional || ''} onChange={e => setDynamicAttrs({...dynamicAttrs, jam_operasional: e.target.value})} style={inputStyle} />
        </div>
      );
    } else if (selectedType === 'kesehatan') {
      return (
        <div style={{marginTop: '15px', background: '#ffebee', padding: '15px', borderRadius: '8px', border: '1px solid #ffcdd2'}}>
          <h4 style={{margin: '0 0 10px 0', color: '#e74c3c'}}>Atribut Khusus: Kesehatan</h4>
          <label style={labelStyle}>Jenis Fasilitas</label>
          <select value={dynamicAttrs.fasilitas || 'Rumah Sakit'} onChange={e => setDynamicAttrs({...dynamicAttrs, fasilitas: e.target.value})} style={inputStyle}>
            <option value="Rumah Sakit">Rumah Sakit</option>
            <option value="Klinik">Klinik Umum</option>
            <option value="Apotek">Apotek</option>
            <option value="Puskesmas">Puskesmas</option>
          </select>
          
          <label style={labelStyle}>Menerima Pasien BPJS?</label>
          <select value={dynamicAttrs.bpjs || 'Ya'} onChange={e => setDynamicAttrs({...dynamicAttrs, bpjs: e.target.value})} style={inputStyle}>
            <option value="Ya">Ya, Menerima BPJS</option>
            <option value="Tidak">Tidak Menerima</option>
          </select>

          <label style={labelStyle}>Jam Operasional</label>
          <input type="text" placeholder="Misal: 24 Jam, 08:00 - 20:00" value={dynamicAttrs.jam_operasional || ''} onChange={e => setDynamicAttrs({...dynamicAttrs, jam_operasional: e.target.value})} style={inputStyle} />
          
          <label style={labelStyle}>Dokter Spesialis Tersedia</label>
          <input type="text" placeholder="Misal: Spesialis Anak, Kandungan, Gigi..." value={dynamicAttrs.dokter_spesialis || ''} onChange={e => setDynamicAttrs({...dynamicAttrs, dokter_spesialis: e.target.value})} style={inputStyle} />
        </div>
      );
    } else if (selectedType === 'pendidikan') {
      return (
        <div style={{marginTop: '15px', background: '#e8f5e9', padding: '15px', borderRadius: '8px', border: '1px solid #c8e6c9'}}>
          <h4 style={{margin: '0 0 10px 0', color: '#2ecc71'}}>Atribut Khusus: Pendidikan</h4>
          <label style={labelStyle}>Tingkat Institusi</label>
          <select value={dynamicAttrs.tingkat || 'SD'} onChange={e => setDynamicAttrs({...dynamicAttrs, tingkat: e.target.value})} style={inputStyle}>
            <option value="SD">SD / Sederajat</option>
            <option value="SMP">SMP / Sederajat</option>
            <option value="SMA">SMA / SMK</option>
            <option value="Perguruan Tinggi">Perguruan Tinggi</option>
          </select>
          
          <label style={labelStyle}>Status Institusi</label>
          <select value={dynamicAttrs.status || 'Negeri'} onChange={e => setDynamicAttrs({...dynamicAttrs, status: e.target.value})} style={inputStyle}>
            <option value="Negeri">Negeri</option>
            <option value="Swasta">Swasta</option>
            <option value="Internasional">Internasional</option>
          </select>
        </div>
      );
    } else if (selectedType === 'kantor') {
      return (
        <div style={{marginTop: '15px', background: '#f5f5f5', padding: '15px', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
          <h4 style={{margin: '0 0 10px 0', color: '#95a5a6'}}>Atribut Khusus: Perkantoran</h4>
          <label style={labelStyle}>Bidang Usaha</label>
          <input type="text" placeholder="Misal: Teknologi, Keuangan, Pemerintahan..." value={dynamicAttrs.bidang || ''} onChange={e => setDynamicAttrs({...dynamicAttrs, bidang: e.target.value})} style={inputStyle} />
        </div>
      );
    } else if (selectedType === 'rumah') {
      return (
        <div style={{marginTop: '15px', background: '#e3f2fd', padding: '15px', borderRadius: '8px', border: '1px solid #bbdefb'}}>
          <h4 style={{margin: '0 0 10px 0', color: '#3498db'}}>Atribut Khusus: Pemukiman</h4>
          <label style={labelStyle}>Nama Pemilik Pemukiman</label>
          <input type="text" placeholder="Misal: Keluarga Bapak Budi" value={dynamicAttrs.pemilik || ''} onChange={e => setDynamicAttrs({...dynamicAttrs, pemilik: e.target.value})} style={inputStyle} />
        </div>
      );
    }
    return null; // Jika ada rumpun lain tidak terdefinisi
  };

  const displayedMarkers = markers.filter(m => filters[m.tipe_objek]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* MODAL INPUT PETA (Tambah/Edit) */}
      {modalData && (
        <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'#fff', padding:'30px', borderRadius:'12px', width:'420px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 10px 30px rgba(0,0,0,0.3)'}}>
             <h3 style={{margin:'0 0 20px 0'}}>{modalData.isEdit ? '✏️ Edit Data Objek' : '📍 Detail Objek Baru'}</h3>
             
             <label style={{fontSize: '12px', fontWeight: 'bold'}}>Nama Custom Objek (Opsional)</label>
             <input type="text" placeholder="Ketik nama khusus..." value={customName} onChange={e=>setCustomName(e.target.value)} style={{width: '100%', padding:'12px', margin:'5px 0 15px 0', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:'6px'}}/>
             
             <label style={{fontSize: '12px', fontWeight: 'bold'}}>Kategori Objek (Rumpun Master)</label>
             <select value={selectedType} onChange={e=>setSelectedType(e.target.value)} style={{width: '100%', padding:'12px', marginTop: '5px', borderRadius:'6px', border:'1px solid #ddd', fontWeight:'bold'}}>
                {masterTypes.map(t => (
                  <option key={t.nama_tipe} value={t.nama_tipe}>{t.nama_tipe.toUpperCase()}</option>
                ))}
             </select>

             {/* INJEKSI FORM DINAMIS SESUAI RUMPUN */}
             {renderDynamicFields()}

             <div style={{marginTop:'25px', display:'flex', gap:'10px', justifyContent:'flex-end'}}>
               <button onClick={()=>{setModalData(null); setDynamicAttrs({});}} style={{padding:'10px 15px', border:'none', background:'#ccc', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>Batal</button>
               <button onClick={handleSaveModal} style={{padding:'10px 20px', border:'none', background:'#007bff', color:'white', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>{modalData.isEdit ? 'Simpan Perubahan' : 'Tambahkan Lokasi'}</button>
             </div>
          </div>
        </div>
      )}

      {/* ===== BAGIAN ATAS: PETA & SIDEBAR ===== */}
      <div style={{ flex: 1, position: 'relative', minHeight: '60vh', overflow: 'hidden' }}>
        
        {/* HAMBURGER BUTTON ELEGANT */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{
              position: 'absolute', top: '20px', left: '50px', zIndex: 1001,
              backgroundColor: '#ffffff', border: '1px solid #eaeaea', padding: '12px 20px',
              borderRadius: '30px', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              color: '#2c3e50', letterSpacing: '0.5px'
            }}
          >
            {isAdminMode ? '☰ Akses Admin' : '☰ Filter Peta'}
          </button>
        )}

        {/* SIDEBAR MENGAMBANG (OFF-CANVAS) */}
        <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%', width: '360px',
            backgroundColor: '#ffffff', zIndex: 1005,
            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column'
        }}>
          {/* HEADER SIDEBAR */}
          <div style={{ padding: '30px 30px 25px', backgroundColor: '#212529', color: '#fff', borderBottom: '4px solid #3498db', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{margin: '0', fontSize: '24px', fontWeight: '800', letterSpacing: '1px'}}>{isAdminMode ? 'GIS Admin' : 'GIS Public'}</h3>
              <p style={{margin: '6px 0 0 0', fontSize: '11px', color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '1.5px'}}>Management System</p>
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#adb5bd', fontSize: '20px', cursor: 'pointer', outline: 'none' }}
              title="Tutup Panel"
            >✖</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            
            {/* ACCORDION 1: LOGIN (HANYA MUNCUL DI ADMIN MODE) */}
            {isAdminMode && (
              <div style={{ borderBottom: '1px solid #f1f3f5' }}>
                <button 
                  onClick={() => setAccordion(accordion === 'login' ? '' : 'login')}
                  style={{ width: '100%', padding: '22px 30px', textAlign: 'left', background: 'transparent', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '14px', outline: 'none' }}
                >
                  <span style={{color: authKey ? '#2ecc71' : '#495057', letterSpacing: '0.5px'}}>{authKey ? 'Akses Admin Aktif' : 'Login Admin'}</span>
                  <span style={{color: '#ced4da', fontSize: '18px'}}>{accordion === 'login' ? '−' : '+'}</span>
                </button>
                {accordion === 'login' && (
                  <div style={{ padding: '0 30px 25px 30px' }}>
                    {!authKey ? (
                      <form onSubmit={handleLogin}>
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email..." style={{width: '100%', padding:'14px', marginBottom:'12px', border:'1px solid #dee2e6', borderRadius: '8px', fontSize: '13px', backgroundColor: '#f8f9fa'}}/>
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password..." style={{width: '100%', padding:'14px', marginBottom:'16px', border:'1px solid #dee2e6', borderRadius: '8px', fontSize: '13px', backgroundColor: '#f8f9fa'}}/>
                        <button type="submit" style={{width: '100%', padding:'14px', background:'#3498db', color:'#fff', border:'none', borderRadius:'8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'}}>IZINKAN AKSES</button>
                      </form>
                    ) : (
                      <div>
                        <button onClick={handleLogout} style={{width: '100%', padding:'14px', background:'#e74c3c', color:'#fff', border:'none', borderRadius:'8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'}}>LOGOUT (TUTUP)</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ACCORDION 2: FILTER LAYER */}
            <div style={{ borderBottom: '1px solid #f1f3f5' }}>
              <button 
                onClick={() => setAccordion(accordion === 'filter' ? '' : 'filter')}
                style={{ width: '100%', padding: '22px 30px', textAlign: 'left', background: 'transparent', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '14px', outline: 'none' }}
              >
                <span style={{color: '#495057', letterSpacing: '0.5px'}}>Filter Layer Master</span>
                <span style={{color: '#ced4da', fontSize: '18px'}}>{accordion === 'filter' ? '−' : '+'}</span>
              </button>
              {accordion === 'filter' && (
                <div style={{ padding: '5px 30px 25px 30px' }}>
                  {masterTypes.map(t => (
                    <div key={t.nama_tipe} style={{marginBottom:'15px'}}>
                      <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                        <input type="checkbox" checked={filters[t.nama_tipe] || false} onChange={()=>handleFilterChange(t.nama_tipe)} style={{marginRight:'15px', transform: 'scale(1.3)', accentColor: '#3498db'}}/>
                        <span style={{fontWeight: '600', fontSize: '14px', color: '#495057', textTransform: 'capitalize'}}>{t.nama_tipe.replace('_', ' ')}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Navigasi Link Antar Halaman */}
            <div style={{ padding: '30px', textAlign: 'center', marginTop: '20px' }}>
              {isAdminMode ? (
                 <a href="/" style={{color:'#3498db', fontSize:'13px', textDecoration:'none', fontWeight:'bold'}}>← Kembali ke Mode Publik</a>
              ) : (
                 <a href="/admin" style={{color:'#e67e22', fontSize:'13px', textDecoration:'none', fontWeight:'bold'}}>Buka Halaman Admin (CRUD) →</a>
              )}
            </div>

          </div>
        </div>

        {/* PETA CONTAINER */}
        <MapContainer center={[-8.65, 115.2167]} zoom={15} minZoom={9} maxZoom={18} maxBounds={baliBounds} style={{ height: "100%", width: "100%", zIndex: 1, cursor: isEditMode ? 'crosshair' : 'grab' }}>
          
          <MapFocus activeMarkerId={activeMarkerId} markers={displayedMarkers} />
          
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Peta Jalan">
              <TileLayer attribution="© OSM" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satelit">
              <TileLayer attribution="© Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            </LayersControl.BaseLayer>
          </LayersControl>

          {isAdminMode && authKey && <LocationMarker isEditMode={isEditMode} authKey={authKey} onMapClick={handleMapClick} clearActiveMarker={() => setActiveMarkerId(null)} />}

          {displayedMarkers.map((pos, index) => {
             // Cari warna dari master data, default ke biru kalau nggak ketemu
             const mType = masterTypes.find(t => t.nama_tipe === pos.tipe_objek);
             const markerColor = mType ? mType.warna : (colorMap[pos.tipe_objek] || '#3498db');
             
             // Peta konversi ke warna Hex agar elegan
             const cssColors = {
               'blue': '#3498db',
               'red': '#e74c3c',
               'orange': '#e67e22',
               'grey': '#95a5a6',
               'green': '#2ecc71'
             };
             
             const finalColor = cssColors[markerColor] || markerColor || '#3498db';

             const nIcon = createNumberedIcon(finalColor, index + 1);

             return (
               <Marker 
                  key={pos.id} 
                  position={[pos.lat, pos.lng]} 
                  icon={nIcon}
                  eventHandlers={{
                    click: () => setActiveMarkerId(pos.id) // Saat marker diklik, set Active ID
                  }}
                >
                  <Popup>
                    <div style={{textAlign:'center', marginBottom:'8px'}}>
                      <b style={{background:'#007bff', color:'white', padding:'3px 8px', borderRadius:'10px', textTransform:'uppercase', fontSize:'11px', display: 'inline-block'}}>
                        {pos.tipe_objek}
                      </b>
                    </div>
                    <b>No Urut:</b> {index + 1}<br/>
                    <b>Nama Lokasi:</b><br/><span style={{fontSize: '14px', color: '#111'}}>{pos.name}</span><br/><br/>
                    
                    {/* Render Atribut Dinamis secara elegan */}
                    {Object.keys(pos.atribut_tambahan || {}).length > 0 && (
                      <div style={{background: '#f8f9fa', padding: '8px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #eaeaea'}}>
                         <strong style={{fontSize:'11px', color:'#7f8c8d', display:'block', marginBottom:'4px'}}>INFORMASI SPESIFIK RUMPUN:</strong>
                         {Object.entries(pos.atribut_tambahan).map(([key, val]) => (
                            <div key={key} style={{fontSize: '12px', marginBottom: '3px'}}>
                               <span style={{textTransform:'capitalize', fontWeight:'600', color:'#34495e'}}>{key.replace('_', ' ')}:</span> {val}
                            </div>
                         ))}
                      </div>
                    )}

                    <b>Alamat Geografis:</b><br/><span style={{color: '#666'}}>{pos.alamat}</span><br/>
                  </Popup>
               </Marker>
             )
          })}
        </MapContainer>

        {/* TOGGLE EDIT MODE MELAYANG (HANYA ADMIN) */}
        {isAdminMode && authKey && (
           <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: '#fff', padding: '10px 25px', borderRadius: '30px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{fontWeight: 'bold', color: isEditMode ? '#e74c3c' : '#333'}}>Mode Penambahan Titik : {isEditMode ? 'AKTIF (Klik Peta)' : 'MATI'}</span>
              <button 
                 onClick={()=>setIsEditMode(!isEditMode)} 
                 style={{background: isEditMode ? '#e74c3c' : '#2ecc71', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold'}}
              >
                 {isEditMode ? 'Matikan' : 'Nyalakan'}
              </button>
           </div>
        )}

      </div>

      {/* ===== BAGIAN BAWAH: DATA TABEL ADMIN ===== */}
      {isAdminMode ? (
        isTableOpen ? (
          <div style={{ height: '35vh', background: '#f4f4f9', borderTop: '4px solid #343a40', padding: '15px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: '16px' }}>Manajemen Database Rumpun ({displayedMarkers.length} Entri)</h3>
              <button 
                onClick={() => setIsTableOpen(false)}
                style={{ background: '#343a40', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                ▼ Sembunyikan Tabel
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#343a40', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '12px 15px' }}>ID / No</th>
                    <th style={{ padding: '12px 15px' }}>Tipe Rumpun</th>
                    <th style={{ padding: '12px 15px' }}>Nama Objek</th>
                    <th style={{ padding: '12px 15px' }}>Atribut Khusus (JSON)</th>
                    <th style={{ padding: '12px 15px', textAlign: 'center' }}>Aksi CRUD</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedMarkers.length === 0 ? (
                    <tr><td colSpan="5" style={{padding: '30px', textAlign: 'center', color: '#888', fontStyle: 'italic'}}>Belum ada data tersedia.</td></tr>
                  ) : (
                    displayedMarkers.map((pos, index) => (
                      <tr 
                        key={pos.id} 
                        onClick={() => setActiveMarkerId(pos.id)}
                        style={{ 
                          borderBottom: '1px solid #eee', 
                          cursor: 'pointer', 
                          background: activeMarkerId === pos.id ? '#e3f2fd' : 'transparent',
                          transition: 'background 0.3s'
                        }}
                      >
                        <td style={{ padding: '10px 15px' }}>
                           <span style={{background:'#333', color:'#fff', padding:'2px 6px', borderRadius:'10px', fontSize:'11px'}}>{index + 1}</span>
                        </td>
                        <td style={{ padding: '10px 15px', textTransform: 'capitalize', fontWeight: 'bold' }}>
                          <span style={{background: '#e9ecef', padding: '2px 6px', borderRadius: '4px', fontSize: '12px'}}>{pos.tipe_objek}</span>
                        </td>
                        <td style={{ padding: '10px 15px', fontWeight: 'bold', color: '#222' }}>{pos.name}</td>
                        <td style={{ padding: '10px 15px', color: '#555', fontSize: '12px' }}>
                           {/* Stringify simple */}
                           <code style={{background:'#f8f9fa', padding:'3px 6px', borderRadius:'4px', display:'block', maxWidth:'250px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                             {JSON.stringify(pos.atribut_tambahan || {})}
                           </code>
                        </td>
                        <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                          {authKey ? (
                            <>
                              <button 
                                onClick={(e) => handleEditClick(pos, e)}
                                style={{ padding: '5px 10px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginRight: '5px' }}
                              >Edit</button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeletePoint(pos.id); }}
                                style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                              >Hapus</button>
                            </>
                          ) : (
                            <span style={{color:'#aaa', fontSize:'11px'}}>Protected</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsTableOpen(true)}
            style={{ height: '6vh', background: '#343a40', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderTop: '2px solid #222' }}
          >
             <span style={{ fontWeight: 'bold', fontSize: '13px', letterSpacing: '0.5px' }}>▲ Buka Tabel Manajemen Database ({displayedMarkers.length} Entri)</span>
          </div>
        )
      ) : (
        <div style={{ height: '7vh', background: '#212529', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
           Buka <a href="/admin" style={{color: '#3498db', marginLeft: '5px', fontWeight: 'bold'}}>Halaman Admin</a>
        </div>
      )}
    </div>
  );
}
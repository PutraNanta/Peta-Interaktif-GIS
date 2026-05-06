import re

with open('src/MapComponent.js.bak', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Imports
code = code.replace(
    'import { Menu, X, ChevronUp, ChevronDown, Map, Table, Edit3, MapPin, Trash2, Power, Utensils, HeartPulse, GraduationCap, Home, Briefcase } from "lucide-react";',
    'import { Menu, X, ChevronUp, ChevronDown, Map, Table, Edit3, MapPin, Trash2, Power, Utensils, HeartPulse, GraduationCap, Home, Briefcase, Search, Filter, LogIn, User, LogOut, CheckCircle } from "lucide-react";'
)

# 2. States
new_states = """
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchSearching, setIsSearchSearching] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [customFlyTo, setCustomFlyTo] = useState(null);
"""
code = code.replace(
    'const [isSidebarOpen, setIsSidebarOpen] = useState(false);',
    new_states
)
code = re.sub(r'const \[accordion, setAccordion\] = useState\(.*?\);', '', code)

# 3. MapFocus
map_focus_old = """function MapFocus({ activeMarkerId, markers }) {
  const map = useMap();
  useEffect(() => {
    if (activeMarkerId) {
      const pos = markers.find((m) => m.id === activeMarkerId);
      if (pos) {
        map.flyTo([pos.lat, pos.lng], 16, {
          animate: true,
          duration: 1.5,
        });
      }
    }
  }, [activeMarkerId, markers, map]);
  return null;
}"""
map_focus_new = """function MapFocus({ activeMarkerId, markers, customFlyTo }) {
  const map = useMap();
  useEffect(() => {
    if (customFlyTo) {
      map.flyTo([customFlyTo.lat, customFlyTo.lng], 16, { animate: true, duration: 1.5 });
      return;
    }
    if (activeMarkerId) {
      const pos = markers.find((m) => m.id === activeMarkerId);
      if (pos) {
        map.flyTo([pos.lat, pos.lng], 16, { animate: true, duration: 1.5 });
      }
    }
  }, [activeMarkerId, markers, map, customFlyTo]);
  return null;
}"""
code = code.replace(map_focus_old, map_focus_new)
code = code.replace('<MapFocus activeMarkerId={activeMarkerId} markers={displayedMarkers} />', '<MapFocus activeMarkerId={activeMarkerId} markers={displayedMarkers} customFlyTo={customFlyTo} />')

# 4. Effects
search_effect = """
  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // OSM Nominatim API
  useEffect(() => {
    if (debouncedSearchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearchSearching(true);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedSearchQuery)}&viewbox=114.43,-8.06,115.71,-8.85&bounded=1&limit=5`;
    fetch(url)
      .then(res => res.json())
      .then(data => { setSearchResults(data); setIsSearchSearching(false); })
      .catch(err => { console.error(err); setIsSearchSearching(false); });
  }, [debouncedSearchQuery]);

  const handleExternalSearchClick = (res) => {
    setCustomFlyTo({ lat: parseFloat(res.lat), lng: parseFloat(res.lon) });
    setSearchResults([]);
    setSearchQuery(res.display_name);
  };
"""
code = code.replace('// Filter effect (Local)', search_effect + '\n  // Filter effect (Local)')

# 5. Filter logic
old_filter = 'const displayedMarkers = markersData.filter((m) => filters[m.tipe_objek] !== false);'
new_filter = """const displayedMarkers = markersData.filter((m) => {
    const typeMatch = filters[m.tipe_objek] !== false;
    let searchMatch = true;
    if (searchQuery.trim().length > 0) {
       const q = searchQuery.toLowerCase();
       const nameMatch = m.name?.toLowerCase().includes(q);
       const typeQMatch = m.tipe_objek?.toLowerCase().includes(q);
       let attrMatch = false;
       if (m.atribut_tambahan) {
          attrMatch = Object.values(m.atribut_tambahan).some(val => 
             String(val).toLowerCase().includes(q)
          );
       }
       searchMatch = nameMatch || typeQMatch || attrMatch;
    }
    return typeMatch && searchMatch;
  });"""
code = code.replace(old_filter, new_filter)

# 6. Delete old Sidebar & Navbar replacement
navbar_jsx = """      {/* ===== NAVBAR / HEADER ===== */}
      <header style={{ height: "70px", backgroundColor: "#343a40", display: "flex", alignItems: "center", padding: "0 30px", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", position: "relative", zIndex: 1100 }}>
        {/* LOGO & TITLE */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ background: "#fff", padding: "8px", borderRadius: "8px", display: "flex" }}>
            <MapPin size={24} color="#e74c3c" />
          </div>
          <div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: "20px", letterSpacing: "1px", fontWeight: 800 }}>Peta Interaktif</h1>
            <p style={{ margin: 0, color: "#d4e9d3", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>{isAdminMode ? "Admin Panel" : "Public View"}</p>
          </div>
        </div>

        {/* SMART SEARCH */}
        <div style={{ position: "relative", flex: 1, maxWidth: "450px", margin: "0 30px" }}>
          <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "30px", padding: "8px 15px", border: "2px solid transparent", transition: "0.2s" }}>
            <Search size={18} color="#95a5a6" style={{ marginRight: "10px" }} />
            <input 
              type="text"
              placeholder="Cari lokasi lokal atau di Bali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", background: "transparent" }}
            />
            {isSearchSearching && <span style={{ fontSize: "12px", color: "#aaa" }}>...</span>}
            {searchQuery && <X size={16} color="#ccc" style={{ cursor: "pointer" }} onClick={() => setSearchQuery("")} />}
          </div>
          
          {/* SEARCH DROPDOWN */}
          {searchResults.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "10px", background: "#fff", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", overflow: "hidden", zIndex: 1200 }}>
              {searchResults.map((res, i) => (
                <div key={i} onClick={() => handleExternalSearchClick(res)} style={{ padding: "12px 15px", borderBottom: "1px solid #eee", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <MapPin size={16} color="#3498db" style={{ marginTop: "3px", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "#333", lineHeight: "1.4" }}>{res.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NAVBAR ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* FILTER DROPDOWN */}
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => { setIsFilterDropdownOpen(!isFilterDropdownOpen); setIsLoginDropdownOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "10px 16px", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" }}
            >
              <Filter size={16} /> Filter
            </button>
            {isFilterDropdownOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "10px", background: "#fff", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", width: "250px", padding: "15px", zIndex: 1200 }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>Filter Layer</h4>
                {masterTypes.map((t) => (
                  <label key={t.nama_tipe} style={{ display: "flex", alignItems: "center", marginBottom: "12px", cursor: "pointer" }}>
                    <input type="checkbox" checked={filters[t.nama_tipe] !== false} onChange={() => handleFilterChange(t.nama_tipe)} style={{ marginRight: "10px", transform: "scale(1.2)", accentColor: "#3498db" }} />
                    <span style={{ fontSize: "14px", color: "#495057", textTransform: "capitalize", fontWeight: "600" }}>{t.nama_tipe.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* LOGIN / ADMIN DROPDOWN */}
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => { setIsLoginDropdownOpen(!isLoginDropdownOpen); setIsFilterDropdownOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: authKey ? "#2ecc71" : "#3498db", border: "none", color: "#fff", padding: "10px 16px", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" }}
            >
              {authKey ? <User size={16} /> : <LogIn size={16} />} 
              {authKey ? "Admin Aktif" : "Akses Admin"}
            </button>
            {isLoginDropdownOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "10px", background: "#fff", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", width: "280px", padding: "20px", zIndex: 1200 }}>
                {!authKey ? (
                  <form onSubmit={handleLogin}>
                    <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>Login Admin</h4>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email..." style={{ width: "100%", padding: "12px", marginBottom: "10px", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box" }} />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." style={{ width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box" }} />
                    <button type="submit" style={{ width: "100%", padding: "12px", background: "#3498db", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>IZINKAN AKSES</button>
                  </form>
                ) : (
                  <div>
                    <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>Menu Admin</h4>
                    <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}><LogOut size={16} /> LOGOUT</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== LAYOUT BAWAH (PETA & OVERLAY) ===== */}
      <div onClick={() => { setIsFilterDropdownOpen(false); setIsLoginDropdownOpen(false); }} style={{ flex: 1, position: "relative", height: "calc(100vh - 70px)", overflow: "hidden" }}>
"""

match_start = re.search(r'\{/\*\s*=====\s*BAGIAN ATAS:\s*PETA\s*&\s*SIDEBAR\s*=====\s*\*/\}', code)
match_end = re.search(r'\{/\*\s*TOGGLE PETA VS TABEL \(FLOATING\)\s*\*/\}', code)

if match_start and match_end:
    code = code[:match_start.start()] + navbar_jsx + '\n        ' + code[match_end.start():]
else:
    print("Could not find start/end matches for UI swap!")

# Ensure outer wrapper is flex column
code = code.replace('<div style={{ fontFamily: "\'Inter\', sans-serif" }}>', '<div style={{ fontFamily: "\'Inter\', sans-serif", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>')

# Now fix Table overlay layout top
code = code.replace(
'''          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "#f4f6f9",
              zIndex: 900,
              overflowY: "auto",
              padding: "80px 40px 40px",
              boxSizing: "border-box",
            }}
          >''',
'''          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "#f4f6f9",
              zIndex: 900,
              overflowY: "auto",
              padding: "40px 40px",
              boxSizing: "border-box",
            }}
          >'''
)

with open('src/MapComponent.js', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")

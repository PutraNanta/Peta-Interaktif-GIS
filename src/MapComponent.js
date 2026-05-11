import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  Polyline,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import {
  X,
  ChevronDown,
  Edit3,
  MapPin,
  Power,
  HeartPulse,
  Search,
  Filter,
  LogIn,
  User,
  LogOut,
  Layers,
  Stethoscope,
  Syringe,
  Hospital,
  Pill,
  UserPlus,
  Compass,
  Table,
} from "lucide-react";
import { renderToString } from "react-dom/server";

// Fix untuk default marker Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const baliBounds = [
  [-9.0, 114.4],
  [-8.0, 115.8],
];

// Warna kategori kesehatan
const colorMap = {
  "Rumah Sakit Umum": "#d63031",
  "Rumah Sakit Khusus": "#e17055",
  Klinik: "#0984e3",
  Puskesmas: "#00cec9",
  Apotek: "#00b894",
  "Klinik Gigi": "#fdcb6e",
  "Bidan & Klinik Bersalin": "#fd79a8",
  "Fisioterapi & Rehabilitasi": "#a29bfe",
};

// Icon per kategori
const getCategoryIcon = (kategori) => {
  const t = (kategori || "").toLowerCase();
  if (t.includes("rumah sakit umum"))
    return <Hospital color="white" size={16} />;
  if (t.includes("rumah sakit khusus"))
    return <Hospital color="white" size={16} />;
  if (t.includes("klinik")) return <Stethoscope color="white" size={16} />;
  if (t.includes("puskesmas")) return <Syringe color="white" size={16} />;
  if (t.includes("apotek")) return <Pill color="white" size={16} />;
  if (t.includes("gigi")) return <Stethoscope color="white" size={16} />;
  if (t.includes("bidan") || t.includes("bersalin"))
    return <UserPlus color="white" size={16} />;
  if (t.includes("fisioterapi") || t.includes("rehabilitasi"))
    return <UserPlus color="white" size={16} />;
  return <HeartPulse color="white" size={16} />;
};

// Buat icon marker dengan highlight
const createMarkerIcon = (color, kategori, isActive = false) => {
  const icon = getCategoryIcon(kategori);
  const iconHtml = renderToString(icon);
  const borderStyle = isActive
    ? "border: 3px solid #FFD700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);"
    : "border: 2px solid white; box-shadow: -3px 3px 6px rgba(0,0,0,0.4);";

  return new L.divIcon({
    className: "custom-marker",
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
        ${borderStyle}
        transition: all 0.3s;
      ">
        <div style="transform: rotate(45deg); display: flex; justify-content: center; align-items: center;">
          ${iconHtml}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -34],
  });
};

// Marker click handler
function LocationMarker({
  isEditMode,
  authKey,
  onMapClick,
  clearActiveMarker,
}) {
  useMapEvents({
    click(e) {
      if (clearActiveMarker) clearActiveMarker();
      if (!isEditMode) return;
      if (!authKey) {
        alert("🔒 AKSES DITOLAK: Anda harus Login untuk menambah poin.");
        return;
      }
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Auto fly to active marker
function MapFocus({ activeMarkerId, markers }) {
  const map = useMap();
  useEffect(() => {
    if (activeMarkerId) {
      const target = markers.find((m) => m.id === activeMarkerId);
      if (target) {
        map.flyTo([target.lat, target.lng], 18, {
          animate: true,
          duration: 1.5,
        });
      }
    }
  }, [activeMarkerId, markers, map]);
  return null;
}

// Get user location
function UserLocationMarker() {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
      });
    }
  }, []);

  if (!userLocation) return null;

  return (
    <Marker
      position={userLocation}
      icon={
        new L.divIcon({
          className: "user-marker",
          html: `
            <div style="
              background-color: #2196F3;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 10px rgba(33, 150, 243, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                background-color: white;
                width: 6px;
                height: 6px;
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })
      }
    >
      <Popup>
        <div style={{ textAlign: "center" }}>
          <b>📍 Lokasi Anda Saat Ini</b>
          <br />
          <span style={{ fontSize: "12px", color: "#666" }}>
            Lat: {userLocation[0].toFixed(4)}, Lng: {userLocation[1].toFixed(4)}
          </span>
        </div>
      </Popup>
    </Marker>
  );
}

// Fetch route from OSRM (follows actual roads)
async function fetchOSRMRoute(from, to) {
  // from/to: [lat, lng]
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    return null;
  }
  const route = data.routes[0];
  // GeoJSON coords are [lng, lat], convert to [lat, lng] for Leaflet
  const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  const distanceKm = (route.distance / 1000).toFixed(1);
  const durationMin = Math.round(route.duration / 60);
  return { coords, distanceKm, durationMin };
}

// Component to render OSRM route polyline
function OSRMRoute({ from, to, onRouteInfo }) {
  const [routeCoords, setRouteCoords] = useState(null);

  useEffect(() => {
    if (!from || !to) {
      setRouteCoords(null);
      return;
    }
    let cancelled = false;
    fetchOSRMRoute(from, to)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setRouteCoords(result.coords);
          if (onRouteInfo)
            onRouteInfo({
              distanceKm: result.distanceKm,
              durationMin: result.durationMin,
            });
        } else {
          // Fallback to straight line if OSRM fails
          setRouteCoords([from, to]);
          if (onRouteInfo) onRouteInfo(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRouteCoords([from, to]);
          if (onRouteInfo) onRouteInfo(null);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from?.[0], from?.[1], to?.[0], to?.[1]]);

  if (!routeCoords) return null;

  return (
    <Polyline
      positions={routeCoords}
      color="#1a73e8"
      weight={5}
      opacity={0.85}
      dashArray={null}
    />
  );
}

// ===== MAIN COMPONENT =====
export default function MapComponent({ isAdminMode: _isAdminMode }) {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState([]);
  const [kategoriKesehatan] = useState([
    "Rumah Sakit Umum",
    "Rumah Sakit Khusus",
    "Klinik",
    "Puskesmas",
    "Apotek",
    "Klinik Gigi",
    "Bidan & Klinik Bersalin",
    "Fisioterapi & Rehabilitasi",
  ]);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchSearching, setIsSearchSearching] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [tileLayer, setTileLayer] = useState("street");
  const [isTileDropdownOpen, setIsTileDropdownOpen] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [routeTarget, setRouteTarget] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Auth & Edit States
  const [authKey, setAuthKey] = useState(
    localStorage.getItem("authToken") || "",
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || null,
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("userId") || null,
  );
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [exploreMarkers, setExploreMarkers] = useState([]);
  const [activeView, setActiveView] = useState("map"); // "map" or "table"
  const [approvedMarkers, setApprovedMarkers] = useState([]);
  // State untuk modal penolakan admin
  const [rejectModal, setRejectModal] = useState(null); // { markerId } | null
  const [rejectAlasan, setRejectAlasan] = useState("");

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    } else {
      setAuthKey(token);
      setUserRole(localStorage.getItem("userRole") || "user");
      setUserName(localStorage.getItem("userName") || "");
      setCurrentUserId(localStorage.getItem("userId"));
    }
  }, [navigate]);

  // Form States
  const [selectedKategori, setSelectedKategori] = useState("Apotek");
  const [customName, setCustomName] = useState("");
  const [dynamicAttrs, setDynamicAttrs] = useState({});
  const [isPublic, setIsPublic] = useState(true);
  const [filters, setFilters] = useState(
    kategoriKesehatan.reduce((acc, kat) => ({ ...acc, [kat]: true }), {}),
  );
  const [filtersExplore, setFiltersExplore] = useState(
    kategoriKesehatan.reduce((acc, kat) => ({ ...acc, [kat]: true }), {}),
  );

  // Routing States
  const [routingEnabled, setRoutingEnabled] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routingStep, setRoutingStep] = useState(0); // 0: off, 1: select start, 2: select end
  const [routeInfo, setRouteInfo] = useState(null); // { distanceKm, durationMin }
  const [legacyRouteInfo, setLegacyRouteInfo] = useState(null); // for "Rute ke Sini" button

  // Normalize point data
  const normalizePoint = (point) => ({
    id: point.id,
    lat: point.latitude,
    lng: point.longitude,
    name: point.nama,
    alamat: point.alamat,
    kategori: point.kategori?.nama_kategori || "",
    kategori_id: point.kategori?.id || point.kategori_id || null,
    warna:
      point.kategori?.warna ||
      colorMap[point.kategori?.nama_kategori] ||
      "#3498db",
    atribut_tambahan: point.atribut_tambahan || {},
    user_id: point.user_id,
    pemilik: point.pemilik?.username || null,
    is_public: point.is_public !== undefined ? point.is_public : true,
    status: point.status || "Pending",
    alasan_ditolak: point.alasan_ditolak || null,
  });

  // Fetch categories, auth-based point list, and public explore points
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/kategori");
        const result = await response.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          const healthCategories = result.data.filter((cat) =>
            kategoriKesehatan.includes(cat.nama_kategori),
          );
          setKategoriOptions(healthCategories);
          setSelectedKategori(
            (prev) => prev || healthCategories[0]?.nama_kategori || "Apotek",
          );
        }
      } catch (error) {
        console.error("Fetch Categories Error:", error);
      }
    };

    const fetchPoints = async () => {
      if (!authKey) {
        // Public: tampilkan semua marker dari explore
        const response = await fetch(
          "http://localhost:5000/api/points/explore",
        );
        const result = await response.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          setMarkers(result.data.map(normalizePoint));
        }
        return;
      }
      // Authenticated: tampilkan milik sendiri atau semua jika admin
      try {
        const response = await fetch("http://localhost:5000/api/points", {
          headers: { Authorization: `Bearer ${authKey}` },
        });
        const result = await response.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          setMarkers(result.data.map(normalizePoint));
        }
      } catch (error) {
        console.error("Fetch Points Error:", error);
      }
    };

    const fetchExplore = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/points/explore",
        );
        const result = await response.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          setExploreMarkers(result.data.map(normalizePoint));
        }
      } catch (error) {
        console.error("Fetch Explore Error:", error);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      });
    }

    fetchCategories();
    fetchExplore();
    fetchPoints();
  }, [authKey, kategoriKesehatan]);

  useEffect(() => {
    if (!kategoriOptions.length) return;

    const categoryNames = kategoriOptions.map((cat) => cat.nama_kategori);
    setFilters((prev) => {
      const next = {};
      categoryNames.forEach((name) => {
        next[name] = prev[name] !== false;
      });
      return next;
    });
    setFiltersExplore((prev) => {
      const next = {};
      categoryNames.forEach((name) => {
        next[name] = prev[name] !== false;
      });
      return next;
    });
  }, [kategoriOptions]);

  // Reset routing when disabled
  useEffect(() => {
    if (!routingEnabled) {
      setStartPoint(null);
      setEndPoint(null);
      setRoutingStep(0);
      setRouteInfo(null);
    }
  }, [routingEnabled]);

  // Fetch explore markers when explore mode is activated
  useEffect(() => {
    if (showExplore) {
      const fetchExplore = async () => {
        try {
          const response = await fetch(
            "http://localhost:5000/api/points/explore",
          );
          const result = await response.json();
          if (result.status === "success" && Array.isArray(result.data)) {
            setExploreMarkers(result.data.map(normalizePoint));
          }
        } catch (error) {
          console.error("Fetch Explore Error:", error);
        }
      };
      fetchExplore();
    }
  }, [showExplore]);

  // Fetch approved markers for admin table view (raw data, not normalized)
  useEffect(() => {
    if (userRole === "admin" && authKey) {
      const fetchApproved = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/points", {
            headers: { Authorization: `Bearer ${authKey}` },
          });
          const result = await response.json();
          if (result.status === "success" && Array.isArray(result.data)) {
            // Simpan raw data agar tabel bisa akses nama, kategori.nama_kategori, pemilik.username
            setApprovedMarkers(
              result.data.filter((p) => p.status === "Diterima"),
            );
          }
        } catch (error) {
          console.error("Fetch Approved Error:", error);
        }
      };
      fetchApproved();
    }
  }, [userRole, authKey]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        setAuthKey(data.token);
        setCurrentUserId(data.userId || data.id);
        setUserRole(data.role || "user");
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.userId || data.id);
        localStorage.setItem("userRole", data.role || "user");
        alert("✅ Login Sukses!");
      } else {
        alert("❌ Login Gagal!");
      }
    } catch (err) {
      alert("⚠️ Error Jaringan / Server Mati.");
    }
  };

  const handleLogout = () => {
    setAuthKey("");
    setUserRole(null);
    setUserName("");
    setPassword("");
    setIsEditMode(false);
    setCurrentUserId(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  // Handle map click
  const handleMapClick = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();
      const locationName = data.display_name || "Lokasi tidak diketahui";
      setCustomName("");
      setDynamicAttrs({});
      setIsPublic(true);
      setModalData({ isEdit: false, lat, lng, defaultAddress: locationName });
    } catch (err) {
      setCustomName("");
      setDynamicAttrs({});
      setModalData({
        isEdit: false,
        lat,
        lng,
        defaultAddress: "Gagal menarik alamat",
      });
    }
  };

  // Handle edit click
  const handleEditClick = (pos) => {
    if (!authKey || showExplore) return;
    setCustomName(pos.name);
    setSelectedKategori(pos.kategori);
    setDynamicAttrs(pos.atribut_tambahan || {});
    setIsPublic(pos.is_public !== undefined ? pos.is_public : true);
    setModalData({
      isEdit: true,
      id: pos.id,
      lat: pos.lat,
      lng: pos.lng,
      defaultAddress: pos.alamat,
    });
  };

  // Handle save modal
  const handleSaveModal = async () => {
    if (!modalData || !authKey) return;

    const selectedCategory = kategoriOptions.find(
      (cat) => cat.nama_kategori === selectedKategori,
    );
    if (!selectedCategory) {
      alert("⚠️ Kategori belum tersedia. Silakan refresh halaman.");
      return;
    }

    const finalName =
      customName.trim() !== "" ? customName : modalData.defaultAddress;
    const pointPayload = {
      nama: finalName,
      alamat: modalData.defaultAddress,
      latitude: modalData.lat,
      longitude: modalData.lng,
      kategori_id: selectedCategory.id,
      atribut_tambahan: dynamicAttrs,
      is_public: isPublic,
    };

    try {
      const url = modalData.isEdit
        ? `http://localhost:5000/api/points/${modalData.id}`
        : "http://localhost:5000/api/points";

      const backendResponse = await fetch(url, {
        method: modalData.isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify(pointPayload),
      });

      const result = await backendResponse.json();
      if (result.status === "success") {
        const returnedPoint = result.data;
        const savedMarker = {
          id: returnedPoint.id,
          lat: returnedPoint.latitude,
          lng: returnedPoint.longitude,
          name: returnedPoint.nama,
          alamat: returnedPoint.alamat,
          kategori: returnedPoint.kategori?.nama_kategori || selectedKategori,
          kategori_id: returnedPoint.kategori?.id || selectedCategory.id,
          warna:
            returnedPoint.kategori?.warna ||
            selectedCategory.warna ||
            colorMap[selectedKategori] ||
            "#3498db",
          atribut_tambahan: returnedPoint.atribut_tambahan || dynamicAttrs,
          user_id: returnedPoint.user_id || currentUserId,
          pemilik: returnedPoint.pemilik?.username || null,
          is_public:
            returnedPoint.is_public !== undefined
              ? returnedPoint.is_public
              : isPublic,
          status: returnedPoint.status || "Pending",
        };

        if (modalData.isEdit) {
          setMarkers((prev) =>
            prev.map((m) => (m.id === modalData.id ? savedMarker : m)),
          );
          // Jika sebelumnya Rejected dan sekarang jadi Pending → beri tahu user
          const prevMarker = markers.find((m) => m.id === modalData.id);
          if (
            prevMarker?.status === "Rejected" &&
            savedMarker.status === "Pending"
          ) {
            alert(
              "✅ Marker berhasil dikirim ulang dan menunggu persetujuan admin.",
            );
          }
        } else {
          // Hanya tambah ke markers jika admin (langsung Diterima) atau sudah Diterima
          if (savedMarker.status === "Diterima") {
            setMarkers((prev) => [...prev, savedMarker]);
          } else {
            // User biasa: marker Pending, beri tahu user
            alert(
              "✅ Marker berhasil ditambahkan dan menunggu persetujuan admin.",
            );
          }
        }
        setModalData(null);
        setDynamicAttrs({});
        setIsPublic(true);
      } else {
        alert("❌ Gagal: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error saat menyimpan data");
    }
  };

  // Handle delete
  const handleDeletePoint = async (markerId) => {
    if (!authKey) {
      alert("🔒 AKSES DITOLAK.");
      return;
    }
    if (!window.confirm("Yakin menghapus poin ini?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/points/${markerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authKey}` },
      });
      const result = await res.json();
      if (result.status === "success") {
        setMarkers((prev) => prev.filter((m) => m.id !== markerId));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleApprove = async (markerId) => {
    if (!authKey || userRole !== "admin") {
      alert("🔒 AKSES DITOLAK.");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/points/${markerId}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${authKey}` },
        },
      );
      const result = await res.json();
      if (result.status === "success") {
        // Update status di markers state
        setMarkers((prev) =>
          prev.map((m) =>
            m.id === markerId ? { ...m, status: "Diterima" } : m,
          ),
        );
        // Tambahkan ke approvedMarkers (raw data dari markers state yang sudah diupdate)
        setApprovedMarkers((prev) => {
          const target = markers.find((m) => m.id === markerId);
          if (!target) return prev;
          // Konversi normalized marker ke format raw untuk tabel
          const rawEntry = {
            id: target.id,
            nama: target.name,
            alamat: target.alamat,
            status: "Diterima",
            kategori: { nama_kategori: target.kategori },
            pemilik: { username: target.pemilik },
          };
          return [...prev, rawEntry];
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = (markerId) => {
    // Buka modal untuk mengisi alasan penolakan
    setRejectModal({ markerId });
    setRejectAlasan("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    const { markerId } = rejectModal;
    try {
      const res = await fetch(
        `http://localhost:5000/api/points/${markerId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authKey}`,
          },
          body: JSON.stringify({ alasan_ditolak: rejectAlasan.trim() || null }),
        },
      );
      const result = await res.json();
      if (result.status === "success") {
        setMarkers((prev) =>
          prev.map((m) =>
            m.id === markerId
              ? {
                  ...m,
                  status: "Rejected",
                  alasan_ditolak: rejectAlasan.trim() || null,
                }
              : m,
          ),
        );
        setApprovedMarkers((prev) => prev.filter((m) => m.id !== markerId));
        setRejectModal(null);
        setRejectAlasan("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Render dynamic form fields per kategori
  const renderDynamicFields = () => {
    const inputStyle = {
      width: "100%",
      padding: "10px",
      margin: "5px 0 15px 0",
      boxSizing: "border-box",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "13px",
    };
    const labelStyle = {
      fontSize: "12px",
      fontWeight: "bold",
      color: "#555",
      display: "block",
      marginBottom: "6px",
    };

    const selectedCategory = kategoriOptions.find(
      (cat) => cat.nama_kategori === selectedKategori,
    );
    const fields = selectedCategory?.fields || [];
    if (!fields.length) return null;

    const categoryColor =
      selectedCategory?.warna || colorMap[selectedKategori] || "#000";

    const renderFieldInput = (field) => {
      const value = dynamicAttrs[field.key] ?? "";
      const handleChange = (newValue) =>
        setDynamicAttrs((prev) => ({ ...prev, [field.key]: newValue }));

      if (field.type === "select") {
        return (
          <select
            value={value || field.options?.[0] || ""}
            onChange={(e) => handleChange(e.target.value)}
            style={inputStyle}
          >
            {(field.options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }

      if (field.type === "number") {
        return (
          <input
            type="number"
            placeholder={field.placeholder || ""}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            style={inputStyle}
          />
        );
      }

      return (
        <input
          type={field.type || "text"}
          placeholder={field.placeholder || ""}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          style={inputStyle}
        />
      );
    };

    return (
      <div
        style={{
          marginTop: 15,
          background: "#f7f9fb",
          padding: 16,
          borderRadius: 10,
          border: `1px solid ${categoryColor}33`,
        }}
      >
        <h4 style={{ margin: 0, color: categoryColor, marginBottom: 12 }}>
          {selectedCategory.icon_name ? "🔹" : "📋"} Detail {selectedKategori}
        </h4>
        {fields.map((field) => (
          <div key={field.key} style={{ marginBottom: 10 }}>
            <label style={labelStyle}>{field.label}</label>
            {renderFieldInput(field)}
          </div>
        ))}
      </div>
    );
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Search nominatim
  useEffect(() => {
    if (debouncedSearchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearchSearching(true);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedSearchQuery)}&viewbox=114.43,-8.06,115.71,-8.85&bounded=1&limit=5`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data);
        setIsSearchSearching(false);
      })
      .catch((err) => {
        console.error(err);
        setIsSearchSearching(false);
      });
  }, [debouncedSearchQuery]);

  const handleExternalSearchClick = (res) => {
    setSearchResults([]);
    setSearchQuery(res.display_name);
  };

  // Filter markers by kategori, search, dan status
  const displayedMarkers = (showExplore ? exploreMarkers : markers).filter(
    (m) => {
      const currentFilters = showExplore ? filtersExplore : filters;
      const categoryMatch = currentFilters[m.kategori] !== false;

      // Status filter: admin lihat semua, user biasa hanya lihat Diterima atau milik sendiri
      let statusMatch = true;
      if (userRole !== "admin") {
        statusMatch =
          m.status === "Diterima" ||
          String(m.user_id) === String(currentUserId);
      }

      let searchMatch = true;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const nameMatch = m.name?.toLowerCase().includes(q);
        const kategoriMatch = m.kategori?.toLowerCase().includes(q);
        const attrMatch = Object.values(m.atribut_tambahan || {}).some((val) =>
          String(val).toLowerCase().includes(q),
        );
        searchMatch = nameMatch || kategoriMatch || attrMatch;
      }

      return categoryMatch && statusMatch && searchMatch;
    },
  );

  return (
    <div
      style={{
        height: "100vh",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <style>{`
        .leaflet-top {
          top: 90px !important;
        }
        .cluster {
          background-color: #2ecc71 !important;
        }
        .cluster div {
          background-color: #27ae60 !important;
        }
      `}</style>

      {/* MODAL REJECT — Admin isi alasan penolakan */}
      {rejectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "28px",
              width: "420px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <h3
              style={{
                margin: "0 0 6px 0",
                color: "#c0392b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ❌ Tolak Marker
            </h3>
            <p
              style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#666" }}
            >
              Isi alasan penolakan agar user dapat memperbaiki markernya.
            </p>
            <label
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#555",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Alasan Penolakan{" "}
              <span style={{ color: "#999", fontWeight: "normal" }}>
                (opsional)
              </span>
            </label>
            <textarea
              value={rejectAlasan}
              onChange={(e) => setRejectAlasan(e.target.value)}
              placeholder="Contoh: Nama lokasi tidak sesuai, koordinat tidak tepat, kategori salah..."
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "13px",
                resize: "vertical",
                fontFamily: "sans-serif",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectAlasan("");
                }}
                style={{
                  padding: "10px 18px",
                  background: "#ccc",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                style={{
                  padding: "10px 18px",
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                ❌ Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT */}
      {modalData && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              width: "450px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                display: "flex",
                alignItems: "center",
              }}
            >
              {modalData.isEdit ? (
                <>
                  <Edit3 size={20} style={{ marginRight: "8px" }} /> Edit
                  Fasilitas Kesehatan
                </>
              ) : (
                <>
                  <MapPin size={20} style={{ marginRight: "8px" }} /> Tambah
                  Fasilitas Kesehatan
                </>
              )}
            </h3>

            <label style={{ fontSize: "12px", fontWeight: "bold" }}>
              Nama Lokasi
            </label>
            <input
              type="text"
              placeholder="Ketik nama..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                margin: "5px 0 15px 0",
                boxSizing: "border-box",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />

            <label style={{ fontSize: "12px", fontWeight: "bold" }}>
              Kategori Kesehatan
            </label>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "5px",
                marginBottom: "15px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontWeight: "bold",
              }}
            >
              {(kategoriOptions.length > 0
                ? kategoriOptions
                : kategoriKesehatan
              ).map((kat) => (
                <option
                  key={kat.nama_kategori || kat}
                  value={kat.nama_kategori || kat}
                >
                  {kat.nama_kategori || kat}
                </option>
              ))}
            </select>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ width: "18px", height: "18px" }}
              />
              Tampilkan titik ini ke publik
            </label>

            {renderDynamicFields()}

            <div
              style={{
                marginTop: "25px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setModalData(null);
                  setDynamicAttrs({});
                  setIsPublic(true);
                }}
                style={{
                  padding: "10px 15px",
                  border: "none",
                  background: "#ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSaveModal}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "#007bff",
                  color: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {modalData.isEdit ? "Simpan" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header
        style={{
          height: "70px",
          backgroundColor: "#ffffff",
          borderRadius: "15px",
          position: "absolute",
          top: "15px",
          left: "15px",
          right: "15px",
          display: "flex",
          alignItems: "center",
          padding: "0 30px",
          justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          zIndex: 1100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div
            style={{
              background: "#f4f6f9",
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
              border: "1px solid #eaeaea",
            }}
          >
            <HeartPulse size={24} color="#d63031" />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                color: "#2c3e50",
                fontSize: "20px",
                letterSpacing: "1px",
                fontWeight: 800,
              }}
            >
              Peta Fasilitas Kesehatan
            </h1>
            <p
              style={{
                margin: 0,
                color: "#7f8c8d",
                fontSize: "11px",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {authKey
                ? userRole === "admin"
                  ? "Admin Mode"
                  : "Temukan Layanan Kesehatan Anda"
                : "👤 Public"}
            </p>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            flex: 1,
            maxWidth: "450px",
            margin: "0 30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f4f6f9",
              borderRadius: "30px",
              padding: "8px 15px",
              border: "1px solid #eaeaea",
            }}
          >
            <Search size={18} color="#95a5a6" style={{ marginRight: "10px" }} />
            <input
              type="text"
              placeholder="Cari fasilitas kesehatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                background: "transparent",
              }}
            />
            {searchQuery && (
              <X
                size={16}
                color="#ccc"
                style={{ cursor: "pointer" }}
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
          {(searchResults.length > 0 || isSearchSearching) && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "10px",
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 1200,
              }}
            >
              {isSearchSearching ? (
                <div
                  style={{
                    padding: "12px 15px",
                    fontSize: "13px",
                    color: "#777",
                  }}
                >
                  Mencari lokasi...
                </div>
              ) : (
                searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => handleExternalSearchClick(res)}
                    style={{
                      padding: "12px 15px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    {res.display_name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                setIsLoginDropdownOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#f4f6f9",
                border: "1px solid #eaeaea",
                color: "#2c3e50",
                padding: "10px 16px",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <Filter size={16} /> Filter
            </button>
            {isFilterDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "10px",
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  width: "250px",
                  padding: "15px",
                  zIndex: 1200,
                }}
              >
                <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>
                  Filter Kategori
                </h4>
                {kategoriKesehatan.map((kat) => (
                  <label
                    key={kat}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters[kat] !== false}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          [kat]: !prev[kat],
                        }))
                      }
                      style={{
                        marginRight: "10px",
                        transform: "scale(1.2)",
                        accentColor: "#3498db",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#495057",
                        fontWeight: "600",
                      }}
                    >
                      {kat}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {userRole !== "admin" && (
            <button
              onClick={() => setShowExplore(!showExplore)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: showExplore ? "#007bff" : "#f4f6f9",
                border: "1px solid #eaeaea",
                color: showExplore ? "white" : "#2c3e50",
                padding: "10px 16px",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <Compass size={16} /> Eksplorasi
            </button>
          )}

          {userRole === "admin" && (
            <button
              onClick={() =>
                setActiveView(activeView === "map" ? "table" : "map")
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: activeView === "table" ? "#007bff" : "#f4f6f9",
                border: "1px solid #eaeaea",
                color: activeView === "table" ? "white" : "#2c3e50",
                padding: "10px 16px",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <Table size={16} /> Tabel
            </button>
          )}

          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setIsLoginDropdownOpen(!isLoginDropdownOpen);
                setIsFilterDropdownOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: authKey ? "#2ecc71" : "#3498db",
                border: "none",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {authKey ? <User size={16} /> : <LogIn size={16} />}
              {authKey ? (userName ? userName : "Menu") : "Login"}
            </button>
            {isLoginDropdownOpen && authKey && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "10px",
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  width: "280px",
                  padding: "20px",
                  zIndex: 1200,
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>
                    Menu {userRole === "admin" ? "Admin" : "User"}
                  </h4>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    <LogOut size={16} /> LOGOUT
                  </button>
                </div>
              </div>
            )}
            {isLoginDropdownOpen && !authKey && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "10px",
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  width: "280px",
                  padding: "20px",
                  zIndex: 1200,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>
                    Akses Dibatasi
                  </h4>
                  <p
                    style={{
                      margin: "0 0 15px 0",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    Anda perlu login untuk mengakses fitur peta.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#3498db",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Pergi ke Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAP CONTROLS */}
      <div
        onClick={() => {
          setIsFilterDropdownOpen(false);
          setIsLoginDropdownOpen(false);
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "100px",
            right: "10px",
            zIndex: 1000,
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {/* Tile Layer Toggle */}
          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTileDropdownOpen(!isTileDropdownOpen);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#fff",
                border: "1px solid #ddd",
                color: "#343a40",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                fontSize: "13px",
              }}
            >
              <Layers size={15} />
              {tileLayer === "street" ? "Peta" : "Satelit"}
              <ChevronDown size={13} />
            </button>
            {isTileDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  minWidth: "130px",
                  zIndex: 1500,
                }}
              >
                <div
                  onClick={() => {
                    setTileLayer("street");
                    setIsTileDropdownOpen(false);
                  }}
                  style={{
                    padding: "10px 15px",
                    cursor: "pointer",
                    background: tileLayer === "street" ? "#f0f4ff" : "#fff",
                    fontWeight: tileLayer === "street" ? "bold" : "normal",
                    fontSize: "13px",
                  }}
                >
                  🗺️ Peta Jalan
                </div>
                <div
                  onClick={() => {
                    setTileLayer("satellite");
                    setIsTileDropdownOpen(false);
                  }}
                  style={{
                    padding: "10px 15px",
                    cursor: "pointer",
                    background: tileLayer === "satellite" ? "#f0f4ff" : "#fff",
                    fontWeight: tileLayer === "satellite" ? "bold" : "normal",
                    fontSize: "13px",
                  }}
                >
                  🛰️ Satelit
                </div>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (userLocation && mapInstance) {
                mapInstance.flyTo(userLocation, 16, {
                  animate: true,
                  duration: 1.2,
                });
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#fff",
              border: "1px solid #ddd",
              color: "#343a40",
              padding: "8px 14px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              fontSize: "13px",
            }}
          >
            <Compass size={15} /> Lokasi Saya
          </button>
          {routeTarget && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRouteTarget(null);
                setLegacyRouteInfo(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#fff",
                border: "1px solid #ddd",
                color: "#343a40",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                fontSize: "13px",
              }}
            >
              ✖ Hapus Rute
            </button>
          )}
        </div>

        {/* Panel Info Rute (Routing Mode) */}
        {routingEnabled && (
          <div
            style={{
              position: "absolute",
              top: "100px",
              left: "15px",
              zIndex: 1100,
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              padding: "14px 18px",
              minWidth: "240px",
              maxWidth: "300px",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "8px",
                color: "#1a73e8",
              }}
            >
              🗺️ Mode Routing
            </div>
            {!startPoint && (
              <div style={{ fontSize: "13px", color: "#555" }}>
                👆 Klik marker <b>titik awal</b>
              </div>
            )}
            {startPoint && !endPoint && (
              <div style={{ fontSize: "13px", color: "#555" }}>
                ✅ Titik awal dipilih
                <br />
                👆 Klik marker <b>tujuan</b>
              </div>
            )}
            {startPoint && endPoint && !routeInfo && (
              <div style={{ fontSize: "13px", color: "#555" }}>
                ⏳ Menghitung rute...
              </div>
            )}
            {startPoint && endPoint && routeInfo && (
              <div style={{ fontSize: "13px" }}>
                <div
                  style={{
                    color: "#27ae60",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  ✅ Rute ditemukan
                </div>
                <div>
                  📏 Jarak: <b>{routeInfo.distanceKm} km</b>
                </div>
                <div>
                  ⏱️ Estimasi: <b>~{routeInfo.durationMin} menit</b>
                </div>
              </div>
            )}
            {startPoint && endPoint && routeInfo === null && (
              <div style={{ fontSize: "13px", color: "#e74c3c" }}>
                ⚠️ Rute tidak ditemukan, menampilkan garis lurus
              </div>
            )}
            {(startPoint || endPoint) && (
              <button
                onClick={() => {
                  setStartPoint(null);
                  setEndPoint(null);
                  setRoutingStep(1);
                  setRouteInfo(null);
                }}
                style={{
                  marginTop: "10px",
                  padding: "6px 12px",
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                🔄 Reset Titik
              </button>
            )}
          </div>
        )}

        {activeView === "map" && (
          <>
            {/* PETA */}
            <MapContainer
              center={[-8.65, 115.2167]}
              zoom={15}
              minZoom={9}
              maxZoom={18}
              maxBounds={baliBounds}
              whenCreated={setMapInstance}
              style={{
                height: "100%",
                width: "100%",
                cursor: isEditMode ? "crosshair" : "grab",
              }}
            >
              <MapFocus
                activeMarkerId={activeMarkerId}
                markers={displayedMarkers}
              />
              <UserLocationMarker />

              {tileLayer === "street" ? (
                <TileLayer
                  attribution="© OSM"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              ) : (
                <TileLayer
                  attribution="© Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              )}

              {authKey && (
                <LocationMarker
                  isEditMode={isEditMode}
                  authKey={authKey}
                  onMapClick={handleMapClick}
                  clearActiveMarker={() => setActiveMarkerId(null)}
                />
              )}

              {/* MARKER CLUSTER */}
              <MarkerClusterGroup>
                {displayedMarkers.map((pos) => {
                  const markerColor = colorMap[pos.kategori] || "#3498db";
                  const isActive = activeMarkerId === pos.id;
                  const icon = createMarkerIcon(
                    markerColor,
                    pos.kategori,
                    isActive,
                  );

                  return (
                    <Marker
                      key={pos.id}
                      position={[pos.lat, pos.lng]}
                      icon={icon}
                      eventHandlers={{
                        click: () => {
                          if (routingEnabled) {
                            if (routingStep === 0 || routingStep === 1) {
                              setStartPoint([pos.lat, pos.lng]);
                              setRoutingStep(2);
                            } else if (routingStep === 2) {
                              setEndPoint([pos.lat, pos.lng]);
                              setRoutingStep(0);
                            }
                          } else {
                            setActiveMarkerId(pos.id);
                          }
                        },
                      }}
                    >
                      <Popup onClose={() => setActiveMarkerId(null)}>
                        <div
                          style={{ textAlign: "center", marginBottom: "12px" }}
                        >
                          <span
                            style={{
                              background: markerColor,
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              display: "inline-block",
                            }}
                          >
                            {pos.kategori}
                          </span>
                        </div>
                        <b>📍 {pos.name}</b>
                        <br />
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          {pos.alamat}
                        </span>
                        <br />
                        <br />

                        {Object.keys(pos.atribut_tambahan || {}).length > 0 && (
                          <div
                            style={{
                              background: "#f8f9fa",
                              padding: "8px",
                              borderRadius: "6px",
                              marginBottom: "10px",
                              fontSize: "12px",
                            }}
                          >
                            <strong style={{ fontSize: "11px" }}>
                              DETAIL:
                            </strong>
                            <br />
                            {Object.entries(pos.atribut_tambahan).map(
                              ([key, val]) => (
                                <div key={key} style={{ marginTop: "4px" }}>
                                  <b>{key}:</b> {val}
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {userLocation && (
                          <button
                            onClick={() => {
                              setRouteTarget(pos);
                              setActiveMarkerId(pos.id);
                            }}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              background: "#2ecc71",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              marginBottom: "8px",
                            }}
                          >
                            Rute ke Sini
                          </button>
                        )}

                        {/* Badge status untuk marker Pending/Rejected */}
                        {pos.status && pos.status !== "Diterima" && (
                          <div style={{ marginBottom: "8px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                background:
                                  pos.status === "Pending"
                                    ? "#f39c12"
                                    : "#e74c3c",
                                color: "white",
                                padding: "3px 10px",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontWeight: "bold",
                              }}
                            >
                              {pos.status === "Pending"
                                ? "⏳ Menunggu Persetujuan"
                                : "❌ Ditolak"}
                            </span>
                            {/* Tampilkan alasan penolakan untuk pemilik marker */}
                            {pos.status === "Rejected" &&
                              pos.alasan_ditolak &&
                              String(pos.user_id) === String(currentUserId) && (
                                <div
                                  style={{
                                    marginTop: "6px",
                                    padding: "8px 10px",
                                    background: "#fff5f5",
                                    border: "1px solid #ffcccc",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    color: "#c0392b",
                                  }}
                                >
                                  <b>Alasan penolakan:</b>
                                  <br />
                                  {pos.alasan_ditolak}
                                </div>
                              )}
                            {/* Alasan untuk admin */}
                            {pos.status === "Rejected" &&
                              pos.alasan_ditolak &&
                              userRole === "admin" && (
                                <div
                                  style={{
                                    marginTop: "6px",
                                    padding: "8px 10px",
                                    background: "#fff5f5",
                                    border: "1px solid #ffcccc",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    color: "#c0392b",
                                  }}
                                >
                                  <b>Alasan:</b> {pos.alasan_ditolak}
                                </div>
                              )}
                          </div>
                        )}

                        {authKey &&
                          (String(pos.user_id) === String(currentUserId) ||
                            userRole === "admin") && (
                            <div
                              style={{
                                marginTop: "10px",
                                display: "flex",
                                gap: "5px",
                              }}
                            >
                              <button
                                onClick={() => handleEditClick(pos)}
                                style={{
                                  flex: 1,
                                  padding: "6px",
                                  background: "#f39c12",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePoint(pos.id)}
                                style={{
                                  flex: 1,
                                  padding: "6px",
                                  background: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                Hapus
                              </button>
                            </div>
                          )}

                        {/* Tombol Approve/Reject untuk admin */}
                        {userRole === "admin" && pos.status === "Pending" && (
                          <div
                            style={{
                              marginTop: "8px",
                              display: "flex",
                              gap: "5px",
                            }}
                          >
                            <button
                              onClick={() => handleApprove(pos.id)}
                              style={{
                                flex: 1,
                                padding: "6px",
                                background: "#27ae60",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              ✅ Setujui
                            </button>
                            <button
                              onClick={() => handleReject(pos.id)}
                              style={{
                                flex: 1,
                                padding: "6px",
                                background: "#c0392b",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              ❌ Tolak
                            </button>
                          </div>
                        )}
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>

              {/* Routing via OSRM (mengikuti jalan) */}
              {routingEnabled && startPoint && endPoint && (
                <OSRMRoute
                  from={startPoint}
                  to={endPoint}
                  onRouteInfo={(info) => setRouteInfo(info)}
                />
              )}

              {/* Legacy route "Rute ke Sini" dari popup marker */}
              {!routingEnabled && routeTarget && userLocation && (
                <OSRMRoute
                  from={userLocation}
                  to={[routeTarget.lat, routeTarget.lng]}
                  onRouteInfo={(info) => setLegacyRouteInfo(info)}
                />
              )}
            </MapContainer>
          </>
        )}

        {activeView === "table" && userRole === "admin" && (
          <div
            style={{
              height: "100%",
              padding: "20px",
              background: "#f8f9fa",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, color: "#333" }}>
                📋 Tabel Marker Disetujui ({approvedMarkers.length} entri)
              </h2>
              <button
                onClick={() => setActiveView("map")}
                style={{
                  padding: "8px 16px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ← Kembali ke Peta
              </button>
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <thead style={{ background: "#4a5568", color: "#fff" }}>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left" }}>No</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Nama</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Kategori
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Alamat</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Pemilik
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedMarkers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#888",
                      }}
                    >
                      Belum ada marker yang disetujui.
                    </td>
                  </tr>
                ) : (
                  approvedMarkers.map((marker, index) => (
                    <tr
                      key={marker.id}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "12px" }}>{index + 1}</td>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>
                        {marker.nama}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {marker.kategori?.nama_kategori || "-"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {marker.alamat || "-"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {marker.pemilik?.username || "-"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            background: "#27ae60",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          ✅ {marker.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Toggle Edit Mode (Admin) */}
        {authKey && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              background: "#fff",
              padding: "10px 25px",
              borderRadius: "30px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
                color: isEditMode ? "#e74c3c" : "#333",
              }}
            >
              Mode Tambah: {isEditMode ? "✅ AKTIF" : "❌ MATI"}
            </span>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              style={{
                background: isEditMode ? "#e74c3c" : "#2ecc71",
                color: "#fff",
                border: "none",
                padding: "8px 15px",
                borderRadius: "15px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <Power
                size={14}
                style={{ marginRight: "6px", display: "inline" }}
              />
              {isEditMode ? "Matikan" : "Nyalakan"}
            </button>
          </div>
        )}
      </div>

      {/* Footer untuk non-admin */}
      {!authKey && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "60px",
            background: "#212529",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            zIndex: 1000,
          }}
        >
          💡 Login untuk mengelola fasilitas kesehatan
        </div>
      )}
    </div>
  );
}

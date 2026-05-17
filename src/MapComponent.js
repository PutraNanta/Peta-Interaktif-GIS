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
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import {
  X,
  ChevronDown,
  Edit3,
  MapPin,
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
  Trash2,
  Map,
  CheckCircle,
  XCircle,
  Phone,
  Clock,
  AlertTriangle,
  Car,
  Bed,
  Users,
  Link,
  Star,
  Plus,
  ArrowRight,
  ArrowLeft,
  Camera,
  Info,
  ShieldCheck,
  Home,
  Circle,
  Map as MapIcon,
  Navigation,
  Settings,
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
        alert("AKSES DITOLAK: Anda harus Login untuk menambah poin.");
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
          <b
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <MapPin size={14} /> Lokasi Anda Saat Ini
          </b>
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

// ===== MAP SETUP -- replaces deprecated whenCreated =====
function MapSetup({ onMap }) {
  const map = useMap();
  useEffect(() => { onMap(map); }, [map, onMap]);
  return null;
}

// ===== FIELD COMPONENT di luar MapComponent agar tidak re-mount setiap render =====
function DynField({
  label,
  name,
  type,
  placeholder,
  options,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="modern-label">{label}</label>
      {options ? (
        <select
          value={value || options[0]}
          onChange={(e) => onChange(name, e.target.value)}
          className="modern-input"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type || "text"}
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          className="modern-input"
        />
      )}
    </div>
  );
}

const StableDynField = (props) => <DynField {...props} />;

const formatFriendlyKey = (key) => {
  let formatted = key.replace(/_/g, " ");
  // Kapitalisasi huruf pertama setiap kata
  formatted = formatted.replace(/\b\w/g, (char) => char.toUpperCase());
  // Pengecualian singkatan medis/umum
  const acronyms = ["Rs", "Igd", "Icu", "Iccu", "Nicu", "Picu", "Hcu", "Bpjs", "Atm", "Tt", "Rme", "Sdm"];
  acronyms.forEach(acr => {
    const regex = new RegExp(`\\b${acr}\\b`, 'g');
    formatted = formatted.replace(regex, acr.toUpperCase());
  });
  return formatted;
};

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
  // State manajemen kategori (admin)
  const [kategoriModal, setKategoriModal] = useState(null); // null | { mode: 'add'|'edit', data? }
  const [katForm, setKatForm] = useState({ nama_kategori: '', warna: '#3498db', fields: [] });
  const [katFieldDraft, setKatFieldDraft] = useState({ key: '', label: '', type: 'text', options: '' });
 // Sidebar info marker (klik marker tampil sidebar)
  const [sidebarMarker, setSidebarMarker] = useState(null);
  // Field foto untuk form tambah/edit
  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  // Step untuk 2-step modal (1 = nama/kategori/foto, 2 = atribut)
  const [modalStep, setModalStep] = useState(1);

 // Check auth on mount guest boleh tanpa login
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthKey(token);
      setUserRole(localStorage.getItem("userRole") || "kontributor");
      setUserName(localStorage.getItem("userName") || "");
      setCurrentUserId(localStorage.getItem("userId"));
    }
 // Jika tidak ada token tetap di peta sebagai Guest
  }, []);

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
    foto_url: point.foto_url || null,
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
      try {
        if (authKey) {
          // Login: ambil marker milik sendiri (kontributor) atau semua (admin)
          const response = await fetch("http://localhost:5000/api/points", {
            headers: { Authorization: `Bearer ${authKey}` },
          });
          const result = await response.json();
          if (result.status === "success" && Array.isArray(result.data)) {
            setMarkers(result.data.map(normalizePoint));
          }
        } else {
          // Guest: ambil dari endpoint explore (publik)
          const response = await fetch(
            "http://localhost:5000/api/points/explore",
          );
          const result = await response.json();
          if (result.status === "success" && Array.isArray(result.data)) {
            setMarkers(result.data.map(normalizePoint));
          }
        }
      } catch (error) {
        console.error("Fetch Points Error:", error);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      });
    }

    fetchCategories();
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

  // Fetch explore markers hanya saat mode explore diaktifkan
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
    } else {
      // Reset saat explore dimatikan agar tidak ada sisa data
      setExploreMarkers([]);
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
        alert("Login berhasil!");
      } else {
        alert("Login gagal!");
      }
    } catch (err) {
      alert("Error jaringan / server mati.");
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

 // Handle map click buka modal tambah marker baru
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
      setFotoUrl("");
      setModalData({ isEdit: false, lat, lng, defaultAddress: locationName });
    } catch (err) {
      setCustomName("");
      setDynamicAttrs({});
      setFotoUrl("");
      setModalData({
        isEdit: false,
        lat,
        lng,
        defaultAddress: "Gagal menarik alamat",
      });
    }
  };

 // Handle edit click buka modal edit
  const handleEditClick = (pos) => {
    if (!authKey) return;
    setSidebarMarker(null);
    setCustomName(pos.name);
    setSelectedKategori(pos.kategori);
    setDynamicAttrs(pos.atribut_tambahan || {});
    setIsPublic(pos.is_public !== undefined ? pos.is_public : true);
    setFotoUrl(pos.foto_url || "");
    setModalData({
      isEdit: true,
      id: pos.id,
      lat: pos.lat,
      lng: pos.lng,
      defaultAddress: pos.alamat,
    });
  };

  // Helper: Move to step 2 of modal
  const handleNextStep = () => {
    if (!customName.trim()) {
      alert("Nama lokasi harus diisi");
      return;
    }
    setModalStep(2);
  };

  // Helper: Go back to step 1 of modal
  const handleBackStep = () => {
    setModalStep(1);
  };

  // Helper: Clear/close modal completely
  const clearModal = () => {
    setModalData(null);
    setCustomName("");
    setSelectedKategori("Apotek");
    setDynamicAttrs({});
    setFotoUrl("");
    setFotoFile(null);
    setIsPublic(true);
    setModalStep(1);
  };

  // Helper: Handle photo file upload
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      // Optionally create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoUrl(event.target?.result || "");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save modal
  const handleSaveModal = async () => {
    if (!modalData || !authKey) return;

    const selectedCategory = kategoriOptions.find(
      (cat) => cat.nama_kategori === selectedKategori,
    );
    if (!selectedCategory) {
      alert("Kategori belum tersedia. Silakan refresh halaman.");
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
      foto_url: fotoUrl ? fotoUrl.trim() : null,
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
      if (!backendResponse.ok) {
        alert(
 " Gagal menyimpan data: " +
            (result?.message ||
              backendResponse.statusText ||
              "Respons server gagal"),
        );
        return;
      }
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
          foto_url: returnedPoint.foto_url || null,
        };

        if (modalData.isEdit) {
          setMarkers((prev) =>
            prev.map((m) => (m.id === modalData.id ? savedMarker : m)),
          );
 // Jika sebelumnya Rejected dan sekarang jadi Pending beri tahu user
          const prevMarker = markers.find((m) => m.id === modalData.id);
          if (
            prevMarker?.status === "Rejected" &&
            savedMarker.status === "Pending"
          ) {
            alert(
              "Marker berhasil dikirim ulang dan menunggu persetujuan admin.",
            );
          }
        } else {
          // Hanya tambah ke markers jika admin (langsung Diterima) atau sudah Diterima
          if (savedMarker.status === "Diterima") {
            setMarkers((prev) => [...prev, savedMarker]);
          } else {
            // User biasa: marker Pending, tampilkan marker langsung agar foto dapat ditinjau
            setMarkers((prev) => [...prev, savedMarker]);
            alert(
              "Marker berhasil ditambahkan dan menunggu persetujuan admin.",
            );
          }
        }
        setModalData(null);
        setDynamicAttrs({});
        setIsPublic(true);
        setFotoUrl("");
        setFotoFile(null);
      } else {
        alert("Gagal: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error saat menyimpan data");
    }
  };

  // Handle delete
  const handleDeletePoint = async (markerId) => {
    if (!authKey) {
      alert("AKSES DITOLAK.");
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
        if (sidebarMarker?.id === markerId) setSidebarMarker(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ===== KATEGORI CRUD HANDLERS =====
  const handleSaveKategori = async () => {
    if (!katForm.nama_kategori.trim()) { alert("Nama kategori wajib diisi"); return; }
    try {
      const isEdit = kategoriModal?.mode === "edit";
      const url = isEdit
        ? `http://localhost:5000/api/kategori/${kategoriModal.data.id}`
        : "http://localhost:5000/api/kategori";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
        body: JSON.stringify({ ...katForm, master_tipe_id: kategoriModal?.data?.master_tipe_id || 1 }),
      });
      const result = await res.json();
      if (result.status === "success") {
        // Refresh kategoriOptions
        const r2 = await fetch("http://localhost:5000/api/kategori");
        const d2 = await r2.json();
        if (d2.status === "success") setKategoriOptions(d2.data);
        setKategoriModal(null);
        setKatForm({ nama_kategori: "", warna: "#3498db", fields: [] });
        alert(isEdit ? "Kategori diperbarui" : "Kategori ditambahkan");
      } else { alert("Gagal: " + result.message); }
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleDeleteKategori = async (id) => {
    if (!window.confirm("Yakin hapus kategori ini?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/kategori/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authKey}` },
      });
      const result = await res.json();
      if (result.status === "success") {
        setKategoriOptions((prev) => prev.filter((k) => k.id !== id));
      } else { alert("Gagal: " + result.message); }
    } catch (e) { alert("Error: " + e.message); }
  };

  const addKatField = () => {
    if (!katFieldDraft.key.trim() || !katFieldDraft.label.trim()) {
      alert("Key dan Label atribut wajib diisi"); return;
    }
    const newField = {
      key: katFieldDraft.key.trim().replace(/\s+/g, "_").toLowerCase(),
      label: katFieldDraft.label.trim(),
      type: katFieldDraft.type,
      ...(katFieldDraft.type === "select" && katFieldDraft.options
        ? { options: katFieldDraft.options.split(",").map((o) => o.trim()).filter(Boolean) }
        : {}),
    };
    setKatForm((prev) => ({ ...prev, fields: [...prev.fields, newField] }));
    setKatFieldDraft({ key: "", label: "", type: "text", options: "" });
  };

  const removeKatField = (idx) => {
    setKatForm((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== idx) }));
  };

  const handleApprove = async (markerId) => {
    if (!authKey || userRole !== "admin") {
      alert("AKSES DITOLAK.");
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

 // Handler stabil untuk DynField tidak membuat object baru setiap render
  const handleDynChange = (name, value) => {
    setDynamicAttrs((prev) => ({ ...prev, [name]: value }));
  };

 // Render dynamic form fields berbasis data fields dari DB/kategoriOptions
  const renderDynamicFields = () => {
    const selectedCategory = kategoriOptions.find(
      (cat) => cat.nama_kategori === selectedKategori,
    );
    const fields = selectedCategory?.fields || [];
    if (!fields.length) return null;

    const categoryColor = selectedCategory?.warna || colorMap[selectedKategori] || "#1a73e8";

    return (
      <div style={{
        marginTop: 20,
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        border: `1px solid #edf2f7`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
      }}>
        <h4 style={{ margin: "0 0 16px", color: "#1a1a2e", fontSize: "14px", fontWeight: 700, borderBottom: "1px solid #edf2f7", paddingBottom: "8px" }}>
          Informasi Tambahan ({selectedKategori})
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {fields.map((field) => (
            <DynField
              key={field.key}
              label={field.label}
              name={field.key}
              type={field.type}
              placeholder={field.placeholder || ""}
              options={field.options}
              value={dynamicAttrs[field.key] ?? ""}
              onChange={handleDynChange}
            />
          ))}
        </div>
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
  // Mode normal  : hanya marker milik sendiri (admin: semua)
  // Mode explore : semua marker Diterima + is_public (dari endpoint /explore)
  const displayedMarkers = (showExplore ? exploreMarkers : markers).filter(
    (m) => {
      // Sembunyikan marker dari peta jika belum di-approve, kecuali admin
      if (userRole !== "admin" && m.status !== "Diterima") return false;

      const currentFilters = showExplore ? filtersExplore : filters;
      const categoryMatch = currentFilters[m.kategori] !== false;

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

      return categoryMatch && searchMatch;
    },
  );

  const pendingCount = markers.filter((m) => m.status === "Pending").length;
  const pendingMarkers = markers.filter((m) => m.status === "Pending");
  // Sidebar nav state
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

 // Sidebar nav items admin: status kontributor, pustaka data, tambah marker, layer
  const SIDEBAR_W_COLLAPSED = 64;
  const SIDEBAR_W_EXPANDED = 220;

  const navItems = [
 // Beranda selalu ada, kembali ke peta utama
    { id: "map", icon: <Home size={20}/>, label: "Beranda", onClick: () => { setActiveView("map"); setSidebarMarker(null); setIsEditMode(false); } },
    ...(authKey ? [
      ...(userRole !== "admin" ? [
        { id: "explore", icon: <Compass size={20}/>, label: showExplore ? "Tutup Eksplorasi" : "Eksplorasi", onClick: () => setShowExplore(!showExplore), active: showExplore },
        { id: "status",   icon: <CheckCircle size={20}/>, label: "Status Marker Saya", badge: pendingCount, onClick: () => setActiveView("status") },
      ] : []),
      ...(userRole === "admin" ? [
        { id: "status",   icon: <CheckCircle size={20}/>, label: "Status Kontributor", badge: pendingCount, onClick: () => setActiveView("status") },
        { id: "library",  icon: <Table size={20}/>,       label: "Pustaka Data",       onClick: () => setActiveView("library") },
        { id: "kategori", icon: <Settings size={20}/>,    label: "Kelola Kategori",    onClick: () => setActiveView("kategori") },
      ] : []),
      { id: "add", icon: isEditMode ? <X size={20}/> : <Plus size={20}/>, label: isEditMode ? "Batal Tambah" : "Tambah Marker", onClick: () => { setIsEditMode(!isEditMode); if (activeView !== "map") setActiveView("map"); }, active: isEditMode },
    ] : []),
    { id: "layer", icon: <Layers size={20}/>, label: tileLayer === "street" ? "Ganti ke Satelit" : "Ganti ke Peta", onClick: () => setTileLayer(t => t === "street" ? "satellite" : "street") },
  ];

  return (
    <div style={{ height: "100vh", fontFamily: "sans-serif", position: "relative", display: "flex" }}>
      <style>{`
        /* ===== MODERN UI STYLES ===== */
        .modern-input {
          width: 100%;
          padding: 12px 16px;
          margin: 0 0 12px 0;
          box-sizing: border-box;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          background-color: #f7fafc;
          color: #2d3748;
          transition: all 0.2s ease;
          outline: none;
        }
        .modern-input:focus {
          border-color: #3182ce;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
        }
        .modern-label {
          font-size: 11px;
          font-weight: 700;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 6px;
        }
        .modern-card {
          background: #ffffff;
          padding: 14px;
          border-radius: 10px;
          border: 1px solid #edf2f7;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .modern-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-color: #e2e8f0;
        }
        .modern-attr-key {
          font-size: 11px;
          color: #a0aec0;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: capitalize;
          font-weight: 600;
        }
        .modern-attr-val {
          font-size: 13px;
          font-weight: 700;
          color: #2d3748;
          word-break: break-word;
          line-height: 1.4;
        }

        .leaflet-top { top: 10px !important; }
        .leaflet-bottom.leaflet-right { bottom: 30px !important; right: 15px !important; }

        /* ===== MARKER CLUSTER CUSTOM ===== */
        .marker-cluster-custom {
          background: transparent !important;
          border: none !important;
        }
        .cluster-inner {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a73e8, #0d47a1);
          border: 3px solid #fff;
          box-shadow: 0 2px 10px rgba(26,115,232,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: clusterPulse 2s ease-in-out infinite;
        }
        .cluster-inner::before {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: rgba(26,115,232,0.25);
          animation: clusterRing 2s ease-in-out infinite;
        }
        .cluster-inner::after {
          content: '';
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          background: rgba(26,115,232,0.10);
          animation: clusterRing 2s ease-in-out infinite 0.3s;
        }
        .cluster-count {
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          font-family: sans-serif;
          line-height: 1;
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        /* Cluster besar (>= 10) */
        .cluster-inner.large {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          box-shadow: 0 2px 12px rgba(231,76,60,0.55);
          animation: clusterPulseLarge 1.6s ease-in-out infinite;
        }
        .cluster-inner.large::before {
          background: rgba(231,76,60,0.25);
        }
        .cluster-inner.large::after {
          background: rgba(231,76,60,0.10);
        }
        .cluster-inner.large .cluster-count {
          font-size: 16px;
        }
        /* Cluster medium (5-9) */
        .cluster-inner.medium {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f39c12, #e67e22);
          box-shadow: 0 2px 10px rgba(243,156,18,0.5);
        }
        .cluster-inner.medium::before {
          background: rgba(243,156,18,0.25);
        }
        .cluster-inner.medium::after {
          background: rgba(243,156,18,0.10);
        }
        @keyframes clusterPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 10px rgba(26,115,232,0.5); }
          50%       { transform: scale(1.08); box-shadow: 0 4px 18px rgba(26,115,232,0.7); }
        }
        @keyframes clusterPulseLarge {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 12px rgba(231,76,60,0.55); }
          50%       { transform: scale(1.1); box-shadow: 0 6px 22px rgba(231,76,60,0.75); }
        }
        @keyframes clusterRing {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 0; transform: scale(1.3); }
        }

        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .attr-row:last-child { border-bottom: none !important; }
        .nav-item:hover { background: rgba(255,255,255,0.12) !important; }
        .nav-item-active { background: rgba(255,255,255,0.18) !important; }
      `}</style>

 {/* MODAL REJECT Admin isi alasan penolakan */}
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
              <XCircle size={18} /> Tolak Marker
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
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <XCircle size={14} /> Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT */}
      {modalData && (
        <div
          style={{
            position: "fixed",
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
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  margin: "0 0 6px 0",
                  display: "flex",
                  alignItems: "center",
                  color: "#1a1a2e",
                  fontSize: "18px"
                }}
              >
                {modalData.isEdit ? (
                  <>
                    <Edit3 size={20} style={{ marginRight: "8px", color: "#3182ce" }} /> Perbarui Data Lokasi
                  </>
                ) : (
                  <>
                    <MapPin size={20} style={{ marginRight: "8px", color: "#3182ce" }} /> Tambah Lokasi Baru
                  </>
                )}
              </h3>
              {!modalData.isEdit && (
                <p style={{ margin: 0, fontSize: "13px", color: "#718096" }}>
                  {modalStep === 1 
                    ? "Tahap 1 dari 2: Tentukan nama, jenis fasilitas, dan foto." 
                    : "Tahap 2 dari 2: Lengkapi detail informasi fasilitas ini."}
                </p>
              )}
            </div>

            {/* STEP 1: BASIC INFO + PHOTO */}
            {modalStep === 1 && !modalData.isEdit && (
              <>
                <label className="modern-label">
                  Nama Lokasi
                </label>
                <input
                  type="text"
                  placeholder="Ketik nama..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="modern-input"
                />

                <label className="modern-label">
                  Kategori Kesehatan
                </label>
                <select
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  className="modern-input"
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

                {/* FILE UPLOAD */}
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#555",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
                  }}
                >
                  <Camera size={14} />
                  Foto Fasilitas
                  <span style={{ fontWeight: "normal", color: "#999" }}>
                    (opsional)
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "10px",
                    boxSizing: "border-box",
                    border: "1px dashed #999",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                />

                {/* URL FOTO ALTERNATIVE */}
                <label className="modern-label">
                  Atau masukkan URL Foto
                </label>
                <input
                  type="url"
                  placeholder="https://contoh.com/foto.jpg"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  className="modern-input"
                />

                {/* PREVIEW */}
                {fotoUrl && (
                  <img
                    src={fotoUrl}
                    alt="preview"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                    style={{
                      width: "100%",
                      maxHeight: "140px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginBottom: "15px",
                    }}
                  />
                )}

                {/* BUTTONS STEP 1 */}
                <div
                  style={{
                    marginTop: "25px",
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={clearModal}
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
                    onClick={handleNextStep}
                    style={{
                      padding: "10px 20px",
                      border: "none",
                      background: "#3182ce",
                      color: "white",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#2b6cb0"}
                    onMouseLeave={e => e.currentTarget.style.background = "#3182ce"}
                  >
                    Selanjutnya: Isi Detail
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: DYNAMIC ATTRIBUTES */}
            {(modalStep === 2 || modalData.isEdit) && (
              <>
                {!modalData.isEdit && (
                  <div
                    style={{
                      background: "#f0f8ff",
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "15px",
                      fontSize: "13px",
                      color: "#2c5aa0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "6px",
                      }}
                    >
                      <Info size={14} />
                      <strong>Kategori:</strong>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      {selectedKategori}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <MapPin size={14} />
                      <strong>Nama:</strong>
                    </div>
                    <div>{customName}</div>
                  </div>
                )}

                {renderDynamicFields()}

                {/* BUTTONS STEP 2 */}
                <div
                  style={{
                    marginTop: "25px",
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  {!modalData.isEdit && (
                    <button
                      onClick={handleBackStep}
                      style={{
                        padding: "10px 15px",
                        border: "none",
                        background: "#ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
 Kembali
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (modalData.isEdit) {
                        setModalData(null);
                        setDynamicAttrs({});
                        setIsPublic(true);
                        setModalStep(1);
                      } else {
                        clearModal();
                      }
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
                      background: "#3182ce",
                      color: "white",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#2b6cb0"}
                    onMouseLeave={e => e.currentTarget.style.background = "#3182ce"}
                  >
                    <CheckCircle size={16} /> {modalData.isEdit ? "Simpan Perubahan" : "Kirim Pengajuan"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

 {/* ===== SIDEBAR KIRI putih, hover expand ===== */}
      <nav
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: sidebarExpanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
          background: "#ffffff",
          zIndex: 1500,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
          boxShadow: "4px 0 20px rgba(0,0,0,0.10)",
          borderRight: "1px solid #e8eaed",
        }}
      >
        {/* Logo */}
        <div style={{
          height: "70px",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "12px",
          borderBottom: "1px solid #f0f0f0",
          flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "10px",
            background: "linear-gradient(135deg,#1a73e8,#0d47a1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 2px 8px rgba(26,115,232,0.35)",
          }}>
            <HeartPulse size={18} color="white" />
          </div>
          {sidebarExpanded && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <div style={{ color: "#1a1a2e", fontWeight: 800, fontSize: "14px" }}>
                Peta Kesehatan
              </div>
              <div style={{ color: "#9aa0a6", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>
                {authKey ? (userRole === "admin" ? "Admin" : "Kontributor") : "Guest"}
              </div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <div style={{ flex: 1, overflow: "hidden", padding: "8px 0" }}>
          {navItems.map((item) => {
            const isActive = item.active || activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                title={!sidebarExpanded ? item.label : undefined}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: "12px", padding: "11px 15px",
                  background: isActive ? "#e8f0fe" : "transparent",
                  border: "none",
                  color: isActive ? "#1a73e8" : "#5f6368",
                  cursor: "pointer",
                  fontSize: "13px", fontWeight: isActive ? 700 : 500,
                  textAlign: "left", transition: "background 0.15s",
                  position: "relative", whiteSpace: "nowrap",
                  borderLeft: isActive ? "3px solid #1a73e8" : "3px solid transparent",
                  borderRadius: "0 8px 8px 0",
                  marginRight: "8px",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f8f9fa"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {sidebarExpanded && (
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{item.label}</span>
                )}
                {item.badge > 0 && (
                  <span style={{
                    background: "#e74c3c", color: "#fff",
                    fontSize: "10px", fontWeight: 700,
                    padding: "1px 5px", borderRadius: "10px",
                    flexShrink: 0,
                  }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter dropdown (expanded) */}
        {sidebarExpanded && isFilterDropdownOpen && (
          <div style={{
            padding: "12px", borderTop: "1px solid #f0f0f0",
            maxHeight: "280px", overflowY: "auto", flexShrink: 0,
            background: "#fafafa",
          }}>
            <p style={{ margin: "0 0 8px", color: "#9aa0a6", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Filter Kategori
            </p>
            {kategoriKesehatan.map((kat) => (
              <label key={kat} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}>
                <input type="checkbox" checked={filters[kat] !== false}
                  onChange={() => setFilters((prev) => ({ ...prev, [kat]: !prev[kat] }))}
                  style={{ accentColor: "#1a73e8" }} />
                <span style={{ color: "#3c4043", fontSize: "12px" }}>{kat}</span>
              </label>
            ))}
          </div>
        )}

        {/* Separator line */}
        <div style={{ height: "1px", background: "#e8eaed", margin: "0 12px", flexShrink: 0 }} />

        {/* User section bawah */}
        <div style={{ padding: "10px 10px", flexShrink: 0 }}>
          {authKey ? (
            <button
              onClick={handleLogout}
              title={!sidebarExpanded ? "Logout" : undefined}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", background: "#fff5f5",
                border: "1px solid #ffcccc", borderRadius: "8px",
                color: "#e74c3c", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              <LogOut size={18} style={{ flexShrink: 0 }} />
              {sidebarExpanded && <span>{userName || "Logout"}</span>}
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              title={!sidebarExpanded ? "Login" : undefined}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", background: "#e8f0fe",
                border: "none", borderRadius: "8px",
                color: "#1a73e8", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              <LogIn size={18} style={{ flexShrink: 0 }} />
              {sidebarExpanded && <span>Login / Daftar</span>}
            </button>
          )}
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <div
        onClick={() => { setIsFilterDropdownOpen(false); setIsLoginDropdownOpen(false); }}
        style={{
          position: "absolute",
          top: 0,
          left: SIDEBAR_W_COLLAPSED,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
 {/* ===== TOP BAR Card dengan judul, search, filter (hanya di map view) ===== */}
        {activeView === "map" && <div style={{
          position: "absolute",
          top: "15px",
          left: `calc(50% + ${sidebarExpanded ? (SIDEBAR_W_EXPANDED - SIDEBAR_W_COLLAPSED) / 2 : 0}px)`,
          transform: "translateX(-50%)",
          zIndex: 1100,
          background: "#fff",
          borderRadius: "16px",
          padding: "12px 20px 14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
          border: "1px solid #e8eaed",
          width: sidebarExpanded
            ? `calc(100% - ${SIDEBAR_W_EXPANDED + 40}px)`
            : `calc(100% - ${SIDEBAR_W_COLLAPSED + 40}px)`,
          maxWidth: "600px",
          minWidth: "280px",
          transition: "width 0.25s cubic-bezier(.4,0,.2,1), left 0.25s cubic-bezier(.4,0,.2,1)",
        }}>
          {/* Judul */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            marginBottom: "10px",
          }}>
            <HeartPulse size={16} color="#d63031" />
            <span style={{ fontWeight: 800, fontSize: "15px", color: "#1a1a2e", letterSpacing: "0.2px" }}>
              Peta Fasilitas Kesehatan
            </span>
            <span style={{
              marginLeft: "auto", fontSize: "11px", color: "#9aa0a6",
              background: "#f8f9fa", padding: "2px 8px", borderRadius: "10px",
              fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px",
            }}>
              {authKey ? (userRole === "admin" ? "Admin" : "Kontributor") : "Guest"}
            </span>
          </div>

          {/* Search + Filter row */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#f8f9fa", borderRadius: "10px",
            padding: "8px 12px", border: "1px solid #e8eaed",
          }}>
            <Search size={15} color="#9aa0a6" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Cari fasilitas kesehatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none", outline: "none", flex: 1,
                fontSize: "13px", background: "transparent", color: "#3c4043",
              }}
            />
            {searchQuery && (
              <X size={14} color="#9aa0a6" style={{ cursor: "pointer", flexShrink: 0 }}
                onClick={() => setSearchQuery("")} />
            )}
            <div style={{ width: "1px", height: "18px", background: "#e0e0e0", flexShrink: 0 }} />
            <button
              onClick={(e) => { e.stopPropagation(); setIsFilterDropdownOpen(!isFilterDropdownOpen); }}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                background: isFilterDropdownOpen ? "#e8f0fe" : "transparent",
                border: "none", color: isFilterDropdownOpen ? "#1a73e8" : "#5f6368",
                cursor: "pointer", fontSize: "12px", fontWeight: 600,
                padding: "3px 8px", borderRadius: "8px", flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* Search results dropdown */}
          {(searchResults.length > 0 || isSearchSearching) && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
              background: "#fff", borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              maxHeight: "220px", overflowY: "auto", zIndex: 1200,
            }}>
              {isSearchSearching ? (
                <div style={{ padding: "12px 16px", fontSize: "13px", color: "#777" }}>Mencari lokasi...</div>
              ) : searchResults.map((res, i) => (
                <div key={i} onClick={() => handleExternalSearchClick(res)}
                  style={{ padding: "11px 16px", borderBottom: "1px solid #f0f0f0", cursor: "pointer", fontSize: "13px", color: "#3c4043" }}>
                  {res.display_name}
                </div>
              ))}
            </div>
          )}

          {/* Filter dropdown */}
          {isFilterDropdownOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              background: "#fff", borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              padding: "16px", minWidth: "220px", zIndex: 1200,
            }}>
              <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Filter Kategori
              </p>
              {kategoriKesehatan.map((kat) => (
                <label key={kat} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", cursor: "pointer" }}>
                  <input type="checkbox" checked={filters[kat] !== false}
                    onChange={() => setFilters((prev) => ({ ...prev, [kat]: !prev[kat] }))}
                    style={{ accentColor: "#1a73e8", transform: "scale(1.1)" }} />
                  <span style={{ fontSize: "13px", color: "#3c4043", fontWeight: 500 }}>{kat}</span>
                </label>
              ))}
            </div>
          )}
        </div>}

 {/* Hapus Rute button top right */}
        {routeTarget && (
          <button
            onClick={(e) => { e.stopPropagation(); setRouteTarget(null); setLegacyRouteInfo(null); }}
            style={{
              position: "absolute", top: "15px", right: "15px", zIndex: 1100,
              display: "flex", alignItems: "center", gap: "6px",
              background: "#fff", border: "1px solid #e8eaed",
              color: "#e74c3c", padding: "9px 14px", borderRadius: "20px",
              fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "13px",
            }}
          >
            <Trash2 size={14} /> Hapus Rute
          </button>
        )}

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
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Navigation size={16} /> Mode Routing
            </div>
            {!startPoint && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ArrowRight size={14} /> Klik marker <b>titik awal</b>
              </div>
            )}
            {startPoint && !endPoint && (
              <div style={{ fontSize: "13px", color: "#555" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "4px",
                  }}
                >
                  <CheckCircle size={14} /> Titik awal dipilih
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <ArrowRight size={14} /> Klik marker <b>tujuan</b>
                </div>
              </div>
            )}
            {startPoint && endPoint && !routeInfo && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Clock size={14} /> Menghitung rute...
              </div>
            )}
            {startPoint && endPoint && routeInfo && (
              <div style={{ fontSize: "13px" }}>
                <div
                  style={{
                    color: "#27ae60",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <CheckCircle size={14} /> Rute ditemukan
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <MapPin size={14} /> Jarak: <b>{routeInfo.distanceKm} km</b>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "4px",
                  }}
                >
                  <Clock size={14} /> Estimasi:{" "}
                  <b>~{routeInfo.durationMin} menit</b>
                </div>
              </div>
            )}
            {startPoint && endPoint && routeInfo === null && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#e74c3c",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <AlertTriangle size={14} /> Rute tidak ditemukan, menampilkan
                garis lurus
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
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Trash2 size={14} /> Reset Titik
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
              zoomControl={false}
              style={{
                height: "100%",
                width: "100%",
                cursor: isEditMode ? "crosshair" : "grab",
              }}
            >
              <MapSetup onMap={setMapInstance} />
              <MapFocus
                activeMarkerId={activeMarkerId}
                markers={displayedMarkers}
              />
              <UserLocationMarker />

              {tileLayer === "street" ? (
                <TileLayer
 attribution=" OSM"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              ) : (
                <TileLayer
 attribution=" Esri"
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
              <MarkerClusterGroup
                iconCreateFunction={(cluster) => {
                  const count = cluster.getChildCount();
                  const sizeClass = count >= 10 ? "large" : count >= 5 ? "medium" : "";
                  const size = count >= 10 ? 64 : count >= 5 ? 60 : 56;
                  return L.divIcon({
                    html: `<div class="cluster-inner ${sizeClass}"><span class="cluster-count">${count}</span></div>`,
                    className: "marker-cluster-custom",
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                  });
                }}
              >
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
 // Klik marker buka sidebar info
                            setSidebarMarker(pos);
                            setActiveMarkerId(pos.id);
                          }
                        },
                      }}
                    />
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

        {/* ===== VIEW: STATUS KONTRIBUTOR ===== */}
        {activeView === "status" && (
          <div style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: sidebarExpanded ? SIDEBAR_W_EXPANDED - SIDEBAR_W_COLLAPSED : 0,
            right: 0,
            padding: "28px",
            background: "#f8f9fa",
            overflowY: "auto",
            transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
          }}>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#1a1a2e", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={20} color="#1a73e8" /> {userRole === "admin" ? "Status Kontributor" : "Status Marker Saya"}
              </h2>
              <p style={{ margin: 0, color: "#9aa0a6", fontSize: "13px" }}>
                {pendingMarkers.length} marker menunggu persetujuan
              </p>
            </div>

            {pendingMarkers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "12px", border: "1px solid #e8eaed" }}>
                <CheckCircle size={48} color="#27ae60" style={{ marginBottom: "16px" }} />
                <h3 style={{ margin: "0 0 8px", color: "#1a1a2e" }}>Semua sudah diproses</h3>
                <p style={{ margin: 0, color: "#9aa0a6", fontSize: "14px" }}>Tidak ada marker yang menunggu persetujuan.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pendingMarkers.map((marker, index) => (
                  <div key={marker.id} style={{
                    background: "#fff", borderRadius: "12px", padding: "16px 20px",
                    border: "1px solid #e8eaed", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    display: "flex", alignItems: "center", gap: "16px",
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: "13px", color: "#1a73e8" }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a2e", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {marker.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#9aa0a6", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: colorMap[marker.kategori] || "#3498db", display: "inline-block" }} />
                          {marker.kategori || "-"}
                        </span>
                        <span>{marker.alamat?.substring(0, 50) || "-"}{marker.alamat?.length > 50 ? "..." : ""}</span>
 <span style={{ color: "#5f6368" }}> {marker.pemilik || "-"}</span>
                      </div>
                    </div>
                    <span style={{ background: "#fff8e1", color: "#f39c12", border: "1px solid #ffe082", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
 Pending
                    </span>
                    {userRole === "admin" && (
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        <button onClick={() => handleApprove(marker.id)}
                          style={{ padding: "8px 14px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle size={13} /> Setujui
                        </button>
                        <button onClick={() => handleReject(marker.id)}
                          style={{ padding: "8px 14px", background: "#fff5f5", color: "#e74c3c", border: "1px solid #ffcccc", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <XCircle size={13} /> Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== VIEW: PUSTAKA DATA ===== */}
        {activeView === "library" && userRole === "admin" && (
          <div style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: sidebarExpanded ? SIDEBAR_W_EXPANDED - SIDEBAR_W_COLLAPSED : 0,
            right: 0,
            padding: "28px",
            background: "#f8f9fa",
            overflowY: "auto",
            transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
          }}>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#1a1a2e", display: "flex", alignItems: "center", gap: "8px" }}>
                <Table size={20} color="#1a73e8" /> Pustaka Data
              </h2>
              <p style={{ margin: 0, color: "#9aa0a6", fontSize: "13px" }}>
                {markers.length} total marker terdaftar
              </p>
            </div>

            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8eaed", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e8eaed" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: "0.8px" }}>No</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: "0.8px" }}>Nama</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: "0.8px" }}>Kategori</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: "0.8px" }}>Alamat</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: "0.8px" }}>Pemilik</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: "0.8px" }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: "0.8px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {markers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "48px", textAlign: "center", color: "#9aa0a6", fontSize: "14px" }}>
                        Belum ada data marker.
                      </td>
                    </tr>
                  ) : (
                    markers.map((marker, index) => {
                      const statusColor = marker.status === "Diterima" ? { bg: "#e8f5e9", color: "#27ae60", label: "Diterima" }
                        : marker.status === "Pending" ? { bg: "#fff8e1", color: "#f39c12", label: "Pending" }
                        : { bg: "#fff5f5", color: "#e74c3c", label: "Ditolak" };
                      return (
                        <tr key={marker.id} style={{ borderBottom: "1px solid #f0f0f0" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#9aa0a6" }}>{index + 1}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: "#1a1a2e", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {marker.name}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: colorMap[marker.kategori] || "#3498db", display: "inline-block", flexShrink: 0 }} />
                              <span style={{ color: "#5f6368" }}>{marker.kategori || "-"}</span>
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#5f6368", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {marker.alamat || "-"}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#5f6368" }}>
                            {marker.pemilik || "-"}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ background: statusColor.bg, color: statusColor.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              {statusColor.label}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => { handleEditClick(marker); setActiveView("map"); }}
                                style={{ padding: "6px 10px", background: "#fff3e0", color: "#e67e22", border: "1px solid #f0c070", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                                Edit
                              </button>
                              <button onClick={() => handleDeletePoint(marker.id)}
                                style={{ padding: "6px 10px", background: "#fff5f5", color: "#e74c3c", border: "1px solid #ffcccc", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== VIEW: KELOLA KATEGORI ===== */}
        {activeView === "kategori" && userRole === "admin" && (
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: sidebarExpanded ? SIDEBAR_W_EXPANDED - SIDEBAR_W_COLLAPSED : 0,
            right: 0, padding: "28px", background: "#f8f9fa",
            overflowY: "auto", transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#1a1a2e", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Settings size={20} color="#1a73e8" /> Kelola Kategori
                </h2>
                <p style={{ margin: 0, color: "#9aa0a6", fontSize: "13px" }}>{kategoriOptions.length} kategori terdaftar</p>
              </div>
              <button
                onClick={() => { setKategoriModal({ mode: "add" }); setKatForm({ nama_kategori: "", warna: "#3498db", fields: [] }); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                <Plus size={15} /> Tambah Kategori
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {kategoriOptions.map((kat) => (
                <div key={kat.id} style={{ background: "#fff", borderRadius: "12px", padding: "14px 18px", border: "1px solid #e8eaed", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: kat.warna || "#3498db", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a2e" }}>{kat.nama_kategori}</div>
                    <div style={{ fontSize: "12px", color: "#9aa0a6", marginTop: "2px" }}>
                      {(kat.fields || []).length} atribut: {(kat.fields || []).map(f => f.label).join(", ") || "-"}
                    </div>
                  </div>
                  <button
                    onClick={() => { setKategoriModal({ mode: "edit", data: kat }); setKatForm({ nama_kategori: kat.nama_kategori, warna: kat.warna || "#3498db", fields: kat.fields || [] }); }}
                    style={{ padding: "6px 12px", background: "#fff3e0", color: "#e67e22", border: "1px solid #f0c070", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteKategori(kat.id)}
                    style={{ padding: "6px 12px", background: "#fff5f5", color: "#e74c3c", border: "1px solid #ffcccc", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Tambah/Edit Kategori */}
        {kategoriModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 3500, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "520px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 800, color: "#1a1a2e" }}>
                {kategoriModal.mode === "add" ? "Tambah Kategori" : "Edit Kategori"}
              </h3>

              {/* Nama */}
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#5f6368", display: "block", marginBottom: "4px" }}>Nama Kategori</label>
              <input value={katForm.nama_kategori} onChange={e => setKatForm(p => ({ ...p, nama_kategori: e.target.value }))}
                placeholder="Contoh: Klinik Mata"
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", marginBottom: "14px" }} />

              {/* Warna */}
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#5f6368", display: "block", marginBottom: "4px" }}>Warna Marker</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <input type="color" value={katForm.warna} onChange={e => setKatForm(p => ({ ...p, warna: e.target.value }))}
                  style={{ width: "44px", height: "36px", border: "1px solid #e0e0e0", borderRadius: "6px", cursor: "pointer", padding: "2px" }} />
                <span style={{ fontSize: "13px", color: "#5f6368" }}>{katForm.warna}</span>
              </div>

              {/* Atribut yang sudah ditambah */}
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#5f6368", display: "block", marginBottom: "8px" }}>
                Atribut ({katForm.fields.length})
              </label>
              {katForm.fields.length > 0 && (
                <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {katForm.fields.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8f9fa", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e8eaed" }}>
                      <span style={{ flex: 1, fontSize: "13px", color: "#3c4043" }}>
                        <b>{f.label}</b> <span style={{ color: "#9aa0a6" }}>({f.key}, {f.type}{f.options ? ": " + f.options.join(", ") : ""})</span>
                      </span>
                      <button onClick={() => removeKatField(i)}
                        style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>x</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form tambah atribut */}
              <div style={{ background: "#f0f4ff", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
                <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color: "#1a73e8" }}>+ Tambah Atribut</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#5f6368", display: "block", marginBottom: "3px" }}>Key (tanpa spasi)</label>
                    <input value={katFieldDraft.key} onChange={e => setKatFieldDraft(p => ({ ...p, key: e.target.value }))}
                      placeholder="jam_operasional"
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#5f6368", display: "block", marginBottom: "3px" }}>Label</label>
                    <input value={katFieldDraft.label} onChange={e => setKatFieldDraft(p => ({ ...p, label: e.target.value }))}
                      placeholder="Jam Operasional"
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#5f6368", display: "block", marginBottom: "3px" }}>Tipe</label>
                    <select value={katFieldDraft.type} onChange={e => setKatFieldDraft(p => ({ ...p, type: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "13px" }}>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select (pilihan)</option>
                    </select>
                  </div>
                  {katFieldDraft.type === "select" && (
                    <div>
                      <label style={{ fontSize: "11px", color: "#5f6368", display: "block", marginBottom: "3px" }}>Opsi (pisah koma)</label>
                      <input value={katFieldDraft.options} onChange={e => setKatFieldDraft(p => ({ ...p, options: e.target.value }))}
                        placeholder="Ya, Tidak"
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }} />
                    </div>
                  )}
                </div>
                <button onClick={addKatField}
                  style={{ padding: "7px 14px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
                  + Tambah Atribut
                </button>
              </div>

              {/* Tombol aksi */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button onClick={() => setKategoriModal(null)}
                  style={{ padding: "10px 18px", background: "#f0f0f0", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#5f6368" }}>
                  Batal
                </button>
                <button onClick={handleSaveKategori}
                  style={{ padding: "10px 20px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                  {kategoriModal.mode === "add" ? "Simpan Kategori" : "Update Kategori"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Label mode tambah -- tengah bawah */}
        {isEditMode && (
          <div style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
            color: "white",
            padding: "10px 22px",
            borderRadius: "24px",
            fontSize: "13px",
            fontWeight: 700,
            boxShadow: "0 4px 16px rgba(26,115,232,0.45)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}>
            <Plus size={15} />
            Klik peta untuk menambah marker
          </div>
        )}

 {/* SIDEBAR INFO MARKER -- Google Maps style (kiri) */}
        {sidebarMarker && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "360px",
              zIndex: 1200,
              background: "#fff",
              boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              animation: "slideInLeft 0.25s ease",
              overflowY: "auto",
            }}
          >
            <style>{`
              @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to   { transform: translateX(0);    opacity: 1; }
              }
              .attr-row:last-child { border-bottom: none !important; }
            `}</style>

            {/* Foto header */}
            {sidebarMarker.foto_url ? (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={sidebarMarker.foto_url}
                  alt={sidebarMarker.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <button
                  onClick={() => {
                    setSidebarMarker(null);
                    setActiveMarkerId(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "rgba(0,0,0,0.5)",
                    border: "none",
                    color: "#fff",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              /* Gradient header tanpa foto */
              <div
                style={{
                  flexShrink: 0,
                  height: "100px",
                  position: "relative",
                  background: `linear-gradient(135deg, ${colorMap[sidebarMarker.kategori] || "#3498db"}, #1a1a2e)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff" }}>
                  {sidebarMarker.kategori?.includes("Apotek") ? (
                    <Pill size={48} />
                  ) : sidebarMarker.kategori?.includes("Puskesmas") ? (
                    <HeartPulse size={48} />
                  ) : sidebarMarker.kategori?.includes("Gigi") ? (
                    <Stethoscope size={48} />
                  ) : sidebarMarker.kategori?.includes("Bidan") ? (
                    <UserPlus size={48} />
                  ) : sidebarMarker.kategori?.includes("Fisio") ? (
                    <HeartPulse size={48} />
                  ) : (
                    <Hospital size={48} />
                  )}
                </span>
                <button
                  onClick={() => {
                    setSidebarMarker(null);
                    setActiveMarkerId(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "rgba(0,0,0,0.3)",
                    border: "none",
                    color: "#fff",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Konten */}
            <div style={{ padding: "18px 20px", flex: 1 }}>
              {/* Kategori badge + status */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    background: colorMap[sidebarMarker.kategori] || "#3498db",
                    color: "#fff",
                    padding: "3px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.3px",
                  }}
                >
                  {sidebarMarker.kategori}
                </span>
                {sidebarMarker.status &&
                  sidebarMarker.status !== "Diterima" && (
                    <span
                      style={{
                        background:
                          sidebarMarker.status === "Pending"
                            ? "#f39c12"
                            : "#e74c3c",
                        color: "#fff",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {sidebarMarker.status === "Pending" ? (
                        <>
                          <Clock size={12} /> Menunggu Review
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Ditolak
                        </>
                      )}
                    </span>
                  )}
              </div>

              {/* Nama */}
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#1a1a2e",
                  lineHeight: 1.3,
                }}
              >
                {sidebarMarker.name}
              </h2>

              {/* Alamat */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start",
                  marginBottom: "10px",
                }}
              >
                <MapPin
                  size={15}
                  color="#5f6368"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    color: "#5f6368",
                    lineHeight: 1.5,
                  }}
                >
                  {sidebarMarker.alamat || "Alamat tidak tersedia"}
                </span>
              </div>

              {/* Kontributor */}
              {sidebarMarker.pemilik && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9aa0a6",
                    marginBottom: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <User size={12} /> Ditambahkan oleh{" "}
                  <b style={{ color: "#5f6368" }}>{sidebarMarker.pemilik}</b>
                </div>
              )}

              {/* Alasan penolakan */}
              {sidebarMarker.status === "Rejected" &&
                sidebarMarker.alasan_ditolak && (
                  <div
                    style={{
                      padding: "12px",
                      background: "#fff5f5",
                      border: "1px solid #ffcccc",
                      borderRadius: "10px",
                      fontSize: "13px",
                      color: "#c0392b",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginBottom: "4px",
                      }}
                    >
                      <AlertTriangle size={14} /> <b>Alasan penolakan:</b>
                    </div>
                    {sidebarMarker.alasan_ditolak}
                  </div>
                )}

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "#f0f0f0",
                  margin: "14px 0",
                }}
              />

              {/* Atribut Detail */}
              {Object.keys(sidebarMarker.atribut_tambahan || {}).length > 0 && (
                <div>
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#9aa0a6",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    Detail Fasilitas
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {Object.entries(sidebarMarker.atribut_tambahan).map(
                      ([key, val]) => {
                        const iconMap = {
                          jam_operasional: Clock,
                          telepon: Phone,
                          bpjs: ShieldCheck,
                          igd: Hospital,
                          spesialisasi: Stethoscope,
                          fasilitas: Home,
                          kapasitas_tt: Bed,
                          status_rs: ShieldCheck,
                          kelas_rs: Star,
                          rawat_inap: Bed,
                          drive_thru: Car,
                          buka_24_jam: Clock,
                          nama_dokter: User,
                          apoteker: Pill,
                          jaringan: Link,
                          jenis_klinik: Hospital,
                        };
                        const IconComponent = iconMap[key] || Circle;
                        return (
                          <div
                            key={key}
                            className="modern-card"
                          >
                            <span className="modern-attr-key" style={{ textTransform: "none" }}>
                              <IconComponent size={14} color="#a0aec0" /> {formatFriendlyKey(key)}
                            </span>
                            <span className="modern-attr-val">
                              {val}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "#f0f0f0",
                  margin: "14px 0",
                }}
              />

              {/* Tombol Rute */}
              {userLocation && (
                <button
                  onClick={() => {
                    setRouteTarget(sidebarMarker);
                    setSidebarMarker(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginBottom: "8px",
                    background: "linear-gradient(135deg,#1a73e8,#0d47a1)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <MapPin size={16} /> Rute ke Sini
                </button>
              )}

              {/* Tombol Edit & Hapus (hanya pemilik / admin) */}
              {authKey &&
                (String(sidebarMarker.user_id) === String(currentUserId) ||
                  userRole === "admin") && (
                  <div
                    style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                  >
                    <button
                      onClick={() => handleEditClick(sidebarMarker)}
                      style={{
                        flex: 1,
                        padding: "11px",
                        background: "#fff3e0",
                        color: "#e67e22",
                        border: "1px solid #f0c070",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeletePoint(sidebarMarker.id)}
                      style={{
                        flex: 1,
                        padding: "11px",
                        background: "#fff5f5",
                        color: "#e74c3c",
                        border: "1px solid #ffcccc",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <XCircle size={14} /> Hapus
                    </button>
                  </div>
                )}

              {/* Approve / Reject (admin) */}
              {userRole === "admin" && sidebarMarker.status === "Pending" && (
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <button
                    onClick={() => {
                      handleApprove(sidebarMarker.id);
                      setSidebarMarker((p) =>
                        p ? { ...p, status: "Diterima" } : null,
                      );
                    }}
                    style={{
                      flex: 1,
                      padding: "11px",
                      background: "#27ae60",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <CheckCircle size={14} /> Setujui
                  </button>
                  <button
                    onClick={() => {
                      handleReject(sidebarMarker.id);
                      setSidebarMarker(null);
                    }}
                    style={{
                      flex: 1,
                      padding: "11px",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <XCircle size={14} /> Tolak
                  </button>
                </div>
              )}

              {/* Tutup */}
              <button
                onClick={() => {
                  setSidebarMarker(null);
                  setActiveMarkerId(null);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#f8f9fa",
                  color: "#5f6368",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



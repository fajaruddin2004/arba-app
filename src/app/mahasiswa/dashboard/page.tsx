"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ScanLine,
  ClipboardList,
  User,
  MapPin,
  Calendar,
  LogOut,
  Bell,
  Home,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  BookOpen,
  Camera,
  Upload
} from "lucide-react";
import QRScanner from "@/components/QRScanner";
import { ThemeToggle } from "@/components/ThemeToggle";


const TiltCard = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-3xl p-5 md:p-6 relative group transition-all duration-200 hover:shadow-lg ${onClick ? "cursor-pointer active:scale-[0.98]" : ""} ${className}`}
    >
      <div className="w-full h-full relative z-10">
        {children}
      </div>
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
    </div>
  );
};

export default function MahasiswaDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [scanResult, setScanResult] = useState("");
  const [geoStatus, setGeoStatus] = useState("Mengecek...");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [mataKuliah, setMataKuliah] = useState<any[]>([]);
  const [scannedClass, setScannedClass] = useState<any>(null);
  const [qrToken, setQrToken] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  useEffect(() => {
    // Fetch user data
    fetch(`/api/auth/me?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if(data.user) {
          setUserData(data.user);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch Mata Kuliah for Jadwal from Mahasiswa's own API
    fetch(`/api/mahasiswa/jadwal?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if(data.data) setMataKuliah(data.data);
      });

    // ========== GEOLOCATION FIX ==========
    // Koordinat Asli STIKOM 22 Januari Kendari (dari Google Maps)
    const kampusLat = -3.9987867;
    const kampusLng = 122.5177898;
    
    // Radius toleransi diperbesar: 150 meter
    // GPS di dalam gedung bisa melenceng 20-50m, jadi 150m cukup aman
    const radiusMaksimal = 150;
    
    // Fungsi Haversine untuk menghitung jarak 2 titik GPS
    const hitungJarak = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371e3; // Radius bumi (meter)
      const toRad = (x: number) => x * Math.PI / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    };

    let watchId: number | null = null;

    if ("geolocation" in navigator) {
      // Gunakan watchPosition agar GPS terus diperbarui (penting untuk akurasi di dalam gedung)
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const mhsLat = position.coords.latitude;
          const mhsLng = position.coords.longitude;
          const akurasi = Math.round(position.coords.accuracy); // Akurasi GPS dalam meter
          
          const jarak = hitungJarak(mhsLat, mhsLng, kampusLat, kampusLng);
          const isDalamRadius = jarak <= radiusMaksimal;

          if (isDalamRadius) {
            setGeoStatus(`✅ Dalam Kampus (${jarak}m, akurasi ±${akurasi}m)`);
          } else {
            setGeoStatus(`❌ Luar Area (${jarak}m, akurasi ±${akurasi}m)`);
          }
          
          // Simpan koordinat terbaru
          (window as any).mhsCoords = {
            lat: mhsLat,
            lng: mhsLng,
            jarak,
            akurasi,
            status: isDalamRadius ? "Hadir" : "Di Luar Radius"
          };
        },
        (error) => {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setGeoStatus("⚠️ Izin GPS ditolak");
              break;
            case error.POSITION_UNAVAILABLE:
              setGeoStatus("⚠️ GPS tidak tersedia");
              break;
            case error.TIMEOUT:
              setGeoStatus("⚠️ GPS timeout, coba lagi...");
              break;
            default:
              setGeoStatus("⚠️ GPS Error");
          }
          (window as any).mhsCoords = { lat: 0, lng: 0, status: "Alpa (GPS Error)" };
        },
        { 
          enableHighAccuracy: true,  // Paksa gunakan GPS hardware (bukan WiFi/tower)
          timeout: 15000,            // Tunggu hingga 15 detik
          maximumAge: 0              // Selalu minta posisi baru (tidak pakai cache)
        }
      );
    } else {
      setGeoStatus("⚠️ Browser tidak mendukung GPS");
    }

    return () => {
      // Bersihkan watchPosition saat komponen di-unmount
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Helper: check if geo status allows scanning
  const isGeoBlocked = () => {
    return geoStatus.includes("Luar") || geoStatus.includes("⚠️") || geoStatus.includes("Mengecek");
  };

  const openScanner = () => {
    if (isGeoBlocked()) {
      alert("Akses ditolak! Anda berada di luar radius kampus (150m) atau GPS tidak aktif. Pastikan GPS menyala dan Anda berada di area kampus.");
      return;
    }
    setScannerKey(prev => prev + 1); // Force re-mount QRScanner
    setShowScanner(true);
  };

  const handleScanSuccess = useCallback(async (text: string) => {
    setShowScanner(false);
    setScanResult(text);
    
    try {
      let token = "";
      
      // Parse token from either URL (native camera) or JSON (old format)
      if (text.includes("token=")) {
        const urlParams = new URLSearchParams(text.split('?')[1] || text);
        token = urlParams.get("token") || "";
      } else {
        try {
          const qrData = JSON.parse(text);
          token = qrData.qr_token;
        } catch (e) {
          token = "";
        }
      }

      if (!token) throw new Error("Format QR Code tidak valid atau bukan QR sesi aktif.");

      // Check session details BEFORE attending
      const checkRes = await fetch(`/api/presensi/check?token=${token}`);
      const checkData = await checkRes.json();

      if (!checkRes.ok) throw new Error(checkData.message);

      // Show confirmation modal
      setScannedClass(checkData.sesi);
      setQrToken(token);
      
    } catch (err: any) {
      alert("Gagal memverifikasi QR: " + err.message);
    }
  }, []);

  const confirmAbsensi = async () => {
    if (!qrToken) return;
    setConfirming(true);

    try {
      const coords = (window as any).mhsCoords || { lat: 0, lng: 0, status: "Unknown" };

      const res = await fetch("/api/presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_token: qrToken,
          lat_mhs: coords.lat,
          long_mhs: coords.lng,
          status: coords.status
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Berhasil! " + data.message);
      setScannedClass(null);
      window.location.reload();
    } catch (err: any) {
      alert("Gagal scan: " + err.message);
    } finally {
      setConfirming(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar! Maksimal 2MB.");
      return;
    }

    setUploadingFoto(true);

    try {
      // Kompresi dan convert ke Base64 menggunakan Canvas
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert ke WebP Base64 untuk ukuran super kecil
          const base64String = canvas.toDataURL("image/webp", 0.8);

          // Upload ke server
          const res = await fetch("/api/mahasiswa/profil", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ foto_profil: base64String })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          // Update state
          setUserData({
            ...userData,
            mahasiswa: {
              ...userData.mahasiswa,
              foto_profil: data.foto_profil
            }
          });
          
          alert("Foto profil berhasil diperbarui!");
          setUploadingFoto(false);
        };
      };
    } catch (err: any) {
      alert("Gagal mengupload foto: " + err.message);
      setUploadingFoto(false);
    }
  };

  // Handle native camera scan (URL parameter auto-scan)
  useEffect(() => {
    if (!userData || userData.role !== "MAHASISWA") return;
    
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const token = params.get('token');
    
    if (action === 'scan' && token) {
      // Tunggu sebentar untuk memastikan geolocation terisi
      setTimeout(() => {
        handleScanSuccess(`?token=${token}`);
        // Bersihkan URL dari parameter agar tidak otomatis absen ulang saat refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 1000);
    }
  }, [userData, handleScanSuccess]);



  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    window.location.href = "/login";
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-amber-500 transition-colors duration-300">Memuat...</div>;
  if (!userData || userData.role !== "MAHASISWA") return <div className="min-h-screen bg-background flex items-center justify-center text-red-500">Akses Ditolak</div>;

  const mhs = userData.mahasiswa;
  const history = mhs?.presensi || [];

  // Determine schedule for today
  const hariIniStr = new Date().toLocaleDateString("id-ID", { weekday: "long" });
  const mataKuliahHariIni = mataKuliah.filter(mk => mk.hari?.toLowerCase() === hariIniStr.toLowerCase());
  const mkSekarang = mataKuliahHariIni.length > 0 ? mataKuliahHariIni[0] : null;


  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative flex flex-col lg:flex-row">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 h-screen border-r border-glass-border glass-panel z-20 flex-col items-start rounded-r-[40px] sticky top-0">
        {/* Desktop Header */}
        <div className="flex items-center gap-3 p-8 pb-4 w-full">
          <div className="w-12 h-12 rounded-full dark:bg-white/5 bg-stone-100 dark:bg-white/5 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <img src="/logo-stikom.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-foreground dark:text-white">STIKOM</h1>
            <p className="text-xs text-stone-600 dark:text-stone-300 dark:text-zinc-400">22 Januari</p>
          </div>
        </div>

        <nav className="flex-1 w-full flex flex-col gap-4 px-6 pt-8 overflow-y-auto hide-scrollbar">
          {[
            { icon: Home, label: "Dashboard" },
            { icon: ScanLine, label: "Absensi QR" },
            { icon: ClipboardList, label: "Evaluasi" },
            { icon: Calendar, label: "Jadwal" },
            { icon: User, label: "Profil" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (item.label === "Absensi QR") {
                  openScanner();
                } else {
                  setActiveTab(item.label);
                }
              }}
              className={`flex items-center gap-4 px-4 py-4 rounded-full transition-all duration-300 justify-start shrink-0 ${
                activeTab === item.label
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 glow-amber"
                  : "text-stone-600 dark:text-stone-300 dark:text-zinc-400 hover:text-foreground dark:text-white hover:dark:bg-white/5 hover:bg-stone-100 dark:hover:bg-white/5"
              }`}
            >
              <item.icon size={20} className={activeTab === item.label ? "text-amber-600 dark:text-amber-400" : ""} />
              <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
              {activeTab === item.label && (
                <div className="ml-auto">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="flex px-6 mt-auto pb-8 w-full gap-2 items-center">
          <ThemeToggle />
          <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-4 rounded-full text-stone-600 dark:text-stone-300 dark:text-zinc-400 hover:text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all duration-300 w-full">
            <LogOut size={20} />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-4 glass-panel sticky top-0 z-40 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full dark:bg-white/5 bg-stone-100 dark:bg-white/5 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <img src="/logo-stikom.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wider text-foreground dark:text-white">STIKOM</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleLogout} className="p-2 text-stone-500 hover:text-red-500 bg-stone-100 dark:bg-white/5 rounded-xl">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-glass-border z-50 px-2 py-2 flex justify-around items-center safe-area-pb">
        {[
          { icon: Home, label: "Dashboard" },
          { icon: ScanLine, label: "Absensi QR" },
          { icon: ClipboardList, label: "Evaluasi" },
          { icon: Calendar, label: "Jadwal" },
          { icon: User, label: "Profil" },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => {
              if (item.label === "Absensi QR") {
                openScanner();
              } else {
                setActiveTab(item.label);
              }
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[64px] transition-colors ${
              activeTab === item.label
                ? "text-amber-600 dark:text-amber-400"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            <item.icon size={20} className={activeTab === item.label ? "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : ""} />
            <span className="text-[10px] font-medium leading-none mt-1 max-w-[60px] truncate">
              {item.label === "Absensi QR" ? "QR" : item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 h-auto lg:h-screen overflow-y-auto z-10 pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
          {/* Header */}
          <header className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center glass-panel rounded-3xl md:rounded-full px-6 py-4 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground dark:text-white">Halo, {mhs?.nama || "Mahasiswa"}!</h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 dark:text-zinc-400">NIM: {mhs?.nim || "-"}</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-foreground/80 dark:text-zinc-300 hover:text-amber-600 dark:text-amber-400 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_#ea580c]" />
              </button>
              <div className="w-10 h-10 rounded-full dark:bg-zinc-800 bg-zinc-100 border-2 border-amber-500 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <img 
                  src={mhs?.foto_profil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mhs?.nama_mahasiswa}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </header>

          {/* Bento Grid */}
          {activeTab === "Dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 auto-rows-min animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Status Card (Span 2) */}
              <TiltCard className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/0 border-l-4 border-l-amber-500">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                      <ShieldCheck size={20} />
                      <span className="text-xs font-bold tracking-wider uppercase">Status Mahasiswa</span>
                    </div>
                    <h3 className="text-3xl font-bold text-foreground dark:text-white">Aktif</h3>
                  </div>
                  <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
                    <MapPin size={16} className={geoStatus.includes("Dalam") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} />
                    <span className="text-sm text-foreground/80 dark:text-zinc-300">{geoStatus}</span>
                  </div>
                </div>
                
                <div className="flex gap-8">
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-300 dark:text-zinc-400 mb-1">Semester</p>
                    <p className="text-2xl font-bold text-foreground dark:text-white">{mhs?.semester?.nama_semester || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-300 dark:text-zinc-400 mb-1">Kehadiran (Semester Ini)</p>
                    <p className="text-2xl font-bold text-foreground dark:text-white">{history.length} Kali</p>
                  </div>
                </div>
              </TiltCard>

              {/* Quick Time */}
              <TiltCard className="flex flex-col justify-center items-center text-center bg-gradient-to-br from-white/5 to-white/0">
                <Clock size={40} className="text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                <h4 className="text-lg font-medium text-foreground/80 dark:text-zinc-300">Jadwal Anda Hari Ini</h4>
                <p className="text-2xl font-bold text-foreground dark:text-white mt-2">
                  {mkSekarang ? mkSekarang.nama_mk : "Kosong"}
                </p>
                <p className="text-orange-600 dark:text-orange-400 mt-1 font-medium">
                  {mkSekarang ? `${mkSekarang.waktu} WIB` : "Tidak ada jadwal"}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-zinc-500 mt-1">
                  {mkSekarang ? (mkSekarang.ruangan || "Ruangan Belum Ditentukan") : "-"}
                </p>
              </TiltCard>

              {/* Scan Absensi Card - Main Action */}
              <TiltCard 
                className="md:col-span-2 group border border-amber-500/20 hover:border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent"
                onClick={() => openScanner()}
              >
                <div className="flex justify-between items-center h-full">
                  <div className="space-y-3 md:space-y-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 glow-amber">
                      <ScanLine size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground dark:text-white mb-1 md:mb-2">Scan Absensi Baru</h3>
                      <p className="text-stone-600 dark:text-stone-300 dark:text-zinc-400 max-w-sm text-sm md:text-base">
                        Lakukan scan QR Code pada layar dosen untuk mencatat kehadiran.
                      </p>
                    </div>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-amber-500 flex items-center justify-center text-espresso transform group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(245,158,11,0.6)] shrink-0 ml-4">
                    <ChevronRight size={28} />
                  </div>
                </div>
              </TiltCard>

              {/* Evaluasi Dosen Card */}
              <TiltCard className="group border border-orange-500/20 hover:border-orange-500/50 bg-gradient-to-bl from-orange-500/10 to-transparent" onClick={() => setActiveTab("Evaluasi")}>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-3 md:mb-4 glow-orange">
                      <ClipboardList size={28} />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground dark:text-white mb-1 md:mb-2">Evaluasi Dosen</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-300 dark:text-zinc-400">
                      Isi kuesioner kinerja dosen untuk semester ini.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-6 flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium group-hover:translate-x-2 transition-transform">
                    Mulai Evaluasi <ChevronRight size={18} />
                  </div>
                </div>
              </TiltCard>
            </div>
          )}

          {activeTab === "Dashboard" && (
            <TiltCard className="md:col-span-3 mt-6">
              <h3 className="text-lg font-bold text-foreground dark:text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-amber-500" size={20} />
                Riwayat Absensi Terakhir
              </h3>
              <div className="space-y-4">
                {history.length > 0 ? history.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl dark:bg-white/5 bg-stone-100 dark:bg-white/5 border dark:border-white/5 border-stone-200 dark:border-white/5 hover:dark:bg-white/10 bg-black/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${item.status === "Hadir" ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`} />
                      <div>
                        <p className="font-bold text-foreground dark:text-white">{item.dosen?.nama_dosen || item.nidn}</p>
                        <p className="text-xs text-stone-600 dark:text-stone-300 dark:text-zinc-400">
                          {item.mata_kuliah?.nama_mk ? <span className="font-semibold text-amber-600 dark:text-amber-500">{item.mata_kuliah.nama_mk} {" • "} </span> : ""}
                          {new Date(item.waktu_absen).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${item.status === "Hadir" ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20" : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20"}`}>
                      {item.status.toUpperCase()}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-stone-500 dark:text-stone-400 dark:text-stone-500">Belum ada riwayat absensi.</div>
                )}
              </div>
            </TiltCard>
          )}

          {activeTab === "Evaluasi" && (
            <TiltCard className="w-full bg-gradient-to-br from-[#0a0604] to-[#050301] border border-orange-500/30 animate-in fade-in zoom-in-95 duration-500 p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
              <ClipboardList size={64} className="text-stone-800 mb-6 drop-shadow-[0_0_20px_rgba(234,88,12,0.2)]" />
              <h2 className="text-3xl font-black text-foreground dark:text-white mb-4">Sistem Evaluasi Dosen</h2>
              <p className="text-foreground/70 dark:text-stone-400 max-w-lg mb-8 leading-relaxed">Saat ini tidak ada kuesioner aktif yang wajib diisi. Silakan cek kembali pada akhir semester menjelang Ujian Akhir Semester (UAS).</p>
              <button onClick={() => setActiveTab("Dashboard")} className="px-6 py-3 rounded-full dark:bg-stone-900 bg-stone-100 border dark:border-stone-800 border-stone-200 hover:border-orange-500/50 text-foreground dark:text-white font-bold transition-colors">
                Kembali ke Dashboard
              </button>
            </TiltCard>
          )}

          {activeTab === "Jadwal" && (
            <TiltCard className="w-full border dark:border-stone-800 border-stone-200 animate-in fade-in zoom-in-95 duration-500">
               <h2 className="text-2xl font-bold text-foreground dark:text-white mb-6">Mata Kuliah Tersedia</h2>
               <div className="space-y-4">
                 {mataKuliah.length > 0 ? mataKuliah.map((mk: any, i: number) => (
                   <div key={i} className="p-6 rounded-2xl dark:bg-white/5 bg-stone-100 dark:bg-white/5 border-l-4 border-l-amber-500 flex justify-between items-center hover:dark:bg-white/10 bg-black/10 transition-colors">
                      <div>
                        <h4 className="font-bold text-xl text-foreground dark:text-white">{mk.nama_mk}</h4>
                        <p className="text-foreground/70 dark:text-stone-400 font-mono mt-1 text-sm">{mk.kode_mk} • {mk.sks} SKS</p>
                        <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500 mt-1">{mk.dosen?.nama_dosen || "Belum ada Dosen"}</p>
                      </div>
                      <div className="text-right">
                         <p className="font-bold text-amber-500">{mk.hari ? `${mk.hari}, ${mk.waktu}` : "Jadwal Belum Ada"}</p>
                         <p className="text-sm text-foreground/70 dark:text-stone-400 mt-1">{mk.ruangan || "Ruangan Belum Ada"}</p>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-6 text-stone-500 dark:text-stone-400 dark:text-stone-500">Belum ada data mata kuliah.</div>
                 )}
               </div>
            </TiltCard>
          )}

          {activeTab === "Profil" && (
            <TiltCard className="w-full border dark:border-stone-800 border-stone-200 animate-in fade-in zoom-in-95 duration-500 bg-gradient-to-br from-white/5 to-transparent">
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start p-4">
                 
                 {/* Area Upload Foto */}
                 <div className="relative group shrink-0">
                   <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full dark:bg-stone-900 bg-stone-100 border-4 border-amber-500 overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.4)] ${uploadingFoto ? "opacity-50" : ""}`}>
                      <img 
                        src={mhs?.foto_profil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mhs?.nama_mahasiswa}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                   </div>
                   
                   {/* Tombol Overlay Upload */}
                   <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm border-4 border-transparent">
                     {uploadingFoto ? (
                       <span className="text-white font-bold text-xs animate-pulse">Menyimpan...</span>
                     ) : (
                       <>
                         <Camera className="text-white mb-1" size={24} />
                         <span className="text-white text-[10px] font-bold tracking-wider uppercase">Ubah Foto</span>
                       </>
                     )}
                     <input 
                       type="file" 
                       accept="image/png, image/jpeg, image/jpg, image/webp" 
                       className="hidden" 
                       onChange={handleFileUpload}
                       disabled={uploadingFoto}
                     />
                   </label>
                 </div>

                 {/* Detail Mahasiswa */}
                 <div className="space-y-4 text-center md:text-left flex-1 w-full">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-foreground dark:text-white">{mhs?.nama_mahasiswa}</h2>
                      <p className="text-xl text-amber-500 font-bold mt-1 tracking-wider">{mhs?.nim}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                       <div className="dark:bg-black/40 bg-white/50 p-4 rounded-2xl border dark:border-white/5 border-stone-200 col-span-2 shadow-sm">
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-widest mb-1">Program Studi</p>
                          <p className="text-foreground dark:text-white font-bold text-lg">{mhs?.jurusan?.nama_jurusan || "Belum diatur"}</p>
                       </div>
                       
                       <div className="dark:bg-black/40 bg-white/50 p-4 rounded-2xl border dark:border-white/5 border-stone-200 col-span-2 shadow-sm">
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-widest mb-1">Semester Saat Ini</p>
                          <p className="text-foreground dark:text-white font-bold text-lg">{mhs?.semester?.nama_semester || "Belum diatur"}</p>
                       </div>

                       <div className="dark:bg-black/40 bg-white/50 p-4 rounded-2xl border dark:border-white/5 border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-widest mb-1">Matkul Reguler</p>
                          <p className="text-amber-600 dark:text-amber-500 font-black text-3xl">{mataKuliah.length}</p>
                       </div>

                       <div className="dark:bg-black/40 bg-white/50 p-4 rounded-2xl border dark:border-white/5 border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-widest mb-1">Persentase Hadir</p>
                          <p className="text-green-600 dark:text-green-500 font-black text-3xl">
                             {mataKuliah.length > 0 ? Math.min(100, Math.round(((userData?.mahasiswa?.presensi?.length || 0) / (mataKuliah.length * 16)) * 100)) : 0}%
                          </p>
                       </div>
                       
                       <div className="dark:bg-green-500/10 bg-green-100 p-4 rounded-2xl border dark:border-green-500/20 border-green-200 col-span-2 shadow-sm flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                            <CheckCircle2 size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] text-green-700 dark:text-green-400 uppercase font-bold tracking-widest mb-1">Status Mahasiswa</p>
                            <p className="text-green-800 dark:text-green-300 font-bold text-lg">Terdaftar Aktif</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </TiltCard>
          )}
        </div>
      </main>

      {/* Modal Scanner QR */}
      {showScanner && !scannedClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-background border border-amber-500/30 rounded-3xl p-6 w-full max-w-md relative shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowScanner(false)}
              className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full dark:bg-stone-800 bg-stone-200 text-foreground/80 dark:text-stone-300 hover:text-foreground dark:text-white hover:bg-stone-700 active:scale-95 transition-all z-10"
            >
              <XCircle size={24} />
            </button>
            <h3 className="text-xl font-bold text-amber-500 mb-4 text-center">Scan QR Dosen</h3>
            <QRScanner key={scannerKey} onScanSuccess={handleScanSuccess} />
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Absensi */}
      {scannedClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-background border border-amber-500/50 rounded-3xl p-8 w-full max-w-md relative shadow-[0_0_100px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-500 glow-amber">
                <CheckCircle2 size={40} />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-center mb-2">Konfirmasi Kehadiran</h3>
            <p className="text-center text-stone-500 dark:text-stone-400 mb-8 text-sm">QR Code berhasil dibaca. Pastikan detail kelas di bawah ini sudah sesuai sebelum Anda menekan tombol konfirmasi.</p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-stone-100 dark:bg-black/50 p-4 rounded-2xl border border-stone-200 dark:border-white/5 flex items-start gap-4">
                <BookOpen size={24} className="text-amber-500 shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Mata Kuliah</p>
                  <p className="font-black text-lg text-foreground dark:text-white">{scannedClass.nama_mk}</p>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-500">{scannedClass.kode_mk} • {scannedClass.sks} SKS</p>
                </div>
              </div>

              <div className="bg-stone-100 dark:bg-black/50 p-4 rounded-2xl border border-stone-200 dark:border-white/5 flex items-start gap-4">
                <User size={24} className="text-orange-500 shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Dosen Pengampu</p>
                  <p className="font-bold text-foreground dark:text-white">{scannedClass.dosen}</p>
                </div>
              </div>

              <div className="bg-stone-100 dark:bg-black/50 p-4 rounded-2xl border border-stone-200 dark:border-white/5 flex items-start gap-4">
                <MapPin size={24} className={geoStatus.includes("Dalam") ? "text-green-500 shrink-0 mt-1" : "text-red-500 shrink-0 mt-1"} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Lokasi Anda (GPS)</p>
                  <p className={`font-bold ${geoStatus.includes("Dalam") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{geoStatus}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmAbsensi}
                disabled={confirming}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2"
              >
                {confirming ? "Mencatat..." : "Hadir Sekarang"}
              </button>
              <button 
                onClick={() => { setScannedClass(null); setQrToken(""); }}
                disabled={confirming}
                className="w-full py-4 rounded-xl bg-stone-200 dark:bg-white/5 text-stone-700 dark:text-white font-bold hover:bg-stone-300 dark:hover:bg-white/10 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

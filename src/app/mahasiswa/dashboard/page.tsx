"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  XCircle
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
  const [isMobile, setIsMobile] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={isMobile ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`glass-panel rounded-3xl p-5 md:p-6 relative group transition-all duration-300 ${onClick ? "cursor-pointer active:scale-[0.98]" : ""} ${className}`}
    >
      <div
        style={isMobile ? {} : { transform: "translateZ(30px)" }}
        className="w-full h-full relative z-10"
      >
        {children}
      </div>
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
    </motion.div>
  );
};

export default function MahasiswaDashboard() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [geoStatus, setGeoStatus] = useState("Mengecek...");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [mataKuliah, setMataKuliah] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    
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

    // Fetch Mata Kuliah for Jadwal
    fetch(`/api/admin/matakuliah?t=${Date.now()}`)
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
      window.removeEventListener("mousemove", handleMouseMove);
      // Bersihkan watchPosition saat komponen di-unmount
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const handleScanSuccess = async (text: string) => {
    setShowScanner(false);
    setScanResult(text);
    
    try {
      const qrData = JSON.parse(text);
      if (!qrData.qr_token) throw new Error("Format QR Code tidak valid atau bukan QR sesi aktif.");

      const coords = (window as any).mhsCoords || { lat: 0, lng: 0, status: "Unknown" };

      const res = await fetch("/api/presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_token: qrData.qr_token,
          lat_mhs: coords.lat,
          long_mhs: coords.lng,
          status: coords.status
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Berhasil! " + data.message);
      window.location.reload(); // Refresh to get updated history
    } catch (err: any) {
      alert("Gagal scan: " + err.message);
    }
  };



  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    window.location.href = "/login";
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-amber-500 transition-colors duration-300">Memuat...</div>;
  if (!userData || userData.role !== "MAHASISWA") return <div className="min-h-screen bg-background flex items-center justify-center text-red-500">Akses Ditolak</div>;

  const mhs = userData.mahasiswa;
  const history = mhs?.presensi || [];


  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative flex flex-col lg:flex-row">
      {/* Global Parallax Background */}
      <motion.div
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        animate={{
          x: mousePosition.x * -0.02,
          y: mousePosition.y * -0.02,
        }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
      >
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/20 rounded-full blur-[120px]" />
      </motion.div>

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
                  if (geoStatus.includes("Luar") || geoStatus.includes("GPS") || geoStatus.includes("⚠️")) {
                    alert("Akses ditolak! Anda berada di luar radius kampus (150m) atau GPS tidak aktif. Pastikan GPS menyala dan Anda berada di area kampus.");
                    return;
                  }
                  setShowScanner(true);
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
                <motion.div layoutId="active-nav-mhs" className="ml-auto">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
                </motion.div>
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
                if (geoStatus.includes("Luar") || geoStatus.includes("GPS") || geoStatus.includes("⚠️")) {
                  alert("Akses ditolak! Anda berada di luar radius kampus (150m) atau GPS tidak aktif. Pastikan GPS menyala dan Anda berada di area kampus.");
                  return;
                }
                setShowScanner(true);
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
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mhs?.nama}`} alt="Profile" />
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
              <TiltCard className="flex flex-col justify-center items-center text-center">
                <Clock size={40} className="text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                <h4 className="text-lg font-medium text-foreground/80 dark:text-zinc-300">Mata Kuliah Tersedia</h4>
                <p className="text-2xl font-bold text-foreground dark:text-white mt-2">{mataKuliah.length > 0 ? (mataKuliah[0] as any).nama_mk : "Belum Ada"}</p>
                <p className="text-orange-600 dark:text-orange-400 mt-1 font-medium">{mataKuliah.length > 0 && (mataKuliah[0] as any).hari ? `${(mataKuliah[0] as any).hari}, ${(mataKuliah[0] as any).waktu}` : "-"}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-zinc-500 mt-1">{mataKuliah.length > 0 ? ((mataKuliah[0] as any).ruangan || "Ruangan Belum Ditentukan") : "-"}</p>
              </TiltCard>

              {/* Scan Absensi Card - Main Action */}
              <TiltCard 
                className="md:col-span-2 group border border-amber-500/20 hover:border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent"
                onClick={() => {
                  if (geoStatus.includes("Luar") || geoStatus.includes("Mati")) {
                    alert("Akses ditolak! Anda berada di luar radius aman kampus (50m) atau GPS tidak aktif.");
                    return;
                  }
                  setShowScanner(true);
                }}
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
                        <p className="text-xs text-stone-600 dark:text-stone-300 dark:text-zinc-400">{new Date(item.waktu_absen).toLocaleString("id-ID")}</p>
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
            <TiltCard className="w-full border dark:border-stone-800 border-stone-200 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start p-4">
                 <div className="w-32 h-32 rounded-full dark:bg-stone-900 bg-stone-100 border-4 border-amber-500 overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.4)] shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mhs?.nama_mahasiswa}`} alt="Profile" className="w-full h-full object-cover" />
                 </div>
                 <div className="space-y-4 text-center md:text-left flex-1">
                    <div>
                      <h2 className="text-4xl font-black text-foreground dark:text-white">{mhs?.nama_mahasiswa}</h2>
                      <p className="text-xl text-amber-500 font-medium mt-1">NIM: {mhs?.nim}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                       <div className="dark:bg-stone-900 bg-stone-100/50 p-4 rounded-xl border dark:border-stone-800 border-stone-200">
                          <p className="text-xs text-stone-500 dark:text-stone-400 dark:text-stone-500 uppercase font-bold tracking-wider mb-1">Program Studi</p>
                          <p className="text-foreground dark:text-white font-medium">S1 Sistem Informasi</p>
                       </div>
                       <div className="dark:bg-stone-900 bg-stone-100/50 p-4 rounded-xl border dark:border-stone-800 border-stone-200">
                          <p className="text-xs text-stone-500 dark:text-stone-400 dark:text-stone-500 uppercase font-bold tracking-wider mb-1">Status Mahasiswa</p>
                          <p className="text-green-600 dark:text-green-400 font-medium">Terdaftar Aktif</p>
                       </div>
                    </div>

                 </div>
              </div>
            </TiltCard>
          )}
        </div>
      </main>

      {/* Modal Scanner QR */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-black/80 bg-black/20 backdrop-blur-md p-4">
          <div className="bg-background border border-amber-500/30 rounded-3xl p-6 w-full max-w-md relative shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <button 
              onClick={() => setShowScanner(false)}
              className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full dark:bg-stone-800 bg-stone-200 text-foreground/80 dark:text-stone-300 hover:text-foreground dark:text-white hover:bg-stone-700 active:scale-95 transition-all z-10"
            >
              <XCircle size={24} />
            </button>
            <h3 className="text-xl font-bold text-amber-500 mb-4 text-center">Scan QR Dosen</h3>
            <QRScanner onScanSuccess={handleScanSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}

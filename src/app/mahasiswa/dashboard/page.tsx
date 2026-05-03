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


const TiltCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`glass-panel rounded-3xl p-6 relative group transition-all duration-300 ${className}`}
    >
      <div
        style={{ transform: "translateZ(30px)" }}
        className="w-full h-full relative z-10"
      >
        {children}
      </div>
      
      {/* Glow effect on hover */}
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    
    // Fetch user data
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if(data.user) setUserData(data.user);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Check Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const mhsLat = position.coords.latitude;
          const mhsLng = position.coords.longitude;
          
          // Koordinat Asli STIKOM 22 Januari Kendari
          const kampusLat = -3.9987867;
          const kampusLng = 122.5177898;
          
          // Radius toleransi dalam meter (misal: 100 meter dari titik tengah kampus)
          const radiusMaksimal = 100;

          // Rumus Haversine untuk menghitung jarak antara 2 titik GPS di bumi
          const R = 6371e3; // Radius bumi dalam meter
          const φ1 = mhsLat * Math.PI/180; // φ, λ dalam radian
          const φ2 = kampusLat * Math.PI/180;
          const Δφ = (kampusLat-mhsLat) * Math.PI/180;
          const Δλ = (kampusLng-mhsLng) * Math.PI/180;

          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

          const jarak = Math.round(R * c); // Jarak dalam meter
          const isDalamRadius = jarak <= radiusMaksimal;

          if (isDalamRadius) {
            setGeoStatus(`Dalam Kampus (Jarak: ${jarak}m)`);
          } else {
            setGeoStatus(`Luar Area (Jarak: ${jarak}m)`);
          }
          
          // Simpan koordinat di window object agar bisa diakses saat scan
          (window as any).mhsCoords = {
            lat: mhsLat,
            lng: mhsLng,
            status: isDalamRadius ? "Hadir" : "Di Luar Radius"
          };
        },
        (error) => {
          setGeoStatus("GPS Mati / Ditolak");
          (window as any).mhsCoords = { lat: 0, lng: 0, status: "Alpa (GPS Mati)" };
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleScanSuccess = async (text: string) => {
    setShowScanner(false);
    setScanResult(text);
    
    try {
      const qrData = JSON.parse(text);
      if (!qrData.nidn) throw new Error("Format QR Code tidak valid");

      const coords = (window as any).mhsCoords || { lat: 0, lng: 0, status: "Unknown" };

      const res = await fetch("/api/presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nidn: qrData.nidn,
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

  if (loading) return <div className="min-h-screen bg-[#050301] flex items-center justify-center text-amber-500">Memuat...</div>;
  if (!userData || userData.role !== "MAHASISWA") return <div className="min-h-screen bg-[#050301] flex items-center justify-center text-red-500">Akses Ditolak</div>;

  const mhs = userData.mahasiswa;
  const history = mhs?.presensi || [];


  return (
    <div className="min-h-screen bg-espresso text-foreground overflow-x-hidden relative flex flex-col lg:flex-row">
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

      {/* Sidebar / Topnav on Mobile */}
      <aside className="w-full lg:w-64 lg:h-screen border-b lg:border-b-0 lg:border-r border-glass-border glass-panel z-20 flex flex-row lg:flex-col items-center lg:items-start py-4 lg:py-8 px-4 lg:px-0 lg:rounded-r-[40px] sticky top-0 overflow-x-auto gap-4 lg:gap-0">
        <div className="flex items-center gap-3 lg:px-8 lg:mb-12 shrink-0">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            S
          </div>
          <div className="hidden lg:block">
            <h1 className="font-bold text-lg tracking-wider text-white">STIKOM</h1>
            <p className="text-xs text-zinc-400">22 Januari</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-row lg:flex-col gap-2 lg:gap-4 lg:px-6 overflow-x-auto hide-scrollbar">

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
                setActiveTab(item.label);
                if (item.label === "Absensi QR") setShowScanner(true);
              }}
              className={`flex items-center gap-4 px-4 py-4 rounded-full transition-all duration-300 ${
                activeTab === item.label
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 glow-amber"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={22} className={activeTab === item.label ? "text-amber-400" : ""} />
              <span className="hidden lg:block font-medium">{item.label}</span>
              {activeTab === item.label && (
                <motion.div layoutId="active-nav" className="hidden lg:block ml-auto">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="lg:px-6 lg:mt-auto shrink-0">
          <button onClick={handleLogout} className="flex items-center gap-2 lg:gap-4 px-4 py-3 lg:py-4 rounded-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 w-full">
            <LogOut size={20} />
            <span className="hidden lg:block font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 h-auto lg:h-screen overflow-y-auto z-10 pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
          {/* Header */}
          <header className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center glass-panel rounded-3xl md:rounded-full px-6 py-4 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Halo, {mhs?.nama || "Mahasiswa"}!</h2>
              <p className="text-sm text-zinc-400">NIM: {mhs?.nim || "-"}</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-zinc-300 hover:text-amber-400 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_#ea580c]" />
              </button>
              <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-amber-500 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.3)]">
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
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <ShieldCheck size={20} />
                      <span className="text-xs font-bold tracking-wider uppercase">Status Mahasiswa</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">Aktif</h3>
                  </div>
                  <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
                    <MapPin size={16} className={geoStatus.includes("Dalam") ? "text-green-400" : "text-red-400"} />
                    <span className="text-sm text-zinc-300">{geoStatus}</span>
                  </div>
                </div>
                
                <div className="flex gap-8">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">IPK Saat Ini</p>
                    <p className="text-2xl font-bold text-white">3.85</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Kehadiran (Semester Ini)</p>
                    <p className="text-2xl font-bold text-white">{history.length} Kali</p>
                  </div>
                </div>
              </TiltCard>

              {/* Quick Time */}
              <TiltCard className="flex flex-col justify-center items-center text-center">
                <Clock size={40} className="text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                <h4 className="text-lg font-medium text-zinc-300">Jadwal Selanjutnya</h4>
                <p className="text-2xl font-bold text-white mt-2">Pemrograman Web</p>
                <p className="text-orange-400 mt-1 font-medium">10:00 - 12:30 WITA</p>
                <p className="text-sm text-zinc-500 mt-1">Ruang Lab Komputer 1</p>
              </TiltCard>

              {/* Scan Absensi Card - Main Action */}
              <TiltCard 
                className="md:col-span-2 group cursor-pointer border border-amber-500/20 hover:border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent"
              >
                <div onClick={() => setShowScanner(true)} className="flex justify-between items-center h-full">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 glow-amber">
                      <ScanLine size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Scan Absensi Baru</h3>
                      <p className="text-zinc-400 max-w-sm">
                        Lakukan scan QR Code pada layar dosen untuk mencatat kehadiran.
                      </p>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-espresso transform group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                    <ChevronRight size={32} />
                  </div>
                </div>
              </TiltCard>

              {/* Evaluasi Dosen Card */}
              <TiltCard className="cursor-pointer group border border-orange-500/20 hover:border-orange-500/50 bg-gradient-to-bl from-orange-500/10 to-transparent">
                <div onClick={() => setActiveTab("Evaluasi")} className="flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4 glow-orange">
                      <ClipboardList size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Evaluasi Dosen</h3>
                    <p className="text-sm text-zinc-400">
                      Isi kuesioner kinerja dosen untuk semester ini.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-orange-400 font-medium group-hover:translate-x-2 transition-transform">
                    Mulai Evaluasi <ChevronRight size={18} />
                  </div>
                </div>
              </TiltCard>
            </div>
          )}

          {activeTab === "Dashboard" && (
            <TiltCard className="md:col-span-3 mt-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-amber-500" size={20} />
                Riwayat Absensi Terakhir
              </h3>
              <div className="space-y-4">
                {history.length > 0 ? history.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${item.status === "Hadir" ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`} />
                      <div>
                        <p className="font-bold text-white">{item.dosen?.nama_dosen || item.nidn}</p>
                        <p className="text-xs text-zinc-400">{new Date(item.waktu_absen).toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${item.status === "Hadir" ? "bg-green-500/20 text-green-400 border-green-500/20" : "bg-red-500/20 text-red-400 border-red-500/20"}`}>
                      {item.status.toUpperCase()}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-stone-500">Belum ada riwayat absensi.</div>
                )}
              </div>
            </TiltCard>
          )}

          {activeTab === "Evaluasi" && (
            <TiltCard className="w-full bg-gradient-to-br from-[#0a0604] to-[#050301] border border-orange-500/30 animate-in fade-in zoom-in-95 duration-500 p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
              <ClipboardList size={64} className="text-stone-800 mb-6 drop-shadow-[0_0_20px_rgba(234,88,12,0.2)]" />
              <h2 className="text-3xl font-black text-white mb-4">Sistem Evaluasi Dosen</h2>
              <p className="text-stone-400 max-w-lg mb-8 leading-relaxed">Saat ini tidak ada kuesioner aktif yang wajib diisi. Silakan cek kembali pada akhir semester menjelang Ujian Akhir Semester (UAS).</p>
              <button onClick={() => setActiveTab("Dashboard")} className="px-6 py-3 rounded-full bg-stone-900 border border-stone-800 hover:border-orange-500/50 text-white font-bold transition-colors">
                Kembali ke Dashboard
              </button>
            </TiltCard>
          )}

          {activeTab === "Jadwal" && (
            <TiltCard className="w-full border border-stone-800 animate-in fade-in zoom-in-95 duration-500">
               <h2 className="text-2xl font-bold text-white mb-6">Jadwal Kuliah Anda</h2>
               <div className="space-y-4">
                 <div className="p-6 rounded-2xl bg-white/5 border-l-4 border-l-amber-500 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xl text-white">Pemrograman Web</h4>
                      <p className="text-stone-400">Dr. Arba Hariyanto, M.Kom</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-amber-500">10:00 - 12:30 WITA</p>
                       <p className="text-sm text-stone-400">Lab Komputer 1</p>
                    </div>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/5 border-l-4 border-l-orange-500 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xl text-white">Sistem Basis Data</h4>
                      <p className="text-stone-400">Ir. Budi Santoso, MT</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-orange-500">13:30 - 15:00 WITA</p>
                       <p className="text-sm text-stone-400">Ruang Kelas A3</p>
                    </div>
                 </div>
               </div>
            </TiltCard>
          )}

          {activeTab === "Profil" && (
            <TiltCard className="w-full border border-stone-800 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start p-4">
                 <div className="w-32 h-32 rounded-full bg-stone-900 border-4 border-amber-500 overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.4)] shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mhs?.nama_mahasiswa}`} alt="Profile" className="w-full h-full object-cover" />
                 </div>
                 <div className="space-y-4 text-center md:text-left flex-1">
                    <div>
                      <h2 className="text-4xl font-black text-white">{mhs?.nama_mahasiswa}</h2>
                      <p className="text-xl text-amber-500 font-medium mt-1">NIM: {mhs?.nim}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                       <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                          <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Program Studi</p>
                          <p className="text-white font-medium">S1 Teknik Informatika</p>
                       </div>
                       <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                          <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Status Mahasiswa</p>
                          <p className="text-green-400 font-medium">Terdaftar Aktif</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0a0502] border border-amber-500/30 rounded-3xl p-6 w-full max-w-md relative shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <button 
              onClick={() => setShowScanner(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-white"
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

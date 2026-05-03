"use client";

import React, { useState, useEffect } from "react";
import { QrCode, BookOpen, LogOut, ChevronRight, Users, CheckCircle2, Home, User, Calendar, ShieldCheck, MapPin, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

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
      style={isMobile ? {} : { rotateY, rotateX, transformStyle: "preserve-3d" }}
      className={`glass-card p-5 md:p-6 lg:p-8 rounded-3xl ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
    >
      <div style={isMobile ? {} : { transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default function DosenDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  
  // Sesi & MK states
  const [mataKuliahList, setMataKuliahList] = useState<any[]>([]);
  const [selectedMk, setSelectedMk] = useState("");
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const fetchUserData = () => {
    fetch(`/api/auth/me?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUserData(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchMataKuliah = () => {
    fetch(`/api/admin/matakuliah?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) setMataKuliahList(data.data);
      });
  };

  const fetchActiveSession = () => {
    if (!userData?.dosen?.nidn) return;
    fetch(`/api/sesi?nidn=${userData.dosen.nidn}&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setActiveSession(data.sesi || null);
      });
  };

  useEffect(() => {
    fetchUserData();
    fetchMataKuliah();
  }, []);

  useEffect(() => {
    if (userData?.dosen?.nidn) {
      fetchActiveSession();
    }
  }, [userData]);

  // Polling sesi aktif setiap 5 detik agar data kehadiran terupdate real-time
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      fetchActiveSession();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeSession, userData]);

  const handleBukaSesi = async () => {
    if (!selectedMk) return alert("Pilih mata kuliah terlebih dahulu!");
    setIsCreatingSession(true);
    
    try {
      const res = await fetch("/api/sesi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_mk: selectedMk })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSession(data.sesi);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleTutupSesi = async () => {
    if (!activeSession) return;
    try {
      await fetch("/api/sesi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sesi: activeSession.id_sesi })
      });
      setActiveSession(null);
      setActiveTab("Dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen bg-[#050301] flex items-center justify-center text-orange-500">Memuat...</div>;
  if (!userData || userData.role !== "DOSEN") return <div className="min-h-screen bg-[#050301] flex items-center justify-center text-red-500">Akses Ditolak</div>;

  const dosen = userData.dosen;
  const history = activeSession?.presensi || [];
  
  return (
    <div className="min-h-screen bg-[#050301] text-white flex flex-col md:flex-row font-sans selection:bg-orange-500/30 overflow-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-amber-700/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      </div>

      <aside className="w-full md:w-[320px] lg:w-[340px] border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col h-auto md:h-screen sticky top-0 bg-[#050301]/80 backdrop-blur-xl z-50">
        <div className="mb-10 lg:mb-16 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(249,115,22,0.4)]">D</div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Portal Dosen</h2>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-bold">STIKOM 22 Januari</p>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-row lg:flex-col gap-1 md:gap-2 lg:gap-4 lg:px-6 overflow-x-auto hide-scrollbar">
          {[
            { icon: Home, label: "Dashboard" },
            { icon: QrCode, label: "Sesi Kelas" },
            { icon: BookOpen, label: "Hasil Evaluasi" },
            { icon: Calendar, label: "Jadwal Mengajar" },
            { icon: User, label: "Profil" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(item.label)}
              className={`flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 md:py-4 rounded-2xl md:rounded-full transition-all duration-300 min-h-[48px] min-w-[48px] justify-center md:justify-start shrink-0 ${
                activeTab === item.label
                  ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 glow-orange"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={22} className={activeTab === item.label ? "text-orange-400" : ""} />
              <span className="hidden lg:block font-medium text-sm">{item.label}</span>
              {activeTab === item.label && (
                <motion.div layoutId="active-nav-dosen" className="hidden lg:block ml-auto">
                  <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_#f97316]" />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="lg:px-6 lg:mt-auto shrink-0 mt-4 md:mt-0">
          <button onClick={handleLogout} className="flex items-center gap-2 lg:gap-4 px-4 py-3 lg:py-4 rounded-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 w-full min-h-[48px]">
            <LogOut size={20} />
            <span className="hidden lg:block font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 relative overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <header className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-6 rounded-3xl z-10 relative border border-white/5">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">Selamat Datang, {dosen.nama_dosen}</h1>
              <p className="text-zinc-400 mt-2">NIDN: {dosen.nidn}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white relative">
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500 glow-orange" />
                <BookOpen size={20} />
              </button>
              <div className="w-16 h-16 rounded-full bg-stone-900 border-2 border-orange-500 overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${dosen.nama_dosen}`} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </header>

          {activeTab === "Dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 auto-rows-min animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
              
              <TiltCard className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/0 border-l-4 border-l-orange-500">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-orange-400 mb-2">
                      <ShieldCheck size={20} />
                      <span className="text-xs font-bold tracking-wider uppercase">Status Dosen</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">Aktif Mengajar</h3>
                  </div>
                  <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
                    <MapPin size={16} className="text-green-400" />
                    <span className="text-sm text-zinc-300">Sistem Online</span>
                  </div>
                </div>
                
                <div className="flex gap-8">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Mata Kuliah Diampu</p>
                    <p className="text-2xl font-bold text-white">{mataKuliahList.length} MK</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Status Sesi Saat Ini</p>
                    <p className={`text-2xl font-bold ${activeSession ? "text-green-400" : "text-stone-500"}`}>
                      {activeSession ? "Sesi Terbuka" : "Tidak Ada"}
                    </p>
                  </div>
                </div>
              </TiltCard>

              <TiltCard className="flex flex-col justify-center items-center text-center">
                <Clock size={40} className="text-orange-500 mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                <h4 className="text-lg font-medium text-zinc-300">Waktu Sistem</h4>
                <p className="text-2xl font-bold text-white mt-2">{new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                <p className="text-amber-400 mt-1 font-medium">{new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </TiltCard>

              <TiltCard 
                className={`md:col-span-2 group border transition-all duration-300 ${activeSession ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-transparent" : "border-orange-500/20 hover:border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-transparent"}`}
                onClick={() => setActiveTab("Sesi Kelas")}
              >
                <div className="flex justify-between items-center h-full">
                  <div className="space-y-3 md:space-y-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center ${activeSession ? "bg-green-500/20 text-green-400 glow-green" : "bg-orange-500/20 text-orange-400 glow-orange"}`}>
                      <QrCode size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{activeSession ? "Sesi Sedang Berjalan" : "Buka Sesi Absensi Baru"}</h3>
                      <p className="text-zinc-400 max-w-sm text-sm md:text-base">
                        {activeSession ? `Mata Kuliah: ${activeSession.nama_mk}. Klik untuk melihat barcode dan kehadiran.` : "Pilih mata kuliah dan generate QR Code dinamis untuk discan mahasiswa."}
                      </p>
                    </div>
                  </div>
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black transform group-hover:scale-110 transition-transform shrink-0 ml-4 ${activeSession ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-[0_0_30px_rgba(34,197,94,0.6)]" : "bg-gradient-to-br from-orange-500 to-amber-500 shadow-[0_0_30px_rgba(249,115,22,0.6)]"}`}>
                    <ChevronRight size={28} />
                  </div>
                </div>
              </TiltCard>

              <TiltCard className="group border border-amber-500/20 hover:border-amber-500/50 bg-gradient-to-bl from-amber-500/10 to-transparent" onClick={() => setActiveTab("Hasil Evaluasi")}>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-3 md:mb-4 glow-amber">
                      <BookOpen size={28} />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">Lihat Hasil Evaluasi</h3>
                    <p className="text-sm text-zinc-400">
                      Cek penilaian kinerja Anda dari mahasiswa.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-6 flex items-center gap-2 text-amber-400 font-medium group-hover:translate-x-2 transition-transform">
                    Buka Laporan <ChevronRight size={18} />
                  </div>
                </div>
              </TiltCard>
            </div>
          )}

          {activeTab === "Sesi Kelas" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
              <TiltCard className="lg:col-span-5 h-full">
                <div className="bg-[#0f0a07]/50 rounded-[2rem] p-4 text-center relative overflow-hidden h-full flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-[50px]"></div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Manajemen Sesi Kelas</h3>
                  <p className="text-sm text-stone-400 mb-8 relative z-10">
                    {activeSession ? `Sesi aktif: ${activeSession.nama_mk}. Sesi ini akan tertutup otomatis setelah 20 menit.` : "Silakan pilih mata kuliah untuk membuka sesi kehadiran baru."}
                  </p>
                  
                  {!activeSession ? (
                    <div className="space-y-4">
                      <div className="text-left">
                        <label className="text-sm text-stone-400 mb-2 block font-medium">Pilih Mata Kuliah</label>
                        <select 
                          className="w-full bg-[#1a110b] border border-orange-500/30 text-white rounded-xl px-4 py-4 outline-none focus:border-orange-500 transition-colors"
                          value={selectedMk}
                          onChange={(e) => setSelectedMk(e.target.value)}
                        >
                          <option value="">-- Pilih Mata Kuliah --</option>
                          {mataKuliahList.map((mk: any) => (
                            <option key={mk.kode_mk} value={mk.nama_mk}>{mk.nama_mk}</option>
                          ))}
                        </select>
                      </div>
                      
                      <button 
                        onClick={handleBukaSesi}
                        disabled={isCreatingSession || !selectedMk}
                        className="w-full relative group overflow-hidden px-6 md:px-8 py-5 rounded-2xl font-black text-base md:text-lg transition-all active:scale-[0.97] hover:scale-[1.02] shadow-[0_0_30px_rgba(249,115,22,0.3)] bg-gradient-to-r from-orange-500 to-amber-500 text-black disabled:opacity-50 disabled:hover:scale-100 min-h-[56px] mt-4"
                      >
                        <span className="relative flex items-center justify-center gap-3">
                          {isCreatingSession ? "Membuka Sesi..." : "Generate Barcode Sesi Baru"} <ChevronRight className="transition-transform" />
                        </span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={handleTutupSesi}
                        className="w-full relative group overflow-hidden px-6 md:px-8 py-5 rounded-2xl font-black text-base md:text-lg transition-all active:scale-[0.97] hover:scale-[1.02] shadow-[0_0_30px_rgba(239,68,68,0.3)] bg-red-500/10 text-red-500 border-2 border-red-500/50 min-h-[56px]"
                      >
                        <span className="relative flex items-center justify-center gap-3">
                          ✕ Tutup Sesi Kuliah Sekarang
                        </span>
                      </button>
                      
                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-[#0f0a07] border border-stone-800 rounded-2xl p-4">
                          <div className="flex items-center gap-3 text-orange-400 mb-2">
                            <Users size={16} />
                            <span className="font-bold text-xs uppercase">Hadir</span>
                          </div>
                          <p className="text-3xl font-black text-white">{history.length}</p>
                        </div>
                        <div className="bg-[#0f0a07] border border-stone-800 rounded-2xl p-4">
                          <div className="flex items-center gap-3 text-stone-400 mb-2">
                            <CheckCircle2 size={16} />
                            <span className="font-bold text-xs uppercase">Status</span>
                          </div>
                          <p className="text-xl mt-1 font-black text-green-500 glow-green">
                            TERBUKA
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TiltCard>

              <div className="lg:col-span-7">
                {activeSession ? (
                  <TiltCard className="bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.05)] text-center h-full flex flex-col justify-center items-center py-12">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-black text-white">Scan Untuk Hadir</h2>
                      <p className="text-orange-400 font-medium">Mata Kuliah: {activeSession.nama_mk}</p>
                      <p className="text-xs text-zinc-500 mt-2">Dibuka: {new Date(activeSession.waktu_buka).toLocaleTimeString('id-ID')} (Sesi max 20 Menit)</p>
                    </div>
                    <div className="p-6 bg-white border-8 border-stone-900 rounded-3xl shadow-2xl relative">
                      <div className="absolute -inset-4 bg-orange-500/20 blur-xl rounded-[3rem] -z-10 animate-pulse"></div>
                      <QRCodeSVG 
                        value={JSON.stringify({ qr_token: activeSession.qr_token })} 
                        size={280}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                      />
                    </div>
                    <div className="mt-8 flex items-center gap-3 text-white font-bold bg-green-500/20 border border-green-500/50 px-6 py-3 rounded-full glow-green">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                      Menerima Kehadiran Mahasiswa...
                    </div>
                  </TiltCard>
                ) : (
                  <TiltCard className="bg-[#0f0a07] border border-stone-800 h-full min-h-[400px]">
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                       <BookOpen size={64} className="text-stone-800 mb-4" />
                       <h3 className="text-xl font-bold text-white mb-2">Belum Ada Sesi Aktif</h3>
                       <p className="text-stone-500 font-medium max-w-md">Silakan pilih mata kuliah dan klik "Generate Barcode Sesi Baru" di sebelah kiri untuk membuka sesi absensi.</p>
                    </div>
                  </TiltCard>
                )}
              </div>
            </div>
          )}

          {/* Tabel Mahasiswa Hadir saat Sesi Kelas Terbuka */}
          {activeTab === "Sesi Kelas" && activeSession && (
             <TiltCard className="w-full relative z-10 border border-stone-800 animate-in fade-in zoom-in-95 duration-500 mt-8">
               <h3 className="text-xl font-bold text-white mb-6">Mahasiswa Hadir - Sesi Ini</h3>
               
               {history.length > 0 ? (
                 <div className="space-y-4">
                   {history.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0604] border border-stone-800 hover:border-orange-500/30 transition-colors">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-stone-900 border border-white/10 flex items-center justify-center text-stone-500 font-bold">
                           {item.nim.substring(0, 2)}
                         </div>
                         <div>
                           <p className="font-bold text-white">{item.mahasiswa?.nama_mahasiswa || item.nim}</p>
                           <p className="text-xs text-stone-400">NIM: {item.nim} • {new Date(item.waktu_absen).toLocaleString("id-ID")}</p>
                         </div>
                       </div>
                       <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 glow-green">
                         {item.status.toUpperCase()}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center text-center py-10">
                    <Users size={48} className="text-stone-800 mb-4" />
                    <p className="text-stone-500 font-medium">Belum ada mahasiswa yang memindai barcode untuk sesi ini.</p>
                 </div>
               )}
             </TiltCard>
          )}

          {activeTab === "Hasil Evaluasi" && (
            <TiltCard className="w-full relative z-10 border border-orange-500/30 animate-in fade-in zoom-in-95 duration-500 p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
               <BookOpen size={64} className="text-orange-500 mb-6 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]" />
               <h2 className="text-3xl font-black text-white mb-4">Laporan Evaluasi Dosen</h2>
               <p className="text-stone-400 max-w-lg mb-8 leading-relaxed">Data kuesioner dari mahasiswa untuk semester ini masih dalam proses rekapitulasi oleh sistem akademik. Laporan lengkap akan tersedia pada akhir masa pengisian KHS.</p>
               <button onClick={() => setActiveTab("Dashboard")} className="px-6 py-3 rounded-full bg-stone-900 border border-stone-800 hover:border-orange-500/50 text-white font-bold transition-colors">
                 Kembali ke Dashboard
               </button>
            </TiltCard>
          )}

          {activeTab === "Jadwal Mengajar" && (
            <TiltCard className="w-full relative z-10 border border-stone-800 animate-in fade-in zoom-in-95 duration-500">
               <h2 className="text-2xl font-bold text-white mb-6">Jadwal Mengajar Anda</h2>
               <div className="space-y-4">
                 {mataKuliahList.slice(0, 2).map((mk, i) => (
                    <div key={i} className={`p-6 rounded-2xl bg-white/5 border-l-4 ${i===0?'border-l-orange-500':'border-l-amber-500'} flex justify-between items-center`}>
                      <div>
                        <h4 className="font-bold text-xl text-white">{mk.nama_mk}</h4>
                        <p className="text-stone-400">Kode: {mk.kode_mk} • {mk.sks} SKS</p>
                      </div>
                      <div className="text-right hidden sm:block">
                         <p className={`font-bold ${i===0?'text-orange-500':'text-amber-500'}`}>{i===0?'13:30 - 15:00 WITA':'08:00 - 10:30 WITA'}</p>
                         <p className="text-sm text-stone-400">Ruang Kelas {i===0?'A3':'Lab'}</p>
                      </div>
                    </div>
                 ))}
                 {mataKuliahList.length === 0 && <p className="text-zinc-500">Belum ada jadwal.</p>}
               </div>
            </TiltCard>
          )}

          {activeTab === "Profil" && (
            <TiltCard className="w-full relative z-10 border border-stone-800 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start p-4">
                 <div className="w-32 h-32 rounded-full bg-stone-900 border-4 border-orange-500 overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.4)] shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${dosen?.nama_dosen}`} alt="Profile" className="w-full h-full object-cover" />
                 </div>
                 <div className="space-y-4 text-center md:text-left flex-1">
                    <div>
                      <h2 className="text-4xl font-black text-white">{dosen?.nama_dosen}</h2>
                      <p className="text-xl text-orange-500 font-medium mt-1">NIDN: {dosen?.nidn}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                       <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                          <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Jabatan Fungsional</p>
                          <p className="text-white font-medium">Lektor</p>
                       </div>
                       <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                          <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Status Dosen</p>
                          <p className="text-green-400 font-medium">Aktif Mengajar</p>
                       </div>
                    </div>
                 </div>
              </div>
            </TiltCard>
          )}

        </div>
      </main>
    </div>
  );
}

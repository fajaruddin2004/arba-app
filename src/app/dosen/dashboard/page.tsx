"use client";

import React, { useState, useEffect } from "react";
import { QrCode, BookOpen, LogOut, ChevronRight, Users, CheckCircle2, Home, User, Calendar, ShieldCheck, MapPin, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

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
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`glass-card p-6 lg:p-8 rounded-3xl ${className}`}
    >
      <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default function DosenDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Fungsi fetch data yang bisa dipanggil berulang kali
  const fetchUserData = () => {
    fetch("/api/auth/me")
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

  // Fetch pertama kali
  useEffect(() => {
    fetchUserData();
  }, []);

  // Auto-polling setiap 5 detik saat sesi QR terbuka
  useEffect(() => {
    if (!showQR) return;
    const interval = setInterval(() => {
      fetchUserData();
    }, 5000);
    return () => clearInterval(interval);
  }, [showQR]);

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen bg-[#050301] flex items-center justify-center text-orange-500">Memuat...</div>;
  if (!userData || userData.role !== "DOSEN") return <div className="min-h-screen bg-[#050301] flex items-center justify-center text-red-500">Akses Ditolak</div>;

  const dosen = userData.dosen;
  const history = dosen?.presensi || [];
  
  const qrPayload = JSON.stringify({
    nidn: dosen.nidn,
    timestamp: new Date().getTime()
  });

  return (
    <div className="min-h-screen bg-[#050301] text-white flex flex-col md:flex-row font-sans selection:bg-orange-500/30 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-amber-700/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-red-900/10 blur-[100px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-full md:w-[320px] lg:w-[340px] border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col h-auto md:h-screen sticky top-0 bg-[#050301]/80 backdrop-blur-xl z-50">
        <div className="mb-10 lg:mb-16 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            D
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Portal Dosen</h2>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-bold">STIKOM 22 Januari</p>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-row lg:flex-col gap-2 lg:gap-4 lg:px-6 overflow-x-auto hide-scrollbar">
          {[
            { icon: Home, label: "Dashboard" },
            { icon: QrCode, label: "Buka Sesi Kelas" },
            { icon: BookOpen, label: "Hasil Evaluasi" },
            { icon: Calendar, label: "Jadwal Mengajar" },
            { icon: User, label: "Profil" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveTab(item.label);
                if (item.label === "Buka Sesi Kelas") setShowQR(true);
              }}
              className={`flex items-center gap-4 px-4 py-4 rounded-full transition-all duration-300 ${
                activeTab === item.label
                  ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 glow-orange"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={22} className={activeTab === item.label ? "text-orange-400" : ""} />
              <span className="hidden lg:block font-medium">{item.label}</span>
              {activeTab === item.label && (
                <motion.div layoutId="active-nav-dosen" className="hidden lg:block ml-auto">
                  <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_#f97316]" />
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
                    <p className="text-2xl font-bold text-white">4 MK</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Total Mahasiswa Hadir Hari Ini</p>
                    <p className="text-2xl font-bold text-white">{history.length} Orang</p>
                  </div>
                </div>
              </TiltCard>

              <TiltCard className="flex flex-col justify-center items-center text-center">
                <Clock size={40} className="text-orange-500 mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                <h4 className="text-lg font-medium text-zinc-300">Sesi Mengajar Berikutnya</h4>
                <p className="text-2xl font-bold text-white mt-2">Sistem Basis Data</p>
                <p className="text-amber-400 mt-1 font-medium">13:30 - 15:00 WITA</p>
                <p className="text-sm text-zinc-500 mt-1">Ruang Kelas A3</p>
              </TiltCard>

              <TiltCard 
                className="md:col-span-2 group cursor-pointer border border-orange-500/20 hover:border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-transparent"
              >
                <div onClick={() => setActiveTab("Buka Sesi Kelas")} className="flex justify-between items-center h-full">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 glow-orange">
                      <QrCode size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Buka Sesi Absensi Baru</h3>
                      <p className="text-zinc-400 max-w-sm">
                        Generate QR Code dinamis untuk ditampilkan di proyektor agar discan mahasiswa.
                      </p>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-black transform group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(249,115,22,0.6)]">
                    <ChevronRight size={32} />
                  </div>
                </div>
              </TiltCard>

              <TiltCard className="cursor-pointer group border border-amber-500/20 hover:border-amber-500/50 bg-gradient-to-bl from-amber-500/10 to-transparent">
                <div onClick={() => setActiveTab("Hasil Evaluasi")} className="flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4 glow-amber">
                      <BookOpen size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Lihat Hasil Evaluasi</h3>
                    <p className="text-sm text-zinc-400">
                      Cek penilaian kinerja Anda dari mahasiswa.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-amber-400 font-medium group-hover:translate-x-2 transition-transform">
                    Buka Laporan <ChevronRight size={18} />
                  </div>
                </div>
              </TiltCard>
            </div>
          )}

          {activeTab === "Buka Sesi Kelas" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
              <TiltCard className="lg:col-span-5 h-full">
                <div className="bg-[#0f0a07]/50 rounded-[2rem] p-4 text-center relative overflow-hidden h-full flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-[50px]"></div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Sistem Absensi Barcode</h3>
                  <p className="text-sm text-stone-400 mb-8 relative z-10">Tampilkan QR Code ini di layar kelas Anda. Kode ini berlaku selama sesi ini.</p>
                  
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className={`w-full relative group overflow-hidden px-8 py-5 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(249,115,22,0.3)] ${showQR ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-black'}`}
                  >
                    <span className="relative flex items-center justify-center gap-3">
                      {showQR ? "Tutup Sesi Kuliah" : "Generate Barcode Baru"} <ChevronRight className={showQR ? "rotate-90 transition-transform" : "transition-transform"} />
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
                        <span className="font-bold text-xs uppercase">Sesi</span>
                      </div>
                      <p className={`text-xl mt-1 font-black ${showQR ? "text-green-500 glow-green" : "text-stone-600"}`}>
                        {showQR ? "TERBUKA" : "DITUTUP"}
                      </p>
                    </div>
                  </div>
                </div>
              </TiltCard>

              <div className="lg:col-span-7">
                {showQR ? (
                  <TiltCard className="bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.05)] text-center h-full flex flex-col justify-center items-center py-12">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-black text-white">Scan Untuk Hadir</h2>
                      <p className="text-orange-400 font-medium">Sesi: Pemrograman Web (Hari Ini)</p>
                    </div>
                    <div className="p-6 bg-white border-8 border-stone-900 rounded-3xl shadow-2xl relative">
                      <div className="absolute -inset-4 bg-orange-500/20 blur-xl rounded-[3rem] -z-10 animate-pulse"></div>
                      <QRCodeSVG 
                        value={qrPayload} 
                        size={280}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                      />
                    </div>
                    <div className="mt-8 flex items-center gap-3 text-white font-bold bg-green-500/20 border border-green-500/50 px-6 py-3 rounded-full glow-green">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                      Menerima Absensi...
                    </div>
                  </TiltCard>
                ) : (
                  <TiltCard className="bg-[#0f0a07] border border-stone-800 h-full min-h-[400px]">
                    <h3 className="text-xl font-bold text-white mb-6">Log Kehadiran Mahasiswa</h3>
                    
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
                      <div className="flex flex-col items-center justify-center h-full text-center py-20">
                         <BookOpen size={64} className="text-stone-800 mb-4" />
                         <p className="text-stone-500 font-medium">Belum ada mahasiswa yang tercatat hadir.<br/>Buka sesi untuk mulai menerima absen.</p>
                      </div>
                    )}
                  </TiltCard>
                )}
              </div>
            </div>
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
                 <div className="p-6 rounded-2xl bg-white/5 border-l-4 border-l-orange-500 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xl text-white">Sistem Basis Data</h4>
                      <p className="text-stone-400">Semester 3 - Kelas A</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-orange-500">13:30 - 15:00 WITA</p>
                       <p className="text-sm text-stone-400">Ruang Kelas A3</p>
                    </div>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/5 border-l-4 border-l-amber-500 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xl text-white">Praktikum Jaringan</h4>
                      <p className="text-stone-400">Semester 5 - Kelas B</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-amber-500">08:00 - 10:30 WITA</p>
                       <p className="text-sm text-stone-400">Lab Jaringan</p>
                    </div>
                 </div>
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

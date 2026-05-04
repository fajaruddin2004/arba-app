"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  QrCode,
  Star,
  ChevronRight,
  User,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Globe,
  Cpu,
  Landmark,
  Monitor,
  Fingerprint,
  CheckCircle2,
  Activity,
  Image as ImageIcon
} from 'lucide-react';

// --- Komponen 3D Hover Card Tingkat Lanjut ---
const TiltCard = ({ children, onClick, className = "", intensity = 10 }: { children: React.ReactNode, onClick?: () => void, className?: string, intensity?: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;

    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`transition-transform duration-300 ease-out cursor-pointer ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('visi');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050301] text-[#e8e6e3] font-sans overflow-x-hidden selection:bg-amber-500/30 relative">

      {/* --- Dynamic Animated Background --- */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
      >
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-amber-600/5 blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-orange-700/10 blur-[150px] mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute top-[50%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-yellow-600/5 blur-[100px] mix-blend-screen animate-blob animation-delay-4000"></div>

        {/* Abstract 3D Grid Lines */}
        <div className="absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: `linear-gradient(rgba(217,119,6,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,6,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) scale(2.5)',
          transformOrigin: 'top'
        }}></div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 15s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        .glass-pill {
          background: rgba(20, 12, 5, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .glass-card {
          background: linear-gradient(135deg, rgba(30,18,10,0.6) 0%, rgba(10,5,2,0.8) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(217, 119, 6, 0.15);
          border-top: 1px solid rgba(217, 119, 6, 0.3);
          box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        }

        .float-layer-1 { animation: float-3d 6s ease-in-out infinite; }
        .float-layer-2 { animation: float-3d 5s ease-in-out infinite 0.5s; }
        .float-layer-3 { animation: float-3d 7s ease-in-out infinite 1s; }

        @keyframes float-3d {
          0%, 100% { transform: translateY(0) rotateX(0) rotateY(0); }
          50% { transform: translateY(-15px) rotateX(2deg) rotateY(-2deg); }
        }

        .text-glow { text-shadow: 0 0 30px rgba(217, 119, 6, 0.5); }
        .gradient-text {
          background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #b45309 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* --- Floating Navbar (Pill Shape) --- */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className={`transition-all duration-500 pointer-events-auto flex items-center justify-between px-6 py-3 rounded-full ${isScrolled ? 'glass-pill w-full max-w-5xl' : 'w-full max-w-7xl'}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/logo-stikom.png" alt="Logo STIKOM 22 Januari" className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_0_12px_rgba(217,119,6,0.6)]" />
            {!isScrolled && (
              <h1 className="font-bold text-lg text-white tracking-widest hidden sm:block">
                STIKOM <span className="text-amber-500 font-light">22 JANUARI</span>
              </h1>
            )}
          </div>

          <div className="hidden md:flex items-center gap-8 bg-black/20 px-8 py-2 rounded-full border border-white/5">
            <a href="#" className="text-sm font-medium text-stone-300 hover:text-amber-400 transition-colors">Beranda</a>
            <a href="#info-kampus" className="text-sm font-medium text-stone-300 hover:text-amber-400 transition-colors">Profil Kampus</a>
            <a href="#fitur-utama" className="text-sm font-medium text-stone-300 hover:text-amber-400 transition-colors">Fitur Inovasi</a>
          </div>

          <a
            href="/login"
            className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-amber-400 hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transform transition-all hover:scale-105 flex items-center gap-2 group"
          >
            Login <Fingerprint size={16} className="group-hover:rotate-12 transition-transform" />
          </a>
        </nav>
      </div>

      {/* --- HERO SECTION (True 3D Isometric View) --- */}
      <div className="relative min-h-screen flex items-center pt-20 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center w-full">

          {/* Kolom Teks */}
          <div
            className="space-y-8 z-20 transition-transform duration-700 ease-out"
            style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)` }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Sistem Akademik Terpadu
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-black leading-[1.1] tracking-tighter text-white">
              Sistem <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-orange-600 text-glow">
                Presensi
              </span> Pintar.
            </h1>

            <p className="text-lg text-stone-400 leading-relaxed max-w-md font-light">
              Meninggalkan cara konvensional. Menghadirkan ekosistem akademik mutakhir dengan validasi <b className="text-white">Geolokasi</b> dan <b className="text-white">Evaluasi Dosen</b> terpusat di STIKOM 22 Januari Kendari.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <a
                href="/login"
                className="relative group overflow-hidden px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(217,119,6,0.4)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative flex items-center gap-2">
                  Login Sekarang <ArrowRight size={20} />
                </span>
              </a>
            </div>
          </div>

          {/* THE 3D ISOMETRIC STAGE */}
          <div className="relative w-full h-[400px] lg:h-[600px] flex justify-center items-center perspective-[1000px] lg:perspective-[2000px] mt-10 lg:mt-0">
            <div
              className="relative w-[260px] h-[350px] lg:w-[300px] lg:h-[400px] transition-transform duration-700 ease-out preserve-3d"
              style={{
                transform: `rotateX(${55 + mousePos.y * -10}deg) rotateZ(${-35 + mousePos.x * 10}deg) scale3d(0.8, 0.8, 0.8)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="absolute inset-0 bg-orange-900/40 blur-[50px] rounded-[3rem] transform translate-Z-[-100px]"></div>

              {/* Layer 1: Base Platform */}
              <div className="absolute inset-0 bg-[#0a0502] border border-stone-800 rounded-[2.5rem] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_30px_60px_rgba(0,0,0,0.8)] float-layer-1" style={{ transform: 'translateZ(0px)' }}>
                <div className="absolute inset-2 bg-[#140b06] rounded-[2rem] overflow-hidden border border-stone-900">
                  <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20"></div>
                    <div className="w-20 h-4 rounded-full bg-stone-800"></div>
                  </div>
                </div>
              </div>

              {/* Layer 2: Barcode Scanner */}
              <div className="absolute top-[20%] left-[10%] right-[10%] h-48 bg-black/60 backdrop-blur-md rounded-2xl border border-amber-500/30 flex items-center justify-center float-layer-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)]" style={{ transform: 'translateZ(60px)' }}>
                <div className="relative w-28 h-28 border-2 border-dashed border-amber-500/70 rounded-xl flex items-center justify-center">
                  <QrCode size={64} className="text-amber-400" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-300 shadow-[0_0_20px_2px_#fcd34d] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              </div>

              {/* Layer 3: Geolokasi */}
              <div className="absolute bottom-[-10%] left-0 sm:left-[-20%] w-64 glass-card rounded-2xl p-4 flex items-center gap-4 float-layer-3 shadow-[0_30px_50px_rgba(0,0,0,0.6)]" style={{ transform: 'translateZ(120px)' }}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <MapPin size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Geofence Aktif</p>
                  <p className="text-xs text-emerald-400">Dalam Radius STIKOM 22J</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- PROFIL KAMPUS (BENTO GRID LENGKAP DENGAN FOTO) --- */}
      <section id="info-kampus" className="py-16 md:py-24 relative z-10 bg-[#080503] border-t border-stone-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Mengenal <span className="gradient-text">STIKOM 22 Januari.</span>
            </h2>
            <p className="text-stone-400 max-w-2xl text-lg">Pusat pengembangan ilmu pengetahuan bidang Sistem Informasi dan Teknik Komputer di jantung Kota Kendari.</p>
          </div>

          {/* PERBAIKAN GRID: Menambahkan aturan grid dinamis untuk tablet (md:grid-cols-2) agar tidak gepeng */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

            {/* Foto Gedung Kampus (Grid Besar Kiri) */}
            <TiltCard intensity={3} className="md:col-span-2 lg:col-span-6 lg:row-span-2">
              <div className="relative w-full h-full min-h-[400px] rounded-[2.5rem] overflow-hidden group border border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* [Gambar Gedung STIKOM 22 Januari] */}
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="[Gambar Gedung STIKOM 22 Januari]"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-in-out opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0502] via-[#0a0502]/40 to-transparent"></div>

                {/* Overlay Text */}
                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 backdrop-blur-md rounded-lg text-amber-400 text-xs font-bold mb-4 border border-amber-500/30">
                      <ImageIcon size={14} /> FOTO KAMPUS UTAMA
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 shadow-black drop-shadow-lg">Kampus Inovasi IT</h3>
                    <p className="text-stone-300 font-medium flex items-center gap-2">
                      <MapPin size={16} className="text-amber-500" /> Jl. M.T Haryono no. 79, Kec. Lalolara, Kendari
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Visi / Sejarah (Kanan Atas) */}
            <div className="md:col-span-2 lg:col-span-6 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('visi')}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'visi' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'bg-stone-900 text-stone-400 hover:text-white'}`}
                >Visi 2040</button>
                <button
                  onClick={() => setActiveTab('sejarah')}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'sejarah' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'bg-stone-900 text-stone-400 hover:text-white'}`}
                >Sejarah</button>
              </div>

              {activeTab === 'visi' ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <Globe className="text-amber-500 mb-4" size={32} />
                  <p className="text-stone-300 leading-relaxed italic">
                    "Menjadi sekolah ilmu komputer yang mandiri, kreatif, inovatif dan kompetitif tingkat internasional tahun 2040 bidang sistem informasi dan teknik komputer berlandaskan norma agama & pancasila."
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <Landmark className="text-orange-500 mb-4" size={32} />
                  <p className="text-stone-300 leading-relaxed text-sm">
                    Didirikan oleh Bapak Rudin, S.Sos., M.Si, Bapak Irfan Sepria Baresi, S.Kom., M.M. dan Bapak Winoto Setyo Budi, S.Si. Disahkan pada 28 Desember 2018 melalui SK Kemenristekdikti RI.
                  </p>
                </div>
              )}
            </div>

            {/* Program Studi SI (Bawah Kiri) */}
            <TiltCard intensity={5} className="md:col-span-1 lg:col-span-3">
              <div className="h-full glass-card rounded-[2rem] p-8 flex flex-col justify-center border-t-2 border-blue-500/30 group hover:border-blue-500/60 transition-colors">
                <Monitor className="text-blue-400 mb-4" size={32} />
                <h4 className="text-xl font-bold text-white mb-2">Sistem Informasi</h4>
                <p className="text-stone-400 text-xs leading-relaxed">Fokus pengembangan rekayasa perangkat lunak dan manajemen sistem.</p>
              </div>
            </TiltCard>

            {/* Program Studi TK (Bawah Kanan) */}
            <TiltCard intensity={5} className="md:col-span-1 lg:col-span-3">
              <div className="h-full glass-card rounded-[2rem] p-8 flex flex-col justify-center border-t-2 border-amber-500/30 group hover:border-amber-500/60 transition-colors">
                <Cpu className="text-amber-500 mb-4" size={32} />
                <h4 className="text-xl font-bold text-white mb-2">Teknik Komputer</h4>
                <p className="text-stone-400 text-xs leading-relaxed">Fokus pada arsitektur perangkat keras, jaringan, dan IoT masa depan.</p>
              </div>
            </TiltCard>

          </div>
        </div>
      </section>

      {/* --- FITUR UTAMA (DEEP DIVE THEMATIC SECTIONS) --- */}
      <section id="fitur-utama" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Teknologi <span className="gradient-text">Penerapan Skripsi.</span>
            </h2>
            <p className="text-stone-400 max-w-2xl text-lg">
              Sistem ini dibangun untuk menyelesaikan permasalahan absensi manual dan evaluasi dosen yang tidak terintegrasi dengan menerapkan dua inovasi utama.
            </p>
          </div>

          {/* Deep Dive 1: Sistem Absensi Geolokasi */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
            {/* Visual 3D Mockup Kiri */}
            <div className="w-full lg:w-1/2 perspective-[1500px]">
              <TiltCard intensity={8}>
                <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                  {/* Peta Lingkaran Hologram */}
                  <div className="absolute inset-0 bg-amber-600/10 rounded-full blur-2xl"></div>
                  <div className="absolute inset-8 rounded-full border border-amber-500/30 flex items-center justify-center" style={{ backgroundImage: 'radial-gradient(circle, transparent 40%, rgba(217,119,6,0.1) 100%)' }}>
                    <div className="w-48 h-48 rounded-full border border-dashed border-emerald-500/50 animate-[spin_30s_linear_infinite]"></div>
                    {/* Pin Tengah */}
                    <div className="absolute flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-b from-amber-400 to-orange-600 rounded-full shadow-[0_0_30px_rgba(217,119,6,0.6)] flex items-center justify-center mb-2 z-10 relative">
                        <MapPin size={32} className="text-white" />
                        <div className="absolute inset-0 rounded-full animate-ping bg-amber-400 opacity-40"></div>
                      </div>
                      <div className="w-24 h-6 bg-black/50 rounded-full blur-md"></div>
                    </div>
                  </div>
                  {/* Floating Elements UI */}
                  <div className="absolute bottom-10 -right-4 glass-card p-5 rounded-2xl flex items-center gap-4 shadow-2xl float-layer-1">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                    <div>
                      <p className="text-white font-bold">Lokasi Tervalidasi</p>
                      <p className="text-stone-400 text-xs">Jarak: 5m dari titik pusat</p>
                    </div>
                  </div>
                  <div className="absolute top-20 -left-4 glass-card p-4 rounded-xl flex items-center gap-3 shadow-2xl float-layer-2 border-orange-500/30">
                    <QrCode size={24} className="text-orange-400" />
                    <p className="text-white font-bold text-sm">QR Code Cocok</p>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Penjelasan Kanan */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <span className="text-2xl font-black text-amber-500">01</span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-black text-white">Presensi Anti-Manipulasi berbasis <span className="text-amber-500">Geofencing GPS.</span></h3>
              <p className="text-stone-400 text-lg leading-relaxed">
                Tinggalkan sistem tanda tangan kertas. Dosen cukup membuka sesi untuk menghasilkan <b>Barcode Dinamis</b>. Mahasiswa memindainya, dan sistem akan langsung melacak posisi lintang/bujur perangkat mahasiswa.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-amber-500 mt-1 shrink-0" size={20} />
                  <p className="text-stone-300"><b>Akurasi Spasial:</b> Presensi hanya berhasil jika mahasiswa fisik berada dalam radius STIKOM 22 Januari.</p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-amber-500 mt-1 shrink-0" size={20} />
                  <p className="text-stone-300"><b>Real-time Dashboard:</b> Nama mahasiswa yang berhasil absen langsung muncul di layar dosen saat itu juga.</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Deep Dive 2: Evaluasi Dosen */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            {/* Visual 3D Mockup Kanan */}
            <div className="w-full lg:w-1/2 perspective-[1500px]">
              <TiltCard intensity={8}>
                <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-2xl"></div>

                  {/* Susunan UI Cards 3D bertumpuk */}
                  <div className="relative w-[320px] h-[400px]" style={{ transformStyle: 'preserve-3d' }}>
                    {/* Card Belakang */}
                    <div className="absolute top-0 left-0 right-0 h-64 glass-card rounded-2xl p-6 opacity-60 float-layer-2" style={{ transform: 'translateZ(-50px) translateY(-20px)' }}>
                      <div className="w-1/2 h-4 bg-stone-800 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="w-full h-8 bg-stone-900 rounded"></div>
                        <div className="w-full h-8 bg-stone-900 rounded"></div>
                      </div>
                    </div>
                    {/* Card Utama (Depan) */}
                    <div className="absolute inset-4 glass-card bg-[#0f0a06] border-amber-500/40 rounded-3xl p-8 float-layer-1 shadow-[0_30px_60px_rgba(0,0,0,0.8)]" style={{ transform: 'translateZ(50px)' }}>
                      <div className="flex justify-between items-start mb-6 border-b border-stone-800 pb-4">
                        <div>
                          <p className="text-stone-400 text-xs font-bold uppercase mb-1">Evaluasi Kinerja</p>
                          <h4 className="text-white font-bold text-lg">Rekayasa Perangkat Lunak</h4>
                        </div>
                        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <Star className="text-amber-500 fill-amber-500" size={20} />
                        </div>
                      </div>
                      <p className="text-stone-300 text-sm mb-4">Penguasaan materi oleh dosen pengampu:</p>
                      <div className="flex justify-between gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`flex-1 aspect-square rounded-lg flex items-center justify-center font-bold text-sm ${i === 5 ? 'bg-amber-500 text-black' : 'bg-stone-900 border border-stone-800 text-stone-500'}`}>{i}</div>
                        ))}
                      </div>
                      <div className="w-full py-3 bg-amber-600 rounded-xl text-center font-bold text-white text-sm shadow-[0_0_15px_rgba(217,119,6,0.5)]">Submit Penilaian</div>
                    </div>
                    {/* Floating Graph Element */}
                    <div className="absolute -bottom-6 -left-10 glass-card p-4 rounded-xl flex items-end gap-2 float-layer-3 shadow-2xl" style={{ transform: 'translateZ(80px)' }}>
                      <div className="w-4 h-8 bg-orange-600/50 rounded-t-sm"></div>
                      <div className="w-4 h-16 bg-orange-500/80 rounded-t-sm"></div>
                      <div className="w-4 h-12 bg-amber-600/50 rounded-t-sm"></div>
                      <div className="w-4 h-20 bg-amber-400 rounded-t-sm relative">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                      </div>
                      <Activity className="text-amber-400 ml-2" size={24} />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Penjelasan Kiri */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <span className="text-2xl font-black text-amber-500">02</span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-black text-white">Evaluasi Kinerja Dosen <span className="text-amber-500">Sistematis & Terpusat.</span></h3>
              <p className="text-stone-400 text-lg leading-relaxed">
                Menghapuskan formulir manual atau Google Form terpisah. Mahasiswa memberikan  feedback  secara anonim langsung dari portal.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <Star className="text-amber-500 mt-1 shrink-0 fill-amber-500/20" size={20} />
                  <p className="text-stone-300"><b>Rekapitulasi Otomatis:</b> Nilai yang disubmit langsung dikalkulasi menjadi skor KPI (Key Performance Indicator) dosen.</p>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="text-amber-500 mt-1 shrink-0 fill-amber-500/20" size={20} />
                  <p className="text-stone-300"><b>Laporan Pimpinan:</b> Pimpinan (Waket 1 & Ketua) menerima dashboard analisis data matang untuk penjaminan mutu kampus.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer Organik --- */}
      <footer className="relative mt-10 pt-32 pb-10 overflow-hidden">
        <div className="absolute top-0 left-[-10%] right-[-10%] h-[200px] bg-[#030201] rounded-[100%] border-t border-stone-800 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-800 p-[1px] shadow-[0_0_20px_rgba(217,119,6,0.3)]">
              <div className="w-full h-full bg-[#0a0604] rounded-2xl flex items-center justify-center overflow-hidden">
                {/* Logo STIKOM 22 Januari di bagian Footer */}
                <img src="/logo-stikom.png" alt="Logo STIKOM" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]" />
              </div>
            </div>
            <div>
              <p className="font-bold text-white text-lg">STIKOM 22 Januari Kendari</p>
              <p className="text-sm text-stone-500 mt-1">Sistem Informasi Absensi & Evaluasi Kinerja.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-stone-900/50 rounded-full p-2 border border-stone-800">
            <span className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest">A Project By</span>
            <span className="px-4 py-2 bg-amber-500 text-black font-bold rounded-full text-sm shadow-[0_0_15px_rgba(217,119,6,0.5)]">Muh. Arba Hariyanto</span>
          </div>
        </div>
      </footer>



    </div>
  );
}

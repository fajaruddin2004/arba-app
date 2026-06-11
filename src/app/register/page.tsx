"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ChevronRight, Fingerprint, Mail, Lock, User, Hash } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    nim_nidn: "",
    role: "DOSEN",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.nim_nidn.length < 7 || !/^\d+$/.test(formData.nim_nidn)) {
        setError("NIM / NIDN / NIP harus berupa angka dan minimal 7 karakter.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Registrasi berhasil! Silakan login.");
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 text-stone-900 dark:text-white font-sans selection:bg-amber-500/30 relative overflow-hidden"
      style={{
        backgroundImage: 'url("https://telisik.id/assets/img/news/2023/03/stikom_22_januari_target_alumni_langsung_kerja.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay - adapts to theme */}
      <div className="absolute inset-0 bg-white/60 dark:bg-[#0a0502]/80 backdrop-blur-sm z-0 pointer-events-none transition-colors duration-300"></div>

      <div className="w-full max-w-md relative z-10 bg-white/70 dark:bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-all duration-300">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/50">
            <UserPlus size={32} className="text-white" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black mb-2">Buat <span className="text-amber-500 dark:text-amber-500">Akun</span></h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm">Bergabung dengan ekosistem STIKOM 22 Januari.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role is hardcoded to DOSEN */}

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-400 uppercase tracking-wider">Nama Lengkap</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3.5 text-stone-600 dark:text-stone-500" />
              <input required type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-xl p-3 pl-10 text-stone-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white/80 dark:focus:bg-black/60 focus:outline-none transition-all shadow-inner placeholder:text-stone-500 dark:placeholder:text-stone-400" placeholder="Masukkan nama..." />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-400 uppercase tracking-wider">NIDN</label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-3.5 text-stone-600 dark:text-stone-500" />
              <input required type="text" name="nim_nidn" value={formData.nim_nidn} onChange={handleChange} className="w-full bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-xl p-3 pl-10 text-stone-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white/80 dark:focus:bg-black/60 focus:outline-none transition-all shadow-inner placeholder:text-stone-500 dark:placeholder:text-stone-400" placeholder="Masukkan NIDN..." />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-400 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-stone-600 dark:text-stone-500" />
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-xl p-3 pl-10 text-stone-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white/80 dark:focus:bg-black/60 focus:outline-none transition-all shadow-inner placeholder:text-stone-500 dark:placeholder:text-stone-400" placeholder="email@kampus.ac.id" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-stone-600 dark:text-stone-500" />
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-xl p-3 pl-10 text-stone-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white/80 dark:focus:bg-black/60 focus:outline-none transition-all shadow-inner placeholder:text-stone-500 dark:placeholder:text-stone-400" placeholder="••••••••" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white dark:text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-all flex justify-center items-center gap-2"
          >
            {loading ? "Memproses..." : <>Daftar Sekarang <ChevronRight size={20} /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-stone-700 dark:text-stone-500 text-sm">
          Sudah punya akun? <button onClick={() => router.push("/")} className="text-amber-600 dark:text-amber-500 font-bold hover:underline">Login di sini</button>
        </p>
      </div>
    </div>
  );
}

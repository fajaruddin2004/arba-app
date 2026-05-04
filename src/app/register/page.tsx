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
    role: "MAHASISWA",
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
    <div className="min-h-screen bg-[#050301] flex items-center justify-center p-6 text-white font-sans selection:bg-amber-500/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-700/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 glass-card bg-gradient-to-b from-[#140b06] to-[#0a0502] p-8 rounded-3xl border border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/50">
            <UserPlus size={32} className="text-white" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black mb-2">Buat <span className="text-amber-500">Akun</span></h2>
          <p className="text-stone-400 text-sm">Bergabung dengan ekosistem STIKOM 22 Januari.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Peran (Role)</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-[#0a0604] border border-stone-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
            >
              <option value="MAHASISWA">Mahasiswa</option>
              <option value="DOSEN">Dosen</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Nama Lengkap</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3.5 text-stone-500" />
              <input required type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full bg-[#0a0604] border border-stone-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none transition-colors" placeholder="Masukkan nama..." />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">{formData.role === "MAHASISWA" ? "NIM" : formData.role === "DOSEN" ? "NIDN" : "NIP Pegawai"}</label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-3.5 text-stone-500" />
              <input required type="text" name="nim_nidn" value={formData.nim_nidn} onChange={handleChange} className="w-full bg-[#0a0604] border border-stone-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none transition-colors" placeholder={`Masukkan ${formData.role === "MAHASISWA" ? "NIM" : formData.role === "DOSEN" ? "NIDN" : "NIP Pegawai"}...`} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-stone-500" />
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0a0604] border border-stone-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none transition-colors" placeholder="email@kampus.ac.id" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-stone-500" />
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#0a0604] border border-stone-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none transition-colors" placeholder="••••••••" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-all flex justify-center items-center gap-2"
          >
            {loading ? "Memproses..." : <>Daftar Sekarang <ChevronRight size={20} /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-stone-500 text-sm">
          Sudah punya akun? <button onClick={() => router.push("/")} className="text-amber-500 font-bold hover:underline">Login di sini</button>
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Mail, Lock, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Redirect based on role
      if (data.role === "ADMIN" || data.role === "PIMPINAN") {
        router.push("/admin/dashboard");
      } else if (data.role === "DOSEN") {
        router.push("/dosen/dashboard");
      } else {
        router.push("/mahasiswa/dashboard");
      }
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
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/50">
            <Fingerprint size={32} className="text-white" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black mb-2">Masuk <span className="text-amber-500">Portal</span></h2>
          <p className="text-stone-400 text-sm">Masuk untuk mengakses layanan STIKOM.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pilih Akses</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-[#0a0604] border border-stone-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
            >
              <option value="MAHASISWA">Portal Mahasiswa</option>
              <option value="DOSEN">Portal Dosen</option>
              <option value="ADMIN">Portal Admin / Pimpinan</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {formData.role === "MAHASISWA" ? "NIM / Email" : formData.role === "DOSEN" ? "NIDN / Email" : "Username / Email"}
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-stone-500" />
              <input 
                required 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                className="w-full bg-[#0a0604] border border-stone-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none transition-colors" 
                placeholder={`Masukkan ${formData.role === "MAHASISWA" ? "NIM" : formData.role === "DOSEN" ? "NIDN" : "Username"} Anda...`} 
              />
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
            {loading ? "Memverifikasi..." : <>Login <ChevronRight size={20} /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-stone-500 text-sm">
          Belum punya akun? <a href="/register" className="text-amber-500 font-bold hover:underline">Daftar di sini</a>
        </p>
      </div>
    </div>
  );
}

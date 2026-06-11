"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Mail, Lock, ChevronRight, Eye, EyeOff, ShieldCheck, GraduationCap, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "MAHASISWA",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

      const contentType = res.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Server returned non-JSON:", text.substring(0, 200));
        throw new Error("Terjadi kesalahan server (Internal Server Error)");
      }

      if (!res.ok) throw new Error(data.message || "Login gagal");

      // Redirect based on role
      const searchParams = typeof window !== 'undefined' ? window.location.search : '';
      if (data.role === "ADMIN" || data.role === "PIMPINAN") {
        router.push("/admin/dashboard" + searchParams);
      } else if (data.role === "DOSEN") {
        router.push("/dosen/dashboard" + searchParams);
      } else {
        router.push("/mahasiswa/dashboard" + searchParams);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak diketahui");
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
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/50">
            <Fingerprint size={32} className="text-white" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black mb-2">Masuk <span className="text-amber-500 dark:text-amber-500">Portal</span></h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm">Masuk untuk mengakses layanan STIKOM.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-400 uppercase tracking-wider">
              Login Sebagai
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { id: "MAHASISWA", label: "Mahasiswa", icon: GraduationCap },
                { id: "DOSEN", label: "Dosen", icon: Users },
                { id: "ADMIN", label: "Admin", icon: ShieldCheck }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.id })}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${formData.role === r.id ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold" : "bg-white/50 dark:bg-black/40 border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5"}`}
                >
                  <r.icon size={18} />
                  <span className="text-[10px] uppercase tracking-wider">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-400 uppercase tracking-wider">
              NIM / NIDN / Username
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-stone-600 dark:text-stone-500" />
              <input 
                required 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                className="w-full bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-xl p-3 pl-10 text-stone-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white/80 dark:focus:bg-black/60 focus:outline-none transition-all shadow-inner placeholder:text-stone-500 dark:placeholder:text-stone-400" 
                placeholder={formData.role === "MAHASISWA" ? "Masukkan NIM..." : formData.role === "DOSEN" ? "Masukkan NIDN..." : "Masukkan Username..."} 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-stone-600 dark:text-stone-500" />
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                className="w-full bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-xl p-3 pl-10 pr-10 text-stone-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white/80 dark:focus:bg-black/60 focus:outline-none transition-all shadow-inner placeholder:text-stone-500 dark:placeholder:text-stone-400" 
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-stone-500 hover:text-stone-800 dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white dark:text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-all flex justify-center items-center gap-2"
          >
            {loading ? "Memverifikasi..." : <>Login <ChevronRight size={20} /></>}
          </button>
          
          <div className="pt-4 text-center border-t border-stone-200 dark:border-white/10 mt-6">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Belum punya akun? <br className="sm:hidden" />
              <a href="/register" className="text-amber-600 dark:text-amber-400 font-bold hover:underline ml-1">
                Daftar sebagai Dosen
              </a>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}

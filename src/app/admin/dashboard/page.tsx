"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Home, Users, BookOpen, FileText, LogOut, Plus, Trash2, GraduationCap, Activity, TrendingUp, ChevronRight, X, Download } from "lucide-react";

const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x);
  const my = useSpring(y);
  const rx = useTransform(my, [-0.5, 0.5], ["8deg", "-8deg"]);
  const ry = useTransform(mx, [-0.5, 0.5], ["-8deg", "8deg"]);
  return (
    <motion.div
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left) / r.width - 0.5); y.set((e.clientY - r.top) / r.height - 0.5); }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateY: ry, rotateX: rx, transformStyle: "preserve-3d" }}
      className={`glass-card p-6 lg:p-8 rounded-3xl ${className}`}
    >
      <div style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }} className="h-full">{children}</div>
    </motion.div>
  );
};

const COLORS = ["#f59e0b", "#ea580c", "#22c55e", "#3b82f6", "#a855f7"];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showAddMK, setShowAddMK] = useState(false);
  const [mkForm, setMkForm] = useState({ kode_mk: "", nama_mk: "", sks: "" });
  const [msg, setMsg] = useState("");

  const fetchData = () => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => { if (d.mhsCount !== undefined) setData(d); });
  };
  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => { document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"; window.location.href = "/login"; };

  const addMK = async () => {
    setMsg("");
    const res = await fetch("/api/admin/matakuliah", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mkForm) });
    const d = await res.json();
    if (res.ok) { setMsg("Berhasil!"); setMkForm({ kode_mk: "", nama_mk: "", sks: "" }); setShowAddMK(false); fetchData(); }
    else setMsg(d.message);
  };

  const deleteMK = async (kode: string) => {
    if (!confirm("Hapus mata kuliah ini?")) return;
    await fetch(`/api/admin/matakuliah?kode_mk=${kode}`, { method: "DELETE" });
    fetchData();
  };

  if (!data) return <div className="min-h-screen bg-[#050301] flex items-center justify-center text-amber-500">Memuat Dashboard...</div>;

  const pieData = [
    { name: "Hadir", value: data.presensiTerbaru?.filter((p: any) => p.status === "Hadir").length || 0 },
    { name: "Di Luar Radius", value: data.presensiTerbaru?.filter((p: any) => p.status !== "Hadir").length || 0 },
  ];

  const tabs = [
    { icon: Home, label: "Dashboard" },
    { icon: Users, label: "Data Mahasiswa" },
    { icon: GraduationCap, label: "Data Dosen" },
    { icon: BookOpen, label: "Mata Kuliah" },
    { icon: FileText, label: "Laporan" },
  ];

  return (
    <div className="min-h-screen bg-[#050301] text-white flex flex-col md:flex-row font-sans selection:bg-amber-500/30 overflow-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-700/10 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-full md:w-[300px] border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex flex-row md:flex-col h-auto md:h-screen sticky top-0 bg-[#050301]/80 backdrop-blur-xl z-50">
        <div className="mb-0 md:mb-12 flex items-center gap-3 shrink-0 pr-4 md:pr-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-lg shadow-[0_0_20px_rgba(245,158,11,0.4)]">A</div>
          <div>
            <h2 className="text-lg font-black text-white">Admin Panel</h2>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">STIKOM 22 Januari</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-row md:flex-col gap-2 md:gap-3 overflow-x-auto hide-scrollbar md:px-2">
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setActiveTab(t.label)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all whitespace-nowrap ${activeTab === t.label ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>
              <t.icon size={20} />
              <span className="hidden md:block font-medium text-sm">{t.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="shrink-0 ml-auto md:ml-0 flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all md:mt-auto">
          <LogOut size={20} /><span className="hidden md:block font-medium text-sm">Keluar</span>
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 relative overflow-y-auto z-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ===== TAB: DASHBOARD ===== */}
          {activeTab === "Dashboard" && (<>
            <header className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black">Dashboard <span className="text-amber-500">Admin</span></h1>
                <p className="text-zinc-400 mt-1">Pusat kontrol sistem absensi STIKOM 22 Januari Kendari.</p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-2 pr-5 rounded-full border border-white/10">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-black font-black">A</div>
                <span className="font-bold text-sm">Administrator</span>
              </div>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Mahasiswa", val: data.mhsCount, icon: Users, color: "text-amber-500", glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]" },
                { label: "Total Dosen", val: data.dosenCount, icon: GraduationCap, color: "text-orange-500", glow: "shadow-[0_0_20px_rgba(234,88,12,0.2)]" },
                { label: "Mata Kuliah", val: data.mkCount, icon: BookOpen, color: "text-blue-500", glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]" },
                { label: "Presensi Hari Ini", val: data.presensiHariIni, icon: Activity, color: "text-green-500", glow: "shadow-[0_0_20px_rgba(34,197,94,0.2)]" },
              ].map((s, i) => (
                <TiltCard key={i} className={`border border-white/5 ${s.glow}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}><s.icon size={20} /></div>
                  </div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">{s.label}</p>
                  <p className={`text-4xl font-black mt-1 ${s.color}`}>{s.val}</p>
                </TiltCard>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TiltCard className="lg:col-span-2 border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp size={20} className="text-amber-500" /> Grafik Kehadiran 7 Hari</h3>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chartArray}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                      <XAxis dataKey="name" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#0a0604", border: "1px solid #333", borderRadius: 12 }} />
                      <Bar dataKey="hadir" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Hadir" />
                      <Bar dataKey="diluar" fill="#ef4444" radius={[8, 8, 0, 0]} name="Di Luar Radius" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TiltCard>

              <TiltCard className="border border-white/5">
                <h3 className="text-lg font-bold mb-4">Rasio Kehadiran</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? "#22c55e" : "#ef4444"} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0a0604", border: "1px solid #333", borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs text-zinc-400">Hadir ({pieData[0].value})</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-zinc-400">Luar ({pieData[1].value})</span></div>
                </div>
              </TiltCard>
            </div>

            {/* Recent Log */}
            <TiltCard className="border border-white/5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity size={20} className="text-amber-500" /> Log Presensi Terbaru</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-zinc-500 border-b border-white/5">
                    <th className="pb-3 font-medium">Mahasiswa</th><th className="pb-3 font-medium">Dosen</th><th className="pb-3 font-medium">Waktu</th><th className="pb-3 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {(data.presensiTerbaru || []).slice(0, 8).map((p: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-medium">{p.mahasiswa?.nama_mahasiswa || p.nim}</td>
                        <td className="py-3 text-zinc-400">{p.dosen?.nama_dosen || p.nidn}</td>
                        <td className="py-3 text-zinc-400">{new Date(p.waktu_absen).toLocaleString("id-ID")}</td>
                        <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === "Hadir" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!data.presensiTerbaru || data.presensiTerbaru.length === 0) && <p className="text-center py-8 text-zinc-500">Belum ada data presensi.</p>}
              </div>
            </TiltCard>
          </>)}

          {/* ===== TAB: DATA MAHASISWA ===== */}
          {activeTab === "Data Mahasiswa" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <h1 className="text-3xl font-black">Data <span className="text-amber-500">Mahasiswa</span></h1>
              <TiltCard className="border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-zinc-500 border-b border-white/5">
                      <th className="pb-3 font-medium">NIM</th><th className="pb-3 font-medium">Nama</th><th className="pb-3 font-medium">Total Presensi</th>
                    </tr></thead>
                    <tbody>
                      {(data.mahasiswa || []).map((m: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-mono text-amber-400">{m.nim}</td>
                          <td className="py-4 font-medium">{m.nama_mahasiswa}</td>
                          <td className="py-4"><span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">{m._count.presensi} kali</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!data.mahasiswa || data.mahasiswa.length === 0) && <p className="text-center py-8 text-zinc-500">Belum ada mahasiswa terdaftar.</p>}
                </div>
              </TiltCard>
            </div>
          )}

          {/* ===== TAB: DATA DOSEN ===== */}
          {activeTab === "Data Dosen" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <h1 className="text-3xl font-black">Data <span className="text-orange-500">Dosen</span></h1>
              <TiltCard className="border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-zinc-500 border-b border-white/5">
                      <th className="pb-3 font-medium">NIDN</th><th className="pb-3 font-medium">Nama</th><th className="pb-3 font-medium">Total Sesi</th>
                    </tr></thead>
                    <tbody>
                      {(data.dosen || []).map((d: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-mono text-orange-400">{d.nidn}</td>
                          <td className="py-4 font-medium">{d.nama_dosen}</td>
                          <td className="py-4"><span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold">{d._count.presensi} mahasiswa</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!data.dosen || data.dosen.length === 0) && <p className="text-center py-8 text-zinc-500">Belum ada dosen terdaftar.</p>}
                </div>
              </TiltCard>
            </div>
          )}

          {/* ===== TAB: MATA KULIAH ===== */}
          {activeTab === "Mata Kuliah" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-black">Mata <span className="text-blue-500">Kuliah</span></h1>
                <button onClick={() => setShowAddMK(true)} className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Plus size={18} /> Tambah MK
                </button>
              </div>

              {showAddMK && (
                <TiltCard className="border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Tambah Mata Kuliah Baru</h3>
                    <button onClick={() => setShowAddMK(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                  </div>
                  {msg && <p className="text-sm text-amber-400 mb-3">{msg}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input value={mkForm.kode_mk} onChange={e => setMkForm({ ...mkForm, kode_mk: e.target.value })} placeholder="Kode MK (cth: IF101)" className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none" />
                    <input value={mkForm.nama_mk} onChange={e => setMkForm({ ...mkForm, nama_mk: e.target.value })} placeholder="Nama Mata Kuliah" className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none" />
                    <input value={mkForm.sks} onChange={e => setMkForm({ ...mkForm, sks: e.target.value })} placeholder="SKS" type="number" className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                  <button onClick={addMK} className="mt-4 px-6 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors">Simpan</button>
                </TiltCard>
              )}

              <TiltCard className="border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-zinc-500 border-b border-white/5">
                      <th className="pb-3 font-medium">Kode</th><th className="pb-3 font-medium">Nama MK</th><th className="pb-3 font-medium">SKS</th><th className="pb-3 font-medium">Aksi</th>
                    </tr></thead>
                    <tbody>
                      {(data.mataKuliah || []).map((mk: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-mono text-blue-400">{mk.kode_mk}</td>
                          <td className="py-4 font-medium">{mk.nama_mk}</td>
                          <td className="py-4 text-zinc-400">{mk.sks} SKS</td>
                          <td className="py-4">
                            <button onClick={() => deleteMK(mk.kode_mk)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!data.mataKuliah || data.mataKuliah.length === 0) && <p className="text-center py-8 text-zinc-500">Belum ada mata kuliah. Klik "Tambah MK" untuk menambahkan.</p>}
                </div>
              </TiltCard>
            </div>
          )}

          {/* ===== TAB: LAPORAN ===== */}
          {activeTab === "Laporan" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-black">Laporan <span className="text-green-500">Akhir</span></h1>
                <button onClick={() => window.print()} className="px-5 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <Download size={18} /> Cetak Laporan
                </button>
              </div>

              <TiltCard className="border border-white/5 print:shadow-none">
                <div className="text-center mb-8 border-b border-white/10 pb-6">
                  <h2 className="text-2xl font-black text-amber-500">STIKOM 22 JANUARI KENDARI</h2>
                  <p className="text-zinc-400 mt-1">Laporan Rekapitulasi Presensi Mahasiswa</p>
                  <p className="text-zinc-500 text-sm mt-1">Dicetak pada: {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-zinc-400">Total Mahasiswa</p><p className="text-2xl font-black text-amber-500">{data.mhsCount}</p></div>
                  <div className="bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-zinc-400">Total Dosen</p><p className="text-2xl font-black text-orange-500">{data.dosenCount}</p></div>
                  <div className="bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-zinc-400">Mata Kuliah</p><p className="text-2xl font-black text-blue-500">{data.mkCount}</p></div>
                  <div className="bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-zinc-400">Total Presensi</p><p className="text-2xl font-black text-green-500">{data.totalPresensi}</p></div>
                </div>

                <h3 className="text-lg font-bold mb-4">Detail Presensi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-zinc-500 border-b border-white/5">
                      <th className="pb-3">No</th><th className="pb-3">NIM</th><th className="pb-3">Nama Mahasiswa</th><th className="pb-3">Dosen</th><th className="pb-3">Waktu</th><th className="pb-3">Status</th>
                    </tr></thead>
                    <tbody>
                      {(data.presensiTerbaru || []).map((p: any, i: number) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-3 text-zinc-500">{i + 1}</td>
                          <td className="py-3 font-mono text-amber-400">{p.nim}</td>
                          <td className="py-3">{p.mahasiswa?.nama_mahasiswa || "-"}</td>
                          <td className="py-3 text-zinc-400">{p.dosen?.nama_dosen || "-"}</td>
                          <td className="py-3 text-zinc-400">{new Date(p.waktu_absen).toLocaleString("id-ID")}</td>
                          <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === "Hadir" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 text-right">
                  <p className="text-zinc-500 text-sm">Kendari, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="text-zinc-400 font-bold mt-1">Ketua STIKOM 22 Januari</p>
                  <div className="h-16" />
                  <p className="text-zinc-400 font-bold border-t border-dashed border-zinc-700 inline-block pt-2 px-8">( ...................................... )</p>
                </div>
              </TiltCard>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

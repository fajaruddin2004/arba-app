"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Home, Users, BookOpen, FileText, LogOut, Plus, Trash2, GraduationCap, Activity, TrendingUp, ChevronRight, X, Download, Edit, LayoutDashboard, Database } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const TiltCard = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => {
  const [isMobile, setIsMobile] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x);
  const my = useSpring(y);
  const rx = useTransform(my, [-0.5, 0.5], ["8deg", "-8deg"]);
  const ry = useTransform(mx, [-0.5, 0.5], ["-8deg", "8deg"]);
  useEffect(() => { setIsMobile(window.matchMedia("(pointer: coarse)").matches); }, []);
  return (
    <motion.div
      onMouseMove={(e) => { if (isMobile) return; const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left) / r.width - 0.5); y.set((e.clientY - r.top) / r.height - 0.5); }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      style={isMobile ? {} : { rotateY: ry, rotateX: rx, transformStyle: "preserve-3d" }}
      className={`glass-card p-5 md:p-6 lg:p-8 rounded-3xl ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
    >
      <div style={isMobile ? {} : { transform: "translateZ(25px)", transformStyle: "preserve-3d" }} className="h-full">{children}</div>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [msg, setMsg] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  
  // Forms
  const [showAddMK, setShowAddMK] = useState(false);
  const [mkForm, setMkForm] = useState({ kode_mk: "", nama_mk: "", sks: "", nidn: "", hari: "", waktu: "", ruangan: "" });
  const [isEditMK, setIsEditMK] = useState(false);

  const [showAddMhs, setShowAddMhs] = useState(false);
  const [mhsForm, setMhsForm] = useState({ nim: "", nama_mahasiswa: "", id_jurusan: "", id_semester: "", jenis_kelamin: "" });
  const [isEditMhs, setIsEditMhs] = useState(false);

  const [showAddDosen, setShowAddDosen] = useState(false);
  const [dosenForm, setDosenForm] = useState({ nidn: "", nama_dosen: "" });
  const [isEditDosen, setIsEditDosen] = useState(false);

  const [jurusanForm, setJurusanForm] = useState({ id_jurusan: "", nama_jurusan: "" });
  const [semesterForm, setSemesterForm] = useState({ id_semester: "", nama_semester: "" });

  const fetchData = () => {
    fetch(`/api/admin/stats?t=${Date.now()}`)
      .then(r => r.json())
      .then(d => { 
        if (d.mhsCount !== undefined) {
          setData(d); 
        } else {
          setMsg(d.message || d.error || "Gagal memuat data dari server");
        }
      })
      .catch(e => setMsg(e.message));
  };
  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => { document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"; window.location.href = "/login"; };

  // --- MATA KULIAH ---
  const saveMK = async () => {
    setActionMsg("");
    const res = await fetch("/api/admin/matakuliah", { 
      method: isEditMK ? "PUT" : "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(mkForm) 
    });
    const d = await res.json();
    if (res.ok) { 
      setActionMsg(isEditMK ? "Berhasil diubah!" : "Berhasil ditambahkan!"); 
      setMkForm({ kode_mk: "", nama_mk: "", sks: "", nidn: "", hari: "", waktu: "", ruangan: "" }); 
      setShowAddMK(false); 
      fetchData(); 
    } else setActionMsg(d.message);
  };

  const deleteMK = async (kode: string) => {
    if (!confirm("Hapus mata kuliah ini?")) return;
    await fetch(`/api/admin/matakuliah?kode_mk=${kode}`, { method: "DELETE" });
    fetchData();
  };

  const openEditMK = (mk: any) => {
    setMkForm({ kode_mk: mk.kode_mk, nama_mk: mk.nama_mk, sks: mk.sks.toString(), nidn: mk.dosen?.nidn || "", hari: mk.hari || "", waktu: mk.waktu || "", ruangan: mk.ruangan || "" });
    setIsEditMK(true);
    setShowAddMK(true);
  };

  // --- MAHASISWA ---
  const saveMahasiswa = async () => {
    setActionMsg("");
    if (!/^\d+$/.test(mhsForm.nim) || mhsForm.nim.length < 8) return setActionMsg("NIM harus angka & minimal 8 karakter.");
    if (!mhsForm.nama_mahasiswa.trim()) return setActionMsg("Nama tidak boleh kosong.");

    const res = await fetch("/api/admin/mahasiswa", { 
      method: isEditMhs ? "PUT" : "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(mhsForm) 
    });
    const d = await res.json();
    if (res.ok) { 
      setActionMsg("Berhasil disimpan!"); 
      setMhsForm({ nim: "", nama_mahasiswa: "", id_jurusan: "", id_semester: "", jenis_kelamin: "" }); 
      setShowAddMhs(false); 
      fetchData(); 
    } else setActionMsg(d.message);
  };

  const deleteMahasiswa = async (nim: string) => {
    if (!confirm("Hapus mahasiswa ini? Semua presensinya juga akan terhapus.")) return;
    await fetch(`/api/admin/mahasiswa?nim=${nim}`, { method: "DELETE" });
    fetchData();
  };

  const openEditMhs = (m: any) => {
    setMhsForm({ nim: m.nim, nama_mahasiswa: m.nama_mahasiswa, id_jurusan: m.id_jurusan || "", id_semester: m.id_semester || "", jenis_kelamin: m.jenis_kelamin || "" });
    setIsEditMhs(true);
    setShowAddMhs(true);
  };

  // --- DOSEN ---
  const saveDosen = async () => {
    setActionMsg("");
    if (!dosenForm.nidn || !dosenForm.nama_dosen) return setActionMsg("Isi NIDN dan Nama Dosen.");
    const res = await fetch("/api/admin/dosen", { 
      method: isEditDosen ? "PUT" : "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(dosenForm) 
    });
    const d = await res.json();
    if (res.ok) { 
      setActionMsg("Berhasil disimpan!"); 
      setDosenForm({ nidn: "", nama_dosen: "" }); 
      setShowAddDosen(false); 
      fetchData(); 
    } else setActionMsg(d.message);
  };

  const deleteDosen = async (nidn: string) => {
    if (!confirm("Hapus dosen ini?")) return;
    await fetch(`/api/admin/dosen?nidn=${nidn}`, { method: "DELETE" });
    fetchData();
  };

  const openEditDosen = (d: any) => {
    setDosenForm({ nidn: d.nidn, nama_dosen: d.nama_dosen });
    setIsEditDosen(true);
    setShowAddDosen(true);
  };

  // --- MANAJEMEN AKADEMIK (JURUSAN & SEMESTER) ---
  const saveJurusan = async () => {
    if (!jurusanForm.nama_jurusan) return alert("Isi nama jurusan");
    await fetch("/api/admin/jurusan", { 
      method: jurusanForm.id_jurusan ? "PUT" : "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(jurusanForm) 
    });
    setJurusanForm({ id_jurusan: "", nama_jurusan: "" });
    fetchData();
  };

  const deleteJurusan = async (id: string) => {
    if (!confirm("Hapus jurusan?")) return;
    await fetch(`/api/admin/jurusan?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const saveSemester = async () => {
    if (!semesterForm.nama_semester) return alert("Isi nama semester");
    await fetch("/api/admin/semester", { 
      method: semesterForm.id_semester ? "PUT" : "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(semesterForm) 
    });
    setSemesterForm({ id_semester: "", nama_semester: "" });
    fetchData();
  };

  const deleteSemester = async (id: string) => {
    if (!confirm("Hapus semester?")) return;
    await fetch(`/api/admin/semester?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  if (!data) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-amber-500">
      <p>{msg ? <span className="text-red-500 font-bold">{msg}</span> : "Memuat Dashboard..."}</p>
      {msg && (
        <button onClick={() => window.location.href = "/login"} className="mt-4 px-4 py-2 bg-stone-800 text-white rounded-xl">Kembali ke Login</button>
      )}
    </div>
  );

  const pieData = [
    { name: "Hadir", value: data.presensiTerbaru?.filter((p: any) => p.status === "Hadir").length || 0 },
    { name: "Di Luar Radius", value: data.presensiTerbaru?.filter((p: any) => p.status !== "Hadir").length || 0 },
  ];

  const tabs = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Users, label: "Data Mahasiswa" },
    { icon: GraduationCap, label: "Data Dosen" },
    { icon: BookOpen, label: "Mata Kuliah" },
    { icon: Database, label: "Manajemen" },
    { icon: FileText, label: "Laporan" },
  ];

  return (
    <div className="h-screen bg-background text-foreground flex flex-col md:flex-row font-sans selection:bg-amber-500/30 overflow-hidden relative transition-colors duration-300">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-700/10 blur-[120px]" />
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-[300px] border-r border-foreground/10 flex-col h-full flex-shrink-0 bg-background/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3 p-6 pb-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-lg shadow-[0_0_20px_rgba(245,158,11,0.4)]">A</div>
          <div>
            <h2 className="text-lg font-black text-foreground">Admin Panel</h2>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold">STIKOM 22 Januari</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-4 p-6 pt-12 overflow-y-auto hide-scrollbar">
          {tabs.map((t, i) => (
            <button key={i} onClick={() => { setActiveTab(t.label); setActionMsg(""); }}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all whitespace-nowrap justify-start shrink-0 ${activeTab === t.label ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30" : "text-stone-600 dark:text-stone-300 hover:text-foreground hover:dark:bg-white/5 hover:bg-stone-100 dark:hover:bg-white/5"}`}>
              <t.icon size={20} />
              <span className="font-medium text-sm">{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="flex shrink-0 p-6 pt-0 items-center gap-2 mt-auto">
          <ThemeToggle />
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-stone-500 dark:text-stone-400 hover:text-red-500 hover:bg-red-500/10 transition-all w-full">
            <LogOut size={20} /><span className="font-medium text-sm">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background/80 backdrop-blur-xl border-b dark:border-white/5 border-stone-200 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]">A</div>
          <div><h2 className="text-base font-black text-foreground">Admin Panel</h2></div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleLogout} className="p-2 text-stone-500 hover:text-red-500 bg-stone-100 dark:bg-white/5 rounded-xl"><LogOut size={18} /></button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t dark:border-white/5 border-stone-200 z-50 px-2 py-2 flex justify-around items-center safe-area-pb">
        {tabs.map((t, i) => (
          <button key={i} onClick={() => { setActiveTab(t.label); setActionMsg(""); }} className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[64px] transition-colors ${activeTab === t.label ? "text-amber-600 dark:text-amber-400" : "text-stone-500 dark:text-stone-400"}`}>
            <t.icon size={20} className={activeTab === t.label ? "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : ""} />
            <span className="text-[10px] font-medium leading-none mt-1 max-w-[60px] truncate">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 relative overflow-y-auto z-10 pb-24 md:pb-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ===== TAB: DASHBOARD ===== */}
          {activeTab === "Dashboard" && (<>
            <header className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black">Dashboard <span className="text-amber-500">Admin</span></h1>
                <p className="text-stone-600 dark:text-stone-300 mt-1">Pusat kontrol sistem absensi STIKOM 22 Januari Kendari.</p>
              </div>
              <div className="flex items-center gap-3 dark:bg-white/5 bg-stone-100 dark:bg-white/5 p-2 pr-5 rounded-full border dark:border-white/10 border-stone-200 dark:border-white/10">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-black font-black">A</div>
                <span className="font-bold text-sm">Administrator</span>
              </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Mahasiswa", val: data.mhsCount, icon: Users, color: "text-amber-500", glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]" },
                { label: "Total Dosen", val: data.dosenCount, icon: GraduationCap, color: "text-orange-500", glow: "shadow-[0_0_20px_rgba(234,88,12,0.2)]" },
                { label: "Mata Kuliah", val: data.mkCount, icon: BookOpen, color: "text-blue-500", glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]" },
                { label: "Presensi Hari Ini", val: data.presensiHariIni, icon: Activity, color: "text-green-500", glow: "shadow-[0_0_20px_rgba(34,197,94,0.2)]" },
              ].map((s, i) => (
                <TiltCard key={i} className={`border dark:border-white/5 border-stone-200 dark:border-white/5 ${s.glow}`}>
                  <div className="flex items-center gap-3 mb-3"><div className={`w-10 h-10 rounded-xl dark:bg-white/5 bg-stone-100 dark:bg-white/5 flex items-center justify-center ${s.color}`}><s.icon size={20} /></div></div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 uppercase tracking-wider font-bold">{s.label}</p>
                  <p className={`text-4xl font-black mt-1 ${s.color}`}>{s.val}</p>
                </TiltCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TiltCard className="lg:col-span-2 border dark:border-white/5 border-stone-200 dark:border-white/5">
                <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp size={20} className="text-amber-500" /> Grafik Kehadiran 7 Hari</h3></div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
              <TiltCard className="border dark:border-white/5 border-stone-200 dark:border-white/5">
                <h3 className="text-lg font-bold mb-4">Rasio Kehadiran</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? "#22c55e" : "#ef4444"} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0a0604", border: "1px solid #333", borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TiltCard>
            </div>
          </>)}

          {/* ===== TAB: DATA MAHASISWA ===== */}
          {activeTab === "Data Mahasiswa" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-black">Data <span className="text-amber-600 dark:text-amber-500">Mahasiswa</span></h1>
                <button onClick={() => { setIsEditMhs(false); setMhsForm({ nim: "", nama_mahasiswa: "", id_jurusan: "", id_semester: "", jenis_kelamin: "" }); setShowAddMhs(true); }} className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                  <Plus size={18} /> Tambah Mahasiswa
                </button>
              </div>

              {showAddMhs && (
                <TiltCard className="border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{isEditMhs ? "Edit Data Mahasiswa" : "Tambah Mahasiswa Baru"}</h3>
                    <button onClick={() => setShowAddMhs(false)} className="text-stone-600 dark:text-stone-400 hover:text-foreground"><X size={20} /></button>
                  </div>
                  {actionMsg && <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-3">{actionMsg}</p>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input disabled={isEditMhs} value={mhsForm.nim} onChange={e => setMhsForm({ ...mhsForm, nim: e.target.value })} placeholder="NIM Mahasiswa" className="dark:bg-stone-100 dark:bg-black/50 bg-white border border-stone-300 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white focus:border-amber-500 focus:outline-none disabled:opacity-50" />
                    <input value={mhsForm.nama_mahasiswa} onChange={e => setMhsForm({ ...mhsForm, nama_mahasiswa: e.target.value })} placeholder="Nama Lengkap Mahasiswa" className="dark:bg-stone-100 dark:bg-black/50 bg-white border border-stone-300 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white focus:border-amber-500 focus:outline-none" />
                    <select value={mhsForm.jenis_kelamin} onChange={e => setMhsForm({ ...mhsForm, jenis_kelamin: e.target.value })} className="dark:bg-stone-100 dark:bg-black/50 bg-white border border-stone-300 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white focus:border-amber-500 focus:outline-none">
                      <option value="">-- Pilih Jenis Kelamin --</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <select value={mhsForm.id_jurusan} onChange={e => setMhsForm({ ...mhsForm, id_jurusan: e.target.value })} className="dark:bg-stone-100 dark:bg-black/50 bg-white border border-stone-300 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white focus:border-amber-500 focus:outline-none">
                      <option value="">-- Pilih Jurusan --</option>
                      {(data.jurusan || []).map((j: any) => <option key={j.id_jurusan} value={j.id_jurusan}>{j.nama_jurusan}</option>)}
                    </select>
                    <select value={mhsForm.id_semester} onChange={e => setMhsForm({ ...mhsForm, id_semester: e.target.value })} className="dark:bg-stone-100 dark:bg-black/50 bg-white border border-stone-300 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white focus:border-amber-500 focus:outline-none">
                      <option value="">-- Pilih Semester --</option>
                      {(data.semester || []).map((s: any) => <option key={s.id_semester} value={s.id_semester}>{s.nama_semester}</option>)}
                    </select>
                  </div>
                  <button onClick={saveMahasiswa} className="mt-4 px-6 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors">Simpan Mahasiswa</button>
                  {!isEditMhs && <p className="text-xs text-stone-500 mt-3">* Password akun otomatis disetel ke: <strong>stikom22jkendari</strong></p>}
                </TiltCard>
              )}

              <TiltCard className="border border-stone-200 dark:border-white/5 bg-white dark:bg-transparent">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-white/5">
                      <th className="pb-3 font-medium">NIM</th><th className="pb-3 font-medium">Nama Lengkap</th><th className="pb-3 font-medium">JK</th><th className="pb-3 font-medium">Jurusan</th><th className="pb-3 font-medium">Semester</th><th className="pb-3 font-medium">Presensi</th><th className="pb-3 font-medium">Aksi</th>
                    </tr></thead>
                    <tbody>
                      {(data.mahasiswa || []).map((m: any, i: number) => (
                        <tr key={i} className="border-b border-stone-200 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-4 font-mono font-bold text-stone-800 dark:text-amber-400">{m.nim}</td>
                          <td className="py-4 font-bold text-stone-900 dark:text-white">{m.nama_mahasiswa}</td>
                          <td className="py-4">{m.jenis_kelamin || "-"}</td>
                          <td className="py-4">{m.jurusan?.nama_jurusan || "-"}</td>
                          <td className="py-4">{m.semester?.nama_semester || "-"}</td>
                          <td className="py-4"><span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-transparent">{m._count.presensi} kali hadir</span></td>
                          <td className="py-4 flex gap-2">
                            <button onClick={() => openEditMhs(m)} className="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 p-2 rounded-lg transition-colors"><Edit size={16} /></button>
                            <button onClick={() => deleteMahasiswa(m.nim)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!data.mahasiswa || data.mahasiswa.length === 0) && <p className="text-center py-8 text-stone-500 dark:text-stone-400">Belum ada mahasiswa terdaftar.</p>}
                </div>
              </TiltCard>
            </div>
          )}

          {/* ===== TAB: DATA DOSEN ===== */}
          {activeTab === "Data Dosen" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-black">Data <span className="text-orange-500">Dosen</span></h1>
                <button onClick={() => { setIsEditDosen(false); setDosenForm({ nidn: "", nama_dosen: "" }); setShowAddDosen(true); }} className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Plus size={18} /> Tambah Dosen
                </button>
              </div>

              {showAddDosen && (
                <TiltCard className="border border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{isEditDosen ? "Edit Data Dosen" : "Tambah Dosen Baru"}</h3>
                    <button onClick={() => setShowAddDosen(false)} className="text-stone-600 dark:text-stone-400 hover:text-foreground"><X size={20} /></button>
                  </div>
                  {actionMsg && <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-3">{actionMsg}</p>}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input disabled={isEditDosen} value={dosenForm.nidn} onChange={e => setDosenForm({ ...dosenForm, nidn: e.target.value })} placeholder="NIDN Dosen" className="flex-1 dark:bg-stone-100 dark:bg-black/50 bg-white border border-stone-300 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white focus:border-orange-500 focus:outline-none disabled:opacity-50" />
                    <input value={dosenForm.nama_dosen} onChange={e => setDosenForm({ ...dosenForm, nama_dosen: e.target.value })} placeholder="Nama Lengkap Dosen" className="flex-[2] dark:bg-stone-100 dark:bg-black/50 bg-white border border-stone-300 dark:border-white/10 rounded-xl p-3 text-stone-900 dark:text-white focus:border-orange-500 focus:outline-none" />
                    <button onClick={saveDosen} className="px-6 py-3 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-400 transition-colors">Simpan</button>
                  </div>
                  {!isEditDosen && <p className="text-xs text-stone-500 mt-3">* Password akun otomatis disetel ke: <strong>stikom22jkendari</strong></p>}
                </TiltCard>
              )}

              <TiltCard className="border border-stone-200 dark:border-white/5 bg-white dark:bg-transparent">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-stone-500 dark:text-stone-400 border-b dark:border-white/5 border-stone-200 dark:border-white/5">
                      <th className="pb-3 font-medium">NIDN</th><th className="pb-3 font-medium">Nama Dosen</th><th className="pb-3 font-medium">Total Sesi Presensi</th><th className="pb-3 font-medium">Aksi</th>
                    </tr></thead>
                    <tbody>
                      {(data.dosen || []).map((d: any, i: number) => (
                        <tr key={i} className="border-b dark:border-white/5 border-stone-200 dark:border-white/5 hover:dark:bg-white/5 bg-stone-100 dark:bg-white/5 transition-colors">
                          <td className="py-4 font-mono text-orange-600 dark:text-orange-400 font-bold">{d.nidn}</td>
                          <td className="py-4 font-bold">{d.nama_dosen}</td>
                          <td className="py-4"><span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20">{d._count.presensi} absensi tercatat</span></td>
                          <td className="py-4 flex gap-2">
                            <button onClick={() => openEditDosen(d)} className="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 p-2 rounded-lg transition-colors"><Edit size={16} /></button>
                            <button onClick={() => deleteDosen(d.nidn)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!data.dosen || data.dosen.length === 0) && <p className="text-center py-8 text-stone-500 dark:text-stone-400">Belum ada dosen terdaftar.</p>}
                </div>
              </TiltCard>
            </div>
          )}

          {/* ===== TAB: MANAJEMEN AKADEMIK (JURUSAN & SEMESTER) ===== */}
          {activeTab === "Manajemen" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <h1 className="text-3xl font-black">Manajemen <span className="text-emerald-500">Akademik</span></h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tabel Jurusan */}
                <TiltCard className="border border-stone-200 dark:border-white/5 bg-white dark:bg-transparent">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Database className="text-emerald-500" size={20} /> Data Jurusan</h3>
                  <div className="flex gap-2 mb-4">
                    <input value={jurusanForm.nama_jurusan} onChange={e => setJurusanForm({...jurusanForm, nama_jurusan: e.target.value})} placeholder="Nama Jurusan Baru" className="flex-1 border dark:border-white/10 dark:bg-black/50 p-2 rounded-xl text-sm" />
                    <button onClick={saveJurusan} className="bg-emerald-500 text-black px-4 py-2 rounded-xl font-bold hover:bg-emerald-400">{jurusanForm.id_jurusan ? "Ubah" : "Tambah"}</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {(data.jurusan || []).map((j: any) => (
                          <tr key={j.id_jurusan} className="border-b dark:border-white/5 border-stone-200">
                            <td className="py-2">{j.nama_jurusan}</td>
                            <td className="py-2 text-right">
                              <button onClick={() => setJurusanForm({ id_jurusan: j.id_jurusan.toString(), nama_jurusan: j.nama_jurusan })} className="text-blue-500 p-1 mx-1"><Edit size={14}/></button>
                              <button onClick={() => deleteJurusan(j.id_jurusan)} className="text-red-500 p-1"><Trash2 size={14}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TiltCard>

                {/* Tabel Semester */}
                <TiltCard className="border border-stone-200 dark:border-white/5 bg-white dark:bg-transparent">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Database className="text-emerald-500" size={20} /> Data Semester</h3>
                  <div className="flex gap-2 mb-4">
                    <input value={semesterForm.nama_semester} onChange={e => setSemesterForm({...semesterForm, nama_semester: e.target.value})} placeholder="Nama Semester Baru" className="flex-1 border dark:border-white/10 dark:bg-black/50 p-2 rounded-xl text-sm" />
                    <button onClick={saveSemester} className="bg-emerald-500 text-black px-4 py-2 rounded-xl font-bold hover:bg-emerald-400">{semesterForm.id_semester ? "Ubah" : "Tambah"}</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {(data.semester || []).map((s: any) => (
                          <tr key={s.id_semester} className="border-b dark:border-white/5 border-stone-200">
                            <td className="py-2">{s.nama_semester}</td>
                            <td className="py-2 text-right">
                              <button onClick={() => setSemesterForm({ id_semester: s.id_semester.toString(), nama_semester: s.nama_semester })} className="text-blue-500 p-1 mx-1"><Edit size={14}/></button>
                              <button onClick={() => deleteSemester(s.id_semester)} className="text-red-500 p-1"><Trash2 size={14}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TiltCard>
              </div>
            </div>
          )}

          {/* ===== TAB: MATA KULIAH ===== */}
          {activeTab === "Mata Kuliah" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-black">Mata <span className="text-blue-500">Kuliah</span></h1>
                <button onClick={() => { setIsEditMK(false); setMkForm({ kode_mk: "", nama_mk: "", sks: "", nidn: "", hari: "", waktu: "", ruangan: "" }); setShowAddMK(true); }} className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Plus size={18} /> Tambah MK
                </button>
              </div>

              {showAddMK && (
                <TiltCard className="border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{isEditMK ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}</h3>
                    <button onClick={() => setShowAddMK(false)} className="text-stone-600 dark:text-stone-300 hover:text-foreground"><X size={20} /></button>
                  </div>
                  {actionMsg && <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">{actionMsg}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input disabled={isEditMK} value={mkForm.kode_mk} onChange={e => setMkForm({ ...mkForm, kode_mk: e.target.value })} placeholder="Kode MK (cth: IF101)" className="dark:bg-stone-100 dark:bg-black/50 bg-white border dark:border-white/10 border-stone-200 dark:border-white/10 rounded-xl p-3 text-foreground focus:border-blue-500 focus:outline-none disabled:opacity-50" />
                    <input value={mkForm.nama_mk} onChange={e => setMkForm({ ...mkForm, nama_mk: e.target.value })} placeholder="Nama Mata Kuliah" className="dark:bg-stone-100 dark:bg-black/50 bg-white border dark:border-white/10 border-stone-200 dark:border-white/10 rounded-xl p-3 text-foreground focus:border-blue-500 focus:outline-none" />
                    <input value={mkForm.sks} onChange={e => setMkForm({ ...mkForm, sks: e.target.value })} placeholder="SKS" type="number" className="dark:bg-stone-100 dark:bg-black/50 bg-white border dark:border-white/10 border-stone-200 dark:border-white/10 rounded-xl p-3 text-foreground focus:border-blue-500 focus:outline-none" />
                    
                    <select value={mkForm.nidn} onChange={e => setMkForm({ ...mkForm, nidn: e.target.value })} className="dark:bg-stone-100 dark:bg-black/50 bg-white border dark:border-white/10 border-stone-200 dark:border-white/10 rounded-xl p-3 text-stone-600 dark:text-stone-300 focus:border-blue-500 focus:outline-none">
                      <option value="">Pilih Dosen Pengampu (Opsional)</option>
                      {(data.dosen || []).map((d: any) => <option key={d.nidn} value={d.nidn}>{d.nama_dosen}</option>)}
                    </select>
                    <select value={mkForm.hari} onChange={e => setMkForm({ ...mkForm, hari: e.target.value })} className="dark:bg-stone-100 dark:bg-black/50 bg-white border dark:border-white/10 border-stone-200 dark:border-white/10 rounded-xl p-3 text-stone-600 dark:text-stone-300 focus:border-blue-500 focus:outline-none">
                      <option value="">Pilih Hari (Opsional)</option>
                      {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <input value={mkForm.waktu} onChange={e => setMkForm({ ...mkForm, waktu: e.target.value })} placeholder="Waktu (cth: 10:00 - 12:30)" className="dark:bg-stone-100 dark:bg-black/50 bg-white border dark:border-white/10 border-stone-200 dark:border-white/10 rounded-xl p-3 text-foreground focus:border-blue-500 focus:outline-none" />
                    <input value={mkForm.ruangan} onChange={e => setMkForm({ ...mkForm, ruangan: e.target.value })} placeholder="Ruangan (cth: Lab Komputer 1)" className="dark:bg-stone-100 dark:bg-black/50 bg-white border dark:border-white/10 border-stone-200 dark:border-white/10 rounded-xl p-3 text-foreground focus:border-blue-500 focus:outline-none" />
                  </div>
                  <button onClick={saveMK} className="mt-4 px-6 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors">Simpan MK</button>
                </TiltCard>
              )}

              <TiltCard className="border dark:border-white/5 border-stone-200 dark:border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-stone-500 dark:text-stone-400 border-b dark:border-white/5 border-stone-200 dark:border-white/5">
                      <th className="pb-3 font-medium">Kode</th><th className="pb-3 font-medium">Nama MK</th><th className="pb-3 font-medium">SKS</th><th className="pb-3 font-medium">Dosen</th><th className="pb-3 font-medium">Jadwal & Ruang</th><th className="pb-3 font-medium">Aksi</th>
                    </tr></thead>
                    <tbody>
                      {(data.mataKuliah || []).map((mk: any, i: number) => (
                        <tr key={i} className="border-b dark:border-white/5 border-stone-200 dark:border-white/5 hover:dark:bg-white/5 bg-stone-100 dark:bg-white/5 transition-colors">
                          <td className="py-4 font-mono text-blue-600 dark:text-blue-400 font-bold">{mk.kode_mk}</td>
                          <td className="py-4 font-bold">{mk.nama_mk}</td>
                          <td className="py-4 text-stone-600 dark:text-stone-300">{mk.sks} SKS</td>
                          <td className="py-4 text-stone-600 dark:text-stone-300">{mk.dosen?.nama_dosen || <span className="text-zinc-600 italic">Belum ditentukan</span>}</td>
                          <td className="py-4 text-stone-600 dark:text-stone-300 text-xs">
                            {mk.hari ? `${mk.hari}, ${mk.waktu} (${mk.ruangan})` : <span className="text-zinc-600 italic">-</span>}
                          </td>
                          <td className="py-4 flex gap-2">
                            <button onClick={() => openEditMK(mk)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-500/10 p-2 rounded-lg transition-colors"><Edit size={16} /></button>
                            <button onClick={() => deleteMK(mk.kode_mk)} className="text-red-600 dark:text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!data.mataKuliah || data.mataKuliah.length === 0) && <p className="text-center py-8 text-stone-500 dark:text-stone-400">Belum ada mata kuliah. Klik "Tambah MK" untuk menambahkan.</p>}
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

              <TiltCard className="border dark:border-white/5 border-stone-200 dark:border-white/5 print:shadow-none">
                <div className="text-center mb-8 border-b dark:border-white/10 border-stone-200 dark:border-white/10 pb-6">
                  <h2 className="text-2xl font-black text-amber-500">STIKOM 22 JANUARI KENDARI</h2>
                  <p className="text-stone-600 dark:text-stone-300 mt-1">Laporan Rekapitulasi Presensi Mahasiswa</p>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Dicetak pada: {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="dark:bg-white/5 bg-stone-100 dark:bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-stone-600 dark:text-stone-300">Total Mahasiswa</p><p className="text-2xl font-black text-amber-500">{data.mhsCount}</p></div>
                  <div className="dark:bg-white/5 bg-stone-100 dark:bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-stone-600 dark:text-stone-300">Total Dosen</p><p className="text-2xl font-black text-orange-500">{data.dosenCount}</p></div>
                  <div className="dark:bg-white/5 bg-stone-100 dark:bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-stone-600 dark:text-stone-300">Mata Kuliah</p><p className="text-2xl font-black text-blue-500">{data.mkCount}</p></div>
                  <div className="dark:bg-white/5 bg-stone-100 dark:bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-stone-600 dark:text-stone-300">Total Presensi</p><p className="text-2xl font-black text-green-500">{data.totalPresensi}</p></div>
                </div>

                <h3 className="text-lg font-bold mb-4">Detail Presensi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-stone-500 dark:text-stone-400 border-b dark:border-white/5 border-stone-200 dark:border-white/5">
                      <th className="pb-3">No</th><th className="pb-3">NIM</th><th className="pb-3">Nama Mahasiswa</th><th className="pb-3">Dosen</th><th className="pb-3">Waktu</th><th className="pb-3">Status</th>
                    </tr></thead>
                    <tbody>
                      {(data.presensiTerbaru || []).map((p: any, i: number) => (
                        <tr key={i} className="border-b dark:border-white/5 border-stone-200 dark:border-white/5">
                          <td className="py-3 text-stone-500 dark:text-stone-400">{i + 1}</td>
                          <td className="py-3 font-mono text-amber-600 dark:text-amber-400">{p.nim}</td>
                          <td className="py-3">{p.mahasiswa?.nama_mahasiswa || "-"}</td>
                          <td className="py-3 text-stone-600 dark:text-stone-300">{p.dosen?.nama_dosen || "-"}</td>
                          <td className="py-3 text-stone-600 dark:text-stone-300">{new Date(p.waktu_absen).toLocaleString("id-ID")}</td>
                          <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === "Hadir" ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"}`}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-10 pt-6 border-t dark:border-white/10 border-stone-200 dark:border-white/10 text-right">
                  <p className="text-stone-500 dark:text-stone-400 text-sm">Kendari, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="text-stone-600 dark:text-stone-300 font-bold mt-1">Ketua STIKOM 22 Januari</p>
                  <div className="h-16" />
                  <p className="text-stone-600 dark:text-stone-300 font-bold border-t border-dashed border-zinc-700 inline-block pt-2 px-8">( ...................................... )</p>
                </div>
              </TiltCard>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-stikom-22j";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "ADMIN" && decoded.role !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const url = new URL(req.url);
    const id_jurusan = url.searchParams.get("id_jurusan");
    const id_semester = url.searchParams.get("id_semester");

    const mhsWhere: any = {};
    if (id_jurusan) mhsWhere.id_jurusan = parseInt(id_jurusan);
    if (id_semester) mhsWhere.id_semester = parseInt(id_semester);

    const mkWhere: any = {};
    if (id_jurusan) mkWhere.id_jurusan = parseInt(id_jurusan);
    if (id_semester) mkWhere.id_semester = parseInt(id_semester);

    const presensiWhere: any = {};
    if (id_jurusan || id_semester) {
      presensiWhere.mahasiswa = {};
      if (id_jurusan) presensiWhere.mahasiswa.id_jurusan = parseInt(id_jurusan);
      if (id_semester) presensiWhere.mahasiswa.id_semester = parseInt(id_semester);
    }

    const dosenWhere: any = {};
    if (id_jurusan || id_semester) {
      dosenWhere.matkul = { some: mkWhere };
    }

    const mhsCount = await prisma.tb_mahasiswa.count({ where: mhsWhere });
    const dosenCount = await prisma.tb_dosen.count({ where: dosenWhere });
    const mkCount = await prisma.tb_mata_kuliah.count({ where: mkWhere });
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const presensiHariIni = await prisma.tb_presensi.count({
      where: { waktu_absen: { gte: startOfDay }, ...presensiWhere }
    });

    const totalPresensi = await prisma.tb_presensi.count({ where: presensiWhere });

    // Data presensi 7 hari terakhir untuk grafik
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const presensi7Hari = await prisma.tb_presensi.findMany({
      where: { waktu_absen: { gte: sevenDaysAgo }, ...presensiWhere },
      select: { waktu_absen: true, status: true }
    });

    // Group by date
    const chartData: { [key: string]: { hadir: number; diluar: number } } = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      chartData[key] = { hadir: 0, diluar: 0 };
    }

    presensi7Hari.forEach((p) => {
      const key = new Date(p.waktu_absen).toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      if (chartData[key]) {
        if (p.status === "Hadir") chartData[key].hadir++;
        else chartData[key].diluar++;
      }
    });

    const chartArray = Object.entries(chartData).map(([name, val]) => ({
      name,
      hadir: val.hadir,
      diluar: val.diluar
    }));

    // Daftar mahasiswa
    const mahasiswa = await prisma.tb_mahasiswa.findMany({
      select: { 
        nim: true, 
        nama_mahasiswa: true, 
        jenis_kelamin: true,
        id_jurusan: true,
        id_semester: true,
        jurusan: { select: { nama_jurusan: true } },
        semester: { select: { nama_semester: true } },
        _count: { select: { presensi: true } } 
      },
      orderBy: { nama_mahasiswa: "asc" }
    });

    // Daftar dosen
    const dosen = await prisma.tb_dosen.findMany({
      select: {
        nidn: true,
        nama_dosen: true,
        _count: { select: { presensi: true } }
      },
      orderBy: { nama_dosen: "asc" }
    });

    // Daftar mata kuliah
    const mataKuliah = await prisma.tb_mata_kuliah.findMany({
      select: {
        kode_mk: true,
        nama_mk: true,
        sks: true,
        hari: true,
        waktu: true,
        ruangan: true,
        nidn: true,
        dosen: { select: { nama_dosen: true } },
        id_jurusan: true,
        id_semester: true,
        jurusan: { select: { nama_jurusan: true } },
        semester: { select: { nama_semester: true } }
      },
      orderBy: { nama_mk: "asc" }
    });

    // Daftar jurusan
    const jurusan = await prisma.tb_jurusan.findMany({
      orderBy: { id_jurusan: "asc" }
    });

    // Daftar semester
    const semester = await prisma.tb_semester.findMany({
      orderBy: { id_semester: "asc" }
    });

    // Daftar ruangan
    const ruangan = await prisma.tb_ruangan.findMany({
      orderBy: { kode_ruangan: "asc" }
    });

    // Daftar kuesioner
    const kuesioner = await prisma.tb_kuesioner.findMany({
      orderBy: { id_kuesioner: "asc" }
    });

    // Presensi terbaru
    const presensiTerbaru = await prisma.tb_presensi.findMany({
      take: 20,
      orderBy: { waktu_absen: "desc" },
      select: {
        nim: true,
        nidn: true,
        kode_mk: true,
        kode_ruangan: true,
        waktu_absen: true,
        status: true,
        mahasiswa: { select: { nama_mahasiswa: true } },
        dosen: { select: { nama_dosen: true } }
      }
    });

    return NextResponse.json({
      mhsCount, dosenCount, mkCount, presensiHariIni, totalPresensi,
      chartArray, mahasiswa, dosen, mataKuliah, presensiTerbaru, jurusan, semester, ruangan, kuesioner
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}

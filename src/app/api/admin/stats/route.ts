import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

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

    const mhsCount = await prisma.tb_mahasiswa.count();
    const dosenCount = await prisma.tb_dosen.count();
    const mkCount = await prisma.tb_mata_kuliah.count();
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const presensiHariIni = await prisma.tb_presensi.count({
      where: { waktu_absen: { gte: startOfDay } }
    });

    const totalPresensi = await prisma.tb_presensi.count();

    // Data presensi 7 hari terakhir untuk grafik
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const presensi7Hari = await prisma.tb_presensi.findMany({
      where: { waktu_absen: { gte: sevenDaysAgo } },
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
      include: { jurusan: true, semester: true, _count: { select: { presensi: true } } },
      orderBy: { nama_mahasiswa: "asc" }
    });

    // Daftar dosen
    const dosen = await prisma.tb_dosen.findMany({
      include: { _count: { select: { presensi: true } } },
      orderBy: { nama_dosen: "asc" }
    });

    // Daftar mata kuliah
    const mataKuliah = await prisma.tb_mata_kuliah.findMany({
      orderBy: { nama_mk: "asc" }
    });

    // Presensi terbaru
    const presensiTerbaru = await prisma.tb_presensi.findMany({
      take: 20,
      orderBy: { waktu_absen: "desc" },
      include: { mahasiswa: true, dosen: true }
    });

    return NextResponse.json({
      mhsCount, dosenCount, mkCount, presensiHariIni, totalPresensi,
      chartArray, mahasiswa, dosen, mataKuliah, presensiTerbaru
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}

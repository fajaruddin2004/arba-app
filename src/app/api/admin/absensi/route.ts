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
    const id_semester = url.searchParams.get("id_semester");
    const kode_mk = url.searchParams.get("kode_mk");
    const waktu = url.searchParams.get("waktu");
    const id_jurusan = url.searchParams.get("id_jurusan");

    let whereClause: any = {};
    if (id_semester && id_semester !== "Semua") {
      whereClause.mahasiswa = {
        ...whereClause.mahasiswa,
        id_semester: parseInt(id_semester)
      };
    }
    if (id_jurusan && id_jurusan !== "Semua") {
      whereClause.mahasiswa = {
        ...whereClause.mahasiswa,
        id_jurusan: parseInt(id_jurusan)
      };
    }
    if (kode_mk && kode_mk !== "Semua") {
      whereClause.kode_mk = kode_mk;
    }

    if (waktu && waktu !== "Semua") {
      const now = new Date();
      let startDate = new Date();
      if (waktu === "hari_ini") {
        startDate.setHours(0, 0, 0, 0);
        whereClause.waktu_absen = { gte: startDate };
      } else if (waktu === "minggu_ini") {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(startDate.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        whereClause.waktu_absen = { gte: startDate };
      } else if (waktu === "bulan_ini") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        whereClause.waktu_absen = { gte: startDate };
      } else if (waktu === "tahun_ini") {
        startDate = new Date(now.getFullYear(), 0, 1);
        whereClause.waktu_absen = { gte: startDate };
      }
    }

    const presensi = await prisma.tb_presensi.findMany({
      where: whereClause,
      orderBy: { waktu_absen: "desc" },
      include: {
        mahasiswa: {
          include: {
            semester: true,
            jurusan: true
          }
        },
        dosen: true,
        mata_kuliah: true,
        ruangan: true
      }
    });

    return NextResponse.json({ presensi }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}

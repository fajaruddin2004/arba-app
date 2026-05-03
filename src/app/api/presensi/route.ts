import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-stikom-22j";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Pastikan user adalah mahasiswa
    if (decoded.role !== "MAHASISWA") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const nim = decoded.username; // karena username diset sebagai NIM
    
    const { nidn, lat_mhs, long_mhs, status } = await req.json();

    if (!nidn || !lat_mhs || !long_mhs || !status) {
       return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Cek apakah hari ini mahasiswa sudah absen untuk dosen ini
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingPresensi = await prisma.tb_presensi.findFirst({
      where: {
        nim,
        nidn,
        waktu_absen: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existingPresensi) {
       return NextResponse.json({ message: "Anda sudah melakukan presensi untuk dosen ini hari ini" }, { status: 400 });
    }

    // Insert ke tb_presensi
    const newPresensi = await prisma.tb_presensi.create({
      data: {
        nim,
        nidn,
        lat_mhs: lat_mhs.toString(),
        long_mhs: long_mhs.toString(),
        status
      }
    });

    return NextResponse.json({ message: "Presensi berhasil dicatat", data: newPresensi }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}

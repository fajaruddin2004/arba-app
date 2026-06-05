import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nim, qr_token } = await req.json();

    if (!nim || !qr_token) {
      return NextResponse.json({ message: "NIM dan qr_token wajib diisi" }, { status: 400 });
    }

    // 1. Cari Sesi Kelas Aktif
    const sesi = await prisma.tb_sesi_kelas.findUnique({
      where: { qr_token },
      include: {
        dosen: true,
      }
    });

    if (!sesi || sesi.status !== "AKTIF") {
      return NextResponse.json({ message: "Sesi tidak valid atau sudah ditutup" }, { status: 400 });
    }

    // 2. Cari Mahasiswa (untuk memastikan dia ada)
    const mahasiswa = await prisma.tb_mahasiswa.findUnique({
      where: { nim }
    });

    if (!mahasiswa) {
      return NextResponse.json({ message: "Mahasiswa dengan NIM tersebut tidak ditemukan" }, { status: 404 });
    }

    // 3. Cek apakah Mahasiswa sudah absen di sesi ini
    const existingPresensi = await prisma.tb_presensi.findFirst({
      where: {
        nim,
        id_sesi: sesi.id_sesi
      }
    });

    if (existingPresensi) {
      return NextResponse.json({ message: "Mahasiswa ini sudah diabsenkan pada sesi ini" }, { status: 400 });
    }

    // 4. Catat Kehadiran Manual
    const presensi = await prisma.tb_presensi.create({
      data: {
        nim,
        nidn: sesi.nidn,
        id_sesi: sesi.id_sesi,
        kode_mk: null, // As per original structure, MK is referenced via Sesi mostly, or could fetch from Sesi
        lat_mhs: "0", // 0 = Manual
        long_mhs: "0", // 0 = Manual
        status: "Hadir", // Force Hadir
        waktu_absen: new Date(),
      }
    });

    return NextResponse.json({ 
      message: "Berhasil mengabsenkan mahasiswa secara manual",
      data: presensi 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Presensi manual error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem", error: error.message }, { status: 500 });
  }
}

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
    
    if (decoded.role !== "MAHASISWA") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const nim = decoded.username;
    
    const { qr_token, lat_mhs, long_mhs, status } = await req.json();

    if (!qr_token || lat_mhs === undefined || long_mhs === undefined) {
       return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // ========== VALIDASI GEOLOKASI DI SERVER ==========
    // Koordinat STIKOM 22 Januari Kendari (Google Maps verified)
    const kampusLat = -3.9987867;
    const kampusLng = 122.5177898;
    const radiusMaksimal = 150; // 150 meter (cukup besar untuk GPS di dalam gedung)

    // Rumus Haversine (server-side, tidak bisa dimanipulasi mahasiswa)
    const toRad = (x: number) => x * Math.PI / 180;
    const dLat = toRad(kampusLat - lat_mhs);
    const dLng = toRad(kampusLng - long_mhs);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat_mhs)) * Math.cos(toRad(kampusLat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const jarak = Math.round(6371e3 * c); // Jarak dalam meter
    
    // Server yang menentukan status, BUKAN client
    const statusPresensi = jarak <= radiusMaksimal ? "Hadir" : "Di Luar Radius";

    // Validate session via qr_token
    const sesi = await prisma.tb_sesi_kelas.findUnique({
      where: { qr_token }
    });

    if (!sesi) {
      return NextResponse.json({ message: "QR Code tidak valid atau sesi tidak ditemukan" }, { status: 400 });
    }

    // Check if session is still active
    if (sesi.status !== "AKTIF") {
      return NextResponse.json({ message: "Sesi kelas sudah ditutup oleh dosen" }, { status: 400 });
    }

    // Auto-close check: if session > 20 minutes old
    const sessionAge = Date.now() - new Date(sesi.waktu_buka).getTime();
    if (sessionAge > 20 * 60 * 1000) {
      await prisma.tb_sesi_kelas.update({
        where: { id_sesi: sesi.id_sesi },
        data: { status: "DITUTUP", waktu_tutup: new Date() }
      });
      return NextResponse.json({ message: "Sesi sudah berakhir (lebih dari 20 menit)" }, { status: 400 });
    }

    // Check if student already attended this session
    const existingPresensi = await prisma.tb_presensi.findFirst({
      where: { nim, id_sesi: sesi.id_sesi }
    });

    if (existingPresensi) {
       return NextResponse.json({ message: "Anda sudah absen untuk sesi ini" }, { status: 400 });
    }

    // Cari kode_mk dan ruangan dari tabel mata_kuliah berdasarkan nama_mk dan nidn
    const mk = await prisma.tb_mata_kuliah.findFirst({
      where: {
        nama_mk: sesi.nama_mk,
        nidn: sesi.nidn
      }
    });

    // Insert presensi linked to session (menggunakan status dari server, bukan client)
    const newPresensi = await prisma.tb_presensi.create({
      data: {
        nim,
        nidn: sesi.nidn,
        id_sesi: sesi.id_sesi,
        kode_mk: mk?.kode_mk || null,
        kode_ruangan: mk?.ruangan || null,
        lat_mhs: lat_mhs.toString(),
        long_mhs: long_mhs.toString(),
        status: statusPresensi  // Server-validated status
      }
    });

    return NextResponse.json({ 
      message: `Presensi berhasil dicatat! Status: ${statusPresensi} (Jarak: ${jarak}m)`, 
      data: newPresensi 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Presensi error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}

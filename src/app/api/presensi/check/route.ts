import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Token QR tidak valid" }, { status: 400 });
    }

    const sesi = await prisma.tb_sesi_kelas.findUnique({
      where: { qr_token: token },
      include: { dosen: { select: { nama_dosen: true } } }
    });

    if (!sesi) {
      return NextResponse.json({ message: "Sesi kelas tidak ditemukan atau QR Code salah" }, { status: 404 });
    }

    if (sesi.status !== "AKTIF") {
      return NextResponse.json({ message: "Sesi kelas ini sudah ditutup oleh Dosen" }, { status: 400 });
    }

    // Cari mata kuliah untuk mendapatkan sks dan detail lain
    const mk = await prisma.tb_mata_kuliah.findFirst({
      where: {
        nama_mk: sesi.nama_mk,
        nidn: sesi.nidn
      }
    });

    return NextResponse.json({
      sesi: {
        id_sesi: sesi.id_sesi,
        nama_mk: sesi.nama_mk,
        dosen: sesi.dosen?.nama_dosen || sesi.nidn,
        waktu_buka: sesi.waktu_buka,
        kode_mk: mk?.kode_mk || "-",
        sks: mk?.sks || "-",
        ruangan: mk?.ruangan || "-"
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: "Gagal memverifikasi QR Code", error: error.message }, { status: 500 });
  }
}

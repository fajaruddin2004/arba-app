import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-stikom-22j";

// Tambah mata kuliah baru
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "ADMIN" && decoded.role !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { kode_mk, nama_mk, sks, nidn } = await req.json();

    if (!kode_mk || !nama_mk || !sks) {
      return NextResponse.json({ message: "Semua field wajib diisi (Kode, Nama, SKS)" }, { status: 400 });
    }

    const existing = await prisma.tb_mata_kuliah.findUnique({ where: { kode_mk } });
    if (existing) {
      return NextResponse.json({ message: "Kode MK sudah terdaftar" }, { status: 400 });
    }

    const mk = await prisma.tb_mata_kuliah.create({
      data: { 
        kode_mk, 
        nama_mk, 
        sks: parseInt(sks),
        nidn: nidn || null
      }
    });

    return NextResponse.json({ message: "Mata Kuliah berhasil ditambahkan", data: mk }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal", error: error.message }, { status: 500 });
  }
}

// Hapus mata kuliah
export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "ADMIN" && decoded.role !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const kode_mk = searchParams.get("kode_mk");

    if (!kode_mk) {
      return NextResponse.json({ message: "Kode MK diperlukan" }, { status: 400 });
    }

    await prisma.tb_mata_kuliah.delete({ where: { kode_mk } });

    return NextResponse.json({ message: "Mata Kuliah berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal menghapus", error: error.message }, { status: 500 });
  }
}

// Ambil semua mata kuliah
export async function GET(req: Request) {
  try {
    const mk = await prisma.tb_mata_kuliah.findMany({
      include: { dosen: true },
      orderBy: { nama_mk: "asc" }
    });
    return NextResponse.json({ data: mk }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data", error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jurusan = await prisma.tb_jurusan.findMany({
      orderBy: { id_jurusan: "asc" }
    });
    return NextResponse.json({ success: true, data: jurusan });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "rahasia-stikom-22j");
    const userRole = decoded.role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const { nama_jurusan } = body;
    if (!nama_jurusan) return NextResponse.json({ success: false, message: "Nama jurusan wajib diisi" }, { status: 400 });

    const created = await prisma.tb_jurusan.create({
      data: { nama_jurusan }
    });
    return NextResponse.json({ success: true, message: "Jurusan berhasil ditambahkan", data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "rahasia-stikom-22j");
    const userRole = decoded.role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const { id_jurusan, nama_jurusan } = body;
    if (!id_jurusan || !nama_jurusan) return NextResponse.json({ success: false, message: "ID dan Nama jurusan wajib diisi" }, { status: 400 });

    const updated = await prisma.tb_jurusan.update({
      where: { id_jurusan: parseInt(id_jurusan) },
      data: { nama_jurusan }
    });
    return NextResponse.json({ success: true, message: "Jurusan berhasil diubah", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "rahasia-stikom-22j");
    const userRole = decoded.role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID jurusan diperlukan" }, { status: 400 });

    await prisma.tb_jurusan.delete({
      where: { id_jurusan: parseInt(id) }
    });
    return NextResponse.json({ success: true, message: "Jurusan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

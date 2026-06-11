import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const semester = await prisma.tb_semester.findMany({
      orderBy: { id_semester: "asc" }
    });
    return NextResponse.json({ success: true, data: semester });
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
    const { nama_semester } = body;
    if (!nama_semester) return NextResponse.json({ success: false, message: "Nama semester wajib diisi" }, { status: 400 });

    const created = await prisma.tb_semester.create({
      data: { nama_semester }
    });
    return NextResponse.json({ success: true, message: "Semester berhasil ditambahkan", data: created });
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
    const { id_semester, nama_semester } = body;
    if (!id_semester || !nama_semester) return NextResponse.json({ success: false, message: "ID dan Nama semester wajib diisi" }, { status: 400 });

    const updated = await prisma.tb_semester.update({
      where: { id_semester: parseInt(id_semester) },
      data: { nama_semester }
    });
    return NextResponse.json({ success: true, message: "Semester berhasil diubah", data: updated });
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
    if (!id) return NextResponse.json({ success: false, message: "ID semester diperlukan" }, { status: 400 });

    await prisma.tb_semester.delete({
      where: { id_semester: parseInt(id) }
    });
    return NextResponse.json({ success: true, message: "Semester berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

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

    const data = await req.json();
    if (!data.pertanyaan) {
      return NextResponse.json({ message: "Pertanyaan wajib diisi" }, { status: 400 });
    }

    const kuesioner = await prisma.tb_kuesioner.create({
      data: {
        pertanyaan: data.pertanyaan,
        status_aktif: "Y"
      }
    });
    
    return NextResponse.json(kuesioner, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
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

    const data = await req.json();

    // Bulk toggle status
    if (data.bulkToggle) {
      const updated = await prisma.tb_kuesioner.updateMany({
        data: { status_aktif: data.bulkToggle }
      });
      return NextResponse.json({ count: updated.count }, { status: 200 });
    }

    if (!data.id_kuesioner) {
      return NextResponse.json({ message: "ID Kuesioner wajib disertakan" }, { status: 400 });
    }

    // Toggle status if only id is provided
    if (data.toggleStatus) {
      const current = await prisma.tb_kuesioner.findUnique({ where: { id_kuesioner: parseInt(data.id_kuesioner) } });
      if (!current) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
      
      const updated = await prisma.tb_kuesioner.update({
        where: { id_kuesioner: parseInt(data.id_kuesioner) },
        data: { status_aktif: current.status_aktif === "Y" ? "N" : "Y" }
      });
      return NextResponse.json(updated, { status: 200 });
    }

    // Regular edit
    if (!data.pertanyaan) {
      return NextResponse.json({ message: "Pertanyaan wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.tb_kuesioner.update({
      where: { id_kuesioner: parseInt(data.id_kuesioner) },
      data: { pertanyaan: data.pertanyaan }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ message: "ID Kuesioner diperlukan" }, { status: 400 });
    }

    await prisma.tb_kuesioner.delete({
      where: { id_kuesioner: parseInt(id) }
    });

    return NextResponse.json({ message: "Pertanyaan berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal menghapus kuesioner", error: error.message }, { status: 500 });
  }
}

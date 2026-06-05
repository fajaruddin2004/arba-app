import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

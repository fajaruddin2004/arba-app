import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const dosen = await prisma.tb_dosen.findMany({
      include: { user: true },
      orderBy: { nidn: "asc" }
    });
    return NextResponse.json({ success: true, data: dosen });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nidn, nama_dosen } = body;

    if (!nidn || !nama_dosen) {
      return NextResponse.json({ success: false, message: "Semua kolom wajib diisi" }, { status: 400 });
    }

    // Default password as requested
    const hashedPassword = await bcrypt.hash("stikom22jkendari", 10);

    const newUser = await prisma.tb_user.create({
      data: {
        username: nidn,
        password: hashedPassword,
        role: "DOSEN",
        dosen: {
          create: {
            nidn,
            nama_dosen,
          }
        }
      },
      include: { dosen: true }
    });

    return NextResponse.json({ success: true, message: "Dosen berhasil ditambahkan", data: newUser });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, message: "NIDN sudah terdaftar" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { nidn, nama_dosen } = body;

    if (!nidn || !nama_dosen) {
      return NextResponse.json({ success: false, message: "Semua kolom wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.tb_dosen.update({
      where: { nidn },
      data: { nama_dosen }
    });

    return NextResponse.json({ success: true, message: "Dosen berhasil diubah", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nidn = searchParams.get("nidn");

    if (!nidn) {
      return NextResponse.json({ success: false, message: "NIDN diperlukan" }, { status: 400 });
    }

    const dosen = await prisma.tb_dosen.findUnique({ where: { nidn } });
    if (!dosen) {
       return NextResponse.json({ success: false, message: "Dosen tidak ditemukan" }, { status: 404 });
    }

    // Delete user will cascade delete dosen
    await prisma.tb_user.delete({
      where: { id_user: dosen.id_user }
    });

    return NextResponse.json({ success: true, message: "Dosen berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "rahasia-stikom-22j");
    const userRole = decoded.role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "rahasia-stikom-22j");
    const userRole = decoded.role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "rahasia-stikom-22j");
    const userRole = decoded.role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

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

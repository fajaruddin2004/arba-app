import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-stikom-22j";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "ADMIN" && decoded.role !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { nim, nama_mahasiswa } = await req.json();

    if (!nim || !nama_mahasiswa) {
      return NextResponse.json({ message: "NIM dan Nama Mahasiswa wajib diisi" }, { status: 400 });
    }

    // Validate NIM is numeric and at least 8 characters
    if (!/^\d{8,}$/.test(nim)) {
      return NextResponse.json({ message: "NIM harus berupa angka dan minimal 8 karakter" }, { status: 400 });
    }

    // Check if user or mahasiswa already exists
    const existingMhs = await prisma.tb_mahasiswa.findUnique({ where: { nim } });
    if (existingMhs) {
      return NextResponse.json({ message: "Mahasiswa dengan NIM ini sudah terdaftar" }, { status: 400 });
    }

    const existingUser = await prisma.tb_user.findUnique({ where: { username: nim } });
    if (existingUser) {
      return NextResponse.json({ message: "Username/NIM sudah dipakai di sistem" }, { status: 400 });
    }

    // Hash default password
    const defaultPassword = await bcrypt.hash("stikom123", 10);

    // Use interactive transaction to guarantee consistency
    await prisma.$transaction(async (tx) => {
      // Create User first to get the ID
      const newUser = await tx.tb_user.create({
        data: {
          username: nim,
          password: defaultPassword,
          role: "MAHASISWA",
        }
      });

      // Then create Mahasiswa using that ID
      await tx.tb_mahasiswa.create({
        data: {
          nim,
          nama_mahasiswa,
          id_user: newUser.id_user,
        }
      });
    });

    return NextResponse.json({ message: "Mahasiswa berhasil ditambahkan dengan password default: stikom123" }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}

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
    const nim = searchParams.get("nim");
    if (!nim) return NextResponse.json({ message: "NIM diperlukan" }, { status: 400 });

    await prisma.$transaction([
      prisma.tb_mahasiswa.delete({ where: { nim } }),
      prisma.tb_user.delete({ where: { username: nim } })
    ]);

    return NextResponse.json({ message: "Mahasiswa berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-stikom-22j";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "MAHASISWA") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const nim = decoded.username;
    const { foto_profil } = await req.json();

    if (!foto_profil) {
       return NextResponse.json({ message: "Data foto tidak ditemukan" }, { status: 400 });
    }

    const updated = await prisma.tb_mahasiswa.update({
      where: { nim },
      data: { foto_profil }
    });

    return NextResponse.json({ message: "Foto profil berhasil diperbarui", foto_profil: updated.foto_profil }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal memperbarui profil", error: error.message }, { status: 500 });
  }
}

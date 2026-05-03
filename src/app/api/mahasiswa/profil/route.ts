import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-stikom-22j";

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== "MAHASISWA") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { ipk } = await req.json();

    if (ipk === undefined || isNaN(parseFloat(ipk))) {
      return NextResponse.json({ message: "IPK tidak valid" }, { status: 400 });
    }

    const updated = await prisma.tb_mahasiswa.update({
      where: { id_user: decoded.userId },
      data: { ipk: parseFloat(ipk) }
    });

    return NextResponse.json({ message: "Profil berhasil diperbarui", data: updated }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}

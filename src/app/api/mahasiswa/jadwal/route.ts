import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-stikom-22j";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "MAHASISWA") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const nim = decoded.username;

    const mhs = await prisma.tb_mahasiswa.findUnique({
      where: { nim }
    });

    if (!mhs) {
       return NextResponse.json({ message: "Mahasiswa tidak ditemukan" }, { status: 404 });
    }

    const { id_jurusan, id_semester } = mhs;

    const matkul = await prisma.tb_mata_kuliah.findMany({
      where: {
        OR: [
          { id_jurusan: id_jurusan },
          { id_jurusan: null }
        ],
        id_semester: id_semester
      },
      include: {
        dosen: { select: { nama_dosen: true } }
      },
      orderBy: { hari: "asc" }
    });

    return NextResponse.json({ data: matkul }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data jadwal", error: error.message }, { status: 500 });
  }
}

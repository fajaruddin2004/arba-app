import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-stikom-22j";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const user = await prisma.tb_user.findUnique({
      where: { id_user: userId },
      select: {
        id_user: true,
        username: true,
        role: true,
        mahasiswa: {
          select: {
            nim: true,
            nama_mahasiswa: true,
            id_jurusan: true,
            foto_profil: true,
            id_semester: true,
            jurusan: {
              select: {
                nama_jurusan: true,
                matkul: true
              }
            },
            semester: {
              select: {
                nama_semester: true,
                matkul: true
              }
            },
            presensi: {
              take: 5,
              orderBy: { waktu_absen: "desc" },
              include: { 
                dosen: { select: { nama_dosen: true } },
                mata_kuliah: { select: { nama_mk: true } }
              }
            }
          }
        },
        dosen: {
          select: {
            nidn: true,
            nama_dosen: true,
            foto_profil: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Invalid token", error: error.message }, { status: 401 });
  }
}

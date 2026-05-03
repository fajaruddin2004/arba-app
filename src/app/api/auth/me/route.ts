import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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
      include: {
        mahasiswa: {
          include: {
            presensi: {
              include: { dosen: true },
              orderBy: { waktu_absen: "desc" }
            }
          }
        },
        dosen: {
          include: {
            presensi: {
              include: { mahasiswa: true },
              orderBy: { waktu_absen: "desc" }
            }
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

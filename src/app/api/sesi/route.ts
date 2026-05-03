import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-stikom-22j";

// Helper: get user from token
async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// GET: Get active session for a dosen, or all active sessions
export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const nidn = searchParams.get("nidn");

    // Auto-close sessions older than 20 minutes
    await prisma.tb_sesi_kelas.updateMany({
      where: {
        status: "AKTIF",
        waktu_buka: { lt: new Date(Date.now() - 20 * 60 * 1000) }
      },
      data: {
        status: "DITUTUP",
        waktu_tutup: new Date()
      }
    });

    if (nidn) {
      // Get active session for specific dosen
      const sesi = await prisma.tb_sesi_kelas.findFirst({
        where: { nidn, status: "AKTIF" },
        include: {
          presensi: {
            include: { mahasiswa: true },
            orderBy: { waktu_absen: "desc" }
          }
        }
      });
      return NextResponse.json({ sesi });
    }

    // Get all active sessions (for admin)
    const sessions = await prisma.tb_sesi_kelas.findMany({
      where: { status: "AKTIF" },
      include: {
        dosen: true,
        _count: { select: { presensi: true } }
      },
      orderBy: { waktu_buka: "desc" }
    });
    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Sesi GET error:", error);
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}

// POST: Open new session
export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== "DOSEN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { nama_mk } = await req.json();
    if (!nama_mk) {
      return NextResponse.json({ message: "Pilih mata kuliah!" }, { status: 400 });
    }

    // Get dosen data
    const dosen = await prisma.tb_dosen.findFirst({
      where: { id_user: user.userId }
    });
    if (!dosen) return NextResponse.json({ message: "Dosen not found" }, { status: 404 });

    // Close any existing active session for this dosen
    await prisma.tb_sesi_kelas.updateMany({
      where: { nidn: dosen.nidn, status: "AKTIF" },
      data: { status: "DITUTUP", waktu_tutup: new Date() }
    });

    // Generate unique QR token
    const qr_token = crypto.randomBytes(16).toString("hex");

    // Create new session
    const sesi = await prisma.tb_sesi_kelas.create({
      data: {
        nidn: dosen.nidn,
        nama_mk,
        qr_token
      },
      include: {
        presensi: {
          include: { mahasiswa: true }
        }
      }
    });

    return NextResponse.json({
      message: "Sesi dibuka!",
      sesi
    }, { status: 201 });
  } catch (error: any) {
    console.error("Sesi POST error:", error);
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}

// PATCH: Close session
export async function PATCH(req: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id_sesi } = await req.json();

    const sesi = await prisma.tb_sesi_kelas.update({
      where: { id_sesi },
      data: { status: "DITUTUP", waktu_tutup: new Date() }
    });

    return NextResponse.json({ message: "Sesi ditutup!", sesi });
  } catch (error: any) {
    console.error("Sesi PATCH error:", error);
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}

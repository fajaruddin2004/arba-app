import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const result = await prisma.tb_presensi.deleteMany({});
    return NextResponse.json({ message: "Berhasil menghapus data presensi", count: result.count }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal", error: error.message }, { status: 500 });
  }
}

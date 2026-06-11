import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.kode_ruangan || !data.nama_ruangan) {
      return NextResponse.json({ message: "Kode dan Nama Ruangan wajib diisi" }, { status: 400 });
    }

    const exists = await prisma.tb_ruangan.findUnique({
      where: { kode_ruangan: data.kode_ruangan }
    });

    if (exists && !data.isEdit) {
      return NextResponse.json({ message: "Kode Ruangan sudah digunakan" }, { status: 400 });
    }

    if (data.isEdit) {
      const ruangan = await prisma.tb_ruangan.update({
        where: { kode_ruangan: data.original_kode },
        data: { 
          kode_ruangan: data.kode_ruangan,
          nama_ruangan: data.nama_ruangan 
        }
      });
      return NextResponse.json(ruangan, { status: 200 });
    } else {
      const ruangan = await prisma.tb_ruangan.create({
        data: {
          kode_ruangan: data.kode_ruangan,
          nama_ruangan: data.nama_ruangan
        }
      });
      return NextResponse.json(ruangan, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kode = searchParams.get("kode_ruangan");

    if (!kode) {
      return NextResponse.json({ message: "Kode ruangan diperlukan" }, { status: 400 });
    }

    await prisma.tb_ruangan.delete({
      where: { kode_ruangan: kode }
    });

    return NextResponse.json({ message: "Ruangan berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal menghapus ruangan", error: error.message }, { status: 500 });
  }
}

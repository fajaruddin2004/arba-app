import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "tb_mata_kuliah" ADD COLUMN IF NOT EXISTS "hari" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "tb_mata_kuliah" ADD COLUMN IF NOT EXISTS "waktu" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "tb_mata_kuliah" ADD COLUMN IF NOT EXISTS "ruangan" TEXT;`);
    console.log("Added hari, waktu, ruangan to tb_mata_kuliah");
  } catch (e: any) {
    console.error(e.message);
  }
}

main().finally(() => prisma.$disconnect());

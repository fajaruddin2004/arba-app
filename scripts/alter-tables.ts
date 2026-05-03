import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "tb_mata_kuliah" ADD COLUMN IF NOT EXISTS "nidn" TEXT;`);
    console.log("Added nidn to tb_mata_kuliah");
  } catch (e: any) {
    console.error(e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "tb_mahasiswa" ADD COLUMN IF NOT EXISTS "ipk" DOUBLE PRECISION DEFAULT 0;`);
    console.log("Added ipk to tb_mahasiswa");
  } catch (e: any) {
    console.error(e.message);
  }
}

main().finally(() => prisma.$disconnect());

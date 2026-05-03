import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await prisma.tb_presensi.deleteMany({});
  console.log("Data presensi duplikat berhasil dihapus. Total:", result.count);
}

main().finally(() => process.exit(0));

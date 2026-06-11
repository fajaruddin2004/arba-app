require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus semua data dari database...");

  // Menghapus data dari tabel yang bergantung pada tabel lain terlebih dahulu (child tables)
  await prisma.tb_evaluasi.deleteMany();
  await prisma.tb_presensi.deleteMany();
  await prisma.tb_sesi_kelas.deleteMany();
  await prisma.tb_mata_kuliah.deleteMany();
  
  // Kemudian hapus data master
  await prisma.tb_mahasiswa.deleteMany();
  await prisma.tb_dosen.deleteMany();
  
  // Hapus data referensi
  await prisma.tb_ruangan.deleteMany();
  await prisma.tb_kuesioner.deleteMany();
  await prisma.tb_semester.deleteMany();
  await prisma.tb_jurusan.deleteMany();
  await prisma.tb_koordinat_kampus.deleteMany();

  // Terakhir hapus user master
  await prisma.tb_user.deleteMany();

  console.log("Semua data berhasil dihapus!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

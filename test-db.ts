import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const mhs = await prisma.tb_mahasiswa.findUnique({
    where: { nim: '2320557052' }
  });
  console.log('Mahasiswa:', mhs);
  
  if (!mhs) return;

  const mkMatch = await prisma.tb_mata_kuliah.findMany({
    where: {
      id_jurusan: mhs.id_jurusan,
      id_semester: mhs.id_semester
    }
  });
  console.log('Mata Kuliah untuk Mahasiswa:', mkMatch);

  const mkAll = await prisma.tb_mata_kuliah.findMany();
  console.log('Semua Mata Kuliah:', mkAll);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

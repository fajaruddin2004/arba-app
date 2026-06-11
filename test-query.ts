import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.tb_user.findFirst({
      where: { role: "MAHASISWA" },
      select: {
        id_user: true,
        username: true,
        role: true,
        mahasiswa: {
          select: {
            nim: true,
            nama_mahasiswa: true,
            foto_profil: true,
            id_jurusan: true,
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
              include: { dosen: { select: { nama_dosen: true } } }
            }
          }
        }
      }
    });
    console.log(JSON.stringify(user, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();

import { config } from "dotenv";
config();
import { prisma } from './src/lib/prisma';
import bcrypt from "bcryptjs";

async function main() {
  const username = '2320557052';
  
  const user = await prisma.tb_user.findUnique({ where: { username } });
  
  if (!user) {
    console.log("Mahasiswa tidak ditemukan di database. Pastikan sudah didaftarkan lewat Admin Panel.");
  } else {
    const newPassword = await bcrypt.hash("stikom22jkendari", 10);
    await prisma.tb_user.update({
      where: { username },
      data: { password: newPassword }
    });
    console.log("Password mahasiswa berhasil direset menjadi: stikom22jkendari");
  }
}
main().finally(() => process.exit(0));

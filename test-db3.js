require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
main().finally(() => {
  prisma.$disconnect();
  pool.end();
});

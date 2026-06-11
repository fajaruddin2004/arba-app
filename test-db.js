const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.tb_user.findUnique({ where: { username: '2320557052' } });
  console.log('User:', user);
}
main().finally(() => prisma.$disconnect());

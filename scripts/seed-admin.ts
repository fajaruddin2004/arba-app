import { config } from "dotenv";
config(); // Load environment variables from .env

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Starting to seed Admin account...");

  const adminUsername = "admin";
  const adminPassword = await bcrypt.hash("admin123", 10);

  // Check if admin already exists
  const existingAdmin = await prisma.tb_user.findUnique({
    where: { username: adminUsername },
  });

  if (existingAdmin) {
    console.log("Admin account already exists.");
  } else {
    await prisma.tb_user.create({
      data: {
        username: adminUsername,
        password: adminPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin account created successfully: admin / admin123");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

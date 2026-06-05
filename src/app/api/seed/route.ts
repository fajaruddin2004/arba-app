import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const adminUsername = "admin";
    
    const existingAdmin = await prisma.tb_user.findUnique({
      where: { username: adminUsername },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin account already exists." });
    }

    const adminPassword = await bcrypt.hash("admin123", 10);
    
    await prisma.tb_user.create({
      data: {
        username: adminUsername,
        password: adminPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ message: "Admin account created successfully: admin / admin123" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ message: "Error seeding admin", error: error.message }, { status: 500 });
  }
}

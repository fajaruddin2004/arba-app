import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-stikom-22j";

export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ message: "Semua field harus diisi termasuk role login" }, { status: 400 });
    }

    const user = await prisma.tb_user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Pimpinan can login via Admin role selection, but otherwise role must match
    if (user.role?.toUpperCase() !== role?.toUpperCase() && !(user.role?.toUpperCase() === "PIMPINAN" && role?.toUpperCase() === "ADMIN")) {
      return NextResponse.json({ message: "Akun ini tidak terdaftar sebagai " + role }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id_user, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      role: user.role
    }, { status: 200 });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
  }
}

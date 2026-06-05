import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nama, email, password, nim_nidn, role } = await req.json();

    if (!nama || !email || !password || !nim_nidn || !role) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    if (role === "MAHASISWA") {
      return NextResponse.json({ message: "Pendaftaran Mahasiswa hanya dapat dilakukan oleh Admin." }, { status: 403 });
    }

    // Validasi NIM / NIDN / NIP
    if (role === "DOSEN") {
      if (!nim_nidn) {
        return NextResponse.json({ message: "NIM / NIDN wajib diisi" }, { status: 400 });
      }
    }
    
    if (nim_nidn) {
      if (nim_nidn.length < 7 || !/^\d+$/.test(nim_nidn)) {
        return NextResponse.json({ message: "NIM / NIDN / NIP harus berupa angka dan minimal 7 karakter" }, { status: 400 });
      }
    }

    // Gunakan nim_nidn sebagai username jika diisi, jika tidak fallback ke email
    const username = nim_nidn || email;


    // Check if user exists
    const existingUser = await prisma.tb_user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.tb_user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    // Create role-specific data
    if (role === "MAHASISWA") {
      await prisma.tb_mahasiswa.create({
        data: {
          nim: username,
          id_user: newUser.id_user,
          nama_mahasiswa: nama,
        },
      });
    } else if (role === "DOSEN") {
      await prisma.tb_dosen.create({
        data: {
          nidn: username,
          id_user: newUser.id_user,
          nama_dosen: nama,
        },
      });
    }

    return NextResponse.json({ message: "User created successfully", user: { username, role } }, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
  }
}

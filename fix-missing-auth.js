const fs = require('fs');
const path = require('path');

const API_ADMIN_DIR = path.join(__dirname, 'src/app/api/admin');

const filesToFix = [
  'dosen/route.ts',
  'jurusan/route.ts',
  'semester/route.ts',
  'ruangan/route.ts',
  'kuesioner/route.ts'
];

const imports = `import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";`;

const authBlock = `
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "rahasia-stikom-22j");
    const userRole = decoded.role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }
`;

filesToFix.forEach(relPath => {
  const filePath = path.join(API_ADMIN_DIR, relPath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix imports
  if (!content.includes('import { cookies }')) {
    content = content.replace('import { NextResponse } from "next/server";', imports);
  } else if (!content.includes('import jwt')) {
    content = content.replace('import { cookies } from "next/headers";', 'import { cookies } from "next/headers";\nimport jwt from "jsonwebtoken";');
  }

  // Insert auth check in POST, PUT, DELETE
  ['POST', 'PUT', 'DELETE'].forEach(method => {
    const regex = new RegExp(`export async function ${method}\\([^\\)]*\\)\\s*\\{\\s*try\\s*\\{`, 'g');
    content = content.replace(regex, match => {
      return match + authBlock;
    });
  });

  fs.writeFileSync(filePath, content);
  console.log(`Secured ${relPath}`);
});

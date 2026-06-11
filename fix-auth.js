const fs = require('fs');
const path = require('path');

const API_ADMIN_DIR = path.join(__dirname, 'src/app/api/admin');
const LOGIN_ROUTE = path.join(__dirname, 'src/app/api/auth/login/route.ts');

const replaceStr = `const userRole = decoded.role?.toUpperCase();\n    if (userRole !== "ADMIN" && userRole !== "PIMPINAN") {`;
const searchStr = `if (decoded.role !== "ADMIN" && decoded.role !== "PIMPINAN") {`;

// 1. Fix login/route.ts
let loginCode = fs.readFileSync(LOGIN_ROUTE, 'utf8');
loginCode = loginCode.replace(
  `if (user.role !== role && !(user.role === "PIMPINAN" && role === "ADMIN")) {`,
  `if (user.role?.toUpperCase() !== role?.toUpperCase() && !(user.role?.toUpperCase() === "PIMPINAN" && role?.toUpperCase() === "ADMIN")) {`
);
fs.writeFileSync(LOGIN_ROUTE, loginCode);

// 2. Fix admin routes
const files = [];
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('route.ts')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const routeFiles = walkSync(API_ADMIN_DIR);

const authSnippet = `
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "rahasia-stikom-22j");
    const userRole = decoded.role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "PIMPINAN") {
      return NextResponse.json({ message: "Akses ditolak: Role = " + decoded.role }, { status: 403 });
    }
`;

routeFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace existing check with case-insensitive check
  content = content.replace(/if\s*\(\s*decoded\.role\s*!==\s*"ADMIN"\s*&&\s*decoded\.role\s*!==\s*"PIMPINAN"\s*\)\s*\{/g, replaceStr);

  // If a file doesn't have authentication, we should add it
  // But wait, it's easier to just do it manually for the files we know or just fix the ones that have it first.
  // We'll leave adding auth to other files for a separate step to avoid breaking them.

  fs.writeFileSync(file, content);
});

console.log("Fixed auth checks.");

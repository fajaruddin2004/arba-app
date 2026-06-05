const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/dashboard/page.tsx',
  'src/app/dosen/dashboard/page.tsx',
  'src/app/mahasiswa/dashboard/page.tsx',
];

const replacements = [
  { search: /text-amber-400/g, replace: 'text-amber-600 dark:text-amber-400' },
  { search: /text-orange-400/g, replace: 'text-orange-600 dark:text-orange-400' },
  { search: /text-blue-400/g, replace: 'text-blue-600 dark:text-blue-400' },
  { search: /text-green-400/g, replace: 'text-green-600 dark:text-green-400' },
  { search: /text-red-400/g, replace: 'text-red-600 dark:text-red-400' },
  { search: /text-foreground\/50/g, replace: 'text-stone-500 dark:text-stone-400' },
  { search: /text-foreground\/60/g, replace: 'text-stone-600 dark:text-stone-300' },
  { search: /bg-black\/5/g, replace: 'bg-stone-100 dark:bg-white/5' },
  { search: /border-black\/5/g, replace: 'border-stone-200 dark:border-white/5' },
  { search: /border-black\/10/g, replace: 'border-stone-200 dark:border-white/10' },
  { search: /<ResponsiveContainer width="100%" height="100%">/g, replace: '<ResponsiveContainer width="100%" height="100%" minWidth={0}>' }
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.search, r.replace);
    });
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});

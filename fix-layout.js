const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/dashboard/page.tsx',
  'src/app/dosen/dashboard/page.tsx',
  'src/app/mahasiswa/dashboard/page.tsx',
];

const replacements = [
  { 
    search: /className="min-h-screen bg-background text-foreground flex flex-col md:flex-row/g, 
    replace: 'className="h-screen bg-background text-foreground flex flex-col md:flex-row' 
  },
  {
    search: /h-auto md:h-screen sticky top-0 bg-background\/80/g,
    replace: 'h-auto md:h-full flex-shrink-0 bg-background/80'
  },
  {
    search: /<main className="flex-1 p-6 md:p-10 relative overflow-y-auto/g,
    replace: '<main className="flex-1 p-6 md:p-10 relative overflow-y-auto' // no change needed, just making sure it's there
  }
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

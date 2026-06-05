const fs = require('fs');
const path = require('path');

const files = [
  'src/app/mahasiswa/dashboard/page.tsx',
  'src/app/dosen/dashboard/page.tsx',
  'src/app/admin/dashboard/page.tsx'
];

const replacements = [
  { regex: /\bbg-\[#050301\]\b/g, replacement: 'bg-background' },
  { regex: /\bbg-espresso\b/g, replacement: 'bg-background' },
  { regex: /\bbg-zinc-800\b/g, replacement: 'dark:bg-zinc-800 bg-zinc-100' },
  { regex: /\bbg-\[#0a0604\]\b/g, replacement: 'dark:bg-[#0a0604] bg-white' },
  { regex: /(?<!dark:)\btext-white\b/g, replacement: 'text-foreground dark:text-white' },
  { regex: /(?<!dark:)\btext-zinc-300\b/g, replacement: 'text-foreground/80 dark:text-zinc-300' },
  { regex: /(?<!dark:)\btext-zinc-400\b/g, replacement: 'text-foreground/60 dark:text-zinc-400' },
  { regex: /(?<!dark:)\btext-zinc-500\b/g, replacement: 'text-foreground/50 dark:text-zinc-500' },
  { regex: /(?<!dark:)\btext-stone-300\b/g, replacement: 'text-foreground/80 dark:text-stone-300' },
  { regex: /(?<!dark:)\btext-stone-400\b/g, replacement: 'text-foreground/70 dark:text-stone-400' },
  { regex: /(?<!dark:)\btext-stone-500\b/g, replacement: 'text-foreground/50 dark:text-stone-500' },
  { regex: /(?<!dark:)\bbg-stone-900\b/g, replacement: 'dark:bg-stone-900 bg-stone-100' },
  { regex: /(?<!dark:)\bbg-stone-800\b/g, replacement: 'dark:bg-stone-800 bg-stone-200' },
  { regex: /(?<!dark:)\bborder-stone-800\b/g, replacement: 'dark:border-stone-800 border-stone-200' },
  { regex: /(?<!dark:)\bbg-white\/5\b/g, replacement: 'dark:bg-white/5 bg-black/5' },
  { regex: /(?<!dark:)\bbg-white\/10\b/g, replacement: 'dark:bg-white/10 bg-black/10' },
  { regex: /(?<!dark:)\bborder-white\/5\b/g, replacement: 'dark:border-white/5 border-black/5' },
  { regex: /(?<!dark:)\bborder-white\/10\b/g, replacement: 'dark:border-white/10 border-black/10' },
  { regex: /(?<!dark:)\bbg-black\/50\b/g, replacement: 'dark:bg-black/50 bg-black/5' },
  { regex: /(?<!dark:)\bbg-black\/80\b/g, replacement: 'dark:bg-black/80 bg-black/20' }
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if transition-colors duration-300 is present on main div
    if (!content.includes('transition-colors duration-300')) {
      content = content.replace(/className="(min-h-screen[^"]*)"/, 'className="$1 transition-colors duration-300"');
    }
    
    replacements.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});

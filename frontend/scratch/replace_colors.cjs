const fs = require('fs');
const path = require('path');

const dir1 = path.join(__dirname, '../src/components/landing');
const file2 = path.join(__dirname, '../src/pages/LandingPage.tsx');

const replacements = {
  'bg-[#070B14]': 'bg-slate-950',
  'bg-[#0D1424]': 'bg-slate-900',
  'bg-[#111B2E]': 'bg-slate-800',
  'bg-[#15223A]': 'bg-slate-700',
  'text-[#F8FAFC]': 'text-slate-50',
};

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [key, value] of Object.entries(replacements)) {
    if (content.includes(key)) {
      content = content.split(key).join(value);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

const files = fs.readdirSync(dir1);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir1, file));
  }
});

processFile(file2);

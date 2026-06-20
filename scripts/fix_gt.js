const fs = require('fs');
const path = require('path');

const dir = '/home/albertshalaj/template/w-activities';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'));
let fixedFiles = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const pattern = / class="active:scale-\[0\.98\] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">/g;
  
  if (pattern.test(content)) {
    // Only replace where it doesn't look like it belongs to an actual HTML tag end.
    // Wait, the injected string is EXACTLY what replaced `>`.
    // Let's replace ` class="active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">` with `>` ONLY if it's followed by ` currentLevel`, `= 15`, ` 1`, etc.
    // Let's just do an exact string replacement for the 5 occurrences.
    let newContent = content
      .replace('jump1 class="active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"> currentLevel', 'jump1 > currentLevel')
      .replace('jump2 class="active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"> currentLevel', 'jump2 > currentLevel')
      .replace('xValue class="active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">= 15', 'xValue >= 15')
      .replace('length class="active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"> 1', 'length > 1')
      .replace('tables class="active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">= currentLevel', 'tables >= currentLevel');
      
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      fixedFiles++;
      console.log(`Fixed ${file}`);
    }
  }
}
console.log(`Done. Fixed ${fixedFiles} files.`);

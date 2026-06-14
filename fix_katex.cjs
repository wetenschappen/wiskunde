const fs = require('fs');
let raw = fs.readFileSync('src/lessons/elektriciteit-schakelingen-2.js', 'utf8');

const startIdx = raw.indexOf('Oefening 25');
if (startIdx !== -1) {
    const before = raw.substring(0, startIdx);
    let after = raw.substring(startIdx);
    after = after.replace(/\\\\\\\\\(/g, '\\\\(').replace(/\\\\\\\\\)/g, '\\\\)').replace(/\\\\\\\\dfrac/g, '\\\\dfrac').replace(/\\\\\\\\implies/g, '\\\\implies').replace(/\\\\\\\\,/g, '\\\\,').replace(/\\\\\\\\Omega/g, '\\\\Omega').replace(/\\\\\\\\cdot/g, '\\\\cdot');
    // Actually, `\\\\` in the file is four backslashes literal string `\\\\`.
    // Wait, let's just replace `\\\\` with `\\` globally in the "after" section!
    after = after.replace(/\\\\\\\\/g, '\\\\');
    fs.writeFileSync('src/lessons/elektriciteit-schakelingen-2.js', before + after);
    console.log('Fixed KaTeX escaping for Oef 25, 26, 27');
}

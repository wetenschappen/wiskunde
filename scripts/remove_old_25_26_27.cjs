const fs = require('fs');
let raw = fs.readFileSync('src/lessons/elektriciteit-schakelingen-2.js', 'utf8');

const startIdx = raw.indexOf('// ===================== T25: GEMENGDE SCHAKELING =====================');
const endIdx = raw.indexOf('// ===================== COMPLEXE OEFENINGEN 25, 26, 27 =====================');

if (startIdx !== -1 && endIdx !== -1) {
    const before = raw.substring(0, startIdx);
    const after = raw.substring(endIdx);
    fs.writeFileSync('src/lessons/elektriciteit-schakelingen-2.js', before + after);
    console.log('Removed old T25, T26, T27 slides');
} else {
    console.log('Could not find boundaries');
}

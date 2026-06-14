const fs = require('fs');
let raw = fs.readFileSync('src/lessons/elektriciteit-schakelingen-2.js', 'utf8');

const oef19Circuit = { source: { label: '' }, root: { type: 'parallel', children: [ { type: 'resistor', id: 'r1', label: 'R_1', value: '14.6 Ω' }, { type: 'resistor', id: 'r2', label: 'R_2', value: '?' } ] } };

const titleMatch = 'Basis 5 (Oef 19)';
const slideStart = raw.indexOf(titleMatch);
const cycleStart = raw.indexOf('layout: \'exercise-cycle\'', slideStart);
const imageStart = raw.indexOf("image: 'data:image", cycleStart);
if (imageStart !== -1) {
    const imageLineEnd = raw.indexOf("',", imageStart) + 2;
    const before = raw.substring(0, imageStart);
    const after = raw.substring(imageLineEnd);
    raw = before + 'circuit: ' + JSON.stringify(oef19Circuit, null, 12) + ",\n            " + after;
    fs.writeFileSync('src/lessons/elektriciteit-schakelingen-2.js', raw);
    console.log('Replaced Oef 19');
} else {
    console.log('not found');
}

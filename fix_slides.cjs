const fs = require('fs');
let raw = fs.readFileSync('src/lessons/elektriciteit-schakelingen-2.js', 'utf8');

// The injection started at:
// <h4 class="text-[1.6rem,
//         // ===================== COMPLEXE OEFENINGEN 25, 26, 27 =====================
//         {
//         "layout": "circuit-analysis",

const startMarker = "text-[1.6rem,";
const endMarker = '    ] font-bold text-brand-orange mb-3">Gegeven:</h4>';

// find start of injection
const startIndex = raw.indexOf(startMarker) + "text-[1.6rem".length;
// find the end of the JSON. It ends with:
//         }
// ]
const endIdx = raw.indexOf('] font-bold text-brand-orange', startIndex);

if (startIndex > -1 && endIdx > -1) {
    const jsonStr = raw.substring(startIndex + 1, endIdx);
    
    // The original text was <h4 class="text-[1.6rem] font-bold...
    // So we need to put the `]` back.
    const originalRestored = raw.substring(0, startIndex) + "]" + raw.substring(endIdx + 1);
    
    // Now we append jsonStr at the correct end of slidesMixed!
    // We need to find the real end of slidesMixed.
    // slidesMixed ends right before `slidesSamenvatting:` or similar.
    
    const nextArrayStart = originalRestored.indexOf("slidesSamenvatting:");
    // Find the `]` before nextArrayStart that closes slidesMixed
    const realEndSlidesMixed = originalRestored.lastIndexOf("]", nextArrayStart);
    
    // Inject at realEndSlidesMixed
    const finalRaw = originalRestored.substring(0, realEndSlidesMixed) + jsonStr + "\n    " + originalRestored.substring(realEndSlidesMixed);
    
    fs.writeFileSync('src/lessons/elektriciteit-schakelingen-2.js', finalRaw);
    console.log("Fixed!");
} else {
    console.log("Could not find markers.", startIndex, endIdx);
}

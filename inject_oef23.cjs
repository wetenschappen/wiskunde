const fs = require('fs');
let raw = fs.readFileSync('src/lessons/elektriciteit-schakelingen-2.js', 'utf8');

const oef23Circuit = {
    source: { label: "U" },
    root: {
        type: "series",
        children: [
            {
                type: "parallel",
                children: [
                    { type: "resistor", id: "r1", label: "R_", value: "" },
                    { type: "resistor", id: "r2", label: "R_", value: "" },
                    { type: "resistor", id: "r3", label: "R_", value: "" }
                ]
            },
            {
                type: "parallel",
                children: [
                    { type: "resistor", id: "r4", label: "R_", value: "" },
                    { type: "resistor", id: "r5", label: "R_", value: "" },
                    { type: "resistor", id: "r6", label: "R_", value: "" }
                ]
            }
        ]
    }
};

const oef23Start = raw.indexOf('Basis 6 (Oef 23)');
if (oef23Start !== -1) {
    const cycleStart = raw.indexOf("layout: 'exercise-cycle'", oef23Start);
    const stepsArrayStart = raw.indexOf('steps: [', cycleStart);
    
    // find the end of the steps array by finding the next layout or end of object
    const nextSlideLayout = raw.indexOf('layout:', stepsArrayStart);
    const stepsEnd = raw.lastIndexOf('}', nextSlideLayout);
    
    // Find the last step by looking for the last `content:` or `title:` before `stepsEnd`
    const lastStepContentEnd = raw.lastIndexOf('`', stepsEnd);
    
    if (lastStepContentEnd !== -1) {
        const before = raw.substring(0, lastStepContentEnd + 1);
        const after = raw.substring(lastStepContentEnd + 1);
        raw = before + ",\n                    circuit: " + JSON.stringify(oef23Circuit, null, 20) + after;
        console.log("Added circuit to last step of Oef 23");
        fs.writeFileSync('src/lessons/elektriciteit-schakelingen-2.js', raw);
    } else {
        console.log("Could not find end of last step.");
    }
} else {
    console.log("Could not find Oef 23.");
}

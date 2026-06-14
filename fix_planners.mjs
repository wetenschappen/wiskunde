import fs from 'fs';
import path from 'path';

const lessonsDir = 'src/lessons';
const files = fs.readdirSync(lessonsDir).filter(f => f.startsWith('nando4-') && f.endsWith('.js'));

const activityMap = {
    'm01': { id: 'logic', title: 'Logica en Waarheidstabellen', type: 'logic' },
    'm02': { id: 'linearSystems', title: 'Stelsels Oplossen', type: 'linearSystems' },
    'm03': { id: 'quadraticFunctions', title: 'Parabolen Onderzoeken', type: 'quadraticFunctions' },
    'm04': { id: 'mixedRetrieval', title: 'Herhaling M1-M3', type: 'mixedRetrieval' },
    'm05': { id: 'quadraticEquations', title: 'Vraagstukken Oplossen', type: 'quadraticEquations' },
    'm06': { id: 'trigonometryCircle', title: 'De Eenheidscirkel', type: 'trigonometryCircle' },
    'm07': { id: 'countingProblems', title: 'Telproblemen Visualiseren', type: 'countingProblems' },
    'm08': { id: 'graphTheory', title: 'Grafen en Algoritmes', type: 'graphTheory' },
    'm09': { id: 'mixedRetrieval', title: 'Herhaling M1-M8', type: 'mixedRetrieval' },
    'm10': { id: 'quadraticEquations', title: 'Vergelijkingen en Ongelijkheden', type: 'quadraticEquations' },
    'm11': { id: 'correlation', title: 'Spreidingsdiagrammen', type: 'correlation' },
    'm12': { id: 'trigonometryCircle', title: 'Willekeurige Driehoeken', type: 'trigonometryCircle', initialMode: 'analysis', subMode: 'triangles' },
    'm13': { id: 'rationalFunctions', title: 'Hyperbool f(x) = c/x', type: 'rationalFunctions' },
    'm14': { id: 'mixedRetrieval', title: 'Herhaling M1-M13', type: 'mixedRetrieval' },
    'm15': { id: 'analyticGeometry', title: 'Analytische Meetkunde', type: 'analyticGeometry' },
    'm16': { id: 'polynomialDivision', title: 'Deelbaarheid en Horner', type: 'polynomialDivision' },
    'm17': { id: 'spatialGeometry', title: 'Ruimtemeetkunde', type: 'spatialGeometry' },
    'm18': { id: 'mixedRetrieval', title: 'Eindherhaling', type: 'mixedRetrieval' }
};

for (const file of files) {
    const filePath = path.join(lessonsDir, file);
    // Note: nando4 files were already 'fixed' but with broken placeholders.
    // We need to re-parse them or find a way to get the original data.
    // Actually, I can't easily re-parse the broken files if they are invalid JS.
    // But they ARE valid JS, just with 'undefined' behavior if 'workbookItems' is missing.
    // I will try to find the original content or just fix the placeholders.
}

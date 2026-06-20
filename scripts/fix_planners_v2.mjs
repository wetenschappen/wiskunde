import fs from 'fs';
import path from 'path';

const lessonsDir = 'src/lessons';
const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.js') && (f.startsWith('nando4-') || f === 'nando3-m04-l03-uitdaging.js'));

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
    let content = fs.readFileSync(filePath, 'utf8');
    
    const moduleIdMatch = file.match(/m(\d+)/);
    const moduleId = moduleIdMatch ? moduleIdMatch[0] : 'm01';
    const activity = activityMap[moduleId] || { id: 'mixedRetrieval', title: 'Recap Oefening', type: 'mixedRetrieval' };

    // Detect if it was Nando 3 or 4
    const isNando3 = file.startsWith('nando3');
    const className = isNando3 ? '3de Middelbaar' : '4de Jaar';

    // Fix the broken placeholders
    content = content.replace(/\${workbookItems\.length > 0 [\s\S]+?}/g, `
                          <tr class="border-b border-slate-100 hover:bg-slate-50">
                            <td class="py-3 px-4 font-medium">Onderdeel</td>
                            <td class="py-3 px-4">Maak de oefeningen uit het werkboek bij deze module.</td>
                          </tr>`);
    
    // Also check for className and other potentially broken interpolations
    content = content.replace(/className: '4de Jaar'/, `className: '${className}'`);
    
    // Fix activity props if subMode is present
    if (activity.subMode) {
        content = content.replace(/initialMode: 'analysis'\s+\${activity\.subMode \? `, props: { initialMode: 'analysis', subMode: 'triangles' }` : ''}/, `initialMode: 'analysis', props: { initialMode: 'analysis', subMode: 'triangles' }`);
    } else {
        content = content.replace(/\${activity\.subMode \? [\s\S]+?}/, '');
    }

    fs.writeFileSync(filePath, content);
    console.log('Fixed ' + file);
}

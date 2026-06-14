import fs from 'fs';
import path from 'path';

// Mapping between module number and Activity component
const activityMap = {
    'm01': { id: 'logic', title: 'Logica', type: 'logic', icon: 'PhTreeStructure' },
    'm02': { id: 'realNumbers', title: 'Reële getallen', type: 'realNumbers', icon: 'PhMathOperations' },
    'm03': { id: 'vectors', title: 'Vectoren', type: 'vectors', icon: 'PhArrowUpRight' },
    'm04': { id: 'mixedRetrieval', title: 'Herhaling', type: 'mixedRetrieval', icon: 'PhArrowsCounterClockwise' },
    'm05': { id: 'realNumbers', title: 'Rekenen in R', type: 'realNumbers', icon: 'PhCalculator' },
    'm06': { id: 'linearEquations', title: 'Vergelijkingen', type: 'linearEquations', icon: 'PhScales' },
    'm07': { id: 'similarity', title: 'Gelijkvormigheid', type: 'similarity', icon: 'PhBoundingBox' },
    'm08': { id: 'linearFunctions', title: 'Functies', type: 'linearFunctions', icon: 'PhTrendUp' },
    'm09': { id: 'similarity', title: 'Thales & Homothetie', type: 'similarity', icon: 'PhRuler' },
    'm10': { id: 'mixedRetrieval', title: 'Herhaling', type: 'mixedRetrieval', icon: 'PhArrowsCounterClockwise' },
    'm11': { id: 'pythagoras', title: 'Pythagoras', type: 'pythagoras', icon: 'PhTriangle' },
    'm12': { id: 'linearFunctions', title: 'Functies', type: 'linearFunctions', icon: 'PhChartLineUp' },
    'm13': { id: 'trigonometryRightTriangle', title: 'Driehoeksmeting', type: 'trigonometryRightTriangle', icon: 'PhTriangle' },
    'm14': { id: 'mixedRetrieval', title: 'Herhaling', type: 'mixedRetrieval', icon: 'PhArrowsCounterClockwise' },
    'm15': { id: 'analyticGeometry', title: 'Analytische Meetkunde', type: 'analyticGeometry', icon: 'PhGraph' },
    'm16': { id: 'descriptiveStatistics', title: 'Data en onzekerheid', type: 'descriptiveStatistics', icon: 'PhChartBar' },
    'm17': { id: 'circleGeometry', title: 'Cirkelmeetkunde', type: 'circleGeometry', icon: 'PhCircle' },
    'm18': { id: 'mixedRetrieval', title: 'Consolidatie', type: 'mixedRetrieval', icon: 'PhArrowsCounterClockwise' }
};

const activityMap4 = {
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
    'm12': { id: 'trigonometryCircle', title: 'Willekeurige Driehoeken', type: 'trigonometryCircle', props: { initialMode: 'analysis', subMode: 'triangles' } },
    'm13': { id: 'rationalFunctions', title: 'Hyperbool f(x) = c/x', type: 'rationalFunctions' },
    'm14': { id: 'mixedRetrieval', title: 'Herhaling M1-M13', type: 'mixedRetrieval' },
    'm15': { id: 'analyticGeometry', title: 'Analytische Meetkunde', type: 'analyticGeometry' },
    'm16': { id: 'polynomialDivision', title: 'Deelbaarheid en Horner', type: 'polynomialDivision' },
    'm17': { id: 'spatialGeometry', title: 'Ruimtemeetkunde', type: 'spatialGeometry' },
    'm18': { id: 'mixedRetrieval', title: 'Eindherhaling', type: 'mixedRetrieval' }
};

function parseMarkdown(mdContent) {
    const lines = mdContent.split('\n');
    let currentSection = null;
    let currentSubsection = null;
    
    const parsed = {
        instap: [],
        theory: [],
        exercises: [],
        signals: []
    };
    
    let activeText = [];

    const saveText = () => {
        if (activeText.length > 0) {
            const text = activeText.join('<br>').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
            if (currentSection === 'instap') parsed.instap.push(text);
            else if (currentSection === 'theory') parsed.theory.push({ title: currentSubsection, text });
            else if (currentSection === 'exercises') parsed.exercises.push(text);
            else if (currentSection === 'signals') parsed.signals.push(text);
            activeText = [];
        }
    };

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('# Instap')) {
            saveText();
            currentSection = 'instap';
            currentSubsection = 'Instap';
        } else if (line.match(/^# [0-9]+ /)) {
            saveText();
            currentSection = 'theory';
            currentSubsection = line.replace(/^# [0-9]+ /, '');
        } else if (line.startsWith('# Verwerkingsopdracht')) {
            saveText();
            currentSection = 'exercises';
            currentSubsection = 'Verwerkingsopdrachten';
        } else if (line.startsWith('# Signaaloefeningen')) {
            saveText();
            currentSection = 'signals';
            currentSubsection = 'Signaaloefeningen';
        } else if (line.startsWith('# Differentiatietraject')) {
            saveText();
            currentSection = null; // stop parsing for slides here to save space
        } else {
            if (currentSection && line.length > 0 && !line.startsWith('--- PAGE')) {
                activeText.push(line);
            }
        }
    }
    saveText();
    return parsed;
}

function processDirectory(sourceDir, isNando3) {
    const lessonsDir = 'src/lessons';
    const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.js') && f.startsWith(isNando3 ? 'nando3-' : 'nando4-'));
    
    // Group lesson files by module
    const moduleFiles = {};
    for (const f of files) {
        const match = f.match(/m(\d+)/);
        if (match) {
            const mId = match[1];
            if (!moduleFiles[mId]) moduleFiles[mId] = [];
            moduleFiles[mId].push(f);
        }
    }

    const mdFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));
    
    for (const mdFile of mdFiles) {
        let mMatch;
        if (isNando3) {
            mMatch = mdFile.match(/M(\d+)_/i) || mdFile.match(/M0(\d+)_/i);
        } else {
            mMatch = mdFile.match(/M(\d+)_/i) || mdFile.match(/M0(\d+)_/i);
        }
        
        if (!mMatch) continue;
        const moduleNum = mMatch[1].padStart(2, '0');
        
        if (!moduleFiles[moduleNum]) continue;

        const mdContent = fs.readFileSync(path.join(sourceDir, mdFile), 'utf8');
        const parsed = parseMarkdown(mdContent);
        
        const actMap = isNando3 ? activityMap : activityMap4;
        const activity = actMap['m' + moduleNum] || { id: 'mixedRetrieval', title: 'Oefening', type: 'mixedRetrieval', icon: 'PhBrain' };

        // Process all lesson files for this module
        for (let i = 0; i < moduleFiles[moduleNum].length; i++) {
            const lessonFile = moduleFiles[moduleNum][i];
            const filePath = path.join(lessonsDir, lessonFile);
            
            // Generate full JS file content based on parsed MD
            
            // Build theoretical slides from markdown
            const slideObjects = [];
            
            // A: Intro slide
            slideObjects.push(`{ layout: 'title', title: '${isNando3 ? 'Nando 3' : 'Nando 4'} Module ${moduleNum}', subtitle: 'Deel ${i+1}', badge: 'Wiskunde', icon: 'function' }`);
            
            // Parse Instap for the first lesson
            if (i === 0 && parsed.instap.length > 0) {
                slideObjects.push(`{ layout: 'standard', title: 'Instap', content: '${parsed.instap[0].substring(0, 500)}...', icon: 'rocket' }`);
            }

            // Distribute theory sections across lessons
            const theoryPerLesson = Math.max(1, Math.ceil(parsed.theory.length / moduleFiles[moduleNum].length));
            const startIdx = i * theoryPerLesson;
            const endIdx = startIdx + theoryPerLesson;
            
            for (let j = startIdx; j < endIdx && j < parsed.theory.length; j++) {
                const sec = parsed.theory[j];
                let safeContent = sec.text.substring(0, 1000).replace(/\n/g, '<br>');
                slideObjects.push(`{ layout: 'standard', title: '${sec.title}', content: '${safeContent}', icon: 'book-open' }`);
            }

            // Exercises to Workbook
            let workbookHtml = '<div class="space-y-4">';
            const exContent = parsed.exercises.join('<br>').substring(0, 1500).replace(/\n/g, '<br>');
            workbookHtml += `<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">${exContent}</p></div>`;
            workbookHtml += '</div>';

            // Signals to Exit Ticket
            let q1 = 'Begrijp je de kern van deze theorie?';
            if (parsed.signals.length > 0) {
                const lines = parsed.signals[0].split('<br>').filter(l => l.length > 10);
                if (lines.length > 0) q1 = lines[0].substring(0, 100);
            }

            const newContent = `export default {
    id: '${lessonFile.replace('.js', '')}',
    subject: 'math',
    className: '${isNando3 ? '3de Middelbaar' : '4de Jaar'}',
    title: 'Module ${moduleNum} - Les ${i+1}',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M${moduleNum}L${i+1}',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '${isNando3 ? '3-Wiskunde' : '4-Wiskunde'}',
        textbook: 'Nando ${isNando3 ? '3' : '4'} Module ${moduleNum}'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: \`${workbookHtml}\`,
        formulaHint: 'Raadpleeg het handboek voor de volledige theorie.'
    },
    timeline: {
        stepA: {
            step: 'A', title: 'Diagnostisch & Instap', time: '15 min',
            cards: [
                { id: 'card-entry', type: 'digital', title: 'Diagnostische Toets', description: 'Wat weet je al?', action: 'entry-ticket', icon: 'PhQuestion' },
                { id: 'card-pres-a', type: 'class', title: 'Inleidende Instructie', description: 'Korte theorie.', action: 'presentation', slidesKey: 'slidesA' }
            ]
        },
        stepB: {
            step: 'B', title: 'Verwerken', time: '30 min',
            cards: [
                { id: 'card-pres-b', type: 'class', title: 'Uitgebreide Theorie', description: 'Stap voor stap uitgewerkt.', action: 'presentation', slidesKey: 'slidesB' },
                { id: 'card-workbook', type: 'paper', title: 'Boek Oefeningen', description: 'Maak oefeningen in het handboek.', action: 'workbook', icon: 'PhBookOpen' },
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: '${activity.id}', icon: '${activity.icon || 'PhGameController'}' }
            ]
        },
        stepC: {
            step: 'C', title: 'Samenvatting & Exit', time: '5 min',
            cards: [
                { id: 'card-pres-c', type: 'class', title: 'Samenvatting', description: 'Kern van de les.', action: 'presentation', slidesKey: 'slidesC' },
                { id: 'card-exit', type: 'digital', title: 'Exit Ticket', description: 'Reflectie op de les.', action: 'exit-ticket', icon: 'PhTarget' }
            ]
        }
    },
    activities: {
        '${activity.id}': {
            type: '${activity.type}',
            title: '${activity.title}'
            ${activity.props ? ', ' + JSON.stringify(activity.props).slice(1, -1) : ''}
        }
    },
    slidesA: [
        ${slideObjects.length > 0 ? slideObjects[0] : "{ layout: 'title', title: 'Titel', subtitle: 'Sub' }"},
        ${slideObjects.length > 1 ? slideObjects[1] : "{ layout: 'standard', title: 'Instap', content: 'Laten we beginnen.' }"}
    ],
    slidesB: [
        ${slideObjects.slice(2).join(',\n        ')}
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '${q1.replace(/'/g, "\\'")}', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};
`;
            fs.writeFileSync(filePath, newContent);
            console.log(`Generated ${filePath}`);
        }
    }
}

processDirectory('nando3', true);
processDirectory('nando4', false);

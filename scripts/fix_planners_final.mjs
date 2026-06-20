import fs from 'fs';
import path from 'path';

const lessonsDir = 'src/lessons';
const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.js') && (f.startsWith('nando4-') || f === 'nando3-m04-l03-uitdaging.js'));

const activityMap = {
    'm01': { id: 'logic', title: 'Logica en Waarheidstabellen', type: 'logic', initialMode: 'analysis' },
    'm02': { id: 'linearSystems', title: 'Stelsels Oplossen', type: 'linearSystems', initialMode: 'analysis' },
    'm03': { id: 'quadraticFunctions', title: 'Parabolen Onderzoeken', type: 'quadraticFunctions', initialMode: 'analysis' },
    'm04': { id: 'mixedRetrieval', title: 'Herhaling M1-M3', type: 'mixedRetrieval', initialMode: 'analysis' },
    'm05': { id: 'quadraticEquations', title: 'Vraagstukken Oplossen', type: 'quadraticEquations', initialMode: 'analysis' },
    'm06': { id: 'trigonometryCircle', title: 'De Eenheidscirkel', type: 'trigonometryCircle', initialMode: 'analysis' },
    'm07': { id: 'countingProblems', title: 'Telproblemen Visualiseren', type: 'countingProblems', initialMode: 'analysis' },
    'm08': { id: 'graphTheory', title: 'Grafen en Algoritmes', type: 'graphTheory', initialMode: 'analysis' },
    'm09': { id: 'mixedRetrieval', title: 'Herhaling M1-M8', type: 'mixedRetrieval', initialMode: 'analysis' },
    'm10': { id: 'quadraticEquations', title: 'Vergelijkingen en Ongelijkheden', type: 'quadraticEquations', initialMode: 'analysis' },
    'm11': { id: 'correlation', title: 'Spreidingsdiagrammen', type: 'correlation', initialMode: 'analysis' },
    'm12': { id: 'trigonometryCircle', title: 'Willekeurige Driehoeken', type: 'trigonometryCircle', props: { initialMode: 'analysis', subMode: 'triangles' } },
    'm13': { id: 'rationalFunctions', title: 'Hyperbool f(x) = c/x', type: 'rationalFunctions', initialMode: 'analysis' },
    'm14': { id: 'mixedRetrieval', title: 'Herhaling M1-M13', type: 'mixedRetrieval', initialMode: 'analysis' },
    'm15': { id: 'analyticGeometry', title: 'Analytische Meetkunde', type: 'analyticGeometry', initialMode: 'analysis' },
    'm16': { id: 'polynomialDivision', title: 'Deelbaarheid en Horner', type: 'polynomialDivision', initialMode: 'analysis' },
    'm17': { id: 'spatialGeometry', title: 'Ruimtemeetkunde', type: 'spatialGeometry', initialMode: 'analysis' },
    'm18': { id: 'mixedRetrieval', title: 'Eindherhaling', type: 'mixedRetrieval', initialMode: 'analysis' }
};

const moduleTitles = {
    'm01': 'Logica en waarheidstabellen',
    'm02': 'Stelsels van eerstegraadsvergelijkingen',
    'm03': 'Functies van de tweede graad',
    'm04': 'Consolidatie (Modules 1, 2 en 3)',
    'm05': 'Problemen oplossen met tweedegraadsfuncties',
    'm06': 'De goniometrische cirkel en verwante hoeken',
    'm07': 'Telproblemen',
    'm08': 'Grafen',
    'm09': 'Consolidatie (Modules 1 t.e.m. 8)',
    'm10': 'Tweedegraadsvergelijkingen en -ongelijkheden',
    'm11': 'Spreidingsdiagrammen',
    'm12': 'Driehoeksmeting in willekeurige driehoeken',
    'm13': 'Functie met voorschrift f(x) = c/x',
    'm14': 'Consolidatie (Modules 1 t.e.m. 13)',
    'm15': 'Analytische meetkunde',
    'm16': 'Deelbaarheid van veeltermen',
    'm17': 'Ruimtemeetkunde',
    'm18': 'Consolidatie'
};

for (const file of files) {
    const filePath = path.join(lessonsDir, file);
    const moduleIdMatch = file.match(/m(\d+)/);
    const moduleId = moduleIdMatch ? moduleIdMatch[0] : 'm01';
    const activity = activityMap[moduleId] || { id: 'mixedRetrieval', title: 'Recap Oefening', type: 'mixedRetrieval' };
    const title = moduleTitles[moduleId] || 'Wiskunde Les';
    
    const isNando3 = file.startsWith('nando3');
    const className = isNando3 ? '3de Middelbaar' : '4de Jaar';

    const slidesA = [
        { layout: 'title', title: title, subtitle: 'Introductie', badge: 'Wiskunde • ' + moduleId.toUpperCase(), icon: 'function' },
        { layout: 'predict', title: 'Wat weet je al?', question: 'Wat is de kern van ' + title + '?', hint: 'Denk aan de vorige lessen.', revealText: 'We gaan dit vandaag verder uitdiepen.' }
    ];
    const slidesB = [
        { layout: 'standard', title: 'Theorie', content: 'In dit onderdeel bekijken we de belangrijkste concepten van <strong>' + title + '</strong>.', icon: 'pencil' },
        { layout: 'steps', title: 'Stappenplan', steps: [{ icon: 'pencil', text: 'Stap 1: Analyseer de opgave.' }, { icon: 'calculator', text: 'Stap 2: Pas de juiste formules toe.' }, { icon: 'check', text: 'Stap 3: Controleer je resultaat.' }] }
    ];
    const slidesC = [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu ' + title + ' toepassen.', 'Je begrijpt de theoretische achtergrond.', 'Je hebt geoefend met de digitale tool.'] },
        { layout: 'celebration', title: 'Les afgerond!', subtitle: 'Goed gewerkt vandaag.', stats: [{ label: 'Module', value: moduleId.toUpperCase() }, { label: 'Onderwerp', value: title }] }
    ];

    const lesson = {
        id: file.replace('.js', ''),
        subject: 'math',
        className: className,
        title: title,
        description: 'Nando ' + (isNando3 ? '3' : '4') + ': Module ' + moduleId.substring(1),
        config: {
            groenCode: moduleId.toUpperCase() + 'L1',
            groenAntwoord: 'wiskunde',
            masterCode: 'nando',
            cursusLink: 'https://www.diekereure.be',
            classId: isNando3 ? '3-Wiskunde' : '4-Wiskunde',
            textbook: 'Nando ' + (isNando3 ? '3' : '4') + ' - ' + moduleId.toUpperCase()
        },
        goals: [
            'Ik kan de leerplandoelen van deze module toepassen.',
            'Ik begrijp de theoretische achtergrond van ' + title + '.'
        ],
        workbook: {
            title: 'Werkboek: ' + title,
            subtitle: moduleId.toUpperCase() + ' • Oefeningen',
            instruction: '<table class="w-full text-left border-collapse"><thead><tr class="border-b-2 border-emerald-200"><th class="py-2 px-4 font-bold text-slate-800">Onderdeel</th><th class="py-2 px-4 font-bold text-slate-800">Oefening</th></tr></thead><tbody><tr class="border-b border-slate-100 hover:bg-slate-50"><td class="py-3 px-4 font-medium">Onderdeel</td><td class="py-3 px-4">Maak de oefeningen uit het werkboek bij deze module.</td></tr></tbody></table>',
            formulaHint: 'Gebruik de theorie uit de slides.'
        },
        timeline: {
            stepA: {
                step: 'A', title: 'Introductie', time: '15 min',
                cards: [
                    { id: 'card-entry-' + moduleId, type: 'digital', title: 'Voorkennis', description: 'Korte check van wat je al weet.', action: 'entry-ticket', icon: 'PhQuestion' },
                    { id: 'card-pres-a-' + moduleId, type: 'class', title: 'Introductie', description: 'Verkenning van het onderwerp.', action: 'presentation', slidesKey: 'slidesA' }
                ]
            },
            stepB: {
                step: 'B', title: 'Verwerken', time: '35 min',
                cards: [
                    { id: 'card-pres-b-' + moduleId, type: 'class', title: 'Theorie & Voorbeelden', description: 'Stap voor stap door de leerstof.', action: 'presentation', slidesKey: 'slidesB' },
                    { id: 'card-workbook-' + moduleId, type: 'paper', title: 'Werkboek', description: 'Oefen de theorie zelfstandig.', action: 'workbook', icon: 'PhBookOpen' },
                    { id: 'card-activity-' + moduleId, type: 'digital', title: 'Interactief Lab', description: 'Oefen met de digitale simulatie.', action: 'activity', activityId: moduleId, icon: 'PhChartLineUp' }
                ]
            },
            stepC: {
                step: 'C', title: 'Afsluiting', time: '10 min',
                cards: [
                    { id: 'card-pres-c-' + moduleId, type: 'class', title: 'Samenvatting', description: 'De belangrijkste punten op een rij.', action: 'presentation', slidesKey: 'slidesC' },
                    { id: 'card-exit-' + moduleId, type: 'digital', title: 'Exit Ticket', description: 'Heb je de kern begrepen?', action: 'exit-ticket', icon: 'PhTarget' }
                ]
            }
        },
        activities: {
            [moduleId]: activity
        },
        slides: [...slidesA, ...slidesB, ...slidesC],
        slidesA, slidesB, slidesC,
        entryTicket: {
            questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar voor ' + title + '?', options: ['Ja', 'Grotendeels', 'Nog niet'], correct: 0 }]
        },
        exitTicket: {
            questions: [{ id: 'ex1', type: 'mc', question: 'Begrijp je de kern van deze les?', options: ['Helemaal', 'Grotendeels', 'Nog niet'], correct: 0 }]
        }
    };

    const newContent = 'export default ' + JSON.stringify(lesson, null, 4) + ';';
    fs.writeFileSync(filePath, newContent);
    console.log('Fixed ' + file);
}

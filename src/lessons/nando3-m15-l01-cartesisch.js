export default {
    id: 'nando3-m15-l01-cartesisch',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 15 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M15L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 15'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">## 1<br>Bepaal de vergelijking van de getekende rechten.<br>[Afbeelding: Assenstelsel met 4 rechten: f, g, h, en i.<br>Rechte f is stijgend door de oorsprong.<br>Rechte g is dalend door de oorsprong.<br>Rechte h is stijgend en snijdt de y-as op 2.<br>Rechte i is dalend en snijdt de y-as op 4.]<br>[ ... invulveld ... ]<br>f ↔ y = 3x<br>g ↔ y = -2x<br>h ↔ y = 2x + 2<br>i ↔ y = -x + 4<br>## 2<br>Teken de rechten p, q en r.<br>p ↔ y = -3x<br>q ↔ y = -2x + 4<br>r ↔ y = 3<br>[Afbeelding: Assenstelsel waarin de oplossingen (rode rechten) getekend zijn.<br>Rechte p gaat door (0,0) en (1,-3).<br>Rechte q gaat door (0,4) en (2,0).<br>Rechte r is een horizontale lijn op hoogte y=3.]<br>## 3<br>Bepaal de vergelijking van de gegeven rechten.<br>[Afbeelding: Assenstelsel met 3 verticale rechten: f, g, en h.<br>Rechte f ligt op x = 4.<br>Rechte g ligt op x = -2.<br>Rechte h ligt op x = 1.]<br>[ ... invulveld ... ]<br>f ↔ x = 4<br>g ↔ x = -2<br>h ↔ x = 1<br>## 4<br>Teken de rechte a met als vergelijking x = 2,5.<br>[Afbeelding: Assenstelsel met als oplossing een rode verticale rechte a getekend op x = 2,5.]<br>## 5<br>Bepaal de cartesische vergelijking van …<br>a) de rechte a met richtingscoëfficiënt 3 die door het punt A(1, 5) gaat.<br>[ ... invulveld ... ]<br>y - yA = a (x - xA)<br>y - 5 = 3 (x - 1)<br>y - 5 = 3x - 3<br>y = 3x + 2<br>b) de rechte b met richtingscoëfficiënt -2 die door het punt B(2, -4) gaat.<br>[ ... invulveld ... ]<br>y - yB = a (x - xB)<br>y - (-4) = (-2)(x - 2)<br>y + 4</p></div></div>`,
        formulaHint: 'Raadpleeg het handboek voor de volledige theorie.'
    },
    timeline: {
        stepA: {
            step: 'A', title: 'Instap', time: '15 min',
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'analyticGeometry', icon: 'PhGraph' }
            ]
        },
        stepC: {
            step: 'C', title: 'Afsluiting', time: '5 min',
            cards: [
                { id: 'card-pres-c', type: 'class', title: 'Samenvatting', description: 'Kern van de les.', action: 'presentation', slidesKey: 'slidesC' },
                { id: 'card-exit', type: 'digital', title: 'Exit Ticket', description: 'Reflectie op de les.', action: 'exit-ticket', icon: 'PhTarget' }
            ]
        }
    },
    activities: {
        'analyticGeometry': {
            type: 'analyticGeometry',
            title: 'Analytische Meetkunde'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 15', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Duid alle functievoorschriften aan van de functies die als grafiek een rechte hebben.<br>[x] f(x) = x<br>[ ] f(x) = 2/x<br>[ ] f(x) = x²<br>[x] f(x) = -1/3 x + 1<br>[x] f(x) = 2x + 3<br>[ ] f(x) = √x<br>## Opdracht 2<br>a) Teken de grafiek van de functie f met voorschrift f(x) = 2x + 3. Vul eerst de waardentabel in.<br>| x | -3 | -2 | -1 | 0 | 1 |<br>|---|---|---|---|---|---|<br>| f(x) | -3 | -1 | 1 | 3 | 5 |<br>b) Duid de richtingscoëfficiënt grafisch aan.<br>[Afbeelding: Assen...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'De vergelijking van de grafiek van een eerstegraadsfunctie', content: '## 1.1 Een rechte met als vergelijking y = ax<br>Je ziet de grafiek van de functie f met voorschrift f(x) = 3x.<br>[Afbeelding: Assenstelsel met een blauwe rechte lijn gelabeld y = f(x). De lijn gaat door de oorsprong A(0, 0) en door punt B(1, 3).]<br>In de meetkunde leerden we dat een rechte wordt bepaald door twee verschillende punten. Hier zien we de rechte AB met A(0, 0) en B(1, 3).<br>We stellen vast dat de grafiek van een eerstegraadsfunctie met als voorschrift f(x) = ax een rechte is en dat we die rechte ook kunnen uitdrukken aan de hand van een **vergelijking**, namelijk y = ax.<br>Deze rechte gaat door de oorsprong. Het punt (0, 0) is dus een oplossing van de vergelijking y = ax. Een tweede punt van de rechte kan bepaald worden door een zelfgekozen x-waarde in te vullen in de vergelijking en zo de bijhorende y-waarde te bepalen.<br>formule<br>p ↔ y = ax<br>We lezen dit als: de rechte p heeft als vergelijking y = ax.<br>**Merk op**<br>Een functie met voorschrift f(x) = ax heeft', icon: 'book-open' },
        { layout: 'standard', title: 'Rechten evenwijdig met één van de assen', content: 'Bij een rechte evenwijdig met de y-as is de x-waarde voor de verschillende y-waarden altijd hetzelfde.<br>**Voorbeeld**<br>[Afbeelding: Assenstelsel met een blauwe verticale rechte p. De rechte p gaat door x = 3.]<br>De vergelijking van de rechte p is x = 3.<br>| x | 3 | 3 | 3 | 3 | 3 |<br>|---|---|---|---|---|---|<br>| y | -2 | -1 | 0 | 1 | 2 |<br>De x-waarde van alle punten is dus constant,<br>namelijk x = c.<br>**Merk op**<br>- Een rechte evenwijdig met de y-as is **geen grafiek van een functie**.<br>- Je kunt de vergelijking niet schrijven in de vorm y = ax + b want de richtingscoëfficiënt bestaat niet.', icon: 'book-open' },
        { layout: 'standard', title: 'De cartesische vergelijking van een rechte opstellen', content: '## 3.1 Als de richtingscoëfficiënt en één punt gegeven zijn<br>**Voorbeeld**<br>Beschouw de rechte c door het punt P(2, 3) en met a = 4 als richtingscoëfficiënt.<br>y = ax + b wordt: y = 4x + b<br>We bepalen b door de coördinaat van het gegeven punt P in te vullen.<br>y = 4x + b<br>3 = 4 · 2 + b<br>3 = 8 + b<br>-5 = b<br>We krijgen dus: y = 4x - 5<br>De vergelijking van de rechte c is y = 4x - 5.<br>**Algemeen**<br>[Afbeelding: Assenstelsel met een stijgende blauwe rechte f. Punt P(x1, y1) ligt op deze rechte. Een rechthoekige driehoek toont dat een verplaatsing van +1 naar rechts leidt tot een verplaatsing van +a naar boven.]<br>De rechte f gaat door het punt P(x1, y1) en heeft a als richtingscoëfficiënt.<br>De rechte f heeft een vergelijking van de vorm y = ax + b.<br>We bepalen de waarde van b door het punt P(x1, y1) in de vergelijking in te vullen.<br>y1 = ax1 + b<br>b = y1 - ax1<br>We krijgen dus:<br>y = ax + b<br>y = ax + y1 - ax1<br>y - y1 = ax - ax1<br>y - y1 = a · (x - x1)<br>', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Bepaal de vergelijking van de gegeven rechten.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

export default {
    id: 'nando3-m12-l03-opstellen',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 12 - Les 3',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M12L3',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 12'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">**1** Kleur het functievoorschrift van alle eerstegraadsfuncties.<br>| | | | |<br>|---|---|---|---|<br>| *f(x) = x²* | [x] *g(x) = x + 1/2* | [x] *h(x) = 3x* | *i(x) = 3* |<br>| [x] *j(x) = −3x + 2* | *k(x) = 1/x* | *l(x) = x³ − 1* | [x] *m(x) = x* |<br>**2** a) Hoe lees je: *f(x) = −2,5x − 1*?<br>[ De functie f met als voorschrift f(x) = -2,5x - 1. ]<br>b) Bereken *f(2)*.<br>[ f(2) = -2,5 · 2 - 1 ]<br>[ = -5 - 1 ]<br>[ = -6 ]<br>**3** Vul aan of schrap wat niet past zonder de grafiek van de functie, waarvan het voorschrift gegeven is, te tekenen.<br>a) *f(x) = 6x − 1*<br>De richtingscoëfficiënt is [ 6. ]<br>De grafiek van de functie is een ~~dalende~~ / **stijgende** rechte.<br>De grafiek van de functie snijdt de *y*-as in [ (0, -1). ]<br>b) *f(x) = -3/2 x + 9/4*<br>De richtingscoëfficiënt is [ -3/2. ]<br>De grafiek van de functie is een **dalende** / ~~stijgende~~ rechte.<br>De grafiek van de functie snijdt de *y*-as in [ (0, 9/4). ]<br>c) *f(x) = √2 x*<br>De richtingscoëfficiënt is [ √2. ]<br>De grafiek van de functie is een ~~dalende~~ / **stijgende** rechte.<br>De grafiek van de functie snijdt de *y*-as in [ de oorsprong. ]<br>d) *f(x) = 0,7 − x*<br>De richtingscoëfficiënt is [ -1. ]<br>De grafiek van de functie is een **dalende** / ~~stijgende~~ rechte.<br>De grafiek van de functie snijdt de *y*-as in [ (0; 0,7). ]<br>**4**<br>- Vul de waardentabel aan en teken de grafiek van de functie waarvan het voorschrift gegeven is.<br>- Stel de richtingscoëfficiënt grafisch voor.</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'linearFunctions', icon: 'PhChartLineUp' }
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
        'linearFunctions': {
            type: 'linearFunctions',
            title: 'Functies'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 12', subtitle: 'Deel 3', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Constante functies', content: 'Bij een eerstegraadsfunctie *f* met voorschrift *f(x) = ax + b* is *a* ≠ 0.<br>Als *a* = 0 dan wordt het voorschrift *f(x) = 0x + b* dus *f(x) = b*<br>*f(x) = b* is geen voorschrift van een eerstegraadsfunctie.<br>**definitie**<br>Een **constante functie** is een functie met een voorschrift van de vorm *f(x) = b* met *b* ∈ ℝ.<br>**Voorbeeld**<br>Gegeven is de functie *f* met *f(x)* = 4.<br>- De grafiek van deze constante functie snijdt de *y*-as in S(0, 4).<br>- Er zijn geen nulwaarden.<br>- De grafiek van de functie verloopt niet stijgend en ook niet dalend. De richtingscoëfficiënt is 0.<br>- De grafiek van een constante functie is een rechte die evenwijdig is met de *x*-as.<br>[Afbeelding: Grafiek van y = 4, een horizontale lijn.]<br>Bij een constante functie is er geen tekenverandering.<br>Als *b* < 0 dan krijgen we als tekentabel<br>| *x* | |<br>|---|---|<br>| *f(x)* | - - - |<br>Als *b* > 0 dan krijgen we als tekentabel<br>| *x* | |<br>|---|---|<br>| *f(x)* | + + + |<br>[Afbeeldin', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Vergelijkingen en ongelijkheden grafisch oplossen', content: 'Vergelijkingen en ongelijkheden van de eerste graad in één onbekende kun je al algebraïsch oplossen. Nu je ook wat meer inzicht hebt in algebraïsche verbanden en functies van de eerste graad, kun je ook vergelijkingen en ongelijkheden van de eerste graad grafisch oplossen.<br>## 6.1 Vergelijkingen grafisch oplossen<br>**Voorbeeld 1:** -2x + 8 = 0<br>Als je deze vergelijking grafisch wil oplossen, dan teken je met ICT de grafiek van de eerstegraadsfunctie *f* met voorschrift *f(x) = -2x + 8*.<br>De nulwaarde die je kan aflezen is de oplossing van deze vergelijking.<br>De oplossingenverzameling voor -2x + 8 = 0 is V = {4}.<br>[Afbeelding: Grafiek van y = f(x) = -2x + 8, snijdt de x-as bij x=4.]<br>**Voorbeeld 2:** 2/3 x - 1 = (8 - x) / 5<br>Als je deze vergelijking wil oplossen, dan teken je<br>- de grafiek van de eerstegraadsfunctie *f* met voorschrift *f(x) = 2/3 x - 1* (dit komt overeen met het linkerlid).<br>- de grafiek van de eerstegraadsfunctie *g* met voorschrift *g(x) = (8 - x) ', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Begrijp je de kern van deze theorie?', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

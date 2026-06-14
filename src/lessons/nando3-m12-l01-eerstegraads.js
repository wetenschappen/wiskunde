export default {
    id: 'nando3-m12-l01-eerstegraads',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 12 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M12L1',
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
        { layout: 'title', title: 'Nando 3 Module 12', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Bekijk aandachtig de grafiek en los onderstaande vragen op.<br>[Afbeelding: Een grafiek met een gebouw, een brandweerwagen en een uitgeschoven brandweerladder. Een brandweerman staat beneden, een kat zit op het dak, en een andere persoon staat bij een raam. De x-as toont de waarden 2 en 10. De y-as toont de waarden 1,8 en 5,8.]<br>a) Welk hoogteverschil overbrugt de brandweerladder?<br>[ 5,8 - 1,8 = 4 ]<br>[ Antwoord: De brandweerladder overbrugt verticaal 4 meter. ]<br>b) Duid ...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Eerstegraadsfuncties', content: '**definitie**<br>Een **eerstegraadsfunctie** is een functie met een voorschrift van de vorm<br>*f(x) = ax + b* waarbij *a* ∈ ℝ₀ en *b* ∈ ℝ.<br>**TIP**<br>ℝ₀ = ℝ \ {0}<br>**Voorbeelden**<br>*f(x) = 2x − 5* lees je als de functie *f* met als voorschrift *f(x) = 2x − 5*<br>*g(x) = -4/3 x + 1* lees je als de functie *g* met als voorschrift *g(x) = -4/3 x + 1*<br>*h(x) = 2πx* lees je als de functie *h* met als voorschrift *h(x) = 2πx*<br>**Tegenvoorbeelden**<br>*p(x) = x² + 3x − 1* is geen eerstegraadsfunctie. De graad in *x* is 2. Dit is een voorbeeld van een tweedegraadsfunctie. Je leert er meer over in het vierde jaar.<br>*q(x) = 5* is geen eerstegraadsfunctie. We zien geen *x* in het voorschrift. De graad in *x* is 0. Deze functie is een constante functie. We bestuderen dit in punt 5.<br>[Afbeelding: Pepertje] **Merk op**<br>- Het functievoorschrift kun je ook noteren als een verband tussen *x* en *y*.<br>Het voorschrift van de functie *f* kan je schrijven als *y = ax + b*. We noteren d', icon: 'book-open' },
        { layout: 'standard', title: 'De grafiek van een eerstegraadsfunctie', content: '## 2.1 De grafiek van de functie *f* met voorschrift *f(x) = ax (a ≠ 0)*<br>**A) De coëfficiënt van *x* in het functievoorschrift is strikt positief (*a* > 0)**<br>*f(x) = x*<br>| *x* | -2 | -1 | 0 | 1 | 2 |<br>|---|---|---|---|---|---|<br>| *f(x)* | -2 | -1 | 0 | 1 | 2 |<br>[Afbeelding: Grafiek van y = x, een stijgende rechte door de oorsprong.]<br>*g(x) = 2x*<br>| *x* | -2 | -1 | 0 | 1 | 2 |<br>|---|---|---|---|---|---|<br>| *g(x)* | -4 | -2 | 0 | 2 | 4 |<br>[Afbeelding: Grafiek van y = 2x, een stijgende rechte door de oorsprong, steiler dan y = x.]<br>*h(x) = 3x*<br>| *x* | -2 | -1 | 0 | 1 | 2 |<br>|---|---|---|---|---|---|<br>| *h(x)* | -6 | -3 | 0 | 3 | 6 |<br>[Afbeelding: Grafiek van y = 3x, een stijgende rechte door de oorsprong, steiler dan y = 2x.]<br>**B) De coëfficiënt van *x* in het functievoorschrift is strikt negatief (*a* < 0)**<br>*p(x) = -x*<br>| *x* | -2 | -1 | 0 | 1 | 2 |<br>|---|---|---|---|---|---|<br>| *p(x)* | 2 | 1 | 0 | -1 | -2 |<br>[Afbeelding: Grafiek van y =', icon: 'book-open' }
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

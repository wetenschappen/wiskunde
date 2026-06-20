export default {
    id: 'nando3-m12-l02-verloop',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 12 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M12L2',
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'linearFunctions', icon: 'PhChartLineUp' }
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
        'linearFunctions': {
            type: 'linearFunctions',
            title: 'Functies'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 12', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Tekenverandering bij een eerstegraadsfunctie', content: '## 3.1 Aan de hand van de grafiek<br>Als de grafiek van de functie *f* gegeven is, kun je zien voor welke waarden van *x* de grafiek van de functie *f* boven (of onder) de *x*-as ligt. De grafiek van de functie snijdt de *x*-as in het **nulpunt**. Het eerste coördinaatgetal van het nulpunt is de **nulwaarde**.<br>**Voorbeeld 1**<br>Gegeven is de functie *f* met *f(x) = 2x − 4*.<br>- Als *x* < 2 dan is *f(x)* < 0 (de functiewaarden zijn negatief, de grafiek van de functie ligt voor deze *x*-waarden onder de *x*-as).<br>- Als *x* = 2 dan is *f(x)* = 0 (de grafiek van de functie snijdt de *x*-as). Het nulpunt van de functie is (2, 0) en de nulwaarde is 2.<br>- Als *x* > 2 dan is *f(x)* > 0 (de functiewaarden zijn positief, de grafiek van de functie ligt voor deze *x*-waarden boven de *x*-as).<br>Die **tekenverandering** vatten we samen in een **tekentabel**.<br>| *x* | | 2 | |<br>|---|---|---|---|<br>| *f(x)* | - | 0 | + |<br>| | onder x-as | snijdt x-as | boven x-as |<br>[Afbeelding: Gra', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Functievoorschrift opstellen', content: '## 4.1 Op basis van een grafiek<br>**Voorbeeld 1**<br>In dit voorbeeld kunnen we gemakkelijk het snijpunt met de *y*-as aflezen.<br>- De coördinaat van het snijpunt met de *y*-as is (0, 5).<br>- Ook de richtingscoëfficiënt kunnen we gemakkelijk bepalen. Als we *x* met 1 eenheid laten toenemen, dan neemt *f(x)* met 4 af.<br>De richtingscoëfficiënt is -4.<br>*f(x) = ax + b* wordt *f(x) = -4x + 5*<br>[Afbeelding: Grafiek van een dalende rechte y = f(x) die de y-as snijdt in 5. Een pijltje toont +1 op de x-as, -4 op de y-as.]<br>**Hoe bepaal je het functievoorschrift als je het snijpunt met de *y*-as eenvoudig kan aflezen?**<br>**methode**<br>STAP 1: Lees het snijpunt van de grafiek van de functie met de *y*-as af: (0, *b*).<br>STAP 2: Bepaal de richtingscoëfficiënt *a*.<br>**Voorbeeld 2**<br>In dit voorbeeld kunnen we het snijpunt met de *y*-as niet exact aflezen.<br>- We kunnen wel de coördinaat van twee andere punten aflezen die tot de grafiek van de functie behoren: (-3, 0) en (1, 5).<', icon: 'book-open' }
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

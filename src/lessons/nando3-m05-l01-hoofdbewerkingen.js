export default {
    id: 'nando3-m05-l01-hoofdbewerkingen',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 05 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M05L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 05'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm"></p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'realNumbers', icon: 'PhCalculator' }
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
        'realNumbers': {
            type: 'realNumbers',
            title: 'Rekenen in R'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 05', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'De hoofdbewerkingen in R', content: 'In de eerste graad formuleerde je eigenschappen voor onder andere het optellen en vermenigvuldigen van rationale getallen. Maar zijn die ook geldig als de getallen waarmee je rekent irrationale getallen zijn?<br>## 1.1 Eigenschappen van de hoofdbewerkingen<br>Bij het rekenen met reële getallen kunnen de termen zowel rationale als irrationale getallen zijn. Je kunt ICT gebruiken om het resultaat te bepalen.<br>A) Het optellen en aftrekken<br>| | HET OPTELLEN VAN REËLE GETALLEN | HET AFTREKKEN VAN REËLE GETALLEN |<br>|---|---|---|<br>| MET ICT | √3 + 2 = 3.732 050 807 57 | 4 - 5π = -11.707 963 267 9 |<br>| WISKUNDETAAL | √3 + 2 = 3,732050… (√3 is term, 2 is term, uitkomst is som) | 4 - 5π = -11,707963… (4 is aftrektal, 5π is aftrekker, uitkomst is verschil) |<br>| AFGEROND RESULTAAT OP 0,01 NAUWKEURIG | √3 + 2 ≈ 3,73 | 4 - 5π ≈ -11,71 |<br>**Merk op**<br>We ronden enkel het eindresultaat af.<br>Om af te ronden bekijk je de nauwkeurigheidsfactor. Zo kom je te weten hoeveel cijfers je moet', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Rekenregels voor het rekenen met machten', content: '## 2.1 Machten met een gehele exponent<br>Bij de macht 4^3 is 4 het grondtal en 3 de exponent.<br>4^3 = 64<br>exponent<br>grondtal<br>**definitie**<br>a^n = a · a · a · ... · a n factoren met n > 1<br>a^1 = a<br>a^0 = 1 met (a ≠ 0)<br>We schrijven de machten bij voorkeur met een positieve exponent.<br>a^-1 = 1/a (a ≠ 0) en (a/b)^-m = (b/a)^m = b^m / a^m (a ≠ 0, b ≠ 0)<br>**Voorbeelden**<br>a^-5 = 1/a^5 (a ≠ 0)<br>(5/6)^-2 = (6/5)^2 = 36/25<br>Het grondtal van de macht kan ook een reëel getal zijn.<br>We passen eerst de rekenregel toe om de macht met een positieve exponent te schrijven.<br>Daarna kun je uit het hoofd, met een wetenschappelijke rekenmachine of met CAS het eindantwoord bepalen.<br>**Voorbeelden**<br>π^-1 = 1/π^1 = 1/π<br>(√3 / 5)^-2 = (5 / √3)^2 = 25 / 3<br>**Merk op**<br>In punt 4 van deze module zul je leren over de rekenregels van vierkantswortels. Deze zijn handig om bij eenvoudige oefeningen zonder ICT jouw eindantwoord te bepalen.<br>## 2.2 Rekenregels van machten<b', icon: 'book-open' }
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

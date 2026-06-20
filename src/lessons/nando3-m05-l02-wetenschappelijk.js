export default {
    id: 'nando3-m05-l02-wetenschappelijk',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 05 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M05L2',
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'realNumbers', icon: 'PhCalculator' }
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
        'realNumbers': {
            type: 'realNumbers',
            title: 'Rekenen in R'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 05', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Rekenen met getallen in wetenschappelijke schrijfwijze', content: '## 3.1 Getallen in wetenschappelijke notatie<br>In de wetenschap wordt er vaak gebruik gemaakt van hele grote getallen of hele kleine getallen.<br>De grootteorde van een getal kan met machten snel zichtbaar gemaakt worden. 10^9 < 10^10; 10^-20 < 10^20; 10^10 > 10^-10<br>We kunnen getallen anders schrijven door gebruik te maken van machten van 10.<br>**definitie**<br>De **wetenschappelijke schrijfwijze** van een getal verschillend van 0 is dat getal geschreven als een product van twee factoren.<br>- een decimaal getal met 1 cijfer, verschillend van 0, voor de komma<br>- een macht van 10<br>**Voorbeelden**<br>- Het getal van Avogadro: 602 214 085 700 000 000 000 000 mol^-1 wordt afgerond **6,022140857 · 10^23 mol^-1**<br>- Atomaire massa-eenheid: 0,000 000 000 000 000 000 000 000 001 660 538 921 kg wordt afgerond **1,661 · 10^-27 kg**<br>## 3.2 Rekenen met getallen in wetenschappelijke notatie<br>Bereken 3 400 · 6 780 000 met je rekentoestel. Je merkt dat het resultaat te groot is voor h', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Rekenregels voor vierkantswortels', content: 'De rekenregels voor machten zijn ook geldig als de grondtallen reële getallen zijn. Maar zijn er ook rekenregels voor vierkantswortels?<br>## 4.1 De vierkantswortel van een som van twee strikt positieve getallen<br>√(2 + 7) = √9 = 3<br>√2 = 1,41421 ...<br>√7 = 2,64575 ...<br>√2 + √7 = 4,05996 ...<br>**Vaststelling:** √(2 + 7) ≠ √2 + √7<br>Er kan **geen rekenregel** geformuleerd worden.<br>[Afbeelding: Diagram dat toont dat √(2+7) ongelijk is aan √2 + √7. Een pijl gaat van √(2+7) naar de top, een van √2 naar de basis en √7 naar de rechterkant]<br>**Merk op**<br>- Wanneer je de vierkantswortel van een som van twee strikt positieve getallen moet uitrekenen, kun je je rekenmachine gebruiken om het resultaat af te ronden, of kan je de exacte wortelvorm laten staan.<br>√(2 + 4) = √6 of √(2 + 4) = 2,44948974 ... of √(2 + 4) ≈ 2,44949<br>- Als je twee vierkantswortels moet optellen, maak je gebruik van je rekenmachine en rond je het eindresultaat af op de gevraagde nauwkeurigheid.<br>## 4.2 De', icon: 'book-open' }
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

export default {
    id: 'nando3-m16-l02-spreidingsmaten',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 16 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M16L2',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 16'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">10. Op zondag kunnen de wachttijden bij de bakker soms oplopen.<br>In de frequentietabel vind je de gegroepeerde tijden van 130 klanten.<br>a) Bepaal de gemiddelde wachttijd.<br>(18 · 5 + 42 · 15 + 31 · 25 + 34 · 35 + 5 · 45) / 130 = 2910 / 130 = 22,38462<br>b) Bepaal de mediane wachttijd en interpreteer.<br>Omdat 130 even is, moeten we het gemiddelde nemen van de klassen van het 65ste en 66ste gegeven. Deze liggen beide in de klasse [20, 30[, dat wil zeggen dat de mediaan 25 is.<br>[Afbeelding: Een goedgevulde bakkerij met broden en gebak.]<br>| KLASSE | fi |<br>|---|---|<br>| [0, 10[ | 18 |<br>| [10, 20[ | 42 |<br>| [20, 30[ | 31 |<br>| [30, 40[ | 34 |<br>| [40, 50[ | 5 |<br>| **Totaal** | **130** |<br>c) Maak een histogram.<br>[Afbeelding: Histogram met \"Wachttijden\" op de x-as (klassen van 10 breed, 0 tot 50) en \"Aantal personen\" op de y-as (0 tot 45). Staven getekend overeenkomstig de frequentietabel.]<br>d) Hoe zijn de gegevens verdeeld?<br>De resultaten zijn scheef verdeeld.<br>e) Maak een boxplot van de gegevens.<br>[Afbeelding: Boxplot. As van 0 tot 50. Boxplot met snorharen, getekend rond waarden: min=0 (ongeveer), Q1 ≈ 15, Me=25, Q3 ≈ 35, max=50 (ongeveer).]<br>26<br>11. De lengte van de aangevoerde kabeljauw ligt tussen de 50 en 80 cm. Hij kan echter tot anderhalve meter lang worden.<br>Van 120 aangevoerde kabeljauwen werd hun lengte verwerkt in deze frequentietabel.<br>[Afbeelding: Een kabeljauw.]<br>a) Maak een histogram door gebruik te maken van de frequent</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'descriptiveStatistics', icon: 'PhChartBar' }
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
        'descriptiveStatistics': {
            type: 'descriptiveStatistics',
            title: 'Data en onzekerheid'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 16', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Centrummaten en spreidingsmaten bij gegroepeerde gegevens', content: 'Je kan al de centrum- en spreidingsmaten berekenen voor individuele gegevens. Ook bij gegroepeerde gegevens kunnen we de centrum- en spreidingsmaten berekenen.<br>We hernemen de frequentietabel van de onderzoeksvraag \'Hoeveel euro zit er in je spaarpot?\'.<br>| KLASSE | mi | fi | rfi (%) | cfi | crfi (%) |<br>|---|---|---|---|---|---|<br>| [0, 10[ | 5 | 27 | 18,00 | 27 | 18,00 |<br>| [10, 20[ | 15 | 24 | 16,00 | 51 | 34,00 |<br>| [20, 30[ | 25 | 25 | 16,67 | 76 | 50,67 |<br>| [30, 40[ | 35 | 16 | 10,67 | 92 | 61,33 |<br>| [40, 50[ | 45 | 25 | 16,67 | 117 | 78,00 |<br>| [50, 60[ | 55 | 14 | 9,33 | 131 | 87,33 |<br>| [60, 70[ | 65 | 10 | 6,67 | 141 | 94,00 |<br>| [70, 80[ | 75 | 9 | 6,00 | 150 | 100,00 |<br>| **Totaal** | | **150** | **100** | | |<br>## 5.1 De modale klasse<br>Bij gegroepeerde gegevens spreken we niet over modus maar over de **modale klasse**. Dit is de klasse met de grootste absolute frequentie. In deze oefening is de modale klasse: [0, 10[.<br>**Interpretatie:**<br>De', icon: 'book-open' }
    ],
    slidesB: [
        
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '1. Bij het Rode Kruis laten 300 mensen hun bloed afnemen. Bij elke afname wordt de bloedgroep genote', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

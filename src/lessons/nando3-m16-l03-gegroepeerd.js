export default {
    id: 'nando3-m16-l03-gegroepeerd',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 16 - Les 3',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M16L3',
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'descriptiveStatistics', icon: 'PhChartBar' }
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
        'descriptiveStatistics': {
            type: 'descriptiveStatistics',
            title: 'Data en onzekerheid'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 16', subtitle: 'Deel 3', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: 'Laten we beginnen.' }
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

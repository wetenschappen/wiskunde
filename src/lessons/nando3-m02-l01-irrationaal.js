export default {
    id: 'nando3-m02-l01-irrationaal',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 02 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M02L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 02'
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'realNumbers', icon: 'PhMathOperations' }
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
            title: 'Reële getallen'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 02', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>**a) Vul aan.**<br>IN is de verzameling van de natuurlijke getallen.<br>Z is de verzameling van de gehele getallen.<br>Q is de verzameling van de rationale getallen.<br>**b) Plaats de volgende getallen in het venndiagram.**<br>−5; 9/4 ; 0; −1,2; π; −12/4 ; √9; 1; 4,3<br>[Afbeelding: Venndiagram met verzamelingen IN, Z en Q. In de IN-verzameling: 0, 1, √9. In de Z-verzameling: -5, -12/4. In de Q-verzameling: 9/4, -1,2, 4,3. Buiten de verzamelingen: π]<br>**c) Vul aan met ∈ of ∉.*...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Wat zijn irrationale getallen?', content: 'De rationale getallen zijn alle getallen die je als breuk kunt schrijven. Bestaan er nog andere getallen?<br>## 1.1 Decimale vormen<br>Een decimale vorm is een kommagetal. Het aantal cijfers na de komma kan **eindig** of **oneindig doorlopend** zijn.<br>Je kan de decimale vorm van een rationaal getal (als breuk genoteerd) bepalen met behulp van ICT of door het uitvoeren van een deling.<br>**A) Eindig decimale vormen**<br>Eindig decimale vormen zijn decimale vormen waarbij het aantal cijfers na de komma eindig is.<br>Er bestaan rationale getallen waarbij in de decimale vorm het aantal cijfers na de komma eindig is.<br>**Voorbeelden**<br>3 / 4 = 0,75<br>−13 / 2 = −6,5<br>−9 / 8 = −1,125<br>21 / 5 = 4,2<br>Eindig decimale vormen noemen we ook **decimale getallen**.<br>**Merk op**<br>Je kunt een eindig decimale vorm omzetten naar een breuk waarbij de noemer een macht van 10 is. Daarna kun je de breuk vereenvoudigen. Je kan hier ook ICT voor gebruiken. In het differentiatietraject vind je e', icon: 'book-open' }
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

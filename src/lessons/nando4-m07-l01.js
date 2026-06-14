export default {
    id: 'nando4-m07-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 07 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M07L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 07'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">**1** Gegeven:<br>U is de verzameling van alle vierhoeken.<br>A is de verzameling van alle rechthoeken.<br>B is de verzameling van alle ruiten.<br>a) Teken een passende figuur in elk gebied en plaats de nodige drie puntjes om aan te duiden dat er oneindig veel figuren in een gebied thuishoren.<br>[Afbeelding: Venndiagram met U, A en B. In A\B staat een rechthoek. In B\A staat een ruit. In A ∩ B staat een vierkant. In U\(A ∪ B) staat een parallellogram. Overal staan \"...\" bijgetekend.]<br>b) Omschrijf in woorden:<br>• A\B : Alle rechthoeken die geen ruit zijn.<br>• $\overline{B}$: Alle vierhoeken die geen ruit zijn.<br>• A ∩ B: Alle vierhoeken die een ruit en een rechthoek zijn, alle vierkanten dus.<br>• A ∪ B: Alle vierhoeken die een ruit of een rechthoek zijn.<br>• B\A: Alle ruiten die geen rechthoek zijn.<br>• $\overline{A}$: Alle vierhoeken die geen rechthoek zijn.<br>**2** Gegeven:<br>U is de verzameling van de natuurlijke getallen.<br>P is de verzameling van de priemgetallen kleiner dan 20.<br>A is de verzameling van alle natuurlijke getallen kleiner dan 20.<br>a) Plaats de getallen in het venndiagram.<br>[Afbeelding: Venndiagram U, P en A. P is een deelverzameling van A (P ligt volledig in A, waarbij het gearceerd is in P). Binnen P staan: 2, 3, 5, 7, 11, 13, 17, 19. Binnen A, buiten P staan: 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18. Buiten A (en P), in U staan: 20, 27, 104, ...]<br>b) Omschrijf in woorden:<br>• P ∩ A: Alle priemgetallen kleiner dan 20.<br>• $\overline{A</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'countingProblems', icon: 'PhGameController' }
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
        'countingProblems': {
            type: 'countingProblems',
            title: 'Telproblemen Visualiseren'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 07', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>a) Kleur telkens het juiste gebied.<br>[Afbeelding: Venndiagram A en B met A ∪ B ingekleurd]<br>A ∪ B<br>[Afbeelding: Venndiagram A en B met A \ B ingekleurd]<br>A \ B<br>[Afbeelding: Venndiagram A en B met A ∩ B ingekleurd]<br>A ∩ B<br>b) Noteer de betekenis.<br>• A ∪ B: Alle elementen die behoren tot A of B of beide.<br>• A \ B: Alle elementen die behoren tot A, maar niet tot B.<br>• A ∩ B: Alle elementen die behoren tot A én B.<br>## Opdracht 2<br>Hieronder vind je een afbeel...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Telproblemen', content: '## WAT JE AL KUNT<br>– de doorsnede, unie en het verschil van verzamelingen bepalen<br>## IN DE KIJKER<br>Je leest en herleest de opgave grondig en formuleert het antwoord steeds in een volledige zin.<br>## WAT JE LEERT IN DEZE MODULE<br>– de juiste terminologie en symbolen uit de verzamelingenleer correct gebruiken<br>– de productregel toepassen om bepaalde telproblemen op te lossen<br>– de somregel voor al dan niet disjuncte verzamelingen toepassen<br>– de complementregel toepassen<br>– gepaste venndiagrammen tekenen bij het oplossen van problemen<br>## WISKUNDETAAL<br>– doorsnede<br>– unie<br>– verschil<br>– complement<br>– kardinaalgetal<br>– productregel<br>– boomdiagram<br>– somregel<br>– productverzameling<br>– venndiagram<br>– disjuncte verzamelingen<br>– inclusieve of<br>– exclusieve of', icon: 'book-open' },
        { layout: 'standard', title: 'Terminologie uit de verzamelingenleer', content: 'U is de verzameling van de natuurlijke getallen.<br>A is de verzameling van de natuurlijke delers van 24.<br>B is de verzameling van de natuurlijke delers van 36.<br>[Afbeelding: Venndiagram met U, A, B. Elementen 0, 5, 7 in U; 8, 24 in A\B; 1, 2, 3, 4, 6, 12 in A ∩ B; 9, 18, 36 in B\A]<br>U = {0, 1, 2, 3, …}<br>A = {1, 2, 3, 4, 6, 8, 12, 24}<br>B = {1, 2, 3, 4, 6, 9, 12, 18, 36}<br>## 1.1 Doorsnede en unie van twee verzamelingen<br>**doorsnede van A en B**<br>A ∩ B is de verzameling van alle natuurlijke getallen die deler zijn van 24 **en** deler zijn van 36.<br>**unie van A en B**<br>A ∪ B is de verzameling van alle natuurlijke getallen die deler zijn van 24 **of** deler zijn van 36.<br>[Afbeelding: Venndiagram waarbij de doorsnede A ∩ B gekleurd is]<br>A ∩ B = {1, 2, 3, 4, 6, 12}<br>#(A ∩ B) = 6 → Het kardinaalgetal van A ∩ B is 6.<br>[Afbeelding: Venndiagram waarbij de unie A ∪ B gekleurd is]<br>A ∪ B = {1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36}<br>#(A ∪ B) = 11 → Het kardinaalgetal van', icon: 'book-open' },
        { layout: 'standard', title: 'De productregel', content: '**Voorbeeld 1**<br>Marijke heeft 4 verschillende kleedjes en 3 verschillende pulls.<br>Op hoeveel verschillende manier kan Marijke zich kleden met een kleedje en een pull?<br>We kunnen hierbij een **boomdiagram** tekenen.<br>[Afbeelding: Foto van kleding in een kledingrek]<br>[Afbeelding: Boomdiagram.<br>Vertakking 1 (kleedje): k1, k2, k3, k4.<br>Elke tak heeft 3 subvertakkingen (pull): p1, p2, p3.<br>Uitkomsten (kleedje en pull): k1p1, k1p2, k1p3, k2p1, k2p2, k2p3, k3p1, k3p2, k3p3, k4p1, k4p2, k4p3.]<br>A = {k1, k2, k3, k4} #A = 4<br>B = {p1, p2, p3} #B = 3<br>C = {(k1, p2) ; (k1, p2) ; …; (k4, p3)} #C = 12<br>C wordt de **productverzameling** van A en B genoemd.<br>notatie C = A x B<br>Er geldt:<br>#C = #(A x B) = #A · #B<br>12 = 4 · 3<br>Antwoord: Marijke kan zich op 12 verschillende manieren kleden als ze de keuze heeft tussen 4 verschillende kleedjes en 3 verschillende pulls en een kleedje en een pull zal dragen.<br>formule Om het aantal mogelijke combinaties te bepalen, kan je g', icon: 'book-open' },
        { layout: 'standard', title: 'De somregel', content: '## 3.1 Tellen met verzamelingen<br>In een sportieve klas zijn 18 leerlingen aangesloten bij een voetbalclub of bij een volleybalclub. Sommigen zijn aangesloten bij beide clubs.<br>12 leerlingen zijn aangesloten bij een voetbalclub.<br>10 leerlingen zijn aangesloten bij een volleybalclub.<br>[Afbeelding: Venndiagram voetbal en volleybal, elk gebied aangeduid met \'?\']<br>12 + 10 = 22 > 18<br>Er moeten dus zeker leerlingen dubbel geteld zijn. Dat zijn er 22 - 18 = 4.<br>Deze leerlingen zijn lid van beide clubs.<br>We kunnen dus volgende aantallen plaatsen in de passende gebieden. We noemen de verzamelingen A en B.<br>[Afbeelding: Venndiagram A (voetbal) en B (volleybal). In A\B staat 8. In A ∩ B staat 4. In B\A staat 6.]<br>A is de verzameling van alle leerlingen die aangesloten zijn bij een voetbalclub.<br>B is de verzameling van alle leerlingen die aangesloten zijn bij een volleybalclub.<br>#(A ∪ B) = 18<br>#A = 8 + 4 = 12<br>#B = 4 + 6 = 10<br>Er geldt:<br>#(A ∪ B) = #A + #B − #(A ∩ ', icon: 'book-open' },
        { layout: 'standard', title: 'De complementregel', content: 'U is de verzameling van alle natuurlijke getallen die bestaan uit drie cijfers.<br>Geen enkel getal begint met de 0 vooraan. In totaal zijn er zo 9 · 10 · 10 = 900 getallen mogelijk.<br>Hoeveel van die getallen bevat minstens één 5?<br>A is de verzameling van de natuurlijke getallen die bestaan uit 3 cijfers waarvan minstens één 5.<br>bv. 589, 575, 555, 951, 255, …<br>$\overline{A}$ = U\A is de verzameling van de natuurlijke getallen die bestaan uit 3 cijfers en géén 5 bevatten.<br>bv. 436, 122, 378, 499, …<br>1e cijfer<br>geen 0, geen 5<br>↓<br>8 mogelijkheden<br>2e cijfer<br>geen 5<br>↓<br>9 mogelijkheden<br>3e cijfer<br>geen 5<br>↓<br>9 mogelijkheden<br>Totaal aantal mogelijke natuurlijke getallen die bestaan uit 3 cijfers en die géén 5 bevatten:<br>8 · 9 · 9 = 648<br>Antwoord: Het aantal getallen die bestaan uit 3 cijfers (geen 0 vooraan) en die minstens één 5 bevat is 900 - 648 = 252.<br>We gebruiken in dit geval de **complementregel** om het antwoord te vinden omdat de berekening', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'a) Kleur A\B.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

export default {
    id: 'nando4-m13-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 13 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M13L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 13'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">(Icoon van een pennetje) 1, 2<br>1. a) Noteer onder de grafiek of het gaat om een lineair (recht evenredig) verband, omgekeerd evenredig verband of een kwadratisch verband.<br>[Afbeelding 1: Een grafiek met een rechte lijn door de oorsprong (1e en 3e kwadrant). Daaronder de ingevulde tekst: lineair verband]<br>[Afbeelding 2: Een grafiek met een naar beneden gerichte parabool, top op de y-as. Daaronder de ingevulde tekst: kwadratisch verband]<br>[Afbeelding 3: Een grafiek met een hyperbool, met takken in het 2e en 4e kwadrant. Daaronder de ingevulde tekst: omgekeerd evenredig verband]<br>b) Welke tabellen horen bij een omgekeerd evenredig verband? Kruis aan.<br>[ ]<br>| x | -3 | -2 | -1 | 0 | 1 | 2 | 3 |<br>| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |<br>| y | 9 | 4 | 1 | 0 | 1 | 4 | 9 |<br>[x]<br>| x | 1 | 2 | 3 | 4 | 6 |<br>| :--- | :--- | :--- | :--- | :--- | :--- |<br>| y | 48 | 24 | 16 | 12 | 8 |<br>[ ]<br>| x | -3 | -2 | -1 | 0 | 1 | 2 | 3 |<br>| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |<br>| y | -9 | -6 | -3 | 0 | 3 | 6 | 9 |<br>[x]<br>| x | -0,5 | -0,25 | 0 | 0,25 | 0,5 |<br>| :--- | :--- | :--- | :--- | :--- | :--- |<br>| y | -4 | -8 | \| | 8 | 4 |<br>2. Voor een sportkamp wordt er materiaal gehuurd. Afhankelijk van het aantal inschrijvingen zal een bedrag worden doorgerekend aan de deelnemers.<br>[Afbeelding: Grafiek met op de horizontale as \'aantal leerlingen\' (0 tot 50, per 10) en op de verticale as \'prijs (euro)\' (0 tot 900, per 100)</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'rationalFunctions', icon: 'PhGameController' }
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
        'rationalFunctions': {
            type: 'rationalFunctions',
            title: 'Hyperbool f(x) = c/x'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 13', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>De wet van Ohm is een natuurkundige wet die het verband weergeeft tussen spanning, weerstand en stroomsterkte:<br>formule U = I · R<br>| GROOTHEID | EENHEID |<br>| :--- | :--- |<br>| spanning (U) | volt (V) |<br>| stroomsterkte (I) | ampère (A) |<br>| weerstand (R) | ohm (Ω) |<br>[Afbeelding: Drie driehoeken (U boven, R links, I rechts), telkens met een hand die één van de drie bedekt, wat aangeeft hoe je de formule voor de bedekte grootheid kan afleiden: U afdekken geeft I·R, R...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Functie met voorschrift f(x) = c/x', content: '[Afbeelding: Een foto van een snelwegknooppunt in een stad, genomen van bovenaf. Een rood lint met de witte tekst \"CORRECTIESLEUTEL\" loopt diagonaal over de pagina. In een wit, transparant kader staat de inhoudsopgave van dit hoofdstuk.]<br>**Inhoud**<br>- Omgekeerd evenredige verbanden<br>- Bespreking van de functie f met f(x) = c/x en c ∈ R₀<br>- Signaaloefeningen<br>- Differentiatietraject<br>- Computationeel denken<br>- Studiewijzer<br>### WAT JE AL KUNT<br>- verschillende voorstellingswijzen hanteren voor omgekeerd evenredige verbanden<br>- waarden uit een gegeven tabel of gegeven grafiek aflezen<br>- het verloop van de gegevens in een gegeven tabel of uit een gegeven grafiek bespreken<br>- in een gegeven formule de waarde in één veranderlijke berekenen<br>- het verband tussen twee veranderlijke grootheden door middel van een tabel, grafiek of formule weergeven<br>- de onderlinge ligging van twee grafieken vergelijken en interpreteren<br>- basisbegrippen in verband met functies ', icon: 'book-open' },
        { layout: 'standard', title: 'Omgekeerd evenredige verbanden', content: 'De oppervlakte van een rechthoek is constant en gelijk aan 36 dm². Hoe kunnen de lengte en de breedte variëren?<br>**Waardentabel**<br>| lengte l (in dm) | 1 | 2 | 3 | 4 | 6 | 9 | 12 | 18 | 36 |<br>| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |<br>| breedte b (in dm) | 36 | 18 | 12 | 9 | 6 | 4 | 3 | 2 | 1 |<br>[Afbeelding: Pijltjes duiden aan dat als l van 1 naar 12 gaat (x12), b van 36 naar 3 gaat (:12). Als l van 3 naar 9 gaat (x3), gaat b van 12 naar 4 (:3).]<br>We spreken hier van een **omgekeerd evenredig verband**.<br>We stellen vast dat het product van de overeenkomstige maatgetallen constant is.<br>1 · 36 = 2 · 18 = 3 · 12 = 4 · 9 = 6 · 6 = 9 · 4 = 12 · 3 = 18 · 2 = 36 · 1<br>Aan de hand van deze vaststelling kun je een formule opstellen die hoort bij dit omgekeerd evenredig verband.<br>**Formule**<br>l · b = 36<br>Als je de formule omvormt en de breedte uitdrukt in functie van de lengte: b = 36 / l<br>Het functievoorschrift is dan: b(l) = 36 / l<br>**V', icon: 'book-open' },
        { layout: 'standard', title: 'Bespreking van de functie f met f(x) = c/x en c ∈ R₀', content: '## 2.1 De functie f met voorschrift f(x) = 1/x<br>Met de functie f met voorschrift f(x) = 1/x bepaal je het omgekeerde van een reëel getal. Om de grafiek te tekenen, kun je een aantal functiewaarden berekenen.<br>Je stelt vast dat de functiewaarde voor 0 niet berekend kan worden. Waarden waarvoor de noemer nul wordt, worden uit de waardentabel geweerd. We noemen 0 een **pool** van de functie. Je noteert een verticaal streepje. Je stelt symmetrie vast, want f(-x) = -f(x).<br>Wat gebeurt er als x → -∞? Wat gebeurt er als x → 0? Wat gebeurt er als x → +∞?<br>[Afbeelding: Pijltjes die deze drie bewegingen illustreren]<br>| x | -7 | -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |<br>| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |--- PAGE 1 ---<br>[Afbeelding: Cover van de module \"Functie met voorschrift f(x) = c/x\" met daarop in grote rode letters \"CORRECTIESLEUTEL\"]<br>**D-FINALITEIT 5 UUR – ALGEBRA EN FUNCTIELEER**', icon: 'book-open' },
        { layout: 'standard', title: 'Functie met voorschrift f(x) = c/x', content: '**Inhoud**<br>1. Omgekeerd evenredige verbanden<br>2. Bespreking van de functie f met f(x) = c/x en c ∈ $\mathbb{R}_0$<br>3. Signaaloefeningen<br>4. Differentiatietraject<br>5. Computationeel denken<br>6. Studiewijzer<br>### WAT JE AL KUNT<br>- verschillende voorstellingswijzen hanteren voor omgekeerd evenredige verbanden<br>- waarden uit een gegeven tabel of gegeven grafiek aflezen<br>- het verloop van de gegevens in een gegeven tabel of uit een gegeven grafiek bespreken<br>- in een gegeven formule de waarde in één veranderlijke berekenen<br>- het verband tussen twee veranderlijke grootheden door middel van een tabel, grafiek of formule weergeven<br>- de onderlinge ligging van twee grafieken vergelijken en interpreteren<br>- basisbegrippen in verband met functies gebruiken<br>### WAT JE LEERT IN DEZE MODULE<br>- kenmerken van functies met voorschrift f(x) = c/x vanuit het voorschrift of een grafiek bepalen en c ∈ $\mathbb{R}_0$<br>- het domein, bereik, tekenverloop, stijgen/dalen, toe', icon: 'book-open' },
        { layout: 'standard', title: 'Omgekeerd evenredige verbanden', content: 'De oppervlakte van een rechthoek is constant en gelijk aan 36 dm². Hoe kunnen de lengte en de breedte variëren?<br>**Waardentabel**<br>[Afbeelding: Boven de tabel staan pijltjes die bewerkingen aangeven: van 3 naar 36 staat \"· 12\", en van 12 naar 3 staat \": 12\". Onder de tabel staan soortgelijke pijltjes: van 12 naar 1 staat \": 12\", en van 3 naar 36 staat \"· 12\" maar met een kleine fout in de interpretatie, de pijltjes duiden de relaties aan. Er staat ook \": 3\" en \"· 3\".]<br>| lengte l (in dm) | 1 | 2 | 3 | 4 | 6 | 9 | 12 | 18 | 36 |<br>| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |<br>| breedte b (in dm) | 36 | 18 | 12 | 9 | 6 | 4 | 3 | 2 | 1 |<br>We spreken hier van een **omgekeerd evenredig verband**.<br>We stellen vast dat het product van de overeenkomstige maatgetallen constant is.<br>1 · 36 = 2 · 18 = 3 · 12 = 4 · 9 = 6 · 6 = 9 · 4 = 12 · 3 = 18 · 2 = 36 · 1<br>Aan de hand van deze vaststelling kun je een formule opstellen die hoort bij dit om', icon: 'book-open' },
        { layout: 'standard', title: 'Bespreking van de functie f met f(x) = c/x en c ∈ $\mathbb{R}_0$', content: '## 2.1 De functie f met voorschrift f(x) = 1/x<br>Met de functie f met voorschrift f(x) = 1/x bepaal je het omgekeerde van een reëel getal. Om de grafiek te tekenen, kun je een aantal functiewaarden berekenen.<br>Je stelt vast dat de functiewaarde voor 0 niet berekend kan worden. Waarden waarvoor de noemer nul wordt, worden uit de waardentabel geweerd. We noemen 0 een **pool** van de functie. Je noteert een verticaal streepje. Je stelt symmetrie vast, want f(-x) = -f(x).<br>Wat gebeurt er als x → -∞?<br>Wat gebeurt er als x → 0?<br>Wat gebeurt er als x → +∞?<br>| x | -7 | -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |<br>| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |<br>| f(x) | -0,1429 | -0,1667 | -0,2 | -0,25 | -0,3333 | -0,5 | -1 | \| | 1 | 0,5 | 0,3333 | 0,25 | 0,2 | 0,1667 | 0,1429 |<br>| x | f(x) |<br>| :--- | :--- |<br>| -10 | -0,1 |<br>| -100 | -0,01 |<br>| -1000 | -0,001 |<br>| -10 000 | -0,0001 ', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'a) Noteer een formule die hoort bij de tabel of de grafiek.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

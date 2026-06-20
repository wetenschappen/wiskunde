export default {
    id: 'nando4-m03-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 03 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M03L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 03'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">**1** Kleur de functievoorschriften die voorschriften zijn van een functie van de tweede graad.<br>[De volgende drie vakjes zijn roze gekleurd in de originele afbeelding:]<br>f(x) = -3x² + 4x - 1<br>h(x) = (7x² + 5) / 2<br>q(x) = -4(x - 1)(2x - 5)<br>[De volgende drie vakjes zijn niet gekleurd (wit):]<br>g(x) = (x + 3)(x² + 5x - 10)<br>p(x) = √3x² + 9x - 1<br>r(x) = -1 / x²<br>**2** Van de tweedegraadsfunctie f werden een aantal punten getekend in een assenstelsel.<br>De top van de grafiek van de functie is T(-1, 0).<br>a) Teken de grafiek van deze functie in het gegeven assenstelsel.<br>[Afbeelding: Een assenstelsel met een rode getekende parabool (dalparabool) door de punten (-4, 9), (-3, 4), (-2, 1), (-1, 0), (0, 1), (1, 4) en (2, 9). De top is (-1, 0).]<br>b) Bepaal de vergelijking van de symmetrieas van de grafiek van deze functie.<br>x = -1<br>c) Bepaal de nulwaarde(n).<br>De grafiek raakt de x-as in het punt met coördinaat (-1, 0). De nulwaarde is -1.<br>**3** Beantwoord de volgende vragen aan de hand van de grafiek van de tweedegraadsfunctie f.<br>[Afbeelding: Een assenstelsel met een oranje bergparabool. De top ligt in T(2, 3). De parabool snijdt de x-as in x=-5 en x=9. Andere afleesbare punten zijn o.a. (-2, 0), (0, 2), (4, 2), (6, 0).]<br>a) Bepaal het domein van deze functie f.<br>dom f = R<br>b) Bepaal het bereik van deze functie f.<br>ber f = ]-∞, 3]<br>c) Geef de vergelijking van de symmetrieas van de grafiek van deze functie.<br>x = 2<br>d) Stel de tekentabel </p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'quadraticFunctions', icon: 'PhGameController' }
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
        'quadraticFunctions': {
            type: 'quadraticFunctions',
            title: 'Parabolen Onderzoeken'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 03', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Een functie is een verband tussen twee veranderlijken x en y, waarbij voor elke waarde van x er hoogstens één y-waarde bestaat. Welke van onderstaande grafieken stelt een functie voor? Omcirkel het passende antwoord.<br>[Afbeelding: Assenstelsel met een bloemvormige rode curve (4 bloembladen).]<br>FUNCTIE<br>[GEEN FUNCTIE] (omcirkeld)<br>[Afbeelding: Assenstelsel met een rode curve in de vorm van een V met de top op (0,0).]<br>[FUNCTIE] (omcirkeld)<br>GEEN FUNCTIE<br>[Afbeelding...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Functies van de tweede graad', content: '**Inhoud**<br>Instap<br>1 Functies van de tweede graad<br>2 De grafiek van f(x) = ax²<br>3 De grafiek van f(x) = (x - p)²<br>4 De grafiek van f(x) = x² + q<br>5 De grafiek van f(x) = a(x - p)² + q<br>Signaaloefeningen<br>Differentiatietraject<br>Computationeel denken<br>Studiewijzer<br>### WAT JE AL KUNT<br>– een voorschrift van een functie van de eerste graad herkennen<br>– de grafiek van een functie van de eerste graad tekenen<br>– de nulwaarde van een eerstegraadsfunctie berekenen en bepalen<br>– de tekentabel, het stijgen/dalen van een functie van de eerste graad geven<br>### WAT JE LEERT IN DEZE MODULE<br>– een voorschrift van een functie van de tweede graad herkennen<br>– de grafiek van een tweedegraadsfunctie tekenen<br>– de grafiek van een tweedegraadsfunctie opbouwen<br>– de nulwaarden en het extremum bepalen<br>– de tekentabel en het stijgen/dalen van een functie van de tweede graad geven<br>### IN DE KIJKER<br>Je gebruikt ICT om verbanden te visualiseren en redeneringen te c', icon: 'book-open' },
        { layout: 'standard', title: 'Functies van de tweede graad', content: '## 1.1 Wat is een functie van de tweede graad?<br>**definitie**<br>Een **functie van de tweede graad** is een functie f met voorschrift f(x) = ax² + bx + c waarbij a, b en c reële getallen zijn en a verschillend is van nul.<br>**Voorbeelden**<br>f(x) = 3x² - 4x + 2<br>g(x) = -0,2x² + 1<br>h(x) = √2x² - (1/2)x<br>p(x) = (6x - x²) / 5<br>**Merk op**<br>• Een functie van de tweede graad noemen we ook wel **tweedegraadsfunctie** of **kwadratische functie**.<br>• In de definitie staat er dat a verschillend is van 0. Dat is noodzakelijk, anders valt de term met x² weg en zou je geen voorschrift van een tweedegraadsfunctie hebben.<br>• Als het functievoorschrift niet kan geschreven worden in de vorm f(x) = ax² + bx + c, dan is het geen tweedegraadsfunctie.<br>f(x) = 3 / x² is geen voorschrift van een tweedegraadsfunctie.<br>g(x) = (x² - 5x + 1) / (4x + 2) is geen voorschrift van een tweedegraadsfunctie.<br>h(x) = (3x - 1) · (x + 2) is een voorschrift van een tweedegraadsfunctie.<br>Je kan de ', icon: 'book-open' },
        { layout: 'standard', title: 'De grafiek van f(x) = ax² (met a ∈ R0)', content: '## 2.1 De elementaire tweedegraadsfunctie f met voorschrift f(x) = x²<br>Om de grafiek op papier te tekenen, berekenen we van een aantal punten de coördinaatgetallen. Als je weet waar de top van de grafiek van de tweedegraadsfunctie ligt, kun je gebruik maken van symmetrie.<br>| x | -3 | -2,5 | -2 | -1,5 | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 |<br>|---|---|---|---|---|---|---|---|---|---|---|---|---|---|<br>| f(x) | 9 | 6,25 | 4 | 2,25 | 1 | 0,25 | 0 | 0,25 | 1 | 2,25 | 4 | 6,25 | 9 |<br>Met ICT kun je de punten in een assenstelsel plaatsen. Tik je het voorschrift van de functie in, dan wordt de grafiek volledig getekend. Je stelt vast dat de punten op de grafiek liggen.<br>[Afbeelding: Grafiek van y = f(x) = x². Een rode dalparabool met de top in (0,0). Punten (-3,9), (-2,4), (-1,1), (0,0), (1,1), (2,4) en (3,9) zijn aangeduid.]<br>De grafiek van de functie f met voorschrift f(x) = x² heeft de volgende kenmerken:<br>• Het domein van de functie f: dom f = R<br>• Het bereik van d', icon: 'book-open' },
        { layout: 'standard', title: 'De grafiek van f(x) = (x - p)²', content: 'f1(x) = x² | f2(x) = (x + 3)² | f3(x) = (x - 1)²<br>---|---|---<br>[Afbeelding: y=x² dalparabool in oorsprong] | [Afbeelding: y=(x+3)² dalparabool verschoven naar links, top (-3,0). y=x² is stippellijn] | [Afbeelding: y=(x-1)² dalparabool verschoven naar rechts, top (1,0). y=x² is stippellijn]<br>vaststelling: p = 0 | vaststelling: p = -3 | vaststelling: p = 1<br>| De grafiek is horizontaal 3 eenheden naar links verschoven. | De grafiek is horizontaal 1 eenheid naar rechts verschoven.<br>| x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 |<br>|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|<br>| f1(x) | 4 | 1 | 0 | 1 | 4 | f2(x) | 1 | 4 | 9 | 16 | 25 | f3(x) | 9 | 4 | 1 | 0 | 1 |<br>De grafiek van de functie f met voorschrift f(x) = (x - p)² heeft de volgende kenmerken:<br>• Het domein van de functie f: dom f = R<br>• Het bereik van de functie f: ber f = [0, +∞[<br>• Extreme waarde(n) (minimum of maximum):<br>Het minimum is 0. Deze fu', icon: 'book-open' },
        { layout: 'standard', title: 'De grafiek van f(x) = x² + q', content: 'f1(x) = x² | f2(x) = x² + 2 | f3(x) = x² - 4<br>---|---|---<br>[Afbeelding: y=x² dalparabool top (0,0)] | [Afbeelding: y=x²+2 dalparabool top (0,2). y=x² als stippellijn] | [Afbeelding: y=x²-4 dalparabool top (0,-4). y=x² als stippellijn]<br>vaststelling: q = 0 | vaststelling: q = 2<br>De grafiek is verticaal 2 eenheden naar boven verschoven. | vaststelling: q = -4<br>De grafiek is verticaal 4 eenheden naar onder verschoven.<br>| x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 |<br>|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|<br>| f1(x) | 4 | 1 | 0 | 1 | 4 | f2(x) | 6 | 3 | 2 | 3 | 6 | f3(x) | 0 | -3 | -4 | -3 | 0 |<br>De grafiek van de functie f met voorschrift f(x) = x² + q heeft de volgende kenmerken:<br>• Het domein van de functie f: dom f = R<br>• Het bereik van de functie f: ber f = [q, +∞[<br>• Extreme waarde(n) (minimum of maximum):<br>Het minimum is q. Deze functiewaarde wordt bereikt bij x-waarde 0.<br>De coördinaat van', icon: 'book-open' },
        { layout: 'standard', title: 'De grafiek van f(x) = a(x - p)² + q (met a ∈ R0)', content: 'De grafiek van de functie f met voorschrift f(x) = a(x - p)² + q ontstaat door de volgende transformaties met de grafiek van de functie g met voorschrift g(x) = x² uit te voeren:<br>• verticaal uitrekken volgens de y-as met factor |a|<br>• spiegelen ten opzichte van de x-as als a < 0<br>• verschuiven volgens de x-as over een afstand van |p| eenheden:<br>naar rechts als p > 0<br>naar links als p < 0<br>• verschuiven volgens de y-as over een afstand van |q| eenheden:<br>naar boven als q > 0<br>naar onder als q < 0<br>**Voorbeeld**<br>Om de grafiek van de functie f met voorschrift f(x) = (-1/3)(x - 6)² + 3 te verkrijgen moet je de grafiek van de functie g met voorschrift g(x) = x² …<br>- verticaal uitrekken met factor 1/3;<br>- om daarna te spiegelen ten opzichte van de x-as;<br>- vervolgens horizontaal te verschuiven met 6 eenheden naar rechts;<br>- om tot slot verticaal te verschuiven met 3 eenheden naar boven.<br>**TIP**<br>a = -1/3<br>p = 6<br>q = 3<br>[Afbeelding: Assenstelsel dat de', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '**1** Kleur de functievoorschriften die voorschriften zijn van een functie van de tweede graad.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

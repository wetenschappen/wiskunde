export default {
    id: 'nando4-m05-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 05 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M05L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 05'
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'quadraticEquations', icon: 'PhGameController' }
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
        'quadraticEquations': {
            type: 'quadraticEquations',
            title: 'Vraagstukken Oplossen'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 05', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>De grafiek van de functie f met voorschrift f(x) = -x² + 4x - 0,4 is gegeven.<br>Bepaal de vergelijking van de symmetrieas van de grafiek van de functie.<br>x = 2<br>Bepaal de coördinaat van de top. Bepaal hiervoor de x-coördinaat en bereken de y-coördinaat.<br>x = 2<br>f(2) = -2² + 4 · 2 - 0,4<br>= -4 + 8 - 0,4<br>= 3,6       ---> De coördinaat van de top is (2; 3,6).<br>[Afbeelding: Grafiek van de functie y = f(x) met een bergparabool. De top T is aangeduid bij (2; 3,6). De sy...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Problemen oplossen met tweedegraadsfuncties', content: '[Afbeelding: Foto van een brug weerspiegeld in het water. Er staat in grote rode schuine letters CORRECTIESLEUTEL over de pagina heen.]<br>**Inhoud**<br>**Instap**<br>**1 Kenmerken van de grafiek van de functie f(x) = ax² + bx + c (a ≠ 0)**<br>**2 Functievoorschriften opstellen**<br>**3 Problemen oplossen**<br>**Signaaloefeningen**<br>**Differentiatietraject**<br>**Computationeel denken**<br>**Studiewijzer**<br>[Afbeelding: Icoon van een rode peper] **WAT JE AL KUNT**<br>- een tweedegraadsfunctie herkennen en de grafiek van deze functie tekenen<br>- de top bepalen van de grafiek van een tweedegraadsfunctie van de vorm f(x) = a(x – p)² + q<br>- de tekentabel, het stijgen-dalen van een tweedegraadsfunctie van de eerste graad geven als de grafiek gegeven is<br>[Afbeelding: Icoon van een rode peper] **WAT JE LEERT IN DEZE MODULE**<br>- aantonen dat het functievoorschrift f(x) = ax² + bx + c kan worden omgevormd tot f(x) = a(x – p)² + q<br>- de coördinaat van de top van de grafiek berekenen', icon: 'book-open' },
        { layout: 'standard', title: 'Kenmerken van de grafiek van de functie f(x) = ax² + bx + c (a ≠ 0)', content: '## 1.1 f(x) = a(x - p)² + q of f(x) = ax² + bx + c (a ≠ 0)<br>Door gebruik te maken van een merkwaardig product en distributiviteit kunnen we de vorm a(x - p)² + q uitwerken als volgt:<br>a(x - p)² + q = a(x² - 2px + p²) + q<br>= ax² - 2apx + ap² + q<br>Gelijke veeltermen hebben dezelfde graad en de coëfficiënten van de overeenkomstige machten zijn twee aan twee gelijk.<br>Als ax² + bx + c = ax² - 2apx + ap² + q, dan:<br>a = a<br>-2ap = b<br>p = -b / 2a<br>ap² + q = c<br>a · (-b / 2a)² + q = c<br>a · (b² / 4a²) + q = c<br>(b² / 4a) + q = c<br>q = -(b² / 4a) + c<br>q = -(b² / 4a) + (4ac / 4a)<br>q = (-b² + 4ac) / 4a<br>**eigenschap**<br>Elk functievoorschrift f(x) = ax² + bx + c (met a ≠ 0) is te schrijven als<br>f(x) = a(x - p)² + q met p = -b / 2a en q = (-b² + 4ac) / 4a<br>Als het functievoorschrift in de vorm f(x) = ax² + bx + c staat, dan kun je met deze formules de coördinaat van de top van de grafiek en de symmetrieas van de grafiek bepalen.<br>**Voorbeeld**<br>f(x) = 3x² - 2x + ', icon: 'book-open' },
        { layout: 'standard', title: 'Functievoorschriften opstellen', content: '## 2.1 De coördinaat van de top en een willekeurig punt op de parabool zijn gegeven<br>**Voorbeeld**<br>Gegeven: De top van de parabool is T(-3, 5) en het punt P(-1, 13) ligt op de parabool.<br>Gevraagd: het functievoorschrift dat hoort bij deze parabool<br>Oplossing:<br>- De top van de parabool is T(-3, 5).<br>Dus p = -3 en q = 5.<br>f(x) = a(x - p)² + q wordt f(x) = a(x + 3)² + 5.<br>- Het punt P(-1, 13) ligt op de parabool. Dus f(-1) = 13.<br>13 = a(-1 + 3)² + 5<br>13 = 4a + 5<br>13 - 5 = 4a<br>8 = 4a<br>2 = a<br>- Besluit: f(x) = 2(x + 3)² + 5<br>[Afbeelding: Grafiek van y = f(x) = 2(x+3)²+5 met top T(-3,5) en punt P(-1,13) aangeduid.]<br>[Afbeelding: Icoon van een rode peper] **Merk op** [Afbeelding: Pijl naar rechts]<br>Je kan ook met behulp van de grafiek a bepalen:<br>- Vertrek altijd vanuit de top.<br>- Kijk hoe de y-waarde verandert als je de x-waarde met 1 eenheid vermeerdert.<br>- a = 2<br>[Afbeelding: Grafiek van y = f(x). Vanuit top T(-3,5) gaat men 1 eenheid naar rechts ', icon: 'book-open' },
        { layout: 'standard', title: 'Problemen oplossen', content: '**Voorbeeld 1**<br>De som van twee getallen is 10. Wanneer is de som van hun kwadraten zo klein mogelijk? Bereken die som.<br>**Probleem begrijpen:**<br>We kiezen een aantal willekeurige getallen en berekenen de som.<br>| getal 1 | getal 2 | kwadraat van getal 1 | kwadraat van getal 2 | som van de kwadraten |<br>|---|---|---|---|---|<br>| -2 | 12 | 4 | 144 | 148 |<br>| -1 | 11 | 1 | 121 | 122 |<br>| 0 | 10 | 0 | 100 | 100 |<br>| 1 | 9 | 1 | 81 | 82 |<br>| 2 | 8 | 4 | 64 | 68 |<br>| 3 | 7 | 9 | 49 | 58 |<br>| 4 | 6 | 16 | 36 | 52 |<br>| 5 | 5 | 25 | 25 | 50 |<br>| **x** | **10 - x** | **x²** | **(10 - x)²** | **x² + (10 - x)²** |<br>**Probleem oplossen:**<br>Getal 1: x<br>Getal 2: 10 - x<br>Het functievoorschrift dat bij deze context hoort:<br>s(x) = x² + (10 - x)²<br>s(x) = x² + 100 - 20x + x²<br>s(x) = 2x² - 20x + 100<br>Om de kleinste waarde te bepalen, bepalen we het minimum.<br>p = -b / 2a = 20 / 4<br>= 5<br>q = f(5) = 2 · 5² - 20 · 5 + 100<br>= 50 - 100 + 100<br>= 50<br>Antwoord: ', icon: 'book-open' }
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

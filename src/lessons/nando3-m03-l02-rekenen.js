export default {
    id: 'nando3-m03-l02-rekenen',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 03 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M03L2',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 03'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">1. a) Meet en noteer de norm van u in symbolen.<br>[Afbeelding: Vector u]<br>[ ... invulveld: ||u|| = 2,2 cm ... ]<br>1. b) Schrap wat niet past.<br>[Afbeelding: Verticale vector t, pijl naar beneden]<br>De ~~richting~~ / zin van deze vector is verticaal.<br>De richting / ~~zin~~ van deze vector is naar beneden.<br>2. a) Noteer de vectoren met dezelfde richting en de vectoren met dezelfde grootte.<br>[Afbeelding: Vectoren u, v, w, s, t getekend]<br>- vectoren met dezelfde richting: [ ... invulveld: u en v; w en s ... ]<br>- vectoren met dezelfde grootte: [ ... invulveld: u en s; w en t ... ]<br>2. b) Noteer de gelijke vectoren en de tegengestelde vectoren.<br>[Afbeelding: Vier vectoren v1, v2, v3, v4 getekend. v1 en v4 zijn tegengesteld, v3 en v4 zijn gelijk.]<br>- gelijke vectoren: [ ... invulveld: v3 en v4 ... ]<br>- tegengestelde vectoren: [ ... invulveld: v1 en v2 ... ]<br>3. Bestudeer de volgende afbeelding. Markeer daarna de juiste opties in de tekst.<br>[Afbeelding: Touwtrekken tussen twee teams, krachten F1 en F2 aangeduid met vectoren]<br>- De kracht die het rechtse team uitoefent op de tegenstander wordt hier weergegeven met de vector ~~F1~~ / [F2].<br>- De vectoren F1 en F2 hebben dezelfde [richting] / ~~zin~~ maar een tegenstelde ~~richting~~ / [zin].<br>- Het linkse team oefent een kracht uit die groter / [even groot] / kleiner is dan het rechtse team.<br>- Daarom wint het rechtse team / [geen enkel team] / het linkse team.<br>4. Teken de somvector AB + CD die he</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'vectors', icon: 'PhArrowUpRight' }
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
        'vectors': {
            type: 'vectors',
            title: 'Vectoren'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 03', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Rekenen met vectoren in het vlak', content: 'Meestal werken er meerdere krachten in op een voorwerp. Op zo’n moment is het handig om al die krachten te kunnen uitdrukken met één kracht. Daarvoor zullen we bewerkingen uitvoeren met vectoren.<br>## 2.1 Som van vectoren tekenen in het vlak<br>Om de som van 2 vectoren a en b te vinden, kun je twee methodes gebruiken:<br>| DE KOP-STAART-REGEL OF DRIEHOEKREGEL | DE PARALLELLOGRAMREGEL |<br>| :--- | :--- |<br>| Je verbindt de kop van de eerste vector met de staart van de tweede vector. | |<br>| **Hoe teken je de som van twee vectoren?**<br>STAP 1: Verschuif het beginpunt van de ene vector naar het eindpunt van de andere vector.<br>STAP 2: Verbind het beginpunt van de eerste vector met het eindpunt van de tweede vector. | **Hoe teken je de som van twee vectoren?**<br>STAP 1: Verschuif beide vectoren zodat ze hetzelfde beginpunt hebben.<br>STAP 2: Teken vervolgens een parallellogram met als zijden de twee vectoren.<br>STAP 3: Teken de diagonaal die vertrekt uit het beginpunt van de twee v', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Vectoren en coördinaten', content: '## 3.1 Coördinaat van een puntvector<br>De vector OP heeft als beginpunt de oorsprong O, en als eindpunt het punt P met coördinaat (3, 4).<br>Een vector waarvan het beginpunt de oorsprong is, noemen we een **puntvector**. Kortweg noteer je deze vector als P.<br>Om de coördinaat van P te bepalen, volstaat het om de coördinaat van P te bepalen.<br>Dus de coördinaat van P is (3, 4).<br>[Afbeelding: Vector P vertrekkend uit oorsprong (0,0) tot punt P (3,4) in een assenstelsel]<br>## 3.2 Coördinaat van een willekeurige vector<br>De vector AB heeft als beginpunt A(1, 2) en als eindpunt B(5, 4). Vector Q is een puntvector met coördinaat (4, 2).<br>Aangezien AB en Q gelijke vectoren zijn, hebben ze ook dezelfde coördinaat.<br>Dus: co(AB) = co(Q) = (4, 2).<br>[Afbeelding: Vector AB tussen (1,2) en (5,4) en equivalente puntvector Q tussen (0,0) en (4,2)]<br>**Merk op**<br>B(5, 4)<br>- A(1, 2)<br>-------<br>Q(4, 2)<br>**Algemeen:**<br>De coördinaat van een willekeurige vector AB met als beginpunt', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '1. Teken de punten X en Y zodat AX = BC en YB = CA.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

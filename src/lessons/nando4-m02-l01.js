export default {
    id: 'nando4-m02-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 02 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M02L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 02'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">## 1<br>Schrijf elke vergelijking in de vorm ux + vy + w = 0.<br>Noteer bij elke vergelijking drie mogelijke oplossingen.<br>| | a) 2x = 5 + 4y | b) 3y = 10 + x | c) x = -3y |<br>|---|---|---|---|<br>| ux + vy + w = 0 | [ 2x - 4y - 5 = 0 ] | [ x - 3y + 10 = 0 ] | [ x + 3y = 0 ] |<br>| 3 oplossingen: 1) | [ (-1, -7/4) ] | [ (-1, 3) ] | [ (0, 0) ] |<br>| 2) | [ (0, -5/4) ] | [ (2, 4) ] | [ (-3, 1) ] |<br>| 3) | [ (1, -3/4) ] | [ (-7, 1) ] | [ (3, -1) ] |<br>## 2<br>Noteer het volgende probleem als een stelsel.<br>(Let op, je moet het probleem dus niet oplossen!)<br>De omtrek van een rechthoek is 40 m. De lengte is 4 m minder dan het dubbele van de breedte. Bereken de<br>lengte en de breedte van deze rechthoek.<br>Oplossing:<br>1) Keuze van de onbekenden<br>- [ lengte rechthoek ] : x<br>- [ breedte rechthoek ] : y<br>2) Opstellen van de twee vergelijkingen van het stelsel:<br>{ [ 2(x + y) = 40 ]<br>{ [ x = 2y - 4 ]<br>## 3<br>Los de volgende stelsels grafisch op. Bepaal telkens de oplossingenverzameling.<br>a)<br>{ y = 3x + 1 → rechte a<br>{ y = -4x + 1 → rechte b<br>| rechte a | |<br>|---|---|<br>| x | y |<br>| [ 0 ] | [ 1 ] |<br>| [ 1 ] | [ 4 ] |<br>| rechte b | |<br>|---|---|<br>| x | y |<br>| [ 1 ] | [ -3 ] |<br>| [ -1 ] | [ 5 ] |<br>[Afbeelding: Assenstelsel met rechten a en b getekend, snijpunt bij (0, 1).]<br>V = [ {(0, 1)} ]<br>Controleer je antwoord met ICT.<br>b)<br>{ 3x + 2y - 6 = 0    [ a ↔ y = -3/2 x + 3 ]<br>{ 3x - 2y - 18 = 0   [ b ↔ y = 3/2 x - 9 ]<br>| rechte a </p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'linearSystems', icon: 'PhGameController' }
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
        'linearSystems': {
            type: 'linearSystems',
            title: 'Stelsels Oplossen'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 02', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Larissa spaart voor een nieuwe smartphone. In haar spaarpot zitten briefjes van € 5,00 en € 10,00. Ze telt 30 briefjes.<br>Larissa heeft nu een bedrag van € 240,00 gespaard.<br>Hoeveel briefjes van € 5,00 en hoeveel van € 10,00 zitten er in haar spaarpot?<br>Los dit probleem op aan de hand van de volgende stappen.<br>1) Keuze van de onbekende:<br>- aantal briefjes van € 5,00: [ x ]<br>- aantal briefjes van € 10,00: [ 30 - x ]<br>2) Opstellen van een vergelijking:<br>[ 5x + 10(30...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Wat is een stelsel?', content: 'Het probleem uit de instap (opdracht 1) kan ook anders opgelost worden.<br>We maken hierbij gebruik van twee onbekenden.<br>Larissa spaart voor een nieuwe smartphone. In haar spaarpot zitten briefjes van € 5,00 en € 10,00. Ze telt 30 briefjes.<br>Larissa heeft nu een bedrag van € 240,00 gespaard. Hoeveel briefjes van € 5,00 en hoeveel van € 10,00 zitten er in haar<br>spaarpot?<br>**Oplossing**<br>1) Keuze van de onbekenden:<br>- aantal briefjes van € 5,00: x<br>- aantal briefjes van € 10,00: y<br>2) Opstellen van de vergelijkingen:<br>“Ze telt 30 briefjes.” → x + y = 30<br>“Larissa heeft nu € 240,00 gespaard.” → 5x + 10y = 240<br>De samenvoeging van deze beide vergelijkingen levert een **stelsel** op.<br>In deze module komen stelsels van twee vergelijkingen van de eerste graad in twee onbekenden aan bod.<br>We noteren een stelsel door een accolade vooraan te plaatsen.<br>notatie<br>{ x + y = 30<br>{ 5x + 10y = 240<br>3) Oplossen van het stelsel:<br>Bij elke vergelijking van het stelsel', icon: 'book-open' },
        { layout: 'standard', title: 'Grafische oplossingsmethode', content: 'Een stelsel bevat twee vergelijkingen van de eerste graad in twee onbekenden. Elke vergelijking is te herleiden naar de<br>vorm ux + vy + w = 0 (met u en v niet tegelijkertijd 0). Beide vergelijkingen zijn dus vergelijkingen van rechten.<br>{ x + y = 30 → rechte a<br>{ 5x + 10y = 240 → rechte b<br>Dit stelsel bevat dus twee vergelijkingen van rechten. We kunnen deze rechten tekenen in een assenstelsel.<br>| rechte a | | rechte b | |<br>|---|---|---|---|<br>| x | y | x | y |<br>| 0 | 30 | 0 | 24 |<br>| 2 | 28 | 20 | 14 |<br>[Afbeelding: Assenstelsel met x-as van -4 tot 54 en y-as van -2 tot 36. Rechte a daalt steiler en gaat door (0, 30) en (30, 0). Rechte b daalt minder steil en gaat door (0, 24) en (48, 0). Ze snijden elkaar in punt S op coördinaten (12, 18). De vergelijkingen x + y = 30 en 5x + 10y = 240 staan aangeduid.]<br>Er is precies één punt dat op beide rechten ligt, namelijk het snijpunt S van beide rechten.<br>De coördinaat van dit punt S voldoet aan beide vergelijkingen van', icon: 'book-open' },
        { layout: 'standard', title: 'Algebraïsche oplossingsmethodes', content: 'Met een algebraïsche oplossingsmethode bereken je de oplossing van het stelsel zonder dat je de rechten moet<br>tekenen.<br>De oplossing van het stelsel is onafhankelijk van de gekozen oplossingsmethode.<br>## 3.1 De gelijkstellingsmethode<br>Hoe los je een stelsel op door middel van de gelijkstellingsmethode?<br>**methode**<br>STAP 1: Vorm beide vergelijkingen om naar dezelfde onbekende.<br>STAP 2: Stel beide uitdrukkingen aan elkaar gelijk.<br>STAP 3: Los de verkregen vergelijking op.<br>STAP 4: Vervang de gevonden onbekende in één van de twee vergelijkingen en bereken zo de andere onbekende.<br>**Voorbeeld 1**<br>{ x + y - 30 = 0<br>{ 5x + 10y - 240 = 0<br>⇔<br>{ x = -y + 30<br>{ 5x = -10y + 240<br>⇔<br>{ x = -y + 30<br>{ x = -2y + 48<br>⇔<br>{ -y + 30 = -2y + 48<br>{ x = -2y + 48<br>⇔<br>{ y = 18<br>{ x = -2y + 48<br>⇔<br>{ y = 18<br>{ x = -36 + 48<br>⇔<br>{ y = 18<br>{ x = 12<br>V = {(12, 18)}<br>**Voorbeeld 2**<br>{ x - y + 1 = 0<br>{ 3x + y - 9 = 0<br>⇔<br>{ y = x + 1<br>{ y = -', icon: 'book-open' },
        { layout: 'standard', title: 'Problemen oplossen', content: 'Hoe los je een probleem op met een stelsel?<br>**methode**<br>STAP 1: Gebruik twee letters (meestal x en y) om de onbekenden voor te stellen.<br>Vermeld je keuze van de onbekenden.<br>STAP 2: Stel twee vergelijkingen bij het probleem op. Je krijgt nu een stelsel.<br>STAP 3: Los het stelsel op (met een algebraïsche oplossingsmethode).<br>STAP 4: Formuleer een antwoord.<br>STAP 5: Controleer je antwoord.<br>**Voorbeeld**<br>De omtrek van een rechthoek is 40 m. De lengte is 4 m minder dan het dubbele van de breedte. Bereken de lengte en de<br>breedte van deze rechthoek.<br>**Oplossing**<br>1) Keuze van de onbekenden:<br>- De lengte: x<br>- De breedte: y<br>2) Twee vergelijkingen opstellen. Je krijgt een stelsel.<br>- \"De omtrek van een rechthoek is 40 m.\" ⟹ → 2(x + y) = 40<br>- \"De lengte is 4 m minder dan het dubbele van de breedte.\" → x = 2y - 4<br>⟹<br>{ 2(x + y) = 40<br>{ x = 2y - 4<br>3) Los het stelsel op.<br>{ 2x + 2y = 40<br>{ x = 2y - 4<br>⟺<br>{ x + y = 20<br>{ x = 2y - 4<br', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Stel een passend stelsel op bij de volgende problemen. Vermeld duidelijk je keuze van onbekenden.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

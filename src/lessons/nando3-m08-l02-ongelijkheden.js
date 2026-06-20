export default {
    id: 'nando3-m08-l02-ongelijkheden',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 08 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M08L2',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 08'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">1<br>Bitcoin (BTC) is een cryptomunt en wordt ook als betaalmiddel gebruikt (zonder tussenpersoon). Hieronder zie je gegevens in verband met de waarde van 1 BTC in euro.<br>[Afbeelding: Grafiek \"Bitcoin Koers (in €)\" met een logaritmische y-as van 0 tot 100 000 en x-as met jaartallen van 2010 tot 2023. De grafieklijn is oranje en fluctueert sterk.]<br>| Bitcoin waarde in €: 2010 - 2023 | | | |<br>| :--- | :--- | :--- | :--- |<br>| Jaar | Waarde start | Waarde einde | % Verandering |<br>| 2010 | 0,002 | 0,23 | 11400% |<br>| 2011 | 0,23 | 3,64 | 1404% |<br>| 2012 | 3,64 | 10,21 | 180% |<br>| 2013 | 10,21 | 548,87 | 5276% |<br>| 2014 | 548,87 | 263,10 | -52% |<br>| 2015 | 263,10 | 396,62 | 50% |<br>| 2016 | 396,62 | 916,72 | 131% |<br>| 2017 | 916,72 | 11 795,03 | 1187% |<br>| 2018 | 11 795,03 | 3256,93 | -72% |<br>| 2019 | 3256,93 | 6411,46 | 97% |<br>| 2020 | 6411,46 | 23 741,74 | 270% |<br>| 2021 | 23 741,74 | 40 712,72 | 71% |<br>| 2022 | 40 712,72 | 15 426,75 | -62% |<br>| 2023 | 15 426,75 | 38 132,05 | 147% |<br>a) Welke grootheden komen hier aan bod?<br>tijd en de waarde van 1 Bitcoin<br>b) Welke voorstellingswijze geniet jouw voorkeur?<br>Antwoord van de leerling.<br>c) Welke informatie vind jij het meest waardevol?<br>Antwoord van de leerling.<br>d) Waarom is de grafiek misleidend? Maak met ICT een betere grafiek.<br>De y-as gaat van 0 → 10 → 100 → 1000 → 10 000 → 100 000. Het suggereert een rustigere groei dan in werkelijkheid. Echte dalingen vallen hierdoor minder o</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'linearFunctions', icon: 'PhTrendUp' }
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
        'linearFunctions': {
            type: 'linearFunctions',
            title: 'Functies'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 08', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Problemen oplossen', content: '## 4.1 Onderlinge ligging van 2 grafieken<br>We kunnen grafieken met eenzelfde of verschillend verband met elkaar vergelijken door te kijken naar de voorstelling, de gebruikte verdeling op de assen, ... In een andere module gaan we dieper in op hoe je dat ook algebraïsch kunt doen.<br>**Voorbeeld: 1000 km fietsen**<br>Het hemelvaartweekend is al enkele jaren het 1000 km-weekend. De deelnemers fietsen 4 dagen lang voor Kom op tegen Kanker. Elke dag leggen de deelnemers gemiddeld 250 km af. Liam en Amir besluiten om alvast eens 250 km te trainen. Liam vertrekt \'s morgens om 7 uur aan een gemiddelde snelheid van 20 km/h. Amir vertrekt om 8 uur aan een gemiddelde snelheid van 25 km/h.<br>[Afbeelding: Grafiek \'afgelegde weg (in km)\' t.o.v. \'tijdstip (in h)\'. Groene lijn start op (7,0) en stijgt naar (19.5, 250). Blauwe lijn start op (8,0) en stijgt naar (18, 250). Ze snijden elkaar op (12, 100). Logo \"De 1000 km voor Kom op tegen Kanker\" is afgebeeld.]<br>• We lezen op de horizontale', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Het verband tussen 2 grootheden weergeven', content: '## 1.1 In een tabel<br>Als je een bergwandeling maakt, merk je dat hoe hoger je gaat, hoe kouder het wordt. In de tabel vind je de buitentemperatuur bij een welbepaalde hoogte.<br>| HOOGTE (in m) | TEMPERATUUR (in °C) |<br>| :--- | :--- |<br>| 1000 | 8,5 |<br>| 1600 | 4,6 |<br>| 2400 | -0,6 |<br>| 3400 | -7,1 |<br>| 4600 | -14,9 |<br>| 6000 | -24,0 |<br>[Afbeelding: Een foto van een besneeuwd berglandschap en een wandelaar op een bergpad.]<br>In de tabel lezen we twee grootheden af. De hoogte in meter en de temperatuur in graden Celsius. Uit de tabel kun je afleiden dat de buitentemperatuur 8,5 °C bedraagt op een hoogte van 1000 m.<br>Voor- en nadelen van het voorstellen van grootheden in een tabel:<br>• Het is overzichtelijk, maar een verband afleiden is moeilijk.<br>• Gegeven waarden kunnen exact afgelezen worden.<br>• Er zijn maar een beperkt aantal waarden gegeven.<br>• We moeten kritisch zijn bij het veralgemenen en het berekenen van tussenliggende of verderliggende waarden.<br>We', icon: 'book-open' },
        { layout: 'standard', title: 'Reële functies', content: 'Bij sommige verbanden bestaat er voor elke invoerwaarde maximaal één uitvoerwaarde. Deze bijzondere verbanden noemen we functies.<br>## 2.1 Wat is een functie?<br>Voorbeeld: Er is een verband tussen de lengte van een zijde van een vierkant en de omtrek van dat vierkant.<br>De invoer: de waarden die je zelf kiest. We noemen dit de onafhankelijke veranderlijke.<br>Op de grafiek vind je die op de horizontale as, de x-as.<br>| LENGTE ZIJDE VIERKANT (in cm) | 0,0 | 0,2 | 1,0 | 1,7 | 2,0 |<br>| :--- | :--- | :--- | :--- | :--- | :--- |<br>| OMTREK VIERKANT (in cm) | 0,0 | 0,8 | 4,0 | 6,8 | 8,0 |<br>De uitvoer: de waarden die je berekent. We noemen dit de afhankelijke veranderlijke.<br>Op de grafiek vind je die op de verticale as, de y-as.<br>[Afbeelding: Infographic met trechter waar nummers 4, 2, 1 ingaan als \"INVOER\". In de trechter staat \"FORMULE\". Uit de trechter komen nummers 8, 4, 16 als \"UITVOER\". Pijlen tonen de transformatie van de invoerwaarden: 0 -> 0, 0,2 -> 0,8, 1 -> 4, 1,', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '**1** Een frisdrankproducent beschikt over een volautomatische flessenvuller. Deze machine kan elke ', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

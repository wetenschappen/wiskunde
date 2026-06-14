export default {
    id: 'nando4-m11-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 11 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M11L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 11'
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'correlation', icon: 'PhGameController' }
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
        'correlation': {
            type: 'correlation',
            title: 'Spreidingsdiagrammen'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 11', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Spreidingsdiagrammen', content: '[Afbeelding: Achtergrond met grafieken en datapunten met grote rode banner \"CORRECTIESLEUTEL\"]<br>**Inhoud**<br>Instap<br>1 Afhankelijke en onafhankelijke veranderlijke<br>2 Spreidingsdiagram, trendlijn en correlatiecoëfficiënt<br>Signaaloefeningen<br>Differentiatietraject<br>Studiewijzer<br>### WAT JE AL KUNT<br>– het verband tussen recht evenredige grootheden grafisch voorstellen<br>– het verband tussen omgekeerd evenredige grootheden grafisch voorstellen<br>– een kwadratisch verband tussen grootheden grafisch voorstellen<br>– een lineair verband tussen grootheden grafisch voorstellen<br>### WAT JE LEERT IN DEZE MODULE<br>– de betekenis van afhankelijke en onafhankelijke variabelen<br>– spreidingsdiagrammen tekenen met ICT<br>– de samenhang tussen twee variabelen bepalen<br>– de correlatiecoëfficiënt bepalen om zo de sterkte van een verband weer te geven<br>– een trendlijn tekenen<br>### IN DE KIJKER<br>Maak gebruik van ICT om spreidingsdiagrammen te tekenen en de samenhang tussen ', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Afhankelijke en onafhankelijke veranderlijke', content: 'De lengte van de zijde van ΔABC is de **onafhankelijke veranderlijke**.<br>↓<br>kan allerlei waarden aannemen<br>De omtrek (of oppervlakte) van ΔABC is de **afhankelijke veranderlijke**.<br>↓<br>hangt af van de waarde die men kiest voor de lengte van de zijde<br>[Afbeelding: Gelijkzijdige driehoek ABC]<br>We kunnen dit veralgemenen door na te gaan of er een verband bestaat tussen 2 kenmerken.<br>| | ONAFHANKELIJKE VERANDERLIJKE | AFHANKELIJKE VERANDERLIJKE |<br>| :--- | :--- | :--- |<br>| [Afbeelding: Flatgebouw] | grootte van een appartement | de huurprijs |<br>| [Afbeelding: Druk strand in de zomer] | dagtemperatuur | aantal toeristen op het strand |<br>| [Afbeelding: Voeten in grote, middelgrote en kleine schoenen] | lichaamslengte | schoenmaat |<br>| [Afbeelding: Bloeddruk meten] | bloeddruk | leeftijd bij het overlijden |<br>Zal de huurprijs van een appartement stijgen als de oppervlakte van het appartement groter is?<br>Heeft een hoge bloeddruk invloed op de leeftijd bij overlijd', icon: 'book-open' },
        { layout: 'standard', title: 'Spreidingsdiagram, trendlijn en correlatiecoëfficiënt', content: '## 2.1 Spreidingsdiagram<br>Aan een aantal gezinnen werd volgende vraag gesteld.<br>**Wat is de lengte van de vader en de lengte van de oudste dochter?**<br>In de tabel hieronder zie je de gegevens.<br>| LENGTE VADER (cm) | LENGTE OUDSTE DOCHTER (cm) |<br>| :--- | :--- |<br>| 182 | 172 |<br>| 173 | 160 |<br>| 189 | 178 |<br>| 170 | 159 |<br>| 200 | 180 |<br>| 185 | 177 |<br>| 170 | 160 |<br>| 175 | 162 |<br>| 189 | 176 |<br>| 171 | 161 |<br>| 198 | 181 |<br>| 176 | 168 |<br>↓ ↓<br>onafhankelijke veranderlijke afhankelijke veranderlijke<br>Deze informatie kan verwerkt worden in een grafische voorstelling: een **spreidingsdiagram**.<br>We noemen een spreidingsdiagram ook wel een **scatterplot** of **puntenwolk**. Het geeft het verband weer tussen de 2 variabelen: de lengte van de vader en de lengte van de oudste dochter.<br>[Afbeelding: Spreidingsdiagram. Horizontale as \"Lengte vader (cm)\" van 170 tot 205. Verticale as \"Lengte dochter (cm)\" van 160 tot 185. Twaalf rode datapunten zij', icon: 'book-open' }
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

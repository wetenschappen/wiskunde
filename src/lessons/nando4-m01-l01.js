export default {
    id: 'nando4-m01-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 01 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M01L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 01'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">1, 2, 3<br>**1** Gegeven: twee uitspraken p en q<br>p: Nona gaat naar de Scouts.<br>q: Selena speelt voetbal.<br>a) Wat betekent ¬p?<br>[ ... invulveld ... ]<br>Nona gaat niet naar de Scouts.<br>b) Verbind de uitspraken p en q met een conjunctie.<br>In symbolen: [ ... invulveld ... ] p ∧ q<br>Betekenis:<br>[ ... invulveld ... ]<br>Nona gaat naar de Scouts en Selena speelt voetbal.<br>c) Maak een waarheidstabel om te bepalen wanneer de uitspraak p ∨ q waar is.<br>| p | q | p ∨ q |<br>| :---: | :---: | :---: |<br>| 1 | 1 | 1 |<br>| 1 | 0 | 1 |<br>| 0 | 1 | 1 |<br>| 0 | 0 | 0 |<br>**2** Gegeven: twee uitspraken p en q<br>p: Wiskunde is een interessant vak.<br>q: Het is mooi weer.<br>[Afbeelding: Studenten die buiten in het gras zitten met boeken, ogenschijnlijk op een mooie zonnige dag.]<br>a) Wat betekent p ⇔ q?<br>[ ... invulveld ... ]<br>Wiskunde is een interessant vak als en slechts als het mooi weer is.<br>b) Maak een waarheidstabel voor deze equivalentie.<br>| p | q | p ⇔ q |<br>| :---: | :---: | :---: |<br>| 1 | 1 | 1 |<br>| 1 | 0 | 0 |<br>| 0 | 1 | 0 |<br>| 0 | 0 | 1 |<br>c) Wanneer is deze equivalentie waar?<br>[ ... invulveld ... ]<br>Als p = 1 en q = 1 of als p = 0 en q = 0.<br>d) Beoordeel de volgende uitspraak.<br>\"Als het mooi weer is, zijn andere vakken dan wiskunde niet interessant.\"<br>[ ... invulveld ... ]<br>Niet waar, je kan hier geen uitspraak over doen. De propositie p heeft het enkel over het vak wiskunde. Ofwel is het vak interessant, ofwel is het vak n</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'logic', icon: 'PhGameController' }
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
        'logic': {
            type: 'logic',
            title: 'Logica en Waarheidstabellen'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 01', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>**Puzzel 1**<br>Najade en Broes spelen een partijtje tennis tegen elkaar. Bij elk spel dat ze spelen kunnen ze 1 euro winnen of 1 euro verliezen.<br>Broes won drie spelletjes.<br>Najade won 5 euro.<br>Hoeveel spelletjes hebben ze tegen elkaar gespeeld?<br>[ ... invulveld ... ]<br>Puzzel 1: Ze hebben 11 spelletjes tegen elkaar gespeeld.<br>**Puzzel 2**<br>Op een tafel staan drie dozen met speelgoed met daarop een label. Op het label van de eerste doos staat er \'LEGO\', op het la...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Logica en waarheidstabellen', content: '### WAT JE AL KUNT<br>– mondeling en schriftelijk communiceren over redeneringen<br>– symbolen gebruiken<br>– implicatie en equivalentie zinvol hanteren<br>– uitspraken illustreren met voorbeelden<br>– logische operatoren gebruiken<br>– een eenvoudige waarheidstabel gebruiken<br>– concepten van computationeel denken hanteren<br>### WAT JE LEERT IN DEZE MODULE<br>– de waarheidswaarde van logische uitspraken bepalen met behulp van waarheidstabellen<br>– logische operatoren en connectieven ∧, ∨, ¬, ⇒, ⇔ gebruiken<br>– het verschil begrijpen tussen de ‘of’ in de logica en de ‘of’ in de omgangstaal<br>– het verschil begrijpen tussen de ‘als … dan …’ in de logica en de ‘als … dan …’ in de omgangstaal<br>– het verband leggen tussen logische poorten en logica<br>– een wiskundige uitspraak in symbolen en logica gebruiken in bewijzen en redeneringen<br>### IN DE KIJKER<br>Je reflecteert over jouw gevonden antwoord en controleert de gemaakte tussenstappen.<br>### WISKUNDETAAL<br>– proposities<br>', icon: 'book-open' },
        { layout: 'standard', title: 'Logische operatoren en waarheidstabellen', content: '## 1.1 Begrippen<br>In de propositielogica werken we met uitspraken. Deze uitspraken zijn waar of niet waar.<br>We noemen de logische uitspraken ook **proposities**. Proposities geven een feit weer. Een propositie hoeft niet waar te zijn. Het kan op dit moment nog onduidelijk zijn of een propositie waar of niet waar is.<br>**Voorbeelden**<br>p: Een dolfijn is een zoogdier. *p is een ware uitspraak*<br>q: Een banaan is blauw. *q is een onware uitspraak*<br>r: De thee is warm. *r is een ware of onware uitspraak*<br>Ook in de wiskunde maken we gebruik van uitspraken. Om te oordelen of een uitspraak waar of onwaar is, kunnen we onder andere beroep doen op onze wiskundekennis. Zo kunnen we met één tegenvoorbeeld een uitspraak ontkrachten en als onwaar beschouwen.<br>**Voorbeelden**<br>p: √2 is een irrationaal getal. *p is een ware uitspraak*<br>q: De tangens van een scherpe hoek ligt tussen -1 en 1. *q is een onware uitspraak (tegenvoorbeeld: tan 50° > 1)*<br>We kunnen uitspraken ook met el', icon: 'book-open' },
        { layout: 'standard', title: 'Problemen oplossen met logica', content: '## 2.1 Tautologie en contradictie<br>definitie | Een **tautologie** is een samengestelde uitspraak die voor elke waarde van de enkelvoudige proposities waar is.<br>**Voorbeeld**<br>Je bent voor een toets van wiskunde geslaagd of niet geslaagd.<br>De twee proposities zijn:<br>p: Je bent geslaagd voor de toets wiskunde.<br>¬p: Je bent niet geslaagd voor de toets wiskunde.<br>De samengestelde uitspraak p ∨ ¬p is altijd waar. Bijgevolg is p ∨ ¬p een tautologie.<br>Je kunt dit ook aantonen met een waarheidstabel.<br>| p | ¬p | p ∨ ¬p |<br>| :---: | :---: | :---: |<br>| WAAR | NIET WAAR | WAAR |<br>| NIET WAAR | WAAR | WAAR |<br>definitie | Een **contradictie** is een samengestelde uitspraak die voor elke waarde van de enkelvoudige proposities niet waar is.<br>**Voorbeeld**<br>Een natuurlijk getal waarvan het laatste cijfer oneven is, is deelbaar door 2. De twee proposities zijn:<br>p: Het laatste cijfer van het natuurlijk getal is oneven.<br>q: Het natuurlijk getal is deelbaar door 2.<br>De', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '**1** Gegeven:', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

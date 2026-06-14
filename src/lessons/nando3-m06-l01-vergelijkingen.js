export default {
    id: 'nando3-m06-l01-vergelijkingen',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 06 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M06L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 06'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">**1 Welke eigenschap van gelijkheden werd er toegepast?**<br>a) 5π/2 x = 3 ⇒ 5πx = 3 ⋅ 2<br>[ Als je beide leden van een gelijkheid vermenigvuldigt met hetzelfde getal, verschillend van nul, ontstaat opnieuw een gelijkheid. ]<br>b) √5x + 4 = 1 ⇒ √5x + 1 = −2<br>[ Als je in beide leden van een gelijkheid hetzelfde getal aftrekt, ontstaat opnieuw een gelijkheid. ]<br>c) 3x = 9 ⇒ 3x + √2 = 9 + √2<br>[ Als je in beide leden van een gelijkheid hetzelfde getal optelt, ontstaat opnieuw een gelijkheid. ]<br>d) √8x = 4 ⇒ x = 4 / √8<br>[ Als je beide leden van een gelijkheid deelt door hetzelfde getal, verschillend van nul, ontstaat opnieuw een gelijkheid. ]<br>**2 Los de vergelijkingen algebraïsch op in R.**<br>a) 3x − 5 = 5x + 7<br>[ 3x − 5x = 7 + 5 ]<br>[ −2x = 12 ]<br>[ x = 12 / −2 ]<br>[ x = −6 ]<br>[ V = {−6} ]<br>b) 6x − 3√6 = 9√6<br>[ 6x = 9√6 + 3√6 ]<br>[ 6x = 12√6 ]<br>[ x = 2√6 ]<br>[ V = {2√6} ]<br>c) 4 ⋅ (2x − 5) − (3 + 2x)= x − 5<br>[ 8x − 20 − 3 − 2x = x − 5 ]<br>[ 8x − 2x − x = −5 + 20 + 3 ]<br>[ 5x = 18 ]<br>[ x = 18 / 5 ]<br>[ V = {18 / 5} ]<br>d) 4πr − 2 = 2 ⋅ (6πr − 1)<br>[ 4πr − 2 = 12πr − 2 ]<br>[ 12πr − 4πr = −2 + 2 ]<br>[ 8πr = 0 ]<br>[ r = 0 ]<br>[ V = {0} ]<br>e) (3x − 6) / 4 = x / 3 + 5 / 2<br>[ 12 ⋅ ( (3x − 6) / 4 ) = x / 3 ⋅ 12 + 5 / 2 ⋅ 12 ]<br>[ 9x − 18 = 4x + 30 ]<br>[ 9x − 4x = 30 + 18 ]<br>[ 5x = 48 ]<br>[ x = 48 / 5 ]<br>[ V = {48 / 5} ]<br>f) √3x − √15 = −(2√3x − 5√15)<br>[ √3x − √15 = −2√3x + 5√15 ]<br>[ √3x + 2√3x = 5√15 + √15 ]<br>[ 3√3x = 6√15 ]<</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'linearEquations', icon: 'PhScales' }
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
        'linearEquations': {
            type: 'linearEquations',
            title: 'Vergelijkingen'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 06', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Bepaal de massa van 1 bol. Noteer in een stappenplan naast de tekeningen jouw redenering.<br>[Afbeelding: Een weegschaal in evenwicht. Op de linkerschaal liggen 2 paarse bollen en 3 rode blokjes met het cijfer 8. Op de rechterschaal liggen 4 paarse bollen en 2 rode blokjes met het cijfer 8.]<br>2x + 24 = 4x + 16<br>2x − 4x = 16 − 24<br>−2x = −8<br>x = 4<br>De massa van de bol is 4 kg.<br>## Opdracht 2<br>Vul aan met = of ≠.<br>a) 2π + 7π [ = ] 7π + 2π<br>b) √2 + √2 + √2 [ ≠ ] √6...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Eigenschappen van gelijkheden', content: '## A) Woordenschat<br>7 · 5 + 3 = 2 · 25 - 12<br>linkerlid | gelijkheid | rechterlid<br>## B) Eigenschappen<br>Onderzoek: Blijven de eigenschappen van gelijkheden ook gelden bij de verzameling van de reële getallen?<br>**Onderzoek 1: Wat gebeurt er met de gelijkheid als we in beide leden een reëel getal toevoegen?**<br>3√2 + 5√2 = 8√2 ⇒ 3√2 + 5√2 + 2√2 = 8√2 + 2√2<br>10√2 = 10√2<br>**eigenschap**<br>Als je in beide leden van een gelijkheid hetzelfde getal optelt, ontstaat opnieuw een gelijkheid.<br>**Onderzoek 2: Wat gebeurt er met de gelijkheid als we in beide leden een reëel getal wegnemen?**<br>3√2 + 5√2 = 8√2 ⇒ 3√2 + 5√2 − 2√2 = 8√2 − 2√2<br>6√2 = 6√2<br>**eigenschap**<br>Als je in beide leden van een gelijkheid hetzelfde getal aftrekt, ontstaat opnieuw een gelijkheid.<br>**Onderzoek 3: Wat gebeurt er met de gelijkheid als we beide leden met een reëel getal vermenigvuldigen?**<br>3√2 + 5√2 = 8√2 ⇒ (3√2 + 5√2) ⋅ 4 = 8√2 ⋅ 4<br>8√2 ⋅ 4 = 8√2 ⋅ 4<br>32√2 = 32√2<br>**eigenschap**<br>Al', icon: 'book-open' },
        { layout: 'standard', title: 'Eerstegraadsvergelijkingen algebraïsch oplossen', content: '## 2.1 Eerstegraadsvergelijkingen oplossen<br>In de eerste graad leerde je al eerstegraadsvergelijkingen in 1 onbekende algebraïsch oplossen. Omdat je nu ook reële getallen kent, kunnen we vergelijkingen opstellen zodat de oplossing een reëel getal is.<br>We hernemen even het stappenplan.<br>**Hoe los je een eerstegraadsvergelijking algebraïsch op?**<br>**methode**<br>STAP 1: Als er haakjes voorkomen, werk je die eerst weg.<br>STAP 2: Door bij beide leden eenzelfde getal op te tellen of van beide leden eenzelfde getal af te trekken, breng je alle termen waarin de onbekende voorkomt samen in één lid en alle overige termen in het andere lid.<br>STAP 3: Schrijf beide leden eenvoudiger door de optellingen en/of aftrekkingen uit te voeren.<br>STAP 4: Door beide leden met eenzelfde getal, verschillend van nul, te vermenigvuldigen of beide leden door eenzelfde getal, verschillend van nul, te delen, zonder je de onbekende af.<br>**Voorbeelden**<br>√3x − 9 = 12<br>√3x = 12 + 9<br>√3x = 21<br>x ', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '**1 Welke eigenschap van gelijkheden werd toegepast?**', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

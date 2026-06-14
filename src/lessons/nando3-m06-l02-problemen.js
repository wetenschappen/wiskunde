export default {
    id: 'nando3-m06-l02-problemen',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 06 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M06L2',
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
        { layout: 'title', title: 'Nando 3 Module 06', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Problemen oplossen met vergelijkingen', content: 'Om een probleem op te lossen volg je altijd dezelfde stappen:<br>- Je probeert het probleem te begrijpen.<br>- Daarna los je het probleem op met de gekozen oplossingsmethode.<br>- Je controleert en interpreteert je gevonden oplossing(en).<br>- Je formuleert een antwoordzin.<br>Bij vergelijkingen maken we die strategie nog wat concreter. Als je een probleem met behulp van een vergelijking oplost, kun je volgende methode toepassen.<br>**Hoe los je een probleem op met behulp van een vergelijking?**<br>**methode**<br>STAP 1: Stel een onbekende gelijk aan een gekozen letter en schrijf de gegeven verbanden op door gebruik te maken van de letter.<br>STAP 2: Stel de vergelijking op en los die op.<br>STAP 3: Controleer je gevonden oplossing(en) en interpreteer die. Je kan dit doen met behulp van ICT of door in de vergelijking de onbekende te vervangen door jouw gevonden oplossing.<br>STAP 4: Formuleer een antwoord in functie van de context.<br>**Voorbeeld 1**<br>Een getal is 3√5 groter dan een ', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Omvormen van formules', content: 'In wetenschappelijke vakken (wiskunde, natuurkunde, economie, …) worden vaak formules gebruikt. Soms moet je een formule omvormen naar een andere letter om een resultaat te verkrijgen.<br>**Voorbeeld**<br>Een driehoek heeft een basis van 3√2 cm en een oppervlakte van 9√6 cm².<br>Bereken de hoogte van de driehoek op 2 decimalen.<br>Je kunt je antwoord vinden op verschillende manieren.<br>[Afbeelding: Een gelijkbenige driehoek met basis b = 3√2 cm, hoogte h = ?, en oppervlakte A = 9√6 cm².]<br>formule A = (b ⋅ h) / 2 met A: oppervlakte driehoek, b: basis van de driehoek, h: hoogte van de driehoek<br>| METHODE VAN HET INVULLEN | METHODE VAN HET OMVORMEN |<br>|---|---|<br>| Stap 1: Vul de gekende waarden in. <br> A = (b ⋅ h) / 2 wordt: 9√6 = (3√2 ⋅ h) / 2 | Stap 1: Vorm de formule om. <br> A = (b ⋅ h) / 2 <br> 2A = b ⋅ h <br> 2A / b = h |<br>| Stap 2: Los de vergelijking op. <br> 9√6 = (3√2 ⋅ h) / 2 <br> 9√6 ⋅ 2 = 3√2 ⋅ h <br> (18√6) / (3√2) = h <br> 6√3 = h <br> 10,39 ≈ h | Stap 2: Vul de', icon: 'book-open' }
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

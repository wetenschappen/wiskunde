export default {
    id: 'nando4-m16-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 16 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M16L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 16'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">**1**<br>Bepaal de getalwaarde van A(x) voor x = a met behulp van het rekenschema van Horner.<br>| A(x) | a |<br>|---|---|<br>| a) A(x) = 2x⁴ – 3x³ + x² – 5x + 7 | a = 4 |<br>| b) A(x) = x⁵ + 2x⁴ – x³ – 3x² + 6x + 11 | a = –3 |<br>| c) A(x) = 6x⁴ - 4x³ + 9 | a = 1,5 |<br>a)<br>\`\`\`text<br>2      -3       1      -5       7<br>4           8      20      84     316<br>----------------------------------------<br>2       5      21      79     323<br>\`\`\`<br>A(4) = 323<br>b)<br>\`\`\`text<br>1       2      -1      -3       6      11<br>-3          -3       3      -6      27     -99<br>------------------------------------------------<br>1      -1       2      -9      33     -88<br>\`\`\`<br>A(-3) = -88<br>c)<br>\`\`\`text<br>6      -4       0       0       9<br>1,5           9     7,5   11,25  16,875<br>----------------------------------------<br>6       5     7,5   11,25  25,875<br>\`\`\`<br>A(1,5) = 25,875<br>**2**<br>Voer volgende euclidische delingen uit in ℝ[x].<br>| Deeltal A(x) | Deler D(x) |<br>|---|---|<br>| a) A(x) = 4x³ + 17x² – 39x + 19 | D(x) = 4x – 3 |<br>| b) A(x) = 6x⁴ – x³ – 2x – 1 | D(x) = 3x² + x – 1 |<br>| c) A(x) = -x³ + 8x² - 11x - 20 | D(x) = x – 5 |<br>a)<br>\`\`\`text<br>4x³ + 17x² - 39x + 19 | 4x - 3<br>- (4x³ -  3x²)          | x² + 5x - 6<br>--------------<br>20x² - 39x + 19<br>- (20x² - 15x)<br>--------------<br>-24x + 19<br>- (-24x + 18)<br>-------------<br>1<br>\`\`\`<br>Q(x) = x² + 5x - 6<br>R(x) = 1<br>b)<br>\`\`\`text<br>6x⁴ -   x³ + 0x² - 2x - </p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'polynomialDivision', icon: 'PhGameController' }
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
        'polynomialDivision': {
            type: 'polynomialDivision',
            title: 'Deelbaarheid en Horner'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 16', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Gegeven: drie veeltermen<br>A(x) = x² – 2x + 3<br>B(x) = 2x – 1<br>C(x) = 3x² + 4<br>Bereken.<br>a) 3 · A(x) + 2 · B(x) – C(x)<br>3 · (x² – 2x + 3) + 2 · (2x – 1) – (3x² + 4)<br>= 3x² – 6x + 9 + 4x – 2 – 3x² – 4<br>= –2x + 3<br>b) A(x) · B(x)<br>(x² – 2x + 3) · (2x – 1)<br>= 2x³ – x² – 4x² + 2x + 6x – 3<br>= 2x³ – 5x² + 8x – 3<br>c) 4 · A(x) – B(x) · C(x)<br>4 · (x² – 2x + 3) – (2x – 1) · (3x² + 4)<br>= (4x² – 8x + 12) – (6x³ + 8x – 3x² – 4)<br>= 4x² – 8x + 12 – 6x³ – 8x + 3x² +...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Deelbaarheid van veeltermen', content: '[Afbeelding: Vliegtuigen die rode rook spuiten en een rode balk met de tekst \"CORRECTIESLEUTEL\"]<br>**Inhoud**<br>Instap<br>1 De euclidische deling<br>2 Deelbaarheid in ℝ[x]<br>3 Toepassingen op de reststelling<br>**Signaaloefeningen**<br>**Differentiatietraject**<br>**Studiewijzer**<br>**WAT JE AL KUNT**<br>- de definitie van een veelterm verwoorden<br>- de getalwaarde van een veelterm bepalen<br>- veeltermen optellen, aftrekken en vermenigvuldigen<br>**WAT JE LEERT IN DEZE MODULE**<br>- de euclidische deling van veeltermen uitvoeren<br>- de reststelling bij deling door (x - a) bewijzen<br>- de deling van een veelterm door (x - a) uitvoeren door middel van de regel van Horner<br>- de reststelling toepassen in vraagstukken<br>- de tweetermen a³ + b³ en a³ - b³ ontbinden in factoren<br>**IN DE KIJKER**<br>Je hebt zin voor **nauwkeurigheid** en **orde**.<br>**WISKUNDETAAL**<br>- graad van een veelterm<br>- getalwaarde van een veelterm<br>- algoritme van Horner<br>- euclidische deling<b', icon: 'book-open' },
        { layout: 'standard', title: 'De euclidische deling', content: '## 1.1 De verzameling ℝ[x]<br>Veeltermen (in de veranderlijke x) noteren we als A(x), B(x), C(x), …<br>De verzameling van al deze veeltermen noemen we ℝ[x] .<br>**Voorbeelden**<br>A(x) = 4x² – 6x + 1<br>B(x) = 2x³ + 5x² – 7<br>Algemeen noteert men een veelterm van de n-de graad als volgt:<br>A(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + … + a₁x + a₀<br>De getallen aₙ, aₙ₋₁, …, a₁, a₀ noemen we de coëfficiënten van de veelterm, aₙ is de coëfficiënt van de term met de hoogste macht, a₀ is de constante term van de veelterm.<br>**definitie**<br>De **graad van een veelterm** (in x) is de hoogst voorkomende exponent van x in die veelterm.<br>**Voorbeelden**<br>gr(A(x)) = gr(4x² − 6x + 1)<br>= 2<br>gr(B(x)) = gr(2x³ + 5x² − 7)<br>= 3<br>**definitie**<br>De **getalwaarde van een veelterm** voor een gegeven getal a is het reële getal dat je bekomt door in de veelterm de veranderlijke x te vervangen door a.<br>**Voorbeelden**<br>A(3) = 4 · 3² − 6 · 3 + 1<br>= 36 − 18 + 1<br>= 19<br>B(−2) = 2 · (−2)³ + 5 · (−2)² − 7<', icon: 'book-open' },
        { layout: 'standard', title: 'Deelbaarheid in ℝ[x]', content: '## 2.1 Deling door x – a door middel van de regel van Horner<br>**Voorbeeld**<br>Gegeven: A(x) = 2x³ + 5x² + 4x + 14<br>D(x) = x + 3         (a = –3)<br>Gevraagd: Bepaal het quotiënt Q(x) en de rest R(x) van de euclidische deling van A(x) door D(x).<br>Oplossing (algoritme)<br>\`\`\`text<br>2x³ + 5x² + 4x + 14 | x + 3<br>– (2x³ + 6x²)         | 2x² – x + 7<br>-------------<br>–x² + 4x + 14<br>– (–x² – 3x)<br>------------<br>7x + 14<br>– (7x + 21)<br>-----------<br>–7<br>\`\`\`<br>Q(x) = 2x² – x + 7<br>R(x) = –7<br>Merk op dat de rest een getal is, dit komt omdat gr(R(x)) < gr(D(x)) = 1.<br>Passen we op A(x) het rekenschema van Horner toe om de getalwaarde van a = –3 te berekenen:<br>\`\`\`text<br>2      5      4     14<br>–3          –6      3    –21<br>-----------------------------<br>2     –1      7     –7<br>\`\`\`<br>Dan kunnen we het volgende vaststellen:<br>- De rest R(x) is gelijk aan de getalwaarde van A(x) voor x = a (we bewijzen deze vaststelling in 2.2).<br>- De coëfficiënte', icon: 'book-open' },
        { layout: 'standard', title: 'Toepassingen op de reststelling', content: '## 3.1 Ontbinden in factoren<br>**Voorbeeld 1**<br>Ontbind de veelterm A(x) = x³ – 4x² + x + 6 in factoren.<br>Werkwijze:<br>- Bepaal een deler van de vorm x – a van A(x).<br>Omdat A(2) = 0, is x – 2 een deler van A(x).<br>- Bepaal het quotiënt van de euclidische deling van A(x) door x – 2 met behulp van het rekenschema van Horner.<br>\`\`\`text<br>1     –4      1      6<br>2          2     –4     –6<br>-----------------------------<br>1     –2     –3      0<br>\`\`\`<br>Q(x) = x² – 2x – 3<br>A(x) = (x – 2)(x² – 2x – 3)<br>- Bepaal een deler van de vorm x – a van Q(x).<br>Omdat Q(3) = 0, is x – 3 een deler van Q(x).<br>- Bepaal het quotiënt van de euclidische deling van Q(x) door x – 3 met behulp van het rekenschema van Horner.<br>\`\`\`text<br>1     –2     –3<br>3          3      3<br>----------------------<br>1      1      0<br>\`\`\`<br>Q₂(x) = x + 1<br>Q(x) = (x – 3)(x + 1)<br>A(x) = (x – 2)(x – 3)(x + 1)<br>**Voorbeeld 2**<br>Ontbind de veelterm A(x) = 4x⁴ + 8x³ – 11x² + 3x in fac', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Bepaal de getalwaarde van A(x) voor x = a met behulp van het rekenschema van Horner.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

export default {
    id: 'nando4-m08-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 08 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M08L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 08'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">1<br>Gegeven is de graaf G.<br>[Afbeelding: Een graaf met 7 knopen A, B, C, D, E, F, G in de vorm van twee verbonden ruiten/driehoeken met een diagonaal.]<br>a) Geef de knopen en bogen d.m.v. opsomming.<br>[ knopen: A, B, C, D, E, F, G ]<br>[ bogen: AB, AC, AG, BC, CG, CE, DE, DF, EF, FG ]<br>b) Bepaal de orde en grootte van deze graaf.<br>[ orde n: 7 ]<br>[ grootte m: 10 ]<br>c) Bepaal de graad van elke knoop.<br>[ deg(A) = 3 ]<br>[ deg(B) = 2 ]<br>[ deg(C) = 4 ]<br>[ deg(D) = 2 ]<br>[ deg(E) = 3 ]<br>[ deg(F) = 3 ]<br>[ deg(G) = 3 ]<br>d) Bepaal ∆G en δG.<br>[ ∆G = 4 ]<br>[ δG = 2 ]<br>e) Is dit een planaire graaf? ( JA ) / NEE<br>Indien ja, herteken de planaire graaf zodat dit duidelijk is.<br>[Afbeelding: De hertekende versie van graaf G waarin geen bogen elkaar snijden, getekend in het roze.]<br>10<br>2<br>Teken de graaf G waarvoor geldt:<br>• knopen: P, Q, R, S, T<br>• bogen: PQ, PS, QS, QR, RS, RT<br>a) Bepaal de orde en grootte van deze graaf.<br>[ orde n = 5 ]<br>[ grootte m = 6 ]<br>b) Bepaal de graad van elke knoop.<br>[ deg(P) = 2 ]<br>[ deg(Q) = 3 ]<br>[ deg(R) = 3 ]<br>[ deg(S) = 3 ]<br>[ deg(T) = 1 ]<br>c) Bepaal ∆(G) en δ(G).<br>[ ∆(G) = 3 ]<br>[ δ(G) = 1 ]<br>[Afbeelding: De uitgetekende graaf met knopen P, Q, R, S, T.]<br>3<br>Teken de planaire graaf G waarvoor geldt:<br>• buren van K: L, P<br>• buren van L: K, M, N, P<br>• buren van M: L, N<br>• buren van N: L, M, O, P<br>• buren van O: N, P<br>• buren van P: K, L, N, O<br>[Afbeelding: Een planaire graaf me</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'graphTheory', icon: 'PhGameController' }
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
        'graphTheory': {
            type: 'graphTheory',
            title: 'Grafen en Algoritmes'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 08', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Luka en Julie plannen een bezoekje aan een dierenpark. Vooraf hebben ze een plan van het dierenpark gedownload. Ze willen het volledige park bezoeken, maar wel zodanig dat ze elke weg slechts eenmaal doorlopen. Help hen een mogelijke route uit te stippelen.<br>[Afbeelding: Een plattegrond van een dierenpark. Een rode lijn (de route) vertrekt bij \"start\" aan de poort, loopt via verschillende paden langs dierenverblijven en pijlen geven de richting aan. De lijn volgt genummerde ...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Grafen', content: '[Afbeelding: Coverafbeelding met een foto van een stad en de tekst \"CORRECTIESLEUTEL\" diagonaal in grote letters.]<br>## WAT JE AL KUNT<br>– Je kan problemen oplossen met boomdiagrammen.<br>## WAT JE LEERT IN DEZE MODULE<br>– een graaf gebruiken als model of schematische voorstelling<br>– in een concrete situatie die door een graaf beschreven wordt de betekenis van de knopen, de bogen en de buren van de knopen uitleggen<br>– een graaf die bij een concrete situatie behoort, opstellen<br>– het bestaan van specifieke wandelingen opsporen die alle bogen juist één keer doorlopen<br>– het algoritme van Kruskal of Prim toepassen om de minimaal opspannende boom in een gewogen graaf te bepalen<br>– het algoritme van Dijkstra toepassen om het kortste pad in een gewogen graaf te bepalen<br>– het handelsreizigersprobleem linken met grafen<br>– de betekenis van graafkleuring begrijpen en dit toepassen in concrete situaties<br>## IN DE KIJKER<br>Je kan met behulp van een schematische voorstelling ', icon: 'book-open' },
        { layout: 'standard', title: 'Grafen rondom ons', content: '## 1.1 Wat zijn grafen?<br>In het dagelijkse leven worden we met grafen geconfronteerd:<br>- Boomdiagrammen die je kent van bij telproblemen zijn een eenvoudig voorbeeld, maar ook stambomen of speelschema’s bij toernooien.<br>- Bij de uitwerking van dienstregelingen van het openbaar vervoer of het aanleggen van een nieuwe buslijn of de verbindingen tussen terminals in een luchthaven vind je grafen terug.<br>- Ook in de logistiek maakt men gebruik van grafen. Je kunt een app (bv. Ibi) downloaden die voor jou de snelste route bepaalt tussen een aantal ingevoerde adressen, of een app die jou een fietsroute voorstelt langs verschillende knooppunten.<br>Al deze voorbeelden zijn gebaseerd op de **grafentheorie** en de daarop voortbouwende wiskundige modellen.<br>[Afbeelding: STAMBOOM - Een schema van een familie met cirkels voor personen verbonden door lijnen, van overgrootouders tot achterneef/achternicht.]<br>[Afbeelding: KNOOPPUNTEN BIJ FIETSROUTES - Een landkaart met een groene fietsrout', icon: 'book-open' },
        { layout: 'standard', title: 'Wandelingen in een graaf', content: '## 2.1 Wandelingen en paden<br>definitie<br>Een **wandeling** tussen twee knopen X en Y van een graaf is een opeenvolging van bogen die beginnen in X en eindigen in Y.<br>Op een gegeven graaf G duiden we 4 verschillende wandelingen aan.<br>Wandeling 1: een wandeling van A naar C<br>W1 = (AB – BD – DC)<br>[Afbeelding: Graaf met het pad A->B->D->C gemarkeerd in het blauw.]<br>Wandeling 2: een wandeling van A naar A<br>W2 = (AB – BD – DC – CB – BE – EA)<br>[Afbeelding: Graaf met het gesloten pad A->B->D->C->B->E->A gemarkeerd in het geel.]<br>Wandeling 3: een wandeling van A naar D<br>W3 = (AE – EB – BD)<br>[Afbeelding: Graaf met het pad A->E->B->D gemarkeerd in het rood.]<br>Wandeling 4: een wandeling van A naar A<br>W4 = (AB – BC – CD – DE – EA)<br>[Afbeelding: Graaf met de buitenste cyclus A->B->C->D->E->A gemarkeerd in het groen.]<br>Wanneer de wandeling begint en eindigt in dezelfde knoop, spreken we van een **gesloten wandeling**, in het andere geval wordt de wandeling een **open wa', icon: 'book-open' },
        { layout: 'standard', title: 'Minimaal opspannende bomen', content: '## 3.1 Probleemstelling<br>Men wil zes plaatsen met elkaar verbinden via een netwerk. Dat kunnen rioleringswerken, telecomkabels of andere nutsvoorzieningen zijn.<br>De mogelijke verbindingen tussen de verschillende plaatsen kan men voorstellen met behulp van een graaf waarbij men naast elke boog de kosten van de verbinding plaatst.<br>Zo’n graaf noemen we een **gewogen graaf**. De getallen naast de bogen noemen we de **gewichten** van de bogen.<br>[Afbeelding: Graaf met knopen A, B, C, D, E, F en gewogen bogen. En een foto van straatwerken/buizen in de grond.]<br>definitie<br>Een **boom** is een graaf die alle knopen met elkaar verbindt en geen cykels bevat.<br>Hieronder vind je een boom die een mogelijke oplossing geeft om de zes plaatsen met elkaar te verbinden.<br>Met deze boom kan je berekenen wat de kostprijs is als je de verbindingswerken op die manier vastlegt:<br>14 + 8 + 11 + 9 + 6 = 48<br>Deze oplossing is niet de (economisch) beste oplossing.<br>[Afbeelding: Een boom als su', icon: 'book-open' },
        { layout: 'standard', title: 'Kortste paden', content: '## 4.1 Probleemstelling<br>Een vrachtwagenchauffeur vertrekt vanuit stad A en moet zo snel mogelijk naar stad I. Hij bekijkt de mogelijke reisroutes met naast elk traject (de bogen van de graaf) de tijd die hij nodig heeft om dat traject af te leggen.<br>De chauffeur moet nu op zoek naar het kortste pad van A naar I.<br>[Afbeelding: Een gewogen graaf van A tot I naast een afbeelding van een vrachtwagen op de snelweg.]<br>Het **gewicht van een boog** AB is de getalwaarde die naast de boog staat.<br>Notatie: g(AB)<br>In deze graaf is g(AB) = 10.<br>Bestaat de boog niet, dan is het gewicht oneindig.<br>In deze graaf is g(AF) = ∞<br>De lengte van een pad met gegeven beginpunt A en eindpunt I is de som van de gewichten van de doorlopen bogen.<br>Notatie: l(AI)<br>**Voorbeeld**<br>Om ons van A naar I te begeven, volgen we het pad W:<br>W = (AB - BF - FI)<br>l(W) = g(AB) + g(BF) + g(FI) = 10 + 8 + 17 = 35<br>De lengte van dit pad is een bovengrens voor de mogelijke kortste route tussen het be', icon: 'book-open' },
        { layout: 'standard', title: 'Het handelsreizigersprobleem', content: '## 5.1 Probleemstelling<br>Een pakjesdienst gevestigd in Hasselt moet pakjes leveren in Aarschot, Beringen, Geel, Leuven, Mechelen en Turnhout.<br>De onderlinge afstanden (in km langs de weg) vind je in onderstaand schema.<br>| | HASSELT | AARSCHOT | BERINGEN | GEEL | LEUVEN | MECHELEN | TURNHOUT |<br>|---|---|---|---|---|---|---|---|<br>| HASSELT | - | 46 | 22 | 44 | 56 | 84 | 62 |<br>| AARSCHOT | 46 | - | 36 | 28 | 19 | 31 | 46 |<br>| BERINGEN | 22 | 36 | - | 30 | 50 | 74 | 49 |<br>| GEEL | 44 | 28 | 30 | - | 46 | 63 | 21 |<br>| LEUVEN | 56 | 19 | 50 | 46 | - | 28 | 96 |<br>| MECHELEN | 84 | 31 | 74 | 63 | 28 | - | 59 |<br>| TURNHOUT | 62 | 46 | 49 | 21 | 96 | 59 | - |<br>We willen de optimale route voor de chauffeur berekenen.<br>[Afbeelding: Kaart van België met daarin de genoemde steden.]<br>schaal 1:540000<br>Het handelsreizigersprobleem is een complex probleem.<br>Er bestaat nog geen algoritme dat de kortste route voor de chauffeur kan bepalen. Er bestaan wel enkele algoritmes d', icon: 'book-open' },
        { layout: 'standard', title: 'Graafkleuring', content: '## 6.1 Biotopen<br>Jorre houdt van reptielen. Hij heeft er een achttal als huisdier. Gekko’s, anolissen of iguana’s zet je echter niet zomaar in dezelfde (nagemaakte) biotoop.<br>Jorre heeft een lijstje gemaakt van welk reptiel niet met een ander reptiel kan samenleven.<br>| REPTIEL | MAG NIET SAMEN MET |<br>|---|---|<br>| A | D, G, H |<br>| B | C, G |<br>| C | B, E, F, G, H |<br>| D | A, E, G, H |<br>| E | C, D, F |<br>| F | C, E |<br>| G | A, B, C, D |<br>| H | A, C, D |<br>Wat is het kleinst aantal biotopen dat Jorre in elkaar moet knutselen opdat zijn reptielen vreedzaam zouden kunnen overleven?<br>[Afbeelding: Een foto van een groen/blauw gekleurde kameleon.]<br>Om het probleem van Jorre te kunnen oplossen, stellen we de lijst eerst grafisch voor d.m.v. een graaf. Reptielen die door een boog verbonden zijn, mogen niet samen zitten in eenzelfde biotoop.<br>[Afbeelding: Een graaf met knopen A tot H waarbij de bogen de conflicten tussen de reptielen aanduiden.]<br>## 6.2 Algoritme<br', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Gegeven is de graaf G.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

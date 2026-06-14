export default {
    id: 'nando4-m17-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 17 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M17L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 17'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">1. Een kubus ( EFGH / ABCD ) is gegeven. Noteer in symbolen.<br>[Afbeelding: Een kubus met een rode rechte \'a\' die door A en E gaat en een rode rechte \'b\' door F en G. Punt M ligt in bovenvlak op afstand, punt N ligt op het zijvlak op afstand.]<br>a) het linkerzijvlak<br>[ vl(ABE) ]<br>b) het vlak dat door M, N en G gaat<br>[ vl(MNG) ]<br>c) het vlak bepaald door HC en F<br>[ vl(HC, F) ]<br>d) het vlak bepaald door a en b<br>[ vl(a, b) ]<br>2. Van een balk werden een aantal stukken afgezaagd zodat dit lichaam werd verkregen.<br>a) Waar of niet waar? PB en RD zijn snijdende rechten. [ ] WAAR / [x] NIET WAAR<br>b) Teken twee evenwijdige rechten op de figuur.<br>c) Teken twee snijdende rechten op de figuur.<br>d) Teken twee kruisende rechten op de figuur.<br>e) Kleur het vlak bepaald door a en b op de figuur.<br>[Afbeelding: Een ruimtelijk afgeknot prisma-achtige vorm (geel/oranje vooraan). Punten A, B, C, D bevinden zich onderaan en O, P, Q, R centraal en bovenaan. De rechte a snijdt door (C,D) in een vlak met b. Twee blauwe lijnen (evenwijdig) zijn toegevoegd; twee groene lijnen (snijdend); twee rode lijnen (kruisend). Het voorvlak is oranje gekleurd.]<br>3. Een balk ( ABCD / EFGH ) is gegeven.<br>a) Vul aan met *evenwijdig*, *snijdend* of *kruisend*.<br>[Afbeelding: Een balk ABCD bovenaan en EFGH onderaan. Een vlak bepaald door R (op DH), S (op CG), Q (op BC) is roze en doorsnijdt het volume door T(op EH) en P(op AB). P, Q, R, S, T, U, V, W zijn extra benoemde punten op e</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'spatialGeometry', icon: 'PhGameController' }
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
        'spatialGeometry': {
            type: 'spatialGeometry',
            title: 'Ruimtemeetkunde'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 17', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>a) Kleur twee [ ... invulveld (oranje gemarkeerd: evenwijdige vlakken) ... ].<br>b) Teken twee [ ... invulveld (blauw gemarkeerd: evenwijdige rechten a en b) ... ].<br>c) Teken twee [ ... invulveld (groen gemarkeerd: kruisende rechten c en d) ... ].<br>d) Teken twee [ ... invulveld (roze gemarkeerd: snijdende rechten e en f) ... ].<br>[Afbeelding: Lijntekening van een huis in 3D waarbij specifieke lijnen en vlakken zijn ingekleurd. Lijnen e en f (roze) snijden elkaar bovenaan. L...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Ruimtemeetkunde', content: 'D-FINALITEIT 5 UUR – MEETKUNDE<br>**wat je al kunt**<br>– snijdende, evenwijdige en kruisende rechten herkennen<br>– collineaire punten herkennen<br>– aangeven welke informatie er verloren gaat in een 2D-voorstelling van een 3D-object<br>**wat je leert in deze module**<br>– snijdende, evenwijdige en kruisende rechten herkennen<br>– een vlak bepalen<br>– de onderlinge ligging van twee rechten bepalen<br>– de onderlinge ligging van twee vlakken bepalen<br>– de onderlinge ligging van een rechte en vlak bepalen<br>– doorsneden bepalen en tekenen<br>**in de kijker**<br>Je besteedt aandacht aan het verklaren van jouw gevonden antwoord.<br>**wiskundetaal**<br>– doorsnede<br>– coplanair<br>– vlak<br>– snijlijn<br>– veelvlak<br>– snijvlak<br>– loodvlak<br>[Afbeelding: Een groot rood stempel met witte tekst \"CORRECTIESLEUTEL\" diagonaal over een afbeelding van een modern gebouw met veel ramen \'s avonds.]<br>**Inhoud**<br>Instap<br>1 Basisbegrippen<br>2 Onderlinge ligging van rechten en vlakken', icon: 'book-open' },
        { layout: 'standard', title: 'Basisbegrippen', content: '## 1.1 3D-objecten voorstellen<br>Als we 3D-objecten grafisch voorstellen, kunnen we maar gebruik maken van twee dimensies. Hierdoor gaat er informatie verloren en is wat we zien op de grafische voorstelling niet wat we zien in werkelijkheid. Vandaag kunnen we gebruik maken van Augmented Reality om bij een grafische voorstelling toch de realiteit te ervaren.<br>We bekijken even drie veelgebruikte technieken die gebruikt worden om 3D-objecten grafisch weer te geven.<br>[Afbeelding: Een draadmodel van een kubus met gekleurde lijnen en knooppunten.]<br>**A) Natuurlijk perspectief**<br>Bij deze voorstelling wordt er gebruik gemaakt van de horizon. Het zorgt ervoor dat je een getrouwe weergave krijgt van de werkelijkheid.<br>[Afbeelding: Een pentekening in perspectief van een modern huis met een zwembad vooraan, een ligstoel en bomen.]<br>Bij een natuurlijk perspectief wordt er gebruik gemaakt van 1 of meerdere vluchtpunten op de horizon.<br>We stellen vast dat:<br>- de evenwijdigheid van o', icon: 'book-open' },
        { layout: 'standard', title: 'Onderlinge ligging van rechten en vlakken', content: 'We onderzoeken telkens een bepaalde situatie op een kubus of balk. Je kunt de onderzoeken voeren door gebruik te maken van een schoendoos en satéstokjes. We proberen indien mogelijk de gevonden vaststelling te veralgemenen tot een eigenschap.<br>**Onderzoek 1:**<br>[Afbeelding: Een kubus waarbij lijn FB en het grondvlak ABCD rood zijn aangeduid.]<br>FB snijdt het grondvlak in B.<br>HD // FB<br>Snijdt HD het grondvlak?<br>[Afbeelding: Een kubus waarbij lijn FB en het bovenvlak EFGH rood zijn aangeduid.]<br>FB snijdt het vlak α in F.<br>HD // FB<br>Snijdt HD het vlak α?<br>**Onderzoek 2:**<br>[Afbeelding: Een kubus waarbij diagonaal FH op bovenvlak en het grondvlak ABCD rood zijn aangeduid.]<br>Is FH evenwijdig met het grondvlak?<br>Kun je een rechte tekenen in het grondvlak die evenwijdig is met FH?<br>[Afbeelding: Een kubus waarbij diagonaal FD en het diagonaalvlak EGC(A) rood zijn aangeduid.]<br>Is FD evenwijdig met het vl(EGC)?<br>Kun je een rechte tekenen in het vl(EGC) die evenwijd', icon: 'book-open' },
        { layout: 'standard', title: 'Toepassingen', content: '## 3.1 Snijlijn van twee vlakken<br>| methode | STAP 1: Zoek 2 verschillende punten die behoren tot de twee vlakken.<br>STAP 2: De twee punten bepalen de snijlijn van die vlakken. |<br>**Voorbeeld 1: Bepaal de snijlijn tussen vl(ABG) en vl(ADG).**<br>A en G zijn 2 punten die tot beide vlakken behoren.<br>De snijlijn is s = AG<br>[Afbeelding: Een kubus. Twee rode doorsnedevlakken die beginnen van A naar B en G en A naar D en G respectievelijk. De blauwe lijn die ontstaat vanaf hoekpunt A naar hoekpunt G snijdt dwars doorheen de figuur en is aangeduid als snijlijn s.]<br>**Voorbeeld 2: Bepaal de snijlijn tussen vl(ARS) en vl(EFG).**<br>Je ziet niet onmiddellijk twee punten die tot beide vlakken behoren.<br>Als je de vlakken tekent kun je vaststellen dat het snijpunt van AR en EH tot het grondvlak behoort. We noemen het snijpunt P.<br>Ook het snijpunt van BS en GF behoort tot het grondvlak. Dit punt noemen we Q.<br>Bijgevolg is PQ de snijlijn s.<br>[Afbeelding 1: Kubus met lijn E-H-G-F zi', icon: 'book-open' },
        { layout: 'standard', title: 'Doorsneden', content: 'Je kunt een veelvlak (kubus, balk, piramide, …) in twee stukken zagen. De punten die gemeenschappelijk zijn aan het snijvlak en het veelvlak vormen de **doorsnede**.<br>[Afbeeldingen 1-4: Geometrische volumes die opgedeeld worden (kubus via zig zag, zeshoek in een vlak prisma-achtig doorsneden en meer) door gekleurde 2-D vlakken met hun complementaire doorsnedes, waarna respectievelijk rechthoeken, een zeshoek of een driehoek geprojecteerd staat in effen rood opgelijnd eronder.]<br>Om een doorsnede te tekenen, hou je rekening met de volgende principes:<br>- De hoekpunten van de doorsnede liggen op de ribben van het veelvlak.<br>- De zijden van de doorsnede liggen in een zijvlak van het veelvlak.<br>- Je maakt gebruik van de meetkundige eigenschappen zoals:<br>- Dragers van zijden van de doorsnede die op evenwijdige zijvlakken liggen, zijn onderling evenwijdig.<br>- Het snijpunt van twee snijdende dragers van zijden van de doorsnede ligt op de snijlijn van de twee zijvlakken van die zij', icon: 'book-open' },
        { layout: 'standard', title: 'Problemen oplossen', content: 'Je kent al heel wat eigenschappen uit de vlakke meetkunde. Deze kun je nu ook toepassen om bijvoorbeeld een doorsnede op ware grootte te tekenen of om een hoek te bepalen tussen twee kruisende rechten.<br>## 5.1 De hoek tussen twee rechten<br>| EVENWIJDIGE RECHTEN | SNIJDENDE RECHTEN | KRUISENDE RECHTEN |<br>|---|---|---|<br>| [Afbeelding: Kubus met diagonale (A-F en D-G) vette blauwe rechten die evenwijdig lopen op zijflanken.] | [Afbeelding: Kubus met 2 snijdende vette blauwe rechten (D-F en A-D/E-C of vergelijkbaar: D-F / E-A) snijdend in kubus, 1 van hen passeert diagonaal de hoek en een ander diagonaal bovenvlak.] | [Afbeelding: Kubus met 2 kruisende vette blauwe rechten (H-B en A-D) en E-G of D-F, snijdend of kruisend als kruising/ruimtelijk conflict zonder snijding.] |<br>| de hoek gevormd tussen AF en DG<br>Notatie: \(\widehat{AF, DG}\) | de scherpe hoek gevormd tussen EC en GA<br>Notatie: \(\widehat{EC, GA} = \widehat{M_1}\) | de scherpe hoek gevormd tussen FH en AD<br>Notatie', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '1. Noteer in symbolen:', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

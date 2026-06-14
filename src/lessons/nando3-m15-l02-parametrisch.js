export default {
    id: 'nando3-m15-l02-parametrisch',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 15 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M15L2',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 15'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">## 1<br>Bepaal de vergelijking van de getekende rechten.<br>[Afbeelding: Assenstelsel met 4 rechten: f, g, h, en i.<br>Rechte f is stijgend door de oorsprong.<br>Rechte g is dalend door de oorsprong.<br>Rechte h is stijgend en snijdt de y-as op 2.<br>Rechte i is dalend en snijdt de y-as op 4.]<br>[ ... invulveld ... ]<br>f ↔ y = 3x<br>g ↔ y = -2x<br>h ↔ y = 2x + 2<br>i ↔ y = -x + 4<br>## 2<br>Teken de rechten p, q en r.<br>p ↔ y = -3x<br>q ↔ y = -2x + 4<br>r ↔ y = 3<br>[Afbeelding: Assenstelsel waarin de oplossingen (rode rechten) getekend zijn.<br>Rechte p gaat door (0,0) en (1,-3).<br>Rechte q gaat door (0,4) en (2,0).<br>Rechte r is een horizontale lijn op hoogte y=3.]<br>## 3<br>Bepaal de vergelijking van de gegeven rechten.<br>[Afbeelding: Assenstelsel met 3 verticale rechten: f, g, en h.<br>Rechte f ligt op x = 4.<br>Rechte g ligt op x = -2.<br>Rechte h ligt op x = 1.]<br>[ ... invulveld ... ]<br>f ↔ x = 4<br>g ↔ x = -2<br>h ↔ x = 1<br>## 4<br>Teken de rechte a met als vergelijking x = 2,5.<br>[Afbeelding: Assenstelsel met als oplossing een rode verticale rechte a getekend op x = 2,5.]<br>## 5<br>Bepaal de cartesische vergelijking van …<br>a) de rechte a met richtingscoëfficiënt 3 die door het punt A(1, 5) gaat.<br>[ ... invulveld ... ]<br>y - yA = a (x - xA)<br>y - 5 = 3 (x - 1)<br>y - 5 = 3x - 3<br>y = 3x + 2<br>b) de rechte b met richtingscoëfficiënt -2 die door het punt B(2, -4) gaat.<br>[ ... invulveld ... ]<br>y - yB = a (x - xB)<br>y - (-4) = (-2)(x - 2)<br>y + 4</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'analyticGeometry', icon: 'PhGraph' }
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
        'analyticGeometry': {
            type: 'analyticGeometry',
            title: 'Analytische Meetkunde'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 15', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'De algemene vergelijking van een rechte', content: '## 4.1 Vergelijking van de vorm ux + vy + w = 0<br>**Voorbeeld**<br>Zoek de afmetingen van alle rechthoeken waarvan de omtrek 318 m is.<br>[Afbeelding: Een wiskundige tekening van een rechthoek. De horizontale zijde is gelabeld met \'x: lengte van de rechthoek\' en de verticale zijde is gelabeld met \'y: breedte van de rechthoek\'.]<br>We stellen vast dat 2x + 2y = 318.<br>2x + 2y = 318 is een vergelijking van de vorm ux + vy + w = 0 met u = 2; v = 2 en w = -318, want we kunnen dit omvormen naar 2x + 2y - 318 = 0.<br>definitie<br>ux + vy + w = 0 met u, v en w ∈ ℝ (waarbij u en v niet tegelijk nul zijn) noemt men de **algemene vergelijking** van een rechte.<br>We kunnen vergelijkingen van de vorm y = ax + b en x = c herschrijven in de vorm ux + vy + w = 0.<br>**A) Rechten die de y-as snijden**<br>**Voorbeelden**<br>- y = 2x + 1 wordt: 2x - y + 1 = 0<br>- y = 3 wordt:<br>0x + y - 3 = 0<br>y - 3 = 0<br>**B) Rechten evenwijdig met de y-as**<br>**Voorbeelden**<br>- x = 2 wordt:<br>x + 0y - ', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Vectoriële en parametrische vergelijkingen van een rechte', content: '## 5.1 Rechte door de oorsprong<br>De rechte l gaat door de oorsprong. We nemen een willekeurig punt B op de rechte l. We tekenen de plaatsvector OB = B.<br>Elk punt op de rechte l ligt in het verlengde van de vector B.<br>Alle plaatsvectoren op de rechte l hebben dezelfde richting als B.<br>We beschouwen de vectoren C en D.<br>- Vector C is twee keer langer dan B en heeft dezelfde zin.<br>C = 2 · B<br>(8, 4) = 2 · (4, 2)<br>- Vector D is anderhalve keer langer dan B maar heeft een tegengestelde zin.<br>D = -1,5 · B<br>(-6, -3) = -1,5 · (4, 2)<br>Een willekeurig punt P dat op de rechte l ligt, heeft een plaatsvector P die het product is van de gekozen vector B met een reëel getal k.<br>P is dus een reëel veelvoud van B.<br>notatie<br>P = k · B met k ∈ ℝ<br>Dit noemt men een **vectoriële vergelijking** van de rechte l.<br>De waarde van k kan gelijk welk reëel getal zijn. k noemt men een parameter.<br>De gekozen vector B noemt men een **richtvector** van de rechte l.<br>Elke waarde van k', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Bepaal de vergelijking van de gegeven rechten.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

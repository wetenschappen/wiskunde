export default {
    id: 'nando3-m13-l02-formules',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 13 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M13L2',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 13'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">**1 Vul aan met de juiste verhouding.**<br>[Afbeelding: Rechthoekige driehoek KLM met rechte hoek in M. De zijden zijn [KL], [LM] en [KM].]<br>a) sin L̂ = |KM| / |KL|<br>b) tan K̂ = |LM| / |KM|<br>c) cos K̂ = |KM| / |KL|<br>d) tan L̂ = |KM| / |LM|<br>e) sin K̂ = |LM| / |KL|<br>f) cos L̂ = |LM| / |KL|<br>**2 Reken uit met behulp van een rekenmachine.**<br>a) cos 43° ≈ 0,73135<br>b) sin 55° ≈ 0,81915<br>c) tan 76°13\'34\" ≈ 4,07930<br>**3 Bepaal de grootte van de scherpe hoek waarvan het goniometrische getal gegeven is. Noteer je antwoord in graden, minuten en seconden.**<br>a) tan α = 5,3<br>α ≈ 79,31509° ( ≈ 79°18\'54\" )<br>b) cos β = 0,3<br>β ≈ 72,54240° ( ≈ 72°32\'33\" )<br>c) sin γ = 3/7<br>γ ≈ 25,37693° ( ≈ 25°22\'37\" )<br>**4 Teken een rechthoekige driehoek PQR waarbij R̂ = 90° en tan P̂ = 5/8.**<br>[Afbeelding: Een assenstelsel-rooster (ruitjespapier). Een rechthoekige driehoek PQR is getekend met de rechte hoek in R. De horizontale zijde [PR] is 8 eenheden lang en de verticale zijde [QR] is 5 eenheden lang.]<br>**5 Gegeven: cos α = 0,25 en α is een scherpe hoek. Bepaal sin α zonder α te berekenen.**<br>sin² α + cos² α = 1<br>sin² α + (0,25)² = 1<br>sin² α + 0,0625 = 1<br>sin² α = 1 - 0,0625<br>sin² α = 0,9375<br>sin α = √0,9375<br>sin α ≈ 0,96825<br>**6 Gegeven: sin α = 1/2 en α is een scherpe hoek. Bepaal tan α zonder α te berekenen.**<br>sin² α + cos² α = 1<br>(1/2)² + cos² α = 1<br>cos² α = 1 - 1/4<br>cos² α = 3/4<br>cos α = √(3/4)<br>cos α = √3 / 2<br>tan α = sin</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'trigonometryRightTriangle', icon: 'PhTriangle' }
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
        'trigonometryRightTriangle': {
            type: 'trigonometryRightTriangle',
            title: 'Driehoeksmeting'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 13', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Fundamentele formules in de driehoeksmeting', content: 'We maken de volgende afspraken in verband met de notatie:<br>sin² α = (sin α)²<br>cos² α = (cos α)²<br>tan² α = (tan α)²<br>## 2.1 Grondformule: verband tussen sinus en cosinus van een scherpe hoek<br>**formule GRONDFORMULE GONIOMETRIE**<br>sin² α + cos² α = 1<br>**Verklaring**<br>In een rechthoekige driehoek ABC met rechte hoek Ĉ geldt:<br>sin α = a/c en cos α = b/c<br>We kunnen noteren dat:<br>sin² α + cos² α = (a/c)² + (b/c)²<br>= a²/c² + b²/c²<br>= (a² + b²) / c²   (stelling van Pythagoras)<br>= c² / c²<br>= 1<br>[Afbeelding: Rechthoekige driehoek ABC met hoek α in punt A. Zijden a, b, c zijn aangeduid.]<br>Je kunt de grondformule gebruiken bij het aantonen van identiteiten of bij het berekenen van sin α als cos α gegeven is (of omgekeerd).<br>**Voorbeeld**<br>**Gegeven:** sin α = 0,8 en α is een scherpe hoek<br>**Gevraagd:** cos α<br>**Oplossing:**<br>sin² α + cos² α = 1<br>0,8² + cos² α = 1<br>0,64 + cos² α = 1<br>cos² α = 1 - 0,64<br>cos² α = 0,36  (de cosinus van een scherpe h', icon: 'book-open' }
    ],
    slidesB: [
        
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '**1 Bepaal de goniometrische getallen van de hoeken α en β met behulp van de tekening.**', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

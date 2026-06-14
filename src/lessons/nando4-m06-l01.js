export default {
    id: 'nando4-m06-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 06 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M06L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 06'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">**1** Bepaal de hoofdwaarde van de georiënteerde hoek.<br>| GEORIËNTEERDE HOEK | HOOFDWAARDE VAN DE GEORIËNTEERDE HOEK |<br>|---|---|<br>| Â = 340° | Â = -20° |<br>| B̂ = -210° | B̂ = 150° |<br>| Ĉ = 970° | Ĉ = -110° |<br>| D̂ = -315° | D̂ = 45° |<br>**2** Teken het beeldpunt van P̂ op de goniometrische cirkel.<br>a) P̂ = 75°<br>[Afbeelding: Een goniometrische cirkel met een hoek van 75° getekend in het eerste kwadrant (tegenwijzerzin).]<br>b) P̂ = 200°<br>[Afbeelding: Een goniometrische cirkel met een hoek van 200° getekend. Deze ligt in het derde kwadrant (voorbij de x-as), aangeduid in rood in tegenwijzerzin.]<br>**3** Bepaal de coördinaat van de beeldpunten van de georiënteerde hoeken op de goniometrische cirkel en reken uit.<br>a)<br>[Afbeelding: Een goniometrische cirkel met een hoek van 55° in het eerste kwadrant.]<br>co(A) = (cos 55°, sin 55°)<br>= (0,57358; 0,81915)<br>b)<br>[Afbeelding: Een goniometrische cirkel met een hoek van 200° in het derde kwadrant.]<br>co(A) = (cos 200°, sin 200°)<br>= (-0,93969; -0,34202)<br>**4**<br>a) Teken een goniometrische cirkel.<br>b) Teken in de goniometrische cirkel een representant van de georiënteerde hoek Â = 125°.<br>c) Stel de sinus, cosinus, tangens en cotangens van de gegeven georiënteerde hoek grafisch voor.<br>[Afbeelding: Een goniometrische cirkel. Een hoek van 125° is getekend (in het tweede kwadrant). Punt A ligt op de cirkel. Een horizontale stippellijn naar y-as geeft de sin α aan, een verticale stippellijn naar de </p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'trigonometryCircle', icon: 'PhGameController' }
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
        'trigonometryCircle': {
            type: 'trigonometryCircle',
            title: 'De Eenheidscirkel'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 06', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Maak de juiste verbindingen.<br>[Afbeelding: Twee hoeken getekend. De bovenste is een hoek van 50 graden in tegenwijzerzin (pijl omhoog). De onderste is een hoek van 50 graden in wijzerzin (pijl omlaag).]<br>Verbindingen (opgelost in correctiesleutel):<br>- Bovenste hoek: verbonden met \"α = 50°\" en \"tegenwijzerzin\".<br>- Onderste hoek: verbonden met \"α = -50°\" en \"wijzerzin\".<br>## Opdracht 2<br>a) Vul aan met de juiste begrippen.<br>[Afbeelding: Een rechthoekige driehoe...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Goniometrische getallen van een hoek', content: '## 1.1 De hoofdwaarde van een hoek<br>In het tweede jaar leerde je in de module over transformaties een rotatie over een hoek in wijzerzin of tegenwijzerzin met ICT uitvoeren. Wanneer op een hoek een zin is aangeduid, dan is dat een **georiënteerde hoek**.<br>[Afbeelding: Een hoek α = +40° met een pijl in tegenwijzerzin. Onderschrift: TEGENWIJZERZIN]<br>[Afbeelding: Een hoek α = -40° met een pijl in wijzerzin. Onderschrift: WIJZERZIN]<br>Een georiënteerde hoek heeft oneindig veel waarden.<br>Als α een waarde is van de hoek A, dan zijn α + k · 360° (met k ∈ ℤ) alle waarden voor die hoek.<br>[Afbeelding: Een hoek α = +40°.]<br>α = +40°<br>[Afbeelding: Een hoek α = -320°, getekend met een pijl in wijzerzin die bijna een volledige cirkel maakt.]<br>α = -320°<br>= 40° - 1 · 360°<br>[Afbeelding: Een hoek α = 760°, getekend met een pijl in tegenwijzerzin die twee volledige cirkels maakt en dan stopt bij dezelfde hoek.]<br>α = 760°<br>= 40° + 2 · 360°<br>We spreken af dat we bij voorkeur werke', icon: 'book-open' },
        { layout: 'standard', title: 'Toepassingen', content: '## 2.1 De hoofdeigenschap van de goniometrie<br>Gegeven is een hoek α gelegen in het eerste kwadrant.<br>[Afbeelding: Goniometrische cirkel met hoek α in kwadrant I en rechthoekige driehoek OPA.]<br>In de rechthoekige driehoek OPA geldt:<br>|OP|² + |PA|² = |OA|²<br>⇕<br>cos² α + sin² α = 1<br>We nemen een hoek α uit het tweede kwadrant.<br>In de rechthoekige driehoek OPA geldt:<br>|OP|² + |PA|² = |OA|²<br>⇕<br>(|cos α|)² + sin² α = 1<br>⇕<br>cos² α + sin² α = 1<br>[Afbeelding: Goniometrische cirkel met hoek α in kwadrant II en rechthoekige driehoek OPA.]<br>Op een analoge manier kan je aantonen dat deze formule geldt voor alle georiënteerde hoeken. Dit is de **hoofdeigenschap of grondformule van de goniometrie**.<br>**eigenschap**<br>cos² α + sin² α = 1<br>## 2.2 Goniometrische getallen van een hoek berekenen<br>Gegeven is een hoek α gelegen in het tweede kwadrant waarvoor sin α = 8/17. Bereken de drie overige goniometrische getallen cos α, tan α en cot α zonder eerst α te berekenen.<b', icon: 'book-open' },
        { layout: 'standard', title: 'Goniometrische getallen van verwante hoeken', content: '## 3.1 Gelijkwaardige of gelijke hoeken<br>Teken in een goniometrische cirkel het beeldpunt van volgende hoeken:<br>α₁ = 35°<br>α₂ = 395°<br>α₃ = 755°<br>α₄ = -325°<br>Blijkbaar hebben al deze hoeken hetzelfde beeldpunt op de goniometrische cirkel.<br>[Afbeelding: Een goniometrische cirkel met een hoek van α = 35°.]<br>**definitie**<br>IN WOORDEN<br>**Gelijkwaardige of gelijke hoeken** zijn hoeken met eenzelfde beeldpunt op de goniometrische cirkel.<br>IN SYMBOLEN<br>β is gelijkwaardig met α ⇔ β = α + k · 360° (met k ∈ ℤ)<br>Omdat gelijkwaardige hoeken hetzelfde beeldpunt op de goniometrische cirkel hebben, hebben gelijkwaardige hoeken dezelfde goniometrische getallen.<br>**formules**<br>sin (α + k · 360°) = sin α (met k ∈ ℤ)<br>cos (α + k · 360°) = cos α (met k ∈ ℤ)<br>tan (α + k · 360°) = tan α (met k ∈ ℤ)<br>cot (α + k · 360°) = cot α (met k ∈ ℤ)<br>**Voorbeelden**<br>sin 375° = sin 15°<br>cos (-50°) = cos 310°<br>tan 820° = tan 100°<br>cot 456° = cot 96°<br>## 3.2 Tegengestelde hoe', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '**1** Teken een goniometrische cirkel (neem als eenheid een straal van 5 cm), teken hierin een geori', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

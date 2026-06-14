export default {
    id: 'nando4-m12-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 12 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M12L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 12'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">1<br>Gegeven: ΔABC<br>Gevraagd: |AC|<br>[Afbeelding: Driehoek ABC met c=7, a=9,2 en B=140°]<br>Berekenen van |AC| in driehoek ABC met cosinusregel:<br>b² = a² + c² − 2ac cos B̂<br>b² = 9,2² + 7² − 2 · 9,2 · 7 · cos 140°<br>b = √(9,2² + 7² − 2 · 9,2 · 7 · cos 140°)<br>b ≈ 15,10184<br>|AC| ≈ 15,10184<br>2<br>Gegeven: ΔKLM<br>Gevraagd: K̂<br>[Afbeelding: Driehoek KLM met l=11, m=4 en L=70°]<br>|KM| / sin L̂ = |LM| / sin K̂<br>11 / sin 70° = 4 / sin K̂<br>sin K̂ = (4 · sin 70°) / 11<br>K̂ ≈ 19°58\'51\"<br>3<br>Gegeven: ΔPQR<br>Gevraagd: |PQ|<br>[Afbeelding: Driehoek PQR met r=8,5, Q=100° en R=55°]<br>|PQ| / sin R̂ = |PR| / sin Q̂<br>|PQ| = (8,5 · sin 55°) / sin 100°<br>|PQ| ≈ 7,0702<br>4<br>Gegeven: ΔFGH<br>h = 48<br>g = 62<br>f = 54<br>[Afbeelding: Driehoek FGH met zijden f, g, h]<br>Gevraagd: F̂, Ĝ en Ĥ<br>Oplossing:<br>• h² = g² + f² − 2gf · cos Ĥ<br>cos Ĥ = (g² + f² − h²) / 2gf<br>cos Ĥ = (62² + 54² − 48²) / (2 · 62 · 54)<br>Ĥ ≈ 48°16\'53\"<br>• g² = h² + f² − 2hf · cos Ĝ<br>cos Ĝ = (h² + f² − g²) / 2hf<br>cos Ĝ = (48² + 54² − 62²) / (2 · 48 · 54)<br>Ĝ ≈ 74°36\'27\"<br>• f² = g² + h² − 2gh · cos F̂<br>cos F̂ = (g² + h² − f²) / 2gh<br>cos F̂ = (62² + 48² − 54²) / (2 · 62 · 48)<br>F̂ ≈ 57°06\'40\"<br>5<br>Gegeven: ΔPQR r = 27<br>P̂ = 59°<br>Q̂ = 95°<br>[Afbeelding: Driehoek PQR met r-zijde aangeduid, Q=95°, P=59°]<br>Gevraagd: p, q en R̂<br>Oplossing:<br>• R̂ = 180° − P̂ − Q̂<br>= 180° − 59° − 95°<br>= 26°<br>• r / sin R̂ = p / sin P̂<br>p = (r · sin P̂) / sin R̂<br>p</p></div></div>`,
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
            title: 'Willekeurige Driehoeken'
            , "initialMode":"analysis","subMode":"triangles"
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 12', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Driehoeksmeting in willekeurige driehoeken', content: '[Afbeelding: Cover met zendmasten en een stempel \"CORRECTIESLEUTEL\"]<br>## Inhoud<br>1 Cosinusregel en sinusregel voor willekeurige driehoeken<br>2 Toepassingen<br>Signaaloefeningen<br>Differentiatietraject<br>Studiewijzer<br>## WAT JE AL KUNT<br>– de formule van Pythagoras in een rechthoekige driehoek verwoorden en toepassen<br>– de goniometrische getallen van een scherpe hoek in een rechthoekige driehoek definiëren<br>– eigenschappen van de middelloodlijn van een lijnstuk verwoorden<br>– eigenschappen van hoeken in gelijkbenige driehoeken verwoorden<br>– eigenschap van de hoogtelijn uit de top van een gelijkbenige driehoek verwoorden<br>## IN DE KIJKER<br>Mathematiseren en demathematiseren van contextopgaven.<br>## WAT JE LEERT IN DEZE MODULE<br>– de cosinusregel en sinusregel opstellen voor willekeurige driehoeken<br>– de cosinusregel en sinusregel toepassen bij het oplossen van vraagstukken<br>– door middel van formules vanuit een gegeven goniometrisch getal de andere goniometris', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Cosinusregel en sinusregel voor willekeurige driehoeken', content: '## 1.1 Cosinusregel<br>De **cosinusregel** geeft het verband weer tussen de drie zijden van een driehoek en de cosinus van een hoek.<br>formules<br>a² = b² + c² − 2bc · cos Â<br>b² = a² + c² − 2ac · cos B̂<br>c² = a² + b² − 2ab · cos Ĉ<br>[Afbeelding: Driehoek ABC met zijden a, b, c]<br>De cosinusregel wordt gebruikt om de lengte van de derde zijde van een driehoek te berekenen als de lengte van beide andere zijden en de grootte van hun ingesloten hoek gekend zijn.<br>De cosinusregel wordt ook gebruikt om de grootte van de hoeken van een driehoek te berekenen als de lengte van de drie zijden gekend zijn.<br>We bewijzen de eerste regel van de cosinusregel in een scherphoekige driehoek.<br>Gegeven: ΔABC is scherphoekig<br>Te bewijzen: a² = b² + c² − 2bc · cos Â<br>**Bewijs:**<br>• Teken de hoogtelijn [BD].<br>• Driehoek BCD is rechthoekig, er geldt:<br>[Afbeelding: Driehoek ABC met hoogtelijn uit B op AC met snijpunt D. Zijden a, b, c.]<br>a² = |BD|² + |DC|²<br>⇕ |DC| = b − |AD|<br>a²', icon: 'book-open' },
        { layout: 'standard', title: 'Toepassingen', content: '## 2.1 Lengte van een zwaartelijn<br>In driehoek ABC is<br>B̂ = 80°<br>|AB| = 19 cm<br>|BC| = 24 cm<br>en BD een zwaartelijn.<br>[Afbeelding: Driehoek ABC met zwaartelijn BD. B=80°]<br>Bereken de lengte van [BD].<br>Oplossing:<br>We werken in driehoek ABC:<br>|AC|² = |AB|² + |BC|² − 2 |AB| · |BC| · cos B̂<br>|AC|² = 19² + 24² − 2 · 19 · 24 · cos 80°<br>|AC| ≈ 27,90399<br>|BC|² = |AB|² + |AC|² − 2 |AB| · |AC| · cos Â<br>cos Â = (|AB|² + |AC|² − |BC|²) / (2 |AB| · |AC|)<br>cos Â = (19² + 27,90399² − 24²) / (2 · 19 · 27,90399)<br>Â ≈ 57°53\'22\"<br>We werken in driehoek ABD:<br>|AD| = 1 / 2 |AC| ≈ 13,952<br>|BD|² = |AB|² + |AD|² − 2 |AB| · |AD| · cos Â<br>|BD|² = 19² + 13,952² − 2 · 19 · 13,952 · cos(57°53\'22\")<br>|BD| ≈ 16,54817<br>Antwoord: |BD| is ongeveer 16,54817 cm.<br>## 2.2 Hoogte van een beeld<br>Bepaal de hoogte van het beeld (zonder sokkel) als je weet dat<br>α = BÂC = 36°, β = CÂD = 34° en |AB| = 2 m.<br>[Afbeelding: Standbeeld op sokkel met driehoeken voor meting]<br>O', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Gegeven: ΔKLM', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

export default {
    id: 'chemie-bindingen-les-3',
    subject: 'science',
    className: '3NW',
    title: 'Les 3: Roosters & Eigenschappen',
    description: 'Verklaart macroscopische eigenschappen (geleidbaarheid, vervormbaarheid, smeltpunt) aan de hand van de vier roostermodellen. Eindigt met synthese en zelfevaluatie.',
    date: 'Les 3',

    goals: [
        'Ik kan de vier roostertypes herkennen en benoemen: ionrooster, molecuulrooster, atoomrooster en metaalrooster.',
        'Ik kan eigenschappen zoals elektrische geleidbaarheid en vervormbaarheid verklaren met behulp van een roostermodel.',
        'Ik kan kennis over bindingen, formules, roosters en eigenschappen samen toepassen in nieuwe vragen.'
    ],

    workbook: {
        title: 'Werkboek: Chemische Bindingen',
        subtitle: 'Deel 3: Roosters, Eigenschappen & Synthese',
        instruction: 'Gebruik je handboek (p. 257, 262-265) om de oefeningen te maken.'
    },

    timeline: {
        stepA: {
            step: 'A',
            title: 'Inleiden & Oriënteren',
            time: '~10 min',
            cards: [
                {
                    id: 'card-hook',
                    type: 'class',
                    title: 'Slaan of Breken?',
                    description: 'Start de presentatie met de openingsvraag: waarom kan een smid ijzer platslaan maar breekt een zoutkristal?',
                    action: 'presentation',
                    slidesKey: 'hook_slides'
                },
                {
                    id: 'card-intro',
                    type: 'class',
                    title: 'Korte intro: de vier roostertypes',
                    description: 'Leg uit: de structuur op microniveau bepaalt de eigenschappen op macroniveau. Toon de theorie-slides met de vier roostertypes en hun eigenschappen.',
                    action: 'presentation',
                    slidesKey: 'theory_slides'
                },
                {
                    id: 'card-lattice',
                    type: 'digital',
                    title: 'Virtueel Testlab',
                    description: 'Onderzoek macroscopische eigenschappen: plooibaarheid, geleidbaarheid, glans.',
                    action: 'activity',
                    activityId: 'atomicLattice',
                    icon: 'PhFlask'
                }
            ]
        },
        stepB: {
            step: 'B',
            title: 'Verdiepen & Oefeningen Maken',
            time: '~30 min',
            cards: [
                {
                    id: 'card-guided',
                    type: 'class',
                    title: 'Begeleide oefening: roosters lezen en verklaren',
                    description: 'Stap-voor-stap aanpak voor roostertypen, eigenschappen en verklaren met het model.',
                    action: 'presentation',
                    slidesKey: 'guided_slides'
                },
                {
                    id: 'card-workbook',
                    type: 'paper',
                    title: 'Werkboek: oefeningen les 3',
                    description: '4 oefeningen: atoomrooster herkennen (p.257), vervormbaarheid verklaren (p.262), kruiswoordraadsel (p.262-263), checklist (p.265).',
                    action: 'workbook',
                    icon: 'PhBookOpen',
                    exercises: 'Aan de slag 3 (p. 257): Welke stof heeft een atoomrooster?; MC-vragen (grafiet, diamant vs. andere roosters)\nAan de slag 1 (p. 262): Vervormbaarheid vs. brosheid: verklaar waarom metaal vervormbaar is maar ionrooster breekt\nAan de slag 2 (p. 262-263): Kruiswoordraadsel: los op in duo\'s (atoomrooster, molecuulformule, coulombkracht, edelgasconfiguratie, allotropie, etc.)\nAan de slag 4 (p. 265): Checklist: zelfevaluatie met 8 begripskennis en 4 onderzoeksvaardigheden'
                }
            ]
        },
        stepC: {
            step: 'C',
            title: 'Samenvatten & Exit Ticket',
            time: '~10 min',
            cards: [
                {
                    id: 'card-summary',
                    type: 'class',
                    title: 'Samenvatting: roosters en eigenschappen',
            description: 'Overzicht: ionrooster (hard, bros, geleidt opgelost), molecuulrooster (laag smeltpunt), atoomrooster (extreem hard), metaalrooster (geleidt, vervormbaar). Hoe de binnenkant de buitenkant bepaalt.',
            action: 'presentation',
            slidesKey: 'summary_slides'
        },
                {
                    id: 'card-exit-ticket',
                    type: 'digital',
                    title: 'Exit Ticket',
                    description: 'Maak de exit ticket individueel om je begrip van roosters en eigenschappen te checken.',
                    action: 'exit-ticket'
                }
            ]
        }
    },

    hook_slides: [
        {
            layout: 'predict',
            title: 'Slaan of breken?',
            question: 'Waarom kan een smid een gloeiend hete ijzeren staaf platslaan tot een zwaard, terwijl een zoutkristal onmiddellijk zou verbrijzelen?',
            context: 'Denk aan de roosterstructuur en de deeltjes binnenin.',
            hint: 'Klik om de uitleg te zien',
            revealText: 'Het geheim zit in het rooster. In een metaalrooster kunnen positieve ionen ten opzichte van elkaar verschuiven in de elektronenzee, waardoor het rooster vervormbaar is. In een ionrooster duw je bij verschuiving ionen met dezelfde lading tegen elkaar, waardoor afstoting optreedt en het rooster breekt.'
        }
    ],

    theory_slides: [
        {
            layout: 'title',
            title: 'Roosters en eigenschappen',
            subtitle: 'Hoe de structuur op microniveau de eigenschappen bepaalt',
            badge: 'Theorie',
            icon: 'cube'
        },
        {
            layout: 'standard',
            title: 'De vier roostertypes',
            content: '<strong>1. Ionrooster</strong> (zouten): afwisselend positieve en negatieve ionen. Hard maar bros.<br><strong>2. Molecuulrooster</strong> (suiker, ijs, I₂): gestapelde moleculen. Lage smeltpunten.<br><strong>3. Atoomrooster</strong> (diamant, grafiet): elk atoom verbonden met buren. Extreem hard.<br><strong>4. Metaalrooster</strong> (metalen): positieve ionen en elektronenzee. Geleidt, vervormbaar.<br><br><strong>Kenwoorden:</strong> ionen, moleculen, netwerk, elektronenzee.'
        },
        {
            layout: 'standard',
            title: 'Eigenschap 1: elektrische geleidbaarheid',
            content: 'Voor stroomgeleiding zijn <strong>vrij bewegende geladen deeltjes</strong> nodig.<ul><li><strong>Metaalrooster:</strong> JA, vrije elektronen bewegen.</li><li><strong>Ionrooster:</strong> NEEN (vast), ionen zitten vast. JA (opgelost/gesmolten), ionen bewegen vrij.</li><li><strong>Molecuulrooster:</strong> NEEN, geen vrije geladen deeltjes.</li><li><strong>Atoomrooster:</strong> NEEN (meestal). Uitzondering: grafiet.<br><strong>Voorbeelden:</strong> vast NaCl geleidt niet, vloeibaar of opgelost NaCl wel.</li></ul>'
        },
        {
            layout: 'standard',
            title: 'Eigenschap 2: vervormbaarheid versus brosheid',
            content: '<ul><li><strong>Metalen:</strong> Lagen positieve ionen kunnen ten opzichte van elkaar verschuiven, de elektronenzee past zich aan.</li><li><strong>Zouten:</strong> Verschuiving brengt ionen met dezelfde lading naast elkaar. Dat geeft afstoting en het rooster breekt.</li></ul>'
        },
        {
            layout: 'standard',
            title: 'Eigenschap 3: smeltpunt, dichtheid en legeringen',
            content: '<ul><li><strong>Hoog smeltpunt:</strong> Metaal-, ion- en atoomroosters (sterke bindingen).</li><li><strong>Laag smeltpunt:</strong> Molecuulroosters (zwakke krachten tussen moleculen).</li><li><strong>Hoge dichtheid:</strong> Metalen, compacte stapeling.</li><li><strong>Legeringen</strong> (brons, messing): onregelmatige rangschikking maakt verschuiven moeilijker.</li></ul>'
        }
    ],

    guided_slides: [
        {
            layout: 'title',
            title: 'Hoe pak je de oefeningen aan?',
            subtitle: 'Roosters, eigenschappen en verklaren met het model',
            badge: 'Begeleide Oefening',
            icon: 'lightbulb'
        },
        {
            layout: 'standard',
            title: '1. Herken het roostertype',
            content: 'Voor Aan de slag 3 (p. 257) kijk je eerst naar de deeltjes:<br><br><strong>Ionrooster</strong> = positieve en negatieve ionen.<br><strong>Molecuulrooster</strong> = moleculen op vaste plaatsen.<br><strong>Atoomrooster</strong> = atomen in een doorlopend netwerk.<br><strong>Metaalrooster</strong> = positieve metaalionen en elektronenzee.<br><br>Tip: grafiet en diamant horen allebei bij het atoomrooster.<br><strong>Voorbeelden:</strong> grafiet, diamant, NaCl, Fe, suiker.'
        },
        {
            layout: 'standard',
            title: '2. Verklaar vervormbaarheid en brosheid',
            content: 'Voor Aan de slag 1 (p. 262) gebruik je altijd dezelfde volgorde:<br><br><strong>Stap 1:</strong> Beschrijf de deeltjes in het rooster.<br><strong>Stap 2:</strong> Zeg wat er gebeurt als lagen verschuiven.<br><strong>Stap 3:</strong> Koppel dat aan het gevolg: buigt of breekt het rooster?<br><br>Voorbeeld: metaal = ionen verschuiven, de elektronenzee houdt samen. Ionrooster = gelijke ladingen naast elkaar, dus afstoting.<br><strong>Antwoordkern:</strong> metaal vervormt, zout breekt.'
        },
        {
            layout: 'standard',
            title: '3. Leg uit met voorbeelden',
            content: 'Gebruik de synthesevragen om je kennis toe te passen:<br><br><strong>Grafiet</strong> en <strong>diamant</strong> zijn allebei koolstof, maar hebben een ander netwerk. Dat heet <strong>allotropie</strong>.<br><strong>Brons</strong> is een legering. De onregelmatige rangschikking maakt verschuiven moeilijker.<br><strong>Molecuulroosters</strong> hebben lage smeltpunten omdat de krachten tussen de moleculen zwak zijn.<br><strong>Samenvatting:</strong> deeltjesbouw bepaalt de eigenschappen.'
        },
        {
            layout: 'recap',
            title: 'Kijk na of je het kunt',
            questions: [
                { q: 'Welk roostertype heeft diamant?', a: 'Atoomrooster.' },
                { q: 'Waarom is een zoutkristal bros?', a: 'Bij verschuiving komen gelijke ladingen naast elkaar en stoten elkaar af.' },
                { q: 'Waarom kan een metaal vervormen?', a: 'De elektronenzee houdt de positieve ionen samen terwijl lagen verschuiven.' }
            ]
        }
    ],

    summary_slides: [
        {
            layout: 'title',
            title: 'Samenvatting les 3',
            subtitle: 'Roosters, eigenschappen en het grote geheel',
            badge: 'Samenvatting',
            icon: 'check'
        },
        {
            layout: 'standard',
            title: 'De vier roostertypes',
            content: '<table style="width:100%;text-align:left;border-collapse:collapse;"><tr><th>Rooster</th><th>Deeltjes</th><th>Geleidt (vast)?</th><th>Vervormbaar?</th></tr><tr><td>Ionrooster</td><td>+ en − ionen</td><td>Neen</td><td>Neen (bros)</td></tr><tr><td>Molecuulrooster</td><td>Moleculen</td><td>Neen</td><td>Neen</td></tr><tr><td>Atoomrooster</td><td>Netwerk van atomen</td><td>Neen*</td><td>Neen</td></tr><tr><td>Metaalrooster</td><td>Ionen + elektronenzee</td><td>Ja</td><td>Ja</td></tr></table><br>*Grafiet is een uitzondering.<br><strong>Leer dit schema:</strong> het is het kernoverzicht voor de toets.'
        },
        {
            layout: 'standard',
            title: 'Verband tussen les 1, 2 en 3',
            content: '<strong>Les 1:</strong> Waarom binden atomen? → edelgasconfiguratie → 3 bindingstypes.<br><strong>Les 2:</strong> Hoe schrijf je formules? → neutraliteitsregel (ionen), Lewisstructuur (atomen).<br><strong>Les 3:</strong> Hoe stapelen deeltjes? → 4 roostertypes → macroscopische eigenschappen.<br><br><em>Alles hangt samen: de elektronen op de buitenste schil bepalen het resultaat.</em>'
        }
    ],

    exitTicket: {
        questions: [
            { id: 'q1', type: 'mc', question: 'Welke stof geleidt elektrische stroom in VASTE vorm?', options: ['NaCl', 'C (diamant)', 'Cu', 'H₂O'], correct: 2 },
            { id: 'q2', type: 'juist-fout', question: 'Een zout is bros omdat bij verschuiving van de roosterlagen ionen met dezelfde lading naast elkaar komen te liggen.', correct: true },
            { id: 'q3', type: 'open', question: 'Leg uit waarom een kopersulfaat-oplossing (CuSO₄ in water) wél stroom geleidt, maar vast CuSO₄ niet.' },
            { id: 'q4', type: 'mc', question: 'Welk roostertype heeft diamant?', options: ['Ionrooster', 'Molecuulrooster', 'Atoomrooster', 'Metaalrooster'], correct: 2 },
            { id: 'q5', type: 'mc', question: 'Waarom is brons sterker dan zuiver koper?', options: ['Brons heeft een atoomrooster', 'De onregelmatige rangschikking van verschillende ionen verhindert verschuiving', 'Brons is een ionverbinding'], correct: 1 }
        ]
    }
}

export default {
    id: 'chemie-bindingen-les-1',
    subject: 'chemistry',
    className: '3NW',
    title: 'Les 1: Waarom binden atomen?',
    description: 'Introductie tot de drie bindingstypes: ion-, atoom- en metaalbinding. Focus op ionvorming en herkenning van bindingstypes.',
    date: 'Les 1',

    goals: [
        'Ik kan uitleggen waarom atomen bindingen vormen om een edelgasconfiguratie te bereiken.',
        'Ik kan bij een metaal en een niet-metaal aangeven welke ionen ontstaan.',
        'Ik kan het verschil tussen een binding en een verbinding aanduiden.',
        'Ik kan bij een gegeven stof het juiste bindingstype aanduiden: ionbinding, atoombinding of metaalbinding.'
    ],

    workbook: {
        title: 'Werkboek: Chemische Bindingen',
        subtitle: 'Deel 1: Ionvorming & Bindingstypes',
        instruction: 'Gebruik je handboek (p. 235-241) om de oefeningen te maken.'
    },

    timeline: {
        stepA: {
            step: 'A',
            title: 'Inleiden & Oriënteren',
            time: '~10 min',
            cards: [{
                    id: 'card-hook',
                    type: 'class',
                    title: 'Geven, Nemen of Delen?',
                    description: 'Gebruik de drie situaties uit de Check In (p. 234) als startvraag voor de bindingen.',
                    action: 'presentation',
                    slidesKey: 'hook_slides'
                },
                {
                    id: 'card-intro',
                    type: 'class',
                    title: 'Korte intro: waarom binden atomen?',
                    description: 'Leg uit dat atomen streven naar de edelgasconfiguratie en dat de aard van de deeltjes de binding bepaalt.',
                    action: 'presentation',
                    slidesKey: 'theory_slides'
                },
                {
                    id: 'card-chem-bond',
                    type: 'digital',
                    title: 'Covalente Bindingen',
                    description: 'Ontdek hoe niet-metalen elektronen delen (H₂ en H₂O).',
                    action: 'activity',
                    activityId: 'chemicalBonding',
                    icon: 'PhLink'
                },
                {
                    id: 'card-ionic',
                    type: 'digital',
                    title: 'Ionbinding Bouwer',
                    description: 'Zie hoe elektronen overdragen worden van metaal naar niet-metaal (NaCl, MgCl₂, AlCl₃).',
                    action: 'activity',
                    activityId: 'ionicBonding',
                    icon: 'PhAtom'
                },
                {
                    id: 'card-metal',
                    type: 'digital',
                    title: 'Metaalbinding: De Elektronenzee',
                    description: 'Ontdek hoe positieve ionen in een zee van vrije elektronen zweven.',
                    action: 'activity',
                    activityId: 'metalBonding',
                    icon: 'PhGridFour'
                },
                {
                    id: 'card-ArchimedesActivity',
                    type: 'digital',
                    title: 'Archimedes Labo',
                    description: 'Ontdek de wet van Archimedes met de PhET simulatie.',
                    action: 'external-link',
                    url: 'https://phet.colorado.edu/sims/html/buoyancy-basics/latest/buoyancy-basics_all.html',
                    icon: 'PhWaves'
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
                    title: 'Samenvatting: de drie bindingstypes',
            description: 'Overzicht: ionbinding (M+nM, elektronen overdragen), atoombinding (nM+nM, elektronen delen), metaalbinding (M+M, elektronenzee). Allemaal op weg naar edelgasconfiguratie.',
                    action: 'presentation',
                    slidesKey: 'summary_slides'
                },
                {
                    id: 'card-exit-ticket',
                    type: 'digital',
                    title: 'Exit Ticket',
            description: 'Maak de exit ticket individueel om je begrip van de drie bindingstypes te controleren.',
            action: 'exit-ticket'
                }
            ]
        }
    },

    hook_slides: [
        {
            layout: 'predict',
            title: 'Hoe los je een tekort op?',
            question: 'Bekijk de 3 situaties uit de Check In (p. 234). Welke oplossing hoort bij elke situatie?',
            context: 'Denk na over geven, samen gebruiken en afgeven.',
            hint: 'Klik om de link met chemie te onthullen',
            revealText: 'In de chemie gebeurt net hetzelfde. Situatie 1 (Kalvin en Fleur) = ionbinding. Situatie 2 (Jody en Jodi) = atoombinding. Situatie 3 (Ali en Alisson) = metaalbinding.'
        }
    ],

    theory_slides: [
        {
            layout: 'title',
            title: 'De drie bindingstypes',
            subtitle: 'Hoe atomen samenwerken om de edelgasconfiguratie te bereiken',
            badge: 'Theorie',
            icon: 'atom'
        },
        {
            layout: 'standard',
            title: 'De Kernvraag: Metaal of Niet-Metaal?',
            content: 'Welke atomen komen samen?<ul><li><strong>Metaal + niet-metaal:</strong> metaal staat elektronen af, niet-metaal neemt op, <strong><span class="text-violet-600">ionbinding</span></strong>.</li><li><strong>Niet-metaal + niet-metaal:</strong> beide delen elektronen, <strong><span class="text-sky-600">atoombinding</span></strong>.</li><li><strong>Metaal + metaal:</strong> elektronen worden gemeenschappelijk, <strong><span class="text-amber-600">metaalbinding</span></strong>.</li></ul>'
        },
        {
            layout: 'standard',
            title: 'Ionvorming: De Vuistregel',
            content: '<strong>Metalen (Ia, IIa, IIIa):</strong> staan elektronen af en vormen <strong>positieve ionen</strong> (kationen).<br><strong>Niet-metalen (VIa, VIIa):</strong> nemen elektronen op en vormen <strong>negatieve ionen</strong> (anionen).<br><br>Vuistregel: <em><span class="text-violet-600">ionbinding</span> = metaal + niet-metaal, <span class="text-sky-600">atoombinding</span> = niet-metaal + niet-metaal, <span class="text-amber-600">metaalbinding</span> = metaal + metaal</em>'
        },
        {
            layout: 'comparison',
            title: 'Overzicht van de bindingstypes',
            left: {
                title: 'Ionbinding',
                icon: 'magnet',
                content: '<strong>Wie:</strong> Metaal + niet-metaal<br><strong>Wat:</strong> Overdracht van elektronen<br><strong>Resultaat:</strong> Positieve en negatieve ionen, ionrooster.'
            },
            right: {
                title: 'Atoombinding',
                icon: 'share',
                content: '<strong>Wie:</strong> Niet-metaal + niet-metaal<br><strong>Wat:</strong> Delen van elektronen, gemeenschappelijk elektronenpaar<br><strong>Resultaat:</strong> Moleculen.'
            },
            bottom: {
                title: 'Metaalbinding',
                icon: 'package',
                content: '<strong>Wie:</strong> Metaal + metaal<br><strong>Wat:</strong> Afgeven van elektronen aan een "zee"<br><strong>Resultaat:</strong> Positieve ionen in een elektronenzee.'
            }
        }
    ],

    summary_slides: [
        {
            layout: 'title',
            title: 'Samenvatting les 1',
            subtitle: 'De drie bindingstypes op één overzicht',
            badge: 'Samenvatting',
            icon: 'check'
        },
        {
            layout: 'comparison',
            title: 'Alle drie de bindingstypes',
            left: {
                title: '<span class="text-violet-600">Ionbinding</span>',
                icon: 'magnet',
                content: '<strong>M + nM</strong><br>Elektronen <em>overdragen</em><br>Positieve en negatieve ionen<br>Vuistregel: Ia-VIIa metalen → kationen, VIa-VIIa niet-metalen → anionen<br><br><strong>Voorbeelden:</strong> NaCl, MgO, AlF₃'
            },
            right: {
                title: '<span class="text-sky-600">Atoombinding</span>',
                icon: 'share',
                content: '<strong>nM + nM</strong><br>Elektronen <em>delen</em><br>Gemeenschappelijk elektronenpaar<br>Resultaat: moleculen<br><br><strong>Voorbeelden:</strong> H₂, O₂, N₂, H₂O, CO₂'
            },
            bottom: {
                title: '<span class="text-amber-600">Metaalbinding</span>',
                icon: 'package',
                content: '<strong>M + M</strong><br>Elektronen <em>afgeven</em> aan gemeenschappelijke "zee"<br>Positieve ionen en elektronenzee<br>Resultaat: metaalrooster<br><br><strong>Voorbeelden:</strong> Fe, Cu, Al, brons'
            }
        }
    ],

    guided_slides: [
        {
            layout: 'title',
            title: 'Hoe los je deze oefeningen op?',
            subtitle: 'Stap-voor-stap aanpak voor de werkboekopgaven',
            badge: 'Begeleide Oefening',
            icon: 'lightbulb'
        },
        {
            layout: 'standard',
            title: 'Binding vs Verbinding',
            content: 'Voor Opdracht 4 (p. 239) moet je het verschil kennen:<br><br><strong>Verbinding</strong> = een stof die bestaat uit meerdere atomen of ionen (bijv. H₂O, NaCl, O₂).<br><strong>Binding</strong> = de aantrekkende kracht die de atomen of ionen in een verbinding samenhoudt (bijv. de lijn tussen H en O in water).<br><br>In een afbeelding met meerdere moleculen tel je:<ul><li><strong>Bindingen:</strong> het aantal lijnen tussen atomen.</li><li><strong>Unieke verbindingen:</strong> het aantal verschillende types moleculen.</li></ul>'
        },
        {
            layout: 'standard',
            title: 'De Beslisboom: Welk Bindingstype?',
            content: 'Voor Opdracht 5 en Aan de slag 2+3 volg je deze stappen:<br><br><strong>Stap 1:</strong> Bekijk de elementen in de verbinding.<br><strong>Stap 2:</strong> Is elk element een metaal (M) of niet-metaal (nM)?<br><strong>Stap 3:</strong> Pas de regel toe:<br><ul><li>M + nM → <strong>ionbinding</strong></li><li>nM + nM → <strong>atoombinding</strong></li><li>M + M → <strong>metaalbinding</strong></li></ul><br>Voorbeeld: <strong>NaCl</strong> → Na = metaal, Cl = niet-metaal → M + nM → <strong>ionbinding</strong>.'
        },
        {
            layout: 'standard',
            title: 'Hoe Lees Je een Formule?',
            content: 'Voor Aan de slag 3 (p. 240): 15 stoffen classificeren:<br><br><strong>Voorbeeld 1:</strong> C₃H₈ (propaan) → C = niet-metaal, H = niet-metaal → nM + nM → <strong>atoombinding</strong><br><strong>Voorbeeld 2:</strong> Fe (ijzer) → enkel metaal → <strong>metaalbinding</strong><br><strong>Voorbeeld 3:</strong> KBr → K = metaal, Br = niet-metaal → M + nM → <strong>ionbinding</strong><br><strong>Voorbeeld 4:</strong> SO₂ → S = niet-metaal, O = niet-metaal → nM + nM → <strong>atoombinding</strong><br><br>Tip: een enkel atoom van een metaal (Fe, Cu, Zn) → metaalbinding. Een enkel atoom van een niet-metaal in een molecuul (O₂, N₂, S₈) → atoombinding.'
        },
        {
            layout: 'recap',
            title: 'Check Jezelf',
            questions: [
                { q: 'Wat is het verschil tussen een binding en een verbinding?', a: 'Verbinding = de stof zelf (bv. H₂O). Binding = de kracht die de atomen samenhoudt.' },
                { q: 'Wat voor binding zit er in MgO?', a: 'Mg = metaal, O = niet-metaal → ionbinding' },
                { q: 'Wat voor binding zit er in N₂?', a: 'N = niet-metaal, N = niet-metaal → atoombinding' }
            ]
        }
    ],

    exitTicket: {
        questions: [
            { id: 'q1', type: 'mc', question: 'Een verbinding tussen Aluminium (metaal, groep IIIa) en Fluor (niet-metaal, groep VIIa) is een...', options: ['Ionbinding', 'Atoombinding', 'Metaalbinding'], correct: 0 },
            { id: 'q2', type: 'mc', question: 'Welk bindingstype verwacht je in een stuk koperdraad (Cu)?', options: ['Ionbinding', 'Atoombinding', 'Metaalbinding'], correct: 2 },
            { id: 'q3', type: 'mc', question: 'Welk bindingstype zit er in waterstofchloride (H en Cl, beide niet-metalen)?', options: ['Ionbinding', 'Atoombinding', 'Metaalbinding'], correct: 1 },
            { id: 'q4', type: 'juist-fout', question: 'Metalen vormen negatieve ionen door elektronen op te nemen.', correct: false },
            { id: 'q5', type: 'open', question: 'Leg uit waarom zuurstof (niet-metaal, 6 valentie-elektronen) een negatief ion vormt.' }
        ]
    }
}

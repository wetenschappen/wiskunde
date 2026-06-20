/**
 * 📘 NANDO 1 DEMO LES - COMPLEETE DEMONSTRATIE
 * 
 * Deze les demonstreert alle belangrijke functionaliteiten en
 * slide layouts van het lesplatform voor wiskunde in de 1ste graad.
 * 
 * Auteur: AI Coding Assistant
 * Datum: 2026-06-20
 * 
 */
export default {
  // 1. METADATA (required)
  id: 'nando1-demo',
  subject: 'math', // Always 'math' for this project
  className: '1ste Jaar Wiskunde',
  title: 'Demo Les: Basis Bewerkingen',
  description: 'Een uitgebreide demonstratie van wiskundige basisbewerkingen, slide layouts, activiteiten en interactieve elementen voor 1ste jaar wiskunde.',

  // 2. CONFIG (required)
  config: {
    groenCode: 'DEMO2025',
    groenAntwoord: 'wiskunde',
    masterCode: 'nando',
    classId: '1-Wiskunde',
    textbook: 'Nando 1 - Basisbewerkingen',
    cursusLink: 'https://albertshalaj.github.io/nando1-demo',
  },

  // 3. GOALS (recommended, array of strings)
  goals: [
    'Ik kan de vier basisbewerkingen (optellen, aftrekken, vermenigvuldigen, delen) toepassen.',
    'Ik ken de wiskundige symbolen en kan ze herkennen.',
    'Ik begrijp het verschil tussen natuurlijke en gehele getallen.',
    'Ik kan eenvoudige breuken vereenvoudigen.'
  ],

  // 4. WORKBOOK (required)
  workbook: {
    title: 'Werkboek Oefeningen',
    subtitle: 'Basisbewerkingen • Module Demo',
    instruction: '<p>Maak <strong>oefeningen 1 tot 8</strong> op pagina 15-18.</p><p>Gebruik <strong>rekenmachine toegestaan</strong> voor de moeilijkere opgaven.</p>',
    formulaHint: 'Denk aan de volgorde: haakjes → machtsverheffen → vermenigvuldigen/delen → optellen/aftrekken',
    exercises: [
      { nr: 'Oef 1', title: 'Optellen van natuurlijke getallen', page: 'p15' },
      { nr: 'Oef 2', title: 'Aftrekken tot 1000', page: 'p15' },
      { nr: 'Oef 3', title: 'Vermenigvuldigen met tientallen', page: 'p16' },
      { nr: 'Oef 4', title: 'Delen met rest', page: 'p16' },
      { nr: 'Oef 5', title: 'Negatieve getallen op de getallenas', page: 'p17' },
      { nr: 'Oef 6', title: 'Breuken vereenvoudigen', page: 'p17' },
      { nr: 'Oef 7', title: 'Gemengde bewerkingen', page: 'p18' },
      { nr: 'Oef 8', title: 'Eindtoets basisvaardigheden', page: 'p18' }
    ]
  },

  // 5. TIMELINE (required)
  timeline: {
    // STEP A: Instap & Voorkennis
    stepA: {
      step: 'A',
      title: 'Diagnostisch & Instap',
      time: '15 min',
      cards: [
        {
          id: 'card-entry',
          type: 'digital',
          title: 'Starttoets Voorkennis',
          description: 'Test je voorkennis met 3 meerkeuzevragen.',
          action: 'entry-ticket',
          icon: 'PhQuestion'
        },
        {
          id: 'card-pres-a',
          type: 'class',
          title: 'Inleidende Presentatie',
          description: 'Herhaling van basisbewerkingen en simbolen.',
          action: 'presentation',
          slidesKey: 'slidesA'
        }
      ]
    },
    
    // STEP B: Verwerken - Actieve oefeningen
    stepB: {
      step: 'B',
      title: 'Actieve Verwerking',
      time: '35 min',
      cards: [
        {
          id: 'card-pres-b',
          type: 'class',
          title: 'Uitgebreide Theorie',
          description: 'Uitgebreide uitleg met voorbeelden en oefeningen.',
          action: 'presentation',
          slidesKey: 'slidesB'
        },
        {
          id: 'card-workbook',
          type: 'paper',
          title: 'Werkboek Oefeningen',
          description: 'Maak de opgaven uit het werkboek.',
          action: 'workbook',
          icon: 'PhBookOpen'
        },
        {
          id: 'card-activities',
          type: 'digital',
          title: 'Interactieve Oefeningen',
          description: 'Doe mee met de online activiteiten.',
          action: 'activity',
          activityId: 'dragDrop'
        },
        {
          id: 'card-activity2',
          type: 'digital',
          title: 'Symbool Training',
          description: 'Herken en gebruik wiskundige symbolen.',
          action: 'activity',
          activityId: 'symbolDrill'
        }
      ],
      extraActivities: [
        {
          id: 'spotCheckDemo',
          title: 'Snelle Check',
          category: 'Evaluatie',
          icon: 'PhCheckCircle'
        },
        {
          id: 'hotspotVisual',
          title: 'Symbolen in Beeld',
          category: 'Visual',
          icon: 'PhImageSquare'
        }
        ]
    },
    
    // STEP C: Samenvatting & Afsluiting
    stepC: {
      step: 'C',
      title: 'Samenvatting & Exit',
      time: '10 min',
      cards: [
        {
          id: 'card-pres-c',
          type: 'class',
          title: 'Samenvatting Kernpunten',
          description: 'Overzicht van belangrijke begrippen en procedures.',
          action: 'presentation',
          slidesKey: 'slidesC'
        },
        {
          id: 'card-exit',
          type: 'digital',
          title: 'Afsluitende Toets',
          description: 'Reflecteer op wat je geleerd hebt.',
          action: 'exit-ticket',
          icon: 'PhTrophy'
        }
      ]
    }
  },

  // 6. ACTIVITIES (required if cards reference them)
  activities: {
    dragDrop: {
      type: 'dragDrop',
      title: 'Match de Wiskundige Begrippen',
      instruction: 'Sleep elk begrip naar de juiste definitie. Let op minimaal 4 paren vereist!',
      pairs: [
        { term: 'Optellen', definition: 'Het samenvoegen van twee of meer getallen tot één som' },
        { term: 'Aftrekken', definition: 'Het bepalen van het verschil tussen twee getallen' },
        { term: 'Vermenigvuldigen', definition: 'Herhaald optellen van hetzelfde getal een bepaald aantal keer' },
        { term: 'Delen', definition: 'Een getal verdelen in gelijke delen of het aantal gelijke delingen bepalen' },
        { term: 'Breuk', definition: 'Een deel van een geheel, weergegeven als teller en noemer, gescheiden door een breukstreep' },
        { term: 'Negatief getal', definition: 'Een getal kleiner dan nul, vaak gebruikt voor schulden of afnames' },
        { term: 'Variabele', definition: 'Een symbool dat een onbekend getal of een veranderlijke hoeveelheid voorstelt' },
        { term: '=', definition: 'Het gelijkheidsteken, gebruikt om twee waarden aan elkaar gelijk te stellen' }
      ]
    },
    
    symbolDrill: {
      type: 'symbolDrill',
      title: 'Symbool Oefening',
      instruction: 'Typ de juiste symbolen in de zinnen. Voorbeeld: "5 ___ 3 = 8"',
      questions: [
        { sentence: 'Het teken voor optellen is ___ of ___.', answer: '+', hint: 'Een plus zonder verticale lijn' },
        { sentence: 'Het teken voor aftrekken is ___.', answer: '-', hint: 'Een min' },
        { sentence: 'Het teken voor vermenigvuldigen is ___ of ___.', answer: '×', hint: 'Een kruis of punt' },
        { sentence: 'Het teken voor deel is ___ of ___.', answer: '÷', hint: 'Een dubbele punt of breukstreep' },
        { sentence: 'Het gelijkheidsteken is ___.', answer: '=', hint: 'Twee horizontale streepjes' },
        { sentence: 'Het ongelijkheidsteken "groter dan" is ___.', answer: '>', hint: 'Een punt links, pijl rechts' },
        { sentence: 'Het ongelijkheidsteken "kleiner dan" is ___.', answer: '<', hint: 'Een punt rechts, pijl links' }
      ]
    },
    
    realNumbers: {
      type: 'realNumbers',
      title: 'Rekenen met Getallen',
      instruction: 'Doe de volgende berekeningen in je hoofd en schrijf de antwoorden op.'
    },
    
    hotspot: {
      type: 'hotspot',
      title: 'Kenteken Herkennen',
      instruction: 'Klik op het juiste wiskundige symbool in deze afbeelding met basisbewerkingen.'
    }
  },

  // 7. SLIDE ARRAYS (one per slidesKey used in timeline cards)
  slidesA: [
    {
      layout: 'title',
      title: 'Module: Basisbewerkingen',
      subtitle: 'Een demo van alle wiskundige basisvaardigheden',
      badge: 'Wiskunde 1',
      icon: 'function'
    },
    {
      layout: 'hero',
      title: 'De Wereld van Getallen',
      subtitle: 'Optellen, aftrekken, vermenigvuldigen en delen omringen ons elke dag',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db646?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      credit: 'Unsplash - Matemática'
    },
    {
      layout: 'steps',
      title: 'Wat Ga Je Leren?',
      steps: [
        { icon: 'plus', text: 'Optellen van natuurlijke en gehele getallen' },
        { icon: 'minus', text: 'Aftrekken met en zonder lenen' },
        { icon: 'x', text: 'Vermenigvuldigen met tientallen en honderdtallen' },
        { icon: 'divide', text: 'Delen met en zonder rest' },
        { icon: 'fraction', text: 'Breuken vereenvoudigen en vergelijken' },
        { icon: 'number-circle-four', text: 'Negatieve getallen op de getallenas' }
      ]
    },
    {
      layout: 'standard',
      title: 'De Vier Basisbewerkingen',
      content: '<p>Er zijn vier fundamentele wiskundige bewerkingen:</p><p><strong>Optellen (+)</strong> - Samenvoegen van getallen<br><strong>Aftrekken (-)</strong> - Verschil bepalen tussen getallen<br><strong>Vermenigvuldigen (×)</strong> - Herhaald optellen<br><strong>Delen (÷)</strong> - Verdelen in gelijke delen</p><p>\\( 3 + 5 = 8 \\)<br>\\( 10 - 4 = 6 \\)<br>\\( 2 \\times 7 = 14 \\)<br>\\( 20 \\div 4 = 5 \\)</p>'
    },
    {
      layout: 'equation',
      title: 'Belangrijke Formules',
      equation: 'Som = Term + Term\nVerschil = Minuend - Subtrahend\nProduct = Factor × Factor\nQuotiënt = Deeltal ÷ Deler',
      parts: [
        { label: 'Bewerking', items: ['Optellen', 'Aftrekken', 'Vermenigvuldigen', 'Delen'], color: 'amber' },
        { label: 'Termen/Factoren', items: ['Naam van de getallen in de bewerking'], color: 'violet' },
        { label: 'Uitkomst', items: ['Resultaat van de bewerking'], color: 'emerald' }
      ]
    },
    {
      layout: 'multichoice',
      title: 'Snelle Kennistest',
      question: 'Wat is het resultaat van \\( 8 \\times 7 \\)?',
      options: [
        { id: 'A', text: '48', correct: false },
        { id: 'B', text: '56', correct: true },
        { id: 'C', text: '64', correct: false },
        { id: 'D', text: '72', correct: false }
      ],
      explanation: '8 × 7 = 56. Dit is basisvermenigvuldiging.'
    },
    {
      layout: 'realworld',
      title: 'Wiskunde in het Dagelijks Leven',
      cause: 'Optellen en vermenigvuldigen worden dagelijks gebruikt',
      consequence: 'Bijvoorbeeld bij boodschappen doen, koken of budgetten maken',
      takeaway: 'Basisbewerkingen zijn essentieel voor elke rekenkundige vaardigheid'
    }
  ],

  slidesB: [
    {
      layout: 'standard',
      title: 'Natuurlijke Getallen \\( \\mathbb{N} \\)',
      content: '\\( \\mathbb{N} = \\{0, 1, 2, 3, \\ldots\\} \\)<br><br>Dit zijn de getallen die we gebruiken voor tellen. Ze beginnen altijd bij nul en gaan oneindig door.'
    },
    {
      layout: 'standard',
      title: 'Gehele Getallen \\( \\mathbb{Z} \\)',
      content: '\\( \\mathbb{Z} = \\{\\ldots, -2, -1, 0, 1, 2, \\ldots\\} \\)<br><br>Deze getallen stellen zowel positieve als negatieve hoeveelheden voor. Ze omvatten alle natuurlijke getallen plus hun negatieven.'
    },
    {
      layout: 'big',
      title: 'Getallenas',
      content: 'Positieve getallen → Rechts van de nul<br>Negatieve getallen → Links van de nul<br>Nul → Het startpunt',
      subtext: 'De getallenas helpt bij het lokaliseren van getallen'
    },
    {
      layout: 'comparison',
      title: 'Optellen vs Aftrekken',
      leftTitle: 'Optellen',
      leftContent: 'Samenvoegen van twee of meer getallen tot één som.',
      leftExample: '\\( 5 + 3 = 8 \\) en \\( 12 + 7 = 19 \\)',
      rightTitle: 'Aftrekken',
      rightContent: 'Het bepalen van het verschil tussen twee getallen.',
      rightExample: '\\( 8 - 3 = 5 \\) en \\( 19 - 7 = 12 \\)'
    },
    {
      layout: 'comparison',
      title: 'Vermenigvuldigen vs Delen',
      leftTitle: 'Vermenigvuldigen',
      leftContent: 'Herhaald optellen van hetzelfde getal een bepaald aantal keer.',
      leftExample: '\\( 4 \\times 6 = 24 \\)',
      rightTitle: 'Delen',
      rightContent: 'Een getal verdelen in gelijke delen.',
      rightExample: '\\( 24 \\div 6 = 4 \\)'
    },
    {
      layout: 'worked-example',
      title: 'Voorbeeld: Gemengde Bewerkingen',
      problem: 'Bereken \\( 8 + (3 \\times 2) - 5 \\)',
      steps: [
        { action: 'Stap 1 — Haakjes eerst', result: '\\( 3 \\times 2 = 6 \\)' },
        { action: 'Stap 2 — Nu optellen en aftrekken', result: '\\( 8 + 6 - 5 \\)' },
        { action: 'Stap 3 — Van links naar rechts', result: '\\( 14 - 5 \\)' }
      ],
      answer: '\\( = 9 \\)'
    },
    {
      layout: 'value-table',
      title: 'Breuken als Decimalen',
      formula: '\\( f(x) = \\frac{1}{x} \\)',
      xLabel: 'x (noemer)',
      yLabel: 'f(x)',
      rows: [
        { x: '1', y: '\\( 1 \\)' },
        { x: '2', y: '\\( 0{,}5 \\)' },
        { x: '4', y: '\\( 0{,}25 \\)' },
        { x: '5', y: '\\( 0{,}2 \\)' },
        { x: '10', y: '\\( 0{,}1 \\)' }
      ],
      note: 'Hoe groter de noemer, hoe kleiner de waarde van de breuk.'
    },
    {
      layout: 'properties',
      title: 'Basisbewerkingen: Eigenschappen',
      properties: [
        'Optellen is commutatief: \\( 5 + 3 = 3 + 5 \\)',
        'Vermenigvuldigen is commutatief: \\( 4 \\times 6 = 6 \\times 4 \\)',
        'Optellen en vermenigvuldigen zijn associatief: \\( (2+3)+4 = 2+(3+4) \\)',
        'Delen is <strong>niet</strong> commutatief: \\( 10 \\div 2 \\neq 2 \\div 10 \\)'
      ]
    }
  ],

  slidesC: [
    {
      layout: 'summary',
      title: 'Samenvatting Basisbewerkingen',
      items: [
        'Natuurlijke getallen \\( \\mathbb{N} \\) beginnen bij 0',
        'Gehele getallen \\( \\mathbb{Z} \\) omvatten negatieve getallen',
        'De vier basisbewerkingen zijn: optellen, aftrekken, vermenigvuldigen, delen',
        'Voer bewerkingen uit in de juiste volgorde: haakjes → ×/÷ → +/−',
        'Breuken kunnen vereenvoudigd worden door teller en noemer te delen door hun GGD'
      ]
    },
    {
      layout: 'attention',
      title: 'Let Op!',
      content: 'Een veelgemaakte fout is het verwarren van vermenigvuldigen met optellen. Vergeet niet: \\( 5 \\times 3 \\) is niet hetzelfde als \\( 5 + 3 \\)!'
    },
    {
      layout: 'summary',
      title: 'Belangrijke Symbolen',
      items: [
        'Optellen: \\( + \\)',
        'Aftrekken: \\( - \\)',
        'Vermenigvuldigen: \\( \\times \\)',
        'Delen: \\( \\div \\)',
        'Gelijk: \\( = \\)',
        'Ongelijk: \\( \\neq \\)'
      ]
    },
    {
      layout: 'celebration',
      title: 'Goed Gedaan!',
      subtitle: 'Je hebt alle basisbewerkingen herhaald en geoefend.',
      stats: [
        { label: 'Aantal slides', value: '16' },
        { label: 'Interactieve elementen', value: '4+' },
        { label: 'Oefeningen gemaakt', value: '8/8' },
        { label: 'Succespercentage', value: '95%' }
      ]
    }
  ],

  // 8. TICKETS (Entry + Exit)
  entryTicket: {
    questions: [
      {
        id: 'en1',
        type: 'mc',
        question: 'Wat is 7 + 5?',
        options: ['10', '12', '13', '14'],
        correct: 1
      },
      {
        id: 'en2',
        type: 'mc',
        question: 'Wat betekent het symbool × in de wiskunde?',
        options: ['Optellen', 'Aftrekken', 'Vermenigvuldigen', 'Delen'],
        correct: 2
      },
      {
        id: 'en3',
        type: 'mc',
        question: 'Welk getal is groter dan nul?',
        options: ['-4', '0', '-1', '3'],
        correct: 3
      },
      {
        id: 'en4',
        type: 'open',
        question: 'Leg in je eigen woorden uit wat het verschil is tussen natuurlijke en gehele getallen.',
        description: 'Gebruik volledige zinnen en geef voorbeelden.'
      }
    ]
  },

  exitTicket: {
    questions: [
      {
        id: 'ep1',
        type: 'mc',
        question: 'Wat is het resultaat van 15 - 8?',
        options: ['5', '6', '7', '8'],
        correct: 2
      },
      {
        id: 'ep2',
        type: 'mc',
        question: 'Hoeveel is 6 × 4?',
        options: ['20', '24', '28', '30'],
        correct: 1
      },
      {
        id: 'ep3',
        type: 'open',
        question: 'Waarom zijn basisbewerkingen belangrijk voor wiskunde?',
        description: 'Geef minimaal twee redenen en gebruik voorbeelden.'
      },
      {
        id: 'ep4',
        type: 'open',
        question: 'Welke nieuwe dingen heb je vandaag geleerd die je nog niet wist?',
        description: 'Wees specifiek en schrijf in volledige zinnen.'
      }
    ]
  },

  // 9. SPOT CHECK (optional)
  spotCheck: {
    questions: [
      { question: 'Wat is 9 + 6?', answer: '15' },
      { question: 'Wat is 18 - 7?', answer: '11' },
      { question: 'Wat is 5 × 8?', answer: '40' },
      { question: 'Wat is 21 ÷ 3?', answer: '7' },
      { question: 'Vereenvoudig 12/18', answer: '2/3' }
    ]
  }
};
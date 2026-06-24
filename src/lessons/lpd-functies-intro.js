/**
 * 📘 LPD FUNCTIES INTRO - 3de Jaar (D-finaliteit 5u)
 * 
 * Eerste kennismaking met het begrip "functie".
 * Gebaseerd op VBTL 3 - H2: Reële functies (2.1-2.2)
 *
 * Lesduur: 50 minuten
 *
 * Bronnen:
 *   - VBTL 3 D5: Getallen, eerstegraadsfuncties en analytische meetkunde
 *     → H2: Reële functies (p. 90-135)
 *   - Nando 3 D5: Module 6 + Module 8 (functies en verbanden)
 *
 * Opbouw:
 *   A: Instap (10 min) — functiemachine ontdekken
 *   B: Verwerking (25 min) — theorie + interactieve activiteit
 *   C: Afsluiting (15 min) — toepassing + exit ticket
 */
export default {
  id: 'lpd-functies-intro',
  subject: 'math',
  className: '3de Jaar - D-finaliteit 5u',
  title: 'Introductie: Het Functiebegrip',
  description: 'Kennismaking met het functiebegrip via de functiemachine, grafieken en verbanden tussen grootheden. Gebaseerd op VBTL 3 H2.1–2.2.',

  config: {
    groenCode: 'FUNCTIE2026',
    groenAntwoord: 'f(x) = y',
    masterCode: 'nando',
    classId: '3-Wiskunde-D5',
    textbook: 'VBTL 3 D5 - H2: Reële functies (p. 90-135)',
    cursusLink: 'https://albertshalaj.github.io/lpd-functies-intro',
  },

  goals: [
    'Ik begrijp het functiebegrip als een "machine": elke input geeft precies één output.',
    'Ik kan het verschil uitleggen tussen een recht evenredig, omgekeerd evenredig en kwadratisch verband.',
    'Ik kan een functie herkennen in tabel, grafiek en formule.',
    'Ik kan het domein en bereik van een eenvoudige functie bepalen.',
    'Ik kan een eerstegraadsfunctie f(x) = ax + b herkennen en de grafiek interpreteren.'
  ],

  workbook: {
    title: 'Werkboek Oefeningen',
    subtitle: 'Functies • Module Introductie',
    instruction: '<p>Maak <strong>oefeningen 1 tot 6</strong> op pagina 99-103 (VBTL 3).</p><p>Gebruik <strong>potlood en ruitjespapier</strong> om grafieken te tekenen.</p>',
    formulaHint: 'Een functie voegt aan elke x-waarde precies één y-waarde toe. Vraag je steeds af: "Hangt y af van x?"',
    exercises: [
      { nr: 'Oef 1', title: 'Verbanden herkennen (tabel → grafiek)', page: 'p99' },
      { nr: 'Oef 2', title: 'Recht evenredig vs omgekeerd evenredig', page: 'p100' },
      { nr: 'Oef 3', title: 'Functiemachine: input → output', page: 'p101' },
      { nr: 'Oef 4', title: 'Domein en bereik aflezen uit grafiek', page: 'p102' },
      { nr: 'Oef 5', title: 'Eerstegraadsfunctie f(x) = ax + b', page: 'p103' },
      { nr: 'Oef 6', title: 'Toepassing: zwemclubtarief (VBTL p140)', page: 'p104' }
    ]
  },

  timeline: {
    // STEP A: Instap — 10 min
    stepA: {
      step: 'A',
      title: 'Instap: De Functiemachine',
      time: '10 min',
      cards: [
        {
          id: 'card-entry',
          type: 'digital',
          title: 'Starttoets: Wat weet je al over verbanden?',
          description: '3 vragen over evenredigheden en grafieken.',
          action: 'entry-ticket',
          icon: 'PhQuestion'
        },
        {
          id: 'card-pres-a',
          type: 'class',
          title: 'Introductie: Verbanden in het dagelijks leven',
          description: 'Van waterkraan tot BMI — waar zie jij verbanden? Aan de hand van VBTL 3 H2.1.',
          action: 'presentation',
          slidesKey: 'slidesA'
        }
      ]
    },

    // STEP B: Verwerking — 25 min
    stepB: {
      step: 'B',
      title: 'Actieve Verwerking',
      time: '25 min',
      cards: [
        {
          id: 'card-pres-b',
          type: 'class',
          title: 'Theorie: Het functiebegrip',
          description: 'Definitie, functiemachine, domein en bereik. Gebaseerd op VBTL 3 H2.2.',
          action: 'presentation',
          slidesKey: 'slidesB'
        },
        {
          id: 'card-activity',
          type: 'digital',
          title: 'Interactieve Functiemachine',
          description: 'Zie zelf hoe een functie input omzet naar output. Test f(x) = 2x + 1 en f(x) = x².',
          action: 'activity',
          activityId: 'functionMachine'
        },
        {
          id: 'card-workbook',
          type: 'paper',
          title: 'Werkboek: Verbanden en functies',
          description: 'Maak oefeningen 1-4 uit het werkboek. Teken de grafieken in je schrift.',
          action: 'workbook',
          icon: 'PhBookOpen'
        }
      ],
      extraActivities: [
        {
          id: 'verbandenQuiz',
          title: 'Welk verband is het?',
          category: 'Herkenning',
          icon: 'PhGraph'
        },
        {
          id: 'domeinBereik',
          title: 'Domein & Bereik',
          category: 'Toepassen',
          icon: 'PhTarget'
        }
      ]
    },

    // STEP C: Afsluiting — 15 min
    stepC: {
      step: 'C',
      title: 'Afsluiting & Toepassing',
      time: '15 min',
      cards: [
        {
          id: 'card-pres-c',
          type: 'class',
          title: 'Samenvatting: Van verband naar functie',
          description: 'Overzicht van verbanden (recht evenredig, omgekeerd evenredig, kwadratisch) en het functiebegrip.',
          action: 'presentation',
          slidesKey: 'slidesC'
        },
        {
          id: 'card-zwemclub',
          type: 'digital',
          title: 'Toepassing: Zwemclubtarief (VBTL p140)',
          description: 'Bereken het zwemclubtarief met en zonder lidgeld. Wat verandert er aan de grafiek?',
          action: 'activity',
          activityId: 'zwemclubTarief'
        },
        {
          id: 'card-exit',
          type: 'digital',
          title: 'Exit Ticket: Wat is een functie?',
          description: '5 vragen om te checken of je het functiebegrip beheerst.',
          action: 'exit-ticket',
          icon: 'PhTrophy'
        }
      ]
    }
  },

  // ACTIVITIES
  activities: {
    functionMachine: {
      type: 'functionMachine',
      title: '🧮 De Functiemachine',
      instruction: 'Voer een getal in de machine. Zie hoe de functie het omzet naar een output. Welk patroon zie je?'
    },

    zwemclubTarief: {
      type: 'functionMachine',
      title: '🏊 Zwemclub: met of zonder lidgeld?',
      instruction: 'Vorig jaar: €0,50 per zwembeurt. Dit jaar: €3 lidgeld + €0,50 per beurt. Vergelijk de functies!'
    },

    verbandenQuiz: {
      type: 'mixedRetrieval',
      title: 'Welk Verband Herken Je?',
      questions: [
        { q: 'Een kraan lekt 0,6 liter per dag. Het verband tussen dagen en liters is...', a: ['Recht evenredig', 'Omgekeerd evenredig', 'Kwadratisch', 'Geen verband'], c: 0 },
        { q: 'Oppervlakte van een vierkant = z². Het verband tussen zijde z en oppervlakte A is...', a: ['Recht evenredig', 'Omgekeerd evenredig', 'Kwadratisch', 'Lineair'], c: 2 },
        { q: 'Bij een parallellogram met A = 20 dm²: basis × hoogte = 20. Dit verband is...', a: ['Recht evenredig', 'Omgekeerd evenredig', 'Kwadratisch', 'Constant'], c: 1 },
        { q: 'Een functie voegt aan elke x-waarde toe:', a: ['Precies één y-waarde', 'Meerdere y-waarden', 'Geen y-waarde', 'Een x-waarde'], c: 0 },
        { q: 'De BMI bereken je met massa/(lengte)². Dit is een...', a: ['Lineair verband', 'Kwadratisch verband', 'Hyperbolisch verband', 'Constant verband'], c: 1 }
      ]
    },

    domeinBereik: {
      type: 'hotspot',
      title: 'Domein & Bereik Verkennen',
      instruction: 'Klik op de gemarkeerde punten in de grafiek om meer te leren over domein en bereik.',
      graphConfig: {
        domain: [-4, 4],
        range: [-2, 8],
        functions: [
          { expr: 'x^2 - 1', color: '#F97316' }
        ],
        points: [
          { x: 0, y: -1, label: 'T', color: '#0f172a' }
        ]
      },
      hotspots: [
        {
          x: 0, y: -1,
          title: 'Minimum: T(0, −1)',
          content: 'Het <strong>bereik</strong> van f(x) = x² − 1 is [−1, +∞[. De functie kan nooit kleiner dan −1 worden.<br><br>Het <strong>domein</strong> is R (alle reële getallen) — je kunt eender welk getal in de machine stoppen.',
          color: 'amber'
        },
        {
          x: 1, y: 0,
          title: 'Nulpunt: x = 1',
          content: 'Een <strong>nulpunt</strong> is een x-waarde waarvoor f(x) = 0. Hier: f(1) = 1² − 1 = 0.<br><br>Nulwaarden vind je door f(x) = 0 op te lossen.',
          color: 'emerald'
        },
        {
          x: -2, y: 3,
          title: 'Een punt op de grafiek',
          content: 'f(−2) = (−2)² − 1 = 4 − 1 = 3.<br><br>Elk punt (x, f(x)) op de grafiek stelt een input-output paar voor van de functiemachine.',
          color: 'blue'
        }
      ]
    }
  },

  // SLIDES
  slidesA: [
    {
      layout: 'title',
      title: 'Introductie: Verbanden',
      subtitle: 'Hoe hangen grootheden samen?',
      badge: 'VBTL 3 — H2.1',
      icon: 'function'
    },
    {
      layout: 'hero',
      title: 'Verbanden Omringen Ons',
      subtitle: 'Van waterrekening tot groeicurve — overal zit wiskunde achter',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      credit: 'Unsplash - Wiskunde'
    },
    {
      layout: 'standard',
      title: 'Voorbeeld 1: De lekkende kraan (VBTL p93)',
      content: '<p>Een waterkraan lekt 0,6 liter per dag.</p><p><strong>Tabel:</strong></p><table class="w-full text-sm border-collapse"><tr><td class="p-2 border">dagen</td><td class="p-2 border">1</td><td class="p-2 border">2</td><td class="p-2 border">3</td><td class="p-2 border">4</td><td class="p-2 border">5</td><td class="p-2 border">6</td></tr><tr><td class="p-2 border">liter</td><td class="p-2 border">0,6</td><td class="p-2 border">1,2</td><td class="p-2 border">1,8</td><td class="p-2 border">2,4</td><td class="p-2 border">3,0</td><td class="p-2 border">3,6</td></tr></table><p><strong>Formule:</strong> W = 0,6 · t (recht evenredig)</p><p>Het quotiënt W/t is altijd 0,6 — constant!</p>'
    },
    {
      layout: 'standard',
      title: 'Voorbeeld 2: Parallellogram (VBTL p94)',
      content: '<p>Een parallellogram heeft oppervlakte 20 dm².</p><p><strong>Tabel:</strong></p><table class="w-full text-sm border-collapse"><tr><td class="p-2 border">basis (dm)</td><td class="p-2 border">1</td><td class="p-2 border">2</td><td class="p-2 border">4</td><td class="p-2 border">5</td><td class="p-2 border">10</td><td class="p-2 border">20</td></tr><tr><td class="p-2 border">hoogte (dm)</td><td class="p-2 border">20</td><td class="p-2 border">10</td><td class="p-2 border">5</td><td class="p-2 border">4</td><td class="p-2 border">2</td><td class="p-2 border">1</td></tr></table><p><strong>Formule:</strong> h = 20/b (omgekeerd evenredig)</p><p>Het product b · h is altijd 20 — constant!</p>'
    },
    {
      layout: 'realworld',
      title: 'Soorten Verbanden',
      cause: 'Recht evenredig: y = k·x (rechte door oorsprong)',
      consequence: 'Omgekeerd evenredig: y = k/x (hyperbooltak)',
      takeaway: 'Kwadratisch verband: y = k·x² (parabooltak) — zoals remweg en snelheid!'
    }
  ],

  slidesB: [
    {
      layout: 'title',
      title: 'Het Functiebegrip',
      subtitle: 'Van verband naar functie — de functiemachine',
      badge: 'VBTL 3 — H2.2',
      icon: 'function'
    },
    {
      layout: 'steps',
      title: 'De Functiemachine',
      steps: [
        { icon: 'plus', text: 'STOP een getal in de machine (input = x)' },
        { icon: 'arrow-right', text: 'De machine voert een bewerking uit (bv. verdubbelen)' },
        { icon: 'check', text: 'ER KOMT precies één getal uit (output = f(x))' },
        { icon: 'graph', text: 'Elk (x, f(x))-koppel is een punt op de grafiek' }
      ]
    },
    {
      layout: 'equation',
      title: 'Notatie van een Functie',
      equation: 'f : x → ax + b\nof\nf(x) = ax + b\nmet a ∈ R₀ en b ∈ R',
      parts: [
        { label: 'f', items: ['naam van de functie'], color: 'amber' },
        { label: 'x', items: ['input (onafhankelijke variabele)'], color: 'violet' },
        { label: 'f(x)', items: ['output = beeld van x (afhankelijke variabele)'], color: 'emerald' }
      ]
    },
    {
      layout: 'comparison',
      title: 'Domein vs Bereik',
      leftTitle: 'Domein',
      leftContent: 'Alle getallen die je IN de functiemachine mag stoppen.',
      leftExample: 'f(x) = 1/x: domein = R₀ (x=0 kan niet!)',
      rightTitle: 'Bereik',
      rightContent: 'Alle getallen die eruit kunnen komen.',
      rightExample: 'f(x) = x²: bereik = [0, +∞[ (kwadraat is nooit negatief)'
    },
    {
      layout: 'standard',
      title: 'Voorbeeld: f(x) = 2x + 1',
      content: '<table class="w-full text-sm border-collapse"><tr><td class="p-2 border font-bold">x</td><td class="p-2 border">-2</td><td class="p-2 border">-1</td><td class="p-2 border">0</td><td class="p-2 border">1</td><td class="p-2 border">2</td><td class="p-2 border">3</td></tr><tr><td class="p-2 border font-bold">f(x)</td><td class="p-2 border">-3</td><td class="p-2 border">-1</td><td class="p-2 border">1</td><td class="p-2 border">3</td><td class="p-2 border">5</td><td class="p-2 border">7</td></tr></table><p><strong>Berekening:</strong> x = 2 → 2·2 + 1 = 5. Elk x geeft precies één y.</p><p>De grafiek is een <strong>rechte</strong> met rico 2 en snijpunt y-as (0,1).</p>'
    },
    {
      layout: 'worked-example',
      title: 'Voorbeeld: Van tabel naar functie',
      problem: 'Gegeven de tabel hieronder. Is dit een functie? Wat is het voorschrift?',
      steps: [
        { action: 'Stap 1 — Controleer of elke x één y heeft', result: 'Ja: elk x-nummer komt 1x voor.' },
        { action: 'Stap 2 — Zoek het verschil in y', result: 'Bij x +1 hoort y +2. Dus a = 2.' },
        { action: 'Stap 3 — Zoek b (y bij x=0)', result: 'f(0) = 1, dus b = 1.' }
      ],
      answer: 'f(x) = 2x + 1'
    },
    {
      layout: 'value-table',
      title: 'Eerstegraadsfunctie: f(x) = ax',
      formula: 'f(x) = a·x',
      xLabel: 'x',
      yLabel: 'f(x) = a·x',
      rows: [
        { x: '0', y: '0' },
        { x: '1', y: 'a (rico)' },
        { x: '2', y: '2a' },
        { x: '3', y: '3a' }
      ],
      note: 'a > 0 → stijgend. a < 0 → dalend. Hoe groter |a|, hoe steiler.'
    }
  ],

  slidesC: [
    {
      layout: 'summary',
      title: 'Samenvatting: Verbanden & Functies',
      items: [
        'Een functie is een machine: elke x geeft precies één f(x).',
        'Domein = alle toegestane inputs. Bereik = alle mogelijke outputs.',
        'Recht evenredig: y = k·x (rechte door oorsprong)',
        'Omgekeerd evenredig: y = k/x (hyperbooltak)',
        'Kwadratisch verband: y = k·x² (parabooltak)',
        'Eerstegraadsfunctie: f(x) = ax + b (rico a, snijpunt y-as in b)'
      ]
    },
    {
      layout: 'attention',
      title: 'Let Op!',
      content: 'Niet elk verband is een functie! Een functie geeft bij elke x PRECIES ÉÉN y-waarde. Bij een cirkel bijvoorbeeld horen bij x = 0 twee y-waarden (y = r en y = −r) — dat is geen functie!'
    },
    {
      layout: 'comparison',
      title: 'Zwemclub: Met vs Zonder Lidgeld (VBTL p140)',
      leftTitle: 'Vorig jaar: f(x) = 0,5x',
      leftContent: 'Geen lidgeld. Per zwembeurt €0,50.',
      leftExample: '10 beurten = €5\n20 beurten = €10',
      rightTitle: 'Dit jaar: g(x) = 0,5x + 3',
      rightContent: '€3 lidgeld + €0,50 per beurt.',
      rightExample: '10 beurten = €8\n20 beurten = €13'
    },
    {
      layout: 'summary',
      title: 'Belangrijke Begrippen',
      items: [
        'Variabele: grootheid die kan veranderen (x en y)',
        'Onafhankelijke variabele: x (input)',
        'Afhankelijke variabele: y of f(x) (output)',
        'Richtingscoëfficiënt (rico): a in f(x) = ax + b',
        'Nulpunt: x-waarde waarvoor f(x) = 0'
      ]
    },
    {
      layout: 'celebration',
      title: 'Goed Gewerkt!',
      subtitle: 'Je hebt vandaag geleerd wat een functie is en hoe je verbanden herkent.',
      stats: [
        { label: 'Nieuwe begrippen', value: '8' },
        { label: 'Soorten verbanden', value: '3' },
        { label: 'Interactieve oefeningen', value: '2+' },
        { label: 'Oefeningen in werkboek', value: '6/6' }
      ]
    }
  ],

  // ENTRY & EXIT TICKETS
  entryTicket: {
    questions: [
      {
        id: 'en1',
        type: 'mc',
        question: 'Wat is 12 × 3?',
        options: ['15', '24', '36', '48'],
        correct: 2
      },
      {
        id: 'en2',
        type: 'mc',
        question: 'Als 1 kg appels €2 kost, hoeveel kost 3 kg?',
        options: ['€4', '€5', '€6', '€8'],
        correct: 2
      },
      {
        id: 'en3',
        type: 'mc',
        question: 'Wat is het verband tussen zijde en omtrek van een vierkant?',
        options: ['O = z²', 'O = 4z', 'O = z/4', 'O = 2z'],
        correct: 1
      },
      {
        id: 'en4',
        type: 'open',
        question: 'Wat denk je dat een "functie" is in de wiskunde?',
        description: 'Schrijf je eigen uitleg. Een voorbeeld mag.'
      }
    ]
  },

  exitTicket: {
    questions: [
      {
        id: 'ex1',
        type: 'mc',
        question: 'Wat is f(3) als f(x) = 2x − 1?',
        options: ['4', '5', '6', '7'],
        correct: 1
      },
      {
        id: 'ex2',
        type: 'mc',
        question: 'Een functie geeft bij elke x-waarde...',
        options: ['twee y-waarden', 'precies één y-waarde', 'geen y-waarde', 'een x-waarde'],
        correct: 1
      },
      {
        id: 'ex3',
        type: 'mc',
        question: 'Wat is het domein van f(x) = 1/(x − 2)?',
        options: ['R', 'R zonder 0', 'R zonder 2', 'R zonder −2'],
        correct: 2
      },
      {
        id: 'ex4',
        type: 'open',
        question: 'Leg uit: wat is het verschil tussen een recht evenredig en een omgekeerd evenredig verband?',
        description: 'Gebruik een voorbeeld en een formule.'
      }
    ]
  },

  spotCheck: {
    questions: [
      { question: 'Wat is f(0) als f(x) = 3x + 2?', answer: '2' },
      { question: 'Hoe noem je a in f(x) = ax + b?', answer: 'richtingscoëfficiënt of rico' },
      { question: 'Recht evenredig: y = k·x. Wat is constant?', answer: 'quotiënt y/x' },
      { question: 'Omgekeerd evenredig: y = k/x. Wat is constant?', answer: 'product x·y' },
      { question: 'Wat is de grafiek van f(x) = 5?', answer: 'horizontale rechte' }
    ]
  }
};

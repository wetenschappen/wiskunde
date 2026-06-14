export default {
  id: "archimedes-les-1",
  subject: "physics",
  className: "3NW",
  title: "Les 1: De archimedeskracht ontdekken",
  description:
    "Introductie van de archimedeskracht via het Cola vs. Cola Zero experiment. Focus op het begrijpen van de wet van Archimedes.",
  date: "Les 1",

  goals: [
    "Ik kan de wet van Archimedes in woorden formuleren.",
    "Ik kan de formule \\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\) noteren en alle grootheden verklaren.",
    "Ik kan de archimedeskracht berekenen voor een volledig ondergedompeld voorwerp.",
    "Ik kan uitleggen waarom Cola Zero drijft en gewone Cola zinkt.",
  ],

  workbook: {
    title: "Werkboek: Archimedeskracht",
    subtitle: "Deel 1: De wet van Archimedes",
    instruction:
      "Gebruik je cursus (p. 4) voor de theorie en maak onderstaande oefeningen.",
  },

  timeline: {
    stepA: {
      step: "A",
      title: "Inleiden en oriënteren",
      time: "~10 min",
      cards: [
        {
          id: "card-hook",
          type: "class",
          title: "Cola vs. Cola Zero",
          description:
            "Twee blikjes in een bak water. Welk blikje drijft en welk blikje zinkt? Start de discussie voor de les begint.",
          action: "presentation",
          slidesKey: "hook_slides",
        },
        {
          id: "card-phet",
          type: "digital",
          title: "PhET: Drijven en zinken",
          description:
            "Verken de opwaartse kracht interactief met de PhET-simulatie Buoyancy Basics.",
          action: "external-link",
          url: "https://phet.colorado.edu/sims/html/buoyancy-basics/latest/buoyancy-basics_all.html",
          icon: "PhWaves",
        },
      ],
    },
    stepB: {
      step: "B",
      title: "Verwerken en inoefenen",
      time: "~30 min",
      cards: [
        {
          id: "card-guided",
          type: "class",
          title: "De wet van Archimedes",
          description:
            "Wat is de archimedeskracht, welke factoren bepalen de grootte, en hoe bereken je die? Stap voor stap opgebouwd.",
          action: "presentation",
          slidesKey: "guided_slides",
        },
        {
          id: "card-workbook",
          type: "paper",
          title: "Werkboek: oefeningen les 1",
          description:
            "Begrijpsoefeningen over de wet van Archimedes in woorden en formulevorm.",
          action: "workbook",
          icon: "PhBookOpen",
          exercises:
            "Opdracht 1 (p. 16): Geef de wet van Archimedes in woorden.\nOpdracht 2 (p. 16): Geef de wet van Archimedes in formulevorm en verklaar alle gebruikte grootheden.",
        },
      ],
    },
    stepC: {
      step: "C",
      title: "Samenvatten en afsluiten",
      time: "~10 min",
      cards: [
        {
          id: "card-summary",
          type: "class",
          title: "Samenvatting: de wet van Archimedes",
          description:
            "Overzicht: definitie, formule en verklaring van het Cola Zero experiment.",
          action: "presentation",
          slidesKey: "summary_slides",
        },
        {
          id: "card-exit-ticket",
          type: "digital",
          title: "Exit Ticket",
          description:
            "Maak de exit ticket individueel om je begrip van de archimedeskracht te controleren.",
          action: "exit-ticket",
        },
      ],
    },
  },

  hook_slides: [
    {
      layout: "predict",
      title: "Cola vs. Cola Zero",
      question:
        "We leggen een blikje gewone Cola en een blikje Cola Zero in een bak water. Wat voorspel je: welk blikje drijft en welk blikje zinkt?",
      context:
        "Beide blikjes hebben hetzelfde volume (330 ml), maar is de inhoud identiek?",
      hint: "Klik om het resultaat te onthullen",
      revealText:
        "Cola Zero drijft, gewone Cola zinkt. Beide blikjes hebben hetzelfde volume, maar een iets andere massa: suiker maakt gewone Cola zwaarder. De massadichtheid van gewone Cola (~1,04 g/cm³) is groter dan die van water, de massadichtheid van Cola Zero (~0,99 g/cm³) is kleiner dan die van water.",
    },
  ],

  guided_slides: [
    {
      layout: "title",
      title: "De wet van Archimedes",
      subtitle: "Hoe berekenen we de opwaartse kracht?",
      badge: "Theorie",
      icon: "atom",
    },
    {
      layout: "standard",
      title: "Wat is de archimedeskracht?",
      content:
        "Wanneer een voorwerp (gedeeltelijk) ondergedompeld wordt in een fluïdum (vloeistof of gas), ondervindt het een <strong>opwaartse kracht</strong>: de <strong>archimedeskracht \\( F_A \\)</strong>.<br><br>De grootte van die kracht hangt af van drie factoren:<ul><li>De <strong>massadichtheid van het fluïdum</strong> \\( \\rho_{vl} \\) in kg/m³: hoe zwaarder het fluïdum, hoe groter de kracht.</li><li>Het <strong>volume van het voorwerp in het fluïdum</strong> \\( V_{vwp} \\) in m³: hoe groter dat volume, hoe groter de kracht. Als het voorwerp niet volledig ondergedompeld is, noteren we dit volume als \\( V_{onder} \\).</li><li>De <strong>zwaarteveldsterkte</strong> \\( g \\) = 9,81 N/kg op aarde.</li></ul><br>De archimedeskracht is steeds <strong>opwaarts gericht</strong>, ongeacht het materiaal van het voorwerp.",
    },
    {
      layout: "equation",
      title: "De wet van Archimedes",
      equation: "\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)",
      variables: [
        { symbol: "\\( F_A \\)", meaning: "Archimedeskracht", unit: "N" },
        {
          symbol: "\\( \\rho_{vl} \\)",
          meaning: "Massadichtheid van het fluïdum",
          unit: "kg/m³",
        },
        {
          symbol: "\\( V_{vwp} \\)",
          meaning: "Volume van het voorwerp in het fluïdum",
          unit: "m³",
        },
        { symbol: "\\( g \\)", meaning: "Zwaarteveldsterkte", unit: "N/kg" },
      ],
    },
    {
      layout: "standard",
      title: "Uitgewerkt voorbeeld",
      content:
        "<strong>Gegeven:</strong> Een kubus met volume 200 cm³ wordt volledig ondergedompeld in water.<br>\\( \\rho_{water} = 1000 \\) kg/m³ &nbsp;|&nbsp; \\( g = 9{,}81 \\) N/kg<br><br><strong>Gevraagd:</strong> Bereken de archimedeskracht \\( F_A \\).<br><br><strong>Stap 1: eenheden omzetten</strong><br>\\( V_{vwp} = 200 \\text{ cm}^3 = 200 \\times 10^{-6} \\text{ m}^3 = 2{,}00 \\times 10^{-4} \\text{ m}^3 \\)<br><br><strong>Stap 2: invullen in de formule</strong><br>\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} = 1000 \\cdot 9{,}81 \\cdot 2{,}00 \\times 10^{-4} \\)<br><br><strong>Antwoord: \\( F_A = 1{,}96 \\text{ N} \\) (opwaarts)</strong>",
    },
    {
      layout: "recap",
      title: "Check jezelf",
      questions: [
        {
          q: "Wat zijn de drie factoren waarvan de archimedeskracht afhangt?",
          a: "De massadichtheid van het fluïdum \\( \\rho_{vl} \\), het volume van het voorwerp in het fluïdum \\( V_{vwp} \\) en de zwaarteveldsterkte \\( g \\).",
        },
        {
          q: "Wat is de eenheid van de archimedeskracht en hoe leid je die af?",
          a: "Newton (N). Controle: (kg/m³) × (N/kg) × m³ = N.",
        },
        {
          q: "Een blokje staal en een blokje piepschuim hebben hetzelfde volume en worden allebei volledig ondergedompeld in water. Welk blokje heeft de grootste archimedeskracht?",
          a: "Ze zijn even groot. \\( F_A \\) hangt uitsluitend af van \\( \\rho_{vl} \\), \\( V_{vwp} \\) en \\( g \\), niet van het materiaal van het voorwerp zelf.",
        },
      ],
    },
  ],

  summary_slides: [
    {
      layout: "title",
      title: "Samenvatting les 1",
      subtitle: "De wet van Archimedes",
      badge: "Samenvatting",
      icon: "check",
    },
    {
      layout: "standard",
      title: "De wet van Archimedes: overzicht",
      content:
        "<strong>In woorden:</strong> Een voorwerp dat (gedeeltelijk) ondergedompeld is in een fluïdum ondervindt een opwaartse kracht, de archimedeskracht, gelijk aan het gewicht van het verplaatste fluïdum.<br><br><strong>Formule:</strong><br>\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)<br><br><strong>Grootheden:</strong><ul><li>\\( F_A \\): archimedeskracht [N]</li><li>\\( \\rho_{vl} \\): massadichtheid van het fluïdum [kg/m³]</li><li>\\( V_{vwp} \\): volume van het voorwerp in het fluïdum [m³]</li><li>\\( g \\): zwaarteveldsterkte [N/kg]</li></ul><br><strong>Cola Zero vs. gewone Cola:</strong> Beide blikjes hebben hetzelfde volume. Cola Zero heeft massadichtheid ~0,99 g/cm³ (kleiner dan water) en drijft. Gewone Cola heeft massadichtheid ~1,04 g/cm³ (groter dan water) en zinkt.",
    },
  ],

  exitTicket: {
    questions: [
      {
        id: "q1",
        type: "mc",
        question: "Wat is de eenheid van de archimedeskracht \\( F_A \\)?",
        options: ["kg", "N", "Pa", "J"],
        correct: 1,
      },
      {
        id: "q2",
        type: "mc",
        question:
          "Een voorwerp met volume 500 cm³ wordt volledig ondergedompeld in water (\\( \\rho = 1000 \\) kg/m³, g = 10 N/kg). Hoe groot is de archimedeskracht?",
        options: ["0,5 N", "5 N", "50 N", "500 N"],
        correct: 1,
      },
      {
        id: "q3",
        type: "open",
        question:
          "Leg in eigen woorden uit waarom Cola Zero drijft en gewone Cola zinkt.",
      },
    ],
  },
};

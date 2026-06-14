export default {
  id: "archimedes-les-1",
  subject: "physics",
  className: "3NW",
  title: "Les 1: De archimedeskracht ontdekken",
  description:
    "Introductie van de archimedeskracht via het Cola vs. Cola Zero experiment. Van verschijnsel naar formule.",
  date: "Les 1",
  config: {
    classId: "3NW",
    oplossingen: [
      {
        label: "Correctiesleutel Archimedes",
        url: "https://albertshalaj.github.io/verbeteren/archimedes.pdf",
        password: "maandag"
      }
    ]
  },

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
            "Van observatie naar formule: hoe ontstaat de opwaartse kracht en hoe bereken je die?",
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
        {
          id: "card-concept-lab",
          type: "digital",
          title: "Conceptlab Archimedeskracht",
          description:
            "Interactieve conceptdrager: voorspellen, formulefactoren invullen en toepassen op een contextvraag.",
          action: "activity",
          activityId: "archimedes-concept-lab",
          icon: "PhFlask",
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
            "Overzicht van definitie, formule en toepassing op het Cola-experiment.",
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
      layout: "big",
      title: "Wat zien we?",
      content:
        "<span style='color:#60a5fa; font-size:1.2em;'>Cola Zero drijft, gewone Cola zinkt.</span><br><br>Zelfde volume, ander gedrag in water.",
    },
    {
      layout: "standard",
      title: "Een opvallend verschijnsel",
      content:
        "Wanneer we iets in water leggen, lijkt het soms lichter. Soms duwt het water het voorwerp zelfs omhoog.<br><br>Deze <strong>opwaartse kracht</strong> noemen we de <strong>archimedeskracht</strong> \\( F_A \\).",
    },
    {
      layout: "attention",
      title: "Denkvraag",
      content:
        "Waarvan denk je dat de grootte van de archimedeskracht afhangt?<br><br>Bespreek dit 30 seconden met je buur.",
    },
    {
      layout: "steps",
      title: "Drie factoren",
      steps: [
        {
          title: "Massadichtheid van de vloeistof \\( \\rho_{vl} \\)",
          content: "Hoe zwaarder de vloeistof, hoe groter de opwaartse kracht.",
        },
        {
          title: "Volume in de vloeistof \\( V_{vwp} \\)",
          content: "Hoe meer er onder water zit, hoe groter de kracht.",
        },
        {
          title: "Zwaarteveldsterkte \\( g \\)",
          content:
            "Hoe sterker de zwaartekracht, hoe groter de archimedeskracht.",
        },
      ],
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
      title: "Een belangrijk inzicht",
      content:
        "De archimedeskracht hangt <strong>niet af van het materiaal</strong> van het voorwerp zelf, alleen van de drie factoren hierboven.<br><br>Een blokje staal en een blokje piepschuim met hetzelfde volume krijgen dezelfde \\( F_A \\) in hetzelfde water.",
    },
    {
      layout: "steps",
      title: "Voorbeeld: kubus van 200 cm³ in water",
      steps: [
        {
          title: "Gegevens",
          content:
            "\\( V_{vwp} = 200 \\text{ cm}^3 = 2{,}00 \\times 10^{-4} \\text{ m}^3 \\)<br>\\( \\rho_{water} = 1000 \\text{ kg/m}^3 \\)<br>\\( g = 9{,}81 \\text{ N/kg} \\)",
        },
        {
          title: "Formule invullen",
          content:
            "\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)<br>\\( F_A = 1000 \\cdot 9{,}81 \\cdot 2{,}00 \\times 10^{-4} \\)",
        },
        {
          title: "Resultaat",
          content:
            "\\( F_A = 1{,}96 \\text{ N} \\)<br>De kracht werkt <strong>opwaarts</strong>.",
        },
      ],
    },
    {
      layout: "multichoice",
      title: "Check jezelf",
      question:
        "Een blokje kurk en een blokje lood hebben hetzelfde volume en zitten volledig onder water. Welk blokje heeft de grootste archimedeskracht?",
      options: [
        "Het kurkje",
        "Het loden blokje",
        "Beide even groot",
        "Dat hangt af van de vorm",
      ],
      correct: 2,
      explanation:
        "De archimedeskracht hangt alleen af van \\( \\rho_{vl} \\), \\( V_{vwp} \\) en \\( g \\), niet van het materiaal van het voorwerp zelf.",
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
      title: "De kern in één zin",
      content:
        "Een voorwerp in een fluïdum ondervindt een <strong>opwaartse kracht</strong> gelijk aan het <strong>gewicht van het verplaatste fluïdum</strong>.",
    },
    {
      layout: "equation",
      title: "Formule",
      equation: "\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)",
      variables: [
        { symbol: "\\( F_A \\)", meaning: "Archimedeskracht", unit: "N" },
        {
          symbol: "\\( \\rho_{vl} \\)",
          meaning: "Massadichtheid fluïdum",
          unit: "kg/m³",
        },
        { symbol: "\\( V_{vwp} \\)", meaning: "Volume in fluïdum", unit: "m³" },
        { symbol: "\\( g \\)", meaning: "Zwaarteveldsterkte", unit: "N/kg" },
      ],
    },
    {
      layout: "split",
      title: "Cola vs. Cola Zero",
      left: {
        title: "Cola Zero",
        content:
          "<span style='color:#22c55e;'>Drijft</span><br>Massadichtheid ~0,99 g/cm³<br>Kleiner dan water",
      },
      right: {
        title: "Gewone Cola",
        content:
          "<span style='color:#ef4444;'>Zinkt</span><br>Massadichtheid ~1,04 g/cm³<br>Groter dan water",
      },
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

  activities: {
    "archimedes-concept-lab": {
      type: "archimedesConceptLab",
      title: "Conceptlab Archimedeskracht",
      instruction:
        "Werk de drie stappen af: voorspel, formulefactoren en toepassing.",
    },
  },
};

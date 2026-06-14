export default {
  id: "archimedes-les-2",
  subject: "physics",
  className: "3NW",
  title: "Les 2: Van druk naar opwaartse kracht",
  description:
    "Theoretische afleiding van de archimedeskracht vanuit hydrostatische druk. Stap-voor-stap redenering.",
  date: "Les 2",
  config: {
    classId: "3NW",
  },

  goals: [
    "Ik kan de hydrostatische druk berekenen met \\( p = \\rho_{vl} \\cdot g \\cdot h \\).",
    "Ik kan de archimedeskracht theoretisch afleiden vanuit het drukverschil op het boven- en ondervlak van een kubus.",
    "Ik kan aantonen dat \\( F_A = m_{vloeistof} \\cdot g \\) (het gewicht van de verplaatste vloeistof).",
    "Ik kan de archimedeskracht berekenen en toepassen in eenvoudige berekeningsoefeningen.",
  ],

  workbook: {
    title: "Werkboek: Archimedeskracht",
    subtitle: "Deel 2: Theoretische afleiding en berekeningen",
    instruction:
      "Gebruik je cursus (p. 5-7) voor de afleiding en los de oefeningen op.",
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
          title: "Dieper duiken, meer druk?",
          description:
            "Voorspel: hoe verandert de druk als je dieper duikt? Start de discussie om de link met hydrostatische druk te maken.",
          action: "presentation",
          slidesKey: "hook_slides",
        },
        {
          id: "card-phet",
          type: "digital",
          title: "PhET: Drijven en zinken",
          description:
            "Verken het verband tussen diepte, druk en opwaartse kracht met de PhET-simulatie Buoyancy Basics.",
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
          title: "Van druk naar archimedeskracht",
          description:
            "Stap-voor-stap afleiding: van hydrostatische druk naar de formule van Archimedes.",
          action: "presentation",
          slidesKey: "guided_slides",
        },
        {
          id: "card-workbook",
          type: "paper",
          title: "Werkboek: oefeningen les 2",
          description:
            "Oefeningen over de afleiding, dynamometermetingen en berekeningen met de archimedeskracht.",
          action: "workbook",
          icon: "PhBookOpen",
          exercises:
            "Opdracht 3 (p. 16): Op een balans staat een maatglas deels gevuld met water. We zetten de balans op nul. Vervolgens laten we een blokje, bevestigd aan een touw, in het water zakken. Welke informatie halen we uit het aflezen van de balans?\nOpdracht 4 (p. 17): Verklaar de figuur: een voorwerp weegt 4 N in lucht. Ondergedompeld in water geeft de dynamometer 1 N en de weegschaal 3 N. Welk verband toont dit aan?\nAan de slag 3 (p. 23): Een onbekend gesteente heeft massa 3,24 kg. Aan een dynamometer ondergedompeld in water: 10,6 N. Bereken (a) de zwaartekracht en (b) de archimedeskracht.\nAan de slag 7 (p. 27): Een maansteen: massa 3,24 kg, dynamometer ondergedompeld in water geeft 10,6 N. Bereken de massadichtheid van de maansteen. (g = 10 N/kg)",
        },
        {
          id: "card-derivation-builder",
          type: "digital",
          title: "Afleidingbouwer Archimedeskracht",
          description:
            "Interactieve conceptdrager: bouw de afleiding van F_A vanuit drukverschil stap voor stap op.",
          action: "activity",
          activityId: "archimedes-derivation-builder",
          icon: "PhMathOperations",
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
          title: "Samenvatting: van druk naar kracht",
          description:
            "Overzicht: hydrostatische druk, afleidingsstappen en het verband met het gewicht van de verplaatste vloeistof.",
          action: "presentation",
          slidesKey: "summary_slides",
        },
        {
          id: "card-exit-ticket",
          type: "digital",
          title: "Exit Ticket",
          description:
            "Maak de exit ticket individueel om je begrip van de theoretische afleiding te controleren.",
          action: "exit-ticket",
        },
      ],
    },
  },

  hook_slides: [
    {
      layout: "predict",
      title: "Dieper duiken, meer druk?",
      question:
        "Stel je bent aan het duiken. Voel je meer druk op 2 m diepte of op 10 m diepte? Hoe zou je de druk op een bepaalde diepte kunnen berekenen?",
      context: "Denk aan de kolom water die boven je staat.",
      hint: "Klik om de formule te onthullen",
      revealText:
        "Op grotere diepte staat er meer water boven je: de druk neemt toe met de diepte. De formule voor hydrostatische druk is \\( p = \\rho_{vl} \\cdot g \\cdot h \\). Die diepteafhankelijkheid is precies de sleutel tot het begrijpen van de archimedeskracht!",
    },
  ],

  guided_slides: [
    {
      layout: "title",
      title: "Van druk naar opwaartse kracht",
      subtitle: "Theoretische afleiding van de archimedeskracht",
      badge: "Theorie",
      icon: "atom",
    },
    {
      layout: "standard",
      title: "Hydrostatische druk",
      content:
        "De <strong>hydrostatische druk</strong> is de druk in een vloeistof op een bepaalde diepte.<br><br>Formule:<br>\\( p = \\rho_{vl} \\cdot g \\cdot h \\)",
    },
    {
      layout: "equation",
      title: "Hydrostatische druk",
      equation: "\\( p = \\rho_{vl} \\cdot g \\cdot h \\)",
      variables: [
        { symbol: "\\( p \\)", meaning: "Hydrostatische druk", unit: "Pa" },
        {
          symbol: "\\( \\rho_{vl} \\)",
          meaning: "Massadichtheid vloeistof",
          unit: "kg/m³",
        },
        { symbol: "\\( g \\)", meaning: "Zwaarteveldsterkte", unit: "N/kg" },
        { symbol: "\\( h \\)", meaning: "Diepte onder oppervlak", unit: "m" },
      ],
    },
    {
      layout: "big",
      title: "Een kubus onder water",
      content:
        "Stel: een kubus met zijde \\( z \\) zit volledig onder water.<br><br>Het bovenvlak is op diepte \\( h \\).<br>Het ondervlak is op diepte \\( h + z \\).",
    },
    {
      layout: "comparison",
      title: "Druk op boven- en ondervlak",
      left: {
        title: "Bovenvlak",
        icon: "arrow-down",
        content:
          "Diepte: \\( h \\)<br>Druk: \\( p_{boven} = \\rho_{vl} \\cdot g \\cdot h \\)<br>Kracht: <strong>neerwaarts</strong>",
      },
      right: {
        title: "Ondervlak",
        icon: "arrow-up",
        content:
          "Diepte: \\( h + z \\)<br>Druk: \\( p_{onder} = \\rho_{vl} \\cdot g \\cdot (h + z) \\)<br>Kracht: <strong>opwaarts</strong>",
      },
    },
    {
      layout: "attention",
      title: "Wat gebeurt met de zijkanten?",
      content:
        "De druk op de zijkanten werkt even groot naar links en rechts.<br><br>Deze krachten <strong>heffen elkaar op</strong>. Geen netto horizontale kracht.",
    },
    {
      layout: "steps",
      title: "Stap 1: krachten op boven- en ondervlak",
      steps: [
        {
          title: "Kracht op bovenvlak",
          content:
            "\\( F_{boven} = p_{boven} \\cdot A \\)<br>\\( = \\rho_{vl} \\cdot g \\cdot h \\cdot A \\)<br><span style='color:#f87171;'>&#8595; neerwaarts</span>",
        },
        {
          title: "Kracht op ondervlak",
          content:
            "\\( F_{onder} = p_{onder} \\cdot A \\)<br>\\( = \\rho_{vl} \\cdot g \\cdot (h + z) \\cdot A \\)<br><span style='color:#60a5fa;'>&#8593; opwaarts</span>",
        },
      ],
    },
    {
      layout: "big",
      title: "Welke kracht is groter?",
      content:
        "\\( F_{onder} > F_{boven} \\)<br><br>Want \\( h + z > h \\), dus \\( p_{onder} > p_{boven} \\).",
    },
    {
      layout: "steps",
      title: "Stap 2: netto kracht berekenen",
      steps: [
        {
          title: "Verschil nemen",
          content:
            "\\( F_A = F_{onder} - F_{boven} \\)<br>\\( = \\rho_{vl} \\cdot g \\cdot (h + z) \\cdot A - \\rho_{vl} \\cdot g \\cdot h \\cdot A \\)",
        },
        {
          title: "Factor \\( \\rho_{vl} \\cdot g \\cdot A \\) buiten haakjes",
          content:
            "\\( = \\rho_{vl} \\cdot g \\cdot A \\cdot [(h + z) - h] \\)<br>\\( = \\rho_{vl} \\cdot g \\cdot A \\cdot z \\)",
        },
        {
          title: "Volume van de kubus",
          content:
            "\\( A \\cdot z = V_{vwp} \\) (volume van het voorwerp)<br><br>Dus: \\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)",
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
          meaning: "Massadichtheid vloeistof",
          unit: "kg/m³",
        },
        { symbol: "\\( g \\)", meaning: "Zwaarteveldsterkte", unit: "N/kg" },
        {
          symbol: "\\( V_{vwp} \\)",
          meaning: "Volume in vloeistof",
          unit: "m³",
        },
      ],
    },
    {
      layout: "standard",
      title: "Een diepere betekenis",
      content:
        "\\( \\rho_{vl} \\cdot V_{vwp} \\) = massa van de verplaatste vloeistof \\( m_{vloeistof} \\).<br><br>Dus: \\( F_A = m_{vloeistof} \\cdot g \\)",
    },
    {
      layout: "big",
      title: "Kernidee",
      content:
        "<span style='color:#60a5fa; font-size:1.2em;'>De archimedeskracht is gelijk aan het gewicht van de verplaatste vloeistof.</span>",
    },
    {
      layout: "multichoice",
      title: "Misconceptie: atmosferische druk",
      question:
        "Moeten we de atmosferische druk meerekenen bij de archimedeskracht?",
      options: [
        "Ja, want lucht dukt ook op het water",
        "Nee, want atmosferische druk werkt op alle zijden even hard",
        "Alleen bij grote dieptes",
        "Alleen in de bergen",
      ],
      correct: 1,
      explanation:
        "Atmosferische druk plant zich voort in de vloeistof en werkt op alle zijden van het voorwerp. Deze krachten heffen elkaar twee aan twee op.",
    },
    {
      layout: "recap",
      title: "Check jezelf",
      questions: [
        {
          q: "Hoe verandert de hydrostatische druk als je twee keer zo diep duikt?",
          a: "De druk verdubbelt (recht evenredig met diepte).",
        },
        {
          q: "Waarom is \\( F_{onder} \\) groter dan \\( F_{boven} \\)?",
          a: "Omdat het ondervlak dieper ligt: grotere druk op hetzelfde oppervlak.",
        },
        {
          q: "Een kurk en lood metzelfde volume in water: welke heeft grotere \\( F_A \\)?",
          a: "Even groot! \\( F_A \\) hangt niet af van het materiaal.",
        },
      ],
    },
  ],

  summary_slides: [
    {
      layout: "title",
      title: "Samenvatting les 2",
      subtitle: "Van druk naar archimedeskracht",
      badge: "Samenvatting",
      icon: "check",
    },
    {
      layout: "steps",
      title: "Drie kernstappen",
      steps: [
        {
          title: "Hydrostatische druk",
          content:
            "\\( p = \\rho_{vl} \\cdot g \\cdot h \\)<br>Druk neemt toe met diepte.",
        },
        {
          title: "Drukverschil op kubus",
          content:
            "Bovenvlak: \\( F_{boven} = \\rho_{vl} \\cdot g \\cdot h \\cdot A \\)<br>Ondervlak: \\( F_{onder} = \\rho_{vl} \\cdot g \\cdot (h + z) \\cdot A \\)",
        },
        {
          title: "Netto opwaartse kracht",
          content:
            "\\( F_A = F_{onder} - F_{boven} = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)",
        },
      ],
    },
    {
      layout: "big",
      title: "Belangrijkste inzicht",
      content:
        "\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} = m_{vloeistof} \\cdot g \\)<br><br>De archimedeskracht is het <strong>gewicht van de verplaatste vloeistof</strong>.",
    },
  ],

  exitTicket: {
    questions: [
      {
        id: "q1",
        type: "mc",
        question:
          "De hydrostatische druk op een diepte van 5 m in water (\\( \\rho = 1000 \\) kg/m³, g = 10 N/kg) bedraagt:",
        options: ["500 Pa", "5 000 Pa", "50 000 Pa", "500 000 Pa"],
        correct: 2,
      },
      {
        id: "q2",
        type: "mc",
        question: "De archimedeskracht is gelijk aan...",
        options: [
          "De massa van het voorwerp maal g",
          "Het gewicht van de verplaatste vloeistof",
          "De druk op de bodem van het voorwerp",
          "De massadichtheid van het voorwerp maal g",
        ],
        correct: 1,
      },
      {
        id: "q3",
        type: "open",
        question:
          "Leg in eigen woorden uit hoe het drukverschil tussen het boven- en ondervlak van een voorwerp zorgt voor een netto opwaartse kracht.",
      },
    ],
  },

  activities: {
    "archimedes-derivation-builder": {
      type: "archimedesDerivationBuilder",
      title: "Afleidingbouwer Archimedeskracht",
      instruction:
        "Doorloop de afleiding van p-formule naar F_A = rho_vl . g . V_vwp.",
    },
  },
};

export default {
  id: "archimedes-les-4",
  subject: "physics",
  className: "3NW",
  title: "Les 4: Theorie vastzetten",
  description:
    "Zelfstandige verwerking van alle theorie uit de module. Gebruik de interactieve theorieverkenner als leidraad bij de oefeningen in je cursus. Iedereen werkt op eigen tempo. Klaar voor de toets volgende week!",
  date: "Les 4",
  config: {
    classId: "3NW",
  },

  goals: [
    "Ik kan de wet van Archimedes in woorden en formulevorm geven en alle grootheden verklaren.",
    "Ik kan uitleggen hoe de archimedeskracht ontstaat vanuit hydrostatisch drukverschil.",
    "Ik kan de vier bewegingstoestanden (zinken, zweven, stijgen, drijven) koppelen aan de verhouding van dichtheden.",
    "Ik kan de drijfformule toepassen om te berekenen hoeveel procent van een voorwerp onder water zit.",
    "Ik kan de begrippen massa, volume, massadichtheid en archimedeskracht correct gebruiken in een verklaring.",
    "Ik kan de wet van Archimedes ook toepassen op gassen, zoals bij een luchtballon (LPD F7).",
  ],

  workbook: {
    title: "Werkboek: Archimedeskracht",
    subtitle: "Deel 4: Theorie consolideren",
    instruction:
      "Doorloop de theorieverkenner op je scherm en vul de bijbehorende opdrachten in je cursus in. Dit is een grondige voorbereiding op de toets!",
    formulaHint: "Focus op de begrippen: Wet van Archimedes, Drukverschil en Dichtheid.",
  },

  timeline: {
    stepA: {
      step: "A",
      title: "Planning en start",
      time: "~10 min",
      cards: [
        {
          id: "card-hook",
          type: "class",
          title: "Plan van aanpak",
          description:
            "Vandaag zetten we alle theorie van de archimedeskracht vast. Je werkt zelfstandig met de interactieve verkenner als leidraad. Volgende week: toets!",
          action: "presentation",
          slidesKey: "hook_slides",
        },
        {
          id: "card-eureka",
          type: "digital",
          title: "Het Eureka-moment",
          description: "Ontdek interactief hoe Archimedes de fraude van de goudsmid blootlegde zonder de kroon te smelten.",
          action: "activity",
          activityId: "eureka-story",
          icon: "PhDrop",
        },
      ],
    },
    stepB: {
      step: "B",
      title: "Zelfstandig werken met de theorieverkenner",
      time: "~35 min",
      cards: [
        {
          id: "card-workbook-ref",
          type: "paper",
          title: "Overzicht oefeningen",
          description: "Klik hier om op elk moment te zien welke oefeningen je moet maken in je cursus.",
          action: "workbook",
          icon: "PhBookOpen",
          exercises: "Opdracht 1-2 (p. 16): De wet van Archimedes in woorden en formule\n" +
            "Opdracht 3 (p. 16-17): De balansproef en het effect op het volume\n" +
            "Opdracht 5-13 (p. 18-21): Zinken, zweven, stijgen en drijven (incl. diepte-onafhankelijkheid)\n" +
            "Opdracht 9-12 (p. 19-20): Krachten tekenen in de juiste verhouding\n" +
            "Opdracht 17-19 (p. 22): Toepassingen van de ijsberg, kurk en de kroon"
        },
        {
          id: "card-theory-quest",
          type: "digital",
          title: "Interactieve Theorieverkenner",
          description:
            "Doorloop de 5 onderdelen. Elk deel leidt je door de theorie, verwijst naar de juiste oefeningen in je cursus, en controleert je begrip. Werk op eigen tempo!",
          action: "activity",
          activityId: "archimedesTheoryQuest",
          icon: "PhTrophy",
        },
      ],
    },
    stepC: {
      step: "C",
      title: "Afsluiten",
      time: "~10 min",
      cards: [
        {
          id: "card-summary",
          type: "class",
          title: "Essentie: wat moet je kennen?",
          description:
            "Kort overzicht van de kern: formule, vier bewegingstoestanden, en wat F_A bepaalt.",
          action: "presentation",
          slidesKey: "summary_slides",
        },
        {
          id: "card-exit-ticket",
          type: "digital",
          title: "Exit Ticket",
          description:
            "Laatste check: beantwoord de conceptvragen om te zien of je helemaal klaar bent voor de toets.",
          action: "exit-ticket",
        },
      ],
    },
  },

  hook_slides: [
    {
      layout: "title",
      title: "Les 4: Theorie vastzetten",
      subtitle: "Zelfstandig door de theorie: klaar voor de toets volgende week!",
      badge: "Consolidatie",
      icon: "target",
    },
    {
      layout: "steps",
      title: "Hoe werkt deze les?",
      steps: [
        {
          icon: "trophy",
          title: "Open de Theorieverkenner",
          content: "Start de verkenner op je scherm. Deze leidt je door 5 onderdelen.",
        },
        {
          icon: "book-open",
          title: "Maak de oefeningen in je cursus",
          content: "De verkenner vertelt je welke oefening je moet maken (p. 16-22).",
        },
        {
          icon: "check",
          title: "Beantwoord de controle-vraag",
          content: "Na de oefening check je in de app of je het begrepen hebt.",
        },
        {
          icon: "star",
          title: "Klaar = klaar voor de toets",
          content: "Na onderdeel 5 heb je de volledige theorie herhaald.",
        },
      ],
    },
  ],

  summary_slides: [
    {
      layout: "title",
      title: "Volgende week: toets!",
      subtitle: "Dit is de essentie die je moet beheersen.",
      badge: "Voorbereiding",
      icon: "check",
    },
    {
      layout: "big",
      title: "De kernformule",
      content: "\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)",
      subtext: "Opwaartse kracht = dichtheid fluïdum × g × ondergedompeld volume",
    },
    {
      layout: "steps",
      title: "De vier bewegingstoestanden",
      steps: [
        { icon: "trend-down", title: "Zinken", content: "\\( \\rho_{vwp} > \\rho_{vl} \\)" },
        { icon: "check", title: "Zweven", content: "\\( \\rho_{vwp} = \\rho_{vl} \\)" },
        { icon: "trend-up", title: "Stijgen", content: "\\( \\rho_{vwp} < \\rho_{vl} \\)" },
        { icon: "arrow-fat-up", title: "Drijven", content: "\\( \\rho_{vwp} < \\rho_{vl} \\) (in evenwicht)" },
      ],
    },
    {
      layout: "standard",
      title: "Belangrijk voor de toets:",
      content: "De archimedeskracht hangt <strong>NIET</strong> af van het materiaal van het voorwerp of de diepte. ALLEEN het ondergedompelde volume en de dichtheid van de vloeistof tellen!",
    },
  ],

  exitTicket: {
    questions: [
      {
        id: "q1",
        type: "mc",
        question: "Een voorwerp zweeft in een vloeistof. Welk verband geldt er tussen \\( F_z \\) en \\( F_A \\)?",
        options: ["\\( F_z > F_A \\)", "\\( F_z = F_A \\)", "\\( F_z < F_A \\)", "\\( F_A = 0 \\)"],
        correct: 1,
      },
      {
        id: "q2",
        type: "mc",
        question: "Waarvan hangt de archimedeskracht \\( F_A \\) af?",
        options: ["Het materiaal van het voorwerp", "Van \\( \\rho_{vl} \\), \\( g \\) en \\( V_{vwp} \\)", "Alleen van de massa", "Van de diepte"],
        correct: 1,
      },
      {
        id: "q3",
        type: "mc",
        question: "Kurk (ρ=0,25) drijft op water (ρ=1,00). Hoeveel procent zit onder water?",
        options: ["10%", "25%", "50%", "75%"],
        correct: 1,
      },
      {
        id: "q4",
        type: "open",
        question: "Verklaar waarom een ijsberg voor het grootste deel onder water zit.",
      },
    ],
  },

  activities: {
    archimedesTheoryQuest: {
      type: "archimedesTheoryQuest",
      title: "Interactieve Theorieverkenner",
    },
    "eureka-story": {
      type: "eurekaStory",
      title: "Het Eureka-moment van Archimedes",
    },
  },
};

export default {
  id: "chemie-bindingen-les-2",
  subject: "science",
  className: "3NW",
  title: "Les 2: Formules Opstellen",
  description:
    "Focust op het opstellen van formule-eenheden (ionverbindingen via neutraliteitsregel) en molecuulformules (Lewisstructuren voor binaire stoffen).",
  date: "Les 2",

  goals: [
    "Ik kan van een ionverbinding de formule-eenheid opstellen met behulp van de neutraliteitsregel.",
    "Ik kan van een binaire atoombinding de molecuulformule opstellen.",
    "Ik kan van een binaire stof de Lewisstructuur of structuurformule tekenen.",
    "Ik kan onderscheid maken tussen formule-eenheid, molecuulformule en structuurformule.",
  ],

  workbook: {
    title: "Werkboek: Chemische Bindingen",
    subtitle: "Deel 2: Formule-eenheden & Lewisstructuren",
    instruction: "Gebruik je handboek (p. 242-257) om de oefeningen te maken.",
  },

  timeline: {
    stepA: {
      step: "A",
      title: "Inleiden & Oriënteren",
      time: "~10 min",
      cards: [
        {
          id: "card-hook",
          type: "class",
          title: "Van ionen naar formules",
          description:
            'Start de presentatie: hoe vertaal je "Mg²⁺ en Cl⁻" naar "MgCl₂"? Toon de theorie-slides met de neutraliteitsregel.',
          action: "presentation",
          slidesKey: "hook_slides",
        },
        {
          id: "card-intro",
          type: "class",
          title: "Korte intro: formuletaal van de chemie",
          description:
            "Leg uit: ionverbindingen → formule-eenheid (kleinste verhouding in rooster). Atoomverbindingen → molecuulformule (werkelijk aantal atomen). Toon de Lewisstructuur-theorie.",
          action: "presentation",
          slidesKey: "theory_slides",
        },
      ],
    },
    stepB: {
      step: "B",
      title: "Verdiepen & Oefeningen Maken",
      time: "~30 min",
      cards: [
        {
          id: "card-guided",
          type: "class",
          title: "Begeleide oefening: formules lezen en schrijven",
          description:
            "Stap-voor-stap aanpak voor formule-eenheden, Lewisstructuren en molecuulformules.",
          action: "presentation",
          slidesKey: "guided_slides",
        },
        {
          id: "card-workbook",
          type: "paper",
          title: "Werkboek: oefeningen les 2",
          description:
            "8 oefeningen: kristal bouwen (p.244), formule-eenheden (p.246-248), Lewisstructuren (p.251-252), molecuulformules (p.254), formule-classificatie (p.257).",
          action: "workbook",
          icon: "PhBookOpen",
          exercises:
            "Opdracht 7 (p. 244): Bouw je eigen keukenzoutkristal: lego-blokken → verhouding 1:1\nOpdracht 8 (p. 246): Formule-eenheden uit roosters: schrijf NaI en K₂S\nOpdracht 9 (p. 247): Formule-eenheden tabel: 7 ionverbindingen (CaO, ZnS, NaBr, K₂O, MgS, AlF₃, Al₂O₃)\nAan de slag 1 (p. 248): 10 formule-eenheden schrijven (Al₂S₃, MgI₂, BaO, LiBr, K₂S, CaBr₂, NaF, LiI, MgCl₂, Na₂O)\nOpdracht 10 (p. 251): Structuurformules tekenen: H₂S, Cl₂, H₂O, CH₄, NH₃, HCl\nOpdracht 11 (p. 252): Structuurformules tekenen: SO, PCl₃, CCl₄\nOpdracht 13 (p. 254): Molecuulformules schrijven: S₈, H₂SO₄, HNO₃, C₆H₈O₇, I₂, paracetamol, cafeïne\nAan de slag 4 (p. 257): Classificeer 12 formules als structuurformule, molecuulformule, of formule-eenheid",
        },
      ],
    },
    stepC: {
      step: "C",
      title: "Samenvatten & Exit Ticket",
      time: "~10 min",
      cards: [
        {
          id: "card-summary",
          type: "class",
          title: "Samenvatting: formules opstellen",
          description:
            "Overzicht: neutraliteitsregel voor ionen (som ladingen = 0, kleinste verhouding). Lewisstructuur: valentie-elektronen → bindende paren → edelgasconfiguratie. Formule-eenheid vs molecuulformule.",
          action: "presentation",
          slidesKey: "summary_slides",
        },
        {
          id: "card-exit-ticket",
          type: "digital",
          title: "Exit Ticket",
          description:
            "Maak de exit ticket individueel om je begrip van formule-eenheden en Lewisstructuren te checken.",
          action: "exit-ticket",
        },
      ],
    },
  },

  hook_slides: [
    {
      layout: "predict",
      title: "Van ionen naar formules",
      question:
        "Als Mg²⁺ en Cl⁻ een ionbinding vormen, waarom schrijven we dan MgCl₂ en niet MgCl?",
      context: "Denk aan de ladingen en de neutraliteitsregel.",
      hint: "Klik om het antwoord te zien",
      revealText:
        "Mg²⁺ heeft lading +II. Cl⁻ heeft lading -I. Om neutraal te zijn heb je 2 Cl⁻ nodig: (+II) + 2×(-I) = 0. Daarom MgCl₂!",
    },
  ],

  theory_slides: [
    {
      layout: "title",
      title: "Formule-eenheden en Lewisstructuren",
      subtitle: "De taal van de chemie: van deeltjes naar formules",
      badge: "Theorie",
      icon: "cube",
    },
    {
      layout: "standard",
      title: "Ionverbinding: de neutraliteitsregel",
      content:
        "<strong>Stap 1:</strong> Bepaal de ionlading van metaal en niet-metaal.<br>Na → Na⁺, Mg → Mg²⁺, Al → Al³⁺ | O → O²⁻, F → F⁻, Cl → Cl⁻<br><br><strong>Stap 2:</strong> Zoek de kleinste verhouding waarbij de som van de ladingen 0 is.<br>Mg²⁺ + 2×Cl⁻ = (+II) + 2×(-I) = 0 → <strong>MgCl₂</strong><br>2×Al³⁺ + 3×O²⁻ = 2×(+III) + 3×(-II) = 0 → <strong>Al₂O₃</strong><br><br><strong>Stap 3:</strong> Schrijf met indices. Index 1 wordt niet geschreven.<br><br><strong>Voorbeelden:</strong> NaCl, K₂S, Al₂O₃, CaBr₂.",
    },
    {
      layout: "standard",
      title: "Atoomverbinding: Lewisstructuur, beperkt tot binaire stoffen",
      content:
        "<strong>Stap 1:</strong> Teken atomen met valentie-elektronen (stippen).<br><strong>Stap 2:</strong> Koppel ongepaarde elektronen tot bindende paren (streepjes).<br><strong>Stap 3:</strong> Controleer: elk atoom heeft edelgasconfiguratie (H = 2, de andere meestal 8).<br><br>Voorbeelden: H-H (enkelvoudig), O=O (dubbel), N≡N (drievoudig), H-Cl, H₂O, CO₂.<br><br>De <strong>structuurformule</strong> toont welke atomen aan elkaar gebonden zijn.",
    },
    {
      layout: "standard",
      title: "Molecuulformule versus formule-eenheid",
      content:
        "<strong>Molecuulformule</strong> (atoomverbindingen): geeft het <em>werkelijke aantal</em> atomen in één molecule weer. Bv. H₂O, CH₄, CO₂, S₈, I₂.<br><br><strong>Formule-eenheid</strong> (ionverbindingen): geeft de <em>kleinste verhouding</em> van ionen in het rooster weer. Bv. NaCl, K₂S, Al₂O₃, MgCl₂.<br><br>Belangrijk: moleculen zijn aparte deeltjes, ionroosters zijn oneindige herhalingen.",
    },
  ],

  guided_slides: [
    {
      layout: "title",
      title: "Hoe pak je de oefeningen aan?",
      subtitle:
        "Stap-voor-stap naar formule-eenheid, structuurformule en molecuulformule",
      badge: "Begeleide Oefening",
      icon: "lightbulb",
    },
    {
      layout: "standard",
      title: "1. Formule-eenheid van een ionverbinding",
      content:
        "Voor Opdracht 8, 9 en Aan de slag 1 werk je met de <strong>neutraliteitsregel</strong>:<br><br><strong>Stap 1:</strong> Schrijf de ionen met hun lading.<br><strong>Stap 2:</strong> Kies de <em>kleinste verhouding</em> zodat de som van de ladingen 0 is.<br><strong>Stap 3:</strong> Schrijf de formule-eenheid met indices.<br><br>Voorbeeld: Mg²⁺ en Cl⁻ → 1 Mg²⁺ + 2 Cl⁻ → <strong>MgCl₂</strong>.<br><br><strong>Extra voorbeelden:</strong> NaI, K₂S, CaBr₂, Na₂O.",
    },
    {
      layout: "standard",
      title: "2. Structuurformule van een binaire atoombinding",
      content:
        "Voor Opdracht 10 en 11 teken je eerst de <strong>Lewisstructuur</strong>:<br><br><strong>Stap 1:</strong> Tel de valentie-elektronen van elk atoom.<br><strong>Stap 2:</strong> Koppel ongepaarde elektronen tot <em>bindende elektronenparen</em>.<br><strong>Stap 3:</strong> Controleer of elk atoom de edelgasconfiguratie heeft (H = 2, de andere meestal 8).<br><br>Voorbeeld: H en Cl → één gedeeld elektronenpaar → <strong>H-Cl</strong>.<br><br><strong>Voorbeelden:</strong> H₂S, H₂O, CH₄, NH₃, PCl₃, CCl₄, SO.",
    },
    {
      layout: "standard",
      title: "3. Molecuulformule of formule-eenheid?",
      content:
        "Voor Opdracht 13 en Aan de slag 4 moet je het verschil kennen:<br><br><strong>Molecuulformule</strong> = het werkelijke aantal atomen in één molecule (bv. H₂O, S₈, C₆H₈O₇, I₂).<br><strong>Formule-eenheid</strong> = de kleinste verhouding van ionen in een ionrooster (bv. NaCl, K₂S, Al₂O₃, MgCl₂).<br><br>Tip: een stof met alleen niet-metalen is meestal een <strong>atoomverbinding</strong>; een stof met metaal + niet-metaal is een <strong>ionverbinding</strong>.",
    },
    {
      layout: "recap",
      title: "Kijk na of je het kunt",
      questions: [
        {
          q: "Wat doe je eerst bij een ionverbinding?",
          a: "De ionen met hun lading opschrijven en de kleinste neutrale verhouding zoeken.",
        },
        {
          q: "Wat stelt een structuurformule voor?",
          a: "Welke atomen aan elkaar gebonden zijn in een molecule.",
        },
        {
          q: "Wat is het verschil tussen een molecuulformule en een formule-eenheid?",
          a: "Molecuulformule = werkelijke samenstelling van een molecule; formule-eenheid = kleinste verhouding in een rooster.",
        },
      ],
    },
  ],

  summary_slides: [
    {
      layout: "title",
      title: "Samenvatting les 2",
      subtitle: "Formules opstellen: ionen én atomen",
      badge: "Samenvatting",
      icon: "check",
    },
    {
      layout: "comparison",
      title: "Ion vs Atoom: Formules",
      left: {
        title: "Ionverbinding",
        icon: "cube",
        content:
          "<strong>Formule-eenheid</strong><br>Neutraliteitsregel: som ladingen = 0<br>Kleinste verhouding<br>Vb: NaCl, K₂S, Al₂O₃<br>Index 1 wordt niet geschreven",
      },
      right: {
        title: "Atoomverbinding",
        icon: "share",
        content:
          "<strong>Molecuulformule</strong><br>Lewisstructuur: valentie-e → bindende paren<br>Werkelijk aantal atomen in molecule<br>Vb: H₂O, CH₄, CO₂<br>Enkelvoudig, dubbel, drievoudig",
      },
      bottom: {
        title: "Belangrijk Onderscheid",
        icon: "warning",
        content:
          "<strong>Formule-eenheid</strong> = kleinste verhouding in rooster (ionen)<br><strong>Molecuulformule</strong> = werkelijk aantal atomen (covalente stof)<br><strong>Structuurformule</strong> = welke atomen aan elkaar gebonden zijn",
      },
    },
  ],

  exitTicket: {
    questions: [
      {
        id: "q1",
        type: "open",
        question:
          "Wat is de formule-eenheid van de ionverbinding tussen Calcium (Ca²⁺) en Broom (Br⁻)?",
      },
      {
        id: "q2",
        type: "open",
        question:
          "Wat is de formule-eenheid van de ionverbinding tussen Aluminium (Al³⁺) en Zwavel (S²⁻)?",
      },
      {
        id: "q3",
        type: "mc",
        question: "Hoeveel atoombindingen heeft fosfortrichloride (PCl₃)?",
        options: ["1", "2", "3", "4"],
        correct: 2,
      },
      {
        id: "q4",
        type: "mc",
        question:
          "Wat is het verschil tussen een molecuulformule en een formule-eenheid?",
        options: [
          "Er is geen verschil",
          "Molecuulformule = werkelijk aantal atomen in molecule; formule-eenheid = kleinste verhouding in rooster",
          "Molecuulformule is voor ionen; formule-eenheid voor atomen",
        ],
        correct: 1,
      },
      {
        id: "q5",
        type: "juist-fout",
        question:
          "In CO₂ heeft koolstof een dubbele atoombinding met elk zuurstofatoom.",
        correct: true,
      },
    ],
  },
};

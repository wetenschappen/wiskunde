export default {
  id: "archimedes-les-2",
  subject: "physics",
  className: "3NW",
  title: "Les 2: De theoretische afleiding",
  description:
    "Theoretische afleiding van de archimedeskracht vanuit de hydrostatische druk. Verbinding met het gewicht van de verplaatste vloeistof.",
  date: "Les 2",

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
      title: "Inleiden en ori\u00ebnteren",
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
            "Stap voor stap: hydrostatische druk, visuele opbouw, afleidingsstappen en de link met het gewicht van de verplaatste vloeistof.",
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
      title: "De theoretische afleiding",
      subtitle: "Van hydrostatische druk naar archimedeskracht",
      badge: "Theorie",
      icon: "atom",
    },
    {
      layout: "standard",
      title: "Hydrostatische druk",
      content:
        "De <strong>hydrostatische druk</strong> is de druk die een vloeistof uitoefent op een bepaalde diepte \\( h \\):<br><br>\\( p = \\rho_{vl} \\cdot g \\cdot h \\)<br><br><strong>Grootheden:</strong><ul><li>\\( p \\): hydrostatische druk [Pa = N/m\u00b2]</li><li>\\( \\rho_{vl} \\): massadichtheid van de vloeistof [kg/m\u00b3]</li><li>\\( g \\): zwaarteveldsterkte [N/kg]</li><li>\\( h \\): diepte onder het vloeistofoppervlak [m]</li></ul><br>Hoe dieper je gaat, hoe groter de druk. Die druk werkt op <em>alle</em> zijden van een ondergedompeld voorwerp. De zijdelingse krachten compenseren elkaar twee aan twee. Alleen de <strong>verticale krachten</strong> leveren een netto resultante op.",
    },
    {
      layout: "standard",
      title: "De kubus onder water: visuele opbouw",
      content:
        'Stel een kubus met zijde \\( z \\) en grondoppervlak \\( A \\). Het <strong>bovenvlak</strong> bevindt zich op diepte \\( h \\), het <strong>ondervlak</strong> op diepte \\( h + z \\).<div style="background:rgba(15,23,42,0.75); border:1px solid rgba(100,116,139,0.4); border-radius:12px; padding:16px; margin:14px 0; text-align:center;"><div style="color:#93c5fd; font-size:11px; font-family:monospace; letter-spacing:2px; border-bottom:2px dashed #60a5fa; padding-bottom:8px; margin-bottom:14px;">~ vloeistofoppervlak ~</div><div style="display:flex; justify-content:center; align-items:flex-start; gap:24px;"><div style="display:flex; flex-direction:column; align-items:center; color:#94a3b8; font-size:11px; font-style:italic; padding-top:4px;"><span>&#9650;</span><div style="width:1px; height:28px; background:#64748b;"></div><em>h</em><div style="width:1px; height:8px; background:#64748b;"></div><span>&#9660;</span></div><div style="display:flex; flex-direction:column; align-items:center;"><span style="color:#f87171; font-weight:700; font-size:13px; margin-bottom:4px;">&#8595; F<sub>boven</sub> (neerwaarts)</span><div style="border:2px solid #f97316; background:rgba(249,115,22,0.12); width:80px; height:60px; border-radius:8px; display:flex; align-items:center; justify-content:center;"><span style="color:#fdba74; font-size:11px; font-style:italic;">kubus (z)</span></div><span style="color:#60a5fa; font-weight:700; font-size:13px; margin-top:4px;">&#8593; F<sub>onder</sub> (opwaarts)</span></div><div style="display:flex; flex-direction:column; align-items:center; color:#94a3b8; font-size:11px; font-style:italic;"><span>&#9650;</span><div style="width:1px; height:70px; background:#64748b;"></div><em>h + z</em><div style="width:1px; height:8px; background:#64748b;"></div><span>&#9660;</span></div></div><div style="color:#94a3b8; font-size:11px; margin-top:12px;">Diepte ondervlak (h + z) &gt; diepte bovenvlak (h) &#x2192; F<sub>onder</sub> &gt; F<sub>boven</sub></div></div>Het verschil tussen die twee krachten levert de netto <strong>opwaartse kracht</strong> op.',
    },
    {
      layout: "steps",
      title: "Afleiding: drukverschil op een kubus",
      steps: [
        {
          title: "Kracht op het bovenvlak (neerwaarts)",
          content:
            "\\( p_{boven} = \\rho_{vl} \\cdot g \\cdot h \\)<br>\\( F_{boven} = p_{boven} \\cdot A = \\rho_{vl} \\cdot g \\cdot h \\cdot A \\)",
        },
        {
          title: "Kracht op het ondervlak (opwaarts)",
          content:
            "\\( p_{onder} = \\rho_{vl} \\cdot g \\cdot (h + z) \\)<br>\\( F_{onder} = p_{onder} \\cdot A = \\rho_{vl} \\cdot g \\cdot (h + z) \\cdot A \\)",
        },
        {
          title: "Netto opwaartse kracht",
          content:
            "\\( F_A = F_{onder} - F_{boven} \\)<br>\\( = \\rho_{vl} \\cdot g \\cdot (h + z) \\cdot A - \\rho_{vl} \\cdot g \\cdot h \\cdot A \\)<br>\\( = \\rho_{vl} \\cdot g \\cdot z \\cdot A \\)<br><br>Omdat \\( z \\cdot A = V_{vwp} \\):<br><strong>\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)</strong>",
        },
      ],
    },
    {
      layout: "standard",
      title: "De archimedeskracht als gewicht van verplaatste vloeistof",
      content:
        'Uit de afleiding volgt:<br><br>\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)<br><br>Maar \\( \\rho_{vl} \\cdot V_{vwp} \\) is precies de <strong>massa van de verplaatste vloeistof</strong> \\( m_{vloeistof} \\). Dus:<br><br>\\( F_A = m_{vloeistof} \\cdot g \\)<br><br><strong>Diepere betekenis:</strong> De archimedeskracht is gelijk aan het <em>gewicht</em> van de vloeistof die het voorwerp verdringt. Hoe meer vloeistof verdrongen wordt (groter volume of grotere massadichtheid), hoe groter de opwaartse kracht.<br><br><div style="background:rgba(15,23,42,0.6); border-left:4px solid #60a5fa; border-radius:6px; padding:10px 14px; margin-top:8px;"><span style="color:#93c5fd; font-size:13px;">De archimedeskracht is gelijk aan het <strong>gewicht van de verplaatste vloeistof of het verplaatste gas</strong>.</span></div>',
    },
    {
      layout: "recap",
      title: "Check jezelf",
      questions: [
        {
          q: "Hoe verandert de hydrostatische druk als je twee keer zo diep duikt?",
          a: "De druk verdubbelt. \\( p = \\rho_{vl} \\cdot g \\cdot h \\), dus \\( p \\) is recht evenredig met de diepte \\( h \\).",
        },
        {
          q: "Waarom is de kracht op het ondervlak van de kubus groter dan op het bovenvlak?",
          a: "Het ondervlak bevindt zich dieper (h + z), dus de hydrostatische druk is er groter. Grotere druk op hetzelfde oppervlak geeft een grotere kracht.",
        },
        {
          q: "Een kurken blokje en een loden blokje hebben hetzelfde volume en worden allebei volledig ondergedompeld in water. Welk blokje ondervindt de grootste archimedeskracht?",
          a: "Ze ondervinden dezelfde archimedeskracht. \\( F_A \\) hangt enkel af van \\( V_{vwp} \\) en \\( \\rho_{vl} \\), niet van het materiaal van het voorwerp.",
        },
      ],
    },
  ],

  summary_slides: [
    {
      layout: "title",
      title: "Samenvatting les 2",
      subtitle: "Van hydrostatische druk naar archimedeskracht",
      badge: "Samenvatting",
      icon: "check",
    },
    {
      layout: "standard",
      title: "Overzicht: van hydrostatische druk naar archimedeskracht",
      content:
        "<strong>1. Hydrostatische druk</strong><br>\\( p = \\rho_{vl} \\cdot g \\cdot h \\): de druk in een vloeistof neemt toe met de diepte.<br><br><strong>2. Kern van de afleiding</strong><br>Het ondervlak van een ondergedompeld voorwerp ligt dieper dan het bovenvlak. Grotere druk aan de onderkant zorgt voor een netto opwaartse kracht:<br>\\( F_A = F_{onder} - F_{boven} = \\rho_{vl} \\cdot g \\cdot z \\cdot A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)<br><br><strong>3. Equivalente formulering</strong><br>\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} = m_{vloeistof} \\cdot g \\)<br>De archimedeskracht is gelijk aan het <em>gewicht van de verplaatste vloeistof</em>.",
    },
  ],

  exitTicket: {
    questions: [
      {
        id: "q1",
        type: "mc",
        question:
          "De hydrostatische druk op een diepte van 5 m in water (\\( \\rho = 1000 \\) kg/m\u00b3, g = 10 N/kg) bedraagt:",
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
};

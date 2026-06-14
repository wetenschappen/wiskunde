export default {
  id: "archimedes-les-3",
  subject: "physics",
  className: "3NW",
  title: "Les 3: Zinken, zweven, stijgen en drijven",
  description:
    "Krachtenbalans van de archimedeskracht en de zwaartekracht: wanneer zinkt, zweeft, stijgt of drijft een voorwerp? Focus op krachtendiagrammen en de dichtheidsvergelijking.",
  date: "Les 3",

  goals: [
    "Ik kan de twee krachten op een ondergedompeld voorwerp benoemen en in een krachtendiagram tekenen.",
    "Ik kan bepalen of een voorwerp zinkt, zweeft, stijgt of drijft op basis van de vergelijking van massadichtheden.",
    "Ik kan de formule voor drijven toepassen: \\( \\frac{V_{onder}}{V_{vwp}} = \\frac{\\rho}{\\rho_{vl}} \\).",
    "Ik kan de wet van Archimedes toepassen in gasomgevingen (luchtballon).",
  ],

  workbook: {
    title: "Werkboek: Archimedeskracht",
    subtitle: "Deel 3: Zinken, zweven, stijgen en drijven",
    instruction:
      "Gebruik je cursus (p. 8-15) voor de theorie en los de oefeningen op.",
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
          title: "Welke krachten werken er?",
          description:
            "Voorspel welke krachten inwerken op een ondergedompeld voorwerp en hoe hun verhouding de bewegingstoestand bepaalt.",
          action: "presentation",
          slidesKey: "hook_slides",
        },
        {
          id: "card-phet",
          type: "digital",
          title: "PhET: Drijven en zinken",
          description:
            "Ontdek de archimedeskracht interactief met de PhET-simulatie Buoyancy Basics.",
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
          title: "Zinken, zweven, stijgen en drijven",
          description:
            "Krachtenbalans, krachtendiagrammen als model en de vier bewegingstoestanden met dichtheidsvergelijking.",
          action: "presentation",
          slidesKey: "guided_slides",
        },
        {
          id: "card-workbook",
          type: "paper",
          title: "Werkboek: oefeningen les 3",
          description:
            "Krachtendiagrammen tekenen, dichtheidsvergelijking toepassen en berekeningsoefeningen over drijven.",
          action: "workbook",
          icon: "PhBookOpen",
          exercises:
            "Opdracht 5 (p. 18): Verklaar de figuur: een gouden cilinder en gouden kroon wegen evenveel in lucht. Ondergedompeld in water zijn ze niet meer in evenwicht. Wat zegt dit over hun massadichtheden?\n" +
            "Opdracht 6 (p. 18): We zien de bal opstijgen uit het water. Het deel dat boven water uitsteekt, wordt steeds groter. Wat gebeurt er op dat moment met de archimedeskracht?\n" +
            "Opdracht 7 (p. 19): Drie ballen in water: bal A drijft voor meer dan de helft, bal B exact voor de helft, bal C ligt op de bodem. Geef de juiste uitdrukking voor de massadichtheden.\n" +
            "Opdracht 9 (p. 19): Een voorwerp zinkt in een vloeistof. Teken en benoem de krachten die inwerken op het voorwerp (in correcte verhouding).\n" +
            "Opdracht 10 (p. 20): Een voorwerp zweeft in een vloeistof. Teken en benoem de krachten die inwerken op het voorwerp (in correcte verhouding).\n" +
            "Opdracht 11 (p. 20): Een voorwerp stijgt in een vloeistof. Teken en benoem de krachten die inwerken op het voorwerp (in correcte verhouding).\n" +
            "Opdracht 12 (p. 20): Een voorwerp drijft op een vloeistof. Teken en benoem de krachten die inwerken op het voorwerp (in correcte verhouding).\n" +
            "Opdracht 17 (p. 22): Een balansweegschaal met een gouden en een zilveren kroon is in evenwicht in lucht. Wat gebeurt er als je beide onderdompelt in water?\n" +
            "Opdracht 18 (p. 22): Waarom steekt van een ijsberg slechts een klein deel boven water uit? Verklaar en bereken. (massadichtheid ijs = 0,917 g/cm³, massadichtheid zeewater = 1,026 g/cm³)\n" +
            "Opdracht 19 (p. 22): Kurk drijft op water. Is het grootste deel boven of onder water? Verklaar. (massadichtheid kurk = 0,25 g/cm³)\n" +
            "Aan de slag 1 (p. 22): Hoeveel procent van een ijsberg steekt boven het wateroppervlak? (massadichtheid ijs = 0,92 g/cm³, massadichtheid zeewater = 1,02 g/cm³)\n" +
            "Aan de slag 2 (p. 23): Een stuk hout drijft op alcohol. V_onder = 28 cm³. Bereken (a) de archimedeskracht, (b) het volume van het hout en (c) de massa van het hout. (massadichtheid hout = 0,600 g/cm³, massadichtheid alcohol = 0,800 g/cm³)",
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
          title: "Samenvatting les 3",
          description:
            "Overzicht van de krachtenbalans, de vier bewegingstoestanden en de formule voor drijven.",
          action: "presentation",
          slidesKey: "summary_slides",
        },
        {
          id: "card-exit-ticket",
          type: "digital",
          title: "Exit Ticket",
          description:
            "Maak de exit ticket individueel om je begrip van zinken, zweven, stijgen en drijven te toetsen.",
          action: "exit-ticket",
        },
      ],
    },
  },

  hook_slides: [
    {
      layout: "predict",
      title: "Welke krachten werken er?",
      question:
        "Een steen wordt losgelaten onder water. Welke krachten werken er op de steen? En hoe bepaalt de verhouding tussen die krachten wat er met de steen gebeurt?",
      context:
        "Denk aan de twee krachten die je al kent: de zwaartekracht en de archimedeskracht.",
      hint: "Klik om de redenering te onthullen",
      revealText:
        "Op de steen werken de zwaartekracht \\( F_z \\) (naar beneden) en de archimedeskracht \\( F_A \\) (naar boven). Als \\( F_z > F_A \\): de steen zinkt. Als \\( F_z = F_A \\): de steen zweeft. Als \\( F_z < F_A \\): de steen stijgt. Bij drijven steekt een deel boven het vloeistofoppervlak zodat \\( F_z = F_A \\) opnieuw geldt.",
    },
  ],

  guided_slides: [
    {
      layout: "title",
      title: "Zinken, zweven, stijgen en drijven",
      subtitle: "De krachtenbalans bepaalt alles",
      badge: "Theorie",
      icon: "atom",
    },
    {
      layout: "standard",
      title: "De twee krachten op een ondergedompeld voorwerp",
      content:
        "Op elk ondergedompeld voorwerp werken precies <strong>twee krachten</strong>:<br><br>" +
        "<ul>" +
        '<li><strong><span style="color:#f87171;">Zwaartekracht \\( F_z \\)</span></strong>: werkt <em>naar beneden</em>. \\( F_z = m \\cdot g \\)</li>' +
        '<li><strong><span style="color:#60a5fa;">Archimedeskracht \\( F_A \\)</span></strong>: werkt <em>naar boven</em>. \\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)</li>' +
        "</ul><br>" +
        "De <strong>verhouding</strong> tussen \\( F_z \\) en \\( F_A \\) bepaalt volledig wat er met het voorwerp gebeurt. " +
        'In een krachtendiagram teken je \\( F_z \\) als een <span style="color:#f87171;">rode pijl naar beneden</span> en \\( F_A \\) als een <span style="color:#60a5fa;">blauwe pijl naar boven</span>. ' +
        "De <strong>lengte</strong> van de pijl stelt de grootte van de kracht voor.",
    },
    {
      layout: "standard",
      title: "Hoe teken je een krachtendiagram?",
      content:
        "Teken de twee krachtvectoren op het voorwerp. Langere pijl = grotere kracht.<br>" +
        '<div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin:16px 0;">' +
        '<div style="background:rgba(15,23,42,0.75); border:1px solid rgba(100,116,139,0.4); border-radius:10px; padding:12px 8px; text-align:center;">' +
        '<div style="font-size:10px; font-weight:700; color:#e2e8f0; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">Zinken</div>' +
        '<div style="display:flex; flex-direction:column; align-items:center;">' +
        '<span style="color:#60a5fa; font-size:12px; font-weight:700; margin-bottom:2px;">&#8593; F<sub>A</sub></span>' +
        '<div style="width:2px; height:10px; background:#60a5fa;"></div>' +
        '<div style="border:2px solid #f97316; background:rgba(249,115,22,0.1); width:32px; height:32px; border-radius:5px;"></div>' +
        '<div style="width:2px; height:22px; background:#f87171;"></div>' +
        '<span style="color:#f87171; font-size:12px; font-weight:700; margin-top:2px;">&#8595; F<sub>z</sub></span>' +
        "</div>" +
        '<div style="font-size:10px; color:#94a3b8; margin-top:7px;">\\( F_z > F_A \\)</div>' +
        '<div style="font-size:10px; color:#94a3b8;">\\( \\rho_{vwp} > \\rho_{vl} \\)</div>' +
        "</div>" +
        '<div style="background:rgba(15,23,42,0.75); border:1px solid rgba(100,116,139,0.4); border-radius:10px; padding:12px 8px; text-align:center;">' +
        '<div style="font-size:10px; font-weight:700; color:#e2e8f0; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">Zweven</div>' +
        '<div style="display:flex; flex-direction:column; align-items:center;">' +
        '<span style="color:#60a5fa; font-size:12px; font-weight:700; margin-bottom:2px;">&#8593; F<sub>A</sub></span>' +
        '<div style="width:2px; height:18px; background:#60a5fa;"></div>' +
        '<div style="border:2px solid #f97316; background:rgba(249,115,22,0.1); width:32px; height:32px; border-radius:5px;"></div>' +
        '<div style="width:2px; height:18px; background:#f87171;"></div>' +
        '<span style="color:#f87171; font-size:12px; font-weight:700; margin-top:2px;">&#8595; F<sub>z</sub></span>' +
        "</div>" +
        '<div style="font-size:10px; color:#94a3b8; margin-top:7px;">\\( F_z = F_A \\)</div>' +
        '<div style="font-size:10px; color:#94a3b8;">\\( \\rho_{vwp} = \\rho_{vl} \\)</div>' +
        "</div>" +
        '<div style="background:rgba(15,23,42,0.75); border:1px solid rgba(100,116,139,0.4); border-radius:10px; padding:12px 8px; text-align:center;">' +
        '<div style="font-size:10px; font-weight:700; color:#e2e8f0; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">Stijgen</div>' +
        '<div style="display:flex; flex-direction:column; align-items:center;">' +
        '<span style="color:#60a5fa; font-size:12px; font-weight:700; margin-bottom:2px;">&#8593; F<sub>A</sub></span>' +
        '<div style="width:2px; height:22px; background:#60a5fa;"></div>' +
        '<div style="border:2px solid #f97316; background:rgba(249,115,22,0.1); width:32px; height:32px; border-radius:5px;"></div>' +
        '<div style="width:2px; height:10px; background:#f87171;"></div>' +
        '<span style="color:#f87171; font-size:12px; font-weight:700; margin-top:2px;">&#8595; F<sub>z</sub></span>' +
        "</div>" +
        '<div style="font-size:10px; color:#94a3b8; margin-top:7px;">\\( F_z < F_A \\)</div>' +
        '<div style="font-size:10px; color:#94a3b8;">\\( \\rho_{vwp} < \\rho_{vl} \\)</div>' +
        "</div>" +
        '<div style="background:rgba(15,23,42,0.75); border:1px solid rgba(100,116,139,0.4); border-radius:10px; padding:12px 8px; text-align:center;">' +
        '<div style="font-size:10px; font-weight:700; color:#e2e8f0; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">Drijven</div>' +
        '<div style="display:flex; flex-direction:column; align-items:center;">' +
        '<span style="color:#60a5fa; font-size:12px; font-weight:700; margin-bottom:2px;">&#8593; F<sub>A</sub></span>' +
        '<div style="width:2px; height:18px; background:#60a5fa;"></div>' +
        '<div style="border-top:2px dashed #60a5fa; border-left:2px solid #f97316; border-right:2px solid #f97316; background:rgba(249,115,22,0.05); width:32px; height:13px;"></div>' +
        '<div style="border-left:2px solid #f97316; border-right:2px solid #f97316; border-bottom:2px solid #f97316; background:rgba(249,115,22,0.12); width:32px; height:19px;"></div>' +
        '<div style="width:2px; height:18px; background:#f87171;"></div>' +
        '<span style="color:#f87171; font-size:12px; font-weight:700; margin-top:2px;">&#8595; F<sub>z</sub></span>' +
        "</div>" +
        '<div style="font-size:10px; color:#94a3b8; margin-top:7px;">\\( F_z = F_A \\)</div>' +
        '<div style="font-size:10px; color:#94a3b8;">\\( V_{onder} < V_{vwp} \\)</div>' +
        "</div>" +
        "</div>" +
        "De stippellijn bij <em>drijven</em> stelt het vloeistofoppervlak voor: het bovenste deel steekt er bovenuit.",
    },
    {
      layout: "comparison",
      title: "Zinken, zweven of stijgen: de dichtheidsvergelijking",
      left: {
        title: "Zinken",
        icon: "arrow-down",
        content:
          "<strong>Conditie:</strong> \\( F_z > F_A \\)<br>" +
          "<strong>Massadichtheid:</strong> \\( \\rho_{vwp} > \\rho_{vl} \\)<br><br>" +
          "De zwaartekracht is groter dan de archimedeskracht. De resulterende kracht is neerwaarts gericht. Het voorwerp beweegt naar beneden.",
      },
      right: {
        title: "Zweven",
        icon: "equals",
        content:
          "<strong>Conditie:</strong> \\( F_z = F_A \\)<br>" +
          "<strong>Massadichtheid:</strong> \\( \\rho_{vwp} = \\rho_{vl} \\)<br><br>" +
          "De krachten zijn in evenwicht. De resulterende kracht is nul. Het voorwerp behoudt zijn bewegingstoestand en blijft op zijn diepte.",
      },
      bottom: {
        title: "Stijgen (en drijven)",
        icon: "arrow-up",
        content:
          "<strong>Conditie:</strong> \\( F_z < F_A \\)<br>" +
          "<strong>Massadichtheid:</strong> \\( \\rho_{vwp} < \\rho_{vl} \\)<br><br>" +
          "De archimedeskracht is groter dan de zwaartekracht. Het voorwerp beweegt naar boven. Eens een deel boven het vloeistofoppervlak uitsteekt, neemt \\( F_A \\) af tot \\( F_z = F_A \\): het voorwerp <strong>drijft</strong>.",
      },
    },
    {
      layout: "standard",
      title: "Drijven: de krachtenbalans aan het oppervlak",
      content:
        "Bij <strong>drijven</strong> steekt een deel van het voorwerp boven het vloeistofoppervlak. Er geldt opnieuw \\( F_z = F_A \\), maar nu is \\( V_{onder} < V_{vwp} \\).<br><br>" +
        "<strong>Formule voor het ondergedompelde volume:</strong><br>" +
        "\\[ \\frac{V_{onder}}{V_{vwp}} = \\frac{\\rho_{vwp}}{\\rho_{vl}} \\]<br>" +
        "<strong>Uitgewerkt voorbeeld: de ijsberg</strong><br>" +
        "Gegeven: \\( \\rho_{ijs} = 917 \\) kg/m³, \\( \\rho_{zeewater} = 1026 \\) kg/m³<br>" +
        "\\[ \\frac{V_{onder}}{V_{vwp}} = \\frac{917}{1026} \\approx 0{,}89 \\]<br>" +
        "Ruim <strong>89% van een ijsberg bevindt zich onder water</strong>. Slechts 11% is zichtbaar.",
    },
    {
      layout: "standard",
      title: "Archimedes in gassen: de luchtballon",
      content:
        "De wet van Archimedes geldt ook in <strong>gassen</strong>. Een luchtballon stijgt op omdat:<br><br>" +
        "<ol>" +
        "<li>Warme lucht heeft een <strong>lagere massadichtheid</strong> dan koude omgevingslucht.</li>" +
        "<li>Tijdens het opwarmen met een brander ontsnapt een deel van de koude lucht. De gemiddelde massadichtheid van ballon en inhoud daalt.</li>" +
        "<li>Wanneer \\( \\rho_{ballon} < \\rho_{lucht} \\) geldt \\( F_A > F_z \\): de ballon <strong>stijgt</strong>.</li>" +
        "<li>Door meer of minder te verwarmen regelt de piloot de hoogte.</li>" +
        "</ol><br>" +
        '<div style="background:rgba(15,23,42,0.6); border-left:4px solid #f97316; border-radius:6px; padding:10px 14px; margin-top:8px;">' +
        '<span style="color:#fdba74; font-size:13px;">Dezelfde principes gelden voor een duikboot: die past zijn gemiddelde massadichtheid aan door ballasttanks te vullen met water (zinken) of perslucht (stijgen).</span>' +
        "</div>",
    },
    {
      layout: "recap",
      title: "Check jezelf",
      questions: [
        {
          q: "Een kurkje (\\( \\rho = 200 \\) kg/m³) wordt onder water losgelaten. Wat gebeurt er en waarom?",
          a: "\\( \\rho_{kurk} < \\rho_{water} \\), dus \\( F_A > F_z \\): het kurkje stijgt en gaat uiteindelijk drijven.",
        },
        {
          q: "Welk deel van een ijsberg (\\( \\rho = 917 \\) kg/m³) steekt boven zeewater (\\( \\rho = 1026 \\) kg/m³) uit?",
          a: "\\( V_{onder}/V_{vwp} = 917/1026 \\approx 0{,}89 \\), dus ongeveer 11% steekt boven water.",
        },
        {
          q: "Wat moet er gebeuren met een luchtballon om hem te laten dalen?",
          a: "De lucht in de ballon moet afkoelen. De massadichtheid stijgt: \\( F_A < F_z \\), de ballon daalt.",
        },
      ],
    },
  ],

  summary_slides: [
    {
      layout: "title",
      title: "Samenvatting les 3",
      subtitle: "Krachtenbalans en bewegingstoestand",
      badge: "Samenvatting",
      icon: "check",
    },
    {
      layout: "standard",
      title: "Overzicht: vier bewegingstoestanden",
      content:
        '<div style="overflow-x:auto;">' +
        '<table style="width:100%; border-collapse:collapse; font-size:13px;">' +
        '<thead><tr style="background:#1e293b; color:#e2e8f0;">' +
        '<th style="padding:8px 10px; text-align:left;">Toestand</th>' +
        '<th style="padding:8px 10px; text-align:left;">Krachtenconditie</th>' +
        '<th style="padding:8px 10px; text-align:left;">Massadichtheid</th>' +
        '<th style="padding:8px 10px; text-align:left;">Resulterende kracht</th>' +
        "</tr></thead>" +
        "<tbody>" +
        '<tr style="border-bottom:1px solid #334155;">' +
        '<td style="padding:8px 10px;"><strong>Zinken</strong></td>' +
        '<td style="padding:8px 10px;">\\( F_z > F_A \\)</td>' +
        '<td style="padding:8px 10px;">\\( \\rho_{vwp} > \\rho_{vl} \\)</td>' +
        '<td style="padding:8px 10px;">neerwaarts</td>' +
        "</tr>" +
        '<tr style="border-bottom:1px solid #334155; background:#0f172a;">' +
        '<td style="padding:8px 10px;"><strong>Zweven</strong></td>' +
        '<td style="padding:8px 10px;">\\( F_z = F_A \\)</td>' +
        '<td style="padding:8px 10px;">\\( \\rho_{vwp} = \\rho_{vl} \\)</td>' +
        '<td style="padding:8px 10px;">nul (evenwicht)</td>' +
        "</tr>" +
        '<tr style="border-bottom:1px solid #334155;">' +
        '<td style="padding:8px 10px;"><strong>Stijgen</strong></td>' +
        '<td style="padding:8px 10px;">\\( F_z < F_A \\)</td>' +
        '<td style="padding:8px 10px;">\\( \\rho_{vwp} < \\rho_{vl} \\)</td>' +
        '<td style="padding:8px 10px;">opwaarts</td>' +
        "</tr>" +
        '<tr style="background:#0f172a;">' +
        '<td style="padding:8px 10px;"><strong>Drijven</strong></td>' +
        '<td style="padding:8px 10px;">\\( F_z = F_A \\), \\( V_{onder} < V_{vwp} \\)</td>' +
        '<td style="padding:8px 10px;">\\( \\rho_{vwp} < \\rho_{vl} \\)</td>' +
        '<td style="padding:8px 10px;">nul (evenwicht)</td>' +
        "</tr>" +
        "</tbody></table></div>",
    },
    {
      layout: "standard",
      title: "Formule voor drijven en toepassingen",
      content:
        "<strong>Formule:</strong><br>" +
        "\\[ \\frac{V_{onder}}{V_{vwp}} = \\frac{\\rho_{vwp}}{\\rho_{vl}} \\]<br><br>" +
        "<strong>Voorbeeld 1: IJsberg</strong><br>" +
        "\\( \\rho_{ijs} = 917 \\) kg/m³, \\( \\rho_{zeewater} = 1026 \\) kg/m³<br>" +
        "\\( V_{onder}/V_{vwp} = 0{,}89 \\): 89% onder water, slechts 11% zichtbaar.<br><br>" +
        "<strong>Voorbeeld 2: Cola-blikje</strong><br>" +
        "Gewone Cola heeft door opgeloste suiker een hogere massadichtheid dan water: zinkt. " +
        "Cola Zero heeft een massadichtheid lager dan water: drijft. " +
        "Het kleine massaverschil bepaalt de bewegingstoestand.",
    },
  ],

  exitTicket: {
    questions: [
      {
        id: "q1",
        type: "mc",
        question:
          "Een voorwerp met massadichtheid 800 kg/m³ wordt losgelaten in water (\\( \\rho = 1000 \\) kg/m³). Wat gebeurt er?",
        options: [
          "Het voorwerp zinkt.",
          "Het voorwerp zweeft.",
          "Het voorwerp stijgt en drijft uiteindelijk.",
          "Het voorwerp lost op.",
        ],
        correct: 2,
      },
      {
        id: "q2",
        type: "mc",
        question:
          "Een ijsberg heeft massadichtheid 917 kg/m³ en bevindt zich in zeewater (\\( \\rho = 1026 \\) kg/m³). Welk percentage bevindt zich onder water?",
        options: ["~10%", "~50%", "~89%", "~100%"],
        correct: 2,
      },
      {
        id: "q3",
        type: "open",
        question:
          "Leg uit waarom een luchtballon stijgt als de lucht erin opgewarmd wordt. Gebruik de begrippen massadichtheid en archimedeskracht.",
      },
    ],
  },
};

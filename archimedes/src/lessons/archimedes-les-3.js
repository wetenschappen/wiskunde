const L = `<span style="display:inline-flex;align-items:center;gap:5px;color:#f97316;font-weight:700"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" style="flex-shrink:0"><path fill="currentColor" d="M176 232a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h80a8 8 0 0 1 8 8Zm40-128a87.55 87.55 0 0 1-33.64 69.21A16.24 16.24 0 0 0 176 186v6a16 16 0 0 1-16 16H96a16 16 0 0 1-16-16v-6a16.06 16.06 0 0 0-6.23-12.66A87.59 87.59 0 0 1 40 104a88 88 0 0 1 176 0Z"/></svg>`;

export default {
  id: "archimedes-les-3",
  subject: "physics",
  className: "3NW",
  title: "Les 3: Berekeningsoefeningen",
  description:
    "Klasgespitst: strategie-assistent voor zelfstandige leerlingen + begeleid doorwerken van 9 berekeningsoefeningen over drijven, onderdompelen en dynamometer.",
  date: "Les 3",
  config: { classId: "3NW" },

  goals: [
    "Ik kan een krachtenbalans opstellen met F_z en F_A om het effect van de resulterende kracht te bepalen: zinken, zweven, stijgen of drijven (LPD F7).",
    "Ik kan bepalen welke strategie/formule ik nodig heb op basis van de situatie (drijven, volledig ondergedompeld, dynamometer).",
    "Ik kan de drijfformule toepassen om een percentage, volume of massa te berekenen.",
    "Ik kan de archimedeskracht berekenen via een dynamometermeting.",
    "Ik kan stap voor stap een berekeningsoefening structureren: gegeven → gevraagd → formule → uitwerking.",
  ],

  workbook: {
    title: "Werkboek: Berekeningsoefeningen",
    subtitle: "Deel 3: Toepassen van de archimedeskracht",
    instruction:
      "Maak deze oefeningen in volgorde. Kijk goed welke strategie je nodig hebt voor elke oefening.",
    formulaHint:
      "Welke strategie? Drijven, volledig ondergedompeld of dynamometer?",
  },

  timeline: {
    stepA: {
      step: "A",
      title: "Oriënteren en splitsen",
      time: "~5 min",
      cards: [
        {
          id: "card-recap",
          type: "class",
          title: "Korte herhaling: welke formules kennen we?",
          description:
            "Overzicht van de drie strategieën: drijven, volledig ondergedompeld, dynamometer. Klasopgave: wie werkt zelfstandig, wie werkt met de leraar?",
          action: "presentation",
          slidesKey: "hook_slides",
        },
        {
          id: "card-derivation-builder",
          type: "digital",
          title: "Afleidingbouwer Archimedeskracht",
          description:
            "Herhaal de theoretische afleiding van F_A vanuit drukverschil. Handig voor wie nog wat extra inzicht nodig heeft.",
          action: "activity",
          activityId: "archimedes-derivation-builder",
          icon: "PhMathOperations",
        },
      ],
    },
    stepB: {
      step: "B",
      title: "Inoefenen (gesplitste klas)",
      time: "~35 min",
      cards: [
        {
          id: "card-iceberg-lab",
          type: "digital",
          title: "IJsberg Oefenlab",
          description:
            "Doorloop stap voor stap de drijfformule en let op de juiste verhouding van de dichtheden.",
          action: "activity",
          activityId: "iceberg-density-lab",
          icon: "PhWaves",
        },
        {
          id: "card-workbook",
          type: "paper",
          title: "Cursus p. 22-29: oefeningen",
          description:
            "Los de oefeningen uit sectie 4.2 Toepassen zelfstandig op nadat je de strategie hebt bepaald.",
          action: "workbook",
          icon: "PhBookOpen",
          exercises:
            "Aan de slag 1 (p. 22): IJsberg: hoeveel procent steekt boven water?\n" +
            "Aan de slag 2 (p. 23): Hout op alcohol: \\( F_A \\), volume en massa.\n" +
            "Aan de slag 3 (p. 23): Onbekend gesteente: \\( F_z \\) en \\( F_A \\) via dynamometer.\n" +
            "Aan de slag 4 (p. 24): Houten kubus: kracht om volledig onder te dompelen.\n" +
            "Aan de slag 5 (p. 25): Roeiboot: maximum aantal personen.\n" +
            "Aan de slag 6 (p. 26): Twee drijvende blokken: \\( \\rho \\) rechtse blok.\n" +
            "Aan de slag 7 (p. 27): Maansteen: \\( \\rho \\) via dynamometer.\n" +
            "Aan de slag 8 (p. 28): Twee vloeistoffen: \\( \\rho \\) onbekende vloeistof.\n" +
            "Aan de slag 9 (p. 29): Hout op alcohol met \\( V_{boven} \\): massa berekenen.",
        },
        {
          id: "card-strategy",
          type: "digital",
          title: "Strategie-assistent (zelfstandig)",
          description:
            "Beantwoord de vragen om te bepalen welke formule/strategie je nodig hebt. Werk daarna de bijbehorende oefening uit in je cursus.",
          action: "activity",
          activityType: "strategyHelper",
          icon: "PhTarget",
        },
         {
           id: "card-guided",
           type: "class",
           title: "Begeleid: 9 oefeningen stap voor stap",
           description:
             "Klassikale doorloop van alle 9 berekeningsoefeningen. Elke stap wordt stuk voor stuk onthuld via de 'S'-toets.",
           action: "presentation",
           slidesKey: "calculation_slides",
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
          title: "Samenvatting: drie strategieën",
          description:
            "Welke strategie bij welke situatie? Overzicht van de aanpak voor alle oefentypes.",
          action: "presentation",
          slidesKey: "summary_slides",
        },
        {
          id: "card-exit-ticket",
          type: "digital",
          title: "Exit Ticket",
          description: "Individuele afsluitende vraag.",
          action: "exit-ticket",
        },
      ],
    },
  },

  hook_slides: [
    {
      layout: "title",
      title: "Berekeningsoefeningen",
      subtitle: "Van theorie naar strategie: welke aanpak kies jij?",
      badge: "Les 3",
      icon: "function",
    },
    {
      layout: "recap",
      title: "Wat weten we al?",
      questions: [
        {
          q: "Wat is de formule van de archimedeskracht?",
          a: "\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)",
        },
        {
          q: "Een voorwerp drijft. Welk verband geldt er tussen \\( F_z \\) en \\( F_A \\)?",
          a: "\\( F_z = F_A \\) → hieruit volgt \\( \\rho_{vwp} \\cdot V_{vwp} = \\rho_{vl} \\cdot V_{onder} \\)",
        },
        {
          q: "Hoeveel procent van een ijsberg zit onder water? (\\( \\rho_{ijs} = 0{,}917 \\), \\( \\rho_{zeewater} = 1{,}026 \\) g/cm³)",
          a: "\\( \\frac{V_{onder}}{V_{vwp}} = \\frac{0{,}917}{1{,}026} \\approx 0{,}893 \\) → 89,3% onder water, 10,7% boven.",
        },
      ],
    },
    {
      layout: "predict",
      title: "Nieuw: de dynamometermethode",
      question:
        "Een steen weegt 50 N in lucht. Ondergedompeld in water meet de dynamometer nog 32 N. Waarom is de meting lager? Hoe groot is de archimedeskracht?",
      context:
        "De dynamometer meet de kracht die het voorwerp uitoefent. In water werkt de archimedeskracht tegen de zwaartekracht in.",
      hint: "Klik om de redenering te zien",
      revealText:
        "De dynamometer meet het 'schijnbare gewicht': \\( F_{dyno} = F_z - F_A \\).\nDus \\( F_A = F_z - F_{dyno} = 50\\ \\text{N} - 32\\ \\text{N} = 18\\ \\text{N} \\).\nDit is de <strong>dynamometermethode</strong>: via het verschil tussen de meting in lucht en in vloeistof bepaal je \\( F_A \\).",
    },
    {
      layout: "split",
      title: "Drie strategieën: welke gebruik je?",
      left: {
        title: "Drijven",
        content:
          "\\( \\rho_{vwp} \\cdot V_{vwp} = \\rho_{vl} \\cdot V_{onder} \\)<br>" +
          "Voorwerp steekt boven vloeistof.<br>" +
          "<em>Voorbeeld: ijsberg, boot, drijvend blok</em>",
      },
      right: {
        title: "Dynamometer",
        content:
          "\\( F_A = F_z - F_{dyno} \\)<br>" +
          "Verschil in meting in lucht vs. vloeistof.<br>" +
          "<em>Voorbeeld: steen aan dynamometer, maansteen</em>",
      },
    },
    {
      layout: "attention",
      title: "Klasverdeling",
      content:
        "<strong>Groep 1 (zelfstandig):</strong> gebruik de strategie-assistent op je scherm en werk de oefeningen uit.<br><br>" +
        "<strong>Groep 2 (met de leraar):</strong> we doorlopen de 9 oefeningen stap voor stap. Druk <kbd>S</kbd> om elke stap te onthullen.",
    },
  ],

  calculation_slides: [
    {
      layout: "title",
      title: "9 Berekeningsoefeningen",
      subtitle:
        "Druk S om elke stap te onthullen: A) Gegeven · B) Gevraagd · C) Oplossing",
      badge: "Oefeningen",
    },
    // ────────────────────────────────────────────────
    {
      layout: "exercise",
      title: "Oef 1: IJsberg (p. 22)",
      context:
        "Een ijsberg drijft in zeewater. De dichtheid van ijs is \\( 0{,}917\\ \\text{g/cm}^3 \\) en die van zeewater is \\( 1{,}026\\ \\text{g/cm}^3 \\). Hoeveel procent steekt boven het wateroppervlak?",
      steps: [
        {
          question: "A) Gegeven",
          answer:
            "\\( \\rho_{\\text{ijs}} = 0{,}917\\ \\text{g/cm}^3 \\)<br>\\( \\rho_{\\text{zeewater}} = 1{,}026\\ \\text{g/cm}^3 \\)",
        },
        {
          question: "B) Gevraagd?",
          answer:
            "Het percentage van de ijsberg dat <strong>boven</strong> het wateroppervlak uitsteekt.",
        },
        {
          question: "C) Oplossing, Stap 1: strategie kiezen",
          answer:
            "De ijsberg <strong>drijft</strong> → evenwicht: \\( F_z = F_A \\).<br>Dit geeft: \\( \\rho_{\\text{vwp}} \\cdot V_{\\text{vwp}} \\cdot g = \\rho_{\\text{vl}} \\cdot V_{\\text{onder}} \\cdot g \\).<br>De \\( g \\) valt weg → drijfformule: \\( \\dfrac{V_{\\text{onder}}}{V_{\\text{vwp}}} = \\dfrac{\\rho_{\\text{vwp}}}{\\rho_{\\text{vl}}} \\)",
        },
        {
          question: "C) Oplossing, Stap 2: invullen",
          answer:
            "\\( \\dfrac{V_{\\text{onder}}}{V_{\\text{vwp}}} = \\dfrac{0{,}917\\ \\text{g/cm}^3}{1{,}026\\ \\text{g/cm}^3} \\approx 0{,}893 \\)<br>De eenheden (g/cm³) vallen weg in de breuk → dimensieloos getal → 89,3 % zit <strong>onder</strong> water.",
        },
        {
          question: "C) Oplossing, Stap 3: antwoord",
          answer:
            "Percentage boven water \\( = 100\\% - 89{,}3\\% = \\mathbf{10{,}7\\%} \\)<br>" +
            L +
            'Slechts een kleine top is zichtbaar: vandaar "het topje van de ijsberg"!</span>',
        },
      ],
    },
    // ────────────────────────────────────────────────
    {
      layout: "exercise",
      title: "Oef 2: Hout op alcohol (p. 23)",
      context:
        "Een stuk hout drijft op alcohol. \\( V_{\\text{onder}} = 28\\ \\text{cm}^3 \\), \\( \\rho_{\\text{hout}} = 0{,}600\\ \\text{g/cm}^3 \\), \\( \\rho_{\\text{alcohol}} = 0{,}800\\ \\text{g/cm}^3 \\). Bereken: a) \\( F_A \\), b) \\( V_{\\text{hout}} \\), c) \\( m_{\\text{hout}} \\).",
      steps: [
        {
          question: "A) Gegeven",
          answer:
            "\\( V_{\\text{onder}} = 28\\ \\text{cm}^3 \\)<br>\\( \\rho_{\\text{hout}} = 0{,}600\\ \\text{g/cm}^3 \\)<br>\\( \\rho_{\\text{alcohol}} = 0{,}800\\ \\text{g/cm}^3 \\)",
        },
        {
          question: "B) Gevraagd?",
          answer:
            "a) De archimedeskracht \\( F_A \\) (in N)<br>b) Het totale volume van het hout \\( V_{\\text{hout}} \\) (in cm³)<br>c) De massa \\( m_{\\text{hout}} \\) (in kg)",
        },
        {
          question: "C) Oplossing, a) F_A berekenen",
          answer:
            "\\( F_A = \\rho_{\\text{alcohol}} \\cdot V_{\\text{onder}} \\cdot g = 0{,}800\\ \\tfrac{\\text{g}}{\\text{cm}^3} \\cdot 28\\ \\text{cm}^3 \\cdot 9{,}81\\ \\tfrac{\\text{N}}{\\text{kg}} \\)<br>" +
            L +
            "Eenheden: \\( \\tfrac{\\text{g}}{\\text{cm}^3} \\cdot \\text{cm}^3 = \\text{g} \\). Het cm³ valt weg maar je houdt <strong>gram</strong> over, niet kilogram! Deel door 1000.</span><br>" +
            "\\( = 22{,}4\\ \\text{g} \\cdot 9{,}81\\ \\tfrac{\\text{N}}{\\text{kg}} = 0{,}0224\\ \\text{kg} \\cdot 9{,}81\\ \\tfrac{\\text{N}}{\\text{kg}} \\approx \\mathbf{0{,}22\\ \\text{N}} \\)",
        },
        {
          question: "C) Oplossing, b) V_hout berekenen",
          answer:
            "Drijfformule: \\( \\rho_{\\text{hout}} \\cdot V_{\\text{hout}} = \\rho_{\\text{alcohol}} \\cdot V_{\\text{onder}} \\)<br>" +
            "\\( V_{\\text{hout}} = \\dfrac{\\rho_{\\text{alcohol}}}{\\rho_{\\text{hout}}} \\cdot V_{\\text{onder}} = \\dfrac{0{,}800\\ \\text{g/cm}^3}{0{,}600\\ \\text{g/cm}^3} \\cdot 28\\ \\text{cm}^3 \\approx \\mathbf{37{,}3\\ \\text{cm}^3} \\)<br>" +
            L +
            "De dichtheden zijn beide in g/cm³ → de eenheid valt weg in de breuk → \\( V_{\\text{hout}} \\) blijft in cm³.</span>",
        },
        {
          question: "C) Oplossing, c) massa + controle",
          answer:
            "\\( m = \\rho_{\\text{hout}} \\cdot V_{\\text{hout}} = 0{,}600\\ \\tfrac{\\text{g}}{\\text{cm}^3} \\cdot 37{,}3\\ \\text{cm}^3 = 22{,}4\\ \\text{g} = \\mathbf{0{,}0224\\ \\text{kg}} \\)<br>" +
            "Controle: \\( F_z = m \\cdot g = 0{,}0224\\ \\text{kg} \\cdot 9{,}81\\ \\tfrac{\\text{N}}{\\text{kg}} \\approx 0{,}22\\ \\text{N} = F_A \\checkmark \\): evenwicht bevestigd.",
        },
      ],
    },
    // ────────────────────────────────────────────────
    {
      layout: "exercise",
      title: "Oef 3: Onbekend gesteente (p. 23)",
      context:
        "Een stuk gesteente heeft een massa van \\( 3{,}24\\ \\text{kg} \\). Ondergedompeld in water wijst de dynamometer \\( 10{,}6\\ \\text{N} \\) af. Bereken: a) \\( F_z \\), b) \\( F_A \\).",
      steps: [
        {
          question: "A) Gegeven",
          answer:
            "\\( m = 3{,}24\\ \\text{kg} \\)<br>\\( F_{\\text{dyno}} = 10{,}6\\ \\text{N} \\) (in water)<br>\\( g = 9{,}81\\ \\text{N/kg} \\)",
        },
        {
          question: "B) Gevraagd?",
          answer:
            "a) De zwaartekracht \\( F_z \\) (in N)<br>b) De archimedeskracht \\( F_A \\) (in N)",
        },
        {
          question: "C) Oplossing, a) F_z berekenen",
          answer:
            "\\( F_z = m \\cdot g = 3{,}24\\ \\text{kg} \\cdot 9{,}81\\ \\tfrac{\\text{N}}{\\text{kg}} \\approx \\mathbf{31{,}8\\ \\text{N}} \\)",
        },
        {
          question: "C) Oplossing, b) F_A via dynamometer",
          answer:
            "De dynamometer meet de <em>schijnbare</em> kracht. De vloeistof neemt een deel van het gewicht over:<br>" +
            "\\( F_A = F_z - F_{\\text{dyno}} = 31{,}8\\ \\text{N} - 10{,}6\\ \\text{N} = \\mathbf{21{,}2\\ \\text{N}} \\)",
        },
      ],
    },
    // ────────────────────────────────────────────────
    {
      layout: "exercise",
      title: "Oef 4: Houten kubus volledig onderdompelen (p. 24)",
      context:
        "Een houten kubus met \\( F_z = 10\\ \\text{N} \\) drijft met de helft boven water (\\( \\rho_{\\text{water}} = 1000\\ \\text{kg/m}^3 \\)). Welke minimale kracht is nodig om hem volledig te onderdompelen?",
      steps: [
        {
          question: "A) Gegeven",
          answer:
            "\\( F_z = 10\\ \\text{N} \\)<br>\\( V_{\\text{onder}} = \\tfrac{1}{2} V_{\\text{vwp}} \\) (drijft halverwege)<br>\\( \\rho_{\\text{water}} = 1000\\ \\text{kg/m}^3 \\)",
        },
        {
          question: "B) Gevraagd?",
          answer:
            "De minimale extra kracht \\( F_{\\text{extra}} \\) (in N) om de kubus volledig onder water te duwen.",
        },
        {
          question: "C) Oplossing, Stap 1: dichtheid via drijven",
          answer:
            "\\( \\dfrac{V_{\\text{onder}}}{V_{\\text{vwp}}} = \\dfrac{\\rho_{\\text{hout}}}{\\rho_{\\text{water}}} \\Rightarrow \\dfrac{1}{2} = \\dfrac{\\rho_{\\text{hout}}}{1000\\ \\text{kg/m}^3} \\Rightarrow \\rho_{\\text{hout}} = 500\\ \\text{kg/m}^3 \\)",
        },
        {
          question: "C) Oplossing, Stap 2: volume van de kubus",
          answer:
            "\\( m = \\dfrac{F_z}{g} = \\dfrac{10\\ \\text{N}}{9{,}81\\ \\text{N/kg}} \\approx 1{,}02\\ \\text{kg} \\)<br>" +
            "\\( V = \\dfrac{m}{\\rho_{\\text{hout}}} = \\dfrac{1{,}02\\ \\text{kg}}{500\\ \\text{kg/m}^3} = 2{,}04 \\times 10^{-3}\\ \\text{m}^3 \\)",
        },
        {
          question: "C) Oplossing, Stap 3: F_A bij volledige onderdompeling",
          answer:
            "\\( F_A^{\\text{vol}} = \\rho_{\\text{water}} \\cdot V \\cdot g = 1000\\ \\tfrac{\\text{kg}}{\\text{m}^3} \\cdot 2{,}04 \\times 10^{-3}\\ \\text{m}^3 \\cdot 9{,}81\\ \\tfrac{\\text{N}}{\\text{kg}} \\approx 20\\ \\text{N} \\)",
        },
        {
          question: "C) Oplossing, Stap 4: benodigde extra kracht",
          answer:
            "\\( F_{\\text{extra}} = F_A^{\\text{vol}} - F_z = 20\\ \\text{N} - 10\\ \\text{N} = \\mathbf{10\\ \\text{N}} \\)<br>" +
            L +
            "Bij drijven was \\( F_A = F_z = 10\\ \\text{N} \\). Volledig ondergedompeld verdubbelt \\( V_{\\text{onder}} \\) → \\( F_A \\) verdubbelt. Het verschil (10 N) moet je zelf leveren.</span>",
        },
      ],
    },
    ,
    // ────────────────────────────────────────────────
    {
      layout: "exercise",
      title: "Oef 5: Roeiboot (p. 25)",
      context:
        "Een roeiboot heeft massa \\( 80\\ \\text{kg} \\) en volume \\( 1{,}50\\ \\text{m}^3 \\). Gemiddelde massa per persoon: \\( 70\\ \\text{kg} \\). \\( \\rho_{\\text{water}} = 1000\\ \\text{kg/m}^3 \\). Hoeveel personen mogen mee zonder dat de boot zinkt?",
      steps: [
        {
          question: "A) Gegeven",
          answer:
            "\\( m_{\\text{boot}} = 80\\ \\text{kg} \\)<br>\\( V_{\\text{boot}} = 1{,}50\\ \\text{m}^3 \\)<br>\\( m_{\\text{pers}} = 70\\ \\text{kg} \\)<br>\\( \\rho_{\\text{water}} = 1000\\ \\text{kg/m}^3 \\)",
        },
        {
          question: "B) Gevraagd?",
          answer:
            "Het maximum aantal personen \\( n \\) zodat de boot niet zinkt.",
        },
        {
          question: "C) Oplossing, Stap 1: maximale F_A",
          answer:
            "De boot zinkt niet zolang \\( F_z \\leq F_A \\). Maximum \\( F_A \\) bij volledige onderdompeling:<br>" +
            "\\( F_A^{\\max} = \\rho_{\\text{water}} \\cdot V_{\\text{boot}} \\cdot g = 1000\\ \\tfrac{\\text{kg}}{\\text{m}^3} \\cdot 1{,}50\\ \\text{m}^3 \\cdot 9{,}81\\ \\tfrac{\\text{N}}{\\text{kg}} = 14\\,715\\ \\text{N} \\)",
        },
        {
          question: "C) Oplossing, Stap 2: ongelijkheid opstellen",
          answer:
            "\\( (m_{\\text{boot}} + n \\cdot m_{\\text{pers}}) \\cdot g \\leq F_A^{\\max} \\)<br>" +
            "\\( (80\\ \\text{kg} + n \\cdot 70\\ \\text{kg}) \\cdot 9{,}81\\ \\tfrac{\\text{N}}{\\text{kg}} \\leq 14\\,715\\ \\text{N} \\)<br>" +
            "\\( 80\\ \\text{kg} + 70n\\ \\text{kg} \\leq 1500\\ \\text{kg} \\)<br>" +
            "\\( 70n \\leq 1420\\ \\text{kg} \\Rightarrow n \\leq 20{,}3 \\)",
        },
        {
          question: "C) Oplossing, Stap 3: antwoord",
          answer:
            "Maximum \\( \\mathbf{n = 20\\ \\text{personen}} \\).<br>" +
            L +
            "Afronden naar <strong>beneden</strong>: 21 personen zou de boot doen zinken.</span>",
        },
      ],
    },
    // ────────────────────────────────────────────────
    {
      layout: "exercise",
      title: "Oef 6: Twee drijvende blokken (p. 26)",
      context:
        "Twee blokken, hoogte \\( 11{,}0\\ \\text{cm} \\), grondvlak \\( 12{,}0\\ \\text{cm} \\times 12{,}0\\ \\text{cm} \\). Blok A: \\( 6{,}0\\ \\text{cm} \\) boven vloeistof, \\( \\rho_A = 1{,}6\\ \\text{g/cm}^3 \\). Blok B: \\( 3{,}0\\ \\text{cm} \\) boven vloeistof. Bereken \\( \\rho_B \\).",
      steps: [
        {
          question: "A) Gegeven",
          answer:
            "\\( h = 11{,}0\\ \\text{cm},\\ a = 12{,}0\\ \\text{cm} \\)<br>Blok A: \\( h_{\\text{boven}} = 6{,}0\\ \\text{cm},\\ \\rho_A = 1{,}6\\ \\text{g/cm}^3 \\)<br>Blok B: \\( h_{\\text{boven}} = 3{,}0\\ \\text{cm} \\)",
        },
        {
          question: "B) Gevraagd?",
          answer: "De dichtheid \\( \\rho_B \\) van blok B (in g/cm³).",
        },
        {
          question: "C) Oplossing, Stap 1: volumes berekenen",
          answer:
            "\\( V_{\\text{vwp}} = 12{,}0 \\cdot 12{,}0 \\cdot 11{,}0\\ \\text{cm}^3 = 1584\\ \\text{cm}^3 \\) (zelfde voor beide)<br>" +
            "\\( V_{\\text{onder},A} = 12{,}0 \\cdot 12{,}0 \\cdot (11{,}0 - 6{,}0)\\ \\text{cm}^3 = 144 \\cdot 5{,}0\\ \\text{cm}^3 = 720\\ \\text{cm}^3 \\)<br>" +
            "\\( V_{\\text{onder},B} = 12{,}0 \\cdot 12{,}0 \\cdot (11{,}0 - 3{,}0)\\ \\text{cm}^3 = 144 \\cdot 8{,}0\\ \\text{cm}^3 = 1152\\ \\text{cm}^3 \\)",
        },
        {
          question: "C) Oplossing, Stap 2: drijfformule vergelijken",
          answer:
            "Voor elk blok: \\( \\rho \\cdot V_{\\text{vwp}} = \\rho_{\\text{vl}} \\cdot V_{\\text{onder}} \\). Delen door elkaar:<br>" +
            "\\( \\dfrac{\\rho_B}{\\rho_A} = \\dfrac{V_{\\text{onder},B}}{V_{\\text{onder},A}} \\)<br>" +
            "\\( \\rho_B = \\rho_A \\cdot \\dfrac{V_{\\text{onder},B}}{V_{\\text{onder},A}} = 1{,}6\\ \\tfrac{\\text{g}}{\\text{cm}^3} \\cdot \\dfrac{1152\\ \\text{cm}^3}{720\\ \\text{cm}^3} = 1{,}6 \\cdot 1{,}6 = \\mathbf{2{,}6\\ \\text{g/cm}^3} \\)",
        },
      ],
    },
    // ────────────────────────────────────────────────
    {
      layout: "exercise",
      title: "Oef 7: Maansteen (p. 27)",
      context:
        "Een maansteen heeft massa \\( 3{,}24\\ \\text{kg} \\). Dynamometer in water: \\( 10{,}6\\ \\text{N} \\). Gebruik \\( g = 10\\ \\text{N/kg} \\). Bereken de massadichtheid.",
      steps: [
        {
          question: "A) Gegeven",
          answer:
            "\\( m = 3{,}24\\ \\text{kg} \\)<br>\\( F_{\\text{dyno}} = 10{,}6\\ \\text{N} \\) (in water)<br>\\( \\rho_{\\text{water}} = 1000\\ \\text{kg/m}^3 \\)<br>\\( g = 10\\ \\text{N/kg} \\)",
        },
        {
          question: "B) Gevraagd?",
          answer: "De massadichtheid \\( \\rho_{\\text{steen}} \\) in kg/m³.",
        },
        {
          question: "C) Oplossing, Stap 1: F_z en F_A",
          answer:
            "\\( F_z = m \\cdot g = 3{,}24\\ \\text{kg} \\cdot 10\\ \\tfrac{\\text{N}}{\\text{kg}} = 32{,}4\\ \\text{N} \\)<br>" +
            "\\( F_A = F_z - F_{\\text{dyno}} = 32{,}4\\ \\text{N} - 10{,}6\\ \\text{N} = 21{,}8\\ \\text{N} \\)",
        },
        {
          question: "C) Oplossing, Stap 2: volume via F_A",
          answer:
            "\\( F_A = \\rho_{\\text{water}} \\cdot V \\cdot g \\Rightarrow V = \\dfrac{F_A}{\\rho_{\\text{water}} \\cdot g} = \\dfrac{21{,}8\\ \\text{N}}{1000\\ \\frac{\\text{kg}}{\\text{m}^3} \\cdot 10\\ \\frac{\\text{N}}{\\text{kg}}} = 2{,}18 \\times 10^{-3}\\ \\text{m}^3 \\)",
        },
        {
          question: "C) Oplossing, Stap 3: dichtheid",
          answer:
            "\\( \\rho = \\dfrac{m}{V} = \\dfrac{3{,}24\\ \\text{kg}}{2{,}18 \\times 10^{-3}\\ \\text{m}^3} \\approx \\mathbf{1487\\ \\text{kg/m}^3} \\)",
        },
      ],
    },
    // ────────────────────────────────────────────────
    {
      layout: "exercise",
      title: "Oef 8: Twee vloeistoffen (p. 28)",
      context:
        "Dynamometer in lucht: \\( 90\\ \\text{N} \\). In water: \\( 60\\ \\text{N} \\). In onbekende vloeistof: \\( 20\\ \\text{N} \\). \\( \\rho_{\\text{water}} = 1000\\ \\text{kg/m}^3 \\). Bereken \\( \\rho_{\\text{vloeistof}} \\).",
      steps: [
        {
          question: "A) Gegeven",
          answer:
            "\\( F_z = 90\\ \\text{N} \\) (in lucht = echte zwaartekracht)<br>\\( F_{\\text{dyno,water}} = 60\\ \\text{N} \\)<br>\\( F_{\\text{dyno,onbekend}} = 20\\ \\text{N} \\)<br>\\( \\rho_{\\text{water}} = 1000\\ \\text{kg/m}^3 \\)",
        },
        {
          question: "B) Gevraagd?",
          answer:
            "De dichtheid \\( \\rho_{\\text{onbekend}} \\) van de onbekende vloeistof (in kg/m³).",
        },
        {
          question: "C) Oplossing, Stap 1: archimedeskrachten",
          answer:
            "\\( F_{A,\\text{water}} = F_z - F_{\\text{dyno,water}} = 90\\ \\text{N} - 60\\ \\text{N} = 30\\ \\text{N} \\)<br>" +
            "\\( F_{A,\\text{onbekend}} = F_z - F_{\\text{dyno,onbekend}} = 90\\ \\text{N} - 20\\ \\text{N} = 70\\ \\text{N} \\)",
        },
        {
          question: "C) Oplossing, Stap 2: volume via water",
          answer:
            "\\( V = \\dfrac{F_{A,\\text{water}}}{\\rho_{\\text{water}} \\cdot g} = \\dfrac{30\\ \\text{N}}{1000\\ \\frac{\\text{kg}}{\\text{m}^3} \\cdot 9{,}81\\ \\frac{\\text{N}}{\\text{kg}}} \\approx 3{,}06 \\times 10^{-3}\\ \\text{m}^3 \\)",
        },
        {
          question: "C) Oplossing, Stap 3: dichtheid onbekende vloeistof",
          answer:
            "\\( \\rho_{\\text{onbekend}} = \\dfrac{F_{A,\\text{onbekend}}}{V \\cdot g} = \\dfrac{70\\ \\text{N}}{3{,}06 \\times 10^{-3}\\ \\text{m}^3 \\cdot 9{,}81\\ \\frac{\\text{N}}{\\text{kg}}} \\approx \\mathbf{2332\\ \\text{kg/m}^3} \\)",
        },
      ],
    },
    // ────────────────────────────────────────────────
    {
      layout: "exercise",
      title: "Oef 9: Hout op alcohol, V_boven gegeven (p. 29)",
      context:
        "Hout drijft op alcohol. \\( V_{\\text{boven}} = 7{,}80\\ \\text{dm}^3 \\), \\( \\rho_{\\text{hout}} = 0{,}600\\ \\text{g/cm}^3 \\), \\( \\rho_{\\text{alcohol}} = 0{,}800\\ \\text{g/cm}^3 \\). Bereken de massa van het hout.",
      steps: [
        {
          question: "A) Gegeven",
          answer:
            "\\( V_{\\text{boven}} = 7{,}80\\ \\text{dm}^3 = 7800\\ \\text{cm}^3 \\)<br>\\( \\rho_{\\text{hout}} = 0{,}600\\ \\text{g/cm}^3 \\)<br>\\( \\rho_{\\text{alcohol}} = 0{,}800\\ \\text{g/cm}^3 \\)",
        },
        {
          question: "B) Gevraagd?",
          answer: "De massa \\( m_{\\text{hout}} \\) in kg.",
        },
        {
          question: "C) Oplossing, Stap 1: stelsel opstellen",
          answer:
            "We kennen \\( V_{\\text{boven}} \\) maar niet \\( V_{\\text{vwp}} \\) of \\( V_{\\text{onder}} \\) afzonderlijk. Twee vergelijkingen:<br>" +
            "1. Drijfformule: \\( \\rho_{\\text{hout}} \\cdot V_{\\text{vwp}} = \\rho_{\\text{alc}} \\cdot V_{\\text{onder}} \\)<br>" +
            "2. Volumerelatie: \\( V_{\\text{vwp}} = V_{\\text{onder}} + V_{\\text{boven}} \\)",
        },
        {
          question: "C) Oplossing, Stap 2: substitueren en oplossen",
          answer:
            "Vul 2 in 1: \\( 0{,}600 \\cdot V_{\\text{vwp}} = 0{,}800 \\cdot (V_{\\text{vwp}} - 7800\\ \\text{cm}^3) \\)<br>" +
            "\\( 0{,}600\\, V_{\\text{vwp}} = 0{,}800\\, V_{\\text{vwp}} - 6240\\ \\text{cm}^3 \\)<br>" +
            "\\( 6240\\ \\text{cm}^3 = 0{,}200\\, V_{\\text{vwp}} \\Rightarrow V_{\\text{vwp}} = 31\\,200\\ \\text{cm}^3 \\)",
        },
        {
          question: "C) Oplossing, Stap 3: massa berekenen",
          answer:
            "\\( m = \\rho_{\\text{hout}} \\cdot V_{\\text{vwp}} = 0{,}600\\ \\tfrac{\\text{g}}{\\text{cm}^3} \\cdot 31\\,200\\ \\text{cm}^3 = 18\\,720\\ \\text{g} = \\mathbf{18{,}7\\ \\text{kg}} \\)",
        },
      ],
    },
  ],

  summary_slides: [
    {
      layout: "title",
      title: "Drie strategieën",
      subtitle: "Wanneer gebruik je welke?",
      badge: "Samenvatting",
      icon: "check",
    },
    {
      layout: "standard",
      title: "Strategie-overzicht",
      content:
        "<strong>1. Drijven</strong> (gedeeltelijk boven vloeistof):<br>" +
        "\\( \\dfrac{V_{onder}}{V_{vwp}} = \\dfrac{\\rho_{vwp}}{\\rho_{vl}} \\)<br><br>" +
        "<strong>2. Volledig ondergedompeld</strong>:<br>" +
        "\\( F_A = \\rho_{vl} \\cdot V_{vwp} \\cdot g \\)<br><br>" +
        "<strong>3. Dynamometer</strong>:<br>" +
        "\\( F_A = F_z - F_{dynamometer} \\)<br>" +
        "\\( F_z = m \\cdot g \\)",
    },
    {
      layout: "standard",
      title: "Eenheden: let op!",
      content:
        "Als dichtheden in <strong>g/cm³</strong> en volumes in <strong>cm³</strong> zijn gegeven:<br><br>" +
        "- g/cm³ × cm³ = <strong>gram</strong> (niet kilogram!)<br>" +
        "- Deel door 1000 om naar kg te gaan<br>" +
        "- Of werk alles consequent in SI: kg/m³ en m³<br><br>" +
        "<em>Tip: als beide dichtheden in g/cm³ zijn, valt de eenheid weg in een verhouding.</em>",
    },
  ],

  exitTicket: {
    questions: [
      {
        id: "q1",
        type: "mc",
        question:
          "Een boot drijft rustig in het water. Welk verband geldt er tussen de zwaartekracht \\( F_z \\) en de archimedeskracht \\( F_A \\)?",
        options: [
          "\\( F_z > F_A \\) (boot zinkt)",
          "\\( F_z = F_A \\) (evenwicht)",
          "\\( F_z < F_A \\) (boot stijgt)",
          "\\( F_A = 0 \\) (geen opwaartse kracht)",
        ],
        correct: 1,
      },
      {
        id: "q2",
        type: "mc",
        question:
          "Je ziet een oefening met een dynamometer: het voorwerp weegt 80 N in lucht en 50 N in water. Welke formule gebruik je om \\( F_A \\) te berekenen?",
        options: [
          "\\( F_A = \\rho \\cdot g \\cdot V \\)",
          "\\( F_A = F_z - F_{dyno} \\)",
          "\\( F_A = m \\cdot g \\)",
          "\\( F_A = F_z + F_{dyno} \\)",
        ],
        correct: 1,
      },
      {
        id: "q3",
        type: "open",
        question:
          "Een houten blok drijft met de helft boven water. Je moet de kracht berekenen die nodig is om het blok volledig onder water te duwen. Welke twee stappen doorloop je? Welke formules gebruik je in elke stap?",
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
    "iceberg-density-lab": {
      type: "icebergDensityActivity",
      title: "IJsberg Oefenlab",
      instruction:
        "Werk de drijfformule stap voor stap uit en let op de juiste verhouding van de dichtheden.",
    },
  },
};

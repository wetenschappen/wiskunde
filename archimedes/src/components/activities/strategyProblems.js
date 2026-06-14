export const PROBLEMS = [
  {
    id: 1,
    title: "IJsberg",
    page: 22,
    strategyId: "float_percent",
    given: [
      "\\( \\rho_{ijs} = 0{,}917\\ \\text{g/cm}^3 \\)",
      "\\( \\rho_{zeewater} = 1{,}026\\ \\text{g/cm}^3 \\)",
    ],
    asked: "Hoeveel % steekt boven het wateroppervlak?",
    hints: [
      {
        label: "Strategie",
        text: "De ijsberg drijft. Bij drijven geldt \\( F_z = F_A \\). Daaruit volgt \\( \\frac{V_{onder}}{V_{vwp}} = \\frac{\\rho_{vwp}}{\\rho_{vl}} \\). Welke dichtheden vul je in?",
      },
      {
        label: "Aanpak",
        text: "De formule geeft de fractie <strong>onder</strong> water. Vermenigvuldig met 100 voor het percentage. Hoeveel procent zit er dan <strong>boven</strong> water? Eenheden vallen weg in de breuk.",
      },
    ],
  },
  {
    id: 2,
    title: "Hout op alcohol",
    page: 23,
    strategyId: "float_force",
    given: [
      "\\( V_{onder} = 28\\ \\text{cm}^3 \\)",
      "\\( \\rho_{hout} = 0{,}600\\ \\text{g/cm}^3 \\)",
      "\\( \\rho_{alcohol} = 0{,}800\\ \\text{g/cm}^3 \\)",
    ],
    asked: "a) F_A, b) V_hout, c) m_hout",
    hints: [
      {
        label: "a) F_A: Let op eenheden!",
        text: "Gebruik \\( F_A = \\rho_{vl} \\cdot V_{onder} \\cdot g \\). De dichtheid staat in g/cm³, volume in cm³. Als je vermenigvuldigt: g/cm³ × cm³ = gram, niet kilogram! Deel je massa door 1000 voordat je \\( g \\) gebruikt.",
      },
      {
        label: "b) + c) V_hout en massa",
        text: "Gebruik de drijfformule: \\( \\rho_{hout} \\cdot V_{hout} = \\rho_{alcohol} \\cdot V_{onder} \\). Los op naar \\( V_{hout} \\). Daarna \\( m = \\rho_{hout} \\cdot V_{hout} \\). Controleer: is \\( F_z \\) gelijk aan \\( F_A \\)?",
      },
    ],
  },
  {
    id: 3,
    title: "Onbekend gesteente",
    page: 23,
    strategyId: "dyno_single",
    given: [
      "\\( m = 3{,}24\\ \\text{kg} \\)",
      "\\( F_{dyno} = 10{,}6\\ \\text{N} \\) (in water)",
    ],
    asked: "a) F_z, b) F_A",
    hints: [
      {
        label: "a) Zwaartekracht",
        text: "Gebruik de eenvoudigste formule: \\( F_z = m \\cdot g \\). Je hebt \\( m \\) en \\( g = 9{,}81 \\text{ N/kg} \\). Wat wordt \\( F_z \\)?",
      },
      {
        label: "b) Archimedeskracht via dynamometer",
        text: "De dynamometer meet het schijnbare gewicht. De archimedeskracht is het verschil: \\( F_A = F_z - F_{dyno} \\). De vloeistof neemt een deel van het gewicht over.",
      },
    ],
  },
  {
    id: 4,
    title: "Kubus onderdompelen",
    page: 24,
    strategyId: "sub_push",
    given: [
      "\\( F_z = 10\\ \\text{N} \\)",
      "Kubus drijft met helft boven water",
      "\\( \\rho_{water} = 1000\\ \\text{kg/m}^3 \\)",
    ],
    asked: "Minimale kracht om volledig onder te duwen",
    hints: [
      {
        label: "Stap 1: dichtheid hout",
        text: "De kubus drijft met de helft boven water, dus \\( V_{onder} = \\frac{1}{2} V_{vwp} \\). Gebruik de drijfformule: \\( \\rho_{hout} / \\rho_{water} = V_{onder} / V_{vwp} \\). Wat is \\( \\rho_{hout} \\)?",
      },
      {
        label: "Stap 2: extra kracht",
        text: "Bereken \\( V_{vwp} \\) via \\( m = F_z / g \\) en \\( V = m / \\rho_{hout} \\). Bereken dan \\( F_A^{volledig} = \\rho_{water} \\cdot V \\cdot g \\). De extra kracht is het verschil met \\( F_z \\).",
      },
    ],
  },
  {
    id: 5,
    title: "Roeiboot",
    page: 25,
    strategyId: "sub_boat",
    given: [
      "\\( m_{boot} = 80\\ \\text{kg} \\)",
      "\\( V_{boot} = 1{,}50\\ \\text{m}^3 \\)",
      "\\( m_{pers} = 70\\ \\text{kg} \\)",
      "\\( \\rho_{water} = 1000\\ \\text{kg/m}^3 \\)",
    ],
    asked: "Maximum aantal personen",
    hints: [
      {
        label: "Maximale F_A",
        text: "De boot zinkt niet zolang \\( F_z \\leq F_A \\). De maximale \\( F_A \\) krijg je bij volledige onderdompeling: \\( F_A^{max} = \\rho_{water} \\cdot V_{boot} \\cdot g \\). Bereken dit eerst.",
      },
      {
        label: "Ongelijkheid oplossen",
        text: "Stel op: \\( (m_{boot} + n \\cdot m_{pers}) \\cdot g \\leq F_A^{max} \\). De \\( g \\) kun je links en rechts schrappen. Los op naar \\( n \\). Rond af naar beneden: een halve persoon kan niet.",
      },
    ],
  },
  {
    id: 6,
    title: "Twee drijvende blokken",
    page: 26,
    strategyId: "float_force",
    given: [
      "Hoogte: 11,0 cm, grondvlak 12,0×12,0 cm",
      "Blok A: 6,0 cm boven, \\( \\rho_A = 1{,}6\\ \\text{g/cm}^3 \\)",
      "Blok B: 3,0 cm boven",
    ],
    asked: "Dichtheid van blok B",
    hints: [
      {
        label: "Volumes onder water",
        text: "Bereken \\( V_{onder} \\) voor elk blok: grondvlak × hoogte onder water. Blok A: \\( 11{,}0 - 6{,}0 = 5{,}0 \\text{ cm} \\) onder. Blok B: \\( 11{,}0 - 3{,}0 = 8{,}0 \\text{ cm} \\) onder. Grondvlak is \\( 12{,}0 \\times 12{,}0 \\text{ cm}^2 \\).",
      },
      {
        label: "Verhouding gebruiken",
        text: "Beide blokken drijven in dezelfde vloeistof. De drijfformule geeft: \\( \\rho \\cdot V_{vwp} = \\rho_{vl} \\cdot V_{onder} \\). Omdat \\( V_{vwp} \\) en \\( \\rho_{vl} \\) gelijk zijn voor A en B, kun je de verhouding \\( \\rho_B / \\rho_A = V_{onder,B} / V_{onder,A} \\) gebruiken.",
      },
    ],
  },
  {
    id: 7,
    title: "Maansteen",
    page: 27,
    strategyId: "dyno_single",
    given: [
      "\\( m = 3{,}24\\ \\text{kg} \\)",
      "\\( F_{dyno} = 10{,}6\\ \\text{N} \\) (in water)",
      "\\( g = 10\\ \\text{N/kg} \\)",
    ],
    asked: "Massadichtheid van de maansteen",
    hints: [
      {
        label: "F_z en F_A",
        text: "Begin met \\( F_z = m \\cdot g \\) (met \\( g = 10 \\text{ N/kg} \\)). Daarna \\( F_A = F_z - F_{dyno} \\).",
      },
      {
        label: "Volume en dichtheid",
        text: "Via \\( F_A = \\rho_{water} \\cdot V \\cdot g \\) kun je \\( V \\) berekenen. Omdat de steen volledig ondergedompeld is, is \\( V_{vwp} = V \\). Daarna \\( \\rho = m / V \\).",
      },
    ],
  },
  {
    id: 8,
    title: "Twee vloeistoffen",
    page: 28,
    strategyId: "dyno_double",
    given: [
      "\\( F_{lucht} = 90\\ \\text{N} \\)",
      "\\( F_{water} = 60\\ \\text{N} \\)",
      "\\( F_{onbekend} = 20\\ \\text{N} \\)",
      "\\( \\rho_{water} = 1000\\ \\text{kg/m}^3 \\)",
    ],
    asked: "Dichtheid van de onbekende vloeistof",
    hints: [
      {
        label: "Archimedeskrachten",
        text: "Bereken \\( F_A \\) voor beide vloeistoffen: \\( F_A = F_z - F_{dyno} \\). In water: \\( 90 - 60 = 30 \\text{ N} \\). In de onbekende vloeistof: \\( 90 - 20 = 70 \\text{ N} \\). Het volume is in beide gevallen hetzelfde.",
      },
      {
        label: "Dichtheid via verhouding",
        text: "Gebruik \\( F_A = \\rho \\cdot V \\cdot g \\). Omdat \\( V \\) en \\( g \\) gelijk zijn, geldt: \\( \\frac{\\rho_{onb}}{\\rho_{water}} = \\frac{F_{A,onb}}{F_{A,water}} \\). Of bereken eerst \\( V \\) via de meting in water.",
      },
    ],
  },
  {
    id: 9,
    title: "Hout op alcohol (V_boven)",
    page: 29,
    strategyId: "float_mass",
    given: [
      "\\( V_{boven} = 7{,}80\\ \\text{dm}^3 = 7800\\ \\text{cm}^3 \\)",
      "\\( \\rho_{hout} = 0{,}600\\ \\text{g/cm}^3 \\)",
      "\\( \\rho_{alcohol} = 0{,}800\\ \\text{g/cm}^3 \\)",
    ],
    asked: "Massa van het hout",
    hints: [
      {
        label: "Stelsel van 2 vergelijkingen",
        text: "Je kent \\( V_{boven} \\) maar niet \\( V_{vwp} \\) of \\( V_{onder} \\) afzonderlijk. Je hebt twee verbanden: (1) de drijfformule: \\( \\rho_{hout} \\cdot V_{vwp} = \\rho_{alc} \\cdot V_{onder} \\). (2) \\( V_{vwp} = V_{onder} + V_{boven} \\). Twee onbekenden, twee vergelijkingen: los op!",
      },
      {
        label: "Substitueren en oplossen",
        text: "Vul \\( V_{onder} = V_{vwp} - V_{boven} \\) in in de drijfformule. Je krijgt één vergelijking met één onbekende (\\( V_{vwp} \\)). Daarna \\( m = \\rho_{hout} \\cdot V_{vwp} \\). Let op: volume in cm³, dichtheid in g/cm³ → massa in gram. Omzetten naar kg.",
      },
    ],
  },
];

export default {
  id: "archimedes-les-4",
  subject: "physics",
  className: "3NW",
  title: "Les 4: Consolidatie en verdieping",
  description:
    "Verdiepende oefeningen op de archimedeskracht: toepassen en analyseren van complexe vraagstukken over drijven, zinken en de dynamometermethode.",
  date: "Les 4",

  goals: [
    "Ik kan complexe vraagstukken over de archimedeskracht stap voor stap oplossen.",
    "Ik kan de dynamometermethode gebruiken om massadichtheid of volume te bepalen.",
    "Ik kan analyseren wat er verandert als randcondities wijzigen (temperatuur, vloeistof, volume).",
    "Ik kan verbanden leggen tussen de archimedeskracht en realistische toepassingen (schepen, eieren, maanstenen).",
  ],

  workbook: {
    title: "Werkboek: Archimedeskracht",
    subtitle: "Deel 4: Toepassen en analyseren",
    instruction:
      "Gebruik je cursus (p. 23-32) voor de oefeningen op niveau toepassen en analyseren.",
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
          title: "De gouden kroon van Archimedes",
          description:
            "Hoe kon Archimedes bewijzen dat de kroon van de koning niet van zuiver goud was, zonder ze te smelten?",
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
          title: "Complexe vraagstukken oplossen",
          description:
            "Begeleide aanpak voor verdiepende oefeningen: dynamometermethode, bootproblemen en realistische toepassingen.",
          action: "presentation",
          slidesKey: "guided_slides",
        },
        {
          id: "card-workbook",
          type: "paper",
          title: "Werkboek: oefeningen les 4",
          description:
            "Verdiepende oefeningen over de dynamometermethode, drijven en realistische toepassingen.",
          action: "workbook",
          icon: "PhBookOpen",
          exercises:
            "Aan de slag 4 (p. 24): Een houten kubus hangt aan een dynamometer: 10 N. In water drijft hij voor de helft. Welke kracht is minimaal nodig om de kubus volledig onder water te duwen?\n" +
            "Aan de slag 5 (p. 25): Een roeiboot: massa 80 kg, volume 1,50 m³. Gemiddelde massa per persoon: 70 kg. Hoeveel personen mogen mee zodat de boot niet zinkt?\n" +
            "Aan de slag 6 (p. 26): Twee rechthoekige blokken drijven op water. Linkse steekt 6,0 cm uit, rechtse 3,0 cm. Grondvlak 12,0 cm x 12,0 cm, hoogte 11,0 cm. Massadichtheid linkse blok = 1,6 g/cm³. Bereken de massadichtheid van het rechtse blok.\n" +
            "Aan de slag 8 (p. 28): Dynamometer: 60 N (voorwerp volledig in water), 90 N (in lucht), 20 N (in onbekende vloeistof). Bereken de massadichtheid van de onbekende vloeistof.\n" +
            "Aan de slag 9 (p. 29): Massa hout bepalen via drijven op alcohol. Volume boven vloeistof = 7,80 dm³. (massadichtheid hout = 0,600 g/cm³, massadichtheid alcohol = 0,800 g/cm³)\n" +
            "Aan de slag 2 (p. 30): Cola-experiment: duw gewone Cola en Cola Zero onder water, net onder het vloeistofniveau, en laat los. Beantwoord de vragen over beweging en krachten bij loslaten en in evenwichtspositie.\n" +
            "Aan de slag 3 (p. 31): Vers ei en rot ei in water: welk ei is het rotte ei? Opdracht: laat een ei zinken, zweven en drijven door zout toe te voegen aan water.",
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
          title: "Eindoverzicht: de archimedeskracht",
          description:
            "Volledig overzicht van de module: wet van Archimedes, vier bewegingstoestanden en realistische toepassingen.",
          action: "presentation",
          slidesKey: "summary_slides",
        },
        {
          id: "card-exit-ticket",
          type: "digital",
          title: "Exit Ticket",
          description:
            "Maak de exit ticket individueel om je begrip van complexe archimedeskrachtvraagstukken te toetsen.",
          action: "exit-ticket",
        },
      ],
    },
  },

  hook_slides: [
    {
      layout: "predict",
      title: "De gouden kroon van Archimedes",
      question:
        "Archimedes moet controleren of de kroon van de koning van zuiver goud is. De kroon en een stuk zuiver goud hebben dezelfde massa. Hoe kan hij dit testen zonder de kroon te smelten?",
      context:
        "Massadichtheid goud: 19 300 kg/m³. Massadichtheid zilver: 10 500 kg/m³.",
      hint: "Klik om de methode te onthullen",
      revealText:
        "Als beide dezelfde massa maar een andere massadichtheid hebben, dan hebben ze een ander volume. Een groter volume betekent een grotere archimedeskracht bij onderdompeling. Door beide in water te hangen aan een dynamometer, vergelijk je hun archimedeskrachten. Zo ontdek je het verschil in massadichtheid.",
    },
  ],

  guided_slides: [
    {
      layout: "title",
      title: "Complexe vraagstukken oplossen",
      subtitle: "Stap voor stap naar het antwoord",
      badge: "Begeleide Oefening",
      icon: "lightbulb",
    },
    {
      layout: "steps",
      title: "Algemene aanpak: 5 stappen",
      steps: [
        {
          title: "Gegevens noteren",
          content:
            "Schrijf alle gegeven grootheden op: massa \\( m \\), volume \\( V \\), massadichtheid \\( \\rho \\), dynamometerwaarden in lucht en in vloeistof.",
        },
        {
          title: "Gevraagde bepalen",
          content:
            "Wat wordt er gevraagd? Archimedeskracht \\( F_A \\), volume \\( V \\), massadichtheid \\( \\rho \\) of het maximaal aantal personen?",
        },
        {
          title: "Juiste formule kiezen",
          content:
            "Kies uit: \\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\), \\( F_A = F_{lucht} - F_{vloeistof} \\) of \\( V_{onder}/V_{vwp} = \\rho_{vwp}/\\rho_{vl} \\).",
        },
        {
          title: "Invullen en berekenen",
          content:
            "Vervang de symbolen door de gegeven getallen. Let op eenheden: werk in SI-eenheden (kg, m³, N).",
        },
        {
          title: "Antwoord controleren",
          content:
            "Is de eenheid correct? Is de grootte logisch? Een massadichtheid van 1 000 000 kg/m³ voor hout is niet realistisch.",
        },
      ],
    },
    {
      layout: "standard",
      title: "Uitgewerkt voorbeeld: de dynamometermethode",
      content:
        "<strong>Gegeven:</strong> Een voorwerp weegt <strong>90 N</strong> in lucht en <strong>60 N</strong> volledig ondergedompeld in water " +
        "(\\( \\rho_{water} = 1000 \\) kg/m³, \\( g = 9{,}81 \\) N/kg).<br><br>" +
        '<div style="background:rgba(15,23,42,0.6); border-left:4px solid #f97316; border-radius:6px; padding:10px 14px; margin:10px 0;">' +
        '<span style="color:#fdba74; font-size:13px;">Principe: de dynamometer geeft in de vloeistof minder aan omdat \\( F_A \\) omhoog trekt. ' +
        "\\( F_A = F_{lucht} - F_{vloeistof} \\).</span>" +
        "</div><br>" +
        "<strong>(a) Archimedeskracht:</strong><br>" +
        "\\[ F_A = 90 - 60 = 30 \\text{ N} \\]<br>" +
        "<strong>(b) Volume van het voorwerp:</strong><br>" +
        "\\[ V_{vwp} = \\frac{F_A}{\\rho_{water} \\cdot g} = \\frac{30}{1000 \\cdot 9{,}81} \\approx 3{,}06 \\times 10^{-3} \\text{ m}^3 \\]<br>" +
        "<strong>(c) Massadichtheid van het voorwerp:</strong><br>" +
        "\\[ \\rho = \\frac{m}{V_{vwp}} = \\frac{90/9{,}81}{3{,}06 \\times 10^{-3}} \\approx 2941 \\text{ kg/m}^3 \\]",
    },
    {
      layout: "standard",
      title: "Uitgewerkt voorbeeld: hoeveel personen passen er in de boot?",
      content:
        "<strong>Gegeven:</strong> Roeiboot, massa \\( m_{boot} = 80 \\) kg, volume \\( V = 1{,}50 \\) m³. " +
        "Gemiddelde massa per persoon: \\( m_{pers} = 70 \\) kg. " +
        "\\( \\rho_{water} = 1000 \\) kg/m³, \\( g = 9{,}81 \\) N/kg.<br><br>" +
        "<strong>Maximale archimedeskracht (boot volledig ondergedompeld):</strong><br>" +
        "\\[ F_{A,max} = \\rho_{water} \\cdot g \\cdot V = 1000 \\cdot 9{,}81 \\cdot 1{,}50 = 14\\,715 \\text{ N} \\]<br>" +
        "<strong>Maximale totale massa (drijvend: \\( F_z = F_A \\)):</strong><br>" +
        "\\[ m_{max} = \\frac{F_{A,max}}{g} = \\frac{14\\,715}{9{,}81} = 1500 \\text{ kg} \\]<br>" +
        "<strong>Maximaal aantal personen:</strong><br>" +
        "\\[ n = \\frac{m_{max} - m_{boot}}{m_{pers}} = \\frac{1500 - 80}{70} = 20{,}3 \\]<br>" +
        "Maximum <strong>20 personen</strong> (naar beneden afronden, anders zinkt de boot).",
    },
    {
      layout: "recap",
      title: "Check jezelf",
      questions: [
        {
          q: "Een voorwerp weegt 50 N in lucht en 35 N in water. Hoe groot is de archimedeskracht?",
          a: "\\( F_A = 50 - 35 = 15 \\) N.",
        },
        {
          q: "Wat is het volume van het voorwerp uit de vorige vraag? (\\( \\rho_{water} = 1000 \\) kg/m³, \\( g = 9{,}81 \\) N/kg)",
          a: "\\( V_{vwp} = F_A / (\\rho_{water} \\cdot g) = 15 / (1000 \\cdot 9{,}81) \\approx 1{,}53 \\times 10^{-3} \\) m³.",
        },
        {
          q: "Een boot met volume 2 m³ bevindt zich in zoet water (\\( \\rho = 1000 \\) kg/m³). Wat is de maximale totale massa zodat de boot niet zinkt?",
          a: "\\( m_{max} = \\rho_{water} \\cdot V = 1000 \\cdot 2 = 2000 \\) kg.",
        },
      ],
    },
  ],

  summary_slides: [
    {
      layout: "title",
      title: "Eindoverzicht: de archimedeskracht",
      subtitle: "Volledig overzicht van de module",
      badge: "Eindoverzicht",
      icon: "check",
    },
    {
      layout: "standard",
      title: "Volledig overzicht van de module",
      content:
        "<strong>1. Wet van Archimedes</strong><br>" +
        "\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\): de opwaartse kracht is gelijk aan het gewicht van de verplaatste vloeistof.<br><br>" +
        "<strong>2. Theoretische afleiding</strong><br>" +
        "Hydrostatische druk: \\( p = \\rho_{vl} \\cdot g \\cdot h \\). De druk op het ondervlak is groter dan op het bovenvlak. " +
        "Dat drukverschil maal het grondoppervlak levert \\( F_A \\) op.<br><br>" +
        "<strong>3. Vier bewegingstoestanden</strong><br>" +
        "<ul>" +
        "<li><strong>Zinken:</strong> \\( \\rho_{vwp} > \\rho_{vl} \\)</li>" +
        "<li><strong>Zweven:</strong> \\( \\rho_{vwp} = \\rho_{vl} \\)</li>" +
        "<li><strong>Stijgen:</strong> \\( \\rho_{vwp} < \\rho_{vl} \\)</li>" +
        "<li><strong>Drijven:</strong> \\( \\rho_{vwp} < \\rho_{vl} \\), \\( V_{onder}/V_{vwp} = \\rho_{vwp}/\\rho_{vl} \\)</li>" +
        "</ul>",
    },
    {
      layout: "standard",
      title: "Realistische toepassingen",
      content:
        "<ul>" +
        "<li><strong>IJsberg:</strong> \\( \\rho_{ijs} < \\rho_{zeewater} \\), drijft. Ruim 89% bevindt zich onder water.</li>" +
        "<li><strong>Luchtballon:</strong> warme lucht heeft lagere massadichtheid dan koude omgevingslucht. " +
        "\\( F_A > F_z \\): ballon stijgt. Hoogte geregeld via brander.</li>" +
        "<li><strong>Duikboot:</strong> vult ballasttanks met water (zinken) of perslucht (stijgen) " +
        "om de gemiddelde massadichtheid aan te passen.</li>" +
        "<li><strong>Schip:</strong> holle romp vergroot het verdrongen volume enorm. " +
        "\\( F_A \\) is groot genoeg om het gewicht van staal te compenseren.</li>" +
        "<li><strong>Dode Zee:</strong> hoog zoutgehalte geeft een hoge massadichtheid van de vloeistof. " +
        "Mensen drijven moeiteloos.</li>" +
        "</ul>",
    },
  ],

  exitTicket: {
    questions: [
      {
        id: "q1",
        type: "mc",
        question:
          "Een voorwerp weegt 90 N in lucht en 60 N volledig ondergedompeld in water. Hoe groot is de archimedeskracht?",
        options: ["30 N", "60 N", "90 N", "150 N"],
        correct: 0,
      },
      {
        id: "q2",
        type: "mc",
        question:
          "Een schip heeft volume 1000 m³ en bevindt zich in zeewater (\\( \\rho = 1025 \\) kg/m³, \\( g = 9{,}81 \\) N/kg). Wat is de maximale archimedeskracht?",
        options: ["1 025 N", "9 810 N", "1 005 525 N", "10 055 250 N"],
        correct: 3,
      },
      {
        id: "q3",
        type: "open",
        question:
          "Een duikboot wil dalen in de oceaan. Welke aanpassing doet hij aan zijn massadichtheid en hoe bereikt hij dat technisch? Gebruik de begrippen archimedeskracht en zwaartekracht.",
      },
    ],
  },
};

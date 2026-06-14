# Bordschema Standaard (Whiteboard 1-op-1)

Dit document beschrijft exact hoe toekomstige bordschema's moeten worden opgebouwd,
zodat het resultaat hetzelfde is als `bordschema__goed_voorbeeld.tex`.

## Doel
- Geen "samenvatting met instructies"
- Wel: letterlijke mockup van het rechthoekige whiteboard
- 1 pagina per les op A4 landscape
- Direct overschrijfbaar aan bord

## Vaste output-eisen
1. **Bestandstype**: `.tex`
2. **Paginaformaat**: `a4paper, landscape`
3. **Per les**: volledig bordkader (rechthoek), met vaste kolommen
4. **Geen oefeningen/werkboeklijst** in het bordschema (die staan in timeline/modal)
5. **Korte bordtaal** (geen volzinnen)
6. **Visueel**: pijlen, flowblokken, kaders, kleurcontrast

## Vaste bordlayout (verplicht)
- Buitenkader van bord op elke pagina
- Bovenbalk met:
  - lesnaam links
  - tijdsverdeling rechts: `A10 | B30 | C10`
- 3 verticale kolommen:
  - LINKS: kernbegrippen / basisregels
  - MIDDEN: flowchart / beslislogica
  - RECHTS: valkuilen + exit-check

## Vaste stiftkleurcode (verplicht)
- **ZWART**: structuur, kaders, titels, pijlen
- **BLAUW**: kernbegrippen / definities
- **GROEN**: regels, juiste patronen, voorbeelden
- **ROOD**: valkuilen, uitzonderingen, contrast

In LaTeX (aanbevolen macro's):

```tex
\definecolor{zw}{RGB}{0,0,0}
\definecolor{bl}{RGB}{20,70,180}
\definecolor{gr}{RGB}{20,120,40}
\definecolor{ro}{RGB}{180,20,20}

\newcommand{\ZW}[1]{\textcolor{zw}{#1}}
\newcommand{\BL}[1]{\textcolor{bl}{#1}}
\newcommand{\GR}[1]{\textcolor{gr}{#1}}
\newcommand{\RO}[1]{\textcolor{ro}{#1}}
```

## Technische LaTeX-richtlijn
Gebruik TikZ als basis (geen lange tekstblokken):

```tex
\documentclass[a4paper,10pt,landscape]{article}
\usepackage[margin=0.6cm]{geometry}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{xcolor}
\usepackage{tikz}
\usetikzlibrary{arrows.meta,positioning,calc,shapes.geometric}
\pagestyle{empty}
\setlength{\parindent}{0pt}
```

## Referentie
- Gouden standaardbestand: `materiaal/bordschema_chemische_bindingen_3NW.tex`
- Nieuwe bordschema's moeten dezelfde stijl, structuur en leesbaarheid volgen.

## Workflow voor toekomstige LLM
1. Lees lesdoelen + timeline.
2. Extraheer alleen wat op bord moet blijven staan (geen oefenlijst).
3. Giet in 3-koloms whiteboardlayout.
4. Voeg flowchart in middenkolom toe.
5. Kleurcode strikt toepassen (ZW/BL/GR/RO).
6. Controle: is de pagina letterlijk bruikbaar als bord-kopie?

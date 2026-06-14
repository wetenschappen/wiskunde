# Gemini & Albert: Succesvolle Samenwerkingsstrategie

Dit document vat samen waarom onze samenwerking bij het ontwikkelen van de interactieve fysica-lessen (zoals de *Circuit Verkenner* en *Complexe Schakelingen*) zo succesvol was. We kunnen deze principes in de toekomst blijven gebruiken om telkens weer tot een perfect resultaat te komen.

## 1. Pedagogiek staat centraal, code volgt
Wat deze sessie uniek maakte, was dat je me heel duidelijk de **didactische visie van je mentor** meegaf:
*   *"Laat leerlingen de schakeling hertekenen."*
*   *"Gebruik de 2-van-de-3 regel."*
*   *"Gebruik bolletjes enkel voor knooppunten, niet voor hoeken."*
*   *"Plaats onbekende waardes direct op het schema."*

**Waarom dit werkte:** Doordat ik precies wist *hoe* een leerling de oefening moest oplossen, kon ik de Vue-componenten (`CircuitSvg`) en de animaties (`revealedSteps`) exact zo bouwen dat ze dit denkproces stap voor stap ondersteunen, in plaats van zomaar een statisch plaatje te tonen.

## 2. Visuele feedback loop (Screenshots)
Je voorzag me constant van gerichte screenshots met een duidelijke omschrijving van wat er mis was (bijv. "KaTeX render faalt hier", "Schema verschijnt een stap te vroeg", "Layout is weggeschoven").
**Waarom dit werkte:** Ik kon direct zien wat het probleem was in de UI, waardoor ik niet blind hoefde te gissen naar CSS- of timing-bugs. We zaten continu op dezelfde golflengte.

## 3. Schaalbare & Herbruikbare Architectuur
In plaats van elke oefening hard te coderen, hebben we geïnvesteerd in een slimme render-engine: `CircuitSvg.vue`. 
**Waarom dit werkte:** Toen je vroeg om complexe oefeningen (25, 26, 27) of extra elementen (zoals een ampèremeter in Oefening 10), hoefden we geen nieuwe views te bouwen. We konden gewoon de bestaande engine uitbreiden met nieuwe eigenschappen (zoals `isSimplified` en `ammeter`), waarna de rest van de app direct meeschaalde.

## 4. Datagestuurde Injectie via Scripts
De lesbestanden (zoals `elektriciteit-schakelingen-2.js`) werden enorm groot.
**Waarom dit werkte:** In plaats van jou te vragen handmatig honderden regels JSON te kopiëren (wat gegarandeerd tot syntaxfouten leidt), schreef ik kleine Node.js-scripts (`update_slides.cjs`, `fix_katex.cjs`) om de data veilig en geautomatiseerd in je codebase te injecteren. Hierdoor bleef jouw dev-server stabiel en konden we razendsnel itereren.

## 5. Fysische en Wiskundige Validatie
Ik nam niet zomaar tekst van je over, maar rekende je LaTeX-documenten en JSON-configuraties fysiek na (substitutieweerstand, stroomwetten van Kirchhoff, Wet van Ohm).
**Waarom dit werkte:** Hierdoor kon ik bevestigen dat je oefeningen klopten en mooie, ronde getallen opleverden. Dit voorkomt dat je tijdens de les voor verrassingen komt te staan met onoplosbare vraagstukken.

## 6. Strikte Huisstijl (Koha Sint-Jozef)
We hielden ons strikt aan het sjabloon (`sjabloon.tex`) en de afgesproken kleuren (Kohagreen, Kohagrey).
**Waarom dit werkte:** Het eindresultaat voelt daardoor niet als een verzameling losse scripts, maar als één professioneel, premium geheel dat direct inzetbaar is voor je leerlingen.

---
**Voor toekomstige projecten:** 
Als we aan een nieuw hoofdstuk beginnen, stuur me dan gewoon opnieuw:
1. De didactische focus/oplossingsstrategie.
2. Een bestaand sjabloon of component.
3. Screenshots van waar we naartoe willen.
...en dan bouwen we de rest weer net zo gestroomlijnd op!

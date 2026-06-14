# Archimedes Theory Quest: Mission Hub

## 🎯 Visie & Concept
De Theory Quest is getransformeerd van een lineaire presentatie naar een **standalone, non-lineaire Mission Hub**. De opzet is geïnspireerd op de interactieve leermethodiek van **Khan Academy** en de **Singaporese Science** (CPA-aanpak: Concrete-Pictorial-Abstract).

### Kernprincipes:
- **Ontdekking voor Uitleg**: Studenten manipuleren eerst variabelen (ρ, V, h) in een simulator voordat ze een conclusie trekken.
- **Standalone Autonomie**: Geen instructie van de leerkracht nodig; de app fungeert als gids.
- **Cursus-Integratie**: De digitale flow mondt telkens uit in een fysieke actie in het tekstboek (`cursus.md`).
- **Academische Esthetiek**: Een strak wit/navy/amber pallet dat rust en autoriteit uitstraalt.

## 🏗️ Architectuur & Bestanden
Het systeem is opgebouwd uit de volgende kernbestanden:

- **Hoofdmodule**: [`src/components/activities/ArchimedesTheoryQuest.vue`](src/components/activities/ArchimedesTheoryQuest.vue)  
  *Beheert de state, de hub-navigatie en de didactische stappen (Ontdekken -> Check -> Transfer).*
- **Visualisatie-engine**: [`src/components/activities/TheoryQuestScene.vue`](src/components/activities/TheoryQuestScene.vue)  
  *Een reactieve SVG-laag die de fysica visualiseert op basis van interactieve variabelen.*
- **Lesconfiguratie**: [`src/lessons/archimedes-les-4.js`](src/lessons/archimedes-les-4.js)  
  *De plek waar deze Theory Quest is geïntegreerd in de lestijdlijn.*
- **Inhoudelijke Bron**: [`materiaal/cursus.md`](materiaal/cursus.md)  
  *Het tekstboek waar de app naar verwijst (pagina 4 t.e.m. 22).*
- **Modal Logica**: [`src/composables/useActivityModal.js`](src/composables/useActivityModal.js)  
  *De onderliggende logica voor fullscreen en de Escape-toets afhandeling.*

## 📈 Didactische Flow (Per Missie)
1. **Hub**: Student kiest een concept (bv. Drukverschil of Drijfformule).
2. **Fase 1 (Observeren)**: Interactieve simulatie met sliders.
3. **Fase 2 (Inzicht Test)**: Een scherpe concept-check vraag.
4. **Fase 3 (Transfer)**: Directe verwijzing naar pagina's en opdrachten in de cursus (p. 4 t.e.m. 22).

## 🛠️ Geïdentificeerde Verbeterpunten (Backlog)
Ondanks dat de flow en visie nu 100% correct zijn, moeten de volgende "schoonheidsfoutjes" nog worden aangepakt in een volgende iteratie:

- [ ] **SVG Rendering**: Marker-alignment en rendering van pijlen verfijnen (sommige koppen renderen momenteel 'broken').
- [ ] **UI Scaling**: Knoppen zijn momenteel oversized; deze moeten strakker en compacter aansluiten bij het academische design.
- [ ] **KaTeX consistentie**: Controleren of alle wiskundige formules en variabelen in de teksten consistent door de wiskunde-renderer worden gehaald.
- [ ] **Visual Tweaks**: De proporties in de simulaties (bv. objectgrootte vs. krachtpijl) nog preciezer afstemmen op de fysieke realiteit.

---
**Status**: Flow & Concept goedgekeurd. Gereed voor detail-polishing.

# Activity Report: AtomicLattice.vue

**Component:** `src/components/activities/AtomicLattice.vue`
**Lesson:** Les 3 — Roosters & Eigenschappen (chemie-bindingen-les-3.js)
**Date:** 10 april 2026
**Review Scope:** LPD goal alignment + textbook content fidelity

---

## 1. Executive Summary

`AtomicLattice.vue` is a high-quality, interactive 4-phase activity covering the **4 lattice types** and their **properties**. It aligns strongly with textbook content (Hoofdstuk 4, p. 258-265) and the LPD's "model als vereenvoudiging" concept. However, it falls short of **100% LPD coverage** by omitting several physical properties explicitly mandated in the government learning plan.

**Current Score: ~75% LPD coverage, ~90% textbook alignment**

---

## 2. LPD Goals — Detailed Analysis

### LPD Reference: III-NatS-d 7 C
> *"Je kan aan de hand van experimenten de eigenschappen van metalen en niet-metalen illustreren: glans, inertheid, dichtheid, elektrische geleidbaarheid, aggregatietoestand, plooibaarheid."*

| Property | LPD Required | Activity Coverage | Status |
|----------|-------------|-------------------|--------|
| **Elektrische geleidbaarheid** | ✅ | Opdracht 2b — full table with 5 items, reasoning per lattice type | ✅ Covered |
| **Plooibaarheid (vervormbaarheid)** | ✅ | Opdracht 2a + Opdracht 4 — animated SVG + fill-in-the-blank explanation | ✅ Covered |
| **Smeltpunt** | (implied) | Opdracht 2c — ranking exercise (high→low) | ✅ Covered (bonus) |
| **Glans (metallic luster)** | ✅ | ❌ Not mentioned anywhere | ❌ MISSING |
| **Inertheid (chemical inertness)** | ✅ | ❌ Not mentioned anywhere | ❌ MISSING |
| **Dichtheid (mass density)** | ✅ | Mentioned in one sentence in textbook; not in activity | ❌ MISSING |
| **Aggregatietoestand (state of matter)** | ✅ | Implied (vast vs gesmolten for conductivity) but not explicitly tested | ⚠️ PARTIAL |

### LPD Reference: III-NatS-d 3 C
> *"Ionrooster, molecuulrooster, atoomrooster, metaalrooster"*

| Lattice Type | Activity Coverage | Status |
|-------------|-------------------|--------|
| Ionrooster | Opdracht 1-4, SVG, examples (NaCl, CaO) | ✅ Full |
| Molecuulrooster | Opdracht 1-4, SVG, examples (I2, H2O/ijs) | ✅ Full |
| Atoomrooster | Opdracht 1-4, SVG, examples (diamant, grafiet) | ✅ Full |
| Metaalrooster | Opdracht 1-4, SVG, examples (Fe, Cu, Al, brons) | ✅ Full |

### LPD Reference: III-NatS-d 9 C
> *"Dit leerplandoel kan je behandelen in samenhang met het STEM-concept: model als vereenvoudiging."*

| Concept | Activity Coverage | Status |
|---------|-------------------|--------|
| Model als vereenvoudiging | Warning box at end of Opdracht 4: "Dit is een vereenvoudigd model. Echte roosters zijn 3D en bevatten enorm veel deeltjes." | ✅ Covered |

---

## 3. Textbook Alignment — Detailed Analysis

### Hoofdstuk 4 (p. 258-265) — "Hoe wordt een metaalbinding gevormd?"

| Textbook Section | Activity Equivalent | Fidelity |
|-----------------|-------------------|----------|
| **Metaalrooster definition** (p. 259): "positieve metaalionen + zee van vrij bewegende elektronen" | Lattice viewer (Opdracht 1) — `selectedLattice.particles` text | ✅ Verbatim |
| **Metaalbinding = sterke binding** (p. 260) | Opdracht 2c (smeltpunt ranking) — explanation text | ✅ Conceptual match |
| **Geleidbaarheid** (p. 260): "elektronen kunnen vrij bewegen" | Opdracht 2b — 5-item table with reasoning | ✅ Identical reasoning, expanded scope |
| **Warmtegeleiding** (p. 261): "metaalionen dicht opeen + vrije elektronen" | ❌ Not covered | ❌ MISSING |
| **Massadichtheid** (p. 261): "dichte, compacte stapeling" | ❌ Not covered | ❌ MISSING |
| **Vervormbaarheid** (p. 262): "positieve ionen kunnen verschuiven" | Opdracht 2a + animated SVG | ✅ Exact match, enhanced visually |
| **Legeringen** (p. 262): "brons = tin + koper, onregelmatige rangschikking" | Opdracht 3 nuances box | ✅ Covered |
| **Aan de Slag 1** (p. 262): "Verklaar waarom een metaal vervormbaar is..." | Opdracht 4 — 5 fill-in-the-blank questions | ✅ Verbatim answer embedded |
| **Kruiswoordraadsel** (p. 263) | ❌ Not replicated | ❌ Omitted (crossword is vocabulary review, not core content) |
| **Weetjes** (koper, Atomium, smid video) | ❌ Not included | ❌ Cultural context omitted |

### What the Activity Does BETTER Than Textbook

1. **No cross-lattice comparison in textbook** — Hoofdstuk 4 only covers metaalrooster. The activity forces students to compare all 4 types side-by-side.
2. **Progressive mastery** — Textbook exercises are "answer once." The activity requires 100% correctness before proceeding.
3. **Animated visualizations** — Textbook has static diagrams. The activity shows electron drift, layer shifting, and crack propagation dynamically.
4. **Structured scaffolding** — 4 phases (herken → voorspel → koppel → verklaar) follow a clear pedagogical arc absent from the textbook's scattered exercises.

---

## 4. Recommendations for 100% LPD Coverage

### Priority 1: Add Missing Properties (Required for LPD)

#### 4.1 Glans (Metallic Luster)
**Where to add:** New mini-section in Opdracht 2 (Voorspel), or integrate into Opdracht 1 lattice viewer.

**Proposed content:**
- Add a new property card to the lattice viewer sidebar:
  ```
  Glans: Metaaloppervlakken weerkaatsen licht → metaalglans.
  Niet-metalen (molecuulrooster, atoomrooster) hebben geen metaalglans.
  Uitzondering: grafiet is grijs en glanzend maar is een atoomrooster.
  ```
- Add a quick recognition question in Opdracht 3 (Koppel):
  > *"Welk roostertype vertoont typisch metaalglans?"* → Answer: metaalrooster

**Why:** Glans is the first property listed in the LPD. It's a defining visual characteristic of metals that students encounter daily.

#### 4.2 Inertheid (Chemical Inertness)
**Where to add:** Same section as glans, or as part of a "properties overview" table.

**Proposed content:**
- Add to lattice viewer or a new card:
  ```
  Inertheid: Veel metalen reageren traag met hun omgeving (bv. goud, zilver).
  Andere metalen corroderen snel (ijzer → roest, aluminium → oxidehuidje).
  Niet-metalen variëren: I2 reageert makkelijk, edelgassen zijn inert.
  ```
- Add a true/false question:
  > *"Alle metalen zijn inert."* → False. Some corrode quickly (iron → rust).

**Why:** Inertheid connects to real-world observations (rust, tarnishing jewelry) and links to chemical reactivity concepts covered in earlier themes.

#### 4.3 Dichtheid (Mass Density)
**Where to add:** Opdracht 2c (Smeltpunt) — expand to a "Properties Ranking" that includes both melting point AND density.

**Proposed content:**
- Extend the ranking exercise or add a separate mini-exercise:
  > *"Metaalroosters hebben typisch een hoge dichtheid omdat de ionen dicht opeengepakt zijn. Rangschik: metaalrooster (hoog), ionrooster (middel), atoomrooster (varieert), molecuulrooster (laag)."*
- Add a fact card:
  ```
  Dichtheid: Metalen (Fe = 7,87 g/cm³) zijn zwaarder dan ijs (0,92 g/cm³)
  omdat metaalionen compact gestapeld zijn met weinig lege ruimte.
  ```

**Why:** Directly mentioned in textbook (p. 261) and LPD. Explains why metals feel "heavy" for their size.

#### 4.4 Aggregatietoestand (State of Matter)
**Where to add:** Opdracht 1 (Herken) — add a property row to the lattice info cards.

**Proposed content:**
- Add to `latticeTypes` array in component:
  ```javascript
  {
    id: 'metaal',
    // ... existing fields ...
    state: 'Vast bij kt (uitzondering: kwik is vloeibaar)',
  },
  {
    id: 'ion',
    // ... existing fields ...
    state: 'Vast bij kt (hoge smelt- en kookpunten)',
  },
  {
    id: 'molecuul',
    // ... existing fields ...
    state: 'Vast, vloeibaar of gas bij kt (afhankelijk van molecuulgrootte)',
  },
  {
    id: 'atoom',
    // ... existing fields ...
    state: 'Vast bij kt (zeer hoge smeltpunten)',
  }
  ```
- Add a quick matching question:
  > *"Welk roostertype kan bij kamertemperatuur vloeibaar of gasvormig zijn?"* → Answer: molecuulrooster

**Why:** Aggregatietoestand is a foundational concept from earlier grades. Linking it to lattice type reinforces structural reasoning.

---

### Priority 2: Add Warmtegeleiding (Textbook Content)

**Where to add:** Opdracht 2b — expand "Elektrische geleidbaarheid" to a combined "Geleidbaarheid" section covering both electricity AND heat.

**Proposed content:**
- Add new items to `conductivityItems`:
  ```javascript
  {
    id: 'c-6',
    label: 'Metaalrooster (warmtegeleiding)',
    answer: true,
    reason: 'Vrije elektronen én dicht opeengepakte ionen geven warmte snel door.'
  },
  {
    id: 'c-7',
    label: 'Ionrooster (warmtegeleiding)',
    answer: false,
    reason: 'In een ionrooster zijn geen vrije deeltjes die warmte snel kunnen transporteren.'
  }
  ```
- Add a context note (textbook p. 261):
  ```
  Warmtegeleiding in metalen werkt op twee manieren:
  1. Trillingen van dicht opeengepakte ionen → botsingen → energietransfer
  2. Vrije elektronen nemen warmte op en bewegen snel door het rooster
  ```

**Why:** Textbook dedicates a full paragraph + video to this. It's a distinctive property of metals explained by lattice structure.

---

### Priority 3: Add Cultural/Context Elements (Nice-to-Have)

These are **not required for LPD coverage** but would strengthen real-world connections:

| Element | Textbook Source | Proposed Integration |
|---------|----------------|---------------------|
| **Smid (blacksmith)** | p. 258 intro, p. 262 vervormbaarheid | Add as hook image/text in Opdracht 2a intro |
| **Koper in elektriciteitsdraden** | p. 260 "weetje" | Add as context note in Opdracht 2b |
| **Atomium** | p. 259 "weetje" | Fun fact in Opdracht 1 metaalrooster viewer |
| **Grafiet uitzondering** | Textbook p. 254 | Already mentioned in activity; keep as-is |

---

## 5. Implementation Effort Estimate

| Change | Files Modified | Complexity | Lines Changed |
|--------|---------------|------------|---------------|
| Add glans, inertheid, dichtheid, aggregatietoestand to lattice viewer | `AtomicLattice.vue` | Low | ~40 |
| Add warmtegeleiding to conductivity section | `AtomicLattice.vue` | Low | ~25 |
| Add property recognition questions (Opdracht 3 expansion) | `AtomicLattice.vue` | Medium | ~60 |
| Update learning goals list | `AtomicLattice.vue` | Trivial | ~5 |
| **Total** | **1 file** | **Medium** | **~130 lines** |

---

## 6. Recommended Implementation Order

1. **Phase 1:** Extend `latticeTypes` array with `state`, `luster`, `inertness`, `density` fields. Add info cards to lattice viewer sidebar.
2. **Phase 2:** Expand `conductivityItems` to include warmtegeleiding. Rename section header to "Geleidbaarheid."
3. **Phase 3:** Add a new "Eigenschappen Herkennen" mini-phase or integrate into existing Opdracht 3 (Koppel) with property-matching questions.
4. **Phase 4:** Update `learningGoals` array to explicitly list all 7 properties from LPD.
5. **Phase 5:** Run `npm run build` to verify. Test fullscreen mode, phase progression, and 100% completion logic.

---

## 7. Risks & Considerations

| Risk | Mitigation |
|------|-----------|
| Activity becomes too long | Keep additions concise (1-2 questions per property, not full phases) |
| Phase completion logic becomes fragile | Ensure new questions are required for `voorspelReady` computed property |
| Textbook exercise alignment drifts | Keep "Aan de Slag 1" (p. 262) verbatim in Opdracht 4 — do not modify |
| Student cognitive overload | Add new content as "discover" cards in sidebar, not as mandatory quiz items (except for LPD-required properties) |

---

## 8. Conclusion

`AtomicLattice.vue` is a strong activity that exceeds the textbook in pedagogical structure and interactivity. To reach **100% LPD coverage**, it needs **4 property additions** (glans, inertheid, dichtheid, aggregatietoestand) and **1 content expansion** (warmtegeleiding). These changes affect only 1 file, are straightforward to implement, and would make this activity a complete replacement for the textbook's sparse "Aan de Slag" exercises while fully satisfying government learning objectives.

**Next step:** Approve these recommendations, and I'll implement them in `AtomicLattice.vue`.

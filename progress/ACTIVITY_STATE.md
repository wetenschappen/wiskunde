# Activity State Assessment — Full Edition (incl. 1st vs 2nd Grade)

> Date: 2026-06-22
> Purpose: Document every activity's LPD alignment and cognitive depth.
> Scale: 1 (shallow) → 5 (deep) for depth. A = aligned, B = partial, C = misaligned.
> Note: The files reference LPD numbers from 2degraad.txt, but many cover 1st grade content.

---

## How to Read

**Depth criteria:**
- **5** — Full pipeline: predict → execute → error analysis → reflect. Multi-stage, forces thinking.
- **4** — Strong: multi-level with staged difficulty, requires calculation before interaction, some reflection.
- **3** — Functional: progressive levels, clear learning arc, but lacks prediction/reflection.
- **2** — Basic: levels exist but interaction is primarily slider/drag/click with minimal pre-commitment.
- **1** — Shallow: one-shot slider or click, no prediction, no staged thinking required.

**Year** — Whether the content matches 1st or 2nd grade curriculum goals.
**Actual LPD** — The LPD the activity actually teaches (from either 1stegraad.txt or 2degraad.txt).

---

## Identified Curriculum: 1st Grade LPDs (1stegraad.txt)

### LPD 1 (1st) — Real-world phenomena using 1st grade math concepts
*No dedicated activity explicitly covers this — it's an integration goal.*

### LPD 2 (1st) — Problem solving (mathematising/demathematising/heuristics)
*No dedicated activity explicitly covers this — it's an integration goal.*

### LPD 3 (1st) — ICT for calculations and graphical representations
*No dedicated activity explicitly covers this — it's an integration goal.*

### LPD 4 (1st) — Using measuring instruments accurately
- **LPD04_DigitalRuler.vue** — Measuring lengths with virtual ruler
  - **Year:** 1st ✓ | **Depth: 2** — Drag ruler, read measurement. Basic but functional.

- **LPD04_Protractor.vue** — Measuring angles with protractor
  - **Year:** 1st ✓ | **Depth: 2** — Slider to match target angle. Takes inner/outer scale into account.

### LPD 5 (1st) — Appropriate quantities and units (sense of scale)
- **LPD05_AreaConversion.vue** — Area unit conversions (mm², cm², m², km², a, ha)
  - **Year:** 1st ✓ | **Depth: 2** — Drag-drop matching. Procedural.

- **LPD05_SenseOfScale.vue** — Estimating real-world sizes (mass, length, volume of familiar objects)
  - **Year:** 1st ✓ | **Depth: 3** — Drag-drop units with reflection. Context-rich.

### LPD 6 (1st) — Reasoning with implication and equivalence
- **LPD04_2_LogicCounterexample.vue** — Finding counterexamples to false implications
  - **Year:** 1st ✓ (actual) | **Depth: 5** — Full pipeline, excellent error analysis.

- **LPD06_Counterexample.vue** — Finding counterexamples
  - **Year:** 1st ✓ | **Depth: 2** — Click-based. Simpler than LPD04_2.

- **LPD06_LogicRain.vue** — If-then-else logic puzzles (rain → mud)
  - **Year:** 1st ✓ | **Depth: 3** — Visual logic puzzle.

### LPD 7 (1st) — Set operations (∩, ∪, \)
- **LPD07_SetSymbols.vue** — Number classification into ℕ, ℤ, ℚ using set symbols
  - **Year:** 1st ✓ | **Depth: 3** — Drag-and-drop into set regions.

- **LPD07_VennDragDrop.vue** — Placing numbers in Venn diagram regions
  - **Year:** 1st ✓ | **Depth: 2** — Click-based placement.

### LPD 8 (1st) — Ordering rational numbers
- **LPD08_NumberLine.vue** — Plotting numbers on a number line
  - **Year:** 1st ✓ | **Depth: 2** — Click to position. Has prediction. Basic.

- **LPD05_2_RealNumbers.vue** — Number classification, irrational discovery, "why ℝ"
  - **Year:** 1st ✓ | **Depth: 3** — See 2nd grade section.

- **LPD06_2_OrderingReals.vue** — Ordering real numbers
  - **Year:** 2nd ✓ | **Depth: 5** — Full pipeline. See 2nd grade section.

### LPD 9 (1st) — Converting between decimal/fraction/percent
- **LPD09_MatchingFractions.vue** — Matching equivalent fractions, decimals, and visual representations
  - **Year:** 1st ✓ | **Depth: 2** — Click-based matching. Basic.

- **LPD09_HundredGrid.vue** — Percentages visualized on a hundred grid
  - **Year:** 1st ✓ | **Depth: 3** — Multi-level with prediction. Good for percent understanding.

- **LPD13_DiscountBar.vue** — Percentage discount with bar model
  - **Year:** 1st ✓ | **Depth: 4** — See percentage section below.

### LPD 10 (1st) — GCD and LCM
- **LPD10_GCDRuler.vue** — Visual GCD exploration
  - **Year:** 1st ✓ | **Depth: 3** — Slider-based interactive visualization.

- **LPD10_LCMFrogs.vue** — LCM through frog jumps
  - **Year:** 1st ✓ | **Depth: 3** — Animated visual. Good for conceptual understanding.

### LPD 11 (1st) — Basic operations with rational numbers
- **LPD11_FractionArea.vue** — Fraction operations with area models
  - **Year:** 1st ✓ | **Depth: 3** — Slider-based fraction area exploration.

- **LPD07_2_CalculatingReals.vue** — Computing with reals (+, −, ×, ÷, √, powers, estimation, scientific notation, rounding)
  - **Year:** 2nd ✓ | **Depth: 4** — Session 3: added magnitude estimation, scientific notation, rounding phases.

### LPD 12 (1st) — Properties and rules (opposite, reciprocal, absolute value)
- **LPD12_AbsoluteValue.vue** — Understanding |x| as distance on number line
  - **Year:** 1st ✓ | **Depth: 3** — Drag-based exploration. Good conceptual approach.

- **LPD12_Distributive.vue** — Distributive property a(b+c) with area model
  - **Year:** 1st ✓ | **Depth: 3** — Slider-based visual proof.

### LPD 13 (1st) — Percentage calculations
- **LPD13_DiscountBar.vue** — Discount percentage with bar model (multi-stage)
  - **Year:** 1st ✓ | **Depth: 4** — Strong multi-stage with reflection.

- **LPD13_ReversePercentage.vue** — Reverse percentage (total from percentage given)
  - **Year:** 1st ✓ | **Depth: 3** — Bar model approach. Covers the "extra" from LPD 13.

- **LPD09_HundredGrid.vue** — Already listed above. Also covers LPD 13.

### LPD 14 (1st) — Integer exponents and square roots of perfect squares
- **LPD14_NegativeExponent.vue** — Patterns in negative integer exponents
  - **Year:** 1st ✓ | **Depth: 3** — Pattern-discovery approach.

- **LPD14_SquareRoot.vue** — Estimating square roots (including non-perfect squares)
  - **Year:** 1st ✓ (partially) | **Depth: 4** — Strong pipeline but goes beyond perfect squares (more 2nd grade).

### LPD 15 (1st) — Power rules (product, quotient, power of power)
- **LPD15_PowerOfPower.vue** — (aᵐ)ⁿ = aᵐⁿⁿ
  - **Year:** 1st ✓ | **Depth: 3** — Multi-stage rule discovery.

- **LPD15_ProductRule.vue** — aᵐ · aⁿ = aᵐ⁺ⁿ
  - **Year:** 1st ✓ | **Depth: 3** — Similar structure.

### LPD 16 (1st) — Order of operations, correct use of equals sign
- **LPD16_EqualSign.vue** — Understanding = as equivalence, not computation trigger
  - **Year:** 1st ✓ | **Depth: 4** — Session 3: Added prediction gate + "why" explanation.

- **LPD16_OrderOfOps.vue** — Applying order of operations (PEMDAS/BODMAS)
  - **Year:** 1st ✓ | **Depth: 2** — Click the correct operation order.

### LPD 17 (1st) — Rounding and estimating
- **LPD17_RoundingHill.vue** — Rounding numbers to various place values
  - **Year:** 1st ✓ | **Depth: 3** — Drag-and-drop rounding practice.

- **LPD17_EstimationCheck.vue** — Estimating results of calculations
  - **Year:** 1st ✓ | **Depth: 3** — Prediction → adjust → check. Good format.

### LPD 18 (1st) — Geometry properties (angles, triangles, quadrilaterals)
- **LPD18_ParallelAngles.vue** — Angles with parallel lines and transversal
  - **Year:** 1st ✓ | **Depth: 3** — Slider and input for angle pairs.

- **LPD18_Diagonals.vue** — Diagonal properties of quadrilaterals
  - **Year:** 1st ✓ | **Depth: 3** — Interactive exploration.

### LPD 19 (1st) — Classifying triangles and quadrilaterals
- **LPD19_QuadHierarchy.vue** — Quadrilateral classification hierarchy
  - **Year:** 1st ✓ | **Depth: 3** — Click/drag classification.

### LPD 20 (1st) — Remarkable lines in triangles (bisector, altitude, etc.)
- **LPD22_BisectorCompass.vue** — Constructing an angle bisector
  - **Year:** 1st ✓ | **Depth: 3** — Click-based construction steps.

- **LPD22_TriangleCompass.vue** — Triangle construction with compass
  - **Year:** 1st ✓ (also LPD 22) | **Depth: 3** — Construction steps.

### LPD 21 (1st) — Parallelism, perpendicularity, symmetry
- **LPD20_LineProperties.vue** — Identifying and comparing line properties
  - **Year:** 1st ✓ | **Depth: 2** — Click-based identification.

- **LPD21_SymmetryScanner.vue** — Checking symmetry in various figures
  - **Year:** 1st ✓ | **Depth: 2** — Click/drag symmetry check.

### LPD 22 (1st) — Constructing geometric objects
- **LPD03_DynamicGeometry.vue** — Interactive geometry construction
  - **Year:** 1st ✓ (via ICT) | **Depth: 3** — Drag-and-drop geometry manipulation.

- **LPD22_BisectorCompass.vue** / **LPD22_TriangleCompass.vue** — Also under LPD 22.

### LPD 23 (1st) — Transformations (translation, reflection, rotation, point reflection)
- **LPD23_PointSymmetry.vue** — Point symmetry as 180° rotation
  - **Year:** 1st ✓ | **Depth: 2** — Rotate slider to match. Basic.

- **LPD23_TranslationVector.vue** — Translating shapes by vector
  - **Year:** 1st ✓ | **Depth: 2** — Drag-based translation practice.

### LPD 24 (1st) — Congruence criteria (ZZZ, ZHZ, HZH, ZZ90°)
- **LPD24_CongruenceSwing.vue** — Exploring triangle congruence criteria
  - **Year:** 1st ✓ | **Depth: 3** — Slider/click congruence check.

- **LPD24_TwinHunter.vue** — Finding congruent triangles in polygon pairs
  - **Year:** 1st ✓ | **Depth: 2** — Click to identify.

### LPD 25 (1st) — Area and perimeter formulas
- **LPD25_ParallelogramPuzzle.vue** — Parallelogram area via transformation to rectangle
  - **Year:** 1st ✓ | **Depth: 3** — Click to scissors-transform. Conceptual.

- **LPD25_TrapeziumClone.vue** — Trapezium area via clone-and-flip
  - **Year:** 1st ✓ | **Depth: 2** — Click to transform.

- **LPD19_TriangleGrid.vue** — Triangle area on grid
  - **Year:** 1st ✓ | **Depth: 2** — Click-based.

### LPD 26 (1st) — Spatial figures (views, perspectives, 3D)
- **LPD26_3DScanner.vue** — Exploring 3D shapes from different perspectives
  - **Year:** 1st ✓ | **Depth: 2** — Click-interactive 3D viewing.

- **LPD26_OpticalIllusion.vue** — Visual illusions in 3D representations
  - **Year:** 1st ✓ | **Depth: 2** — Slider/click reveal.

- **LPD27_UnfoldCube.vue** — Cube net unfolding (also LPD 27)
  - **Year:** 1st ✓ | **Depth: 2** — Click to unfold.

### LPD 27 (1st) — Surface area and volume (cube, prism, cylinder)
- **LPD27_FillPrism.vue** — Prism volume by filling
  - **Year:** 1st ✓ | **Depth: 3** — Multi-level volume exploration.

- **LPD27_UnfoldCube.vue** — Also under LPD 26/27.

### LPD 28 (1st) — Coordinates in the plane
- **LPD21_CityMap.vue** — Navigating a coordinate grid in a city map context
  - **Year:** 1st ✓ | **Depth: 2** — Click to navigate.

- **LPD28_RadarTarget.vue** — Finding coordinates on a radar
  - **Year:** 1st ✓ | **Depth: 3** — Multi-level coordinate guessing.

- **LPD28_TreasureMap.vue** — Treasure hunt with coordinates
  - **Year:** 1st ✓ | **Depth: 2** — Click coordinates.

### LPD 29 (1st) — Letters as unknowns, variables, and generalizations
- **LPD29_VariableBox.vue** — Substituting values for variables
  - **Year:** 1st ✓ | **Depth: 2** — Slider → compute.

- **LPD33_ReverseMachine.vue** — Reverse operations (also LPD 33)
  - **Year:** 1st ✓ | **Depth: 3** — Multi-stage reverse operations.

### LPD 30 (1st) — Evaluating algebraic expressions
- **LPD30_PlugAndPlay.vue** — Plugging values into algebraic expressions
  - **Year:** 1st ✓ | **Depth: 3** — Multi-level substitution practice.

- **LPD29_VariableBox.vue** — Also under LPD 29/30.

### LPD 31 (1st) — Formulas for patterns
- **LPD30_FormulaMachine.vue** — Discovering the formula behind an input-output machine
  - **Year:** 1st ✓ | **Depth: 3** — Multi-stage pattern discovery.

- **LPD31_TablePattern.vue** — Recognizing and continuing number patterns
  - **Year:** 1st ✓ | **Depth: 2** — Click-based pattern recognition.

- **LPD31_SquareNumbers.vue** — Square number patterns
  - **Year:** 1st ✓ | **Depth: 2** — Click/reveal.

### LPD 32 (1st) — Algebraic operations (including (a+b)², (a+b)(a-b))
- **LPD32_DifferenceOfSquares.vue** — Visual proof of (a+b)(a-b) = a²-b²
  - **Year:** 1st ✓ | **Depth: 3** — Click-based visual proof.

- **LPD32_PerfectSquare.vue** — Visual proof of (a+b)² = a²+2ab+b²
  - **Year:** 1st ✓ | **Depth: 3** — Click to split and rearrange.

### LPD 33 (1st) — Solving linear equations
- **LPD18_2_LinearEqBalance.vue** — Balance method for linear equations
  - **Year:** 2nd ✓ | **Depth: 4** (but 2nd grade LPD 18 content)

- **LPD33_EquationBalance.vue** — Balance puzzles (generic equation solving)
  - **Year:** 1st ✓ | **Depth: 3** — Click-based balance reasoning.

- **LPD33_ReverseMachine.vue** — Previously listed. Also covers equation solving.

- **LPD29_UnknownBalance.vue** — Mystery balance puzzles with unknown variables
  - **Year:** 1st ✓ | **Depth: 3** — Click-based balance reasoning.

### LPD 34 (1st) — Direct and inverse proportion
- **LPD34_DirectProportion.vue** — Direct proportion with multiple representations
  - **Year:** 1st ✓ | **Depth: 4** — Multi-level with reflection. Strong.

- **LPD34_InverseProportion.vue** — Inverse proportion with prediction
  - **Year:** 1st ✓ | **Depth: 4** — Multi-level with prediction gates. Strong.

- **LPD08_BalanceSymbols.vue** — Balance scale (proportional reasoning)
  - **Year:** 1st ✓ (or later) | **Depth: 3** — Interactive balance manipulator.

### LPD 35 (1st) — Reading information from tables and diagrams
- **LPD35_DataDetective.vue** — Analysing data from tables/charts to solve puzzles
  - **Year:** 1st ✓ | **Depth: 3** — Click-based detective puzzles.

- **LPD03_DataVisualization.vue** — Understanding different chart types
  - **Year:** 1st ✓ | **Depth: 3** — Selecting appropriate visualizations.

### LPD 36 (1st) — Descriptive statistics (frequency, mean, median, mode, range)
- **LPD36_FrequencyTable.vue** — Building and interpreting frequency tables
  - **Year:** 1st ✓ | **Depth: 3** — Multi-level table building.

- **LPD36_OutlierEffect.vue** — How outliers affect mean/median
  - **Year:** 1st ✓ | **Depth: 3** — Slider-based outlier exploration.

### LPD 37 (1st) — Computational thinking: algorithms and debugging
- **LPD37_RobotDebug.vue** — Debugging robot movement algorithms
  - **Year:** 1st ✓ | **Depth: 4** — Rich multi-stage. Build algorithm, test, debug.

- **LPD37_SieveAlgorithm.vue** — Executing Sieve of Eratosthenes algorithm
  - **Year:** 1st ✓ | **Depth: 4** — Step-through algorithm execution.

---

## Identified Curriculum: 2nd Grade LPDs (2degraad.txt)

### LPD 1 (2nd) — Real-world phenomena using 2nd grade math concepts
*No dedicated activity. Integration goal.*

### LPD 2 (2nd) — Problem solving heuristics
*No dedicated activity. Integration goal.*

### LPD 3 (2nd) — ICT for calculations and graphical representations
*No dedicated activity. Integration goal.*

### LPD 4 (2nd) — Mathematical reasoning with counterexamples
- **LPD04_2_LogicCounterexample.vue** — (Also 1st grade LPD 6)
  - **Year:** Shared (1st/2nd) | **Depth: 5**

### LPD B1 (2nd) — Proving mathematical statements
- **LPD_B1_Contradiction.vue** — Proof by contradiction of √2 irrationality
  - **Depth: 4** — Multi-level proof reconstruction.

### LPD 5 (2nd) — Real numbers as completion of number line
- **LPD05_2_RealNumbers.vue** — Classifying numbers into ℕ, ℤ, ℚ, ℝ\ℚ, constructing irrationals
  - **Depth: 5** — Session 3: 4 phases — √2 diagonal motivation → construct irrationals via Pythagoras → Venn classification → written reflection on why ℝ exists.

- **LPD06_2_OrderingReals.vue** — Ordering reals including irrationals
  - **Depth: 5**

### LPD 6 (2nd) — Ordering real numbers
- **LPD06_2_OrderingReals.vue** — (Same as above)
  - **Depth: 5**

### LPD 7 (2nd) — Computing with real numbers
- **LPD07_2_CalculatingReals.vue** — Arithmetic with reals, estimation, scientific notation
  - **Depth: 4** — Session 3: 4 phases — magnitude estimation → operations → scientific notation → rounding. Still missing error analysis.

### LPD 8 + 9 (2nd) — Similarity and scale
- **LPD08_2_SimilarityScale.vue** — Scale factor k → ×k, ×k², ×k³
  - **Depth: 5**

- **LPD09_2_SimilarityCriteria.vue** — Applying similarity criteria of triangles
  - **Depth: 3** — Application only. Missing discovery phase.

### LPD 10 (2nd) — Pythagoras
- **LPD10_2_PythagorasVisual.vue** — Visual proof of a²+b²=c²
  - **Depth: 5**

### LPD 11 (2nd) — Trig ratios in right triangles
- **LPD11_2_TrigRatios.vue** — Identifying sin/cos/tan for given sides
  - **Depth: 4**

- **LPD11_BalloonMath.vue** — Opposite/adjacent/hypotenuse in context
  - **Depth: 4**

### LPD 12 (2nd) — Spatial geometry (relative positions)
- **LPD12_2_SpatialGeometry.vue** — Parallel/perpendicular in 3D
  - **Depth: 3**

### LPD 13 (2nd) — Vector drawing (sum, scalar ×)
- **LPD13_2_VectorDrawing.vue** — Drawing vector sums and scalar multiples
  - **Depth: 3**

### LPD 14 (2nd) — Vector computation (components)
- **LPD14_2_VectorCalculation.vue** — Computing vector components
  - **Depth: 2** — Click-only. Too passive.

### LPD 15 (2nd) — Goniometric circle
- **LPD15_2_TrigCircle.vue** — sin/cos on the unit circle
  - **Depth: 5**

### LPD 16 (2nd) — Goniometric formulas (related angles)
- **LPD16_2_TrigFormulas.vue** — Related angles in goniometric circle
  - **Depth: 3** — Formulas given, not discovered.

### LPD 17 (2nd) — Sine and cosine rule
- **LPD17_2_SineCosineRule.vue** — Applying sine/cosine rules
  - **Depth: 3** — Rule selection only. No computation.

### LPD B2 (2nd) — Dot product
- **LPD_B2_DotProduct.vue**
  - **Depth: 3**

### LPD B3 (2nd) — Line equations (vector, parametric, Cartesian)
- **LPD_B3_LineEquations.vue**
  - **Depth: 3** — Click-only. No formula construction.

### LPD B4 (2nd) — Relative positions of lines
- **LPD_B4_RelativePositions.vue**
  - **Depth: 3**

### LPD B5 (2nd) — Distance point-line, angle between lines
*No activity.*

### LPD 18 (2nd) — Solving linear equations algebraically
- **LPD18_2_LinearEqBalance.vue** — Balance method
  - **Depth: 4** — Strong but missing parameter discussion.

### LPD 19 (2nd) — Solving linear inequalities algebraically
- **LPD19_2_Inequalities.vue**
  - **Depth: 3** — Slider-based, not algebraic.

### LPD 20 (2nd) — Expressing one variable in terms of another
- **LPD20_2_FormulaManipulation.vue**
  - **Depth: 3** — Guided but no reflection.

### LPD 21 (2nd) — Function concept: relations between representations
- **LPD21_2_FunctionMachine.vue**
  - **Depth: 4** — Missing verbal description.

### LPD 22 (2nd) — Slope of linear functions
- **LPD22_2_SlopeLinear.vue**
  - **Depth: 5**

### LPD 23 (2nd) — Determining formula/graph/table/description of linear function
- **LPD23_2_LinearRepresentations.vue**
  - **Depth: 3** — Missing "through two points" technique.

### LPD 24 (2nd) — Linear function features (domain, range, zero, sign)
- **LPD24_2_LinearFeatures.vue**
  - **Depth: 3** — No sign-table scaffolding.

### LPD 25 (2nd) — Graphical solving of linear equations/inequalities
- **LPD25_2_GraphicalSolving.vue**
  - **Depth: 3** — No prediction.

### LPD 26 (2nd) — Graphical solving of systems
- **LPD26_2_SystemsGraphically.vue**
  - **Depth: 3** — Missing link between general equation and function.

### LPD 27 (2nd) — Algebraic solving of systems
- **LPD27_2_SystemsAlgebraic.vue**
  - **Depth: 4** — Missing graphical verification step.

### LPD 28 (2nd) — Hyperbola f(x) = c/x features
- **LPD28_2_Hyperbola.vue**
  - **Depth: 3** — Missing asymptotic behavior exploration.

### LPD 29 (2nd) — Drawing quadratic functions from formula
- **LPD29_2_QuadraticGraph.vue**
  - **Depth: 4** — Missing completing square method.

### LPD 30 (2nd) — Formula of quadratic from graph
- **LPD30_2_QuadraticFormula.vue**
  - **Depth: 4** — Missing three-point and symmetry methods.

### LPD 31 (2nd) — Quadratic function features
- **LPD31_2_QuadraticFeatures.vue**
  - **Depth: 3** — Missing real-world contexts.

### LPD 32 (2nd) — Solving quadratic equations/inequalities graphically
- **LPD32_2_QuadInequalitiesGraph.vue**
  - **Depth: 3**

### LPD 33 (2nd) — Solving quadratic equations algebraically
- **LPD33_2_Discriminant.vue**
  - **Depth: 5**

### LPD 34 (2nd) — Solving quadratic inequalities algebraically
- **LPD34_2_QuadInequalitiesAlg.vue**
  - **Depth: 3** — Missing graphical verification.

### LPD B6 (2nd) — Polynomial divisibility
- **LPD_B6_PolynomialDivision.vue**
  - **Depth: 3** — Missing Horner's rule.

### LPD 35 (2nd) — Counting problems (tree/Venn diagrams)
- **LPD35_2_CountingVenn.vue**
  - **Depth: 3** — Missing tree diagrams.

### LPD 36 (2nd) — Truth tables
- **LPD36_2_TruthTables.vue**
  - **Depth: 4** — Session 3: Added tautology/contradiction/satisfiable classification. Still missing logical gates link.

### LPD 37 (2nd) — Statistical visualisations
- **LPD37_2_ChartSelection.vue**
  - **Depth: 3** — Only 3 scenarios.

### LPD 38 (2nd) — Centre and spread measures
- **LPD38_2_BoxplotFeatures.vue**
  - **Depth: 3** — Missing real-world context.

### LPD 39 (2nd) — Analysing statistical data
- **LPD39_2_MisleadingStats.vue**
  - **Depth: 4** — Only axis scaling covered.

### LPD 40 (2nd) — Scatter diagrams and correlation
- **LPD40_2_ScatterCorrelation.vue**
  - **Depth: 3**

### LPD K1 (2nd, elective) — Circle properties
- **LPD_K1_CircleProperties.vue**
  - **Depth: 3**

### LPD K2 (2nd, elective) — Graph as model of real situations
- **LPD_K2_GraphModel.vue**
  - **Depth: 3**

### LPD K3 (2nd, elective) — Using graphs to solve problems
- **LPD_K3_EulerPath.vue**
  - **Depth: 4** — Only Euler paths covered.

---

## Summary Statistics

### Depth Distribution
| Depth | Count | |
|-------|-------|---|
| **5** | 6 | Full pipeline activities |
| **4** | ~16 | Strong, multi-stage |
| **3** | ~67 | Functional, has levels |
| **2** | ~28 | Basic interaction |
| **1** | ~0 | None truly shallow |

### Actual LPD Alignment (corrected for 1st vs 2nd grade)
| Status | Count | |
|--------|-------|---|
| **A** (correct year + correct LPD) | ~95 | Activity covers the right content for its year |
| **B** (partial/year mismatch) | ~10 | Activity exists but misses key aspects of the LPD |
| **C** (no corresponding LPD or wrong) | ~10 | Activity doesn't clearly match any curriculum goal |

**Key finding:** When accounting for 1st grade vs 2nd grade curriculum, the vast majority of activities (~95/117, 81%) are correctly aligned to *some* curriculum goal. The previous "59% wrong" assessment was incorrect — those activities are mostly teaching valid 1st grade content under 2nd grade LPD numbers.

### Remaining gaps (things the curriculum requires but no activity covers)
1. **LPD B5 (2nd)** — Distance point-line, angle between lines — **no activity**
2. **LPD 18 (1st)** — Some geometry properties (triangle angle sum, quadrilateral diagonal properties) only partially covered
3. **LPD 22 (1st)** — Construction with traditional tools (passer, liniaal) partially covered but no explicit compass/straightedge activities
4. **LPD K* extras** — Shortest path (Dijkstra), spanning tree (Kruskal/Prim), Hamiltonian paths — only Euler covered
5. **LPD 16 (2nd)** — Related angle formulas not discovered (given, not explored)
6. **LPD 36 (2nd)** — Logical gates and exclusive-or distinction not made
7. **LPD 39 (2nd)** — Only axis-scale misleading, not other tactics

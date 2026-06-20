--- PAGE 1 ---
[Afbeelding: Logo Nando 4]

[Afbeelding: Logo die Keure educatief]

D-FINALITEIT 5 UUR — ALGEBRAÏSCH REKENEN
# 16 Deelbaarheid van veeltermen

[Afbeelding: Vliegtuigen die rode rook spuiten en een rode balk met de tekst "CORRECTIESLEUTEL"]

**Inhoud**
Instap
1 De euclidische deling
2 Deelbaarheid in ℝ[x]
3 Toepassingen op de reststelling
**Signaaloefeningen**
**Differentiatietraject**
**Studiewijzer**

**WAT JE AL KUNT**
- de definitie van een veelterm verwoorden
- de getalwaarde van een veelterm bepalen
- veeltermen optellen, aftrekken en vermenigvuldigen

**WAT JE LEERT IN DEZE MODULE**
- de euclidische deling van veeltermen uitvoeren
- de reststelling bij deling door (x - a) bewijzen
- de deling van een veelterm door (x - a) uitvoeren door middel van de regel van Horner
- de reststelling toepassen in vraagstukken
- de tweetermen a³ + b³ en a³ - b³ ontbinden in factoren

**IN DE KIJKER**
Je hebt zin voor **nauwkeurigheid** en **orde**.

**WISKUNDETAAL**
- graad van een veelterm
- getalwaarde van een veelterm
- algoritme van Horner
- euclidische deling
- deeltal, deler, rest en quotiënt
- deelbaarheid in ℝ[x]
- reststelling

--- PAGE 2 ---
# Instap

## Opdracht 1

Gegeven: drie veeltermen
A(x) = x² – 2x + 3
B(x) = 2x – 1
C(x) = 3x² + 4

Bereken.
a) 3 · A(x) + 2 · B(x) – C(x)

3 · (x² – 2x + 3) + 2 · (2x – 1) – (3x² + 4)
= 3x² – 6x + 9 + 4x – 2 – 3x² – 4
= –2x + 3

b) A(x) · B(x)

(x² – 2x + 3) · (2x – 1)
= 2x³ – x² – 4x² + 2x + 6x – 3
= 2x³ – 5x² + 8x – 3

c) 4 · A(x) – B(x) · C(x)

4 · (x² – 2x + 3) – (2x – 1) · (3x² + 4)
= (4x² – 8x + 12) – (6x³ + 8x – 3x² – 4)
= 4x² – 8x + 12 – 6x³ – 8x + 3x² + 4
= –6x³ + 7x² – 16x + 16

d) [A(x)]² = A(x) · A(x)

(x² – 2x + 3)² = (x² – 2x + 3) · (x² – 2x + 3)
= x⁴ – 2x³ + 3x² – 2x³ + 4x² – 6x + 3x² – 6x + 9
= x⁴ – 4x³ + 10x² – 12x + 9

--- PAGE 3 ---
## Opdracht 2

Gegeven: drie veeltermen
A(x) = x³ – x² + 5x – 6
B(x) = 4x – 2
C(x) = 3x² – 2x + 1

Bereken:
a) A(2)

A(2) = 2³ – 2² + 5 · 2 – 6
= 8 – 4 + 10 – 6
= 8

b) B(0)

B(0) = 4 · 0 – 2
= –2

c) C(–5)

C(–5) = 3 · (–5)² – 2 · (–5) + 1
= 3 · 25 – 2 · (–5) + 1
= 75 + 10 + 1
= 86

d) 4 · A(–1) · B(2) – 5 · C(1)

= 4 · [ (–1)³ – (–1)² + 5 · (–1) – 6 ] · (4 · 2 – 2) – 5 · (3 · 1² – 2 · 1 + 1)
= 4 (–1 – 1 – 5 – 6) · (8 – 2) – 5 · (3 – 2 + 1)
= 4 · (–13) · 6 – 5 · 2
= –312 – 10
= –322

--- PAGE 4 ---
# 1 De euclidische deling

## 1.1 De verzameling ℝ[x]

Veeltermen (in de veranderlijke x) noteren we als A(x), B(x), C(x), …
De verzameling van al deze veeltermen noemen we ℝ[x] .

**Voorbeelden**
A(x) = 4x² – 6x + 1
B(x) = 2x³ + 5x² – 7

Algemeen noteert men een veelterm van de n-de graad als volgt:
A(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + … + a₁x + a₀

De getallen aₙ, aₙ₋₁, …, a₁, a₀ noemen we de coëfficiënten van de veelterm, aₙ is de coëfficiënt van de term met de hoogste macht, a₀ is de constante term van de veelterm.

**definitie**
De **graad van een veelterm** (in x) is de hoogst voorkomende exponent van x in die veelterm.

**Voorbeelden**
gr(A(x)) = gr(4x² − 6x + 1)
= 2

gr(B(x)) = gr(2x³ + 5x² − 7)
= 3

**definitie**
De **getalwaarde van een veelterm** voor een gegeven getal a is het reële getal dat je bekomt door in de veelterm de veranderlijke x te vervangen door a.

**Voorbeelden**
A(3) = 4 · 3² − 6 · 3 + 1
= 36 − 18 + 1
= 19

B(−2) = 2 · (−2)³ + 5 · (−2)² − 7
= −16 + 20 − 7
= −3

**definitie**
a is een nulwaarde van de veelterm A(x) als en slechts als A(a) = 0

**Voorbeelden**
A(x) = 4x² + 5x − 6

Toon aan dat −2 een nulwaarde is van de veelterm A(x).
A(−2) = 4(−2)² + 5(−2) − 6
= 4 · 4 − 10 − 6
= 16 − 10 − 6
= 0

--- PAGE 5 ---
## 1.2 Algoritme van Horner

**Voorbeeld**
Gegeven: de veelterm A(x) = x⁵ – 2x⁴ + 4x³ – 6x² + x – 1
Gevraagd: Bereken A(3).

Oplossing
A(3) = 3⁵ − 2 · 3⁴ + 4 · 3³ − 6 · 3² + 3 − 1
= 243 − 162 + 108 − 54 + 3 − 1
= 137

Omdat dit rekenwerk soms lastig is vond Horner een eenvoudigere manier, een algoritme, uit..

**methode**
STAP 1: Op de bovenste rij noteer je de coëfficiënten, gerangschikt naar dalende machten van x, van A(x). 
Ontbrekende coëfficiënten worden aangevuld met een 0.
STAP 2: De coëfficiënt van de eerste term laat je gewoon zakken tot onder de horizontale lijn.
STAP 3: Dit getal vermenigvuldig je nu met de te zoeken getalwaarde (het getal uiterst links op de tweede rij voor de verticale lijn) en plaats je onder de coëfficiënt van de tweede term.
STAP 4: Tel dit getal op bij de coëfficiënt waaronder het geplaatst staat en herhaal je werkwijze opschuivend naar rechts.
STAP 5: Als laatste getal vind je de gevraagde getalwaarde

Schematisch voorgesteld krijgen we:

```text
       1      –2       4      –6       1      –1
       ↓       +       +       +       +       +
   3           3       3      21      45     138
------------------------------------------------
       1       1       7      15      46     137
                                               ↓
                                         getalwaarde
```

Deze methode noemen we het algoritme of rekenschema van Horner.

**Voorbeeld**
Gegeven: A(x) = -x³ + 2x² + 5
Gevraagd: bepaal de getalwaarde van A(x) voor -2

```text
      -1       2       0       5
  -2   ↓       2      -8      16
--------------------------------
      -1       4      -8      21
```

A(-2) = 21

--- PAGE 6 ---
## 1.3 De euclidische deling

**A) Euclidische deling van natuurlijke getallen**
De euclidische deling heb je reeds vroeger (de lagere school) geleerd. Heel waarschijnlijk noemde men dat toen een ‘staartdeling’. Een voorbeeld:

```text
  5  5  4  8 | 17
– 5  1       | 326
-------      |
     4  4    |
   – 3  4    |
   -------   |
     1  0  8 |
   – 1  0  2 |
   --------- |
           6 |
```

In dit voorbeeld is 5548 het deeltal (a), 17 de deler (d), 6 de rest (r) en 326 het quotiënt (q).

Er geldt: a = d · q + r        5548 = 17 · 326 + 6
en 0 ⩽ r < d                   6 < 17

**B) Euclidische deling van veeltermen**
Op een analoge manier definiëren we de deling van veeltermen in ℝ[x].
Het algoritme (werkwijze) van de euclidische deling illustreren we aan de hand van een tweetal voorbeelden:

**Voorbeeld 1**
Gegeven: A(x) = 2x³ – 7x² + 11x + 1
 D(x) = 2x – 1

Gevraagd: Bepaal het quotiënt Q(x) en de rest R(x) van de euclidische deling van A(x) door D(x).

Oplossing (algoritme)
Rangschik deeltal (A(x)) en deler (D(x)) naar dalende machten van x en vul indien nodig bij het deeltal de ontbrekende termen aan met coëfficiënt nul.

2x³ – 7x² + 11x + 1  | 2x – 1

Deel de term met de hoogste macht van het deeltal (2x³) door de term met de hoogste macht van de deler (2x). Dit geeft je de eerste term (x²) van het quotiënt (Q(x)).

2x³ – 7x² + 11x + 1  | 2x – 1
                     | x²

Vermenigvuldig de eerste term (x²) van Q(x) met D(x) en trek het bekomen product van A(x) af. Je krijgt een eerste voorlopige rest.

  2x³ – 7x² + 11x + 1  | 2x – 1
– (2x³ – x²)           | x²
-------------
      – 6x² + 11x + 1

--- PAGE 7 ---
Deel de term met de hoogste macht van deze rest door de term met de hoogste macht van D(x). Vermenigvuldig de bekomen term met D(x) en trek dit product van de voorlopige rest af. Je krijgt een tweede voorlopige rest.

  2x³ – 7x² + 11x + 1  | 2x – 1
– (2x³ – x²)           | x² – 3x
-------------
      –6x² + 11x + 1
    – (–6x² + 3x)
    -------------
             8x + 1

Herhaal deze werkwijze totdat de graad van de rest kleiner is dan de graad van de deler. Deze laatste rest is de gevraagde rest.

  2x³ – 7x² + 11x + 1  | 2x – 1
– (2x³ – x²)           | x² – 3x + 4 = Q(x)
-------------
      –6x² + 11x + 1
    – (–6x² + 3x)
    -------------
             8x + 1
          – (8x – 4)
          ---------
                  5 = R(x)

Besluit: A(x) = D(x) · Q(x) + R(x) waarbij gr(R(x)) < gr(D(x))
2x³ – 7x² + 11x + 1 = (2x – 1) · (x² – 3x + 4) + 5

**Voorbeeld 2**
Gegeven: A(x) = 2x⁴ + x² + 13x + 5
 D(x) = x² – 2x + 3

Gevraagd: Bepaal het quotiënt Q(x) en de rest R(x) van de euclidische deling van A(x) door D(x).

Oplossing (algoritme)

  2x⁴ + 0x³ + x² + 13x + 5  | x² – 2x + 3
– (2x⁴ – 4x³ + 6x²)         | 2x² + 4x + 3 = Q(x)
-------------------
        4x³ – 5x² + 13x + 5
      – (4x³ – 8x² + 12x)
      -------------------
              3x² + x + 5
            – (3x² – 6x + 9)
            ----------------
                    7x – 4 = R(x)

Besluit: Q(x) = 2x² + 4x + 3
R(x) = 7x – 4

A(x) = D(x) · Q(x) + R(x) waarbij gr(R(x)) < gr(D(x))

2x⁴ + x² + 13x + 5 = (x² – 2x + 3) · (2x² + 4x + 3) + 7x – 4

--- PAGE 8 ---
## 1.4 Deelbaarheid in ℝ[x]

**definitie**
Een veelterm A(x) is deelbaar door D(x) als en slechts als de rest van de euclidische deling van A(x) door D(x) nul is.

IN SYMBOLEN
D(x) ∣ A(x) ⇔ A(x) = D(x) · Q(x) ⇔ R(x) = 0

**AFSPRAAK**
| betekent 'is een deler van'
∤ betekent 'is geen deler van'

**Voorbeelden**
3x + 5 ∣ 6x³ + 7x² – 2x + 5 want 6x³ + 7x² – 2x + 5 = (3x + 5)(2x² – x + 1)
2x + 1 ∤ 6x³ + 7x² – 2x + 5 want 6x³ + 7x² – 2x + 5 = (2x + 1)(3x² + 2x – 2) + 7

# Verwerkingsopdrachten 1, 2

**1**
Bepaal de getalwaarde van A(x) voor x = a met behulp van het rekenschema van Horner.

| A(x) | a |
|---|---|
| a) A(x) = 2x⁴ – 3x³ + x² – 5x + 7 | a = 4 |
| b) A(x) = x⁵ + 2x⁴ – x³ – 3x² + 6x + 11 | a = –3 |
| c) A(x) = 6x⁴ - 4x³ + 9 | a = 1,5 |

a)
```text
      2      -3       1      -5       7
  4           8      20      84     316
----------------------------------------
      2       5      21      79     323
```
A(4) = 323

b)
```text
      1       2      -1      -3       6      11
 -3          -3       3      -6      27     -99
------------------------------------------------
      1      -1       2      -9      33     -88
```
A(-3) = -88

c)
```text
      6      -4       0       0       9
1,5           9     7,5   11,25  16,875
----------------------------------------
      6       5     7,5   11,25  25,875
```
A(1,5) = 25,875

--- PAGE 9 ---
**2**
Voer volgende euclidische delingen uit in ℝ[x].

| Deeltal A(x) | Deler D(x) |
|---|---|
| a) A(x) = 4x³ + 17x² – 39x + 19 | D(x) = 4x – 3 |
| b) A(x) = 6x⁴ – x³ – 2x – 1 | D(x) = 3x² + x – 1 |
| c) A(x) = -x³ + 8x² - 11x - 20 | D(x) = x – 5 |

a)
```text
  4x³ + 17x² - 39x + 19 | 4x - 3
- (4x³ -  3x²)          | x² + 5x - 6
--------------
        20x² - 39x + 19
      - (20x² - 15x)
      --------------
             -24x + 19
           - (-24x + 18)
           -------------
                     1
```
Q(x) = x² + 5x - 6
R(x) = 1

b)
```text
  6x⁴ -   x³ + 0x² - 2x - 1 | 3x² + x - 1
- (6x⁴ + 2x³ - 2x²)         | 2x² - x + 1
-------------------
        -3x³ + 2x² - 2x - 1
      - (-3x³ -  x² +  x)
      -------------------
               3x² - 3x - 1
             - (3x² +  x - 1)
             ----------------
                     - 4x
```
Q(x) = 2x² - x + 1
R(x) = -4x

c)
```text
  -x³ +  8x² - 11x - 20 | x - 5
- (-x³ +  5x²)          | -x² + 3x + 4
--------------
         3x² - 11x - 20
       - (3x² - 15x)
       -------------
                4x - 20
              - (4x - 20)
              -----------
                      0
```
Q(x) = -x² + 3x + 4
R(x) = 0

--- PAGE 10 ---
**3**
Ga na of A(x) deelbaar is door D(x) of niet.

| Deeltal A(x) | Deler D(x) |
|---|---|
| a) A(x) = x⁴ – x³ – 6x² + 5x – 1 | D(x) = x² – 3x + 1 |
| b) A(x) = x⁴ – 5x³ + 9x² – 6x + 1 | D(x) = x² – 2x + 1 |

a)
```text
  x⁴ -   x³ -  6x² +  5x - 1 | x² - 3x + 1
- (x⁴ - 3x³ +   x²)          | x² + 2x - 1
-------------------
        2x³ -  7x² +  5x - 1
      - (2x³ -  6x² +  2x)
      --------------------
               -x² +  3x - 1
             - (-x² +  3x - 1)
             -----------------
                           0
```
R(x) = 0 ⇒ A(x) is deelbaar door D(x).

b)
```text
  x⁴ -  5x³ +  9x² -  6x + 1 | x² - 2x + 1
- (x⁴ -  2x³ +   x²)         | x² - 3x + 2
--------------------
       -3x³ +  8x² -  6x + 1
     - (-3x³ +  6x² -  3x)
     ---------------------
               2x² -  3x + 1
             - (2x² -  4x + 2)
             -----------------
                       x - 1
```
R(x) = x - 1 ≠ 0 ⇒ A(x) is niet deelbaar door D(x).

--- PAGE 11 ---
# 2 Deelbaarheid in ℝ[x]

## 2.1 Deling door x – a door middel van de regel van Horner

**Voorbeeld**
Gegeven: A(x) = 2x³ + 5x² + 4x + 14
 D(x) = x + 3         (a = –3)

Gevraagd: Bepaal het quotiënt Q(x) en de rest R(x) van de euclidische deling van A(x) door D(x).

Oplossing (algoritme)
```text
  2x³ + 5x² + 4x + 14 | x + 3
– (2x³ + 6x²)         | 2x² – x + 7
-------------
        –x² + 4x + 14
      – (–x² – 3x)
      ------------
              7x + 14
            – (7x + 21)
            -----------
                   –7
```

Q(x) = 2x² – x + 7
R(x) = –7

Merk op dat de rest een getal is, dit komt omdat gr(R(x)) < gr(D(x)) = 1.

Passen we op A(x) het rekenschema van Horner toe om de getalwaarde van a = –3 te berekenen:

```text
       2      5      4     14
 –3          –6      3    –21
-----------------------------
       2     –1      7     –7
```

Dan kunnen we het volgende vaststellen:
- De rest R(x) is gelijk aan de getalwaarde van A(x) voor x = a (we bewijzen deze vaststelling in 2.2).
- De coëfficiënten van het quotiënt zijn de getallen die voorkomen op de onderste lijn in het rekenschema van Horner.

--- PAGE 12 ---
## 2.2 Reststelling bij deling door x – a

**stelling**
Bij de euclidische deling van een veelterm A(x) door x – a is de rest van de deling gelijk aan de getalwaarde van het deeltal voor x = a.

Gegeven: A(x) ∈ ℝ[x]
 D(x) = x – a

Te bewijzen: Bij deling van A(x) door x – a is R(x) = A(a).

Bewijs:
A(x) = D(x) · Q(x) + R(x)     met gr(R(x)) < gr(D(x)) = 1
⇒ A(x) = (x – a) · Q(x) + R(x) met gr(R(x)) = 0
⇒ A(a) = (a – a) · Q(x) + r   met R(x) = r ∈ ℝ
⇒ A(a) = r

**Voorbeeld**
Bepaal het quotiënt Q(x) en de rest R(x) van de euclidische deling van A(x) = x⁴ – 2x³ – 8x² – 7x + 31 door D(x) = x – 4.

Oplossing via het rekenschema van Horner

```text
       1     –2     –8     –7     31
   4          4      8      0    –28
------------------------------------
       1      2      0     –7      3
```

Q(x) = x³ + 2x² + 0x – 7 = x³ + 2x² – 7
R(x) = r = 3

## 2.3 Criterium van deelbaarheid door x – a

**eigenschap**
De veelterm A(x) is deelbaar door x – a als en slechts als de getalwaarde van A(x) voor x = a gelijk is aan 0.

IN SYMBOLEN
x – a ∣ A(x) ⇔ A(a) = 0

Dit volgt rechtstreeks uit de reststelling:
x – a ∣ A(x)
⇔ de rest na deling van A(x) door x – a is 0
⇔ A(a) = 0

--- PAGE 13 ---
## 2.4 Bepalen van delers van de vorm x – a

**Voorbeeld**
We proberen de delers van de vorm x – a te bepalen van de veelterm
A(x) = x³ + 3x² – 4x – 12

Volgens het criterium van deelbaarheid geldt:
x – a ∣ A(x) ⇔ A(a) = 0
x – 2 ∣ A(x) want A(2) = 2³ + 3 · 2² – 4 · 2 – 12 = 0
x + 2 ∣ A(x) want A(–2) = (–2)³ + 3 · (–2)² – 4 · (–2) – 12 = 0
x + 3 ∣ A(x) want A(–3) = (–3)³ + 3 · (–3)² – 4 · (–3) – 12 = 0

Merk op dat zowel 2, –2 en –3 gehele delers zijn van –12 (de constante term van de veelterm).

Werkwijze voor het bepalen van een deler van de vorm x – a:
- opdat een veelterm A(x) deelbaar zou zijn door x – a met a ∈ ℤ , is het nodig dat de constante term van de veelterm deelbaar is door a
x − a ∣ A(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + … + a₁x + a₀ ⇒ a ∣ a₀
- opdat een veelterm A(x) deelbaar zou zijn door x – a met a ∈ ℚ, ( a = p/q , p, q ∈ ℤ ), is het nodig dat de constante term van de veelterm deelbaar is door p en de coëfficiënt van de term met de hoogste macht deelbaar is door q.
x − p/q ∣ A(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + … + a₁x + a₀ ⇒ p ∣ a₀ en q ∣ aₙ

**Voorbeeld 1**
Bepaal de delers van de vorm x – a van de veelterm A(x) = x³ – 13x + 12

del 12 = {1, –1, 2, –2, 3, –3, 4, –4, 6, –6, 12, –12}

A(1) = 0   ⇒ x – 1 ∣ A(x)
A(2) ≠ 0   ⇒ x – 2 ∤ A(x)
A(3) = 0   ⇒ x – 3 ∣ A(x)
A(4) ≠ 0   ⇒ x – 4 ∤ A(x)
…
A(–4) = 0  ⇒ x + 4 ∣ A(x)

**Voorbeeld 2**
Bepaal de delers van de vorm x – a van de veelterm A(x) = 4x³ – 4x² – 11x + 6

del 6 = {1, –1, 2, –2, 3, –3, 6, –6}
del 4 = {1, –1, 2, –2, 4, –4}

A(2) = 0       ⇒ x − 2 ∣ A(x)
A(1/2) = 0     ⇒ x − 1/2 ∣ A(x)
A(−3/2) = 0    ⇒ x + 3/2 ∣ A(x)

--- PAGE 14 ---
# Verwerkingsopdrachten 3, 4, 5

**4**
Bepaal het quotiënt en de rest bij deling van A(x) door D(x).

| A(x) | D(x) |
|---|---|
| a) A(x) = 5x³ – x² + x – 1 | D(x) = x + 1 |
| b) A(x) = 3x⁴ – 4x³ – 3x² – 2x – 12 | D(x) = x – 2 |

a)
```text
       5      -1       1      -1
  -1          -5       6      -7
--------------------------------
       5      -6       7      -8
```

Q(x) = 5x² - 6x + 7
R(x) = -8

b)
```text
       3      -4      -3      -2     -12
   2           6       4       2       0
----------------------------------------
       3       2       1       0     -12
```

Q(x) = 3x³ + 2x² + x
R(x) = -12

--- PAGE 15 ---
**5**
a) Bij deling van A(x) = 2x² + ax - 4 door x - 4 is de rest 8. Bepaal a.

```text
       2       a      -4
   4           8      4a + 32
-----------------------------
       2      a + 8    8
```

−4 + 4a + 32 = 8
4a = −20
a = −5

b) A(x) = 3x³ - 16x² + ax - 10 is deelbaar door x - 5. Bepaal a.

```text
       3     -16       a     -10
   5          15      -5     5a - 25
------------------------------------
       3      -1     a - 5     0
```

−10 + 5a − 25 = 0
5a = 35
a = 7

--- PAGE 16 ---
**6**
Bepaal de delers van de vorm (x – a) (a ∈ ℤ) van de veelterm A(x).

| A(x) |
|---|
| a) A(x) = x³ – 2x² – 13x – 10 |
| b) A(x) = x⁴ – 2x³ – 7x² + 8x + 12 |
| c) A(x) = x⁵ -5x⁴ + 3x² + 2x + 8 |

a) del (10) = {1, −1, 2, −2, 5, −5, 10, −10}

A (−1) = 0  ⇒  x + 1 ∣ A (x)
A (−2) = 0  ⇒  x + 2 ∣ A (x)
A (5) = 0   ⇒  x − 5 ∣ A (x)

b) del (12) = {1, −1, 2, −2, 3, −3, 4, −4, 6, −6, 12, −12}

A (−1) = 0  ⇒  x + 1 ∣ A (x)
A (2) = 0   ⇒  x − 2 ∣ A (x)
A (−2) = 0  ⇒  x + 2 ∣ A (x)
A (3) = 0   ⇒  x − 3 ∣ A (x)

c) del (8) = {1, −1, 2, −2, 4, −4, 8, −8}

Er zijn geen delers van de vorm (x − a) waarvoor a ∈ ℤ.

--- PAGE 17 ---
**7**
A(x) = x³ + ax² + bx + 12 is deelbaar door (x + 3). Bij deling door (x + 2) is de rest 8. Bepaal a en b.

```text
       1       a       b            12
  -3          -3      -3a + 9      -3b + 9a - 27
------------------------------------------------
       1     a - 3    b - 3a + 9    0
```

```text
       1       a       b            12
  -2          -2      -2a + 4       4a - 2b - 8
-----------------------------------------------
       1     a - 2   -2a + b + 4    8
```

Hierbij kunnen we 2 vergelijkingen met 2 onbekenden opstellen:
• 12 − 3b + 9a − 27 = 0
9a − 3b = 15

• 12 + 4a − 2b − 8 = 8
4a − 2b = 4

We lossen op met behulp van een stelsel:
{ 9a − 3b = 15
{ 4a − 2b = 4

⇔
{ 3a − b = 5
{ 2a − b = 2

⇔
{ b = 3a − 5
{ 2a − (3a − 5) = 2

⇔
{ b = 3a − 5
{ −a + 5 = 2

⇔
{ b = 4
{ a = 3

--- PAGE 18 ---
**8**
Bepaal de delers van de vorm (x – a) (a ∈ ℚ) van de veelterm A(x).

| A(x) |
|---|
| a) A(x) = 3x³ – 10x² – x + 12 |
| b) A(x) = 6x³ – 5x² – 8x + 3 |

a) del (12) = {1, −1, 2, −2, 3, −3, 4, −4, 6, −6, 12, −12}
del (3) = {1, −1, 3, −3}

A (−1) = 0  ⇒  x + 1 ∣ A (x)
A (3) = 0   ⇒  x − 3 ∣ A (x)
A (4/3) = 0 ⇒  x − 4/3 ∣ A (x)

b) del (3) = {1, −1, 3, −3}
del (6) = {1, −1, 2, −2, 3, −3, 6, −6}

A (−1) = 0  ⇒  x + 1 ∣ A (x)
A (1/3) = 0 ⇒  x − 1/3 ∣ A (x)
A (3/2) = 0 ⇒  x − 3/2 ∣ A (x)

--- PAGE 19 ---
# 3 Toepassingen op de reststelling

## 3.1 Ontbinden in factoren

**Voorbeeld 1**
Ontbind de veelterm A(x) = x³ – 4x² + x + 6 in factoren.

Werkwijze:
- Bepaal een deler van de vorm x – a van A(x).
Omdat A(2) = 0, is x – 2 een deler van A(x).

- Bepaal het quotiënt van de euclidische deling van A(x) door x – 2 met behulp van het rekenschema van Horner.

```text
       1     –4      1      6
   2          2     –4     –6
-----------------------------
       1     –2     –3      0
```

Q(x) = x² – 2x – 3
A(x) = (x – 2)(x² – 2x – 3)

- Bepaal een deler van de vorm x – a van Q(x).
Omdat Q(3) = 0, is x – 3 een deler van Q(x).

- Bepaal het quotiënt van de euclidische deling van Q(x) door x – 3 met behulp van het rekenschema van Horner.

```text
       1     –2     –3
   3          3      3
----------------------
       1      1      0
```

Q₂(x) = x + 1
Q(x) = (x – 3)(x + 1)
A(x) = (x – 2)(x – 3)(x + 1)

--- PAGE 20 ---
**Voorbeeld 2**
Ontbind de veelterm A(x) = 4x⁴ + 8x³ – 11x² + 3x in factoren.

- Zet de gemeenschappelijke factor x voorop.
A(x) = x(4x³ + 8x² – 11x + 3)

- Bepaal een deler van de vorm x – a van Q₁(x) = 4x³ + 8x² – 11x + 3.
Omdat A(–3) = 0, is x + 3 een deler van Q₁(x).

```text
       4      8    –11      3
  –3        –12     12     –3
-----------------------------
       4     –4      1      0
```

Q₂(x) = 4x² – 4x + 1
A(x) = x(x + 3)(4x² – 4x + 1)

- Bepaal een deler van de vorm x – a van Q₂(x).
Omdat Q₂(1/2) = 0, is x − 1/2 een deler van Q₂(x).

```text
       4     –4      1
 1/2          2     –1
----------------------
       4     –2      0
```

Q₃(x) = 4x – 2
A(x) = x(x + 3)(x − 1/2)(4x − 2)
= x(x + 3)(2x − 1)(2x − 1)
= x(x + 3)(2x − 1)²

--- PAGE 21 ---
## 3.2 De tweetermen x³ – a³ en x³ + a³

De veelterm A(x) = x³ – a³ is deelbaar door x – a want A(a) = a³ – a³ = 0, het quotiënt kunnen we bepalen via het rekenschema van Horner.

```text
       1      0      0     –a³
   a          a      a²     a³
------------------------------
       1      a      a²      0
```

A(x) = x³ − a³ = (x − a)(x² + ax + a²)

**Voorbeelden**
x³ − 64 = (x − 4)(x² + 4x + 16)
8x³ − 125 = (2x − 5)(4x² + 10x + 25)

De veelterm A(x) = x³ + a³ is deelbaar door x + a want A(–a) = (–a)³ + a³ = 0, het quotiënt kunnen we bepalen via het rekenschema van Horner.

```text
       1      0      0      a³
  –a         –a      a²    –a³
------------------------------
       1     –a      a²      0
```

A(x) = x³ + a³ = (x + a)(x² − ax + a²)

**Voorbeelden**
x³ + 27 = (x + 3)(x² − 3x + 9)
x³ + 8y³ = (x + 2y)(x² − 2xy + 4y²)

--- PAGE 22 ---
## 3.3 Oplossen van ongelijkheden

**Voorbeeld**
Los op in ℝ: 2x⁴ – 5x³ – 4x² + 3x ⩽ 0

Stap 1: Ontbind de veelterm A(x) = 2x⁴ – 5x³ – 4x² + 3x in factoren.
 A(x) = x(2x³ − 5x² − 4x + 3)

```text
       2     –5     –4      3
   3          6      3     –3
-----------------------------
       2      1     -1      0
```

 A(x) = x (x − 3)(2x² + x − 1)

```text
       2      1     –1
  –1         –2      1
----------------------
       2     –1      0
```

 A(x) = x (x − 3)(x + 1)(2x − 1)

Stap 2: Maak een tekenverloop van A(x) = x (x − 3)(x + 1)(2x − 1).

| x | | –1 | | 0 | | 1/2 | | 3 | |
|---|---|---|---|---|---|---|---|---|---|
| x | – | – | – | 0 | + | + | + | + | + |
| x – 3 | – | – | – | – | – | – | – | 0 | + |
| x + 1 | – | 0 | + | + | + | + | + | + | + |
| 2x – 1 | – | – | – | – | – | 0 | + | + | + |
| A(x) | + | 0 | – | 0 | + | 0 | – | 0 | + |

Stap 3: Los de ongelijkheid op.
 V = [−1, 0] ∪ [1/2, 3]

**TIP**
Maak het tekenverloop van elke factor afzonderlijk en noteer ze in 1 tekentabel. Bepaal daarna het eindresultaat voor de veelterm.

--- PAGE 23 ---
# Verwerkingsopdrachten 6, 7, 8

**9**
Ontbind de veelterm A(x) in factoren.

| A(x) |
|---|
| a) A(x) = x³ + 3x² – 4x – 12 |
| b) A(x) = 3x⁴ + 11x³ + 8x² – 4x |

a)
```text
       1      3     -4    -12
   2          2     10     12
-----------------------------
       1      5      6      0
```
A(x) = (x - 2)(x² + 5x + 6)

```text
       1      5      6
  -2         -2     -6
----------------------
       1      3      0
```
A(x) = (x - 2)(x + 2)(x + 3)

b) A(x) = x(3x³ + 11x² + 8x - 4)

```text
       3     11      8     -4
  -2         -6    -10      4
-----------------------------
       3      5     -2      0
```
A(x) = (x + 2)(3x² + 5x - 2)

```text
       3      5     -2
  -2         -6      2
----------------------
       3     -1      0
```
A(x) = x · (x + 2)(x + 2)(3x - 1)
= x(x + 2)²(3x - 1)

**10**
Ontbind in factoren.
a) 27x³ + 8
b) x³ – t⁶

a) 27x³ + 8 = (3x + 2)(9x² - 6x + 4)
b) x³ - t⁶ = (x - t²)(x² + xt² + t⁴)

--- PAGE 24 ---
**11**
Los op in ℝ.
a) x³ + 2x² – 5x – 6 > 0
b) x³ + 3x² – 9x + 5 < 0
c) 2x⁴ + 3x³ – 2x² – 3x ⩾ 0

a) A(x) = x³ + 2x² - 5x - 6
= (x + 1)(x - 2)(x + 3)

| x | | -3 | | -1 | | 2 | |
|---|---|---|---|---|---|---|---|
| x + 1 | - | - | - | 0 | + | + | + |
| x - 2 | - | - | - | - | - | 0 | + |
| x + 3 | - | 0 | + | + | + | + | + |
| A(x) | - | 0 | + | 0 | - | 0 | + |

V = ]-3, -1[ ∪ ]2, +∞[

```text
       1      2     -5     -6
  -1         -1     -1      6
-----------------------------
       1      1     -6      0
```
A(x) = (x + 1)(x² + x - 6)

```text
       1      1     -6
   2          2      6
----------------------
       1      3      0
```
A(x) = (x + 1)(x - 2)(x + 3)

b) A(x) = x³ + 3x² - 9x + 5
= (x - 1)²(x + 5)

| x | | -5 | | 1 | |
|---|---|---|---|---|---|
| (x - 1)² | + | + | + | 0 | + |
| x + 5 | - | 0 | + | + | + |
| A(x) | - | 0 | + | 0 | + |

V = ]-∞, -5[

```text
       1      3     -9      5
   1          1      4     -5
-----------------------------
       1      4     -5      0
```
A(x) = (x - 1)(x² + 4x - 5)

```text
       1      4     -5
   1          1      5
----------------------
       1      5      0
```
A(x) = (x - 1)(x - 1)(x + 5)

c) A(x) = 2x⁴ + 3x³ - 2x² - 3x
= x(2x³ + 3x² - 2x - 3)
= x(x - 1)(x + 1)(2x + 3)

| x | | -3/2 | | -1 | | 0 | | 1 | |
|---|---|---|---|---|---|---|---|---|---|
| x | - | - | - | - | - | 0 | + | + | + |
| x - 1 | - | - | - | - | - | - | - | 0 | + |
| x + 1 | - | - | - | 0 | + | + | + | + | + |
| 2x + 3 | - | 0 | + | + | + | + | + | + | + |
| A(x) | + | 0 | - | 0 | + | 0 | - | 0 | + |

V = ]-∞, -3/2] ∪ [-1, 0] ∪ [1, +∞[

```text
       2      3     -2     -3
   1          2      5      3
-----------------------------
       2      5      3      0
```
A(x) = (x - 1)(2x² + 5x + 3)

```text
       2      5      3
  -1         -2     -3
----------------------
       2      3      0
```
A(x) = x(x - 1)(x + 1)(2x + 3)

--- PAGE 25 ---
# Signaaloefeningen

**1**
Bepaal de getalwaarde van A(x) voor x = a met behulp van het rekenschema van Horner.

| A(x) | a |
|---|---|
| a) A(x) = 2x⁴ + x³ – x² – 6x + 1 | –2 |
| b) A(x) = x⁴ – 3x³ + x² – 4x + 7 | 3 |

a)
```text
       2      1     -1     -6      1
  -2         -4      6    -10     32
------------------------------------
       2     -3      5    -16     33
```
A(-2) = 33

b)
```text
       1     -3      1     -4      7
   3          3      0      3     -3
------------------------------------
       1      0      1     -1      4
```
A(3) = 4

>>> Verder oefenen: D1 t.e.m. D8

--- PAGE 26 ---
**2**
Voer volgende euclidische delingen uit in ℝ[x].

| Deeltal A(x) | Deler D(x) |
|---|---|
| a) A(x) = 6x³ + 7x² – 19x – 22 | D(x) = 3x + 2 |
| b) A(x) = x³ – 6x² – 9x + 28 | D(x) = x² + x – 3 |
| c) A(x) = 4x⁴ – 4x³ – 5x² + 7x – 2 | D(x) = 2x² – 3x + 1 |

a)
```text
  6x³ +  7x² - 19x - 22 | 3x + 2
- (6x³ +  4x²)          | 2x² + x - 7
--------------
         3x² - 19x - 22
       - (3x² +  2x)
       -------------
             -21x - 22
           - (-21x - 14)
           -------------
                     -8
```
Q(x) = 2x² + x - 7
R(x) = -8

b)
```text
   x³ -  6x² -  9x + 28 | x² + x - 3
- (x³ +   x² -  3x)     | x - 7
-------------------
        -7x² -  6x + 28
      - (-7x² -  7x + 21)
      -------------------
                 x +  7
```
Q(x) = x - 7
R(x) = x + 7

c)
```text
  4x⁴ -  4x³ -  5x² +  7x -  2 | 2x² - 3x + 1
- (4x⁴ -  6x³ +  2x²)          | 2x² + x - 2
---------------------
         2x³ -  7x² +  7x -  2
       - (2x³ -  3x² +   x)
       --------------------
               -4x² +  6x -  2
             - (-4x² +  6x -  2)
             -------------------
                             0
```
Q(x) = 2x² + x - 2
R(x) = 0

>>> Verder oefenen: D1 t.e.m. D8

--- PAGE 27 ---
**3**
Bepaal het quotiënt en de rest bij deling van A(x) door D(x).

| A(x) | D(x) |
|---|---|
| a) A(x) = 2x³ – 19x + 8 | D(x) = x – 3 |
| b) A(x) = x⁴ – 4x³ – 11x² – 2x – 1 | D(x) = x + 2 |
| c) A(x) = x⁴ + 5x³ – x² + x + 30 | D(x) = x + 5 |

a)
```text
       2      0    -19      8
   3          6     18     -3
-----------------------------
       2      6     -1      5
```
Q(x) = 2x² + 6x - 1
R(x) = 5

b)
```text
       1     -4    -11     -2     -1
  -2         -2     12     -2      8
------------------------------------
       1     -6      1     -4      7
```
Q(x) = x³ - 6x² + x - 4
R(x) = 7

c)
```text
       1      5     -1      1     30
  -5         -5      0      5    -30
------------------------------------
       1      0     -1      6      0
```
Q(x) = x³ - x + 6
R(x) = 0

>>> Verder oefenen: D9 t.e.m. D19

--- PAGE 28 ---
**4**
Bepaal de delers van de vorm x – a (a ∈ ℚ) van de veelterm A(x).

| A(x) |
|---|
| a) A(x) = x³ + 3x² – 4 |
| b) A(x) = x⁴ – x³ – 11x² + 9x + 18 |
| c) A(x) = 2x³ – 3x² – 18x + 27 |
| d) A(x) = 8x³ – 10x² – x + 3 |

a) del (4) = {1, −1, 2, −2, 4, −4}
del (1) = {1, −1}

A (1) = 0  ⇒  x − 1 ∣ A (x)
A (−2) = 0 ⇒  x + 2 ∣ A (x)

b) del (18) = {1, −1, 2, −2, 3, −3, 6, −6, 9, −9, 18, −18}
del (1) = {1, −1}

A (−1) = 0 ⇒  x + 1 ∣ A (x)
A (2) = 0  ⇒  x − 2 ∣ A (x)
A (3) = 0  ⇒  x − 3 ∣ A (x)
A (−3) = 0 ⇒  x + 3 ∣ A (x)

c) del (27) = {1, −1, 3, −3, 9, −9, 27, −27}
del (2) = {1, −1, 2, −2}

A (3) = 0  ⇒  x − 3 ∣ A (x)
A (−3) = 0 ⇒  x + 3 ∣ A (x)
A(3/2) = 0 ⇒  x − 3/2 ∣ A (x)

d) del (3) = {1, −1, 3, −3}
del (8) = {1, −1, 2, −2, 4, −4, 8, −8}

A (1) = 0  ⇒  x − 1 ∣ A (x)
A(3/4) = 0 ⇒  x − 3/4 ∣ A (x)
A(−1/2) = 0 ⇒  x + 1/2 ∣ A (x)

>>> Verder oefenen: D9 t.e.m. D19

--- PAGE 29 ---
**5**
Vervolledig het rekenschema van Horner en bepaal p zodat bij de euclidische deling van A(x) = 5x³ + px² + 7x – 2 door D(x) = x – 2 de rest gelijk zou zijn aan 4.

```text
       5      p       7      -2
   2         10    2p + 20 4p + 54
----------------------------------
       5   p + 10  2p + 27 4p + 52
```

R(x) = 4
⇔ 4p + 52 = 4
⇔ 4p = −48
⇔ p = −12

>>> Verder oefenen: D9 t.e.m. D19

--- PAGE 30 ---
**6**
Ontbind de veelterm A(x) in factoren.

| A(x) |
|---|
| a) A(x) = 2x³ + 7x² – 5x – 4 |
| b) A(x) = x³ – 2x² + x – 2 |
| c) A(x) = 6x⁴ – 5x³ – 15x² + 4 |
| d) A(x) = x³ + 2x² – 2x + 3 |

a)
```text
       2      7     -5     -4
   1          2      9      4
-----------------------------
       2      9      4      0
```
A(x) = (x - 1)(2x² + 9x + 4)

```text
       2      9      4
  -4         -8     -4
----------------------
       2      1      0
```
A(x) = (x - 1)(x + 4)(2x + 1)

b)
```text
       1     -2      1     -2
   2          2      0      2
-----------------------------
       1      0      1      0
```
A(x) = (x-2)(x² + 1)

c)
```text
       6     -5    -15      0      4
  -1         -6     11      4     -4
------------------------------------
       6    -11     -4      4      0
```
A(x) = (x + 1)(6x³ - 11x² - 4x + 4)

```text
       6    -11     -4      4
   2         12      2     -4
-----------------------------
       6      1     -2      0
```
A(x) = (x + 1)(x - 2)(6x² + x - 2)

```text
       6      1     -2
  1/2         3      2
----------------------
       6      4      0
```
A(x) = (x + 1)(x − 2)(x − 1/2)(6x + 4)
= (x + 1)(x − 2)(2x − 1)(3x + 2)

d)
```text
       1      2     -2      3
  -3         -3      3     -3
-----------------------------
       1     -1      1      0
```
A(x) = (x + 3)(x² - x + 1)

>>> Verder oefenen: D20 t.e.m. D26

--- PAGE 31 ---
**7**
Ontbind in factoren.
a) a³ – 1
b) b³ + 8a³
c) 64x³ – 27
d) t³ + 125

a) a³ - 1 = (a - 1)(a² + a + 1)
b) b³ + 8a³ = (b + 2a)(b² - 2ab + 4a²)
c) 64x³ - 27 = (4x - 3)(16x² + 12x + 9)
d) t³ + 125 = (t + 5)(t² - 5t + 25)

>>> Verder oefenen: D20 t.e.m. D26

--- PAGE 32 ---
**8**
Los op in ℝ.
a) x³ – 3x² – 4x + 12 ⩽ 0
b) 2x³ – 3x² – 5x + 6 ⩾ 0
c) x⁴ – 3x³ – 9x² – 5x < 0
d) 6x⁴ – 23x³ + 12x² + 11x – 6 > 0

a) A(x) = x³ - 3x² - 4x + 12
= (x - 2)(x + 2)(x - 3)

| x | | -2 | | 2 | | 3 | |
|---|---|---|---|---|---|---|---|
| x - 2 | - | - | - | 0 | + | + | + |
| x + 2 | - | 0 | + | + | + | + | + |
| x - 3 | - | - | - | - | - | 0 | + |
| A(x) | - | 0 | + | 0 | - | 0 | + |

V = ]-∞, -2] ∪ [2, 3]

b) A(x) = 2x³ - 3x² - 5x + 6
= (x - 1)(x - 2)(2x + 3)

| x | | -3/2 | | 1 | | 2 | |
|---|---|---|---|---|---|---|---|
| x - 1 | - | - | - | 0 | + | + | + |
| x - 2 | - | - | - | - | - | 0 | + |
| 2x + 3 | - | 0 | + | + | + | + | + |
| A(x) | - | 0 | + | 0 | - | 0 | + |

V = [-3/2, 1] ∪ [2, +∞[

c) A(x) = x⁴ - 3x³ - 9x² - 5x
= x(x³ - 3x² - 9x -5)
= x(x + 1)²(x - 5)

| x | | -1 | | 0 | | 5 | |
|---|---|---|---|---|---|---|---|
| x | - | - | - | 0 | + | + | + |
| (x + 1)² | + | 0 | + | + | + | + | + |
| x - 5 | - | - | - | - | - | 0 | + |
| A(x) | + | 0 | + | 0 | - | 0 | + |

V = ]0, 5[

d) A(x) = 6x⁴ - 23x³ + 12x² + 11x - 6
= (x - 1)(x - 3)(2x - 1)(3x + 2)

| x | | -2/3 | | 1/2 | | 1 | | 3 | |
|---|---|---|---|---|---|---|---|---|---|
| x - 1 | - | - | - | - | - | 0 | + | + | + |
| x - 3 | - | - | - | - | - | - | - | 0 | + |
| 2x - 1 | - | - | - | 0 | + | + | + | + | + |
| 3x + 2 | - | 0 | + | + | + | + | + | + | + |
| A(x) | + | 0 | - | 0 | + | 0 | - | 0 | + |

V = ]-∞, -2/3[ ∪ ]1/2, 1[ ∪ ]3, +∞[

(Rechterkant tabellen)
a)
```text
       1     -3     -4     12
   2          2     -2    -12
-----------------------------
       1     -1     -6      0
```
A(x) = (x - 2)(x² - x - 6)
```text
       1     -1     -6
  -2         -2      6
----------------------
       1     -3      0
```
A(x) = (x - 2)(x + 2)(x - 3)

b)
```text
       2     -3     -5      6
   1          2     -1     -6
-----------------------------
       2     -1     -6      0
```
A(x) = (x - 1)(2x² - x - 6)
```text
       2     -1     -6
   2          4      6
----------------------
       2      3      0
```
A(x) = (x - 1)(x - 2)(2x + 3)

c)
```text
       1     -3     -9     -5
  -1         -1      4      5
-----------------------------
       1     -4     -5      0
```
A(x) = x(x + 1)(x² - 4x - 5)
```text
       1     -4     -5
  -1         -1      5
----------------------
       1     -5      0
```
A(x) = x(x + 1)(x + 1)(x - 5)

d)
```text
       6    -23     12     11     -6
   1          6    -17     -5      6
------------------------------------
       6    -17     -5      6      0
```
A(x) = (x - 1)(6x³ - 17x² - 5x + 6)
```text
       6    -17     -5      6
   3         18      3     -6
-----------------------------
       6      1     -2      0
```
A(x) = (x - 1)(x - 3)(6x² + x - 2)
```text
       6      1     -2
  1/2         3      2
----------------------
       6      4      0
```
A(x) = (x - 1)(x - 3)(x - 1/2)(6x + 4)

>>> Verder oefenen: D20 t.e.m. D26

--- PAGE 33 ---
# Differentiatietraject

**1**
Vervolledig het rekenschema van Horner en bepaal de getalwaarde van A(x) = 2x⁴ – 3x³ + x² – 5x + 8 voor a = 3.

```text
       2     -3      1     -5      8
   3          6      9     30     75
------------------------------------
       2      3     10     25     83
```
A(3) = 83

**2**
Bepaal de getalwaarde van A(x) voor x = a met behulp van het rekenschema van Horner.

| A(x) | a |
|---|---|
| a) A(x) = 3x⁴ – x³ + 2x² – 4x + 5 | 2 |
| b) A(x) = x⁴ + 2x³ + x² – 5x + 6 | –3 |

a)
```text
       3     -1      2     -4      5
   2          6     10     24     40
------------------------------------
       3      5     12     20     45
```
A(2) = 45

b)
```text
       1      2      1     -5      6
  -3         -3      3    -12     51
------------------------------------
       1     -1      4    -17     57
```
A(-3) = 57

**3**
Bij deling van de veelterm A(x) door 3x² – 4x + 1 is het quotiënt 2x – 1 en de rest 5x + 3. Bepaal A(x).

A(x) = D(x) · Q(x) +R(x)
= (3x² - 4x + 1)(2x - 1) + 5x + 3
= 6x³ - 3x² - 8x² + 4x + 2x - 1 + 5x + 3
= 6x³ - 11x² + 11x + 2

--- PAGE 34 ---
**4**
Voer volgende euclidische delingen uit in ℝ[x].

| Deeltal A(x) | Deler D(x) |
|---|---|
| a) A(x) = 6x³ – 10x² + 18x – 8 | D(x) = 2x – 2 |
| b) A(x) = 2x⁴ – 14x³ + 27x² – 13x + 4 | D(x) = x – 4 |
| c) A(x) = 2x⁴ – x³ + 3x² – 4x + 1 | D(x) = 2x + 1 |
| d) A(x) = 3x⁴ + 2x³ + x² + 5x | D(x) = x² + x – 1 |
| e) A(x) = 2x⁴ – 5x³ – 5x² + 7x – 1 | D(x) = 2x² + x – 2 |
| f) A(x) = 3x⁴ + 4x³ – 7x² – 8x – 4 | D(x) = x² – 2 |
| g) A(x) = 2x⁴ – 3x³ + 7x² + 26x | D(x) = 2x² + 3x |
| h) A(x) = 4x³ + 4x² – 2x + 7 | D(x) = 2x² – x + 1 |

a)
```text
  6x³ - 10x² + 18x -  8 | 2x - 2
- (6x³ -  6x²)          | 3x² - 2x + 7
--------------
        -4x² + 18x -  8
      - (-4x² +  4x)
      --------------
               14x -  8
             - (14x - 14)
             ------------
                      6
```
Q(x) = 3x² - 2x + 7
R(x) = 6

b)
```text
  2x⁴ - 14x³ + 27x² - 13x +  4 | x - 4
- (2x⁴ -  8x³)                 | 2x³ - 6x² + 3x - 1
--------------
        -6x³ + 27x² - 13x +  4
      - (-6x³ + 24x²)
      ---------------
                3x² - 13x +  4
              - (3x² - 12x)
              -------------
                       -x +  4
                     - (-x +  4)
                     -----------
                             0
```
Q(x) = 2x³ - 6x² + 3x - 1
R(x) = 0

c)
```text
  2x⁴ -   x³ +  3x² -  4x +  1 | 2x + 1
- (2x⁴ +   x³)                 | x³ - x² + 2x - 3
--------------
        -2x³ +  3x² -  4x +  1
      - (-2x³ -   x²)
      ---------------
                4x² -  4x +  1
              - (4x² +  2x)
              -------------
                      -6x +  1
                    - (-6x -  3)
                    ------------
                             4
```
Q(x) = x³ - x² + 2x - 3
R(x) = 4

--- PAGE 35 ---
d)
```text
  3x⁴ +  2x³ +   x² +  5x +  0 | x² + x - 1
- (3x⁴ +  3x³ -  3x²)          | 3x² - x + 5
-------------------
         -x³ +  4x² +  5x +  0
       - (-x³ -   x² +   x)
       --------------------
                5x² +  4x +  0
              - (5x² +  5x -  5)
              ----------------
                       - x +  5
```
Q(x) = 3x² - x + 5
R(x) = -x + 5

e)
```text
  2x⁴ -  5x³ -  5x² +  7x -  1 | 2x² + x - 2
- (2x⁴ +   x³ -  2x²)          | x² - 3x
-------------------
        -6x³ -  3x² +  7x -  1
      - (-6x³ -  3x² +  6x)
      --------------------
                        x -  1
```
Q(x) = x² - 3x
R(x) = x - 1

f)
```text
  3x⁴ +  4x³ -  7x² -  8x -  4 | x² - 2
- (3x⁴ +  0x³ -  6x²)          | 3x² + 4x - 1
-------------------
         4x³ -   x² -  8x -  4
       - (4x³ -  0x² -  8x)
       --------------------
               - x² +  0x -  4
             - (-x² +  0x +  2)
             -----------------
                            -6
```
Q(x) = 3x² + 4x - 1
R(x) = -6

g)
```text
  2x⁴ -  3x³ +  7x² + 26x +  0 | 2x² + 3x
- (2x⁴ +  3x³)                 | x² - 3x + 8
--------------
        -6x³ +  7x² + 26x +  0
      - (-6x³ -  9x²)
      ---------------
               16x² + 26x +  0
             - (16x² + 24x)
             --------------
                       2x
```
Q(x) = x² - 3x + 8
R(x) = 2x

h)
```text
  4x³ +  4x² -  2x +  7 | 2x² - x + 1
- (4x³ -  2x² +  2x)    | 2x + 3
-------------------
         6x² -  4x +  7
       - (6x² -  3x +  3)
       ----------------
               - x +  4
```
Q(x) = 2x + 3
R(x) = -x + 4

--- PAGE 36 ---
**5**
Zoek de deler van de euclidische deling als het deeltal 6x³ + 7x² – 8x is, het quotiënt 3x + 2 en de rest –x + 6.

A(x) = 6x³ + 7x² − 8x
Q(x) = 3x + 2
R(x) = −x + 6

A(x) = D(x) ⋅ Q(x) + R(x)
⇔ A(x) − R(x) = D(x) ⋅ Q(x)
⇔ (A(x) − R(x)) / Q(x) = D(x)
⇔ D(x) = (6x³ + 7x² − 8x − (−x + 6)) / (3x + 2)
⇔ D(x) = (6x³ + 7x² − 8x + x − 6) / (3x + 2)
⇔ D(x) = (6x³ + 7x² − 7x − 6) / (3x + 2)
⇔ D(x) = 2x² + x − 3

```text
  6x³ +  7x² -  7x -  6 | 3x + 2
- (6x³ +  4x²)          | 2x² + x - 3
--------------
         3x² -  7x -  6
       - (3x² +  2x)
       -------------
               -9x -  6
             - (-9x -  6)
             ------------
                      0
```

**6**
Bij de deling van A(x) = 2x⁴ + 13x³ + px² + 21x – 4 door D(x) = x² + 6x – 1 is de rest R(x) = 4x – 1. Bepaal p.

```text
  2x⁴ + 13x³ +        px² + 21x -  4 | x² + 6x - 1
- (2x⁴ + 12x³ -        2x²)          | 2x² + x + p - 4
---------------------------
          x³ + (p +   2)x² + 21x -  4
        - (x³ +         6x² -   x)
        --------------------------
               (p -   4)x² + 22x -  4
             - [(p -   4)x² + (6p - 24)x -  p +  4]
             --------------------------------------
                              (-6p + 46)x + p -  8
```

(−6p + 46)x + p − 8 = 4x − 1
⇔ −6px + 46x + p − 8 = 4x − 1
⇔ −6px + p = 4x − 1 − 46x + 8
⇔ (−6x + 1)p = −42x + 7
⇔ p = (−42x + 7) / (−6x + 1)
⇔ p = 7

--- PAGE 37 ---
**7**
Bij de deling van A(x) = 3x⁴ + px³ + 10x² – x + 6 door D(x) = 3x² + x + 2 is de rest R(x) = –2x. Bepaal p.

```text
  3x⁴ +   px³ +       10x² - x + 6 | 3x² + x + 2
- (3x⁴ +    x³ +        2x²)       | x² + ((p-1)/3)x + (-p+25)/9
--------------------------
       (p-1)x³ +        8x² - x + 6
     - [(p-1)x³ + ((p-1)/3)x² + ((2p-2)/3)x]
     ---------------------------------------
                  ((-p+25)/3)x² + ((-2p-1)/3)x + 6
                - [((-p+25)/3)x² + ((-p+25)/9)x + (-2p+50)/9]
                ---------------------------------------------
                                   ((-5p-28)/9)x + (2p+4)/9
```

((-5p - 28) / 9)x + (2p + 4) / 9 = −2x
⇔ (−5px − 28x + 2p + 4) / 9 = −2x
⇔ −5px − 28x + 2p + 4 = −18x
⇔ −5px + 2p = −18x + 28x − 4
⇔ −5px + 2p = 10x − 4
⇔ (−5x + 2) ⋅ p = 10x − 4
⇔ p = (10x − 4) / (−5x + 2)
⇔ p = −2

**8**
Bij de deling van A(x) = x⁴ + x³ + px² + qx – 1 door D(x) = x² + 3x – 1 is de rest 0. Bepaal p en q.

```text
  x⁴ +   x³ +        px² +       qx -  1 | x² + 3x - 1
- (x⁴ +  3x³ -         x²)               | x² - 2x + p + 7
--------------------------
       -2x³ + (p +   1)x² +       qx -  1
     - (-2x³ -         6x² +       2x)
     ---------------------------------
              (p +   7)x² + (q -  2)x -  1
            - [(p +   7)x² + (3p + 21)x -  p -  7]
            --------------------------------------
                            (q - 3p - 23)x + p +  6
```

(q − 3p − 23) x + p + 6 = 0

{ p + 6 = 0
{ q − 3p − 23 = 0

⇔
{ p = −6
{ q − 3 ⋅ (−6) − 23 = 0

⇔
{ p = −6
{ q + 18 − 23 = 0

⇔
{ p = −6
{ q = 5

--- PAGE 38 ---
**9**
Vervolledig het rekenschema van Horner en bepaal het quotiënt en de rest van de deling van A(x) = 2x³ – 5x² – 7x + 17 door D(x) = x – 3.

```text
       2     -5     -7     17
   3          6      3    -12
-----------------------------
       2      1     -4      5
```
Q(x) = 2x² + x - 4
R(x) = 5

**10**
Bepaal het quotiënt en de rest bij deling van A(x) door D(x).

| A(x) | D(x) |
|---|---|
| a) A(x) = 3x³ – 11x² – 21x – 4 | D(x) = x – 5 |
| b) A(x) = 3x³ + 8x² + 10 | D(x) = x + 3 |
| c) A(x) = 4x⁴ – 13x³ + 2x² + 2x + 3 | D(x) = x – 3 |
| d) A(x) = 2x⁴ + 5x³ + 4x² + 3x – 2 | D(x) = x + 2 |
| e) A(x) = 2x⁴ – 8x³ + 14x² – 17x + 20 | D(x) = x – 1 |
| f) A(x) = 3x⁴ + 13x³ + 4x² – 6x – 34 | D(x) = x + 4 |
| g) A(x) = x⁴ + 5x³ – 6x² – 29x + 1 | D(x) = x + 5 |
| h) A(x) = x⁵ – 3x⁴ + 4x³ – 6x² – 7x – 6 | D(x) = x – 2 |

a)
```text
       3    -11    -21     -4
   5         15     20     -5
-----------------------------
       3      4     -1     -9
```
Q(x) = 3x² + 4x - 1
R(x) = -9

b)
```text
       3      8      0     10
  -3         -9      3     -9
-----------------------------
       3     -1      3      1
```
Q(x) = 3x² - x + 3
R(x) = 1

c)
```text
       4    -13      2      2      3
   3         12     -3     -3     -3
------------------------------------
       4     -1     -1     -1      0
```
Q(x) = 4x³ - x² - x - 1
R(x) = 0

--- PAGE 39 ---
d)
```text
       2      5      4      3     -2
  -2         -4     -2     -4      2
------------------------------------
       2      1      2     -1      0
```
Q(x) = 2x³ + x² + 2x - 1
R(x) = 0

e)
```text
       2     -8     14    -17     20
   1          2     -6      8     -9
------------------------------------
       2     -6      8     -9     11
```
Q(x) = 2x³ - 6x² + 8x - 9
R(x) = 11

f)
```text
       3     13      4     -6    -34
  -4        -12     -4      0     24
------------------------------------
       3      1      0     -6    -10
```
Q(x) = 3x³ + x² - 6
R(x) = -10

g)
```text
       1      5     -6    -29      1
  -5         -5      0     30     -5
------------------------------------
       1      0     -6      1     -4
```
Q(x) = x³ - 6x + 1
R(x) = -4

h)
```text
       1     -3      4     -6     -7     -6
   2          2     -2      4     -4    -22
-------------------------------------------
       1     -1      2     -2    -11    -28
```
Q(x) = x⁴ - x³ + 2x² - 2x - 11
R(x) = -28

--- PAGE 40 ---
**11**
Bepaal p zodat bij euclidische deling van A(x) door D(x) de rest gelijk zou zijn aan r.

| A(x) | D(x) | r |
|---|---|---|
| a) A(x) = 2x³ – 3x² + px + 13 | D(x) = x – 2 | 3 |
| b) A(x) = 3x³ + px² + 7x – 14 | D(x) = x – 3 | –2 |
| c) A(x) = 4x³ + 7x² + x + p | D(x) = x + 1 | 0 |
| d) A(x) = x⁴ + 3x³ + px – 13 | D(x) = x + 4 | –5 |
| e) A(x) = 2x⁴ – x³ + px² – 4x + 7 | D(x) = x – 1 | 4 |
| f) A(x) = 3x⁴ + px³ – 3x² – 2x – 8 | D(x) = x + 2 | 0 |

a)
```text
       2     -3      p       13
   2          4      2       2p + 4
-----------------------------------
       2      1    p + 2     2p + 17
```
2p + 17 = 3
⇔ p = −7

b)
```text
       3      p      7      -14
   3          9    3p + 27   9p + 102
-------------------------------------
       3    p + 9  3p + 34   9p + 88
```
9p + 88 = −2
⇔ p = −10

c)
```text
       4      7      1       p
  -1         -4     -3       2
------------------------------
       4      3     -2     p + 2
```
p + 2 = 0
⇔ p = −2

d)
```text
       1      3      0       p      -13
  -4         -4      4     -16     -4p + 64
-------------------------------------------
       1     -1      4     p - 16  -4p + 51
```
−4p + 51 = −5
⇔ p = 14

e)
```text
       2     -1      p      -4       7
   1          2      1     p + 1     p - 3
----------------------------------------
       2      1    p + 1   p - 3     p + 4
```
p + 4 = 4
⇔ p = 0

--- PAGE 41 ---
f)
```text
       3      p     -3      -2       -8
  -2         -6   -2p + 12  4p - 18 -8p + 40
--------------------------------------------
       3    p - 6 -2p + 9   4p - 20 -8p + 32
```
−8p + 32 = 0
⇔ p = 4

**12**
Bepaal de delers van de vorm x – a (a ∈ ℤ) van de veelterm A(x).

| A(x) |
|---|
| a) A(x) = x³ – 6x² – x + 30 |
| b) A(x) = x³ – 13x – 12 |
| c) A(x) = x³ – 4x² – 20x + 48 |
| d) A(x) = x⁴ + 4x³ – 7x² – 22x + 24 |
| e) A(x) = x⁴ + 2x³ – 21x² – 62x – 40 |

a) del (30) = {1, −1, 2, −2, 3, −3, 5, −5, 6, −6, 10, −10, 15, −15, 30, −30}
A (−2) = 0 ⇒ x + 2 ∣ A (x)
A (3) = 0  ⇒ x − 3 ∣ A (x)
A (5) = 0  ⇒ x − 5 ∣ A (x)

b) del (12) = {1, −1, 2, −2, 3, −3, 4, −4, 6, −6, 12, −12}
A (−1) = 0 ⇒ x + 1 ∣ A (x)
A (−3) = 0 ⇒ x + 3 ∣ A (x)
A (4) = 0  ⇒ x − 4 ∣ A (x)

c) del (48) = {1, −1, 2, −2, 3, −3, 4, −4, 6, −6, 8, −8, 12, −12, 16, −16, 24, −24, 48, −48}
A (2) = 0  ⇒ x − 2 ∣ A (x)
A (−4) = 0 ⇒ x + 4 ∣ A (x)
A (6) = 0  ⇒ x − 6 ∣ A (x)

d) del (24) = {1, −1, 2, −2, 3, −3, 4, −4, 6, −6, 8, −8, 12, −12, 24, −24}
A (1) = 0  ⇒ x − 1 ∣ A (x)
A (2) = 0  ⇒ x − 2 ∣ A (x)
A (−3) = 0 ⇒ x + 3 ∣ A (x)
A (−4) = 0 ⇒ x + 4 ∣ A (x)

e) del (40) = {1, −1, 2, −2, 4, −4, 5, −5, 8, −8, 10, −10, 20, −20, 40, −40}
A (−1) = 0 ⇒ x + 1 ∣ A (x)
A (−2) = 0 ⇒ x + 2 ∣ A (x)
A (−4) = 0 ⇒ x + 4 ∣ A (x)
A (5) = 0  ⇒ x − 5 ∣ A (x)

--- PAGE 42 ---
**13**
Bepaal de delers van de vorm x – a (a ∈ ℚ) van de veelterm A(x).

| A(x) |
|---|
| a) A(x) = 3x³ – 17x² + 18x + 8 |
| b) A(x) = 2x³ – 5x² – 4x + 12 |
| c) A(x) = 3x³ + 2x² – 3x – 2 |
| d) A(x) = 6x³ – 25x² + 2x + 8 |
| e) A(x) = 6x⁴ + 7x³ – 37x² – 8x + 12 |

a) del (8) = {1, −1, 2, −2, 4, −4, 8, −8}
del (3) = {1, −1, 3, −3}
A (2) = 0     ⇒ x − 2 ∣ A (x)
A (4) = 0     ⇒ x − 4 ∣ A (x)
A (−1/3) = 0  ⇒ x + 1/3 ∣ A (x)

b) del (12) = {1, −1, 2, −2, 3, −3, 4, −4, 6, −6, 12, −12}
del (2) = {1, −1, 2, −2}
A (2) = 0     ⇒ x − 2 ∣ A (x)
A (−3/2) = 0  ⇒ x + 3/2 ∣ A (x)

c) del (2) = {1, −1, 2, −2}
del (3) = {1, −1, 3, −3}
A (1) = 0     ⇒ x − 1 ∣ A (x)
A (−1) = 0    ⇒ x + 1 ∣ A (x)
A (−2/3) = 0  ⇒ x + 2/3 ∣ A (x)

d) del (8) = {1, −1, 2, −2, 4, −4, 8, −8}
del (6) = {1, −1, 2, −2, 3, −3, 6, −6}
A (4) = 0     ⇒ x − 4 ∣ A (x)
A (−1/2) = 0  ⇒ x + 1/2 ∣ A (x)
A (2/3) = 0   ⇒ x − 2/3 ∣ A (x)

e) del (12) = {1, −1, 2, −2, 3, −3, 4, −4, 6, −6, 12, −12}
del (6) = {1, −1, 2, −2, 3, −3, 6, −6}
A (2) = 0     ⇒ x − 2 ∣ A (x)
A (−3) = 0    ⇒ x + 3 ∣ A (x)
A (1/2) = 0   ⇒ x − 1/2 ∣ A (x)
A (−2/3) = 0  ⇒ x + 2/3 ∣ A (x)

--- PAGE 43 ---
**14**
Bepaal p en q zodat 5x³ + px² + 3x + q deelbaar is door x – 1 en x – 3.

{ A(1) = 0
{ A(3) = 0

⇔
{ 5 + p + 3 + q = 0
{ 135 + 9p + 9 + q = 0

⇔
{ p + q = −8
{ 9p + q = −144

⇔
{ p = −8 − q
{ 9 ⋅ (−8 − q) + q = −144

⇔
{ p = −8 − q
{ −72 − 9q + q = −144

⇔
{ p = −8 − q
{ −8q = −72

⇔
{ p = −8 − q
{ q = 9

⇔
{ p = −17
{ q = 9

V = {−17, 9}

**15**
Bepaal p en q zodat 2x³ + px² + qx – 4 deelbaar is door x – 4 en bij deling door x + 2 de rest –66 is.

A(x) = 2x³ + px² + qx − 4

{ A(4) = 0
{ A(−2) = −66

⇔
{ 128 + 16p + 4q − 4 = 0
{ −16 + 4p − 2q − 4 = −66

⇔
{ 16p + 4q = −124   | · 1
{ 4p − 2q = −46     | · (−4)

⇔
{ 16p + 4q = −124
{ −16p + 8q = 184

⇔
{ 12q = 60
{ −16p + 8q = 184

⇔
{ q = 5
{ −16p + 40 = 184

⇔
{ q = 5
{ −16p = 144

⇔
{ q = 5
{ p = −9

V = {−9, 5}

--- PAGE 44 ---
**16**
Bepaal p en q zodat x⁴ + px³ + 2x² + qx – 3 deelbaar is door x + 3 en bij deling door x + 1 de rest –8 is.

{ A(−3) = 0
{ A(−1) = −8

⇔
{ 81 − 27p + 18 − 3q − 3 = 0
{ 1 − p + 2 − q − 3 = −8

⇔
{ −27p − 3q = −96   | · 1
{ −p − q = −8       | · (−3)

⇔
{ −27p − 3q = −96
{ 3p + 3q = 24

⇔
{ −24p = −72
{ 3p + 3q = 24

⇔
{ p = 3
{ 9 + 3q = 24

⇔
{ p = 3
{ 3q = 15

⇔
{ p = 3
{ q = 5

V = {3, 5}

**17**
Een veelterm A(x) wordt gedeeld door x – 1 en x – 3. De respectievelijke resten zijn 1 en 5. Wat is de rest bij deling door (x – 1)(x – 3)?

A(x) = (x − 1)(x − 3) ⋅ Q(x) + ax + b

{ A(1) = 1
{ A(3) = 5

⇔
{ a + b = 1     | · 3
{ 3a + b = 5    | · (−1)

⇔
{ 3a + 3b = 3
{ −3a − b = −5

⇔
{ 2b = −2
{ −3a − b = −5

⇔
{ b = −1
{ −3a + 1 = −5

⇔
{ b = −1
{ a = 2

⇔
{ a = 2
{ b = −1

V = {2, −1}
R(x) = 2x − 1

--- PAGE 45 ---
**18**
Een veelterm A(x) wordt gedeeld door x + 2 en x – 2. De respectievelijke resten zijn 8 en –4. Wat is de rest bij deling door x² – 4?

A(x) = (x + 2)(x − 2) ⋅ Q(x) + ax + b

{ A(−2) = 8
{ A(2) = −4

⇔
{ −2a + b = 8   | · 1
{ 2a + b = −4   | · 1

⇔
{ −2a + b = 8
{ 2a + b = −4

⇔
{ 2b = 4
{ 2a + b = −4

⇔
{ b = 2
{ 2a + 2 = −4

⇔
{ a = −3
{ b = 2

V = {−3, 2}
R(x) = −3x + 2

**19**
Een veelterm A(x) wordt gedeeld door x + 1 en x – 4. De respectievelijke resten zijn –6 en 24. Wat is de rest bij deling door (x + 1)(x – 4)?

A(x) = (x + 1)(x − 4) ⋅ Q(x) + ax + b

{ A(−1) = −6
{ A(4) = 24

⇔
{ −a + b = −6
{ 4a + b = 24

⇔
{ b = −6 + a
{ 4a − 6 + a = 24

⇔
{ b − 6 + a
{ 5a = 30

⇔
{ a = 6
{ b = 0

V = {6, 0}
R(x) = 6x

--- PAGE 46 ---
**20**
Vervolledig volgend tekenschema (A(x) = 2x³ + 5x² – 12x).

| x | | –4 | | 0 | | 3/2 | |
|---|---|---|---|---|---|---|---|
| 2x – 3 | – | – | – | – | – | 0 | + |
| x + 4 | – | 0 | + | + | + | + | + |
| x | – | – | – | 0 | + | + | + |
| A(x) | – | 0 | + | 0 | – | 0 | + |

**21**
Ontbind de veelterm A(x) = 4x³ + 3x² – 25x + 6 in factoren.

```text
       4      3    -25      6
   2          8     22     -6
-----------------------------
       4     11     -3      0
```
A(x) = (x - 2)(4x² + 11x - 3)

```text
       4     11     -3
  -3        -12      3
----------------------
       4     -1      0
```
A(x) = (x - 2)(x + 3)(4x - 1)

**22**
Ontbind de veelterm A(x) in factoren.

| A(x) |
|---|
| a) A(x) = x³ – 3x² – 10x + 24 |
| b) A(x) = x³ + x² – 17x + 15 |
| c) A(x) = x³ – 4x² – 11x – 6 |
| d) A(x) = 6x³ + 5x² – 3x – 2 |
| e) A(x) = 2x³ + 7x² + 4x – 4 |
| f) A(x) = x³ – 3x² + 4x – 12 |

a)
```text
       1     -3    -10     24
   2          2     -2    -24
-----------------------------
       1     -1    -12      0
```
A(x) = (x - 2)(x² - x - 12)

```text
       1     -1    -12
  -3         -3     12
----------------------
       1     -4      0
```
A(x) = (x - 2)(x + 3)(x - 4)

--- PAGE 47 ---
b)
```text
       1      1    -17     15
   1          1      2    -15
-----------------------------
       1      2    -15      0
```
A(x) = (x - 1)(x² + 2x - 15)

```text
       1      2    -15
   3          3     15
----------------------
       1      5      0
```
A(x) = (x - 1)(x - 3)(x + 5)

c)
```text
       1     -4    -11     -6
  -1         -1      5      6
-----------------------------
       1     -5     -6      0
```
A(x) = (x + 1)(x² - 5x - 6)

```text
       1     -5     -6
  -1         -1      6
----------------------
       1     -6      0
```
A(x) = (x + 1)²(x - 6)

d)
```text
       6      5     -3     -2
  -1         -6      1      2
-----------------------------
       6     -1     -2      0
```
A(x) = (x + 1)(6x² - x - 2)

```text
       6     -1     -2
 -1/2        -3      2
----------------------
       6     -4      0
```
A(x) = (x + 1)(x + 1/2)(6x − 4)
= (x + 1)(2x + 1)(3x − 2)

--- PAGE 48 ---
e)
```text
       2      7      4     -4
  -2         -4     -6      4
-----------------------------
       2      3     -2      0
```
A(x) = (x + 2)(2x² + 3x - 2)

```text
       2      3     -2
  -2         -4      2
----------------------
       2     -1      0
```
A(x) = (x + 2)²(2x - 1)

f)
```text
       1     -3      4    -12
   3          3      0     12
-----------------------------
       1      0      4      0
```
A(x) = (x - 3)(x² + 4)

**23**
Ontbind in factoren.
a) x³ + 8
b) y³ – 216
c) x³y³ – t³
d) 1 + z³
e) x³ − 27/8
f) a³/8 + 1

a) x³ + 8 = (x + 2)(x² − 2x + 4)
b) y³ − 216 = (y − 6)(y² + 6y + 36)
c) x³y³ − t³ = (xy − t)(x²y² + xyt + t²)
d) 1 + z³ = (1 + z)(1 − z + z²)
e) x³ − 27/8 = (x − 3/2)(x² + 3/2x + 9/4)
f) a³/8 + 1 = (a/2 + 1)(a²/4 − a/2 + 1)

--- PAGE 49 ---
**24**
Vervolledig volgend tekenschema en los de ongelijkheid (x – 2)(x + 3)²(2x – 5) ⩽ 0 op.

| x | | –3 | | 2 | | 5/2 | |
|---|---|---|---|---|---|---|---|
| x – 2 | – | – | – | 0 | + | + | + |
| (x + 3)² | + | 0 | + | + | + | + | + |
| 2x – 5 | – | – | – | – | – | 0 | + |
| A(x) | + | 0 | + | 0 | – | 0 | + |

V = {−3} ∪ [2, 5/2]

**25**
Ontbind de veelterm A(x) in factoren.

| A(x) |
|---|
| a) A(x) = 2x⁴ – 3x³ – 3x² + 7x – 3 |
| b) A(x) = x⁶ + 3x⁴ – 4x² |
| c) A(x) = x⁴ – 4x³ + 2x² – 8x |
| d) A(x) = x⁴ + 2x³ – 3x² – 4x + 4 |
| e) A(x) = x⁴ – 8x³ + 24x² – 32x + 16 |
| f) A(x) = 36x⁴ – 12x³ – 17x² + 3x + 2 |

a) A(x) = 2x⁴ - 3x³ - 3x² + 7x - 3

```text
       2     -3     -3      7     -3
   1          2     -1     -4      3
------------------------------------
       2     -1     -4      3      0
```
A(x) = (x - 1)(2x³ - x² - 4x + 3)

```text
       2     -1     -4      3
   1          2      1     -3
-----------------------------
       2      1     -3      0
```
A(x) = (x - 1)²(2x² + x - 3)

```text
       2      1     -3
   1          2      3
----------------------
       2      3      0
```
A(x) = (x - 1)³(2x + 3)

--- PAGE 50 ---
b) A(x) = x⁶ + 3x⁴ - 4x²
A(x) = x²(x⁴ + 3x² - 4)

```text
       1      0      3      0     -4
   1          1      1      4      4
------------------------------------
       1      1      4      4      0
```
A(x) = x²(x - 1)(x³ + x² + 4x + 4)

```text
       1      1      4      4
  -1         -1      0     -4
-----------------------------
       1      0      4      0
```
A(x) = x²(x - 1)(x + 1)(x² + 4)

c) A(x) = x⁴ - 4x³ + 2x² - 8x
A(x) = x(x³ - 4x² + 2x - 8)

```text
       1     -4      2     -8
   4          4      0      8
-----------------------------
       1      0      2      0
```
A(x) = x(x - 4)(x² + 2)

d) A(x) = x⁴ + 2x³ - 3x² - 4x + 4

```text
       1      2     -3     -4      4
   1          1      3      0     -4
------------------------------------
       1      3      0     -4      0
```
A(x) = (x - 1)(x³ + 3x² - 4)

```text
       1      3      0     -4
   1          1      4      4
-----------------------------
       1      4      4      0
```
A(x) = (x - 1)²(x² + 4x + 4)

```text
       1      4      4
  -2         -2     -4
----------------------
       1      2      0
```
A(x) = (x - 1)²(x + 2)²

--- PAGE 51 ---
e) A(x) = x⁴ - 8x³ + 24x² - 32x + 16

```text
       1     -8     24    -32     16
   2          2    -12     24    -16
------------------------------------
       1     -6     12     -8      0
```
A(x) = (x - 2)(x³ - 6x² + 12x - 8)

```text
       1     -6     12     -8
   2          2     -8      8
-----------------------------
       1     -4      4      0
```
A(x) = (x - 2)²(x² - 4x + 4)

```text
       1     -4      4
   2          2     -4
----------------------
       1     -2      0
```
A(x) = (x - 2)⁴

f) A(x) = 36x⁴ - 12x³ - 17x² + 3x + 2

```text
      36    -12    -17      3      2
 1/2         18      3     -7     -2
------------------------------------
      36      6    -14     -4      0
```
A(x) = (x - 1/2)(36x³ + 6x² - 14x - 4)
= (2x - 1)(18x³ + 3x² - 7x - 2)

```text
      18      3     -7     -2
-1/2         -9      3      2
-----------------------------
      18     -6     -4      0
```
A(x) = (2x - 1)(x + 1/2)(18x² - 6x - 4)
= (2x - 1)(2x + 1)(9x² - 3x - 2)

```text
       9     -3     -2
-1/3         -3      2
----------------------
       9     -6      0
```
A(x) = (2x - 1)(2x + 1)(x + 1/3)(9x - 6)
= (2x - 1)(2x + 1)(3x + 1)(3x - 2)

--- PAGE 52 ---
**26**
Los op in ℝ.
a) x³ – 2x² – 11x + 12 > 0
b) x³ + 3x² – 9x – 27 < 0
c) x⁴ – 6x³ – x² + 6x ⩾ 0
d) x⁴ – 2x³ – 3x² + 4x + 4 < 0
e) x⁴ – 4x³ + 6x² – 8x + 8 ⩽ 0
f) 6x⁴ – 11x³ – x² + 6x > 0

a) A(x) = x³ - 2x² - 11x + 12
= (x - 1)(x + 3)(x - 4)

| x | | -3 | | 1 | | 4 | |
|---|---|---|---|---|---|---|---|
| x - 1 | - | - | - | 0 | + | + | + |
| x + 3 | - | 0 | + | + | + | + | + |
| x - 4 | - | - | - | - | - | 0 | + |
| A(x) | - | 0 | + | 0 | - | 0 | + |

V = ]-3, 1[ ∪ ]4, + ∞[

b) A(x) = x³ + 3x² - 9x - 27
= (x - 3)(x + 3)²

| x | | -3 | | 3 | |
|---|---|---|---|---|---|
| x - 3 | - | - | - | 0 | + |
| (x + 3)² | + | 0 | + | + | + |
| A(x) | - | 0 | - | 0 | + |

V = ]-∞, -3[ ∪ ]-3, 3[

c) A(x) = x⁴ - 6x³ -x² + 6x
= x(x³ - 6x² - x + 6)
= x(x - 1)(x + 1)(x - 6)

| x | | -1 | | 0 | | 1 | | 6 | |
|---|---|---|---|---|---|---|---|---|---|
| x | - | - | - | 0 | + | + | + | + | + |
| x - 1 | - | - | - | - | - | 0 | + | + | + |
| x + 1 | - | 0 | + | + | + | + | + | + | + |
| x - 6 | - | - | - | - | - | - | - | 0 | + |
| A(x) | + | 0 | - | 0 | + | 0 | - | 0 | + |

V = ]-∞, -1] ∪ [0, 1] ∪ [6, +∞[

(Rechterkant tabellen)
a)
```text
       1     -2    -11     12
   1          1     -1    -12
-----------------------------
       1     -1    -12      0
```
A(x) = (x - 1)(x² - x - 12)
```text
       1     -1    -12
  -3         -3     12
----------------------
       1     -4      0
```
A(x) = (x - 1)(x + 3)(x - 4)

b)
```text
       1      3     -9    -27
   3          3     18     27
-----------------------------
       1      6      9      0
```
A(x) = (x - 3)(x² + 6x + 9)
```text
       1      6      9
  -3         -3     -9
----------------------
       1      3      0
```
A(x) = (x - 3)(x + 3)(x + 3)

c)
```text
       1     -6     -1      6
   1          1     -5     -6
-----------------------------
       1     -5     -6      0
```
A(x) = x(x - 1)(x² - 5x - 6)
```text
       1     -5     -6
  -1         -1      6
----------------------
       1     -6      0
```
A(x) = x(x - 1)(x + 1)(x - 6)

--- PAGE 53 ---
d) A(x) = x⁴ - 2x³ - 3x² + 4x + 4
= (x + 1)²(x - 2)²

| x | | -1 | | 2 | |
|---|---|---|---|---|---|
| (x + 1)² | + | 0 | + | + | + |
| (x - 2)² | + | + | + | 0 | + |
| A(x) | + | 0 | + | 0 | + |

V = ⌀

e) A(x) = x⁴ - 4x³ + 6x² - 8x + 8
= (x - 2)²(x² + 2)

| x | | 2 | |
|---|---|---|---|
| (x - 2)² | + | 0 | + |
| x² + 2 | + | + | + |
| A(x) | + | 0 | + |

V = {2}

f) A(x) = 6x⁴ - 11x³ -x² + 6x
= x(6x³ - 11x² - x + 6)
= x(x - 1)(2x - 3)(3x + 2)

| x | | -2/3 | | 0 | | 1 | | 3/2 | |
|---|---|---|---|---|---|---|---|---|---|
| x | - | - | - | 0 | + | + | + | + | + |
| x - 1 | - | - | - | - | - | 0 | + | + | + |
| 2x - 3 | - | - | - | - | - | - | - | 0 | + |
| 3x + 2 | - | 0 | + | + | + | + | + | + | + |
| A(x) | + | 0 | - | 0 | + | 0 | - | 0 | + |

V = ]-∞, -2/3[ ∪ ]0, 1[ ∪ ]3/2, +∞[

(Rechterkant tabellen)
d)
```text
       1     -2     -3      4      4
  -1         -1      3      0     -4
------------------------------------
       1     -3      0      4      0
```
A(x) = (x + 1)(x³ - 3x² + 4)
```text
       1     -3      0      4
  -1         -1      4     -4
-----------------------------
       1     -4      4      0
```
A(x) = (x + 1)(x + 1)(x² - 4x + 4)
```text
       1     -4      4
   2          2     -4
----------------------
       1     -2      0
```
A(x) = (x + 1)(x + 1)(x - 2)(x - 2)

e)
```text
       1     -4      6     -8      8
   2          2     -4      4     -8
------------------------------------
       1     -2      2     -4      0
```
A(x) = (x - 2)(x³ - 2x² + 2x - 4)
```text
       1     -2      2     -4
   2          2      0      4
-----------------------------
       1      0      2      0
```
A(x) = (x - 2)(x - 2)(x² + 2)

f)
```text
       6    -11     -1      6
   1          6     -5     -6
-----------------------------
       6     -5     -6      0
```
A(x) = x(x - 1)(6x² - 5x -6)
```text
       6     -5     -6
 3/2          9      6
----------------------
       6      4      0
```
A(x) = x(x - 1)(x - 3/2)(6x + 4)

--- PAGE 54 ---
Auteurs Philip Bogaert, Björn Carreyn en Roger Van Nieuwenhuyze
Derde editie - Bestelnummer 94 606 0119 (module 16 van 18)
ISBN 978 90 4864 973 0 - KB D/2024/0147/206 - NUR 126/128/129 - Thema YPMF
Illustrator Jona Jamart - Design en lay-out die Keure
Verantwoordelijke uitgever die Keure, Kleine Pathoekeweg 3, 8000 Brugge
RPR 0405 108 325 - © Copyright die Keure, Brugge
[Afbeelding: Logo die Keure educatief]
[Afbeelding: FSC placeholder]
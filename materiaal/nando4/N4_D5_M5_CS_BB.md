--- PAGE 1 ---
# NANDO 4
[Afbeelding: Logo van die Keure educatief]

D-FINALITEIT 5 UUR – ALGEBRA EN FUNCTIELEER
# 05 Problemen oplossen met tweedegraadsfuncties

[Afbeelding: Foto van een brug weerspiegeld in het water. Er staat in grote rode schuine letters CORRECTIESLEUTEL over de pagina heen.]

**Inhoud**
**Instap**
**1 Kenmerken van de grafiek van de functie f(x) = ax² + bx + c (a ≠ 0)**
**2 Functievoorschriften opstellen**
**3 Problemen oplossen**
**Signaaloefeningen**
**Differentiatietraject**
**Computationeel denken**
**Studiewijzer**

[Afbeelding: Icoon van een rode peper] **WAT JE AL KUNT**
- een tweedegraadsfunctie herkennen en de grafiek van deze functie tekenen
- de top bepalen van de grafiek van een tweedegraadsfunctie van de vorm f(x) = a(x – p)² + q
- de tekentabel, het stijgen-dalen van een tweedegraadsfunctie van de eerste graad geven als de grafiek gegeven is

[Afbeelding: Icoon van een rode peper] **WAT JE LEERT IN DEZE MODULE**
- aantonen dat het functievoorschrift f(x) = ax² + bx + c kan worden omgevormd tot f(x) = a(x – p)² + q
- de coördinaat van de top van de grafiek berekenen en de vergelijking van de symmetrieas van de grafiek opstellen
- functievoorschriften opstellen die voldoen aan bepaalde voorwaarden
- extremumproblemen oplossen

[Afbeelding: Icoon van een rode peper] **IN DE KIJKER**
Je gebruikt ICT om verbanden te visualiseren en redeneringen te controleren.

[Afbeelding: Icoon van een rode peper] **WISKUNDETAAL**
- parabool
- top
- symmetrieas
- extremum
- minimum
- maximum
- dalparabool
- bergparabool

1

--- PAGE 2 ---
[Afbeelding: Icoon van een ei/hoofd] 
# Instap

## Opdracht 1

De grafiek van de functie f met voorschrift f(x) = -x² + 4x - 0,4 is gegeven.

Bepaal de vergelijking van de symmetrieas van de grafiek van de functie.
x = 2

Bepaal de coördinaat van de top. Bepaal hiervoor de x-coördinaat en bereken de y-coördinaat.
x = 2
f(2) = -2² + 4 · 2 - 0,4
= -4 + 8 - 0,4
= 3,6       ---> De coördinaat van de top is (2; 3,6).

[Afbeelding: Grafiek van de functie y = f(x) met een bergparabool. De top T is aangeduid bij (2; 3,6). De symmetrieas x = 2 is met een stippellijn getekend.]

## Opdracht 2

Als we de grafiek van f met f(x) = x² achtereenvolgens volgende transformaties laten ondergaan, dan wordt het voorschrift:

- verticale uitrekking met factor 2:
f1(x) = 2x²

- horizontale verschuiving over een afstand 3 naar rechts:
f2(x) = 2(x - 3)²

- verticale verschuiving over een afstand 4 naar onder:
p(x) = f3(x) = 2(x - 3)² - 4

De functie p heeft dan volgende kenmerken:
- dom p = R
- ber p = [-4, +∞[
- extremum (minimum of maximum): Het minimum is -4.
- coördinaat van de top: (3, -4)
- het verloop (stijgen/dalen):

| x | | 3 | |
|---|---|---|---|
| p(x) | ↘ | -4 | ↗ |

- vergelijking van de symmetrieas: x = 3

[Afbeelding: Grafiek van de functie y = p(x). Het is een dalparabool met als top (3, -4).]

2

--- PAGE 3 ---
# 1 Kenmerken van de grafiek van de functie f(x) = ax² + bx + c (a ≠ 0)

## 1.1 f(x) = a(x - p)² + q of f(x) = ax² + bx + c (a ≠ 0)

Door gebruik te maken van een merkwaardig product en distributiviteit kunnen we de vorm a(x - p)² + q uitwerken als volgt:

a(x - p)² + q = a(x² - 2px + p²) + q
= ax² - 2apx + ap² + q

Gelijke veeltermen hebben dezelfde graad en de coëfficiënten van de overeenkomstige machten zijn twee aan twee gelijk.
Als ax² + bx + c = ax² - 2apx + ap² + q, dan:

a = a
-2ap = b
p = -b / 2a

ap² + q = c
a · (-b / 2a)² + q = c
a · (b² / 4a²) + q = c
(b² / 4a) + q = c
q = -(b² / 4a) + c
q = -(b² / 4a) + (4ac / 4a)
q = (-b² + 4ac) / 4a

**eigenschap**
Elk functievoorschrift f(x) = ax² + bx + c (met a ≠ 0) is te schrijven als
f(x) = a(x - p)² + q met p = -b / 2a en q = (-b² + 4ac) / 4a

Als het functievoorschrift in de vorm f(x) = ax² + bx + c staat, dan kun je met deze formules de coördinaat van de top van de grafiek en de symmetrieas van de grafiek bepalen.

**Voorbeeld**
f(x) = 3x² - 2x + 1 (a = 3, b = -2 en c = 1)
p = -b / 2a = 2 / (2 · 3) = 1 / 3
q = (-b² + 4ac) / 4a = (-(-2)² + 4 · 3 · 1) / (4 · 3) = 8 / 12 = 2 / 3

Besluit:
De top van de grafiek van f is T(1/3, 2/3).
De vergelijking van de symmetrieas van de grafiek van f is x = 1/3.

[Afbeelding: Grafiek van de functie y = f(x) met voorschrift f(x) = 3x² - 2x + 1. De top T(1/3, 2/3) en de symmetrieas x = 1/3 zijn aangeduid in rood.]

3

--- PAGE 4 ---
[Afbeelding: Icoon van een rode peper] **Merk op** [Afbeelding: Pijl naar rechts]
- Het is vaak veel eenvoudiger om de y-coördinaat van de top als functiewaarde te berekenen:
f(p) = q
In het voorbeeld: f(1/3) = 3 · (1/3)² - 2 · (1/3) + 1
= 3 · (1/9) - (2/3) + 1
= (3/9) - (6/9) + (9/9)
= 6/9
= 2/3
- Met de formules kun je de top van de grafiek van een tweedegraadsfunctie f met voorschrift f(x) = ax² + bx + c berekenen.
- De constante term c is de y-coördinaat van het snijpunt van de grafiek van de functie f met de y-as.
(Je berekent de functiewaarde f(0), of met andere woorden f(0) = c.)
Het snijpunt van de grafiek van f met voorschrift f(x) = 3x² - 2x + 1 met de y-as heeft als coördinaat (0, 1).

## 1.2 Stijgen en dalen bij een tweedegraadsfunctie f met voorschrift f(x) = ax² + bx + c

Als je de top van de grafiek van een tweedegraadsfunctie hebt bepaald, ken je ook meteen het **extremum** (het **minimum** of het **maximum**). Je kunt dan ook het verloop van de functie weergeven.

**Voorbeeld 1**
f(x) = 0,5x² + 2x + 1

De top van de grafiek is T(-2, -1) want
p = -2 / 1 = -2
q = f(-2) = -1
De grafiek van de functie is een dalparabool.

| x | | -2 | |
|---|---|---|---|
| f(x) | ↘ | -1 | ↗ |
| | | minimum (top) | |

[Afbeelding: Dalparabool van de functie y = f(x) = 0,5x² + 2x + 1 met top T(-2, -1).]

**Voorbeeld 2**
f(x) = -x² + 6x - 3

De top van de grafiek is T(3, 6) want
p = -6 / -2 = 3
q = f(3) = 6
De grafiek van de functie is een bergparabool.

| x | | 3 | |
|---|---|---|---|
| f(x) | ↗ | 6 | ↘ |
| | | maximum (top) | |

[Afbeelding: Bergparabool van de functie y = f(x) = -x² + 6x - 3 met top T(3, 6).]

4

--- PAGE 5 ---
[Afbeelding: Icoon van een klok] **Verwerkingsopdrachten** [Afbeelding: Icoon van een hand] 1

**1** Gegeven: de functie f met voorschrift f(x) = x² - 4x + 1

a) Vorm het functievoorschrift om tot de vorm f(x) = a(x - p)² + q.
f(x) = a(x - p)² + q met p = -b / 2a en q = (-b² + 4ac) / 4a
f(x) = 1 · (x - 4/2)² + (-16 + 4) / 4
= (x - 2)² + (-12) / 4
= (x - 2)² - 3

b) Bepaal de coördinaat van de top van de grafiek van de functie f.
T(2, -3)

c) Geef de vergelijking van de symmetrieas van de grafiek van de functie f.
x = 2

**2** Gegeven: f(x) = x² + 2x + 5.
Zijn de uitspraken waar of niet waar? Omkring en verklaar.

a) De top van de grafiek van f is T(1, 4). WAAR / [x] NIET WAAR
Verklaring:
f(x) = (x - (-2)/2)² + (-4 + 20) / 4
= (x + 1)² + 4
Niet waar, de top is T(-1, 4).

b) Het snijpunt van de grafiek van f met de y-as is P(0, 4). WAAR / [x] NIET WAAR
Verklaring:
f(0) = 0² + 2 · 0 + 5
= 5
Niet waar, het snijpunt met de y-as is P(0, 5).

c) De vergelijking van de symmetrieas van de grafiek van f is x = 2. WAAR / [x] NIET WAAR
Verklaring:
Niet waar, de vergelijking van de symmetrieas is x = -1.

d) Het voorschrift van f kan omgevormd worden tot f(x) = (x + 1)² + 4. [x] WAAR / NIET WAAR
Verklaring:
Waar, de coördinaat van de top is (-1, 4).

5

--- PAGE 6 ---
# 2 Functievoorschriften opstellen
## 2.1 De coördinaat van de top en een willekeurig punt op de parabool zijn gegeven

**Voorbeeld**
Gegeven: De top van de parabool is T(-3, 5) en het punt P(-1, 13) ligt op de parabool.
Gevraagd: het functievoorschrift dat hoort bij deze parabool

Oplossing:
- De top van de parabool is T(-3, 5).
Dus p = -3 en q = 5.
f(x) = a(x - p)² + q wordt f(x) = a(x + 3)² + 5.

- Het punt P(-1, 13) ligt op de parabool. Dus f(-1) = 13.
13 = a(-1 + 3)² + 5
13 = 4a + 5
13 - 5 = 4a
8 = 4a
2 = a

- Besluit: f(x) = 2(x + 3)² + 5

[Afbeelding: Grafiek van y = f(x) = 2(x+3)²+5 met top T(-3,5) en punt P(-1,13) aangeduid.]

[Afbeelding: Icoon van een rode peper] **Merk op** [Afbeelding: Pijl naar rechts]
Je kan ook met behulp van de grafiek a bepalen:
- Vertrek altijd vanuit de top.
- Kijk hoe de y-waarde verandert als je de x-waarde met 1 eenheid vermeerdert.
- a = 2

[Afbeelding: Grafiek van y = f(x). Vanuit top T(-3,5) gaat men 1 eenheid naar rechts (aangeduid met +1) en 2 eenheden naar boven (aangeduid met +2) om op het punt S(-2,7) uit te komen. Dit toont aan dat a=2.]

6

--- PAGE 7 ---
## 2.2 De coördinaten van drie niet-collineaire punten van de grafiek zijn gegeven

**Voorbeeld**
Gegeven: A(0, 3), B(1, 0) en C(5, 8) liggen op de parabool.
Gevraagd: Het functievoorschrift dat hoort bij deze parabool.

Oplossing:
We vullen de punten in in de vergelijking van de parabool: y = ax² + bx + c

A(0, 3) ligt op de parabool: 3 = a · 0² + b · 0 + c => c = 3
B(1, 0) ligt op de parabool: 0 = a · 1² + b · 1 + 3 => a + b + 3 = 0
C(5, 8) ligt op de parabool: 8 = a · 5² + b · 5 + c => 25a + 5b + 3 = 8

{ a + b + 3 = 0
{ 25a + 5b + 3 = 8

<=>
{ b = -a - 3
{ 25a + 5b + 3 = 8

<=>
{ b = -a - 3
{ 25a + 5(-a - 3) + 3 = 8

<=>
{ b = -a - 3
{ 25a - 5a - 15 + 3 - 8 = 0

<=>
{ b = -a - 3
{ 20a - 20 = 0

<=>
{ b = -4
{ a = 1

Besluit: f(x) = x² - 4x + 3

[Afbeelding: Grafiek van de functie y = f(x) met een dalparabool en de punten A(0,3), B(1,0) en C(5,8) in het rood aangeduid.]

7

--- PAGE 8 ---
[Afbeelding: Icoon van een klok] **Verwerkingsopdrachten** [Afbeelding: Icoon van een hand] 2, 3

**3** Gegeven: De punten A(0, -5), B(1, 0) en C(4, 3) liggen op de parabool van de functie f.
Gevraagd: Bepaal het functievoorschrift dat hoort bij deze parabool.

y = ax² + bx + c

A(0, -5) ligt op de parabool: -5 = a · 0² + b · 0 + c => c = -5
B(1, 0) ligt op de parabool: 0 = a · 1² + b · 1 - 5 => a + b - 5 = 0
C(4, 3) ligt op de parabool: 3 = a · 4² + b · 4 - 5 => 16a + 4b - 8 = 0

{ a + b - 5 = 0
{ 16a + 4b - 8 = 0
<=>
{ b = -a + 5
{ 16a + 4 · (-a + 5) - 8 = 0
<=>
{ b = -a + 5
{ 16a - 4a + 20 - 8 = 0
<=>
{ b = -a + 5
{ 12a = -12
<=>
{ b = 1 + 5
{ a = -1
<=>
{ b = 6
{ a = -1

f(x) = -x² + 6x - 5

**4** Gegeven: T(3, 4) is de top van de parabool en A(2, 3) en C(4, 3) liggen op de parabool van de functie f.
Gevraagd: Bepaal het functievoorschrift dat hoort bij deze parabool.

De top van de parabool is T(3, 4). Dus p = 3 en q = 4.
f(x) = a(x - 3)² + 4
Het punt A(2, 3) ligt op de parabool, dus f(2) = 3.
3 = a(2 - 3)² + 4
3 = a · 1 + 4
a = -1
f(x) = -1(x - 3)² + 4

8

--- PAGE 9 ---
# 3 Problemen oplossen

**Voorbeeld 1**
De som van twee getallen is 10. Wanneer is de som van hun kwadraten zo klein mogelijk? Bereken die som.

**Probleem begrijpen:**
We kiezen een aantal willekeurige getallen en berekenen de som.

| getal 1 | getal 2 | kwadraat van getal 1 | kwadraat van getal 2 | som van de kwadraten |
|---|---|---|---|---|
| -2 | 12 | 4 | 144 | 148 |
| -1 | 11 | 1 | 121 | 122 |
| 0 | 10 | 0 | 100 | 100 |
| 1 | 9 | 1 | 81 | 82 |
| 2 | 8 | 4 | 64 | 68 |
| 3 | 7 | 9 | 49 | 58 |
| 4 | 6 | 16 | 36 | 52 |
| 5 | 5 | 25 | 25 | 50 |
| **x** | **10 - x** | **x²** | **(10 - x)²** | **x² + (10 - x)²** |

**Probleem oplossen:**
Getal 1: x
Getal 2: 10 - x

Het functievoorschrift dat bij deze context hoort:
s(x) = x² + (10 - x)²
s(x) = x² + 100 - 20x + x²
s(x) = 2x² - 20x + 100

Om de kleinste waarde te bepalen, bepalen we het minimum.
p = -b / 2a = 20 / 4
= 5

q = f(5) = 2 · 5² - 20 · 5 + 100
= 50 - 100 + 100
= 50

Antwoord: Als de beide getallen 5 zijn, dan is de som minimaal, namelijk 50.

9

--- PAGE 10 ---
**Voorbeeld 2**
Met 40 m draad wil ik een zo groot mogelijk rechthoekig kippenhok maken. Hoe groot moeten de lengte en de breedte zijn zodat de oppervlakte maximaal is?

**Probleem begrijpen:**
We maken een tekening:
[Afbeelding: Een rechthoek met de zijden x en 20 - x. Daarnaast een foto van kippen op een trapje.]
x
20 - x

**Probleem oplossen:**
breedte: x
lengte: 20 - x

Het functievoorschrift dat bij deze context hoort:
A(x) = x · (20 - x)
A(x) = -x² + 20x

We bepalen het extremum van deze functie. (a = -1, b = 20 en c = 0)
p = -b / 2a = -20 / -2 = 10
q = f(10) = -10² + 20 · 10 = 100

Antwoord: De maximale oppervlakte is 100 m² als zowel de lengte als de breedte 10 m is.

10

--- PAGE 11 ---
[Afbeelding: Icoon van een klok] **Verwerkingsopdrachten** [Afbeelding: Icoon van een hand] 4, 5

**5** Wanneer is het product van twee opeenvolgende oneven getallen minimaal?

Getal 1: 2x - 1
Getal 2: 2x + 1

Het functievoorschrift dat bij deze context hoort:
f(x) = (2x - 1)(2x + 1)
= 4x² - 1

We bepalen het extremum van deze functie.
p = -b / 2a = 0
q = f(0) = 4 · 0 - 1 = -1

Het minimum van deze functie wordt bereikt in (0, -1).

Getal 1: 2 · 0 - 1 = -1
Getal 2: 2 · 0 + 1 = 1

Antwoord: Het product van twee opeenvolgende oneven getallen is minimaal als de getallen -1 en 1 zijn.

**6** Een bedrijfsleider wil de kosten voor het maken van zonnebloemolie zo laag mogelijk houden. De kosten voor een dagproductie van x duizend eenheden kunnen benaderd worden met de functie:
k(x) = (1/25)x² - (42/5)x + 24000.
Bepaal het aantal geproduceerde eenheden zodat de kosten minimaal zijn.
[Afbeelding: Flessen met zonnebloemolie in een productielijn in een fabriek.]

We bepalen het extremum van deze functie.
p = -b / 2a = (42/5) / (2/25) = 105
q = f(105) = (1/25) · 105² - (42/5) · 105 + 24 000
= 441 - 882 + 24 000
= 23 559

Het minimum van deze functie wordt bereikt in (105, 23 559).
Antwoord: Bij 105 000 geproduceerde eenheden zijn de kosten minimaal.

11

--- PAGE 12 ---
[Afbeelding: Icoon van een hand] **Signaaloefeningen**

**1** a) Vorm het functievoorschrift van de functie f met voorschrift f(x) = x² - 6x + 1 om tot de vorm f(x) = a(x - p)² + q.
p = -b / 2a = 6 / 2 = 3
q = (-b² + 4ac) / 4a = (-36 + 4) / 4 = -32 / 4 = -8
f(x) = (x - 3)² - 8

b) Geef de vergelijking van de symmetrieas van de grafiek van f.
x = 3

c) Geef de coördinaat van de top van de grafiek van f.
T(3, -8)

d) Welke samenstelling van transformaties beeldt de grafiek van de functie g met voorschrift g(x) = x² af op de grafiek van de functie f?
- Een horizontale verschuiving naar rechts met 3 eenheden.
- Een verticale verschuiving naar onder met 8 eenheden.

`>>> Verder oefenen: D1 t.e.m. D17`

**2** Gegeven: T(1, 4) is de top van de parabool en A(0, 1) ligt op de parabool van de functie f.
Gevraagd: Bepaal het functievoorschrift dat hoort bij deze parabool.

De top van de parabool is T(1, 4). Dus p = 1 en q = 4.
f(x) = a(x - 1)² + 4
Het punt A(0, 1) ligt op de parabool. Dus f(0) = 1
1 = a(0 - 1)² + 4
1 = a + 4
a = -3
f(x) = -3(x - 1)² + 4

`>>> Verder oefenen: D18 t.e.m. D30`

12

--- PAGE 13 ---
**3** Een basketbalspeler gooit een bal naar de korf volgens deze tekening. De baan van de bal benadert een parabool.
Stel het functievoorschrift op dat hoort bij deze parabool.

De top van de parabool is T(3,5; 4). Dus p = 3,5 en q = 4.
f(x) = a(x - 3,5)² + 4
Het punt (6; 3,05) ligt op de parabool, dus f(6) = 3,05.
3,05 = a(6 - 3,5)² + 4
3,05 = a · 2,5² + 4
3,05 = 6,25a + 4
6,25a = 3,05 - 4
6,25a = -0,95
a = -0,152
f(x) = -0,152(x - 3,5)² + 4

[Afbeelding: Grafiek van een parabool over een basketbalspeler. De assen tonen x en y. De top T is aangeduid als (3,5; 4). Andere punten op de parabool zijn (4,5; 3,848) en (6; 3,05) die bij de ring ligt.]

`>>> Verder oefenen: D18 t.e.m. D30`

**4** Een projectiel wordt afgevuurd. De baan van het projectiel wordt beschreven door de functie h(t) = -t² + 12t (met t de tijd in seconden en h de hoogte in meter).

a) Na hoeveel tijd bereikt het projectiel zijn maximale hoogte?
p = -b / 2a = -12 / -2 = 6
q = (-b² + 4ac) / 4a = (-12² + 4 · (-1) · 0) / (4 · (-1)) = -144 / -4 = 36
De top van de functie wordt bereikt in het punt (6, 36).
Na 6 seconden bereikt het projectiel dus zijn maximale hoogte.

b) Hoe hoog bevindt het projectiel zich bij maximale hoogte?
Bij maximale hoogte bevindt het projectiel zich op een hoogte van 36 meter.

`>>> Verder oefenen: D31 t.e.m. D45`

**5** Een varkensboer wil een zo groot mogelijk rechthoekig stuk grond afspannen voor zijn varkens. Hij beschikt hiervoor over 32 meter afspanning. Bepaal de maximale oppervlakte van het afgespannen stuk als de wand van de varkensstal mee het rechthoekige stuk bepaalt.

breedte: x
lengte: 32 - 2x
A(x) = x · (32 - 2x)
= -2x² + 32x
We bepalen het extremum van deze functie.
p = -b / 2a = -32 / (2 · (-2)) = -32 / -4 = 8
q = f(8) = -2 · 8² + 32 · 8 = -128 + 256 = 128
Antwoord: De maximale oppervlakte van het stuk grond is 128 m².

[Afbeelding: Schematische tekening van een varkensstal (bovenaan) en daaronder een omheind stuk weiland (gras met varkens erin) met 3 zijden omheind en 1 zijde tegen het gebouw aan.]

`>>> Verder oefenen: D31 t.e.m. D45`

13

--- PAGE 14 ---
[Afbeelding: Icoon van een notitieboekje] **Differentiatietraject**

**1** Ana bepaalde de coördinaat van de top van de grafiek van de functie f met voorschrift f(x) = 2x² - 8x + 7 op de volgende manier.

[Afbeelding: Op een whiteboard staat genoteerd:]
**Ana**
a = 2, b = -8 en c = 7
p = -b / 2a = 8 / 4 = 2
q = f(p)
  = f(2) = 2 · 2² - 8 · 2 + 7
         = 8 - 16 + 7
         = -1

[Kader aan de rechterkant van het bord:]
p = -b / 2a        T(p, q)
q = (-b² + 4ac) / 4a    f(p) = q

De top van de grafiek heeft als coördinaat T(2, -1).
[Einde whiteboard]

Bepaal telkens voor de grafiek van de functie van Brooklyn, Cobe, Eleni en Dieuwke de coördinaat van de top op dezelfde manier.

Brooklyn
f1(x) = x² - 2x + 2
• f1(x) = x² - 2x + 2
a = 1, b = -2 en c = 2
p = -b / 2a = 2 / 2 = 1
q = f(p)
  = f(1) = 1² - 2 · 1 + 2
         = 1 - 2 + 2
         = 1
De top van de grafiek heeft als coördinaat T1(1, 1).

Cobe
f2(x) = -x² + 2
• f2(x) = -x² + 2
a = -2, b = 0 en c = 2
p = -b / 2a = 0
q = f(p)
  = f(0) = -0² + 2
         = 2
De top van de grafiek heeft als coördinaat T2(0, 2).

Dieuwke
f3(x) = -x² + 2x - 20
• f3(x) = -x² + 2x - 20
a = -1, b = 2 en c = -20
p = -b / 2a = -2 / -2 = 1
q = f(p)
  = f(1) = -1² + 2 · 1 - 20
         = -1 + 2 - 20
         = -19
De top van de grafiek heeft als coördinaat T3(1, -19).

Eleni
f4(x) = x² - 4x + 6
• f4(x) = x² - 4x + 6
a = 1, b = -4 en c = 6
p = -b / 2a = 4 / 2 = 2
q = f(p)
  = f(2) = 2² - 4 · 2 + 6
         = 4 - 8 + 6
         = 2
De top van de grafiek heeft als coördinaat T4(2, 2).

[Afbeelding: Icoon van één peper onderaan rechts, wat aanduidt dat dit de gemakkelijkste moeilijkheidsgraad is in de differentiatiereeks.]

14

--- PAGE 15 ---
**2** Gegeven:
f1(x) = 4(x - 2)² + 1      f3(x) = x² - 4x + 5      f5(x) = 3/5(x - 1)² + 2
f2(x) = (x - 1)²           f4(x) = x² - 2x + 3      f6(x) = x² + 1

a) Welke grafieken van deze tweedegraadsfuncties hebben dezelfde top?
b) Geef voor elke overblijvende functie een voorschrift van een andere functie zodat de grafieken van beide functies dezelfde top hebben.

• f1(x) = 4(x - 2)² + 1
p = 2 en q = 1

• f2(x) = (x - 1)²
p = 1 en q = 0

• f3(x) = x² - 4x + 5
p = -b / 2a = 4 / 2 = 2
q = (-b² + 4ac) / 4a = (-(-4)² + 4 · 1 · 5) / (4 · 1) = (-16 + 20) / 4 = 1

• f4(x) = x² - 2x + 3
p = -b / 2a = 2 / 2 = 1
q = (-b² + 4ac) / 4a = (-(-2)² + 4 · 1 · 3) / (4 · 1) = (-4 + 12) / 4 = 2

• f5(x) = 3/5(x - 1)² + 2
p = 1 en q = 2

• f6(x) = x² + 1
p = -b / 2a = 0
q = (-b² + 4ac) / 4a = (-0 + 4 · 1 · 1) / (4 · 1) = 1

a) De grafieken van de volgende functies hebben dezelfde top:
- f1(x) en f3(x)
- f4(x) en f5(x)

b) Bv.
- De grafieken van de functies f2(x) = (x - 1)² en g(x) = 2(x - 1)² hebben dezelfde top.
- De grafieken van de functies f6(x) = x² + 1 en h(x) = 5x² + 1 hebben dezelfde top.

[Afbeelding: Icoon van twee pepers onderaan rechts, dit betekent een gemiddelde moeilijkheidsgraad in de differentiatiereeks.]

15

--- PAGE 16 ---
**3** Bepaal het snijpunt van de grafiek van de functie met de y-as.

f1(x) = 2(x - 4)² + 3      f3(x) = 3/5(x - 1)² + 2      f5(x) = x² - 2x + 3
f2(x) = x² - 4x + 5        f4(x) = (x - 1)²             f6(x) = x² + 1

• f1(x) = 2(x - 4)² + 3
f1(0) = 2(0 - 4)² + 3
= 2 · 16 + 3
= 35
Snijpunt met de y-as: (0, 35)

• f2(x) = x² - 4x + 5
f2(0) = 0² - 4 · 0 + 5
= 5
Snijpunt met de y-as: (0, 5)

• f3(x) = 3/5(x - 1)² + 2
f3(0) = 3/5(0 - 1)² + 2
= 3/5 · 1 + 2
= 13/5
Snijpunt met de y-as: (0, 13/5)

• f4(x) = (x - 1)²
f4(0) = (0 - 1)²
= 1
Snijpunt met de y-as: (0, 1)

• f5(x) = x² - 2x + 3
f5(0) = 0² - 2 · 0 + 3
= 3
Snijpunt met de y-as: (0, 3)

• f6(x) = x² + 1
f6(0) = 0² + 1
= 1
Snijpunt met de y-as: (0, 1)

[Afbeelding: Icoon van twee pepers onderaan rechts, gemiddelde moeilijkheidsgraad in de differentiatiereeks.]

16

--- PAGE 17 ---
**4** Bepaal de coördinaat van de top van de grafiek van de gegeven functie.

f1(x) = x² - 6x + 5      f3(x) = 5x² + 8x + 1      f5(x) = -x²/2 + 4x + 3
f2(x) = x² + 8x + 1      f4(x) = √2x² - √8x + 3√2   f6(x) = -5/2x² + 15x

• f1(x) = x² - 6x + 5
p = -b / 2a = 6 / 2 = 3
q = (-b² + 4ac) / 4a = (-(-6)² + 4 · 1 · 5) / (4 · 1) = (-36 + 20) / 4 = -16 / 4 = -4
Coördinaat van de top: (3, -4)

• f2(x) = x² + 8x + 1
p = -b / 2a = -8 / 2 = -4
q = (-b² + 4ac) / 4a = (-8² + 4 · 1 · 1) / (4 · 1) = (-64 + 4) / 4 = -15
Coördinaat van de top: (-4, -15)

• f3(x) = 5x² + 8x + 1
p = -b / 2a = -8 / (2 · 5) = -4 / 5
q = (-b² + 4ac) / 4a = (-8² + 4 · 5 · 1) / (4 · 5) = (-64 + 20) / 20 = -44 / 20 = -11 / 5
Coördinaat van de top: (-4/5, -11/5)

• f4(x) = √2x² - √8x + 3√2
p = -b / 2a = √8 / (2√2) = (2√2) / (2√2) = 1
q = (-b² + 4ac) / 4a = (-8 + 4√2 · 3√2) / (4√2) = (-8 + 24) / (4√2) = 16 / (4√2) = 4 / √2 = 2√2
Coördinaat van de top: (1, 2√2)

• f5(x) = -x²/2 + 4x + 3
p = -b / 2a = -4 / (2 · (-1/2)) = 4
q = (-b² + 4ac) / 4a = (-4² + 4 · (-1/2) · 3) / (4 · (-1/2)) = (-16 - 6) / -2 = 11
Coördinaat van de top: (4, 11)

• f6(x) = -5/2x² + 15x
p = -b / 2a = -15 / (2 · (-5/2)) = 3
q = (-b² + 4ac) / 4a = (-15² + 4 · (-5/2) · 0) / (4 · (-5/2)) = -225 / -10 = 45 / 2
Coördinaat van de top: (3, 45/2)

[Afbeelding: Icoon van drie pepers onderaan rechts, de hoogste moeilijkheidsgraad in de differentiatiereeks.]

17

--- PAGE 18 ---
**5** Bepaal de vergelijking van de symmetrieas van de grafiek van de gegeven tweedegraadsfunctie f.

f1(x) = x² - 4x + 3      f3(x) = -x² + 3x      f5(x) = πx² + 4πx - 3
f2(x) = -2x² + 6x - 1    f4(x) = 4/3x² - 6x + 1 f6(x) = -9/2x² + 2/3x + 5/6

• f1(x) = x² - 4x + 3
p = -b / 2a = 4 / 2 = 2
Vergelijking van de symmetrieas: x = 2

• f2(x) = -2x² + 6x - 1
p = -b / 2a = -6 / (2 · (-2)) = 3/2
Vergelijking van de symmetrieas: x = 3/2

• f3(x) = -x² + 3x
p = -b / 2a = -3 / -2 = 3/2
Vergelijking van de symmetrieas: x = 3/2

• f4(x) = 4/3x² - 6x + 1
p = -b / 2a = 6 / (2 · (4/3)) = 9/4
Vergelijking van de symmetrieas: x = 9/4

• f5(x) = πx² + 4πx - 3
p = -b / 2a = -4π / 2π = -2
Vergelijking van de symmetrieas: x = -2

• f6(x) = -9/2x² + 2/3x + 5/6
p = -b / 2a = -(2/3) / (2 · (-9/2)) = (2/3) / (-9) = -(2/27) --> wait, the text says:
p = -b / 2a = -(2/3) / (2 · (-9/2)) = 2/27
Vergelijking van de symmetrieas: x = 2/27

[Afbeelding: Icoon van drie pepers onderaan rechts, de hoogste moeilijkheidsgraad in de differentiatiereeks.]

**6** Bepaal het functievoorschrift van een tweedegraadsfunctie g waarvan de grafiek een dalparabool is met dezelfde top als de grafiek van de functie f met voorschrift f(x) = -3x² + 6x - 5.

f(x) = -3x² + 6x - 5
p = -b / 2a = -6 / (-2 · 3) = 1
q = (-b² + 4ac) / 4a = (-6² + 4 · (-3) · (-5)) / (4 · (-3))
= (-36 + 60) / -12
= 24 / -12
= -2

Bv. De grafiek van de functie g met voorschrift g(x) = (x - 1)² - 2 is een dalparabool met dezelfde top als de grafiek van de functie f (het punt (1, -2)).

[Afbeelding: Icoon van drie pepers onderaan rechts, de hoogste moeilijkheidsgraad in de differentiatiereeks.]

18

--- PAGE 19 ---
**7** Welke transformaties zijn uitgevoerd met de grafiek van de functie g met voorschrift g(x) = x² om de grafiek van de gegeven functies te verkrijgen?

f1(x) = 5x² + 20x - 12   f3(x) = -3x² + x      f5(x) = 5πx² + πx - 2
f2(x) = 1,5x² - 6x + 4   f4(x) = 4/3x² - 2x + 5 f6(x) = 9/2x² - 2/3x - 5/6

• f1(x) = 5x² + 20x - 12
p = -b / 2a = -20 / (2 · 5) = -2
q = (-b² + 4ac) / 4a = (-20² + 4 · 5 · (-12)) / (4 · 5)
= (-400 - 240) / 20
= -640 / 20
= -32
f1(x) = 5(x + 2)² - 32
- verticale uitrekking met factor 5
- horizontale verschuiving naar links met 2 eenheden
- verticale verschuiving naar onder met 32 eenheden

• f2(x) = 1,5x² - 6x + 4
p = -b / 2a = 6 / (2 · 1,5) = 2
q = (-b² + 4ac) / 4a = (-6² + 4 · 1,5 · 4) / (4 · 1,5)
= (-36 + 24) / 6
= -2
f2(x) = 1,5(x - 2)² - 2
- verticale uitrekking met factor 1,5
- horizontale verschuiving naar rechts met 2 eenheden
- verticale verschuiving naar onder met 2 eenheden

• f3(x) = -3x² + x
p = -b / 2a = -1 / (-2 · 3) = 1/6
q = (-b² + 4ac) / 4a = (-1² + 4 · (-3) · 0) / (4 · (-3))
= -1 / -12
= 1/12
f3(x) = -3(x - 1/6)² + 1/12
- verticale uitrekking met factor 3
- een spiegeling om de x-as
- horizontale verschuiving naar rechts met 1/6 eenheid
- verticale verschuiving naar boven met 1/12 eenheid

19

--- PAGE 20 ---
• f4(x) = 4/3x² - 2x + 5
p = -b / 2a = 2 / (2 · 4/3) = 3/4
q = (-b² + 4ac) / 4a = (-2² + 4 · (4/3) · 5) / (4 · 4/3)
= (-4 + 80/3) / (16/3)
= (68/3) / (16/3)
= 68/16
= 17/4
f4(x) = 4/3(x - 3/4)² + 17/4
- verticale uitrekking met factor 4/3
- horizontale verschuiving naar rechts met 3/4 eenheid
- verticale verschuiving naar boven met 17/4 eenheden

• f5(x) = 5πx² + πx - 2
p = -b / 2a = -π / (2 · 5π) = -1/10
q = (-b² + 4ac) / 4a
= (-π² + 4 · 5π · (-2)) / (4 · 5π)
= (-π² - 40π) / 20π
= -π/20 - 2
f5(x) = 5π(x + 1/10)² - π/20 - 2
- verticale uitrekking met factor 5π
- horizontale verschuiving naar links met 1/10 eenheden
- verticale verschuiving naar onder met π/20 - 2 eenheden

20

--- PAGE 21 ---
• f6(x) = 9/2x² - 2/3x - 5/6
p = -b / 2a = (2/3) / (2 · (9/2)) = 2/27
q = (-b² + 4ac) / 4a = (-( -2/3 )² + 4 · 9/2 · ( -5/6 )) / (4 · 9/2)
= (-4/9 - 15) / 18
= (-139/9) / 18
= -139/162
f6(x) = 9/2(x - 2/27)² - 139/162
- verticale uitrekking met factor 9/2
- horizontale verschuiving naar rechts met 2/27 eenheid
- verticale verschuiving naar onder met 139/162 eenheid

[Afbeelding: Icoon van drie pepers onderaan rechts, de hoogste moeilijkheidsgraad in de differentiatiereeks.]

**8** Bepaal de top van de parabool die ontstaat door de grafiek van de functie f met voorschrift f(x) = x² - 6x + 1 …

a) te spiegelen ten opzichte van de x-as.
b) te spiegelen ten opzichte van de y-as.

f(x) = x² - 6x + 1
p = -b / 2a = 6 / 2 = 3
q = (-b² + 4ac) / 4a = (-(-6)² + 4 · 1 · 1) / (4 · 1)
= (-36 + 4) / 4
= -8
De top van de grafiek heeft als coördinaat (3, -8).
a) Na spiegeling ten opzichte van de x-as zal de top van de grafiek (3, 8) als coördinaat hebben.
b) Na spiegeling ten opzichte van de y-as zal de top van de grafiek (-3, -8) als coördinaat hebben.

[Afbeelding: Icoon van drie pepers onderaan rechts, de hoogste moeilijkheidsgraad in de differentiatiereeks.]

21

--- PAGE 22 ---
**9** Geef het verloop (stijgen en dalen) voor de grafiek van de functies.

f1(x) = -4x² - 8x + 2    f3(x) = -0,2x² + x + 1,25    f5(x) = -3x²/4 + 6x + 1
f2(x) = x² + 5x + 3      f4(x) = 9x² - 4              f6(x) = -7x² + 3x

• f1(x) = -4x² - 8x + 2
p = -b / 2a = 8 / -8 = -1
q = f(p) = f(-1) = -4 · (-1)² - 8 · (-1) + 2
= -4 + 8 + 2
= 6

| x | | -1 | |
|---|---|---|---|
| f(x) | ↗ | 6 | ↘ |

• f2(x) = x² + 5x + 3
p = -b / 2a = -5 / 2
q = f(p) = f(-5/2) = (-5/2)² + 5 · (-5/2) + 3
= 25/4 - 25/2 + 3
= 25/4 - 50/4 + 12/4
= -13/4

| x | | -5/2 | |
|---|---|---|---|
| f(x) | ↘ | -13/4 | ↗ |

• f3(x) = -0,2x² + x + 1,25
p = -b / 2a = -1 / (2 · (-0,2)) = 5/2
q = f(p) = f(5/2) = -0,2 · (5/2)² + 5/2 + 1,25
= -1/5 · 25/4 + 5/2 + 5/4
= -5/4 + 5/2 + 5/4
= 5/2

| x | | 5/2 | |
|---|---|---|---|
| f(x) | ↗ | 5/2 | ↘ |

• f4(x) = 9x² - 4
p = -b / 2a = 0
q = f(p) = f(0) = 9 · 0² - 4
= -4

| x | | 0 | |
|---|---|---|---|
| f(x) | ↘ | -4 | ↗ |

22

--- PAGE 23 ---
• f5(x) = -3x²/4 + 6x + 1
p = -b / 2a = -6 / (2 · (-3/4)) = 4
q = f(p) = f(4) = (-3 · 4²) / 4 + 6 · 4 + 1
= -12 + 24 + 1
= 13

| x | | 4 | |
|---|---|---|---|
| f(x) | ↗ | 13 | ↘ |

• f6(x) = -7x² + 3x
p = -b / 2a = -3 / (2 · (-7)) = 3/14
q = f(p) = f(3/14) = -7 · (3/14)² + 3 · 3/14
= -7 · 9/196 + 9/14
= -9/28 + 18/28
= 9/28

| x | | 3/14 | |
|---|---|---|---|
| f(x) | ↗ | 9/28 | ↘ |

[Afbeelding: Icoon van drie pepers onderaan rechts, de hoogste moeilijkheidsgraad in de differentiatiereeks.]

**10** Bepaal de top van de parabool die ontstaat door de grafiek van de functie f met voorschrift f(x) = x² - 4x + 1 …

a) te spiegelen ten opzichte van de oorsprong.
b) te spiegelen ten opzichte van de rechte a met vergelijking y = -3.
c) te spiegelen ten opzichte van de rechte b met vergelijking x = 4.

f(x) = x² - 4x + 1
p = -b / 2a = 4 / 2 = 2
q = f(p) = f(2) = 2² - 4 · 2 + 1
= 4 - 8 + 1
= -3
De top van de grafiek heeft als coördinaat (2, -3).
a) Na spiegeling ten opzichte van de oorsprong zal de top (-2, 3) als coördinaat hebben.
b) Na spiegeling ten opzichte van de rechte a zal de top nog steeds (2, -3) als coördinaat hebben.
c) Na spiegeling ten opzichte van de rechte b zal de top (6, -3) als coördinaat hebben.

[Afbeelding: Icoon van drie pepers onderaan rechts, de hoogste moeilijkheidsgraad in de differentiatiereeks.]

23

--- PAGE 24 ---
**11** De grafiek van de functie f met voorschrift f(x) = x²/2 - 8x + 1 wordt achtereenvolgens 3 eenheden horizontaal naar rechts verschoven en 4 eenheden verticaal naar onder verschoven.

a) Geef de vergelijking van de symmetrieas van die grafiek.
b) Geef de coördinaat van de top van die grafiek.

f(x) = x²/2 - 8x + 1
p = -b / 2a = 8 / (2/2) = 8
q = f(p) = f(8) = 8²/2 - 8 · 8 + 1
= 32 - 64 + 1
= -31
f(x) = 1/2(x - 8)² - 31

- Na horizontale verschuiving met 3 eenheden naar rechts wordt het functievoorschrift
f1(x) = 1/2(x - 11)² - 31.
- Na verticale verschuiving met 4 eenheden naar onder daarna wordt het functievoorschrift
f2(x) = 1/2(x - 11)² - 35.

a) x = 11
b) T2(11, -35)

[Afbeelding: Icoon van drie pepers onderaan rechts, de hoogste moeilijkheidsgraad in de differentiatiereeks.]

**12** Toon aan dat de grafiek van f met voorschrift f(x) = -2(x + 1)² - 3 dezelfde top heeft als de grafiek van de functie g met voorschrift g(x) = 5x² + 10x + 2.

f(x) = -2(x + 1)² - 3
p = -1
q = -3

De top van de grafiek van de functie f heeft als coördinaat (-1, -3).

g(x) = 5x² + 10x + 2
p = -b / 2a = -10 / (2 · 5) = -10 / 10 = -1
q = (-b² + 4ac) / 4a = (-10² + 4 · 5 · 2) / (4 · 5)
= (-100 + 40) / 20
= -60 / 20
= -3

De top van de grafiek van de functie g heeft als coördinaat (-1, -3).

[Afbeelding: Icoon van drie pepers onderaan rechts, de hoogste moeilijkheidsgraad in de differentiatiereeks.]

24

--- PAGE 25 ---
**13** Bepaal de waarde van a zodat T(-3, -31/2) de top is van de grafiek van de functie f met functievoorschrift f(x) = ax² + 9x - 2.

f(x) = ax² + 9x - 2
p = -3 = -b / 2a
-3 = -9 / 2a
a = -9 / (2 · (-3))
a = 9 / 6
a = 3/2

[Afbeelding: Icoon van vier pepers onderaan rechts, een extra uitdaging.]

**14** Bepaal de waarde van c zodat T(4, -2) de top is van de grafiek van de functie f met functievoorschrift f(x) = -1,5x² + 12x + c.

f(x) = -1,5x² + 12x + c
q = -2 = (-b² + 4ac) / 4a
-2 = (-12² + 4 · (-1,5) · c) / (4 · (-1,5))
-2 = (-144 - 6c) / -6
12 = -144 - 6c
c = (-144 - 12) / 6
c = -156 / 6
c = -26

[Afbeelding: Icoon van vier pepers onderaan rechts, een extra uitdaging.]

**15** Gegeven: T(p, q) is de top van de grafiek van een tweedegraadsfunctie f.
Toon aan dat: T(p, q) ∈ f ⇒ P(p + 1, q + a) ∈ f.

Te bewijzen : f(p + 1) = q + a
Bewijs:
- f(x) = a(x - p)² + q
- f(p) = q
- f(p + 1) = a(p + 1 - p)² + q
= a · 1² + q
= q + a

[Afbeelding: Icoon van vijf pepers onderaan rechts, de allerhoogste moeilijkheidsgraad.]

25

--- PAGE 26 ---
**16** De parabool met vergelijking y = x² - mx + n heeft als top (3, -8). Bepaal m en n.

f(x) = x² - mx + n
p = 3 = -b / 2a
3 = m / 2
m = 6

q = -8 = f(p) = f(3)
-8 = 3² - 6 · 3 + n
n = -8 - 9 + 18
n = 1

[Afbeelding: Icoon van vijf pepers onderaan rechts, de allerhoogste moeilijkheidsgraad.]

**17** Gegeven: p1 ↔ y = 3x² + 6x - 9, p2 ↔ y = x² + 2x - 3 en p3 ↔ y = -x² - 2x + 3
Toon aan dat de toppen van de parabolen collineair zijn.

• p1(x) = 3x² + 6x - 9
p = -b / 2a = -6 / (2 · 3) = -1
q = p1(p) = p1(-1) = 3 · (-1)² + 6 · (-1) - 9
= 3 - 6 - 9
= -12
De top heeft als coördinaat T1(-1, -12).

• p2(x) = x² + 2x - 3
p = -b / 2a = -2 / 2 = -1
q = p2(p) = p2(-1) = (-1)² + 2 · (-1) - 3
= 1 - 2 - 3
= -4
De top heeft als coördinaat T2(-1, -4).

• p3(x) = -x² - 2x + 3
p = -b / 2a = 2 / (2 · (-1)) = -1
q = p3(p) = p3(-1) = -(-1)² - 2 · (-1) + 3
= -1 + 2 + 3
= 4
De top heeft als coördinaat T3(-1, 4).

- De 3 toppen hebben als x-coördinaat -1, en liggen dus alledrie op de rechte x = -1.
De 3 toppen zijn dus collineair.

[Afbeelding: Icoon van vijf pepers onderaan rechts, de allerhoogste moeilijkheidsgraad.]

26

--- PAGE 27 ---
**18** Van de gegeven tweedegraadsfuncties werd de grafiek getekend.

f(x) = -x² + 3x + 2    g(x) = -2x² + 12x - 16    h(x) = -1/2x² + 2

Noteer het juiste functievoorschrift bij de passende parabool. Kijk hiervoor naar de bijzondere punten.

[Afbeelding: Drie grafieken met elk een parabool.]
[Eerste grafiek links: een bergparabool met top (1,5; 4,25) wat overeenkomt met T1(3/2, 17/4).]
[Tweede grafiek midden: een bergparabool met top T2(3, 2). De top is aangeduid in het figuur, maar is in feite (3, 2).]
[Derde grafiek rechts: een bergparabool met top T3(0, 2).]

• f(x) = -x² + 3x + 2
p = -b / 2a = -3 / (2 · (-1)) = 3/2
q = f(3/2) = -(3/2)² + 3 · 3/2 + 2
= -9/4 + 9/2 + 2
= -9/4 + 18/4 + 8/4
= 17/4
De top van de grafiek heeft als coördinaat T1(3/2, 17/4). (Hoort bij linkse grafiek)

• g(x) = -2x² + 12x - 16
p = -b / 2a = -12 / (2 · (-2)) = 3
q = g(3) = -2 · 3² + 12 · 3 - 16
= -2 · 9 + 36 - 16
= 2
De top van de grafiek heeft als coördinaat T2(3, 2). (Hoort bij middelste grafiek)

• h(x) = -1/2x² + 2
p = -b / 2a = 0
q = h(0) = -1/2 · 0² + 2
= 2
De top van de grafiek heeft als coördinaat T3(0, 2). (Hoort bij rechtse grafiek)

[Afbeelding: Icoon van één peper onderaan rechts, laagste moeilijkheidsgraad.]

27

--- PAGE 28 ---
**19** Kleur telkens de functievoorschriften die voldoen aan de voorwaarde.

a) De top van de parabool is T(4, 1).
| f(x) = -2(x - 4)² + 1 | g(x) = 1/2x² - 4x + 9 | h(x) = x² + 4x + 1 | k(x) = -x² + 8x + 1 |
|---|---|---|---|
(In het boek zijn f(x) en g(x) rood ingekleurd als correcte antwoorden.)

b) De vergelijking van de symmetrieas van de parabool is x = -1.
| f(x) = 3(x - 1)² + 2 | g(x) = x² + 2x + 3 | h(x) = (x + 1)² | k(x) = 3x² - 6x |
|---|---|---|---|
(In het boek zijn g(x) en h(x) rood ingekleurd als correcte antwoorden.)

c) De parabool snijdt de y-as in het punt P(0, 2).
| f(x) = -3/4(x + 2)² + 2 | g(x) = -0,25x² + 3x + 2 | h(x) = 4x² + 2 | k(x) = (x + 1)² + 1 |
|---|---|---|---|
(In het boek zijn g(x), h(x) en k(x) rood ingekleurd als correcte antwoorden.)

a) 
• g(x) = 1/2x² - 4x + 9
p = -b / 2a = 4 / (2 · 1/2) = 4
q = g(4) = 1/2 · 4² - 4 · 4 + 9
= 8 - 16 + 9
= 1

• h(x) = x² + 4x + 1
p = -b / 2a = -4 / 2 = -2
q = h(-2) = (-2)² + 4 · (-2) + 1
= 4 - 8 + 1
= -3

• k(x) = -x² + 8x + 1
p = -b / 2a = -8 / (2 · (-1)) = 4
q = k(4) = -4² + 8 · 4 + 1
= -16 + 32 + 1
= 17

b) 
• g(x) = x² + 2x + 3
p = -b / 2a = -2 / 2 = -1

• k(x) = 3x² - 6x
p = -b / 2a = 6 / (2 · 3) = 1

c) 
• f(x) = -3/4(x + 2)² + 2
f(0) = -3/4(0 + 2)² + 2
= -3/4 · 4 + 2
= -3 + 2
= -1

• g(x) = -0,25x² + 3x + 2
g(0) = -0,25 · 0² + 3 · 0 + 2
= 2

• h(x) = 4x² + 2
h(0) = 4 · 0² + 2
= 2

• k(x) = (x + 1)² + 1
k(0) = (0 + 1)² + 1
= 1 + 1
= 2

[Afbeelding: Icoon van twee pepers onderaan rechts, gemiddelde moeilijkheidsgraad.]

28

--- PAGE 29 ---
**20** Geef telkens twee mogelijke functievoorschriften.

a) De parabool snijdt de y-as in het punt (0, -1).
b) De vergelijking van de symmetrieas van de parabool is x = 3.
c) De top van de parabool is T(-1, 2).

a) Bv. f(x) = x² - 1
g(x) = (x - 1)² - 2

b) Bv. f(x) = (x - 3)² + 2
g(x) = 4(x - 3)² - 5

c) Bv. f(x) = (x + 1)² + 2
g(x) = -3(x + 1)² + 2

[Afbeelding: Icoon van twee pepers onderaan rechts.]

**21** Bepaal het functievoorschrift dat hoort bij de gegeven parabool.

a)
[Afbeelding: Dalparabool door de punten (0,1), (2,5) en (3,1). De top ligt bij (-1,2) is niet correct afgelezen of getekend, nee de top lijkt ergens bij (1,x) te liggen. We gebruiken de punten.]
b)
[Afbeelding: Parabool.]
c)
[Afbeelding: Parabool.]

a) y = ax² + bx + c
A(0, 1): 1 = a · 0 + b · 0 + c ⇒ c = 1
B(2, 5): 5 = a · 4 + b · 2 + 1 ⇒ 4a + 2b = 4
C(3, 1): 1 = a · 9 + b · 3 + 1 ⇒ 9a + 3b = 0

{ 4a + 2b = 4
{ 9a + 3b = 0

⇔
{ 4a + 2 · (-3a) = 4
{ b = -3a

⇔
{ 4a - 6a = 4
{ b = -3a

⇔
{ -2a = 4
{ b = -3a

⇔
{ a = -2
{ b = -3 · (-2)

⇔
{ a = -2
{ b = 6

y = -2x² + 6x + 1

29

--- PAGE 30 ---
b) y = ax² + bx + c

A(0, -6): -6 = a · 0 + b · 0 + c ⇒ c = -6
B(3, 0): 0 = a · 9 + b · 3 - 6 ⇒ 9a + 3b = 6 ⇒ 3a + b = 2
C(6, 0): 0 = a · 36 + b · 6 - 6 ⇒ 36a + 6b = 6 ⇒ 6a + b = 1

{ 3a + b = 2
{ 6a + b = 1

⇔
{ b = 2 - 3a
{ 6a + 2 - 3a = 1

⇔
{ b = 2 - 3a
{ 3a = -1

⇔
{ b = 2 - 3a
{ a = -1/3

⇔
{ b = 2 - 3 · (-1/3)
{ a = -1/3

⇔
{ b = 2 + 1
{ a = -1/3

⇔
{ b = 3
{ a = -1/3

y = -1/3x² + 3x - 6

c) 
• T(0, -3)
α = 0
β = -3
f(x) = a(x - 0)² - 3 = ax² - 3

• A(4, 1) ∈ f ⇒ f(4) = 1
1 = a · 4² - 3
1 = 16a - 3
16a = 4
a = 1/4
f(x) = 1/4x² - 3

[Afbeelding: Icoon van drie pepers onderaan rechts.]

**22** Stel de vergelijking op van de parabool die door de oorsprong gaat met top T(3, -4).

• T(3, -4)
p = 3
q = -4
f(x) = a(x - 3)² - 4

• O(0, 0) ∈ f ⇒ f(0) = 0
0 = a(0 - 3)² - 4
0 = 9a - 4
9a = 4
a = 4/9
f(x) = 4/9(x - 3)² - 4

[Afbeelding: Icoon van drie pepers onderaan rechts.]

30

--- PAGE 31 ---
**23** Stel het voorschrift op van de functie van de tweede graad met als nulwaarden -4 en 1 en die door P(-2, 3) gaat.

- Aangezien de parabool -4 en 1 als nulwaarden heeft, loopt de symmetrieas door het midden van deze 2 nulpunten:
x = (-4 + 1) / 2 = -1,5 = α

- p = -1,5 = -b / 2a
b = 3a

- Het punt (-2, 3) ligt op de parabool:
3 = 4a - 2b + c
3 = 4a - 6a + c
c = 3 + 2a

- Het punt (1, 0) ligt op de parabool:
0 = a + b + c
0 = a + 3a + 3 + 2a
6a = -3
a = -1/2

- b = 3a
b = 3 · (-1/2)
b = -3/2

- c = 3 + 2a
c = 3 + 2 · (-1/2)
c = 2

- f(x) = -1/2x² - 3/2x + 2

[Afbeelding: Icoon van drie pepers onderaan rechts.]

**24** Een functie van de tweede graad heeft een extremum van 3 voor x = -2. De grafiek gaat ook door P(2, 1). Stel het voorschrift op van de functie.

- T(-2, 3)
p = -2
q = 3
f(x) = a(x - p)² + q
f(x) = a(x + 2)² + 3

- P(2, 1) ∈ f ⇒ f(2) = 1
1 = a(2 + 2)² + 3
1 = a · 4² + 3
16a = -2
a = -1/8
f(x) = -1/8(x + 2)² + 3

[Afbeelding: Icoon van drie pepers onderaan rechts.]

31

--- PAGE 32 ---
**25** Een autoweg over het water verbindt twee stukken land met elkaar. De afstand tussen de twee steunpilaren is 1280 meter. De steunpilaren zijn 160 meter hoog. Tussen de steunpilaren is een kabel gespannen die een parabolische vorm aanneemt. Net in het midden van de twee steunpilaren raakt de kabel de autoweg. Hoe hoog bevindt de kabel zich van de autoweg als je 500 meter verwijderd bent van een steunpilaar?

[Afbeelding: Tekening van de Golden Gate brug. Een assenstelsel (x en y-as) is over de tekening geplaatst. Het punt waar de brug het wegdek raakt, is de oorsprong (0,0). De linker steunpilaar staat op afstand -640m en is 160m hoog. De rechter staat op afstand 640m en is 160m hoog, wat resulteert in punt (640, 160). De totale afstand is 1280 m.]

- T(0, 0)
p = 0
q = 0
f(x) = a(x - p)² + q
f(x) = ax²

- P(640, 160) ∈ f ⇒ f(640) = 160
160 = a · 640²
160 = a · 409 600
a = 160 / 409 600
a = 1 / 2560
f(x) = 1 / 2560 x²

- 640 - 500 = 140
f(140) = 1 / 2560 · 140²
= 1 / 2560 · 19 600
= 245 / 32
≈ 7,66

Antwoord: Op 500 meter van een steunpilaar is de kabel ongeveer 7,66 meter hoog.

[Afbeelding: Icoon van drie pepers onderaan rechts.]

32

--- PAGE 33 ---
**26** De doorsnede van een rivier is parabolisch. Over welke afstand is de rivier dieper dan 1 m als de rivier 6 m breed en 2 m diep is?

[Afbeelding: Tekening van de doorsnede van een rivier in een assenstelsel. De rivier heeft een parabolische bodem. De breedte van 6m loopt van x = -3 tot x = 3. De diepte van 2m is de y-as bij y = -2. Het wateroppervlak valt samen met de x-as.]

- De parabool gaat door de punten (-3, 0), (0, -2) en (3, 0):

(0, -2): -2 = a · 0 + b · 0 + c ⇒ c = -2
(-3, 0): 0 = a · (-3)² + b · (-3) - 2 ⇒ 9a - 3b = 2
(3, 0): 0 = a · 3² + b · 3 - 2 ⇒ 9a + 3b = 2

{ 9a - 3b = 2
{ 9a + 3b = 2

⇔
{ 3b = 9a - 2
{ 9a + 3b = 2

⇔
{ b = 3a - 2/3
{ 9a + 3(3a - 2/3) = 2

⇔
{ b = 3a - 2/3
{ 9a + 9a - 2 = 2

⇔
{ b = 3a - 2/3
{ 18a = 4

⇔
{ b = 3a - 2/3
{ a = 2/9

⇔
{ b = 3 · 2/9 - 2/3
{ a = 2/9

⇔
{ b = 2/3 - 2/3
{ a = 2/9

⇔
{ b = 0
{ a = 2/9

f(x) = 2/9x² - 2

33

--- PAGE 34 ---
- We bepalen de snijpunten van de parabool met de rechte y = -1:
-1 = 2/9x² - 2
2/9x² = 1
x² = 9/2
x = √(9/2) of x = -√(9/2)
x = 3√2 / 2 of x = -3√2 / 2

De rivier is dus dieper dan 1 meter tussen de punten (-3√2 / 2, -1) en (3√2 / 2, -1).

- 2 · 3√2 / 2 = 3√2

Antwoord: De rivier is dieper dan 1 meter over een afstand van 3√2 meter.

[Afbeelding: Icoon van vier pepers onderaan rechts.]

**27** De doorsnede van een schaal is parabolisch. De schaal is 20 cm breed en 10 cm diep. In de schaal staat 3 cm water. Wat is de breedte van het vloeistofoppervlak?

[Afbeelding: Grafiek van de doorsnede van de schaal. Een parabool door de oorsprong (0,0). De uiteinden van de schaal liggen bij y=10 (diepte is 10 cm) en een breedte van 20 cm, dus bij x=-10 en x=10. Een waterlijn is getekend op hoogte y=3.]

- T(0, 0)
p = 0
q = 0
f(x) = ax²

- (10, 10) ∈ f ⇒ f(10) = 10
10 = a · 10²
100a = 10
a = 1/10
f(x) = 1/10x²

- We bepalen de snijpunten van de parabool met de rechte y = 3:
3 = 1/10x²
x² = 30
x = √30 of x = -√30

Het vloeistofoppervlak loopt dus tussen de punten (-√30, 3) en (√30, 3).
Antwoord: Het vloeistofoppervlak heeft een breedte van 2√30 cm.

[Afbeelding: Icoon van vier pepers onderaan rechts.]

34

--- PAGE 35 ---
**28** De gewelven van een kerk zijn parabolisch van vorm. We laten de steunpilaren buiten beschouwing. Op 1 m horizontale afstand is het gewelf 0,5 m hoog en op 2 m horizontale afstand is het gewelf 0,9 m hoog.

a) Hoe breed is deze kerk?
b) Hoe hoog is het gewelf als je weet dat een steunpilaar 9,8 m hoog is?

[Afbeelding: Tekening van de binnenkant van een kerk met gewelven. Een wiskundige staat op een bord een paraboolvergelijking uit te werken.]

[Afbeelding: Assenstelsel met de punten (0,0), (1; 0,5) en (2; 0,9) aangeduid, waarlangs een parabooltak is getekend.]

a) 
- De parabool gaat door de punten (0, 0), (1; 0,5) en (2; 0,9):
(0, 0): 0 = a · 0 + b · 0 + c ⇒ c = 0
(1; 0,5): 0,5 = a · 1² + b · 1 ⇒ a + b = 0,5
(2; 0,9): 0,9 = a · 2² + b · 2 ⇒ 4a + 2b = 0,9

{ a + b = 0,5
{ 4a + 2b = 0,9

⇔
{ b = 0,5 - a
{ 4a + 2(0,5 - a) = 0,9

⇔
{ b = 0,5 - a
{ 4a + 1 - 2a = 0,9

⇔
{ b = 0,5 - a
{ 2a = -0,1

⇔
{ b = 0,5 - a
{ a = -0,05

⇔
{ b = 0,5 + 0,05
{ a = -0,05

⇔
{ b = 0,55
{ a = -0,05

f(x) = -0,05x² + 0,55x
- p = -b / 2a = -0,55 / (2 · (-0,05)) = 5,5
- 5,5 · 2 = 11
De top van de kerk bevindt zich op 5,5 meter van de rand.
De kerk is dus 11 meter breed.

b) 
- q = f(p) = f(5,5) = -0,05 · (5,5)² + 0,55 · 5,5
= -0,05 · 30,25 + 3,025
= -1,5125 + 3,025
= 1,5125
- 9,8 + 1,5125 = 11,3125
Antwoord: Het gewelf is 11,3125 meter hoog.

[Afbeelding: Icoon van vier pepers onderaan rechts.]

35

--- PAGE 36 ---
**29** De rechte a met vergelijking x = 3 is de symmetrieas van een parabool die aan de x-as raakt en door P(6, -1) gaat. Bepaal de vergelijking van de parabool.

- x = 3 is de symmetrieas.
→ p = 3
- De parabool raakt aan de x-as.
→ q = 0
- f(x) = a(x - 3)²
Het punt (6, -1) ligt op de parabool:
-1 = a(6 - 3)²
-1 = a · 3²
9a = -1
a = -1/9
f(x) = -1/9(x - 3)²

[Afbeelding: Icoon van vier pepers onderaan rechts.]

**30** De parabool p raakt in zijn top aan p' met vergelijking y = 2x² - 4x + 1. Bovendien gaat de parabool p ook door het punt A(-1, 2). Bepaal de vergelijking van p.

- p'(x) = 2x² - 4x + 1
p = -b / 2a = 4 / (2 · 2) = 1
q = p'(1) = 2 · 1² - 4 · 1 + 1
= 2 - 4 + 1
= -1
De top van de parabool p' en bijgevolg ook de parabool p is het punt (1, -1).

- p(x) = a(x - 1)² - 1
Het punt A(-1, 2) ligt op de parabool p:
2 = a(-1 - 1)² - 1
2 = a · 4 - 1
4a = 3
a = 3/4
p(x) = 3/4(x - 1)² - 1

[Afbeelding: Icoon van vier pepers onderaan rechts.]

36

--- PAGE 37 ---
**31** Vicky lanceert een voorwerp vanop 5 meter hoogte. Het voorwerp legt een parabolische baan af. De hoogte van het voorwerp kan beschreven worden in functie van de tijd met behulp van de functie h met voorschrift h(t) = -0,25t² + 2t + 5. Geef de betekenis van de drie aangeduide punten.

[Afbeelding: Grafiek van de functie h(t). Een bergparabool die start in punt a (t=0, h=5), een top bereikt in punt b (t=4, h=9), en de t-as snijdt in punt c (t=10, h=0).]

a: het beginpunt van het voorwerp
b: het hoogste punt van het voorwerp
c: het punt waarop het voorwerp de grond raakt

[Afbeelding: Icoon van één peper onderaan rechts.]

**32** Een dolfijn springt uit het water. Zijn sprong is parabolisch en kan beschreven worden met de functie h(x) = -0,25(x - 3)² + 2,25 waarbij x de horizontale verplaatsing is (in meter) en h(x) de hoogte ten opzichte van het wateroppervlak (in meter).
a) Bepaal de maximale hoogte bij dit kunstje van de dolfijn.
b) Hoeveel verder duikt de dolfijn terug in het water?

[Afbeelding: Illustratie van een dolfijn die een parabolische sprong uit het water maakt, waarbij x de horizontale verplaatsing is en h(x) de hoogte.]

a) q = 2,25
De maximale hoogte is 2,25 meter.

b) De dolfijn verlaat het water bij x = 0. Het hoogtepunt wordt bereikt bij x = 3 (want p = 3).
De dolfijn duikt terug het water in bij x = 6. De dolfijn duikt dus 6 meter verder terug in het water.

[Afbeelding: Icoon van één peper onderaan rechts.]

37

--- PAGE 38 ---
**33** Na t seconden bereikt een bal een hoogte van h meter. Het verband wordt weergegeven door de functie h met voorschrift h(t) = 1,44t - 16t².
a) Bereken de maximale hoogte van de bal. Controleer je antwoord met ICT.
b) Bereken na hoeveel seconden de bal zijn maximale hoogte bereikt. Controleer je antwoord met ICT.

a) h(t) = -16t² + 1,44t
q = (-b² + 4ac) / 4a = (-1,44² + 4 · (-16) · 0) / (4 · (-16))
= -2,0736 / -64
= 0,0324
De maximale hoogte van de bal is 0,0324 meter.

b) p = -b / 2a = -1,44 / (2 · (-16))
= 1,44 / 32
= 0,045
De maximale hoogte wordt bereikt na 0,045 seconden.

[Afbeelding: Icoon van twee pepers onderaan rechts.]

**34** Vanop een helling, 2,4 meter boven de zeespiegel, wordt vuurwerk afgeschoten. Het vuurwerk ontploft op zijn maximale hoogte. De hoogte van het vuurwerk ten opzichte van de zeespiegel (in meter) kan weergegeven worden in functie van de tijd (in seconden) door de functie h met voorschrift h(t) = -48t² + 192t + 2,4.
a) Na hoeveel tijd bereikt het vuurwerk zijn maximale hoogte?
b) Wat is de hoogte op dat tijdstip?

a) h(t) = -48t² + 192t + 2,4
p = -b / 2a = -192 / (2 · (-48))
= 192 / 96
= 2
De top van de parabool wordt bereikt bij x = 2.
Het vuurwerk bereikt dus een maximale hoogte na 2 seconden.

b) q = h(p) = h(2) = -48 · 2² + 192 · 2 + 2,4
= -192 + 384 + 2,4
= 194,4
De hoogte na 2 seconden is 194,4 meter.

[Afbeelding: Icoon van twee pepers onderaan rechts.]

38

--- PAGE 39 ---
**35** In een rechthoek is de halve omtrek 80 cm. Voor welke lengte en breedte is de oppervlakte van de rechthoek maximaal?

- breedte: x
lengte: 80 - x

- A(x) = x · (80 - x)
A(x) = -x² + 80x

- p = -b / 2a = -80 / (2 · (-1))
= 40

q = A(40) = -40² + 80 · 40
= -1600 + 3200
= 1600

Antwoord: De maximale oppervlakte is 1600 cm² als zowel de lengte als de breedte 40 cm is.

[Afbeelding: Icoon van drie pepers onderaan rechts.]

**36** Twee getallen hebben als som 20. Wanneer is hun product maximaal?

- getal 1: x
getal 2: 20 - x

- f(x) = x · (20 - x)
f(x) = -x² + 20x

- p = -b / 2a = -20 / (2 · (-1)) = 10

q = f(10) = -10² + 20 · 10
= -100 + 200
= 100

Antwoord: Het maximale product is 100 als beide getallen 10 zijn.

[Afbeelding: Icoon van drie pepers onderaan rechts.]

39

--- PAGE 40 ---
**37** In een park staat een fontein waarvan de waterstralen 3 verschillende vormen hebben. De weg van elke waterstraal kan beschreven worden met de grafiek van een tweedegraadsfunctie.
f1(d) = -d² + 1,5
f2(d) = -3d² + 6
f3(d) = -5d² + 7,5
a) Van welke waterstraal komt het water het verst?
b) Van welke waterstraal komt het water het hoogst?

[Afbeelding: Foto van een fontein in een park bij nacht met verschillende waterstralen in parabolische vormen, verlicht door lampen.]

a) 
- f1(d) = 0 = -d² + 1,5
d = √1,5 of d = -√1,5
- f2(d) = 0 = -3d² + 6
d² = 2
d = √2 of d = -√2
- f3(d) = 0 = -5d² + 7,5
d² = 7,5 / 5
d² = 1,5
d = √1,5 of d = -√1,5

Antwoord: Van de waterstraal beschreven door f2 komt het water het verst.

b) 
- f1(d) = -d² + 1,5
q = 1,5
De top van de parabool is (0; 1,5).
- f2(d) = -3d² + 6
q = 6
De top van de parabool is (0, 6).
- f3(d) = -5d² + 7,5
q = 7,5
De top van de parabool is (0; 7,5).

Antwoord: Van de waterstraal beschreven door f3 komt het water het hoogst.

[Afbeelding: Icoon van drie pepers onderaan rechts.]

40

--- PAGE 41 ---
**38** Van 2 schalen op tafel kan de doorsnede beschreven worden met de grafiek van een tweedegraadsfunctie. De doorsnede komt telkens overeen met het gedeelte onder de x-as van de grafiek van de volgende functies.
Schaal 1: f(x) = 1/81(x - 18)² - 4
Schaal 2: g(x) = 2/75x² - 4/5x

a) Welke schaal is het diepst?
b) Welke schaal heeft de grootste diameter?

[Afbeelding: Foto van 2 donkere schalen op een houten tafel, vol met gezonde voeding (fruit, bessen, havermout).]

a) 
- f(x) = 1/81(x - 18)² - 4
p = 18 en q = -4
De top van de parabool is (18, -4).

- g(x) = 2/75x² - 4/5x
p = -b / 2a = -(-4/5) / (2 · (2/75)) = (4/5) / (4/75) = 15
q = (-b² + 4ac) / 4a = (-( -4/5 )² + 4 · 2/75 · 0) / (4 · 2/75)
= (-16/25) / (8/75)
= -6
g(x) = a(x - 15)² - 6
g(x) = 2/75(x - 15)² - 6

De top van de parabool is (15, -6).

Antwoord: Schaal 2 is het diepst.

b) 
- f(x) = 1/81(x - 18)² - 4
De parabool gaat door de oorsprong (0, 0) en de top is (18, -4). Dus de parabool snijdt de x-as ook nog in het punt (36, 0).

- g(x) = 2/75(x - 15)² - 6
De parabool gaat door de oorsprong (0, 0) en de top is (15, -6). Dus de parabool snijdt de x-as ook nog in het punt (30, 0).

Antwoord: Schaal 1 heeft de grootste diameter.

[Afbeelding: Icoon van drie pepers onderaan rechts.]

41

--- PAGE 42 ---
**39** Het verschil van twee getallen is 30. Voor welke getallen is het product minimaal?

- getal 1: x
getal 2: x + 30

- f(x) = x · (x + 30)
f(x) = x² + 30x

- p = -b / 2a = -30 / 2 = -15

q = f(-15) = (-15)² + 30 · (-15)
= 225 - 450
= -225

Antwoord: Het minimale product is -225 als de getallen 15 en -15 zijn.

[Afbeelding: Icoon van drie pepers onderaan rechts.]

**40** Uit een onderzoek blijkt dat de opbrengst van duizenden kilogram groenten afhangt van de hoeveelheid gebruikte mest per hectare (in ton). Het verband kan beschreven worden met de functie f met voorschrift f(x) = 1 + 1,08x - 0,3x².
Hoeveel kunstmest per hectare moet er gebruikt worden om de opbrengst te maximaliseren?

[Afbeelding: Foto van een tractor met giertank die mest spuit over een veld.]

f(x) = -0,3x² + 1,08x + 1
p = -b / 2a = -1,08 / (2 · (-0,3)) = 1,8
q = f(1,8) = -0,3 · 1,8² + 1,08 · 1,8 + 1
= -0,972 + 1,944 + 1
= 1,972

Antwoord: De opbrengst is maximaal als er 1,8 ton mest per hectare wordt gebruikt.

[Afbeelding: Icoon van drie pepers onderaan rechts.]

42

--- PAGE 43 ---
**41** Via een website kun je T-shirts voor het goede doel kopen. Er worden op deze site maandelijks 100 T-shirts verkocht voor een prijs van 20 euro per stuk. Uit onderzoek blijkt dat telkens men het T-shirt 1 euro goedkoper zou maken, men 10 T-shirts meer zou verkopen.
a) Stel een functievoorschrift op dat de totale inkomsten uitdrukt in functie van de toegekende vermindering van 1 euro.
b) In welke situatie zijn de inkomsten maximaal?

a) 
- prijs per T-shirt: 20 - x
aantal verkochte T-shirts: 100 + 10x
- f(x) = (20 - x)(100 + 10x)
f(x) = 2000 + 200x - 100x - 10x²
f(x) = -10x² + 100x + 2000

b) 
- p = -b / 2a = -100 / (2 · (-10)) = 100 / 20 = 5
q = f(5) = -10 · 5² + 100 · 5 + 2000
= -250 + 500 + 2000
= 2250
- 20 - x = 20 - 5 = 15
100 + 10x = 100 + 10 · 5 = 150

Antwoord: De inkomsten zijn maximaal als de T-shirts voor 15 euro per stuk verkocht worden, dan worden er 150 T-shirts verkocht.

[Afbeelding: Icoon van drie pepers onderaan rechts.]

**42** Je hebt een omheining van 300 m. Hiermee wil je een zo groot mogelijk rechthoekig stuk grond afzetten. Wat zijn de afmetingen van dat stuk grond?

- breedte: x
lengte: 150 - x
- A(x) = x · (150 - x)
A(x) = -x² + 150x
- p = -b / 2a = -150 / (2 · (-1)) = 75
q = A(75) = -75² + 150 · 75
= -5625 + 11 250
= 5625

Antwoord: De oppervlakte van het stuk grond is maximaal 5625 m², als zowel de lengte als de breedte 75 m is.

[Afbeelding: Icoon van drie pepers onderaan rechts.]

43

--- PAGE 44 ---
**43** Van een rechthoek ligt een hoekpunt in de oorsprong en een hoekpunt op de rechte a met vergelijking y = -2x + 6. Voor welke lengte en breedte is de oppervlakte maximaal als de rechthoek in het eerste kwadrant moet liggen?

[Afbeelding: Assenstelsel met een dalende rechte y = -2x + 6. Er is een rechthoek in het eerste kwadrant getekend, met 1 hoekpunt in de oorsprong (0,0), 1 punt op de x-as bij x=1,5 , 1 hoekpunt op de y-as bij y=3 en 1 hoekpunt dat de rechte a raakt op het punt (1,5; 3).]

- lengte: x
breedte: -2x + 6
- A(x) = x · (-2x + 6)
A(x) = -2x² + 6x
- p = -b / 2a = -6 / (2 · (-2)) = 1,5
q = A(1,5) = -2 · (1,5)² + 6 · 1,5
= -2 · 2,25 + 9
= 4,5
- x = 1,5
-2x + 6 = -2 · 1,5 + 6
= -3 + 6
= 3

Antwoord: De oppervlakte is maximaal bij een lengte van 1,5 en een breedte van 3.

[Afbeelding: Icoon van vier pepers onderaan rechts.]

44

--- PAGE 45 ---
**44** Een tuinarchitect legt een parallellogramvormig grasperk aan in een rechthoekige tuin van 17 m bij 7 m. Hij bepaalt een afstand x op elke zijkant en plaatst daar de hoekpunten van het grasperk. De resterende grond wordt beplant met bloemen. Voor welke afstand x is de oppervlakte van de bloembedden zo groot mogelijk?

[Afbeelding: Een rechthoek (bruine omranding, tuinoppervlak) met daarin een groene parallellogram (grasperk). De hoekpunten van de parallellogram liggen op de zijden van de rechthoek, waarbij steeds een afstand x (in blauw) tot aan het dichtstbijzijnde hoekpunt van de rechthoek is opengestaan.]

- A(x) = 2 · (x · (17 - x) / 2 + x · (7 - x) / 2)
= -x² + 17x - x² + 7x
= -2x² + 24x

- p = -b / 2a = -24 / (2 · (-2)) = 6
q = A(6) = -2 · 6² + 24 · 6
= -2 · 36 + 144
= -72 + 144
= 72

Antwoord: De oppervlakte van de bloembedden is maximaal, 72 m², als x 6 m is.

[Afbeelding: Icoon van vier pepers onderaan rechts.]

**45** Voor welke waarde van x bereikt f met voorschrift f(x) = 1 / (-x² + 4x - 7) een extremum?
Is dit een minimum of een maximum? Maak gebruik van ICT.

[Afbeelding: Icoon van een processor (Computationeel denken)]

De functie bereikt een minimum in het punt (2, -1/3).

[Afbeelding: Icoon van vijf pepers onderaan rechts.]

45

--- PAGE 46 ---
[Afbeelding: Icoon van een processor]
# Computationeel denken

**De top van de grafiek van een tweedegraadsfunctie**

Hieronder vind je een stuk code om te bepalen wat de coördinaat van de top van de grafiek van een gegeven tweedegraadsfunctie f is:

[Afbeelding: Python logo icoon links van codeblok]
```python
1  a = float(input("Voer de coëfficiënt van x² in: "))
2  b = float(input("Voer de coëfficiënt van x in: "))
3  c = float(input("Voer de term zonder x in: "))
4
5  p = (-b)/(2*a)
6  q = (-b**2+4*a*c)/(4*a)
7
8  print("De coördinaat van de top van de grafiek van f is: T(",p,";",q,")")
```

**Begrijp je de code?**

a) Verklaar waarom er op lijn 5 en 6 haakjes worden gebruikt in zowel de teller als de noemer.
Zonder de haakjes zal de berekening van links naar rechts gebeuren. Er wordt geen rekening gehouden met teller en noemer.

b) Wat betekent `-b**2`?
`**` staat in de code voor exponent.

**Pas de code aan.**

a) Wijzig de code zodat q berekend wordt door gebruik te maken van het functievoorschrift in plaats van de formule voor q.

```python
1  a = float(input("Voer de coëfficiënt van x² in: "))
2  b = float(input("Voer de coëfficiënt van x in: "))
3  c = float(input("Voer de term zonder x in: "))
4
5  p = (-b)/(2*a)
6  q = a*p**2+b*p+c
7
8  print("De coördinaat van de top van de grafiek van f is: T(",p,";",q,")")
```

46

--- PAGE 47 ---
b) Schrijf extra code zodat er een extra uitvoer komt waarbij er wordt bepaald of er een minimum of maximum is. Bijvoorbeeld: "Het minimum wordt bereikt in -3."

```python
1  a = float(input("Voer de coëfficiënt van x² in: "))
2  b = float(input("Voer de coëfficiënt van x in: "))
3  c = float(input("Voer de term zonder x in: "))
4
5  p = (-b)/(2*a)
6  q = (-b**2+4*a*c)/(4*a)
7
8  print("De coördinaat van de top van de grafiek van f is: T(",p,";",q,")")
9
10 if a>=0:
11     print("Het minimum wordt bereikt in",p,".")
12 if a<0:
13     print("Het maximum wordt bereikt in",p,".")
```

c) Schrijf extra code zodat je ook de vergelijking krijgt van de symmetrieas van de grafiek van de functie.

```python
1  a = float(input("Voer de coëfficiënt van x² in: "))
2  b = float(input("Voer de coëfficiënt van x in: "))
3  c = float(input("Voer de term zonder x in: "))
4
5  p = (-b)/(2*a)
6  q = (-b**2+4*a*c)/(4*a)
7
8  print("De coördinaat van de top van de grafiek van f is: T(",p,";",q,")")
9
10 print("De symmetrieas van de grafiek van de functie is x=",p,".")
```

d) Wijzig de code zodat we enkel uitvoer krijgen als a ≠ 0.

```python
1  a = float(input("Voer de coëfficiënt van x² in: "))
2  b = float(input("Voer de coëfficiënt van x in: "))
3  c = float(input("Voer de term zonder x in: "))
4
5  if a != 0:
6      p = (-b)/(2*a)
7      q = (-b**2+4*a*c)/(4*a)
8      print("De coördinaat van de top van de grafiek van f is: T(",p,";",q,")")
9  if a == 0:
10     print("De ingevoerde waarden behoren niet tot de grafiek van een tweedegraadsfunctie.")
```

47

--- PAGE 48 ---
[Afbeelding: Logo van die Keure educatief links]

**Auteurs** Philip Bogaert, Björn Carreyn en Roger Van Nieuwenhuyze
**Tweede editie - Bestelnummer** 94 606 0119 (module 05 van 18)
**ISBN** 978 90 4864 973 0 - **KB** D/2024/0147/206 - **NUR** 126/128/129 - **Thema** YPMF
**Illustrator** Jona Jamart - **Design en lay-out** die Keure
**Verantwoordelijke uitgever** die Keure, Kleine Pathoekeweg 3, 8000 Brugge
RPR 0405 108 325 - © Copyright die Keure, Brugge

[Afbeelding: Logo van FSC (Forest Stewardship Council) met de tekst MIX, Papier, FSC C009115 rechts]
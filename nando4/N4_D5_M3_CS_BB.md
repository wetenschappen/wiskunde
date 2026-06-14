--- PAGE 1 ---

[Afbeelding: Cover met de titel Nando 4 en een kleurrijke abstracte vogel. Het logo van 'die Keure educatief' staat in de rechterbovenhoek. Een grote rode stempel met 'CORRECTIESLEUTEL' staat schuin over een foto van een modern gebouw met een opvallende architectuur, waarschijnlijk een treinstation of brug over een snelweg. Onderaan staat een rode balk.]

D-FINALITEIT 5 UUR – ALGEBRA EN FUNCTIELEER
# 03 Functies van de tweede graad

**Inhoud**
Instap
1 Functies van de tweede graad
2 De grafiek van f(x) = ax²
3 De grafiek van f(x) = (x - p)²
4 De grafiek van f(x) = x² + q
5 De grafiek van f(x) = a(x - p)² + q
Signaaloefeningen
Differentiatietraject
Computationeel denken
Studiewijzer

### WAT JE AL KUNT
– een voorschrift van een functie van de eerste graad herkennen
– de grafiek van een functie van de eerste graad tekenen
– de nulwaarde van een eerstegraadsfunctie berekenen en bepalen
– de tekentabel, het stijgen/dalen van een functie van de eerste graad geven

### WAT JE LEERT IN DEZE MODULE
– een voorschrift van een functie van de tweede graad herkennen
– de grafiek van een tweedegraadsfunctie tekenen
– de grafiek van een tweedegraadsfunctie opbouwen
– de nulwaarden en het extremum bepalen
– de tekentabel en het stijgen/dalen van een functie van de tweede graad geven

### IN DE KIJKER
Je gebruikt ICT om verbanden te visualiseren en redeneringen te controleren.

### WISKUNDETAAL
– tweedegraadsfunctie
– kwadratische functie
– parabool
– dalparabool
– bergparabool
– extreme waarde(n)
– minimum
– maximum
– top
– symmetrieas
– tekentabel
– verloop (stijgen en dalen)

--- PAGE 2 ---

# Instap

## Opdracht 1

Een functie is een verband tussen twee veranderlijken x en y, waarbij voor elke waarde van x er hoogstens één y-waarde bestaat. Welke van onderstaande grafieken stelt een functie voor? Omcirkel het passende antwoord.

[Afbeelding: Assenstelsel met een bloemvormige rode curve (4 bloembladen).]
FUNCTIE
[GEEN FUNCTIE] (omcirkeld)

[Afbeelding: Assenstelsel met een rode curve in de vorm van een V met de top op (0,0).]
[FUNCTIE] (omcirkeld)
GEEN FUNCTIE

[Afbeelding: Assenstelsel met een kronkelende rode curve die verticaal lijkt te slingeren (een sinusachtige golf maar dan geroteerd 90 graden).]
FUNCTIE
[GEEN FUNCTIE] (omcirkeld)

[Afbeelding: Assenstelsel met een schuine rode rechte lijn door de oorsprong.]
[FUNCTIE] (omcirkeld)
GEEN FUNCTIE

## Opdracht 2

Gegeven: de grafiek van de functie f met voorschrift f(x) = 4x - 3

a) Bepaal of bereken de volgende functiewaarden.
f(1) = 4 · 1 - 3 = 1
f(-1) = 4 · (-1) - 3 = -7

b) Duid op de grafiek het nulpunt aan.

c) Bereken de nulwaarde.
4x - 3 = 0
4x = 3
x = 3/4

d) Stel de tekentabel op.

| x | | 3/4 | |
|---|---|---|---|
| f(x) | - | 0 | + |

e) Vink de juiste uitspraken aan.
[ ] Het plusteken in de tekentabel betekent dat de functiewaarde voor positieve x-waarden werd berekend.
[x] Het plusteken in de tekentabel betekent dat, voor deze x-waarden, de functiewaarde positief is.
[x] Het plusteken in de tekentabel betekent dat, voor deze x-waarden, de grafiek van de functie boven de x-as ligt.
[ ] Het plusteken in de tekentabel betekent dat, voor deze x-waarden, de grafiek stijgend verloopt.

[Afbeelding: Grafiek van de functie y = 4x - 3, een stijgende rechte lijn door (0, -3) en (0.75, 0). Het nulpunt (0.75, 0) is aangeduid.]

--- PAGE 3 ---

## Opdracht 3

Bij deze symmetrische schaal kan de doorsnede met top in (0, 0) beschreven worden door de tweedegraadsfunctie f met voorschrift f(x) = (1/18)x².

a) Wat is hier een zinvol domein?
dom f = [-15; 15]

b) Wat betekenen negatieve x-waarden hier?
Het horizontaal verschil tussen de top en plaats van de doorsnede aan de linkerkant van de schaal.

c) Bereken de diepte van deze schaal. Controleer met ICT.
Het hoogste punt bevindt zich horizontaal op 15 cm van de top. Je kan zowel f(15) als f(-15) berekenen (symmetrie t.o.v. de top):

f(x) = (1/18) · 15²
= 225 / 18
= 12,5

Antwoord: Deze schaal is 12,5 cm diep.

d) De schaal is egaal met kaarsvet gevuld tot op een hoogte van 8 cm. Bereken de diameter van het egale oppervlak. Controleer met ICT.
We berekenen f(x) = 8 en zullen twee oplossingen verkrijgen:

(1/18) · x² = 8
x² = 8 · 18
x1 = 12 en x2 = -12

e) Waar of niet waar? Omcirkel.
“Bij de situatie van vraag d) is de schaal voor ongeveer 2/3 met kaarsvet gevuld.” WAAR / [NIET WAAR] (omcirkeld)

[Afbeelding: Een driedimensionale voorstelling van een schaal als een omwentelingsparaboloïde. Een tweedimensionale doorsnede in een assenstelsel (y=f(x)) is in het rood getekend. De totale breedte bovenaan is 30 cm. De diepte is aangeduid met '?'.]

--- PAGE 4 ---

# 1 Functies van de tweede graad

## 1.1 Wat is een functie van de tweede graad?

**definitie**
Een **functie van de tweede graad** is een functie f met voorschrift f(x) = ax² + bx + c waarbij a, b en c reële getallen zijn en a verschillend is van nul.

**Voorbeelden**
f(x) = 3x² - 4x + 2
g(x) = -0,2x² + 1
h(x) = √2x² - (1/2)x
p(x) = (6x - x²) / 5

**Merk op**
• Een functie van de tweede graad noemen we ook wel **tweedegraadsfunctie** of **kwadratische functie**.
• In de definitie staat er dat a verschillend is van 0. Dat is noodzakelijk, anders valt de term met x² weg en zou je geen voorschrift van een tweedegraadsfunctie hebben.
• Als het functievoorschrift niet kan geschreven worden in de vorm f(x) = ax² + bx + c, dan is het geen tweedegraadsfunctie.

f(x) = 3 / x² is geen voorschrift van een tweedegraadsfunctie.

g(x) = (x² - 5x + 1) / (4x + 2) is geen voorschrift van een tweedegraadsfunctie.

h(x) = (3x - 1) · (x + 2) is een voorschrift van een tweedegraadsfunctie.
Je kan de distributiviteit gebruiken om het voorschrift om te vormen.
h(x) = (3x - 1)(x + 2)
h(x) = 3x² + 6x - x - 2
h(x) = 3x² + 5x - 2

[Afbeelding: Een cartoon van een kok die met een koekenpan rode chilipepers omhoog gooit in de vorm van een parabool. Een van de pepers belandt op een pizza.]

--- PAGE 5 ---

## 1.2 De grafiek van een tweedegraadsfunctie tekenen

Bij het tekenen van de grafiek van een eerstegraadsfunctie had je voldoende aan het kennen van twee punten die tot de grafiek van de functie behoren. De grafiek is immers een rechte. Om de grafiek van een tweedegraadsfunctie te tekenen, bereken je best veel meer functiewaarden. We spreken af minstens 5.

**Voorbeeld:** functie f met voorschrift f(x) = x² - 4x + 3

| x | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4 | 4,5 | 5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f(x) | 8 | 5,25 | 3 | 1,25 | 0 | -0,75 | -1 | -0,75 | 0 | 1,25 | 3 | 5,25 | 8 |

• We kunnen voor alle reële x-waarden de functiewaarde berekenen.
dom f = R
• We stellen vast dat de functiewaarden niet alle reële y-waarden bereiken.
ber f = [-1, +∞[
• De grafiek van een tweedegraadsfunctie noemen we een **parabool**. De grafiek van de functie f snijdt de x-as in 1 en 3. Er zijn twee **nulwaarden**.
• Op basis van de grafiek kun je een **tekentabel** opstellen.

| x | | 1 | | 3 | |
|---|---|---|---|---|---|
| f(x) | + | 0 | - | 0 | + |

grafische betekenis:
+ : Voor deze x-waarden ligt de grafiek van f boven de x-as.
0 : Je noteert een nul onder de nulwaarde.
In de x-waarde snijdt (of raakt) de grafiek van f de x-as.
- : Voor deze x-waarden ligt de grafiek van f onder de x-as.

• Ook het **verloop** van de functie kunnen we in een tabel weergeven.

| x | | 2 | |
|---|---|---|---|
| f(x) | ↘ | -1 | ↗ |

• Het hoogste (of laagste) punt van de grafiek noemen we de **top**. Hier kunnen we de top aflezen: T(2, -1)
De grafiek is symmetrisch opgebouwd. Als je kijkt naar de top van de grafiek van de functie kun je de vergelijking van de symmetrieas vinden. De grafiek is symmetrisch ten opzichte van de as met vergelijking **x = 2**.

[Afbeelding: Grafiek van de functie y = x² - 4x + 3. Een dalparabool met nulpunten in x=1 en x=3 en top in T(2, -1). De symmetrieas x=2 is aangeduid met een blauwe stippellijn.]

**Merk op**
• We kunnen de nulwaarden niet altijd exact aflezen. In een andere module zullen we leren hoe we die exact kunnen bepalen.
• We kunnen gebruik maken van de symmetrie om bepaalde functiewaarden te vinden.
• Grafieken tekenen we meestal met behulp van ICT.
• De grafiek van een tweedegraadsfunctie heeft niet altijd twee snijpunten met de x-as. De grafiek kan de x-as ook raken in de top of helemaal geen snijpunten hebben.

--- PAGE 6 ---

# Verwerkingsopdrachten

**1** Kleur de functievoorschriften die voorschriften zijn van een functie van de tweede graad.

[De volgende drie vakjes zijn roze gekleurd in de originele afbeelding:]
f(x) = -3x² + 4x - 1
h(x) = (7x² + 5) / 2
q(x) = -4(x - 1)(2x - 5)

[De volgende drie vakjes zijn niet gekleurd (wit):]
g(x) = (x + 3)(x² + 5x - 10)
p(x) = √3x² + 9x - 1
r(x) = -1 / x²

**2** Van de tweedegraadsfunctie f werden een aantal punten getekend in een assenstelsel.
De top van de grafiek van de functie is T(-1, 0).

a) Teken de grafiek van deze functie in het gegeven assenstelsel.
[Afbeelding: Een assenstelsel met een rode getekende parabool (dalparabool) door de punten (-4, 9), (-3, 4), (-2, 1), (-1, 0), (0, 1), (1, 4) en (2, 9). De top is (-1, 0).]

b) Bepaal de vergelijking van de symmetrieas van de grafiek van deze functie.
x = -1

c) Bepaal de nulwaarde(n).
De grafiek raakt de x-as in het punt met coördinaat (-1, 0). De nulwaarde is -1.

--- PAGE 7 ---

**3** Beantwoord de volgende vragen aan de hand van de grafiek van de tweedegraadsfunctie f.

[Afbeelding: Een assenstelsel met een oranje bergparabool. De top ligt in T(2, 3). De parabool snijdt de x-as in x=-5 en x=9. Andere afleesbare punten zijn o.a. (-2, 0), (0, 2), (4, 2), (6, 0).]

a) Bepaal het domein van deze functie f.
dom f = R

b) Bepaal het bereik van deze functie f.
ber f = ]-∞, 3]

c) Geef de vergelijking van de symmetrieas van de grafiek van deze functie.
x = 2

d) Stel de tekentabel op voor deze functie.

| x | | -5 | | 9 | |
|---|---|---|---|---|---|
| f(x) | - | 0 | + | 0 | - |

[Afbeelding links: Foto van een modern wit gebouw met golvende paraboolachtige boogstructuren.]
[Afbeelding rechts: Foto van de Golden Gate Bridge (een hangbrug) in San Francisco, waarvan de hoofdkabel de vorm van een parabool aanneemt.]

--- PAGE 8 ---

**4** Een auto heeft na 50 meter een snelheid van 10 m/s. De bestuurder versnelt daarna gedurende 5 seconden gelijkmatig naar 4 m/s².

[Afbeelding: Een rode auto rijdt op een weg, met stadssilhouet op de achtergrond. Een pijl geeft de 'afgelegde weg (x) in m' aan.]

Hieronder zie je drie grafieken die horen bij deze context.

[Afbeelding 1: Grafiek versnelling (a) in m/s² in functie van de tijd (t) in seconden. Het is een horizontale oranje lijn op y = 4 (van t=0 tot t=5).]
[Afbeelding 2: Grafiek snelheid (v) in m/s in functie van de tijd (t) in seconden. Het is een stijgende blauwe rechte lijn van (0, 10) naar (5, 30).]
[Afbeelding 3: Grafiek afgelegde weg (x) in meter in functie van de tijd (t) in seconden. Het is een stijgende groene curve (paraboolgedeelte) beginnend in (0, 50) en eindigend op t=5 bij x=150.]

constante functie | eerstegraadsfunctie | tweedegraadsfunctie
---|---|---
a(t) = 4 | v(t) = 10 + 4t | x(t) = 2t² + 10t + 50

a) Wat is het werkdomein voor deze context? dom f = [0; 5]

b) Er werd voor het werkdomein telkens een deel van een grafiek van een functie getekend. Plaats de juiste naam van die functie onder de grafiek.
[Ingeschreven bij de grafieken, zie tabel hierboven]

c) Plaats het functievoorschrift onder elke grafiek.
t: tijd in seconden; a: versnelling in m/s²; v: snelheid in m/s en x: afstand in m
[Ingeschreven bij de grafieken, zie tabel hierboven]

d) Welke snelheid (v) heeft de auto na 3 seconden?
v(3) = 10 + 4 · 3
= 10 + 12
= 22
Antwoord: Na 3 seconden heeft de auto een snelheid van 22 m/s.

e) Wat is de afgelegde weg (x) na 3 seconden?
a(3) = 2 · 3² + 10 · 3 + 50
= 18 + 30 + 50
= 98
Antwoord: De auto bevindt zich op 98 meter van zijn startpunt, er werd in drie seconden 48 meter afgelegd.

--- PAGE 9 ---

# 2 De grafiek van f(x) = ax² (met a ∈ R0)

## 2.1 De elementaire tweedegraadsfunctie f met voorschrift f(x) = x²

Om de grafiek op papier te tekenen, berekenen we van een aantal punten de coördinaatgetallen. Als je weet waar de top van de grafiek van de tweedegraadsfunctie ligt, kun je gebruik maken van symmetrie.

| x | -3 | -2,5 | -2 | -1,5 | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f(x) | 9 | 6,25 | 4 | 2,25 | 1 | 0,25 | 0 | 0,25 | 1 | 2,25 | 4 | 6,25 | 9 |

Met ICT kun je de punten in een assenstelsel plaatsen. Tik je het voorschrift van de functie in, dan wordt de grafiek volledig getekend. Je stelt vast dat de punten op de grafiek liggen.

[Afbeelding: Grafiek van y = f(x) = x². Een rode dalparabool met de top in (0,0). Punten (-3,9), (-2,4), (-1,1), (0,0), (1,1), (2,4) en (3,9) zijn aangeduid.]

De grafiek van de functie f met voorschrift f(x) = x² heeft de volgende kenmerken:
• Het domein van de functie f: dom f = R
• Het bereik van de functie f: ber f = [0, +∞[
• nulwaarde: 0
• tekentabel:

| x | 0 |
|---|---|
| f(x) | + | 0 | + |

• Extreme waarde(n) (minimum of maximum):
Het minimum is 0. Deze functiewaarde wordt bereikt bij x-waarde 0.
De coördinaat van de top is T(0, 0).

• Het verloop (stijgen/dalen):

| x | | 0 | |
|---|---|---|---|
| f(x) | ↘ | 0 | ↗ |

• De symmetrieas van de grafiek heeft als vergelijking x = 0. In dit geval is de symmetrieas de y-as.
f(1) = f(-1), f(2) = f(-2), f(3) = f(-3) …
We stellen vast dat voor deze functie f(x) = f(-x)

**TIP**
R: de verzameling van de reële getallen
∞: oneindig

--- PAGE 10 ---

## 2.2 De grafiek van f(x) = a · x² (met a ∈ R0)

**Situatie A: a is strikt positief (a > 0)**

f1(x) = x² | f2(x) = 2x² | f3(x) = 5x²
---|---|---
[Afbeelding: dalparabool y=x²] | [Afbeelding: y=x² (stippellijn) en y=2x² (smalle dalparabool rood)] | [Afbeelding: y=x² (stippellijn) en y=5x² (nog smallere dalparabool rood)]

| x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f1(x) | 4 | 1 | 0 | 1 | 4 | f2(x) | 8 | 2 | 0 | 2 | 8 | f3(x) | 20 | 5 | 0 | 5 | 20 |

f4(x) = 0,6x² | f5(x) = 0,3x² | f6(x) = 0,1x²
---|---|---
[Afbeelding: y=x² (stippellijn) en y=0,6x² (brede dalparabool rood)] | [Afbeelding: y=x² (stippellijn) en y=0,3x² (bredere dalparabool rood)] | [Afbeelding: y=x² (stippellijn) en y=0,1x² (zeer brede dalparabool rood)]

| x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f4(x) | 2,4 | 0,6 | 0 | 0,6 | 2,4 | f5(x) | 1,2 | 0,3 | 0 | 0,3 | 1,2 | f6(x) | 0,4 | 0,1 | 0 | 0,1 | 0,4 |

De opening van de parabool varieert, afhankelijk van de openingscoëfficiënt a.
• Als a > 0 is de grafiek van de functie een **dalparabool**.
• Hoe groter a, hoe **smaller** de parabool.
• Voor dezelfde x-waarden krijgen we immers functiewaarden die a keer groter zijn.
• Om de grafiek van g(x) = ax² te verkrijgen, wordt de grafiek van f(x) = x² uitgerokken volgens de y-as met factor a.
• Bij dit soort grafieken kun je a snel aflezen op de grafiek van de functie. Bij f(x) = ax² is f(1) = a · 1² = a

[Afbeelding: Grafiek met y = 2x² aangeduid. Punt (1, 2) ligt op de parabool, wat aantoont dat a=2.]

--- PAGE 11 ---

De grafiek van de functie f met voorschrift f(x) = ax² en a > 0 heeft de volgende kenmerken:
• De grafiek is een dalparabool omdat a > 0.
• Het domein van de functie f: dom f = R
• Het bereik van de functie f: ber f = [0, +∞[
• Extreme waarde(n) (minimum of maximum):
Het minimum is 0. Deze functiewaarde wordt bereikt bij x-waarde 0.
De coördinaat van de top is T(0, 0).
• Het verloop (stijgen/dalen):

| x | | 0 | |
|---|---|---|---|
| f(x) | ↘ | 0 | ↗ |

• De symmetrieas van de grafiek heeft als vergelijking x = 0. In dit geval is de symmetrieas de y-as.
f(1) = f(-1), f(2) = f(-2), f(3) = f(-3) …
We stellen vast dat voor deze functie f(x) = f(-x)

**Situatie B: a is strikt negatief (a < 0)**

f1(x) = -x² | f2(x) = -4x² | f3(x) = -7x²
---|---|---
[Afbeelding: y=x² (stippellijn boven x-as) en y=-x² (bergparabool rood)] | [Afbeelding: y=x² (stippellijn) en y=-4x² (smalle bergparabool rood)] | [Afbeelding: y=x² (stippellijn) en y=-7x² (zeer smalle bergparabool rood)]

| x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f1(x) | -4 | -1 | 0 | -1 | -4 | f2(x) | -16 | -4 | 0 | -4 | -16 | f3(x) | -28 | -7 | 0 | -7 | -28 |

f4(x) = -0,6x² | f5(x) = -0,4x² | f6(x) = -0,2x²
---|---|---
[Afbeelding: y=x² (stippellijn) en y=-0,6x² (brede bergparabool rood)] | [Afbeelding: y=x² (stippellijn) en y=-0,4x² (bredere bergparabool rood)] | [Afbeelding: y=x² (stippellijn) en y=-0,2x² (zeer brede bergparabool rood)]

| x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f4(x) | -2,4 | -0,6 | 0 | -0,6 | -2,4 | f5(x) | -1,6 | -0,4 | 0 | -0,4 | -1,6 | f6(x) | -0,8 | -0,2 | 0 | -0,2 | -0,8 |

--- PAGE 12 ---

De opening van de parabool varieert, afhankelijk van de openingscoëfficiënt a.
• Als a < 0 is de grafiek van de functie een **bergparabool**.
• De opening van de parabool varieert. Hoe groter |a|, hoe smaller de parabool.
• Om de grafiek van g(x) = ax² (met a < 0) te verkrijgen, spiegel je de grafiek van f(x) = -ax² ten opzichte van de x-as. De grafieken van g en f liggen symmetrisch ten opzichte van de x-as.
• Bij dit soort grafieken kun je a snel aflezen op de grafiek van de functie. Bij f(x) = ax² is f(1) = a · 1² = a

[Afbeelding: Assenstelsel met de bergparabool y = -3x². Punt (1, -3) toont a = -3.]

De grafiek van de functie f met voorschrift f(x) = ax² en a < 0 heeft de volgende kenmerken:
• De grafiek is een bergparabool omdat a < 0.
• Het domein van de functie f: dom f = R
• Het bereik van de functie f: ber f = ]-∞, 0]
• Extreme waarde(n) (minimum of maximum):
Het maximum is 0. Deze functiewaarde wordt bereikt bij x-waarde 0.
De coördinaat van de top is T(0, 0).
• Het verloop (stijgen/dalen):

| x | | 0 | |
|---|---|---|---|
| f(x) | ↗ | 0 | ↘ |

• De symmetrieas van de grafiek heeft als vergelijking x = 0. In dit geval is de symmetrieas de y-as.
f(1) = f(-1), f(2) = f(-2), f(3) = f(-3) …
We stellen vast dat voor deze functie f(x) = f(-x)

[Afbeelding: Cartoon van twee rode chilipepers die ontspannen liggen.]

--- PAGE 13 ---

# Verwerkingsopdrachten

**5** Gegeven:
f1(x) = -1,4x²
f2(x) = √2x²
f3(x) = (2/3)x²
f4(x) = -(3/2)x²
f5(x) = 0,6x²
f6(x) = -(3/5)x²

a) Van welke functies is de grafiek een dalparabool? f2, f3, f5
b) Welke functie heeft de smalste parabool? f4
c) Welke functie heeft de breedste parabool? f5 en f6
d) Van welke functies zijn de grafieken even smal? f5 en f6
e) Geef een voorschrift van een tweedegraadsfunctie g zodat de grafiek van deze functie een bergparabool is die smaller is dan de grafiek van de functie f5.
Bv. g(x) = -3x²

**6**
a) Bepaal het functievoorschrift van de getekende tweedegraadsfunctie f.
f(x) = 1,5x²

b) Teken in het gegeven assenstelsel de grafiek van de tweedegraadsfunctie g met voorschrift g(x) = -0,5x².

| x | g(x) |
|---|---|
| -3 | -4,5 |
| -2 | -2 |
| -1 | -0,5 |
| 0 | 0 |
| 1 | -0,5 |
| 2 | -2 |
| 3 | -4,5 |

[Afbeelding: Assenstelsel met oranje dalparabool y=f(x) en een nieuw te tekenen roze bergparabool y=g(x). De punten uit de tabel zijn verbonden in de roze parabool.]

c) Vervolledig de waardentabel zonder de functiewaarden uit te rekenen.

| x | -1,3 | -0,6 | -0,2 | 0,2 | 0,6 | 1,3 |
|---|---|---|---|---|---|---|
| g(x) | -0,845 | -0,18 | -0,02 | -0,02 | -0,18 | -0,845 |

--- PAGE 14 ---

# 3 De grafiek van f(x) = (x - p)²

f1(x) = x² | f2(x) = (x + 3)² | f3(x) = (x - 1)²
---|---|---
[Afbeelding: y=x² dalparabool in oorsprong] | [Afbeelding: y=(x+3)² dalparabool verschoven naar links, top (-3,0). y=x² is stippellijn] | [Afbeelding: y=(x-1)² dalparabool verschoven naar rechts, top (1,0). y=x² is stippellijn]

vaststelling: p = 0 | vaststelling: p = -3 | vaststelling: p = 1
| De grafiek is horizontaal 3 eenheden naar links verschoven. | De grafiek is horizontaal 1 eenheid naar rechts verschoven.

| x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f1(x) | 4 | 1 | 0 | 1 | 4 | f2(x) | 1 | 4 | 9 | 16 | 25 | f3(x) | 9 | 4 | 1 | 0 | 1 |

De grafiek van de functie f met voorschrift f(x) = (x - p)² heeft de volgende kenmerken:
• Het domein van de functie f: dom f = R
• Het bereik van de functie f: ber f = [0, +∞[
• Extreme waarde(n) (minimum of maximum):
Het minimum is 0. Deze functiewaarde wordt bereikt bij x-waarde p.
De coördinaat van de top is T(p, 0).
• Het verloop (stijgen/dalen):

| x | | p | |
|---|---|---|---|
| f(x) | ↘ | 0 | ↗ |

• De symmetrieas van de grafiek heeft als vergelijking x = p.
• De grafiek van functie f met voorschrift f(x) = (x - p)² is congruent met de grafiek van de functie g met voorschrift g(x) = x² en wordt verkregen door een horizontale verschuiving volgens de x-as.
Als p > 0, dan is het een horizontale verschuiving naar rechts met p eenheden.
Als p < 0, dan is het een horizontale verschuiving naar links met |p| eenheden.

**Merk op**
Bij tweedegraadsfuncties met een voorschrift van de vorm f(x) = (x - p)² is er één nulwaarde, namelijk p.
De grafiek raakt de x-as in p.

--- PAGE 15 ---

# Verwerkingsopdrachten

**7** Vink de juiste functievoorschriften aan die horen bij de grafiek van de functies.

[Afbeelding: Assenstelsel met 4 parabolen. Oranje stippellijn y=x² top in (0,0). Blauwe dalparabool y=f(x) top in (-8,0). Groene bergparabool y=g(x) top in (-2,0). Paarse dalparabool y=h(x) top in (7,0).]

[ ] f(x) = (x - 8)²
[x] f(x) = (x + 8)²
[ ] f(x) = -(x - 8)²
[ ] f(x) = -(x + 8)²

[ ] g(x) = (x - 2)²
[ ] g(x) = (x + 2)²
[ ] g(x) = -(x - 2)²
[x] g(x) = -(x + 2)²

[x] h(x) = (x - 7)²
[ ] h(x) = (x + 7)²
[ ] h(x) = -(x - 7)²
[ ] h(x) = -(x + 7)²

**8** De grafiek van de functie f met voorschrift f(x) = (x - 4)² is gegeven.

a) De grafiek van de functie g ontstaat door de grafiek van de functie f naar links te verschuiven met 5 eenheden. Teken deze grafiek in het gegeven assenstelsel.
[Afbeelding: Assenstelsel met groene dalparabool y=f(x) top (4,0). Een roze dalparabool y=g(x) met top (-1,0) is getekend. Een paarse bergparabool p(x)=-x² is eveneens zichtbaar met top (0,0).]

b) Bepaal het functievoorschrift van de functie g.
g(x) = (x + 1)²

c) Bepaal aan de hand van de tekentabel het functievoorschrift van de functie h als je weet dat de grafiek van de functie h ontstaat door de grafiek van de functie p met voorschrift p(x) = -x² horizontaal te verschuiven.

| x | | 1,5 | |
|---|---|---|---|
| h(x) | - | 0 | - |

h(x) = -(x - 1,5)²

d) Welke transformaties moet je uitvoeren met de grafiek y = x² om de grafiek van h(x) te verkrijgen?
spiegeling t.o.v. de x-as, horizontale verschuiving naar rechts met 1,5 eenheden

e) Teken de grafiek van de functie h in het gegeven assenstelsel.

| x | -0,5 | 0,5 | 1,5 | 2,5 | 3,5 |
|---|---|---|---|---|---|
| h(x) | -4 | -1 | 0 | -1 | -4 |

--- PAGE 16 ---

# 4 De grafiek van f(x) = x² + q

f1(x) = x² | f2(x) = x² + 2 | f3(x) = x² - 4
---|---|---
[Afbeelding: y=x² dalparabool top (0,0)] | [Afbeelding: y=x²+2 dalparabool top (0,2). y=x² als stippellijn] | [Afbeelding: y=x²-4 dalparabool top (0,-4). y=x² als stippellijn]

vaststelling: q = 0 | vaststelling: q = 2
De grafiek is verticaal 2 eenheden naar boven verschoven. | vaststelling: q = -4
De grafiek is verticaal 4 eenheden naar onder verschoven.

| x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 | x | -2 | -1 | 0 | 1 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f1(x) | 4 | 1 | 0 | 1 | 4 | f2(x) | 6 | 3 | 2 | 3 | 6 | f3(x) | 0 | -3 | -4 | -3 | 0 |

De grafiek van de functie f met voorschrift f(x) = x² + q heeft de volgende kenmerken:
• Het domein van de functie f: dom f = R
• Het bereik van de functie f: ber f = [q, +∞[
• Extreme waarde(n) (minimum of maximum):
Het minimum is q. Deze functiewaarde wordt bereikt bij x-waarde 0.
De coördinaat van de top is T(0, q).
• Het verloop (stijgen/dalen):

| x | | 0 | |
|---|---|---|---|
| f(x) | ↘ | q | ↗ |

• De symmetrieas van de grafiek heeft als vergelijking x = 0.
• De grafiek van functie f met voorschrift f(x) = x² + q is congruent met de grafiek van de functie g met voorschrift g(x) = x² en wordt verkregen door een verticale verschuiving volgens de y-as.
Als q > 0, dan is het een verticale verschuiving naar boven met q eenheden.
Als q < 0, dan is het een verticale verschuiving naar onder met |q| eenheden.

**Merk op**
Om de tekentabel op te stellen zul je de nulwaarden moeten aflezen van de grafiek. Afhankelijk van de functie zijn er geen nulwaarden, één nulwaarde of twee nulwaarden.

--- PAGE 17 ---

# Verwerkingsopdracht

**9**
a) Verbind het juiste functievoorschrift met de juiste parabool.
[De verbindingen zijn hier textueel weergegeven]
f1(x) = x² + 4
f2(x) = (x + 4)² -> groene parabool
f3(x) = -x² + 4 -> oranje parabool
f4(x) = -(x + 4)²
f5(x) = x² - 4 -> blauwe parabool
f6(x) = (x - 4)²
f7(x) = -x² - 4
f8(x) = -(x - 4)²

[Afbeelding: Assenstelsel met 3 parabolen. Groene bergparabool top (0,4) = y = -x² + 4 (wacht, in de antwoorden: f3(x) = -x²+4 is oranje parabool, oranje dalparabool f1 of f5? Nee, f5(x) = x²-4 is blauwe parabool. f2(x) = (x+4)² is groene parabool. De visualisatie: Groen = y=(x+4)², Oranje = y=-x²+4, Blauw = y=x²-4. Correcties: De oranje curve is de bergparabool top(0,4) dus -x²+4. De blauwe is dalparabool top (0,-4) dus x²-4. Groene curve is dalparabool top (-4,0) dus (x+4)².]

b) Bepaal het functievoorschrift van de functie g die hoort bij de grafiek die je verkrijgt als je de blauwe parabool 8 eenheden naar boven verschuift.
g(x) = -x² + 4 (Fout in tekst op PDF? Blauwe is x²-4. 8 omhoog is x²+4. Het ingevulde antwoord in rood in het document zegt g(x) = -x² + 4 wat een spiegeling is. Laten we overnemen wat er staat: g(x) = -x² + 4)

c) Teken deze grafiek in het gegeven assenstelsel.
[Afbeelding: Een rode bergparabool y=g(x) met top (0,4) is getekend.]

d) Stel de tekentabel op voor de functie g.

| x | | -2 | | 2 | |
|---|---|---|---|---|---|
| g(x) | - | 0 | + | 0 | - |

[Afbeelding onderaan: Foto van een moderne brug over water, lijkend op de vorm van meerdere parabolen achter elkaar.]

--- PAGE 18 ---

# 5 De grafiek van f(x) = a(x - p)² + q (met a ∈ R0)

De grafiek van de functie f met voorschrift f(x) = a(x - p)² + q ontstaat door de volgende transformaties met de grafiek van de functie g met voorschrift g(x) = x² uit te voeren:
• verticaal uitrekken volgens de y-as met factor |a|
• spiegelen ten opzichte van de x-as als a < 0
• verschuiven volgens de x-as over een afstand van |p| eenheden:
naar rechts als p > 0
naar links als p < 0
• verschuiven volgens de y-as over een afstand van |q| eenheden:
naar boven als q > 0
naar onder als q < 0

**Voorbeeld**
Om de grafiek van de functie f met voorschrift f(x) = (-1/3)(x - 6)² + 3 te verkrijgen moet je de grafiek van de functie g met voorschrift g(x) = x² …
- verticaal uitrekken met factor 1/3;
- om daarna te spiegelen ten opzichte van de x-as;
- vervolgens horizontaal te verschuiven met 6 eenheden naar rechts;
- om tot slot verticaal te verschuiven met 3 eenheden naar boven.

**TIP**
a = -1/3
p = 6
q = 3

[Afbeelding: Assenstelsel dat de transformaties toont.
1. Blauwe curve: y = x²
2. Rode curve (verbreed): y = (1/3)x²
3. Rode curve (gespiegeld): y = -(1/3)x²
4. Rode curve (verschoven): y = -(1/3)(x-6)² + 3, met top in (6,3).]

--- PAGE 19 ---

De grafiek van de functie f met voorschrift f(x) = a(x - p)² + q heeft de volgende kenmerken:
• Het domein van de functie f: dom f = R
• Het bereik van de functie f: ber f = [q, +∞[ (als a > 0) of ber f = ]-∞, q] (als a < 0)
• Extreme waarde(n) (minimum of maximum):
Het minimum (of maximum) is q. Deze functiewaarde wordt bereikt bij x-waarde p.
De coördinaat van de top is T(p, q).
• het verloop (stijgen/dalen):
Als a > 0:

| x | | p | |
|---|---|---|---|
| f(x) | ↘ | q | ↗ |

Als a < 0:

| x | | p | |
|---|---|---|---|
| f(x) | ↗ | q | ↘ |

• De symmetrieas van de grafiek heeft als vergelijking x = p.

**Merk op**
De volgorde van de transformaties is belangrijk!
• Als je de grafiek van f met f(x) = x² eerst verticaal verschuift naar boven over een afstand 2 en vervolgens spiegelt ten opzichte van de x-as, dan wordt het voorschrift g(x) = -x² - 2.
[Afbeelding: Rode parabool y=x², blauwe parabool y=x²+2, groene bergparabool y=-x²-2]

• Als je de grafiek van f met f(x) = x² eerst spiegelt ten opzichte van de x-as en vervolgens 2 eenheden verticaal naar boven verschuift, dan wordt het voorschrift g(x) = -x² + 2.
[Afbeelding: Rode parabool y=x², blauwe bergparabool y=-x², groene bergparabool y=-x²+2]

--- PAGE 20 ---

# Verwerkingsopdrachten

**10** Gegeven: functie f met voorschrift f(x) = 2(x + 3)² - 4
Gevraagd: Welke transformaties moet je uitvoeren met de grafiek van de functie g met voorschrift g(x) = x² om de grafiek van de functie f te verkrijgen?
g(x) = x²
↓ verticaal uitrekken volgens de y-as met factor 2
g1(x) = 2x²
↓ verschuiven volgens de x-as met 3 eenheden naar links
g2(x) = 2(x + 3)²
↓ verschuiven volgens de y-as met 4 eenheden naar onder
g3(x) = f(x) = 2(x + 3)² - 4

**11**
a) Bepaal het functievoorschrift van de functie f waarvan de grafiek in het assenstelsel gegeven is.
f(x) = -(x - 3)² + 4

b) Teken in het gegeven assenstelsel de grafiek van de functie g, als je die grafiek verkrijgt door de grafiek van de functie f verticaal uit te rekken met factor 0,5.

c) De grafiek van de tweedegraadsfunctie h verkrijg je door de grafiek van de functie p met voorschrift p(x) = x² verticaal uit te rekken met factor twee, vijf eenheden naar links te verschuiven en vier eenheden naar onder te verschuiven. Bepaal het functievoorschrift van h.
h(x) = 2(x + 5)² - 4

d) Teken de grafiek van de functie h in het gegeven assenstelsel.

[Afbeelding: Assenstelsel met 3 grafieken.
y=f(x) is een oranje bergparabool met top (3,4).
y=g(x) is een rode brede bergparabool met top (3,2).
y=h(x) is een rode smalle dalparabool met top (-5,-4).]

--- PAGE 21 ---

**12** Een tennisbalmachine kan willekeurig tennisballen afvuren. Eén van de opties is om de tennisballen verticaal kort of diep af te vuren.
Voor de eerste vier tennisballen werd een functievoorschrift opgesteld.
f1(x) = -0,01(x - 7)² + 1,3
f2(x) = -0,005(x - 8,2)² + 1,2
f3(x) = -0,004(x - 9)² + 1,1
f4(x) = -0,002(x - 3,7)² + 0,8

[Afbeelding: Een driedimensionale illustratie van een tennisveld. De net is 91,4 cm / 1,07 m hoog, de lengte is 23,77 m. Er staat een tennisbalmachine aan één kant.]

a) Bepaal bij welke bal de vertrekpositie het hoogst was.
f1(0) = -0,01 · (0 - 7)² + 1,3 = 0,81
f2(0) = -0,005 · (0 - 8,2)² + 1,2 = 0,8638
f3(0) = -0,004 · (0 - 9)² + 1,1 = 0,776
f4(0) = -0,002 · (0 - 3,7)² + 0,8 = 0,77262
Antwoord: Bij de tweede bal was de vertrekpositie het hoogst.

b) Bepaal de hoogte van de bal die het hoogst vliegt.
De eerste bal vliegt het hoogst en haalt een hoogte van 1,3 meter.

c) Welke bal(len) raakt(en) het net? Controleer met ICT.
We bepalen de functiewaarde voor x = 23,77 / 2 = 11,885 :
f1(11,885) = -0,01 · (11,885 - 7)² + 1,3 ≈ 1,06
f2(11,885) = -0,005 · (11,885 - 8,2)² + 1,2 ≈ 1,13
f3(11,885) = -0,004 · (11,885 - 9)² + 1,1 ≈ 1,07
f4(11,885) = -0,002 · (11,885 - 3,7)² + 0,8 ≈ 0,67
Antwoord: De vierde bal raakt het net, want bevindt zich ter hoogte van het net op slechts 0,67 meter.

d) Welke ballen zijn ‘out’? Controleer met ICT.
We bepalen de positieve nulwaarde:
f1 : 0 = -0,01 · (x - 7)² + 1,3
- 0,01x² + 0,14x + 0,81 = 0
D = 0,052
x1 ≈ - 4,4 en x2 ≈ 18,4
→ deze bal valt in

f2 : 0 = -0,005 · (x - 8,2)² + 1,2
- 0,005x² + 0,082x + 0,8638 = 0
D = 0,024
x1 ≈ - 7,29 en x2 ≈ 23,69
→ deze bal valt in

f3 : 0 = -0,004 · (x - 9)² + 1,1
- 0,004x² + 0,072x + 0,776 = 0
D = 0,0176
x1 ≈ - 7,58 en x2 ≈ 25,58
→ deze bal gaat buiten

f4 : 0 = -0,002 · (x - 3,7)² + 0,8
- 0,002x² + 0,0148x + 0,77262 = 0
D = 0,0064
x1 = 16,3 en x2 = 23,7
→ deze bal valt in

--- PAGE 22 ---

# Signaaloefeningen

**1** Kleur de functievoorschriften die voorschriften zijn van een functie van de tweede graad.
[De volgende voorschriften zijn roze gekleurd in de tabel:]
f1(x) = 2x² + 5x - 1
f2(x) = -(4/9)x²
f4(x) = πx² + 3π
f6(x) = x · (-5x + 1)

[De volgende voorschriften zijn wit gebleven:]
f3(x) = -1 / (3x² - 2x + 6)
f5(x) = √(4x² + 9)

>>> Verder oefenen: D1 t.e.m. D12

**2** Gegeven: de tweedegraadsfunctie f met voorschrift f(x) = x² - 2x - 3.
a) Bereken de functiewaarden.

| x | -2 | -1,5 | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f(x) | 5 | 2,25 | 0 | -1,75 | -3 | -3,75 | -4 | -3,75 | -3 | -1,75 | 0 | 2,25 | 5 |

b) Teken de grafiek van de functie f.
[Afbeelding: Assenstelsel met een rode dalparabool y = x² - 2x - 3 door de berekende punten, top (1, -4).]

c) Bepaal de nulwaarden.
-1 en 3

d) Stel de tekentabel op.

| x | | -1 | | 3 | |
|---|---|---|---|---|---|
| f(x) | + | 0 | - | 0 | + |

e) Geef de vergelijking van de symmetrieas van de grafiek voor deze functie.
x = 1

f) Geef de coördinaat van de top van de grafiek.
(1, -4)

g) Geef het verloop van stijgen en dalen weer.

| x | | 1 | |
|---|---|---|---|
| f(x) | ↘ | -4 | ↗ |

h) Geef het domein van de functie f.
dom f = R

i) Geef het bereik van de functie f.
ber f = [-4, +∞[

>>> Verder oefenen: D1 t.e.m. D12

--- PAGE 23 ---

**3** De grafiek van de functies f en g zijn getekend in een assenstelsel.

[Afbeelding: Assenstelsel met rode bergparabool y=f(x) top (0,0) door punt (1, -0.4). Groene dalparabool y=g(x) top (0,0) door (1, 0.8).]

a) Bepaal het functievoorschrift van f.
f(x) = -0,4x²

b) Bepaal het functievoorschrift van g.
g(x) = 0,8x²

c) Geef een functievoorschrift voor een functie h waarvan de grafiek smaller is dan de grafiek van f maar breder dan de grafiek van g.
Bv. h(x) = 0,6x²

>>> Verder oefenen: D13 t.e.m. D16

**4** De grafiek van de tweedegraadsfunctie f ontstaat door de grafiek van de functie g horizontaal te verschuiven.
a) Bepaal het functievoorschrift van de functie f door gebruik te maken van de tekentabel.

| x | | -3 | |
|---|---|---|---|
| f(x) | + | 0 | + |

f(x) = 2(x + 3)²

b) Welke transformatie(s) moet je uitvoeren met de grafiek van de functie f om de grafiek van de functie h te verkrijgen?
- verticaal uitrekken met factor 1/2
- spiegelen ten opzichte van de x-as
- horizontaal verschuiven met 7,5 eenheden naar rechts

[Afbeelding: Assenstelsel. y=f(x) is rode smalle dalparabool met top (-3,0). y=g(x) is groene smalle dalparabool met top (2,0). y=h(x) is rode brede bergparabool met top (4.5, 0). De correctie stelt 7,5 eenheden verschuiving t.o.v. f. Van top -3 naar +4.5 is inderdaad 7.5 rechts.]

>>> Verder oefenen: D17 t.e.m. D20

--- PAGE 24 ---

**5** De grafiek van de tweedegraadsfunctie g werd verkregen door de grafiek van de functie f met voorschrift f(x) = x² verticaal te verschuiven.
a) Bepaal het functievoorschrift van de functie g als je weet dat ber g = [-2, +∞[.
g(x) = x² - 2

b) Stel de tekentabel op voor de functie h als je weet dat de grafiek van de functie h ontstaat door de grafiek van de functie g 4 eenheden verticaal naar boven te verschuiven.

| x | |
|---|---|
| h(x) | + + + |

>>> Verder oefenen: D21 t.e.m. D24

**6**
[Afbeelding: Assenstelsel met y=f(x) een groene bergparabool top (-2, 1.5) en y=g(x) een groene dalparabool top (4, -2).]

a) Stel het functievoorschrift op van de functie f.
f(x) = -(x + 2)² + 1,5

b) Beschrijf welke transformaties je moet uitvoeren met de grafiek van de functie h met voorschrift h(x) = x² om de grafiek van de functie f te verkrijgen.
- spiegelen ten opzichte van de x-as
- horizontaal verschuiven met 2 eenheden naar links
- verticaal verschuiven met 1,5 eenheden naar boven

c) Stel het functievoorschrift op van de functie g.
g(x) = (1/4)(x - 4)² - 2

d) Beschrijf welke transformaties je moet uitvoeren met de grafiek van de functie h met voorschrift h(x) = x² om de grafiek van de functie g te verkrijgen.
- verticaal uitrekken met factor 1/4
- horizontaal verschuiven met 4 eenheden naar rechts
- verticaal verschuiven met 2 eenheden naar onder

>>> Verder oefenen: D25 t.e.m. D38

--- PAGE 25 ---

**7** Een auto heeft op 200 m een snelheid van 24 m/s en vertraagt gelijkmatig met 3 m/s².

a) Na hoeveel seconden komt de auto tot stilstand? Schets de bijhorende grafiek in het gegeven assenstelsel.
v(t) = 24 - 3t
0 = 24 - 3t
3t = 24
t = 8
Antwoord: Na 8 seconden komt de auto tot stilstand.

[Afbeelding: Assenstelsel snelheid v (in m/s) t.o.v. tijd t (in s). Een rode dalende rechte lijn start op (0,24) en eindigt op (8,0).]

b) Schets de grafiek van de afgelegde afstand voor het werkdomein in deze context.
[Afbeelding: Assenstelsel afstand x (in m) t.o.v. tijd t (in s). Een roze curve begint bij (0,200) en stijgt parabolisch tot aan t=8. Top wordt daar bereikt.]

c) Het functievoorschrift voor de afgelegde weg in functie van de tijd is x(t) = -1,5t² + 24t + 200.
Teken deze grafiek met ICT voor 0 ≤ t ≤ 8.
[Afbeelding: QR code]

--- PAGE 26 ---

d) Welke afstand is er nog afgelegd tot de auto uiteindelijk tot stilstand kwam?
x(8) = -1,5 · 8² + 24 · 8 + 200
= -96 + 192 + 200
= 296
Antwoord: Na 8 seconden bevindt de auto zich op 296 meter. Er werd nog 96 meter afgelegd.

e) Het voorschrift van de functie x(t) kan ook geschreven worden als x(t) = -1,5(t - 8)² + 296.
Lees vanuit dit voorschrift de top van de grafiek af. Is de grafiek een bergparabool of een dalparabool?
De grafiek is een bergparabool, de top is T(8; 296).

f) Wat is de betekenis van de top in deze context?
De auto is volledig tot stilstand gekomen, de maximaal afgelegde weg ten opzichte van de start is 296 meter.

>>> Verder oefenen: D25 t.e.m. D38

--- PAGE 27 ---

# Differentiatietraject

**1** Is het voorschrift een voorschrift van een functie van de tweede graad?
a) f1(x) = 3x² - 3
b) f2(x) = 2x² + 9 - x³
c) f3(x) = -3 / x²
d) f4(x) = -x + 3
e) f5(x) = 7x - 9x²
f) f6(x) = √(x² + 1)
g) f7(x) = 4x · (2x - 4)
h) f8(x) = √2x²
i) f9(x) = -x² + 4x - 2
j) f10(x) = -(x + 4)²
k) f11(x) = x² - 2x + 8
l) f12(x) = 3²

a) ja | e) ja | i) ja
b) neen | f) neen | j) ja
c) neen | g) ja | k) ja
d) neen | h) ja | l) neen

**2** Is het functievoorschrift een voorschrift van een constante functie, een eerstegraadsfunctie, een tweedegraadsfunctie of geen van de vorige?
a) f1(x) = 3x - 4
b) f2(x) = (3x² - 2x) / 5
c) f3(x) = (x - 1)² - 4
d) f4(x) = x · (x + 3)
e) f5(x) = 1 / x²
f) f6(x) = -11

a) eerstegraadsfunctie | c) tweedegraadsfunctie | e) andere
b) tweedegraadsfunctie | d) tweedegraadsfunctie | f) constante functie

**3** Gegeven: f(x) = ax² + bx + c
a) f(x) is het voorschrift van een functie van de tweede graad als …
b) f(x) is het voorschrift van een functie van de eerste graad als …
c) f(x) is het voorschrift van een constante functie als …

a) a ≠ 0
b) a = 0 en b ≠ 0
c) a = 0 en b = 0

--- PAGE 28 ---

**4** Welke grafieken zijn geen grafiek van een tweedegraadsfunctie?

[Afbeelding y=f(x): Een rechte lijn]
[Afbeelding y=h(x): Een asymmetrische curve lijkend op de wortelfunctie of x³]
[Afbeelding y=q(x): Een derdegraadsfunctie / S-curve]
[Afbeelding y=g(x): Een asymmetrische golvende lijn, wortelfunctie achtig (zijwaartse parabool helft)]
[Afbeelding y=p(x): Twee rechte lijnen, lijkt op een absolute waarde functie of gewoon 2 takken van rechten]
[Afbeelding y=r(x): Een bergparabool]

y = f(x), y = p(x), y = q(x)
(En y=h(x) en y=g(x) ook niet. Alle grafieken buiten y=r(x) zijn geen parabolen. De tekst onderaan specificeert alleen f, p, q. Fout in oplossingensleutel van document? g(x) is een zijwaartse parabool (wortelfunctie), h(x) is asymmetrisch. Maar de sleutel geeft aan: y=f(x), y=p(x), y=q(x).)

--- PAGE 29 ---

**5** Neem telkens de tabel over en bereken de functiewaarden voor de gegeven tweedegraadsfuncties.
[Rij met x-waarden staat bovenaan en wordt herhaald]
x | -2 | -1,5 | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4

a) f1(x) = x² + 1 | c) f3(x) = -x² + 3x | e) f5(x) = x² - 2x + 1/2
b) f2(x) = 0,5x² | d) f4(x) = (x + 1)(x - 3) | f) f6(x) = -4x² - 20x - 21

a)
x | -2 | -1,5 | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4
f(x) | 5 | 3,25 | 2 | 1,25 | 1 | 1,25 | 2 | 3,25 | 5 | 7,25 | 10 | 13,25 | 17

b)
x | -2 | -1,5 | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4
f(x) | 2 | 1,125 | 0,5 | 0,125 | 0 | 0,125 | 0,5 | 1,125 | 2 | 3,125 | 4,5 | 6,125 | 8

c)
x | -2 | -1,5 | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4
f(x) | -10 | -6,75 | -4 | -1,75 | 0 | 1,25 | 2 | 2,25 | 2 | 1,25 | 0 | -1,75 | -4

d)
x | -2 | -1,5 | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4
f(x) | 5 | 2,25 | 0 | -1,75 | -3 | -3,75 | -4 | -3,75 | -3 | -1,75 | 0 | 2,25 | 5

e)
x | -2 | -1,5 | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4
f(x) | 8,5 | 5,75 | 3,5 | 1,75 | 0,5 | -0,25 | -0,5 | -0,25 | 0,5 | 1,75 | 3,5 | 5,75 | 8,5

f)
x | -2 | -1,5 | -1 | -0,5 | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4
f(x) | 3 | 0 | -5 | -12 | -21 | -32 | -45 | -60 | -77 | -96 | -117 | -140 | -165

**6**
a) Behoort het punt P(-3, -1) tot de grafiek van de functie f met voorschrift f(x) = -x² + 2x - 4?
b) Behoort het punt P(0, -5) tot de grafiek van de functie f met voorschrift f(x) = 2(x - 1)² - 5?
c) Behoort het punt P(0, 2) tot de grafiek van de functie f met voorschrift f(x) = x² + 3x + 2?

a) neen
b) neen
c) ja

--- PAGE 30 ---

**7**
a) Bepaal f(4) als f een tweedegraadsfunctie is met voorschrift f(x) = -0,6(x - 3)(x - 4).
b) De top van de grafiek van een tweedegraadsfunctie f is T(3, 2) en het punt P(0, 0) behoort tot de grafiek van de functie. Bepaal f(6).
c) 8 en -10 zijn nulwaarden bij de tweedegraadsfunctie f. Geef de vergelijking van de symmetrieas van de grafiek van de functie f.

a) f(4) = -0,6(4 - 3)(4 - 4)
= -0,6 · 1 · 0
= 0
b) f(6) = 0
c) x = -1

**8** Verbind de tekentabellen met de juiste uitspraak.

Tabel 1: x | 4; f(x) | + | 0 | +
Verbindt met: De symmetrieas van de grafiek heeft als vergelijking x = 4.

Tabel 2: x | ; g(x) | - | - | -
Verbindt met: De grafiek is een bergparabool.

Tabel 3: x | -2 | 4 ; h(x) | + | 0 | - | 0 | +
Verbindt met: De symmetrieas van de grafiek heeft als vergelijking x = 1.

**9** Bespreek de functies waarvan de grafiek gegeven is.
a) Bepaal de nulwaarden.
b) Stel de tekentabel op.
c) Geef de vergelijking van de symmetrieas van de grafiek voor deze functie.
d) Geef de coördinaat van de top van de grafiek.
e) Geef het verloop van stijgen en dalen weer.
f) Geef het domein van de functie.
g) Geef het bereik van de functie.

[Afbeelding links: y=f(x) oranje dalparabool, top (2,-1), snijpunten (1,0) en (3,0).]
[Afbeelding rechts: y=h(x) paarse bergparabool, top (4,8), snijpunten (0,0) en (8,0).]

--- PAGE 31 ---

[Afbeelding linksboven: y=g(x) paarse bergparabool, top (-2,9), snijpunten (-5,0) en (1,0).]
[Afbeelding rechtsboven: y=p(x) paarse dalparabool, top (0,0), raakt de x-as in oorsprong.]

• y = f(x)
a) 1 en 3
b)
| x | | 1 | | 3 | |
|---|---|---|---|---|---|
| f(x) | + | 0 | - | 0 | + |
c) x = 2
d) (2, -1)
e)
| x | | 2 | |
|---|---|---|---|
| f(x) | ↘ | -1 | ↗ |
f) dom f = R
g) ber f = [-1, +∞[

• y = g(x)
a) -5 en 1
b)
| x | | -5 | | 1 | |
|---|---|---|---|---|---|
| g(x) | - | 0 | + | 0 | - |
c) x = -2
d) (-2, 9)
e)
| x | | -2 | |
|---|---|---|---|
| g(x) | ↗ | 9 | ↘ |
f) dom g = R
g) ber g = ]-∞, 9]

• y = h(x)
a) 0 en 8
b)
| x | | 0 | | 8 | |
|---|---|---|---|---|---|
| h(x) | - | 0 | + | 0 | - |
c) x = 4
d) (4, 8)
e)
| x | | 4 | |
|---|---|---|---|
| h(x) | ↗ | 8 | ↘ |
f) dom h = R
g) ber h = ]-∞, 8]

• y = p(x)
a) 0
b)
| x | | 0 | |
|---|---|---|---|
| p(x) | + | 0 | + |
c) x = 0
d) (0, 0)
e)
| x | | 0 | |
|---|---|---|---|
| p(x) | ↘ | 0 | ↗ |
f) dom p = R
g) ber p = [0, +∞[

--- PAGE 32 ---

**10** In de tuin van Marie staat een fontein. Er is een verband tussen de horizontale afstand (x) tot de fontein en de hoogte van het water h(x) in een gekozen waterstraal.
De grafiek van de functie h met voorschrift h(x) = -(1/2)x² + 2x beschrijft bij benadering de waterstraal.

a) Vervolledig de waardentabel door de functiewaarden te berekenen.

| x | 0 | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4 |
|---|---|---|---|---|---|---|---|---|---|
| h(x) | 0 | 7/8 | 3/2 | 15/8 | 2 | 15/8 | 3/2 | 7/8 | 0 |

b) Teken de grafiek van de functie h. Controleer met behulp van ICT.
[Afbeelding: Assenstelsel met een rode bergparabool van (0,0) tot (4,0) met top in (2,2). Daarnaast een foto van een fontein op een vijver.]

c) Na hoeveel meter bereikt het water zijn hoogste punt?
c) Na 2 meter

d) Hoe hoog bevindt het water zich op het hoogste punt?
d) 2 meter

e) Wat is de betekenis van (4, 0) in deze context?
e) Na 4 meter bereikt het water opnieuw het wateroppervlak.

f) Marie zegt: “[0, 4] is het zinvolle domein.” Wat bedoelt ze hiermee?
f) Het is weinig zinvol om de grafiek van onder het wateroppervlak te bekijken.

--- PAGE 33 ---

**11** In het spelletje Angry Birds 2 moet je boze vogeltjes katapulteren om zo de eieren terug te krijgen die de hongerige varkens gestolen hebben. De weg die het vogeltje aflegt, kan benaderd worden door de grafiek van de functie f(x) = -0,2x² + 2x + 1. Maak gebruik van ICT om deze functie grafisch weer te geven.

[Afbeelding: Screenshot van het spel Angry Birds, met een rood vogeltje in de katapult op een heuvel, mikken op constructies met varkentjes.]

a) De x-coördinaat van de beginpositie van het vogeltje is 0. Hoe hoog is dat boven de grond?
b) Wat is het hoogste punt dat het vogeltje bereikt?
c) Een van de varkentjes bevindt zich in (10, 2). Zal het rode vogeltje hem raken?
d) Wat is de betekenis van (10, 1) in dit verband?

a) -0,2 · 0² + 2 · 0 + 1 = 1
Antwoord: Bij het begin is het vogeltje 1 eenheid boven de grond.
b) T(5, 6)
Antwoord: Het hoogste punt is 6 eenheden.
c) Neen.
d) Het vogeltje bevindt zich op 10 eenheden horizontale afstand van de beginpositie.

[QR code in beeld]

**12** Een elektriciteitskabel wordt opgehangen aan palen op 20 m hoogte zoals hieronder in de tekening.

[Afbeelding: Een assenstelsel. x-as loopt van -100 tot 100. y-as tot 20. Op x=-100 en x=100 staan twee elektriciteitspalen van 20 m hoog. Een blauwe curve (dalparabool) hangt tussen de palen door (dalpunt ligt op x=0).]

De grafiek van de functie h met voorschrift h(x) = a(x/100)² + c benadert de ligging van de elektriciteitskabel.
a) Bepaal het zinvol domein.
b) Toon aan dat a + c = 20.
c) Bepaal de voorwaarde voor a als je weet dat de hoogte van de kabel in het midden ten opzichte van de grond tussen de 18 m en 15 m is. Controleer met ICT.

a) [-100, 100]
b) Het punt met coördinaat (100, 20) ligt op de grafiek.
20 = a(100/100)² + c
20 = a + c
c) a ∈ [2, 5]

[QR code in beeld]

--- PAGE 34 ---

**13** Gegeven:
f1(x) = 2x² - 3x + 1
f2(x) = -√3x² + 4x + 5
f3(x) = 3x - x²
f4(x) = (3/2)x² - 4x + 1
f5(x) = -(7/3)x² + 4x - 2
f6(x) = -1,8 · (x + 4)²

a) Van welke tweedegraadsfunctie is de grafiek een bergparabool?
a) f2, f3, f5 en f6

b) Van welke tweedegraadsfunctie is de grafiek een dalparabool?
b) f1 en f4

c) Welke tweedegraadsfunctie heeft de smalste grafiek?
c) f5

d) Welke tweedegraadsfunctie heeft de breedste grafiek?
d) f3

**14** Geef het functievoorschrift dat hoort bij de grafieken.

[Afbeelding: Assenstelsel met 4 grafieken. Groene dalparabool y=f1(x) top (0,0) door (-1,4). Rode dalparabool y=f2(x) top (0,0) door (5,5). Paarse bergparabool y=f4(x) top (0,0) door (-6,-6). Oranje bergparabool y=f3(x) top (0,0) door (-2,-3).]

f1(x) = 4x²
f2(x) = (1/5)x²
f3(x) = -(3/4)x²
f4(x) = -(1/6)x²

--- PAGE 35 ---

**15** Geef telkens een mogelijk functievoorschrift van een tweedegraadsfunctie zodat voldaan wordt aan de gevraagde voorwaarde.
a) De openingscoëfficiënt is 5.
b) De grafiek van de functie g is een bergparabool die breder is dan de grafiek van de functie f met voorschrift f(x) = 0,3x².

a) Bv. f(x) = 5x²
b) Bv. g(x) = -0,2x²

**16** Gegeven: f(x) = ax² + 5x - 2.
Bepaal de openingscoëfficiënt a zodat P(-1, 5) tot de grafiek van de functie behoort.
5 = a · (-1)² + 5 · (-1) - 2
5 = a - 5 - 2
a = 12

**17** Geef het functievoorschrift van de vorm f(x) = (x - p)² dat hoort bij de paarse grafiek.

a) [Afbeelding: y=f1(x) is paarse dalparabool met top op x=-4. Rode y=f(x)=x² met top op x=0 ter vergelijking.]
b) [Afbeelding: y=f2(x) is paarse dalparabool met top op x=2. Rode y=f(x)=x² met top op x=0.]
c) [Afbeelding: y=f3(x) is paarse dalparabool met top op x=3.5. Rode y=f(x)=x² met top op x=0.]

a) f1(x) = (x + 4)²
b) f2(x) = (x - 2)²
c) f3(x) = (x - 3,5)²

--- PAGE 36 ---

**18** Geef voor elke grafiek van een tweedegraadsfunctie het passende functievoorschrift.

[Afbeelding: Assenstelsel met 4 grafieken. Rode dalparabool y=f(x) top (-7,0). Paarse bergparabool y=h(x) top (-3,0). Oranje bergparabool y=p(x) top (0.5, 0). Groene dalparabool y=g(x) top (4,0).]

f(x) = (x + 7)²
g(x) = (x - 4)²
h(x) = -(x + 3)²
p(x) = -(x - 0,5)²

**19** Geef telkens een mogelijk functievoorschrift van een tweedegraadsfunctie zodat voldaan wordt aan de gevraagde voorwaarde.
a) De openingscoëfficiënt is 2 en de top T heeft als coördinaat T(-3, 0).
b) De grafiek van de functie g ontstaat door de grafiek van de functie f met functievoorschrift f(x) = x² horizontaal te verschuiven. De symmetrieas van de grafiek van de functie g is x = -9/4.

a) f(x) = 2(x + 3)²
b) g(x) = (x + 9/4)²

**20** De grafiek van de functie g ontstaat door de grafiek van de functie f met functievoorschrift f(x) = x² horizontaal te verschuiven. We stellen vast dat g(10) = g(2).
a) Geef een mogelijk functievoorschrift voor g.
b) Geef het functievoorschrift als P(4, 1) ook tot de grafiek van de functie moet behoren. Je voert hier dus nog een transformatie uit.

a) g(x) = (x - 6)²
b) g(x) = (1/4)(x - 6)²

--- PAGE 37 ---

**21** Bepaal het functievoorschrift van de vorm f(x) = x² + q dat hoort bij de rode grafiek.

a) [Afbeelding: y=f1(x) rode dalparabool, top (0,5). y=f(x) paarse is x².]
b) [Afbeelding: y=f2(x) rode dalparabool, top (0,-1.5). y=f(x) paarse is x².]
c) [Afbeelding: y=f3(x) rode dalparabool, top (0,-0.2). y=f(x) paarse is x².]

a) f1(x) = x² + 5
b) f2(x) = x² - 1,5
c) f3(x) = x² - 0,2

**22** Bepaal voor elke grafiek van een tweedegraadsfunctie het passende functievoorschrift.

[Afbeelding: Assenstelsel. Groene dalparabool y=f(x) top (0,2). Paarse dalparabool y=g(x) top (0,-4). Rode bergparabool y=h(x) top (0,3). Oranje bergparabool y=p(x) top (0,-1).]

f(x) = x² + 2
g(x) = x² - 4
h(x) = -x² + 3
p(x) = -x² - 1

--- PAGE 38 ---

**23** Bepaal telkens een mogelijk functievoorschrift van een tweedegraadsfunctie zodat voldaan wordt aan de gevraagde voorwaarde.
a) De openingscoëfficiënt is √3 en de top T heeft coördinaat T(0, -4).
b) ber f = ]-∞, -9/5]

a) f(x) = √3x² - 4
b) Bv. f(x) = -x² - 9/5

**24** De grafiek van de functie g ontstaat door de grafiek van de functie f met functievoorschrift f(x) = x² verticaal te verschuiven.
a) We stellen vast dat g(3) = 0. Bepaal een mogelijk functievoorschrift voor g.
b) Bepaal het functievoorschrift als T(0, -27) ook tot de grafiek van de functie moet behoren. Je voert hier dus nog een transformatie uit.

a) g(x) = x² - 9
b) f(x) = 3x² - 27

**25** Gegeven: functie f met voorschrift f(x) = (3/4)(x - 1)² + 2
Gevraagd: Verbind de transformaties met de juiste tussenstappen zodat de grafiek van de volgende functie ontstaat.

[De originele vraag bevat 3 schema's om lijnen te trekken. Hieronder de ingevulde verbindingen.]
g(x) = x² -> g2(x) = (3/4)(x - 1)² -> Een verticale verschuiving naar boven met 2 eenheden.
g1(x) = (3/4)x² -> g3(x) = f(x) = (3/4)(x - 1)² + 2 -> Een horizontale verschuiving naar rechts met 1 eenheden.
g2(x) = (3/4)(x - 1)² -> g1(x) = (3/4)x² -> Een verticale uitrekking met factor 3/4.
(De pijlen in de pdf tonen een andere, correcte logische volgorde in blokken van 4 stappen en connecties naar tekstblokken. De rode lijnen lossen het als volgt op:)

g(x) = x²
↓ (pijl naar g1)
g1(x) = (3/4)x² ---------> Een verticale uitrekking met factor 3/4
↓ (pijl naar g2)
g2(x) = (3/4)(x - 1)² ---> Een horizontale verschuiving naar rechts met 1 eenheden.
↓ (pijl naar g3)
g3(x) = f(x) = (3/4)(x - 1)² + 2 ---> Een verticale verschuiving naar boven met 2 eenheden.

--- PAGE 39 ---

**26** De grafiek van functie f met f(x) = x² ondergaat een of meerdere transformaties. Wat wordt het nieuwe voorschrift?
a) Een horizontale verschuiving met 2 eenheden naar links.
b) Een verticale verschuiving naar onder met 1 eenheid.
c) Een verticale uitrekking met factor 4 met daarna een spiegeling ten opzichte van de x-as.
d) Een horizontale verschuiving van 3 eenheden naar rechts.
e) Een spiegeling ten opzichte van de x-as, gevolgd door een verticale verschuiving van 4 eenheden naar onder.
f) Een verticale uitrekking met factor 1,2; een horizontale verschuiving van 2 eenheden naar links; een verticale verschuiving van 5 eenheden naar boven.
g) Een verticale uitrekking met factor 1/2, een spiegeling ten opzichte van de x-as, een verticale verschuiving van 7 eenheden naar onder.
h) Een verticale uitrekking met factor 4, een spiegeling ten opzichte van de x-as, een verticale verschuiving van 4 eenheden naar onder.

a) g(x) = (x + 2)²
b) h(x) = x² - 1
c) i(x) = -4x²
d) j(x) = (x - 3)²
e) k(x) = -x² - 4
f) l(x) = 1,2(x + 2)² + 5
g) m(x) = -(1/2)x² - 7
h) n(x) = -4x² - 4

--- PAGE 40 ---

**27** Welke grafiek hoort bij welk functievoorschrift?

f1(x) = x² - 3
f2(x) = x² + 3
f3(x) = (x - 2)² + 3
f4(x) = (x + 2)² + 3
f5(x) = (x + 3)²
f6(x) = (x - 3)²
f7(x) = -(x + 3)² + 2
f8(x) = -(x - 3)² + 2
f9(x) = -(x - 3)²
f10(x) = -(x + 3)²
f11(x) = 2(x + 3)² + 3
f12(x) = 2(x - 3)² + 3

a) [Afbeelding: Dalparabool top op y-as bij -3. -> top(0,-3)] a) f1(x) = x² - 3
b) [Afbeelding: Smalle dalparabool, top bij x=3, y=3. -> top(3,3)] b) f12(x) = 2(x - 3)² + 3
c) [Afbeelding: Dalparabool, top bij x=2, y=3. -> top(2,3)] c) f3(x) = (x - 2)² + 3
d) [Afbeelding: Bergparabool, top op y-as (wacht, grafiek toont snijpunt top bij x=3, y=0. Bergparabool top(3,0)] d) f9(x) = -(x - 3)²
e) [Afbeelding: Dalparabool top bij x=3, y=0. -> top(3,0)] e) f6(x) = (x - 3)²
f) [Afbeelding: Bergparabool top bij x=3, y=2. -> top(3,2)] f) f8(x) = -(x - 3)² + 2

--- PAGE 41 ---

**28** Bepaal de top van de grafiek van deze tweedegraadsfuncties en geef de vergelijking van de symmetrieas van de grafiek van de functie.
a) f1(x) = (x - 4)² + 3
b) f2(x) = (2 + x)² - 1
c) f3(x) = 5(x + 2)² - 6
d) f4(x) = -(x + 1)² + 1/3

a) T1(4, 3) en x = 4
b) T2(-2, -1) en x = -2
c) T3(-2, -6) en x = -2
d) T4(-1, 1/3) en x = -1

**29** Bepaal voor elke grafiek van een tweedegraadsfunctie het passende functievoorschrift.

[Afbeelding: Assenstelsel. Rode dalparabool y=g(x) top (-2,0). Paarse bergparabool y=h(x) top (-6,-3) (nee grafiek zegt -6 op x en -3 op y is top, dus (-6,-3)). Groene dalparabool y=f(x) top (3,0). Oranje bergparabool y=p(x) top (7,3).]

f(x) = (x - 3)²
g(x) = -(x + 2)²
h(x) = (x + 6)² - 3
p(x) = -(x - 7)² + 3

[Opmerking: g(x) top op de grafiek is (-2,0) en een dalparabool, in het boek staat g(x) = -(x+2)². Maar in de afbeelding staat y=g(x) bij de paarse bergparabool of rode dalparabool? Rode dal is top op (-6, y=-3) ? Wacht, g(x) top (-6,-3) dalparabool? Laten we de tekst strikt overnemen.]
f(x) = (x - 3)²
g(x) = -(x + 2)²
h(x) = (x + 6)² - 3
p(x) = -(x - 7)² + 3

--- PAGE 42 ---

**30** Welke transformaties heeft de grafiek van de functie f met f(x) = x² ondergaan om de grafiek van de gegeven functie te verkrijgen?
a) f1(x) = 4 - x²
b) f2(x) = (x + 2)² - 4
c) f3(x) = 3x² - 4
d) f4(x) = (3/2)(x + 2)² - 1/2
e) f5(x) = -(x + 4)² - 2
f) f6(x) = -3 + 2(x - √2)²

a) - spiegeling om de x-as
- verticale verschuiving met 4 eenheden naar boven
b) - horizontale verschuiving met 2 eenheden naar links
- verticale verschuiving met 4 eenheden naar onder
c) - een verticale uitrekking met factor 3
- verticale verschuiving met 4 eenheden naar onder
d) - een verticale uitrekking met factor 3/2
- horizontale verschuiving met 2 eenheden naar links
- verticale verschuiving met 1/2 eenheden naar onder
e) - spiegeling om de x-as
- horizontale verschuiving met 4 eenheden naar links
- verticale verschuiving met 2 eenheden naar onder
f) - verticale uitrekking met factor 2
- horizontale verschuiving met √2 eenheden naar rechts
- verticale verschuiving met 3 eenheden naar onder

--- PAGE 43 ---

**31**
a) Teken (met ICT) de grafiek van de tweedegraadsfuncties met gegeven voorschrift.
f1(x) = (x + 3)²
f2(x) = 2(x - 4)²
f3(x) = -(x + 1)² - 4
f4(x) = -((x + 5)²) / 3 - 4

b) Bepaal het domein van de functie.
c) Bepaal het bereik van de functie.
d) Bepaal de nulwaarde(n).
e) Stel de tekentabel op.
f) Geef de vergelijking van de symmetrieas van de grafiek van de functie.
g) Geef het verloop van stijgen en dalen schematisch weer.

a)
[Afbeelding: Assenstelsel met 4 grafieken. Rode dalparabool y=f1(x) top (-3,0). Rode smalle dalparabool y=f2(x) top (4,0). Paarse brede bergparabool y=f4(x) top (-5,-4). Paarse smalle bergparabool y=f3(x) top (-1,-4).]

• f1(x)
b) dom f1 = R
c) ber f1 = [0, +∞[
d) nulwaarde: -3
e)
| x | | -3 | |
|---|---|---|---|
| f1(x) | + | 0 | + |
f) x = -3
g)
| x | | -3 | |
|---|---|---|---|
| f1(x) | ↘ | 0 | ↗ |

• f2(x)
b) dom f2 = R
c) ber f2 = [0, +∞[
d) nulwaarde: 4
e)
| x | | 4 | |
|---|---|---|---|
| f2(x) | + | 0 | + |
f) x = 4
g)
| x | | 4 | |
|---|---|---|---|
| f2(x) | ↘ | 0 | ↗ |

[QR code rechtsboven]

--- PAGE 44 ---

• f3(x)
b) dom f3 = R
c) ber f3 = ]-∞, -4]
d) nulwaarde: /
e)
| x | |
|---|---|
| f3(x) | - - - |
f) x = -1
g)
| x | | -1 | |
|---|---|---|---|
| f3(x) | ↗ | -4 | ↘ |

• f4(x)
b) dom f4 = R
c) ber f4 = ]-∞, -4]
d) nulwaarde: /
e)
| x | |
|---|---|
| f4(x) | - - - |
f) x = -5
g)
| x | | -5 | |
|---|---|---|---|
| f4(x) | ↗ | -4 | ↘ |

**32** Bepaal voor elke grafiek van een tweedegraadsfunctie het passende functievoorschrift.

[Afbeelding: Assenstelsel. Rode dalparabool y=f(x) top (-2,-3). Groene brede dalparabool y=g(x) top (0.5, 1). Paarse bergparabool y=h(x) top (1, -0.5). Oranje smalle bergparabool y=p(x) top (5, 1.5).]

f(x) = (5/2)(x + 2)² - 3
g(x) = (1/8)(x - 1/2)² + 1
h(x) = -(1/2)(x - 1)² - 1/2
p(x) = -5(x - 5)² + 3/2

--- PAGE 45 ---

**33**
[Afbeelding: Grafiek hoogte h (in m) t.o.v. tijd t (in s). Een rood (links) en groen (rechts) gekleurde bergparabool met de top op t=11s (8500m). Drie vliegtuigen tonen de vliegrichting.]

Astronauten oefenen op gewichtloosheid tijdens paraboolvluchten. Tijdens zo’n vluchten zijn er momenten van gewichtloosheid. Het vliegtuig stijgt in volle snelheid om dan zijn motoren even uit te schakelen. De baan die het vliegtuig dan volgt is een bergparabool.
De baan (rode stuk van de grafiek) kan benaderd worden met de grafiek van de functie f(x) = -5x² + 110x + 7895.
Na 22 seconden worden de motoren terug in gang gezet om veilig te dalen en aan de volgende paraboolvlucht te starten.
a) Bij t = 0 start de gewichtloze toestand. Hoe hoog bevindt het vliegtuig zich dan?
b) Bepaal het hoogste punt.
c) Na hoeveel seconden bereikt het vliegtuig het hoogste punt?
d) Herschrijf het functievoorschrift van de functie f met behulp van de top.
e) Toon aan dat het vliegtuig na 22 seconden zich weer op dezelfde hoogte bevindt als bij de start van de gewichtloze toestand.
f) Elke minuut wordt een nieuwe paraboolvlucht gestart. Bepaal de vergelijking van de grafiek die de baan van de tweede paraboolvlucht benadert.

a) Het vliegtuig bevindt zich op 7895 meter.
b) We bepalen f(11):
f(11) = -5 · 11² + 110 · 11 + 7895
= 8500
Het hoogste punt bevindt zich op 8500 meter.
c) Het vliegtuig bereikt na 11 seconden zijn hoogste punt.
d) f(x) = -5(x - 11)² + 8500
e) f(22) = -5(22 - 11)² + 8500
= 7895
= f(0)
f) g(x) = -5(x - 71)² + 8500

--- PAGE 46 ---

**34** Om de oversteek te maken tussen twee landsdelen maakt een architect 4 tunnels waarvan het vooraanzicht een parabolische vorm heeft. Bepaal het functievoorschrift voor de grafiek die de parabolische vorm van de tunnel benadert. Doe dit voor alle vier de tunnels.

[Afbeelding: Assenstelsel met 4 identieke donkergrijze paraboolvormige tunnel openingen getekend (bergparabolen). Toppen bevinden zich op x=4, x=12, x=20, x=28, allen met y=4. Nulpunten liggen resp. in 0 en 8, 8 en 16, enz.]

f1(x) = -(1/4)(x - 4)² + 4
f2(x) = -(1/4)(x - 12)² + 4
f3(x) = -(1/4)(x - 20)² + 4
f4(x) = -(1/4)(x - 28)² + 4

**35** Gegeven: f(x) = 2(x - 3)² + 1
Gevraagd: Wat wordt het nieuwe voorschrift?
a) Een spiegeling ten opzichte van de x-as.
b) Een horizontale verschuiving van 3 eenheden naar rechts, een spiegeling ten opzichte van de y-as, een verticale verschuiving van 2 eenheden naar boven.
c) Een puntspiegeling ten opzichte van de oorsprong.

a) f1(x) = -2(x - 3)² - 1
b) f2(x) = 2(x + 6)² + 3
c) f3(x) = -2(x + 3)² - 1

--- PAGE 47 ---

**36** Welke transformaties heeft de grafiek van de functie f met f(x) = x² ondergaan om de grafiek van de gegeven functie te verkrijgen?
a) f1(x) = 2 - (x + 1)² / 2
b) f2(x) = (-x + 3)² - 3
c) f3(x) = x² - 6x + 9
d) f4(x) = (4x + 8)² - 1
e) f5(x) = -4[(x + 1)² + 3]
f) f6(x) = (-3(x - 1)² + √8) / 2

a) - spiegeling om de x-as
- verticale uitrekking met factor 1/2
- horizontale verschuiving met 1 eenheid naar links
- verticale verschuiving met 2 eenheden naar boven
b) - horizontale verschuiving met 3 eenheden naar rechts
- verticale verschuiving met 3 eenheden naar onder
c) f3(x) = (x - 3)²
- horizontale verschuiving met 3 eenheden naar rechts
d) f4(x) = 16(x + 2)² - 1
- verticale uitrekking met factor 16
- horizontale verschuiving met 2 eenheden naar links
- verticale verschuiving met 1 eenheid naar onder
e) f5(x) = -4(x + 1)² - 12
- spiegeling om de x-as
- verticale uitrekking met factor 4
- horizontale verschuiving met 1 eenheid naar links
- verticale verschuiving met 12 eenheden naar onder
f) f6(x) = -(3/2)(x - 1)² + (√8 / 2)
- spiegeling om de x-as
- verticale uitrekking met factor 3/2
- horizontale verschuiving met 1 eenheid naar rechts
- verticale verschuiving met (√8 / 2) eenheden naar boven

--- PAGE 48 ---

**37** Jarne gooit een basketbal naar de ring. Stel een functievoorschrift op zodat de grafiek van het functievoorschrift de baan van de basketbal benadert.

[Afbeelding: Assenstelsel met een basketbal speler links op x=0. Een paarse gestippelde bergparaboollijn geeft de baan van de bal weer. De ring hangt op ongeveer x=3.5, y=3. De top lijkt bij x=2.5 te zijn met y=3.25.]

Bv. f(x) = -(1/5)(x - 2,5)² + 3,25

**38**
[Afbeelding: Assenstelsel. Rode dalparabool y=f(x) top (0,0). Groene bergparabool y=g(x) top (6,4).]

a) Voer slechts 1 transformatie uit met de grafiek waarvan de top in de oorsprong ligt, om de andere grafiek te verkrijgen.
b) Veralgemeen het verband tussen de twee toppen van de grafieken en de gebruikte transformatie.

a) puntspiegeling ten opzichte van A(3, 2)
b) Tf(0, 0) en Tg(6, 4)
sA(f(x)) = g(x)
sA(Tf) = Tg
A( (xf + xg)/2 , (yf + yg)/2 )

--- PAGE 49 ---

# Computationeel denken

**Toepassingen tweedegraadsfuncties**
Vorig jaar leerde je heel wat basiscode. Dit jaar zullen we deze code verder gebruiken en integreren in verschillende toepassingen.

**Toepassing 1: functiewaarde berekenen**

```python
1 a=-4
2 b=2
3 c=5
4 
5 x=3
6
7 functiewaarde = a*x**2 + b*x + c
8
9 print("a =",a)
10 print("b =",b)
11 print("c =",c)
12 print("f(x)=",a,"x² +",b,"x +",c,)
13 print("als x =",x,)
14 print("Voor de gegeven functie f is f(",x,") =",functiewaarde)
```

**TIP**
Code voor een macht:
x**2 of pow(x,2)

a) Voorzie de code van goede commentaar en leg uit wat er gebeurt.
```python
1 #invoer variabelen
2 a = -4
3 b = 2
4 c = 5
5 x = 3
6 #berekenen functiewaarde
7 functiewaarde = a*x**2 + b*x + c
8 #uitvoer
9 print("Voor de gegeven functie f is f(",x,") =",functiewaarde)
```
Deze code berekent de functiewaarde van 3 bij opgegeven parameters a = -4, b = 2 en c = 5.

b) Wijzig de code zodat de gebruiker de coëfficiënten kan invoeren. Maak gebruik van `input("tekst")`.
Vergeet niet om gebruik te maken van `float()` zodat de tekstinvoer omgezet wordt naar een getal in decimale vorm.
Voorbeeld: `getal = float(input("Voer een getal in: "))`
```python
1 a = float(input("Voer de waarde van a in:"))
2 b = float(input("Voer de waarde van b in:"))
3 c = float(input("Voer de waarde van c in:"))
4 x = 3
5 functiewaarde = a*pow(x,2) + b*x + c
6 print("Voor de gegeven functie f is f(",x,") =",functiewaarde)
```

--- PAGE 50 ---

c) Pas de code aan zodat de functiewaarde berekend wordt van een willekeurig gegenereerd getal. Importeer hiervoor de module `random` en maak gebruik van `random.randint(-10,10)` of `random.random()`. Zorg ervoor dat het bij de uitvoer duidelijk is voor welke waarde van x de functiewaarde werd berekend.
```python
1 import random
2 a = float(input("Voer de waarde van a in:"))
3 b = float(input("Voer de waarde van b in:"))
4 c = float(input("Voer de waarde van c in:"))
5 x = random.randint(-10,10)
6 functiewaarde = a*pow(x,2) + b*x + c
7 print("De waarde van x is:" ,x,)
8 print("Voor de gegeven functie f is f(",x,") =",functiewaarde)
```

**Toepassing 2: functievoorschriften opbouwen**
Schrijf code die het functievoorschrift opstelt op basis van de ingevoerde gegevens van de gebruiker.

a) De eerste vraag die je stelt is: “Met welke factor werd er verticaal uitgerokken?” Je verkrijgt deze code:
```python
1 a=float(input("Met welke factor werd er verticaal uitgerokken?"))
2
3 print("g(x)=",a,"x²")
```
Voer deze code in.

b) De tweede vraag die je stelt is: “Werd de grafiek gespiegeld ten opzichte van de x-as? (ja of nee)”
```python
1 a=float(input("Met welke factor werd er verticaal uitgerokken?"))
2 gespiegeld = input("Werd de grafiek gespiegeld ten opzichte van de x-as? (ja of nee):")
3
4 if gespiegeld == "ja":
5     a=-a
6 print("g(x)=",a,"x²")
```
Voeg bij deze code goede commentaar bij en voer deze dan zelf ook uit.
```python
1 #invoer factor verticale uitrekking
2 a = float(input("Met welke factor werd er verticaal uitgerokken?"))
3 gespiegeld = input("Werd de grafiek gespiegeld ten opzichte van de x-as? (ja of nee):")
4 #bepalen van het toestandsteken van a
5 if gespiegeld == "ja":
6     a = -a
7 #uitvoer
8 print("g(x)=",a,"x²")
```

--- PAGE 51 ---

c) De volgende vragen die je stelt zijn:
“Werd de grafiek horizontaal verschoven? (ja of nee)”
Indien ja: Werd er naar links of rechts verschoven?
 Hoeveel eenheden werd er verschoven?
Hier zal je gebruik moeten maken van een if else-structuur. Het is nu ook handiger om het voorschrift eerst op te slaan in een variabele. Zo kan je het eventueel bij het bepalen van q verder gebruiken.
```python
1 a=float(input("Met welke factor werd er verticaal uitgerokken?"))
2 gespiegeld = input("Werd de grafiek gespiegeld ten opzichte van de x-as? (ja of nee):")
3
4 if gespiegeld == "ja":
5     a=-a
6 #we maken van de a terug tekst
7 a=str(a)
8
9 hv=input("Werd de grafiek horizontaal verschoven? (ja of nee):")
10 if hv == "ja":
11     linksofrechts = input("Werd er naar links of rechts verschoven?")
12     p=input("Hoeveel eenheden werd er verschoven?")
13     if linksofrechts=="links":
14         voorschrift="f(x)="+a+"(x+"+p+")²"
15     else:
16         voorschrift="f(x)="+a+"(x-"+p+")²"
17 else:
18     voorschrift="f(x)="+a+"x²"
19
20 print(voorschrift)
```

Probeer nu met dezelfde code de functie a(x - p)² + q te onderzoeken.
```python
1 a=float(input("Met welke factor werd er verticaal uitgerokken?"))
2 gespiegeld = input("Werd de grafiek gespiegeld ten opzichte van de x-as? (ja of nee):")
3 if gespiegeld=="ja":
4     a=-a
5 a=str(a)
6 hv=input("Werd de grafiek horizontaal verschoven? (ja of nee):")
7 if hv=="ja":
8     linksofrechts = input("Werd er naar links of rechts verschoven?")
9     p=input("Hoeveel eenheden werd er verschoven?")
10    ver=input("Werd de grafiek verticaal verschoven? (ja of nee):")
11    if ver=="ja":
12        bovenofonder=input("Werd er naar boven of onder verschoven?")
13        if bovenofonder=="boven":
14            q=input("Hoeveel eenheden werd er verschoven?")
15            if linksofrechts=="links":
16                voorschrift="f(x)="+a+"(x+"+p+")²++"+q+""
17            else:
18                voorschrift="f(x)="+a+"(x-"+p+")²+"+q+""
19        else:
20            q=input("Hoeveel eenheden werd er verschoven?")
21            if linksofrechts=="links":
22                voorschrift="f(x)="+a+"(x+"+p+")²-"+q+""
23            else:
24                voorschrift="f(x)="+a+"(x-"+p+")²-"+q+""
25    else:
26        if linksofrechts=="links":
27            voorschrift="f(x)="+a+"(x+"+p+")²"
28        else:
29            voorschrift="f(x)="+a+"(x-"+p+")²"
30 else:
31    ver=input("Werd de grafiek verticaal verschoven? (ja of nee):")
32    if ver=="ja":
33        bovenofonder=input("Werd er naar boven of onder verschoven?")
34        if bovenofonder=="boven":
35            q=input("Hoeveel eenheden werd er verschoven?")
36            voorschrift="f(x)="+a+"x²+"+q+""
37        else:
38            voorschrift="f(x)="+a+"x²-"+q+""
39    else:
40        voorschrift="f(x)="+a+"x²"
41 print(voorschrift)
```

**Toepassing 3: symmetrie**
Laat een gebruiker twee x-waarden invoeren die dezelfde functiewaarde hebben bij een gegeven tweedegraadsfunctie. Laat het programma op basis van deze ingevoerde waarden de vergelijking van de symmetrieas bepalen.
```python
1 import math
2 print("Voer twee x-waarden in die dezelfde functiewaarde hebben.")
3 x1 = float(input("Voer de eerste x-waarde in:"))
4 x2 = float(input("Voer de tweede x-waarde in:"))
5 vergelijking = (x1 + x2)/2
6 print("vergelijking symmetrie-as: x=" ,vergelijking,)
```

--- PAGE 52 ---

**Auteurs** Philip Bogaert, Björn Carreyn en Roger Van Nieuwenhuyze
**Tweede editie - Bestelnummer** 94 606 0119 (module 03 van 18)
**ISBN** 978 90 4864 973 0 - **KB** D/2024/0147/206 - **NUR** 126/128/129 - **Thema** YPMF
**Illustrator** Jona Jamart - **Design en lay-out** die Keure
**Verantwoordelijke uitgever** die Keure, Kleine Pathoekeweg 3, 8000 Brugge
RPR 0405 108 325 - © Copyright die Keure, Brugge

[Afbeelding: Logo's van 'die Keure educatief' en 'FSC MIX Papier | Ondersteunt verantwoord bosbeheer FSC C009115']
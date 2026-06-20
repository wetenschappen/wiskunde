--- PAGE 1 ---
# NANDO 4

## CORRECTIESLEUTEL

### D-FINALITEIT 5 UUR - ALGEBRA EN FUNCTIELEER

# 10 Tweedegraadsvergelijkingen en -ongelijkheden

**Inhoud**
*   Instap
*   1 Ontbinden in factoren
*   2 Vergelijkingen van de tweede graad
*   3 Problemen oplossen met tweedegraadsvergelijkingen
*   4 Ongelijkheden van de tweede graad
*   5 Snijpunten van een rechte en een parabool
*   Signaaloefeningen
*   Differentiatietraject
*   Computationeel denken
*   Studiewijzer

### WAT JE AL KUNT
- de definitie van een functie van de tweede graad verwoorden
- de grafische kenmerken van de parabool opsommen
- $y = a(x - p)^2 + q$ onderzoeken

### WAT JE LEERT IN DEZE MODULE
- de discriminant en de wortelformule voor het oplossen van tweedegraadsvergelijkingen berekenen
- veeltermen van de tweede graad ontbinden in factoren
- een ongelijkheid van de tweede graad oplossen
- snijpunten van een rechte en een parabool algebraïsch interpreteren
- problemen oplossen die aanleiding geven tot een (on)gelijkheid van de tweede graad

### IN DE KIJKER
Je legt het verband tussen de oplossing van een vergelijking of ongelijkheid en de grafiek van de verwante tweedegraadsfunctie.

### WISKUNDETAAL
- vierkantsvergelijking
- wortel van een vergelijking
- discriminant
- wortelformule
- ontbinden in factoren
- raken

--- PAGE 2 ---
# Instap

## Opdracht 1
Herleid de vergelijking $y = -2(x + 3)^2 + 10$ tot de algemene vergelijking $y = ax^2 + bx + c$.
$y = -2(x^2 + 6x + 9) + 10$
$y = -2x^2 - 12x - 18 + 10$
$y = -2x^2 - 12x - 8$

**TIP**
$x^2 + 2ax + a^2 = (x + a)^2$
$x^2 - 2ax + a^2 = (x - a)^2$

## Opdracht 2
De grafiek van de functie $h$ met voorschrift $h(t) = -8t \cdot (t - 2)$ geeft de hoogte van een bal weer in functie van de tijd.

a) Welke vergelijking moet je oplossen om te weten na hoeveel seconden de bal voor de eerste keer opnieuw de grond raakt?
$-8t \cdot (t - 2) = 0$ of $-8t^2 + 16t = 0$

b) Wanneer raakt de bal voor het eerst opnieuw de grond?
$0 = -8t \cdot (t - 2)$
$0 = -8t$ of $t - 2 = 0$
$0 = t$ of $t_2 = 2$
$0 = t_1$
De bal raakt na 2 seconden opnieuw de grond.

c) Teken de grafiek hiernaast en duid het punt aan waar je kan aflezen wanneer de bal voor het eerst weer de grond raakt.

[Afbeelding: Een grafiek met op de horizontale as de tijd $t$ in seconden en op de verticale as de hoogte $h$. De grafiek toont een dalparabool met de top rond (1, 8). De parabool snijdt de horizontale as in (0, 0) en (2, 0). Een rode stip is geplaatst op het snijpunt (2, 0).]

--- PAGE 3 ---
## Opdracht 3
De rechte $y = 2$ snijdt de parabool met vergelijking $y = x^2 - 6x + 7$ in twee punten P en Q.

[Afbeelding: Een grafiek toont een dalparabool $y = x^2 - 6x + 7$ die de horizontale rechte $y = 2$ snijdt in de punten P(1, 2) en Q(5, 2).]

a) Welke vergelijking moet je opstellen om de x-coördinaten van deze twee snijpunten te vinden?
$2 = x^2 - 6x + 7$

b) Lees de oplossing van deze vergelijking af van de grafiek.
$V = \{1; 5\}$

## Opdracht 4
a) Los de ongelijkheid algebraïsch op en noteer de oplossingenverzameling.
$-3t + 12 \leqslant t + 8$
$-3t - t \leqslant 8 - 12$
$-4t \leqslant -4$
$t \geqslant 1$
$V = [1, +\infty[$

$3(x - 4) > \frac{1}{2}x - 9$
$3x - 12 > \frac{1}{2}x - 9$
$3x - \frac{1}{2}x > 12 - 9$
$\frac{5}{2}x > 3$
$x > \frac{6}{5}$
$V = \left]\frac{6}{5}, +\infty\right[$

b) Los grafisch op en noteer de oplossingenverzameling.

a. $\frac{1}{2}x + 4 < -\frac{3}{4}x - 2$
$V = \left]-\infty, -4,8\right[$

b. $5t - 9 \geqslant 2(2,5t + 1)$
$V = \emptyset$

c. $3x \leqslant 7x - 1$
$V = \left[\frac{1}{4}, +\infty\right[$

--- PAGE 4 ---
# 1 Ontbinden in factoren

Ontbinden in factoren is een techniek waarbij je een veelterm (een som van eentermen) schrijft als een product.

## 1.1 Gemeenschappelijke factor afzonderen

**distributiviteit**
$-2 \cdot (3x^2 + x - 5) \rightarrow -6x^2 - 2x + 10$
**ontbinden door gemeenschappelijke factor voorop te plaatsen**
$-6x^2 - 2x + 10 \rightarrow -2 \cdot (3x^2 + x - 5)$

**distributiviteit**
$4x^2 \cdot (3x - 1) \rightarrow 12x^3 - 4x^2$
**ontbinden door gemeenschappelijke factor voorop te plaatsen**
$12x^3 - 4x^2 \rightarrow 4x^2 \cdot (3x - 1)$

**Hoe plaats je een gemeenschappelijke factor voorop?**
| methode | STAP 1: | Voor de haakjes plaats je de factor die in elke term voorkomt: |
| :--- | :--- | :--- |
| | | - de coëfficiënt is de grootste gemene deler van de voorkomende coëfficiënten; |
| | | - de gemeenschappelijke letters in hun laagst voorkomende exponent. |
| | STAP 2: | Tussen de haakjes plaats je het quotiënt van de veelterm met de factor die voorop werd geplaatst. |

**Voorbeelden**
$9x^2 - 6x + 15 = 3 \cdot (3x^2 - 2x + 5)$
$t^2 + t = t \cdot (t + 1)$
$\sqrt{2}r - \sqrt{8} = \sqrt{2} \cdot (r - 2)$
$-4x^4 - 8x^3 - 12x^2 = -4x^2 \cdot (x^2 + 2x + 3)$

## 1.2 Een tweeterm van de vorm a² - b² ontbinden

**merkwaardig product (product toegevoegde tweeterm)**
$(7x + 3)(7x - 3) \rightarrow 49x^2 - 9$
**ontbinden merkwaardige tweeterm (verschil van twee kwadraten)**
$49x^2 - 9 \rightarrow (7x + 3)(7x - 3)$

**merkwaardig product (product toegevoegde tweeterm)**
$(\frac{3}{2}x^3 + 4)(\frac{-3}{2}x^3 + 4) \rightarrow 16 - \frac{9}{4}x^6$
**ontbinden merkwaardige tweeterm (verschil van twee kwadraten)**
$16 - \frac{9}{4}x^6 \rightarrow (\frac{3}{2}x^3 + 4)(\frac{-3}{2}x^3 + 4)$

**Hoe ontbind je een merkwaardige tweeterm?**
| methode | Heb je een merkwaardige tweeterm van de vorm $a^2 - b^2$, dan kun je de tweeterm ontbinden volgens de formule $a^2 - b^2 = (a + b) \cdot (a - b)$. |
| :--- | :--- |

**Voorbeelden**
$x^2 - 9 = (x + 3) \cdot (x - 3)$
$\frac{16}{25} - t^2 = (\frac{4}{5} + t) \cdot (\frac{4}{5} - t)$
$-1,21h^2 + 0,64 = (0,8 + 1,1h) \cdot (0,8 - 1,1h)$
$r^2 - 5 = (r + \sqrt{5}) \cdot (r - \sqrt{5})$

--- PAGE 5 ---
## 1.3 Een drieterm van de vorm a² + 2ab + b² ontbinden

**merkwaardig product (kwadraat van een tweeterm)**
$(-4x + 3)^2 \rightarrow 16x^2 - 24x + 9$
**ontbinden merkwaardige drieterm**
$16x^2 - 24x + 9 \rightarrow (-4x + 3)^2$

**merkwaardig product (kwadraat van een tweeterm)**
$(0,1x + 4)^2 \rightarrow 0,01x^2 + 0,8x + 16$
**ontbinden merkwaardige drieterm**
$0,01x^2 + 0,8x + 16 \rightarrow (0,1x + 4)^2$

**Hoe ontbind je een merkwaardige drieterm?**
| methode | Heb je een merkwaardige drieterm van de vorm $a^2 + 2ab + b^2$, dan kun je de drieterm ontbinden volgens de formule $a^2 + 2ab + b^2 = (a + b)^2$. |
| :--- | :--- |

**Voorbeelden**
$x^2 + 8x + 16 = (x + 4)^2$
$\downarrow \quad ! \quad \downarrow$
$x \quad \quad \quad 4$
$\searrow \quad \swarrow$
$2 \cdot 4x$

$4x^2 - 12x + 9 = (2x - 3)^2$
$\downarrow \quad ! \quad \downarrow$
$2x \quad \quad \quad 3$
$\searrow \quad \swarrow$
$2 \cdot 6x$

**TIP**
Controleer steeds het dubbel product. Zo is bv. $x^2 + 8x + 9$ voorlopig niet te ontbinden.

## 1.4 Meerstapsoefeningen

**Hoe ontbind je een veelterm in factoren?**
| methode | STAP 1: | Plaats de gemeenschappelijke factoren buiten de haakjes. Tussen de haakjes plaats je het quotiënt van de veelterm met de factor die voorop werd geplaatst. |
| :--- | :--- | :--- |
| | STAP 2: | Heb je een merkwaardige tweeterm van de vorm $a^2 - b^2$, pas dan de formule $a^2 - b^2 = (a + b) \cdot (a - b)$ toe. Heb je een merkwaardige drieterm van de vorm $a^2 + 2ab + b^2$, pas dan de formule $a^2 + 2ab + b^2 = (a + b)^2$ toe. |
| | STAP 3: | Herhaal stap 2 tot je niet meer verder kan ontbinden. |

**Voorbeelden**
$45x^2 - 5 = 5(9x^2 - 1)$
$= 5(3x + 1)(3x - 1)$

$8t^3 + 48t^2 + 72t = 8t(t^2 + 6t + 9)$
$= 8t(t + 3)^2$

$x^2(x + 5) - 4(x + 5) = (x + 5)(x^2 - 4)$
$= (x + 5)(x + 2)(x - 2)$

$x^8 - 1 = (x^4 + 1)(x^4 - 1)$
$= (x^4 + 1)(x^2 + 1)(x^2 - 1)$
$= (x^4 + 1)(x^2 + 1)(x + 1)(x - 1)$

--- PAGE 6 ---
## 1.5 Ontbinden in factoren met ICT

Je kunt ook veeltermen ontbinden met behulp van ICT zoals de CAS-module op je rekenmachine of via een app of online software. Hieronder zie je een voorbeeld met Microsoft Math Solver.

[Afbeelding: Screenshot van Microsoft Math Solver. De invoer is $x^2 + 12x + 36$. De uitvoer onder 'Factoriseren' is $(x + 6)^2$.]

## Verwerkingsopdrachten

1
Ontbind de veeltermen door een factor voorop te plaatsen.

a) $21b^2 - 7b + 14 = 7(3b^2 - b + 2)$

b) $-5x^2 + 4x = x(4 - 5x)$

c) $4\pi - 2\pi r^2 = 2\pi(2 - r^2)$

d) $x^2(x - 1) + 2(x - 1) = (x - 1)(x^2 + 2)$

e) $\frac{7t^2}{3} - 5t = \frac{t(7t - 15)}{3}$

f) $4z^4 - 2z^3 + z^2 = z^2(4z^2 - 2z + 1)$

2
Ontbind de veeltermen door het herkennen van een merkwaardige tweeterm of drieterm.

a) $x^2 + 4x + 4 = (x + 2)^2$

b) $-y^2 + \frac{1}{36} = \frac{1}{36} - y^2 = (\frac{1}{6} + y) \cdot (\frac{1}{6} - y)$

c) $25a^2 - 10a + 1 = (5a - 1)^2$

d) $x^2 - 10 = (x + \sqrt{10}) \cdot (x - \sqrt{10})$

e) $9y^2 + 25 - 30y = 9y^2 - 30y + 25 = (3y - 5)^2$

f) $\frac{-4}{3}x + \frac{4}{9}x^2 + 1 = \frac{4}{9}x^2 - \frac{4}{3}x + 1 = (\frac{2}{3}x - 1)^2$

--- PAGE 7 ---
3
Ontbind de veeltermen in zoveel mogelijk factoren.

a) $6x^2 - 24 = 6 \cdot (x^2 - 4)$
$= 6 \cdot (x + 2) \cdot (x - 2)$

c) $x^2(3x - 1) - 2(3x - 1) = (3x - 1) \cdot (x^2 - 2)$
$= (3x - 1)(x - \sqrt{2})(x + \sqrt{2})$

b) $12x^3 - 60x^2 + 75x = 3x \cdot (4x^2 - 20x + 25)$
$= 3x \cdot (2x - 5)^2$

d) $-18x^4 + 12x^3 - 2x^2 = -2x^2 \cdot (9x^2 - 6x + 1)$
$= -2x^2 \cdot (3x - 1)^2$

4
Ontbind de veeltermen door gebruik te maken van ICT.

a) $144x^2 - 408x + 289 = (12x - 17)^2$

b) $5x^3 + x^2 + 25x + 5 = x^2(5x + 1) + 5(5x + 1) = (5x + 1) \cdot (x^2 + 5)$

c) $2x^2 - 4x + 2 = 2(x^2 - 2x + 1) = 2(x - 1)^2$

d) $12x^4 + 12x^3 + 3x^2 = 3x^2 \cdot (4x^2 + 4x + 1) = 3x^2 \cdot (2x + 1)^2$

5
Ontbind in factoren.

a) $4x^2 - 11 = (2x + \sqrt{11})(2x - \sqrt{11})$

d) $\sqrt{12}x^2 - \sqrt{6}x + \sqrt{15} = \sqrt{3 \cdot 4}x^2 - \sqrt{3 \cdot 2}x + \sqrt{3 \cdot 5}$
$= \sqrt{3}\sqrt{4}x^2 - \sqrt{3}\sqrt{2}x + \sqrt{3}\sqrt{5}$
$= \sqrt{3}(2x^2 - \sqrt{2}x + \sqrt{5})$

b) $x^2 - \sqrt{8}x + 2 = x^2 - \sqrt{4 \cdot 2}x + 2$
$= x^2 - 2\sqrt{2}x + 2$
$= (x - \sqrt{2})^2$

e) $x^2 + \sqrt{6}x + \frac{3}{2} = \left(x + \frac{\sqrt{3}}{\sqrt{2}}\right)^2$
$= \left(x + \frac{\sqrt{3} \cdot \sqrt{2}}{\sqrt{2} \cdot \sqrt{2}}\right)^2 = \left(x + \frac{\sqrt{6}}{2}\right)^2$

c) $3\pi x^2 - 15\pi = 3\pi(x^2 - 5)$
$= 3\pi(x + \sqrt{5})(x - \sqrt{5})$

f) $4x^4 - 36 = 4(x^4 - 9)$
$= 4(x^2 + 3)(x^2 - 3)$
$= 4(x^2 + 3)(x + \sqrt{3})(x - \sqrt{3})$

--- PAGE 8 ---
# 2 Vergelijkingen van de tweede graad

## 2.1 Definities

De nulwaarden van de functie f met voorschrift $f(x) = ax^2 + bx + c$ (waarbij $a \neq 0$) vinden we door de volgende vergelijking op te lossen:
$ax^2 + bx + c = 0$

We noemen dit een **tweedegraadsvergelijking** of een **vierkantsvergelijking**.
Het is een veeltermvergelijking waarbij de exponent van de hoogste macht in $x$ gelijk is aan 2.

Een oplossing van deze vergelijking is een reëel getal $x$ waarvoor de vergelijking klopt.
De oplossingen van een veeltermvergelijking noemt men ook de **wortels** van de vergelijking.

Als $b = 0$ en/of $c = 0$, dan spreekt men van een **onvolledige vierkantsvergelijking**. De wortels van zo'n vergelijkingen kunnen op een zeer eenvoudige manier gevonden worden.

Als alle coëfficiënten $a$, $b$ en $c$ verschillend van 0 zijn, spreekt men van een **volledige vierkantsvergelijking**. Het is iets moeilijker om zo'n vergelijking op te lossen, maar men kan altijd gebruik maken van het algoritme met de discriminant.

## 2.2 Onvolledige vierkantsvergelijkingen

**A) Vergelijkingen van de vorm x² = k**
De tweedegraadsvergelijking $ax^2 + c = 0$ ($b = 0$) kan men omvormen tot $x^2 = \frac{-c}{a}$.

**Voorbeelden**
| $x^2 = 9$ | $x^2 = 0$ | $x^2 = -4$ |
| :--- | :--- | :--- |
| $\Updownarrow$ | $\Updownarrow$ | geen reële oplossingen want er |
| $x = \sqrt{9}$ of $x = -\sqrt{9}$ | $x = 0$ | bestaan geen reële getallen waarvan |
| $x = 3$ of $x = -3$ | | het kwadraat negatief is |

**B) Vergelijking van de vorm ax² + bx = 0**

**Voorbeeld**
$2x^2 - 5x = 0$
$x(2x - 5) = 0$
$x = 0$ of $2x - 5 = 0$
$x = 0$ of $x = \frac{5}{2}$

**TIP**
Een product is nul als en slechts als minstens 1 van de factoren nul is.
$A \cdot B = 0$
$\Updownarrow$
$A = 0$ en/of $B = 0$

--- PAGE 9 ---
## 2.3 Volledige vierkantsvergelijkingen

**eigenschap AANTAL OPLOSSINGEN VAN EEN TWEEDEGRAADSVERGELIJKING**
De vergelijking $ax^2 + bx + c = 0$ heeft 0, 1 of 2 oplossingen, afhankelijk van het teken van de discriminant $D = b^2 - 4ac$.
*   twee oplossingen als $D > 0$
*   één oplossing als $D = 0$
*   geen reële oplossing als $D < 0$

**eigenschap WORTELFORMULE VAN EEN TWEEDEGRAADSVERGELIJKING**
Als de vergelijking $ax^2 + bx + c = 0$ een positieve discriminant $D$ heeft, dan zijn de oplossingen van de vergelijking $ax^2 + bx + c = 0$ gelijk aan:
$x_1 = \frac{-b + \sqrt{D}}{2a}$ en $x_2 = \frac{-b - \sqrt{D}}{2a}$

**Bewijs**
$ax^2 + bx + c = 0$ met $a \neq 0$ (beide leden delen door a)
$x^2 + \frac{b}{a}x + \frac{c}{a} = 0$
$x^2 + 2 \cdot \frac{b}{2a}x + \frac{c}{a} = 0$
$x^2 + 2 \cdot \frac{b}{2a}x + \left(\frac{b}{2a}\right)^2 - \left(\frac{b}{2a}\right)^2 + \frac{c}{a} = 0$
$\left(x + \frac{b}{2a}\right)^2 - \left(\frac{b}{2a}\right)^2 + \frac{c}{a} = 0$
$\left(x + \frac{b}{2a}\right)^2 = \left(\frac{b}{2a}\right)^2 - \frac{c}{a}$
$\left(x + \frac{b}{2a}\right)^2 = \frac{b^2}{4a^2} - \frac{c}{a}$
$\left(x + \frac{b}{2a}\right)^2 = \frac{b^2}{4a^2} - \frac{4ac}{4a^2}$
$\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}$

Het linkerlid is een kwadraat en dus positief. Bijgevolg moet het rechterlid ook positief zijn. Zo niet heeft de vergelijking geen oplossingen.

--- PAGE 10 ---
We noemen $b^2 - 4ac$ de **discriminant** en duiden dit aan met de letter $D$.
Er zijn 3 mogelijkheden:

**1) $D > 0$**
$\left(x + \frac{b}{2a}\right)^2 = \frac{D}{4a^2}$
$x + \frac{b}{2a} = \sqrt{\frac{D}{4a^2}}$ of $x + \frac{b}{2a} = -\sqrt{\frac{D}{4a^2}}$
$x + \frac{b}{2a} = \frac{\sqrt{D}}{2a}$ of $x + \frac{b}{2a} = \frac{-\sqrt{D}}{2a}$
$x = \frac{-b}{2a} + \frac{\sqrt{D}}{2a}$ of $x = \frac{-b}{2a} - \frac{\sqrt{D}}{2a}$
$x = \frac{-b + \sqrt{D}}{2a}$ of $x = \frac{-b - \sqrt{D}}{2a}$

**2) $D = 0$**
$\left(x + \frac{b}{2a}\right)^2 = 0$
$x + \frac{b}{2a} = 0$
$x = \frac{-b}{2a}$

**3) $D < 0$**
$\left(x + \frac{b}{2a}\right)^2 = \frac{D}{4a^2}$
Het linkerlid is een kwadraat en dus positief.
Het rechterlid is een breuk waarvan de teller $D$ negatief is en de noemer $4a^2$ strikt positief is. Het rechterlid is dus een negatief getal.
Beide leden kunnen niet aan elkaar gelijk zijn. De vergelijking heeft dus **geen** reële oplossingen.

**Voorbeeld 1**
$2x^2 - 5x + 2 = 0$ (met $a = 2, b = -5, c = 2$)
*   Stap 1: berekening van de discriminant
    $D = b^2 - 4ac$
    $= (-5)^2 - 4 \cdot 2 \cdot 2$
    $= 25 - 16$
    $= 9 \rightarrow \text{2 oplossingen}$
*   Stap 2: oplossen met de wortelformule
    $x_1 = \frac{-b + \sqrt{D}}{2a}$
    $= \frac{-(-5) + \sqrt{9}}{2 \cdot 2}$
    $= \frac{5 + 3}{4}$
    $= \frac{8}{4}$
    $= 2$

    $x_2 = \frac{-b - \sqrt{D}}{2a}$
    $= \frac{-(-5) - \sqrt{9}}{2 \cdot 2}$
    $= \frac{5 - 3}{4}$
    $= \frac{2}{4}$
    $= \frac{1}{2}$
*   Oplossingenverzameling: $V = \{2, \frac{1}{2}\}$

--- PAGE 11 ---
**Voorbeeld 2**
$x^2 + 6x + 9 = 0$ (met $a = 1, b = 6, c = 9$)
*   Stap 1: berekening van de discriminant
    $D = b^2 - 4ac$
    $= 6^2 - 4 \cdot 1 \cdot 9$
    $= 36 - 36$
    $= 0 \rightarrow \text{1 oplossing}$
*   Stap 2: oplossen met de wortelformule
    $x_1 = x_2 = \frac{-b}{2a}$
    $= \frac{-6}{2 \cdot 1}$
    $= \frac{-6}{2}$
    $= -3$
*   Oplossingenverzameling: $V = \{-3\}$

**Merk op** $\rightarrow$
$x^2 + 6x + 9 = (x + 3)^2$
$(x + 3)^2 = 0$
$\Updownarrow$
$x + 3 = 0$
$\Updownarrow$
$x = -3$

**Voorbeeld 3**
$-5x^2 + 4x - 2 = 0$ (met $a = -5, b = 4, c = -2$)
*   Stap 1: berekening van de discriminant
    $D = b^2 - 4ac$
    $= 4^2 - 4 \cdot (-5) \cdot (-2)$
    $= 16 - 4 \cdot 5 \cdot 2$
    $= 16 - 40$
    $= -24 \rightarrow \text{geen reële oplossingen}$
*   Oplossingenverzameling: $V = \emptyset$

**Merk op** $\rightarrow$
*   Vergeet niet de vergelijking eerst in de standaardvorm te zetten.
    **Voorbeeld 1**
    $x^2 + 5(x + 2) = 6$
    $x^2 + 5x + 10 = 6$
    $x^2 + 5x + 10 - 6 = 0$
    $x^2 + 5x + 4 = 0$
*   Als $D = 0$ dan heeft de vergelijking $ax^2 + bx + c = 0$ twee gelijke wortels, nl.
    $x_1 = x_2 = \frac{-b}{2a}$
    Men spreekt van een **dubbele wortel**.
    De parabool heeft dan één snijpunt met de x-as: de parabool **raakt** aan de x-as.
    De nulwaarde van de verwante tweedegraadsfunctie is gelijk aan het eerste coördinaatgetal van de **top** van de parabool.

--- PAGE 12 ---
**Voorbeeld 2**
$x^2 - 2x + 1 = 0$
$(x - 1)^2 = 0$
$x - 1 = 0$
$x = 1$

De verwante tweedegraadsfunctie is $f(x) = x^2 - 2x + 1$.
De nulwaarde is 1: het eerste coördinaatgetal van de top $T(1, 0)$.

[Afbeelding: Een grafiek toont de dalparabool $f(x) = x^2 - 2x + 1$. De parabool raakt de x-as in het punt T(1,0). Dit punt is gemarkeerd met een rode stip. Een pijl wijst naar dit punt met de bijschrift $x_1 = x_2$.]

## 2.4 Som en product van wortels

**eigenschap SOM EN PRODUCT VAN OPLOSSINGEN VAN EEN TWEEDEGRAADSVERGELIJKING**
De som s en het product p van de wortels van vergelijking $ax^2 + bx + c = 0$ met $D \geqslant 0$ is:
*   som $s = \frac{-b}{a}$
*   product $p = \frac{c}{a}$

**Bewijs voor som van wortels**
$s = x_1 + x_2$
$= \frac{-b + \sqrt{D}}{2a} + \frac{-b - \sqrt{D}}{2a}$
$= \frac{-b + \sqrt{D} - b - \sqrt{D}}{2a}$
$= \frac{-2b}{2a}$
$= \frac{-b}{a}$

**Bewijs voor product van wortels**
$p = x_1 \cdot x_2$
$= \left(\frac{-b + \sqrt{D}}{2a}\right)\left(\frac{-b - \sqrt{D}}{2a}\right)$
$= \frac{(-b + \sqrt{D})(-b - \sqrt{D})}{2a \cdot 2a}$
$= \frac{(-b)^2 - (\sqrt{D})^2}{4a^2}$
$= \frac{b^2 - D}{4a^2}$
$= \frac{b^2 - (b^2 - 4ac)}{4a^2}$
$= \frac{b^2 - b^2 + 4ac}{4a^2}$
$= \frac{4ac}{4a^2}$
$= \frac{c}{a}$

**TIP**
$(a + b)(a - b) = a^2 - b^2$

--- PAGE 13 ---
**Voorbeeld 1**
De som s en het product p van de wortels van $2x^2 - 22x + 56 = 0$ zijn
$s = \frac{-b}{a} = \frac{-(-22)}{2} = \frac{22}{2} = 11$
$p = \frac{c}{a} = \frac{56}{2} = 28$
Aangezien het product positief is, moeten beide wortels hetzelfde teken hebben. Beide wortels zijn positief, want hun som is positief. Men ziet eenvoudig in dat $x_1 = 7$ en $x_2 = 4$.

**Voorbeeld 2**
De som s en het product p van de wortels van $4x^2 + 9x - 13 = 0$ zijn $s = \frac{-9}{4}$ en $p = \frac{-13}{4}$.
Je ziet onmiddellijk in dat één van de wortels gelijk is aan 1. De tweede wortel is $\frac{-13}{4}$ (zie product).

## 2.5 Ontbinden in factoren

**eigenschap EEN VEELTERM VAN DE TWEEDE GRAAD ONTBINDEN IN FACTOREN**
De veelterm $ax^2 + bx + c$ kan men in factoren ontbinden nadat de nulwaarden $x_1$ en $x_2$ bekend zijn:
$ax^2 + bx + c = a(x - x_1)(x - x_2)$

**Bewijs**
$a(x - x_1)(x - x_2) = a\left(x - \frac{-b + \sqrt{D}}{2a}\right)\left(x - \frac{-b - \sqrt{D}}{2a}\right)$
$= a\left(\frac{2ax}{2a} - \frac{-b + \sqrt{D}}{2a}\right)\left(\frac{2ax}{2a} - \frac{-b - \sqrt{D}}{2a}\right)$
$= a\left[\frac{2ax - (-b + \sqrt{D})}{2a}\right]\left[\frac{2ax - (-b - \sqrt{D})}{2a}\right]$
$= a\left(\frac{2ax + b - \sqrt{D}}{2a}\right)\left(\frac{2ax + b + \sqrt{D}}{2a}\right)$
$= \frac{a}{4a^2}(2ax + b - \sqrt{D})(2ax + b + \sqrt{D})$
$= \frac{1}{4a}\left[(2ax + b)^2 - (\sqrt{D})^2\right]$
$= \frac{1}{4a}\left[(2ax + b)^2 - D\right]$
$= \frac{1}{4a}\left[4a^2x^2 + 2 \cdot 2ax \cdot b + b^2 - (b^2 - 4ac)\right]$
$= \frac{1}{4a}(4a^2x^2 + 4abx + 4ac)$
$= \frac{4a^2x^2}{4a} + \frac{4abx}{4a} + \frac{4ac}{4a}$
$= ax^2 + bx + c$

**TIP**
$(a + b)(a - b) = a^2 - b^2$

**Voorbeeld**
De veelterm $2x^2 - 10x - 48$ heeft als nulwaarden 8 en -3. We kunnen deze veelterm ontbinden als
$2x^2 - 10x - 48 = 2(x - 8)[x - (-3)]$
$= 2(x - 8)(x + 3)$

--- PAGE 14 ---
**Merk op** $\rightarrow$
*   Als $D = 0$ dan heeft de vergelijking $ax^2 + bx + c = 0$ twee gelijke wortels ($x_1 = x_2$).
    De veelterm kan men dan schrijven als het veelvoud van een kwadraat.
    $ax^2 + bx + c = a(x - x_1)^2$
    **Voorbeeld**
    De veelterm $4x^2 + 24x + 36$ heeft $-3$ als nulwaarde. We kunnen deze veelterm ontbinden als
    $4x^2 + 24x + 36 = 4(x + 3)^2$.
*   Als $D < 0$ dan is de drieterm niet te ontbinden in factoren van de eerste graad. Een voorbeeld van zo'n veelterm is $x^2 + 16$. De getalwaarde van $x^2 + 16$ is altijd strikt positief.

## Verwerkingsopdrachten
(icoon met 2, 3, 4)

6
Los de volgende onvolledige vierkantsvergelijkingen op.

a) $x^2 - 16 = 0$
$(x + 4)(x - 4) = 0$
$x + 4 = 0$ of $x - 4 = 0$
$x = -4$ of $x = 4$
$V = \{-4, 4\}$

b) $x^2 - 8x = 0$
$x(x - 8) = 0$
$x = 0$ of $x - 8 = 0$
$x = 0$ of $x = 8$
$V = \{0, 8\}$

c) $x^2 + 4 = 0$
$x^2 = -4$
$V = \emptyset$

d) $5x + 3x^2 = 0$
$x(5 + 3x) = 0$
$x = 0$ of $5 + 3x = 0$
$x = 0$ of $3x = -5$
$x = 0$ of $x = \frac{-5}{3}$
$V = \{-\frac{5}{3}, 0\}$

--- PAGE 15 ---
7
Bereken de discriminant van de volgende vierkantsvergelijkingen. Hoeveel oplossingen heeft de vierkantsvergelijking?

a) $2x^2 + 6x - 5 = 0$
$D = b^2 - 4ac \Rightarrow D > 0 \Rightarrow$ De vierkantsvergelijking heeft 2 oplossingen.
$= 36 - 4 \cdot 2 \cdot (-5)$
$= 36 + 40$
$= 76$

b) $x^2 + x + 4 = 0$
$D = 1^2 - 4 \cdot 1 \cdot 4 \Rightarrow D < 0 \Rightarrow$ De vierkantsvergelijking heeft geen oplossingen.
$= 1 - 16$
$= -15$

c) $3x^2 - 6x + 3 = 0$
$D = (-6)^2 - 4 \cdot 3 \cdot 3 \Rightarrow D = 0 \Rightarrow$ De vierkantsvergelijking heeft 1 oplossing.
$= 36 - 36$
$= 0$

8
Los de volgende vierkantsvergelijkingen met de wortelformule op. Leg het verband tussen de oplossing van de vergelijking en de grafiek van de verwante tweedegraadsfunctie.

a) $2x^2 = 7x - 3$
$2x^2 - 7x + 3 = 0$
$D = 49 - 4 \cdot 2 \cdot 3$
$= 49 - 24$
$= 25$
$x_1 = \frac{-(-7) + \sqrt{25}}{2 \cdot 2} = \frac{7 + 5}{4} = \frac{12}{4} = 3$
$x_2 = \frac{-(-7) - \sqrt{25}}{2 \cdot 2} = \frac{7 - 5}{4} = \frac{2}{4} = \frac{1}{2}$
$V = \{\frac{1}{2}, 3\}$
De grafiek snijdt de x-as in $(\frac{1}{2}, 0)$ en $(3, 0)$.

b) $8x^2 + 2x - 1 = 0$
$D = 2^2 - 4 \cdot 8 \cdot (-1)$
$= 4 + 32$
$= 36$
$x_1 = \frac{-2 + 6}{2 \cdot 8} = \frac{4}{16} = \frac{1}{4}$
$x_2 = \frac{-2 - 6}{2 \cdot 8} = \frac{-8}{16} = -\frac{1}{2}$
$V = \{-\frac{1}{2}, \frac{1}{4}\}$
De grafiek snijdt de x-as in $(-\frac{1}{2}, 0)$ en $(\frac{1}{4}, 0)$.

--- PAGE 16 ---
c) $-x^2 + 4x - 5 = 0$
$D = 16 - 4 \cdot (-1) \cdot (-5)$
$= 16 - 20$
$= -4$
$V = \emptyset$
De grafiek snijdt de x-as niet.

d) $16x^2 - 8x + 1 = 0$
$D = (-8)^2 - 4 \cdot 16 \cdot 1$
$= 64 - 64$
$= 0$
$x_1 = x_2 = \frac{-(-8)}{2 \cdot 16} = \frac{8}{32} = \frac{1}{4}$
$V = \{\frac{1}{4}\}$
De parabool raakt de x-as.
De top is $(\frac{1}{4}, 0)$.

9
Ontbind, indien mogelijk, de veeltermen van de tweede graad in factoren.

a) $-3x^2 - 5x + 2$
$\cdot D = (-5)^2 - 4 \cdot (-3) \cdot 2$
$= 25 + 24$
$= 49$
$\cdot x_1 = \frac{-(-5) + 7}{2 \cdot (-3)} = \frac{5 + 7}{-6} = \frac{12}{-6} = -2$
$x_2 = \frac{-(-5) - 7}{2 \cdot (-3)} = \frac{-2}{-6} = \frac{1}{3}$
$\cdot -3x^2 - 5x + 2 = -3(x + 2)(x - \frac{1}{3})$

b) $16x^2 - 56x + 49$
$(4x - 7)^2$

c) $-2x^2 + 5x - 8$
$D = 5^2 - 4 \cdot (-2) \cdot -8$
$D = 25 - 64$
$D = -39$
Geen oplossing, niet te ontbinden in factoren.

--- PAGE 17 ---
# 3 Problemen oplossen met tweedegraadsvergelijkingen

**Voorbeeld 1**
De som van de kwadraten van twee opeenvolgende gehele getallen is 265. Welke zijn deze twee getallen?

**Oplossing**
*   Onbekenden: het eerste getal: $x$
    het daaropvolgende getal: $x + 1$
*   Vergelijking:
    $x^2 + (x + 1)^2 = 265$
    $x^2 + x^2 + 2x + 1 - 265 = 0$
    $2x^2 + 2x - 264 = 0$
    $x^2 + x - 132 = 0$
    $D = b^2 - 4 \cdot a \cdot c$
    $= 1^2 - 4 \cdot 1 \cdot (-132)$
    $= 1 + 528$
    $= 529$
    $x_1 = \frac{-b + \sqrt{D}}{2a}$
    $= \frac{-1 + \sqrt{529}}{2 \cdot 1}$
    $= \frac{-1 + 23}{2}$
    $= \frac{22}{2}$
    $= 11$
    $x_2 = \frac{-b - \sqrt{D}}{2a}$
    $= \frac{-1 - \sqrt{529}}{2 \cdot 1}$
    $= \frac{-1 - 23}{2}$
    $= \frac{-24}{2}$
    $= -12$
*   Antwoord: De gezochte getallen zijn 11 en 12 of $-12$ en $-11$.

**Voorbeeld 2**
Een rechthoekig tuintje heeft een oppervlakte van 168 m². Bepaal de lengte en de breedte als je weet dat de lengte 2 m langer is dan de breedte.

**Oplossing**
*   Onbekenden: de lengte van de tuin: $x$
    de breedte van de tuin: $y = x - 2$
*   Vergelijking:
    $x \cdot y = 168$
    $x \cdot (x - 2) = 168$
    $x^2 - 2x - 168 = 0$
    $D = b^2 - 4 \cdot a \cdot c$
    $= (-2)^2 - 4 \cdot 1 \cdot (-168)$
    $= 4 + 672$
    $= 676$
    $x_1 = \frac{-b + \sqrt{D}}{2a}$
    $= \frac{-(-2) + \sqrt{676}}{2 \cdot 1}$
    $= \frac{2 + 26}{2}$
    $= \frac{28}{2}$
    $= 14$
    $x_2 = \frac{-b - \sqrt{D}}{2a}$
    $= \frac{-(-2) - \sqrt{676}}{2 \cdot 1}$
    $= \frac{2 - 26}{2}$
    $= \frac{-24}{2}$
    $= -12$
    Een lengte kan nooit negatief zijn, zodat de tweede oplossing $x_2$ moet verworpen worden.
*   Antwoord: Het rechthoekig tuintje heeft als afmetingen: 14 m x 12 m.

[Afbeelding: Een rechthoek met lengte x en breedte x - 2.]

--- PAGE 18 ---
**Voorbeeld 3**
Een kegel heeft een inhoud van 3350 cm³. De hoogte van de kegel is 32 cm. Bepaal de diameter van deze kegel.

**Oplossing**
De formule voor de inhoud van een kegel is $V = \frac{1}{3}\pi r^2h$.
Na de substitutie $r = \frac{d}{2}$ bekomt men $V = \frac{1}{3}\pi \left(\frac{d^2}{4}\right)h$
$V = \frac{1}{12}\pi d^2h$
De onbekende in deze vergelijking is de diameter d.
$d^2 = \frac{12V}{\pi h}$
$d = \sqrt{\frac{12V}{\pi h}}$
$d = \sqrt{\frac{12 \cdot 3350\text{ cm}^3}{\pi \cdot 32\text{ cm}}} \approx 20,00\text{ cm}$

[Afbeelding: Een driedimensionale tekening van een kegel met hoogte aangeduid als 32 cm en de straal van het grondvlak aangeduid met r.]

**TIP**
$\left(\frac{d}{2}\right)^2 = \frac{d^2}{4}$ vermits $\left(\frac{a}{b}\right)^2 = \frac{a^2}{b^2}$

## Verwerkingsopdracht
(icoon met 5)

10
Een rechthoekige tuin heeft een oppervlakte van 264 m². De lengte is 8 meter langer dan de breedte. Bepaal de lengte en de breedte van de tuin.
*   Onbekenden: de lengte: $x$
    de breedte: $y = x - 8$
*   Vergelijking:
    $\circ \quad x \cdot (x - 8) = 264$
    $x^2 - 8x - 264 = 0$
    $\circ \quad D = (-8)^2 - 4 \cdot 1 \cdot (-264)$
    $= 1120$
    $\circ \quad x_1 = \frac{-(-8) + \sqrt{1120}}{2 \cdot 1}$
    $= \frac{8 + \sqrt{1120}}{2}$
    $= \frac{8 + 4\sqrt{70}}{2}$
    $= 4 + 2\sqrt{70}$
    $\approx 20,73$
    $x_2 = \frac{-(-8) - \sqrt{1120}}{2}$
    $= \frac{8 - 4\sqrt{70}}{2}$
    $= 4 - 2\sqrt{70}$
    $(< 0)$
*   Antwoord: De lengte is ongeveer 20,73 m en de breedte is ongeveer 12,73 m.

--- PAGE 19 ---
# 4 Ongelijkheden van de tweede graad

## 4.1 Tekenschema van een tweedegraadsfunctie

| | a < 0 | a > 0 |
| :--- | :--- | :--- |
| **D < 0** | [Afbeelding: Grafiek van een bergparabool die volledig onder de x-as ligt.] <br> $x$ | $-\infty$ | $+\infty$ <br> $f(x)$ | $-$ | [Afbeelding: Grafiek van een dalparabool die volledig boven de x-as ligt.] <br> $x$ | $-\infty$ | $+\infty$ <br> $f(x)$ | $+$ |
| **D = 0** | [Afbeelding: Grafiek van een bergparabool die de x-as raakt in het punt $x_1=x_2=\frac{-b}{2a}$.] <br> $x$ | $-\infty$ | $\frac{-b}{2a}$ | $+\infty$ <br> $f(x)$ | $-$ | $0$ | $-$ | [Afbeelding: Grafiek van een dalparabool die de x-as raakt in het punt $x_1=x_2=\frac{-b}{2a}$.] <br> $x$ | $-\infty$ | $\frac{-b}{2a}$ | $+\infty$ <br> $f(x)$ | $+$ | $0$ | $+$ |
| **D > 0** | [Afbeelding: Grafiek van een bergparabool die de x-as snijdt in de punten $x_1$ en $x_2$.] <br> $x$ | $-\infty$ | $x_1$ | $x_2$ | $+\infty$ <br> $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ | [Afbeelding: Grafiek van een dalparabool die de x-as snijdt in de punten $x_1$ en $x_2$.] <br> $x$ | $-\infty$ | $x_1$ | $x_2$ | $+\infty$ <br> $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |

**Merk op** $\rightarrow$
*   Als $D < 0$, dan ligt de parabool volledig onder of volledig boven de x-as. De functiewaarden $f(x)$ veranderen niet van teken.
*   Als $D = 0$, dan raakt de parabool aan de x-as. De top is het enige punt waar de functiewaarde nul wordt.

--- PAGE 20 ---
## 4.2 Tweedegraadsongelijkheden grafisch oplossen

Net zoals eerstegraadsongelijkheden kun je ook tweedegraadsongelijkheden grafisch oplossen.

**Voorbeeld 1**
Als je de ongelijkheid $x^2 - 4 < 0$ grafisch oplost, vraag je je af voor welke waarden van $x$ de grafiek van de functie $f$ met voorschrift $f(x) = x^2 - 4$ zich onder de x-as ($y = 0$) bevindt.

We stellen vast dat als $x \in \left]-2, 2\right[$, dan is $f(x) < 0$.

Ook uit de tekentabel van de functie $f$ kun je dit afleiden.

| $x$ | | -2 | | 2 | |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | + | 0 | - | 0 | + |

De oplossingenverzameling $V = \left]-2, 2\right[$.

Op de getallenas:
[Afbeelding: Een getallenas waarop het open interval ]-2, 2[ in het groen is gemarkeerd. De grenzen -2 en 2 zijn aangeduid met open cirkels. Boven de groene lijn staat een minteken, boven de ongemerkte delen staan plustekens.]

[Afbeelding: Een grafiek toont de dalparabool $f(x) = x^2 - 4$. De parabool snijdt de x-as in (-2,0) en (2,0). Het gedeelte van de parabool onder de x-as is groen gekleurd. Het interval ]-2, 2[ op de x-as is ook groen gekleurd.]

**Voorbeeld 2**
Als je de ongelijkheid $-0,25x^2 + 2x + 9 < \frac{1}{2}x + 5$ grafisch oplost, vraag je je af voor welke waarden van $x$ de grafiek van de functie $f$ met voorschrift $f(x) = -0,25x^2 + 2x + 9$ onder de grafiek van de functie $g$ met voorschrift $g(x) = \frac{1}{2}x + 5$ ligt.

We stellen vast: $f(x) < g(x)$ als $x \in \left]-\infty, -2\right[$ of als $x \in \left]8, +\infty\right[$.

De oplossingenverzameling $V = \left]-\infty, -2\right[ \cup \left]8, +\infty\right[$.

Op de getallenas:
[Afbeelding: Een getallenas waarop de open intervallen ]-∞, -2[ en ]8, +∞[ in het groen zijn gemarkeerd. De grenzen -2 en 8 zijn aangeduid met open cirkels. Boven de groene lijnen staan mintekens, boven het ongemerkte deel staat een plusteken.]

[Afbeelding: Een grafiek toont de bergparabool $f(x) = -0,25x^2 + 2x + 9$ (rode curve) en de rechte $g(x) = \frac{1}{2}x + 5$ (groene rechte). Ze snijden in de punten (-2, 4) en (8, 9). Het gebied waar de parabool onder de rechte ligt (voor $x < -2$ en $x > 8$) is groen gemarkeerd op de x-as.]

**Merk op** $\rightarrow$
Je kan de oplossingenverzameling in dit voorbeeld ook noteren als $V = \mathbb{R} \setminus [-2, 8]$.

--- PAGE 21 ---
**Voorbeeld 3**
Als je de ongelijkheid $-x^2 - 3x + 7 \geqslant x^2 + 3x - 1$ grafisch oplost, vraag je je af voor welke waarden van $x$ de grafiek van de functie $f$ met voorschrift $f(x) = -x^2 - 3x + 7$ de grafiek van de functie $g$ met voorschrift $g(x) = x^2 + 3x - 1$ snijdt of zich erboven bevindt.

De oplossingenverzameling $V = [-4, 1]$.

Op de getallenas:
[Afbeelding: Een getallenas waarop het gesloten interval [-4, 1] in het groen is gemarkeerd. De grenzen -4 en 1 zijn aangeduid met gesloten cirkels. Boven de groene lijn staat een plusteken, boven de ongemerkte delen staan mintekens.]

[Afbeelding: Een grafiek toont de bergparabool $f(x) = -x^2 - 3x + 7$ (rode curve) en de dalparabool $g(x) = x^2 + 3x - 1$ (groene curve). Ze snijden in de punten (-4, 3) en (1, 3). Het gebied waar de rode parabool boven de groene parabool ligt (voor $-4 \leqslant x \leqslant 1$) is groen gemarkeerd op de x-as.]

**Merk op** $\rightarrow$
Het is ook mogelijk dat de oplossingenverzameling $V = \mathbb{R}$ is of $V = \emptyset$.

In de voorbeelden zijn de snijpunten van de grafieken altijd eenvoudig af te lezen waardoor het grafisch bepalen van de oplossing gemakkelijk is. Bij tweedegraadsongelijkheden waar dit niet het geval is, zal je algebraïsch moeten werken.

Deze grafische methode kan zeker ook gebruikt worden bij het oplossen van problemen.

**Voorbeeld**
Je kunt een rivier oversteken via een brug. De brugconstructie kan beschreven worden met de grafiek van de functie $h$ met voorschrift $h(x) = -0,2x^2 + 1,2x$.

Als je de brug oversteekt, over welke afstand bevind je je dan hoger dan 1 m van de grond?

De ongelijkheid wordt dan $-0,2x^2 + 1,2x > 1$.

Als we gebruik maken van een grafiek, dan geven we de grafiek van $h$ weer en de rechte met vergelijking $y = 1$.

Je leest af dat je je hoger dan 1 m bevindt als $x \in \left]1, 5\right[$.

De oplossingenverzameling $V = \left]1, 5\right[$.

Antwoord: Bij een horizontale verplaatsing van 1 meter tot 5 meter bevind je je hoger dan 1 m boven de grond.

[Afbeelding: Een grafiek toont een bergparabool die een brug voorstelt. De vergelijking is $h(x) = -0,2x^2 + 1,2x$ (rode curve). Een horizontale groene lijn is getekend op hoogte $y=1$. Het gebied onder de parabool en boven de lijn $y=1$ is lichtgroen gekleurd. Dit komt overeen met het interval ]1, 5[ op de x-as. De horizontale afstand van de brug is 6 (van 0 tot 6). De parabool bevindt zich boven $y=1$ voor $x$ tussen 1 en 5.]

--- PAGE 22 ---
## 4.3 Tweedegraadsongelijkheden algebraïsch oplossen

Je kan ook een tweedegraadsongelijkheid algebraïsch oplossen om daarna gebruik te maken van de tekentabel.

**Hoe los je een ongelijkheid van de tweede graad op?**
| methode | STAP 1: | Herleid de ongelijkheid tot de vorm $f(x) < 0$ ($f(x) \leqslant 0$, $f(x) > 0$ of $f(x) \geqslant 0$). |
| :--- | :--- | :--- |
| | STAP 2: | Stel het tekenschema van de tweedegraadsfunctie $f$ op. |
| | STAP 3: | Kies die x-waarden waarvoor de functiewaarden (strikt) positief of negatief zijn. |
| | | $f(x) < 0$ kies - in tekenschema |
| | | $f(x) \leqslant 0$ kies - en 0 in tekenschema |
| | | $f(x) > 0$ kies + in tekenschema |
| | | $f(x) \geqslant 0$ kies + en 0 in tekenschema |

**Voorbeeld 1**
$-6x^2 + x + 15 \geqslant 0$

**Stap 1: Bepaal de nulwaarden van $-6x^2 + x + 15$.**
$D = b^2 - 4ac$
$= 1^2 - 4 \cdot (-6) \cdot 15$
$= 361 \rightarrow \text{2 oplossingen}$

$x_1 = \frac{-1 + \sqrt{361}}{2 \cdot (-6)} = \frac{18}{-12} = \frac{-3}{2}$
$x_2 = \frac{-1 - \sqrt{361}}{2 \cdot (-6)} = \frac{-20}{-12} = \frac{5}{3}$

**Stap 2: Stel de tekentabel op.**
| $x$ | | $\frac{-3}{2}$ | | $\frac{5}{3}$ | |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |

**Stap 3: Noteer de oplossingenverzameling.**
$V = \left[\frac{-3}{2}, \frac{5}{3}\right]$

**Voorbeeld 2**
$x^2 + 3x - 1 > 3(x + 2)$

**Stap 1: Herschrijf de ongelijkheid.**
$x^2 + 3x - 1 > 3(x + 2)$
$x^2 + 3x - 1 > 3x + 6$
$x^2 + 3x - 1 - 3x - 6 > 0$
$x^2 - 7 > 0$
$(x + \sqrt{7})(x - \sqrt{7}) > 0$

**Stap 2: Stel de tekentabel op.**
| $x$ | | $-\sqrt{7}$ | | $\sqrt{7}$ | |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |

**Stap 3: Noteer de oplossingenverzameling.**
$V = \left]-\infty, -\sqrt{7}\right[ \cup \left]\sqrt{7}, +\infty\right[$

--- PAGE 23 ---
## Verwerkingsopdrachten
(icoon met 6, 7, 8, 9)

11
Los de tweedegraadsvergelijkingen in $x$ grafisch op met behulp van ICT. Noteer de oplossingenverzameling en stel ze voor op de reële getallenas.

a) $x^2 - 4x + 3 < 0$
$V = \left]1, 3\right[$
[Afbeelding: Een getallenas waarop het open interval ]1, 3[ in het paars is gemarkeerd. De grenzen 1 en 3 zijn aangeduid met open cirkels. Boven de rechterkant van de as staat '$\mathbb{R}$'.]

b) $\frac{1}{2}x^2 - \frac{5}{2}x - 12 > 0$
$V = \left]-\infty, -3\right[ \cup \left]8, +\infty\right[$
[Afbeelding: Een getallenas waarop de open intervallen ]-∞, -3[ en ]8, +∞[ in het paars zijn gemarkeerd. De grenzen -3 en 8 zijn aangeduid met open cirkels. Boven de rechterkant van de as staat '$\mathbb{R}$'.]

c) $x^2 - 2x \leqslant 6 - x$
$x^2 - 2x + x - 6 \leqslant 0$
$x^2 - x - 6 \leqslant 0$
$V = [-2, 3]$
[Afbeelding: Een getallenas waarop het gesloten interval [-2, 3] in het paars is gemarkeerd. De grenzen -2 en 3 zijn aangeduid met gesloten cirkels. Boven de rechterkant van de as staat '$\mathbb{R}$'.]

d) $4x^2 + 3 > -x^2 + 5x - 1$
$4x^2 + 3 + x^2 - 5x + 1 > 0$
$5x^2 - 5x + 4 > 0$
$V = \mathbb{R}$
[Afbeelding: Een getallenas die volledig in het paars is gemarkeerd. Boven de rechterkant van de as staat '$\mathbb{R}$'.]

--- PAGE 24 ---
12
Los op met behulp van ICT.
Een rechthoek heeft een lengte die dubbel zo groot is als de breedte. Voor welke afmetingen is de oppervlakte van deze rechthoek kleiner dan 98 cm²?

$A_{\text{rechthoek}} = l \cdot b$
$A = 2b \cdot b$
$A = 2b^2$

$2b^2 < 98$
$2b^2 - 98 < 0$

$V = \left]-7, 7\right[$

Antwoord: Om een oppervlakte kleiner dan 98 cm² te hebben, moet de breedte kleiner zijn dan 7 cm en de lengte kleiner dan 14 cm.

Op basis van de functie kan je besluiten dat het reële interval $\left]-7, 7\right[$ is, maar aangezien het om een lengte gaat, moet dit een een positieve waarde hebben, waardoor het realistische interval in dit vraagstuk $\left]0, 7\right[$ wordt.

13
Los de tweedegraadsongelijkheden algebraïsch op en noteer de oplossingenverzameling.

a) $-5x^2 + 30x - 60 < -6x + 4$
$-5x^2 + 30x + 6x - 60 - 4 < 0$
$-5x^2 + 36x - 64 < 0$

$D = b^2 - 4ac$
$D = 36^2 - 4 \cdot (-5) \cdot (-64)$
$D = 16$
2 oplossingen
$x_1 = \frac{-36 + \sqrt{16}}{2 \cdot (-5)} = \frac{16}{5}$
$x_2 = \frac{-36 - \sqrt{16}}{2 \cdot (-5)} = 4$

| $x$ | | $\frac{16}{5}$ | | $4$ | |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |

$V = \left]-\infty, \frac{16}{5}\right[ \cup \left]4, +\infty\right[$

b) $x^2 - 8x + 4 \geqslant -2x^2 + 4x - 8$
$x^2 - 8x + 4 + 2x^2 - 4x + 8 \geqslant 0$
$3x^2 - 12x + 12 \geqslant 0$

$D = (-12)^2 - 4 \cdot 3 \cdot (12)$
$D = 0$
1 oplossing
$x = \frac{12}{2 \cdot 3}$
$x = 2$

| $x$ | | $2$ | |
| :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $+$ |

$V = \mathbb{R}$

--- PAGE 25 ---
# 5 Snijpunten van een rechte en een parabool

## 5.1 Coördinaten van snijpunt(en) bepalen

We zoeken de gemeenschappelijke punten van de parabool p en de rechte r met als vergelijkingen
$p \leftrightarrow y = x^2 + 4x - 7$
$r \leftrightarrow y = 2x + 1$
De x- en y-coördinaten van de snijpunten zijn de oplossingen van het stelsel
$\begin{cases} y = x^2 + 4x - 7 \\ y = 2x + 1 \end{cases}$

[Afbeelding: Een grafiek toont de dalparabool $p \leftrightarrow y = x^2 + 4x - 7$ (rode curve) en de rechte $r \leftrightarrow y = 2x + 1$ (rode rechte). De snijpunten van de parabool en de rechte zijn gemarkeerd met rode stippen en aangeduid als $S_1$ en $S_2$. $S_1$ ligt bij (-4, -7) en $S_2$ bij (2, 5).]

In beide vergelijkingen kan men de onbekende $y$ in het linkerlid plaatsen. Stel de twee rechterleden aan elkaar gelijk.
$x^2 + 4x - 7 = 2x + 1$
$x^2 + 4x - 2x - 7 - 1 = 0$
$x^2 + 2x - 8 = 0$
Men bekomt een tweedegraadsvergelijking in de onbekende $x$. De oplossing(en) van deze vergelijking zijn de x-coördinaten van de gezochte snijpunten.
$x_1 = -4$ of $x_2 = 2$
De y-coördinaten van de snijpunten vindt men door de gevonden x-coördinaten in één van de vergelijkingen (de rechte of de parabool, naar keuze) in te vullen. Laten we de x-waarden in de vergelijking van de rechte invullen.
$y_1 = 2x_1 + 1 = 2 \cdot (-4) + 1 = -7$
$y_2 = 2x_2 + 1 = 2 \cdot 2 + 1 = 5$
Antwoord: De coördinaten van de snijpunten van de rechte r en de parabool p zijn $S_1(-4, -7)$ en $S_2(2, 5)$.

--- PAGE 26 ---
## 5.2 Aantal snijpunten

| DE RECHTE SNIJDT DE PARABOOL | DE RECHTE RAAKT DE PARABOOL | DE RECHTE SNIJDT DE PARABOOL NIET |
| :--- | :--- | :--- |
| [Afbeelding: Grafiek van een dalparabool p die op twee punten gesneden wordt door een stijgende rechte r.] | [Afbeelding: Grafiek van een dalparabool p die in één punt geraakt wordt door een dalende rechte r.] | [Afbeelding: Grafiek van een dalparabool p en een dalende rechte r die elkaar nergens snijden.] |
| twee snijpunten | één snijpunt | geen snijpunten |
| er zijn twee verschillende oplossingen | er zijn twee gelijke oplossingen | er zijn geen oplossingen |
| $D > 0$ | $D = 0$ | $D < 0$ |

**Merk op** $\rightarrow$
De volgende relatie bestaat tussen het oplossen van (on)gelijkheden en de onderlinge ligging van een rechte en een parabool. Veronderstel dat de vergelijking van de parabool $y = f(x)$ en de vergelijking van de rechte $y = g(x)$ is.

| (ON)GELIJKHEID | DE OPLOSSINGENVERZAMELING GEEFT JE ... |
| :--- | :--- |
| $f(x) = g(x)$ | de x-coördinaten van de snijpunten van de rechte en de parabool |
| $f(x) > g(x)$ | de x-coördinaten van de punten op de parabool die **boven** de rechte liggen |
| $f(x) < g(x)$ | de x-coördinaten van de punten op de parabool die **onder** de rechte liggen |

## Verwerkingsopdracht
(icoon met 10)

14
Bepaal de snijpunten van de rechte r en de parabool p.
$p \leftrightarrow y = -x^2 - 6x - 6$
$r \leftrightarrow y = x + 4$

$\bullet \begin{cases} y = -x^2 - 6x - 6 \\ y = x + 4 \end{cases}$
$-x^2 - 6x - 6 = x + 4$
$-x^2 - 7x - 10 = 0$

$D = (-7)^2 - 4 \cdot (-1) \cdot (-10)$
$= 49 - 40$
$= 9$

$x_1 = \frac{7 + 3}{2 \cdot (-1)}$
$= \frac{10}{-2}$
$= -5$

$x_2 = \frac{7 - 3}{-2}$
$= \frac{4}{-2}$
$= -2$

$\bullet y_1 = -5 + 4$
$= -1$

$\bullet y_2 = -2 + 4$
$= 2$

$\bullet$ Antwoord: De coördinaten van de snijpunten van de rechte r en de parabool p zijn $S_1(-5, -1)$ en $S_2(-2, 2)$.

--- PAGE 27 ---
# Signaaloefeningen

1
Ontbind in zoveel mogelijk factoren.

a) $3a^4 - 15a^2 - 18a = 3a(a^3 - 5a - 6)$

b) $9m^6 - 25 = (3m^3 - 5)(3m^3 + 5)$

c) $p^2 - 25 = (p - 5)(p + 5)$

d) $-3a^3 + 21a^2 - 15a = -3a(a^2 - 7a + 5)$

e) $9x^2 - 11 = (3x - \sqrt{11})(3x + \sqrt{11})$

f) $\pi x^2 - 2\pi x + \pi = \pi(x^2 - 2x + 1)$
$= \pi(x - 1)^2$

g) $4x^2 - 12xy + 9y^2 = (2x - 3y)^2$

h) $8x^2 - 24x + 18 = 2(4x^2 - 12x + 9)$
$= 2(2x - 3)^2$

i) $9x^2 + 6x + 1 = (3x + 1)^2$

j) $12x^2 - 27 = 3(4x^2 - 9)$
$= 3(2x - 3)(2x + 3)$

k) $x^2 - \sqrt{12}x + 3 = x^2 - \sqrt{4 \cdot 3}x + 3$
$= x^2 - 2\sqrt{3}x + 3$
$= (x - \sqrt{3})^2$

l) $-5x^2 + 25 = -5(x^2 - 5)$
$= -5(x + \sqrt{5})(x - \sqrt{5})$

>>> Verder oefenen: D1 t.e.m. D11

--- PAGE 28 ---
2
Los de tweedegraadsvergelijkingen op zonder de discriminant te berekenen.

a) $3x^2 - 21 = 0$
$3(x^2 - 7) = 0$
$x^2 - 7 = 0$
$x^2 = 7$
$x_1 = \sqrt{7}$
$x_2 = -\sqrt{7}$

b) $-7x^2 + 5x = 0$
$x(-7x + 5) = 0$
$x_1 = 0$
$-7x + 5 = 0$
$-7x = -5$
$x = \frac{-5}{-7}$
$x_2 = \frac{5}{7}$

c) $\frac{1}{4}x^2 + 3x + 9 = 0$
$4(\frac{1}{4}x^2 + 3x + 9) = 4 \cdot 0$
$x^2 + 12x + 36 = 0$
$(x + 6)^2 = 0$
$x + 6 = 0$
$x = -6$

>>> Verder oefenen: D12 t.e.m. D39

3
Los de tweedegraadsvergelijkingen op met behulp van de discriminant.

a) $27x^2 - 6x - 5 = 0$
$D = (-6)^2 - 4 \cdot 27 \cdot (-5)$
$D = 576$
$x_1 = \frac{6 + \sqrt{576}}{2 \cdot 27} = \frac{5}{9}$
$x_2 = \frac{6 - \sqrt{576}}{2 \cdot 27} = -\frac{1}{3}$
$V = \left\{-\frac{1}{3}, \frac{5}{9}\right\}$

b) $4x^2 - 8x + 5 = -2(10x + 2)$
$4x^2 - 8x + 5 = -20x - 4$
$4x^2 - 8x + 5 + 20x + 4 = 0$
$4x^2 + 12x + 9 = 0$
$D = 12^2 - 4 \cdot 4 \cdot 9$
$D = 0$
$x = \frac{-12}{2 \cdot 4} = \frac{-3}{2}$
$V = \left\{-\frac{3}{2}\right\}$

>>> Verder oefenen: D12 t.e.m. D39

4
Ontbind, indien mogelijk, in factoren.

a) $9x^2 + 42x + 49 = (3x + 7)^2$

b) $2x^2 - 5x + 6$
niet mogelijk

c) $15x^2 + 22x - 16$
$15x^2 + 22x - 16 = 0$
$D = 22^2 - 4 \cdot 15 \cdot (-16)$
$= 1444$
$x_1 = \frac{-22 + 38}{2 \cdot 15} = \frac{8}{15}$
$x_2 = \frac{-22 - 38}{2 \cdot 15} = -2$
$15x^2 + 22x - 16 = 15(x - \frac{8}{15})(x + 2)$

>>> Verder oefenen: D12 t.e.m. D39

--- PAGE 29 ---
5
De schuine zijde van een rechthoekige driehoek is 35 cm lang. Het verschil van de lengtes van de rechthoekszijden is 7 cm. Bepaal de lengte van de twee rechthoekszijden van de driehoek.
$\bullet$ Onbekenden: rechthoekszijde 1: $x$
rechthoekszijde 2: $x - 7$
$\bullet$ Vergelijking: $35^2 = x^2 + (x - 7)^2$
$35^2 = x^2 + x^2 - 14x + 49$
$35^2 = 2x^2 - 14x + 49$
$0 = 2x^2 - 14x - 1176$
$\circ \quad D = (-14)^2 - 4 \cdot 2 \cdot (-1176)$
$= 196 + 9408$
$= 9604$
$\circ \quad x_1 = \frac{14 + \sqrt{9604}}{2 \cdot 2}$
$= \frac{112}{4}$
$= 28$
$x_2 = \frac{14 - \sqrt{9604}}{2 \cdot 2}$
$= \frac{-84}{4}$
$= -21$
$\circ \quad x - 7 = 28 - 7 = 21 \quad (< 0)$
$\bullet$ Antwoord: De rechthoekszijden zijn 21 cm en 28 cm lang.

>>> Verder oefenen: D40 t.e.m. D53

6
Los de tweedegraadsongelijkheden in x grafisch op met behulp van ICT.
Noteer de oplossingenverzameling en stel ze voor op de reële getallenas.

a) $2x^2 + 2 < 5x$
$2x^2 - 5x + 2 < 0$
$V = \left]\frac{1}{2}, 2\right[$
[Afbeelding: Een getallenas waarop het open interval ]1/2, 2[ in het paars is gemarkeerd. De grenzen 1/2 en 2 zijn aangeduid met open cirkels. Boven de rechterkant van de as staat '$\mathbb{R}$'.]

b) $x^2 - 2x \geqslant -x^2 + x + 5$
$x^2 - 2x + x^2 - x - 5 \geqslant 0$
$2x^2 - 3x - 5 \geqslant 0$
$V = \left]-\infty, -1\right] \cup \left[\frac{5}{2}, +\infty\right[$
[Afbeelding: Een getallenas waarop de half-open intervallen ]-∞, -1] en [5/2, +∞[ in het paars zijn gemarkeerd. De grenzen -1 en 5/2 zijn aangeduid met gesloten cirkels. Boven de rechterkant van de as staat '$\mathbb{R}$'.]

>>> Verder oefenen: D54 t.e.m. D77

--- PAGE 30 ---
7
Los op met behulp van ICT.
Een bal wordt verticaal in de lucht gelanceerd. Je vindt de hoogte van de bal in functie van de tijd (in seconden) met behulp van de functie h met voorschrift $h(t) = -5t^2 + 30t + 1,2$. Gedurende hoeveel tijd bevindt de bal zich boven 30 m?
$-5t^2 + 30t + 1,2 > 30$
$-5t^2 + 30t + 1,2 - 30 > 0$
$-5t^2 + 30t - 28,8 > 0$
$V = \left]\frac{6}{5}, \frac{24}{5}\right[$
$\frac{24}{5} - \frac{6}{5} = \frac{18}{5} = 3,6\text{ s}$
Antwoord: De bal is gedurende 3,6 seconden boven de 30 m.

>>> Verder oefenen: D54 t.e.m. D77

8
Los de tweedegraadsongelijkheden algebraïsch op en noteer de oplossingenverzameling.

a) $6x^2 + 17x - 14 \geqslant 0$
$D = 17^2 - 4 \cdot 6 \cdot (-14)$
$D = 625$
$x_1 = \frac{-17 + \sqrt{625}}{2 \cdot 6} = \frac{2}{3}$
$x_2 = \frac{-17 - \sqrt{625}}{2 \cdot 6} = -\frac{7}{2}$

| $x$ | | $-\frac{7}{2}$ | | $\frac{2}{3}$ | |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |

$V = \left]-\infty, -\frac{7}{2}\right] \cup \left[\frac{2}{3}, +\infty\right[$

b) $(2x - 1)(x + 4) < (2x + 1)(x - 3)$
$2x^2 - x + 8x - 4 < 2x^2 + x - 6x - 3$
$2x^2 + 7x - 4 < 2x^2 - 5x - 3$
$2x^2 + 7x - 2x^2 + 5x < -3 + 4$
$12x < 1$
$x < \frac{1}{12}$
$V = \left]-\infty, \frac{1}{12}\right[$

>>> Verder oefenen: D54 t.e.m. D77

--- PAGE 31 ---
9
Voor welke waarde van x is de functiewaarde $f(x) = 2x^2 - 5x + 6$ minstens 4? Welke ongelijkheid moet je hiervoor oplossen?
$4 \leqslant 2x^2 - 5x + 6$
$0 \leqslant 2x^2 - 5x + 2$
$\bullet \quad D = 25 - 4 \cdot 2 \cdot 2$
$= 25 - 16$
$= 9$
$\bullet \quad x_1 = \frac{5 + \sqrt{9}}{2 \cdot 2} = \frac{8}{4} = 2$
$x_2 = \frac{5 - \sqrt{9}}{2 \cdot 2} = \frac{2}{4} = \frac{1}{2}$
$\bullet \quad V = \left]-\infty, \frac{1}{2}\right] \cup \left[2, +\infty\right[$

>>> Verder oefenen: D54 t.e.m. D77

10
Bepaal de snijpunten van de rechte r en de parabool p met vergelijkingen
$p \leftrightarrow y = 2x^2 - x + 10$
$r \leftrightarrow y = 4(x + 1)$
$\bullet \quad 2x^2 - x + 10 = 4(x + 1)$
$2x^2 - x + 10 = 4x + 4$
$2x^2 - x + 10 - 4x - 4 = 0$
$2x^2 - 5x + 6 = 0$
$\bullet \quad D = 25 - 4 \cdot 2 \cdot 6$
$D < 0$
Er zijn geen snijpunten.

>>> Verder oefenen: D78 t.e.m. D83

--- PAGE 32 ---
# Differentiatietraject

1
Vul aan met = of $\neq$.

a) $x^2 - 3 \dots (x + \sqrt{3})(x - \sqrt{3})$
$=$
$x^2 - 3 = (x + \sqrt{3})(x - \sqrt{3})$
$x^2 - (\sqrt{3})^2$

b) $\sqrt{3}x^2 + \sqrt{12} \dots \sqrt{3}(x^2 + 4)$
$=$
$\sqrt{3}x^2 + \sqrt{12} = \sqrt{3}(x^2 + 4)$
$\sqrt{3}x^2 + \sqrt{4 \cdot 3}$
$\sqrt{3}x^2 + 2\sqrt{3}$
$\sqrt{3}(x^2 + 2)$

c) $x^2 - 2\sqrt{7}x + 7 \dots (x - \sqrt{7})^2$
$=$
$x^2 - 2\sqrt{7}x + 7 = (x - \sqrt{7})^2$
$x^2 - 2x\sqrt{7} + (\sqrt{7})^2$

d) $\sqrt{8}x^3 + \sqrt{6}x^2 + \sqrt{2}x \dots \sqrt{2}x(2x^2 + \sqrt{3}x + 1)$
$=$
$\sqrt{8}x^3 + \sqrt{6}x^2 + \sqrt{2}x = \sqrt{2}x(2x^2 + \sqrt{3}x + 1)$
$\sqrt{4 \cdot 2}x^3 + \sqrt{3 \cdot 2}x^2 + \sqrt{2}x$
$2\sqrt{2}x^3 + \sqrt{3}\sqrt{2}x^2 + \sqrt{2}x$
$\sqrt{2}x(2x^2 + \sqrt{3}x + 1)$

e) $13x^2 - 1 \dots (1 + \sqrt{13}x)(-1 + \sqrt{13}x)$
$=$
$13x^2 - 1 = (1 + \sqrt{13}x)(-1 + \sqrt{13}x)$
$(\sqrt{13}x)^2 - 1^2$

f) $x^2 + 5 \dots (x + \sqrt{5})^2$
$\neq$
$x^2 + 5 \neq (x + \sqrt{5})^2$
$x^2 + 2x\sqrt{5} + (\sqrt{5})^2$
$x^2 + 2\sqrt{5}x + 5$

2
Ontbind in factoren. Zonder de gemeenschappelijke factor af.

a) $\sqrt{7}x - 3\sqrt{7} = \sqrt{7}(x - 3)$
b) $2\pi x^2 + 6\pi x + 8\pi = 2\pi(x^2 + 3x + 4)$
c) $\sqrt{5}x^2 + \sqrt{10} = \sqrt{5}x^2 + \sqrt{5 \cdot 2} = \sqrt{5}(x^2 + \sqrt{2})$
d) $\sqrt{3}x^2 + \sqrt{5}x = x(\sqrt{3}x + \sqrt{5})$
e) $x^3 + \sqrt{10}x^2 = x^2(x + \sqrt{10})$
f) $-\sqrt{12}x^2 + \sqrt{8}x - \sqrt{6} = -\sqrt{2 \cdot 6}x^2 + \sqrt{2 \cdot 4}x - \sqrt{2 \cdot 3} = \sqrt{2}(-\sqrt{6}x^2 + 2x - \sqrt{3})$
g) $\sqrt{15}x^3 - \sqrt{21}x^2 = \sqrt{5 \cdot 3}x^3 - \sqrt{7 \cdot 3}x^2 = \sqrt{3}x^2(\sqrt{5}x - \sqrt{7})$
h) $\sqrt{10}x^2 + 3\sqrt{2}x + \sqrt{20} = \sqrt{2 \cdot 5}x^2 + 3\sqrt{2}x + \sqrt{2 \cdot 10} = \sqrt{2}(\sqrt{5}x^2 + 3x + \sqrt{10})$
i) $-2\sqrt{2}x - 4\sqrt{3}x = -2x(\sqrt{2} + 2\sqrt{3})$

--- PAGE 33 ---
3
Ontbind in factoren. Maak gebruik van de formule: $a^2 - b^2 = (a + b)(a - b)$.

a) $x^2 - 17 = (x - \sqrt{17})(x + \sqrt{17})$
b) $15 - x^2 = (\sqrt{15} - x)(\sqrt{15} + x)$
c) $x^6 - 8 = (x^3 - \sqrt{8})(x^3 + \sqrt{8}) = (x^3 - 2\sqrt{2})(x^3 + 2\sqrt{2})$
d) $2x^{10} - 9 = (\sqrt{2}x^5 - 3)(\sqrt{2}x^5 + 3)$
e) $x^2 - \pi = (x - \sqrt{\pi})(x + \sqrt{\pi})$
f) $25x^6 - 10 = (5x^3 - \sqrt{10})(5x^3 + \sqrt{10})$
g) $x^2 - \frac{1}{2} = \left(x - \frac{1}{\sqrt{2}}\right)\left(x + \frac{1}{\sqrt{2}}\right) = \left(x - \frac{\sqrt{2}}{\sqrt{2}\sqrt{2}}\right)\left(x + \frac{\sqrt{2}}{\sqrt{2}\sqrt{2}}\right) = \left(x - \frac{\sqrt{2}}{2}\right)\left(x + \frac{\sqrt{2}}{2}\right)$
h) $3x^2 - 7 = (\sqrt{3}x - \sqrt{7})(\sqrt{3}x + \sqrt{7})$
i) $\frac{25}{9} - 3x^2 = \left(\frac{5}{3} + \sqrt{3}x\right)\left(\frac{5}{3} - \sqrt{3}x\right)$

4
Ontbind in factoren. Maak gebruik van de formule: $a^2 + 2ab + b^2 = (a + b)^2$.

a) $x^2 - 2\sqrt{17}x + 17 = (x - \sqrt{17})^2$
b) $3x^2 + 2\sqrt{3}x + 1 = (\sqrt{3}x + 1)^2$
c) $7x^2 - 2\sqrt{35}x + 5 = (\sqrt{7}x - \sqrt{5})^2$
d) $5x^4 - 4\sqrt{5}x^2 + 4 = (\sqrt{5}x^2 - 2)^2$
e) $16x^6 - 8\sqrt{7}x^3 + 7 = (4x^3 - \sqrt{7})^2$
f) $25a^2 + 10\sqrt{2}a + 2 = (5a + \sqrt{2})^2$
g) $x^2 - 2\pi x + \pi^2 = (x - \pi)^2$
h) $\frac{3}{4}x^2 + \sqrt{3}x + 1 = \left(\frac{\sqrt{3}}{2}x + 1\right)^2$
i) $\frac{1}{2}x^2 + \frac{\sqrt{6}}{3}x + \frac{1}{3} = \left(\frac{1}{\sqrt{2}}x + \frac{1}{\sqrt{3}}\right)^2 = \left(\frac{\sqrt{2}}{\sqrt{2}\sqrt{2}}x + \frac{\sqrt{3}}{\sqrt{3}\sqrt{3}}\right)^2 = \left(\frac{\sqrt{2}}{2}x + \frac{\sqrt{3}}{3}\right)^2$

--- PAGE 34 ---
5
Ontbind in factoren. Zonder de gemeenschappelijke factor af.

a) $7m^4 + 28 = 7(m^4 + 4)$
b) $k^3 - 2k^2 = k^2(k - 2)$
c) $21x^3 - 15x^2 = 3x^2(7x - 5)$
d) $6x^5 - 4x^4 - 8x^3 = 2x^3(3x^2 - 2x - 4)$
e) $4m^2 + 8m + 12 = 4(m^2 + 2m + 3)$
f) $-3x^4 - 5x^2 = -x^2(3x^2 + 5)$
g) $4x^3 + 9x = x(4x^2 + 9)$
h) $9x^2 + 15x - 6 = 3(3x^2 + 5x - 2)$
i) $36x^2 + 24x - 48 = 12(3x^2 + 2x - 4)$
j) $12b^4 + 3a^4 = 3(4b^4 + a^4)$
k) $-15k^3 + 10k^2 - 35k = -5k(3k^2 - 2k + 7)$
l) $-9a^{12} - 27a^9 = -9a^9(a^3 + 3)$
m) $-10x^3 + 9x^2 - 8x = -x(10x^2 - 9x + 8)$
n) $28z^3 - 21z^2 + 14z = 7z(4z^2 - 3z + 2)$
o) $-24x^2 + 12x = -12x(2x - 1)$
p) $4a^3 - 3a^2 - 2a = a(4a^2 - 3a - 2)$
q) $36m^6 + 4m^4 - m^2 = m^2(36m^4 + 2m^2 - 1)$
r) $2p^3 + 10p^2 - 8p = 2p(p^2 + 5p - 4)$

--- PAGE 35 ---
6
Ontbind in factoren door gebruik te maken van één van de merkwaardige producten.

a) $k^2 - 36 = (k - 6)(k + 6)$
b) $m^2 + 10m + 25 = (m + 5)^2$
c) $x^2 - \frac{4}{25} = \left(x - \frac{2}{5}\right)\left(x + \frac{2}{5}\right)$
d) $25 + 10a^4 + a^8 = (5 + a^4)^2$
e) $16a^2 - 4a + \frac{1}{4} = \left(4a - \frac{1}{2}\right)^2$
f) $\frac{100}{9}x^2 - \frac{4}{81} = \left(\frac{10}{3}x - \frac{2}{9}\right)\left(\frac{10}{3}x + \frac{2}{9}\right)$
g) $16z^2 - 1 = (4z - 1)(4z + 1)$
h) $4m^2 - 4m + 1 = (2m - 1)^2$
i) $49x^2 - 14xy + y^2 = (7x - y)^2$
j) $m^{10} - 0,01 = (m^5 - 0,1)(m^5 + 0,1)$
k) $b^6 - 0,36 = (b^3 - 0,6)(b^3 + 0,6)$
l) $9x^2 - 30x + 25 = (3x - 5)^2$
m) $9x^2 + 24x + 16 = (3x + 4)^2$
n) $100x^6 - 121 = (10x^3 - 11)(10x^3 + 11)$
o) $81b^2 - 36b + 4 = (9b - 2)^2$
p) $\frac{1}{4}x^2 + x + 1 = \left(\frac{1}{2}x + 1\right)^2$
q) $\frac{9}{25}x^2 - \frac{2}{5}x + \frac{1}{9} = \left(\frac{3}{5}x - \frac{1}{3}\right)^2$
r) $49x^8 - 25 = (7x^4 - 5)(7x^4 + 5) = (\sqrt{7}x^2 + \sqrt{5})(\sqrt{7}x^2 - \sqrt{5})(7x^4 + 5)$

7
Ontbind in factoren.

a) $9x^2 - 11 = (3x + \sqrt{11})(3x - \sqrt{11})$
b) $\sqrt{18}x - \sqrt{32}x^2 = \sqrt{9 \cdot 2}x - \sqrt{16 \cdot 2}x^2 = 3\sqrt{2}x - 4\sqrt{2}x^2 = \sqrt{2}x(3 - 4x)$
c) $9\pi x^2 - 6\pi x + \pi = \pi(9x^2 - 6x + 1) = \pi(3x - 1)^2$
d) $\sqrt{6}x^5 + \sqrt{30}x^4 + \sqrt{12}x^3 = \sqrt{6}x^5 + \sqrt{5 \cdot 6}x^4 + \sqrt{2 \cdot 6}x^3 = \sqrt{6}x^3(x^2 + \sqrt{5}x + \sqrt{2})$
e) $28x^2 + 16x - 8 = 4(7x^2 + 4x - 2)$
f) $32x^2 - 6 = 2(16x^2 - 3) = 2(4x + \sqrt{3})(4x - \sqrt{3})$
g) $8x^2 - \sqrt{32}x + 1 = 8x^2 - \sqrt{4 \cdot 8}x + 1 = 8x^2 - 2\sqrt{8}x + 1 = (\sqrt{8}x - 1)^2$
h) $100x^2 - 20\sqrt{10}x + 10 = 10(10x^2 - 2\sqrt{10}x + 1) = 10(\sqrt{10}x - 1)^2$
i) $48a^2 + 72a + 27 = 3(16a^2 + 24a + 9) = 3(4a + 3)^2$

--- PAGE 36 ---
8
Ontbind in zoveel mogelijk factoren.

a) $6m^4 + 15m^2 - 9m = 3m(2m^3 + 5m - 3)$
b) $-8a^3 + 32 = -8(a^3 - 4)$
c) $3x^{10} + 6x^5 + 3 = 3(x^{10} + 2x^5 + 1) = 3(x^5 + 1)^2$
d) $5y^2 - 45 = 5(y^2 - 9) = 5(y - 3)(y + 3)$
e) $3y^2 + 6y + 3 = 3(y^2 + 2y + 1) = 3(y + 1)^2$
f) $5x^2 - 20 = 5(x^2 - 4) = 5(x - 2)(x + 2)$
g) $4(2x + 1) + x(2x + 1) = (2x + 1)(4 + x)$
h) $2r^6 - 32r^3 + 128 = 2(r^6 - 16r^3 + 64) = 2(r^3 - 8)^2$
i) $a^5 - 2a^4 + a^3 = a^3(a^2 - 2a + 1) = a^3(a - 1)^2$
j) $(2x - 1) - 3x(2x - 1) = (2x - 1)(1 - 3x)$
k) $m^3 - 6m^2 + 9m = m(m^2 - 6m + 9) = m(m - 3)^2$
l) $-x^3 + 9x = -x(x^2 - 9) = -x(x - 3)(x + 3)$
m) $m^4 - 16 = (m^2 - 4)(m^2 + 4) = (m - 2)(m + 2)(m^2 + 4)$
n) $-3x^5 + 12x^3 - 12x = -3x(x^4 - 4x^2 + 4) = -3x(x^2 - 2)^2 = -3x(x - \sqrt{2})^2(x + \sqrt{2})^2$
o) $4t^5 - 64t^3 = 4t^3(t^2 - 16) = 4t^3(t - 4)(t + 4)$
p) $\frac{1}{4}x^2 + x + 1 = \left(\frac{1}{2}x + 1\right)^2$
q) $2x^4 - 8x^2 + 8 = 2(x^4 - 4x^2 + 4) = 2(x^2 - 2)^2 = 2(x - \sqrt{2})^2(x + \sqrt{2})^2$
r) $9(x + 3) - x(x + 3) = (x + 3)(9 - x)$

--- PAGE 37 ---
9
Ontbind in factoren.

a) $4x^4 - 144 = 4(x^4 - 36) = 4(x^2 + 6)(x^2 - 6) = 4(x^2 + 6)(x + \sqrt{6})(x - \sqrt{6})$
b) $9\sqrt{3}x^2 - 18x + 3\sqrt{3} = 3\sqrt{3}(\sqrt{3}x^2 - 6x + \sqrt{3}) = 3\sqrt{3}(\sqrt{3}x - 1)^2$
c) $x^4 - 9 = (x^2 + 3)(x^2 - 3) = (x^2 + 3)(x + \sqrt{3})(x - \sqrt{3})$
d) $x^2 - 4\sqrt{5}x + 20 = (x - \sqrt{20})^2 = (x - 2\sqrt{5})^2$
e) $x^4 - 14x^2 = x^2(x^2 - 14) = x^2(x + \sqrt{14})(x - \sqrt{14})$
f) $(x + \sqrt{8})^2 - (x - \sqrt{2})^2 = (x + \sqrt{8} + x - \sqrt{2}) \cdot (x + \sqrt{8} - x + \sqrt{2}) = (2x + \sqrt{8} - \sqrt{2})(\sqrt{8} + \sqrt{2}) = (2x + 2\sqrt{2} - \sqrt{2})(2\sqrt{2} + \sqrt{2}) = (2x + \sqrt{2})3\sqrt{2} = 3\sqrt{2}(2x + \sqrt{2})$
g) $\sqrt{2}x^2 - \sqrt{128} = \sqrt{2}x^2 - \sqrt{2 \cdot 64} = \sqrt{2}x^2 - 8\sqrt{2} = \sqrt{2}(x^2 - 8) = \sqrt{2}(x + \sqrt{8})(x - \sqrt{8})$
h) $6x^3 - 6\sqrt{6}x^2 + 9x = 3x(2x^2 - 2\sqrt{6}x + 3) = 3x(\sqrt{2}x - \sqrt{3})^2$
i) $2x(x - 3) - \sqrt{2}(x - 3) = (2x - \sqrt{2})(x - 3)$

10
Als $\sqrt{a^2 - 2ab + b^2} = a - b$, wat kun je dan zeggen over a en b?
a) $a < b$
b) $a > b$
c) $a \leqslant b$
d) $a \geqslant b$

$\sqrt{a^2 - 2ab + b^2} = \sqrt{(a - b)^2} = |a - b|$
$|a - b| = a - b$ als $a - b \geqslant 0$
$a \geqslant b$

Antwoord: d)

--- PAGE 38 ---
11
Ontbind in factoren.

a) $(a + b)^2 - 2(a + b) = (a + b)(a + b - 2)$
b) $2a^4b + 4a^3b^2 + 6a^2b^3 - 8ab^4 = 2ab(a^3 + 2a^2b + 3ab^2 - 4b^3)$
c) $(2a^2 - 6)^2 - (a^2 + 2)^2 = [(2a^2 - 6) - (a^2 + 2)][(2a^2 - 6) + (a^2 + 2)] = (a^2 - 8)(3a^2 - 4)$
d) $(y^2 - 1)^3 - 9(y^2 - 1) = (y^2 - 1)[(y^2 - 1)^2 - 9] = (y - 1)(y + 1)(y^2 - 1 - 3)(y^2 - 1 + 3) = (y - 1)(y + 1)(y^2 - 4)(y^2 + 2)$
e) $a^2 - 2ab + b^2 - 1 = (a - b)^2 - 1 = (a - b - 1)(a - b + 1)$
f) $4a^{2m+2} - 2a^{m+2}b^n + \frac{a^2b^{2n}}{4} = \left(2a^{m+1} - \frac{ab^n}{2}\right)^2$
g) $x^3 - x^2 + 0,25x = x(x^2 - x + 0,25) = x(x - 0,5)^2$
h) $6x + 3 - x(2x + 1) = 3(2x + 1) - x(2x + 1) = (2x + 1)(3 - x)$
i) $(4x^2 - 1)^2 - 4x^2 = (4x^2 - 1 - 2x)(4x^2 - 1 + 2x)$
j) $a^{4m} - 16b^{4m+4} = (a^{2m} - 4b^{2m+2})(a^{2m} + 4b^{2m+2}) = (a^m - 2b^{m+1})(a^m + 2b^{m+1})(a^{2m} + 4b^{2m+2})$

12
Bepaal de coëfficiënten a, b en c in de volgende vierkantsvergelijkingen.

a) $3x^2 + 10x + 4 = 0$
$a = 3, b = 10 \text{ en } c = 4$

b) $x^2 + 8x - 2 = 0$
$a = 1, b = 8 \text{ en } c = -2$

c) $2x^2 - 8 = 0$
$a = 2, b = 0 \text{ en } c = -8$

d) $-x^2 - 4x + 10 = 0$
$a = -1, b = -4 \text{ en } c = 10$

--- PAGE 39 ---
13
Los de volgende vierkantsvergelijkingen op.

a) $x^2 = 25$
$x = 5 \text{ of } x = -5$

b) $x^2 = 10$
$x = \sqrt{10} \text{ of } x = -\sqrt{10}$

c) $x^2 = -9$
geen oplossingen

d) $x^2 - 16 = 0$
$x = 4 \text{ of } x = -4$

14
Ontbind de volgende veeltermen van de tweede graad in factoren.

a) $x^2 - 9$
$x^2 - 9 = (x + 3)(x - 3)$

b) $3x^2 - 12$
$3x^2 - 12 = 3(x^2 - 4)$
$= 3(x + 2)(x - 2)$

c) $x^2 + 6x$
$x^2 + 6x = x(x + 6)$

15
Bepaal de coëfficiënten a, b en c in de volgende vierkantsvergelijkingen.

a) $x(x + 2) = 0$
$x(x + 2) = 0$
$x^2 + 2x = 0$
$a = 1, b = 2 \text{ en } c = 0$

b) $4x^2 + 8x - 2 = 3x + 8$
$4x^2 + 8x - 2 = 3x + 8$
$4x^2 + 5x - 10 = 0$
$a = 4, b = 5 \text{ en } c = -10$

c) $(x + 3)(x - 3) = 2x - 5$
$(x + 3)(x - 3) = 2x - 5$
$x^2 - 9 = 2x - 5$
$x^2 - 2x - 4 = 0$
$a = 1, b = -2 \text{ en } c = -4$

d) $10 - x^2 = 5x^2 - 3x + 10$
$10 - x^2 = 5x^2 - 3x + 10$
$6x^2 - 3x = 0$
$a = 6, b = -3 \text{ en } c = 0$

--- PAGE 40 ---
16
Los de tweedegraadsvergelijkingen op zonder de discriminant te berekenen.

a) $x^2 + 5x = 0$
$x(x + 5) = 0$
$x = 0 \text{ of } x + 5 = 0$
$x = 0 \text{ of } x = -5$
$V = \{-5, 0\}$

b) $(x - 4)^2 = 0$
$x - 4 = 0$
$x = 4$
$V = \{4\}$

c) $3x^2 - 48 = 0$
$3(x^2 - 16) = 0$
$3(x + 4)(x - 4) = 0$
$x = -4 \text{ of } x = 4$
$V = \{-4, 4\}$

d) $10 - 2x^2 = 0$
$2(5 - x^2) = 0$
$(5 - x^2) = 0$
$(\sqrt{5} + x)(\sqrt{5} - x) = 0$
$x = -\sqrt{5} \text{ of } x = \sqrt{5}$
$V = \{-\sqrt{5}, \sqrt{5}\}$

e) $x^2 = 5$
$x = \sqrt{5} \text{ of } x = -\sqrt{5}$
$V = \{-\sqrt{5}, \sqrt{5}\}$

f) $7(x + 5)^2 = 0$
$x + 5 = 0$
$x = -5$
$V = \{-5\}$

g) $12x^2 + 3 = 0$
$3(4x^2 + 1) = 0$
$4x^2 + 1 = 0$
$x^2 = -\frac{1}{4}$
geen oplossingen

h) $-9x^2 + 18 = 0$
$x^2 = \frac{-18}{-9}$
$x = \sqrt{2} \text{ of } x = -\sqrt{2}$
$V = \{-\sqrt{2}, \sqrt{2}\}$

i) $6x = 30x^2$
$-30x^2 + 6x = 0$
$-6x(5x - 1) = 0$
$x = 0 \text{ of } x = \frac{1}{5}$
$V = \{0, \frac{1}{5}\}$

j) $\frac{4}{25}x^2 - 1 = 0$
$x^2 = \frac{1}{\frac{4}{25}}$
$x = \sqrt{\frac{25}{4}}$
$x = \frac{5}{2}$
$x = -\frac{5}{2}$
$V = \{-\frac{5}{2}, \frac{5}{2}\}$

--- PAGE 41 ---
17
Los de volgende vierkantsvergelijkingen met de wortelformule op.

a) $2x^2 + x - 3 = 0$
$\bullet D = 1^2 - 4 \cdot 2 \cdot (-3)$
$= 1 + 24$
$= 25$
$\bullet x_1 = \frac{-1 + \sqrt{25}}{2 \cdot 2} = \frac{-1 + 5}{4} = \frac{4}{4} = 1$
$x_2 = \frac{-1 - \sqrt{25}}{2 \cdot 2} = \frac{-1 - 5}{4} = \frac{-6}{4} = -\frac{3}{2}$
$\bullet V = \{-\frac{3}{2}, 1\}$

b) $4x^2 - 12x + 9 = 0$
$\bullet D = (-12)^2 - 4 \cdot 4 \cdot 9$
$= 144 - 144$
$= 0$
$\bullet x_1 = x_2 = \frac{-b}{2a} = \frac{-(-12)}{2 \cdot 4} = \frac{12}{8} = \frac{3}{2}$
$\bullet V = \{\frac{3}{2}\}$

c) $2x^2 - 3x + 6 = 0$
$\bullet D = b^2 - 4ac$
$= (-3)^2 - 4 \cdot 2 \cdot 6$
$= -39$
$\bullet V = \emptyset$

d) $-x^2 + x + 2 = 0$
$\bullet D = 1^2 - 4 \cdot (-1) \cdot 2$
$= 9$
$\bullet x_1 = \frac{-1 + \sqrt{9}}{2 \cdot (-1)} = \frac{2}{-2} = -1$
$x_2 = \frac{-1 - \sqrt{9}}{2 \cdot (-1)} = \frac{-4}{-2} = 2$
$\bullet V = \{-1, 2\}$

e) $2x^2 - 11x + 15 = 0$
$\bullet D = (-11)^2 - 4 \cdot 2 \cdot 15$
$= 1$
$\bullet x_1 = \frac{11 + \sqrt{1}}{2 \cdot 2} = 3$
$x_2 = \frac{11 - \sqrt{1}}{2 \cdot 2} = \frac{10}{4} = \frac{5}{2}$
$\bullet V = \{\frac{5}{2}, 3\}$

f) $-4x^2 + 9x - 5 = 0$
$\bullet D = 9^2 - 4 \cdot (-4) \cdot (-5)$
$= 81 - 80$
$= 1$
$\bullet x_1 = \frac{-9 + \sqrt{1}}{2 \cdot (-4)} = 1$
$x_2 = \frac{-9 - \sqrt{1}}{2 \cdot (-4)} = \frac{10}{8} = \frac{5}{4}$
$\bullet V = \{1, \frac{5}{4}\}$

g) $x^2 - 3x + 6 = 0$
$\bullet D = (-3)^2 - 4 \cdot 1 \cdot 6$
$= 9 - 24$
$= -15$
$\bullet V = \emptyset$

h) $2x^2 + 12x + 18 = 0$
$\bullet D = 12^2 - 4 \cdot 2 \cdot 18$
$= 144 - 144$
$= 0$
$\bullet x_1 = x_2 = \frac{-b}{2a} = \frac{-12}{2 \cdot 2} = -3$
$\bullet V = \{-3\}$

--- PAGE 42 ---
18
Ontbind de veelterm $x^2 - 5x + 6$ in factoren.
Ben je nu in staat om de veelterm $3x^2 - 15x + 18$ in factoren te ontbinden?
$\bullet D = (-5)^2 - 4 \cdot 1 \cdot 6$
$= 1$
$\bullet x_1 = \frac{-(-5) + \sqrt{1}}{2 \cdot 1} = \frac{5 + 1}{2} = 3$
$x_2 = \frac{-(-5) - \sqrt{1}}{2 \cdot 1} = \frac{5 - 1}{2} = 2$
$x^2 - 5x + 6 = (x - 3)(x - 2)$
$\bullet 3x^2 - 15x + 18 = 3(x^2 - 5x + 6)$
$= 3(x - 3)(x - 2)$

19
Bepaal de coëfficiënten a, b en c in de volgende vierkantsvergelijkingen.

a) $3x(x - 5) = (4 + 2x)(x - 1)$
$3x(x - 5) = (4 + 2x)(x - 1)$
$3x^2 - 15x = 4x - 4 + 2x^2 - 2x$
$3x^2 - 15x = 2x^2 + 2x - 4$
$3x^2 - 2x^2 - 15x - 2x + 4 = 0$
$x^2 - 17x + 4 = 0$
$a = 1, b = -17, c = 4$

b) $4x^2 + 8x - 2 = 3x + 8$
$4x^2 + 8x - 2 = 3x + 8$
$4x^2 + 8x - 3x - 2 - 8 = 0$
$4x^2 + 5x - 10 = 0$
$a = 4, b = 5, c = -10$

c) $\frac{x^2}{3} - 2x + \frac{7}{2} = 0$
$\frac{x^2}{3} - 2x + \frac{7}{2} = 0$
$a = \frac{1}{3}, b = -2, c = \frac{7}{2}$

d) $4(x - 3)^2 = x(x - 9)$
$4(x - 3)^2 = x(x - 9)$
$4(x^2 - 6x + 9) = x^2 - 9x$
$4x^2 - 24x + 36 - x^2 + 9x = 0$
$3x^2 - 15x + 36 = 0$
$a = 3, b = -15, c = 36$

e) $\frac{2x^2 + 4}{5} = \frac{2 - x}{3}$
$\frac{2x^2 + 4}{5} = \frac{2 - x}{3}$
$3(2x^2 + 4) = 5(2 - x)$
$6x^2 + 12 = 10 - 5x$
$6x^2 + 5x + 12 - 10 = 0$
$6x^2 + 5x + 2 = 0$
$a = 6, b = 5, c = 2$

--- PAGE 43 ---
20
Los de onvolledige vierkantsvergelijkingen op.

a) $x^2 - \frac{9}{4} = 0$
$\bullet x^2 - \frac{9}{4} = 0$
$x^2 = \frac{9}{4}$
$x = \frac{3}{2} \text{ of } x = -\frac{3}{2}$
$\bullet V = \{-\frac{3}{2}, \frac{3}{2}\}$

b) $12x - 3x^2 = 0$
$\bullet 12x - 3x^2 = 0$
$3x(4 - x) = 0$
$x = 4 \text{ of } x = 0$
$\bullet V = \{0, 4\}$

c) $\frac{x^2}{5} - 20 = 0$
$\bullet \frac{x^2}{5} - 20 = 0$
$\frac{x^2}{5} = 20$
$x^2 = 100$
$x = 10 \text{ of } x = -10$
$\bullet V = \{-10, 10\}$

d) $9x^2 + 25 = 0$
$\bullet 9x^2 + 25 = 0$
$x^2 = -\frac{25}{9}$
$\bullet V = \emptyset$

e) $3x - x^2 = 0$
$\bullet 3x - x^2 = 0$
$x(3 - x) = 0$
$x = 0 \text{ of } x = 3$
$\bullet V = \{0, 3\}$

f) $x^2 + 36 = 0$
$\bullet x^2 + 36 = 0$
$\bullet V = \emptyset$

g) $5x^2 = 40$
$\bullet 5x^2 = 40$
$x^2 = 8$
$x = -2\sqrt{2} \text{ of } x = 2\sqrt{2}$
$\bullet V = \{-2\sqrt{2}, 2\sqrt{2}\}$

h) $2x^2 - 8 = 0$
$\bullet 2x^2 - 8 = 0$
$x^2 = 4$
$x = -2 \text{ of } x = 2$
$\bullet V = \{-2, 2\}$

--- PAGE 44 ---
21
Los de volgende vierkantsvergelijkingen met de wortelformule op.

a) $x^2 - 2x = 5x - 10$
$\bullet x^2 - 2x = 5x - 10$
$x^2 - 7x + 10 = 0$
$\bullet D = (-7)^2 - 4 \cdot 1 \cdot 10$
$= 9$
$\bullet x_1 = \frac{-(-7) + \sqrt{9}}{2 \cdot 1} = 5$
$x_2 = \frac{-(-7) - \sqrt{9}}{2 \cdot 1} = 2$
$\bullet V = \{2, 5\}$

b) $4x^2 + \frac{1}{2} = 3x$
$\bullet 4x^2 + \frac{1}{2} = 3x$
$4x^2 - 3x + \frac{1}{2} = 0$
$\bullet D = (-3)^2 - 4 \cdot 4 \cdot \frac{1}{2}$
$= 1$
$\bullet x_1 = \frac{-(-3) + \sqrt{1}}{2 \cdot 4} = \frac{1}{2}$
$x_2 = \frac{-(-3) - \sqrt{1}}{2 \cdot 4} = \frac{1}{4}$
$\bullet V = \{\frac{1}{4}, \frac{1}{2}\}$

c) $x = x^2 - 12$
$\bullet x = x^2 - 12$
$x^2 - x - 12 = 0$
$\bullet D = (-1)^2 - 4 \cdot 1 \cdot (-12)$
$= 49$
$\bullet x_1 = \frac{-(-1) + \sqrt{49}}{2 \cdot 1} = 4$
$x_2 = \frac{-(-1) - \sqrt{49}}{2 \cdot 1} = -3$
$\bullet V = \{-3, 4\}$

d) $\frac{x^2}{2} - x - 1 = 0$
$\bullet \frac{x^2}{2} - x - 1 = 0$
$\bullet D = (-1)^2 - 4 \cdot \frac{1}{2} \cdot (-1)$
$= 3$
$x_1 = \frac{-(-1) + \sqrt{3}}{2 \cdot \frac{1}{2}} = 1 + \sqrt{3}$
$x_2 = \frac{-(-1) - \sqrt{3}}{2 \cdot \frac{1}{2}} = 1 - \sqrt{3}$
$\bullet V = \{1 - \sqrt{3}, 1 + \sqrt{3}\}$

e) $x = 2x(1 - x)$
$\bullet x = 2x(1 - x)$
$x = 2x - 2x^2$
$-2x^2 + x = 0$
$\bullet D = 1^2 - 4 \cdot (-2) \cdot 0$
$= 1$
$\bullet x_1 = \frac{-1 + \sqrt{1}}{2 \cdot (-2)} = 0$
$x_2 = \frac{-1 - \sqrt{1}}{2 \cdot (-2)} = \frac{1}{2}$
$\bullet V = \{0, \frac{1}{2}\}$

f) $-3x^2 + 5 = 2(x - 1)$
$\bullet -3x^2 + 5 = 2(x - 1)$
$-3x^2 + 5 - 2x + 2 = 0$
$-3x^2 - 2x + 7 = 0$
$\bullet D = (-2)^2 - 4 \cdot (-3) \cdot 7$
$= 88$
$\bullet x_1 = \frac{-(-2) + 2\sqrt{22}}{-6}$
$x_2 = \frac{-(-2) - 2\sqrt{22}}{-6}$
$\bullet V = \{\frac{-1 - \sqrt{22}}{3}, \frac{-1 + \sqrt{22}}{3}\}$

g) $4x^2 + 3x = 2x^2 - x + 3$
$\bullet 4x^2 + 3x = 2x^2 - x + 3$
$2x^2 + 4x - 3 = 0$
$\bullet D = 4^2 - 4 \cdot 2 \cdot (-3)$
$= 40$
$\bullet x_1 = \frac{-4 + 2\sqrt{10}}{4} = \frac{-2 + \sqrt{10}}{2}$
$x_2 = \frac{-4 - 2\sqrt{10}}{4} = \frac{-2 - \sqrt{10}}{2}$
$\bullet V = \{\frac{-2 - \sqrt{10}}{2}, \frac{-2 + \sqrt{10}}{2}\}$

h) $(x - 1)(x + 3) = -x(x + 2)$
$\bullet (x - 1)(x + 3) = -x(x + 2)$
$x^2 + 3x - x - 3 = -x^2 - 2x$
$2x^2 + 4x - 3 = 0$
$\bullet D = 4^2 - 4 \cdot 2 \cdot (-3)$
$= 40$
$x_1 = \frac{-4 + 2\sqrt{10}}{4} = \frac{-2 + \sqrt{10}}{2}$
$x_2 = \frac{-4 - 2\sqrt{10}}{4} = \frac{-2 - \sqrt{10}}{2}$
$\bullet V = \{\frac{-2 - \sqrt{10}}{2}, \frac{-2 + \sqrt{10}}{2}\}$

--- PAGE 45 ---
22
Bepaal de nulwaarden van de functie f met voorschrift $f(x) = 2x^2 + 5x - 3$.
$\bullet 2x^2 + 5x - 3 = 0$
$\bullet D = 5^2 - 4 \cdot 2 \cdot (-3)$
$= 49$
$x_1 = \frac{-5 + \sqrt{49}}{2 \cdot 2} = \frac{1}{2}$
$x_2 = \frac{-5 - \sqrt{49}}{2 \cdot 2} = -3$
Antwoord: De nulwaarden zijn $-3$ en $\frac{1}{2}$.

23
Bepaal de coördinaten van de snijpunten van de parabool $y = x^2 + 5x$ met de x-as.
$\bullet x^2 + 5x = 0$
$x \cdot (x + 5) = 0$
$x = 0 \text{ of } x = -5$
Antwoord: De coördinaten zijn $(0, 0)$ en $(-5, 0)$.

--- PAGE 46 ---
24
Ontbind in factoren.

a) $x^2 + 7x + 10$
$D = 7^2 - 4 \cdot 1 \cdot 10$
$D = 9$
$x_1 = \frac{-7 + \sqrt{9}}{2} = -2$
$x_2 = \frac{-7 - \sqrt{9}}{2} = -5$
$a(x - x_1)(x - x_2)$
$1(x + 2)(x + 5)$
$(x + 2)(x + 5)$

b) $3x^2 + 8x - 11$
$D = 8^2 - 4 \cdot 3 \cdot (-11)$
$D = 196$
$x_1 = \frac{-8 + \sqrt{196}}{2 \cdot 3} = 1$
$x_2 = \frac{-8 - \sqrt{196}}{2 \cdot 3} = -\frac{11}{3}$
$3 \cdot (x - 1) \cdot \left(x + \frac{11}{3}\right) = (3x + 11)(x - 1)$

c) $2x^2 - 8x + 6$
$D = (-8)^2 - 4 \cdot 2 \cdot 6$
$D = 16$
$x_1 = \frac{8 + \sqrt{16}}{2 \cdot 2} = 3$
$x_2 = \frac{8 - \sqrt{16}}{2 \cdot 2} = 1$
$2 \cdot (x - 3) \cdot (x - 1)$

d) $3x^2 - 39x + 120$
$3 \cdot (x^2 - 13x + 40)$
$D = (-13)^2 - 4 \cdot 1 \cdot 40$
$D = 9$
$x_1 = \frac{13 + \sqrt{9}}{2} = 8$
$x_2 = \frac{13 - \sqrt{9}}{2} = 5$
$3 \cdot (x - 8) \cdot (x - 5)$

e) $\frac{1}{2}x^2 - 2x + 2$
$D = (-2)^2 - 4 \cdot \frac{1}{2} \cdot 2$
$D = 0$
$x = \frac{2}{2 \cdot \frac{1}{2}} = 2$
$\frac{1}{2} \cdot (x - 2)^2$

f) $-16x^2 + 60x + 5$
$D = 60^2 - 4 \cdot (-16) \cdot 5$
$D = 3920$
$\sqrt{3920} = \sqrt{2^4 \cdot 5 \cdot 7^2}$
$\sqrt{3920} = 4 \cdot 7\sqrt{5} = 28\sqrt{5}$
$x_1 = \frac{-60 + 28\sqrt{5}}{2 \cdot (-16)} = \frac{-60 + 28\sqrt{5}}{-32} = \frac{15 - 7\sqrt{5}}{8}$
$x_2 = \frac{-60 - 28\sqrt{5}}{2 \cdot (-16)} = \frac{-60 - 28\sqrt{5}}{-32} = \frac{15 + 7\sqrt{5}}{8}$
$-16 \cdot \left(x - \left(\frac{15 - 7\sqrt{5}}{8}\right)\right) \cdot \left(x - \left(\frac{15 + 7\sqrt{5}}{8}\right)\right)$

g) $-2x^2 + 8x + 3$
$D = 8^2 - 4 \cdot (-2) \cdot 3$
$D = 88$
$x_1 = \frac{-8 + \sqrt{88}}{-2 \cdot 2} = \frac{8 - \sqrt{88}}{4} = 2 - \frac{\sqrt{22}}{2}$
$x_2 = \frac{-8 - \sqrt{88}}{-4} = 2 + \frac{\sqrt{22}}{2}$
$-2 \cdot \left(x - \left(2 - \frac{\sqrt{22}}{2}\right)\right) \cdot \left(x - \left(2 + \frac{\sqrt{22}}{2}\right)\right)$

h) $2x^2 - 2$
$2 \cdot (x^2 - 1)$
$2 \cdot (x + 1) \cdot (x - 1)$

i) $3 - x^2 + 2x$
$-x^2 + 2x + 3$
$D = 2^2 - 4 \cdot (-1) \cdot 3$
$D = 16$
$x_1 = \frac{-2 + \sqrt{16}}{2 \cdot (-1)} = -1$
$x_2 = \frac{-2 - \sqrt{16}}{2 \cdot (-1)} = 3$
$-(x + 1)(x - 3)$

j) $\frac{x^2}{2} + x - 4$
$D = 1^2 - 4 \cdot \frac{1}{2} \cdot (-4)$
$x_1 = \frac{-1 + \sqrt{9}}{2 \cdot \frac{1}{2}} = 2$
$x_2 = \frac{-1 - \sqrt{9}}{2 \cdot \frac{1}{2}} = -4$
$\frac{1}{2} \cdot (x - 2) \cdot (x + 4)$

--- PAGE 47 ---
25
Los de volgende vierkantsvergelijkingen met de wortelformule op. De wortels kunnen eenvoudige breuken zijn.

a) $3x^2 - 13x + 4 = 0$
$\bullet \quad 3x^2 - 13x + 4 = 0$
$\bullet \quad D = (-13)^2 - 4 \cdot 3 \cdot 4$
$= 169 - 48$
$= 121$
$\bullet \quad x_1 = \frac{13 + 11}{2 \cdot 3} = \frac{24}{6} = 4$
$x_2 = \frac{13 - 11}{6} = \frac{2}{6} = \frac{1}{3}$
$\bullet \quad V = \left\{\frac{1}{3}, 4\right\}$

b) $x(4x + 11) = 3$
$\bullet \quad x(4x + 11) = 3$
$4x^2 + 11x - 3 = 0$
$\bullet \quad D = 11^2 - 4 \cdot 4 \cdot (-3)$
$= 121 + 48$
$= 169$
$\bullet \quad x_1 = \frac{-11 + 13}{2 \cdot 4} = \frac{2}{8} = \frac{1}{4}$
$x_2 = \frac{-11 - 13}{2 \cdot 4} = \frac{-24}{8} = -3$
$\bullet \quad V = \left\{-3, \frac{1}{4}\right\}$

c) $5x(4x - 4) = 6x - 5$
$\bullet \quad 5x(4x - 4) = 6x - 5$
$20x^2 - 20x = 6x - 5$
$20x^2 - 26x + 5 = 0$
$\bullet \quad D = (-26)^2 - 4 \cdot 20 \cdot 5$
$= 276$
$\bullet \quad x_1 = \frac{26 + 2\sqrt{69}}{40} = \frac{13 + \sqrt{69}}{20}$
$x_2 = \frac{26 - 2\sqrt{69}}{40} = \frac{13 - \sqrt{69}}{20}$
$\bullet \quad V = \left\{\frac{13 - \sqrt{69}}{20}, \frac{13 + \sqrt{69}}{20}\right\}$

d) $8x = 3(x + 1)(x - 1)$
$\bullet \quad 8x = 3(x + 1)(x - 1)$
$8x = 3(x^2 - 1)$
$8x = 3x^2 - 3$
$-3x^2 + 8x + 3 = 0$
$\bullet \quad D = 64 - 4 \cdot (-3) \cdot 3$
$= 64 + 36$
$= 100$
$\bullet \quad x_1 = \frac{-8 + 10}{2 \cdot (-3)} = \frac{2}{-6} = -\frac{1}{3}$
$x_2 = \frac{-8 - 10}{2 \cdot (-3)} = \frac{-18}{-6} = 3$
$\bullet \quad V = \left\{-\frac{1}{3}, 3\right\}$

--- PAGE 48 ---
26
Los de vierkantsvergelijkingen op.

a) $4x^2 - 9x = 0$
$\bullet \quad 4x^2 - 9x = 0$
$x(4x - 9) = 0$
$x = 0 \text{ of } 4x = 9$
$x = 0 \text{ of } x = \frac{9}{4}$
$\bullet \quad V = \left\{0, \frac{9}{4}\right\}$

b) $4x^2 + 1 = 0$
$\bullet \quad 4x^2 + 1 = 0$
$4x^2 = -1$
$x^2 = -\frac{1}{4}$
$\bullet \quad V = \emptyset$

c) $(2x - 5)^2 = 0$
$\bullet \quad (2x - 5)^2 = 0$
$2x - 5 = 0$
$2x = 5$
$x = \frac{5}{2}$
$\bullet \quad V = \left\{\frac{5}{2}\right\}$

d) $x^2 - 6x + 9 = 0$
$\bullet \quad x^2 - 6x + 9 = 0$
$(x - 3)^2 = 0$
$x - 3 = 0$
$x = 3$
$\bullet \quad V = \{3\}$

e) $\sqrt{6}x^2 = 9x$
$\bullet \quad \sqrt{6}x^2 = 9x$
$-9x + \sqrt{6}x^2 = 0$
$x(-9 + \sqrt{6}x) = 0$
$x = 0 \text{ of } \sqrt{6}x = 9$
$x = 0 \text{ of } x = \frac{9\sqrt{6}}{6}$
$x = 0 \text{ of } x = \frac{3\sqrt{6}}{2}$
$\bullet \quad V = \left\{0, \frac{3\sqrt{6}}{2}\right\}$

--- PAGE 49 ---
27
Los de volgende vergelijkingen op zonder de haakjes uit te werken.

a) $(x - 4)(2 - x) = 0$
$\bullet \quad (x - 4)(2 - x) = 0$
$x - 4 = 0 \text{ of } 2 - x = 0$
$x = 4 \text{ of } 2 = x$
$\bullet \quad V = \{2, 4\}$

b) $(7x - 4)(x + 3) = 0$
$\bullet \quad (7x - 4)(x + 3) = 0$
$7x - 4 = 0 \text{ of } x + 3 = 0$
$7x = 4 \text{ of } x = -3$
$x = \frac{4}{7} \text{ of } x = -3$
$\bullet \quad V = \left\{-3, \frac{4}{7}\right\}$

c) $x(9x + 2) = 0$
$\bullet \quad x(9x + 2) = 0$
$x = 0 \text{ of } 9x + 2 = 0$
$x = 0 \text{ of } 9x = -2$
$x = 0 \text{ of } x = -\frac{2}{9}$
$\bullet \quad V = \left\{0, -\frac{2}{9}\right\}$

d) $(x - 4)(3x - 2) = 0$
$\bullet \quad (x - 4)(3x - 2) = 0$
$x - 4 = 0 \text{ of } 3x - 2 = 0$
$x = 4 \text{ of } 3x = 2$
$x = 4 \text{ of } x = \frac{2}{3}$
$\bullet \quad V = \left\{\frac{2}{3}, 4\right\}$

e) $(3x - 1)(2x + 8) = 0$
$\bullet \quad (3x - 1)(2x + 8) = 0$
$3x - 1 = 0 \text{ of } 2x + 8 = 0$
$3x = 1 \text{ of } 2x = -8$
$x = \frac{1}{3} \text{ of } x = -4$
$\bullet \quad V = \left\{-4, \frac{1}{3}\right\}$

--- PAGE 50 ---
28
Los de volgende vierkantsvergelijkingen met de wortelformule op.

a) $x^2 + \sqrt{2}x + 4 = 0$
$\bullet \quad D = 2 - 4 \cdot 1 \cdot 4$
$= 2 - 16$
$= -14$
$\bullet \quad V = \emptyset$

b) $x^2 - 4(x - 1) = \sqrt{3}(x - 4)$
$\bullet \quad x^2 - 4(x - 1) = \sqrt{3}(x - 4)$
$x^2 - 4x + 4 = \sqrt{3}x - 4\sqrt{3}$
$x^2 + (-4 - \sqrt{3})x + 4 + 4\sqrt{3} = 0$
$\bullet \quad D = (-4 - \sqrt{3})^2 - 4 \cdot 1 \cdot (4 + 4\sqrt{3})$
$= 16 + 8\sqrt{3} + 3 - 16 - 16\sqrt{3}$
$= 3 - 8\sqrt{3}$
$\bullet \quad V = \emptyset$

c) $x^2 = 24 + 2\sqrt{3}x$
$\bullet \quad x^2 = 24 + 2\sqrt{3}x$
$x^2 - 2\sqrt{3}x - 24 = 0$
$\bullet \quad D = (-2\sqrt{3})^2 - 4 \cdot 1 \cdot (-24)$
$= 4 \cdot 3 + 96$
$= 12 + 96$
$= 108$
$\bullet \quad x_1 = \frac{2\sqrt{3} + 6\sqrt{3}}{2 \cdot 1} = \frac{8\sqrt{3}}{2} = 4\sqrt{3}$
$x_2 = \frac{2\sqrt{3} - 6\sqrt{3}}{2} = \frac{-4\sqrt{3}}{2} = -2\sqrt{3}$
$\bullet \quad V = \{-2\sqrt{3}, 4\sqrt{3}\}$

d) $x^2 + 2\sqrt{5}x + 4 = 4\sqrt{5}x$
$\bullet \quad x^2 + 2\sqrt{5}x + 4 = 4\sqrt{5}x$
$x^2 + 2\sqrt{5}x + 4 - 4\sqrt{5}x = 0$
$x^2 - 2\sqrt{5}x + 4 = 0$
$\bullet \quad D = 4 \cdot 5 - 4 \cdot 1 \cdot 4$
$= 20 - 16$
$= 4$
$\bullet \quad x_1 = \frac{2\sqrt{5} + 2}{2 \cdot 1} = \frac{2\sqrt{5} + 2}{2} = \sqrt{5} + 1$
$x_2 = \frac{2\sqrt{5} - 2}{2} = \sqrt{5} - 1$
$\bullet \quad V = \{\sqrt{5} - 1, \sqrt{5} + 1\}$

--- PAGE 51 ---
29
Los de volgende vergelijkingen op.

a) $(x + 3)^2 - 25 = 0$
$\bullet \quad (x + 3)^2 - 25 = 0$
$x^2 + 6x + 9 - 25 = 0$
$x^2 + 6x - 16 = 0$
$\bullet \quad D = 36 - 4 \cdot 1 \cdot (-16)$
$= 36 + 64$
$= 100$
$\bullet \quad x_1 = \frac{-6 + 10}{2 \cdot 1} = \frac{4}{2} = 2$
$x_2 = \frac{-6 - 10}{2 \cdot 1} = \frac{-16}{2} = -8$
$\bullet \quad V = \{-8, 2\}$

b) $\frac{4x}{4x^2 + 1} = \frac{2}{3}$
$\bullet \quad \frac{4x}{4x^2 + 1} = \frac{2}{3}$
$12x = 2(4x^2 + 1)$
$12x = 8x^2 + 2$
$-8x^2 + 12x - 2 = 0$
$\bullet \quad D = 144 - 4 \cdot (-8) \cdot (-2)$
$= 144 - 64$
$= 80$
$\bullet \quad x_1 = \frac{-12 + 4\sqrt{5}}{2 \cdot (-8)} = \frac{-12 + 4\sqrt{5}}{-16} = \frac{3 - \sqrt{5}}{4}$
$x_2 = \frac{-12 - 4\sqrt{5}}{-16} = \frac{3 + \sqrt{5}}{4}$
$\bullet \quad V = \left\{\frac{3 - \sqrt{5}}{4}, \frac{3 + \sqrt{5}}{4}\right\}$

c) $\left(\frac{x}{\sqrt{2}}\right)^2 = \frac{x + 1}{6}$
$\bullet \quad \left(\frac{x}{\sqrt{2}}\right)^2 = \frac{x + 1}{6}$
$\frac{x^2}{2} = \frac{x + 1}{6}$
$6x^2 = 2x + 2$
$6x^2 - 2x - 2 = 0$
$\bullet \quad D = 4 - 4 \cdot 6 \cdot (-2)$
$= 4 + 48$
$= 52$
$\bullet \quad x_1 = \frac{2 + 2\sqrt{13}}{2 \cdot 6} = \frac{1 + \sqrt{13}}{6}$
$x_2 = \frac{2 - 2\sqrt{13}}{2 \cdot 6} = \frac{1 - \sqrt{13}}{6}$
$\bullet \quad V = \left\{\frac{1 - \sqrt{13}}{6}, \frac{1 + \sqrt{13}}{6}\right\}$

d) $\frac{4}{9}x^2 + \frac{8}{3}x + 3 = 0$

--- PAGE 52 ---
d) $\bullet \quad \frac{4}{9}x^2 + \frac{8}{3}x + 3 = 0$
$\bullet \quad D = \frac{64}{9} - 4 \cdot \frac{4}{9} \cdot 3$
$= \frac{64}{9} - \frac{48}{9}$
$= \frac{16}{9}$
$\bullet \quad x_1 = \frac{-\frac{8}{3} + \frac{4}{3}}{2 \cdot \frac{4}{9}} = \frac{-\frac{4}{3}}{\frac{8}{9}} = -\frac{4}{3} \cdot \frac{9}{8} = -\frac{3}{2}$
$x_2 = \frac{-\frac{8}{3} - \frac{4}{3}}{2 \cdot \frac{4}{9}} = \frac{-\frac{12}{3}}{\frac{8}{9}} = \frac{-4}{\frac{8}{9}} = -4 \cdot \frac{9}{8} = -\frac{9}{2}$
$\bullet \quad V = \left\{-\frac{9}{2}, -\frac{3}{2}\right\}$

30
Beschouw de functie f met $f(x) = \frac{x^2}{2} - 4x + 1$. Bereken de x-waarden waarvoor geldt dat $f(x) = -5$.
Leg het verband tussen de oplossing van de vergelijking en de grafiek van de verwante tweedegraadsfunctie.

$-5 = \frac{x^2}{2} - 4x + 1$
$\frac{x^2}{2} - 4x + 6 = 0$
$D = (-4)^2 - 4 \cdot \frac{1}{2} \cdot 6$
$= 16 - 12$
$= 4$

$x_1 = \frac{4 + \sqrt{4}}{2 \cdot \frac{1}{2}} = 6$
$x_2 = \frac{4 - \sqrt{4}}{2 \cdot \frac{1}{2}} = 2$

Antwoord: De grafiek van f is een dalparabool, die $-5$ als functiewaarde heeft bij de x-waarden 2 en 6.

31
Bepaal m in de vergelijking $x^3 + mx + 4 = 0$ zodat één van de wortels $\frac{4}{3}$ is.

$\left(\frac{4}{3}\right)^3 + m \cdot \frac{4}{3} + 4 = 0$
$\frac{64}{27} + \frac{4}{3}m + 4 = 0$
$\frac{4}{3}m + \frac{172}{27} = 0$
$\frac{4}{3}m = -\frac{172}{27}$
$m = \frac{-172}{27} \cdot \frac{3}{4}$
$m = -\frac{43}{9}$

--- PAGE 53 ---
32
Voor welke waarde van $m$ hebben volgende vergelijkingen...
$\bullet$ twee verschillende wortels?
$\bullet$ juist één wortel?
$\bullet$ geen wortels?

a) $4x^2 - 3x + m = 0$
$D = (-3)^2 - 4 \cdot 4 \cdot m$
$= 9 - 16m$
$\bullet$ 2 verschillende wortels:
$D > 0 \Leftrightarrow m < \frac{9}{16}$
$\bullet$ juist 1 wortel:
$D = 0 \Leftrightarrow m = \frac{9}{16}$
$\bullet$ geen wortels:
$D < 0 \Leftrightarrow m > \frac{9}{16}$

b) $x^2 + 2mx + m(m + 1) = 0$
$x^2 + 2mx + m^2 + m = 0$
$D = (2m)^2 - 4 \cdot 1 \cdot (m^2 + m)$
$= 4m^2 - 4m^2 - 4m$
$= -4m$
$\bullet$ 2 verschillende wortels:
$D > 0 \Leftrightarrow m < 0$
$\bullet$ juist 1 wortel:
$D = 0 \Leftrightarrow m = 0$
$\bullet$ geen wortels:
$D < 0 \Leftrightarrow m > 0$

c) $-mx^2 + 3x + 1 = 0$
$D = 3^2 - 4 \cdot (-m) \cdot 1$
$= 9 + 4m$
$\bullet$ 2 verschillende wortels:
$D > 0 \Leftrightarrow m > -\frac{9}{4}$
$\bullet$ juist 1 wortel:
$D = 0 \Leftrightarrow m = -\frac{9}{4}$
$\bullet$ geen wortels:
$D < 0 \Leftrightarrow m < -\frac{9}{4}$

--- PAGE 54 ---
33
Los de volgende vierkantsvergelijkingen met parameters a en b op.

a) $ax^2 + 2bx + a = 0$
$D = (2b)^2 - 4 \cdot a \cdot a$
$= 4b^2 - 4a^2$
$\bullet \quad \text{geval 1: } b > a \Rightarrow 4b^2 - 4a^2 > 0$
$x_1 = \frac{-2b + \sqrt{4b^2 - 4a^2}}{2a} = \frac{-b + \sqrt{b^2 - a^2}}{a}$
$x_2 = \frac{-b - \sqrt{b^2 - a^2}}{a}$
$V = \left\{\frac{-b + \sqrt{b^2 - a^2}}{a}, \frac{-b - \sqrt{b^2 - a^2}}{a}\right\}$
$\bullet \quad \text{geval 2: } b = a \Rightarrow 4b^2 - 4a^2 = 0$
$x_1 = x_2 = \frac{-2b}{2a} = \frac{-b}{a}$
$V = \left\{\frac{-b}{a}\right\}$
$\bullet \quad \text{geval 3: } b < a \Rightarrow 4b^2 - 4a^2 < 0$
$V = \emptyset$

b) $ax^2 - 3x - 4 = 0$
$D = (-3)^2 - 4 \cdot a \cdot (-4)$
$= 9 + 16a$
$\bullet \quad \text{geval 1: } a > -\frac{9}{16} \Rightarrow D > 0$
$x_1 = \frac{3 + \sqrt{9 + 16a}}{2a}$
$x_2 = \frac{3 - \sqrt{9 + 16a}}{2a}$
$V = \left\{\frac{3 + \sqrt{9 + 16a}}{2a}, \frac{3 - \sqrt{9 + 16a}}{2a}\right\}$
$\bullet \quad \text{geval 2: } a = -\frac{9}{16} \Rightarrow D = 0$
$x_1 = x_2 = \frac{3}{2a}$
$V = \left\{\frac{3}{2a}\right\}$
$\bullet \quad \text{geval 3: } a < -\frac{9}{16} \Rightarrow D < 0$
$V = \emptyset$

34
Geef een voorbeeld van een veelterm van de tweede graad die je niet kan ontbinden in factoren van de eerste graad.
bv. $2x^2 + x + 3 = 0$
want $D = 1^2 - 4 \cdot 2 \cdot 3$
$= 1 - 24$
$= -23$

--- PAGE 55 ---
35
f is een veelterm van de tweede graad. Deze veelterm heeft een dubbele nulwaarde, nl. -2. De getalwaarde van f voor 3 is 6. Geef de ontbinding van f in factoren.
$\bullet \quad \text{dubbele nulwaarde, dus } D = 0 \text{ en } x_1 = x_2 = -2$
$\bullet \quad ax^2 + bx + c = a \cdot (x + 2)^2$
$\bullet \quad 6 = a(3 + 2)^2$
$6 = a \cdot 5^2$
$6 = 25a$
$\frac{6}{25} = a$
$\bullet \quad \text{ontbinding: } \frac{6}{25} \cdot (x + 2)^2$

36
Los de volgende vierkantsvergelijkingen met parameters a en b op.

a) $x^2 - 2ax + a^2 - b^2 = 0$
b) $(a^2 - 1)x^2 - 2a^2x + a^2 = 0 \quad (a \neq \pm1)$
c) $ax^2 + b(3 + a^2)x + 3ab^2 = 0 \quad (a \neq 0)$
d) $x^2 + (3a + 2b)x + 6ab = 0$

a) $x^2 - 2ax + a^2 - b^2 = 0$
$D = (-2a)^2 - 4 \cdot 1 \cdot (a^2 - b^2)$
$= 4a^2 - 4a^2 + 4b^2$
$= 4b^2$
$\bullet \quad \text{geval 1: } D > 0$
$x_1 = \frac{2a + \sqrt{4b^2}}{2 \cdot 1} = \frac{2a + 2b}{2} = a + b$
$x_2 = \frac{2a - \sqrt{4b^2}}{2 \cdot 1} = \frac{2a - 2b}{2} = a - b$
$V = \{a - b, a + b\}$
$\bullet \quad \text{geval 2: } D = 0$
$x_1 = x_2 = \frac{2a}{2} = a$
$V = \{a\}$

b) $(a^2 - 1)x^2 - 2a^2x + a^2 = 0$
$D = (-2a^2)^2 - 4 \cdot (a^2 - 1) \cdot a^2$
$= 4a^4 - 4a^4 + 4a^2$
$= 4a^2$
$\bullet \quad \text{geval 1: } D > 0$
$x_1 = \frac{2a^2 + \sqrt{4a^2}}{2(a^2 - 1)} = \frac{2a^2 + 2a}{2a^2 - 2} = \frac{a^2 + a}{a^2 - 1}$
$x_2 = \frac{2a^2 - \sqrt{4a^2}}{2(a^2 - 1)} = \frac{a^2 - a}{a^2 - 1}$
$V = \left\{\frac{a^2 - a}{a^2 - 1}, \frac{a^2 + a}{a^2 - 1}\right\}$
$\bullet \quad \text{geval 2: } D = 0 \Rightarrow a = 0$
$V = \{0\}$

--- PAGE 56 ---
c) $ax^2 + b(3 + a^2)x + 3ab^2 = 0$
$D = b^2(3 + a^2)^2 - 4 \cdot a \cdot 3ab^2$
$= b^2(9 + 6a^2 + a^4) - 12a^2b^2$
$= 9b^2 + 6a^2b^2 + a^4b^2 - 12a^2b^2$
$= a^4b^2 + 9b^2 - 6a^2b^2$
$= (a^2b - 3b)^2$
$\bullet \quad \text{geval 1: } D > 0$
$x_1 = \frac{-b(3 + a^2) + a^2b - 3b}{2a} = \frac{-3b - a^2b + a^2b - 3b}{2a} = \frac{-6b}{2a} = \frac{-3b}{a}$
$x_2 = \frac{-b(3 + a^2) - a^2b + 3b}{2a} = \frac{-3b - a^2b - a^2b + 3b}{2a} = \frac{-2a^2b}{2a} = -ab$
$V = \left\{\frac{-3b}{a}, -ab\right\}$
$\bullet \quad \text{geval 2: } D = 0$
$x_1 = x_2 = \frac{-b(3 + a^2)}{2a}$
$V = \left\{\frac{-b(3 + a^2)}{2a}\right\}$

d) $x^2 + (3a + 2b)x + 6ab = 0$
$D = (3a + 2b)^2 - 4 \cdot 1 \cdot 6ab$
$= 9a^2 + 12ab + 4b^2 - 24ab$
$= 9a^2 + 4b^2 - 12ab$
$= (3a - 2b)^2$
$\bullet \quad \text{geval 1: } D > 0$
$x_1 = \frac{-3a - 2b + 3a - 2b}{2} = \frac{-4b}{2} = -2b$
$x_2 = \frac{-3a - 2b - 3a + 2b}{2} = \frac{-6a}{2} = -3a$
$V = \{-2b, -3a\}$
$\bullet \quad \text{geval 2: } D = 0$
$x_1 = x_2 = \frac{-3a - 2b}{2}$
$V = \left\{\frac{-3a - 2b}{2}\right\}$
$\bullet \quad \text{geval 3: } D < 0$
$V = \emptyset$

--- PAGE 57 ---
37
Bepaal de parameter m zodat de top van de parabool $p \leftrightarrow y = 2x^2 + mx + 1$ op de x-as ligt.

$p = \frac{-b}{2a}$
$q = \frac{-b^2 + 4ac}{4a}$
$0 = \frac{-b^2 + 4ac}{4a}$
$0 = \frac{-m^2 + 4 \cdot 2 \cdot 1}{4 \cdot 2}$
$0 = -m^2 + 8$
$m^2 = 8$
$m = 2\sqrt{2} \text{ of } m = -2\sqrt{2}$

38
Bepaal de vergelijking van de parabool die de x-as snijdt in de punten (1, 0) en (6, 0) en de y-as snijdt in het punt (0, 6).

$ax^2 + bx + c = 0$
$\begin{cases} a \cdot 1^2 + b \cdot 1 + c = 0 \\ a \cdot 6^2 + b \cdot 6 + c = 0 \\ a \cdot 0^2 + b \cdot 0 + c = 6 \end{cases}$
$\Leftrightarrow \begin{cases} a + b + c = 0 \\ 36a + 6b + c = 0 \\ c = 6 \end{cases}$
$\Leftrightarrow \begin{cases} a = -b - 6 \\ 36(-b - 6) + 6b + 6 = 0 \quad (*) \\ c = 6 \end{cases}$

$(*) \quad -36b - 216 + 6b + 6 = 0$
$-30b - 210 = 0$
$-30b = 210$
$b = \frac{210}{-30}$
$b = -7$

$\Leftrightarrow \begin{cases} a = -(-7) - 6 \\ b = -7 \\ c = 6 \end{cases}$
$\Leftrightarrow \begin{cases} a = 1 \\ b = -7 \\ c = 6 \end{cases}$

$x^2 - 7x + 6 = 0$

--- PAGE 58 ---
39
Bepaal de vergelijking van de parabool die de x-as snijdt in de punten (-4, 0) en (1, 0) en door het punt (-2, 3) gaat.

$\begin{cases} a \cdot (-4)^2 + b \cdot (-4) + c = 0 \\ a \cdot (1)^2 + b \cdot 1 + c = 0 \\ a \cdot (-2)^2 + b \cdot (-2) + c = 3 \end{cases}$

$\Leftrightarrow \begin{cases} 16a - 4b + c = 0 \\ a + b + c = 0 \\ 4a - 2b + c = 3 \end{cases}$

$\Leftrightarrow \begin{cases} 16a - 4b + c = 0 \\ a = -b - c \\ 4a - 2b + c = 3 \end{cases}$

$\Leftrightarrow \begin{cases} 16(-b - c) - 4b + c = 0 \\ a = -b - c \\ 4(-b - c) - 2b + c = 3 \end{cases}$

$\Leftrightarrow \begin{cases} -20b - 15c = 0 \\ a = -b - c \\ -6b - 3c = 3 \end{cases}$

$\Leftrightarrow \begin{cases} -20b - 15(-1 - 2b) = 0 \\ a = -b - c \\ c = -1 - 2b \end{cases}$

$\Leftrightarrow \begin{cases} -20b + 15 + 30b = 0 \quad (*) \\ a = -b - c \\ c = -1 - 2b \end{cases}$

$(*) \quad 10b = -15$
$b = -\frac{15}{10}$
$b = -\frac{3}{2}$

$c = -1 - 2 \cdot \left(-\frac{3}{2}\right)$
$= -1 + 3$
$= 2$

$a = -\left(-\frac{3}{2}\right) - 2$
$= \frac{3}{2} - 2$
$= -\frac{1}{2}$

$-\frac{1}{2}x^2 - \frac{3}{2}x + 2 = 0$

--- PAGE 59 ---
40
Zoek het natuurlijke getal waarvan het kwadraat 30 meer is dan het getal zelf.
$\bullet \quad$ Keuze onbekende: $x$: het getal
$\bullet \quad$ Vergelijking:
$x^2 = 30 + x$
$x^2 - x - 30 = 0$
$\circ \quad D = 1 - 4 \cdot 1(-30)$
$= 1 + 120$
$= 121$
$\circ \quad x_1 = \frac{1 + 11}{2} = \frac{12}{2} = 6$
$x_2 = \frac{1 - 11}{2} = \frac{-10}{2} = -5 \notin \mathbb{N}$
$\bullet \quad$ Antwoord: Het natuurlijke getal is 6.

41
De oppervlakte van een vierkant is 100 cm². Bepaal de lengte van de zijde van dit vierkant.
$\bullet \quad$ Keuze onbekende: lengte van een zijde van het vierkant: $x$
$\bullet \quad$ Vergelijking:
$x^2 = 100$
$x = 10 \text{ of } x = -10$
$\lfloor \text{een lengte kan niet negatief zijn}$
$\bullet \quad$ Antwoord: De lengte van een zijde van het vierkant is 10 cm.

42
Bereken de waarde van x in de rechthoekige driehoek ABC. Pas de stelling van Pythagoras toe.

[Afbeelding: Een rechthoekige driehoek ABC. De rechthoekszijde AB heeft lengte $1 + x$. De rechthoekszijde BC heeft lengte $2 + x$. De schuine zijde AC heeft lengte $7 - x$. De rechte hoek is bij B.]

$\bullet \quad$ Keuze onbekende: zie figuur
$\bullet \quad$ Vergelijking:
$(7 - x)^2 = (1 + x)^2 + (2 + x)^2$
$49 - 14x + x^2 = 1 + 2x + x^2 + 4 + 4x + x^2$
$49 - 14x + x^2 = 5 + 6x + 2x^2$
$44 - 20x - x^2 = 0$
$\circ \quad D = 400 - 4 \cdot (-1) \cdot 44$
$= 400 + 176$
$= 576$
$\circ \quad x_1 = \frac{20 + 24}{2 \cdot (-1)} = \frac{44}{-2} = -22$
$x_2 = \frac{20 - 24}{2 \cdot (-1)} = \frac{-4}{-2} = 2$
$\circ \quad 1 + (-22) < 0$
$\bullet \quad$ Antwoord: x is 2.

--- PAGE 60 ---
43
De oppervlakte van een cirkel bedraagt 72 cm². Bereken de omtrek van de cirkel op 0,01 cm nauwkeurig.
$\bullet \quad$ Keuze onbekende: de straal: $r$
$\bullet \quad$ Vergelijking:
$r^2 \cdot \pi = 72$
$r^2 = \frac{72}{\pi}$
$r = \sqrt{\frac{72}{\pi}} \text{ of } 2\sqrt{\frac{72}{\pi}} \cdot \pi \approx 30,08\text{ cm}$
$\bullet \quad$ Antwoord: De omtrek is ongeveer 30,08 cm.

44
Het product van twee opeenvolgende natuurlijke getallen x en x + 1 is gelijk aan 182. Welke getallen zijn dat?
$\bullet \quad$ Keuze onbekende: zie opgave
$\bullet \quad$ Vergelijking:
$x \cdot (x + 1) = 182$
$x^2 + x - 182 = 0$
$\circ \quad D = 1 - 4 \cdot 1 \cdot (-182)$
$= 1 + 728$
$= 729$
$\circ \quad x_1 = \frac{-1 + 27}{2 \cdot 1} = \frac{26}{2} = 13$
$x_2 = \frac{-1 - 27}{2 \cdot 1} = \frac{-28}{2} = -14 \notin \mathbb{N}$
$\bullet \quad$ Antwoord: De natuurlijke getallen zijn 13 en 14.

45
Bepaal twee getallen waarvan de som 24 en het product 108 is.
$\bullet \quad$ Keuze onbekenden:
getal 1: $x$
getal 2: $24 - x$
$\bullet \quad$ Vergelijking:
$x \cdot (24 - x) = 108$
$24x - x^2 = 108$
$-x^2 + 24x - 108 = 0$
$\circ \quad D = 576 - 4 \cdot (-1) \cdot (-108)$
$= 576 - 432$
$= 144$
$\circ \quad x_1 = \frac{-24 + 12}{2 \cdot (-1)} = \frac{-12}{-2} = 6$
$x_2 = \frac{-24 - 12}{2 \cdot (-1)} = \frac{-36}{-2} = 18$
$\circ \quad 24 - x_1 = 18$
$24 - x_2 = 6$
$\bullet \quad$ Antwoord: De getallen zijn 6 en 18.

--- PAGE 61 ---
46
De oppervlakte van het paarse deel is 10. Bereken de lengte van de zijden van het vierkant en de rechthoek.

[Afbeelding: Een grote rechthoek is verdeeld in een vierkant met zijde x linksboven, en een L-vormige paarse regio. De breedte van de grote rechthoek bovenaan is $3x + 5$. De rechthoek rechts heeft breedte $2x$. De hoogte van het kleine vierkant links is gemarkeerd als $x$. De paarse regio bevindt zich onder het kleine vierkant en links van de rechthoek met breedte $2x$.]

$\bullet \quad$ Keuze onbekende: zie figuur
$\bullet \quad$ Vergelijking:
$(3x + 5) \cdot 2x - x \cdot x = 10$
$6x^2 + 10x - x^2 = 10$
$5x^2 + 10x - 10 = 0$
$\circ \quad D = 100 - 4 \cdot 5 \cdot (-10)$
$= 100 + 200$
$= 300$
$\circ \quad x_1 = \frac{-10 + 10\sqrt{3}}{10} = -1 + \sqrt{3}$
$x_2 = \frac{-10 - 10\sqrt{3}}{10} = -1 - \sqrt{3}$
$2 \cdot (-1 - \sqrt{3}) < 0$
$\circ \quad 3 \cdot (-1 + \sqrt{3}) + 5 = -3 + 3\sqrt{3} + 5 = 2 + 3\sqrt{3}$
$2 \cdot (-1 + \sqrt{3}) = -2 + 2\sqrt{3}$
$\bullet \quad$ Antwoord: Het vierkant heeft een zijde van $-1 + \sqrt{3}$ en de rechthoek heeft zijden van $2 + 3\sqrt{3}$ en $-2 + 2\sqrt{3}$.

47
Van een rechthoekige driehoek is de omtrek 40 cm en de oppervlakte 60 cm². De schuine zijde is 17 cm lang. Bereken de lengte van de rechthoekszijden.

[Afbeelding: Een rechthoekige driehoek met schuine zijde 17. De rechthoekszijden zijn aangeduid met $x$ en $40 - 17 - x = 23 - x$.]

$\bullet \quad$ Keuze onbekende: $x$
$\bullet \quad$ Vergelijking:
$\frac{(23 - x) \cdot x}{2} = 60$
$(23 - x) \cdot x = 120$
$23x - x^2 = 120$
$-x^2 + 23x - 120 = 0$
$\circ \quad D = 529 - 4 \cdot (-1) \cdot (-120)$
$= 49$
$\circ \quad x_1 = \frac{-23 + 7}{2 \cdot (-1)} = \frac{-16}{-2} = 8$
$x_2 = \frac{-23 - 7}{2 \cdot (-1)} = \frac{-30}{-2} = 15$
$\circ \quad 23 - 8 = 15$
$23 - 15 = 8$
$\bullet \quad$ Antwoord: De rechthoekszijden zijn 8 cm en 15 cm lang.

--- PAGE 62 ---
48
Zoek twee getallen waarvan het verschil 4 is, terwijl de som van de kwadraten 38 is.
$\bullet \quad$ Keuze onbekenden:
getal 1: $x$
getal 2: $x + 4$
$\bullet \quad$ Vergelijking:
$x^2 + (x + 4)^2 = 38$
$x^2 + x^2 + 8x + 16 = 38$
$2x^2 + 8x - 22 = 0$
$\circ \quad D = 64 - 4 \cdot 2 \cdot (-22)$
$= 64 + 176$
$= 240$
$\circ \quad x_1 = \frac{-8 + 4\sqrt{15}}{2 \cdot 2} = \frac{-8 + 4\sqrt{15}}{4} = -2 + \sqrt{15}$
$x_2 = \frac{-8 - 4\sqrt{15}}{4} = -2 - \sqrt{15}$
$\circ \quad x_1 + 4 = 2 + \sqrt{15}$
$x_2 + 4 = 2 - \sqrt{15}$
$\bullet \quad$ Antwoord: De getallen zijn $-2 + \sqrt{15}$ en $2 + \sqrt{15}$ of $-2 - \sqrt{15}$ en $2 - \sqrt{15}$.

49
De oppervlakte van een rechthoekige kamer is 40 m². De omtrek is 26 m. Bepaal de lengte en de breedte van de kamer.
$\bullet \quad$ Keuze onbekenden: de lengte: $x$
$2(x + y) = 26$
$x + y = 13$
$y = 13 - x$
de breedte: $13 - x$

[Afbeelding: Een rechthoek met lengte x en breedte y.]

$\bullet \quad$ Vergelijking:
$x \cdot (13 - x) = 40$
$13x - x^2 = 40$
$-x^2 + 13x - 40 = 0$
$\circ \quad D = 13^2 - 4 \cdot (-1) \cdot (-40)$
$= 169 - 160$
$= 9$
$\circ \quad x_1 = \frac{-13 + 3}{2 \cdot (-1)} = \frac{-10}{-2} = 5$
$x_2 = \frac{-13 - 3}{2 \cdot (-1)} = \frac{-16}{-2} = 8$
$\circ \quad 13 - x_1 = 8$
$13 - x_2 = 5$
$\bullet \quad$ Antwoord: De lengte en de breedte zijn 5 cm en 8 cm.

--- PAGE 63 ---
50
De omtrek van een rechthoek is 56 m en de diagonaal meet 20 m. Bereken de lengte en breedte van de rechthoek.
$\bullet \quad$ Keuze onbekenden: de lengte: $x$
$2(x + y) = 56$
$x + y = 28$
$y = 28 - x$
de breedte: $28 - x$

[Afbeelding: Een rechthoek met lengte x, breedte y en een diagonaal van 20 m.]

$\bullet \quad 20^2 = x^2 + (28 - x)^2$
$400 = x^2 + 784 - 56x + x^2$
$0 = 2x^2 - 56x + 384$
$\circ \quad D = (-56)^2 - 4 \cdot 2 \cdot 384$
$= 3136 - 3072$
$= 64$
$\circ \quad x_1 = \frac{56 + 8}{4} = 16$
$x_2 = \frac{56 - 8}{4} = 12$
$\circ \quad 28 - x_1 = 12$
$28 - x_2 = 16$
$\bullet \quad$ Antwoord: De lengte en de breedte van de rechthoek zijn 12 m en 16 m.

51
Bepaal de vergelijking van de parabool die door de punten (0, 1), (2, 1) en (3, 7) gaat.

[Afbeelding: Een grafiek toont een dalparabool met de vergelijking $y = f(x)$. De parabool gaat door de punten (0, 1), (2, 1) en (3, 7). Deze punten zijn gemarkeerd met een stip.]

$\begin{cases} a \cdot 0^2 + b \cdot 0 + c = 1 \\ a \cdot 2^2 + b \cdot 2 + c = 1 \\ a \cdot 3^2 + b \cdot 3 + c = 7 \end{cases}$
$\Leftrightarrow \begin{cases} c = 1 \\ 4a + 2b + 1 = 1 \\ 9a + 3b + 1 = 7 \end{cases}$
$\Leftrightarrow \begin{cases} c = 1 \\ 4a + 2b = 0 \\ 9a + 3b = 6 \end{cases}$
$\Leftrightarrow \begin{cases} c = 1 \\ 2b = -4a \\ 9a + 3b = 6 \end{cases}$

--- PAGE 64 ---
$\Leftrightarrow \begin{cases} c = 1 \\ b = -2a \\ 9a + 3 \cdot (-2a) = 6 \end{cases}$
$\Leftrightarrow \begin{cases} c = 1 \\ b = -2a \\ 9a - 6a = 6 \end{cases}$
$\Leftrightarrow \begin{cases} c = 1 \\ b = -2a \\ 3a = 6 \end{cases}$
$\Leftrightarrow \begin{cases} c = 1 \\ b = -2a \\ a = 2 \end{cases}$
$\Leftrightarrow \begin{cases} c = 1 \\ b = -4 \\ a = 2 \end{cases}$

$f(x) = 2x^2 - 4x + 1$

52
Scoutsleidster Lotte bestelt slaaptenten voor de 140 deelnemers van het zomerkamp. Leidster Hanne merkt op dat als er in elke tent één persoon meer slaapt, er 7 tenten minder moeten worden besteld. Hoeveel personen wil Hanne in een tent laten slapen?
$\bullet \quad$ Keuze onbekende: aantal personen per tent volgens Lotte: $x$
$\bullet \quad$ Vergelijking:
$\frac{140}{x} = \frac{140}{x + 1} + 7$
$140(x + 1) = 140x + 7x(x + 1)$
$140x + 140 = 140x + 7x^2 + 7x$
$7x^2 + 7x - 140 = 0$
$\circ \quad D = 49 - 4 \cdot 7 \cdot (-140)$
$= 49 + 3920$
$= 3969$
$\circ \quad x_1 = \frac{-7 + 63}{14} = \frac{56}{14} = 4$
$x_2 = \frac{-7 - 63}{14} < 0$
$\bullet \quad$ Antwoord: Hanne wil 5 personen in een tent laten slapen.

--- PAGE 65 ---
53
Voor een klasuitstap kost de bus 630 euro. Zeven leerlingen kunnen om een of andere reden niet mee. Daardoor moeten de resterende leerlingen elk 3 euro extra betalen. Hoeveel leerlingen gaan uiteindelijk mee op klasuitstap en wat betaalt ieder?
$\bullet \quad$ Keuze onbekende: oorspronkelijk aantal leerlingen: $x$
$\bullet \quad$ Vergelijking:
$\frac{630}{x} + 3 = \frac{630}{x - 7}$
$630(x - 7) + 3x(x - 7) = 630x$
$630x - 4410 + 3x^2 - 21x = 630x$
$3x^2 - 21x - 4410 = 0$
$\circ \quad D = (-21)^2 - 4 \cdot 3 \cdot (-4410)$
$= 53361$
$\circ \quad x_1 = \frac{21 + 231}{2 \cdot 3} = 42$
$x_2 = \frac{21 - 231}{6} < 0$
$\circ \quad x - 7 = 42 - 7 = 35$
$\frac{630}{42} + 3 = 15 + 3 = 18$
$\bullet \quad$ Antwoord: Er gaan 35 leerlingen mee en iedereen betaalt € 18.

54
Stel de tekentabel op van de tweedegraadsfuncties waarvan de grafiek gegeven is.

a)
[Afbeelding: Een grafiek toont de dalparabool $y = f(x)$. De parabool snijdt de x-as in (-4,0) en (2,0).]

| $x$ | $-\infty$ | $-4$ | | $2$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |

b)
[Afbeelding: Een grafiek toont een bergparabool $y = f(x)$. De parabool snijdt de x-as niet en ligt volledig onder de x-as.]

| $x$ | $-\infty$ | $+\infty$ |
| :--- | :--- | :--- |
| $f(x)$ | $-$ | |

--- PAGE 66 ---
55
Beschouw de functie f met de volgende tekentabel.

| $x$ | | $-3$ | | $1,5$ | |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |

Vul aan met $<$, $=$ of $>$.

a) $f(-8) \dots 0$
$a) >$

b) $f(-3) \dots 0$
$b) =$

c) $f(-1) \dots 0$
$c) <$

d) $f(4,5) \dots 0$
$d) >$

56
Stel de tekentabel op van de volgende tweedegraadsfuncties.

a) $f(x) = x^2 - 7x + 6$
$0 = x^2 - 7x + 6$
$\bullet \quad D = 49 - 4 \cdot 1 \cdot 6$
$= 25$
$\bullet \quad x_1 = \frac{7 + 5}{2} = 6$
$x_2 = \frac{7 - 5}{2} = 1$
$\bullet \quad$
| $x$ | $-\infty$ | $1$ | | $6$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$

b) $f(x) = x^2 - 9$
$0 = x^2 - 9$
$0 = (x + 3)(x - 3)$
$x = -3 \text{ of } x = 3$
$\bullet \quad$
| $x$ | $-\infty$ | $-3$ | | $3$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$

c) $f(x) = -2x^2 + 3x - 6$
$0 = -2x^2 + 3x - 6$
$\bullet \quad D = 9 - 4 \cdot (-2) \cdot (-6)$
$= 9 - 48$
$< 0$
$\bullet \quad$
| $x$ | $-\infty$ | $+\infty$ |
| :--- | :--- | :--- |
| $f(x)$ | $-$ | |
$a < 0 \Rightarrow \text{bergparabool}$

**TIP**
*   Bereken eerst de nulwaarden.
*   Is de grafiek een dal- of een bergparabool?
*   Maak een schets van een (berg/dal)parabool met 0, 1 of 2 nulwaarden.

--- PAGE 67 ---
57
Construeer de grafiek van een tweedegraadsfunctie met de volgende tekentabel.

| $x$ | | $-2$ | | $4$ | |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |

bv.
[Afbeelding: Een grafiek toont een bergparabool $f(x) = -\frac{1}{9}(x - 1)^2 + 1$. De parabool snijdt de x-as in (-2, 0) en (4, 0). De top ligt in (1, 1).]

**TIP**
Omwille van symmetrie ligt de top op gelijke afstand van de snijpunten van de parabool met de x-as.

58
Los de ongelijkheden op door gebruik te maken van de gegeven grafieken.

a) $x^2 - 3 < 1$
[Afbeelding: Een grafiek toont de dalparabool $f(x) = x^2 - 3$. Een horizontale as op y=1 toont dat het deel van de parabool onder y=1 overeenkomt met de x-waarden tussen -2 en 2.]
$V = \left]-2, 2\right[$

b) $(x + 3)(3 - x) > 0$
[Afbeelding: Een grafiek toont de bergparabool $g(x) = (x + 3)(3 - x)$. Het deel van de parabool boven de x-as komt overeen met de x-waarden tussen -3 en 3.]
$V = \left]-3, 3\right[$

c) $3x^2 - 9x > -6$
[Afbeelding: Een grafiek toont de dalparabool $h(x) = 3x^2 - 9x$. Een horizontale as op y=-6 toont dat het deel van de parabool boven y=-6 overeenkomt met de x-waarden tussen 1 en 2.]
$V = \left]1, 2\right[$

--- PAGE 68 ---
59
Los de tweedegraadsongelijkheden grafisch op met behulp van ICT.

a) $x^2 + 8x + 20 < 0$
a) $V = \emptyset$

b) $x^2 + 6x + 8 > 0$
b) $V = \left]-\infty, -4\right[ \cup \left]-2, +\infty\right[$

c) $-x^2 - 7x \geqslant 0$
c) $V = [-7, 0]$

d) $2x^2 - 8x + 9 < 3$
d) $V = \left]1, 3\right[$

60
Los de tweedegraadsongelijkheden algebraïsch op.

a) $-x^2 + 4x - 1 > 2$
$-x^2 + 4x - 3 > 0$
$D = 4^2 - 4 \cdot (-1) \cdot (-3)$
$D = 4$
$x_1 = \frac{-4 + \sqrt{4}}{2 \cdot (-1)} = 1$
$x_2 = \frac{-4 - \sqrt{4}}{2 \cdot (-1)} = 3$
| $x$ | $-\infty$ | $1$ | | $3$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |
$V = \left]1, 3\right[$

b) $x^2 + 22x + 121 < 0$
$D = 22^2 - 4 \cdot 1 \cdot 121$
$D = 0$
$x = \frac{-22}{2 \cdot 1} = -11$
| $x$ | $-\infty$ | $-11$ | $+\infty$ |
| :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $+$ |
$V = \emptyset$

c) $x^2 - 3x + 13 \leqslant 0$
$D = (-3)^2 - 4 \cdot 1 \cdot 13$
$D = -43$
| $x$ | $-\infty$ | $+\infty$ |
| :--- | :--- | :--- |
| $f(x)$ | $+$ | |
$V = \emptyset$

d) $9x^2 - 12x + 4 \geqslant 0$
$D = (-12)^2 - 4 \cdot 9 \cdot 4$
$D = 0$
$x = \frac{12}{18} = \frac{2}{3}$
| $x$ | $-\infty$ | $\frac{2}{3}$ | $+\infty$ |
| :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $+$ |
$V = \mathbb{R}$

--- PAGE 69 ---
61
Voor welke stralen is de oppervlakte van de bijhorende cirkel kleiner dan of gelijk aan 100 cm²?

$\pi \cdot r^2 \leqslant 100$
$r^2 \leqslant \frac{100}{\pi}$
$r \leqslant \sqrt{\frac{100}{\pi}}$

Antwoord: De straal moet kleiner of gelijk zijn aan $\approx 5,64\text{ cm}$.

62
Los de tweedegraadsongelijkheden grafisch op met behulp van ICT.

a) $x^2 - 2x - 20 < 34 + x$
a) $V = \left]-6, 9\right[$

b) $-3x^2 + 5x + 5 > 2x - 1$
b) $V = \left]-1, 2\right[$

c) $-5x^2 - 2x \geqslant 3x^2$
c) $V = \left[-\frac{1}{4}, 0\right]$

d) $(2x - 3)^2 < -8x + 8$
d) $V = \emptyset$

--- PAGE 70 ---
63
Los de tweedegraadsongelijkheden algebraïsch op.

a) $3x^2 - 4x + 1 < 3x - 1$
$3x^2 - 7x + 2 < 0$
$D = (-7)^2 - 4 \cdot 3 \cdot 2$
$D = 25$
$x_1 = \frac{7 + \sqrt{25}}{2 \cdot 3} = 2$
$x_2 = \frac{7 - \sqrt{25}}{2 \cdot 3} = \frac{1}{3}$
| $x$ | $-\infty$ | $\frac{1}{3}$ | | $2$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$V = \left]\frac{1}{3}, 2\right[$

b) $40 + 10x > -x^2 - 4x + 9$
$x^2 + 14x + 31 > 0$
$D = 14^2 - 4 \cdot 1 \cdot 31$
$D = 72$
$x_1 = \frac{-14 + 6\sqrt{2}}{2} = -7 + 3\sqrt{2}$
$x_2 = \frac{-14 - 6\sqrt{2}}{2} = -7 - 3\sqrt{2}$
| $x$ | $-\infty$ | $-7 - 3\sqrt{2}$ | | $-7 + 3\sqrt{2}$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$V = \left]-\infty, -7 - 3\sqrt{2}\right[ \cup \left]-7 + 3\sqrt{2}, +\infty\right[$

c) $-5x^2 + 3x + 4 < -2x + 6$
$-5x^2 + 5x - 2 < 0$
$D = 5^2 - 4 \cdot (-5) \cdot (-2)$
$D = -15$
| $x$ | $-\infty$ | $+\infty$ |
| :--- | :--- | :--- |
| $f(x)$ | $-$ | |
$V = \mathbb{R}$

d) $2x^2 - 3x - 1 \geqslant 2(3x + 2)$
$2x^2 - 3x - 1 \geqslant 6x + 4$
$2x^2 - 9x - 5 \geqslant 0$
$D = (-9)^2 - 4 \cdot 2 \cdot (-5)$
$D = 121$
$x_1 = \frac{9 + 11}{4} = 5$
$x_2 = \frac{9 - 11}{4} = -\frac{1}{2}$
| $x$ | $-\infty$ | $-\frac{1}{2}$ | | $5$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$V = \left]-\infty, -\frac{1}{2}\right] \cup [5, +\infty[$

--- PAGE 71 ---
64
De hoogte van een voetbal kan worden weergegeven met behulp van de functie h met voorschrift $h(t) = -4,9t^2 + 20t + 1$ (met t de tijd in seconden). Binnen welke tijdsspanne bevindt de bal zich niet hoger dan 5 meter?

[Afbeelding: Een voetbalspeler schiet een bal op een groen grasveld.]

$-4,9t^2 + 20t + 1 \leqslant 5$
$-4,9t^2 + 20t - 4 \leqslant 0$
$D = (20)^2 - 4 \cdot (-4,9) \cdot (-4)$
$D = 321,6$
$x_1 = \frac{-20 + \sqrt{321,6}}{2 \cdot (-4,9)} = 0,21$
$x_2 = \frac{-20 - \sqrt{321,6}}{2 \cdot (-4,9)} = 3,87$

| $x$ | $-\infty$ | $\approx 0,21$ | | $\approx 3,87$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |

Antwoord: De bal is niet hoger dan 5 meter van 0 tot $\approx 0,21\text{ s}$ en vanaf $\approx 3,87\text{ s}$.

65
Om een rechthoekig stuk grond af te spannen heeft Jef een draad van 68 meter lang. Binnen welke afmetingen moet Jef werken zodat de oppervlakte van de grond minstens 240 m² is?

Stel: $l = x$
$b = \frac{68 - 2x}{2}$
$l \cdot b \geqslant 240$
$x \cdot \left(\frac{68 - 2x}{2}\right) \geqslant 240$
$x \cdot (34 - x) \geqslant 240$
$34x - x^2 \geqslant 240$
$-x^2 + 34x - 240 \geqslant 0$
$D = 34^2 - 4 \cdot (-1) \cdot (-240)$
$D = 196$
$x_1 = \frac{-39 + 14}{-2} = 10$
$x_2 = \frac{-34 - 14}{-2} = 24$

| $x$ | $-\infty$ | $10$ | | $24$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |

$V = [10, 24]$

Antwoord: De afmetingen moeten gelijk of groter zijn dan 10 meter en kleiner of gelijk aan 24 m.

--- PAGE 72 ---
66
Los de tweedegraadsongelijkheden grafisch op met behulp van ICT.

a) $2x^2 - 3x - 1 \leqslant x^2 - 2x + 1$
a) $V = [-1, 2]$

b) $x^2 - 16x + 62 < x^2 - 3x - 3$
b) $V = \left]5, +\infty\right[$

c) $4x^2 + 5x + 3 < -x^2 - 3x - 1$
c) $V = \emptyset$

d) $x^2 - 2x - 5 < 3x^2 - 6x - 2$
d) $V = \mathbb{R}$

67
Los de tweedegraadsongelijkheden algebraïsch op.

a) $x^2 + 4x - 9 \geqslant 3x^2 + 9$
$-2x^2 + 4x - 18 \geqslant 0$
$D = 4^2 - 4 \cdot (-2) \cdot (-18)$
$D = -128$
| $x$ | $-\infty$ | $+\infty$ |
| :--- | :--- | :--- |
| $f(x)$ | $-$ | |
$V = \emptyset$

b) $\frac{2x^2 - 4}{3} > \frac{-x^2 + 8}{3}$
$2x^2 - 4 > -x^2 + 8$
$3x^2 > 12$
$x^2 > \frac{12}{3}$
$x^2 > 4$
$x > \sqrt{4}$
| $x$ | $-\infty$ | $-2$ | | $2$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$V = \left]-\infty, -2\right[ \cup \left]2, +\infty\right[$

c) $(x - 4)(x + 3) < x^2 + 6x + 9$
$x^2 + 3x - 4x - 12 < x^2 + 6x + 9$
$-7x < 21$
$x > \frac{21}{-7}$
$x > -3$
| $x$ | $-\infty$ | $-3$ | $+\infty$ |
| :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ |
$V = \left]-3, +\infty\right[$

d) $-7x^2 > -9x^2 + 4x - 1$
$2x^2 - 4x + 1 > 0$
$D = (-4)^2 - 4 \cdot 2 \cdot 1$
$D = 8$
$x_1 = \frac{4 + 2\sqrt{2}}{4} = 1 + \frac{\sqrt{2}}{2}$
$x_2 = \frac{4 - 2\sqrt{2}}{4} = 1 - \frac{\sqrt{2}}{2}$
| $x$ | $-\infty$ | $1 - \frac{\sqrt{2}}{2}$ | | $1 + \frac{\sqrt{2}}{2}$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$V = \left]-\infty, 1 - \frac{\sqrt{2}}{2}\right[ \cup \left]1 + \frac{\sqrt{2}}{2}, +\infty\right[$

--- PAGE 73 ---
68
Los de volgende ongelijkheden algebraïsch op. Leg het verband tussen de oplossing van de ongelijkheid en de grafiek van de verwante tweedegraadsfunctie.

a) $4x^2 + 9x + 2 \leqslant 0$
$\bullet \quad 4x^2 + 9x + 2 = 0$
$\bullet \quad D = 81 - 4 \cdot 4 \cdot 2$
$= 81 - 32$
$= 49$
$\bullet \quad x_1 = \frac{-9 + 7}{2 \cdot 4} = \frac{-2}{8} = -\frac{1}{4}$
$x_2 = \frac{-9 - 7}{8} = \frac{-16}{8} = -2$
$\bullet \quad$
| $x$ | $-\infty$ | $-2$ | | $-\frac{1}{4}$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$
$\bullet \quad V = \left[-2, -\frac{1}{4}\right]$

b) $3x^2 - 13x + 4 > 0$
$\bullet \quad 3x^2 - 13x + 4 = 0$
$\bullet \quad D = 169 - 4 \cdot 3 \cdot 4$
$= 169 - 48$
$= 121$
$\bullet \quad x_1 = \frac{13 + 11}{6} = \frac{24}{6} = 4$
$x_2 = \frac{13 - 11}{6} = \frac{2}{6} = \frac{1}{3}$
$\bullet \quad$
| $x$ | $-\infty$ | $\frac{1}{3}$ | | $4$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$
$\bullet \quad V = \left]-\infty, \frac{1}{3}\right[ \cup \left]4, +\infty\right[$

c) $4x^2 - 5x + 2 \leqslant 0$
d) $\frac{x^2}{2} - 4x + 1 \geqslant 0$
e) $9x^2 + 6x + 1 < 0$

--- PAGE 74 ---
c) $4x^2 - 5x + 2 \leqslant 0$
$\bullet \quad 4x^2 - 5x + 2 = 0$
$\bullet \quad D = 25 - 4 \cdot 4 \cdot 2$
$= 25 - 32$
$< 0$
$\bullet \quad$
| $x$ | $-\infty$ | $+\infty$ |
| :--- | :--- | :--- |
| $f(x)$ | $+$ | |
$a > 0 \Rightarrow \text{dalparabool}$
$\bullet \quad V = \emptyset$

d) $\frac{x^2}{2} - 4x + 1 \geqslant 0$
$\bullet \quad \frac{x^2}{2} - 4x + 1 = 0$
$\bullet \quad D = 16 - 4 \cdot \frac{1}{2} \cdot 1$
$= 16 - 2$
$= 14$
$\bullet \quad x_1 = \frac{4 + \sqrt{14}}{1} = 4 + \sqrt{14}$
$x_2 = 4 - \sqrt{14}$
$\bullet \quad$
| $x$ | $-\infty$ | $4 - \sqrt{14}$ | | $4 + \sqrt{14}$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$
$\bullet \quad V = \left]-\infty, 4 - \sqrt{14}\right] \cup \left[4 + \sqrt{14}, +\infty\right[$

e) $9x^2 + 6x + 1 < 0$
$\bullet \quad 9x^2 + 6x + 1 = 0$
$\bullet \quad D = 36 - 4 \cdot 9 \cdot 1$
$= 0$
$\bullet \quad x_1 = x_2 = \frac{-6}{18} = -\frac{1}{3}$
$\bullet \quad$
| $x$ | $-\infty$ | $-\frac{1}{3}$ | $+\infty$ |
| :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$
$\bullet \quad V = \emptyset$

--- PAGE 75 ---
69
Voor welke waarde van x ...
a) snijdt de grafiek de x-as?
b) ligt de grafiek boven de x-as?
c) ligt de grafiek onder de x-as?
Let op: Je mag de discriminant en de wortelformule niet gebruiken!

$f(x) = 3x^2 - 5x$
$\bullet \quad f(x) = 3x^2 - 5x$
$0 = 3x^2 - 5x$
$0 = x(3x - 5)$
$0 = x \text{ of } 3x - 5 = 0$
$0 = x \text{ of } x = \frac{5}{3}$
$\bullet \quad$
| $x$ | $-\infty$ | $0$ | | $\frac{5}{3}$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$
a) $x = 0 \text{ en } x = \frac{5}{3}$
b) $x \in \left]-\infty, 0\right[ \cup \left]\frac{5}{3}, +\infty\right[$
c) $x \in \left]0, \frac{5}{3}\right[$

$g(x) = 10 - x^2$
$\bullet \quad g(x) = 10 - x^2$
$0 = 10 - x^2$
$x^2 = 10$
$x = \sqrt{10} \text{ of } x = -\sqrt{10}$
$\bullet \quad$
| $x$ | $-\infty$ | $-\sqrt{10}$ | | $\sqrt{10}$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $g(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |
$a < 0 \Rightarrow \text{bergparabool}$
a) $x = -\sqrt{10} \text{ en } x = \sqrt{10}$
b) $x \in \left]-\sqrt{10}, \sqrt{10}\right[$
c) $x \in \left]-\infty, -\sqrt{10}\right[ \cup \left]\sqrt{10}, +\infty\right[$

$h(x) = x^2 - 4x + 4$
$\bullet \quad h(x) = x^2 - 4x + 4$
$0 = x^2 - 4x + 4$
$0 = (x - 2)^2$
$0 = x - 2$
$2 = x$
$\bullet \quad$
| $x$ | $-\infty$ | $2$ | $+\infty$ |
| :--- | :--- | :--- | :--- |
| $h(x)$ | $+$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$
a) $x = 2$
b) $x \in \mathbb{R} \setminus \{2\}$
c) $\emptyset$

--- PAGE 76 ---
70
Beschouw de functie f met voorschrift $f(x) = x^2 + 4x + 1$. Welke ongelijkheid moet je oplossen om de x-waarden te vinden van de punten van de parabool die boven de horizontale rechte $y = 4$ liggen? Los deze ongelijkheid op. Komt je oplossing overeen met de onderstaande figuur?

[Afbeelding: Een grafiek toont de dalparabool $f(x) = x^2 + 4x + 1$ (paarse curve). Een horizontale as op $y=4$ (groene rechte) snijdt de parabool. Het gebied van de parabool boven de lijn $y=4$ is groen gemarkeerd op de y-as (voor y>4). De bijbehorende x-waarden zijn ook groen gemarkeerd op de x-as: voor $x < -4,65$ en $x > 0,65$.]

$f(x) > 4$
$x^2 + 4x + 1 > 4$
$x^2 + 4x - 3 > 0$
$\bullet \quad D = 16 - 4 \cdot 1 \cdot (-3)$
$= 28$
$\bullet \quad x_1 = \frac{-4 + \sqrt{28}}{2} = \frac{-4 + 2\sqrt{7}}{2} = -2 + \sqrt{7} \approx 0,65$
$x_2 = \frac{-4 - 2\sqrt{7}}{2} = -2 - \sqrt{7} \approx -4,65$

71
Los de volgende ongelijkheden op.
a) $(x + 3)^2 - x \leqslant 2x(x + 3) - (1 - 2x)$
b) $x(x^2 - 5x + 2) + 6 > x(x^2 + 1) - (2x)^2$
c) $5x(x - 1) \geqslant 6(1 - 2x)$

a) $(x + 3)^2 - x \leqslant 2x(x + 3) - (1 - 2x)$
$x^2 + 6x + 9 - x \leqslant 2x^2 + 6x - 1 + 2x$
$-x^2 - 3x + 10 \leqslant 0$
$\bullet \quad D = 9 - 4 \cdot (-1) \cdot 10$
$= 9 + 40$
$= 49$
$\bullet \quad x_1 = \frac{3 + 7}{2 \cdot (-1)} = \frac{10}{-2} = -5$
$x_2 = \frac{3 - 7}{2 \cdot (-1)} = \frac{-4}{-2} = 2$
$\bullet \quad$
| $x$ | $-\infty$ | $-5$ | | $2$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |
$a < 0 \Rightarrow \text{bergparabool}$
$\bullet \quad V = \left]-\infty, -5\right] \cup [2, +\infty[$

--- PAGE 77 ---
b) $x(x^2 - 5x + 2) + 6 > x(x^2 + 1) - (2x)^2$
$x^3 - 5x^2 + 2x + 6 > x^3 + x - 4x^2$
$-x^2 + x + 6 > 0$
$\bullet \quad D = 1^2 - 4 \cdot (-1) \cdot 6$
$= 1 + 24$
$= 25$
$\bullet \quad x_1 = \frac{-1 + 5}{2 \cdot (-1)} = \frac{4}{-2} = -2$
$x_2 = \frac{-1 - 5}{2 \cdot (-1)} = \frac{-6}{-2} = 3$
$\bullet \quad$
| $x$ | $-\infty$ | $-2$ | | $3$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |
$a < 0 \Rightarrow \text{bergparabool}$
$\bullet \quad V = \left]-2, 3\right[$

c) $5x(x - 1) \geqslant 6(1 - 2x)$
$5x^2 - 5x \geqslant 6 - 12x$
$5x^2 + 7x - 6 \geqslant 0$
$\bullet \quad D = 49 - 4 \cdot 5 \cdot (-6)$
$= 49 + 120$
$= 169$
$\bullet \quad x_1 = \frac{-7 + 13}{10} = \frac{6}{10} = \frac{3}{5}$
$x_2 = \frac{-7 - 13}{10} = \frac{-20}{10} = -2$
$\bullet \quad$
| $x$ | $-\infty$ | $-2$ | | $\frac{3}{5}$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$
$\bullet \quad V = \left]-\infty, -2\right] \cup \left[\frac{3}{5}, +\infty\right[$

--- PAGE 78 ---
72
Los de volgende ongelijkheden op.

a) $(2x - 1)^2 < 4$ (Werk de haakjes niet uit.)
b) $x(\frac{x}{2} - 1) \geqslant 3$
c) $\frac{3x^2 + 1}{2} - \frac{x^2 - 4}{6} > \frac{5}{2}$

a) $(2x - 1)^2 < 4$
$2x - 1 < 2 \text{ of } 2x - 1 > -2$
$2x < 3 \text{ of } 2x > -1$
$x < \frac{3}{2} \text{ of } x > -\frac{1}{2}$
$V = \left]-\frac{1}{2}, \frac{3}{2}\right[$

b) $x(\frac{x}{2} - 1) \geqslant 3$
$\frac{x^2}{2} - x \geqslant 3$
$\frac{x^2}{2} - x - 3 \geqslant 0$
$\bullet \quad D = 1 - 4 \cdot \frac{1}{2} \cdot (-3)$
$= 1 + 6$
$= 7$
$\bullet \quad x_1 = \frac{1 + \sqrt{7}}{2 \cdot \frac{1}{2}} = 1 + \sqrt{7}$
$x_2 = \frac{1 - \sqrt{7}}{1} = 1 - \sqrt{7}$
$\bullet \quad$
| $x$ | $-\infty$ | $1 - \sqrt{7}$ | | $1 + \sqrt{7}$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$
$\bullet \quad V = \left]-\infty, 1 - \sqrt{7}\right] \cup \left[1 + \sqrt{7}, +\infty\right[$

c) $\frac{3x^2 + 1}{2} - \frac{x^2 - 4}{6} > \frac{5}{2}$
$\frac{3}{2}x^2 + \frac{1}{2} - \frac{1}{6}x^2 + \frac{4}{6} > \frac{5}{2}$
$\frac{4}{3}x^2 - \frac{4}{3} > 0$
$x^2 - 1 > 0$
$x^2 > 1$
$x > 1 \text{ of } x < -1$
$\bullet \quad$
| $x$ | $-\infty$ | $-1$ | | $1$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
$a > 0 \Rightarrow \text{dalparabool}$
$\bullet \quad V = \left]-\infty, -1\right[ \cup \left]1, +\infty\right[$

--- PAGE 79 ---
73
Peter, een gids in Brugge, benadert met de functie r met voorschrift $r(x) = -2,5x^2 + 100x - 300$ het resultaat dat hij maakt in functie van het aantal toeristen. Hoeveel toeristen moeten er zeker zijn alvorens hij een winst heeft van 500 euro?

$-2,5x^2 + 100x - 300 > 500$
$-2,5x^2 + 100x - 800 > 0$
$D = (100)^2 - 4 \cdot (-2,5) \cdot (-800)$
$D = 2000$
$x_1 = \frac{-100 + \sqrt{2000}}{2 \cdot (-2,5)}$
$x_2 = \frac{-100 + \sqrt{2000}}{-5}$
$x_1 \approx 11,06$
$x_2 \approx 28,94$

| $x$ | $-\infty$ | $11,06$ | | $28,94$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |

Antwoord: De gids moet meer dan 12 en minder dan 29 toeristen hebben om 500 euro winst te maken.

--- PAGE 80 ---
74
Een schoonspringster duikt met een springplank vanop een bepaalde hoogte in het water. Haar hoogte kan beschreven worden in functie van de tijd door $h(t) = -1,2(4t + 5)(t - 3)$. Hoelang bevindt de schoonspringster zich hoger dan haar starthoogte?

[Afbeelding: Een foto van een schoonspringster op een springplank, klaar om in het zwembad te duiken.]

Starthoogte
$h(t) = -1,2(4 \cdot t + 5)(t - 3)$
$h(0) = -1,2(4 \cdot 0 + 5) \cdot (0 - 3)$
$h = -1,2 \cdot 5 \cdot (-3)$
$h = 18$
De starthoogte is 18 m

$-1,2(4t + 5)(t - 3) > 18$
$-1,2(4t^2 - 12t + 5t - 15) > 18$
$-1,2(4t^2 - 7t - 15) > 18$
$-4,8t^2 + 8,4t + 18 > 18$
$-4,8t^2 + 8,4t > 0$
$t_1 = 0$
$-4,8t + 8,4 = 0$
$-4,8t = -8,4$
$t_2 = \frac{-8,4}{-4,8}$
$t_2 = \frac{7}{4}$

| $x$ | $-\infty$ | $0$ | | $1,75$ | $+\infty$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ |

$V = \left]0, \frac{7}{4}\right[$

Antwoord: De schoonspringer is tussen 0 en 1,75 seconden boven de 18 meter van haar startpositie.

--- PAGE 81 ---
75
Voor welke waarden van p heeft de ongelijkheid $px^2 - 6x + 3 < 0$ geen oplossingen?

$px^2 - 6x + 3 < 0$
$D = (-6)^2 - 4 \cdot p \cdot 3$
$D = 36 - 12p$
$D < 0$
$36 - 12p < 0$
$-12p < -36$
$p > \frac{-36}{-12}$
$p > 3$

Antwoord: Voor een waarde van p groter dan 3 heb je geen oplossing.

76
Voor welke waarden van p heeft de ongelijkheid $x^2 - 9x + p \leqslant -2x^2 - px$ precies 1 oplossing?

$x^2 - 9x + p \leqslant -2x^2 - px$
$3x^2 - 9x + px + p \leqslant 0$
$D = 0$
$D = (p - 9)^2 - 4 \cdot 3 \cdot p$
$D = p^2 - 18p + 81 - 12p$
$D = p^2 - 30p + 81$
$0 = p^2 - 30p + 81$
1 oplossing voor discriminant $D = 0$
$D = (-30)^2 - 4 \cdot 1 \cdot 81$
$D = 576$
$p_1 = \frac{30 + 24}{2} = 27$
$p_2 = \frac{30 - 24}{2} = 3$

Antwoord: Voor de waarden van p 3 en 27 heeft de vergelijking met parameter maar 1 oplossing.

--- PAGE 82 ---
77
Stel zelf een ongelijkheid op met een veelterm van de tweede graad die als oplossingenverzameling V heeft.

a) $V = [-3, 5]$
b) $V = \left]2, 4\right[$
c) $V = \mathbb{R}$
d) $V = \emptyset$
e) $V = \{3\}$

a) bv. $f(x) = 2 \cdot (x + 3)(x - 5)$
$= (2x + 6)(x - 5)$
$= 2x^2 - 10x + 6x - 30$
$= 2x^2 - 4x - 30$
$2x^2 - 4x - 30 \leqslant 0$

b) bv. $f(x) = 3(x - 2)(x - 4)$
$= (3x - 6)(x - 4)$
$= 3x^2 - 12x - 6x + 24$
$= 3x^2 - 18x + 24$
$3x^2 - 18x + 24 < 0$

c) bv. $x^2 + 5 \geqslant 0$
d) bv. $x^2 + 4 < 0$
e) bv. $f(x) = 4(x - 3)^2$
$= 4(x^2 - 6x + 9)$
$= 4x^2 - 24x + 36$
$4x^2 - 24x + 36 \leqslant 0$

78
Lees de snijpunten van de getekende rechte en parabool grafisch af.

[Afbeelding: Een grafiek met een dalparabool en een rechte lijn. De parabool snijdt de x-as in (2,0) en (5,0) en snijdt de y-as ergens in het negatieve gebied. De rechte lijn is stijgend en snijdt de parabool in twee punten. Deze snijpunten zijn gemarkeerd met een dot. De coördinaten zijn af te lezen als (1, -1) en (6, 4).]

(1, -1) en (6, 4)

--- PAGE 83 ---
79
Teken de raaklijn $y = 4x - 18$ aan de parabool $y = (x - 3)^2 - 2$.
Welk punt hebben de parabool en de raaklijn met elkaar gemeen?

[Afbeelding: Een grafiek met een dalparabool met vergelijking $y = (x - 3)^2 - 2$ (rode curve). De raaklijn aan deze parabool met vergelijking $y = 4x - 18$ (groene stijgende rechte) is getekend en raakt de parabool in het punt (5, 2).]

$\bullet \quad (x - 3)^2 - 2 = 4x - 18$
$x^2 - 6x + 9 - 2 = 4x - 18$
$x^2 - 10x + 25 = 0$
$\bullet \quad D = 100 - 4 \cdot 1 \cdot 25$
$= 100 - 100$
$= 0$
$\bullet \quad x_1 = x_2 = \frac{10}{2} = 5$
$\bullet \quad f(5) = (5 - 3)^2 - 2$
$= 2^2 - 2$
$= 2$
$\bullet \quad$ Antwoord: De parabool en de raaklijn hebben het punt (5, 2) gemeen.

80
Bepaal de snijpunten van de rechte $y = x + 2$ en de parabool $y = x^2$.

$\bullet \quad x + 2 = x^2$
$-x^2 + x + 2 = 0$
$\bullet \quad D = 1^2 - 4 \cdot (-1) \cdot 2$
$= 1 + 8$
$= 9$
$\bullet \quad x_1 = \frac{-1 + 3}{2 \cdot (-1)} = -1$
$x_2 = \frac{-1 - 3}{-2} = 2$
$\bullet \quad -1 + 2 = 1$
$2 + 2 = 4$
$\bullet \quad$ Antwoord: De snijpunten zijn (-1, 1) en (2, 4).

--- PAGE 84 ---
81
Bepaal de snijpunten van de volgende rechten en parabolen.

a) $y = \frac{x^2}{2} - 6x + 2 \quad y = -2x + 2$
b) $y = 2x^2 - 9 \quad y = 4(x - 3)$
c) $y = \frac{x^2 + 1}{2} \quad 6x - 2y - 8 = 0$
d) $y = -\frac{x^2}{2} + 2x + \frac{5}{2} \quad y = x - \frac{3}{2}$

a) $\bullet \quad \frac{x^2}{2} - 6x + 2 = -2x + 2$
$\frac{x^2}{2} - 4x = 0$
$\bullet \quad D = 16 - 4 \cdot \frac{1}{2} \cdot 0$
$= 16$
$\bullet \quad x_1 = \frac{4 + 4}{2 \cdot \frac{1}{2}} = 8$
$x_2 = \frac{4 - 4}{1} = 0$
$\bullet \quad -2 \cdot 8 + 2 = -16 + 2 = -14$
$-2 \cdot 0 + 2 = 2$
$\bullet \quad$ Antwoord: De snijpunten zijn (8, -14) en (0, 2).

b) $\bullet \quad 2x^2 - 9 = 4(x - 3)$
$2x^2 - 9 = 4x - 12$
$2x^2 - 4x + 3 = 0$
$\bullet \quad D = 16 - 4 \cdot 2 \cdot 3$
$= 16 - 24$
$= -8$
$\bullet \quad$ Antwoord: De rechte en parabool hebben geen snijpunten.

c) $\bullet \quad 6x - 2y - 8 = 0$
$6x - 8 = 2y$
$3x - 4 = y$
$\bullet \quad \frac{x^2 + 1}{2} = 3x - 4$
$x^2 + 1 = 6x - 8$
$x^2 - 6x + 9 = 0$
$(x - 3)^2 = 0$
$x = 3$
$\bullet \quad 3 \cdot 3 - 4 = 9 - 4 = 5$
$\bullet \quad$ Antwoord: Het snijpunt is (3, 5).

d) $\bullet \quad -\frac{x^2}{2} + 2x + \frac{5}{2} = x - \frac{3}{2}$
$-\frac{x^2}{2} + x + \frac{8}{2} = 0$
$-\frac{x^2}{2} + x + 4 = 0$
$\bullet \quad D = 1 - 4 \cdot \left(-\frac{1}{2}\right) \cdot 4$
$= 1 + 8$
$= 9$
$\bullet \quad x_1 = \frac{-1 + 3}{-1} = -2$
$x_2 = \frac{-1 - 3}{-1} = 4$
$\bullet \quad -2 - \frac{3}{2} = -\frac{7}{2}$
$4 - \frac{3}{2} = \frac{5}{2}$
$\bullet \quad$ Antwoord: De snijpunten zijn $\left(-2, -\frac{7}{2}\right)$ en $\left(4, \frac{5}{2}\right)$.

--- PAGE 85 ---
a) $\bullet \quad \frac{x^2}{2} - 6x + 2 = -2x + 2$
$\frac{x^2}{2} - 4x = 0$
$\bullet \quad D = 16 - 4 \cdot \frac{1}{2} \cdot 0$
$= 16$
$\bullet \quad x_1 = \frac{4 + 4}{2 \cdot \frac{1}{2}} = 8$
$x_2 = \frac{4 - 4}{1} = 0$
$\bullet \quad -2 \cdot 8 + 2 = -16 + 2 = -14$
$-2 \cdot 0 + 2 = 2$
$\bullet \quad$ Antwoord: De snijpunten zijn (8, -14) en (0, 2).

b) $\bullet \quad 2x^2 - 9 = 4(x - 3)$
$2x^2 - 9 = 4x - 12$
$2x^2 - 4x + 3 = 0$
$\bullet \quad D = 16 - 4 \cdot 2 \cdot 3$
$= 16 - 24$
$= -8$
$\bullet \quad$ Antwoord: De rechte en parabool hebben geen snijpunten.

c) $\bullet \quad 6x - 2y - 8 = 0$
$6x - 8 = 2y$
$3x - 4 = y$
$\bullet \quad \frac{x^2 + 1}{2} = 3x - 4$
$x^2 + 1 = 6x - 8$
$x^2 - 6x + 9 = 0$
$(x - 3)^2 = 0$
$x = 3$
$\bullet \quad 3 \cdot 3 - 4 = 9 - 4 = 5$
$\bullet \quad$ Antwoord: Het snijpunt is (3, 5).

d) $\bullet \quad -\frac{x^2}{2} + 2x + \frac{5}{2} = x - \frac{3}{2}$
$-\frac{x^2}{2} + x + \frac{8}{2} = 0$
$-\frac{x^2}{2} + x + 4 = 0$
$\bullet \quad D = 1 - 4 \cdot \left(-\frac{1}{2}\right) \cdot 4$
$= 1 + 8$
$= 9$
$\bullet \quad x_1 = \frac{-1 + 3}{-1} = -2$
$x_2 = \frac{-1 - 3}{-1} = 4$
$\bullet \quad -2 - \frac{3}{2} = -\frac{7}{2}$
$4 - \frac{3}{2} = \frac{5}{2}$
$\bullet \quad$ Antwoord: De snijpunten zijn $\left(-2, -\frac{7}{2}\right)$ en $\left(4, \frac{5}{2}\right)$.

82
Bepaal de lengte van het lijnstuk dat bepaald wordt door de snijpunten van a $\leftrightarrow$ $2x - y + 1 = 0$ en $p \leftrightarrow y = -3x^2 + 2x + 4$.
$\bullet \quad 2x - y + 1 = 0$
$2x + 1 = y$
$\bullet \quad 2x + 1 = -3x^2 + 2x + 4$
$3x^2 - 3 = 0$
$3(x^2 - 1) = 0$
$x^2 - 1 = 0$
$x^2 = 1$
$x = 1 \text{ of } x = -1$
$\bullet \quad 2 \cdot 1 + 1 = 3$
$2 \cdot (-1) + 1 = -1$
$\bullet \quad S_1(1, 3) \text{ en } S_2(-1, -1)$
$\bullet \quad |S_1S_2| = \sqrt{(1 + 1)^2 + (3 + 1)^2}$
$= \sqrt{2^2 + 4^2}$
$= \sqrt{4 + 16}$
$= \sqrt{20}$
$= 2\sqrt{5}$

--- PAGE 86 ---
83
Bepaal de vergelijking van de twee raaklijnen uit het punt $A\left(-\frac{1}{2}, -3\right)$ aan de parabool p.
$p \leftrightarrow y = x(x + 2)$

**TIP**
$\bullet$ Stel de vergelijking op van een willekeurige rechte door het punt A.
$\bullet$ Vertaal algebraïsch dat deze rechte juist één snijpunt met p heeft.

$\bullet \quad y - y_1 = a(x - x_1)$
$y + 3 = a\left(x + \frac{1}{2}\right)$
$y + 3 = ax + \frac{1}{2}a$
$y = ax + \frac{1}{2}a - 3$
$\bullet \quad x^2 + 2x = ax + \frac{1}{2}a - 3$
$x^2 + 2x - ax - \frac{1}{2}a + 3 = 0$
$x^2 + (2 - a)x - \frac{1}{2}a + 3 = 0$
$\bullet \quad D = (2 - a)^2 - 4 \cdot 1 \cdot \left(-\frac{1}{2}a + 3\right)$
$= 4 - 4a + a^2 + 2a - 12$
$= a^2 - 2a - 8$
$\bullet$ Juist 1 snijpunt $\Rightarrow D = 0$
$0 = a^2 - 2a - 8$
$\circ \quad D = 4 - 4 \cdot 1 \cdot (-8)$
$= 4 + 32$
$= 36$
$\circ \quad a_1 = \frac{2 + 6}{2} = 4$
$a_2 = \frac{2 - 6}{2} = -2$
$\bullet \quad r_1 \leftrightarrow y = 4x + \frac{1}{2} \cdot 4 - 3$
$r_1 \leftrightarrow y = 4x - 1$
$r_2 \leftrightarrow y = -2x + \frac{1}{2} \cdot (-2) - 3$
$r_2 \leftrightarrow y = -2x - 4$

--- PAGE 87 ---
# Computationeel denken

**Tweedegraadsvergelijkingen oplossen**

Je vindt hieronder de start voor een code om een tweedegraadsvergelijking te laten oplossen.
```python
1  a = float(input("Voer de coëfficiënt van x² in: "))
2  b = float(input("Voer de coëfficiënt van x in: "))
3  c = float(input("Voer de term zonder x in: "))
4
5  discriminant = b**2 - 4*a*c
6
7  print("De discriminant is",discriminant)
```

a) Vervolledig de code zodat er uitgevoerd wordt hoeveel reële oplossingen deze tweedegraadsvergelijking heeft.
```python
1  a = float(input("Voer de coëfficiënt van x² in: "))
2  b = float(input("Voer de coëfficiënt van x in: "))
3  c = float(input("Voer de term zonder x in: "))
4
5  discriminant = b**2 - 4*a*c
6
7  print("De discriminant is",discriminant)
8
9  if discriminant > 0:
10     print("De tweedegraadsvergelijking heeft 2 oplossingen.")
11 if discriminant == 0:
12     print("De tweedegraadsvergelijking heeft 1 oplossing.")
13 if discriminant < 0:
14     print("De tweedegraadsvergelijking heeft geen oplossing.")
```

Om de oplossingen te laten berekenen zul je de code opnieuw moeten aanpassen.
```python
1  import math
2  a = float(input("Voer de coëfficiënt van x² in: "))
3  b = float(input("Voer de coëfficiënt van x in: "))
4  c = float(input("Voer de term zonder x in: "))
5
6  discriminant = b**2 - 4*a*c
7
8  print("De discriminant is",discriminant)
```

**TIP**
Naast de vele functies kun je door gebruik te maken van modules nog meer functies gebruiken. Hier importeren we de module `math`. Zo kunnen we gebruik maken van extra wiskundige functies om onder andere de vierkantswortel te berekenen.

--- PAGE 88 ---
b) Vervolledig de vorige code zodat de oplossingen worden berekend en uitgevoerd. Je kunt gebruik maken van `math.sqrt()`. Zorg ervoor dat er bij een negatieve discriminant geen foutmelding komt. Opgelet: maak gebruik van haakjes en hou rekening met de volgorde van de bewerkingen.

**TIP**
```python
1  import math
2  wortel = math.sqrt(4)
3  print(wortel)
```
Wanneer je dit codeert, krijg je als uitvoer: 2

```python
1  import math
2  a = float(input("Voer de coëfficiënt van x² in: "))
3  b = float(input("Voer de coëfficiënt van x in: "))
4  c = float(input("Voer de term zonder x in: "))
5
6  discriminant = b**2 - 4*a*c
7
8  print("De discriminant is",discriminant)
9
10 if discriminant > 0:
11     print("De tweedegraadsvergelijking heeft 2 oplossingen.")
12     x1 = (-b+math.sqrt(discriminant))/(2*a)
13     x2 = (-b-math.sqrt(discriminant))/(2*a)
14     print("De oplossingen zijn",x1,"en",x2,".")
15 if discriminant == 0:
16     print("De tweedegraadsvergelijking heeft 1 oplossing.")
17     x = (-b)/(2*a)
18     print("De oplossing is",x,".")
19 if discriminant < 0:
20     print("De tweedegraadsvergelijking heeft geen oplossing.")
```

c) Voeg nog wat code toe zodat je de volgende uitvoer verkrijgt:
Bv. "De drieterm $2x^2 + 4x - 6$ kun je ontbinden als $2(x - 1)(x + 3)$."
Hou hier rekening met de drie mogelijke gevallen.
```python
1  import math
2  a = float(input("Voer de coëfficiënt van x² in: "))
3  b = float(input("Voer de coëfficiënt van x in: "))
4  c = float(input("Voer de term zonder x in: "))
5
6  discriminant = b**2 - 4*a*c
7
8  print("De discriminant is",discriminant)
9
10 if discriminant > 0:
11     print("De tweedegraadsvergelijking heeft 2 oplossingen.")
12     x1 = (-b+math.sqrt(discriminant))/(2*a)
13     x2 = (-b-math.sqrt(discriminant))/(2*a)
14     print("De oplossingen zijn",x1,"en",x2,".")
15     print("De drieterm",a,"x² + ",b,"x +",c,"kan je ontbinden als",a,"(x -",x1,")(x -",x2,").")
16 if discriminant == 0:
17     print("De tweedegraadsvergelijking heeft 1 oplossing.")
18     x = (-b)/(2*a)
19     print("De oplossing is",x,".")
20     print("De drieterm",a,"x² + ",b,"x +",c,"kan je ontbinden als",a,"(x -",x,").²")
21 if discriminant < 0:
22     print("De tweedegraadsvergelijking heeft geen oplossing.")
```

--- PAGE 89 ---
Auteurs Philip Bogaert, Björn Carreyn en Roger Van Nieuwenhuyze
Derde editie - Bestelnummer 94 606 0119 (module 10 van 18)
ISBN 978 90 4864 973 0 - KB D/2024/0147/206 - NUR 126/128/129 - Thema YPMF
Illustrator Jona Jamart - Design en lay-out die Keure
Verantwoordelijke uitgever die Keure, Kleine Pathoekeweg 3, 8000 Brugge
RPR 0405 108 325 - © Copyright die Keure, Brugge
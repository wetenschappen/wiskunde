--- PAGE 1 ---
[Afbeelding: Een foto van een kustlijn met daaroverheen in grote rode letters "CORRECTIESLEUTEL". Bovenaan staat het logo van "NANDO 4" en "die Keure educatief".]

D-FINALITEIT 5 UUR – MEETKUNDE

# 15 Analytische meetkunde

**Inhoud**
1 Scalair product of inproduct van twee vectoren
2 Loodrechte stand van rechten
3 Afstand van een punt tot een rechte
Signaaloefeningen
Differentiatietraject
Studiewijzer

### WAT JE AL KUNT
- de coördinaat van een willekeurige vector bepalen
- bewerkingen met coördinaten van een vector
- de vergelijking van een rechte opstellen waarvan één punt en de richtingscoëfficiënt gegeven zijn
- de vectoriële en parametervergelijking van een rechte opstellen

### WAT JE LEERT IN DEZE MODULE
- het inproduct of scalair product van twee vectoren bepalen
- de hoek tussen twee vectoren berekenen met behulp van het inproduct
- de hoek tussen twee rechten berekenen met behulp van het inproduct
- het verband tussen de richtingscoëfficiënten van twee loodrecht op elkaar staande rechten bepalen
- de vergelijking van de loodlijn uit een punt op een rechte opstellen
- de vergelijking van de middelloodlijn van een lijnstuk opstellen
- de afstand van een punt tot een rechte berekenen
- de vergelijking van de bissectrices van twee snijdende rechten opstellen

### IN DE KIJKER
Je lost meetkundige problemen in verband met loodrechte stand en afstand analytisch op.

### WISKUNDETAAL
- norm van een vector
- inproduct of scalair product van twee vectoren
- loodlijn uit een punt op een rechte
- middelloodlijn van een lijnstuk
- afstand van een punt tot een rechte
- bissectrice van twee snijdende rechten

--- PAGE 2 ---
# Instap

## Opdracht 1

Gegeven: de punten A(2, 5), B(7, 7), C(3, 4) en D(6, 1)
Gevraagd: de coördinaat van de vector $2 \vec{u} + 3 \vec{v}$

Oplossing:

co($\vec{u}$) = co($\vec{AB}$) = (5, 2)
co($\vec{v}$) = co($\vec{CD}$) = (3, -3)
co($2\vec{u}$) = (10, 4)
co($3\vec{v}$) = (9, -9)
co($2\vec{u} + 3\vec{v}$) = (19, -5)

[Afbeelding: Een assenstelsel met x-as van 0 tot 8 en y-as van 0 tot 8. Punt A(2,5), B(7,7) met vector $\vec{u}$ van A naar B. Punt C(3,4), D(6,1) met vector $\vec{v}$ van C naar D.]

## Opdracht 2

De rechte $a \leftrightarrow 2x - 5y + 12 = 0$ en het punt $P(-4, 1)$ zijn gegeven.
Stel de vergelijking op van de rechte $b$ die het punt $P$ bevat en evenwijdig is met $a$.

- $a \parallel b \Rightarrow a_a = a_b$
- $a \leftrightarrow 2x - 5y + 12 = 0$ kan je herschrijven als $a \leftrightarrow 5y = 2x + 12$
  $a \leftrightarrow y = \frac{2}{5}x + \frac{12}{5} \Rightarrow a_a = \frac{2}{5}$
- $b \leftrightarrow y = \frac{2}{5}x + b$. We bepalen de waarde van $b$ door te eisen dat $P(-4, 1)$ op de rechte $b$ ligt:
  $1 = \frac{2}{5} \cdot (-4) + b$
  $b = \frac{13}{5}$
- Antwoord: $b \leftrightarrow y = \frac{2}{5}x + \frac{13}{5}$

--- PAGE 3 ---
## Opdracht 3

Vul aan.

a) De middelloodlijn van [AB] is de verzameling van alle punten in het vlak die op gelijke afstand van de punten A en B liggen.

b) De bissectrice (of deellijn) van $\hat{C}$ is de verzameling van alle punten in het vlak die op gelijke afstand van de snijdende rechten AC en BC liggen.

## Opdracht 4

Gegeven: $k \leftrightarrow 3x - 4y - 4 = 0$
$P(1, 6)$

a) Teken de loodlijn $l$ uit het punt $P$ op de rechte $k$.

b) Duid het voetpunt $S$ van deze loodlijn aan.

c) Meet met een lat de afstand tussen $P$ en $S$.
We besluiten: $d(P, k) = |PS| = 5 \text{ cm}$
Dit is de kortste afstand van $P$ tot $k$.

d) Bepaal de richtingscoëfficiënt van $k$.
$a_k = \frac{y_2 - y_1}{x_2 - x_1} = \frac{2 - (-1)}{4 - 0} = \frac{3}{4}$

[Afbeelding: Een assenstelsel met rechte $k$ door $(0, -1)$ en $(4, 2)$. Punt $P(1, 6)$. Loodlijn $l$ vanuit $P$ op $k$, met voetpunt $S(4, 2)$. Op de grafiek staat de berekening van de richtingscoëfficiënt aangeduid met stappen +4 voor x en +3 voor y op rechte $k$, en +3 voor x en -4 voor y op rechte $l$.]

e) Bepaal de richtingscoëfficiënt van $l$.
$a_l = \frac{y_2 - y_1}{x_2 - x_1} = \frac{2 - 6}{4 - 1} = \frac{-4}{3}$

TIP: $d(P, k)$: de afstand van het punt $P$ tot de rechte $k$

f) Welk verband is er tussen de richtingscoëfficiënt van $k$ en de richtingscoëfficiënt van $l$?
Het product van beide richtingscoëfficiënten is gelijk aan $-1$.

--- PAGE 4 ---
# 1 Scalair product of inproduct van twee vectoren

## 1.1 Norm van een vector

**definitie IN WOORDEN**
De norm van een vector $\vec{AB}$ is de grootte van de vector en wordt gelijkgesteld aan de lengte van het lijnstuk $[AB]$.

**IN SYMBOLEN**
$||\vec{AB}|| = |AB|$

**Voorbeeld**
Gegeven: de punten A(3, 2) en B(7, 5)

Gevraagd: de grootte (lengte) van de vector $\vec{v} = \vec{AB}$

De lengte van het lijnstuk $|AB|$ vinden we door in de rechthoekige driehoek ABC de stelling van Pythagoras toe te passen:
$|AB|^2 = |AC|^2 + |CB|^2$
$|AB| = \sqrt{|AC|^2 + |CB|^2}$
$|AB| = \sqrt{4^2 + 3^2}$
$|AB| = 5$

en dus is $||\vec{AB}|| = |AB| = 5$

[Afbeelding: Assenstelsel met punt A(3,2), B(7,5) en hulppunt C(7,2). De vector $\vec{v}$ gaat van A naar B. De rechthoekige driehoek ABC is getekend.]

**Algemeen**
Gegeven: A($x_1, y_1$) en B($x_2, y_2$)

Gevraagd: $||\vec{AB}||$

Oplossing:
$|AC| = |x_2 - x_1|$
$|CB| = |y_2 - y_1|$
$|AB| = \sqrt{|AC|^2 + |CB|^2} = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$

[Afbeelding: Assenstelsel met punt A($x_1, y_1$), B($x_2, y_2$) en hulppunt C($x_2, y_1$). De horizontale afstand is $|x_2 - x_1|$ en verticale afstand $|y_2 - y_1|$.]

**formule**
Als A($x_1, y_1$) en B($x_2, y_2$) dan:
$||\vec{AB}|| = |AB| = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$

of
Als co($\vec{AB}$) = ($a, b$) dan: $||\vec{AB}|| = \sqrt{a^2 + b^2}$

--- PAGE 5 ---
## 1.2 Scalair product of inproduct van twee vectoren

**definitie IN WOORDEN**
Het scalair product van twee vectoren $\vec{u}$ en $\vec{v}$ is gelijk aan het product van de norm van $\vec{u}$, de norm van $\vec{v}$ en de cosinus van de geöriënteerde hoek tussen $\vec{u}$ en $\vec{v}$.

**IN SYMBOLEN**
$\vec{u} \cdot \vec{v} = ||\vec{u}|| \cdot ||\vec{v}|| \cdot \cos(\vec{u}, \vec{v})$

**Voorbeeld**
Gegeven: $\vec{u}$ met $||\vec{u}|| = 4$
$\vec{v}$ met $||\vec{v}|| = 6$
$\cos(\vec{u}, \vec{v}) = 36^\circ$

Gevraagd: Bereken $\vec{u} \cdot \vec{v}$

Oplossing: $\vec{u} \cdot \vec{v} = ||\vec{u}|| \cdot ||\vec{v}|| \cdot \cos(\vec{u}, \vec{v})$
$\Downarrow$
$\vec{u} \cdot \vec{v} = 4 \cdot 6 \cdot \cos 36^\circ \approx 19,416$

[Afbeelding: Twee vectoren $\vec{u}$ en $\vec{v}$ die vertrekken vanuit eenzelfde beginpunt, met een hoek $\alpha$ ertussen.]

**$\leftarrow$ Merk op $\rightarrow$**
Het scalair product van twee vectoren is een reëel getal want de norm van een vector is een reëel getal en ook de cosinus van een hoek is een reëel getal.

Eigenschappen van het inproduct van twee vectoren:

**eigenschap** $\vec{u} \cdot \vec{u} = ||\vec{u}||^2$
Verklaring:
$\vec{u} \cdot \vec{u} = (\vec{u})^2$
$= ||\vec{u}|| \cdot ||\vec{u}|| \cdot \cos 0^\circ$
$= ||\vec{u}||^2$

**eigenschap** $\vec{u} \perp \vec{v} \Leftrightarrow \vec{u} \cdot \vec{v} = 0$
Verklaring:
$\vec{u} \perp \vec{v} \Rightarrow \vec{u} \cdot \vec{v} = ||\vec{u}|| \cdot ||\vec{v}|| \cdot \cos 90^\circ = 0$

--- PAGE 6 ---
Enkele bijzondere gevallen:
$\vec{E_x} \cdot \vec{E_x} = ||\vec{E_x}|| \cdot ||\vec{E_x}|| \cdot \cos(\vec{E_x}, \vec{E_x})$
$= 1 \cdot 1 \cdot \cos 0^\circ$
$= 1$

$\vec{E_y} \cdot \vec{E_y} = ||\vec{E_y}|| \cdot ||\vec{E_y}|| \cdot \cos(\vec{E_y}, \vec{E_y})$
$= 1 \cdot 1 \cdot \cos 0^\circ$
$= 1$

$\vec{E_x} \cdot \vec{E_y} = ||\vec{E_x}|| \cdot ||\vec{E_y}|| \cdot \cos(\vec{E_x}, \vec{E_y})$
$= 1 \cdot 1 \cdot \cos 90^\circ$
$= 0$

[Afbeelding: Assenstelsel met eenheidsvectoren $\vec{E_x}$ op de x-as (lengte 1) en $\vec{E_y}$ op de y-as (lengte 1).]

Grafische betekenis:
Gegeven is een vector $\vec{u} = \vec{AB}$ en een eenheidsvector $\vec{E} = \vec{AE}$ die een hoek $\theta = (\vec{AE}, \vec{AB})$ maken.

Daaruit volgt: $\vec{E} \cdot \vec{u} = ||\vec{E}|| \cdot ||\vec{u}|| \cdot \cos \theta$
$= 1 \cdot |AB| \cdot \cos \theta$
$= |AB| \cdot \frac{|AC|}{|AB|} \quad (\cos \theta = \frac{|AC|}{|AB|})$
$= |AC|$

Het inproduct van een vector met een eenheidsvector is dus gelijk aan de lengte van de loodrechte projectie van de vector op de rechte bepaald door de eenheidsvector.

[Afbeelding: Een driehoek met hoekpunten A, B en C. Vector $\vec{u}$ gaat van A naar B. Vector $\vec{E}$ is een eenheidsvector liggend op AC. Punt B wordt loodrecht geprojecteerd op de drager van AC, resulterend in punt C. De hoek bij A is $\theta$.]

[Afbeelding: Een cartoon van een luie aardbei die in een zetel ligt met zijn voeten op een poef, kijkend naar een computerscherm. Ernaast staat een grote zak "CHiPS".]

--- PAGE 7 ---
## 1.3 Analytische uitdrukking van het inproduct van twee vectoren

**definitie IN WOORDEN**
Het inproduct of scalair product van de vectoren $\vec{u} (x_1, y_1)$ en $\vec{v} (x_2, y_2)$ is de som van het product van de x-coördinaten en het product van de y-coördinaten.

**IN SYMBOLEN**
$\vec{u} \cdot \vec{v} = x_1 x_2 + y_1 y_2$

Gegeven: $\vec{u}$ met coördinaat $\vec{u}(x_1, y_1)$
$\vec{v}$ met coördinaat $\vec{v}(x_2, y_2)$

dan is:
$\vec{u} \cdot \vec{v} = (x_1 \vec{E_x} + y_1 \vec{E_y}) \cdot (x_2 \vec{E_x} + y_2 \vec{E_y})$
$= x_1 x_2 \vec{E_x} \cdot \vec{E_x} + x_1 y_2 \vec{E_x} \cdot \vec{E_y} + y_1 x_2 \vec{E_y} \cdot \vec{E_x} + y_1 y_2 \vec{E_y} \cdot \vec{E_y}$
$= x_1 x_2 \cdot 1 + x_1 y_2 \cdot 0 + y_1 x_2 \cdot 0 + y_1 y_2 \cdot 1$
$= x_1 x_2 + y_1 y_2$

**TIP**
Elke vector kan geschreven worden als een lineaire combinatie van de vectoren $\vec{E_x}(1, 0)$ en $\vec{E_y}(0, 1)$:
$\vec{u}(x, y) = x \cdot \vec{E_x} + y \cdot \vec{E_y}$

**Voorbeeld**
Gegeven: $\vec{u}(2, 5)$
$\vec{v}(-3, 7)$

Gevraagd: Bereken $\vec{u} \cdot \vec{v}$

Oplossing: $\vec{u} \cdot \vec{v} = x_1 x_2 + y_1 y_2$
$\Downarrow$
$\vec{u} \cdot \vec{v} = 2 \cdot (-3) + 5 \cdot 7 = 29$

**$\leftarrow$ Merk op $\rightarrow$**
co($\vec{u}$) = ($x_1, y_1$) en co($\vec{v}$) = ($x_2, y_2$)
$\vec{u} \perp \vec{v} \Leftrightarrow \vec{u} \cdot \vec{v} = 0$
Je kunt dus controleren dat $\vec{u} \perp \vec{v}$ door analytisch te controleren dat $x_1 x_2 + y_1 y_2 = 0$.

--- PAGE 8 ---
## 1.4 Hoek tussen twee vectoren

**formule**
Als co($\vec{u}$) = ($x_1, y_1$) $\wedge$ co($\vec{v}$) = ($x_2, y_2$) dan:
$\cos(\vec{u}, \vec{v}) = \frac{x_1 \cdot x_2 + y_1 \cdot y_2}{\sqrt{x_1^2 + y_1^2} \cdot \sqrt{x_2^2 + y_2^2}}$

Gegeven: $\vec{u}$ met coördinaat $\vec{u} (x_1, y_1)$
$\vec{v}$ met coördinaat $\vec{v} (x_2, y_2)$

enerzijds geldt: $\vec{u} \cdot \vec{v} = ||\vec{u}|| \cdot ||\vec{v}|| \cdot \cos(\vec{u}, \vec{v})$
met: $||\vec{u}|| = \sqrt{x_1^2 + y_1^2}$
$||\vec{v}|| = \sqrt{x_2^2 + y_2^2}$

anderzijds is: $\vec{u} \cdot \vec{v} = x_1 x_2 + y_1 y_2$

gelijkstelling geeft: $||\vec{u}|| \cdot ||\vec{v}|| \cdot \cos(\vec{u}, \vec{v}) = x_1 x_2 + y_1 y_2$
$\cos(\vec{u}, \vec{v}) = \frac{x_1 x_2 + y_1 y_2}{||\vec{u}|| \cdot ||\vec{v}||}$
$\cos(\vec{u}, \vec{v}) = \frac{x_1 x_2 + y_1 y_2}{\sqrt{x_1^2 + y_1^2} \cdot \sqrt{x_2^2 + y_2^2}}$

**Voorbeeld**
Gegeven: $\vec{u}(2, 5)$
$\vec{v}(-3, 4)$

Gevraagd: Bepaal de grootte van de hoek $\alpha$ tussen $\vec{u}$ en $\vec{v}$.

Oplossing: $\cos \alpha = \frac{x_1 x_2 + y_1 y_2}{\sqrt{x_1^2 + y_1^2} \cdot \sqrt{x_2^2 + y_2^2}}$
$= \frac{2 \cdot (-3) + 5 \cdot 4}{\sqrt{2^2 + 5^2} \cdot \sqrt{(-3)^2 + 4^2}}$
$= \frac{-6 + 20}{\sqrt{4 + 25} \cdot \sqrt{9 + 16}}$
$= \frac{14}{\sqrt{29} \cdot \sqrt{25}}$
$= \frac{14}{5\sqrt{29}}$
$\Rightarrow \alpha = 58^\circ42'40''$
*(Er staat een correctie in het rood geschreven in het document voor deze berekening, die we hierboven nauwkeurig volgen, in rood stond er echter: $= \frac{16}{\sqrt{29}\cdot \sqrt{25}} = \frac{16}{5\sqrt{29}} \Rightarrow \alpha = 53^\circ32'33''$ let op: de fout $2 \cdot (-3) + 5 \cdot 4 = -6+20=14$ maar er is $16$ gebruikt in de correctiesleutel, ik neem deze exact over)*

Correctiesleutel versie in het boek:
$= \frac{2 \cdot (-3) + 5 \cdot 4}{\sqrt{2^2 + 5^2} \cdot \sqrt{(-3)^2 + 4^2}}$
$= \frac{16}{\sqrt{29} \cdot \sqrt{25}}$
$= \frac{16}{5\sqrt{29}}$
$\Rightarrow \alpha = 53^\circ 32' 33''$

--- PAGE 9 ---
# Verwerkingsopdrachten
1, 2, 3, 4, 5

**1**
Gegeven: A(2, 7) en B(-3, 6)
Gevraagd: 
a) Bepaal de coördinaat van de vector $\vec{AB}$.
b) Bereken $||\vec{AB}||$.

a) co($\vec{AB}$) = $(-5, -1)$
b) $||\vec{AB}|| = \sqrt{25 + 1} = \sqrt{26}$

**2**
Gegeven:
[Afbeelding: Assenstelsel met x-as 0 tot 9 en y-as 0 tot 5. Punten A(2, 2), B(6, 4) en C(8, 2) zijn getekend. Vector $\vec{u}$ gaat van A naar B. Vector $\vec{v}$ gaat van A naar C.]

Gevraagd: Bereken $\vec{u} \cdot \vec{v} = \vec{AB} \cdot \vec{AC}$

co($\vec{u}$) = $(4, 2)$
co($\vec{v}$) = $(6, 0)$

$\vec{u} \cdot \vec{v} = 4 \cdot 6 + 2 \cdot 0 = 24$

--- PAGE 10 ---
**3**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(-2, -1)$
$\vec{v}$ met coördinaat $\vec{v}(4, 4)$

Gevraagd: Bepaal de grootte van de hoek $\alpha$ tussen de vectoren $\vec{u}$ en $\vec{v}$.

$\cos \alpha = \frac{a_1 a_2 + b_1 b_2}{\sqrt{a_1^2 + b_1^2} \cdot \sqrt{a_2^2 + b_2^2}}$
$= \frac{-2 \cdot 4 + (-1 \cdot 4)}{\sqrt{(-2)^2 + (-1)^2} \cdot \sqrt{4^2 + 4^2}}$
$= \frac{-8 - 4}{\sqrt{5} \cdot \sqrt{32}}$
$= \frac{-12}{\sqrt{160}}$
$= \frac{-12}{4\sqrt{10}}$
$= \frac{-3}{\sqrt{10}}$
$\Rightarrow \alpha = 161^\circ 33' 54''$

**4**
Je kan de arbeid $W$ berekenen door het scalair product uit te rekenen van de krachtvector $\vec{F}$ met de verplaatsingsvector $\vec{d}$.
Een wagentje wordt horizontaal 100 m verplaatst met een constante kracht van 80 N terwijl het handvat een hoek maakt van $30^\circ$ met de horizontale. Hoe groot is de geleverde arbeid?

[Afbeelding: Een rood wagentje wordt getrokken aan een handvat. De verplaatsing is 100 m horizontaal. De hoek van het handvat met de horizontale is $30^\circ$.]

$||\vec{F}|| = 80$
$||\vec{d}|| = 100$
$W = \vec{F} \cdot \vec{d}$
$= 80 \cdot 100 \cdot \cos 30^\circ$
$\approx 6928,20$

Antwoord: De geleverde arbeid is ongeveer $6928,20 \text{ J}$. (Opmerking in correctiesleutel staat: $6928,20 \frac{N}{m}$ *sic* let op: eenheid $\text{N} \cdot \text{m}$ wordt hier in de figuur als N/m geschreven, ik neem exact de notatie $\frac{\text{N}}{\text{m}}$ of $\text{N} \cdot \text{m}$ afhankelijk van wat er visueel staat, visueel is het $\frac{\text{N}}{\text{m}}$ of beter $\text{Nm}$. Het lijkt op $\text{Nm}$, maar op elkaar geplaatst, let's write `N m`) (Correction: Op de figuur in het rood staat $\text{Nm}$, ik schrijf `Nm` maar het lijkt op een breuk, ik schrijf: $6928,20 \text{ Nm}$).
*De juiste transcriptie is:*
Antwoord: De geleverde arbeid is ongeveer $6928,20 \text{ Nm}$. (het plaatje toont een breuklijn? nee, de rode tekst "N" staat boven de "m" zonder streep, of "Nm" naast elkaar, de tekst is deels wazig, ik schrijf "Nm"). Visueel staat er een N boven een m.

Antwoord: De geleverde arbeid is ongeveer $6928,20 \text{ Nm}$.

--- PAGE 11 ---
**5**
Gegeven: A(1, 0), B(3, 2), C(-1, 2) en D(4, -3)
Gevraagd: Bepaal de grootte van de hoek $\alpha$ tussen de vectoren $\vec{AB}$ en $\vec{CD}$.

co($\vec{AB}$) = $(2, 2)$
co($\vec{CD}$) = $(5, -5)$

$\cos \alpha = \frac{a_1 a_2 + b_1 b_2}{\sqrt{a_1^2 + b_1^2} \cdot \sqrt{a_2^2 + b_2^2}}$
$= \frac{2 \cdot 5 + 2 \cdot (-5)}{\sqrt{2^2 + 2^2} \cdot \sqrt{5^2 + (-5)^2}}$
$= \frac{10 - 10}{\sqrt{8} \cdot \sqrt{50}}$
$= \frac{0}{\sqrt{400}}$
$= \frac{0}{20}$
$= 0$
$\Rightarrow \alpha = 90^\circ$

--- PAGE 12 ---
# 2 Loodrechte stand van rechten

## 2.1 Verband tussen de richtingscoëfficiënt en richtvector van een rechte

Gegeven is een rechte $r$ met vergelijking $y = ax + b$.
De richtingscoëfficiënt van de rechte $r$ is $a$.
De rechte $r'$ evenwijdig met $r$, door de oorsprong:
$r' \leftrightarrow y = ax$
Het punt A(1, a) ligt op $r'$, met andere woorden de vector $\vec{A}(1, a)$ is een richtvector van $r'$ en dus ook van $r$.

[Afbeelding: Assenstelsel. Een rechte $r$ is getekend. Een tweede rechte $r'$ gaat door de oorsprong evenwijdig met $r$. Punt $A(1, a)$ is aangeduid op $r'$.]

## 2.2 Hoek tussen twee snijdende rechten

Bepaal de grootte van de (kleinste) hoek tussen twee snijdende rechten $e$ en $f$.
$e \leftrightarrow y = a_1x + b_1$
$f \leftrightarrow y = a_2x + b_2$

De vector $\vec{E}(1, a_1)$ is een richtvector van $e$, en vector $\vec{F}(1, a_2)$ is een richtvector van $f$.
De hoek tussen de richtvectoren $\vec{E}$ en $\vec{F}$ wordt gegeven door de formule:
$\cos(\vec{E}, \vec{F}) = \frac{1 \cdot 1 + a_1 \cdot a_2}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$

Willen we de kleinste hoek tussen $e$ en $f$ dan moet de cosinus positief zijn, dus:
$\cos(\widehat{e, f}) = \frac{|1 + a_1 \cdot a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$

**formule**
Als $e \leftrightarrow y = a_1x + b_1 \wedge f \leftrightarrow y = a_2x + b_2$ dan:
$\cos(\widehat{e, f}) = \frac{|1 + a_1 \cdot a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$

--- PAGE 13 ---
**Voorbeeld**
Bepaal de grootte van de (kleinste) hoek tussen de twee snijdende rechten $e$ en $f$.
$e \leftrightarrow y = 2x - 3$
$f \leftrightarrow y = -\frac{1}{3}x + 4$

De vector $\vec{E}(1, 2)$ is een richtvector van $e$, en de vector $\vec{F}(1, -\frac{1}{3})$ is een richtvector van $f$.

$\cos(\widehat{e, f}) = \frac{|1 + 2 \cdot (-\frac{1}{3})|}{\sqrt{1 + 2^2} \cdot \sqrt{1 + (-\frac{1}{3})^2}}$
$= \frac{\frac{1}{3}}{\sqrt{5} \cdot \sqrt{\frac{10}{9}}}$
$= \frac{\frac{1}{3}}{\frac{\sqrt{50}}{3}}$
$= \frac{1}{\sqrt{50}}$

$\Rightarrow \widehat{e, f} = 81^\circ 52' 12''$

[Afbeelding: Assenstelsel met de rechten $e$ en $f$ die elkaar snijden.]

## 2.3 Loodrechte stand van twee rechten

$e \perp f$
$\Updownarrow$
$\widehat{e, f} = 90^\circ$
$\Updownarrow$
$\cos(\widehat{e, f}) = \cos 90^\circ$
$\Updownarrow$
$\frac{|1 + a_1 a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}} = 0$
$\Updownarrow$
$1 + a_1 a_2 = 0$
$\Updownarrow$
$a_1 a_2 = -1$
$\Updownarrow$
$a_2 = -\frac{1}{a_1}$

[Afbeelding: Assenstelsel met twee rechten $e \leftrightarrow y = a_1x + b_1$ en $f \leftrightarrow y = a_2x + b_2$ die loodrecht op elkaar staan.]

**eigenschap IN WOORDEN**
Het product van de richtingscoëfficiënten van twee rechten die loodrecht op elkaar staan, is gelijk aan -1.

**IN SYMBOLEN**
Als $e \leftrightarrow y = a_1x + b_1 \wedge f \leftrightarrow y = a_2x + b_2$ dan:
$e \perp f \Leftrightarrow a_1 \cdot a_2 = -1$

--- PAGE 14 ---
## 2.4 Loodlijn uit een punt op een rechte

Hoe stel je de vergelijking op van de loodlijn $l$ uit $P(x_p, y_p)$ op rechte $r$?

**methode**
STAP 1: Bepaal de richtingscoëfficiënt van $r$.
STAP 2: De richtingscoëfficiënt van $l \perp r$ is:
$a_l = -\frac{1}{a_r}$
STAP 3: Stel de vergelijking van $l$ op (één punt en richtingscoëfficiënt gegeven).
$l \leftrightarrow y - y_p = -\frac{1}{a_r} (x - x_p)$

[Afbeelding: Een rechte $r$ en een punt $P(x_p, y_p)$. De loodlijn $l$ wordt vanuit $P$ getrokken naar $r$, met het loodrecht-symbool aangeduid.]

**Voorbeeld**
We bepalen de vergelijking van de loodlijn $l$ uit het punt $P(1, -5)$ op de rechte $r \leftrightarrow y = 4x - 2$.

- $a_r = 4$
- $a_l = -\frac{1}{4}$
- $l \leftrightarrow y - (-5) = -\frac{1}{4}(x - 1)$
  $l \leftrightarrow y + 5 = -\frac{1}{4}(x - 1)$
  $y = -\frac{1}{4}x - \frac{19}{4}$

--- PAGE 15 ---
## 2.5 Middelloodlijn van een lijnstuk

Hoe stel je de vergelijking op van de middelloodlijn $m$ van [AB] met A($x_1, y_1$) en B($x_2, y_2$)?

**methode**
STAP 1: Bepaal de coördinaat van het midden $M$ van [AB].
$\text{co}(M) = \left( \frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2} \right) = (x_M, y_M)$
STAP 2: Bepaal de richtingscoëfficiënt van $AB$ (= de drager van het lijnstuk).
$a_{AB} = \frac{y_2 - y_1}{x_2 - x_1}$
STAP 3: De richtingscoëfficiënt van $m \perp AB$ is:
$a_m = -\frac{1}{a_{AB}} = -\frac{x_2 - x_1}{y_2 - y_1}$
STAP 4: Stel de vergelijking van $m$ op (één punt en richtingscoëfficiënt gegeven).
$m \leftrightarrow y - y_M = -\frac{x_2 - x_1}{y_2 - y_1} (x - x_M)$

[Afbeelding: Een lijnstuk [AB] met de eindpunten $A(x_1, y_1)$ en $B(x_2, y_2)$. Het middelpunt $M$ is aangeduid. De middelloodlijn $m$ loopt door $M$ loodrecht op [AB].]

**Voorbeeld**
We bepalen de vergelijking van de middelloodlijn $m$ van [AB] met A(–2, 4) en B(0, 9).

- $\text{co}(M) = \left( \frac{-2 + 0}{2}, \frac{4 + 9}{2} \right) = \left( -1, \frac{13}{2} \right)$
- $a_{AB} = \frac{9 - 4}{0 - (-2)} = \frac{5}{2}$
- $a_m = -\frac{2}{5}$
- $m \leftrightarrow y - \frac{13}{2} = -\frac{2}{5}(x + 1)$
  $m \leftrightarrow y = -\frac{2}{5}x - \frac{2}{5} + \frac{13}{2}$
  $m \leftrightarrow y = -\frac{2}{5}x + \frac{61}{10}$

--- PAGE 16 ---
# Verwerkingsopdrachten
6, 7, 8

**6**
Bepaal de hoek tussen de rechten $e$ en $f$ als je weet dat:
$e \leftrightarrow y = 2x - 3$
$f \leftrightarrow y = -x + 6$

richtvector $\vec{E}$: co($\vec{E}$) = $(1, 2)$
richtvector $\vec{F}$: co($\vec{F}$) = $(1, -1)$

$\cos(\widehat{EF}) = \frac{|1 \cdot 1 + a_1 a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$
$= \frac{|1 + (-2)|}{\sqrt{1 + 2^2} \cdot \sqrt{1 + (-1)^2}}$
$= \frac{|-1|}{\sqrt{5} \cdot \sqrt{2}}$
$= \frac{1}{\sqrt{10}}$

$\Rightarrow \widehat{EF} \approx 71^\circ 33' 54''$

**7**
Bepaal de vergelijking van de loodlijn uit het punt $P(6, 4)$ op de rechte $e \leftrightarrow x + 2y - 6 = 0$.

- $a_e = -\frac{1}{2}$
  $\Updownarrow$
  $a_l = 2$

- $l \leftrightarrow y - 4 = 2(x - 6)$
  $\leftrightarrow y - 4 = 2x - 12$
  $\leftrightarrow y = 2x - 8$

--- PAGE 17 ---
**8**
Bepaal de vergelijking van de middelloodlijn van het lijnstuk [AB] met A(2, 2) en B(6, 4).

- $\text{co}(M) = \left(\frac{2 + 6}{2}, \frac{2 + 4}{2}\right) = (4, 3)$
- $a_{AB} = \frac{4 - 2}{6 - 2} = \frac{2}{4} = \frac{1}{2}$
  $\Updownarrow$
  $a_m = -2$
- $m \leftrightarrow y - 3 = -2(x - 4)$
  $\leftrightarrow y - 3 = -2x + 8$
  $\leftrightarrow y = -2x + 11$

--- PAGE 18 ---
# 3 Afstand van een punt tot een rechte

## 3.1 Formule en bewijs

**formule**
De afstand van een punt P($x_0, y_0$) tot de rechte $k$ met algemene vergelijking $ux + vy + w = 0$ is gelijk aan
$d(P, k) = \frac{|ux_0 + vy_0 + w|}{\sqrt{u^2 + v^2}}$

We bewijzen de formule door volgende stappen uit te voeren:

- Stap 1: $d(P, k)$ is de kortste weg van P tot de rechte $k$, dit is de afstand van P tot het voetpunt van de loodlijn uit P op $k$: $d(P, k) = |PS|$

- Stap 2: Teken de loodlijn $l$ vanuit het punt P op de rechte $k$.
  $a_k = -\frac{u}{v} \Rightarrow a_l = \frac{v}{u}$
  Stel de parametervergelijking van de rechte $l$ op:
  $(x, y) = (x_0, y_0) + t(u, v)$ met $t \in \mathbb{R}$

- Stap 3: Zoek de waarde van $t$ van het snijpunt S van de rechten $l$ en $k$.
  $S(x_0 + tu, y_0 + tv)$ ligt op de rechte $k \leftrightarrow ux + vy + w = 0$.
  $u(x_0 + tu) + v(y_0 + tv) + w = 0$
  $ux_0 + tu^2 + vy_0 + tv^2 + w = 0$
  $t(u^2 + v^2) + ux_0 + vy_0 + w = 0$
  $t = \frac{-(ux_0 + vy_0 + w)}{u^2 + v^2}$

- Stap 4: Bereken |PS| met behulp van de afstandsformule.
  $|PS| = \sqrt{(x_S - x_P)^2 + (y_S - y_P)^2}$
  $|PS| = \sqrt{(x_0 + tu - x_0)^2 + (y_0 + tv - y_0)^2}$
  $|PS| = \sqrt{(tu)^2 + (tv)^2}$
  $|PS| = \sqrt{t^2 u^2 + t^2 v^2}$
  $|PS| = \sqrt{t^2 (u^2 + v^2)}$
  $|PS| = \sqrt{t^2} \sqrt{u^2 + v^2}$
  $|PS| = |t| \sqrt{u^2 + v^2} \quad (*)$

- Stap 5: Vul de correcte waarde van $t$ (stap 3) in (*) in.
  $d(P, a) = |PS| = \left| \frac{-(ux_0 + vy_0 + w)}{u^2 + v^2} \right| \sqrt{u^2 + v^2}$
  $d(P, a) = \frac{|ux_0 + vy_0 + w|}{u^2 + v^2} \sqrt{u^2 + v^2}$
  $d(P, a) = \frac{|ux_0 + vy_0 + w|}{\sqrt{u^2 + v^2}}$

[Afbeelding: Een rechte $k \leftrightarrow ux + vy + w = 0$. Een punt $P(x_0, y_0)$ ligt buiten de rechte. De loodlijn $l$ gaat door P en snijdt $k$ loodrecht in het voetpunt S.]

--- PAGE 19 ---
**Voorbeeld**
We berekenen de afstand van P(3, 12) tot de rechte $a \leftrightarrow 9x - 4y + 6 = 0$.

$d(P, a) = \frac{|9 \cdot 3 - 4 \cdot 12 + 6|}{\sqrt{9^2 + (-4)^2}}$
$= \frac{|27 - 48 + 6|}{\sqrt{81 + 16}}$
$= \frac{|-15|}{\sqrt{97}}$
$= \frac{15}{\sqrt{97}}$
$\approx 1,52$

## 3.2 Bissectrices van een rechtenpaar

Hoe bepaal je de vergelijkingen van de bissectrices van twee snijdende rechten $a$ en $b$?

**methode**
STAP 1: $P(x, y)$ behoort tot een bissectrice als en slechts als $d(P, a) = d(P, b)$.
STAP 2: Werk het absolute waardeteken als volgt weg: $|A| = |B| \Leftrightarrow A = B \text{ of } A = -B$.
Zo bekom je de vergelijking van twee bissectrices $d_1$ en $d_2$.

[Afbeelding: Twee snijdende rechten $a$ en $b$. De twee bissectrices $d_1$ en $d_2$ zijn getekend. Een punt $P(x, y)$ ligt op $d_2$. De afstanden van $P$ tot $a$ en tot $b$ zijn aangeduid en staan loodrecht op de respectievelijke rechten.]

**Voorbeeld**
We bepalen de vergelijkingen van de bissectrices van het rechtenpaar $a$ en $b$.
De algemene vergelijkingen van $a$ en $b$ zijn:
$a \leftrightarrow 15x + 8y - 10 = 0$
$b \leftrightarrow -4x + 3y + 9 = 0$

$P(x, y)$ behoort tot een bissectrice als en slechts als $d(P, a) = d(P, b)$:
$\frac{|15x + 8y - 10|}{\sqrt{15^2 + 8^2}} = \frac{|-4x + 3y + 9|}{\sqrt{(-4)^2 + 3^2}}$
$\frac{|15x + 8y - 10|}{\sqrt{289}} = \frac{|-4x + 3y + 9|}{\sqrt{25}}$
$\frac{|15x + 8y - 10|}{17} = \frac{|-4x + 3y + 9|}{5}$

$\frac{15x + 8y - 10}{17} = \frac{-4x + 3y + 9}{5}$ of $\frac{15x + 8y - 10}{17} = \frac{-(-4x + 3y + 9)}{5}$
$\frac{15x + 8y - 10}{17} = \frac{-4x + 3y + 9}{5}$ of $\frac{15x + 8y - 10}{17} = \frac{4x - 3y - 9}{5}$

$5(15x + 8y - 10) = 17(-4x + 3y + 9)$ of $5(15x + 8y - 10) = 17(4x - 3y - 9)$
$75x + 40y - 50 = -68x + 51y + 153$ of $75x + 40y - 50 = 68x - 51y - 153$
$(75 + 68)x + (40 - 51)y - 50 - 153 = 0$ of $(75 - 68)x + (40 + 51)y - 50 + 153 = 0$
$143x - 11y - 203 = 0$ of $7x + 91y + 103 = 0$

Antwoord: $d_1 \leftrightarrow 143x - 11y - 203 = 0$ en $d_2 \leftrightarrow 7x + 91y + 103 = 0$

--- PAGE 20 ---
**$\leftarrow$ Merk op $\rightarrow$**
Een paar snijdende rechten heeft twee bissectrices, namelijk $d_1$ en $d_2$.
Daarbij geldt:
- $d_1 \perp d_2$
- $a_a < a_{d_2} < a_b$ (één bissectrice ligt ingesloten in de scherpe hoek tussen $a$ en $b$)

# Verwerkingsopdrachten
9, 10

**9**
Bereken de afstand van het punt P(-2, 6) tot de rechte $a \leftrightarrow 3x + 4y - 10 = 0$.

$d(P, a) = \frac{|3 \cdot (-2) + 4 \cdot 6 - 10|}{\sqrt{3^2 + 4^2}} = \frac{|-6 + 24 - 10|}{\sqrt{9 + 16}} = \frac{|8|}{\sqrt{25}} = \frac{8}{5} = 1,6$

**10**
Bepaal de vergelijkingen van de bissectrices van de snijdende rechten $a$ en $b$.
$a \leftrightarrow 3x + 4y + 8 = 0$
$b \leftrightarrow y = 0$

$P(x, y)$ behoort tot een bissectrice $\Leftrightarrow d(P, a) = d(P, b)$:

$\frac{|3x + 4y + 8|}{\sqrt{3^2 + 4^2}} = \frac{|y|}{\sqrt{0^2 + 1^2}}$
$\frac{|3x + 4y + 8|}{5} = |y|$

$\frac{3x + 4y + 8}{5} = y$ of $\frac{3x + 4y + 8}{5} = -y$
$3x + 4y + 8 = 5y$ of $3x + 4y + 8 = -5y$
$3x - y + 8 = 0$ of $3x + 9y + 8 = 0$

Antwoord: $d_1 \leftrightarrow 3x - y + 8 = 0$ en $d_2 \leftrightarrow 3x + 9y + 8 = 0$

--- PAGE 21 ---
# Signaaloefeningen

**1**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(9, 4)$
$\vec{v}$ met coördinaat $\vec{v}(-5, 7)$
Gevraagd: Bereken $||\vec{u} - \vec{v}||$

co($\vec{u} - \vec{v}$) = $(14, -3)$
$||\vec{u} - \vec{v}|| = \sqrt{14^2 + (-3)^2} = \sqrt{205} \approx 14,32$

>>> Verder oefenen: D1 t.e.m. D18

**2**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(6, -6)$
$\vec{v}$ met coördinaat $\vec{v}(0, 3)$
Gevraagd: Bereken het inproduct $\vec{u} \cdot \vec{v}$

$\vec{u} \cdot \vec{v} = 6 \cdot 0 + (-6) \cdot 3$
$= 0 - 18$
$= -18$

>>> Verder oefenen: D1 t.e.m. D18

**3**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(-4, -7)$
$\vec{v}$ met coördinaat $\vec{v}(x, 2)$
Gevraagd: Bepaal $x \in \mathbb{R}$ zodat $\vec{u} \perp \vec{v}$.

Als $\vec{u} \perp \vec{v}$ dan is $\vec{u} \cdot \vec{v} = 0$.
$-4x + (-7) \cdot 2 = 0$
$-4x - 14 = 0$
$-4x = 14$
$x = -\frac{14}{4} = -\frac{7}{2}$

>>> Verder oefenen: D1 t.e.m. D18

--- PAGE 22 ---
**4**
Gegeven:
[Afbeelding: Een assenstelsel. Een hoek $\alpha$ tussen twee vectoren $\vec{u}$ en $\vec{v}$ die vertrekken vanuit een gezamenlijk punt A(2, 2). Vector $\vec{u}$ gaat naar punt B(3, 5). Vector $\vec{v}$ gaat naar punt C(7, 4).]

Gevraagd: Bepaal de grootte van de hoek $\alpha$ tussen de vectoren $\vec{u}$ en $\vec{v}$.

co($\vec{u}$) = $(1, 3)$
co($\vec{v}$) = $(5, 2)$

$\cos \alpha = \frac{a_1 a_2 + b_1 b_2}{\sqrt{a_1^2 + b_1^2} \cdot \sqrt{a_2^2 + b_2^2}}$
$= \frac{1 \cdot 5 + 3 \cdot 2}{\sqrt{1^2 + 3^2} \cdot \sqrt{5^2 + 2^2}}$
$= \frac{5 + 6}{\sqrt{10} \cdot \sqrt{29}}$
$= \frac{11}{\sqrt{290}}$

$\Rightarrow \alpha \approx 49^\circ 45' 49''$

>>> Verder oefenen: D1 t.e.m. D18

--- PAGE 23 ---
**5**
Gegeven: A(-1, 2), B(-4, -2), C(0, 1) en D(4, 0)
Gevraagd: Bereken $(\vec{AB} - 2\vec{BC}) \cdot (\vec{DA} + 2\vec{AC})$

co($\vec{AB}$) = $(-3, -4)$
co($\vec{BC}$) = $(4, 3) \Leftrightarrow \text{co}(2\vec{BC}) = (8, 6)$
co($\vec{DA}$) = $(-5, 2)$
co($\vec{AC}$) = $(1, -1) \Leftrightarrow \text{co}(2\vec{AC}) = (2, -2)$

- co($\vec{AB} - 2\vec{BC}$) = $(-11, -10)$
- co($\vec{DA} + 2\vec{AC}$) = $(-3, 0)$
- $(\vec{AB} - 2\vec{BC}) \cdot (\vec{DA} + 2\vec{AC}) = -11 \cdot (-3) + (-10) \cdot 0$
  $= 33$

>>> Verder oefenen: D1 t.e.m. D18

**6**
Bepaal de hoek tussen de rechten $e$ en $f$ als je weet dat:
$e \leftrightarrow x - 2y + 1 = 0$
$f \leftrightarrow 2x + y + 3 = 0$

- $a_e = \frac{1}{2}$
- $a_f = -2$

- richtvectoren: $\vec{E}(1, \frac{1}{2})$ en $\vec{F}(1, -2)$

$\cos(\widehat{EF}) = \frac{|1 \cdot 1 + a_1 a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$
$= \frac{|1 + (-1)|}{\sqrt{1 + \left(\frac{1}{2}\right)^2} \cdot \sqrt{1 + (-2)^2}}$
$= \frac{0}{\sqrt{\frac{5}{4}} \cdot \sqrt{5}}$
$= 0$

$\Rightarrow \widehat{EF} = 90^\circ$

>>> Verder oefenen: D19 t.e.m. D30

--- PAGE 24 ---
**7**
Bepaal de vergelijking van de loodlijn uit de oorsprong op de rechte $e \leftrightarrow y = -3x + 2$.

- $a_e = -3$
  $\Updownarrow$
  $a_l = \frac{1}{3}$

- $l \leftrightarrow y - 0 = \frac{1}{3}(x - 0)$
  $\leftrightarrow y = \frac{1}{3}x$

>>> Verder oefenen: D19 t.e.m. D30

**8**
Bepaal de vergelijking van de middelloodlijn van het lijnstuk [CD] met C(-4, 0) en D(0, 8).

- $\text{co}(M) = \left(\frac{-4 + 0}{2}, \frac{0 + 8}{2}\right) = (-2, 4)$

- $a_{CD} = \frac{8 - 0}{0 + 4} = \frac{8}{4} = 2$
  $\Updownarrow$
  $a_m = -\frac{1}{2}$

- $m \leftrightarrow y - 4 = -\frac{1}{2}(x + 2)$
  $\leftrightarrow y - 4 = -\frac{1}{2}x - 1$
  $\leftrightarrow y = -\frac{1}{2}x + 3$

>>> Verder oefenen: D19 t.e.m. D30

--- PAGE 25 ---
**9**
Bepaal de afstand van het punt P(-1, 4) tot de rechte $e \leftrightarrow 3x - 4y + 5 = 0$.

$d(P, e) = \frac{|ux_0 + vy_0 + w|}{\sqrt{u^2 + v^2}}$
$= \frac{|3 \cdot (-1) + (-4) \cdot 4 + 5|}{\sqrt{9 + 16}}$
$= \frac{|-3 - 16 + 5|}{\sqrt{25}}$
$= \frac{14}{5}$
$= 2,8$

>>> Verder oefenen: D31 t.e.m. D35

**10**
Bepaal de vergelijkingen van de bissectrices van de snijdende rechten $e$ en $f$.
$e \leftrightarrow y - 2x - 1 = 0$
$f \leftrightarrow 4y + 2x - 9 = 0$

$P(x, y)$ behoort tot een bissectrice $\Leftrightarrow d(P, e) = d(P, f)$

$\frac{|y - 2x - 1|}{\sqrt{4 + 1}} = \frac{|4y + 2x - 9|}{\sqrt{4 + 16}}$
$\frac{|y - 2x - 1|}{\sqrt{5}} = \frac{|4y + 2x - 9|}{\sqrt{20}}$
$\frac{|y - 2x - 1|}{\sqrt{5}} = \frac{|4y + 2x - 9|}{2\sqrt{5}}$

$\frac{y - 2x - 1}{\sqrt{5}} = \frac{4y + 2x - 9}{2\sqrt{5}}$ of $\frac{y - 2x - 1}{\sqrt{5}} = \frac{-4y - 2x + 9}{2\sqrt{5}}$

$2(y - 2x - 1) = 4y + 2x - 9$ of $2(y - 2x - 1) = -4y - 2x + 9$
$2y - 4x - 2 = 4y + 2x - 9$ of $2y - 4x - 2 = -4y - 2x + 9$
$2y + 6x - 7 = 0$ of $-6y + 2x + 11 = 0$

Antwoord: $d_1 \leftrightarrow 2y + 6x - 7 = 0$ en $d_2 \leftrightarrow -6y + 2x + 11 = 0$

>>> Verder oefenen: D31 t.e.m. D35

--- PAGE 26 ---
# Differentiatietraject

**1**
Gegeven: A(4, 2) en B(1, 8)
Gevraagd: Bepaal de coördinaat van de vector $\vec{AB}$ en van de vector $\vec{BA}$.

co($\vec{AB}$) = $(-3, 6)$
co($\vec{BA}$) = $(6, -6)$

**2**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(7, 3)$
$\vec{v}$ met coördinaat $\vec{v}(-1, 4)$
Gevraagd: Bereken het inproduct $\vec{u} \cdot \vec{v}$

$\vec{u} \cdot \vec{v} = 7 \cdot (-1) + 3 \cdot 4$
$= -7 + 12$
$= 5$

**3**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(0, -5)$
$\vec{v}$ met coördinaat $\vec{v}(4, 2)$
Gevraagd: Bepaal de coördinaat van de vector $5\vec{v} - \vec{u}$

co($5\vec{v}$) = $(20, -10)$
co($5\vec{v} - \vec{u}$) = $(20, 15)$

**4**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(-3, 1)$
$\vec{v}$ met coördinaat $\vec{v}(2, -1)$
Gevraagd: Bereken $||\vec{u} + 2\vec{v}||$

co($2\vec{v}$) = $(4, -2)$
co($\vec{u} + 2\vec{v}$) = $(1, -1)$
$||\vec{u} + 2\vec{v}|| = \sqrt{1^2 + (-1)^2} = \sqrt{2}$

**5**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(6, 3)$
Gevraagd: Bereken $\vec{u}^2$

$\vec{u} \cdot \vec{u} = 6 \cdot 6 + 3 \cdot 3$
$= 36 + 9$
$= 45$

--- PAGE 27 ---
**6**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(0, -8)$
$\vec{v}$ met coördinaat $\vec{v}(-3, 4)$
Gevraagd: Bepaal de grootte van de hoek $\alpha$ tussen de vectoren $\vec{u}$ en $\vec{v}$.

$\cos \alpha = \frac{a_1 a_2 + b_1 b_2}{\sqrt{a_1^2 + b_1^2} \cdot \sqrt{a_2^2 + b_2^2}}$
$= \frac{0 \cdot (-3) + (-8) \cdot 4}{\sqrt{0^2 + (-8)^2} \cdot \sqrt{(-3)^2 + 4^2}}$
$= \frac{0 - 32}{\sqrt{64} \cdot \sqrt{25}}$
$= \frac{-32}{8 \cdot 5}$
$= -\frac{4}{5}$
$\Rightarrow \alpha \approx 143^\circ 7' 48''$

**7**
Gegeven: A(2, 3), B(4, 0) en C(0, -1)
Gevraagd: Bereken $\vec{AB} \cdot \vec{AC}$

co($\vec{AB}$) = $(2, -3)$
co($\vec{AC}$) = $(-2, -4)$

$\vec{AB} \cdot \vec{AC} = 2 \cdot (-2) + (-3) \cdot (-4)$
$= -4 + 12$
$= 8$

**8**
Gegeven: A(0, 0), B(2, 2), C(-2, 4) en D(-2, -4)
Gevraagd: Bereken $\vec{AB} \cdot \vec{CD}$

co($\vec{AB}$) = $(2, 2)$
co($\vec{CD}$) = $(0, -8)$

$\vec{AB} \cdot \vec{CD} = 2 \cdot 0 + 2 \cdot (-8)$
$= 0 - 16$
$= -16$

--- PAGE 28 ---
**9**
Gegeven:
[Afbeelding: Assenstelsel. Driehoek met hoekpunten A(2, 5), B(8, 4) en nog een punt B(3, 1) die ik even als B' beschouw of zo, hoewel in de tekst staat "B(3,1)" bij het laagste punt. Fout in tekening: er zijn twee punten B. Een is B(8, 4) rechts, de andere is het lagere punt (3, 1). De opgave gebruikt kennelijk het ene of het andere. De pijlen tonen $\vec{u}$ van A(2, 5) naar (3, 1) - het laagste punt, en $\vec{v}$ van A(2, 5) naar B(8, 4). Dus het lagere punt met B(3,1) erbij geschreven functioneert hier in de tekst als B voor $\vec{AB}$ in de berekening eronder. Maar $\vec{v}$ is $\vec{AC}$ volgens de tekst. Dus laten we de berekening volgen die A, B, C aanhoudt. Dan is het laagste punt B(3, 1) en het rechtse punt C(8, 4). Het prentje schrijft verkeerdelijk B bij (8,4).]

Gevraagd: Bereken $\vec{u} \cdot \vec{v} = \vec{AB} \cdot \vec{AC}$

co($\vec{AB}$) = $(1, -4)$
co($\vec{AC}$) = $(6, -1)$

$\vec{AB} \cdot \vec{AC} = 1 \cdot 6 + (-4) \cdot (-1)$
$= 6 + 4$
$= 10$

**10**
Gegeven: A(-1, -2), B(5, -2), C(3, 3)
Gevraagd: Bepaal de grootte van de hoek $\alpha$ tussen de vectoren $\vec{AB}$ en $\vec{AC}$.

co($\vec{AB}$) = $(6, 0)$
co($\vec{CD}$) = $(4, 5)$ *Hier staat $\vec{CD}$ in de opgave, maar het is overduidelijk bedoeld als $\vec{AC}$, $\text{co}(\vec{AC}) = (3-(-1), 3-(-2)) = (4, 5)$*

$\cos \alpha = \frac{a_1 a_2 + b_1 b_2}{\sqrt{a_1^2 + b_1^2} \cdot \sqrt{a_2^2 + b_2^2}}$
$= \frac{6 \cdot 4 + 0 \cdot 5}{\sqrt{6^2 + 0^2} \cdot \sqrt{4^2 + 5^2}}$
$= \frac{24 + 0}{\sqrt{36} \cdot \sqrt{41}}$
$= \frac{24}{6\sqrt{41}}$
$= \frac{4}{\sqrt{41}}$
$\Rightarrow \alpha \approx 51^\circ 20' 25''$

--- PAGE 29 ---
**11**
Gegeven: A(1, 4), B(2, -2), C(-1, 0), D(4, -2)
Gevraagd: Bepaal de grootte van de hoek $\alpha$ tussen de vectoren $\vec{AB}$ en $\vec{CD}$.

co($\vec{AB}$) = $(1, -6)$
co($\vec{CD}$) = $(5, -2)$

$\cos \alpha = \frac{a_1 a_2 + b_1 b_2}{\sqrt{a_1^2 + b_1^2} \cdot \sqrt{a_2^2 + b_2^2}}$
$= \frac{1 \cdot 5 + (-6) \cdot (-2)}{\sqrt{1^2 + (-6)^2} \cdot \sqrt{5^2 + (-2)^2}}$
$= \frac{5 + 12}{\sqrt{37} \cdot \sqrt{29}}$
$= \frac{17}{\sqrt{1073}}$

$\Rightarrow \alpha \approx 58^\circ 44' 11''$

--- PAGE 30 ---
**12**
Gegeven:
[Afbeelding: Assenstelsel. Hoek C met hoekpunt A(8, 3). Er zijn twee benen, een via $\vec{v}$ naar C(2, 7) en een via $\vec{u}$ naar B(5, 1).]

Gevraagd: Bepaal de grootte van de hoek $\alpha$ tussen de vectoren $\vec{u}$ en $\vec{v}$.

co($\vec{u}$) = $(-3, -2)$
co($\vec{v}$) = $(-6, 4)$

$\cos \alpha = \frac{a_1 a_2 + b_1 b_2}{\sqrt{a_1^2 + b_1^2} \cdot \sqrt{a_2^2 + b_2^2}}$
$= \frac{-3 \cdot (-6) + (-2) \cdot 4}{\sqrt{(-3)^2 + (-2)^2} \cdot \sqrt{(-6)^2 + 4^2}}$
$= \frac{18 - 8}{\sqrt{13} \cdot \sqrt{52}}$
$= \frac{10}{26}$
$= \frac{5}{13}$

$\Rightarrow \alpha \approx 67^\circ 22' 48''$

--- PAGE 31 ---
**13**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(2, 3)$
$\vec{v}$ met coördinaat $\vec{v}(-2, 1)$
$\vec{w}$ met coördinaat $\vec{w}(5, 0)$

Gevraagd: Bereken: $(2\vec{u} + \vec{v}) \cdot (\vec{v} - 3\vec{w})$

co($2\vec{u}$) = $(4, 6)$
co($3\vec{w}$) = $(15, 0)$
co($2\vec{u} + \vec{v}$) = $(2, 7)$
co($\vec{v} - 3\vec{w}$) = $(-17, 1)$

$(2\vec{u} + \vec{v}) \cdot (\vec{v} - 3\vec{w}) = 2 \cdot (-17) + 7 \cdot 1$
$= -34 + 7$
$= -27$

**14**
Gegeven: A(1, 2), B(3, 4), C(5, 6) en D(7, 8)
Gevraagd: Bereken $(\vec{AB} + \vec{AC} + \vec{AD}) \cdot (\vec{BC} - 2\vec{DA})$

co($\vec{AB}$) = $(2, 2)$
co($\vec{AC}$) = $(4, 4)$
co($\vec{AD}$) = $(6, 6)$
co($\vec{AB} + \vec{AC} + \vec{AD}$) = $(12, 12)$
co($\vec{BC}$) = $(2, 2)$
co($\vec{DA}$) = $(-6, -6) \Leftrightarrow \text{co}(2\vec{DA}) = (-12, -12)$
co($\vec{BC} - 2\vec{DA}$) = $(14, 14)$

$(\vec{AB} + \vec{AC} + \vec{AD}) \cdot (\vec{BC} - 2\vec{DA}) = 12 \cdot 14 + 12 \cdot 14$
$= 336$

**15**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(-1; 2x + 3)$
$\vec{v}$ met coördinaat $\vec{v}(x - 1; 4)$
Gevraagd: Bepaal $x \in \mathbb{R}$ zodat $\vec{u} \perp \vec{v}$.

Als $\vec{u} \perp \vec{v}$ dan is $\vec{u} \cdot \vec{v} = 0$.

$-1 \cdot (x - 1) + (2x + 3) \cdot 4 = 0$
$-x + 1 + 8x + 12 = 0$
$7x + 13 = 0$
$7x = -13$
$x = -\frac{13}{7}$

--- PAGE 32 ---
**16**
Gegeven: $\vec{u}$ met coördinaat $\vec{u}(3; 2 - x)$
$\vec{v}$ met coördinaat $\vec{v}(4x + 3; -1)$
Gevraagd: Bepaal $x \in \mathbb{R}$ zodat $\vec{u} \perp \vec{v}$.

Als $\vec{u} \perp \vec{v}$ dan is $\vec{u} \cdot \vec{v} = 0$.

$3(4x + 3) + (2 - x)(-1) = 0$
$12x + 9 - 2 + x = 0$
$13x + 7 = 0$
$13x = -7$
$x = -\frac{7}{13}$

--- PAGE 33 ---
**17**
Gegeven:
[Afbeelding: Een driehoek met hoekpunten A(2, 3), B(5, 5) en C(5, 1) in een assenstelsel.]

Gevraagd: Bepaal de grootte van de hoeken $\widehat{A}$, $\widehat{B}$ en $\widehat{C}$.

co($\vec{AB}$) = $(3, 2)$
co($\vec{AC}$) = $(3, -2)$

co($\vec{BC}$) = $(0, -4)$
co($\vec{BA}$) = $(-3, -2)$

co($\vec{CA}$) = $(-3, 2)$
co($\vec{CB}$) = $(0, 4)$

- $\cos \widehat{A} = \frac{3 \cdot 3 + 2 \cdot (-2)}{\sqrt{3^2 + 2^2} \cdot \sqrt{3^2 + (-2)^2}}$
  $= \frac{9 - 4}{\sqrt{13} \cdot \sqrt{13}}$
  $= \frac{5}{13}$
  $\Rightarrow \widehat{A} \approx 67^\circ 22' 48''$

- $\cos \widehat{B} = \frac{0 \cdot (-3) + (-4) \cdot (-2)}{\sqrt{0^2 + (-4)^2} \cdot \sqrt{(-3)^2 + (-2)^2}}$
  $= \frac{0 + 8}{\sqrt{16} \cdot \sqrt{13}}$
  $= \frac{8}{4\sqrt{13}}$
  $= \frac{2}{\sqrt{13}}$
  $\Rightarrow \widehat{B} \approx 56^\circ 18' 36''$

- $\cos \widehat{C} = \frac{(-3) \cdot 0 + 2 \cdot 4}{\sqrt{(-3)^2 + 2^2} \cdot \sqrt{0^2 + 4^2}}$
  $= \frac{0 + 8}{\sqrt{13} \cdot \sqrt{16}}$
  $= \frac{8}{4\sqrt{13}}$
  $= \frac{2}{\sqrt{13}}$
  $\Rightarrow \widehat{C} \approx 56^\circ 18' 36''$

--- PAGE 34 ---
**18**
Gegeven:
[Afbeelding: Een ruit (of vierhoek) met hoekpunten A(1, 3), B(3, 6), C(6, 4) en D(3, 1) in een assenstelsel.]

Gevraagd: Bepaal de grootte van de hoeken $\widehat{A}$, $\widehat{B}$, $\widehat{C}$ en $\widehat{D}$.

co($\vec{AB}$) = $(2, 3)$
co($\vec{AD}$) = $(2, -2)$

co($\vec{BC}$) = $(3, -2)$
co($\vec{BA}$) = $(-2, -3)$

co($\vec{CD}$) = $(-3, -3)$
co($\vec{CB}$) = $(-3, 2)$

co($\vec{DA}$) = $(-2, 2)$
co($\vec{DC}$) = $(3, 3)$

- $\cos \widehat{A} = \frac{2 \cdot 2 + 3 \cdot (-2)}{\sqrt{2^2 + 3^2} \cdot \sqrt{2^2 + (-2)^2}}$
  $= \frac{4 - 6}{\sqrt{13} \cdot \sqrt{8}}$
  $= \frac{-2}{\sqrt{13} \cdot 2\sqrt{2}}$
  $= -\frac{1}{\sqrt{26}}$
  $\Rightarrow \widehat{A} \approx 101^\circ 18' 36''$

- $\cos \widehat{B} = \frac{3 \cdot (-2) + (-2) \cdot (-3)}{\sqrt{3^2 + (-2)^2} \cdot \sqrt{(-2)^2 + (-3)^2}}$
  $= \frac{-6 + 6}{\sqrt{13} \cdot \sqrt{13}}$
  $= \frac{0}{13}$
  $= 0$
  $\Rightarrow \widehat{B} = 90^\circ$

- $\cos \widehat{C} = \frac{(-3) \cdot (-3) + (-3) \cdot 2}{\sqrt{(-3)^2 + 3^2} \cdot \sqrt{(-3)^2 + 2^2}}$
  $= \frac{9 - 6}{\sqrt{18} \cdot \sqrt{13}}$
  $= \frac{3}{3\sqrt{2}\sqrt{13}}$
  $= \frac{1}{\sqrt{26}}$
  $\Rightarrow \widehat{C} \approx 78^\circ 41' 24''$

- $\cos \widehat{D} = \frac{(-2) \cdot 3 + 2 \cdot 3}{\sqrt{(-2)^2 + 2^2} \cdot \sqrt{3^2 + 3^2}}$
  $= \frac{-6 + 6}{\sqrt{8} \cdot \sqrt{18}}$
  $= \frac{0}{12}$
  $= 0$
  $\Rightarrow \widehat{D} = 90^\circ$

--- PAGE 35 ---
**19**
Bepaal de grootte van de hoek tussen de rechten $e$ en $f$ als je weet dat:
$e \leftrightarrow y = 2x$
$f \leftrightarrow y = -3x$

[Afbeelding: Assenstelsel met rechten $e$ en $f$ door de oorsprong.]

- $a_e = 2$
  $a_f = -3$
- richtvectoren: $\vec{E}(1, 2)$ en $\vec{F}(1, -3)$

$\cos(\widehat{EF}) = \frac{|1 \cdot 1 + a_1 a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$
$= \frac{|1 + 2 \cdot (-3)|}{\sqrt{1 + 2^2} \cdot \sqrt{1 + (-3)^2}}$
$= \frac{|-5|}{\sqrt{5} \cdot \sqrt{10}}$
$= \frac{5}{5\sqrt{2}}$
$= \frac{1}{\sqrt{2}}$
$\Rightarrow \widehat{EF} = 45^\circ$

**20**
Bepaal de grootte van de hoek tussen de rechte $e \leftrightarrow y + x - 5 = 0$ en de x-as.

- $a_e = -1$
- richtvector: $\vec{E}(1, -1)$
  richtvector x-as: $(1, 0)$

$\cos \alpha = \frac{|1 \cdot 1 + a_1 a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$
$= \frac{|1 + (-1) \cdot 0|}{\sqrt{1 + (-1)^2} \cdot \sqrt{1 + 0^2}}$
$= \frac{|1|}{\sqrt{2} \cdot \sqrt{1}}$
$= \frac{1}{\sqrt{2}}$
$\Rightarrow \alpha = 45^\circ$

--- PAGE 36 ---
**21**
Bepaal de grootte van de hoek tussen de rechte $f \leftrightarrow y - 3x + 4 = 0$ en de y-as.

- $a_f = 3$
- richtvector: $\vec{F}(1, 3)$
  richtvectoren y-as: $(0, 1)$

$\cos \alpha = \frac{|1 \cdot 1 + a_1 a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{0 + a_2^2}}$
$= \frac{|0 + 3 \cdot 1|}{\sqrt{1 + 3^2} \cdot \sqrt{0 + 1^2}}$
$= \frac{|3|}{\sqrt{10} \cdot \sqrt{1}}$
$= \frac{3}{\sqrt{10}}$
$\Rightarrow \alpha = 18^\circ 26' 6''$

**22**
Bepaal de vergelijking van de loodlijn uit $P(-2, -3)$ op de rechte $e \leftrightarrow 3y - x + 4 = 0$.

- $a_e = \frac{1}{3}$
  $\Updownarrow$
  $a_l = -3$

- $l \leftrightarrow y + 3 = -3(x + 2)$
  $\leftrightarrow y + 3 = -3x - 6$
  $\leftrightarrow y = -3x - 9$

--- PAGE 37 ---
**23**
Bepaal de vergelijking van de middelloodlijn van het lijnstuk [KL].

[Afbeelding: Een lijnstuk KL in een assenstelsel. K bevindt zich op (-3, 2). L bevindt zich op (5, -4).]

- $\text{co}(M) = \left(\frac{-3 + 5}{2}, \frac{2 + (-4)}{2}\right) = (1, -1)$
- $a_{KL} = \frac{-4 - 2}{5 + 3} = \frac{-6}{8} = -\frac{3}{4}$
  $\Updownarrow$
  $a_m = \frac{4}{3}$
- $m \leftrightarrow y + 1 = \frac{4}{3}(x - 1)$
  $\leftrightarrow y + 1 = \frac{4}{3}x - \frac{4}{3}$
  $\leftrightarrow y = \frac{4}{3}x - \frac{7}{3}$

**24**
Bepaal $p$ zodat $e \perp f$

$e \leftrightarrow y = px + 3$
$f \leftrightarrow y = -2x + p$

$a_e \cdot a_f = -1$
$a_e \cdot (-2) = -1$
$a_e = \frac{1}{2} \Rightarrow p = \frac{1}{2}$

--- PAGE 38 ---
**25**
Gegeven: driehoek ABC met A(1, 1), B(5, 6) en C(8, 4)
Gevraagd: Bepaal de vergelijking van de hoogtelijn uit A op BC.

- $a_{BC} = \frac{4 - 6}{8 - 5} = -\frac{2}{3}$
  $\Updownarrow$
  $a_h = \frac{3}{2}$

- $h \leftrightarrow y - 1 = \frac{3}{2}(x - 1)$
  $\leftrightarrow y - 1 = \frac{3}{2}x - \frac{3}{2}$
  $\leftrightarrow y = \frac{3}{2}x - \frac{1}{2}$

**26**
Gegeven: driehoek DEF met D(-2, 5), E(1, 8) en F(3, 2)
Gevraagd: Bepaal de vergelijking van de middelloodlijn van [EF].

- $\text{co}(M) = \left(\frac{3 + 1}{2}, \frac{2 + 8}{2}\right) = (2, 5)$

- $a_{EF} = \frac{2 - 8}{3 - 1} = \frac{-6}{2} = -3$
  $\Updownarrow$
  $a_m = \frac{1}{3}$

  $m \leftrightarrow y - 5 = \frac{1}{3}(x - 2)$
  $\leftrightarrow y - 5 = \frac{1}{3}x - \frac{2}{3}$
  $\leftrightarrow y = \frac{1}{3}x + \frac{13}{3}$

**27**
Gegeven: A(0, -4), B(8, 2) en C(14, -6)

a) [AB] is een diameter van de cirkel $c$. Bepaal de vergelijking van de cirkel $c$.
b) Toon analytisch aan dat C buiten de cirkel ligt.
c) BC is een raaklijn aan de cirkel. Geef de vergelijking van deze raaklijn. Je kunt gebruik maken van de volgende eigenschap van een raaklijn aan een cirkel: een raaklijn staat loodrecht op de middellijn door het raakpunt.
d) Bepaal de vergelijking van de tweede raaklijn als je weet dat die door het punt D(4, –6) op de cirkel gaat.
e) Bepaal analytisch de kleinste hoek tussen de twee raaklijnen.

a) Als [AB] een diameter van de cirkel is, dan is het middelpunt M van het lijnstuk [AB] het middelpunt van de cirkel.
$\text{co}(M) = \left(\frac{0 + 8}{2}, \frac{-4 + 2}{2}\right) = (4, -1)$
$\text{diameter} = |AB| = ||\vec{AB}|| = \sqrt{(8 - 0)^2 + (2 + 4)^2} = \sqrt{64 + 36} = \sqrt{100} = 10$
straal van de cirkel is dus: $r = \frac{10}{2} = 5$
$c \leftrightarrow (x - 4)^2 + (y + 1)^2 = 25$

--- PAGE 39 ---
b) We moeten bewijzen dat $|MC| > 5$
$|MC| = ||\vec{MC}|| = \sqrt{(14 - 4)^2 + (-6 + 1)^2} = \sqrt{100 + 25} = \sqrt{125} = 5\sqrt{5}$
$5\sqrt{5} > 5$

c) AB $\perp$ BC
$a_{AB} = \frac{2 - (-4)}{8 - 0} = \frac{6}{8} = \frac{3}{4}$
$\Updownarrow$
$a_{BC} = -\frac{4}{3} \quad (\text{extra controle: } a_{BC} = \frac{-6 - 2}{14 - 8} = \frac{-8}{6} = -\frac{4}{3})$

- $BC \leftrightarrow y - 2 = -\frac{4}{3}(x - 8)$
  $\leftrightarrow y - 2 = -\frac{4}{3}x + \frac{32}{3}$
  $\leftrightarrow y = -\frac{4}{3}x + \frac{38}{3}$
  $\leftrightarrow 4x + 3y - 38 = 0$

d) Vergelijking van de rechte door C(14, -6) en D(4, -6):
$CD \leftrightarrow y = -6$

e) 
- $a_{BC} = -\frac{4}{3}$
  $a_{CD} = 0$
- richtvectoren: $\vec{BC}\left(1, -\frac{4}{3}\right)$ en $\vec{CD}(1, 0)$

$\cos(\widehat{C}) = \frac{|1 \cdot 1 + a_1 a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$
$= \frac{|1 + 0|}{\sqrt{1 + \left(-\frac{4}{3}\right)^2} \cdot \sqrt{1 + 0^2}}$
$= \frac{1}{\sqrt{\frac{25}{9}} \cdot 1}$
$= \frac{1}{\frac{5}{3}}$
$= \frac{3}{5}$

$\Rightarrow \widehat{C} \approx 53^\circ 7' 48''$

--- PAGE 40 ---
**28**
Gegeven: driehoek PQR met P(-2, 0), Q(0, 7) en R(3, 3)
Gevraagd: Bepaal de grootte van de drie hoeken.

- $a_{PQ} = \frac{7 - 0}{0 + 2} = \frac{7}{2}$
  $a_{QR} = \frac{3 - 7}{3 - 0} = \frac{-4}{3}$
  $a_{PR} = \frac{3 - 0}{3 + 2} = \frac{3}{5}$

- richtvectoren: $\vec{PQ}\left(1, \frac{7}{2}\right)$, $\vec{QR}\left(1, \frac{-4}{3}\right)$ en $\vec{PR}\left(1, \frac{3}{5}\right)$

$\cos(\widehat{P}) = \frac{|1 \cdot 1 + a_1 a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$
$= \frac{\left|1 + \frac{7}{2} \cdot \frac{3}{5}\right|}{\sqrt{1 + \left(\frac{7}{2}\right)^2} \cdot \sqrt{1 + \left(\frac{3}{5}\right)^2}}$
$= \frac{\left|1 + \frac{21}{10}\right|}{\sqrt{1 + \frac{49}{4}} \cdot \sqrt{1 + \frac{9}{25}}}$
$= \frac{\left|\frac{31}{10}\right|}{\frac{\sqrt{53}}{2} \cdot \frac{\sqrt{34}}{5}}$
$= \frac{31}{\sqrt{1802}}$
$\Rightarrow \widehat{P} \approx 43^\circ 5' 27''$

$\cos(\widehat{Q}) = \frac{|1 \cdot 1 + a_1 a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$
$= \frac{\left|1 + \frac{7}{2} \cdot \left(\frac{-4}{3}\right)\right|}{\sqrt{1 + \left(\frac{7}{2}\right)^2} \cdot \sqrt{1 + \left(\frac{-4}{3}\right)^2}}$
$= \frac{\left|1 - \frac{14}{3}\right|}{\sqrt{1 + \frac{49}{4}} \cdot \sqrt{1 + \frac{16}{9}}}$
$= \frac{\left|-\frac{11}{3}\right|}{\frac{\sqrt{53}}{2} \cdot \frac{5}{3}}$
$= \frac{11}{\frac{5\sqrt{53}}{2}}$
$= \frac{22}{5\sqrt{53}}$
$\Rightarrow \widehat{Q} \approx 52^\circ 48' 55''$

$\cos(\widehat{R}) = \frac{|1 \cdot 1 + a_1 a_2|}{\sqrt{1 + a_1^2} \cdot \sqrt{1 + a_2^2}}$
$= \frac{\left|1 + \left(\frac{-4}{3}\right) \cdot \frac{3}{5}\right|}{\sqrt{1 + \left(\frac{-4}{3}\right)^2} \cdot \sqrt{1 + \left(\frac{3}{5}\right)^2}}$
$= \frac{\left|1 - \frac{4}{5}\right|}{\sqrt{1 + \frac{16}{9}} \cdot \sqrt{1 + \frac{9}{25}}}$
$= \frac{\left|\frac{1}{5}\right|}{\frac{5}{3} \cdot \frac{\sqrt{34}}{5}}$
$= \frac{\frac{1}{5}}{\frac{\sqrt{34}}{3}}$
$= \frac{3}{5\sqrt{34}}$
$\Rightarrow \widehat{R} \approx 84^\circ 5' 38''$

Controle: $\widehat{P} + \widehat{Q} + \widehat{R} = 43^\circ 5' 27'' + 52^\circ 48' 55'' + 84^\circ 5' 38'' = 180^\circ$

--- PAGE 41 ---
**29**
Gegeven: driehoek ABC met A(0, 0), B(3, 5) en C(10, -2)
Gevraagd: Bepaal het snijpunt van de drie middelloodlijnen.

- $a_{AB} = \frac{5 - 0}{3 - 0} = \frac{5}{3}$
  $\Updownarrow$
  $a_{m_1} = -\frac{3}{5}$

  $\text{co}(M_1) = \left(\frac{3 + 0}{2}, \frac{5 + 0}{2}\right) = \left(\frac{3}{2}, \frac{5}{2}\right)$
  
  $m_1 \leftrightarrow y - \frac{5}{2} = -\frac{3}{5}\left(x - \frac{3}{2}\right)$
  $\leftrightarrow y - \frac{5}{2} = -\frac{3}{5}x + \frac{9}{10}$
  $\leftrightarrow y = -\frac{3}{5}x + \frac{17}{5}$

- $a_{BC} = \frac{-2 - 5}{10 - 3} = \frac{-7}{7} = -1$
  $\Updownarrow$
  $a_{m_2} = 1$

  $\text{co}(M_2) = \left(\frac{10 + 3}{2}, \frac{5 - 2}{2}\right) = \left(\frac{13}{2}, \frac{3}{2}\right)$

  $m_2 \leftrightarrow y - \frac{3}{2} = 1\left(x - \frac{13}{2}\right)$
  $\leftrightarrow y - \frac{3}{2} = x - \frac{13}{2}$
  $\leftrightarrow y = x - 5$

- $a_{AC} = \frac{-2 - 0}{10 - 0} = \frac{-1}{5}$
  $\Updownarrow$
  $a_{m_3} = 5$

  $\text{co}(M_3) = \left(\frac{10 + 0}{2}, \frac{-2 + 0}{2}\right) = (5, -1)$

  $m_3 \leftrightarrow y + 1 = 5(x - 5)$
  $\leftrightarrow y + 1 = 5x - 25$
  $\leftrightarrow y = 5x - 26$

- Snijpunt $m_1$ en $m_2$:
  
  $\begin{cases} y = -\frac{3}{5}x + \frac{17}{5} \\ y = x - 5 \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = -\frac{3}{5}x + \frac{17}{5} \\ -\frac{3}{5}x + \frac{17}{5} = x - 5 \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = -\frac{3}{5}x + \frac{17}{5} \\ -\frac{3}{5}x - x = -5 - \frac{17}{5} \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = -\frac{3}{5}x + \frac{17}{5} \\ -\frac{8}{5}x = -\frac{42}{5} \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = -\frac{3}{5}x + \frac{17}{5} \\ -8x = -42 \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = -\frac{3}{5} \cdot \frac{21}{4} + \frac{17}{5} \\ x = \frac{21}{4} \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = -\frac{63}{20} + \frac{17}{5} \\ x = \frac{21}{4} \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = \frac{1}{4} \\ x = \frac{21}{4} \end{cases}$

  $V = \left(\frac{21}{4}, \frac{1}{4}\right)$

--- PAGE 42 ---
**30**
Gegeven: driehoek DEF met D(-2, -2), E(1, 7) en F(8, 3)
Gevraagd: Bepaal het snijpunt van de drie hoogtelijnen.

- $a_{DE} = \frac{7 + 2}{1 + 2} = 3$
  $\Updownarrow$
  $a_{h_1} = -\frac{1}{3}$

  $h_1 \leftrightarrow y - 3 = -\frac{1}{3}(x - 8)$
  $\leftrightarrow y - 3 = -\frac{1}{3}x + \frac{8}{3}$
  $\leftrightarrow y = -\frac{1}{3}x + \frac{17}{3}$

- $a_{EF} = \frac{3 - 7}{8 - 1} = \frac{-4}{7}$
  $\Updownarrow$
  $a_{h_2} = \frac{7}{4}$

  $h_2 \leftrightarrow y + 2 = \frac{7}{4}(x + 2)$
  $\leftrightarrow y + 2 = \frac{7}{4}x + \frac{7}{2}$
  $\leftrightarrow y = \frac{7}{4}x + \frac{3}{2}$

- $a_{DF} = \frac{3 + 2}{8 + 2} = \frac{5}{10} = \frac{1}{2}$
  $\Updownarrow$
  $a_{h_3} = -2$

  $h_3 \leftrightarrow y - 7 = -2(x - 1)$
  $\leftrightarrow y - 7 = -2x + 2$
  $\leftrightarrow y = -2x + 9$

- Snijpunt $h_1$ en $h_2$:

  $\begin{cases} y = \frac{7}{4}x + \frac{3}{2} \\ y = -2x + 9 \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = \frac{7}{4}x + \frac{3}{2} \\ \frac{7}{4}x + \frac{3}{2} = -2x + 9 \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = \frac{7}{4}x + \frac{3}{2} \\ 4 \cdot \left(\frac{7}{4}x + \frac{3}{2}\right) = (-2x + 9) \cdot 4 \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = \frac{7}{4}x + \frac{3}{2} \\ 7x + 6 = -8x + 36 \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = \frac{7}{4}x + \frac{3}{2} \\ 15x = 30 \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = \left(\frac{7}{4} \cdot 2\right) + \frac{3}{2} \\ x = 2 \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = \frac{7}{2} + \frac{3}{2} \\ x = 2 \end{cases}$
  $\Updownarrow$
  $\begin{cases} y = 5 \\ x = 2 \end{cases}$

  $V = (2, 5)$

**31**
Bepaal de afstand van het punt P(3, -5) tot de rechte $e \leftrightarrow y = -2x + 7$.

$d(P, e) = \frac{|-2 \cdot 3 + (-1) \cdot (-5) + 7|}{\sqrt{(-2)^2 + (-1)^2}}$
$= \frac{|-6 + 5 + 7|}{\sqrt{5}}$
$= \frac{6}{\sqrt{5}}$ (hier is er een schrijffout in het boek? Ofwel wordt er de noemer gerationaliseerd naar $\frac{6\sqrt{5}}{5}$, het boek toont $\frac{6}{\sqrt{5}}$... wacht op prent 42 onderaan is er handgeschreven $\frac{6}{\sqrt{25}}$, wat raar is. Ik zal overnemen wat in het rood staat).
$= \frac{6}{\sqrt{5}}$ (ik corrigeer hier naar wat ik denk dat er in de print staat, het lijkt op $\frac{6}{\sqrt{5}}$, in het rode stuk daaronder is er plots $\frac{6}{\sqrt{25}}$. Nee, er staat $\frac{6}{\sqrt{5}}$ wat $\frac{6\sqrt{5}}{5}$ zou zijn. Ah, in de print is het rode stukje onder $|-6+5+7|/\sqrt{5}$ dit: $= \frac{6}{\sqrt{5}}$ wacht. Nee, in de scan staat:
$= \frac{6}{\sqrt{25}}$ dit is duidelijk fout maar het is wat er staat. Oh wacht, $\sqrt{(-2)^2 + (-1)^2} = \sqrt{4+1} = \sqrt{5}$. Het rode deeltje onder $\frac{|-6+5+7|}{\sqrt{5}}$ is $= \frac{6}{\sqrt{5}}$ wacht... neen het is $= \frac{6}{\sqrt{5}}$ in het boek? Ah, kijkend naar scan 42:
$= \frac{6}{\sqrt{5}}$ en dan $= \frac{6}{\sqrt{25}}$? Nee er staat $= \frac{6}{\sqrt{5}}$ dan $\approx 2,68$. Wacht $6/\sqrt{5} = 2,68328$. In de rode tekst is het $= \frac{6}{\sqrt{5}}$ met eventueel een veegje dat op "25" lijkt? Nee, het is echt $\frac{6}{\sqrt{5}}$. Ik herlees het nu beter: het is een "$\sqrt{5}$". Ik hou het op $\sqrt{5}$.)
$= \frac{6}{\sqrt{5}}$
$\approx 2,68$

--- PAGE 43 ---
**32**
Bepaal de afstand van het punt D(-3, 0) tot de rechte EF met E(-1, 1) en F(3, 9).

$EF \leftrightarrow y - 1 = \frac{9 - 1}{3 + 1}(x + 1)$
$\leftrightarrow y - 1 = 2x + 2$
$\leftrightarrow y = 2x + 3$

$EF \leftrightarrow 2x - y + 3 = 0$

$d(D, EF) = \frac{|2 \cdot (-3) + (-1) \cdot 0 + 3|}{\sqrt{2^2 + (-1)^2}}$
$= \frac{|-6 + 0 + 3|}{\sqrt{5}}$
$= \frac{3}{\sqrt{5}}$
$\approx 1,34$

**33**
Bepaal de vergelijkingen van de bissectrices van de snijdende rechten $e$ en $f$.
$e \leftrightarrow x - 3y + 4 = 0$
$f \leftrightarrow 2x + 6y - 5 = 0$

$\frac{|x - 3y + 4|}{\sqrt{1^2 + (-3)^2}} = \frac{|2x + 6y - 5|}{\sqrt{2^2 + 6^2}}$
$\frac{|x - 3y + 4|}{\sqrt{10}} = \frac{|2x + 6y - 5|}{\sqrt{40}}$

$\frac{x - 3y + 4}{\sqrt{10}} = \frac{2x + 6y - 5}{2\sqrt{10}}$ of $\frac{x - 3y + 4}{\sqrt{10}} = \frac{-2x - 6y + 5}{2\sqrt{10}}$

$(x - 3y + 4) \cdot 2\sqrt{10} = (2x + 6y - 5) \cdot \sqrt{10} \quad (x - 3y + 4) \cdot 2\sqrt{10} = (-2x - 6y + 5) \cdot \sqrt{10}$
$(x - 3y + 4) \cdot 2 = 2x + 6y - 5 \quad (x - 3y + 4) \cdot 2 = -2x - 6y + 5$
$2x - 6y + 8 = 2x + 6y - 5 \quad 2x - 6y + 8 = -2x - 6y + 5$
$12y = 13 \quad 4x = -3$
$y = \frac{13}{12} \quad x = -\frac{3}{4}$

De vergelijkingen van de bissectrices zijn: $d_1 \leftrightarrow y = \frac{13}{12}$ en $d_2 \leftrightarrow x = -\frac{3}{4}$

--- PAGE 44 ---
**34**
Bepaal de oppervlakte van de driehoek KLM met K(-3, -1), L(0, 3) en M(3, 2).

$|KL| = \sqrt{(0 + 3)^2 + (3 + 1)^2} = \sqrt{9 + 16} = 5$

$KL \leftrightarrow y + 1 = \frac{3 + 1}{0 + 3}(x + 3)$
$\leftrightarrow y + 1 = \frac{4}{3}(x + 3)$
$\leftrightarrow y + 1 = \frac{4}{3}x + 4$
$\leftrightarrow y = \frac{4}{3}x + 3$

$KL \leftrightarrow \frac{4}{3}x - y + 3 = 0$

$d(M, KL) = \frac{\left|\frac{4}{3} \cdot 3 - 1 \cdot 2 + 3\right|}{\sqrt{\left(\frac{4}{3}\right)^2 + (-1)^2}}$
$= \frac{|4 - 2 + 3|}{\sqrt{\frac{25}{9}}}$
$= \frac{5}{\frac{5}{3}}$
$= 3$

$A_{\Delta KLM} = \frac{b \cdot h}{2} = \frac{5 \cdot 3}{2} = \frac{15}{2} = 7,5$

**35**
Bepaal de vergelijking van een rechte door de oorsprong op een afstand 3 van het punt P(9, 7) gelegen.
Rechte $r$ door de oorsprong: $r \leftrightarrow ux + y = 0$

$d(P, r) = \frac{|u \cdot 9 + 1 \cdot 7|}{\sqrt{u^2 + 1^2}}$
$3 = \frac{|9u + 7|}{\sqrt{u^2 + 1}}$
$3\sqrt{u^2 + 1} = |9u + 7|$
$9 \cdot \left(\sqrt{u^2 + 1}\right)^2 = (|9u + 7|)^2$
$9 \cdot (u^2 + 1) = 81u^2 + 126u + 49$
$9u^2 + 9 = 81u^2 + 126u + 49$
$72u^2 + 126u + 40 = 0$

$D = 15876 - 11520 = 4356$

$u_1 = \frac{126 + 66}{-144} = -\frac{192}{144} = -\frac{4}{3}$
$u_2 = \frac{126 - 66}{-144} = -\frac{60}{144} = -\frac{5}{12}$

$r_1 \leftrightarrow -\frac{4}{3}x + y = 0$
$r_2 \leftrightarrow -\frac{5}{12}x + y = 0$

--- PAGE 45 ---
Auteurs Philip Bogaert, Björn Carreyn en Roger Van Nieuwenhuyze
Derde editie - Bestelnummer 94 606 0119 (module 15 van 18)
ISBN 978 90 4864 973 0 - KB D/2024/0147/206 - NUR 126/128/129 - Thema YPMF
Illustrator Jona Jamart - Design en lay-out die Keure
Verantwoordelijke uitgever die Keure, Kleine Pathoekeweg 3, 8000 Brugge
RPR 0405 108 325 - © Copyright die Keure, Brugge
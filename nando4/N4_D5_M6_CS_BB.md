--- PAGE 1 ---
# NANDO 4
D-FINALITEIT 5 UUR – MEETKUNDE

## 06 De goniometrische cirkel en verwante hoeken

[Afbeelding: Een kompas en enkele meetinstrumenten met een grote stempel "CORRECTIESLEUTEL"]

### Inhoud
- Goniometrische getallen van een hoek
- Toepassingen
- Goniometrische getallen van verwante hoeken
- Signaaloefeningen
- Differentiatietraject
- Computationeel denken
- Studiewijzer

### WAT JE AL KUNT
- de goniometrische getallen van een scherpe hoek bepalen in een rechthoekige driehoek
- de richtingscoëfficiënt van een rechte bepalen

### WAT JE LEERT IN DEZE MODULE
- de goniometrische getallen sinus, cosinus, tangens en cotangens van een hoek definiëren in de goniometrische cirkel
- het verband tussen de begrippen hellingshoek en richtingscoëfficiënt van een rechte onderzoeken en formuleren
- de verbanden tussen de goniometrische getallen van verwante hoeken formuleren en verklaren
- een hoek tekenen en berekenen op basis van een gegeven goniometrisch getal

### IN DE KIJKER
Je kan vlot rekenen met hoeken in graden, minuten en seconden.

### WISKUNDETAAL
- goniometrische cirkel
- kwadranten
- grootte van een hoek
- georiënteerde hoek
- representant
- hoofdwaarde
- goniometrische getallen van een hoek
- sinus
- cosinus
- tangens
- cotangens
- hellingshoek van een rechte
- verwante hoeken
- gelijke of gelijkwaardige hoeken
- tegengestelde hoeken
- supplementaire hoeken
- antisupplementaire hoeken
- complementaire hoeken
- anticomplementaire hoeken

--- PAGE 2 ---
# Instap

## Opdracht 1

Maak de juiste verbindingen.

[Afbeelding: Twee hoeken getekend. De bovenste is een hoek van 50 graden in tegenwijzerzin (pijl omhoog). De onderste is een hoek van 50 graden in wijzerzin (pijl omlaag).]

Verbindingen (opgelost in correctiesleutel):
- Bovenste hoek: verbonden met "α = 50°" en "tegenwijzerzin".
- Onderste hoek: verbonden met "α = -50°" en "wijzerzin".

## Opdracht 2

a) Vul aan met de juiste begrippen.

[Afbeelding: Een rechthoekige driehoek ABC, rechthoekig in A. De hoek bij C is 35°. De zijden AB en BC zijn respectievelijk de overstaande rechthoekszijde en de schuine zijde voor hoek C.]

[AB] is de overstaande rechthoekszijde van C.
[BC] is de schuine zijde of hypotenusa

b) Vul de tabel aan.

| | ALS VERHOUDING VAN TWEE LENGTES VAN ZIJDEN | MET REKENMACHINE OP 0,00001 NAUWKEURIG |
|---|---|---|
| sin 35° = | \|AB\| / \|BC\| = 3,5 cm / 6,1 cm | ≈ 0,57357 |
| cos 35° = | \|AC\| / \|BC\| = 5 cm / 6,1 cm | ≈ 0,81915 |
| tan 35° = | \|AB\| / \|AC\| = 3,5 cm / 5 cm | = 0,7 |
| cot 35° = | \|AC\| / \|AB\| = 5 cm / 3,5 cm | ≈ 1,42814 |

--- PAGE 3 ---
## Opdracht 3

Gegeven is een cirkel met straal 1 en daarin een hoek van 50° waarvan het eerste been samenvalt met de positieve x-as.

[Afbeelding: Een cirkel met straal 1 in een assenstelsel. Een hoek α = 50° is getekend met het hoekpunt O in de oorsprong. Het snijpunt met de cirkel is A. Een loodlijn vanuit A op de x-as snijdt de x-as in P. Het snijpunt van de cirkel met de positieve x-as is E(1, 0) en met de positieve y-as is E'(0, 1). Een lijnstuk loopt van A loodrecht naar de y-as en snijdt deze in Q.]

**TIP**
In een rechthoekige driehoek geldt:
cos α = aanliggende rechthoekszijde / schuine zijde
sin α = overstaande rechthoekszijde / schuine zijde

Bepaal de coördinaatgetallen van het punt A.

Noem P de loodrechte projectie van A op de x-as. Dan is driehoek OPA rechthoekig in P.
Vorig jaar heb je geleerd dat in een rechthoekige driehoek voor een hoek α geldt:
cos α = aanliggende rechthoekszijde / schuine zijde
sin α = overstaande rechthoekszijde / schuine zijde

Dus:
cos 50° = |OP| / |OA| = |OP| / 1 = |OP|
sin 50° = |AP| / |OA| = |OQ| / 1 = |OQ|

waaruit volgt: co(A) = (cos 50°, sin 50°)

## Opdracht 4

Vul aan.

a) α = 40° en β = -40° . α en β zijn tegengestelde hoeken. De som α + β is gelijk aan 0° .

b) α = 40° en β = 50°. α en β zijn complementaire hoeken. De som α + β is gelijk aan 90° .

c) α = 40° en β = 140° . α en β zijn supplementaire hoeken. De som α + β is gelijk aan 180°.

--- PAGE 4 ---
# 1 Goniometrische getallen van een hoek

## 1.1 De hoofdwaarde van een hoek

In het tweede jaar leerde je in de module over transformaties een rotatie over een hoek in wijzerzin of tegenwijzerzin met ICT uitvoeren. Wanneer op een hoek een zin is aangeduid, dan is dat een **georiënteerde hoek**.

[Afbeelding: Een hoek α = +40° met een pijl in tegenwijzerzin. Onderschrift: TEGENWIJZERZIN]
[Afbeelding: Een hoek α = -40° met een pijl in wijzerzin. Onderschrift: WIJZERZIN]

Een georiënteerde hoek heeft oneindig veel waarden.
Als α een waarde is van de hoek A, dan zijn α + k · 360° (met k ∈ ℤ) alle waarden voor die hoek.

[Afbeelding: Een hoek α = +40°.]
α = +40°

[Afbeelding: Een hoek α = -320°, getekend met een pijl in wijzerzin die bijna een volledige cirkel maakt.]
α = -320°
= 40° - 1 · 360°

[Afbeelding: Een hoek α = 760°, getekend met een pijl in tegenwijzerzin die twee volledige cirkels maakt en dan stopt bij dezelfde hoek.]
α = 760°
= 40° + 2 · 360°

We spreken af dat we bij voorkeur werken met de hoofdwaarde van een hoek.

**definitie**
α is de **hoofdwaarde** van een hoek A, als α ∈ ]-180°, 180°].

**Voorbeelden**
Â = -200° → De hoofdwaarde is α = 160°.
B̂ = 280° → De hoofdwaarde is β = -80°.
Ĉ = 810° → De hoofdwaarde is γ = 90°.

**Merk op**
Bij een gestrekte hoek is -180° geen hoofdwaarde, 180° is dat wel.
[Afbeelding: Een gestrekte hoek A, waarbij de hoek met een pijl bovenaan de as +180° aanduidt.]

--- PAGE 5 ---
## 1.2 De goniometrische cirkel

**definitie**
Een **goniometrische cirkel** is een cirkel met als middelpunt O, de oorsprong van een cartesiaans assenstelsel, en met straal 1 (de eenheid).

De x-as en de y-as verdelen deze cirkel in vier gebieden, **kwadranten** genoemd.

[Afbeelding: De goniometrische cirkel in een assenstelsel. De kwadranten zijn aangeduid met Romeinse cijfers: I (rechtsboven), II (linksboven), III (linksonder), IV (rechtsonder).]

**Merk op**
Kwadranten worden met Romeinse cijfers aangeduid.

## 1.3 Het beeldpunt van een hoek op de goniometrische cirkel

Elke georiënteerde hoek K kunnen we voorstellen door zijn representant op de goniometrische cirkel met hoekpunt O en het eerste been op de positieve x-as. Het tweede been heeft precies 1 snijpunt met de goniometrische cirkel. We noemen dat punt het beeldpunt van de hoek op de goniometrische cirkel.

[Afbeelding: Een georiënteerde hoek α met hoekpunt K. Het eerste been ligt horizontaal.]

**Stappenplan**
1) Het hoekpunt van de representant van K valt samen met het middelpunt van de goniometrische cirkel, de oorsprong O. Teken het eerste been op de positieve x-as.
[Afbeelding: De goniometrische cirkel. De positieve x-as is rood gekleurd en aangeduid met R.]

2) Teken het tweede been zodat RÔA de representant is van K op de goniometrische cirkel (K = RÔA). A is het beeldpunt van de georiënteerde hoek op de goniometrische cirkel.
[Afbeelding: De goniometrische cirkel. Een hoek α is getekend in de cirkel. Het snijpunt met de cirkel is aangeduid als punt A: beeldpunt van α op de goniometrische cirkel.]

--- PAGE 6 ---
## 1.4 Grafische interpretatie van de sinus en cosinus van een hoek

[Afbeelding: Een goniometrische cirkel met een hoek α in het eerste kwadrant. Het snijpunt met de cirkel is A. Een verticale stippellijn gaat van A naar de x-as (snijpunt P), en een horizontale stippellijn gaat van A naar de y-as (snijpunt Q). De x-coördinaat heet 'cos α' en de y-coördinaat heet 'sin α'. De hoek bevindt zich tussen de punten E(1, 0) en E'(0, 1).]

**TIP**
In een rechthoekige driehoek geldt:
sin α = overstaande rechthoekszijde / schuine zijde
cos α = aanliggende rechthoekszijde / schuine zijde

In de rechthoekige driehoek OPA geldt:

cos α = |OP| / |OA| = |OP| / 1 = |OP|

sin α = |AP| / |OA| = |AP| / 1 = |AP|

We bepalen de coördinaatgetallen van A.

x_A = |OP| = cos α
y_A = |PA| = |OQ| = sin α

**definities**
- De **cosinus van een hoek** is het eerste coördinaatgetal van het beeldpunt van die hoek op de goniometrische cirkel.
- De **sinus van een hoek** is het tweede coördinaatgetal van het beeldpunt van die hoek op de goniometrische cirkel.

**Besluit**
Als A het beeldpunt is van een georiënteerde hoek α op de goniometrische cirkel, dan is co(A) = (cos α, sin α).

--- PAGE 7 ---
Als we het punt A de cirkel laten overlopen, merken we op dat de sinus en de cosinus waarden kunnen aannemen van -1 tot en met 1.

[Afbeelding: Een goniometrische cirkel met het punt A in het EERSTE kwadrant. cos α is de x-coördinaat (P), sin α is de y-coördinaat (Q).]

[Afbeelding: Een goniometrische cirkel met het punt A in het TWEEDE kwadrant. cos α is negatief, sin α is positief.]

[Afbeelding: Een goniometrische cirkel met het punt A in het DERDE kwadrant. cos α is negatief, sin α is negatief.]

[Afbeelding: Een goniometrische cirkel met het punt A in het VIERDE kwadrant. cos α is positief, sin α is negatief.]

| α | 0° | I | 90° | II | 180° | III | 270° | IV | 360° |
|---|---|---|---|---|---|---|---|---|---|
| cos α | 1 | + | 0 | - | -1 | - | 0 | + | 1 |
| sin α | 0 | + | 1 | + | 0 | - | -1 | - | 0 |

--- PAGE 8 ---
## 1.5 Grafische interpretatie van de tangens en cotangens van een hoek

**definitie**
IN WOORDEN
De **tangens van een hoek α** is het quotiënt van de sinus van die hoek α en de cosinus van die hoek α.

IN SYMBOLEN
tan α = sin α / cos α met cos α ≠ 0

**definitie**
IN WOORDEN
De **cotangens van een hoek α** is het quotiënt van de cosinus van die hoek α en de sinus van die hoek α.

IN SYMBOLEN
cot α = cos α / sin α met sin α ≠ 0
cot α = 1 / tan α met tan α ≠ 0

**Merk op**
In een rechthoekige driehoek geldt:

tan α = overstaande rechthoekszijde / aanliggende rechthoekszijde = a / b

en

sin α = a / c en cos α = b / c

tan α = sin α / cos α = (a / c) / (b / c) = a / b

[Afbeelding: Een rechthoekige driehoek ABC met rechte hoek in C. Hoek A is α. De rechthoekszijden zijn 'a' en 'b', de schuine zijde is 'c'.]

**A) Grafische interpretatie van de tangens van een hoek**

Teken de **raaklijn** aan de goniometrische cirkel in het punt E(1, 0), dit is de rechte met vergelijking x = 1.
Het snijpunt van deze raaklijn met het tweede been van de georiënteerde hoek α noemen we K.

Driehoek OEK is rechthoekig in E.

tan α = overstaande rechthoekszijde / aanliggende rechthoekszijde
= |EK| / |OE|
= |EK| / 1
= |EK|

waaruit volgt:
co(K) = (1, tan α)

[Afbeelding: Een goniometrische cirkel met een raaklijn in E(1, 0). Een hoek α is getekend. Het snijpunt met de cirkel is A, en de verlenging van het hoekbeen snijdt de raaklijn in K. Het lijnstuk EK stelt tan α voor.]

--- PAGE 9 ---
**Merk op**
Een raaklijn aan een cirkel is een rechte die met een cirkel precies 1 punt, het raakpunt, gemeenschappelijk heeft. Een raaklijn aan een cirkel staat loodrecht op de middellijn door het raakpunt.

**B) Grafische interpretatie van de cotangens van een hoek**

Teken de **raaklijn** aan de goniometrische cirkel in het punt E'(0, 1), dit is de rechte met vergelijking y = 1. Het snijpunt van deze raaklijn met het tweede been van de georiënteerde hoek α noemen we L.

Driehoek OE'L is rechthoekig in E' en E'L̂O = α want de verwisselende binnenhoeken zijn even groot (E'L // x, snijlijn OL).

tan(E'L̂O) = tan α

tan α = overstaande rechthoekszijde / aanliggende rechthoekszijde
tan α = |OE'| / |E'L|
tan α = 1 / |E'L|

zodat:
1 / tan α = |E'L| of cot α = |E'L|

waaruit volgt:
co(L) = (cot α, 1)

[Afbeelding: Een goniometrische cirkel met een raaklijn y = 1 bovenaan de cirkel. Een hoek α is getekend. Het snijpunt met de cirkel is A, het snijpunt met de raaklijn y=1 is L. Het lijnstuk E'L stelt cot α voor.]

**C) Verband tussen de richtingscoëfficiënt van een rechte en de hoek die de rechte vormt met de x-as**

De vergelijking van de rechte door de oorsprong O(0, 0) en A(cos α, sin α) is:

**Benadering 1**
O(0, 0) en A(cos α, sin α)
OA ↔ y - y_1 = (y_2 - y_1) / (x_2 - x_1) (x - x_1)
OA ↔ y = (sin α) / (cos α) x
OA ↔ y = tan α · x
└ richtingscoëfficiënt van de rechte OA

**Benadering 2**
OA = OT (een rechte door de oorsprong)
De vergelijking van een rechte door de oorsprong is van de vorm:
y = a · x
└ de helling of de richtingscoëfficiënt van OA
a = ∆y / ∆x = (sin α) / (cos α)
of
a = ∆y / ∆x = (tan α) / 1 = tan α

α is de hellingshoek en tan α (= a) de helling van de rechte OA.

[Afbeelding: Een rechte door de oorsprong O en de punten A(cos α, sin α) en T(1, tan α). Een driehoek illustreert ∆x = cos α en ∆y = sin α voor punt A.]

--- PAGE 10 ---
## 1.6 Grafische interpretatie van goniometrische getallen samengevat

Als we het punt A de cirkel laten doorlopen, kunnen we het teken van de tangens en cotangens en de waarde ervan bij enkele bijzondere hoeken bepalen.

[Afbeelding: Een goniometrische cirkel met punt A in het EERSTE kwadrant. De raaklijnen x=1 en y=1 zijn getekend. De snijpunten met de verlengde hoek zijn respectievelijk K (tan α, positief) en L (cot α, positief).]

[Afbeelding: Een goniometrische cirkel met punt A in het TWEEDE kwadrant. De verlengde hoek snijdt de raaklijn y=1 in L (cot α, negatief). Om de raaklijn x=1 te snijden in K moet het been in de tegengestelde richting verlengd worden (tan α, negatief).]

[Afbeelding: Een goniometrische cirkel met punt A in het DERDE kwadrant. Het hoekbeen moet verlengd worden in de tegenovergestelde richting om de raaklijnen x=1 (K, tan α positief) en y=1 (L, cot α positief) te snijden.]

[Afbeelding: Een goniometrische cirkel met punt A in het VIERDE kwadrant. De verlengde hoek snijdt de raaklijn x=1 in K (tan α, negatief) en om de raaklijn y=1 te snijden in L moet het been in de tegenovergestelde richting verlengd worden (cot α, negatief).]

| α | 0° | I | 90° | II | 180° | III | 270° | IV | 360° |
|---|---|---|---|---|---|---|---|---|---|
| cos α | 1 | + | 0 | - | -1 | - | 0 | + | 1 |
| sin α | 0 | + | 1 | + | 0 | - | -1 | - | 0 |
| tan α | 0 | + | ∉ ℝ | - | 0 | + | ∉ ℝ | - | 0 |
| cot α | ∉ ℝ | + | 0 | - | ∉ ℝ | + | 0 | - | ∉ ℝ |

--- PAGE 11 ---
# Verwerkingsopdrachten 1, 2

**1** Bepaal de hoofdwaarde van de georiënteerde hoek.

| GEORIËNTEERDE HOEK | HOOFDWAARDE VAN DE GEORIËNTEERDE HOEK |
|---|---|
| Â = 340° | Â = -20° |
| B̂ = -210° | B̂ = 150° |
| Ĉ = 970° | Ĉ = -110° |
| D̂ = -315° | D̂ = 45° |

**2** Teken het beeldpunt van P̂ op de goniometrische cirkel.

a) P̂ = 75°
[Afbeelding: Een goniometrische cirkel met een hoek van 75° getekend in het eerste kwadrant (tegenwijzerzin).]

b) P̂ = 200°
[Afbeelding: Een goniometrische cirkel met een hoek van 200° getekend. Deze ligt in het derde kwadrant (voorbij de x-as), aangeduid in rood in tegenwijzerzin.]

**3** Bepaal de coördinaat van de beeldpunten van de georiënteerde hoeken op de goniometrische cirkel en reken uit.

a)
[Afbeelding: Een goniometrische cirkel met een hoek van 55° in het eerste kwadrant.]
co(A) = (cos 55°, sin 55°)
= (0,57358; 0,81915)

b)
[Afbeelding: Een goniometrische cirkel met een hoek van 200° in het derde kwadrant.]
co(A) = (cos 200°, sin 200°)
= (-0,93969; -0,34202)

--- PAGE 12 ---
**4**
a) Teken een goniometrische cirkel.
b) Teken in de goniometrische cirkel een representant van de georiënteerde hoek Â = 125°.
c) Stel de sinus, cosinus, tangens en cotangens van de gegeven georiënteerde hoek grafisch voor.

[Afbeelding: Een goniometrische cirkel. Een hoek van 125° is getekend (in het tweede kwadrant). Punt A ligt op de cirkel. Een horizontale stippellijn naar y-as geeft de sin α aan, een verticale stippellijn naar de x-as geeft cos α aan. De raaklijn aan E(1,0) (x=1) wordt naar beneden gesneden door de verlenging van hoekbeen (tan α). De raaklijn y=1 wordt bovenaan gesneden (cot α).]

**5** Teken in de goniometrische cirkel het beeldpunt van een representant van de georiënteerde hoek α waarbij cos α = 0,4 en α ∈ IV.

[Afbeelding: Een goniometrische cirkel. Punt B is getekend in het vierde kwadrant. De hoek β is 293,56° (of een andere negatieve/positieve waarde die hieraan gelijk is). De coördinaten van B zijn (0,4; -0,92).]

**6** Omkring de kwadranten waarin de sinus en de cosinus hetzelfde toestandsteken hebben.

KWADRANT I (omcirkeld)
KWADRANT II
KWADRANT III (omcirkeld)
KWADRANT IV

**7** De rechte r gaat door de oorsprong en maakt een hoek van 120° met de x-as. Geef een vereenvoudigde cartesiaanse vergelijking van de rechte r.

r ↔ y = tan α · x
r ↔ y = tan 120° · x
r ↔ y = -√3x

--- PAGE 13 ---
# 2 Toepassingen

## 2.1 De hoofdeigenschap van de goniometrie

Gegeven is een hoek α gelegen in het eerste kwadrant.

[Afbeelding: Goniometrische cirkel met hoek α in kwadrant I en rechthoekige driehoek OPA.]

In de rechthoekige driehoek OPA geldt:
|OP|² + |PA|² = |OA|²
⇕
cos² α + sin² α = 1

We nemen een hoek α uit het tweede kwadrant.
In de rechthoekige driehoek OPA geldt:
|OP|² + |PA|² = |OA|²
⇕
(|cos α|)² + sin² α = 1
⇕
cos² α + sin² α = 1

[Afbeelding: Goniometrische cirkel met hoek α in kwadrant II en rechthoekige driehoek OPA.]

Op een analoge manier kan je aantonen dat deze formule geldt voor alle georiënteerde hoeken. Dit is de **hoofdeigenschap of grondformule van de goniometrie**.

**eigenschap**
cos² α + sin² α = 1

## 2.2 Goniometrische getallen van een hoek berekenen

Gegeven is een hoek α gelegen in het tweede kwadrant waarvoor sin α = 8/17. Bereken de drie overige goniometrische getallen cos α, tan α en cot α zonder eerst α te berekenen.

**Oplossing**
Gegeven: sin α = 8/17 en α ∈ II

cos² α + sin² α = 1
cos² α = 1 - sin² α
cos² α = 1 - (8/17)²
cos² α = 225/289
cos α = 15/17 ∨ cos α = -15/17
cos α = -15/17 want α ∈ II, dus cos α < 0

Nu je ook cos α kent, kun je tan α en cot α berekenen.
tan α = sin α / cos α = (8/17) / (-15/17) = -8/15
cot α = 1 / tan α = -15/8

--- PAGE 14 ---
## 2.3 Goniometrische getallen van bijzondere hoeken

**Toepassing 1**
Bepaal de goniometrische getallen van een hoek van 45°.

**Oplossing**
Teken in de goniometrische cirkel een representant voor Â = 45°.
Driehoek OPA is rechthoekig in P en gelijkbenig want de basishoeken Ô en Â zijn gelijk aan 45°.

[Afbeelding: Goniometrische cirkel. Hoek α = 45° in kwadrant I, waarmee een gelijkbenige rechthoekige driehoek OPA is gevormd.]

Dus: |OP| = |PA|
⇓
cos 45° = sin 45° (1)

We noteren de hoofdformule:
cos² 45° + sin² 45° = 1
⇓ (1)
2 cos² 45° = 1
⇓
cos² 45° = 1/2
⇓
cos 45° = √(1/2) = √2 / 2 (45° ∈ I, dus cos 45° > 0)

**Besluit**
sin 45° = cos 45° = √2 / 2
tan 45° = sin 45° / cos 45° = (√2 / 2) / (√2 / 2) = 1
cot 45° = 1 / tan 45° = 1 / 1 = 1

**Toepassing 2**
Bepaal de goniometrische getallen van een hoek van 60° en 30°.

**Oplossing**
Teken in de goniometrische cirkel een representant voor α = 60°.
Driehoek OEA is gelijkbenig want |OE| = |OA| = 1.
Driekhoek OEA is gelijkzijdig want Ô = Â = Ê = 60°.

[Afbeelding: Goniometrische cirkel. Hoek α = 60° vormt samen met het punt E(1,0) een gelijkzijdig driehoek OEA. De loodlijn van A naar de x-as valt perfect in het midden van O en E op 1/2.]

In een gelijkbenige driehoek is de hoogtelijn op [OE] ook de zwaartelijn en de bissectrice uit A.
Dus: |OP| = 1/2 |OE|
⇓
|OP| = 1/2
⇓
cos 60° = 1/2

--- PAGE 15 ---
We noteren de grondformule:
cos² 60° + sin² 60° = 1
⇓
sin² 60° = 1 - cos² 60°
⇓
sin² 60° = 1 - 1/4
⇓
sin² 60° = 3/4
⇓
sin 60° = √3 / 2

**Besluit**
sin 60° = √3 / 2
cos 60° = 1/2
tan 60° = sin 60° / cos 60° = (√3 / 2) / (1 / 2) = √3
cot 60° = 1 / tan 60° = 1 / √3 = √3 / 3

Â_1 = 30° en ∆OAP is rechthoekig.
|OP| = 1/2

sin 30° = |OP| / |OA| = (1 / 2) / 1 = 1/2
cos 30° = |AP| / |OA| = (√3 / 2) / 1 = √3 / 2
tan 30° = (1 / 2) / (√3 / 2) = 1 / √3 = √3 / 3
cot 30° = 1 / tan 30° = 1 / (√3 / 3) = √3

**Merk op**
In het onderdeel over verwante hoeken zul je een link leggen tussen de goniometrische getallen van complementaire hoeken.

## 2.4 Hellingshoek van een rechte

Bepaal de vergelijking van de rechte r door het punt P(2, 3) die een hoek maakt van 60° met de positieve x-as.
(Werk tot op drie decimalen nauwkeurig.)

**Oplossing**
[Afbeelding: Een assenstelsel met een rechte r die door het punt P(2, 3) gaat en een hellingshoek α = 60° heeft met de x-as.]
a_r = tan 60° = √3
r ↔ y - y_P = a(x - x_P)
r ↔ y - 3 = √3(x - 2)
r ↔ y = √3x - 2√3 + 3

**Merk op**
We werken met exacte waarden.

--- PAGE 16 ---
## 2.5 Identiteiten

a) Toon volgende gelijkheid aan voor elke α waarvoor beide leden zinvol zijn:
tan α + cot α = 1 / (cos α · sin α)

**Oplossing**
We starten met het linkerlid (LL).
LL = tan α + cot α
= sin α / cos α + cos α / sin α
= (sin² α + cos² α) / (cos α · sin α)
= 1 / (cos α · sin α)
= RL

b) Toon volgende gelijkheid aan voor elke α waarvoor beide leden zinvol zijn:
cos⁴ α - sin⁴ α = 1 - 2sin² α

**Oplossing**
We starten met het linkerlid (LL).
LL = cos⁴ α - sin⁴ α
= (cos² α - sin² α) (cos² α + sin² α) (a² - b² = (a+b)(a-b))
= (cos² α - sin² α) · 1 (grondformule)
= cos² α - sin² α
= (1 - sin² α) - sin² α
= 1 - 2 sin² α
= RL

# Verwerkingsopdrachten 3, 4, 5

**8** Bereken de gevraagde goniometrische getallen zonder eerst de hoek α te berekenen.

**TIP**
1 + tan² α = (cos² α / cos² α) + (sin² α / cos² α) = 1 / cos² α

a) Gegeven: α ∈ IV, cos α = 7/25
Gevraagd: sin α, tan α, cot α

sin² α + cos² α = 1
⇒ sin² α = 1 - cos² α
⇒ sin² α = 1 - (7/25)²
⇒ sin² α = 576/625
⇒ sin α = -24/25 (α ∈ IV)

tan α = sin α / cos α = (-24/25) / (7/25) = -24/7
cot α = 1 / tan α = -7/24

b) Gegeven: α ∈ III, tan α = 45/28
Gevraagd: sin α, cos α, cot α

1 + tan² α = (cos² α / cos² α) + (sin² α / cos² α) = 1 / cos² α
⇒ cos² α = 1 / (1 + tan² α)
⇒ cos² α = 1 / (1 + (45/28)²)
⇒ cos² α = 784/2809
⇒ cos α = -28/53 (α ∈ III)

cot α = 1 / tan α = 28/45
sin α = tan α · cos α = (45/28) · (-28/53) = -45/53

--- PAGE 17 ---
**9** Reken uit zonder gebruik te maken van ICT.

a) Vervolledig de tabel.

| α | 0° | 30° | 45° | 60° | 90° |
|---|---|---|---|---|---|
| sin α | 0 | 1/2 | √2 / 2 | √3 / 2 | 1 |
| cos α | 1 | √3 / 2 | √2 / 2 | 1/2 | 0 |
| tan α | 0 | √3 / 3 | 1 | √3 | ∉ ℝ |
| cot α | ∉ ℝ | √3 | 1 | √3 / 3 | 0 |

b) Reken uit het hoofd:

2 · sin 30° = 2 · 1/2 = 1

sin 45° + cos 45° = √2 / 2 + √2 / 2 = 2√2 / 2 = √2

cot 30° - 3 tan 30° = √3 - 3 · √3 / 3 = 0

tan 45° · sin 30° - sin 45° · cos 45° = (1 · 1/2) - (√2 / 2 · √2 / 2) = 1/2 - 2/4 = 0

**10** Bepaal de vergelijking van de rechte r door het punt P(-3, 4) die een hoek maakt van 135° met de positieve x-as.

a = tan α = tan 135° = -1

r ↔ y - 4 = -1(x + 3)
r ↔ y = -x - 3 + 4
r ↔ y = -x + 1

--- PAGE 18 ---
**11** Toon volgende gelijkheden aan voor elke α waarvoor beide leden zinvol zijn:

a) cos α - cos³ α = cos α · sin² α

LL = cos α - cos³ α
= cos α(1 - cos² α)
= cos α · sin² α = RL

b) tan² α / (1 + tan² α) = sin² α

LL = tan² α / (1 + tan² α)
= (tan² α · cos² α) / ((1 + tan² α) · cos² α)
= sin² α / (cos² α + sin² α)
= sin² α = RL

c) 1 / (1 - cos α) + 1 / (1 + cos α) = 2 / sin² α

LL = 1 / (1 - cos α) + 1 / (1 + cos α)
= (1 + cos α + 1 - cos α) / ((1 - cos α)(1 + cos α))
= 2 / (1 - cos² α)
= 2 / sin² α = RL

--- PAGE 19 ---
# 3 Goniometrische getallen van verwante hoeken

## 3.1 Gelijkwaardige of gelijke hoeken

Teken in een goniometrische cirkel het beeldpunt van volgende hoeken:
α₁ = 35°
α₂ = 395°
α₃ = 755°
α₄ = -325°
Blijkbaar hebben al deze hoeken hetzelfde beeldpunt op de goniometrische cirkel.

[Afbeelding: Een goniometrische cirkel met een hoek van α = 35°.]

**definitie**
IN WOORDEN
**Gelijkwaardige of gelijke hoeken** zijn hoeken met eenzelfde beeldpunt op de goniometrische cirkel.

IN SYMBOLEN
β is gelijkwaardig met α ⇔ β = α + k · 360° (met k ∈ ℤ)

Omdat gelijkwaardige hoeken hetzelfde beeldpunt op de goniometrische cirkel hebben, hebben gelijkwaardige hoeken dezelfde goniometrische getallen.

**formules**
sin (α + k · 360°) = sin α (met k ∈ ℤ)
cos (α + k · 360°) = cos α (met k ∈ ℤ)
tan (α + k · 360°) = tan α (met k ∈ ℤ)
cot (α + k · 360°) = cot α (met k ∈ ℤ)

**Voorbeelden**
sin 375° = sin 15°
cos (-50°) = cos 310°
tan 820° = tan 100°
cot 456° = cot 96°

--- PAGE 20 ---
## 3.2 Tegengestelde hoeken

**definitie**
IN WOORDEN
**Tegengestelde hoeken** zijn hoeken waarvan de som 0° is.

IN SYMBOLEN
α en β zijn tegengesteld ⇔ β = -α

A is het beeldpunt van de hoek α op de goniometrische cirkel, A' is het beeldpunt van de hoek β = -α op de goniometrische cirkel.

[Afbeelding: Een goniometrische cirkel. Hoek α = 35° is naar boven getekend (punt A), en hoek β = -35° is naar beneden getekend (punt A'). Ze zijn symmetrisch t.o.v. de x-as.]

**Merk op**
- Positieve hoeken worden steeds in tegenwijzerzin getekend en negatieve hoeken in wijzerzin.
- Tegengestelde hoeken hebben beeldpunten die symmetrisch liggen t.o.v. de x-as.

In ∆OPA en ∆OP'A' geldt:
|OA| = |OA'| = 1
P̂ = P̂' = 90°
A'ÔP' = |-β| = α = AÔP
⇒ ∆OPA ≅ ∆OP'A' (def. congruente driehoeken)
⇓
|P'A'| = |PA| ∧ |OP'| = |OP|
⇓
|OQ'| = |OQ| ∧ |OP'| = |OP|
⇓
-sin(-α) = sin α ∧ cos(-α) = cos α
⇓
sin(-α) = -sin α ∧ cos(-α) = cos α

**Bijgevolg:**
tan(-α) = sin(-α) / cos(-α) = -sin α / cos α = -tan α
cot(-α) = cos(-α) / sin(-α) = cos α / -sin α = -cot α

**Besluit**
**formules**
sin (-α) = -sin α
cos (-α) = cos α
tan (-α) = -tan α
cot (-α) = -cot α

**Voorbeelden**
sin(-30°) = -sin 30°
cos(-120°) = cos 120°
tan 77° = -tan(-77°)
cot(-128°) = -cot 128°

--- PAGE 21 ---
## 3.3 Supplementaire hoeken

**definitie**
IN WOORDEN
**Supplementaire hoeken** zijn hoeken waarvan de som 180° is.

IN SYMBOLEN
α en β zijn supplementair ⇔ α + β = 180°
⇔ β = 180° - α

A is het beeldpunt van de hoek α op de goniometrische cirkel, A' is het beeldpunt van de hoek β = 180° - α op de goniometrische cirkel.

[Afbeelding: Goniometrische cirkel. Hoek α = 35° is punt A in het eerste kwadrant. Hoek β = 145° is punt A' in het tweede kwadrant. Ze zijn elkaars spiegelbeeld t.o.v. de y-as.]

**Merk op**
Supplementaire hoeken hebben beeldpunten die symmetrisch liggen t.o.v. de y-as.

In ∆OPA en ∆OP'A' geldt:
|OA| = |OA'| = 1
P̂ = P̂' = 90°
A'ÔP' = 180° - β = 180° - (180° - α) = α = AÔP
⇒ ∆OPA ≅ ∆OP'A' (def. congruente driehoeken)
⇓
|P'A'| = |PA| ∧ |OP'| = |OP|
⇓
|OQ'| = |OQ| ∧ |OP'| = |OP|
⇓
sin(180° - α) = sin α ∧ -cos(180° - α) = cos α
⇓
sin(180° - α) = sin α ∧ cos(180° - α) = -cos α

**Bijgevolg:**
tan(180° - α) = sin(180° - α) / cos(180° - α) = sin α / -cos α = -tan α
cot(180° - α) = cos(180° - α) / sin(180° - α) = -cos α / sin α = -cot α

**Besluit**
**formules**
sin (180° - α) = sin α
cos (180° - α) = -cos α
tan (180° - α) = -tan α
cot (180° - α) = -cot α

**Voorbeelden**
sin 170° = sin 10°
cos 65° = -cos 115°
tan 105° = -tan 75°
cot 17° = -cot 163°

--- PAGE 22 ---
## 3.4 Antisupplementaire hoeken

**definitie**
IN WOORDEN
**Antisupplementaire hoeken** zijn hoeken waarvan het verschil 180° is.

IN SYMBOLEN
α en β zijn antisupplementair ⇔ β - α = 180°
⇔ β = 180° + α

A is het beeldpunt van de hoek α op de goniometrische cirkel, A' is het beeldpunt van de hoek β = 180° + α op de goniometrische cirkel.

[Afbeelding: Goniometrische cirkel. Hoek α = 35° (punt A, kwadrant I). Hoek β = 215° (punt A', kwadrant III). Ze zijn elkaars spiegelbeeld t.o.v. de oorsprong O.]

**Merk op**
Antisupplementaire hoeken hebben beeldpunten die symmetrisch liggen t.o.v. de oorsprong.

In ∆OPA en ∆OP'A' geldt:
|OA| = |OA'| = 1
P̂ = P̂' = 90°
A'ÔP' = β - 180° = (180° + α) - 180° = α = AÔP
⇒ ∆OPA ≅ ∆OP'A' (def. congruente driehoeken)
⇓
|A'P'| = |AP| ∧ |OP'| = |OP|
⇓
|OQ'| = |OQ| ∧ |OP'| = |OP|
⇓
-sin(180° + α) = sin α ∧ -cos(180° + α) = cos α
⇓
sin(180° + α) = -sin α ∧ cos(180° + α) = -cos α

**Bijgevolg:**
tan(180° + α) = sin(180° + α) / cos(180° + α) = -sin α / -cos α = tan α
cot(180° + α) = cos(180° + α) / sin(180° + α) = -cos α / -sin α = cot α

**Besluit**
**formules**
sin (180° + α) = -sin α
cos (180° + α) = -cos α
tan (180° + α) = tan α
cot (180° + α) = cot α

**Voorbeelden**
sin 200° = -sin 20°
cos 240° = -cos 60°
tan 300° = tan 120°
cot 190° = cot 10°

--- PAGE 23 ---
## 3.5 Complementaire hoeken

**definitie**
IN WOORDEN
**Complementaire hoeken** zijn hoeken waarvan de som 90° is.

IN SYMBOLEN
α en β zijn complementair ⇔ α + β = 90°
⇔ β = 90° - α

A is het beeldpunt van de hoek α op de goniometrische cirkel, A' is het beeldpunt van de hoek β = 90° - α op de goniometrische cirkel.

[Afbeelding: Goniometrische cirkel. Hoek α = 35° en hoek β = 55° (samen 90°). Hun beeldpunten liggen symmetrisch ten opzichte van de eerste bissectrice y = x.]

**Merk op**
Complementaire hoeken hebben beeldpunten die symmetrisch liggen t.o.v. de eerste bissectrice, dit is de rechte met vergelijking y = x.

In ∆OPA en ∆OQ'A' geldt:
|OA| = |OA'| = 1
P̂ = Q̂' = 90°
A'ÔQ' = 90° - β = 90 - (90° - α) = α = AÔP
⇒ ∆OPA ≅ ∆OQ'A' (def. congruente driehoeken)
⇓
|OQ'| = |OP| ∧ |Q'A'| = |PA|
⇓
|OQ'| = |OP| ∧ |OP'| = |OQ|
⇓
sin(90° - α) = cos α ∧ cos(90° - α) = sin α

**Bijgevolg:**
tan(90° - α) = sin(90° - α) / cos(90° - α) = cos α / sin α = cot α
cot(90° - α) = cos(90° - α) / sin(90° - α) = sin α / cos α = tan α

**Besluit**
**formules**
sin (90° - α) = cos α
cos (90° - α) = sin α
tan (90° - α) = cot α
cot (90° - α) = tan α

**Voorbeelden**
sin 40° = cos 50°
tan 63° = cot 27°

--- PAGE 24 ---
## 3.6 Anticomplementaire hoeken

**definitie**
IN WOORDEN
**Anticomplementaire hoeken** zijn hoeken waarvan het verschil 90° is.

IN SYMBOLEN
α en β zijn anticomplementair ⇔ β - α = 90°
⇔ β = 90° + α

A is het beeldpunt van de hoek α op de goniometrische cirkel, A' is het beeldpunt van de hoek β = 90° + α op de goniometrische cirkel.

[Afbeelding: Goniometrische cirkel. Hoek α = 35° (punt A). Hoek β = 125° (punt A'). Hoek A en A' staan op een hoek van 90° van elkaar.]

In ∆OPA en ∆OQ'A' geldt:
|OA| = |OA'| = 1
P̂ = Q̂' = 90°
A'ÔQ' = 90° + α - 90° = α = AÔP
⇒ ∆OPA ≅ ∆OQ'A' (def. congruente driehoeken)
⇓
|OQ'| = |OP| ∧ |Q'A'| = |PA|
⇓
|OQ'| = |OP| ∧ |OP'| = |OQ|
⇓
sin(90° + α) = cos α ∧ cos(90° + α) = -sin α

**Bijgevolg:**
tan(90° + α) = sin(90° + α) / cos(90° + α) = cos α / -sin α = -cot α
cot(90° + α) = cos(90° + α) / sin(90° + α) = -sin α / cos α = -tan α

**Besluit**
**formules**
sin (90° + α) = cos α
cos (90° + α) = -sin α
tan (90° + α) = -cot α
cot (90° + α) = -tan α

**Voorbeelden**
cos 140° = -sin 50°
cot 122° = -tan 32°

--- PAGE 25 ---
## 3.7 Samenvatting

| | GELIJKWAARDIGE HOEKEN | TEGENGESTELDE HOEKEN | SUPPLEMENTAIRE HOEKEN | ANTISUPPLEMEN- TAIRE HOEKEN | COMPLEMENTAIRE HOEKEN | ANTICOMPLEMEN- TAIRE HOEKEN |
|---|---|---|---|---|---|---|
| | α + k · 360° | -α | 180° - α | 180° + α | 90° - α | 90° + α |
| sin ... | sin α | -sin α | sin α | -sin α | cos α | cos α |
| cos ... | cos α | cos α | -cos α | -cos α | sin α | -sin α |
| tan ... | tan α | -tan α | -tan α | tan α | cot α | -cot α |
| cot ... | cot α | -cot α | -cot α | cot α | tan α | -tan α |

## 3.8 Toepassingen

**A) Goniometrische getallen van bijzondere hoeken**

Bepaal de goniometrische getallen van een hoek van 150°.

**Oplossing**
150° en 30° zijn supplementaire hoeken, zodat
sin 150° = sin 30° = 1/2
cos 150° = -cos 30° = -√3 / 2
tan 150° = -tan 30° = -√3 / 3
cot 150° = -cot 30° = -√3

[Afbeelding: Goniometrische cirkel. Hoek α = 150° is getekend. Punten P en Q, cot α en tan α zijn aangeduid.]

Bepaal de goniometrische getallen van een hoek van 210°.

**Oplossing**
210° = 180° - (-30°)
210° en -30° zijn supplementaire hoeken, zodat
sin 210° = sin(-30°) = -sin 30° = -1/2
cos 210° = -cos(-30°) = -cos 30° = -√3 / 2
tan 210° = -tan(-30°) = tan 30° = √3 / 3
cot 210° = -cot(-30°) = cot 30° = √3

[Afbeelding: Goniometrische cirkel. Hoek α = 210° is getekend.]

**Merk op**
Je kon ook de formules voor antisupplementaire hoeken gebruiken.

--- PAGE 26 ---
**B) Toepassing 2**

Vereenvoudig volgende uitdrukking zo ver mogelijk.
(sin(180° - α) · cos(180° + α) · tan(360° - α)) / (tan(90° - α) · cot(270° - α)) + (sin(900° - α) · cos(540° - α)) / (cos(90° + α) · cos(α - 180°))

**Oplossing**
sin(180° - α) = sin α (supplementaire hoeken)
cos(180° + α) = -cos α (antisupplementaire hoeken)
tan(360° - α) = tan(-α) = -tan α (tegengestelde hoeken)
tan(90° - α) = cot α (complementaire hoeken)
cot(270° - α) = cot(180° - (α - 90°))
= -cot(α - 90°) (supplementaire hoeken)
= cot(90° - α) (tegengestelde hoeken)
= tan α (complementaire hoeken)

sin(900° - α) = sin(180° - α) = sin α (supplementaire hoeken)
cos(540° - α) = cos(180° - α) = -cos α (supplementaire hoeken)
cos(90° + α) = -sin α (anticomplementaire hoeken)
cos(α - 180°) = cos(180° - α) (tegengestelde hoeken)
= -cos α (supplementaire hoeken)

zodat

opgave = (sin α · (-cos α) · (-tan α)) / (cot α · tan α) + (-sin α · (-cos α)) / (-sin α · (-cos α))
= (sin α · cos α / (cos α / sin α)) - 1
= sin² α - 1
= -cos² α

--- PAGE 27 ---
# Verwerkingsopdrachten 6, 7, 8

**12** Vul volgende tabel aan.

| | α | TEGENGESTELDE | SUPPLEMENT | COMPLEMENT |
|---|---|---|---|---|
| a | 17° | -17° | 163° | 73° |
| b | 85°20' | -85°20' | 94°40' | 4°40' |
| c | 193° | -193° | -13° | -103° |
| d | 147°35' | -147°35' | 32°25' | -57°35' |
| e | 234° | -234° | -54° | -144° |
| f | -69° | 69° | 249° | 159° |
| g | 180° | -180° | 0° | -90° |
| h | -111°11' | 111°11' | 291°11' | 201°11' |

**13** Gegeven: sin α = 2/5 en cos β = -3/4
Gevraagd:
a) sin(-α) = -sin α = -2/5
b) cos(180° - β) = -cos β = 3/4
c) cos(90° + α) = -sin α = -2/5
d) cos(-β) = cos β = -3/4
e) sin(180° + α) = -sin α = -2/5
f) cos(β + 360°) = cos β = -3/4
g) sin(180° - α) = sin α = 2/5
h) sin(360° - α) = sin(-α) = -sin α = -2/5
i) sin(90° - β) = cos β = -3/4
j) cos(180° + β) = -cos β = 3/4
k) sin(90° + β) = cos β = -3/4
l) cos(90° - α) = sin α = 2/5

--- PAGE 28 ---
**14** Vereenvoudig.
a) sin(180° + α) = -sin α
b) cos(270° - α) = cos(-90° - α) = cos(90° + α) = -sin α
c) tan(540° + α) = tan(180° + α) = tan α
d) cot(720° - α) = cot(-α) = -cot α
e) sin(90° - α) = cos α
f) cos(90° + α) = -sin α

**15** Gegeven: sin α = 5/13 en α ∈ I
Gevraagd: 
a) Bereken de cosinus van de tegengestelde hoek.
b) Bereken de tangens van de supplementaire hoek.
c) Bereken de cotangens van de anticomplementaire hoek.

sin² α + cos² α = 1
⇒ cos² α = 1 - sin² α
⇒ cos² α = 1 - (5/13)²
⇒ cos² α = 144/169
⇒ cos α = 12/13 (α ∈ I)

tan α = sin α / cos α = (5/12)
cot α = 1 / tan α = 12/5

cosinus van de tegengestelde hoek: cos(-α) = cos α = 12/13
tangens van de supplementaire hoek: tan(180° - α) = -tan α = -5/12
cotangens van de complementaire hoek: cot(90° + α) = -tan α = -5/12

--- PAGE 29 ---
**16** Vereenvoudig de volgende uitdrukkingen zo ver mogelijk.
a) (tan(720° - α) · cot(180° - α) · sin(180° + α)) / (cos(-α) · cos(90° - α) · sin(270° + α))

tan(720° - α) = tan(-α) = -tan α
cot(180° - α) = -cot α
sin(180° + α) = -sin α
cos(-α) = cos α
cos(90° - α) = sin α
sin(270° + α) = sin(-90° + α) = -sin(90° - α) = -cos α

(tan(720° - α) · cot(180° - α) · sin(180° + α)) / (cos(-α) · cos(90° - α) · sin(270° + α))
= (-tan α · (-cot α) · (-sin α)) / (cos α · sin α · (-cos α))
= (tan α · cot α) / cos² α
= 1 / cos² α

--- PAGE 30 ---
b) (sin(180° - α) · tan(α - 270°) · sin(α - 360°)) / (cot(1080° - α)) - (cot α · sin(α - 180°) · sin(90° + α)) / (tan(180° - α) · tan(450° + α))

sin(180° - α) = sin α
tan(α - 270°) = tan(90° + α) = -cot α
sin(α - 360°) = sin α
cot(1080° - α) = cot(-α) = -cot α
cot(α) = cot α
sin(α - 180°) = -sin(180° - α) = -sin α
sin(90° + α) = cos(-α) = cos α
tan(180° - α) = -tan α
tan(450° + α) = tan(90° + α) = -cot α

(sin(180° - α) · tan(α - 270°) · sin(α - 360°)) / (cot(1080° - α)) - (cot(α) · sin(α - 180°) · sin(90° + α)) / (tan(180° - α) · tan(450° + α))
= (sin α · (-cot α) · sin α) / (-cot α) - (cot α · (-sin α) · cos α) / (-tan α · (-cot α))
= sin² α + (sin α · cos α) / tan α
= sin² α + cos² α
= 1

--- PAGE 31 ---
# Signaaloefeningen

**1** Teken een goniometrische cirkel (neem als eenheid een straal van 5 cm), teken hierin een georiënteerde hoek van -45° en stel de sinus, cosinus, tangens en cotangens van deze hoek grafisch voor.

[Afbeelding: Een goniometrische cirkel. Een hoek van 315° (gelijk aan -45°) is getekend in het vierde kwadrant. Het snijpunt met de cirkel is A. De projectie op de x-as geeft cos α, projectie op y-as is sin α. Snijpunt met de raaklijn x=1 is (1, tan α) en de raaklijn y=1 is (cot α, 1).]

**2** Tot welk kwadrant behoort α als ...

a) sin α > 0 en cos α < 0? α ∈ II
b) cos α < 0 en tan α > 0? α ∈ III
c) sin α > 0 en tan α > 0? α ∈ I
d) sin α < 0 en cos α > 0? α ∈ IV
e) cos α < 0 en cot α < 0? α ∈ II
f) sin α < 0 en cot α > 0? α ∈ III

>>> Verder oefenen: D1 t.e.m. D15

--- PAGE 32 ---
**3** Bereken de gevraagde goniometrische getallen zonder eerst de hoek α te berekenen.

| GEGEVEN | GEVRAAGD |
|---|---|
| a) α ∈ I, sin α = 35/37 | cos α, tan α, cot α |
| b) α ∈ III, cos α = -16/65 | sin α, tan α, cot α |
| c) α ∈ II, cot α = -55/48 | sin α, cos α, tan α |

a) sin² α + cos² α = 1
⇒ cos² α = 1 - cos² α
⇒ cos² α = 1 - (35/37)²
⇒ cos² α = 144/1369
⇒ cos α = 12/37 (α ∈ I)

tan α = sin α / cos α = 35/12
cot α = 1 / tan α = 12/35

b) sin² α + cos² α = 1
⇒ sin² α = 1 - cos² α
⇒ sin² α = 1 - (-16/65)²
⇒ sin² α = 3969/4225
⇒ sin α = -63/65 (α ∈ III)

tan α = sin α / cos α = 63/16
cot α = 1 / tan α = 16/63

c) tan α = 1 / cot α = -48/55
1 + tan² α = cos² α / cos² α + sin² α / cos² α = 1 / cos² α
⇒ cos² α = 1 / (1 + tan² α)
⇒ cos² α = 1 / (1 + (-48/55)²)
⇒ cos² α = 3025/5329
⇒ cos α = -55/73 (α ∈ II)

sin α = tan α · cos α = -48/55 · (-55/73) = 48/73

>>> Verder oefenen: D16 t.e.m. D25

--- PAGE 33 ---
**4** Toon volgende gelijkheden aan voor elke α waarvoor beide leden zinvol zijn.

a) sin α / (tan α · cos α) = 1

LL = sin α / (tan α · cos α)
= sin α / ((sin α / cos α) · cos α)
= sin α / sin α
= 1 = RL

b) (1 + tan² α)(1 - sin² α) = (1 - cos² α)(1 + cot² α)

(1 + tan² α)(1 - sin² α) = (1 - cos² α)(1 + cot² α)
⇔ (1 + tan² α) · cos² α = sin² α · (1 + cot² α)
⇔ cos² α + sin² α = sin² α + cos² α
⇔ 1 = 1

c) cot α / (cot² α - 1) = (sin α · cos α) / (cos² α - sin² α)

LL = cot α / (cot² α - 1)
= (cot α · sin² α) / ((cot² α - 1) · sin² α)
= (sin α · cos α) / (cos² α - sin² α) = RL

>>> Verder oefenen: D16 t.e.m. D25

--- PAGE 34 ---
**5** Bepaal de vergelijking van de rechte r door het punt P(5, -2) die een hoek maakt van -35° met de positieve x-as. (Werk op drie decimalen nauwkeurig.)

a = tan α = tan(-35°) = -0,700
r ↔ y + 2 = -0,700(x - 5)
r ↔ y = -0,700x + 3,5 - 2
r ↔ y = -0,700x + 1,5

**6** Vereenvoudig.

a) sin(α - 180°) = -sin (180° - α) = -sin α
b) cos(360° - α) = cos(-α) = cos α
c) tan(270° + α) = tan (-90° + α) = -tan (90° - α) = -cot α
d) cot(α - 90°) = -cot (90° - α) = -tan α
e) sin(450° + α) = sin (90° + α) = cos α
f) cos(90° - α) = sin α

>>> Verder oefenen: D16 t.e.m. D25
>>> Verder oefenen: D26 t.e.m. D40

--- PAGE 35 ---
**7** Gegeven: cos α = 24/25 en α ∈ IV
Gevraagd:
a) Bereken de sinus van de tegengestelde hoek.
b) Bereken de tangens van de complementaire hoek.
c) Bereken de cotangens van de supplementaire hoek.

sin² α + cos² α = 1
⇒ sin² α = 1 - cos² α
⇒ sin² α = 1 - (24/25)²
⇒ sin² α = 49/625
⇒ sin α = -7/25 (α ∈ IV)

tan α = sin α / cos α = -7/24
cot α = 1 / tan α = -24/7

sinus van de tegengestelde hoek: sin(-α) = -sin α = 7/25
tangens van de complementaire hoek: tan(90° - α) = cot α = -24/7
cotangens van de supplementaire hoek: cot(180° - α) = -cot α = 24/7

>>> Verder oefenen: D26 t.e.m. D40

--- PAGE 36 ---
**8** Vereenvoudig volgende uitdrukkingen zo ver mogelijk.
a) (tan(270° - α) · sin(540° + α) · cos(900° - α)) / (cos(180° + α) · sin(α - 180°) · tan(90° + α))

tan(270° - α) = tan(-90° - α) = -tan(90° + α) = cot α
sin(540° + α) = sin(180° + α) = -sin α
cos(900° - α) = cos(180° - α) = -cos α
cos(180° + α) = -cos α
sin(α - 180°) = -sin(180° - α) = -sin α
tan(90° + α) = -cot α

(tan(270° - α) · sin(540° + α) · cos(900° - α)) / (cos(180° + α) · sin(α - 180°) · tan(90° + α))
= (cot α · (-sin α) · (-cos α)) / (-cos α · (-sin α) · (-cot α))
= -1

--- PAGE 37 ---
b) (sin (180° + α) · sin (270° - α)) / (cos (540° + α) · sin (720° - α)) - tan (90° - α) · cos (90° + α) · cos (α - 180°)

sin(180° + α) = -sin α
sin(270° - α) = sin(-90° - α) = -sin(90° + α) = -cos α
cos(540° + α) = cos(180° + α) = -cos α
sin(720° - α) = sin(-α) = -sin α
tan(90° - α) = cot α
cos(90° + α) = -sin α
cos(α - 180°) = cos(180° - α) = -cos α

(sin(180° + α) · sin(270° - α)) / (cos(540° + α) · sin(720° - α)) - tan(90° - α) · cos(90° + α) · cos(α - 180°)
= (-sin α · (-cos α)) / (-cos α · (-sin α)) - cot α · (-sin α) · (-cos α)
= 1 - cot α · sin α · cos α
= 1 - cos² α
= sin² α

>>> Verder oefenen: D26 t.e.m. D40

--- PAGE 38 ---
# Differentiatietraject

**1** Bepaal de hoofdwaarde van de georiënteerde hoek.
a) Â = 67°
b) B̂ = 320°
c) Ĉ = -210°
d) D̂ = 760°
e) Ê = -530°
f) F̂ = -1155°

a) Â = 67°
b) B̂ = -40°
c) Ĉ = 150°
d) D̂ = 40°
e) Ê = -170°
f) F̂ = -75°

**2** Kleur de hoeken die hetzelfde beeldpunt op de goniometrische cirkel hebben in eenzelfde kleur.
300° | -60° | -250° | -110° | 290° | 110°
190° | -170° | 250° | 60° | 660° | -70°
*(De kleuren zijn ingevuld volgens de correctiesleutel, o.a. 300° is gelijk aan -60° en 660°, 110° is gelijk aan -250°, 290° is gelijk aan -70°, 190° is gelijk aan -170°)*

**3** a) Geef drie hoeken die hetzelfde beeldpunt hebben op de goniometrische cirkel als het beeldpunt van Â = 72°.
b) Waar of niet waar? Hoeken met dezelfde hoofdwaarde hebben hetzelfde beeldpunt op de goniometrische cirkel.

a) 72°, 432° en 792°
b) waar

**4** Teken in een goniometrische cirkel het beeldpunt van ...
a) Â = 80°, noem het beeldpunt P.
b) B̂ = -150°, noem het beeldpunt Q.
c) Ĉ = 300°, noem het beeldpunt R.

[Afbeelding: Een goniometrische cirkel. Hoek α = 80° (punt P) ligt in kwadrant I. Hoek β = 210° (wat gelijk is aan -150°, punt Q) ligt in kwadrant III. Hoek γ = 300° (punt R) ligt in kwadrant IV.]

--- PAGE 39 ---
**5** Bepaal de coördinaatgetallen van de punten A, B en C op 5 decimalen nauwkeurig.

[Afbeelding: Goniometrische cirkel met drie hoeken. α = EÔA = 24°, β = EÔB = 155°, γ = EÔC = 276°.]
α = EÔA = 24°
β = EÔB = 155°
γ = EÔC = 276°

co(A) = (cos 24°, sin 24°) = (0,91355; 0,40674)
co(B) = (cos 155°, sin 155°) = (-0,90631; 0,42262)
co(C) = (cos 276°, sin 276°) = (0,10453; -0,99452)

**6** Bepaal de coördinaatgetallen van de punten A, K en L op 5 decimalen nauwkeurig.
a) α = EÔA = 140°
[Afbeelding: Goniometrische cirkel met hoek α = 140° in het tweede kwadrant. Het been snijdt de cirkel in A, en de raaklijnen in K en L.]

co(A) = (cos 140°, sin 140°) = (-0,76604; 0,64279)
co(K) = (1, tan 140°) = (1; -0,83910)
co(L) = (cot 140°, 1) = (-1,19175; 1)

b) α = EÔA = 240°
[Afbeelding: Goniometrische cirkel met hoek α = 240° in het derde kwadrant. Het verlengde hoekbeen snijdt de raaklijnen in K en L.]

co(A) = (cos 240°, sin 240°) = (-0,5; -0,86603)
co(K) = (1, tan 240°) = (1; 1,73205)
co(L) = (cot 240°, 1) = (0,57735; 1)

--- PAGE 40 ---
**7** Bereken met ICT op 5 decimalen nauwkeurig.
a) sin (23°17'55'')
b) cos (86°20'30'')
c) tan (40°40'40'')
d) cot (36°12'24'')
e) 3 · sin (25°15'05'')
f) cos (110°35'53'') + 2
g) tan (200°02'20'') + cot (300°03'30'')
h) cos² (185°17'23'')

a) sin (23°17'55'') = 0,39552
b) cos (86°20'30'') = 0,06381
c) tan (40°40'40'') = 0,85946
d) cot (36°12'24'') = 1,36599
e) 3 · sin (25°15'05'') = 1,27977
f) cos (110°02'20'') + 2 = 1,64819
g) tan (200°02'20'') + cot (300°03'30'') = -0,21397
h) cos² (185°17'23'') = 0,99150

**8** Teken een goniometrische cirkel (neem als eenheid een straal van 6 cm), teken hierin een georiënteerde hoek van 150° en stel de sinus, cosinus, tangens en cotangens van deze hoek grafisch voor.

[Afbeelding: Goniometrische cirkel. Hoek 150° is getekend in het tweede kwadrant (punt A). De cos α en sin α zijn geprojecteerd op x- en y-as. Tan α is te vinden door het been door de oorsprong door te trekken tot aan de raaklijn x=1, cot α ligt op de snijlijn met y=1 bovenaan.]

--- PAGE 41 ---
**9** Teken een goniometrische cirkel (neem als eenheid een straal van 6 cm), teken hierin een georiënteerde hoek van 210° en stel de sinus, cosinus, tangens en cotangens van deze hoek grafisch voor.

[Afbeelding: Goniometrische cirkel met hoek 210° in het derde kwadrant (punt A). Projecties tonen sin α en cos α. Verlenging door oorsprong toont tan α en cot α op de raaklijnen, beide positief.]

**10** Bepaal het kwadrant waarin α ligt en bepaal het teken van de cosinus, sinus, tangens en cotangens.

| α | α ∈ ... | cos α | sin α | tan α | cot α |
|---|---|---|---|---|---|
| bv. 170° | II | - | + | - | - |
| a) 290° | IV | + | - | - | - |
| b) 250° | III | - | - | + | + |
| c) 80° | I | + | + | + | + |
| d) -65° | IV | + | - | - | - |
| e) -110° | III | - | - | + | + |
| f) -280° | I | + | + | + | + |
| g) -250° | II | - | + | - | - |

--- PAGE 42 ---
**11** Gegeven: α = 125°45'15'' en β = 195°15'45''
Bereken met ICT op 5 decimalen nauwkeurig.
a) sin (α + β)
b) sin α + sin β
c) cos (2α)
d) 2 · cos α
e) tan (α - β)
f) 3 · tan (2β)
g) cot (β - α)
h) cot (40° + α)

a) sin (α + β) = -0,62909
b) sin α + sin β = 0,54829
c) cos(2α) = -0,31717
d) 2 · cos α = -1,16862
e) tan (α - β) = -2,67581
f) 3 · tan (2β) = 1,76890
g) cot (β - α) = 0,37372
h) cot (40° + α) = -3,93871

**12** Bepaal de hoek die de rechte r maakt met de positieve x-as.
a) r ↔ y = 2x + 3
b) r ↔ y = -4x + 5
c) r ↔ y = x - 7
d) r ↔ y = 8

a) a = 2 = tan α ⇒ α = 63°26'06''
b) a = -4 = tan α ⇒ α = -75°57'50''
c) a = 1 = tan α ⇒ α = 45°
d) a = 0 = tan α ⇒ α = 0°

**13** Bepaal de hoek die de rechte r maakt met de positieve x-as.
a) r ↔ 2x - 5y + 7 = 0
b) r ↔ 3y + 4x - 6 = 0
c) r ↔ 4x + 5y - 11 = 0

a) a = 2/5 = tan α ⇒ α = 21°48'05''
b) a = -4/3 = tan α ⇒ α = -53°07'48''
c) a = -4/5 = tan α ⇒ α = -38°39'35''

--- PAGE 43 ---
**14** Bepaal de hoek die de rechte r (= AB) maakt met de positieve x-as.
a) A(0, 0); B(-2, 7)
b) A(2, 3); B(5, 9)
c) A(-4, -2); B(0, 4)

a) a = (7 - 0) / (-2 - 0) = -7/2 = tan α ⇒ α = -74°03'17''
b) a = (9 - 3) / (5 - 2) = 2 = tan α ⇒ α = 63°26'06''
c) a = (4 + 2) / (0 + 4) = 3/2 = tan α ⇒ α = 56°18'36''

**15** Bepaal de kleinste hoek die de rechten p en q met elkaar maken.
a) p ↔ y = 4x en q ↔ y = √2x - 1
b) p ↔ 10y + 6x = 0 en q ↔ x - y + 3 = 0

a) hoe die p maakt met de positieve x-as
a = 4 = tan α ⇒ α = 75°57'50''
hoek die q maakt met de positieve x-as
a = √2 = tan α ⇒ α = 54°44'08''
hoek tussen p en q
75°57'50'' - 54°44'08'' = 21°13'42''

b) hoek die p maakt met de positieve x-as
a = -3/5 = tan α ⇒ α = -30°57'50''
hoek die q maakt met de positieve x-as
a = 1 = tan α ⇒ α = 45°
hoek tussen p en q
45° - (-30°57'50'') = 75°57'50''

**16** Gegeven: sin α = 8/17 en 0° < α < 90°
a) Noteer de grondformule van de goniometrie.
b) Bepaal cos α met behulp van de grondformule.
c) Bereken tan α.

a) cos² α + sin² α = 1
b) cos² α + sin² α = 1
⇔ cos² α + (8/17)² = 1
⇔ cos² α = 1 - 64/289 = 225/289
⇒ cos α = 15/17 (α ∈ I, cos α > 0)
c) tan α = sin α / cos α = (8/17) / (15/17) = 8/15

--- PAGE 44 ---
**17** Reken uit het hoofd.
a) sin 30°
b) cos 45°
c) tan 60°
d) cot 90°
e) cot 30° + sin 60°
f) 3 cos 60° - 2 tan 45°
g) cos² 30° + sin² 30°
h) cot 60° · tan 30°
i) sin 90° - cos 30°
j) cot 30° / cos 30°

a) sin 30° = 1/2
b) cos 45° = √2 / 2
c) tan 60° = √3
d) cot 90° = 0
e) cot 30° + sin 60° = √3 + √3 / 2 = 3√3 / 2
f) 3 cos 60° - 2 tan 45° = 3 · 1/2 - 2 · 1 = -1/2
g) cos² 30° + sin² 30° = 1
h) cot 60° · tan 30° = (√3 / 3) · (√3 / 3) = 1/3
i) sin 90° - cos 30° = 1 - √3 / 2 = (2 - √3) / 2
j) cot 30° / cos 30° = 1 / sin 30° = 2

**18** Bepaal de vergelijking van de rechte door het punt P die een hoek α maakt met de positieve x-as. Werk op 3 decimalen nauwkeurig.

| | P | α |
|---|---|---|
| a) | P(1, 1) | 66° |
| b) | P(-2, 0) | -45° |
| c) | P(-3, -1) | 150° |
| d) | P(4, -2) | 46°24' |

a) a = tan α = tan 66° = 2,246
r ↔ y - 1 = 2,246(x - 1)
r ↔ y = 2,246x - 1,246

b) a = tan α = tan(-45°) = -1
r ↔ y - 0 = -1(x + 0)
r ↔ y = -x - 2

c) a = tan α = tan 150° = -0,577
r ↔ y + 1 = -0,577(x + 3)
r ↔ y = -0,577x - 2,732

d) a = tan α = tan 46°24' = 1,050
r ↔ y + 2 = 1,050(x - 4)
r ↔ y = 1,050x - 6,200

--- PAGE 45 ---
**19** Bereken de gevraagde goniometrische getallen zonder eerst de hoek α te berekenen.

| | GEGEVEN | GEVRAAGD |
|---|---|---|
| a) | α ∈ I, sin α = 4/5 | cos α, tan α, cot α |
| b) | α ∈ II, cos α = -5/13 | sin α, tan α, cot α |
| c) | α ∈ IV, tan α = -21/20 | sin α, cos α, cot α |
| d) | α ∈ III, cot α = 9/40 | sin α, cos α, tan α |
| e) | α ∈ II, sin α = 11/61 | cos α, tan α, cot α |
| f) | α ∈ IV, cos α = 33/65 | sin α, tan α, cot α |

a) sin² α + cos² α = 1
⇒ cos² α = 1 - cos² α
⇒ cos² α = 1 - (4/5)²
⇒ cos² α = 9/25
⇒ cos α = 3/5 (α ∈ I)
tan α = sin α / cos α = 4/3
cot α = 1 / tan α = 3/4

b) sin² α + cos² α = 1
⇒ sin² α = 1 - cos² α
⇒ sin² α = 1 - (-5/13)²
⇒ sin² α = 144/169
⇒ sin α = 12/13 (α ∈ II)
tan α = sin α / cos α = -12/5
cot α = 1 / tan α = -5/12

c) cot α = 1 / tan α = -20/21
1 + tan² α = cos² α / cos² α + sin² α / cos² α = 1 / cos² α
⇒ cos² α = 1 / (1 + tan² α)
⇒ cos² α = 1 / (1 + (-21/20)²)
⇒ cos² α = 400/841
⇒ cos α = 20/29 (α ∈ IV)
sin α = tan α · cos α = -21/20 · 20/29 = -21/29

d) tan α = 1 / cot α = 40/9
1 + tan² α = cos² α / cos² α + sin² α / cos² α = 1 / cos² α
⇒ cos² α = 1 / (1 + tan² α)
⇒ cos² α = 1 / (1 + (40/9)²)
⇒ cos² α = 81/1681
⇒ cos α = -9/41 (α ∈ III)
sin α = tan α · cos α = 40/9 · (-9/41) = -40/41

e) sin² α + cos² α = 1
⇒ cos² α = 1 - cos² α
⇒ cos² α = 1 - (11/61)²
⇒ cos² α = 3600/3721
⇒ cos α = -60/61 (α ∈ II)
tan α = sin α / cos α = -11/60
cot α = -1 / tan α = -60/11

f) sin² α + cos² α = 1
⇒ sin² α = 1 - cos² α
⇒ sin² α = 1 - (33/65)²
⇒ sin² α = 3136/4225
⇒ sin α = -56/65 (α ∈ IV)
tan α = sin α / cos α = -56/33
cot α = 1 / tan α = -33/56

--- PAGE 46 ---
**20**
a) Bepaal de vergelijking van de rechte r door het punt P(1, 0) die een hoek maakt van 40° met de positieve x-as.
b) Bepaal de vergelijking van de rechte r door het punt P(2, 3) die een hoek maakt van 110° met de positieve x-as.
c) Bepaal de vergelijking van de rechte r door het punt P(3, 4) die een hoek maakt van 90° met de positieve x-as.

a) r ↔ y - 0 = tan 40° · (x - 1)
r ↔ y = 0,83910(x - 1)
r ↔ y = 0,83910x - 0,83910

b) r ↔ y - 3 = tan 110° · (x - 2)
r ↔ y - 3 = -2,74748(x - 2)
r ↔ y = -2,74748x + 8,49496

c) x = 3

**21** Toon volgende gelijkheden aan voor elke α waarvoor beide leden zinvol zijn.
a) cos α / (cos² α + sin² α) = cos α
b) sin α / tan α - cos α = 0
c) sin α · cot α = cos α
d) (1 - sin² α) · tan² α = sin² α
e) 2 - sin² α = 1 + cos² α

a) LL = cos α / (cos² α + sin² α)
= cos α / 1
= cos α = RL

b) LL = sin α / tan α - cos α
= sin α / (sin α / cos α) - cos α
= (sin α · cos α) / sin α - cos α
= cos α - cos α
= 0 = RL

c) LL = sin α · cot α
= sin α · (cos α / sin α)
= cos α = RL

d) LL = (1 - sin² α) · tan² α
= (cos² α + sin² α - sin² α) · (sin² α / cos² α)
= cos² α · (sin² α / cos² α)
= sin² α = RL

e) LL = -sin² α
= 1 + 1 - sin² α
= 1 + cos² α + sin² α - sin² α
= 1 + cos² α = RL

--- PAGE 47 ---
**22** Bereken:
5 cos α - 12 tan α als sin α = 7/25 en α ∈ I

cos² α + sin² α = 1
⇔ cos² α + (7/25)² = 1
⇔ cos² α = 1 - 49/625 = 576/625
⇒ cos α = 24/25 (α ∈ I, cos α > 0)

tan α = sin α / cos α = (7/25) / (24/25) = 7/24

5 cos α - 12 tan α = 5 · (24/25) - 12 · (7/24) = 13/10

**23** Bereken zonder gebruik te maken van ICT.
a) sin 60° · cos 30° - cos 60° · sin 30°
b) (sin 30° - cos 30°) (cos 30° + sin 30°)
c) (tan 60° - tan 30°)²

a) sin 60° · cos 30° - cos 60° · 30° = √3 / 2 · √3 / 2 - 1/2 · 1/2
= 1/2

b) (sin 30° - cos 30°) · (cos 30° + sin 30°) = sin² 30° - cos² 30°
= (1/2)² - (√3 / 2)²
= 1/4 - 3/4
= -1/2

c) (tan 60° - tan 30°)² = (√3 - √3 / 3)²
= (2√3 / 3)²
= 4/3

--- PAGE 48 ---
**24** Toon volgende gelijkheden aan voor elke α waarvoor beide leden zinvol zijn.
a) cos⁴ α + 2 · cos² α · sin² α + sin⁴ α = 1
b) 1 + tan² α = 1 / cos² α
c) (sin α + cos α)² + (sin α - cos α)² = 2
d) sin⁴ α - 2 sin² α = cos⁴ α - 1
e) cos α / (sin α - cos α) = 1 / (tan α - 1)
f) (1 - cos α) / sin α = sin α / (1 + cos α)
g) 1 / sin² α + 1 / cos² α = 1 / (sin² α · cos² α)
h) (1 - tan α) / (cot α - 1) = (tan α + 1) / (1 + cot α)
i) (1 - cos α + sin α) / (1 + cos α + sin α) = sin α / (cos α + 1)
j) (1 + sin α + cos α) · (1 - sin α - cos α) / (sin α · cos α) = -2

a) LL = cos⁴ α + 2 · cos² α · sin² α + sin⁴ α
= (cos² α + sin² α)²
= 1²
= 1 = RL

b) LL = 1 + tan² α
= 1 + sin² α / cos² α
= (cos² α + sin² α) / cos² α
= 1 / cos² α = RL

c) LL = (sin α + cos α)² + (sin α - cos α)²
= sin² α + 2 sin α · cos α + cos² α + sin² α - 2 sin α · cos α + cos² α
= 2(sin² α + cos² α)
= 2 = RL

d) LL = sin⁴ α - 2 sin² α
= (1 - cos² α)² - 2(1 - cos² α)
= 1 - 2 cos² α + cos⁴ α - 2 + 2 cos² α
= cos⁴ α - 1 = RL

e) LL = cos α / (sin α - cos α)
= (cos α / cos α) / ((sin α - cos α) / cos α)
= 1 / (tan α - 1) = RL

f) (1 - cos α) / sin α = sin α / (1 + cos α)
⇔ (1 - cos α)(1 + cos α) = sin² α
⇔ 1 - cos² α = sin² α
⇔ sin² α = sin² α

g) LL = 1 / sin² α + 1 / cos² α
= (cos² α + sin² α) / (sin² α · cos² α)
= 1 / (sin² α · cos² α) = RL

--- PAGE 49 ---
h) (1 - tan α) / (cot α - 1) = (tan α + 1) / (1 + cot α)
⇔ (1 - tan α)(1 + cot α) = (tan α + 1)(cot α - 1)
⇔ 1 + cos α - tan α - tan α · cot α = tan α · cot α - tan α + cot α - 1
⇔ 1 + cot α - tan α - 1 = 1 - tan α + cot α - 1
⇔ cot α - tan α = cot α - tan α

i) (1 - cos α + sin α) / (1 + cos α + sin α) = sin α / (cos α + 1)
⇔ (1 - cos α + sin α)(cos α + 1) = sin α(1 + cos α + sin α)
⇔ cos α + 1 - cos² α - cos α + sin α · cos α + sin α = sin α + sin α · cos α + sin² α
⇔ 1 - cos² α + sin α · cos α + sin α = sin α + sin α · cos α + sin² α
⇔ sin² α + sin α · cos α + sin α = sin α + sin α · cos α + sin² α

j) (1 + sin α + cos α) · (1 - sin α - cos α) / (sin α · cos α) = -2
⇔ 1 - (sin α + cos α)² = -2 sin α · cos α
⇔ 1 - (sin² α + 2 sin α · cos α + cos² α) = -2 sin α · cos α
⇔ 1 - (1 + 2 sin α · cos α) = -2 sin α · cos α
⇔ -2 sin α · cos α = -2 sin α · cos α

**25** We maken kennis met nog meer goniometrische getallen: secans en cosecans.
**definitie**
sec α = 1 / cos α (cos α ≠ 0)
csc α = 1 / sin α (sin α ≠ 0)

a) Bepaal zonder ICT.
csc 30° = 1 / sin 30° = 2
csc 45° = 1 / sin 45° = 2 / √2 = √2
csc 60° = 1 / sin 60° = 2 / √3 = 2√3 / 3
sec 30° = 1 / cos 30° = 2 / √3 = 2√3 / 3
sec 45° = 1 / cos 45° = 2 / √2 = √2
sec 60° = 1 / cos 60° = 2

b) Toon aan.
sec² α = 1 + tan² α
csc² α = 1 + cot² α

b) cos² α + sin² α = 1
⇓ delen door cos² α
1 + sin² α / cos² α = 1 / cos² α
⇓
1 + tan² α = sec² α

cos² α + sin² α = 1
⇓ delen door sin² α
cos² α / sin² α + 1 = 1 / sin² α
⇓
cot² α + 1 = csc² α

--- PAGE 50 ---
**26** Geef de juiste benaming van de verwante hoeken.
a) Â = 40° en B̂ = 140°
b) Ĉ = -120° en D̂ = 240°
c) Ê = 210° en F̂ = 30°
d) Ĝ = -35° en Ĥ = 35°
e) Î = 20° en Ĵ = 70°
f) K̂ = 70° en L̂ = 110°

a) supplementaire hoeken
b) gelijke hoeken
c) antisupplementaire hoeken
d) tegengestelde hoeken
e) complementaire hoeken
f) supplementaire hoeken

**27** Bepaal het tegengestelde, het supplement en het complement van de gegeven hoek α.

| | α | TEGENGESTELDE | SUPPLEMENT | COMPLEMENT |
|---|---|---|---|---|
| a) | 20° | -20° | 160° | 70° |
| b) | 10°20' | -10°20' | 169°40' | 79°40' |
| c) | 30°10'20'' | -30°10'20'' | 149°49'40'' | 59°49'40'' |
| d) | 85°20' | -85°20' | 94°40' | 4°40' |
| e) | 90° | -90° | 90° | 0° |
| f) | 45°01'59'' | -45°01'59'' | 134°58'01'' | 44°58'01'' |
| g) | 170°50' | -170°50' | 9°10' | -80°50' |
| h) | 0° | 0° | 180° | 90° |
| i) | 222°33'44'' | -222°33'44'' | -42°33'44'' | -132°33'44'' |
| j) | -66°55' | 66°55' | 246°55' | 156°55' |

--- PAGE 51 ---
**28** Kleur de gelijke uitdrukkingen in eenzelfde kleur.

| | | | |
|---|---|---|---|
| sin 20° | -sin(-40°) | tan(-110°) | sin 160° |
| tan 70° | cos 0° | tan 45° | sin 40° |
| sin 90° | cos 50° | cos 70° | -tan 110° |
| cos(-70°) | -tan(-70°) | cot 20° | -cos 130° |
*(Opgelost in de correctiesleutel op basis van kleur)*

**29** Vul aan met = of ≠.
a) sin 20° = sin 160°
b) tan 43° = cot 47°
c) sin 240° ≠ sin 120°
d) sin 105° ≠ -sin 75°
e) cos 10° ≠ cos 180°
f) tan 45° ≠ tan -35°
g) sin 200° ≠ sin 20°
h) cot (-40°) = -cot 40°
i) cos 110° ≠ sin 20°
j) cos 190° = cos 170°
k) sin (-80°) = cos (-190°)
l) tan 50° = -tan 130°

**30** Vereenvoudig.
a) sin(180° + α)
b) cos(α - 180°)
c) tan(810° - α)
d) cot(α - 540°)
e) sin(90° - α)
f) cos(α + 900°)
g) tan(1080° - α)
h) cot(270° - α)
i) sin(90° + α)
j) cos(360° - α)
k) tan(270° + α)
l) cot(720° - α)

a) sin(180° + α) = sin(-α) = -sin α
b) cos(α - 180°) = cos(180° - α) = -cos α
c) tan(810° - α) = tan(90° - α) = cot α
d) cot(α - 540°) = cot(α - 180°) = -cot(180° - α) = cot α
e) sin(90° - α) = cos α
f) cos(α + 900°) = cos(α - 180°) = cos(180° - α) = -cos α
g) tan(1080° - α) = tan(-α) = -tan α
h) cot(270° - α) = cot(-90° - α) = -cot(90° + α) = -tan(-α) = tan α
i) sin(90° + α) = cos(-α) = cos α
j) cos(360° - α) = cos(-α) = cos α
k) tan(270° + α) = tan(-90° + α) = -tan(90° - α) = -cot α
l) cot(720° - α) = cot(-α) = -cot α

--- PAGE 52 ---
**31** Gegeven: sin α = -3/5
cos β = 2/7
tan γ = 4

Bereken.
a) sin(180° - α)
b) cos(-β)
c) cot γ
d) sin(-α)
e) cos(180° - β)
f) tan(γ - 360°)
g) cos(90° - α)
h) tan(180° - γ)
i) sin(90° - β)
j) cot(90° - γ)

a) sin(180° - α) = sin α = -3/5
b) cos (-β) = cos β = 2/7
c) cot γ = 1 / tan γ = 1/4
d) sin (-α) = -sin α = 3/5
e) cos(180° - β) = -cos β = -2/7
f) tan(γ - 360°) = tan γ = 4
g) cos(90° - α) = sin α = -3/5
h) tan(180° - γ) = -tan γ = -4
i) sin(90° - β) = cos β = 2/7
j) cot(90° - γ) = tan γ = 4

--- PAGE 53 ---
**32** Gegeven: sin 23° = 0,39073
cos 43° = 0,73135

Bereken (zonder gebruik te maken van ICT):
a) sin 157°
b) sin 383°
c) sin 337°
d) sin 47°
e) cos 403°
f) cos 137°
g) cos 67°
h) cos(-43°)

a) sin 157° = sin(180° - 157°) = sin 23° = 0,39073
b) sin 383° = sin(383° - 360°) = sin 23° = 0,39073
c) sin 337° = sin(337° - 360°) = sin(-23°) = -sin 23° = -0,39073
d) sin 47° = cos(90° - 47°) = cos 43° = 0,73135
e) cos 403° = cos(403° - 360°) = cos 43° = 0,73135
f) cos 137° = -cos(180° - 137°) = -cos 43° = -0,73135
g) cos 67° = sin(90° - 67°) = sin 23° = 0,39073
h) cos(-43°) = cos 43° = 0,73135

**33** Vervolledig de tabellen door gebruik te maken van de formules van verwante hoeken.

| α | 0° | 30° | 45° | 60° | 90° |
|---|---|---|---|---|---|
| sin α | 0 | 1/2 | √2 / 2 | √3 / 2 | 1 |
| cos α | 1 | √3 / 2 | √2 / 2 | 1/2 | 0 |
| tan α | 0 | √3 / 3 | 1 | √3 | ∉ ℝ |
| cot α | ∉ ℝ | √3 | 1 | √3 / 3 | 0 |

| α | 120° | 135° | 150° | 180° |
|---|---|---|---|---|
| sin α | √3 / 2 | √2 / 2 | 1/2 | 0 |
| cos α | -1/2 | -√2 / 2 | -√3 / 2 | -1 |
| tan α | -√3 | -1 | -√3 / 3 | 0 |
| cot α | -√3 / 3 | -1 | -√3 | ∉ ℝ |

| α | 210° | 225° | 240° | 270° |
|---|---|---|---|---|
| sin α | -1/2 | -√2 / 2 | -√3 / 2 | 0 |
| cos α | -√3 / 2 | -√2 / 2 | -1/2 | 1 |
| tan α | √3 / 3 | 1 | √3 | 0 |
| cot α | √3 | 1 | √3 / 3 | ∉ ℝ |

--- PAGE 54 ---
| α | 300° | 315° | 330° | 360° |
|---|---|---|---|---|
| sin α | -√3 / 2 | -√2 / 2 | -1/2 | 0 |
| cos α | 1/2 | √2 / 2 | √3 / 2 | 1 |
| tan α | -√3 | -1 | -√3 / 3 | 0 |
| cot α | -√3 / 3 | -1 | -√3 | ∉ ℝ |

**34** Gegeven: tan α = 117/44 en α ∈ I
Gevraagd:
a) Bereken de sinus van de complementaire hoek.
b) Bereken de cosinus van de supplementaire hoek.
c) Bereken de cotangens van de tegengestelde hoek.

cot α = 1 / tan α = 44 / 117
1 + tan² α = cos² α / cos² α + sin² α / cos² α = 1 / cos² α
⇒ cos² α = 1 / (1 + tan² α)
⇒ cos² α = 1 / (1 + (117/44)²)
⇒ cos² α = 1936 / 15625
⇒ cos α = 44 / 125 (α ∈ I)

sin α = tan α · cos α = 117 / 44 · 44 / 125 = 117 / 125

sinus complementaire hoek: sin(90° - α) = cos α = 44 / 125
cosinus supplementaire hoek: cos(180° - α) = -cos α = -44 / 125
cotangens tegengestelde hoek: cot(-α) = -cot α = -44 / 117

--- PAGE 55 ---
**35** Gegeven: sin α = 99/101 en α ∈ II
Gevraagd:
a) Bereken de cosinus van de supplementaire hoek.
b) Bereken de tangens van de complementaire hoek.
c) Bereken de cotangens van de tegengestelde hoek.

sin² α + cos² α = 1
⇒ cos² α = 1 - sin² α
⇒ cos² α = 1 - (99/101)²
⇒ cos² α = 400 / 10201
⇒ cos α = -20 / 101 (α ∈ II)

tan α = sin α / cos α = -99 / 20
cot α = 1 / tan α = -20 / 99

cosinus supplementaire hoek: cos(180° - α) = -cos α = 20 / 101
tangens complementaire hoek: tan(90° - α) = cot α = -20 / 99
cotangens tegengestelde hoek: cot(-α) = -cot α = 20 / 99

**36** Vereenvoudig.
cos² 15° + sin² 30° + cos 45° + sin² 60° + cos² 75°

sin² 15° + sin² 30° + cos 45° + sin² 60° + cos² 75°
= cos² 15° + sin² 30° + cos² 45° + cos² 30° + sin² 15°
= (cos² 15° + sin² 15°) + (sin² 30° + cos² 30°) + cos 45°
= 1 + 1 + √2 / 2
= (4 + √2) / 2

--- PAGE 56 ---
**37** Gegeven: sin 15° = (√3 - 1) / 2√2
Bereken exact sin 75°.

cos² α + sin² α = 1
⇔ cos² 15° + ((√3 - 1) / 2√2)² = 1
⇔ cos² 15° = 1 - (3 - 2√3 + 1) / 8 = (4 + 2√3) / 8 = ((√3 + 1) / 2√2)²
⇒ cos 15° = (√3 + 1) / 2√2 (α ∈ I, cos α > 0)
sin 75° = cos 15° = (√3 + 1) / 2√2

**38** Vereenvoudig de uitdrukkingen zo ver mogelijk.
a) (sin(180° - α) · cos(180° + α) · cot(90° - α)) / (cos(90° + α) · sin(360° - α) · cot(α - 180°))
b) (cos(990° - α) · cos(90° - α) · tan(360° - α)) / (sin(180° - α) · sin(180° + α) · tan(90° + α))
c) (sin(α + 360°) · cos(360° - α) · tan(180° - α)) / (tan(α + 180°) · tan(α - 90°) · cot(α + 270°))
d) (cos(540° + α) · cos(720° - α) · cos(900° + α)) / (cos(α - 180°) · tan(270° - α) · tan(270° + α))

a) sin(180° - α) = sin α
cos(180° + α) = -cos(-α) = -cos α
cot(90° - α) = tan α
cos(90° + α) = sin(-α) = -sin α
sin(360° - α) = sin(-α) = -sin α
cot(α - 180°) = -cot(180° - α) = cot α

(sin(180° - α) · cos(180° + α) · cot(90° - α)) / (cos(90° + α) · sin(360° - α) · cot(α - 180°))
= (sin α · (-cos α) · tan α) / (-sin α · (-sin α) · cot α)
= (-cos α · tan α) / (sin α · cot α)
= -tan α

b) cos(990° - α) = cos(-90° - α) = cos(90° + α) = sin(-α) = -sin α
cos(90° - α) = sin α
tan(360° - α) = tan(-α) = -tan α
sin(180° - α) = sin α
sin(180° + α) = sin(-α) = -sin α
tan(90° + α) = cot(-α) = -cot α

(cos(990° - α) · cos(90° - α) · tan(360° - α)) / (sin(180° - α) · sin(180° + α) · tan(90° + α))
= (-sin α · sin α · (-tan α)) / (sin α · (-sin α) · (-cot α))
= tan α / cot α = tan² α

--- PAGE 57 ---
a) sin(180° - α) = sin α
cos(180° + α) = -cos(-α) = -cos α
cot(90° - α) = tan α
cos(90° + α) = sin(-α) = -sin α
sin(360° - α) = sin(-α) = -sin α
cot(α - 180°) = -cot(180° - α) = cot α

(sin(180° - α) · cos(180° + α) · cot(90° - α)) / (cos(90° + α) · sin(360° - α) · cot(α - 180°))
= (sin α · (-cos α) · tan α) / (-sin α · (-sin α) · cot α)
= (-cos α · tan α) / (sin α · cot α)
= -tan α

b) cos(990° - α) = cos(-90° - α) = cos(90° + α) = sin(-α) = -sin α
cos(90° - α) = sin α
tan(360° - α) = tan(-α) = -tan α
sin(180° - α) = sin α
sin(180° + α) = sin(-α) = -sin α
tan(90° + α) = cot(-α) = -cot α

(cos(990° - α) · cos(90° - α) · tan(360° - α)) / (sin(180° - α) · sin(180° + α) · tan(90° + α))
= (-sin α · sin α · (-tan α)) / (sin α · (-sin α) · (-cot α))
= tan α / cot α = tan² α

c) sin(α + 360°) = sin α
cos(360° - α) = cos(-α) = cos α
tan(180° - α) = -tan α
tan(α + 180°) = -tan(-α) = tan α
tan(α - 90°) = -tan(90° - α) = -cot α
cot(α + 270°) = cot(α - 90°) = -cot(90° - α) = -tan α

(sin(α + 360°) · cos(360° - α) · tan(180° - α)) / (tan(α + 180°) · tan(α - 90°) · cot(α + 270°))
= (sin α · cos α · (-tan α)) / (tan α · (-cot α) · (-tan α))
= (-sin α · cos α) / (tan α · cot α)
= -sin α · cos α

d) cos(540° + α) = cos(180° + α) = -cos(-α) = -cos α
cos(720° - α) = cos(-α) = cos α
cos(900° + α) = cos(180° + α) = -cos(-α) = -cos α
cos(α - 180°) = cos(180° - α) = -cos α
tan(270° - α) = tan(-90° - α) = -tan(90° + α) = -cot(-α) = cot α
tan(270° + α) = tan(-90° + α) = -tan(90° - α) = -cot α

(cos(540° + α) · cos(720° - α) · cos(900° + α)) / (cos(α - 180°) · tan(270° - α) · tan(270° + α))
= (-cos α · cos α · (-cos α)) / (-cos α · cot α · (-cot α))
= (cos α · cos α) / (cot α · cot α)
= sin² α

--- PAGE 58 ---
c) sin(α + 360°) = sin α
cos(360° - α) = cos(-α) = cos α
tan(180° - α) = -tan α
tan(α + 180°) = -tan(-α) = tan α
tan(α - 90°) = -tan(90° - α) = -cot α
cot(α + 270°) = cot(α - 90°) = -cot(90° - α) = -tan α

(sin(α + 360°) · cos(360° - α) · tan(180° - α)) / (tan(α + 180°) · tan(α - 90°) · cot(α + 270°))
= (sin α · cos α · (-tan α)) / (tan α · (-cot α) · (-tan α))
= (-sin α · cos α) / (tan α · cot α)
= -sin α · cos α

d) cos(540° + α) = cos(180° + α) = -cos(-α) = -cos α
cos(720° - α) = cos(-α) = cos α
cos(900° + α) = cos(180° + α) = -cos(-α) = -cos α
cos(α - 180°) = cos(180° - α) = -cos α
tan(270° - α) = tan(-90° - α) = -tan(90° + α) = -cot(-α) = cot α
tan(270° + α) = tan(-90° + α) = -tan(90° - α) = -cot α

(cos(540° + α) · cos(720° - α) · cos(900° + α)) / (cos(α - 180°) · tan(270° - α) · tan(270° + α))
= (-cos α · cos α · (-cos α)) / (-cos α · cot α · (-cot α))
= (cos α · cos α) / (cot α · cot α)
= sin² α

**39** Vereenvoudig de uitdrukkingen zo ver mogelijk.
a) (cos(180° + α) · cot(α - 180°) · cos(810° - α) + sin(α - 540°) · cos(90° - α)) / (tan(α + 900°) · cot(1080° - α))
b) (cos(270° - α) · sin(90° + α)) / (tan(360° - α)) + (cos(270° + α) · cos(720° - α)) / cot α
c) (tan(360° - α) · sin(270° + α)) / (cos(α - 90°)) + (cot(450° + α) · sin(900° - α)) / (cos(α - 540°))
d) (cos(180° + α) · cot(α - 90°)) / (sin(540° - α)) + sin(270° - α) · cot(90° - α) · cos(α - 90°) + (sin(90° + α) · cos(α - 360°)) / (tan(180° - α) · tan(α - 270°))

a) cos(180° + α) = -cos(-α) = -cos α
cot(α - 180°) = -cot(180° - α) = cot α
cos(810° - α) = cos(90° - α) = sin α
sin(α - 540°) = sin(α - 180°) = -sin(180° - α) = -sin α
cos(90° - α) = sin α
tan(α + 900°) = tan(α - 180°) = -tan(180° - α) = tan α
cot(1080° - α) = cot(-α) = -cot α

(cos(180° + α) · cot(α - 180°) · cos(810° - α) + sin(α - 540°) · cos(90° - α)) / (tan(α + 900°) · cot(1080° - α))
= (-cos α · cot α · sin α + (-sin α · sin α)) / (tan α · (-cot α))
= -cos² α + sin² α

b) cos(270° - α) = cos(-90° - α) = cos(90° + α) = sin(-α) = -sin α
sin(90° + α) = cos(-α) = cos α
tan(360° - α) = tan(-α) = -tan α
cos(270° + α) = cos(-90° + α) = cos(90° - α) = sin α
cos(720° - α) = cos(-α) = cos α
cot α = cot α

(cos(270° - α) · sin(90° + α)) / (tan(360° - α)) + (cos(270° + α) · cos(720° - α)) / cot α
= (-sin α · cos α) / (-tan α) + (sin α · cos α) / cot α
= cos² α + sin² α
= 1

--- PAGE 59 ---
a) cos(180° + α) = -cos(-α) = -cos α
cot(α - 180°) = -cot(180° - α) = cot α
cos(810° - α) = cos(90° - α) = sin α
sin(α - 540°) = sin(α - 180°) = -sin(180° - α) = -sin α
cos(90° - α) = sin α
tan(α + 900°) = tan(α - 180°) = -tan(180° - α) = tan α
cot(1080° - α) = cot(-α) = -cot α

(cos(180° + α) · cot(α - 180°) · cos(810° - α) + sin(α - 540°) · cos(90° - α)) / (tan(α + 900°) · cot(1080° - α))
= (-cos α · cot α · sin α + (-sin α · sin α)) / (tan α · (-cot α))
= -cos² α + sin² α

b) cos(270° - α) = cos(-90° - α) = cos(90° + α) = sin(-α) = -sin α
sin(90° + α) = cos(-α) = cos α
tan(360° - α) = tan(-α) = -tan α
cos(270° + α) = cos(-90° + α) = cos(90° - α) = sin α
cos(720° - α) = cos(-α) = cos α
cot(α) = cot α

(cos(270° - α) · sin(90° + α)) / (tan(360° - α)) + (cos(270° + α) · cos(720° - α)) / cot(α)
= (-sin α · cos α) / (-tan α) + (sin α · cos α) / cot α
= cos² α + sin² α
= 1

c) tan(360° - α) = tan(-α) = -tan α
sin(270° + α) = sin(-90° + α) = -sin(90° - α) = -cos α
cos(α - 90°) = cos(90° - α) = sin α
cot(450° + α) = cot(90° + α) = tan(-α) = -tan α
sin(900° - α) = sin(180° - α) = sin α
cos(α - 540°) = cos(α - 180°) = cos(180° - α) = -cos α

(tan(360° - α) · sin(270° + α)) / (cos(α - 90°)) + (cot(450° + α) · sin(900° - α)) / (cos(α - 540°))
= (-tan α · (-cos α)) / sin α + (-tan α · sin α) / (-cos α)
= 1 + tan² α
= (cos² α + sin² α) / cos² α
= 1 / cos² α

d) cos(180° + α) = -cos(-α) = -cos α
cot(α - 90°) = -cot(90° - α) = -tan α
sin(540° - α) = sin(180° - α) = sin α
sin(270° - α) = sin(-90° - α) = -sin(90° + α) = -cos(-α) = -cos α
cot(90° - α) = tan α
cos(α - 90°) = cos(90° - α) = sin α
sin(90° + α) = cos(-α) = cos α
cos(α - 360°) = cos α
tan(180° - α) = -tan α
tan(α - 270°) = tan(90° + α) = cot(-α) = -cot α

(cos(180° + α) · cot(α - 90°)) / (sin(540° - α)) + sin(270° - α) · cot(90° - α) · cos(α - 90°) + (sin(90° + α) · cos(α - 360°)) / (tan(180° - α) · tan(α - 270°))
= (-cos α · (-tan α)) / sin α + (-cos α) · tan α · sin α + (cos α · cos α) / (-tan α · (-cot α))
= 1 - sin² α + cos² α
= cos² α + cos² α
= 2cos² α

--- PAGE 60 ---
c) tan(360° - α) = tan(-α) = -tan α
sin(270° + α) = sin(-90° + α) = -sin(90° - α) = -cos α
cos(α - 90°) = cos(90° - α) = sin α
cot(450° + α) = cot(90° + α) = tan(-α) = -tan α
sin(900° - α) = sin(180° - α) = sin α
cos(α - 540°) = cos(α - 180°) = cos(180° - α) = -cos α

(tan(360° - α) · sin(270° + α)) / (cos(α - 90°)) + (cot(450° + α) · sin(900° - α)) / (cos(α - 540°))
= (-tan α · (-cos α)) / sin α + (-tan α · sin α) / (-cos α)
= 1 + tan² α
= (cos² α + sin² α) / cos² α
= 1 / cos² α

d) cos(180° + α) = -cos(-α) = -cos α
cot(α - 90°) = -cot(90° - α) = -tan α
sin(540° - α) = sin(180° - α) = sin α
sin(270° - α) = sin(-90° - α) = -sin(90° + α) = -cos(-α) = -cos α
cot(90° - α) = tan α
cos(α - 90°) = cos(90° - α) = sin α
sin(90° + α) = cos(-α) = cos α
cos(α - 360°) = cos α
tan(180° - α) = -tan α
tan(α - 270°) = tan(90° + α) = cot(-α) = -cot α

(cos(180° + α) · cot(α - 90°)) / (sin(540° - α)) + sin(270° - α) · cot(90° - α) · cos(α - 90°) + (sin(90° + α) · cos(α - 360°)) / (tan(180° - α) · tan(α - 270°))
= (-cos α · (-tan α)) / sin α + (-cos α) · tan α · sin α + (cos α · cos α) / (-tan α · (-cot α))
= 1 - sin² α + cos² α
= cos² α + cos² α
= 2cos² α

**40** Reken uit.
a) -cos 60° · sin 120°
b) (sin 315° · tan 225°) / sin 30°
c) 4 sin 150° - 2 cos 240°
d) (cos 300° + sin 330°) / (tan (-135°) · cot 315°)

a) -cos 60° · sin 120° = cos 60° · 120° = 1/2 · √3 / 2 = √3 / 4
b) (sin 315° · tan 225°) / sin 30° = (-√2 / 2 · 1) / (1 / 2) = (-√2 / 2) · (2 / 1) = -√2
c) 4 · sin 150° - 2 cos 240° = 4 · 1/2 - 2 · (-1/2) = 4/2 + 2/2 = 3
d) (cos 300° + sin 330°) / (tan(-135°) · cot 315°) = (1/2 + (-1/2)) / (1 · (-1)) = 0

--- PAGE 61 ---
# Computationeel denken

**Toepassing 1: De hoofdwaarde bepalen**
Hieronder vind je de start van een code in Python.

```python
1  hoek = int(input("Voer de hoofdwaarde in (zonder gradensymbool): "))
2
3  if hoek > -180 and hoek <= 180:
4      print("De hoofdwaarde van de geörienteerde hoek is α =",hoek,"°.")
5  else:
6      print("Je voerde geen hoofdwaarde in, voer het programma opnieuw uit en tik een hoofdwaarde in.")
```

Probeer de code te begrijpen aan de hand van de volgende vragen.

a) Waarom wordt er gebruik gemaakt van `int()` in lijn 1?
De functie 'int' zet de ingevoerde waarde om naar een geheel getal.

b) Waarom wordt er in lijn 3 gebruik gemaakt van de logische operator `and`?
De hoofdwaarde moet groter zijn dan -180° EN kleiner dan of gelijk aan 180°. Daarvoor is de and-operator nodig.

Het programma kan verbeterd worden door de hoofdwaarde te laten bepalen indien de gebruiker dit niet invult.

```python
1  hoek = int(input("Voer de hoofdwaarde in (zonder gradensymbool): "))
2
3  if hoek > -180 and hoek <= 180:
4      print("De hoofdwaarde van de geörienteerde hoek is α =",hoek,"°.")
5  else:
6      print(hoek,"° is geen hoofdwaarde voor een geörienteerde hoek α.")
7      while hoek <= -180:
8          hoek += 360
9      while hoek > 180:
10         hoek -= 360
11     print("De hoofdwaarde van de hoek die je invoerde is α =",hoek,"°.")
```

c) Waarom wordt er zowel op lijn 7 als op lijn 9 gebruik gemaakt van een while-structuur?
Wanneer de ingevoerde waarde verkeerd is, wordt een tip gegeven aan de hand van de ingevoerde waarde.

d) Wat betekent `hoek += 360`?
Wanneer een waarde kleiner of gelijk aan -180° graden wordt ingevoerd, wordt er bij de hoek 360° bijgerekend.

e) Wat betekent `hoek -= 360`?
Wanneer een waarde groter dan 180 graden wordt ingevoerd, wordt er van de hoek 360 graden afgetrokken.

--- PAGE 62 ---
f) Voer het programma uit voor de volgende invoer en noteer telkens de uitvoer die je verkrijgt.

α = -130°
De hoofdwaarde van de geörienteerde hoek is α = -130°.

α = 740°
740° is geen hoofdwaarde voor de geörienteerde hoek α.
De hoofdwaarde van de hoek die je invoerde is α = 20°.

α = 210°
210° is geen hoofdwaarde voor een geörienteerde hoek α.
De hoofdwaarde van de hoek die je invoerde is α = -150°.

**Toepassing 2: Kwadranten**
Hieronder zie je de start van een code om te bepalen in welk kwadrant het beeldpunt van een georiënteerde hoek ligt.
Er werd gebruik gemaakt van de code uit de vorige toepassing. De nieuwe regels code vind je dus vanaf regel 13.

```python
1   hoek = int(input("Voer de hoofdwaarde in (zonder gradensymbool): "))
2
3   if hoek > -180 and hoek <= 180:
4       print("De hoofdwaarde van de geörienteerde hoek is α =",hoek,"°.")
5   else:
6       print(hoek,"° is geen hoofdwaarde voor een geörienteerde hoek α.")
7       while hoek <= -180:
8           hoek += 360
9       while hoek > 180:
10          hoek -= 360
11      print("De hoofdwaarde van de hoek die je invoerde is α =",hoek,"°.")
12
13  if hoek > 0 and hoek < 90:
14      print("Het beeldpunt van α =",hoek,"° op de goniometrische cirkel ligt in kwadrant I.")
```

--- PAGE 63 ---
a) Vul deze code aan voor kwadrant II, kwadrant III en kwadrant IV. Opgelet: indien het beeldpunt op de x-as of y-as ligt, dan vermeld je dat ook.

```python
1   hoek= int(input("Voer de hoofdwaarde in (zonder gradensymbool): "))
2   if hoek > -180 and hoek <= 180:
3       print("De hoofdwaarde van de geörienteerde hoek is α =",hoek,"°.")
4   else:
5       print(hoek,"° is geen hoofdwaarde voor een geörienteerde hoek α.")
6       while hoek <= -180:
7           hoek += 360
8       while hoek > 180:
9           hoek -= 360
10      print("De hoofdwaarde van de hoek die je invoerde is α =",hoek,"°.")
11
12  if hoek > 0 and hoek < 90:
13      print("Het beeldpunt van α =",hoek,"° op de goniometrische cirkel ligt in kwadrant I.")
14  if hoek > 90 and hoek < 180:
15      print("Het beeldpunt van α =",hoek,"° op de goniometrische cirkel ligt in kwadrant II.")
16  if hoek > -180 and hoek < -90:
17      print("Het beeldpunt van α =",hoek,"° op de goniometrische cirkel ligt in kwadrant III.")
18  if hoek > -90 and hoek < 0:
19      print("Het beeldpunt van α =",hoek,"° op de goniometrische cirkel ligt in kwadrant IV.")
20  if hoek == 0 or hoek == 180 or hoek==-180:
21      print("Het beeldpunt ligt op de x-as.")
22  if hoek == 90 or hoek == -90:
23      print("Het beeldpunt ligt op de y-as.")
```

b) Vul de code aan zodat uitgevoerd wordt welk toestandsteken de sinus van de hoek en de cosinus van de hoek hebben.

```python
1   hoek= int(input("Voer de hoofdwaarde in (zonder gradensymbool): "))
2   if hoek > -180 and hoek <= 180:
3       print("De hoofdwaarde van de geörienteerde hoek is α =",hoek,"°.")
4   else:
5       print(hoek,"° is geen hoofdwaarde voor een geörienteerde hoek α.")
6       while hoek <= -180:
7           hoek += 360
8       while hoek > 180:
9           hoek -= 360
10      print("De hoofdwaarde van de hoek die je invoerde is α =",hoek,"°.")
11
12  if hoek > 0 and hoek < 90:
13      print("Het beeldpunt van α =",hoek,"° op de goniometrische cirkel ligt in kwadrant I.")
14      print("Toestandsteken sin + , Toestandsteken cos +")
15  if hoek > 90 and hoek < 180:
16      print("Het beeldpunt van α =",hoek,"° op de goniometrische cirkel ligt in kwadrant II.")
17      print("Toestandsteken sin + , Toestandsteken cos -")
18  if hoek > -180 and hoek < -90:
19      print("Het beeldpunt van α =",hoek,"° op de goniometrische cirkel ligt in kwadrant III.")
20      print("Toestandsteken sin - , Toestandsteken cos -")
21  if hoek > -90 and hoek < 0:
22      print("Het beeldpunt van α =",hoek,"° op de goniometrische cirkel ligt in kwadrant IV.")
23      print("Toestandsteken sin - , Toestandsteken cos +")
24  if hoek == 0 or hoek == 180 or hoek==-180:
25      print("Het beeldpunt ligt op de x-as.")
26  if hoek == 90 or hoek == -90:
27      print("Het beeldpunt ligt op de y-as.")
```

--- PAGE 64 ---
**Toepassing 3: Verwante hoeken**
Ook voor deze toepassing vertrekken we van de code uit toepassing 1.

```python
1   hoek = int(input("Voer de hoofdwaarde in (zonder gradensymbool): "))
2
3   if hoek > -180 and hoek <= 180:
4       print("De hoofdwaarde van de geörienteerde hoek is α =",hoek,"°.")
5   else:
6       print(hoek,"° is geen hoofdwaarde voor een geörienteerde hoek α.")
7       while hoek <= -180:
8           hoek += 360
9       while hoek > 180:
10          hoek -= 360
11      print("De hoofdwaarde van de hoek die je invoerde is α =",hoek,"°.")
12
13  tegengesteld = -hoek
14  print(hoek,"° en",tegengesteld,"° zijn tegengestelde hoeken.")
```

Vul de code aan zodat ook de supplementaire hoek, de antisupplementaire hoek, de complementaire hoek en de anticomplementaire hoek worden bepaald.

```python
1   hoek= int(input("Voer de hoofdwaarde in (zonder gradensymbool): "))
2
3   if hoek > -180 and hoek <= 180:
4       print("De hoofdwaarde van de geörienteerde hoek is α =",hoek,"°.")
5   else:
6       print(hoek,"° is geen hoofdwaarde voor een geörienteerde hoek α.")
7       while hoek <= -180:
8           hoek += 360
9       while hoek > 180:
10          hoek -= 360
11      print("De hoofdwaarde van de hoek die je invoerde is α =",hoek,"°.")
12
13  tegengesteld = - hoek
14  print(hoek,"° en", tegengesteld, "° zijn tegengestelde hoeken.")
15  supplementair = 180 - hoek
16  print(hoek,"° en", supplementair, "° zijn supplementaire hoeken.")
17  antisupplementair = 180 + hoek
18  print(hoek,"° en", antisupplementair, "° zijn antisupplementaire hoeken.")
19  complementair = 90 - hoek
20  print(hoek,"° en", complementair, "° zijn complementaire hoeken.")
21  anticomplementair = 90 + hoek
22  print(hoek,"° en", anticomplementair, "° zijn anticomplementaire hoeken.")
```

**Auteurs** Philip Bogaert, Björn Carreyn en Roger Van Nieuwenhuyze
**Tweede editie - Bestelnummer** 94 606 0119 (module 06 van 18)
**ISBN** 978 90 4864 973 0 - **KB** D/2024/0147/206 - **NUR** 126/128/129 - **Thema** YPMF
**Illustrator** Jona Jamart - **Design en lay-out** die Keure
**Verantwoordelijke uitgever** die Keure, Kleine Pathoekeweg 3, 8000 Brugge
RPR 0405 108 325 - © Copyright die Keure, Brugge
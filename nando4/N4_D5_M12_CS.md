--- PAGE 1 ---
# NANDO 4

**D-FINALITEIT 5 UUR – MEETKUNDE**
# 12 Driehoeksmeting in willekeurige driehoeken

[Afbeelding: Cover met zendmasten en een stempel "CORRECTIESLEUTEL"]

## Inhoud
1 Cosinusregel en sinusregel voor willekeurige driehoeken
2 Toepassingen
Signaaloefeningen
Differentiatietraject
Studiewijzer

## WAT JE AL KUNT
– de formule van Pythagoras in een rechthoekige driehoek verwoorden en toepassen
– de goniometrische getallen van een scherpe hoek in een rechthoekige driehoek definiëren
– eigenschappen van de middelloodlijn van een lijnstuk verwoorden
– eigenschappen van hoeken in gelijkbenige driehoeken verwoorden
– eigenschap van de hoogtelijn uit de top van een gelijkbenige driehoek verwoorden

## IN DE KIJKER
Mathematiseren en demathematiseren van contextopgaven.

## WAT JE LEERT IN DEZE MODULE
– de cosinusregel en sinusregel opstellen voor willekeurige driehoeken
– de cosinusregel en sinusregel toepassen bij het oplossen van vraagstukken
– door middel van formules vanuit een gegeven goniometrisch getal de andere goniometrische getallen bepalen zonder de hoek zelf te berekenen

## WISKUNDETAAL
– cosinusregel
– sinusregel
– oplossen van een driehoek

--- PAGE 2 ---
## Instap

### Opdracht 1

Gegeven is een driehoek ABC met
a = |BC| = 10 cm
c = |AB| = 8 cm
B̂ = 35°

[Afbeelding: Driehoek ABC met basis BC, hoogtelijn uit A op BC met snijpunt D. B = 35°]

a) Teken de loodlijn uit A op BC, dit is de hoogtelijn uit A op BC. Noem het snijpunt van BC met de hoogtelijn het punt D.
b) Bereken |AD| en |BD| in driehoek ABD.

Driehoek ADB is rechthoekig in D, er geldt:
|AB| = 8
B̂ = 35°
D̂ = 90°

zodat:
• sin B̂ = |AD| / |AB|
  |AD| = |AB| · sin B̂
  |AD| = 8 · sin 35° ≈ 4,58861

• cos B̂ = |BD| / |AB|
  |BD| = |AB| · cos B̂
  |BD| = 8 · cos 35° ≈ 6,55322

c) Bereken |DC| en |AC| in driehoek ACD.

Driehoek ACD is rechthoekig in D, er geldt:
|AD| ≈ 4,58861
|DC| = |BC| − |BD| ≈ 3,44678
D̂ = 90°

We passen de stelling van Pythagoras toe, we krijgen:
|AC|² = |AD|² + |DC|²
|AC| ≈ 5,73896

--- PAGE 3 ---
d) Bepaal de oppervlakte van driehoek ABC.

A_ΔABC = 1 / 2 (basis · hoogte)
A_ΔABC = 1 / 2 |BC| · |AD|
A_ΔABC = 1 / 2 · 10 · |AD| ≈ 22,94305

Antwoord: De oppervlakte van driehoek ABC is ongeveer 22,94 cm².

e) Bepaal de omtrek van driehoek ABC.

p_ΔABC = |AB| + |BC| + |AC|
p_ΔABC = 8 + 10 + |AC| ≈ 23,73896

Antwoord: De omtrek van driehoek ABC is ongeveer 23,74 cm.

--- PAGE 4 ---
# 1 Cosinusregel en sinusregel voor willekeurige driehoeken

## 1.1 Cosinusregel

De **cosinusregel** geeft het verband weer tussen de drie zijden van een driehoek en de cosinus van een hoek.

formules
a² = b² + c² − 2bc · cos Â
b² = a² + c² − 2ac · cos B̂
c² = a² + b² − 2ab · cos Ĉ

[Afbeelding: Driehoek ABC met zijden a, b, c]

De cosinusregel wordt gebruikt om de lengte van de derde zijde van een driehoek te berekenen als de lengte van beide andere zijden en de grootte van hun ingesloten hoek gekend zijn.
De cosinusregel wordt ook gebruikt om de grootte van de hoeken van een driehoek te berekenen als de lengte van de drie zijden gekend zijn.

We bewijzen de eerste regel van de cosinusregel in een scherphoekige driehoek.

Gegeven: ΔABC is scherphoekig

Te bewijzen: a² = b² + c² − 2bc · cos Â

**Bewijs:**
• Teken de hoogtelijn [BD].

• Driehoek BCD is rechthoekig, er geldt:

[Afbeelding: Driehoek ABC met hoogtelijn uit B op AC met snijpunt D. Zijden a, b, c.]

a² = |BD|² + |DC|²
⇕ |DC| = b − |AD|
a² = |BD|² + (b − |AD|)²
⇕ merkwaardig product
a² = |BD|² + b² − 2b · |AD| + |AD|²
⇕ stelling van Pythagoras in ΔBDA
a² = b² + c² − 2b · |AD|
⇕ In ΔBAD: cos Â = |AD| / c of |AD| = c · cos Â
a² = b² + c² − 2bc · cos Â

**Merk op**
De stelling van Pythagoras is een bijzonder geval van de cosinusregel.
Als Â = 90° krijgen we:
a² = b² + c² − 2bc · cos Â
= b² + c² − 2bc · cos 90°
= b² + c² − 2bc · 0
= b² + c²

[Afbeelding: Rechthoekige driehoek ABC met rechte hoek in A]

--- PAGE 5 ---
**Voorbeeld 1**
Gegeven: een driehoek ABC

Gevraagd: |AB|

[Afbeelding: Driehoek ABC met hoek C = 50°, AC = 7, BC = 5]

Oplossing: c² = a² + b² − 2ab · cos Ĉ
c² = 5² + 7² − 2 · 5 · 7 · cos 50°
c = √(5² + 7² − 2 · 5 · 7 · cos 50°)
c ≈ 5,38562

AFSPRAAK: We ronden af op 5 cijfers.

**Voorbeeld 2**
Gegeven: een driehoek ABC

Gevraagd: B̂

[Afbeelding: Driehoek ABC met zijden 8, 10, 13]

Oplossing: b² = a² + c² − 2ac · cos B̂
10² = 8² + 13² − 2 · 8 · 13 · cos B̂
2 · 8 · 13 · cos B̂ = 8² + 13² − 10²
cos B̂ = (8² + 13² − 10²) / (2 · 8 · 13)
B̂ ≈ 50°15'04"

[Afbeelding: Een paprika-mannetje dat een spiegel en een geodriehoek vasthoudt]

--- PAGE 6 ---
## 1.2 Sinusregel

In elke driehoek zijn de zijden evenredig met de sinussen van de overstaande hoeken. Dit noemen we de **sinusregel**.

formule
a / sin Â = b / sin B̂ = c / sin Ĉ

De sinusregel wordt gebruikt om de lengtes van de zijden van een driehoek te berekenen als de hoeken en één zijde gekend zijn.

We bewijzen de sinusregel in een scherphoekige driehoek.

Gegeven: ΔABC is een scherphoekige driehoek

Te bewijzen: a / sin Â = b / sin B̂ = c / sin Ĉ

[Afbeelding: Driehoek ABC met hoogtelijn uit B op AC (punt D)]

**Bewijs:**
In ΔBDA geldt:
sin Â = |BD| / c
⇕
|BD| = c · sin Â

In ΔBCD geldt:
sin Ĉ = |BD| / a
⇕
|BD| = a · sin Ĉ

⇕
c · sin Â = a · sin Ĉ
c / sin Ĉ = a / sin Â

De andere gelijkheden bewijst men analoog door de hoogtelijn te tekenen uit A of C.

**Voorbeeld**
Gegeven: een driehoek ABC met a = 14, B̂ = 45° en Ĉ = 85°

Gevraagd: b

[Afbeelding: Driehoek ABC met basis BC=14, hoeken B=45°, C=85°]

Oplossing: Â = 180° − B̂ − Ĉ
= 180° − 45° − 85°
= 50°

b / sin B̂ = a / sin Â
⇓
b = (a · sin B̂) / sin Â
⇓
b = (14 · sin 45°) / sin 50°
⇓
b ≈ 12,92287

--- PAGE 7 ---
## 1.3 Oplossen van willekeurige driehoeken

### A) Type 1: de drie zijden zijn gegeven

**Voorbeeld**

Gegeven: ΔABC
 a = 7
 b = 10
 c = 12

[Afbeelding: Driehoek ABC met zijden a=7, b=10, c=12]

Gevraagd: Â, B̂ en Ĉ

Oplossing: Om de hoeken te berekenen maken we gebruik van de cosinusregel.
 
a² = b² + c² − 2bc · cos Â
cos Â = (b² + c² − a²) / 2bc
cos Â = (10² + 12² − 7²) / (2 · 10 · 12)
Â ≈ 35°39'33"

b² = a² + c² − 2ac · cos B̂
cos B̂ = (a² + c² − b²) / 2ac
cos B̂ = (7² + 12² − 10²) / (2 · 7 · 12)
B̂ ≈ 56°23'15"

c² = a² + b² − 2ab · cos Ĉ
cos Ĉ = (a² + b² − c²) / 2ab
cos Ĉ = (7² + 10² − 12²) / (2 · 7 · 10)
Ĉ ≈ 87°57'12"

Controle:
• T.o.v. de langste zijde ligt de grootste hoek en t.o.v. de kortste zijde ligt de kleinste hoek.
• De som van de drie hoeken is 180°.

--- PAGE 8 ---
### B) Type 2: twee zijden en de ingesloten hoek zijn gegeven

**Voorbeeld**

Gegeven: ΔABC
 a = 6
 c = 9
 B̂ = 42°24'

[Afbeelding: Driehoek ABC met a=6, c=9 en B=42°24']

Gevraagd: b, Â en Ĉ

Oplossing:
Bereken eerst de ontbrekende zijde met de cosinusregel.
Nadien bereken je de hoeken eveneens met de cosinusregel.

b² = a² + c² − 2ac · cos B̂
b² = 6² + 9² − 2 · 6 · 9 · cos 42°24'
b = √(6² + 9² − 2 · 6 · 9 · cos 42°24')
b ≈ 6,10302

a² = b² + c² − 2bc · cos Â
cos Â = (b² + c² − a²) / 2bc
cos Â = (6,10302² + 9² − 6²) / (2 · 6,10302 · 9)
Â ≈ 41°31'23"

c² = a² + b² − 2ab · cos Ĉ
cos Ĉ = (a² + b² − c²) / 2ab
cos Ĉ = (6² + 6,10302² − 9²) / (2 · 6 · 6,10302)
Ĉ ≈ 96°04'37"

**Merk op**
• Controleer even:
Â + B̂ + Ĉ = 180°
41°31'23" + 42°24' + 96°04'37" = 180°
180° = 180°

• Wanneer je twee zijden en de niet-ingesloten hoek gegeven hebt, dan kunnen er 0, 1 of 2 oplossingen zijn vermits sin(180° − α) = sin α. 
In dat geval controleer je of de beide oplossingen mogelijk zijn.
Tegenover de langste zijde ligt de grootste hoek.

[Afbeelding: Twee driehoeken die aantonen dat er 2 mogelijke constructies zijn met zijden 3 en 7 en hoek 20°. Bij de ene hoek α, bij de andere 180°-α]
of
sin(180° − α) = sin α.

--- PAGE 9 ---
### C) Type 3: één zijde en twee hoeken zijn gegeven

**Voorbeeld**

Gegeven: ΔABC
 b = 11
 Â = 58°47'
 B̂ = 63°48'

[Afbeelding: Driehoek ABC met A=58°47', B=63°48', b=11]

Gevraagd: a, c en Ĉ

Oplossing:
Bereken eerst de ontbrekende hoek.
Bereken nadien de zijden met behulp van de sinusregel.

Ĉ = 180° − Â − B̂
= 180° − 58°47' − 63°48'
= 57°25'

a / sin Â = b / sin B̂
a = (b · sin Â) / sin B̂
a = (11 · sin 58°47') / sin 63°48'
a ≈ 10,48455

c / sin Ĉ = b / sin B̂
c = (b · sin Ĉ) / sin B̂
c = (11 · sin 57°25') / sin 63°48'
c ≈ 10,33002

--- PAGE 10 ---
# Verwerkingsopdrachten 1, 2

1
Gegeven: ΔABC
Gevraagd: |AC|

[Afbeelding: Driehoek ABC met c=7, a=9,2 en B=140°]

Berekenen van |AC| in driehoek ABC met cosinusregel:
b² = a² + c² − 2ac cos B̂
b² = 9,2² + 7² − 2 · 9,2 · 7 · cos 140°
b = √(9,2² + 7² − 2 · 9,2 · 7 · cos 140°)
b ≈ 15,10184
|AC| ≈ 15,10184

--- PAGE 11 ---
2
Gegeven: ΔKLM
Gevraagd: K̂

[Afbeelding: Driehoek KLM met l=11, m=4 en L=70°]

|KM| / sin L̂ = |LM| / sin K̂
11 / sin 70° = 4 / sin K̂
sin K̂ = (4 · sin 70°) / 11
K̂ ≈ 19°58'51"

--- PAGE 12 ---
3
Gegeven: ΔPQR
Gevraagd: |PQ|

[Afbeelding: Driehoek PQR met r=8,5, Q=100° en R=55°]

|PQ| / sin R̂ = |PR| / sin Q̂
|PQ| = (8,5 · sin 55°) / sin 100°
|PQ| ≈ 7,0702

--- PAGE 13 ---
4
Gegeven: ΔFGH
 h = 48
 g = 62
 f = 54

[Afbeelding: Driehoek FGH met zijden f, g, h]

Gevraagd: F̂, Ĝ en Ĥ

Oplossing:
• h² = g² + f² − 2gf · cos Ĥ
cos Ĥ = (g² + f² − h²) / 2gf
cos Ĥ = (62² + 54² − 48²) / (2 · 62 · 54)
Ĥ ≈ 48°16'53"

• g² = h² + f² − 2hf · cos Ĝ
cos Ĝ = (h² + f² − g²) / 2hf
cos Ĝ = (48² + 54² − 62²) / (2 · 48 · 54)
Ĝ ≈ 74°36'27"

• f² = g² + h² − 2gh · cos F̂
cos F̂ = (g² + h² − f²) / 2gh
cos F̂ = (62² + 48² − 54²) / (2 · 62 · 48)
F̂ ≈ 57°06'40"

--- PAGE 14 ---
5
Gegeven: ΔPQR r = 27
P̂ = 59°
Q̂ = 95°

[Afbeelding: Driehoek PQR met r-zijde aangeduid, Q=95°, P=59°]

Gevraagd: p, q en R̂

Oplossing:
• R̂ = 180° − P̂ − Q̂
= 180° − 59° − 95°
= 26°

• r / sin R̂ = p / sin P̂
p = (r · sin P̂) / sin R̂
p = (27 · sin 59°) / sin 26°
p ≈ 52,79434

• r / sin R̂ = q / sin Q̂
q = (r · sin Q̂) / sin R̂
q = (27 · sin 95°) / sin 26°
q ≈ 61,35727

--- PAGE 15 ---
# 2 Toepassingen

## 2.1 Lengte van een zwaartelijn

In driehoek ABC is
B̂ = 80°
|AB| = 19 cm
|BC| = 24 cm
en BD een zwaartelijn.

[Afbeelding: Driehoek ABC met zwaartelijn BD. B=80°]

Bereken de lengte van [BD].

Oplossing:
We werken in driehoek ABC:
|AC|² = |AB|² + |BC|² − 2 |AB| · |BC| · cos B̂
|AC|² = 19² + 24² − 2 · 19 · 24 · cos 80°
|AC| ≈ 27,90399

|BC|² = |AB|² + |AC|² − 2 |AB| · |AC| · cos Â
cos Â = (|AB|² + |AC|² − |BC|²) / (2 |AB| · |AC|)
cos Â = (19² + 27,90399² − 24²) / (2 · 19 · 27,90399)
Â ≈ 57°53'22"

We werken in driehoek ABD:
|AD| = 1 / 2 |AC| ≈ 13,952
|BD|² = |AB|² + |AD|² − 2 |AB| · |AD| · cos Â
|BD|² = 19² + 13,952² − 2 · 19 · 13,952 · cos(57°53'22")
|BD| ≈ 16,54817

Antwoord: |BD| is ongeveer 16,54817 cm.

--- PAGE 16 ---
## 2.2 Hoogte van een beeld

Bepaal de hoogte van het beeld (zonder sokkel) als je weet dat
α = BÂC = 36°, β = CÂD = 34° en |AB| = 2 m.

[Afbeelding: Standbeeld op sokkel met driehoeken voor meting]

Oplossing:
|BD| = tan(α + β) · |AB|
= tan 70° · 2
≈ 5,49495
|BC| = tan α · |AB|
= tan 36° · 2
≈ 1,45309
|DC| = |BD| − |BC|
= 5,49495 − 1,45309
= 4,04186

Antwoord: Het beeld is ongeveer 4,042 meter hoog.

## 2.3 Afstand tussen twee bomen

Liam en Elijah bevinden zich aan de ene kant van een beek. Ze willen de afstand tussen twee bomen aan de overkant meten zonder de beek te moeten oversteken. Daarvoor doen ze volgende metingen vanuit de punten A en B die 8 meter uit elkaar staan.
α = CÂB = 40°
β = DÂC = 30°
γ = D B̂A = 30°
δ = C B̂D = 20°
|AB| = 8 m

[Afbeelding: Bovenaanzicht van rivier met meetpunten A,B en bomen C,D. Met driehoeken die de hoeken aantonen.]

Hoe ver staan de bomen C en D uit elkaar?

Oplossing:
We werken in driehoek ABC:
Â = 40°
Ĉ = 180° − 40° − 50°
= 90°

|BC| / sin Â = |AB| / sin Ĉ
|BC| = (|AB| · sin Â) / sin Ĉ
= (8 · sin 40°) / sin 90°
≈ 5,14230

--- PAGE 17 ---
We werken in driehoek ABD:
Â = 70°
D̂ = 180° − 70° − 30°
= 80°

|BD| / sin Â = |AB| / sin D̂
|BD| = (|AB| · sin Â) / sin D̂
= (8 · sin 70°) / sin 80°
≈ 7,63351

We werken in driehoek BCD:
|DC|² = |BD|² + |BC|² − 2 |BD| · |BC| · cos B̂
|DC|² = 7,63351² + 5,14230² − 2 · 7,63351 · 5,14230 · cos 20°
|DC| ≈ 3,30768

Antwoord: De bomen staan ongeveer 3,308 meter uit elkaar.

# Verwerkingsopdrachten 3, 4, 5, 6

6
In driehoek ABC is
Â = 36°
B̂ = 80°
|AB| = 18 cm
en CD een hoogtelijn.

[Afbeelding: Driehoek ABC met hoogtelijn CD. a=36°, B=80°]

Bereken de lengte van [CD].

Berekenen van |AC| in driehoek ABC via de sinusregel:
Ĉ = 180° − Â − B̂ = 180° − 36° − 80° = 64°
c / sin Ĉ = b / sin B̂
b = (c · sin B̂) / sin Ĉ
b = (18 · sin 80°) / sin 64°
b = |AC| ≈ 19,72258

Berekenen van |CD| in de rechthoekige driehoek ACD:
|CD| = |AC| · sin Â
|CD| = |AC| · sin 36°
|CD| ≈ 11,59264

Antwoord: De lengte van [CD] is ongeveer 11,59 cm.

--- PAGE 18 ---
7
Bereken de hoogte van de vuurtoren als je weet dat
α = 48°, β = 34° en |EF| = 60 m.

[Afbeelding: Vuurtoren met twee meethoeken vanaf de grond (α, β)]

Berekenen van |EG| in driehoek EGF via de sinusregel:
Ê = 180° − 48° = 132°
F̂ = 34°
Ĝ = 180° − Ê − F̂ = 180° − 132° − 34° = 14°

g / sin Ĝ = f / sin F̂
f = (g · sin F̂) / sin Ĝ
f = (60 · sin 34°) / sin 14°
f = |EG| ≈ 138,68763

Berekenen van |DG| in de rechthoekige driehoek DGE:
|DG| = |EG| · sin α
|DG| = |EG| · sin 48°
|DG| ≈ 103,0500

Antwoord: De vuurtoren is ongeveer 103,065 m hoog.

--- PAGE 19 ---
8
Gegeven: een balk
Gevraagd: Bepaal α.

[Afbeelding: Balk met maten 4, 5, 10 en hoek α in ruimtediagonaal]

|AI|² = |ID|² + |AD|²
|AI|² = 2² + 10²
|AI| = √104 = 2√26

tan α = |IJ| / |AI|
tan α = 5 / (2√26)
α ≈ 26°7'6"

9
Gegeven: A(−4, 3); B(2, 7) en C(8, 10)
Gevraagd: Bepaal de grootte van de grootste hoek.

[Afbeelding: Assenstelsel met punten A, B, C en lijnen daartussen]

|AC|² = 12² + 7²
|AC| = √193

|AB|² = 6² + 4²
|AB| = √52

|BC|² = 6² + 3²
|BC| = √45

|AC|² = |AB|² + |BC|² − 2|AB| · |BC| · cos B̂
193 = 52 + 45 − 2 · √52 · √45 · cos B̂
cos B̂ = (52 + 45 − 193) / (2√52√45)
cos B̂ = −24 / √585
B̂ ≈ 172°52'30"

--- PAGE 20 ---
# Signaaloefeningen

1
Gegeven: ΔKLM
 m = |KL| = 8
 l = |KM| = 8
 K̂ = 50°
Gevraagd: Bereken k = |LM| , L̂ en M̂.

[Afbeelding: Driehoek KLM met K=50°]

>>> Verder oefenen: D1 t.e.m. D6

• k² = m² + l² − 2ml · cos K̂
= 8² + 8² − 2 · 8 · 8 · cos 50°
k ≈ 6,76189

• l² = k² + m² − 2km · cos L̂
cos L̂ = (k² + m² − l²) / 2km
cos L̂ = (k² + 8² − 8²) / (2 · k · 8)
L̂ ≈ 65°

• M̂ = L̂ = 65°

--- PAGE 21 ---
2
Gegeven: ΔUVW
 |UV| = 135
 Û = 25°
 V̂ = 45°
Gevraagd: Bereken |UW| , |VW| en Ŵ.

[Afbeelding: Driehoek UVW met V=45°, U=25°]

>>> Verder oefenen: D1 t.e.m. D6

• Ŵ = 180° − Û − V̂ = 180° − 25° − 45° = 110°

• w / sin Ŵ = u / sin Û
u = (w · sin Û) / sin Ŵ
u = (135 · sin 25°) / sin 110°
u ≈ 60,71503

• w / sin Ŵ = v / sin V̂
v = (w · sin V̂) / sin Ŵ
v = (135 · sin 45°) / sin 110°
v ≈ 101,58579

--- PAGE 22 ---
3
In een driehoek ABC is
|AB| = 34 cm
|AC| = 26 cm
|BC| = 18 cm
en AD een bissectrice.
Bereken de lengte van [AD].

[Afbeelding: Driehoek ABC met bissectrice AD]

>>> Verder oefenen: D7 t.e.m. D22

Berekenen van de hoeken Â en B̂ in driehoek ABC: 
• a² = b² + c² − 2bc · cos Â
cos Â = (b² + c² − a²) / 2bc
cos Â = (26² + 34² − 18²) / (2 · 26 · 34)
Â ≈ 31°28'01"

• b² = a² + c² − 2ac · cos B̂
cos B̂ = (a² + c² − b²) / 2ac
cos B̂ = (18² + 34² − 26²) / (2 · 18 · 34)
B̂ ≈ 48°56'20"

Berekenen van |AD| in driehoek ABD:
Â = 1 / 2 · 31°28'01" ≈ 15°44'01"
B̂ ≈ 48°56'20"
D̂ = 180° − Â − B̂ = 115°19'39"
d = |AB| = 34

d / sin D̂ = b / sin B̂
b = (d · sin B̂) / sin D̂
b = (34 · sin 48°56'20") / sin 115°19'39"
|AD| = b ≈ 28,36261

Antwoord: De lengte van [AD] is ongeveer 28,36 cm.

4
Twee opeenvolgende zijden van een parallellogram meten 6 cm en 7 cm en vormen een hoek van 47°20'. 
Bereken de lengte van de diagonalen van dit parallellogram (op 0,1 cm nauwkeurig).

[Afbeelding: Parallellogram ABCD met hoek 47°20']

>>> Verder oefenen: D7 t.e.m. D22

In driehoek ADB:
|AB| = 7
|AD| = 6
Â = 47°20'
|DB|² = |AB|² + |AD|² − 2|AB| · |AD| · cos Â
= 7² + 6² − 2 · 7 · 6 · cos 47°20'
|DB| ≈ 5,29816

In driehoek ACB:
|AB| = 7
|CB| = 6
B̂ = 180° − 47°20' = 132°40'
|AC|² = |AB|² + |CB|² − 2|AB| · |CB| · cos B̂
= 7² + 6² − 2 · 7 · 6 · cos 132°40'
|AC| ≈ 11,91342

Antwoord: De lengte van de diagonalen zijn ongeveer 5,3 cm en 11,9 cm.

--- PAGE 23 ---
5
Bepaal de hoogte van het standbeeld (voetstuk niet meegerekend) als je weet dat
α = BÂC = 10°, β = CÂD = 30° en |AB| = 4 m.

[Afbeelding: Standbeeld op voetstuk, met driehoeken α en β]

>>> Verder oefenen: D7 t.e.m. D22

Berekenen van |DB| in rechthoekige driehoek ADB:
|DB| = |AB| · tan(α + β)
= 4 · tan(10° + 30°)
≈ 3,35640

Berekenen van |CB| in rechthoekige driehoek ACB:
|CB| = |AB| · tan α
= 4 · tan 10°
≈ 0,70531

Hoogte van het standbeeld:
|DC| = |DB| − |CB| ≈ 2,65109

Antwoord: Het beeld is ongeveer 2,65 m hoog.

6
Gegeven: |TA| = |TB| = |TC| = |TD|
ABCD is een vierkant
Gevraagd: Bereken de hoek α.

[Afbeelding: Piramide met vierkant grondvlak ABCD, top T. Ribbe opstaand 12, ribbe grondvlak 5]

>>> Verder oefenen: D7 t.e.m. D22

In ΔABT geldt:
|AB|² = |AT|² + |BT|² − 2 · |AT| · |AB| · cos T̂
25 = 144 + 144 − 2 · 12 · 12 · cos T̂
25 = 288 − 288 · cos T̂
cos T̂ = 263 / 288
T̂ ≈ 24°2'58"

--- PAGE 24 ---
# Differentiatietraject

1
Vul de volgende formules aan.
a) w² = u² + …
b) m² = k² + …
c) l² = k² + …
d) … = u² + w² − …
e) u / sin Û = v / … = … / sin Ŵ
f) k / sin K̂ = …

[Afbeelding: Twee willekeurige driehoeken UVW en KLM]

a) w² = u² + v² − 2uv · cos Ŵ
b) m² = k² + l² − 2kl · cos M̂
c) l² = k² + m² − 2km · cos L̂
d) v² = u² + w² − 2uw · cos V̂
e) u / sin Û = v / sin V̂ = w / sin Ŵ
f) k / sin K̂ = l / sin L̂ = m / sin M̂

2
Gegeven: ΔABC
 b = 11 cm
 c = 19 cm
 Â = 75°
Gevraagd: de zijde a

[Afbeelding: Driehoek ABC met A=75°]

a² = b² + c² − 2bc · cos Â
a² = 11² + 19² − 2 · 11 · 19 · cos 75°
a ≈ 19,33426

--- PAGE 25 ---
3
Gegeven: ΔABC
 a = 20 cm
 Â = 44°
 B̂ = 77°
Gevraagd: de zijde b

[Afbeelding: Driehoek ABC met A=44°, B=77°]

b / sin B̂ = a / sin Â
b = (a · sin B̂) / sin Â
b = (20 · sin 77°) / sin 44°
b ≈ 28,05322

4
Gegeven: ΔABC
 a = 67 cm
 b = 73 cm
 c = 81 cm
Gevraagd: Bereken de hoek B̂.

b² = a² + c² − 2ac · cos B̂
cos B̂ = (a² + c² − b²) / 2ac
cos B̂ = (67² + 81² − 73²) / (2 · 67 · 81)
B̂ ≈ 58°11'28"

--- PAGE 26 ---
5
Los volgende driehoeken ABC op.

| | a | b | c | Â | B̂ | Ĉ |
|---|---|---|---|---|---|---|
| a) | 17 | 22 | 30 | 33°56'53" | 46°16'36" | 99°46'31" |
| b) | 38,37 | 27 | 34 | 77° | 43°17'27" | 59°42'33" |
| c) | 24,82 | 23,74 | 19 | 70° | 64° | 46° |
| d) | 8,9 | 6,81 | 8,51 | 70° | 46° | 64° |
| e) | 7,4 | 7,4 | 9,51 | 50° | 50° | 80° |
| f) | 12,9 | 14,0 | 19,2 | 42°12'15" | 46°48'27" | 90°59'18" |
| g) | 59,97 | 60 | 57,41 | 61°23' | 61°26' | 57°11' |
| h) | 5 | 12,47 | 15 | 18°09' | 51° | 110°51' |

6
In driehoek ABC is [AB] driemaal zo lang als [AC] en is Â = 44°. Bereken Ĉ.

[Afbeelding: Driehoek ABC, erg afgevlakt met stomp punt in C]

|AC| = k
|AB| = 3k
Â = 44°

• a² = b² + c² − 2bc · cos Â
= k² + 9k² − 2 · k · 3k · cos 44°
≈ (5,6840)k²
a ≈ 2,3841k

• c² = a² + b² − 2ab · cos Ĉ
cos Ĉ = (a² + b² − c²) / 2ab
cos Ĉ = (5,6840k² + k² − 9k²) / (2 · 2,3841k · k)
cos Ĉ = (5,6840 + 1 − 9) / (2 · 2,3841)
Ĉ ≈ 119°3'34"

--- PAGE 27 ---
7
Ga na hoe ver beide bomen uit elkaar staan als je weet dat |PA| = 80 m, |PB| = 150 m en P̂ = 130°.

[Afbeelding: Twee palmbomen A en B, bekeken vanuit punt P. Hoek is 130°]

|AB|² = |PA|² + |PB|² − 2|PA| · |PB| · cos P̂
|AB|² = 80² + 150² − 2 · 80 · 150 · cos 130°
|AB| ≈ 210,53955

Antwoord: De bomen staan ongeveer 210,54 m uit elkaar.

8
Ga na hoe ver beide torens van elkaar verwijderd zijn als je weet dat |DF| = 400 m, D̂ = 26° en F̂ = 74°.

[Afbeelding: Twee vuurtorens met meetpunten, hoeken 26° en 74°]

Ê = 180° − D̂ − F̂ = 180° − 26° − 74° = 80°

|DE| / sin F̂ = |DF| / sin Ê
|DE| = (|DF| · sin F̂) / sin Ê
|DE| = (400 · sin 74°) / sin 80°
|DE| ≈ 390,43628

Antwoord: De torens staan ongeveer 390,44 m uit elkaar.

--- PAGE 28 ---
9
Bereken de hoeken tussen de zendmasten als je weet dat |AB| = 6 km, |BC| = 7 km en |AC| = 7 km.

[Afbeelding: Driehoek ABC gevormd door 3 zendmasten]

• a² = b² + c² − 2bc · cos Â
cos Â = (b² + c² − a²) / 2bc
cos Â = (7² + 6² − 7²) / (2 · 7 · 6)
Â ≈ 64°37'23"

• b² = a² + c² − 2ac · cos B̂
cos B̂ = (a² + c² − b²) / 2ac
cos B̂ = (7² + 6² − 7²) / (2 · 7 · 6)
B̂ ≈ 64°37'23"

• c² = a² + b² − 2ab · cos Ĉ
cos Ĉ = (a² + b² − c²) / 2ab
cos Ĉ = (7² + 7² − 6²) / (2 · 7 · 7)
Ĉ ≈ 50°45'14"

--- PAGE 29 ---
10
De diagonalen van een parallellogram snijden elkaar onder een hoek van 54° en hebben respectievelijke lengtes van 16 cm en 20 cm. Bereken de zijden van dit parallellogram (nauwkeurigheid tot op 0,1 cm).

[Afbeelding: Parallellogram ABCD met diagonalen die snijden in S onder 54°]

In driehoek ASD:
|AS| = 10
|SD| = 8
Ŝ = 54°

|DA|² = |AS|² + |SD|² − 2|AS| · |SD| · cos Ŝ
|DA|² = 10² + 8² − 2 · 10 · 8 · cos 54°
|DA| ≈ 8,36387

In driehoek ABS:
|AS| = 10
|BS| = 8
Ŝ = 180° − 54° = 126°

|AB|² = |AS|² + |BS|² − 2|AS| · |BS| · cos Ŝ
|AB|² = 10² + 8² − 2 · 10 · 8 · cos 126°
|AB| ≈ 16,06380

Antwoord: De lengtes van de zijden zijn ongeveer 8,4 cm en 16,1 cm.

11
In driehoek ABC is
|BC| = 7 cm
|AC| = 7 cm
|AB| = 6 cm
en AD een zwaartelijn.

Bereken de lengte van [AD].

[Afbeelding: Driehoek ABC met zwaartelijn AD]

Berekenen van de hoek B̂ in driehoek ABC: 
b² = a² + c² − 2ac · cos B̂
cos B̂ = (a² + c² − b²) / 2ac
cos B̂ = (7² + 6² − 7²) / (2 · 7 · 6)
B̂ ≈ 64°37'23"

Berekenen van |AD| in driehoek ABD:
a = |BD| = 1 / 2 |BC| = 3,5
b = |AD|
d = |AB| = 6

b² = a² + d² − 2ad · cos B̂
b² = (3,5)² + 6² − 2 · 3,5 · 6 · cos B̂
b = |AD| ≈ 5,50000

Antwoord: De lengte van [AD] is ongeveer 5,5 cm.

--- PAGE 30 ---
12
In driehoek ABC is
|BC| = 7 cm
B̂ = 60°
Ĉ = 75°
en AD een zwaartelijn.

Bereken de lengte van [AD].

[Afbeelding: Driehoek ABC met zwaartelijn AD]

Berekenen van |AB| in driehoek ABC:
Â = 180° − B̂ − Ĉ = 180° − 60° − 75° = 45°

a / sin Â = c / sin Ĉ
c = (a · sin Ĉ) / sin Â
c = (7 · sin 75°) / sin 45°
c = |AB| ≈ 9,56218

Berekenen van |AD| in driehoek ABD:
a = |BD| = 1 / 2 |BC| = 3,5
b = |AD|
d = |AB| ≈ 9,56218

b² = a² + d² − 2ad · cos B̂
b² = (3,5)² + d² − 2 · 3,5 · d · cos 60°
b = |AD| ≈ 8,37960

Antwoord: De lengte van [AD] is ongeveer 8,38 cm.

--- PAGE 31 ---
13
In driehoek ABC is
|BC| = 8 cm
|AC| = 7 cm
|AB| = 5 cm
en AD een hoogtelijn.

Bereken de lengte van [AD].

[Afbeelding: Driehoek ABC met hoogtelijn AD]

Berekenen van de hoek B̂ in driehoek ABC: 
b² = a² + c² − 2ac · cos B̂
cos B̂ = (a² + c² − b²) / 2ac
cos B̂ = (8² + 5² − 7²) / (2 · 8 · 5)
B̂ = 60°

Berekenen van |AD| in rechthoekige driehoek ABD:
|AD| = |AB| · sin B̂
|AD| = 5 · sin 60°
|AD| ≈ 4,33013

Antwoord: De lengte van [AD] is ongeveer 4,33 cm.

--- PAGE 32 ---
14
In driehoek ABC is
|BC| = 16 cm
|AB| = 10 cm
B̂ = 72°
en BD een bissectrice.

Bereken de lengte van [BD].

[Afbeelding: Driehoek ABC met bissectrice BD]

Berekenen van |AC| en de hoek Â in driehoek ABC: 
• b² = a² + c² − 2ac · cos B̂
b² = 16² + 10² − 2 · 16 · 10 · cos 72°
b ≈ 16,03479

• a² = b² + c² − 2bc · cos Â
cos Â = (b² + c² − a²) / 2bc
cos Â = (b² + 10² − 16²) / (2 · b · 10)
Â ≈ 71°37'16"

Berekenen van |BD| in driehoek ABD:
Â ≈ 71°37'16"
B̂ = 1 / 2 · 72° = 36°
D̂ = 180° − 71°37'16" − 36° = 72°22'44"

|AB| = 10

|BD| / sin Â = |AB| / sin D̂
|BD| = (|AB| · sin Â) / sin D̂
|BD| = (10 · sin 71°37'16") / sin 72°22'44"
|BD| ≈ 9,95712

Antwoord: De lengte van [BD] is ongeveer 9,96 cm.

--- PAGE 33 ---
15
Gegeven is een trapezium met:
Â = 48°
|AB| = 5 cm
|AD| = 12 cm
|BC| = 4 cm

Gevraagd:
a) de grootte van de hoek D̂
b) de omtrek van het trapezium

[Afbeelding: Trapezium ABCD. a=48° in A]

Teken de loodlijn uit B op AD en noem het voetpunt E.
Teken de loodlijn uit C op AD en noem het voetpunt F.

Berekenen van |AE| en |BE| in rechthoekige driehoek ABE:
|AE| = |AB| · cos Â
|AE| = 5 · cos 48°
|AE| ≈ 3,34653

|BE| = |AB| · sin Â
|BE| = 5 · sin 48°
|BE| ≈ 3,71572

Berekenen van |CD| en hoek D̂ in rechthoekige driehoek DCF: 
|CF| = |BE| ≈ 3,71572
|FD| = |AD| − |AE| − |BC| ≈ 4,65347

|CD|² = |CF|² + |FD|²
|CD| ≈ 5,95494

tan D̂ = |CF| / |FD|
D̂ ≈ 38°36'06"

Omtrek:
p = |AB| + |BC| + |CD| + |DA|
p = 5 + 4 + |CD| + 12
p ≈ 26,95494

Antwoord: De hoek D̂ = 38°36'06" en de omtrek is ongeveer 26,95 cm.

--- PAGE 34 ---
16
Bereken de hoogte van de toren als je weet dat α = 66°, β = 38° en |DE| = 20 m.

[Afbeelding: Kasteeltoren gemeten met hoeken α en β. Basis D en E, top F.]

Teken uit F de loodlijn op de rechte DE, noem het voetpunt A. De hoogte van de toren is gelijk aan |AF|.

Berekenen van |FE| in driehoek DFE:
f = |DE| = 20
D̂ = 180° − α = 180° − 66° = 114°
Ê = β = 38°
F̂ = 180° − D̂ − Ê = 180° − 114° − 38° = 28°

d / sin D̂ = f / sin F̂
d = (f · sin D̂) / sin F̂
d = (20 · sin 114°) / sin 28°
d = |FE| ≈ 38,91803

Berekenen van |AF| in de rechthoekige driehoek AFE:
|AF| = |FE| · sin β
|AF| = |FE| · sin 38°
|AF| ≈ 23,96033

Antwoord: De hoogte van de toren is ongeveer 23,96 m.

--- PAGE 35 ---
17
Bepaal de hoogte van het standbeeld (voetstuk niet meegerekend) als je weet dat α = BÂC = 42°, β = CÂD = 38° en |AB| = 0,5 m.

[Afbeelding: Beeld van Freddy Mercury op voetstuk, gemeten met 2 hoeken]

|BD| = tan(α + β) · |AB|
= tan 80° · 0,5
≈ 2,83564

|BC| = tan α · |AB|
= tan 42° · 0,5
≈ 0,45020

|DC| = |BD| − |BC|
= 2,83564 − 0,45020
= 2,38544

Antwoord: Het beeld is ongeveer 2,39 meter hoog.

--- PAGE 36 ---
18
Gegeven: |AP| = 2
Gevraagd: Bepaal F P̂ G. 

[Afbeelding: Kubus met zijden 6. Punt P ligt op ribbe AD, met AP=2.]

in ΔDGC is |DC| = |GC| = 6
|GD|² = |DC|² + |GC|²
|GD|² = 36 + 36
|GD|² = 72

in ΔFBA is |FB| = |AB| = 6
|AF|² = |FB|² + |AB|²
|AF|² = 36 + 36
|AF|² = 72

in ΔPGD is |PD| = 6 − 2 = 4 en D̂ = 90°
|PG|² = |PD|² + |GD|²
|PG|² = 16 + 72
|PG|² = 88

in ΔAFP is |AP| = 6 − 4 = 2 en Â = 90°
|PF|² = |AF|² + |AP|²
|PF|² = 4 + 72
|PF|² = 76

in ΔFGP: |FG|² + |PG|² − 2|PF||PG| · cos P̂
36 = 76 + 88 − 2√76√88 · cos P̂
36 = 164 − 2√76√88 · cos P̂
2√76√88 · cos P̂ = 128
cos P̂ = 128 / (2√76√88)
P̂ ≈ 38°30'7"

--- PAGE 37 ---
19
Kasper en Lyssa bezoeken in Italië een mooi aangelegde tuin. Aan de overkant van een beek staan heel wat standbeelden. Ze vragen zich af hoe ver de twee beelden van elkaar verwijderd staan. Daarvoor doen ze enkele metingen.
α = CÂB = 35°
β = DÂC = 75°
γ = D B̂A = 20°
δ = C B̂D = 85°
|AB| = 15 m

[Afbeelding: Tekening van beekje. A en B staan aan ene kant, beelden C en D aan overkant. Hoeken getekend.]

Hoe ver staan de twee beelden C en D van elkaar?

Berekenen van |DB| in driehoek ADB:
Â = α + β = 35° + 75° = 110°
D̂ = 180° − α − β − γ = 180° − 35° − 75° − 20° = 50°

|DB| / sin Â = |AB| / sin D̂
|DB| = (|AB| · sin Â) / sin D̂
|DB| = (15 · sin 110°) / sin 50°
|DB| ≈ 18,40022

Berekenen van |CB| in driehoek ACB:
Â = α = 35°
Ĉ = 180° − α − γ − δ = 180° − 35° − 20° − 85° = 40°

|CB| / sin Â = |AB| / sin Ĉ
|CB| = (|AB| · sin Â) / sin Ĉ
|CB| = (15 · sin 35°) / sin 40°
|CB| ≈ 13,38490

Berekenen van |DC| in driehoek BDC:
|DC|² = |CB|² + |BD|² − 2|CB| · |BD| · cos δ
|DC| ≈ 21,78975

Antwoord: De twee beelden staan ongeveer 21,8 m uit elkaar.

--- PAGE 38 ---
20
formule
A_ΔABC = (basis · hoogte) / 2

formule
A_ΔABC = 1 / 2 · zijde 1 · zijde 2 · sinus ingesloten hoek
A_ΔABC = 1 / 2 · ab · sin Ĉ = 1 / 2 · ac · sin B̂ = 1 / 2 · bc · sin Â

[Afbeelding: Driehoek ABC met a,b,c]

Deze formule noemen we de goniometrische oppervlakteformule van een driehoek.

a) Bewijs deze formule.

b) Gegeven: ΔDEF
 e = 17
 f = 23
 D̂ = 101°
Gevraagd: oppervlakte van ΔDEF

[Afbeelding: Driehoek DEF met D=101°]

c) Bepaal de oppervlakte van de vierhoek DEFG met
|DE| = 14 m
|DF| = 20 m
|DG| = 16 m
|EF| = 17 m
|EG| = 20 m

[Afbeelding: Vierhoek DEFG met diagonalen]

d) In driehoek ABC is 
B̂ = 40°
|AB| = 19 cm
|BC| = 24 cm
en MD een middelloodlijn.
Bereken de oppervlakte van vierhoek ADMC.

[Afbeelding: Driehoek ABC met middelloodlijn MD]

e) Bepaal de oppervlakte van de vierhoek PQRS met
|PQ| = 67 m
|QR| = 88 m
|RS| = 53 m
|SP| = 71 m
P̂ = 80°

[Afbeelding: Vierhoek PQRS met P=80°]

--- PAGE 39 ---
a) Bewijs:
sin Â = |BD| / c ⇒ |BD| = c · sin Â

zodat
A_ΔABC = (basis · hoogte) / 2
= (|AC| · |BD|) / 2
= 1 / 2 bc · sin Â

b) A_ΔDEF = 1 / 2 · e · f · sin D̂ = 1 / 2 · 17 · 23 · sin 101° ≈ 191,90811

c) Berekenen van de hoeken D̂ en Ê in driehoek DEF:
• d² = e² + f² − 2ef · cos D̂
cos D̂ = (e² + f² − d²) / 2ef
cos D̂ = (20² + 14² − 17²) / (2 · 20 · 14)
D̂ ≈ 56°45'19"

• e² = d² + f² − 2df · cos Ê
cos Ê = (d² + f² − e²) / 2df
cos Ê = (17² + 14² − 20²) / (2 · 17 · 14)
Ê ≈ 79°42'48"

Berekenen van de hoek D̂ in driehoek DEG:
d² = e² + g² − 2eg · cos D̂
cos D̂ = (e² + g² − d²) / 2eg
cos D̂ = (16² + 14² − 20²) / (2 · 16 · 14)
D̂ ≈ 83°20'04"

Berekenen van de hoek D̂ in driehoek DFG:
G D̂ F = G D̂ E − F D̂ E
≈ 26°34'45"

Oppervlakte driehoek DEF:
A_ΔDEF = 1 / 2 · |DE| · |DF| · sin F D̂ E
= 1 / 2 · 14 · 20 · sin F D̂ E
≈ 117,08713

Oppervlakte driehoek DFG:
A_ΔDFG = 1 / 2 · |DF| · |DG| · sin G D̂ F
= 1 / 2 · 20 · 16 · sin G D̂ F
≈ 71,58943

Oppervlakte vierhoek DEFG:
A_DEFG = A_ΔDEF + A_ΔDFG
≈ 188,67656

Antwoord: De oppervlakte van de vierhoek DEFG is ongeveer 188,68 m².

--- PAGE 40 ---
d) Oppervlakte driehoek ABC:
A_ΔABC = 1 / 2 |AB| · |BC| · sin B̂
= 1 / 2 · 19 · 24 · sin 40°
≈ 146,55558

Berekenen van |BM| en |DB| in rechthoekige driehoek BMD:
|BM| = 1 / 2 |BC| = 12
|DB| = |BM| / cos B̂ = 12 / cos 40° ≈ 15,66489

Oppervlakte driehoek BMD:
A_ΔBMD = 1 / 2 |BM| · |DB| · sin B̂
= 1 / 2 · 12 · |DB| · sin 40°
≈ 60,41518

Oppervlakte vierhoek ADMC:
A_ADMC = A_ΔABC − A_ΔBMD
≈ 86,1404

Antwoord: De oppervlakte van de vierhoek ADMC is ongeveer 86,14 cm².

e) De zijde |QS| in driehoek PQS:
|QS|² = |SP|² + |PQ|² − 2|SP| · |PQ| · cos P̂
|QS|² = 71² + 67² − 2 · 71 · 67 · cos 80°
|QS| ≈ 88,75760

De hoek R̂ in driehoek QRS: 
|QS|² = |RS|² + |QR|² − 2|RS| · |QR| · cos R̂
cos R̂ = (|RS|² + |QR|² − |QS|²) / (2|RS| · |QR|)
cos R̂ = (53² + 88² − |QS|²) / (2 · 53 · 88)
R̂ ≈ 73°20'05"

Oppervlakte driehoek PQS:
A_ΔPQS = 1 / 2 |SP| · |PQ| · sin P̂
= 1 / 2 · 71 · 67 · sin 80°
≈ 2342,36524

Oppervlakte driehoek QRS:
A_ΔQRS = 1 / 2 |RS| · |QR| · sin R̂
= 1 / 2 · 53 · 88 · sin R̂
≈ 2234,04776

Oppervlakte vierhoek PQRS:
A_PQRS = A_ΔPQS + A_ΔQRS
≈ 4576,413

Antwoord: De oppervlakte van de vierhoek PQRS is ongeveer 4576,41 m².

--- PAGE 41 ---
21
Ga na hoe ver beide torens uit elkaar staan als je weet dat:

α = CÂB = 25°
β = DÂC = 85°
γ = D B̂A = 30°
δ = C B̂D = 100°
|AB| = 60 m

[Afbeelding: Rivier met torens C en D. Meetpunten A en B met diverse hoeken in de tekening]

Berekenen van |DB| in driehoek ADB:
Â = α + β = 25° + 85° = 110°
D̂ = 180° − α − β − γ = 180° − 25° − 85° − 30° = 40°

|DB| / sin Â = |AB| / sin D̂
|DB| = (|AB| · sin Â) / sin D̂
|DB| = (60 · sin 110°) / sin 40°
|DB| ≈ 87,71413

Berekenen van |CB| in driehoek ACB:
Â = α = 25°
Ĉ = 180° − α − γ − δ = 180° − 25° − 30° − 100° = 25°

|CB| / sin Â = |AB| / sin Ĉ
|CB| = (|AB| · sin Â) / sin Ĉ
|CB| = (60 · sin 25°) / sin 25°
|CB| = 60

Berekenen van |DC| in driehoek BDC:
|DC|² = |CB|² + |BD|² − 2|CB| · |BD| · cos δ
|DC|² = 60² + |BD|² − 2 · 60 · |BD| · cos 100°
|DC| ≈ 114,54928

Antwoord: De twee torens staan ongeveer 114,55 m uit elkaar.

--- PAGE 42 ---
22
Om de afstand te berekenen van de uitkijkpost A tot de onbereikbare toren T planten we vier merkstokken in de punten A, B, C en D zoals aangegeven op de figuur. We meten de vier zijden en de diagonaal van de vierhoek ABCD. Bereken nu de afstand van A tot T.
|AB| = 40 m
|AC| = 50 m
|AD| = 30 m
|BC| = 25 m
|CD| = 70 m

[Afbeelding: Vierhoek ABCD met uitbreiding naar punt T]

In driehoek ACD (ZZZ):
• |CD|² = |AD|² + |AC|² − 2 · |AD| · |AC| · cos Â
cos Â = (30² + 50² − 70²) / (2 · 30 · 50)
Â = 120°

• |AD|² = |AC|² + |CD|² − 2 · |AC| · |CD| · cos Ĉ
cos Ĉ = (50² + 70² − 30²) / (2 · 50 · 70)
Ĉ ≈ 21°47'12"

• |AC|² = |AD|² + |CD|² − 2 · |AD| · |CD| · cos D̂
cos D̂ = (30² + 70² − 50²) / (2 · 30 · 70)
D̂ ≈ 38°12'48"

In driehoek ABC (ZZZ):
• |BC|² = |AB|² + |AC|² − 2 · |AB| · |AC| · cos Â
cos Â = (40² + 50² − 25²) / (2 · 40 · 50)
Â ≈ 29°41'11"

• |AC|² = |AB|² + |BC|² − 2 · |AB| · |BC| · cos B̂
cos B̂ = (40² + 25² − 50²) / (2 · 40 · 25)
B̂ ≈ 97°54'12"

• |AB|² = |AC|² + |BC|² − 2 · |AC| · |BC| · cos Ĉ
cos Ĉ = (50² + 25² − 40²) / (2 · 50 · 25)
Ĉ ≈ 52°24'38"

In driehoek ATB (HZH):
• B̂ = 180° − 97°54'12" = 82°5'48"
• T̂ = 180° − 21°47'12" − 52°24'38" − 38°12'48" = 67°35'22"

• |AT| = sin B̂ · |AB| / sin T̂
= (sin 82°5'48" · 40) / sin 67°35'22"
≈ 42,85678

Antwoord: De afstand van A tot T is ongeveer 42,86 m.

--- PAGE 43 ---
**Auteurs** Philip Bogaert, Björn Carreyn en Roger Van Nieuwenhuyze
**Derde editie - Bestelnummer** 94 606 0119 (module 12 van 18)
**ISBN** 978 90 4864 973 0 - **KB** D/2024/0147/206 - **NUR** 126/128/129 - **Thema** YPMF
**Illustrator** Jona Jamart - **Design en lay-out** die Keure
**Verantwoordelijke uitgever** die Keure, Kleine Pathoekeweg 3, 8000 Brugge
RPR 0405 108 325 - © Copyright die Keure, Brugge

[Afbeelding: Logo van 'die Keure' - educatief]
[Afbeelding: Placeholder voor FSC logo]
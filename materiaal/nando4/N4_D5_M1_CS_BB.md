--- PAGE 1 ---
# Nando 4
## Inhoud
Instap
1 Logische operatoren en waarheidstabellen
2 Problemen oplossen met logica
Signaaloefeningen
Differentiatietraject
Computationeel denken
Studiewijzer

D-FINALITEIT 5 UUR – DISCRETE WISKUNDE EN LOGICA
# 01 Logica en waarheidstabellen

### WAT JE AL KUNT
– mondeling en schriftelijk communiceren over redeneringen
– symbolen gebruiken
– implicatie en equivalentie zinvol hanteren
– uitspraken illustreren met voorbeelden
– logische operatoren gebruiken
– een eenvoudige waarheidstabel gebruiken
– concepten van computationeel denken hanteren

### WAT JE LEERT IN DEZE MODULE
– de waarheidswaarde van logische uitspraken bepalen met behulp van waarheidstabellen
– logische operatoren en connectieven ∧, ∨, ¬, ⇒, ⇔ gebruiken
– het verschil begrijpen tussen de ‘of’ in de logica en de ‘of’ in de omgangstaal
– het verschil begrijpen tussen de ‘als … dan …’ in de logica en de ‘als … dan …’ in de omgangstaal
– het verband leggen tussen logische poorten en logica
– een wiskundige uitspraak in symbolen en logica gebruiken in bewijzen en redeneringen

### IN DE KIJKER
Je reflecteert over jouw gevonden antwoord en controleert de gemaakte tussenstappen.

### WISKUNDETAAL
– proposities
– conjunctie
– disjunctie
– inclusieve of
– exclusieve of
– negatie
– implicatie
– equivalentie
– logisch equivalente uitspraken
– tautologie
– contradictie
– logische poorten

--- PAGE 2 ---
# Instap
## Opdracht 1

**Puzzel 1**
Najade en Broes spelen een partijtje tennis tegen elkaar. Bij elk spel dat ze spelen kunnen ze 1 euro winnen of 1 euro verliezen.

Broes won drie spelletjes.
Najade won 5 euro.

Hoeveel spelletjes hebben ze tegen elkaar gespeeld?

[ ... invulveld ... ]
Puzzel 1: Ze hebben 11 spelletjes tegen elkaar gespeeld.

**Puzzel 2**
Op een tafel staan drie dozen met speelgoed met daarop een label. Op het label van de eerste doos staat er 'LEGO', op het label van de tweede doos staat er 'PLAYMOBIL' en op het label van de laatste doos staat er 'LEGO & PLAYMOBIL'.
Alle dozen zijn verkeerd gelabeld.

[Afbeelding: Drie kartonnen dozen met labels. Doos 1: LEGO, Doos 2: LEGO & PLAYMOBIL, Doos 3: PLAYMOBIL]

Je mag één doos kiezen waar je even in kijkt, om zo daarna de inhoud van de andere dozen (zonder kijken) met zekerheid te kunnen zeggen.
Welke doos kies je? Verklaar je antwoord.

[ ... invulveld ... ]
Puzzel 2: Doos Lego & Playmobil: Als daar enkel Lego in zit, dan is dit al zeker de Legodoos. De doos "Playmobil" kan hierdoor al niet Lego zijn, maar moet Lego en Playmobil zijn. De doos "Lego" wordt dan de doos Playmobil.

**Puzzel 3**
Lowie, Vicky, Jurn en Mathilde hebben elk een hond. Hier zie je de vier honden:
[Afbeelding: Vier honden. Van links naar rechts: Zita (Franse bulldog), Slink (Duitse herder), Milou (labradoodle), Pongo (maltipoo)]

Zita is een Franse bulldog, Slink is een Duitse herder, Milou is een labradoodle en Pongo is een maltipoo.
Wijs elke hond toe aan zijn baasje op basis van volgende uitspraken:
- De hond van Vicky is geen Duitse herder of labradoodle.
- Pongo’s baasje is een man die houdt van wandelingen in het bos.
- Zita houdt van de zee, net zoals haar baasje ook houdt van zwemmen.
- Lowie vermijdt met de hond modderpoelen en bosomgevingen.
- De labradoodle nestelt zich graag in de zetel, maar is niet de hond van Mathilde.

[ ... invulveld ... ]
Puzzel 3: Vicky is het baasje van Zita, Lowie is het baasje van Milou, Jurn is het baasje van Pongo en Mathilde is het baasje van Slink.

--- PAGE 3 ---
## Opdracht 2

Gegeven: P is de verzameling van de priemgetallen kleiner dan 20.
R is de verzameling van de delers van 30.

a) Maak een vlinderdiagram.
[Afbeelding: Een ingevuld Venndiagram (vlinderdiagram) met verzameling P en verzameling R. In P (maar niet in R) zitten: 7, 11, 13, 17, 19. In de doorsnede van P en R zitten: 2, 3, 5. In R (maar niet in P) zitten: 1, 6, 10, 15, 30.]

b) Omkring: waar of niet waar?

1 ∈ P ∩ R
WAAR / [x] NIET WAAR

R\P = {2, 6, 10, 15, 30}
[x] WAAR / NIET WAAR

## Opdracht 3

In het spel ‘Star Battle’ zijn dit de spelregels:
Op iedere rij (horizontaal en verticaal) moeten er precies twee sterren staan. Ook in elk gebied moeten er twee sterren staan. Twee sterren mogen elkaar nooit raken (ook niet diagonaal).

a) Een opwarmertje… Duid telkens aan in het blauwe gebied:
• Waar staan er mogelijks sterren? (?)
• Waar staat er zeker geen ster? (-)
• Waar staat er met zekerheid een ster? (x)

[Afbeelding: Star Battle puzzel met 6 rijen en kolommen. Een specifieke sectie in blauw is ingevuld met: ?, -, x, en ?]

b) Duid telkens aan in het blauwe gebied:
• Waar staan er mogelijks sterren? (?)
• Waar staan er zeker geen sterren? (-)
• Waar staat er met zekerheid een ster? (x)

[Afbeelding: Star Battle puzzel. De blauwe sectie toont een horizontale rij van drie vakjes met: ?, -, x]

c) Los nu de volledige puzzel op.

[Afbeelding: Opgeloste Star Battle puzzel van 10x10. De plaatsen met sterren zijn gemarkeerd met een rode 'x'. De ingevulde x'en respecteren de regels van exact 2 per rij, kolom en gebied, en raken elkaar nergens, ook niet diagonaal.]

[TIP] Denk vooral aan waar er géén sterren kunnen staan.

--- PAGE 4 ---
## Opdracht 4

Logische operatoren worden ook in computertaal gebruikt. Probeer telkens de geschreven code te begrijpen.

[Afbeelding: Python logo]
```python
1  getal = 9
2
3  if getal%2==0 or getal%3==0:
4      print("Het getal is deelbaar door 2 of 3.")
```

a) Omcirkel: In deze code wordt gebruik gemaakt van een conjunctie – [x] disjunctie – negatie.

b) Zal het programma uitvoer genereren? [x] JA – NEE
Verklaar je antwoord.
[ ... invulveld ... ]
9 is deelbaar door 2 of door 3, namelijk door 3.

[Afbeelding: Python logo]
```python
1  getal = 9
2
3  if getal%2==0 and getal%3==0:
4      print("Het getal is deelbaar door 6.")
```

a) Omcirkel: In deze code wordt gebruik gemaakt van een [x] conjunctie – disjunctie – negatie.

b) Zal het programma uitvoer genereren? JA – [x] NEE
Verklaar je antwoord.
[ ... invulveld ... ]
9 is niet deelbaar door 2 en door 3, enkel deelbaar door 3.

[Afbeelding: Python logo]
```python
1  getal = 9
2
3  if not getal%2==0:
4      print("Het getal is niet deelbaar door 2.")
```

[Afbeelding: Python logo]
```python
1  getal = 9
2
3  if getal%2!=0:
4      print("Het getal is niet deelbaar door 2.")
```

Hierboven zie je twee keer dezelfde code. Vaak wordt er gebruik gemaakt van een tweede versie.

a) Omcirkel: In deze code wordt gebruik gemaakt van een conjunctie – disjunctie – [x] negatie.

b) Zal het programma uitvoer genereren? [x] JA – NEE
Verklaar je antwoord.
[ ... invulveld ... ]
9 is niet deelbaar door 2.

--- PAGE 5 ---
# 1 Logische operatoren en waarheidstabellen

## 1.1 Begrippen

In de propositielogica werken we met uitspraken. Deze uitspraken zijn waar of niet waar.
We noemen de logische uitspraken ook **proposities**. Proposities geven een feit weer. Een propositie hoeft niet waar te zijn. Het kan op dit moment nog onduidelijk zijn of een propositie waar of niet waar is.

**Voorbeelden**
p: Een dolfijn is een zoogdier. *p is een ware uitspraak*
q: Een banaan is blauw. *q is een onware uitspraak*
r: De thee is warm. *r is een ware of onware uitspraak*

Ook in de wiskunde maken we gebruik van uitspraken. Om te oordelen of een uitspraak waar of onwaar is, kunnen we onder andere beroep doen op onze wiskundekennis. Zo kunnen we met één tegenvoorbeeld een uitspraak ontkrachten en als onwaar beschouwen.

**Voorbeelden**
p: √2 is een irrationaal getal. *p is een ware uitspraak*
q: De tangens van een scherpe hoek ligt tussen -1 en 1. *q is een onware uitspraak (tegenvoorbeeld: tan 50° > 1)*

We kunnen uitspraken ook met elkaar verbinden door gebruik te maken van **connectieven**: de negatie (niet), de conjunctie (en), de disjunctie (of), de implicatie (als … dan) en de equivalentie (… als en slechts als …).

## 1.2 De negatie

Gegeven is de uitspraak p: Amélie lust melk.

De negatie van deze uitspraak is:
¬p: Amélie lust geen melk.

notatie | ¬p (de negatie van de uitspraak p)

Het is mogelijk dat de uitspraak p waar is, dan is de negatie van deze uitspraak niet waar. Het is evengoed mogelijk dat de uitspraak p niet waar is, dan is de negatie van deze uitspraak waar.

We vatten dit samen in een **waarheidstabel**. In de eerste kolom staat de mogelijke waarde van p. In de tweede kolom staat de waarde van ¬p.

| p | ¬p |
| :---: | :---: |
| WAAR | NIET WAAR |
| NIET WAAR | WAAR |

| p | ¬p |
| :---: | :---: |
| 1 | 0 |
| 0 | 1 |

We kunnen hier ook een logische wet vaststellen, de wet van de dubbele negatie: **¬(¬p) ⇔ p**

**Merk op**
Je kan ofwel waar en niet waar gebruiken, maar je kan ook binair werken: dan gebruik je 1 voor waar en 0 voor niet waar.

--- PAGE 6 ---
## 1.3 De conjunctie

Gegeven: twee uitspraken p en q

p: Finn draagt een zwarte broek.
q: Finn draagt een blauw T-shirt.

De nieuwe uitspraak p ∧ q wordt:
p ∧ q: Finn draagt een zwarte broek **en** een blauw T-shirt.

notatie | p ∧ q (de conjunctie van de uitspraken p en q)

De uitspraken p en q zijn met elkaar verbonden door de logische operator ‘en’ (and).

| SITUATIE 1 | SITUATIE 2 | SITUATIE 3 | SITUATIE 4 |
| :--- | :--- | :--- | :--- |
| [Afbeelding: Jongen met zwarte broek en blauw t-shirt] | [Afbeelding: Jongen met zwarte broek en rood t-shirt] | [Afbeelding: Jongen met groene broek en blauw t-shirt] | [Afbeelding: Jongen met groene broek en rood t-shirt] |
| p is waar<br>q is waar | p is waar<br>q is niet waar | p is niet waar<br>q is waar | p is niet waar<br>q is niet waar |

De conjunctie van p en q is enkel waar als zowel uitspraak p als uitspraak q waar is.

| p | q | p ∧ q |
| :---: | :---: | :---: |
| WAAR | WAAR | WAAR |
| WAAR | NIET WAAR | NIET WAAR |
| NIET WAAR | WAAR | NIET WAAR |
| NIET WAAR | NIET WAAR | NIET WAAR |

| p | q | p ∧ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 0 |
| 0 | 0 | 0 |

**Merk op**
In deze context betekent p ∧ ¬q dat Finn een zwarte broek en géén blauw T-shirt draagt (= situatie 2).

--- PAGE 7 ---
## 1.4 De disjunctie

Gegeven: twee uitspraken p en q

p: In de wei staat een koe.
q: In de wei staat een paard.

De nieuwe uitspraak p ∨ q wordt:
p ∨ q: In de wei staat een koe **of** een paard.

notatie | p ∨ q (de disjunctie van de uitspraken p en q)

De uitspraken p en q zijn met elkaar verbonden door de logische operator ‘of’ (or). In logica wordt gebruik gemaakt van de **inclusieve of**. In deze context betekent dit dat er in de weide ofwel een koe moet staan, ofwel een paard moet staan, maar dat er evengoed zowel een koe als een paard mag staan.

| SITUATIE 1 | SITUATIE 2 | SITUATIE 3 | SITUATIE 4 |
| :--- | :--- | :--- | :--- |
| [Afbeelding: Weide met een paard en een koe] | [Afbeelding: Weide met enkel een koe] | [Afbeelding: Weide met enkel een paard] | [Afbeelding: Weide met een schaap] |
| p is waar<br>q is waar | p is waar<br>q is niet waar | p is niet waar<br>q is waar | p is niet waar<br>q is niet waar |

De disjunctie van twee uitspraken p en q is waar als minstens 1 van de uitspraken waar is.

| p | q | p ∨ q |
| :---: | :---: | :---: |
| WAAR | WAAR | WAAR |
| WAAR | NIET WAAR | WAAR |
| NIET WAAR | WAAR | WAAR |
| NIET WAAR | NIET WAAR | NIET WAAR |

| p | q | p ∨ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 0 | 0 | 0 |

In de omgangstaal gebruiken we eerder de **exclusieve of**. Als je in een restaurant mag kiezen uit frietjes of rijst bij het hoofdgerecht, dan kies je slechts 1 van de 2 mogelijkheden (ofwel frietjes, ofwel rijst, maar niet beide).

**Merk op**
Het niet waar zijn van een disjunctie zegt wel iets over de dieren, namelijk dat geen van beide in de wei staat.

We kunnen met de disjunctie ook de **wet van de uitgesloten derde** formuleren. Een uitspraak is waar of niet waar, er is geen derde mogelijkheid.

| p | ¬p | p ∨ ¬p |
| :---: | :---: | :---: |
| WAAR | NIET WAAR | WAAR |
| NIET WAAR | WAAR | WAAR |

formule | p ∨ ¬p

--- PAGE 8 ---
## 1.5 De implicatie

Je leerde eerder al gebruik maken van implicaties in wiskunde. Ook in logica kunnen we hier dieper op ingaan.

Gegeven: twee uitspraken p en q

p: Jef neemt de trein.
q: Jef beluistert muziek.

Je kan de twee uitspraken p en q verbinden met een implicatiepijl. We noemen p dan het **antecedens** en q het **consequens**.

notatie | p ⇒ q (implicatie: "**Als** Jef de trein neemt, **dan** beluistert Jef muziek.")

[Afbeelding: Een jongen luistert naar muziek met oortjes terwijl hij op de trein zit.]

De implicatie is waar als Jef effectief de trein neemt en ook muziek beluistert.
Neemt Jef de trein niet, dan kan hij al dan niet muziek beluisteren. Ook hier is de implicatie waar.
Enkel wanneer Jef de trein neemt en geen muziek beluistert, is de implicatie niet waar.

| p | q | p ⇒ q |
| :---: | :---: | :---: |
| WAAR | WAAR | WAAR |
| WAAR | NIET WAAR | NIET WAAR |
| NIET WAAR | WAAR | WAAR |
| NIET WAAR | NIET WAAR | WAAR |

| p | q | p ⇒ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 1 |
| 0 | 0 | 1 |

**Merk op**
Als het antecedens niet waar is, dan maakt het niet uit of het consequens waar of niet waar is. De implicatie is dan altijd waar.

In de omgangstaal en het dagelijkse leven, gaan we vaak uit van oorzaak en gevolg. De implicatie in de logica verschilt hiervan. Hier onderzoeken we alle gevallen, ook al lijken die in het dagelijkse leven minder relevant.

Er is een verband tussen de implicatie en de disjunctie: p ⇒ q en ¬p ∨ q zijn gelijkwaardige uitspraken.

| p | q | p ⇒ q | ¬p | ¬p ∨ q |
| :---: | :---: | :---: | :---: | :---: |
| WAAR | WAAR | WAAR | NIET WAAR | WAAR |
| WAAR | NIET WAAR | NIET WAAR | NIET WAAR | NIET WAAR |
| NIET WAAR | WAAR | WAAR | WAAR | WAAR |
| NIET WAAR | NIET WAAR | WAAR | WAAR | WAAR |

formule | (p ⇒ q) ⇔ (¬p ∨ q)

--- PAGE 9 ---
## 1.6 De equivalentie

Je leerde eerder al gebruik maken van equivalenties in wiskunde. Ook in logica kunnen we hier dieper op ingaan.

Gegeven: twee uitspraken p en q

p: Dounia eet een suikerspin.
q: Dounia gaat naar de kermis.

We maken een nieuwe uitspraak met behulp van een equivalentiepijl.

[Afbeelding: Een vrouw geniet van een grote roze suikerspin op de kermis.]

notatie | p ⇔ q (equivalentie: "Dounia eet een suikerspin **als en slechts als** ze naar de kermis gaat.")

Deze uitspraak is waar als Dounia zowel een suikerspin eet als naar de kermis gaat. Het is eveneens waar als ze geen suikerspin eet en niet naar de kermis gaat.

| p | q | p ⇔ q |
| :---: | :---: | :---: |
| WAAR | WAAR | WAAR |
| WAAR | NIET WAAR | NIET WAAR |
| NIET WAAR | WAAR | NIET WAAR |
| NIET WAAR | NIET WAAR | WAAR |

| p | q | p ⇔ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 0 |
| 0 | 0 | 1 |

Door gebruik te maken van de waarheidstabellen kan je eenvoudig aantonen dat p ⇔ q en ¬p ⇔ ¬q gelijkwaardige uitspraken zijn.

| p | q | p ⇔ q | ¬p | ¬q | ¬p ⇔ ¬q |
| :---: | :---: | :---: | :---: | :---: | :---: |
| WAAR | WAAR | WAAR | NIET WAAR | NIET WAAR | WAAR |
| WAAR | NIET WAAR | NIET WAAR | NIET WAAR | WAAR | NIET WAAR |
| NIET WAAR | WAAR | NIET WAAR | WAAR | NIET WAAR | NIET WAAR |
| NIET WAAR | NIET WAAR | WAAR | WAAR | WAAR | WAAR |

formule | (p ⇔ q) ⇔ (¬p ⇔ ¬q)

--- PAGE 10 ---
# Verwerkingsopdrachten

1, 2, 3

**1** Gegeven: twee uitspraken p en q
p: Nona gaat naar de Scouts.
q: Selena speelt voetbal.

a) Wat betekent ¬p?
[ ... invulveld ... ]
Nona gaat niet naar de Scouts.

b) Verbind de uitspraken p en q met een conjunctie.
In symbolen: [ ... invulveld ... ] p ∧ q
Betekenis:
[ ... invulveld ... ]
Nona gaat naar de Scouts en Selena speelt voetbal.

c) Maak een waarheidstabel om te bepalen wanneer de uitspraak p ∨ q waar is.

| p | q | p ∨ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 0 | 0 | 0 |

**2** Gegeven: twee uitspraken p en q
p: Wiskunde is een interessant vak.
q: Het is mooi weer.

[Afbeelding: Studenten die buiten in het gras zitten met boeken, ogenschijnlijk op een mooie zonnige dag.]

a) Wat betekent p ⇔ q?
[ ... invulveld ... ]
Wiskunde is een interessant vak als en slechts als het mooi weer is.

b) Maak een waarheidstabel voor deze equivalentie.

| p | q | p ⇔ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 0 |
| 0 | 0 | 1 |

c) Wanneer is deze equivalentie waar?
[ ... invulveld ... ]
Als p = 1 en q = 1 of als p = 0 en q = 0.

d) Beoordeel de volgende uitspraak.
"Als het mooi weer is, zijn andere vakken dan wiskunde niet interessant."
[ ... invulveld ... ]
Niet waar, je kan hier geen uitspraak over doen. De propositie p heeft het enkel over het vak wiskunde. Ofwel is het vak interessant, ofwel is het vak niet interessant. Het doet geen uitspraak over de andere vakken.

--- PAGE 11 ---
**3** Je wilt absoluut vermijden dat je een gevaarlijk virus oploopt en raadpleegt een arts. De arts zegt: “Als je je laat vaccineren, dan krijg je het virus niet.”

[Afbeelding: Een persoon krijgt een spuitje in de schouder van een medische professional.]

a) Welke twee proposities zijn in de uitspraak van de arts met elkaar verbonden?
p: [ ... invulveld ... ] Je laat je vaccineren.
q: [ ... invulveld ... ] Je krijgt het virus niet.

b) Schrap wat niet past:
Er werd gebruik gemaakt van een ~~conjunctie~~ – ~~disjunctie~~ – [x] implicatie – ~~equivalentie~~

c) Noteer de uitspraak in symbolen: [ ... invulveld ... ] p ⇒ q

d) Maak een waarheidstabel die hoort bij de uitspraak van de arts.

| p | q | p ⇒ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 1 |
| 0 | 0 | 1 |

e) Wat later zie je de arts terug en zeg je: “Ik heb het virus niet gekregen.” De arts zegt onmiddellijk: “Dan heb je je laten vaccineren.” Beoordeel de uitspraak van de arts.
[ ... invulveld ... ]
Niet waar, als p = 0 en q = 1, dan is de uitspraak ook waar.

**4** Toon aan met een waarheidstabel dat de uitspraken logisch equivalent zijn.

a) (p ⇒ q) ⇔ (¬q ⇒ ¬p)

| p | q | ¬p | ¬q | p ⇒ q | ¬q ⇒ ¬p |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 0 | 0 | 1 | 1 |
| 1 | 0 | 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 0 | 1 | 1 |
| 0 | 0 | 1 | 1 | 1 | 1 |

b) (p ⇒ q) ⇔ ¬[p ∧ (¬q)]

| p | q | ¬q | p ∧ (¬q) | p ⇒ q | ¬(p ∧ (¬q)) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 0 | 0 | 1 | 1 |
| 1 | 0 | 1 | 1 | 0 | 0 |
| 0 | 1 | 0 | 0 | 1 | 1 |
| 0 | 0 | 1 | 0 | 1 | 1 |

--- PAGE 12 ---
# 2 Problemen oplossen met logica

## 2.1 Tautologie en contradictie

definitie | Een **tautologie** is een samengestelde uitspraak die voor elke waarde van de enkelvoudige proposities waar is.

**Voorbeeld**
Je bent voor een toets van wiskunde geslaagd of niet geslaagd.
De twee proposities zijn:
p: Je bent geslaagd voor de toets wiskunde.
¬p: Je bent niet geslaagd voor de toets wiskunde.

De samengestelde uitspraak p ∨ ¬p is altijd waar. Bijgevolg is p ∨ ¬p een tautologie.
Je kunt dit ook aantonen met een waarheidstabel.

| p | ¬p | p ∨ ¬p |
| :---: | :---: | :---: |
| WAAR | NIET WAAR | WAAR |
| NIET WAAR | WAAR | WAAR |

definitie | Een **contradictie** is een samengestelde uitspraak die voor elke waarde van de enkelvoudige proposities niet waar is.

**Voorbeeld**
Een natuurlijk getal waarvan het laatste cijfer oneven is, is deelbaar door 2. De twee proposities zijn:
p: Het laatste cijfer van het natuurlijk getal is oneven.
q: Het natuurlijk getal is deelbaar door 2.

De samengestelde uitspraak p ∧ q is altijd niet waar. Bijgevolg is p ∧ q een contradictie.
Je kunt dit ook aantonen met een waarheidstabel.

| p | q | p ∧ q |
| :---: | :---: | :---: |
| WAAR | NIET WAAR | NIET WAAR |
| NIET WAAR | WAAR | NIET WAAR |

--- PAGE 13 ---
## 2.2 Logische wetten

**A) Wat je al kent**
Logische wetten zijn logische waarheden of tautologieën. In het vorige hoofdstuk maakte je al kennis met een aantal logische wetten.
• Bij de negatie spraken we over de **wet van de dubbele negatie**:
**logische wet: ¬(¬p) ⇔ p**
Bv. “Dit is niet zonder risico” betekent: “Er is een risico.”

• Bij de disjunctie kwam de **wet van de uitgesloten derde** aan bod:
**logische wet: p ∨ ¬p**
Bv. Je bent op tijd of je bent niet op tijd.

• Je leerde bij de implicatie dat die kan worden omgezet in een disjunctie:
**logische wet: (p ⇒ q) ⇔ (¬p ∨ q)**
Bv. “Als het woensdag is, dan padel ik.” is gelijkwaardig met “Het is niet woensdag of ik padel.” De implicatie geeft immers geen info over wat je doet als het niet woensdag is. Je kan ook padellen op donderdag.

[Afbeelding: Twee jonge mannen padellen buiten op een blauw veld.]

**Merk op**
Je kunt al deze logische wetten bewijzen door een waarheidstabel op te stellen.

**B) Contrapositie van een implicatie**
We bekijken twee proposities:
p: Mijn haar is te lang.
q: Ik ga naar de kapper.

p ⇒ q betekent “Als mijn haar te lang is, dan ga ik naar de kapper.”
¬q ⇒ ¬p betekent “Als ik niet naar de kapper ga, dan is mijn haar niet te lang.”

De uitspraken p ⇒ q en ¬q ⇒ ¬p zijn equivalent.

formule | (p ⇒ q) ⇔ (¬q ⇒ ¬p)

Met behulp van een waarheidstabel tonen we aan dat dit in elke situatie equivalente uitspraken zijn.

| p | q | p ⇒ q | ¬q | ¬p | ¬q ⇒ ¬p |
| :---: | :---: | :---: | :---: | :---: | :---: |
| WAAR | WAAR | WAAR | NIET WAAR | NIET WAAR | WAAR |
| WAAR | NIET WAAR | NIET WAAR | WAAR | NIET WAAR | NIET WAAR |
| NIET WAAR | WAAR | WAAR | NIET WAAR | WAAR | WAAR |
| NIET WAAR | NIET WAAR | WAAR | WAAR | WAAR | WAAR |

--- PAGE 14 ---
**C) Een equivalentie omzetten in een conjunctie**
We bekijken twee proposities:
p: Vandaag is het de Vlaamse feestdag.
q: Vandaag is het 11 juli.

p ⇔ q betekent “Vandaag is het de Vlaamse feestdag als en slechts als het vandaag 11 juli is.”
(p ⇒ q) ∧ (q ⇒ p) betekent “Als het vandaag de Vlaamse feestdag is, dan is het vandaag 11 juli en als het 11 juli is, dan is het vandaag de Vlaamse feestdag.”

De uitspraken p ⇔ q en (p ⇒ q) ∧ (q ⇒ p) zijn equivalent.

formule | (p ⇔ q) ⇔ [(p ⇒ q) ∧ (q ⇒ p)]

Met behulp van een waarheidstabel tonen we aan dat dit in elke situatie equivalente uitspraken zijn.

| p | q | p ⇔ q | p ⇒ q | q ⇒ p | (p ⇒ q) ∧ (q ⇒ p) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| WAAR | WAAR | WAAR | WAAR | WAAR | WAAR |
| WAAR | NIET WAAR | NIET WAAR | NIET WAAR | WAAR | NIET WAAR |
| NIET WAAR | WAAR | NIET WAAR | WAAR | NIET WAAR | NIET WAAR |
| NIET WAAR | NIET WAAR | WAAR | WAAR | WAAR | WAAR |

**D) De wetten van De Morgan (dualiteit van De Morgan)**
Er zijn twee wetten van De Morgan. Zo kan de negatie van een conjunctie omgezet worden in een disjunctie.

We bekijken twee proposities:
p: Ik draag een groene broek.
q: Ik kijk televisie.

¬(p ∧ q) betekent “Het is niet zo dat ik een groene broek draag en televisie kijk.”
¬p ∨ ¬q betekent “Ik draag geen groene broek of ik kijk geen televisie.”

De uitspraken ¬(p ∧ q) en ¬p ∨ ¬q zijn equivalent.

formule | ¬(p ∧ q) ⇔ (¬p ∨ ¬q)

| p | q | p ∧ q | ¬(p ∧ q) | ¬p | ¬q | ¬p ∨ ¬q |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| WAAR | WAAR | WAAR | NIET WAAR | NIET WAAR | NIET WAAR | NIET WAAR |
| WAAR | NIET WAAR | NIET WAAR | WAAR | NIET WAAR | WAAR | WAAR |
| NIET WAAR | WAAR | NIET WAAR | WAAR | WAAR | NIET WAAR | WAAR |
| NIET WAAR | NIET WAAR | NIET WAAR | WAAR | WAAR | WAAR | WAAR |

--- PAGE 15 ---
Evenzeer kan de negatie van een disjunctie omgezet worden in een conjunctie.

We hernemen de twee proposities:
p: Ik draag een groene broek.
q: Ik kijk televisie.

¬(p ∨ q) betekent “Het is niet zo dat ik een groene broek draag of televisie kijk.”
¬p ∧ ¬q betekent “Ik draag geen groene broek en ik kijk geen televisie.”

De uitspraken ¬(p ∨ q) en ¬p ∧ ¬q zijn equivalent.

formule | ¬(p ∨ q) ⇔ (¬p ∧ ¬q)

| p | q | p ∨ q | ¬(p ∨ q) | ¬p | ¬q | ¬p ∧ ¬q |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| WAAR | WAAR | WAAR | NIET WAAR | NIET WAAR | NIET WAAR | NIET WAAR |
| WAAR | NIET WAAR | WAAR | NIET WAAR | NIET WAAR | WAAR | NIET WAAR |
| NIET WAAR | WAAR | WAAR | NIET WAAR | WAAR | NIET WAAR | NIET WAAR |
| NIET WAAR | NIET WAAR | NIET WAAR | WAAR | WAAR | WAAR | WAAR |

Merk op dat we in de waarheidstabellen even goed gebruik hadden kunnen maken van 0 (niet waar) en 1 (waar). In de oefeningen is deze manier van werken misschien wel sneller.

## 2.3 Bewijzen

Met behulp van de logische wetten kun je eenvoudig equivalenties aantonen. Op die manier moet je niet altijd een waarheidstabel opstellen. Zo kan je bewijzen dat ¬(p ⇒ q) ⇔ (p ∧ ¬q).

Links vind je het bewijs met behulp van logische wetten, rechts de waarheidstabel. Via beide manieren toon je de equivalentie aan.

¬(p ⇒ q)
⇕ (implicatie omzetten in een disjunctie)
¬(¬p ∨ q)
⇕ (wet De Morgan)
¬(¬p) ∧ ¬q
⇕ (dubbele negatie)
p ∧ ¬q

| p | q | p ⇒ q | ¬(p ⇒ q) | ¬q | p ∧ ¬q |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 0 |
| 1 | 0 | 0 | 1 | 1 | 1 |
| 0 | 1 | 1 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 | 1 | 0 |

**Merk op**
Voor de conjunctie, disjunctie, implicatie, … zijn er ook eigenschappen. Zo is bijvoorbeeld de conjunctie commutatief: (p ∧ q) ⇔ (q ∧ p). Je kan dit aantonen met een waarheidstabel.
De implicatie is echter niet commutatief. Ook dit kan je vaststellen met een waarheidstabel.
Voor je dus eigenschappen toepast, zal je ze moeten onderzoeken!

--- PAGE 16 ---
## 2.4 Logische poorten

definitie | **Logische poorten** zijn elektronische schakelingen met één of meerdere ingangen en één uitgang.

Op basis van de invoer wordt de uitvoer bepaald. We bestuderen enkele logische poorten. Je vindt ze vaak terug in schema’s uit de elektronica.

Merk op dat deze poorten ook gebruikt worden bij het coderen.

**A) De NOT-poort**
Om bij een NOT-poort de uitvoer 1 te verkrijgen, moet de invoer tegengesteld zijn: 0 (niet waar).
We kunnen dit schematisch voorstellen door gebruik te maken van een symbool.

[Afbeelding: Symbool van een NOT-poort. Lijn X gaat in een vierkant met '1' en een cirkeltje aan de uitgang, de uitgang is overstreepte X. "input" wijst naar X, "output" wijst naar overstreepte X.]

Op basis van dit schema, kan je een waarheidstabel opstellen.

| X | overstreepte X |
| :---: | :---: |
| 1 | 0 |
| 0 | 1 |

**Merk op**
Andere voorstellingen van de NOT-poort zijn:
[Afbeelding: Alternatief NOT-poort symbool, een driehoek met een cirkeltje aan de punt. Ingang X, uitgang overstreepte X.]
[Afbeelding: Alternatief NOT-poort symbool, een rechthoek met 'NOT' erin. Ingang X, uitgang overstreepte X.]

**B) De AND-poort**
Om bij een AND-poort de uitvoer 1 te verkrijgen, moet elke invoer 1 (waar) zijn. We kunnen dit schematisch voorstellen door gebruik te maken van een symbool.

[Afbeelding: Symbool van een AND-poort. Lijnen X en Y gaan in een vierkant met '&'. Uitgang is XY.]

Op basis van dit schema, kan je een waarheidstabel opstellen.

| X | Y | XY |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 0 |
| 0 | 0 | 0 |

**Merk op**
Andere voorstellingen van de AND-poort zijn:
[Afbeelding: Alternatief AND-poort symbool, een D-vorm. Ingang X en Y, uitgang XY.]
[Afbeelding: Alternatief AND-poort symbool, een rechthoek met 'AND' erin. Ingang X en Y, uitgang XY.]

--- PAGE 17 ---
**C) De OR-poort**
Om bij een OR-poort de uitvoer 1 te verkrijgen, moet minstens één van de ingangen 1 (waar) zijn. We kunnen dit schematisch voorstellen door gebruik te maken van een symbool.

[Afbeelding: Symbool van een OR-poort. Lijnen X en Y gaan in een vierkant met '⩾1'. Uitgang is X + Y.]

| X | Y | X + Y |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 0 | 0 | 0 |

**Merk op**
• Andere voorstellingen van de OR-poort zijn:
[Afbeelding: Alternatief OR-poort symbool, een schildvorm met een gebogen ingangskant. Ingang X en Y, uitgang X + Y.]
[Afbeelding: Alternatief OR-poort symbool, een rechthoek met 'OR' erin. Ingang X en Y, uitgang X + Y.]

• Er bestaat ook een XOR-poort, dit is een exclusieve OR wat dus betekent dat je uitvoer 1 hebt als ofwel niet alle ingangen 1 zijn, ofwel als niet alle ingangen 0 zijn. Hieronder zie je een voorstelling.
[Afbeelding: Symbool van een XOR-poort. Lijnen X en Y gaan in een vierkant met '=1'. Uitgang is X ⊕ Y.]

| X | Y | X ⊕ Y |
| :---: | :---: | :---: |
| 1 | 1 | 0 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 0 | 0 | 0 |

**D) De NAND-poort**
Een NAND-poort is eigenlijk een AND-poort gevolgd door een NOT-poort. Het wil zeggen dat de uitvoer 1 is van zodra 1 van de ingangen 0 is.

[Afbeelding: Symbool van een NAND-poort. Lijnen X en Y gaan in een vierkant met '&' en een cirkeltje aan de uitgang. Uitgang is overstreepte XY.]

| X | Y | overstreepte XY |
| :---: | :---: | :---: |
| 1 | 1 | 0 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 0 | 0 | 1 |

**Merk op**
Andere voorstellingen van de NAND-poort zijn:
[Afbeelding: Alternatief NAND-poort symbool, een D-vorm met een cirkeltje. Ingang X en Y, uitgang overstreepte XY.]
[Afbeelding: Alternatief NAND-poort symbool, een rechthoek met 'NAND' erin. Ingang X en Y, uitgang overstreepte XY.]

--- PAGE 18 ---
**E) De NOR-poort**
Een NOR-poort is eigenlijk een OR-poort gevolgd door een NOT-poort. Het wil zeggen dat de uitvoer 1 is als alle ingangen 0 zijn.

[Afbeelding: Symbool van een NOR-poort. Lijnen X en Y gaan in een vierkant met '⩾1' en een cirkeltje aan de uitgang. Uitgang is overstreepte X + Y.]

Op basis van dit schema, kan je een waarheidstabel opstellen.

| X | Y | overstreepte X + Y |
| :---: | :---: | :---: |
| 1 | 1 | 0 |
| 1 | 0 | 0 |
| 0 | 1 | 0 |
| 0 | 0 | 1 |

**Merk op**
• Andere voorstellingen van de NOR-poort zijn:
[Afbeelding: Alternatief NOR-poort symbool, een schildvorm met gebogen ingang en een cirkeltje aan de uitgang. Ingang X en Y, uitgang overstreepte X + Y.]
[Afbeelding: Alternatief NOR-poort symbool, een rechthoek met 'NOR' erin. Ingang X en Y, uitgang overstreepte X + Y.]

• Er bestaat ook nog een XNOR-poort, dit is een exclusieve NOR wat dus betekent dat je een uitvoer 1 krijgt als ofwel alle ingangen 1 zijn ofwel als alle ingangen 0 zijn. Hieronder zie je een voorstelling.
[Afbeelding: Symbool van een XNOR-poort. Lijnen X en Y gaan in een vierkant met '=1' en een cirkeltje aan de uitgang. Uitgang is overstreepte X ⊕ Y.]

| X | Y | overstreepte X ⊕ Y |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 0 |
| 0 | 0 | 1 |

**F) Toepassing**

[Afbeelding: Schakeling. Ingang A = 0 gaat naar een NOT-poort ('1' met cirkeltje). De uitgang hiervan en ingang B = 0 gaan naar een AND-poort ('&'). De uitgang hiervan is X.]

• We bepalen de waarde van de uitvoer (X) aan de hand van deze schematische voorstelling. A passeert een NOT-poort → wordt 1. Daarna komen A en B samen in een AND-poort:

| A | overstreepte A | B | overstreepte A B |
| :---: | :---: | :---: | :---: |
| 0 | 1 | 0 | 0 |
| | | | ↓ |
| | | | X |

• We verkrijgen enkel de uitvoer 1 als A = 0 en B = 1.

**Merk op**
Op je smartphone (of tablet) kan je apps installeren met puzzels in verband met zo’n circuits. Erg handig om dit in te oefenen!

--- PAGE 19 ---
# Verwerkingsopdrachten

4, 5, 6, 7

**5** Is de samengestelde uitspraak een tautologie of een contradictie? Toon aan met behulp van een waarheidstabel.

a) (p ∧ q) ∧ (¬p ∨ ¬q)

| p | q | ¬p | ¬q | ¬p ∨ ¬q | p ∧ q | (p ∧ q) ∧ (¬p ∨ ¬q) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 0 | 0 | 0 | 1 | 0 |
| 1 | 0 | 0 | 1 | 1 | 0 | 0 |
| 0 | 1 | 1 | 0 | 1 | 0 | 0 |
| 0 | 0 | 1 | 1 | 1 | 0 | 0 |

Deze uitspraak is een contradictie.

b) (p ⇒ q) ∨ (p ∧ ¬q)

| p | q | p ⇒ q | ¬q | p ∧ (¬q) | (p ⇒ q) ∨ (p ∧ ¬q) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 1 |
| 1 | 0 | 0 | 1 | 1 | 1 |
| 0 | 1 | 1 | 0 | 0 | 1 |
| 0 | 0 | 1 | 1 | 0 | 1 |

Deze uitspraak is een tautologie.

**6** Toon volgende eigenschappen aan met een waarheidstabel.

a) In woorden: De disjunctie is commutatief.
In symbolen: [ ... invulveld ... ] (p ∨ q) ⇔ (q ∨ p)
Waarheidstabel:

| p | q | p ∨ q | q ∨ p |
| :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 |
| 1 | 0 | 1 | 1 |
| 0 | 1 | 1 | 1 |
| 0 | 0 | 0 | 0 |

b) In woorden: De conjunctie is distributief ten opzichte van de disjunctie.
In symbolen: [ ... invulveld ... ] [p ∧ (q ∨ r)] ⇔ [(p ∧ q) ∨ (p ∧ r)]
Waarheidstabel:

| p | q | r | q ∨ r | p ∧ (q ∨ r) | p ∧ q | p ∧ r | (p ∧ q) ∨ (p ∧ r) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 1 | 0 | 1 | 1 | 1 | 0 | 1 |
| 1 | 0 | 1 | 1 | 1 | 0 | 1 | 1 |
| 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 |
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

--- PAGE 20 ---
**7** Bewijs met behulp van de logische wetten.

a) [¬(¬p ∧ ¬q)] ⇔ (p ∨ q)

¬(¬p ∧ ¬q)
⇕ Wet van De Morgan
¬(¬p) ∨ ¬(¬q)
⇕ dubbele negatie
p ∨ q

b) ¬(p ⇔ q) ⇔ [(p ∧ ¬q) ∨ (¬p ∧ q)]

¬(p ⇔ q)
⇕ equivalentie omzetten in een conjunctie
¬[(p ⇒ q) ∧ (q ⇒ p)]
⇕ wet van De Morgan
[¬(p ⇒ q)] ∨ [¬(q ⇒ p)]
⇕ implicatie omzetten in een disjunctie
[¬(¬p ∨ q)] ∨ [¬(¬q ∨ p)]
⇕ wet van De Morgan
[¬(¬p) ∧ ¬q)] ∨ [¬(¬q) ∧ ¬p]
⇕ dubbele negatie
(p ∧ ¬q) ∨ (q ∧ ¬p)
⇕ commutativiteit van de disjunctie
(p ∧ ¬q) ∨ (¬p ∧ q)

--- PAGE 21 ---
**8** Bepaal bij deze schakelingen de waarde van X voor de gegeven invoer.

a)
A = 1
B = 0
C = 1

[Afbeelding: Schakeling. A=1 (in rood geschreven '1') en B=0 (in rood geschreven '0') gaan naar een OR-poort ('⩾1'). De uitgang hiervan is '1'. Deze uitgang en C=1 (in rood geschreven '0') gaan naar een AND-poort ('&'). De uitgang hiervan is X, met in rood '1' geschreven.]

De waarde van X is 1.

b)
A = 1
B = 0
C = 1
D = 1

[Afbeelding: Schakeling. A=1 en B=0 gaan naar een OR-poort ('⩾1'). De uitgang is '1'. C=1 en D=1 gaan naar een OR-poort ('⩾1'). De uitgang is '1'. Deze laatste '1' gaat door een NOT-poort ('1' met cirkeltje), wat '0' wordt. De eerste '1' en de '0' gaan in een AND-poort ('&'). De uiteindelijke uitgang is X, in rood '0'.]

De waarde van X is 0.

--- PAGE 22 ---
# Signaaloefeningen

**1** Gegeven:
p: Lisse streamt een serie.
q: Seppe kijkt voetbal.

a) Noteer in symbolen: “Lisse streamt een serie en Seppe kijkt geen voetbal.”
[ ... invulveld ... ]
p ∧ ¬q

b) Wat betekent q ⇒ p?
[ ... invulveld ... ]
Als Seppe voetbal kijkt, dan streamt Lisse een serie.

c) Schrijf de negatie van de implicatie q ⇒ p in symbolen en omschrijf het in woorden.
In symbolen: [ ... invulveld ... ] ¬(q ⇒ p)
In woorden: [ ... invulveld ... ]
Het is niet zo dat als Seppe voetbal kijkt, Lisse dan een serie streamt.

d) Wanneer is de uitspraak p ∨ q waar?
[ ... invulveld ... ]
Als Lisse een serie streamt en Seppe voetbal kijkt. Als Lisse een serie streamt en Seppe geen voetbal kijkt. Als Lisse geen serie streamt en Seppe voetbal kijkt.

e) Wanneer is de uitspraak p ⇔ q waar?
[ ... invulveld ... ]
Als Seppe voetbal kijkt en Lisse een serie streamt en als Seppe geen voetbal kijkt en Lisse geen serie streamt.

\>>> Verder oefenen: D1 t.e.m. D10

**2** a) Stel een waarheidstabel op voor (f ∨ g) ∧ ¬(f ∧ g).

| f | g | f ∨ g | f ∧ g | ¬(f ∧ g) | (f ∨ g) ∧ ¬(f ∧ g) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 0 | 0 |
| 1 | 0 | 1 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 | 1 | 1 |
| 0 | 0 | 0 | 0 | 1 | 0 |

b) Verklaar waarom deze uitdrukking gebruikt kan worden voor een exclusieve of.
[ ... invulveld ... ]
Enkel als f óf g waar is, en niet beide, is de uitspraak waar.

\>>> Verder oefenen: D1 t.e.m. D10

--- PAGE 23 ---
**3** Toon aan met een waarheidstabel dat onderstaande uitspraken gelijkwaardig zijn.
[p ∧ (q ∨ r)] ⇔ [(p ∧ q) ∨ (p ∧ r)]

| p | q | r | q ∨ r | p ∧ (q ∨ r) | p ∧ q | p ∧ r | (p ∧ q) ∨ (p ∧ r) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 1 | 0 | 1 | 1 | 1 | 0 | 1 |
| 1 | 0 | 1 | 1 | 1 | 0 | 1 | 1 |
| 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 |
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

\>>> Verder oefenen: D1 t.e.m. D10

**4** Toon aan door gebruik te maken van logische wetten: ¬(p ⇒ q) ⇔ (p ∧ ¬q)

¬(p ⇒ q)
⇕ implicatie omzetten in een disjunctie
¬(¬p ∨ q)
⇕ wet van De Morgan
¬(¬p) ∧ ¬q
⇕ dubbele negatie
p ∧ ¬q

\>>> Verder oefenen: D11 t.e.m. D30

**5** Toon aan door gebruik te maken van logische wetten dat ¬(p ∨ ¬(p ∧ q)) een contradictie is.

¬[p ∨ ¬(p ∧ q)]
⇕ wet van De Morgan
¬p ∧ [¬[¬(p ∧ q)]]
⇕ dubbele negatie
¬p ∧ (p ∧ q)

Als p niet waar is, dan kan p én q ook niet waar zijn. Deze uitspraak is dus een contradictie.

\>>> Verder oefenen: D11 t.e.m. D30

--- PAGE 24 ---
**6** Toon aan dat p ⇒ q niet equivalent is met ¬p ⇒ ¬q maar wel met ¬q ⇒ ¬p.

| p | q | ¬p | ¬q | p ⇒ q | ¬p ⇒ ¬q | ¬q ⇒ ¬p |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 0 | 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 1 | 0 | 1 | 0 | 1 |
| 0 | 0 | 1 | 1 | 1 | 1 | 1 |

\>>> Verder oefenen: D11 t.e.m. D30

**7** Bepaal bij deze schakelingen de waarde van X voor de gegeven invoer.

a)
A = 1
B = 0

[Afbeelding: Schakeling. A=1 gaat naar een NOT-poort ('1' met cirkeltje), in het rood is '0' aangeduid bij de output. A=1 en B=0 gaan naar een OR-poort ('⩾1'), output in rood is '1'. De '0' en de '1' gaan in een AND-poort ('&'). De output is X, met rode '0' erboven. De rode '1' bij de OR-poort output lijkt ook naar de AND-poort ingang te gaan.]

De waarde van X is 1. 

b)
A = 0
B = 1
C = 1
D = 0

[Afbeelding: Schakeling. A=0 en B=1 gaan door een OR-poort ('⩾1'), rode output '1'. C=1 en D=0 gaan door een AND-poort ('&'), rode output '0'. Deze '1' en '0' gaan door een AND-poort ('&'). De output is X, rode '0'.]

De waarde van X is 0.

\>>> Verder oefenen: D11 t.e.m. D30

--- PAGE 25 ---
# Differentiatietraject

**1** Plaats het begrip, het symbool en het verwante codeerbegrip in dezelfde kleur.

| equivalentie | NOT | conjunctie | ¬ | OR |
| :---: | :---: | :---: | :---: | :---: |
| implicatie | ∨ | ⇔ | if (…) : … | negatie |
| ∧ | disjunctie | AND | ⇒ | … == … |

**2** Verbind de symbolen met de juiste zin.

Gegeven:
p: Romy speelt hockey.
q: Jules eet spaghetti.
r: Fenna is blij.

p ∧ r  ●
r ∨ q  ●
¬(q ∨ p) ●
¬r  ●
p ∧ q ∧ r ●
p ∨ (¬q ∧ r) ●

● Het is niet waar dat Jules spaghetti eet of Romy hockey speelt.
● Fenna is niet blij.
● Romy speelt hockey of Jules eet geen spaghetti terwijl Fenna blij is.
● Romy speelt hockey, Jules eet spaghetti en Fenna is blij.
● Fenna is blij of Jules eet spaghetti.
● Romy speelt hockey en Fenna is blij.

(Ingevulde lijnen volgens de afbeelding:)
p ∧ r verbonden met: Romy speelt hockey en Fenna is blij.
r ∨ q verbonden met: Fenna is blij of Jules eet spaghetti.
¬(q ∨ p) verbonden met: Het is niet waar dat Jules spaghetti eet of Romy hockey speelt.
¬r verbonden met: Fenna is niet blij.
p ∧ q ∧ r verbonden met: Romy speelt hockey, Jules eet spaghetti en Fenna is blij.
p ∨ (¬q ∧ r) verbonden met: Romy speelt hockey of Jules eet geen spaghetti terwijl Fenna blij is.

--- PAGE 26 ---
**3** Gegeven:
p: Ik ben een smurf.
q: Ik ben blauw.
r: Ik draag een witte muts.

[Afbeelding: Rij van vijf smurfen: grote smurf, een gewone smurf, brilsmurf, een smurfin met roze muts, en een smurf met een tennisraket.]

Gevraagd:
Formuleer de uitdrukking in woorden.

a) ¬q
b) p ∨ r
c) (q ∧ r) ⇔ p
d) (p ∧ q) ∨ (¬p ∧ r)
e) ¬q ⇒ ¬p ∨ r
f) ¬(q ∨ r) ∧ ¬p

a) Ik ben niet blauw.
b) Ik ben een smurf of ik draag een witte muts.
c) Ik ben blauw en ik draag een witte muts als en slechts als ik een smurf ben.
d) Ik ben een smurf en ik ben blauw of ik ben geen smurf en ik draag een witte muts.
e) Als ik niet blauw ben, dan ben ik geen smurf of draag ik een witte muts.
f) Het is niet zo dat ik blauw ben of ik een witte muts draag én ik ben geen smurf.

**4** Gegeven:
p: Pablo is fan van Club Brugge.
q: Fleur draagt een blauwzwarte sjaal.

Gevraagd: Schrijf in symbolen.

a) Fleur draagt geen blauwzwarte sjaal.
b) Pablo is fan van Club Brugge en Fleur draagt een blauwzwarte sjaal.
c) Als Fleur een blauwzwarte sjaal draagt, dan is Pablo fan van Club Brugge.
d) Pablo is fan van Club Brugge of Fleur draagt een blauwzwarte sjaal.
e) Fleur draagt een blauwzwarte sjaal als en slechts als Pablo fan is van Club Brugge.
f) Pablo is fan van Club Brugge of Fleur draagt geen blauwzwarte sjaal.

a) ¬q
b) p ∧ q
c) q ⇒ p
d) p ∨ q
e) q ⇔ p
f) p ∨ ¬q

--- PAGE 27 ---
**5** Vul de waarheidstabellen aan.

| p | q | p ⇒ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 1 |
| 0 | 0 | 1 |

| p | q | ¬p ∨ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 1 |
| 0 | 0 | 1 |

| p | q | p ⇔ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 0 |
| 0 | 0 | 1 |

| p | q | ¬(p ∧ q) |
| :---: | :---: | :---: |
| 1 | 0 | 1 |
| 1 | 1 | 0 |
| 0 | 1 of 0 | 1 |
| 0 | 0 of 1 | 1 |

**6** Gegeven:
p: Joni slaagt voor het examen wiskunde.
q: Lino slaagt voor het examen wiskunde.
r: Malik slaagt voor het examen wiskunde.

Noteer de volgende uitspraken in symbolen.

a) Malik is de enige die slaagt voor het examen wiskunde.
b) Er is minstens één iemand geslaagd voor het examen wiskunde.
c) Slechts één van de drie slaagt voor het examen wiskunde.
d) Er zijn er hoogstens twee van de drie geslaagd voor het examen wiskunde.
e) Er zijn er precies twee van de drie geslaagd voor het examen wiskunde.

a) r ∧ ¬q ∧ ¬p
b) r ∨ p ∨ q
c) [p ∧ ¬ (q ∨ r)] ∨ [q ∧ ¬ (p ∨ r)] ∨ [r ∧ ¬ (p ∨ q)]
d) ¬ (p ∧ q ∧ r)
e) (p ∧ q ∧ ¬r) ∨ (p ∧ r ∧ ¬q) ∨ (q ∧ r ∧ ¬p)

--- PAGE 28 ---
**7** Gegeven:
p: ∆ABC is rechthoekig in A.
q: |BC| is de langste zijde.
r: |BC|² = |AB|² + |AC|²

a) Maak een waarheidtabel voor p ⇒ q.
b) Wanneer is q ⇒ p waar?
c) Wanneer is (p ∧ q) ⇔ r waar?

a)
| p | q | p ⇒ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 0 |
| 0 | 1 | 1 |
| 0 | 0 | 1 |

b)
| p | q | q ⇒ p |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 1 | 0 | 1 |
| 0 | 1 | 0 |
| 0 | 0 | 1 |

q ⇒ p is waar in alle gevallen, behalve wanneer p niet waar is en q waar, m.a.w. wanneer ΔABC niet rechthoekig is in A en |BC| de langste zijde is.

c)
| p | q | r | p ∧ q | (p ∧ q) ⇔ r |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 |
| 1 | 1 | 0 | 1 | 0 |
| 1 | 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 0 | 0 |
| 1 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 0 | 1 |
| 0 | 0 | 1 | 0 | 0 |
| 0 | 0 | 0 | 0 | 1 |

Als ΔABC rechthoekig is in A, |BC| de langste zijde is en |BC|² = |AB|² + |AC|².
Als ΔABC rechthoekig is in A, |BC| niet de langste zijde is en |BC|² ≠ |AB|² + |AC|².
Als ΔABC niet rechthoekig is in A, |BC| de langste zijde is en |BC|² ≠ |AB|² + |AC|².
Als ΔABC niet rechthoekig is in A, |BC| niet de langste zijde is en |BC|² ≠ |AB|² + |AC|².

--- PAGE 29 ---
**8** Bepaal de gebruikte proposities en noteer de zin in symbolen.

a) Als een vlakke figuur een vierhoek is, dan is de som van de hoeken 360°.
b) Een vierhoek is een rechthoek als en slechts als het een parallellogram is met even lange diagonalen.
c) De som van de cijfers is 3 of de som van de cijfers is 9.
d) a snijdt c, b snijdt c en de verwisselende binnenhoeken zijn niet even groot of a is evenwijdig met b.

a) p: De vlakke figuur is een vierhoek.
q: De som van de hoeken is 360°.
p ⇒ q

b) p: De vierhoek is een rechthoek.
q: De vierhoek is een parallellogram.
r: De vierhoek heeft even lange diagonalen.
p ⇔ (q ∧ r)

c) p: De som van de cijfers is 3.
q: De som van de cijfers is 9.
p ∨ q

d) p: a snijdt c
q: b snijdt c
r: De verwisselende binnenhoeken zijn even groot.
s: a is evenwijdig met b.
p ∧ q ∧ (¬r ∨ s)

**9** a) Stel de waarheidstabel op voor (p ⇒ q) ⇔ [(q ⇒ ¬r) ⇒ (¬r ⇒ p)].
b) In welke situaties is deze uitspraak waar?

a)
| p | q | r | p ⇒ q | ¬r | q ⇒ ¬r | ¬r ⇒ p | (q ⇒ ¬r) ⇒ (¬r ⇒ p) | (p ⇒ q) ⇔ [(q ⇒ ¬r) ⇒ (¬r ⇒ p)] |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 0 | 0 | 1 | 1 | 1 |
| 1 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 1 | 0 | 0 | 1 | 1 | 1 | 0 |
| 0 | 1 | 1 | 1 | 0 | 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 | 1 | 1 | 1 | 1 | 0 |
| 0 | 1 | 0 | 1 | 1 | 1 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 0 | 1 | 1 | 1 | 1 |
| 0 | 0 | 0 | 1 | 1 | 1 | 0 | 0 | 0 |

b) Deze uitspraak is waar als:
- p en q waar zijn en r niet waar is
- p en q niet waar zijn en r waar is
- p, q en r waar zijn
- q en r waar zijn en p niet waar is

--- PAGE 30 ---
**10** Gegeven:
p: De trui heeft de maat medium.
q: De jas heeft de maat small.
r: Het T-shirt heeft de maat large.

a) Zet om in symbolen: “Het is niet zo dat als de trui geen maat medium heeft, dat dan de jas de maat small heeft of het T-shirt geen maat large heeft.”
b) Maak een waarheidstabel. Je weet met zekerheid dat de uitspraak p waar is en de uitspraak r niet waar.

a) ¬[¬p ⇒ (q ∨ ¬r)]

b)
| p | q | r | ¬p | ¬r | q ∨ ¬r | ¬p ⇒ (q ∨ ¬r) | ¬[¬p ⇒ (q ∨ ¬r)] |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 0 | 1 | 1 | 1 | 1 | 0 |
| 1 | 0 | 0 | 1 | 1 | 1 | 1 | 0 |

**11** Is dit een tautologie of een contradictie? Verklaar je antwoord.
a) p ∧ ¬p
b) p ⇔ ¬(¬p)
c) p ∨ ¬p
d) p ⇔ ¬p

a) Dit is een contradictie, een uitspraak kan niet tegelijkertijd waar en niet waar zijn.
b) Dit is een tautologie, ¬(¬p) is een dubbele negatie en is equivalent met p.
c) Dit is een tautologie, een uitspraak is altijd waar of niet waar.
d) Dit is een contradictie, p en niet ¬p hebben altijd een andere waarheidswaarde en zijn dus nooit equivalent.

**12** Bepaal de waarde van de uitvoer X in deze logische schakelingen.

a)
[Afbeelding: Schakeling. '1' en '0' gaan in een AND-poort ('&'). Uitgang is X.]
b)
[Afbeelding: Schakeling. '1' en '0' gaan in een OR-poort ('⩾1'). Uitgang is X.]
c)
[Afbeelding: Schakeling. '1' gaat in een NOT-poort ('1' met cirkeltje). Uitgang is X.]
d)
[Afbeelding: Schakeling. '1' en '0' gaan in een NAND-poort ('&' met cirkeltje). Uitgang is X.]

a) De waarde van X is 0.
b) De waarde van X is 1.
c) De waarde van X is 0.
d) De waarde van X is 1.

--- PAGE 31 ---
**13** Gebruik een waarheidstabel om aan te tonen dat (p ⇒ q) ∨ (p ⇒ ¬q) een tautologie is.

| p | q | ¬q | p ⇒ q | p ⇒ ¬q | (p ⇒ q) ∨ (p ⇒ ¬q) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 0 | 1 | 0 | 1 |
| 1 | 0 | 1 | 0 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 |
| 0 | 0 | 1 | 1 | 1 | 1 |

**14** Noteer de eigenschap in symbolen en toon de eigenschap aan met een waarheidstabel.
a) De conjunctie is commutatief.
b) De disjunctie is associatief.

a) (p ∧ q) ⇔ (q ∧ p)

| p | q | p ∧ q | q ∧ p | (p ∧ q) ⇔ (q ∧ p) |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 0 | 1 |
| 0 | 0 | 0 | 0 | 1 |

b) [(p ∨ q) ∨ r] ⇔ [p ∨ (q ∨ r)]

| p | q | r | p ∨ q | (p ∨ q) ∨ r | q ∨ r | p ∨ (q ∨ r) | [(p ∨ q) ∨ r] ⇔ [p ∨ (q ∨ r)] |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 1 | 0 | 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
| 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 | 0 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 | 1 | 1 |
| 0 | 0 | 1 | 0 | 1 | 1 | 1 | 1 |
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |

--- PAGE 32 ---
**15** Bepaal de waarde van de uitvoer X in deze logische schakelingen.

a)
[Afbeelding: Schakeling. A=1 en B=0 in OR-poort ('⩾1'). Uitgang daarvan ('1' in het rood) samen met C=1 in AND-poort ('&'). Uitgang X ('1' in het rood).]
a) De waarde van X is 1.

b)
[Afbeelding: Schakeling. A=1 en B=0 in OR-poort ('⩾1'), rode uitgang '1'. C=1 en D=1 in AND-poort ('&'), rode uitgang '1'. De twee uitgangen ('1' en '1') in NOR-poort ('⩾1' met cirkeltje), uitgang '0'.]
b) De waarde van X is 0.

**16** a) Bewijs met een waarheidstabel dat [(p ⇒ q) ∧ p] ⇒ q altijd waar is.
We noemen deze eigenschap **Modus ponens**.
b) Verklaar waarom volgende redenering correct is: “Als ik schuldig ben, dan word ik gestraft, bovendien ben ik schuldig. Ik word gestraft.”

a)
| p | q | p ⇒ q | (p ⇒ q) ∧ p | [(p ⇒ q) ∧ p] ⇒ q |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 | 1 |
| 0 | 1 | 1 | 0 | 1 |
| 0 | 0 | 1 | 0 | 1 |

b) p: ik ben schuldig.
q: Ik word gestraft.
[(p ⇒ q) ∧ p] ⇒ q is altijd waar → zie a).

--- PAGE 33 ---
**17** a) Bewijs met een waarheidstabel dat [(p ⇒ q) ∧ ¬q] ⇒ ¬p altijd waar is.
We noemen deze eigenschap **Modus tollens**.
b) Verklaar waarom volgende redenering correct is: “Als een getal deelbaar is door 10, dan is het deelbaar door 2, bovendien is het getal oneven. Het getal is niet deelbaar door 10.”

a)
| p | q | p ⇒ q | ¬q | (p ⇒ q) ∧ ¬q | ¬p | [(p ⇒ q) ∧ ¬q] ⇒ ¬p |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 | 0 | 1 |
| 0 | 1 | 1 | 0 | 0 | 1 | 1 |
| 0 | 0 | 1 | 1 | 1 | 1 | 1 |

b) p: Het getal is deelbaar door 10.
q: Het getal is deelbaar door 2.
¬q: Het getal is niet deelbaar door 2, het getal is dus oneven.
[(p ⇒ q) ∧ ¬q] ⇒ ¬p is altijd waar → zie a).

**18** Een leraar stelt een meerkeuzevraag met precies één juist antwoord (A, B of C). Sahar, Jasper en Lucie doen elk één uitspraak om je te helpen. Slechts één van deze leerlingen doet een ware uitspraak. Geef het juiste antwoord op de meerkeuzevraag.

[Afbeelding: Sahar. Tekstballon: A of B is het juiste antwoord.]
[Afbeelding: Jasper. Tekstballon: B of C is het juiste antwoord.]
[Afbeelding: Lucie. Tekstballon: A is het juiste antwoord.]

Sahar zegt dat A of B het juiste antwoord is. Als ze dat zegt en het antwoord is A, dan spreekt Lucie ook de waarheid. Als het antwoord B is, dan zegt Jasper de waarheid. Aangezien slechts één van de drie de waarheid spreekt, is het alvast niet Sahar.
Als Lucie de waarheid spreekt, dan is het juiste antwoord A, waardoor Sahar ook de waarheid spreekt. Lucie kan dus de waarheid niet spreken, aangezien er slechts één van de drie de waarheid spreekt.
Als Jasper de waarheid spreekt en C is het juiste antwoord, dan liegen Sahar en Lucie. Jasper spreekt dus de waarheid!

--- PAGE 34 ---
**19** Toon aan dat (p ⇔ q) ∧ (¬p ∧ q) een contradictie is.

| p | q | p ⇔ q | ¬p | ¬p ∧ q | (p ⇔ q) ∧ (¬p ∧ q) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 0 |
| 1 | 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 1 | 0 |
| 0 | 0 | 1 | 1 | 0 | 0 |

**20** Bepaal de waarde van de uitvoer X in deze logische schakeling.

A = 1
B = 0
C = 0
D = 0

[Afbeelding: Schakeling. A=1 en B=0 gaan door OR ('⩾1'), output rode '1'. Een splitsing van deze '1' gaat door een NOT-poort ('1' met cirkeltje), rode output '0'. C=0 gaat door een NOT ('1' met cirkeltje), rode output '1'. D=0 gaat door een NOT ('1' met cirkeltje), rode output '1'. De twee rode enen gaan door een OR ('⩾1'), rode output '1'. Een eerdere aftakking met rode '0' van de eerste NOT-poort en deze rode '1' gaan door een OR ('⩾1'), rode output '0'. Dat is X.]

De waarde van X is 0.

**21** a) De uitspraak p ⇒ q is waar. In welk geval kan q niet waar zijn?
b) De uitspraak p ⇔ q is niet waar. Welke waarheidswaarde heeft q als p waar is?
c) Schrijf de uitspraak p ∨ q anders door gebruik te maken van een negatie en een conjunctie.

a)
| p | q | p ⇒ q |
| :---: | :---: | :---: |
| 1 | 1 | 1 |
| 0 | 1 | 1 |
| 0 | 0 | 1 |

q is niet waar als p niet waar is.

b)
| p | q | p ⇔ q |
| :---: | :---: | :---: |
| 1 | 0 | 0 |
| 0 | 1 | 0 |

q is niet waar als p waar is.

c) ¬(¬p ∧ ¬q)

--- PAGE 35 ---
**22** Toon aan.
a) p ∧ (p ∨ q) ⇔ p
b) [(p ⇒ q) ∧ ¬q] ⇒ ¬p
c) (p ∧ q) ⇒ p
d) ¬(p ⇔ q) ⇔ (p ⇔ ¬q)

a)
| p | q | p ∨ q | p ∧ (p ∨ q) | [p ∧ (p ∨ q)] ⇔ p |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 1 | 1 | 1 |
| 0 | 1 | 1 | 0 | 1 |
| 0 | 0 | 0 | 0 | 1 |

b)
| p | q | p ⇒ q | ¬q | ¬p | (p ⇒ q) ∧ ¬q | [(p ⇒ q) ∧ ¬q] ⇒ ¬p |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 | 0 | 1 |
| 0 | 1 | 1 | 0 | 1 | 0 | 1 |
| 0 | 0 | 1 | 1 | 1 | 1 | 1 |

c)
| p | q | p ∧ q | (p ∧ q) ⇒ p |
| :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 |
| 0 | 0 | 0 | 1 |

d)
| p | q | p ⇔ q | ¬(p ⇔ q) | ¬q | p ⇔ ¬q | [¬(p ⇔ q)] ⇔ (p ⇔ ¬q) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 0 | 1 |
| 1 | 0 | 0 | 1 | 1 | 1 | 1 |
| 0 | 1 | 0 | 1 | 0 | 1 | 1 |
| 0 | 0 | 1 | 1 | 1 | 0 | 1 |

--- PAGE 36 ---
**23** Toon de eigenschap aan met een waarheidstabel.
a) De transitiviteit van de implicatie: [(p ⇒ q) ∧ (q ⇒ r)] ⇒ (p ⇒ r)
b) De commutativiteit van de equivalentie: (p ⇔ q) ⇔ (q ⇔ p)

a)
| p | q | r | p ⇒ q | q ⇒ r | (p ⇒ q) ∧ (q ⇒ r) | p ⇒ r | [(p ⇒ q) ∧ (q ⇒ r)] ⇒ (p ⇒ r) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 1 | 0 | 1 | 0 | 0 | 0 | 1 |
| 1 | 0 | 1 | 0 | 1 | 0 | 1 | 1 |
| 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 | 1 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 | 0 | 0 | 1 | 1 |
| 0 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
| 0 | 0 | 0 | 1 | 1 | 1 | 1 | 1 |

b)
| p | q | p ⇔ q | q ⇔ p | (p ⇔ q) ⇔ (q ⇔ p) |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 0 | 1 |
| 0 | 0 | 1 | 1 | 1 |

**24** Kleur de uitspraken die equivalent zijn met ¬(p ⇒ r) ∨ q.

| ¬(p ⇒ q) ⇒ ¬r | ¬q ⇒ (r ∨ ¬p) | ¬q ⇒ ¬(p ⇒ r) | ¬(p ∧ ¬r) ∨ ¬q |
| :---: | :---: | :---: | :---: |
| q ⇒ (p ⇒ r) | (¬p ⇒ ¬r) ∨ r | (¬r ∧ p) ∨ q | ¬q ⇒ (¬p ⇒ ¬r) |

| p | q | r | p ⇒ r | ¬(p ⇒ r) | ¬(p ⇒ r) ∨ q |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 1 | 1 |
| 1 | 0 | 1 | 1 | 0 | 0 |
| 0 | 1 | 1 | 1 | 0 | 1 |
| 1 | 0 | 0 | 0 | 1 | 1 |
| 0 | 1 | 0 | 1 | 0 | 1 |
| 0 | 0 | 1 | 1 | 0 | 0 |
| 0 | 0 | 0 | 1 | 0 | 0 |

| p | q | r | p ⇒ q | ¬(p ⇒ q) | ¬r | ¬(p ⇒ q) ⇒ ¬r |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 0 | 1 | 0 | 1 | 1 |
| 1 | 0 | 1 | 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 1 | 0 | 0 | 1 |
| 1 | 0 | 0 | 0 | 1 | 1 | 1 |
| 0 | 1 | 0 | 1 | 0 | 1 | 1 |
| 0 | 0 | 1 | 1 | 0 | 0 | 1 |
| 0 | 0 | 0 | 1 | 0 | 1 | 1 |

| p | q | r | ¬q | ¬p | r ∨ ¬p | ¬q ⇒ (r ∨ ¬p) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 1 | 1 |
| 1 | 1 | 0 | 0 | 0 | 0 | 1 |
| 1 | 0 | 1 | 1 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 0 | 0 | 0 |
| 0 | 1 | 0 | 0 | 1 | 1 | 1 |
| 0 | 0 | 1 | 1 | 1 | 1 | 1 |
| 0 | 0 | 0 | 1 | 1 | 1 | 1 |

| p | q | r | ¬q | p ⇒ r | ¬(p ⇒ r) | ¬q ⇒ ¬(p ⇒ r) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 0 | 1 | 1 |
| 1 | 0 | 1 | 1 | 1 | 0 | 0 |
| 0 | 1 | 1 | 0 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 | 1 | 1 |
| 0 | 1 | 0 | 0 | 1 | 0 | 1 |
| 0 | 0 | 1 | 1 | 1 | 0 | 0 |
| 0 | 0 | 0 | 1 | 1 | 0 | 0 |

--- PAGE 37 ---
| p | q | r | ¬r | p ∧ ¬r | ¬(p ∧ ¬r) | ¬q | ¬(p ∧ ¬r) ∨ ¬q |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 1 | 1 | 0 | 0 | 0 |
| 1 | 0 | 1 | 0 | 0 | 1 | 1 | 1 |
| 0 | 1 | 1 | 0 | 0 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 1 | 0 | 1 | 1 |
| 0 | 1 | 0 | 1 | 0 | 1 | 0 | 1 |
| 0 | 0 | 1 | 0 | 0 | 1 | 1 | 1 |
| 0 | 0 | 0 | 1 | 0 | 1 | 1 | 1 |

| p | q | r | p ⇒ r | q ⇒ (p ⇒ r) |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 |
| 1 | 1 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 | 1 |
| 0 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 | 1 |
| 0 | 0 | 1 | 1 | 1 |
| 0 | 0 | 0 | 1 | 1 |

| p | q | r | ¬p | ¬r | ¬p ⇒ ¬r | (¬p ⇒ ¬r) ∨ r |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 1 | 1 |
| 1 | 1 | 0 | 0 | 1 | 1 | 1 |
| 1 | 0 | 1 | 0 | 0 | 1 | 1 |
| 0 | 1 | 1 | 1 | 0 | 0 | 1 |
| 1 | 0 | 0 | 0 | 1 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 | 1 |
| 0 | 0 | 1 | 1 | 0 | 0 | 1 |
| 0 | 0 | 0 | 1 | 1 | 1 | 1 |

| p | q | r | ¬r | ¬r ∧ p | (¬r ∧ p) ∨ q |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 0 | 1 | 1 | 1 |
| 1 | 0 | 1 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 | 0 | 1 |
| 1 | 0 | 0 | 1 | 1 | 1 |
| 0 | 1 | 0 | 1 | 0 | 1 |
| 0 | 0 | 1 | 0 | 0 | 0 |
| 0 | 0 | 0 | 1 | 0 | 0 |

| p | q | r | ¬q | ¬p | ¬r | ¬p ⇒ ¬r | ¬q ⇒ (¬p ⇒ ¬r) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 0 | 1 | 1 |
| 1 | 1 | 0 | 0 | 0 | 1 | 1 | 1 |
| 1 | 0 | 1 | 1 | 0 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 | 1 | 0 | 0 | 0 |
| 1 | 0 | 0 | 1 | 0 | 1 | 1 | 1 |
| 0 | 1 | 0 | 0 | 1 | 1 | 1 | 1 |
| 0 | 0 | 1 | 1 | 1 | 0 | 0 | 0 |
| 0 | 0 | 0 | 1 | 1 | 1 | 1 | 1 |

**25** Bepaal de waarde van de uitvoer X in deze logische schakeling.

A = 1
B = 0
C = 1
D = 0
E = 1
F = 1
G = 1

[Afbeelding: Schakeling. F=1 en G=1 naar OR-poort, dit genereert een '1'. B=0 en C=1 naar AND-poort, dit genereert een '0'. De uitgangen en de rest van de input D=0, E=1, A=1 werken samen naar een uiteindelijke NOR-poort (⩾1 met cirkeltje) die als uitgang X=0 genereert.]

De waarde van X is 0.

--- PAGE 38 ---
**26** Drie koppeltjes spelen samen een spelletje Uno aan een ronde tafel.
• Mathilde zegt: “Ruben zat rechts van de vrouw die rechts zat van de man die rechts zat van Vicky.”
• Daphné zat rechts van de man die rechts zat van de vrouw die rechts zat van de man die rechts zat van de vrouw die rechts zat van de man van Mathilde.
• Björn zat rechts van de vrouw die rechts zat van Robin.
• Bovendien zat Mathilde niet naast haar man.

Hoe heet de man van Mathilde?
De man van Mathilde heet Robin.

[Afbeelding: Een schema van de ronde tafel. Bovenaan staat Daphné (vrouw-symbool ♀). Rechts daarvan Ruben. Rechts daarvan Mathilde (vrouw-symbool ♀). Onder Bjorn (man-symbool ♂). Links daarvan Vicky. Boven Vicky Robin.]

--- PAGE 39 ---
**27** Arshad en Hans spelen een spelletje Tic Tac Toe.
Elke speler probeert om drie kruisjes of cirkels op één lijn te krijgen (ook diagonaal).
Ze houden volgende regels aan:
- Probeer altijd te winnen.
- Probeer te voorkomen dat de andere speler wint.

De eerste regel krijgt altijd voorrang op de tweede.

Hieronder zie je de situatie waarbij al zes zetten gedaan zijn en waarbij Arshad met kruisjes speelt. Merk op, we weten niet wie er begonnen is!
Wie zal het spelletje winnen?

| 0 | 0 |   |
|---|---|---|
| 0 | X |   |
| X | X |   |

De rondjes winnen, Hans dus!

Als Hans (rondjes) de zesde zet had gedaan, kan de situatie er na de vijfde zet als volgt uitgezien hebben:

| 0 |   |   |
|---|---|---|
| 0 | X |   |
| X | X |   |
of
|   | 0 |   |
|---|---|---|
| 0 | X |   |
| X | X |   |
of
| 0 | 0 |   |
|---|---|---|
|   | X |   |
| X | X |   |

Aangezien ze de spelregels moeten volgen, zou alleen mogelijkheid 1 de situatie uit de opgave kunnen opleveren. In dat geval, zou de situatie er na vier zetten op deze manier hebben uitgezien:

| 0 |   |   |
|---|---|---|
| 0 | X |   |
|   | X |   |
of
|   | 0 |   |
|---|---|---|
| 0 |   |   |
| X | X |   |
of
|   | 0 |   |
|---|---|---|
| 0 | X |   |
|   | X |   |

Aangezien ze de spelregels moeten volgen, zou Arshad in alle drie de gevallen de winnende zet gedaan hebben, wat niet gebeurd is! We kunnen dus besluiten dat Arshad niet de vijfde zet heeft gedaan en Hans niet de zesde. Arshad moet dus de zesde zet gedaan hebben en mag Hans de zevende, winnende zet doen!

--- PAGE 40 ---
**28** Toon aan:
a) (p ∧ q) ⇒ (p ∨ q)
b) ¬[p ∨ (¬p ∧ ¬q)] ⇔ (¬p ∧ q)
c) ¬[(p ∧ q) ∧ r] ⇔ [(p ∧ q) ⇒ ¬r]
d) [(p ⇒ ¬q) ∧ (r ⇒ q)] ⇒ (p ⇒ ¬r)

a)
| p | q | p ∧ q | p ∨ q | (p ∧ q) ⇒ (p ∨ q) |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 |
| 0 | 0 | 0 | 0 | 1 |

b)
| p | q | ¬p | ¬q | ¬p ∧ ¬q | p ∨ (¬p ∧ ¬q) | ¬[p ∨ (¬p ∧ ¬q)] | ¬p ∧ q | ¬[p ∨ (¬p ∧ ¬q)] ⇔ (¬p ∧ q) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 1 |
| 0 | 1 | 1 | 0 | 0 | 0 | 1 | 1 | 1 |
| 0 | 0 | 1 | 1 | 1 | 1 | 0 | 0 | 1 |

c)
| p | q | r | p ∧ q | (p ∧ q) ∧ r | ¬[(p ∧ q) ∧ r] | ¬r | (p ∧ q) ⇒ ¬r | ¬[(p ∧ q) ∧ r] ⇔ [(p ∧ q) ⇒ ¬r] |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 1 |
| 1 | 1 | 0 | 1 | 0 | 1 | 1 | 1 | 1 |
| 1 | 0 | 1 | 0 | 0 | 1 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 | 0 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 0 | 0 | 1 | 1 | 1 | 1 |
| 0 | 1 | 0 | 0 | 0 | 1 | 1 | 1 | 1 |
| 0 | 0 | 1 | 0 | 0 | 1 | 0 | 1 | 1 |
| 0 | 0 | 0 | 0 | 0 | 1 | 1 | 1 | 1 |

d)
| p | q | r | ¬q | p ⇒ ¬q | r ⇒ q | (p ⇒ ¬q) ∧ (r ⇒ q) | ¬r | p ⇒ ¬r | [(p ⇒ ¬q) ∧ (r ⇒ q)] ⇒ (p ⇒ ¬r) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 1 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 1 | 1 |
| 1 | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 1 |
| 0 | 1 | 1 | 0 | 1 | 1 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 0 | 1 | 0 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
| 0 | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 1 | 1 |
| 0 | 0 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

--- PAGE 41 ---
**29** Bepaal de waarde van de mogelijke invoer in deze logische schakeling.

[Afbeelding: Schakeling. Ingangen met rode waarden '1', '1', '0', '0' gaan naar OR en AND poorten. Uiteindelijke uitgang = 1]

(Aantekening op pagina):
1
1
0
0
1
0

**30** Toon aan dat [p ⇒ ((q ∧ ¬r) ⇒ s) ∧ (¬p ∨ ¬s)] ⇒ [p ⇒ (q ⇒ r)] een tautologie is.

| p | q | r | s | ¬r | q ∧ ¬r | (q ∧ ¬r) ⇒ s | ¬p | ¬s | ¬p ∨ ¬s | [(q ∧ ¬r) ⇒ s] ∧ (¬p ∨ ¬s) | p ⇒ [[(q ∧ ¬r) ⇒ s] ∧ (¬p ∨ ¬s)] | q ⇒ r | p ⇒ (q ⇒ r) | [p ⇒ [[(q ∧ ¬r) ⇒ s] ⇔ (¬p ∨ ¬s)]] ⇔ [(p ⇒ (q ⇒ r)] |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 1 |
| 1 | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 1 | 0 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 1 | 0 | 1 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 1 |
| 0 | 1 | 1 | 1 | 0 | 0 | 1 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 1 | 0 | 0 | 1 | 1 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 1 |
| 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 0 | 1 | 1 | 0 | 0 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 0 | 0 | 1 | 1 | 0 | 0 | 1 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 0 | 1 | 0 | 0 | 1 | 1 | 0 | 1 | 1 | 1 | 0 | 1 | 1 | 1 | 1 |
| 0 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 0 | 0 | 0 | 1 | 1 | 0 | 1 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
| 0 | 0 | 0 | 0 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

--- PAGE 42 ---
# Computationeel denken

## Logische operatoren

Zoals je weet wordt er in programmeren ook gebruik gemaakt van logische operatoren.

**Toepassing 1: Booleaanse variabelen**
a) Noteer onder de code wat de uitvoer is.
b) Welke logische operator wordt er gebruikt?
c) Wijzig indien nodig de code zodat de uitvoer TRUE is.

[Afbeelding: Python logo]
```python
1  p = False
2  q = True
3  print(not p)
```
a) True
b) negatie
c) /

[Afbeelding: Python logo]
```python
1  p = False
2  q = True
3  print(p and q)
```
a) False
b) conjuctie
c) p = True
   q = True
   print (p and q)

[Afbeelding: Python logo]
```python
1  p = False
2  q = True
3  print(p or q)
```
a) True
b) disjunctie
c) /

d) Waarom wordt er in onderstaande code geen False geprint? Welk logisch begrip kan je hier eigenlijk aan koppelen?

[Afbeelding: Python logo]
```python
1  p = False
2  q = False
3  print(p == q)
```
[ ... invulveld ... ]
Het gaat om een equivalentie.
De waarde van p is equivalent met de waarde van q.

e) Welke uitvoer verkrijg je hier? Aan welk logisch begrip doet dat je denken?

[Afbeelding: Python logo]
```python
1  p = False
2  q = True
3  print(not p or q)
```
[ ... invulveld ... ]
¬p: True q: True
¬p ∨ q = True OR is een disjunctie. (¬p ∨ q) ⇔ (p ⇒ q)
logische wet

--- PAGE 43 ---
**Toepassing 2: Wachtwoorden**

[Afbeelding: Python logo]
```python
1  nieuwWachtwoord = input("Voer je nieuw wachtwoord in:")
2  herhaalWachtwoord = input("Voer opnieuw je nieuw wachtwoord in:")
3  if nieuwWachtwoord != herhaalWachtwoord:
4      print("De wachtwoorden stemmen niet overeen.")
5  else:
6      print("Jouw nieuw wachtwoord is ingesteld.")
```

a) Beschrijf wat er gebeurt in deze code.
[ ... invulveld ... ]
Er wordt gecontroleerd of beide wachtwoorden die je hebt ingevoerd aan elkaar gelijk zijn.

b) Van welke logische operator wordt hier gebruik gemaakt?
[ ... invulveld ... ]
een implicatie

**Toepassing 3: Getallen die voldoen aan een voorwaarde**

[Afbeelding: Python logo]
```python
1  getallen = [0,1,2,3,4,5,6,7,8,9,10]
2  for x in getallen:
3      if (not x%2==0 or x%3==0):
4          print(x)
```

a) Hoeveel getallen (en welke) worden er uitgevoerd?
[ ... invulveld ... ]
0, 1, 3, 5, 6, 7, 9 (7 getallen)

b) Pas de code aan zodat de voorwaarde wordt: niet deelbaar door 2 en deelbaar door 3.
```python
1  getallen = [0,1,2,3,4,5,6,7,8,9,10]
2  for x in getallen:
3      if (not x%2==0 and x%3==0):
4          print(x)
```

c) Pas de code aan zodat de getallen tussen 15 en 30 liggen. Controleer op de voorwaarde deelbaar door 3 of niet door 6.
```python
1  getallen = [15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
2  for x in getallen:
3      if (x%3==0 or not x%6==0):
4          print(x)
```

--- PAGE 44 ---
**Toepassing 4**

[Afbeelding: Python logo]
```python
 1  a = 81
 2  b = 900
 3  if (a > b):
 4      while b != 0:
 5          rest = a%b
 6          a = b
 7          b = rest
 8      print(a)
 9  else:
10      while a != 0:
11          rest = b%a
12          b = a
13          a = rest
14      print(b)
```

Beschrijf wat er gebeurt in deze code.
[ ... invulveld ... ]
Er wordt op zoek gegaan naar de grootst gemeenschappelijke deler van de getallen a en b.
a%b is de rest bij de deling van a door b.
Deze methode steunt op het algoritme van Euclides: als r de rest is bij de deling van a door b, dan is ggd(a, b) = ggd(b, r). Deze procedure herhaalt zich totdat het paar bestaat uit twee gelijke getallen en er dus, bij deling, een rest ontstaat van 0. Dat getal is de grootste gemene deler van het oorspronkelijke paar natuurlijke getallen.

[Afbeelding: Logo van "die Keure educatief"]

Auteurs Philip Bogaert, Björn Carreyn en Roger Van Nieuwenhuyze
Tweede editie - Bestelnummer 94 606 0119 (module 01 van 18)
ISBN 978 90 4864 973 0 - KB D/2024/0147/206 - NUR 126/128/129 - Thema YPMF
Illustrator Jona Jamart - Design en lay-out die Keure
Verantwoordelijke uitgever die Keure, Kleine Pathoekeweg 3, 8000 Brugge
RPR 0405 108 325 - © Copyright die Keure, Brugge
[Afbeelding: FSC logo]
--- PAGE 1 ---
# Nando 4

**Inhoud**
Instap
1 Terminologie uit de verzamelingenleer
2 De productregel
3 De somregel
4 De complementregel
**Signaaloefeningen**
**Differentiatietraject**
**Computationeel denken**
**Studiewijzer**

**D-FINALITEIT 5 UUR – DISCRETE WISKUNDE EN LOGICA**
# 07 Telproblemen

## WAT JE AL KUNT
– de doorsnede, unie en het verschil van verzamelingen bepalen

## IN DE KIJKER
Je leest en herleest de opgave grondig en formuleert het antwoord steeds in een volledige zin.

## WAT JE LEERT IN DEZE MODULE
– de juiste terminologie en symbolen uit de verzamelingenleer correct gebruiken
– de productregel toepassen om bepaalde telproblemen op te lossen
– de somregel voor al dan niet disjuncte verzamelingen toepassen
– de complementregel toepassen
– gepaste venndiagrammen tekenen bij het oplossen van problemen

## WISKUNDETAAL
– doorsnede
– unie
– verschil
– complement
– kardinaalgetal
– productregel
– boomdiagram
– somregel
– productverzameling
– venndiagram
– disjuncte verzamelingen
– inclusieve of
– exclusieve of

--- PAGE 2 ---
# Instap

## Opdracht 1

a) Kleur telkens het juiste gebied.

[Afbeelding: Venndiagram A en B met A ∪ B ingekleurd]
A ∪ B

[Afbeelding: Venndiagram A en B met A \ B ingekleurd]
A \ B

[Afbeelding: Venndiagram A en B met A ∩ B ingekleurd]
A ∩ B

b) Noteer de betekenis.
• A ∪ B: Alle elementen die behoren tot A of B of beide.
• A \ B: Alle elementen die behoren tot A, maar niet tot B.
• A ∩ B: Alle elementen die behoren tot A én B.

## Opdracht 2

Hieronder vind je een afbeelding van een Europese roulettetafel.

[Afbeelding: Europese roulettetafel met getallen 0 t.e.m. 36 en inzetgebieden]

**GOKVERSLAVING**
Om een casino te bezoeken moet je 21 jaar zijn. Bij de ingang moet je je laten registreren (naam, voornaam, beroep en adres, kopie van je identiteitskaart, handtekening). Ook voor de internetspelen van een casino moet je 21 zijn.
[Afbeelding: Icoon 21+]

a) Hoeveel getallen op het rad hebben een zwarte kleur? 18
b) Hoeveel getallen op het rad zijn een veelvoud van 3, maar verschillend van 0? 12
c) Hoeveel getallen op het rad vallen onder “serie 0/2/3”? 10
d) Hoeveel getallen zijn oneven en hebben een rode kleur? 10
e) Hoeveel getallen zijn even of hebben een zwarte kleur? 26
f) Hoeveel getallen zijn een priemgetal en geen orphelins? 8

--- PAGE 3 ---
## Opdracht 3

Gegeven:
In een klas zitten 16 leerlingen.
U is de verzameling van alle leerlingen van deze klas.
A is de verzameling van alle jongens van deze klas.
B is de verzameling van alle leerlingen die een bril dragen.

U = {Trees, Lowie, Emma, Imke, Bart, Tim, Bert, Bea, Ahmed, Naïma, Jef, Kristof, Kathy, Yassin, Paul, Hassan}
A = {Lowie, Bart, Tim, Bert, Ahmed, Jef, Kristof, Yassin, Paul, Hassan}
B = {Kathy, Ahmed, Paul, Bea, Lowie, Trees}

a) Vul de namen van de leerlingen in het volgende venndiagram op de juiste plaats in.

[Afbeelding: Venndiagram met verzameling U, A en B. In A staan Imke, Bart, Bert, Tim, Jef, Kristof, Yassin, Hassan. In B staan Kathy, Bea, Trees. In de doorsnede van A en B staan Lowie, Ahmed, Paul. Buiten A en B, maar in U, staan Naïma, Emma.]

b) Hoeveel meisjes zijn er in de klas?
Er zijn 6 meisjes in de klas.

c) Hoeveel leerlingen dragen geen bril?
10 leerlingen dragen geen bril.

d) Wat betekent A ∩ B?
Alle jongens van de klas die een bril dragen.

e) Waar of niet waar: "Emma draagt een bril."
Niet waar.

--- PAGE 4 ---
# 1 Terminologie uit de verzamelingenleer

U is de verzameling van de natuurlijke getallen.
A is de verzameling van de natuurlijke delers van 24.
B is de verzameling van de natuurlijke delers van 36.

[Afbeelding: Venndiagram met U, A, B. Elementen 0, 5, 7 in U; 8, 24 in A\B; 1, 2, 3, 4, 6, 12 in A ∩ B; 9, 18, 36 in B\A]

U = {0, 1, 2, 3, …}
A = {1, 2, 3, 4, 6, 8, 12, 24}
B = {1, 2, 3, 4, 6, 9, 12, 18, 36}

## 1.1 Doorsnede en unie van twee verzamelingen

**doorsnede van A en B**
A ∩ B is de verzameling van alle natuurlijke getallen die deler zijn van 24 **en** deler zijn van 36.

**unie van A en B**
A ∪ B is de verzameling van alle natuurlijke getallen die deler zijn van 24 **of** deler zijn van 36.

[Afbeelding: Venndiagram waarbij de doorsnede A ∩ B gekleurd is]
A ∩ B = {1, 2, 3, 4, 6, 12}
#(A ∩ B) = 6 → Het kardinaalgetal van A ∩ B is 6.

[Afbeelding: Venndiagram waarbij de unie A ∪ B gekleurd is]
A ∪ B = {1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36}
#(A ∪ B) = 11 → Het kardinaalgetal van A ∪ B is 11.

definitie Het **kardinaalgetal** is het aantal elementen in de verzameling.
notatie #

**Merk op**
De gebruikte of betekent ofwel/en en wordt ook wel de **inclusieve of** genoemd.

• Ik ga op reis naar Parijs *of* Londen houdt dus ook in dat je naar Parijs kunt gaan *en* naar Londen.
• Ik ga op reis naar Parijs *ofwel* naar Londen, houdt in dat je *ofwel* naar Parijs gaat ofwel naar Londen, maar zeker niet naar beide.

De *ofwel* wordt ook de **exclusieve of** genoemd.

--- PAGE 5 ---
## 1.2 Verschil van twee verzamelingen en het complement van een verzameling

**A verschil B**
A\B is de verzameling van alle natuurlijke getallen die een deler zijn van 24, maar geen deler zijn van 36.

[Afbeelding: Venndiagram waarbij A\B is gekleurd]
A\B = {8, 24}
#(A\B)= 2

**B verschil A**
B\A is de verzameling van alle natuurlijke getallen die een deler zijn van 36, maar geen deler zijn van 24.

[Afbeelding: Venndiagram waarbij B\A is gekleurd]
B\A = {9, 18, 36}
#(B\A)= 3

**U verschil A**
U\A is de verzameling van alle natuurlijke getallen die geen deler zijn van 24.

[Afbeelding: Venndiagram waarbij U\A is gekleurd]
U\A = {9, 18, 0, 5, 7, 108, …}

Omdat U\A een oneindige verzameling is, noteren we het kardinaalgetal niet.
U\A wordt ook het **complement** van A genoemd en dit noteren we zo: $\overline{A}$

**U verschil B**
U\B is de verzameling van alle natuurlijke getallen die geen deler zijn van 36.

[Afbeelding: Venndiagram waarbij U\B is gekleurd]
U\B = {8, 24, 0, 5, 7, 17, 108, 10 805, …}

Omdat U\B een oneindige verzameling is, noteren we het kardinaalgetal niet.
U\B wordt ook het **complement** van B genoemd en dit noteren we zo: $\overline{B}$

--- PAGE 6 ---
# Verwerkingsopdrachten

**1** Gegeven:
U is de verzameling van alle vierhoeken.
A is de verzameling van alle rechthoeken.
B is de verzameling van alle ruiten.

a) Teken een passende figuur in elk gebied en plaats de nodige drie puntjes om aan te duiden dat er oneindig veel figuren in een gebied thuishoren.

[Afbeelding: Venndiagram met U, A en B. In A\B staat een rechthoek. In B\A staat een ruit. In A ∩ B staat een vierkant. In U\(A ∪ B) staat een parallellogram. Overal staan "..." bijgetekend.]

b) Omschrijf in woorden:

• A\B : Alle rechthoeken die geen ruit zijn.
• $\overline{B}$: Alle vierhoeken die geen ruit zijn.
• A ∩ B: Alle vierhoeken die een ruit en een rechthoek zijn, alle vierkanten dus.
• A ∪ B: Alle vierhoeken die een ruit of een rechthoek zijn.
• B\A: Alle ruiten die geen rechthoek zijn.
• $\overline{A}$: Alle vierhoeken die geen rechthoek zijn.

--- PAGE 7 ---
**2** Gegeven:
U is de verzameling van de natuurlijke getallen.
P is de verzameling van de priemgetallen kleiner dan 20.
A is de verzameling van alle natuurlijke getallen kleiner dan 20.

a) Plaats de getallen in het venndiagram.

[Afbeelding: Venndiagram U, P en A. P is een deelverzameling van A (P ligt volledig in A, waarbij het gearceerd is in P). Binnen P staan: 2, 3, 5, 7, 11, 13, 17, 19. Binnen A, buiten P staan: 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18. Buiten A (en P), in U staan: 20, 27, 104, ...]

b) Omschrijf in woorden:
• P ∩ A: Alle priemgetallen kleiner dan 20.
• $\overline{A}$: Alle natuurlijke getallen groter of gelijk aan 20.

c) Bepaal …
• #(P) = 8
• #(A\P) = 11

**3** U is de verzameling van alle driehoeken.
A is de verzameling van alle gelijkbenige driehoeken.
B is de verzameling van alle rechthoekige driehoeken.

Teken een figuur die een element is van:

a) A ∩ B: bv.
[Afbeelding: Gelijkbenige rechthoekige driehoek]

c) $\overline{B}$: bv.
[Afbeelding: Willekeurige driehoek (niet rechthoekig)]

b) B\A: bv.
[Afbeelding: Willekeurige rechthoekige driehoek]

d) A ∪ B: bv.
[Afbeelding: Gelijkbenige stomphoekige driehoek]

--- PAGE 8 ---
**4** U is de verzameling van alle leerlingen uit de klas.
A is de verzameling van alle leerlingen met blond haar.
B is de verzameling van alle meisjes.

[Afbeelding: Venndiagram U met verzamelingen A en B. Gebied I is A\B. Gebied II is A ∩ B. Gebied III is B\A. Gebied IV is U\(A ∪ B).]

a) In welk gebied horen de volgende leerlingen te staan? Omcirkel.

[Afbeelding: Meisje met lang bruin haar]
I II (III) IV

[Afbeelding: Jongen met blond haar]
(I) II III IV

[Afbeelding: Meisje met blond haar]
I (II) III IV

[Afbeelding: Jongen met bruin haar]
I II III (IV)

b) Welke leerlingen zitten in gebied IV?
Alle jongens uit de klas die niet blond zijn.

c) Plaats de namen van de leerlingen uit je klas ook op deze manier in een venndiagram.
Antwoord van de leerlingen.

--- PAGE 9 ---
# 2 De productregel

**Voorbeeld 1**
Marijke heeft 4 verschillende kleedjes en 3 verschillende pulls.
Op hoeveel verschillende manier kan Marijke zich kleden met een kleedje en een pull?

We kunnen hierbij een **boomdiagram** tekenen.

[Afbeelding: Foto van kleding in een kledingrek]

[Afbeelding: Boomdiagram. 
Vertakking 1 (kleedje): k1, k2, k3, k4. 
Elke tak heeft 3 subvertakkingen (pull): p1, p2, p3. 
Uitkomsten (kleedje en pull): k1p1, k1p2, k1p3, k2p1, k2p2, k2p3, k3p1, k3p2, k3p3, k4p1, k4p2, k4p3.]

A = {k1, k2, k3, k4} #A = 4
B = {p1, p2, p3} #B = 3
C = {(k1, p2) ; (k1, p2) ; …; (k4, p3)} #C = 12

C wordt de **productverzameling** van A en B genoemd.

notatie C = A x B

Er geldt:
#C = #(A x B) = #A · #B
12 = 4 · 3

Antwoord: Marijke kan zich op 12 verschillende manieren kleden als ze de keuze heeft tussen 4 verschillende kleedjes en 3 verschillende pulls en een kleedje en een pull zal dragen.

formule Om het aantal mogelijke combinaties te bepalen, kan je gebruik maken van de **productregel**:
#(A x B) = #A · #B

--- PAGE 10 ---
**Voorbeeld 2**
Mats mag voor Sinterklaas een speelgoedauto en een legodoos kiezen. Hij heeft de keuze uit 2 speelgoedauto’s en uit 4 legodozen. Op hoeveel manieren kan Mats een speelgoedauto en een legodoos kiezen?

We tekenen een boomdiagram:

[Afbeelding: Foto van een legodoos]
[Afbeelding: Foto van een speelgoedauto]

[Afbeelding: Boomdiagram. 
Vertakking 1 (auto): a1, a2.
Subvertakkingen per auto (doos): d1, d2, d3, d4.
Uitkomsten (auto en doos): a1d1, a1d2, a1d3, a1d4, a2d1, a2d2, a2d3, a2d4.]

C = A x B
#C = #A · #B
8 = 2 · 4

Antwoord: Mats kan op 8 verschillende manieren een auto en een legodoos kiezen als hij de keuze heeft uit 2 verschillende auto’s en 4 verschillende legodozen.

**Algemeen**
Het aantal mogelijke uitkomsten bij het tekenen van een boomdiagram is gelijk aan het product van de keuzemogelijkheden op de verschillende vertakkingen.

voor 1e keuze: k1 mogelijkheden
voor 2e keuze: k2 mogelijkheden
… …
voor ne keuze: kn mogelijkheden
Aantal mogelijke uitkomsten = k1 · k2 · … · kn

--- PAGE 11 ---
# Verwerkingsopdrachten

**5** Op een sportdag kunnen de leerlingen in de voormiddag fietsen of zwemmen. In de namiddag is er keuze uit 4 balsporten. Op hoeveel verschillende manieren kan een leerling zijn sportdag samenstellen? Los op met behulp van een boomdiagram.

[Afbeelding: Boomdiagram.
voormiddag: f, z
namiddag: b1, b2, b3, b4 voor zowel f als z
voormiddag en namiddag: fb1, fb2, fb3, fb4, zb1, zb2, zb3, zb4]

Antwoord: Leerlingen kunnen op 8 verschillende manieren hun sportdag samenstellen.

**6** Op een populaire webshop wil Finn een smartphone kopen. Hoeveel keuzes heeft hij hier?

#(A x B x C) = 2 · 4 · 4 = 32

Antwoord: Finn heeft 32 verschillende keuzes.

[Afbeelding: Interface webshop.
Kies het model: Smartphone A of Smartphone B.
Kies de uitvoering: Sierra Blue, Zilver, Goud, Grafiet.
Kies de capaciteit: 128 GB, 256 GB, 512 GB, 1 TB.]

--- PAGE 12 ---
**7** Op een bank zijn 3 zitplaatsen mogelijk. Op hoeveel verschillende manieren kunnen Anke, Matteo en Kemir plaatsnemen? Maak een passend boomdiagram.

[Afbeelding: 3 zitjes op een rij]

[Afbeelding: Boomdiagram.
plaats 1: A, M, K
plaats 2: voor A is dat M, K. Voor M is dat A, K. Voor K is dat A, M.
plaats 3: voor AM is dat K, voor AK is dat M. enz.
mogelijkheden: AMK, AKM, MAK, MKA, KAM, KMA]

Antwoord: Anke, Matteo en Kemir kunnen op 6 verschillende manieren plaatsnemen.

**8** Op hoeveel manieren kunnen 7 personen plaatsnemen op een bank met 7 plaatsen?

#(A x B x C x D x E x F x G) = 7 · 6 · 5 · 4 · 3 · 2 · 1 = 5040

Antwoord: 7 personen kunnen op 5040 manieren plaatsnemen op een bank met 7 plaatsen.

**9** Een leraar voerde in een database 25 nieuwe oefeningen in. De leerlingen kregen op hun device een reeks van 5 verschillende oefeningen uit die 25 te zien.

a) Op hoeveel manieren kan zo’n reeks worden uitgevoerd?

#(AxBxCxDxE) = 25 · 24 · 23 · 22 · 21 = 6 375 600

Antwoord: Zo’n reeks kan op 6 375 600 manieren worden uitgevoerd.

b) De leraar koppelde ook telkens een moeilijkheidsgraad aan de oefeningen. 3 oefeningen kregen 1 peper, 7 oefeningen kregen 2 pepers, 8 oefeningen kregen 3 pepers, 4 oefeningen kregen 4 pepers en de rest van de oefeningen kreeg 5 pepers.
Op hoeveel manieren kan een reeks van vijf oefeningen worden getoond als er van elke pepercategorie één oefening moet zijn? (De oefeningen worden altijd van makkelijk naar moeilijk getoond.)

#(AxBxCxDxE) = 3 · 7 · 8 · 4 · 3 = 2016

Antwoord: Zo’n reeks kan op 2016 manieren worden uitgevoerd.

--- PAGE 13 ---
# 3 De somregel

## 3.1 Tellen met verzamelingen

In een sportieve klas zijn 18 leerlingen aangesloten bij een voetbalclub of bij een volleybalclub. Sommigen zijn aangesloten bij beide clubs.
12 leerlingen zijn aangesloten bij een voetbalclub.
10 leerlingen zijn aangesloten bij een volleybalclub.

[Afbeelding: Venndiagram voetbal en volleybal, elk gebied aangeduid met '?']

12 + 10 = 22 > 18
Er moeten dus zeker leerlingen dubbel geteld zijn. Dat zijn er 22 - 18 = 4.
Deze leerlingen zijn lid van beide clubs.

We kunnen dus volgende aantallen plaatsen in de passende gebieden. We noemen de verzamelingen A en B.

[Afbeelding: Venndiagram A (voetbal) en B (volleybal). In A\B staat 8. In A ∩ B staat 4. In B\A staat 6.]

A is de verzameling van alle leerlingen die aangesloten zijn bij een voetbalclub.
B is de verzameling van alle leerlingen die aangesloten zijn bij een volleybalclub.

#(A ∪ B) = 18
#A = 8 + 4 = 12
#B = 4 + 6 = 10

Er geldt:
#(A ∪ B) = #A + #B − #(A ∩ B)
18 = 10 + 12 − 4

formule **De somregel:**
#(A ∪ B) = #A + #B - #(A ∩ B)

**Merk op**
Er is geen info over het aantal leerlingen in de klas. Het gaat hier enkel over de leerlingen uit een klas die aangesloten zijn bij een voetbal- of volleybalclub.

--- PAGE 14 ---
**Bijzonder geval:**

[Afbeelding: Venndiagram A en B zonder elementen, en de lege doorsnede is gearceerd]

A en B zijn **disjuncte verzamelingen**.
Als A ∩ B = ∅ dan is:
#(A ∪ B) = #A + #B
Als een gebied leeg is, dan arceer je dit.

**Voorbeeld**
A = {harten heer, klaveren drie}
B = {schoppen aas, ruiten dame, schoppen zeven}

[Afbeelding: Venndiagram A en B. In A staan Harten Heer en Klaveren 3 afgebeeld. Doorsnede is gearceerd (leeg). In B staan Schoppen Aas, Ruiten Dame, Schoppen 7 afgebeeld.]

#(A ∪ B) = 5
#A = 2
#B = 3

In dit geval is #(A ∪ B) = #A + #B omdat A ∩ B = ∅

**Merk op**
#(A ∪ B) = #A + #B - #(A ∩ B) is algemeen geldig.
Als A ∩ B = ∅ dan is #(A ∩ B) = 0

--- PAGE 15 ---
## 3.2 Tellen met wegen in een roosterdiagram

**Voorbeeld**
Hiernaast zie je de schematische weergave van de plattegrond van een wijk. Karen moet van punt A naar punt R, en liefst volgens de kortste route. Hoeveel routes, zonder omwegen, zijn er van A naar R?

[Afbeelding: Roosterdiagram. Wegennetwerk met straten, kruispunten aangeduid van A t.e.m. R.]

• Er is 1 route van A naar B.
• Er is 1 route van A naar C.
• Er is 1 route van A naar D.
• Er zijn 2 routes van A naar E.
• Er zijn 3 routes van A naar F.

**Merk op**
Het aantal mogelijke routes van A naar F is de som van het aantal mogelijke routes van A naar C en van A naar E.

We noteren bij elk kruispunt het aantal routes van A naar dat kruispunt.

• Er zijn 3 routes van A naar G.
• Er zijn 2 routes van A naar H.
• Er zijn 5 routes van A naar I.

**Merk op**
Het aantal mogelijke routes van A naar I is de som van het aantal mogelijke routes van A naar H en van A naar F.

Vaak wordt het telschema dat we gebruiken driehoekig voorgesteld. De driehoek ontstaat als volgt: het getal bovenaan is een 1, vervolgens schrijf je aan weerszijden schuin onder die 1 nog 2 enen. Ga zo verder zodat je twee schuine rijen krijgt met alleen maar enen: deze twee zijden vormen de zijden van je driehoek. De overige getallen in de driehoek verkrijg je als volgt: elk getal in het inwendige van de driehoek is de som van de twee getallen schuin erboven. Op die manier ontstaat een oneindig grote driehoek. We noemen die driehoek de **driehoek van Pascal**.

[Afbeelding: Driehoek van Pascal t.e.m. de rij 1, 8, 28, 56, 70, 56, 28, 8, 1.]

Om de plattegrond van de wijk die Karen wil doorkruisen verder aan te vullen, gaan we op dezelfde manier te werk. We zien dat er, zonder omwegen, 76 mogelijke routes zijn van A naar R.

[Afbeelding: Roosterdiagrammen met ingevulde getallen op de kruispunten, die optellen en eindigen met 76 bij punt R.]

--- PAGE 16 ---
# Verwerkingsopdrachten

**10** In een gemeente zijn er 2 supermarkten: supermarkt A en supermarkt B. Aan 20 mensen werd gevraagd naar welke van deze twee supermarkten hun voorkeur uitgaat. Men kan ook kiezen voor beide supermarkten.
12 mensen kozen voor supermarkt A.
16 mensen kozen voor supermarkt B.

a) Teken een passend venndiagram en plaats de juiste aantallen in de verschillende gebieden.

[Afbeelding: Venndiagram A en B. A\B is 4. A ∩ B is 8. B\A is 8.]

b) Hoeveel mensen kozen voor supermarkt A, maar niet voor supermarkt B?
4 mensen

c) Hoeveel mensen kozen zowel voor supermarkt A als voor supermarkt B?
8 mensen

**11** Ga bij het vorig voorbeeld na of de algemene somregel geldt.

#(A ∪ B) = #A + #B − #(A ∩ B)
20 = 12 + 16 − 8
20 = 20

--- PAGE 17 ---
**12** In een klas zitten 22 leerlingen. 16 leerlingen hebben een abonnement op Apple Music en 11 leerlingen hebben een abonnement op Netflix. 7 leerlingen hebben een abonnement op beide diensten.

a) Maak een venndiagram.

[Afbeelding: Venndiagram van de "Klas". Binnen de rechthoek (Klas) liggen Apple Music en Netflix. Apple Music\Netflix = 9. Doorsnede = 7. Netflix\Apple Music = 4. Buiten beide, maar in Klas = 2.]

b) Hoeveel leerlingen hebben geen Apple Music?
6 leerlingen

c) Hoeveel leerlingen hebben Apple Music of Netflix?
20 leerlingen

d) Hoeveel leerlingen hebben noch Apple Music noch Netflix?
2 leerlingen

e) Hoeveel leerlingen hebben hoogstens één van deze twee onlinediensten?
13 leerlingen

f) Hoeveel leerlingen hebben alleen Netflix?
4 leerlingen

--- PAGE 18 ---
**13** Verzin een verhaal bij dit venndiagram.

[Afbeelding: Venndiagram U. Britse vlag (A), Franse vlag (B). A\B: 7. A ∩ B: 5. B\A: 8. U\(A ∪ B): 4.]

antwoord van de leerlingen

**14** Hoeveel ‘kortste wegen’ zijn er van A naar B?

[Afbeelding: Rooster met ontbrekende vierkanten. Punten A en B aangeduid. Kruispunten hebben getallen: 1, 2, 4, 6, 12, 20, 30, 50 etc. Optellen van wegen geeft einduitkomst 50 bij B.]

Er zijn 50 mogelijke kortste wegen van A naar B.

--- PAGE 19 ---
# 4 De complementregel

U is de verzameling van alle natuurlijke getallen die bestaan uit drie cijfers.
Geen enkel getal begint met de 0 vooraan. In totaal zijn er zo 9 · 10 · 10 = 900 getallen mogelijk.
Hoeveel van die getallen bevat minstens één 5?

A is de verzameling van de natuurlijke getallen die bestaan uit 3 cijfers waarvan minstens één 5.
bv. 589, 575, 555, 951, 255, …

$\overline{A}$ = U\A is de verzameling van de natuurlijke getallen die bestaan uit 3 cijfers en géén 5 bevatten.
bv. 436, 122, 378, 499, …

1e cijfer
geen 0, geen 5
↓
8 mogelijkheden

2e cijfer
geen 5
↓
9 mogelijkheden

3e cijfer
geen 5
↓
9 mogelijkheden

Totaal aantal mogelijke natuurlijke getallen die bestaan uit 3 cijfers en die géén 5 bevatten:
8 · 9 · 9 = 648

Antwoord: Het aantal getallen die bestaan uit 3 cijfers (geen 0 vooraan) en die minstens één 5 bevat is 900 - 648 = 252.

We gebruiken in dit geval de **complementregel** om het antwoord te vinden omdat de berekening eenvoudiger is.

formule **De complementregel:**
#$\overline{A}$ = #(U\A) = #U − #A

# Verwerkingsopdracht

**15** We gooien drie verschillende dobbelstenen op. Hoeveel uitkomsten bevatten minstens één 4?

U is de verzameling van alle mogelijke worpen.
#U = 6 ⋅ 6 ⋅ 6 = 216
A is de verzameling van alle worpen die géén 4 bevatten.
#A = 5 ⋅ 5 ⋅ 5 = 125
$\overline{A}$ is de verzameling van alle worpen die minstens één 4 bevatten.
#$\overline{A}$ = #U − #A
#$\overline{A}$ = 216 − 125 = 91

Antwoord: 91 uitkomsten bevatten minstens één 4.

--- PAGE 20 ---
# Signaaloefeningen

**1**
a) Kleur A\B.
b) Kleur A ∩ B.
c) Kleur $\overline{A}$ = U\A.
d) Kleur A ∪ B.

[Afbeelding: Venndiagrammen om in te kleuren voor de 4 opgaven.]

**2**
In een restaurant kan je kiezen uit:
- 3 voorgerechten
- 4 hoofdgerechten
- 2 nagerechten
Op hoeveel verschillende manieren kan je een menu samenstellen als je telkens uit de 3 gangen een keuze moet maken? Los dit op met behulp van een boomdiagram.

[Afbeelding: Boomdiagram. 
Voorgerechten: v1, v2, v3.
Hoofdgerechten: h1, h2, h3, h4.
Nagerechten: n1, n2.
Combinaties tonen v1h1n1 t.e.m. v3h4n2 (totaal 24 opties).]

--- PAGE 21 ---
**3** Uit een keuze van 12 voetbalploegen moet een top 3 worden samengesteld. Op hoeveel manieren kan dit gebeuren?

#(AxBxC) = #A ⋅ #B ⋅ #C
= 12 ⋅ 11 ⋅ 10
= 1320
Antwoord: De top 3 kan op 1320 manieren worden samengesteld.

**4** Hoeveel verschillende getallen van 4 cijfers kan je vormen als het eerste cijfer geen 0 mag zijn?

#(A x B x C x D) = 9 · 10 · 10 · 10 = 9000
Antwoord: Je kan 9000 getallen van 4 cijfers vormen als het eerste cijfer geen 0 mag zijn.

**5** Hoeveel verschillende getallen van 4 cijfers kan je vormen als het eerste cijfer een 8 moet zijn en het laatste cijfer een 9?

#(A x B x C x D) = 1 · 10 · 10 · 1 = 100
Antwoord: Je kan 100 getallen van 4 cijfers vormen als het eerste cijfer een 8 en het laatste cijfer een 9 moet zijn.

**6** Een klas bevat 20 leerlingen. 8 leerlingen spelen in een voetbalploeg en 5 leerlingen zijn lid van een basketbalclub. Er zijn 2 leerlingen die voetbal en basketbal spelen.
a) Teken een passend venndiagram.
b) Hoeveel leerlingen spelen geen basketbal?
c) Hoeveel leerlingen spelen voetbal of basketbal?

a)
[Afbeelding: Venndiagram "klas". "voetbal" en "basketbal". Voetbal\basketbal = 6. Doorsnede = 2. Basketbal\voetbal = 3. Buiten de cirkels = 9.]

b) Er spelen 15 leerlingen geen basketbal.
c) Er zijn 11 leerlingen die voetbal of basketbal spelen.

--- PAGE 22 ---
**7** Een klas telt 22 leerlingen: 10 meisjes en 12 jongens. 7 leerlingen gaan met de fiets naar school: 2 meisjes en 5 jongens.
U is de verzameling van alle leerlingen van de klas.
M is de verzameling van alle meisjes van de klas.
F is de verzameling van alle leerlingen die met de fiets naar school komen.

a) Plaats de aantallen in de passende gebieden.
[Afbeelding: Venndiagram U. M en F. M\F = 8. Doorsnede M ∩ F = 2. F\M = 5. U\(M ∪ F) = 7.]

b) Bepaal #(F ∩ M).
c) Bepaal #(F\M) en #$\overline{F}$.
d) Bepaal #(F ∪ M).
e) Ga na of de somregel klopt.

b) #(F ∩ M) = 2
c) #(F\M) = 5
#$\overline{F}$ = 15
d) #(F ∪ M) = 15
e) #(F ∪ M) = #F + #M − #(F ∩ M)
15 = 7 + 10 − 2
15 = 15

**8** Hoeveel ‘kortste wegen’ zijn er van A naar B?

[Afbeelding: Rooster met punten A en B. Wegen langs kruispunten opgeteld, eindigend op 63 bij B.]

Er zijn 63 mogelijke kortste wegen van A naar B.

--- PAGE 23 ---
**9** U is de verzameling van alle natuurlijke getallen met vier cijfers. Geen enkel getal begint met 0. Hoeveel van die getallen bevatten minstens één 6?

#U = 9 ⋅ 10 ⋅ 10 ⋅ 10 = 9000
A is de verzameling van de getallen die géén 6 bevatten.
#A = 8 ⋅ 9 ⋅ 9 ⋅ 9 = 5832
$\overline{A}$ is de verzameling van de getallen met minstens één 6.
#$\overline{A}$ = #U − #A = 9000 − 5832 = 3168
Antwoord: 3168 van deze getallen bevat minstens één 6.

**10** Hoeveel natuurlijke getallen met vier cijfers kan je maken met 1, 2, 3, 4, 5 waar het cijfer 3 minstens één keer voorkomt?

U is de verzameling van de getallen met 1, 2, 3, 4 en 5.
#U = 5 ⋅ 5 ⋅ 5 ⋅ 5 = 625
A is de verzameling van de getallen die géén 3 bevatten.
#A = 4 ⋅ 4 ⋅ 4 ⋅ 4 = 256
$\overline{A}$ is de verzameling van de getallen met minstens één 3.
#$\overline{A}$ = #U − #A = 625 − 256 = 369
Antwoord: 369 van deze getallen bevat minstens één 3.

--- PAGE 24 ---
# Differentiatietraject

**1** U is de verzameling van alle natuurlijke getallen. A is de verzameling van de natuurlijke getallen kleiner dan 6. B is de verzameling van de natuurlijke getallen x die voldoen aan 3 < x < 11.
a) Maak een passend venndiagram.
b) Bepaal A ∩ B, A\B en A ∪ B.

a)
[Afbeelding: Venndiagram. U, A, B. A\B: 0, 1, 2, 3. Doorsnede A ∩ B: 4, 5. B\A: 6, 7, 8, 9, 10. U\(A ∪ B): 11, 12, ...]

b) A ∩ B = {4, 5}
A\B = {0, 1, 2, 3}
A ∪ B = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

**2** U is de verzameling van alle driehoeken.
A is de verzameling van alle gelijkbenige driehoeken.
B is de verzameling van alle gelijkzijdige driehoeken.
a) Teken een passend venndiagram door in elk gebied minstens één figuur te tekenen.
b) Arceer de lege gebieden.
c) Bepaal $\overline{A}$, A ∩ B en A\B.

a) Bv.
b)
[Afbeelding: Venndiagram. U met cirkel A en daarbinnen een cirkel B. B\A is leeg en gearceerd (in de tekening is B deels overlappend en het niet-overlappende deel gearceerd). Driehoeken zijn in de overeenkomstige gebieden getekend.]

c) $\overline{A}$ = alle driehoeken die niet gelijkbenig zijn.
A ∩ B = alle driehoeken die gelijkzijdig zijn.
A\B = alle driehoeken die gelijkbenig zijn, maar niet gelijkzijdig.

--- PAGE 25 ---
**3** U is de verzameling van alle natuurlijke getallen kleiner dan 25.
A = {0, 7, 8, 11, 13, 21, 24}
B = {0, 8, 13, 18, 20, 23}

a) Teken een passend venndiagram.
b) Bepaal $\overline{A}$.
c) Bepaal B\A.
d) Bepaal A ∩ B en A ∪ B.

a)
[Afbeelding: Venndiagram. U, A, B. A\B: 7, 11, 21, 24. A ∩ B: 0, 8, 13. B\A: 18, 20, 23. U\(A ∪ B): 1, 2, 3, 4, 5, 6, 9, 10, 12, 14, 15, 16, 17, 19, 22]

b) $\overline{A}$ = {1, 2, 3, 4, 5, 6, 9, 10, 12, 14, 15, 16, 17, 18, 19, 20, 22, 23}
c) B\A = {18, 20, 23}
d) A ∩ B = {0, 8, 13}
A ∪ B = {0, 7, 8, 11, 13, 18, 20, 21, 23, 24}

**4** U is de verzameling van alle mogelijke uitkomsten bij het opgooien van een eerlijke dobbelsteen.
A is de verzameling van het even aantal gegooide ogen.
B is de verzameling van het aantal gegooide ogen kleiner dan 5.

[Afbeelding: Dobbelsteen]

a) Teken een passend venndiagram.
b) Bepaal A ∩ B.
c) Bepaal $\overline{B}$.
d) Bepaal A\B.
e) Omschrijf A ∪ B in woorden.
f) Omschrijf $\overline{A}$ in woorden.

a)
[Afbeelding: Venndiagram. U met A en B. A\B: 6. A ∩ B: 2, 4. B\A: 1, 3. U\(A ∪ B): 5.]

b) A ∩ B = {2, 4}
c) $\overline{B}$ = {5, 6}
d) A\B = {6}
e) A ∪ B: alle uitkomsten die kleiner zijn dan 5 of uitkomsten die even zijn.
f) $\overline{A}$ : alle uitkomsten die niet even zijn / alle oneven uitkomsten.

--- PAGE 26 ---
**5** U is de verzameling van de natuurlijke getallen.
A is de verzameling van de delers van 8.
B is de verzameling van de delers van 12.

a) Teken een passend venndiagram.
b) Bepaal A ∩ B.
c) Bepaal $\overline{B}$.
d) Bepaal #(A ∪ B)

a)
[Afbeelding: Venndiagram. U, A, B. A\B: 8. A ∩ B: 1, 2, 4. B\A: 3, 6, 12. U\(A ∪ B): 0, 5, ...]

b) A ∩ B = {1, 2, 4}
c) $\overline{B}$ = {0, 5, 7, 8, 9, 10, 11, 13, 14, 15, …}
d) #(A ∪ B) = 7

**6** Gegeven:
U is de verzameling van de natuurlijke getallen.
A is de verzameling van de natuurlijke getallen groter dan 50 en kleiner dan 100.
B is de verzameling van alle priemgetallen kleiner dan 100.
C is de verzameling van alle even natuurlijke getallen kleiner dan 100.

Gevraagd: Bepaal door opsomming ...
a) A ∩ B
b) A ∩ B ∩ C
c) A ∪ (B ∩ C)
d) $\overline{A \cup B \cup C}$
e) C / $\overline{A}$

a) A ∩ B = {53, 59, 61, 67, 71, 73, 79, 83, 89, 97}
b) A ∩ B ∩ C = {}
c) A ∪ (B ∩ C)= {2, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99}
d) $\overline{A \cup B \cup C}$ = {1, 9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 100, 101, 102, 103, 104, 105, …}
e) C / $\overline{A}$ = {51, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 89, 91, 93, 95, 97, 99}

--- PAGE 27 ---
**7** Voetbalclub Rapide heeft:
- rode, blauwe en witte T-shirts
- groene, gele en witte broekjes
- zwarte en gele kousen
Alle spelers beschikken tevens over 2 paar voetbalschoenen.
Op hoeveel verschillende manieren kan een volledige uitrusting worden samengesteld? Los op met behulp van een boomdiagram.

[Afbeelding: Kledingkluisjes met voetbaloutfits]

[Afbeelding: Boomdiagram. 
T-shirts (t1, t2, t3).
Broekjes (b1, b2, b3 per T-shirt).
Kousen (k1, k2 per broekje).
Schoenen (s1, s2 per kousen).
Uitkomsten (combinatie) opgelijst (t1b1k1s1 t.e.m. t3b3k2s2).]

Antwoord: Een volledige uitrusting kan op 36 verschillende manieren worden samengesteld.

--- PAGE 28 ---
**8** De code van een inbraakalarm bestaat uit 4 cijfers. Hoeveel mogelijkheden moet men maximaal uitproberen om zeker het alarm uit te schakelen? Op het klavier staan 10 cijfers.

#(A x B x C x D) = 10 · 10 · 10 · 10 = 10 000
Antwoord: Men moet maximaal 10 000 keer proberen om zeker het alarm uit te schakelen.

**9** Servaas heeft 2 verschillende spellen van telkens 52 kaarten. Uit het eerste spel wil hij een rode kaart trekken en uit het tweede spel een schoppen. Hoeveel combinaties zijn er mogelijk?

#(A x B) = 26 · 13 = 338
Antwoord: Servaas kan op 338 manieren een rode kaart trekken uit het ene kaartspel en daarna een schoppen uit het andere.

**10** Op hoeveel verschillende manieren kunnen 5 studenten plaatsnemen in een lokaal met 8 plaatsen?

student 1 heeft de keuze uit 8 plaatsen.
student 2 heeft de keuze uit 7 plaatsen.
student 3 heeft de keuze uit 6 plaatsen.
student 4 heeft de keuze uit 5 plaatsen.
student 5 heeft de keuze uit 4 plaatsen.

#(A x B x C x D x E) = 8 · 7 · 6 · 5 · 4 = 6720
Antwoord: De studenten kunnen op 6720 verschillende manieren plaatsnemen.

**11** Gegeven zijn de cijfers 1, 2, 3, 4, 5, 6, 7, 8 en 9.
a) Hoeveel getallen van twee verschillende cijfers kan je hiermee vormen?
b) Hoeveel van deze getallen zijn oneven?

a) #(A x B) = 9 · 8 = 72
Antwoord: Je kan hiermee 72 getallen vormen bestaande uit 2 verschillende cijfers.

b) 9 · 5 – 5 = 40 ofwel: 4 · 5 + 5 · 4 = 40
Het maakt niet uit welk getal eerst staat, maar het tweede getal moet 1, 3, 5, 7 of 9 zijn. Daarbovenop mag 11, 33, 55, 77 en 99 niet aangezien deze getallen geen verschillende cijfers hebben.
Antwoord: 40 van deze getallen zijn oneven.

--- PAGE 29 ---
**12** Het wachtwoord van de school bestaat uit 8 karakters en bestaat uit cijfers en letters. Het bevat minstens 1 cijfer en minstens 1 hoofdletter. Hoeveel mogelijke wachtwoorden zijn er?

Er zijn 10 verschillende cijfers, 26 kleine letters, 26 hoofdletters = 62 mogelijkheden per karakter
Totaal aantal mogelijkheden (ongeacht bovenstaande voorwaarden):
62 x 62 x 62 x 62 x 62 x 62 x 62 x 62 = 62⁸ ≈ 2,183401056 · 10¹⁴

Aantal wachtwoorden te vormen ZONDER hoofdletters:
36 x 36 x 36 x 36 x 36 x 36 x 36 x 36 = 36⁸ ≈ 2,821109907 · 10¹²

Aantal wachtwoorden te vormen ZONDER cijfers:
52 x 52 x 52 x 52 x 52 x 52 x 52 x 52 = 52⁸ ≈ 5,345972853 · 10¹³

Aantal wachtwoorden met minstens 1 hoofdletter en 1 cijfer:
62⁸ - 36⁸ - 52⁸ ≈ 1,620592671 · 10¹⁴

Antwoord: Er zijn ongeveer 1,62 · 10¹⁴ mogelijkheden.

**13** De Belgische kentekenplaat omvat eerst het cijfer 1 of 2, gevolgd door drie letters en drie cijfers.
Hoeveel kentekenplaten kunnen er uitgereikt worden die beginnen met het cijfer 2?

[Afbeelding: Belgische nummerplaat B 2-CDE-013]

#(A x B x C x D x E x F x G) = 1 · 26 · 26 · 26 · 10 · 10 · 10 = 17576000

Antwoord: Er kunnen 17 576 000 kentenplaten worden uitgereikt die beginnen met het cijfer 2.

**14** Nina gooit met 3 verschillende dobbelstenen: een groene, een rode en een zwarte.
a) Hoeveel mogelijke uitkomsten zijn er?
b) Op hoeveel manieren kan Nina in totaal 6 ogen gooien?
c) Op hoeveel manieren kan Nina in totaal 9 ogen gooien?

a) #(A x B x C) = 6 · 6 · 6 = 216

b)
[Afbeelding: Boomdiagram. 
dobbelsteen 1, dobbelsteen 2, dobbelsteen 3.
Uitkomst 1 geeft 1-4, 2-3, 3-2, 4-1. Combinaties: 1-1-4, 1-2-3, 1-3-2, 1-4-1.
Uitkomst 2 geeft 1-3, 2-2, 3-1. Combinaties: 2-1-3, 2-2-2, 2-3-1.
Uitkomst 3 geeft 1-2, 2-1. Combinaties: 3-1-2, 3-2-1.
Uitkomst 4 geeft 1-1. Combinatie: 4-1-1.]

Antwoord: Nina kan op 10 verschillende manieren in totaal 6 ogen gooien.

--- PAGE 30 ---
c)
[Afbeelding: Boomdiagram voor som 9.]

dobbelsteen 1: 1 -> 2 -> 6 (1-2-6)
1 -> 3 -> 5 (1-3-5)
1 -> 4 -> 4 (1-4-4)
1 -> 5 -> 3 (1-5-3)
1 -> 6 -> 2 (1-6-2)
dobbelsteen 1: 2 -> 1 -> 6 (2-1-6)
2 -> 2 -> 5 (2-2-5)
2 -> 3 -> 4 (2-3-4)
2 -> 4 -> 3 (2-4-3)
2 -> 5 -> 2 (2-5-2)
2 -> 6 -> 1 (2-6-1)
dobbelsteen 1: 3 -> 1 -> 5 (3-1-5)
3 -> 2 -> 4 (3-2-4)
3 -> 3 -> 3 (3-3-3)
3 -> 4 -> 2 (3-4-2)
3 -> 5 -> 1 (3-5-1)
dobbelsteen 1: 4 -> 1 -> 5 (4-1-5)
4 -> 2 -> 4 (4-2-4)
4 -> 3 -> 3 (4-3-3)
4 -> 4 -> 2 (4-4-2)
dobbelsteen 1: 5 -> 1 -> 3 (5-1-3)
5 -> 2 -> 2 (5-2-2)
5 -> 3 -> 1 (5-3-1)
dobbelsteen 1: 6 -> 1 -> 2 (6-1-2)
6 -> 2 -> 1 (6-2-1)

Antwoord: Nina kan op 25 manieren in totaal 9 ogen gooien.

--- PAGE 31 ---
**15** Je gooit 3 muntstukken op. K betekent kop en M betekent munt.
a) Stel een boomdiagram op. Hoeveel mogelijke uitkomsten zijn er?
b) In hoeveel gevallen is er precies tweemaal kop?
c) In hoeveel gevallen is er hoogstens tweemaal munt?

a)
[Afbeelding: Boomdiagram. 
munt 1: K, M.
munt 2: K, M.
munt 3: K, M.
combinaties: KKK, KKM, KMK, KMM, MKK, MKM, MMK, MMM.]

Antwoord: Er zijn 8 mogelijke uitkomsten.

b) In 3 gevallen is er precies tweemaal kruis.
c) In 7 gevallen is er hoogstens tweemaal munt.

--- PAGE 32 ---
**16** Korneel wil een nieuwe smartphone kopen. Hij beslist om langs te gaan in 3 winkels.
In winkel A kan hij kiezen uit 3 types smartphone.
In winkel B kan hij kiezen uit 4 andere types.
In winkel C kan hij kiezen uit 2 hoesjes om zijn smartphone veilig op te bergen.
Op hoeveel verschillende manieren kan Korneel zijn keuze maken als hij één smartphone en één hoesje kiest?

[Afbeelding: Boomdiagram. 
gsm: A1, A2, A3, B1, B2, B3, B4. 
hoesje: C1, C2 per gsm.
combinatie: A1C1, A1C2, A2C1, A2C2, A3C1, A3C2, B1C1, B1C2, B2C1, B2C2, B3C1, B3C2, B4C1, B4C2.]

Antwoord: Korneel kan zijn keuze op 14 verschillende manieren maken.

**17** Hoeveel ‘kortste wegen' zijn er van A naar B?

a)
[Afbeelding: Rooster met A linksboven, B rechtsonder. Getallen op de kruispunten tonen de optelsom tot 34 bij B.]

b)
[Afbeelding: Ruitvormig rooster met A links en B rechts. Getallen tonen de optelsom tot 30 bij B.]

a) Er zijn 34 mogelijke kortste wegen van A naar B.
b) Er zijn 30 mogelijke kortste wegen van A naar B.

--- PAGE 33 ---
**18** In een school met 400 leerlingen spelen 72 leerlingen tennis, 30 leerlingen beoefenen atletiek en 8 leerlingen beoefenen beide sporttakken.
a) Stel deze situatie voor met een venndiagram.
b) Hoeveel leerlingen beoefenen geen van beide sporttakken?
c) Hoeveel leerlingen doen niet aan atletiek?
d) Hoeveel leerlingen beoefenen atletiek, maar spelen geen tennis?

a)
[Afbeelding: Venndiagram S met T (tennis) en A (atletiek). T\A: 64. T ∩ A: 8. A\T: 22. S\(T ∪ A): 306.]

b) 306 leerlingen beoefenen geen van beide sporttakken.
c) 370 leerlingen doen niet aan atletiek.
d) 22 leerlingen beoefenen atletiek, maar spelen geen tennis.

--- PAGE 34 ---
**19** In een gemeente zijn er 2 padelclubs: padelclub A en padelclub B.
Aan 40 liefhebbers van padel werd gevraagd welke sportclub hun voorkeur geniet. Men kon ook beide sportclubs als voorkeur opgeven.

28 personen verkozen padelclub A.
22 personen verkozen padelclub B.
6 personen verkozen geen van beide clubs.

[Afbeelding: Foto van iemand die padel speelt]

U: verzameling van de 40 liefhebbers
A: personen die padelclub A verkozen
B: personen die padelclub B verkozen

a) Stel de situatie voor in een venndiagram. Plaats de aantallen in de verschillende gebieden.
b) Bepaal #A, #B, en #(A ∪ B) en #(A ∩ B).
c) Klopt de somregel? Controleer!
d) Bepaal #$\overline{A}$.
e) Omschrijf in woorden: A\B en U\B.

a)
[Afbeelding: Venndiagram U met A en B. U\(A ∪ B) = 6. A\B = 12. A ∩ B = 16. B\A = 6. Pijlen duiden aan: 34 - 22 = 12 en 34 - 28 = 6.]

b) #A = 28
#B = 22
#(A ∪ B) = 40 − 6 = 34
#(A ∩ B) = 16

c) #(A ∪ B) = #A + #B − #(A ∩ B)
34 = 28 + 22 − 16
34 = 34

d) #$\overline{A}$ = 12

e) A\B: alle liefhebbers die enkel padelclub A verkozen.
U\B: alle liefhebbers die B niet verkozen.

--- PAGE 35 ---
**20** De Belgische kentekenplaat omvat eerst het cijfer 1 of 2, gevolgd door drie letters en drie cijfers. Hoeveel Belgische kentekenplaten kunnen er uitgereikt worden die enkel klinkers bevatten of waarbij de som van de laatste 3 cijfers deelbaar is door 3?

A: verzameling van alle nummerplaten met enkel klinkers
B: verzameling van alle nummerplaten met cijfers waarbij de som deelbaar is door 3
#A = 2 · 5 · 5 · 5 · 10 · 10 · 10 = 250 000
Een getal is een veelvoud van 3 als de som van de cijfers deelbaar is door 3. Deze eigenschap geldt ook omgekeerd. We gaan dus op zoek naar alle veelvouden van 3 tussen 0 en 999. Dat zijn er 334.
#B = 2 · 26 · 26 · 26 · 334 = 11 740 768
#(A ∩ B) = 2 · 5 · 5 · 5 · 334 = 83 500
#(A ∪ B) = #A + #B - #(A ∩ B) = 11 907 268

Antwoord: Er kunnen 11 907 268 nummerplaten uitgereikt worden die voldoen aan deze voorwaarden.

**21** Een stratenplan ziet er als volgt uit:

[Afbeelding: Stratenplan met startpunt A linksboven en B rechtsonder. Getallen op de kruispunten geven het aantal wegen aan: 1, 2, 3, 4, 6, 7, 10, 17, 19, 21, 27.]

Op hoeveel manieren kan je wandelen van A naar B, zonder omwegen?

Je kan op 27 mogelijke manieren van A naar B wandelen, zonder omwegen.

--- PAGE 36 ---
**22** In de klas 4 Maatschappij & Welzijn zitten 25 leerlingen.
U is de verzameling van alle leerlingen in de klas.
A is de verzameling van de leerlingen die in de grote vakantie naar Spanje op reis geweest zijn.
B is de verzameling van de leerlingen die in de grote vakantie naar Frankrijk op reis geweest zijn.

12 leerlingen zijn naar Spanje geweest.
16 leerlingen zijn naar Frankrijk geweest.
7 leerlingen zijn noch naar Spanje, noch naar Frankrijk op reis geweest.

a) Stel de situatie voor in een venndiagram en plaats de aantallen in de verschillende gebieden.
b) Bepaal #B, #(A ∪ B) ,#$\overline{A}$, #(U\B).
c) Omschrijf in woorden: A ∩ B, A ∪ B, $\overline{B}$, $\overline{A \cup B}$

a)
[Afbeelding: Venndiagram U, A, B. U\(A ∪ B) = 7. A\B = 2. A ∩ B = 10. B\A = 6. Berekeningen bij pijlen: 18 - 16 = 2, 18 - 8 = 10, 18 - 12 = 6.]

b) #B = 16
#(A ∪ B) = 18
#$\overline{A}$ = 13
#U\B = 9

c) A ∩ B: Alle leerlingen die naar Frankrijk en Spanje op reis geweest zijn.
A ∪ B: Alle leerlingen die naar Frankrijk of naar naar Spanje geweest zijn.
$\overline{B}$: Alle leerlingen die niet naar Frankrijk op reis geweest zijn.
$\overline{A \cup B}$: Alle leerlingen die niet naar Frankrijk en niet naar Spanje geweest zijn.

--- PAGE 37 ---
**23** Aan 85 personen wordt gevraagd of ze een smartphone (S), een computer (C) en/of een tablet (T) hebben.
U is de verzameling van de 85 personen.

50 personen hebben een smartphone.
35 personen hebben een computer.
25 personen hebben een tablet.
8 personen hebben alle drie de toestellen.
10 personen hebben een smartphone en een tablet.
24 personen hebben een smartphone en een computer.
14 personen hebben een computer en een tablet.

[Afbeelding: Venndiagram U met 3 cirkels S, C en T. De gebieden zijn ingevuld: S\ (C ∪ T) = 24. S ∩ C \ T = 16. C\ (S ∪ T) = 5. S ∩ T \ C = 2. S ∩ C ∩ T = 8. C ∩ T \ S = 6. T\ (S ∪ C) = 9. U\ (S ∪ C ∪ T) = 15.]

a) Plaats de aantallen in de passende gebieden.
b) Hoeveel personen hebben geen van de drie toestellen?
c) Hoeveel personen hebben enkel een computer?
d) Hoeveel personen hebben een smartphone en een tablet, maar geen computer?
e) Hoeveel personen bezitten een computer of een tablet?
f) Is #(C ∪ T) = #C + #T − #(C ∩ T) ?

b) 15 personen hebben geen van de drie toestellen.
c) 5 personen hebben enkel een computer.
d) 2 personen hebben een smartphone en een tablet, maar geen computer.
e) 46 personen bezitten een computer of een tablet.
f) #(C ∪ T) = #C + #T − #(C ∩ T)
46 = 35 + 25 − 14
46 = 46

**24** Hoeveel letters uit het alfabet komen niet voor in het woord ‘wiskunde’?

26 - 8 = 18.
Antwoord: 18 letters uit het alfabet komen niet voor in het woord ‘wiskunde’.

--- PAGE 38 ---
**25** Hoeveel woorden van 4 verschillende letters (met en zonder betekenis) kan men maken met het woord ‘wiskunde’ zodat er minstens één klinker in voorkomt?

U is de verzameling van alle woorden van 4 verschillende letters die men kan maken met het woord wiskunde.
A is de verzameling van de woorden van 4 verschillende letters die men kan maken met het woord wiskunde, zonder klinkers.
#U = 8 ⋅ 7 ⋅ 6 ⋅ 5 = 1680
#A = 5 ⋅ 4 ⋅ 3 ⋅ 2 = 120
#$\overline{A}$ = #U − #A = 1680 − 120 = 1560

Antwoord: Men kan 1560 woorden maken met het woord ‘wiskunde’ zodat er minstens één klinker in voorkomt.

**26** Bij het merken van een product moeten getallen gevormd worden met 4 cijfers gebruik makend van de cijfers 3, 8, 9, 7 en 5. Het getal 8 moet minstens één keer voorkomen. Hoeveel mogelijkheden zijn er?

U is de verzameling van alle getallen met 4 cijfers, gebruik makend van de cijfers 3, 8, 9, 7 en 5.
A is de verzameling van alle getallen met 4 cijfers, gebruik makend van de cijfers 3, 9, 7 en 5.
#U = 5 ⋅ 5 ⋅ 5 ⋅ 5 = 625
#A = 4 ⋅ 4 ⋅ 4 ⋅ 4 = 256
#$\overline{A}$ = #U − #A = 625 − 256 = 369

Antwoord: Er zijn 369 mogelijkheden.

**27** Een beveiligingscode bestaat uit 4 karakters die elk een cijfer of een letter kunnen zijn, bv. C13B.
a) Hoeveel codes zijn er zo te maken?
b) Hoeveel codes bevatten minstens één 8?

a) 36 · 36 · 36 · 36 = 1679 616
Antwoord: Er zijn 1679 616 codes te maken.

b) U is de verzameling van alle codes die te maken zijn met 4 karakters.
A is de verzameling van alle codes zonder 8.
#U = 1 679 616
#A = 35 ⋅ 35 ⋅ 35 ⋅ 35 = 1 500 625
#$\overline{A}$ = #U − #A = 1 679 616 − 1 500 625 = 178 991

Antwoord: 178 991 codes bevatten minstens één 8.

--- PAGE 39 ---
**28** In België start elk gsm-nummer met 04. Net voor een dropping krijgt Winter het gsm-nummer van de leiding. Hij ziet plots dat er een cijfer ontbreekt. Hoeveel pogingen zal Winter maximaal moeten ondernemen om de leiding te bereiken?
[Afbeelding: Papier met telefoonnummer 049349891 en één cijfer ontbreekt (er is een spatie)]

Als het derde cijfer ontbrak, heeft hij 10 pogingen nodig. Op elke andere plaats heeft hij slechts 9 pogingen nodig, want: als hij bv. het vierde cijfer vergat, moet hij het geval waarbij 99 het derde en vierde cijfer zijn niet meer proberen omdat hij dat al eens deed in de veronderstelling dat hij het derde cijfer vergat.
Hij moet dus 10 + 7 · 9 = 73 keer proberen om de leiding te bereiken.

**29** Hailey, Amber en Rani zitten volgend jaar in klas HWa, HWb, HWc of HWd. Rani en Amber mogen niet in dezelfde klas zitten, maar ook Amber en Hailey mogen niet in dezelfde klas zitten. Op hoeveel manieren kan je hen verdelen?

Amber mag niet in de klas van Rani en Hailey zitten.
Amber kan in 4 klassen zitten, terwijl je dan bij Rani en Hailey slechts de keuze hebt uit 3 klassen.

#A = 4 · 3 · 3 = 36

Antwoord: Je kan hen op 36 verschillende manieren verdelen.

**30** We beschouwen alle getallen met 3 cijfers (een 0 vooraan is niet toegelaten).
a) Hoeveel van deze getallen zijn niet deelbaar door 5?
b) Hoeveel van deze getallen eindigen niet op een 0?

a) niet deelbaar door 5 = niet eindigen op 5 of 0.
9 · 10 · 8 = 720
of: U is de verzameling van alle getallen die bestaan uit 3 cijfers.
A is de verzameling van alle getallen die deelbaar zijn door 5.
#U = 9 ⋅ 10 ⋅ 10 = 900
#A = 9 ⋅ 10 ⋅ 2 = 180
#$\overline{A}$ = 900 − 180 = 720
Antwoord: Er zijn 720 getallen met 3 cijfers niet deelbaar door 5.

b) 9 · 10 · 9 = 810
Antwoord: 810 van deze getallen eindigen niet op een 0.

--- PAGE 40 ---
**31** Kenzy heeft rode, gele en blauwe knikkers. Op 24 na zijn ze allemaal rood, op 30 na zijn ze allemaal geel en op 42 na zijn ze allemaal blauw. Hoeveel rode knikkers heeft Kenzy?
*uit toelatingsexamen arts 2017

A: 20 B: 24 C: 28 D: 32

Stel:
verzameling rode knikkers = R
verzameling gele knikkers = G
verzameling blauwe knikkers = B

#G + #B = 24 en #R + #B = 30 en #G + #R = 42
Hieruit volgt dat #R + #G + #B = 48 of #R = 48 – 24 = 24

Antwoord: Kenzy heeft 24 rode knikkers, antwoord B is juist.

**32** In de studierichting verpleegkunde nemen 6 meisjes en 2 jongens deel aan een praktische sessie. De docent wil ze indelen in twee groepjes die uit 1 jongen en 3 meisjes bestaan. Hoeveel verschillende dergelijke groepsindelingen zijn er mogelijk?
*uit toelatingsexamen arts 2019

A: 20 B: 24 C: 36 D: 40

De combination van één jongen en drie meisjes kan op 6 · 5 · 4 = 120 manieren.
De volgorde speelt geen rol, dus: (6 ⋅ 5 ⋅ 4) / (3 ⋅ 2) = 20

Antwoord: Er zijn 20 verschillende groepsindelingen mogelijk. Antwoord A is juist.

**33** Hoeveel Belgische kentekenplaten (beginnend met het cijfer 1 of 2, gevolgd door drie letters en drie cijfers) kunnen er uitgereikt worden die geen drie keer dezelfde letter bevatten?

U: alle mogelijkheden
A: alle mogelijkheden met drie keer dezelfde letter
#U = 2 · 26 · 26 · 26 · 10 · 10 · 10 = 35 152 000
#A = 2 · 26 · 1 · 1 · 10 · 10 · 10 = 52 000
#U - #A = 35 100 000

Antwoord: Er kunnen op die manier 35 100 000 kentekenplaten worden uitgereikt.

--- PAGE 41 ---
# Computationeel denken
## Toepassingen telproblemen

[Afbeelding: Python logo]
**Toepassing 1: de complementregel**

```python
1 aantalU = 200
2 aantalA = 40
3 complement = aantalU - aantalA
4 print("Van de", aantalU,"elementen zitten er",aantalA,"elementen in de 
  verzameling A en behoren er",complement,"elementen niet tot de 
  verzameling A.")
```

a) Wat doet deze code?
Deze code berekent het complement de verzameling A.

b) Wijzig de code voor de situatie waarbij #U = 52 en #A = 29.
```python
1 aantalU = 52
2 aantalA = 29
3 complement = aantalU - aantalA
4 print("Van de", aantalU,"elementen zitten er",aantalA,"elementen in de verzameling 
  A en behoren er",complement,"elementen niet tot de verzameling A.")
```

c) Wijzig de code zodat de gebruiker #U en #A zelf kan invullen.
```python
1 import math
2 print("Voer het aantal elementen uit de verzameling U en A in.")
3 aantalU = int(input("U:"))
4 aantalA = int(input("A:"))
5 complement = aantalU - aantalA
6 print("Van de", aantalU,"elementen zitten er",aantalA,"elementen in de verzameling 
  A en behoren er",complement,"elementen niet tot de verzameling A.")
```

d) Wijzig de code zodat een melding verschijnt als de gebruiker een groter getal invult voor #A dan voor #U. Maak gebruik van een if-functie.
```python
1 import math
2 print("Voer het aantal elementen uit de verzameling U en A in.")
3 aantalU = int(input("U:"))
4 aantalA = int(input("A:"))
5 complement = aantalU - aantalA
6 if aantalA > aantalU:
7   print("De verzameling U kan niet meer elementen bevatten dan de verzameling A, 
    want A is een deelverzameling van U. Probeer opnieuw.")
8 else: 
9   print("Van de", aantalU,"elementen zitten er",aantalA,"elementen in de verzameling 
    A en behoren er",complement,"elementen niet tot de verzameling A.")
```

--- PAGE 42 ---
**Toepassing 2: een uitdaging**

[Afbeelding: Python logo]
```python
 1 aantalGetallenUitTweeCijfers = 90
 2 aantalInA = 0
 3 for i in range(10,100):
 4   if i%4==0:
 5     aantalInA+=1
 6
 7 print("A is de verzameling van de natuurlijke getallen die bestaan uit 2 cijfers en deelbaar 
   zijn door 4.")
 8 print("Er zijn",aantalInA,"natuurlijke getallen met 2 cijfers die deelbaar zijn door 4.")
 9
10 complement = aantalGetallenUitTweeCijfers - aantalInA
11 print("Er zijn",complement,"natuurlijke getallen met 2 cijfers die niet deelbaar zijn door 4.")
```

a) Wat betekent de code `range(10,100)`?
Alle getallen groter of gelijk aan 10 en kleiner of gelijk aan 100. Alle natuurlijke getallen met 2 cijfers dus.

b) Wat betekent `i%4==0`?
De rest van de deling van het getal door 4 is gelijk aan 0.

c) Wijzig de code voor de volgende situatie:
Alle getallen bestaande uit drie cijfers kleiner dan 500. De verzameling A bevat van deze getallen alle getallen die deelbaar zijn door 6. Hoeveel elementen behoren tot het complement van A?

```python
 1 aantalGetallenUitDrieCijfers = 900
 2 aantalInA = 0
 3 for i in range(10,999):
 4   if i%6==0:
 5     aantalInA+=1
 6
 7 print("A is de verzameling van de natuurlijke getallen die bestaan uit 3 cijfers en 
   deelbaar zijn door 6.")
 8 print("Er zijn",aantalInA,"natuurlijke getallen met 3 cijfers die deelbaar zijn 
   door 6.")
 9
10 complement = aantalGetallenUitDrieCijfers - aantalInA
11 print("Er zijn",complement,"natuurlijke getallen met 3 cijfers die niet deelbaar 
   zijn door 6.")
```
Antwoord: Er behoren 735 elementen tot het complement van A.

--- PAGE 43 ---
**Toepassing 3: de productregel**

[Afbeelding: Python logo]
```python
1 tshirts = ["rode t-shirt","groene t-shirt","blauwe t-shirt","gele t-shirt","oranje t-shirt"]
2 broeken = ["short","lange broek","bermuda"]
3 aantaltshirts = len(tshirts)
4 aantalbroeken = len(broeken)
5
6 for i in range(aantaltshirts):
7   for j in range(aantalbroeken):
8     print("Ik draag een",tshirts[i],"en een",broeken[j])
```

In deze code wordt gebruik gemaakt van *arrays*.
In elke *array* zitten de elementen die voldoen aan de omschrijving van de variabele.

a) Hoeveel T-shirts zijn er? 4
b) Hoeveel broeken zijn er? 3
c) Wat doet de code `len(tshirts)`?
De code bepaalt de lengte van de lijst die als data wordt opgesomd en bij de uitvoer geeft ze die data terug weer.

d) Hoeveel lijnen uitvoer verkrijg je? 12
e) Voeg een T-shirt toe. Hoeveel lijnen uitvoer krijg je nu? 15

**Toepassing 4: de somregel**

[Afbeelding: Python logo]
```python
 1 elementenInA = int(input("Hoeveel elementen zitten er in de verzameling A? "))
 2 elementenInB = int(input("Hoeveel elementen zitten er in de verzameling B? "))
 3 elementenDoorsnede = int(input("Hoeveel elementen zitten er in de doorsnede van A en B? "))
 4 if elementenDoorsnede > elementenInA or elementenDoorsnede > elementenInB:
 5   print("Je voerde een verkeerd aantal elementen voor de doorsnede in.")
 6 else:
 7   elementenUnie = elementenInA + elementenInB - elementenDoorsnede
 8   print("aantal elementen verzameling A:",elementenInA)
 9   print("aantal elementen verzameling B:",elementenInB)
10   print("aantal elementen in de doorsnede van A en B:",elementenDoorsnede)
11   print("aantal elementen in de unie van A en B:",elementenUnie)
```

a) Waarom staat er in de eerste drie regels `int()`?
Int() staat voor gehele getallen. Het aantal getallen in een verzameling druk je altijd uit in een natuurlijk (geheel) getal.

b) Waarom wordt er een if-functie gebruikt?
Er kunnen niet méér elementen in de doorsnede zitten dan dat er elementen zitten in de verzameling van A. De doorsnede is ook een onderdeel van de verzameling van A.

--- PAGE 44 ---
c) Waarom zit er in deze if-functie een `or`?
Bovenstaande regel geldt ook voor de verzameling van B.

d) Geef een voorbeeld van een goede invoer en maak het bijhorende vlinderdiagram.
Bv.
#A = 5
#B = 8
#A ∩ B = 2
#A ∪ B = 11

[Afbeelding: Venndiagram A en B. A\B = 3. A ∩ B = 2. B\A = 6.]

e) Geef een voorbeeld van een slechte invoer en leg uit welke lijnen code worden uitgevoerd.
Bv.
#A = 6
#B = 10
#A ∩ B = 8

```python
1 elementenInA = int(input("Hoeveel elementen zitten er in de verzameling A? "))
2 elementenInB = int(input("Hoeveel elementen zitten er in de verzameling B? "))
3 elementenDoorsnede = int(input("Hoeveel elementen zitten er in de doorsnede van A en B? "))
4 if elementenDoorsnede > elementenInA or elementenDoorsnede > elementenInB:
5   print("Je voerde een verkeerd aantal elementen voor de doorsnede in.")
```
De eerste vier lijnen code worden uitgevoerd aangezien elementenDoorsnede > elementeninA. De uitvoer zal zijn: “Je voerde een verkeerd aantal elementen voor de doorsnede in.”.

**Auteurs** Philip Bogaert, Björn Carreyn en Roger Van Nieuwenhuyze
**Derde editie - Bestelnummer** 94 606 0119 (module 07 van 18)
**ISBN** 978 90 4864 973 0 - **KB** D/2024/0147/206 - **NUR** 126/128/129 - **Thema** YPMF
**Illustrator** Jona Jamart - **Design en lay-out** die Keure
**Verantwoordelijke uitgever** die Keure, Kleine Pathoekeweg 3, 8000 Brugge
RPR 0405 108 325 - © Copyright die Keure, Brugge

[Afbeelding: FSC logo]
[Afbeelding: die Keure logo]
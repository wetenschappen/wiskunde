--- PAGE 1 ---
# ISAAC
## FYSICA 4
D-finaliteit - 2 uur
MODULE 6
**CORRECTIE-SLEUTEL**
# Elektrische systemen (deel 2)
[Afbeelding: Een elektriciteitsmast met hoogspanningslijnen tegen een schemerende hemel.]

--- PAGE 2 ---
## Inhoud
**ISAAC-moment: spelen met elektrische schakelingen** 03
### 1 Schakelen van weerstanden 04
1.1 De serieschakeling van weerstanden 06
1.2 De parallelschakeling van weerstanden 09
1.3 De gemengde schakeling van weerstanden 12
### 2 Elektriciteit en veiligheid 23
2.1 Gevaren bij gebruik van een elektrische installatie 23
2.1.1 Elektrocutie 23
2.1.2 Kortsluiting 24
2.1.3 Overbelasting 24
2.2 Maatregelen om veilig en verantwoord om te gaan met een elektrische installatie 24
### 3 Verder oefenen? 25
**ISAAC-actie: schakelen van weerstanden** 39
**Studiewijzer** 40

--- PAGE 3 ---
# ISAAC-moment
## Spelen met elektrische schakelingen
Open via de QR-code een virtuele applet waarin je elektrische schakelingen kan ontdekken. Je kan hierin de conventionele stroomzin zien en kijken wat er gebeurt als je schakelaars opent of sluit. Voeg gerust ook extra elektrische componenten toe. Let goed op de beweging en de snelheid van de bolletjes die de stroomzin aanduiden (deze is tegengesteld aan de beweging van de elektronen).
[Afbeelding: QR-code]
[Afbeelding: Een eenvoudige elektrische schakeling met een batterij en twee parallel geschakelde lampen.]

--- PAGE 4 ---
# 1 Schakelen van weerstanden
Weerstanden komen meestal niet alleen voor. Ze worden geschakeld met andere weerstanden of componenten. We spreken van een elektrische schakeling of kortweg schakeling.
Zo worden bijvoorbeeld weerstanden op een printplaat via printbanen met andere weerstanden, condensatoren, spoelen, leds, schakelaars, transistors, ... verbonden.
In het labo maken we een dergelijke schakeling met behulp van verbindingsdraden.
Ook de autobatterij van een auto is met meerdere componenten verbonden.
Bij jou thuis zijn ook meerdere toestellen aangesloten op het net. De verbinding gebeurt daar via het netwerk van stroomdraden dat zich tussen de stopcontacten bevindt.
De weerstand van deze verbindingsdraden en printbanen is daarbij verwaarloosbaar.
We bekijken even deze elektrische schakeling:
[Afbeelding: Een complexe gemengde schakeling met meerdere weerstanden (R1 tot R9).]
In deze schakeling vinden we weerstanden die naast elkaar in één tak geschakeld zijn. Zie bijvoorbeeld de in het groen omcirkelde weerstanden. Deze weerstanden zijn in **serie** geschakeld.
We zien in de schakeling ook weerstanden boven elkaar staan, die weerstanden staan in **parallel** (zie bijvoorbeeld de in het oranje omcirkelde weerstanden).
[Afbeelding: Een printplaat met diverse elektronische componenten zoals weerstanden en condensatoren.]
[Afbeelding: Een verzameling van verschillende soorten weerstanden en andere elektronische componenten.]

--- PAGE 5 ---
Meestal bestaat een schakeling uit een combinatie van serie en parallel geschakelde weerstanden (en andere componenten). Zo'n schakeling noemen we een gemengde schakeling.
In wat volgt beperken we ons tot het schakelen van weerstanden en bespreken de serie-, de parallel- en de gemengde schakeling van weerstanden.
- **serieschakeling**
[Afbeelding: Een serieschakeling met een spanningsbron en twee weerstanden.]
- **parallelschakeling**
[Afbeelding: Een parallelschakeling met een spanningsbron, twee weerstanden, en aanduidingen voor 'tak' en 'knooppunt'.]
- **gemengde schakeling**
[Afbeelding: Drie verschillende voorbeelden van gemengde schakelingen.]
In elk van deze gevallen zullen we leren hoe we een **substitutie- of vervangingsweerstand** van de schakeling kunnen berekenen. Deze substitutieweerstand is de weerstand die de weerstanden in de schakeling kan vervangen zonder dat de totale stroomsterkte verandert.
> De **substitutie- of vervangingsweerstand** is de weerstand die de weerstanden in de schakeling kan vervangen zonder dat de totale stroomsterkte verandert.

--- PAGE 6 ---
## 1.1 De serieschakeling van weerstanden
[Afbeelding: Een serieschakeling met twee weerstanden R1 en R2 en spanningsbron U.]
In deze stroomkring staan twee weerstanden R₁ en R₂ in serie geschakeld.
Als we de stroomsterkte voor, na en tussen de weerstanden meten, dan meten we telkens dezelfde stroomsterkte.
[Afbeelding: Een serieschakeling met drie ampèremeters (A) die dezelfde stroomsterkte aangeven.]
De elektronen komen immers uit de minpool van de spanningsbron en kunnen maar één weg volgen naar de pluspool van de spanningsbron. Het kan dus niet anders dan dat I = I₁ = I₂.
[Afbeelding: Een serieschakeling waarbij de stroom I zich splitst in I1 en I2, wat hier conceptueel wordt getoond als een enkele stroom.]
Als we de spanningen U, U₁ en U₂ meten, dan zien we dat U = U₁ + U₂. We zien dat de totale spanning verdeeld wordt over de twee weerstanden. De totale spanning U staat immers over R₁ en R₂ samen. Beide weerstanden krijgen dus elk een deel van de spanning U.
[Afbeelding: Een serieschakeling met drie voltmeters (V) die de spanning over de bron en over elke weerstand meten.]
We kunnen dit uitbreiden voor een serieschakeling die uit meer dan twee weerstanden bestaat.

--- PAGE 7 ---
We vatten dit samen in twee wetten:
> ### Eerste wet van de serieschakeling
> In een serieschakeling van weerstanden is de stroomsterkte door elke weerstand gelijk en gelijk aan de totale stroomsterkte:
> I = I₁ = I₂ = I₃ = ...
> ### Tweede wet van de serieschakeling
> In een serieschakeling van weerstanden wordt de spanning verdeeld over de weerstanden (spanningsverdeling):
> U = U₁ + U₂ + U₃ + ...

[Afbeelding: Een serieschakeling met aanduidingen voor spanning (U, U1, U2) en stroom (I, I1, I2) over weerstanden R1 en R2.]
Nu rest ons alleen nog de formule voor de **substitutieweerstand** te bepalen:
U = U₁ + U₂
We weten door de wet van Ohm dat:
U = R ∙ I
We vinden dus:
R ∙ I = R₁ ∙ I₁ + R₂ ∙ I₂
(we weten uit de eerste wet van de serieschakeling dat I = I₁ = I₂)
=> R ∙ I = (R₁ + R₂) ∙ I
=> R = R₁ + R₂
> ### De substitutieweerstand R van een serieschakeling van weerstanden is gelijk aan de som van de weerstanden:
> R = R₁ + R₂ + ...

[Afbeelding: Schematische voorstelling van het vervangen van meerdere serieweerstanden door één enkele substitutieweerstand R.]
De substitutieweerstand is dus altijd groter dan de grootste weerstand in de serieschakeling.
De geleidbaarheid van de totale stroomkring is dus altijd kleiner dan de geleidbaarheden van de afzonderlijke weerstanden in de serieschakeling.

--- PAGE 8 ---
### Spanningsverdeling
We zien dat bij een serieschakeling van weerstanden de spanning verdeeld wordt over de verschillende weerstanden. We bekijken even hoe dit gebeurt:
[Afbeelding: Een serieschakeling met aanduidingen voor spanning (U, U1, U2) en stroom (I, I1, I2) over weerstanden R1 en R2.]
We weten dat:
I = I₁ = I₂
Uit de wet van Ohm weten we dat:
I = U / R
Dus hebben we:
I₁ = U₁ / R₁
En:
I₂ = U₂ / R₂
Hieruit volgt dan:
U₁ / R₁ = U₂ / R₂
Of:
U₁ / U₂ = R₁ / R₂
Hieruit wordt duidelijk dat de verhouding van de weerstanden in de serieschakeling gelijk is aan de verhouding van de spanningen over die weerstanden. Over de grootste weerstand staat dus de grootste spanning en over de kleinste weerstand staat de kleinste spanning.
Dit wordt duidelijker aan de hand van een voorbeeld.
**Voorbeeld**
Stel dat R₁ twee keer groter is dan R₂, dan zal U₁ ook twee keer groter zijn dan U₂.
Als bijvoorbeeld U = 30 V, dan zal in dit geval de spanningsverdeling als volgt gebeuren:
U₁ = 20 V
U₂ = 10 V
Als R₁ en R₂ even groot zijn, dan zal er een even grote spanning over R₁ en R₂ staan.

--- PAGE 9 ---
## 1.2 De parallelschakeling van weerstanden
[Afbeelding: Een parallelschakeling met twee weerstanden R1 en R2.]
In deze stroomkring staan twee weerstanden R₁ en R₂ in parallel geschakeld.
Als we de spanning meten over de weerstanden en over de spanningsbron, dan meten we telkens dezelfde spanning. Hieruit kunnen we besluiten dat:
U = U₁ = U₂
[Afbeelding: Een parallelschakeling met voltmeters die aantonen dat de spanning overal gelijk is (U = U1 = U2).]
[Afbeelding: Een parallelschakeling met ampèremeters die de stroomverdeling meten (I = I1 + I2).]
Als we een ampèremeter in elke tak van de schakeling plaatsen, dan zien we dat:
I = I₁ + I₂
Ook dit is logisch, want in het knooppunt, waar de splitsing in twee takken plaatsvindt, moet elk elektron een pad kiezen.

--- PAGE 10 ---
[Afbeelding: Een parallelschakeling met aanduidingen voor spanning (U, U1, U2) en stroom (I, I1, I2) over weerstanden R1 en R2.]
We kunnen dit ook uitbreiden voor een parallelschakeling die bestaat uit meer dan twee weerstanden.
We vatten dit samen in twee wetten:
> ### Eerste wet van de parallelschakeling
> In een parallelschakeling van weerstanden wordt de stroomsterkte verdeeld over de weerstanden (stroomverdeling):
> I = I₁ + I₂ + I₃ + ...
> ### Tweede wet van de parallelschakeling
> In een parallelschakeling van weerstanden is de spanning over elke weerstand gelijk en gelijk aan de totale spanning:
> U = U₁ = U₂ = U₃ = ...

Nu rest ons alleen nog de formule voor de **substitutieweerstand** te bepalen:
I = I₁ + I₂
We weten door de wet van Ohm dat:
U = R ∙ I
Of:
I = U / R
Hieruit volgt dan:
U / R = U₁ / R₁ + U₂ / R₂
(we weten uit de tweede wet van de parallelschakeling dat U = U₁ = U₂)
=> U / R = U / R₁ + U / R₂
=> 1 / R = 1 / R₁ + 1 / R₂

--- PAGE 11 ---
> De **substitutieweerstand R** van een parallelschakeling van weerstanden bereken je met de formule: **1/R = 1/R₁ + 1/R₂ + 1/R₃ + ...**

[Afbeelding: Schematische voorstelling van het vervangen van meerdere parallelle weerstanden door één enkele substitutieweerstand R.]
De substitutieweerstand is dus altijd kleiner dan de kleinste weerstand in de parallelschakeling.
De geleidbaarheid van de totale stroomkring is dus altijd groter dan de geleidbaarheid van de afzonderlijke weerstanden in de parallelschakeling.
### Stroomverdeling
We zien dat bij een parallelschakeling de stroomsterkte verdeeld wordt over de verschillende weerstanden. We bekijken even hoe dit juist gebeurt.
[Afbeelding: Een parallelschakeling met aanduidingen voor spanning (U, U1, U2) en stroom (I, I1, I2) over weerstanden R1 en R2.]

--- PAGE 12 ---
We weten dat:
U = U₁ = U₂
Uit de wet van Ohm weten we dat:
U = R ∙ I
Dus is:
R₁ ∙ I₁ = R₂ ∙ I₂
Of:
R₁ / R₂ = I₂ / I₁
Hieruit wordt duidelijk dat de verhouding van de weerstanden in de parallelschakeling gelijk is aan het omgekeerde van de verhouding van de stroomsterktes door die weerstanden. Door de grootste weerstand gaat dus de kleinste stroomsterkte en door de kleinste weerstand gaat de grootste stroomsterkte.
Dit wordt duidelijker aan de hand van een voorbeeld.
**Voorbeeld**
Stel dat R₁ twee keer groter is dan R₂, dan zal ook I₂ twee keer groter zijn dan I₁.
Als bijvoorbeeld I = 3 A, dan zal de stroomverdeling als volgt gebeuren:
I₁ = 1 A
I₂ = 2 A
Als R₁ even groot is als R₂, dan gaat er evenveel stroom door R₁ en R₂.
## 1.3 De gemengde schakeling van weerstanden
Een schakeling is echter meestal een gemengde schakeling van weerstanden. De weerstanden zijn niet allemaal ofwel in parallel, ofwel in serie geschakeld, maar dergelijke gemengde schakeling is een combinatie van in serie en in parallel geschakelde weerstanden.
We kunnen de formules die we gezien hebben voor serie- en parallelschakelingen, samen met de wet van Ohm, gebruiken om dergelijke gemengde schakelingen op te lossen. Welke formules we in welke volgorde moeten gebruiken, is echter afhankelijk van de opgave. We zullen dus telkens een andere redenering moeten maken, maar wel telkens volgens dezelfde methode.
We bekijken hieronder twee voorbeelden: een gemakkelijk voorbeeld en een iets complexer voorbeeld.

--- PAGE 13 ---
### Voorbeeld 1
[Afbeelding: Een gemengde schakeling van drie weerstanden.]
Het eerste voorbeeld is een gemengde schakeling van drie weerstanden.
We beginnen met bij elke weerstand de symbolen van spanning, stroomsterkte en weerstand te noteren. Dit doen we ook bij de spanningsbron.
[Afbeelding: Dezelfde gemengde schakeling, nu met alle symbolen voor spanning (U), stroom (I) en weerstand (R) ingevuld.]
In een volgende stap noteren we de gegevens in de figuur. In ons geval zijn de waarden van de weerstanden gegeven, alsook de totale spanning.
[Afbeelding: Dezelfde schakeling, nu met de numerieke waarden: U=20V, R1=300Ω, R2=250Ω, R3=1000Ω.]
In een opgave of oefening zal er een vraag gesteld worden.
Bijvoorbeeld:
- Hoe groot is de stroomsterkte door weerstand 3?
- Hoeveel bedraagt de substitutieweerstand?
- Hoe groot is de spanning over R₂?
We gaan als voorbeeld alle onbekende grootheden berekenen, zodanig dat we na het oplossen van deze oefening alle mogelijke vragen kunnen beantwoorden.

--- PAGE 14 ---
Als we de schakeling bekijken, zien we dat bij elke weerstand en bij de spanningsbron telkens slechts één gegeven staat. Als daar twee van de drie grootheden gekend zouden zijn, dan kan de derde grootheid berekend worden met behulp van de wet van Ohm. Dat is op dit moment dus nog niet mogelijk.
In een eerste stap kunnen we wel de substitutieweerstand bepalen.
R₂ en R₃ staan in parallel. We berekenen om te beginnen de substitutieweerstand van R₂ en R₃: R₂₃.
1/R₂₃ = 1/R₂ + 1/R₃
1/R₂₃ = 1/250 Ω + 1/1000 Ω
1/R₂₃ = 5/1000 Ω
R₂₃ = 200 Ω
Vervolgens berekenen we de substitutieweerstand R = R₁₂₃:
R = R₁₂₃ = R₁ + R₂₃
= 300 Ω + 200 Ω
= 500 Ω
We voegen onze uitkomst voor de substitutieweerstand toe aan onze schakeling:
[Afbeelding: De schakeling van Voorbeeld 1, waarbij de substitutieweerstand R=500Ω is toegevoegd.]
We zien nu dat bij de spanningsbron twee van de drie grootheden gekend zijn. We kunnen dus de derde grootheid berekenen met de wet van Ohm:
U = R ∙ I <=> I = U/R = 20 V / 500 Ω
= 0,040 A
= 40 mA

--- PAGE 15 ---
We vullen die stroomsterkte aan in onze schakeling:
[Afbeelding: Schakeling met de berekende totale stroom I = 40 mA ingevuld.]
Bovendien zien we dat de stroomsterkte I ook volledig door R₁ gaat, de tak wordt immers niet gesplitst.
[Afbeelding: Schakeling waarbij de stroom door R1 (I1) is gelijkgesteld aan de totale stroom (40 mA).]
Bij weerstand R₁ hebben we nu ook twee van de drie grootheden. We berekenen de derde grootheid:
U₁ = R₁ ∙ I₁ = 300 Ω ∙ 40 mA
= 12 V
We vullen ook dit aan in onze schakeling:
[Afbeelding: Schakeling met de berekende spanning over R1 (U1 = 12 V) ingevuld.]

--- PAGE 16 ---
R₂₃ staat in serie met R₁, dus is:
U = U₁ + U₂₃ => U₂₃ = U - U₁
= 20 V - 12 V
= 8,0 V
Aangezien R₂ en R₃ in parallel staan, is U₂₃ = U₂ = U₃. We vullen dit aan in onze schakeling:
[Afbeelding: Schakeling met de berekende spanningen U2 en U3 (beide 8,0 V) ingevuld.]
We zien dat we nu enkel nog de stroomsterkte moeten berekenen in de takken van R₂ en R₃:
I₂ = U₂ / R₂ = 8,0 V / 250 Ω = 0,032 A = 32 mA
I₃ = U₃ / R₃ = 8,0 V / 1000 Ω = 0,0080 A = 8,0 mA
Bij deze laatste stap kunnen we een controle uitvoeren door I₂ en I₃ samen te tellen:
I₂ + I₃ = 32 mA + 8,0 mA = 40 mA = I₁ = I
Dit klopt!
We vinden dus:
[Afbeelding: De volledig opgeloste schakeling met alle berekende waarden voor spanning en stroom ingevuld.]

--- PAGE 17 ---
### Voorbeeld 2
We volgen nu een analoge redenering voor het tweede voorbeeld. Dit voorbeeld is een gemengde schakeling van zes weerstanden.
[Afbeelding: Een complexe gemengde schakeling met zes weerstanden.]
We beginnen opnieuw met bij elke weerstand de symbolen van spanning, stroomsterkte en weerstand te noteren. We doen dit ook bij de spanningsbron.
[Afbeelding: Dezelfde schakeling met alle symbolen voor spanning, stroom en weerstand ingevuld.]
In de volgende stap noteren we de gegevens in de figuur. In ons geval zijn de waarden van de weerstanden gegeven, alsook de totale spanning.

--- PAGE 18 ---
[Afbeelding: De schakeling van Voorbeeld 2 met de numerieke waarden ingevuld: U=24V, R1=100Ω, R2=500Ω, R3=500Ω, R4=100Ω, R5=400Ω, R6=150Ω.]
In een opgave of oefening zal er een vraag gesteld worden.
Bijvoorbeeld:
- Hoe groot is de stroomsterkte door weerstand 5?
- Hoeveel bedraagt de substitutieweerstand?
- Hoe groot is de spanning over R₃?
We gaan als voorbeeld alle onbekende grootheden berekenen, zodanig dat we na het oplossen van deze oefening alle mogelijke vragen kunnen beantwoorden.
Als we de schakeling bekijken, zien we dat er bij elke weerstand en bij de spanningsbron telkens slechts één gegeven staat. Indien daar twee van de drie grootheden gekend zouden zijn, kan de derde grootheid met behulp van de wet van Ohm berekend worden. Dit passen we verder in de oefening toe.
In een eerste stap bepalen we de substitutieweerstand. We zien dat R₄ en R₅ in serie staan:
R₄₅ = R₄ + R₅ = 100 Ω + 400 Ω = 500 Ω
R₁ en R₂ staan ook in serie:
R₁₂ = R₁ + R₂ = 100 Ω + 500 Ω = 600 Ω
Aangezien dit een complexe schakeling is, kunnen we deze weerstanden in onze schakeling ook vervangen om een duidelijker beeld te krijgen:
[Afbeelding: Een vereenvoudigde versie van de schakeling, waar R1 en R2 zijn vervangen door R12, en R4 en R5 door R45.]

--- PAGE 19 ---
Zo ziet de schakeling er al eenvoudiger uit. We zien dat R₃ en R₄₅ in parallel staan. Ook daar berekenen we de substitutieweerstand R₃₄₅:
1/R₃₄₅ = 1/R₃ + 1/R₄₅
1/R₃₄₅ = 1/500 Ω + 1/500 Ω
1/R₃₄₅ = 2/500 Ω
R₃₄₅ = 250 Ω
Onze schakeling ziet er nu als volgt uit:
[Afbeelding: Een verder vereenvoudigde schakeling met R12, R345 en R6.]
We berekenen nu R₃₄₅₆:
R₃₄₅₆ = R₃₄₅ + R₆ = 250 Ω + 150 Ω
= 400 Ω
Op deze manier blijven er slechts twee weerstanden over in onze schakeling. Deze staan in parallel:
[Afbeelding: De meest vereenvoudigde schakeling met alleen R12 en R3456 in parallel.]

--- PAGE 20 ---
We kunnen nu de substitutieweerstand R berekenen:
1/R = 1/R₁₂ + 1/R₃₄₅₆
1/R = 1/600 Ω + 1/400 Ω
= 5/1200 Ω
R = 1200 Ω / 5 = 240 Ω
De substitutieweerstand van deze schakeling bedraagt dus 240 Ω. We vullen dit in in onze oorspronkelijke schakeling:
[Afbeelding: De originele schakeling van Voorbeeld 2 met de berekende substitutieweerstand R=240Ω ingevuld.]
We zien dat we de totale stroomsterkte I met behulp van de wet van Ohm kunnen berekenen:
I = U/R = 24 V / 240 Ω
= 0,10 A
= 100 mA
Onze schakeling is duidelijk een parallelschakeling van R₁₂ en R₃₄₅₆. Dit impliceert dat:
U = U₁₂ = U₃₄₅₆ = 24 V
> We bekijken eerst de tak R₁₂
R₁₂ = 600 Ω
We berekenen eerst I₁₂ = I₁ = I₂:
I₁₂ = U₁₂ / R₁₂ = 24 V / 600 Ω
= 0,040 A = 40 mA
= I₁ = I₂

--- PAGE 21 ---
Tot slot vinden we voor U₁ en U₂:
U₁ = R₁ ∙ I₁ = 100 Ω ∙ 40 mA = 4,0 V
U₂ = R₂ ∙ I₂ = 500 Ω ∙ 40 mA = 20 V
[Afbeelding: Deel van de schakeling met de waarden voor de tak met R1 en R2 ingevuld.]
> De tweede tak is iets moeilijker:
R₃₄₅₆ = 400 Ω
I₃₄₅₆ = U₃₄₅₆ / R₃₄₅₆ = 24 V / 400 Ω
= 0,060 A = 60 mA
We konden dit ook berekenen uit:
I₃₄₅₆ = I - I₁₂ = 100 mA – 40 mA = 60 mA
De tak met R₆ is niet gesplitst, dus:
I₆ = I₃₄₅ = 60 mA
En:
U₆ = R₆ ∙ I₆ = 150 Ω ∙ 60 mA = 9,0 V
We vullen dit aan in de tweede tak van de schakeling:
[Afbeelding: Deel van de schakeling met de waarden voor R6 ingevuld.]
We vinden dan voor U₃₄₅:
U₃₄₅ = U₃₄₅₆ - U₆ = 24 V - 9,0 V
= 15 V
= U₃ = U₄₅
Voor de stroomsterkte door R₃ vinden we:
I₃ = U₃ / R₃ = 15 V / 500 Ω
= 0,030 A
= 30 mA

--- PAGE 22 ---
We vullen dit aan in onze schakeling:
[Afbeelding: Deel van de schakeling met de waarden voor de tak met R3, R4 en R5 ingevuld.]
Als I₃ = 30 mA, dan is:
I₄ = I₅ = I₄₅ = I₆ - I₃
= 60 mA – 30 mA
= 30 mA
Hieruit kunnen we dan U₄ en U₅ berekenen:
U₄ = R₄ ∙ I₄ = 100 Ω ∙ 30 mA = 3,0 V
U₅ = R₅ ∙ I₅ = 400 Ω ∙ 30 mA = 12 V
En dus is U₄₅ = 15 V, wat klopt!
Nu hebben we alles berekend:
[Afbeelding: De volledig opgeloste schakeling van Voorbeeld 2 met alle berekende waarden voor spanning en stroom ingevuld.]
We hebben nu twee voorbeelden behandeld. Dergelijke berekeningen kunnen behoorlijk omslachtig worden. Het is dus belangrijk om alle tussenstappen duidelijk en nauwkeurig te noteren.

--- PAGE 23 ---
# 2 Elektriciteit en veiligheid
## 2.1 Gevaren bij gebruik van een elektrische installatie
Het gebruik van elektriciteit en elektrische installaties brengt wel wat risico's met zich mee. We bekijken in het bijzonder elektrocutie, kortsluiting en overbelasting.
### 2.1.1 Elektrocutie
[Afbeelding: Een geel waarschuwingsbord met een bliksemschicht en de tekst 'Danger Live wires below'.]
We spreken van elektrocutie als een schadelijke elektrische stroomschok door een menselijk lichaam gaat.
Ons lichaam heeft ook een weerstand. Deze weerstand is afhankelijk van een aantal factoren, zoals de bouw van de persoon, hoeveel eelt er aanwezig is op de huid, hoe zweterig een persoon is,... Ook hebben niet alle organen dezelfde weerstand.
Als een lichaam in contact komt met een spanning (op twee punten), dan loopt er een stroom door het lichaam. De stroom kiest daarbij niet de kortste weg, maar wel de weg met de minste weerstand (zenuwen, bloedvaten, hart, longen,...). De gevolgen van de stroomdoorgang door het lichaam zijn afhankelijk van de tijdsduur, stroomsterkte, of het om wissel- of gelijkstroom gaat, omgevingsfactoren en lichaamskenmerken. Het kan echter zijn dat er, ten gevolge van de stroomdoorgang door het lichaam, elektrocutie plaatsvindt.
Bij elektrocutie gaan bepaalde spieren omwille van de stroomdoorgang samentrekken, bijvoorbeeld ademhalingsspieren en de hartspier. Hierdoor kan het hartritme verstoord worden of het hart kan zelfs stoppen met kloppen. Ook brandwonden zijn een mogelijk gevolg. Deze komen vooral voor bij hoogspanning (meer dan 1000 V, bijvoorbeeld bij een afgebroken kabel van een hoogspanningsmast of een bovenleiding van een trein). Bij hoogspanning loopt de stroom namelijk voor een groot deel over het lichaam. Er kan bij die stroomdoorgang zelfs zoveel warmte rond het lichaam ontstaan dat het slachtoffer door de luchtverplaatsing weggeslingerd wordt, met bijkomende letsels tot gevolg.
[Afbeelding: Twee waarschuwingsborden. Links: 'Danger Live electrical equipment'. Rechts: 'Electrical equipment to be operated by authorised personnel only'.]
Verder is wisselstroom gevaarlijker dan gelijkstroom bij een even hoge spanning. Wisselspanning is veilig tot 50 V, gelijkspanning tot 120 V.

--- PAGE 24 ---
### 2.1.2 Kortsluiting
Bij een kortsluiting komen twee delen van een elektrische installatie, die beide onder spanning staan, met elkaar in contact. Dit kan op verschillende manieren, bijvoorbeeld doordat de isolatie rond de stroomdraden stuk is, door een defect in een toestel of door de aanwezigheid van vocht (vocht geleidt elektrische stroom meestal goed). Bij een kortsluiting kan er een vlamboog ontstaan: er springt dan een vonk over. Dit heeft brand- of explosiegevaar tot gevolg.
Via de QR-code kan je een kort animatiefilmpje over kortsluitingen bekijken. [Afbeelding: QR-code]
### 2.1.3 Overbelasting
Een ander gevaar dat kan optreden, is overbelasting. Als er te veel stroom door de elektrische draden loopt, spreken we van overbelasting. De draden warmen dan op en kunnen smelten waardoor er brand kan ontstaan.
## 2.2 Maatregelen om veilig en verantwoord om te gaan met een elektrische installatie
Elk huis heeft een zekeringskast. Dat is het hart van de elektrische installatie in een huis. Alle kabels komen daar samen. Elke kabel is omringd door een isolator, die zorgt voor **elektrische isolatie**. In de zekeringskast worden de stroomkringen beveiligd door **zekeringen** en **verliesstroomschakelaars**. Daarnaast vinden we er ook de **aarding** terug.
Meer leren over de zekeringskast? Bekijk dan het filmpje via de QR-code. [Afbeelding: QR-code]
De **verliesstroomschakelaars** reageren als er een stroomlek optreedt. Ze verbreken dan onmiddellijk de stroomkring en voorkomen zo elektrocutie van mensen en dieren.
[Afbeelding: Een geopende zekeringskast met verschillende automaten en schakelaars.]
De **zekeringen** zijn een overspanningsbeveiliging. De stroomsterkte die door de stroomkringen wordt gestuurd, moet beperkt blijven tot wat de kabel aankan. Zo wordt oververhitting en brandgevaar vermeden. Als de stroomkring overbelast wordt door te veel toestellen tegelijk aan te sluiten, zal de stroomsterkte groter worden dan de aanbevolen hoeveelheid en zal de zekering springen.
Een elektrische installatie heeft ook een **aarding**. Het teveel aan elektrische stroom wordt via deze aarding afgevoerd naar de aarde.
Zorg er bij het gebruik van elektriciteit steeds voor dat je niet rechtstreeks in contact komt met de geleidende stroomdraad. Zorg dus steeds voor een goede **elektrische isolatie**.

--- PAGE 25 ---
# 3 Verder oefenen?
## Begrijpen
**1** Zijn onderstaande schakelingen een serieschakeling, parallelschakeling of gemengde schakeling? Noteer.
a. [Afbeelding: schakeling] serieschakeling
b. [Afbeelding: schakeling] parallelschakeling
c. [Afbeelding: schakeling] gemengde schakeling
d. [Afbeelding: schakeling] parallelschakeling
e. [Afbeelding: schakeling] serieschakeling

--- PAGE 26 ---
f. [Afbeelding: schakeling] serieschakeling
g. [Afbeelding: schakeling] serieschakeling
h. [Afbeelding: schakeling] gemengde schakeling
**2** Gegeven: onderstaande schakeling.
[Afbeelding: Een complexe gemengde schakeling met weerstanden R1 t/m R6.]
a. Welke weerstanden staan in parallel? Noteer.
b. Welke weerstanden staan in serie? Noteer.
> a. R₂, R₃ en R₄
> b. R₁, R₂₃₄, R₅ en R₆

--- PAGE 27 ---
**3** Teken drie weerstanden R₁, R₂ en R₃ die in serie zijn geschakeld.
[Afbeelding: Een serieschakeling met drie weerstanden R1, R2, R3.]
a. Wat kan je zeggen over de totale spanning in functie van de spanning over deze drie weerstanden voor deze stroomkring? Geef de formule.
b. Verklaar deze formule aan de hand van een schets.
c. Wat kan je zeggen over de totale stroomsterkte in functie van de stroomsterkte door deze drie weerstanden voor deze stroomkring? Geef de formule.
d. Verklaar deze formule aan de hand van een schets.
> a. De totale spanning U wordt verdeeld over de drie afzonderlijke weerstanden (spanningsverdeling):
> U = U₁ + U₂ + U₃
> b. De spanning wordt verdeeld over de drie weerstanden:
> - U₁ over R₁
> - U₂ over R₂
> - U₃ over R₃
> [Afbeelding: Een serieschakeling met voltmeters die de spanning over elke weerstand meten.]
> c. De stroomsterkte door de afzonderlijke weerstanden is gelijk en gelijk aan de totale stroomsterkte:
> I = I₁ = I₂ = I₃
> d. [Afbeelding: Een serieschakeling die toont dat de stroom I overal gelijk is.]
> De ladingen moeten allemaal door elke weerstand, dus:
> I = I₁ = I₂ = I₃

--- PAGE 28 ---
**4** Teken drie weerstanden R₁, R₂ en R₃ die in parallel zijn geschakeld.
[Afbeelding: Een parallelschakeling met drie weerstanden R1, R2, R3.]
a. Wat kan je zeggen over de totale spanning in functie van de spanning over deze drie weerstanden voor deze stroomkring? Geef de formule.
b. Verklaar deze formule aan de hand van een schets.
c. Wat kan je zeggen over de totale stroomsterkte in functie van de stroomsterkte door deze drie weerstanden voor deze stroomkring? Geef de formule.
d. Verklaar deze formule aan de hand van een schets.
> a. De spanning over de afzonderlijke weerstanden is gelijk en gelijk aan de totale spanning:
> U = U₁ = U₂ = U₃
> b. [Afbeelding: Een parallelschakeling met voltmeters die aantonen dat de spanning overal gelijk is.]
> U = U₁ = U₂ = U₃
> c. De totale stroomsterkte I wordt verdeeld over de drie afzonderlijke weerstanden (stroomverdeling):
> I = I₁ + I₂ + I₃

--- PAGE 29 ---
> d. [Afbeelding: Een parallelschakeling die toont hoe de stroom I zich splitst in I1, I2, en I3 bij een knooppunt.]
> In elk knooppunt moet elke lading een pad (tak kiezen). Door elke weerstand loopt er dus een deel van de totale lading:
> - I₁ door R₁
> - I₂ door R₂
> - I₃ door R₃
**5** Sien maakt onderstaande opstelling:
[Afbeelding: Een opstelling met een batterij en drie parallel geschakelde lampjes.]
Welke bewering is correct? Duid het juiste antwoord aan.
a. De lampjes zijn in serie geschakeld.
b. De lampjes zijn in parallel geschakeld.
> **b. De lampjes zijn in parallel geschakeld.**

--- PAGE 30 ---
**6** Twee lampjes L₁ en L₂ en een schakelaar S zijn in een stroomkring opgenomen, zoals op de schakeling hiernaast. Bij deze opstelling branden de lampjes.
[Afbeelding: Een schakeling met lampje L1 in serie met een parallelle tak met lampje L2 en schakelaar S.]
Vervolgens wordt de schakelaar S gesloten. Duid het juiste antwoord aan. Dan:
a. brandt L₁ feller.
b. brandt L₂ feller.
c. branden beide lampjes feller.
d. brandt enkel L₁.
e. brandt enkel L₂.
> **b en e**
> Als de schakelaar gesloten wordt, brandt enkel L₂. De elektronen kiezen namelijk altijd de weg met de minste weerstand. Als de schakelaar gesloten is, is de weg met de minste weerstand het pad waar ze enkel L₂ tegenkomen, ze gaan dus niet door de tak met L₁ stromen. Als de schakelaar open is, hebben de elektronen geen keuze en moeten ze zowel langs L₁ en L₂ gaan. L₂ zal ook feller branden. Als de schakelaar gesloten wordt, zal er namelijk een hogere spanning over L₂ komen te staan. L₂ zal dus feller branden (de spanning mag wel niet zo hoog worden dat het lampje springt).
**7** In elk huis zijn er een aantal voorzieningen voor elektrische beveiliging aangebracht. Eén daarvan is de verliesstroomschakelaar. Wanneer treedt deze in werking? Duid het juiste antwoord aan.
a. bij een verschil in stroomsterkte.
b. als de aarding losraakt.
c. bij overbelasting.
> **a. bij een verschil in stroomsterkte**
**8** Gegeven: onderstaande schakeling.
[Afbeelding: Een parallelschakeling met twee weerstanden R1=3Ω en R2=9Ω.]
Duid het juiste antwoord aan. In deze schakeling is:
a. I₁ groter dan I₂.
b. I₁ kleiner dan I₂.
c. I₁ gelijk aan I₂.
> **a. I₁ is groter dan I₂**: in een parallelschakeling wordt de stroomsterkte verdeeld over de afzonderlijke weerstanden. Door de kleinste weerstand loopt de grootste stroomsterkte en door de grootste weerstand loopt de kleinste stroom.

--- PAGE 31 ---
**9** In onderstaande schakeling branden alle lampjes tot er eentje stuk gaat omdat de gloeidraad breekt. Als je weet dat er nadien nog drie lampjes branden, welk lampje is er dan gesprongen? Duid het juiste antwoord aan.
[Afbeelding: Een gemengde schakeling met vier lampjes. Lampje 1 en 2 staan in serie met een parallelle tak van lampje 3 en 4.]
a. lampje 1
b. lampje 2
c. lampje 3
d. lampje 4
e. elk lampje kan kapot zijn
> **d. lampje 4**: als lampje 4 springt, wordt deze tak van de parallelschakeling onderbroken. De elektronen kunnen wel nog door de tak met lampje 3. Ze passeren dan ook lampje 1 en 2. Lampje 1, 2 en 3 blijven dus branden als lampje 4 springt.
**10** Sien maakt volgende schakeling en is blij dat het lampje brandt.
[Afbeelding: Een eenvoudige serieschakeling met een batterij en een lampje. De draad is opgedeeld in secties P-Q, Q-R, en R-S.]
Wat kan je zeggen over de stroomsterkte? Duid het juiste antwoord aan.
a. De stroomsterkte is het grootst in PQ.
b. De stroomsterkte is het grootst in RS.
c. De stroomsterkte is het grootst in QR.
d. De stroomsterkte is in alle drie de stukken even groot.
> **d. De stroomsterkte is in alle drie de stukken even groot.** De elektronen kunnen maar één weg afleggen en dus zal de stroomsterkte in elk stuk even groot zijn.

--- PAGE 32 ---
**11** Silvie maakt onderstaande schakeling:
[Afbeelding: Een serieschakeling met een ampèremeter en twee weerstanden, R1=70Ω en R2=20Ω.]
Door welke weerstand loopt de grootste stroom? Duid het juiste antwoord aan.
a. door de weerstand van 20 Ω.
b. door de weerstand van 70 Ω.
c. Dit kan je niet weten omdat de spanning niet gegeven is.
d. De stroom is door beide weerstanden even groot.
> **d. De stroom is door beide weerstanden even groot.** De weerstanden zijn namelijk in serie geschakeld. Elk elektron kan dus maar één pad afleggen en zal bijgevolg door beide weerstanden gaan.
**12** Teken een schakeling met daarin twee lampjes die je elk met een aparte schakelaar kan aan- en uitzetten.
[Afbeelding: Een schakeling met twee parallelle takken, elk met een eigen lamp en schakelaar.]
**13** Stijn heeft een opstelling gemaakt met heel wat lampjes en schakelaars.
[Afbeelding: Een complexe schakeling met 5 lampjes (L1-L5) en 3 schakelaars (S1-S3).]
a. Welke lampjes branden op dit moment? Noteer.
b. Welke schakelaar moet je sluiten om lampje L₃ te laten branden? Noteer.
> a. Op dit moment branden lampje L₂ en lampje L₄.
> b. Om lampje L₃ te laten branden, moet je schakelaar S₂ sluiten.

--- PAGE 33 ---
**14** In een serieschakeling staan vijf lampjes van 5 V en 0,3 A. Teken deze schakeling.
[Afbeelding: Een serieschakeling van vijf lampjes, elk met 5V en 0,3A aangeduid.]
**15** Een leerling maakt onderstaande opstelling. Hij is verbaasd om te zien dat als de schakelaar open is het lampje brandt en als de schakelaar gesloten is het lampje niet brandt.
[Afbeelding: Een schakeling waarbij een schakelaar parallel staat aan een lamp (R).]
a. Leg uit waarom hij dit waarneemt.
b. Leg uit waarom dit geen goede schakeling is.
c. Welke schakeling had hij moeten maken als hij het lampje met een schakelaar wil kunnen aan- en uitschakelen? Leg uit.
> a. Als de schakelaar open is, is de schakeling ok: het lampje krijgt stroom en brandt.
> Als de schakelaar gesloten is, gaat er geen stroom meer door het lampje. Het circuit is namelijk kortgesloten: de elektronen kiezen de weg met de minste weerstand; als de schakelaar gesloten is, is dat het pad zonder weerstand. Dit is een kortsluiting.
> b. Het circuit is kortgesloten als de schakelaar gesloten wordt: de elektronen kunnen dan een pad kiezen zonder weerstand en we krijgen te maken met een kortsluiting.
> c. De leerling had de schakelaar en de lamp in serie moeten schakelen: de lamp zou dan uit zijn als de schakelaar open is en de lamp zou branden als de schakelaar gesloten wordt.

--- PAGE 34 ---
**16** Noteer over welke punten je in onderstaande opstelling een voltmeter zou plaatsen om de spanning te meten over:
a. de spanningsbron
b. R₁
c. R₂
d. R₃
e. R₂ en R₃
[Afbeelding: Een complexe schakeling met weerstanden en meetpunten a t/m j.]
Opmerking: de weerstand onder de spanningsbron staat daar foutief, deze zou weggedacht moeten worden. Zonder deze weerstand is de oplossing:
> a. abci-hgjf
> b. abci-hgjf
> c. abci-de
> d. de-hgjf
> e. abci-hgjf

--- PAGE 35 ---
## Toepassen
**1**
a. Teken een schakeling waarin twee lampjes en een weerstand in serie staan.
b. Teken een schakeling waarin twee lampjes en een weerstand in parallel staan.
De lampjes hebben een weerstand van 60 Ω en de weerstand is 120 Ω.
c. Bepaal voor de schakeling uit puntje a en b de substitutieweerstand.
a. [Afbeelding: Twee lampjes en een weerstand in serie.]
b. [Afbeelding: Twee lampjes en een weerstand in parallel.]
c. Gegeven: R(lamp) = 60 Ω, R = 120 Ω
Gevraagd: Rₐ en Rₑ
Oplossing:
Schakeling a is een serieschakeling, de substitutieweerstand is dus:
Rₐ = R(lamp) + R(lamp) + R
= 60 Ω + 60 Ω + 120 Ω
= 240 Ω
Schakeling b is een parallelschakeling, de substitutieweerstand is dus:
1/Rₑ = 1/R(lamp) + 1/R(lamp) + 1/R
= 1/60 Ω + 1/60 Ω + 1/120 Ω
= 5/120 Ω
=> Rₑ = 120 Ω / 5 = 24 Ω

--- PAGE 36 ---
**2** [Afbeelding: Een serieschakeling met een 24V bron, vier lampjes en een ampèremeter die 0,150 A aangeeft.]
a. Bepaal de spanning over elke lamp.
b. Bepaal de weerstand van elke lamp.
Gegeven: U = 24 V, I = 0,150 A
Gevraagd: a. U(lamp), b. R(lamp)
Oplossing:
a. We hebben een serieschakeling van vier identieke lampen. De spanning wordt verdeeld over de vier lampen, we vinden:
U = 4 ∙ U(lamp) => U(lamp) = U / 4
= 24 V / 4
= 6,0 V
Voor een serieschakeling is de stroomsterkte door elke lamp gelijk en gelijk aan de totale stroomsterkte:
I = I(lamp) = 0,150 A
b. Voor de weerstand van elke lamp vinden we dan:
R(lamp) = U(lamp) / I(lamp)
= 6,0 V / 0,150 A
= 40 Ω

--- PAGE 37 ---
**3** [Afbeelding: Een gemengde schakeling. Een tak met 4 lampjes in serie staat parallel aan een tak met 3 weerstanden in serie. De spanningsbron is 24V.]
a. Door R₁ stroomt 0,4 A. Bereken de stroomsterkte die door R₂ en R₃ loopt.
b. Door lampje L₄ loopt 0,10 A. Bereken de stroomsterkte die door de andere lampjes loopt.
c. Hoe groot is de totale stroomsterkte? Bereken.
d. Hoe groot is de totale spanning over de lampjes? Bereken.
e. Als je weet dat alle lampjes identiek zijn, wat is dan de spanning over één lamp? Bereken.
f. Bereken de spanning over elke weerstand als je weet dat alle weerstanden identiek zijn.
g. Hoe groot is de weerstand van één lampje? Bereken.
h. Hoe groot is de weerstand van één weerstand? Bereken.
i. Hoeveel bedraagt de substitutieweerstand van deze schakeling? Bereken.
Gegeven: U = 24 V, I(R1) = 0,4 A, I(L4) = 0,10 A
Gevraagd:
a. I(R2), I(R3)
b. I(L1), I(L2), I(L3)
c. I
d. U(tot, lamp)
e. U(lamp)
f. U(weerstand)
g. R(lamp)
h. R(weerstand)
i. R
Oplossing:
a. De weerstanden zijn in serie geschakeld, de stroom door de drie weerstanden is dus gelijk: I(R1) = I(R2) = I(R3) = 0,4 A
b. De lampjes zijn ook in serie geschakeld, de stroom door de vier lampjes is dus gelijk: I(L1) = I(L2) = I(L3) = I(L4) = 0,10 A
c. De totale stroomsterkte vinden we door de stroomsterkte door de lampjes en door de weerstanden op te tellen (de lampjes en de weerstanden staan immers in parallel met elkaar): I = I(lamp) + I(weerstand) = 0,10 A + 0,4 A = 0,5 A

--- PAGE 38 ---
d. De schakeling is een parallelschakeling van vier lampjes in één tak en drie weerstanden in een andere tak. Voor een parallelschakeling geldt dat de spanning over elke tak gelijk is en gelijk is aan de totale spanning. We hebben dus:
U = U(tot, lamp) = 24 V
e. De lampjes zijn identiek en in serie geschakeld. Voor de spanning over één lampje vinden we:
U(lamp) = U(tot, lamp) / 4 = 24 V / 4 = 6,0 V
f. De weerstanden zijn identiek en in serie geschakeld. Voor de spanning over één weerstand vinden we:
U(weerstand) = U(tot, weerstand) / 3 = 24 V / 3 = 8,0 V
g. De weerstand van één lampje vinden we met behulp van de wet van Ohm:
R(lamp) = U(lamp) / I(lamp) = 6,0 V / 0,10 A = 60 Ω
h. Voor de weerstand van één weerstand vinden we:
R(weerstand) = U(weerstand) / I(weerstand) = 8,0 V / 0,4 A = 20 Ω
i. Om de substitutieweerstand van de parallelschakeling te berekenen, bepalen we eerst de substitutieweerstanden van de twee afzonderlijke takken:
R(tak, lamp) = 4 ∙ R(lamp) = 4 ∙ 60 Ω = 240 Ω
R(tak, weerstand) = 3 ∙ R(weerstand) = 3 ∙ 20 Ω = 60 Ω
Voor de substitutieweerstand vinden we dan:
1/R = 1/R(tak, lamp) + 1/R(tak, weerstand) = 1/240 Ω + 1/60 Ω = 5/240 Ω
R = 240 Ω / 5 = 48 Ω

--- PAGE 39 ---
**4** Olivier maakt onderstaande opstelling:
[Afbeelding: Een serieschakeling met R1=60Ω, R2=20Ω en een ampèremeter.]
Hij wil echter de twee weerstanden vervangen door één weerstand. Hoe groot moet deze weerstand dan zijn om exact dezelfde waarde voor de stroomsterkte en de spanning te behouden? Bereken en duid het juiste antwoord aan.
a. 20 Ω
b. 40 Ω
c. 15 Ω
d. 80 Ω
e. 30 Ω
Gegeven: R₁ = 60 Ω, R₂ = 20 Ω
Gevraagd: R
Oplossing: R = R₁ + R₂ = 60 Ω + 20 Ω = 80 Ω
**Antwoord d is het juiste antwoord.**
**5** Gegeven: onderstaande schakeling.
[Afbeelding: Een serieschakeling met een 20V bron, R1=3,2Ω, R2=2,6Ω en een ampèremeter.]
Op de ampèremeter lezen we 120 mA af. Bepaal de spanning over R₁ en R₂.
Gegeven: I = 120 mA, R₁ = 3,2 Ω, R₂ = 2,6 Ω
Gevraagd: U₁ en U₂
Oplossing: We hebben te maken met een serieschakeling, dus:
I = I₁ = I₂ = 120 mA
Voor de spanning over R₁ en R₂ vinden we dan:
U₁ = R₁ ∙ I₁ = 3,2 Ω ∙ 120 ∙ 10⁻³ A = 0,38 V
U₂ = R₂ ∙ I₂ = 2,6 Ω ∙ 120 ∙ 10⁻³ A = 0,31 V

--- PAGE 40 ---
**6** Sien vindt op zolder een slinger lampjes die dient als kerstboomverlichting. De slinger moet aangesloten worden op 230 V en bevat 46 lampjes die in serie geschakeld zijn.
Hoeveel spanning staat er over elk lampje bij aansluiting van deze kerstboomverlichting? Bereken.
Gegeven: U = 230 V, 46 lampjes in serie geschakeld
Gevraagd: U(lampje) (spanning over elk lampje)
Oplossing: De lampjes zijn in serie geschakeld en identiek, we hebben dus (spanningsverdeling):
U = 46 ∙ U(lampje) => U(lampje) = U / 46 = 230 V / 46 = 5,0 V
**7** Drie weerstanden van 40 Ω worden in serie geschakeld. Bereken de substitutieweerstand.
Gegeven: 3 weerstanden in serie geschakeld, R₁ = R₂ = R₃ = 40 Ω
Gevraagd: R
Oplossing: Voor een serieschakeling geldt: R = R₁ + R₂ + R₃ = 40 Ω + 40 Ω + 40 Ω = 120 Ω
**8** Twee weerstanden van 40 Ω worden in parallel geschakeld. Bereken de substitutieweerstand.
Gegeven: 2 weerstanden in parallel geschakeld, R₁ = R₂ = 40 Ω
Gevraagd: R
Oplossing: Voor een parallelschakeling geldt: 1/R = 1/R₁ + 1/R₂ = 1/40 Ω + 1/40 Ω = 2/40 Ω. Dus: R = 20 Ω

--- PAGE 41 ---
**9** Bepaal de substitutieweerstand van onderstaande schakeling.
[Afbeelding: Een gemengde schakeling met R1=40Ω, R2=30Ω, R3=20Ω, R4=10Ω, R5=50Ω.]
Gegeven: gemengde schakeling met gekende weerstanden
Gevraagd: R
Oplossing: R₂, R₃ en R₄ zijn in parallel geschakeld. We berekenen de substitutieweerstand R₂₃₄:
1/R₂₃₄ = 1/R₂ + 1/R₃ + 1/R₄ = 1/30 Ω + 1/20 Ω + 1/10 Ω = 11/60 Ω
=> R₂₃₄ = 60 Ω / 11 = 5,5 Ω
R₁ en R₂₃₄ zijn in serie geschakeld. We vinden dan voor de substitutieweerstand R₁₂₃₄:
R₁₂₃₄ = R₁ + R₂₃₄ = 40 Ω + 5,5 Ω = 45,5 Ω ≈ 46 Ω
R₁₂₃₄ en R₅ zijn in parallel geschakeld. We berekenen de substitutieweerstand R = R₁₂₃₄₅:
1/R = 1/R₁₂₃₄ + 1/R₅ = 1/45,5 Ω + 1/50 Ω
=> R ≈ 23,8 Ω ≈ 24 Ω

--- PAGE 42 ---
**10** Gegeven: onderstaande schakeling. Alle weerstanden in deze schakeling zijn identiek.
[Afbeelding: Een complexe gemengde schakeling met 5 identieke weerstanden en een ampèremeter.]
De ampèremeter geeft 3,6 mA aan. Welke stroomsterkte komt uit de stroombron? Bereken.
Gegeven: gemengde schakeling met identieke weerstanden, I(tak) = 3,6 mA
Gevraagd: I
Oplossing: Door de tak met de twee weerstanden gaat de helft van de stroomsterkte die door de andere takken gaat. Voor de totale stroomsterkte vinden we dan:
I = 3 ∙ I(tak) + I(tak)/2
= 3 ∙ 3,6 mA + 1,8 mA
= 12,6 mA ≈ 13 mA
**11** Vul aan.
[Afbeelding: Een parallelschakeling. U=6,0V, I=2,0A, U1=6,0V, I1=0,25A, U2=?, I2=?, U3=6,0V, I3=1,5A.]
Gegeven: U = 6,0 V, I = 2,0 A, U₃ = 6,0 V, I₃ = 1,5 A
Gevraagd: U₁, U₂, I₁, I₂
Oplossing: Voor een parallelschakeling geldt dat de spanning over elke tak gelijk is en gelijk is aan de totale spanning, dus:
U = U₁ = U₂ = U₃ = 6,0 V

--- PAGE 43 ---
De stroomsterkte wordt verdeeld over de drie afzonderlijke takken. De lampjes in tak 1 en tak 2 zijn echter identiek, daar zal dus dezelfde stroom doorlopen:
I₁ = I₂
We vinden dus:
I = I₁ + I₂ + I₃
= 2 ∙ I₁ + I₃ => I₁ = (I - I₃) / 2
= (2,0 A - 1,5 A) / 2
= 0,25 A
**12** Vul aan.
[Afbeelding: Een parallelschakeling. U=?, I=?, U1=12V, I1=0,4A, U2=12V, I2=0,4A, U3=12V, I3=1,2A.]
Gegeven: U₁ = U₂ = U₃ = 12 V, I₁ = I₂ = 0,4 A, I₃ = 1,2 A
Gevraagd: U, I
Oplossing: Voor een parallelschakeling geldt dat de spanning over elke tak gelijk is en gelijk is aan de totale spanning, dus:
U = U₁ = U₂ = U₃ = 12 V
De stroomsterkte wordt verdeeld over de drie afzonderlijke takken. De totale stroomsterkte is dan:
I = I₁ + I₂ + I₃ = 0,4 A + 0,4 A + 1,2 A = 2,0 A

--- PAGE 44 ---
**13** Vul aan.
[Afbeelding: Een serieschakeling van 5 lampjes. U=?, I=?, U1=6V, I1=0,4A, U2=6V, I2=0,4A, U3=6V, I3=0,4A, U4=6V, I4=0,4A, U5=6V, I5=0,4A.]
Gegeven: U₁ = U₂ = U₃ = U₄ = U₅ = 6 V, I₁ = I₂ = I₃ = I₄ = I₅ = 0,4 A
Gevraagd: U, I
Oplossing: Voor een serieschakeling geldt dat de stroomsterkte door elke lamp gelijk is en gelijk is aan de totale stroomsterkte, dus:
I = I₁ = I₂ = I₃ = I₄ = I₅ = 0,4 A
De spanning wordt verdeeld over de vijf afzonderlijke lampjes. De totale spanning is dan:
U = U₁ + U₂ + U₃ + U₄ + U₅ = 5 ∙ 6 V = 30 V
**14** Vul aan.
[Afbeelding: Een gemengde schakeling. U=60V, I=3,0A, R1=20Ω, R2=20Ω, R3=20Ω, U1=?, U2=?]
Gegeven: I = 3,0 A, R₁ = R₂ = R₃ = 20 Ω
Gevraagd: U₁, U₂
Oplossing: De stroom door R₁ bedraagt:
I₁ = 3,0 A
U₁ wordt dan:
U₁ = R₁ ∙ I₁ = 20 Ω ∙ 3,0 A = 60 V

--- PAGE 45 ---
De substitutieweerstand van R₂ en R₃ bedraagt:
R₂₃ = R₂ + R₃ = 20 Ω + 20 Ω = 40 Ω
De stroom door R₂₃ bedraagt:
I₂₃ = 3,0 A
U₂ wordt dan:
U₂ = R₂₃ ∙ I₂₃ = 40 Ω ∙ 3,0 A = 120 V
**15** In een broodrooster zitten vier verwarmingselementen welke in serie geschakeld zijn. De buitenste twee verwarmingselementen hebben elk een weerstand van 17 Ω, de binnenste twee verwarmingselementen hebben elk een weerstand van 13 Ω. Bepaal de totale weerstand van de broodrooster.
Gegeven: vier weerstanden in serie, R₁ = R₄ = 17 Ω, R₂ = R₃ = 13 Ω
Gevraagd: R
Oplossing: Voor een serieschakeling wordt de substitutieweerstand als volgt berekend:
R = R₁ + R₂ + R₃ + R₄
= 2 ∙ 17 Ω + 2 ∙ 13 Ω
= 60 Ω
**16** Een zekering beveiligt tot 10 A. De netspanning bedraagt 230 V. Hoeveel bedraagt het maximaal vermogen dat op deze zekering mag worden ingeschakeld? Bereken.
Gegeven: I(max) = 10 A, U = 230 V
Gevraagd: P(max)
Oplossing: P(max) = U ∙ I(max)
= 230 V ∙ 10 A
= 2300 W = 2,3 kW

--- PAGE 46 ---
**17** Een 1800 W broodrooster, een 1400 W frietketel en een 75 W lamp zijn allemaal aangesloten op een spanningsbron van 230 V. In de zekeringskast zit een 16 A zekering voor deze stroomkring. De drie toestellen staan in parallel.
a. Bereken de stroomsterkte door elk toestel.
b. Zal de zekering springen? Leg uit.
Gegeven: P₁ = 1800 W, P₂ = 1400 W, P₃ = 75 W, U = 230 V, I(max) = 16 A, parallelschakeling
Gevraagd: a. I₁, I₂, I₃; b. zekering springen?
Oplossing:
a. P = U ∙ I => I = P / U
I₁ = 1800 W / 230 V = 7,83 A
I₂ = 1400 W / 230 V = 6,09 A
I₃ = 75 W / 230 V = 0,33 A
b. De totale stroomsterkte van een parallelschakeling is gelijk aan de som van de afzonderlijke stroomsterktes:
I = I₁ + I₂ + I₃
= 7,83 A + 6,09 A + 0,33 A
= 14,25 A
De totale stroomsterkte van de parallelschakeling is kleiner dan de maximaal toegelaten stroomsterkte. De zekering zal dus niet springen.

--- PAGE 47 ---
**18** Toon aan dat als twee weerstanden R₁ en R₂, waarbij de ene weerstand veel groter is dan de andere (R₁ >> R₂), worden geschakeld:
a. de weerstand van de serieschakeling van de twee weerstanden bijna gelijk is aan de grootste weerstand R₁.
b. de weerstand van de parallelschakeling van de twee weerstanden bijna gelijk is aan de kleinste weerstand R₂.
Gegeven: twee weerstanden R₁ en R₂, R₁ >> R₂
Gevraagd: a. R(serie) ≈ R₁, b. R(parallel) ≈ R₂
Oplossing:
a. Voor een serieschakeling geldt:
R(serie) = R₁ + R₂
≈ R₁ (R₁ >> R₂, we mogen R₂ dus verwaarlozen ten opzichte van R₁)
b. Voor een parallelschakeling geldt:
1/R(parallel) = 1/R₁ + 1/R₂
≈ 1/R₂ (1 gedeeld door een zeer groot getal is ongeveer gelijk aan nul)
R(parallel) ≈ R₂
**19** Bereken de totale spanning en stroomsterkte voor onderstaande stroomkring.
[Afbeelding: Parallelschakeling. U=?, I=?, U1=15V, I1=0,5A, U2=15V, I2=0,8A, U3=15V, I3=0,7A.]
Gegeven: U₁ = 15 V, I₁ = 0,5 A, U₂ = 15 V, I₂ = 0,8 A, U₃ = 15 V, I₃ = 0,7 A
Gevraagd: U en I
Oplossing: Voor een parallelschakeling geldt:
U = U₁ = U₂ = U₃ = 15 V
En (stroomverdeling):
I = I₁ + I₂ + I₃
= 0,5 A + 0,8 A + 0,7 A
= 2,0 A

--- PAGE 48 ---
**20** Vul aan.
[Afbeelding: Serieschakeling. U=60V, I=3,0A, U1=40V, I1=?, U2=10V, I2=?, U3=?, I3=?]
Gegeven: U₁ = 40 V, U₂ = 10 V, U = 60 V, I = 3,0 A
Gevraagd: U₃, I₁, I₂, en I₃
Oplossing: Voor een serieschakeling geldt:
U = U₁ + U₂ + U₃ => U₃ = U - U₁ - U₂
= 60 V - 40 V - 10 V
= 10 V
Voor de stroomsterkte door de afzonderlijke weerstanden geldt:
I = I₁ = I₂ = I₃ = 3,0 A

--- PAGE 49 ---
**21** Welke weerstand moet je in parallel met een weerstand van 14,6 Ω schakelen om een totale weerstand van 12,0 Ω te bekomen? Bereken.
[Afbeelding: Parallelschakeling met R1=14,6Ω en een onbekende R2.]
Gegeven: R₁ = 14,6 Ω, R = 12,0 Ω
Gevraagd: R₂
Oplossing: Voor een parallelschakeling geldt:
1/R = 1/R₁ + 1/R₂ => 1/R₂ = 1/R - 1/R₁
1/R₂ = (R₁ - R) / (R ∙ R₁)
R₂ = (R ∙ R₁) / (R₁ - R)
R₂ = (12,0 Ω ∙ 14,6 Ω) / (14,6 Ω - 12,0 Ω)
= 67,4 Ω

--- PAGE 50 ---
**22** In een parallelschakeling van drie weerstanden (6,0 Ω; 12,0 Ω; 18,0 Ω) gaat door de weerstand van 6,0 Ω een stroom van 2,4 A. Bepaal de stroomsterkte door de andere weerstanden alsook de totale spanning.
[Afbeelding: Parallelschakeling met R1=6,0Ω, I1=2,4A, R2=12,0Ω, R3=18,0Ω.]
Gegeven: R₁ = 6,0 Ω, I₁ = 2,4 A, R₂ = 12,0 Ω, R₃ = 18,0 Ω
Gevraagd: I₂, I₃ en U
Oplossing: U₁ = R₁ ∙ I₁
= 6,0 Ω ∙ 2,4 A
= 14,4 V ≈ 14 V
Voor een parallelschakeling geldt:
U = U₁ = U₂ = U₃ = 14,4 V
We vinden dan voor I₂ en I₃:
I₂ = U₂ / R₂ = 14,4 V / 12,0 Ω = 1,20 A
I₃ = U₃ / R₃ = 14,4 V / 18,0 Ω = 0,800 A

--- PAGE 51 ---
**23** Bereken in onderstaande schakelingen telkens de ontbrekende stroomsterkte.
A. [Afbeelding: Schakeling A] ? = 45 mA - 25 mA = 20 mA
B. [Afbeelding: Schakeling B] ? = 4,0 A - 2,0 A - 0,5 A = 1,5 A
C. [Afbeelding: Schakeling C] ? = 120 mA
D. [Afbeelding: Schakeling D] ? = 20 mA + 30 mA - 10 mA - 15 mA = 25 mA

--- PAGE 52 ---
**24** Bereken in onderstaande schakelingen telkens de ontbrekende spanning.
A. [Afbeelding: Schakeling A] ? = 9,0 V
B. [Afbeelding: Schakeling B] ? = 6,0 V - 3,0 V - 1,5 V = 1,5 V
C. [Afbeelding: Schakeling C] ? = 8,0 V - 4,5 V - 2,5 V = 1,0 V
D. [Afbeelding: Schakeling D] ? = 10,0 V - 1,5 V - 1,5 V - 2,0 V = 5,0 V

--- PAGE 53 ---
**25** Rosemarie heeft in het labo een doosje met weerstanden van 3,0 kΩ ter beschikking. Ze test om te beginnen welke weerstand ze krijgt als ze:
a. twee dergelijke weerstanden van 3,0 kΩ in serie schakelt. Bereken dit.
b. twee dergelijke weerstanden van 3,0 kΩ in parallel schakelt. Bereken dit.
c. drie dergelijke weerstanden in parallel schakelt. Bereken dit.
De leerkracht geeft haar vervolgens de opdracht om met de weerstanden een schakeling met een totale weerstand van 2,0 kΩ te maken.
d. Hoe moet Rosemarie de weerstanden schakelen? Teken de schakeling en maak de berekeningen.
Gegeven: R = 3,0 kΩ
Gevraagd:
a. R als twee dergelijke weerstanden in serie geschakeld zijn
b. R als twee dergelijke weerstanden in parallel geschakeld zijn
c. R als drie dergelijke weerstanden in parallel geschakeld zijn
d. hoe weerstanden schakelen om R = 2,0 kΩ te bekomen
Oplossing:
a. R = 3,0 kΩ + 3,0 kΩ = 6,0 kΩ
b. 1/R = 1/3,0 kΩ + 1/3,0 kΩ = 2/3,0 kΩ => R = 1,5 kΩ
c. 1/R = 1/3,0 kΩ + 1/3,0 kΩ + 1/3,0 kΩ = 3/3,0 kΩ => R = 1,0 kΩ
d. Als we drie weerstanden van 3,0 kΩ in parallel schakelen, krijgen we een weerstand van 1,0 kΩ. Daarnaast weten we ook dat we de substitutieweerstand van een serieschakeling kunnen berekenen door de afzonderlijke weerstanden op te tellen. We moeten dus twee weerstanden van 1,0 kΩ in serie schakelen om een totale weerstand van 2,0 kΩ te bekomen. Dit doen we door drie parallel geschakelde weerstanden van 3,0 kΩ in serie te schakelen met drie parallel geschakelde weerstanden van 3,0 kΩ.
[Afbeelding: Een schakeling die twee blokken van elk drie parallelle weerstanden in serie plaatst.]

--- PAGE 54 ---
**26** Gegeven: bovenstaande opstelling. Bereken alle onbekende grootheden.
[Afbeelding: Complexe gemengde schakeling met U=30V en weerstanden R1-R5.]
Gegeven: gemengde schakeling met gekende weerstanden en totale spanning
Gevraagd: alle onbekende grootheden
Oplossing: We beginnen met het bepalen van de substitutieweerstand. R₂ en R₃ staan in parallel:
1/R₂₃ = 1/R₂ + 1/R₃ = 1/33 Ω + 1/10 Ω => R₂₃ = 7,7 Ω
R₁, R₂₃ en R₄ staan in serie:
R₁₂₃₄ = R₁ + R₂₃ + R₄ = 20 Ω + 7,7 Ω + 10 Ω = 37,7 Ω ≈ 38 Ω
R₁₂₃₄ en R₅ staan in parallel, we vinden dan voor de substitutieweerstand R = R₁₂₃₄₅:
1/R = 1/R₁₂₃₄ + 1/R₅ = 1/37,7 Ω + 1/60 Ω => R = 23,2 Ω ≈ 23 Ω
Aangezien de totale spanning gegeven is, kunnen we de totale stroomsterkte berekenen met behulp van de wet van Ohm:
I = U / R = 30 V / 23,2 Ω = 1,29 A ≈ 1,3 A
We hebben te maken met een parallelschakeling van R₁₂₃₄ en R₅, er geldt dus:
U = U₁₂₃₄ = U₅

--- PAGE 55 ---
Voor de stroomsterkte door R₅ vinden we dan:
I₅ = U₅ / R₅ = 30 V / 60 Ω = 0,50 A
De stroomsterkte in de tak R₁₂₃₄ wordt dan:
I₁₂₃₄ = I - I₅ = 1,3 A - 0,50 A = 0,8 A
Aangezien R₁, R₂₃ en R₄ in serie staan, hebben we ook:
I₁₂₃₄ = I₁ = I₂₃ = I₄ = 0,8 A
We kunnen nu de spanningen U₁, U₂₃ en U₄ berekenen:
U₁ = I₁ ∙ R₁ = 0,8 A ∙ 20 Ω = 16 V
U₂₃ = I₂₃ ∙ R₂₃ = 0,8 A ∙ 7,7 Ω = 6 V
U₄ = I₄ ∙ R₄ = 0,8 A ∙ 10 Ω = 8 V
En aangezien R₂ en R₃ in parallel staan, hebben we:
U₂₃ = U₂ = U₃ = 6 V
Nu rest ons enkel nog I₂ en I₃ te berekenen:
I₂ = U₂ / R₂ = 6 V / 33 Ω = 0,18 A ≈ 0,2 A
I₃ = U₃ / R₃ = 6 V / 10 Ω = 0,6 A

--- PAGE 56 ---
**27** Jef maakt een opstelling bestaande uit vier weerstanden en een ampèremeter. De opstelling is aangesloten op een spanningsbron.
[Afbeelding: Gemengde schakeling met 4 weerstanden en een ampèremeter.]
Bepaal de spanning over en de stroomsterkte door elke weerstand als je weet dat de ampèremeter 54,0 mA aangeeft.
Gegeven: gemengde schakeling met gekende weerstanden, I₂ = 54,0 mA
Gevraagd: spanning over en stroomsterkte door elke weerstand
Oplossing: Bij R₂ zijn twee van de drie grootheden gekend, we berekenen de derde met behulp van de wet van Ohm:
U₂ = R₂ ∙ I₂ = 200 Ω ∙ 54,0 ∙ 10⁻³ A = 10,8 V
R₃ staat in parallel met R₂, dus:
U₂ = U₃ = 10,8 V
De stroomsterkte door R₃ wordt dan:
I₃ = U₃ / R₃ = 10,8 V / 300 Ω = 36,0 mA
I₂₃ is gelijk aan de som van I₂ en I₃:
I₂₃ = I₂ + I₃ = 54,0 mA + 36,0 mA = 90,0 mA
R₄ staat in serie met R₂₃, dus:
I₂₃ = I₄ = 90,0 mA
De spanning door R₄ wordt dan:
U₄ = I₄ ∙ R₄ = 90,0 mA ∙ 400 Ω = 36,0 V
De totale spanning in de tak R₂₃₄ wordt dan:
U₂₃₄ = U₂₃ + U₄ = 10,8 V + 36,0 V = 46,8 V
R₁ staat in parallel met R₂₃₄, dus:
U₂₃₄ = U₁ = 46,8 V

--- PAGE 57 ---
Nu moeten we enkel nog de stroomsterkte door R₁ berekenen:
I₁ = U₁ / R₁ = 46,8 V / 100 Ω = 468 mA
**28** Bereken voor bovenstaande schakeling voor elke weerstand de spanning over en de stroomsterkte door de weerstand. Bereken de totale weerstand en de totale stroomsterkte.
[Afbeelding: Zeer complexe gemengde schakeling met 7 weerstanden en een 20V bron.]
Gegeven: gemengde schakeling met gekende weerstanden en totale spanning
Gevraagd: spanning over en stroomsterkte door elke weerstand + totale weerstand en stroomsterkte
Oplossing: We beginnen met het bepalen van de substitutieweerstand. R₅ en R₆ staan in serie:
R₅₆ = R₅ + R₆ = 45 Ω + 10 Ω = 55 Ω
R₃, R₄ en R₅₆ staan in parallel:
1/R₃₄₅₆ = 1/R₃ + 1/R₄ + 1/R₅₆ = 1/15 Ω + 1/30 Ω + 1/55 Ω => R₃₄₅₆ = 8,46 Ω ≈ 8,5 Ω
R₂ en R₃₄₅₆ staan in serie:
R₂₃₄₅₆ = R₂ + R₃₄₅₆ = 20 Ω + 8,5 Ω = 28,5 Ω ≈ 29 Ω
R₁ en R₂₃₄₅₆ staan in parallel:
1/R₁₂₃₄₅₆ = 1/R₁ + 1/R₂₃₄₅₆ = 1/20 Ω + 1/28,5 Ω => R₁₂₃₄₅₆ = 11,8 Ω ≈ 12 Ω

--- PAGE 58 ---
R₁₂₃₄₅₆ en R₇ staan in serie, de substitutieweerstand wordt dus:
R = R₁₂₃₄₅₆ + R₇ = 11,8 Ω + 10 Ω = 21,8 Ω ≈ 22 Ω
Aangezien de totale spanning gegeven is, kunnen we de totale stroomsterkte berekenen met behulp van de wet van Ohm:
I = U / R = 20 V / 21,8 Ω = 0,92 A
Deze stroomsterkte gaat ook volledig door R₇:
I = I₇ = 0,92 A
Voor de spanning over R₇ vinden we dan:
U₇ = I₇ ∙ R₇ = 0,92 A ∙ 10 Ω = 9,2 V
R₁₂₃₄₅₆ staat in serie met R₇, dus:
U₁₂₃₄₅₆ = U - U₇ = 20 V - 9,2 V = 10,8 V ≈ 11 V
U₁ en U₂₃₄₅₆ staat in parallel, dus:
U₁₂₃₄₅₆ = U₁ = U₂₃₄₅₆ = 10,8 V ≈ 11 V
De stroomsterkte door R₁ is:
I₁ = U₁ / R₁ = 10,8 V / 20 Ω = 0,54 A
Aangezien R₁ en R₂₃₄₅₆ in parallel staan, hebben we:
I₂₃₄₅₆ = I - I₁ = 0,92 A - 0,54 A = 0,38 A
Aangezien R₂ en R₃₄₅₆ in serie staan, hebben we ook:
I₂₃₄₅₆ = I₂ = I₃₄₅₆ = 0,38 A
We kunnen nu de spanningen U₂ en U₃₄₅₆ berekenen:
U₂ = I₂ ∙ R₂ = 0,38 A ∙ 20 Ω = 7,6 V
U₃₄₅₆ = I₃₄₅₆ ∙ R₃₄₅₆ = 0,38 A ∙ 8,5 Ω = 3,2 V
En aangezien R₃, R₄ en R₅₆ in parallel staan, hebben we:
U₃₄₅₆ = U₃ = U₄ = U₅₆ = 3,2 V

--- PAGE 59 ---
Nu kunnen we I₃, I₄ en I₅₆ = I₅ = I₆ berekenen:
I₃ = U₃/R₃ = 3,2V/15Ω = 0,21 A
I₄ = U₄/R₄ = 3,2V/30Ω = 0,11 A
I₅=I₆ = U₅₆/R₅₆ = 3,2V/55Ω = 0,058 A
Tot slot kunnen we de spanningen U₅ en U₆ berekenen:
U₅ = I₅ ∙ R₅ = 0,058 A ∙ 45 Ω = 2,6 V
U₆ = I₆ ∙ R₆ = 0,058 A ∙ 10 Ω = 0,58 V
**29** In jouw auto zijn de koplampen (30,0 W) en de starter (2,40 kW) in parallel aangesloten op een 12,0 V batterij. Hoeveel zouden ze samen verbruiken als ze in serie zouden aangesloten worden op de 12,0 V batterij? Bereken (andere weerstanden in de keten mag je verwaarlozen).
Gegeven: P₁ = 30,0 W, P₂ = 2,40 kW, U = 12,0 V
Gevraagd: P (indien in serie geschakeld)
Oplossing: We beginnen met het bepalen van R₁ en R₂:
R = U²/P
R₁ = (12,0 V)² / 30,0 W = 4,80 Ω
R₂ = (12,0 V)² / (2,40 ∙ 10³ W) = 0,0600 Ω
De substitutieweerstand, als de twee weerstanden in serie geschakeld zijn, bedraagt:
R = R₁ + R₂ = 4,80 Ω + 0,0600 Ω = 4,86 Ω
Voor het totaal vermogen van de serieschakeling vinden we dan:
P = U² / R = (12,0 V)² / 4,86 Ω = 29,6 W

--- PAGE 60 ---
**30** Gegeven: een 48,0 V batterij en twee weerstanden van respectievelijk 24,0 Ω en 96,0 Ω.
Bereken de stroomsterkte en vermogen voor elke weerstand:
a. als ze in serie staan.
b. als ze in parallel staan.
Gegeven: R₁ = 24,0 Ω, R₂ = 96,0 Ω, U = 48,0 V
Gevraagd:
a. I₁, P₁, I₂, P₂ (indien in serie geschakeld)
b. I₁, P₁, I₂, P₂ (indien in parallel geschakeld)
Oplossing:
a. Serieschakeling
R = R₁ + R₂ = 24,0 Ω + 96,0 Ω = 120,0 Ω
I = I₁ = I₂ = U / R = 48,0 V / 120,0 Ω = 0,400 A
P₁ = R₁ ∙ I₁² = 24,0 Ω ∙ (0,400 A)² = 3,84 W
P₂ = R₂ ∙ I₂² = 96,0 Ω ∙ (0,400 A)² = 15,4 W
b. Parallelschakeling
U = U₁ = U₂ = 48,0 V
I₁ = U₁ / R₁ = 48,0 V / 24,0 Ω = 2,00 A
I₂ = U₂ / R₂ = 48,0 V / 96,0 Ω = 0,500 A
P₁ = R₁ ∙ I₁² = 24,0 Ω ∙ (2,00 A)² = 96,0 W
P₂ = R₂ ∙ I₂² = 96,0 Ω ∙ (0,500 A)² = 24,0 W

--- PAGE 61 ---
**31** Een 240 kV hoogspanningslijn waar een stroom van 5,00 ∙ 10² A doorgaat, is met keramische isolatoren, elk met een weerstand van 1,00 ∙ 10⁹ Ω, aan een geaarde metalen constructie bevestigd.
[Afbeelding: Een hoogspanningsmast met aanduidingen voor de hoogspanningslijn, keramische isolator en geaarde metalen constructie.]
a. Wat is de weerstand van 100 dergelijke isolatoren? Bereken (de isolatoren zijn in parallel geschakeld).
b. Bereken het vermogen dat in 100 isolatoren verloren gaat.
c. Welk deel van het totale vermogen van de hoogspanningslijn is dat? Bereken.
Gegeven: U = 240 kV, I = 5,00 ∙ 10² A, R = 1,00 ∙ 10⁹ Ω
Gevraagd: a. R₁₀₀, b. P₁₀₀, c. deel van P(tot)?
Oplossing:
a. 1/R₁₀₀ = 100/R => R₁₀₀ = R/100 = 1,00 ∙ 10⁹ Ω / 100 = 1,00 ∙ 10⁷ Ω
b. P₁₀₀ = U² / R₁₀₀ = (240 ∙ 10³ V)² / (1,00 ∙ 10⁷ Ω) = 576 ∙ 10 W
c. P(tot) = U ∙ I = 240 ∙ 10³ V ∙ 5,00 ∙ 10² A = 120 MW
P₁₀₀ / P(tot) = 576 ∙ 10 W / 120 MW = 1/20833
Dit is slechts een heel kleine factor die verloren gaat.

--- PAGE 62 ---
**32** Een starter van een automotor heeft een weerstand van 0,0500 Ω en is aangesloten op een batterij van 12,0 V met een inwendige weerstand van 0,0100 Ω.
a. Welke stroomsterkte gaat door de motor? Bereken.
b. Welke spanning staat over de starter? Bereken.
c. Wat is het vermogen van de starter? Bereken.
d. Herhaal de berekeningen in het geval dat de verbindingsdraden verroest zijn en een extra weerstand van 0,0900 Ω geven aan de schakeling.
Gegeven: U = 12,0 V, R(starter) = 0,0500 Ω, Rᵢ = 0,0100 Ω
Gevraagd: a. I(motor), b. U(starter), c. P(starter), d. herhaal berekeningen met extra weerstand van 0,0900 Ω
Oplossing:
a. R(tot) = R(starter) + Rᵢ = 0,0500 Ω + 0,0100 Ω = 0,0600 Ω
I(motor) = U / R(tot) = 12,0 V / 0,0600 Ω = 200 A
b. U(starter) = R(starter) ∙ I(motor) = 0,0500 Ω ∙ 200 A = 10,0 V
c. P(starter) = U(starter) ∙ I(motor) = 10,0 V ∙ 200 A = 2,00 kW
d. R(tot) = R(starter) + Rᵢ + R(extra) = 0,0500 Ω + 0,0100 Ω + 0,0900 Ω = 0,1500 Ω
I(motor) = U / R(tot) = 12,0 V / 0,1500 Ω = 80,0 A
U(starter) = R(starter) ∙ I(motor) = 0,0500 Ω ∙ 80,0 A = 4,00 V
P(starter) = U(starter) ∙ I(motor) = 4,00 V ∙ 80,0 A = 320 W
Het vermogen van de starter neemt sterk af door de verroeste verbindingsdraden. Dit kan leiden tot opstartproblemen.

--- PAGE 63 ---
**33** Een persoon heeft een weerstand van 10,0 kΩ tussen zijn handen. Hij neemt per ongeluk beide polen van een 20,0 kV spanningsbron vast met beide handen (doe dit niet!).
a. Teken een schema van de situatie.
b. Als de inwendige weerstand van de spanningsbron 2000 Ω is, welke stroomsterkte gaat er dan door zijn lichaam? Bereken.
c. Welk vermogen krijgt hij te verwerken? Bereken.
d. Stel dat we de spanningsbron veiliger maken door de inwendige weerstand te verhogen. Hoe groot zou dan de inwendige weerstand moeten zijn om een maximale stroomsterkte van 1,00 mA te verkrijgen? Bereken.
e. Zou deze aanpassing een effect op het vermogen van de spanningsbron hebben? Leg uit.
Gegeven: R(persoon) = 10,0 kΩ, Rᵢ = 2000 Ω, U = 20,0 kV, I(max) = 1,00 mA
Gevraagd: a. schema, b. I, c. P, d. Rᵢ opdat I(max) = 1,00 mA, e. effect op vermogen spanningsbron?
Oplossing:
a. [Afbeelding: Serieschakeling van inwendige weerstand Rᵢ en weerstand van de persoon R(persoon).]
b. R(tot) = R(persoon) + Rᵢ = 10,0 kΩ + 2,000 kΩ = 12,0 kΩ
I = U / R(tot) = 20,0 kV / 12,0 kΩ = 1,67 A
c. P = U ∙ I = 20,0 kV ∙ 1,67 A = 33,4 kW
d. R = U / I(max) = 20,0 kV / 1,00 ∙ 10⁻³ A = 20,0 MΩ
R = R(persoon) + Rᵢ => Rᵢ = R - R(persoon) = 20,0 MΩ - 10,0 kΩ = 19990000 Ω ≈ 20,0 MΩ
e. P = R ∙ I(max)² = 20,0 MΩ ∙ (1,00 ∙ 10⁻³ A)² = 20,0 W
Het vermogen zou sterk afnemen.

--- PAGE 64 ---
# ISAAC-actie
## Schakelen van weerstanden
[Afbeelding: Logo van PhET INTERACTIVE SIMULATIONS]
[Afbeelding: Screenshot van de 'Circuit Construction Kit: DC - Virtual Lab' simulatie van PhET.]
Open de applet 'Circuit Construction Kit : DC - Virtual Lab' via de QR-code en voer de opdracht uit.
[Afbeelding: QR-code]

--- PAGE 65 ---
# STUDIEWIJZER
- [ ] Ik kan serie- en parallelschakelingen bespreken.
- [ ] Ik kan de substitutieweerstand bij serie- en parallelschakelingen bepalen.
- [ ] Ik kan de stroomsterkte en spanning bij serie- en parallelschakelingen bespreken.
- [ ] Ik kan de verdelingswetten voor spanning en stroomsterkte opstellen.
- [ ] Ik kan enkele gevaren bij het gebruik van een elektrische installatie opsommen en uitleggen (elektrocutie, kortsluiting en overbelasting).
- [ ] Ik kan enkele veiligheidsaspecten bij het gebruik van een elektrische installatie opsommen en uitleggen (elektrische isolatie, zekering, verliesstroomschakelaar, aarding).
- [ ] Ik kan de substitutieweerstand van een gemengde schakeling van weerstanden berekenen.
- [ ] Ik kan gemengde schakelingen van weerstanden en één spanningsbron in gelijkstroomkringen oplossen.

--- PAGE 66 ---
## Colofon
Auteur: Freya Vermeiren
Met medewerking van Anke Van Roy
Eerste druk: 2022
SO 0462/2022
Bestelnummer: 65 900 0654 (module 6 van 90 808 0461)
ISBN: 978 90 4864 392 9 (module 6 van 978 90 4863 438 5)
KB: D/2022/0147/126
NUR: 126
Thema: YPMP5
Verantwoordelijke uitgever: die Keure,
Kleine Pathoekeweg 3,
8000 Brugge
RPR 0405 108 325 - die Keure, Brugge
[Logo: die Keure]
[Logo: FSC - Papier Ondersteunt verantwoord bosbeheer]
Die Keure wil het milieu beschermen. Daarom kiezen wij bewust voor papier dat het keurmerk van de Forest Stewardship Council® (FSC®) draagt. Dit product is gemaakt van materiaal afkomstig uit goed beheerde, FSC®-gecertificeerde bossen en andere gecontroleerde bronnen.
--- PAGE 1 ---
1
Nando 4

**Inhoud**
Instap
1 Grafen rondom ons
2 Wandelingen in een graaf
3 Minimaal opspannende bomen
4 Kortste paden
5 Het handelsreizigersprobleem
6 Graafkleuring
Signaaloefeningen
Differentiatietraject
Studiewijzer

D-FINALITEIT 5 UUR – DISCRETE WISKUNDE EN LOGICA
# 08 Grafen

[Afbeelding: Coverafbeelding met een foto van een stad en de tekst "CORRECTIESLEUTEL" diagonaal in grote letters.]

## WAT JE AL KUNT
– Je kan problemen oplossen met boomdiagrammen.

## WAT JE LEERT IN DEZE MODULE
– een graaf gebruiken als model of schematische voorstelling
– in een concrete situatie die door een graaf beschreven wordt de betekenis van de knopen, de bogen en de buren van de knopen uitleggen
– een graaf die bij een concrete situatie behoort, opstellen
– het bestaan van specifieke wandelingen opsporen die alle bogen juist één keer doorlopen
– het algoritme van Kruskal of Prim toepassen om de minimaal opspannende boom in een gewogen graaf te bepalen
– het algoritme van Dijkstra toepassen om het kortste pad in een gewogen graaf te bepalen
– het handelsreizigersprobleem linken met grafen
– de betekenis van graafkleuring begrijpen en dit toepassen in concrete situaties

## IN DE KIJKER
Je kan met behulp van een schematische voorstelling (graaf) en een algoritme praktische problemen uit de dagelijkse praktijk oplossen.

## WISKUNDETAAL
– graaf
– knoop van een graaf
– boog van een graaf
– samenhangende graaf
– orde van een graaf
– grootte van een graaf
– nabuurschap van een knoop
– graad van een knoop
– planaire graaf
– gewogen graaf
– reguliere graaf
– volledige graaf
– multigraaf
– wandeling
– pad
– cykel
– spoor
– circuit
– eulertoer
– eulergraaf
– hamiltoncykel
– hamiltongraaf
– boom
– algoritme van Prim
– algoritme van Kruskal
– algoritme van Dijkstra
– handelsreizigersprobleem
– graafkleuring

--- PAGE 2 ---
2

# Instap

## Opdracht 1

Luka en Julie plannen een bezoekje aan een dierenpark. Vooraf hebben ze een plan van het dierenpark gedownload. Ze willen het volledige park bezoeken, maar wel zodanig dat ze elke weg slechts eenmaal doorlopen. Help hen een mogelijke route uit te stippelen.

[Afbeelding: Een plattegrond van een dierenpark. Een rode lijn (de route) vertrekt bij "start" aan de poort, loopt via verschillende paden langs dierenverblijven en pijlen geven de richting aan. De lijn volgt genummerde tussenstappen 1 tot en met 10 en eindigt bij "einde" aan dezelfde poort. Elk pad wordt exact eenmaal doorlopen.]

--- PAGE 3 ---
3

## Opdracht 2

Vijf plaatsen (A, B, C, D en E) moeten via een kabelnetwerk met elkaar verbonden worden. De kosten om twee plaatsen met elkaar te verbinden kunnen we schematisch weergeven als volgt:

[Afbeelding: Een graaf met vijf knopen (A, B, C, D, E) en bogen met gewichten. AB=5, AC=14, AD=9, BC=9, BD=12, CE=9, CD=8, DE=8, EB=6, EA=1, AE=7.]

a) Hoeveel bedraagt de kost om plaats A met plaats B te verbinden?
[ 5 eenheden ]

b) Wat is de goedkoopste manier om plaats B met E te verbinden?
[ BA - AE ]
[ (5 + 6) eenheden = 11 eenheden ]

Hiernaast vind je een mogelijke oplossing om alle plaatsen met elkaar te verbinden.

[Afbeelding: Een boomgraaf als deel van de oorspronkelijke graaf, met bogen AB=7, BC=9, CE=9, CD=8. De tekst luidt: "Een mogelijke oplossing is:"]

c) Wat is de totale kostprijs van deze oplossing?
[ (9 + 7 + 9 + 8) eenheden = 33 eenheden ]

Ga op zoek naar de goedkoopste oplossing.

[Afbeelding: Een nieuwe boomgraaf met bogen AE=1, AB=5, AC=7, AD=6. De tekst luidt: "Een mogelijke oplossing is:"]
[ De kostprijs voor deze oplossing is ]
[ (6 + 1 + 7 + 5) eenheden = 19 eenheden. ]

--- PAGE 4 ---
4

# 1 Grafen rondom ons

## 1.1 Wat zijn grafen?

In het dagelijkse leven worden we met grafen geconfronteerd:
- Boomdiagrammen die je kent van bij telproblemen zijn een eenvoudig voorbeeld, maar ook stambomen of speelschema’s bij toernooien.
- Bij de uitwerking van dienstregelingen van het openbaar vervoer of het aanleggen van een nieuwe buslijn of de verbindingen tussen terminals in een luchthaven vind je grafen terug.
- Ook in de logistiek maakt men gebruik van grafen. Je kunt een app (bv. Ibi) downloaden die voor jou de snelste route bepaalt tussen een aantal ingevoerde adressen, of een app die jou een fietsroute voorstelt langs verschillende knooppunten.

Al deze voorbeelden zijn gebaseerd op de **grafentheorie** en de daarop voortbouwende wiskundige modellen.

[Afbeelding: STAMBOOM - Een schema van een familie met cirkels voor personen verbonden door lijnen, van overgrootouders tot achterneef/achternicht.]
[Afbeelding: KNOOPPUNTEN BIJ FIETSROUTES - Een landkaart met een groene fietsroute gemarkeerd door nummers zoals 164, 186, 160.]
[Afbeelding: ROUTES BIJ NAVIGATIE - Een bovenaanzicht van een kaart (zoals in een GPS-app) met paden.]
[Afbeelding: METROLIJNEN - Een schematische kaart van de metrolijnen rondom Heathrow Terminals.]
[Afbeelding: SPEELSCHEMA'S - Een toernooischema (bracket) met landenvlaggen voor voetbal.]
[Afbeelding: TRAMLIJNEN - Een schematisch plan van tramlijnen met haltes zoals Dorpsplein, Kerk, Markt, enz.]

--- PAGE 5 ---
5

## 1.2 Definities

In een dorpje in Oostenrijk zijn zes berghutten met elkaar verbonden door enkele pittoreske wandelpaden. 
Schematisch kunnen we dit op een plan als volgt weergeven:

[Afbeelding: Een graaf met knopen A, B, C, D, E, F in een ruimtelijke vorm.]
[Afbeelding: Een foto van bergbeklimmers op een bergpad.]

Zo'n schematische voorstelling door middel van punten (de berghutten) en lijnen (de wandelpaden) noemen we een graaf. Een graaf bestaat uit knopen (punten) die door middel van bogen (lijnen) met elkaar verbonden zijn. Elke boog van een graaf verbindt twee knopen. We noemen die knopen dan de de eindpunten van de boog.

definitie
Een **graaf G** bestaat uit een eindige verzameling van knopen en een eindige verzameling van bogen.
• de knopen in deze graaf: A, B, C, D, E en F (de berghutten)
• de bogen in deze graaf: AB, AC, AD, BC, BE, CE, CF, DF, EF (de wandelpaden)

**Merk op**
Een graaf is een schematische voorstelling, geen weergave van de werkelijkheid op schaal. De vorm van de knopen en bogen doet er niet toe. Zo kan men de graaf uit het voorbeeld ook weergeven zoals hiernaast.

[Afbeelding: Een alternatieve grafische weergave van dezelfde graaf G.]

definitie
De **orde van de graaf** is het aantal knopen in de graaf. 
De **grootte van de graaf** is het aantal bogen van de graaf.

In deze graaf G is de orde gelijk aan 6. We noteren n = 6. 
In deze graaf G is de grootte gelijk aan 9. We noteren m = 9.

definitie
Een knoop is een **buur** van een andere knoop als ze verbonden zijn door een boog.

De **graad van een knoop** X, deg(X), is het aantal bogen aan X in G.
De hoogste graad die in G voorkomt, noteren we als Δ(G).
De laagste graad die in G voorkomt, noteren we als δ(G).

Voor deze graaf geldt:
Δ(G) = 4
δ(G) = 2

| KNOOP | BUREN | GRAAD |
|---|---|---|
| A | B, C, D | 3 |
| B | A, C, E | 3 |
| C | A, B, E, F | 4 |
| D | A, F | 2 |
| E | B, C, F | 3 |
| F | C, D, E | 3 |

--- PAGE 6 ---
6

## 1.3 Soorten grafen

definitie
Een **planaire graaf** is een graaf die in het platte vlak kan getekend worden zonder dat de bogen elkaar snijden.

**Voorbeeld**
De graaf die hoort bij het voorbeeld van de berghutten is een planaire graaf.
[Afbeelding: De planaire weergave van de graaf met berghutten (A t/m F).]

**Tegenvoorbeeld**
In de graaf hieronder snijden de bogen AC en BD elkaar. Dit is geen planaire graaf.
[Afbeelding: Een graaf met knopen A, B, C, D, E waarbij bogen elkaar diagonaal snijden.]

definitie
Een **gewogen graaf** is een graaf waarbij aan elke boog een ‘gewicht’ werd toegekend.

Afhankelijk van de context kan je bij de boog bijvoorbeeld ...
• de afstand (in km) tussen twee knopen noteren.
• de reistijd (in min) noteren.
• de kostprijs (in euro) om het wandelpad aan te leggen noteren.

[Afbeelding: Een graaf die vliegroutes tussen Londen, Parijs, Brussel, Amsterdam en Berlijn voorstelt, met de afstand in kilometers op de bogen. Daarnaast een foto van een opstijgend vliegtuig.]

definitie
Een **multigraaf** is een graaf waarbij twee knopen door meer dan één boog met elkaar verbonden zijn.

[Afbeelding: Een graaf met knopen A, B, C, D waarbij knoop A en D door twee bogen verbonden zijn, en knoop B en C door twee bogen.]

--- PAGE 7 ---
7

definitie
Een graaf waarin alle knopen dezelfde graad hebben, is een **reguliere graaf**.

**Voorbeeld**
[Afbeelding: Een reguliere graaf met knopen A t/m G waarbij elke knoop graad 3 heeft.]
In elke knoop is de graad 3.

**Tegenvoorbeeld**
[Afbeelding: Een graaf waarbij niet alle knopen dezelfde graad hebben.]
We stellen vast dat bv. gr(A) = 2 en gr(E) = 4.

definitie
Een graaf heet **volledig** als elke knoop in de graaf verbonden is met alle andere knopen in de graaf.

**Voorbeeld**
[Afbeelding: Een volledige graaf in de vorm van een pentagram in een pentagon (knopen A t/m E).]

**Tegenvoorbeeld**
[Afbeelding: Een vierkante graaf (A, B, C, D) met slechts één diagonaal (B-D).]
De knopen A en C zijn niet met elkaar verbonden.

--- PAGE 8 ---
8

## 1.4 Grafen opstellen

Grafen kunnen helpen om problemen op te lossen. Het opstellen van de graaf die hoort bij het probleem is dus belangrijk.

**Voorbeeld**
Bij 5 leerlingen van het vierde jaar wordt er gekeken of ze elkaar (terug-)volgen op Instagram.

Jasleen en Zion volgen elkaar.
Jasleen en Carina volgen elkaar.
Lune en Marley volgen elkaar.
Marley en Zion volgen elkaar.
Lune en Jasleen volgen elkaar.

[Afbeelding: Portretjes van Zion, Jasleen, Carina, Marley en Lune met zwarte verbindingslijnen ertussen gebaseerd op bovenstaande tekst.]

Op basis van deze informatie kan je nu een graaf tekenen waarbij de knopen de namen van de leerlingen zijn en waarbij de bogen aangeven of er wederzijds gevolgd wordt.

**Merk op**
Heel wat principes van sociale media hebben dus te maken met grafen en netwerken.

[Afbeelding: Een groot abstract netwerk van profielfoto's (avatars) die onderling verbonden zijn met gestippelde lijnen.]

--- PAGE 9 ---
9

# Verwerkingsopdrachten 1, 2

1
Gegeven is de graaf G.
[Afbeelding: Een graaf met 7 knopen A, B, C, D, E, F, G in de vorm van twee verbonden ruiten/driehoeken met een diagonaal.]

a) Geef de knopen en bogen d.m.v. opsomming.
[ knopen: A, B, C, D, E, F, G ]
[ bogen: AB, AC, AG, BC, CG, CE, DE, DF, EF, FG ]

b) Bepaal de orde en grootte van deze graaf.
[ orde n: 7 ]
[ grootte m: 10 ]

c) Bepaal de graad van elke knoop.
[ deg(A) = 3 ]
[ deg(B) = 2 ]
[ deg(C) = 4 ]
[ deg(D) = 2 ]
[ deg(E) = 3 ]
[ deg(F) = 3 ]
[ deg(G) = 3 ]

d) Bepaal ∆G en δG.
[ ∆G = 4 ]
[ δG = 2 ]

e) Is dit een planaire graaf? ( JA ) / NEE
Indien ja, herteken de planaire graaf zodat dit duidelijk is.

[Afbeelding: De hertekende versie van graaf G waarin geen bogen elkaar snijden, getekend in het roze.]

--- PAGE 10 ---
10

2
Teken de graaf G waarvoor geldt:
• knopen: P, Q, R, S, T
• bogen: PQ, PS, QS, QR, RS, RT

a) Bepaal de orde en grootte van deze graaf.
[ orde n = 5 ]
[ grootte m = 6 ]

b) Bepaal de graad van elke knoop.
[ deg(P) = 2 ]
[ deg(Q) = 3 ]
[ deg(R) = 3 ]
[ deg(S) = 3 ]
[ deg(T) = 1 ]

c) Bepaal ∆(G) en δ(G).
[ ∆(G) = 3 ]
[ δ(G) = 1 ]

[Afbeelding: De uitgetekende graaf met knopen P, Q, R, S, T.]

3
Teken de planaire graaf G waarvoor geldt:
• buren van K: L, P
• buren van L: K, M, N, P
• buren van M: L, N
• buren van N: L, M, O, P
• buren van O: N, P
• buren van P: K, L, N, O

[Afbeelding: Een planaire graaf met de knopen K, L, M, N, O, P correct met elkaar verbonden zonder snijdende lijnen.]

4
Een graaf bestaat uit 8 knopen en 17 bogen zodat elke knoop graad 4 of 5 heeft. 
Hoeveel knopen hebben graad 5?

[ Elke knoop heeft 4 bogen. ]
[ Berekening: (8 · 4) : 2 = 16 ]
[ Je hebt al 16 bogen. ]
[ Er blijft 1 boog over om 2 knopen te verbinden. ]
[ Antwoord: Er hebben 2 knopen graad 5. ]

--- PAGE 11 ---
11

5
Vijf jongens (Adrian, Bram, Cedric, Daan en Evert) zijn op sociale media onderling met elkaar via zes linken verbonden.
• Adrian is slechts met twee vrienden verbonden.
• Bram is op Daan na, met iedereen verbonden.
• Cedric heeft met iedereen een link, behalve met Evert.

a) Stel deze sociale medialinken grafisch voor d.m.v. een graaf.
[Afbeelding: Een graaf met knopen A, B, C, D, E en bogen AB, AC, BC, BD, CD, AE.]

b) Met wie is Daan allemaal verbonden?
[ Daan is verbonden met Cedric en Evert. ]

6
Gegeven zijn grafen G1, G2 en G3.

[Afbeelding: graaf G1 met knopen A, B, C, D, E, F]
[Afbeelding: graaf G2 met knopen A, B, C, D, E, F]
[Afbeelding: graaf G3 met knopen A, B, C, D, E, F]

a) Welke grafen zijn gelijk?
[ G1 en G2 ]

b) Verklaar jouw antwoord.
[ Uit knoop D vertrekken slechts 2 bogen en uit knoop E vertrekken 3 bogen. ]

--- PAGE 12 ---
12

# 2 Wandelingen in een graaf

## 2.1 Wandelingen en paden

definitie
Een **wandeling** tussen twee knopen X en Y van een graaf is een opeenvolging van bogen die beginnen in X en eindigen in Y.

Op een gegeven graaf G duiden we 4 verschillende wandelingen aan.

Wandeling 1: een wandeling van A naar C
W1 = (AB – BD – DC)
[Afbeelding: Graaf met het pad A->B->D->C gemarkeerd in het blauw.]

Wandeling 2: een wandeling van A naar A
W2 = (AB – BD – DC – CB – BE – EA)
[Afbeelding: Graaf met het gesloten pad A->B->D->C->B->E->A gemarkeerd in het geel.]

Wandeling 3: een wandeling van A naar D
W3 = (AE – EB – BD)
[Afbeelding: Graaf met het pad A->E->B->D gemarkeerd in het rood.]

Wandeling 4: een wandeling van A naar A
W4 = (AB – BC – CD – DE – EA)
[Afbeelding: Graaf met de buitenste cyclus A->B->C->D->E->A gemarkeerd in het groen.]

Wanneer de wandeling begint en eindigt in dezelfde knoop, spreken we van een **gesloten wandeling**, in het andere geval wordt de wandeling een **open wandeling** genoemd.
➔ W1 en W3 zijn open wandelingen.
➔ W2 en W4 zijn gesloten wandelingen.

Een graaf is **samenhangend** als er tussen elke twee knopen van een graaf een wandeling bestaat. De gegeven graaf G is samenhangend. Hiernaast vind je een voorbeeld van een graaf die niet samenhangend of **onsamenhangend** is.
[Afbeelding: Een niet-samenhangende graaf, bestaande uit twee gescheiden componenten (een driehoek en een lijnstuk).]

Een **pad** tussen twee knopen X en Y is een wandeling waarbij elke knoop hoogstens één keer voorkomt (behalve eventueel begin- en eindpunt).
➔ W1, W3 en W4 zijn drie paden.

Een gesloten pad wordt een **cykel** genoemd.
➔ W4 is een cykel.

definitie
Een **gesloten wandeling** in een graaf G begint en eindigt in dezelfde knoop.
Een **pad** in een graaf G is een wandeling waarbij elke knoop hoogstens één keer voorkomt.
Een **cykel** in een graaf G is een gesloten pad.

--- PAGE 13 ---
13

Een **spoor** tussen twee knopen X en Y is een wandeling waarbij elke boog hoogstens één keer voorkomt.
➔ W1, W2, W3 en W4 zijn vier sporen.

Een gesloten spoor wordt een **circuit** genoemd.
➔ W2 en W4 zijn circuits.

definitie
Een **spoor** in een graaf G is een wandeling waarbij elke boog hoogstens één keer voorkomt.
Een **circuit** in een graaf G is een gesloten spoor.

**Merk op**
Op jouw smartphone of tablet zijn er heel wat apps die je kunt installeren die achterliggend gebruik maken van deze begrippen en principes.

Vaak is het doel om alle punten (knopen) te verbinden met elkaar in één vloeiende beweging zonder dat je twee keer gebruik maakt van dezelfde boog.

[Afbeelding: Twee schermen van een smartphone game-app (Level 1, Stage 1 en Level 4, Stage 2) waarbij punten met lijnen verbonden worden in een gesloten spoor.]

--- PAGE 14 ---
14

## 2.2 De zeven bruggen van Königsberg

De stad Koningsbergen (het huidige Kaliningrad) ligt aan de oevers van en op twee eilanden in de rivier de Pregel. De oevers en de eilanden waren in Eulers tijd verbonden door zeven bruggen. De Koningsbergers waren gewend ’s zondags een lange wandeling door de stad te maken. Euler vroeg zich af of hij een wandeling zou kunnen ontwerpen, waarbij elk van de bruggen juist eenmaal gepasseerd zou worden.

[Afbeelding: Schematische kaart van de Pregel rivier met de oevers A en D en de eilanden B en C. Tussen de landmassa's liggen 7 bruggen.]

Schematisch kunnen we dit weergeven via volgende graaf waarbij de bogen de bruggen voorstellen.

[Afbeelding: Een multigraaf met 4 knopen (A, B, C, D). A en B zijn door 2 bogen verbonden. B en D door 2 bogen. A en C door 1 boog. B en C door 1 boog. C en D door 1 boog.]

We stellen ons nu de vraag : “Is het mogelijk een spoor te vinden die elke boog bevat?”

Als een wandeling een knoop passeert en je wil verder met je wandeling via een andere boog, dan heeft deze knoop altijd een even graad. Het antwoord is dus neen omdat er vier knopen zijn met een oneven graad.

De wandeling zou wel mogelijk geweest zijn mochten er slechts twee knopen van oneven graad zijn. Als de brug tussen de twee eilanden verwijderd wordt, kan de wandeling starten in punt A en eindigen in punt D (of omgekeerd).

De graaf hieronder geeft deze situatie weer.

[Afbeelding: Een aangepaste multigraaf met knopen A, B, C, D en een pijlgetekend spoor dat start bij knoop A en eindigt bij D, wat toont dat een eulerwandeling mogelijk is als er hoogstens twee oneven graden zijn.]

--- PAGE 15 ---
15

## 2.3 Eulertoeren

Een **eulerwandeling** in een graaf G is een **spoor** dat elke boog van G bevat.

Een **eulertoer** in een graaf G is een **circuit** dat elke boog van G bevat. Een graaf die een eulertoer bevat noemen we een **eulergraaf**.

[Afbeelding: Een graaf (pentagon-achtig met binnenlijnen) met pijlen die een eulertoer aangeven W = (AB – BC – CD – DB – BA – AD – DE – EA).]

W = (AB – BC – CD – DB – BA – AD – DE – EA) is een eulertoer.

definitie
Een **eulertoer** in een graaf G is een circuit dat elke boog van G bevat.

Men kan aantonen dat een graaf een eulertoer bevat als en slechts als de graad van elke knoop even is.

## 2.4 Hamiltoncykels

Een **hamiltoncykel** in een graaf G is een cykel dat elke knoop van G bevat.
Een graaf die een hamiltoncykel bevat noemen we een **hamiltongraaf**.

[Afbeelding: Dezelfde structuur graaf met pijlen die nu een hamiltoncykel benadrukken W = (AB – BC – CD – DE – EA) wat de buitenrand is.]

W = (AB – BC – CD – DE – EA) is een hamiltoncykel.

definitie
Een **hamiltoncykel** in een graaf G is een cykel die elke knoop van G bevat.

--- PAGE 16 ---
16

# Verwerkingsopdrachten 3, 4

7
Welke van volgende wandelingen zijn paden, welke zijn sporen, welke zijn cykels en welke zijn circuits?

[Afbeelding: Graaf met 7 knopen A, B, C, D, E, F, G en hun bogen.]

a) W1 = (AB – BD – DC – CE): [ pad, spoor ]
b) W2 = (AB – BD – DA – AG – GF): [ spoor ]
c) W3 = (AB – BC – CD – DG – GA): [ cykel, circuit ]
d) W4 = (AB – BC – CD – DB – BC – CE): [ gewone wandeling ]
e) W5 = (AG – GF – FE – ED – DA): [ cykel, circuit ]
f) W6 = (AB – BD – DC – CE – ED – DC – CB – BA): [ gewone wandeling ]

8
Zoek een eulertoer in de volgende graaf.

[Afbeelding: Een complexe planaire-achtige graaf met 9 knopen A t/m I en hun verbindingsbogen.]

[ bv. W = (AI – IC – CA – AE – EC – CH – HE – EG – GB – BH – HG – GD – DE – EF – FA) ]

--- PAGE 17 ---
17

9
Zoek een hamiltoncykel in de volgende graaf.

[Afbeelding: Een graaf met knopen A t/m J en kruisende bogen.]

[ bv. W = (AD – DE – EF – FB – BG – GI – IC – CH – HJ – JA) ]

--- PAGE 18 ---
18

# 3 Minimaal opspannende bomen

## 3.1 Probleemstelling

Men wil zes plaatsen met elkaar verbinden via een netwerk. Dat kunnen rioleringswerken, telecomkabels of andere nutsvoorzieningen zijn.
De mogelijke verbindingen tussen de verschillende plaatsen kan men voorstellen met behulp van een graaf waarbij men naast elke boog de kosten van de verbinding plaatst.
Zo’n graaf noemen we een **gewogen graaf**. De getallen naast de bogen noemen we de **gewichten** van de bogen.

[Afbeelding: Graaf met knopen A, B, C, D, E, F en gewogen bogen. En een foto van straatwerken/buizen in de grond.]

definitie
Een **boom** is een graaf die alle knopen met elkaar verbindt en geen cykels bevat.

Hieronder vind je een boom die een mogelijke oplossing geeft om de zes plaatsen met elkaar te verbinden.

Met deze boom kan je berekenen wat de kostprijs is als je de verbindingswerken op die manier vastlegt:
14 + 8 + 11 + 9 + 6 = 48
Deze oplossing is niet de (economisch) beste oplossing.

[Afbeelding: Een boom als subgraaf uit het origineel.]

Om het probleem op te lossen, moeten we dus op zoek gaan naar de boom met het kleinste totale gewicht. Zo’n boom noemen we een **minimaal opspannende boom**.

Er bestaan algoritmes om die minimaal opspannende boom te bepalen. We bestuderen er twee: het algoritme van Prim en het algoritme van Kruskal.

--- PAGE 19 ---
19

## 3.2 Het algoritme van Prim

Hoe pas je het algoritme van Prim toe?

methode
STAP 1: Kies een willekeurige knoop. Kies bijvoorbeeld A. Neem vanuit A de boog met het kleinste gewicht, de kleinste getalwaarde. Dat is de boog AF.
STAP 2: Neem vanuit de knopen A en F de boog met het kleinste gewicht. Dat is de boog FD.
STAP 3: Neem vanuit knoop A, F en D de boog met het kleinste gewicht verschillend van de reeds aanwezige bogen en zodanig dat de boog met de reeds gekozen bogen geen cykel vormt.
We hebben de keuze: boog DC of boog DE. We kiezen bv. boog DC.
STAP 4: Neem vanuit knoop A, F, D en C de boog met het kleinste gewicht verschillend van de reeds aanwezige bogen en zodanig dat de boog met de reeds gekozen bogen geen cykel vormt.
Dat is boog DE.
STAP 5: Neem vanuit knoop A, F, D, C en E de boog met het kleinste gewicht verschillend van de reeds aanwezige bogen en zodanig dat de boog met de reeds gekozen bogen geen cykel vormt. Dat is boog EB.
**Hiermee hebben we de minimaal opspannende boom gecreëerd.**

[Afbeelding: 5 sub-afbeeldingen tonen STAP 1 tot en met STAP 5 van het algoritme van Prim.]

Je kan de kostprijs bepalen als de verbindingen gelegd zijn volgens deze minimaal opspannende boom:
10 + 5 + 6 + 8 + 6 = 35

Je stelt vast dat deze kostprijs (35) lager is dan de kostprijs bij de vorige oplossing (48). De gevonden kostprijs is de minimale kostprijs.

[ POLPO ] Bekijk de instructievideo die stap voor stap het algoritme uitlegt aan de hand van een concreet voorbeeld.

--- PAGE 20 ---
20

## 3.3 Het algoritme van Kruskal

Hoe pas je het algoritme van Kruskal toe?

methode
STAP 1: Kies de boog met het kleinste gewicht. Hier is dat de boog DF.
STAP 2: Kies de boog op DF na met kleinste gewicht en voeg deze toe. We kunnen kiezen: DE of DC. We kiezen bv. DE.
STAP 3: Kies een volgende boog met de kleinste waarde op DF en DE na, maar wel zodanig dat er geen cykels ontstaan. Dat is de boog DC.
STAP 4: Ga volgens hetzelfde principe verder. De volgende boog is EB.
STAP 5: Als laatste boog volgt nu de boog FA. Je hebt de minimaal opspannende boom gecreëerd.

[Afbeelding: 5 sub-afbeeldingen tonen STAP 1 tot en met STAP 5 van het algoritme van Kruskal.]

Ook met dit algoritme vind je de minimaal opspannende boom.

[ POLPO ] Bekijk de instructievideo die stap voor stap het algoritme uitlegt aan de hand van een concreet voorbeeld.

--- PAGE 21 ---
21

# Verwerkingsopdrachten 5, 6

10
In onderstaande graaf maken we de wandeling W = (AB – BC – CE – ED – DH – HF – FB – BD – DH – HG).
Bepaal het gewicht van deze wandeling.

[Afbeelding: Gewogen graaf met 8 knopen A t/m H en veel bogen.]

[ Gewicht van W = 8 + 7 + 6 + 9 + 10 + 10 + 12 + 6 + 10 + 8 = 86. ]

11
Maak gebruik van het algoritme van Prim om de minimaal opspannende boom in volgende graaf te bepalen.
Bepaal ook zijn gewicht.

[Afbeelding: Gewogen graaf met knopen A, B, C, D, E, F.]

[ bv. ]
[ • starten vanuit A: boog AB ]
[ • vanuit A en B: boog BC ]
[ • vervolgens: CF, FD, FE ]
[ De minimaal opspannende boom heeft een totaal gewicht van 55. ]

--- PAGE 22 ---
22

12
Maak gebruik van het algoritme van Kruskal om de minimaal opspannende boom in volgende graaf te bepalen. Bepaal ook zijn gewicht.

[Afbeelding: Gewogen graaf met 8 knopen A t/m H.]

[ • boog met het kleinste gewicht: AC ]
[ • boog op AC na met kleinste gewicht: AB ]
[ • volgende boog (geen cykel): BD ]
[ • vervolgens: CF, AG, BH, CE ]
[ De minimaal opspannende boom heeft een totaal gewicht van 54. ]

--- PAGE 23 ---
23

# 4 Kortste paden

## 4.1 Probleemstelling

Een vrachtwagenchauffeur vertrekt vanuit stad A en moet zo snel mogelijk naar stad I. Hij bekijkt de mogelijke reisroutes met naast elk traject (de bogen van de graaf) de tijd die hij nodig heeft om dat traject af te leggen.
De chauffeur moet nu op zoek naar het kortste pad van A naar I.

[Afbeelding: Een gewogen graaf van A tot I naast een afbeelding van een vrachtwagen op de snelweg.]

Het **gewicht van een boog** AB is de getalwaarde die naast de boog staat.
Notatie: g(AB)
In deze graaf is g(AB) = 10.
Bestaat de boog niet, dan is het gewicht oneindig.
In deze graaf is g(AF) = ∞

De lengte van een pad met gegeven beginpunt A en eindpunt I is de som van de gewichten van de doorlopen bogen.
Notatie: l(AI)

**Voorbeeld**
Om ons van A naar I te begeven, volgen we het pad W:
W = (AB - BF - FI)
l(W) = g(AB) + g(BF) + g(FI) = 10 + 8 + 17 = 35

De lengte van dit pad is een bovengrens voor de mogelijke kortste route tussen het begin- en het eindpunt van de wandeling.
l(AI) = 35

[Afbeelding: Dezelfde graaf waarbij het pad A-B-F-I gemarkeerd is in het rood.]

--- PAGE 24 ---
24

**Merk op**
Zolang er nog geen pad bestaat, stelt men de bovengrens op oneindig.
l(AH) = ∞

Je vond nu een pad W met lengte 35. Dit is nu de bovengrens.
Bestaat er nog een ander pad met een kortere lengte?
Het algoritme van Dijkstra helpt je om hier naar op zoek te gaan. De bovengrens, de lengte van het kortste pad, stelt men voor door d(AI).

## 4.2 Het algoritme van Dijkstra

Hoe pas je het algoritme van Dijkstra toe?

methode
STAP 1: Geef de beginknoop (= huidige knoop) voorlopig een afstand 0 (l(AA) = 0) en alle andere knopen afstand ∞.
Deze knopen noemen we de niet-bezochte knopen.
STAP 2: Bekijk alle buurknopen van de huidige knoop. Elke buurknoop heeft twee afstanden:
a) de voorlopige afstand die er bij staat (= g(AX)) en
b) de voorlopige afstand van de huidige knoop + de lengte van de boog vanaf de huidige knoop naar deze buurknoop (= l(AX)).
Kies de kortste afstand. Dat wordt de nieuwe voorlopige afstand van deze knoop.
STAP 3: Als je alle buurknopen hebt gehad, wordt de huidige knoop een bezochte knoop. Kies als nieuwe huidige knoop de knoop met de kleinste voorlopige afstand (d(AX)).
Herhaal stap 2 en 3 tot je alle knopen hebt bezocht.
STAP 4: Je vindt het pad door in de tabel terug te redeneren. Vertrek bij het eindpunt. Telkens er zich een verandering van waarde in de kolom voordoet, ga je naar het punt dat deze verandering tot stand bracht en voeg je dit aan het pad toe. Uiteindelijk kom je bij het beginpunt terecht.

[ POLPO ] Bekijk de instructievideo die stap voor stap het algoritme uitlegt aan de hand van een concreet voorbeeld. Download de PDF die jou de volledige uitwerking toont.

Na het uitvoeren van het algoritme verkrijg je het kortste pad. Het kortste pad is W = (AC – CG – GH – HI) met een totaal gewicht van 33.
d(AI) = 33

[Afbeelding: Een ingevulde Dijkstra graaf waarbij de getallen bij de knopen de kortste afstand weergeven (A=0, C=12, G=17, H=24, I=33). Het kortste pad is rood gekleurd.]

--- PAGE 25 ---
25

# Verwerkingsopdrachten 7, 8

13
Bepaal in onderstaand netwerk de kortste route van A naar G.

[Afbeelding: Gewogen graaf van A tot G.]

| | A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|---|
| l(AX) | [ 0 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 9 ] | [ 15 ] | [ 7 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 9 ] | [ 13 ] | | [ ∞ ] | [ 31 ] | [ 42 ] |
| | | | [ 13 ] | | [ 23 ] | [ 31 ] | [ 42 ] |
| | | | | | [ 23 ] | [ 29 ] | [ 42 ] |
| | | | | | | [ 29 ] | [ 41 ] |
| | | | | | | | [ 40 ] |

kortste pad: [ W = (AD - DC - CF - FG) ]
totaal gewicht: [ 40 ]

--- PAGE 26 ---
26

14
Bepaal in onderstaand netwerk de kortste route van A naar K.

[Afbeelding: Gewogen graaf van knoop A naar K.]

| | A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|---|
| l(AX) | [ 0 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 8 ] | [ 14 ] | [ 11 ] | [ 14 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | [ 14 ] | [ 11 ] | [ 14 ] | [ 30 ] | [ 28 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | [ 14 ] | | [ 14 ] | [ 30 ] | [ 28 ] | [ 27 ] | [ 21 ] | [ ∞ ] | [ ∞ ] |
| | | | | | [ 14 ] | [ 30 ] | [ 22 ] | [ 19 ] | [ 21 ] | [ ∞ ] | [ ∞ ] |
| | | | | | | [ 30 ] | [ 22 ] | [ 19 ] | [ 21 ] | [ 26 ] | [ ∞ ] |
| | | | | | | [ 30 ] | [ 22 ] | | [ 21 ] | [ 26 ] | [ 30 ] |
| | | | | | | [ 30 ] | [ 22 ] | | | [ 26 ] | [ 30 ] |
| | | | | | | [ 29 ] | | | | [ 26 ] | [ 30 ] |
| | | | | | | [ 29 ] | | | | | [ 30 ] |
| | | | | | | | | | | | [ 30 ] |

kortste pad: [ W = (AC - CH - HK) ]
totaal gewicht: [ 30 ]

--- PAGE 27 ---
27

# 5 Het handelsreizigersprobleem

## 5.1 Probleemstelling

Een pakjesdienst gevestigd in Hasselt moet pakjes leveren in Aarschot, Beringen, Geel, Leuven, Mechelen en Turnhout.
De onderlinge afstanden (in km langs de weg) vind je in onderstaand schema.

| | HASSELT | AARSCHOT | BERINGEN | GEEL | LEUVEN | MECHELEN | TURNHOUT |
|---|---|---|---|---|---|---|---|
| HASSELT | - | 46 | 22 | 44 | 56 | 84 | 62 |
| AARSCHOT | 46 | - | 36 | 28 | 19 | 31 | 46 |
| BERINGEN | 22 | 36 | - | 30 | 50 | 74 | 49 |
| GEEL | 44 | 28 | 30 | - | 46 | 63 | 21 |
| LEUVEN | 56 | 19 | 50 | 46 | - | 28 | 96 |
| MECHELEN | 84 | 31 | 74 | 63 | 28 | - | 59 |
| TURNHOUT | 62 | 46 | 49 | 21 | 96 | 59 | - |

We willen de optimale route voor de chauffeur berekenen.

[Afbeelding: Kaart van België met daarin de genoemde steden.]
schaal 1:540000

Het handelsreizigersprobleem is een complex probleem.
Er bestaat nog geen algoritme dat de kortste route voor de chauffeur kan bepalen. Er bestaan wel enkele algoritmes die een “goede aanvaardbare” oplossing opleveren.

[Afbeelding: Pakjesbezorger wagen]

--- PAGE 28 ---
28

## 5.2 Het beste-buur-algoritme

Hoe pas je het beste-buur-algoritme toe?

methode
Ga naar de dichtstbijzijnde stad (knoop) die je nog niet bezocht hebt. Als alle steden zijn bezocht, ga dan vanuit deze stad terug naar het beginpunt.

starten in Hasselt

van Hasselt naar Beringen: d(HB) = 22
van Beringen naar Geel: d(BG) = 30
van Geel naar Turnhout: d(GT) = 21
van Turnhout naar Aarschot: d(TA) = 46
van Aarschot naar Leuven: d(AL) = 19
van Leuven naar Mechelen: d(LM) = 28
van Mechelen terug naar Hasselt: d(MH) = 84

route W = (HB – BG – GT – TA – AL – LM – MH)

afstand l(W) = 250 km

[Afbeelding: De stedenkaart, nu met rode pijlen die het berekende circuit tonen, startend in Hasselt.]
schaal 1:540000

--- PAGE 29 ---
29

**Merk op**

Is dit de kortste route? Neen, maar wel een route die aanvaardbaar kort genoeg is. De kortste route is

W = (HB – BG – GT – TM – ML – LA – AH).

l(W) = 225 km

[Afbeelding: De stedenkaart, nu met de werkelijk kortste route aangeduid (Hasselt, Beringen, Geel, Turnhout, Mechelen, Leuven, Aarschot, Hasselt).]
schaal 1:540000

--- PAGE 30 ---
30

# Verwerkingsopdrachten 9, 10

15
Een handelsreiziger moet onderstaande steden bezoeken. Wat is een mogelijke kortste route? Starten en eindigen doe je in A, de getallen naast de bogen stellen het aantal kilometers tussen de steden voor.

[Afbeelding: Een volledig verbonden graaf met knopen A, B, C, D, E, F en talrijke bogen met gewichten.]

[ starten in A ]
[ d(AB) = 34 ]
[ d(BF) = 47 ]
[ d(FC) = 43 ]
[ d(CD) = 66 ]
[ d(DE) = 52 ]
[ d(EA) = 49 ]

[ route W = (AB – BF – FC – CD – DE – EA) ]

[ afstand l(W) = 291 km ]

--- PAGE 31 ---
31

16
Deze zomer gaan we op fietsvakantie naar Noord-Nederland. We starten en eindigen in Veendam en zijn van plan om een fietstocht te maken langs de steden Assen, Drachten, Emmen, Groningen, Hoogeveen, Leeuwarden en Meppel.

Stippel een mogelijke optimale route uit.

| | VEENDAM | ASSEN | DRACHTEN | EMMEN | GRONINGEN | HOOGEVEEN | LEEUWARDEN | MEPPEL |
|---|---|---|---|---|---|---|---|---|
| VEENDAM | - | 37 | 68 | 48 | 33 | 63 | 93 | 76 |
| ASSEN | 37 | - | 43 | 42 | 33 | 34 | 68 | 47 |
| DRACHTEN | 68 | 43 | - | 72 | 39 | 62 | 28 | 62 |
| EMMEN | 48 | 42 | 72 | - | 60 | 36 | 97 | 57 |
| GRONINGEN | 33 | 33 | 39 | 60 | - | 63 | 60 | 74 |
| HOOGEVEEN | 63 | 34 | 62 | 36 | 63 | - | 87 | 26 |
| LEEUWARDEN | 93 | 68 | 28 | 97 | 60 | 87 | - | 69 |
| MEPPEL | 76 | 47 | 62 | 57 | 74 | 26 | 69 | - |

[Afbeelding: Kaart van Noord-Nederland met de steden en een rode route getekend. Schaal 1:720000]

[ starten in V ]
[ d(VG) = 33 ]
[ d(GA) = 33 ]
[ d(AH) = 34 ]
[ d(HM) = 26 ]
[ d(ME) = 57 ]
[ d(ED) = 72 ]
[ d(DL) = 28 ]
[ d(LV) = 93 ]

[ route W = (VG – GA – AH – HM – ME – ED – DL – LV) ]
[ afstand l(W) = 376 km ]

--- PAGE 32 ---
32

# 6 Graafkleuring

## 6.1 Biotopen

Jorre houdt van reptielen. Hij heeft er een achttal als huisdier. Gekko’s, anolissen of iguana’s zet je echter niet zomaar in dezelfde (nagemaakte) biotoop.

Jorre heeft een lijstje gemaakt van welk reptiel niet met een ander reptiel kan samenleven.

| REPTIEL | MAG NIET SAMEN MET |
|---|---|
| A | D, G, H |
| B | C, G |
| C | B, E, F, G, H |
| D | A, E, G, H |
| E | C, D, F |
| F | C, E |
| G | A, B, C, D |
| H | A, C, D |

Wat is het kleinst aantal biotopen dat Jorre in elkaar moet knutselen opdat zijn reptielen vreedzaam zouden kunnen overleven?

[Afbeelding: Een foto van een groen/blauw gekleurde kameleon.]

Om het probleem van Jorre te kunnen oplossen, stellen we de lijst eerst grafisch voor d.m.v. een graaf. Reptielen die door een boog verbonden zijn, mogen niet samen zitten in eenzelfde biotoop.

[Afbeelding: Een graaf met knopen A tot H waarbij de bogen de conflicten tussen de reptielen aanduiden.]

## 6.2 Algoritme

Het kleuren van een graaf is het toekennen van kleuren aan de knopen van de graaf zodat elke knoop een kleur heeft, verschillend van zijn buren.

Hoe kleur je een graaf?

methode
STAP 1: Bepaal de graad van elke knoop uit de graaf.
STAP 2: Verwijder de knoop met de hoogste graad (want die kleuren we het laatste in) en verwijder ook alle bogen uit deze knoop. Zijn er twee knopen met dezelfde graad, dan mag je kiezen.
STAP 3: Bepaal opnieuw de graad van elke knoop. Herhaal stap 2 en 3 tot je elke knoop hebt verwijderd.
STAP 4: Bepaal de volgorde om de knopen in te kleuren. Start met de knoop die het langste in de graaf bleef en ga verder tot je de knoop hebt die je het eerst hebt aangeduid (deze met de hoogste graad).
STAP 5: Kleur de graaf. Start met 1 kleur en ga het rijtje af. Als de volgende knoop in het rijtje een buurknoop is van een knoop die met dat kleur werd ingekleurd, neem je een ander kleur.

--- PAGE 33 ---
33

**Voorbeeld**
We bekijken de graaf die we maakten om het probleem van Jorre op te lossen.

• **STAP 1: We bepalen de graad van elke knoop uit de graaf.**
deg(A) = 3   deg(B) = 2   deg(C) = 5   deg(D) = 4
deg(E) = 3   deg(F) = 2   deg(G) = 4   deg(H) = 3

[Afbeelding: De originele ongemodificeerde graaf (met knoop C centraal) ]

• **STAP 2 en STAP 3: De knoop met de hoogste graad is C.**
We verwijderen nu C en alle bogen vanuit C uit de graaf, en bepalen opnieuw de graad van elke knoop.

deg(A) = 3   deg(B) = 1   deg(D) = 4   deg(E) = 2
deg(F) = 1   deg(G) = 3   deg(H) = 2

De voorlaatste knoop die we gaan kleuren, is D. We verwijderen D uit de graaf en bepalen opnieuw de graad van elke knoop.

deg(A) = 2   deg(B) = 1   deg(E) = 1
deg(F) = 1   deg(G) = 2   deg(H) = 1

Zo gaan we verder. Dit kan je ook in een tabel weergeven:

| | start | verwijder knoop C | verwijder knoop D | verwijder knoop A | verwijder knoop B | verwijder knoop E |
|---|---|---|---|---|---|---|
| deg(A) | 3 | 3 | 2 | - | - | - |
| deg(B) | 2 | 1 | 1 | 1 | - | - |
| deg(C) | [ 5 ] | - | - | - | - | - |
| deg(D) | 4 | [ 4 ] | - | - | - | - |
| deg(E) | 3 | 2 | 1 | 1 | [ 1 ] | - |
| deg(F) | 2 | 1 | 1 | 1 | 1 | 0 |
| deg(G) | 4 | 3 | 2 | [ 1 ] | 0 | 0 |
| deg(H) | 3 | 2 | 1 | 0 | 0 | 0 |

• **STAP 4: We krijgen het rijtje:** H – G – F – E – B – A – D – C

• **STAP 5: Graafkleuring:**

[Afbeelding: De ingekleurde graaf: H is rood, G is rood, F is rood. E is groen, B is groen, A is groen. D is blauw. C is geel. (kleuren vertegenwoordigd door tinten)]

• Knoop H krijgt kleur 1, bv. rood.
• Knoop G is geen buur van H en kan dus ook in het rood.
• Knoop F is geen buur van H of G en kan dus ook in het rood.
• Knoop E is een buur van F en krijgt kleur 2, bv. groen.
• Knoop B is een buur van G maar niet van E en kan ook in het groen.
• Knoop A is een buur van G en H, maar niet van E of B en kan ook in het groen.
• Knoop D is een buur van A en G en kan niet in kleur 1 of kleur 2 en krijgt dus kleur 3, bv. blauw.
• Knoop C is een buur van F en B, maar niet van D en kan ook in het blauw.

• Besluit: De graaf werd ingekleurd met 4 verschillende kleuren. Het kleinste aantal biotopen dat Jorre moet voorzien is 4.

--- PAGE 34 ---
34

## 6.3 Zendmasten

In een dorp staan zeven zendmasten, elk met een bereik zoals aangegeven op onderstaand schema. Zendmasten die elkaar overlappen, moeten op een andere frequentie werken om storing te vermijden. We willen het minimaal aantal frequenties bepalen dat nodig is om deze zendmasten te laten werken op voorwaarde dat ze onderling géén storingen veroorzaken.

[Afbeelding: 7 cirkels (zendbereik) met masten A, B, C, D, E, F, G erin getekend die elkaar in een bepaald patroon overlappen.]

We stellen de zendmasten voor als knopen en verbinden ze met een boog als ze elkaar overlappen.

[Afbeelding: Een graaf waarin de zendmasten via bogen met elkaar verbonden zijn.]

**graafkleuring**

| | start | verwijder knoop D | verwijder knoop C | verwijder knoop E | verwijder knoop A |
|---|---|---|---|---|---|
| deg(A) | 2 | 1 | 1 | 1 | - |
| deg(B) | 3 | 2 | 1 | 1 | 0 |
| deg(C) | 4 | [ 3 ] | - | - | - |
| deg(D) | [ 5 ] | - | - | - | - |
| deg(E) | 4 | 3 | [ 2 ] | - | - |
| deg(F) | 2 | 2 | 1 | 0 | 0 |
| deg(G) | 2 | 1 | 1 | 0 | 0 |

volgorde inkleuren: B – F – G – A – E – C – D

[Afbeelding: Graafkleuring iteratie. (knopen krijgen kleuren in bepaalde stappen)]

Besluit: We moeten minstens 4 frequenties voorzien.

**Merk op**
Als we kleuren volgens het algoritme, hebben we 4 kleuren nodig. Nochtans is deze graaf kleurbaar met slechts 3 kleuren. Als we starten bij D (rood), kunnen we F ook in het rood kleuren. A, C en G worden groen en B en E kleuren we blauw in. Op die manier hebben we slechts 3 kleuren gebruikt.

[Afbeelding: Illustratie van een "5G" zendmast naast de geoptimaliseerde graaf met 3 kleuren.]

--- PAGE 35 ---
35

## 6.4 Een planningsprobleem

De 18 springers en pagadders van de jeugdbeweging hebben dit weekend keuzeactiviteiten. Elk lid mag twee activiteiten kiezen uit zes keuzes. De keuzes zijn als volgt gemaakt.

| KEUZE A | KEUZE B | KEUZE C | KEUZE D | KEUZE E | KEUZE F |
|---|---|---|---|---|---|
| Olivia | Olivia | Lucas | Mila | Emma | Noah |
| Mila | Lucas | Nolan | Nolan | Otis | Floor |
| Emma | Floor | Otis | Liam | Liam | Noor |
| Noah | Finn | Lewis | Lewis | Noor | Arthur |
| Arthur | Daan | Daan | Jules | Liv | Finn |
| Jules | Julie | Julie | Sofia | Sofia | Liv |

Hoe moet de leiding de keuzeactiviteiten organiseren zodat iedereen zijn keuze kan volgen?

We stellen de activiteiten voor door knopen en verbinden ze met een boog als een deelnemer beide activiteiten wil volgen.

[Afbeelding: Een graaf met knopen A, B, C, D, E, F en bogen op basis van de gedeelde keuzes.]

**graafkleuring**

| | start | verwijder knoop A | verwijder knoop C | verwijder knoop E | verwijder knoop B |
|---|---|---|---|---|---|
| deg(A) | [ 4 ] | - | - | - | - |
| deg(B) | 3 | 2 | 1 | [ 1 ] | - |
| deg(C) | 3 | [ 3 ] | - | - | - |
| deg(D) | 3 | 2 | 1 | 0 | 0 |
| deg(E) | 4 | 3 | [ 2 ] | - | - |
| deg(F) | 3 | 2 | 2 | 1 | 0 |

volgorde inkleuren: D – F – B – E – C – A

[Afbeelding: De ingekleurde graaf met drie kleuren. D en F (blauw), B en E (groen), A en C (cyaan).]

De leiding kan de activiteiten als volgt organiseren:
• tijdstip 1: activiteiten D en F
• tijdstip 2: activiteiten B en E
• tijdstip 3: activiteiten C en A

--- PAGE 36 ---
36

## 6.5 Landkaarten en figuren inkleuren

Kleur volgende figuur (of landkaart) in met zo weinig mogelijk kleuren zodat aaneengrenzende vakjes (of landen) een verschillend kleur hebben.
Aaneengrenzende vakjes (landen) zijn vakjes die een lijn (grens) gemeen hebben. Vakjes die elkaar in een punt raken, zijn niet aaneengrenzend.

[Afbeelding: Een blanco diagram bestaande uit verschillende rechthoekige vlakken verdeeld over de ruimte.]

Stel de vakjes voor als knopen. Hebben ze een grens gemeen, verbind ze door een boog.

[Afbeelding: Op de figuur zijn knopen A t/m J getekend. Twee opeenvolgende figuren tonen de opbouw van de graaf met bogen en daarna de geïsoleerde graaf zónder de achterliggende vlakken.]

**graafkleuring**

| | start | verwijder knoop E | verwijder knoop F | verwijder knoop I | verwijder knoop A | verwijder knoop G | verwijder knoop B | verwijder knoop H |
|---|---|---|---|---|---|---|---|---|
| deg(A) | 3 | 2 | 2 | 2 | - | - | - | - |
| deg(B) | 4 | 3 | 2 | 2 | 1 | [ 1 ] | - | - |
| deg(C) | 3 | 2 | 1 | 1 | 1 | 1 | 0 | 0 |
| deg(D) | 3 | 2 | 2 | 2 | 1 | 0 | 0 | 0 |
| deg(E) | [ 7 ] | - | - | - | - | - | - | - |
| deg(F) | 5 | [ 4 ] | - | - | - | - | - | - |
| deg(G) | 4 | 3 | 3 | 2 | [ 2 ] | - | - | - |
| deg(H) | 5 | 4 | 3 | 2 | 2 | 1 | [ 1 ] | - |
| deg(I) | 3 | 3 | [ 3 ] | - | - | - | - | - |
| deg(J) | 3 | 3 | 2 | 1 | 1 | 1 | 1 | 0 |

volgorde inkleuren : C - D - J - H - B - G - A - I - F - E

[Afbeelding: Dezelfde blokken-figuur, ingekleurd met 4 kleuren (rood, groen, geel, blauw) zodat grenzende vlakken een verschillende kleur hebben.]

**Merk op**
Men vermoedt dat elke landkaart gekleurd kan worden met slechts vier kleuren. Deze eigenschap die men niet wiskundig sluitend kan bewijzen, noemt men het **vierkleurenprobleem**.

--- PAGE 37 ---
37

# Verwerkingsopdrachten 11, 12

17
In een dierenpark wil men zoveel mogelijk dieren samenbrengen zodat de loopruimte voor elk dier groter wordt. Na overleg heeft men een schema gemaakt van welke dieren zeker niet samen mogen zitten.

| DIER | MAG NIET SAMEN MET |
|---|---|
| A | C, E |
| B | C, D, E |
| C | A, B, G |
| D | B, E, F |
| E | A, B, D, G |
| F | D, G |
| G | C, E, F |

[Afbeelding: Een panoramische fotocompositie van verschillende wilde dieren bij elkaar.]

In hoeveel ruimtes kan men deze dieren minimaal plaatsen?

[Afbeelding: Graaf met knopen A tot en met G en de verbindingsbogen die incompatibiliteit aanduiden.]

Graafkleuring:

| | start | verwijder knoop E | verwijder knoop C | verwijder knoop D | verwijder knoop F |
|---|---|---|---|---|---|
| deg(A) | 2 | 1 | 0 | 0 | 0 |
| deg(B) | 3 | 2 | 1 | 0 | 0 |
| deg(C) | 3 | [ 3 ] | - | - | - |
| deg(D) | 3 | 3 | [ 3 ] | - | - |
| deg(E) | [ 4 ] | - | - | - | - |
| deg(F) | 2 | 2 | 2 | [ 1 ] | - |
| deg(G) | 3 | 2 | 1 | 1 | 0 |

[ volgorde inkleuren: G – B – A – F – D – C – E ]

[ Antwoord: Men kan deze dieren in minimum 3 ruimtes plaatsen. ]

--- PAGE 38 ---
38

18
Kleur de volgende figuur met zo weinig mogelijk kleuren in zodat aaneengrenzende vakjes een verschillend kleur hebben. Vakjes die elkaar in een punt raken, zijn niet aangrenzend.

[Afbeelding: Een diagram van blokken/vakjes gelabeld A tot en met J. Deze figuur toont tevens in magenta de resulterende graaf over de blokken heen geprojecteerd, ingekleurd met 4 kleuren (rood, groen, geel, blauw).]

Graafkleuring:

| | start | verwijder knoop D | verwijder knoop B | verwijder knoop E | verwijder knoop I | verwijder knoop G | verwijder knoop A | verwijder knoop H |
|---|---|---|---|---|---|---|---|---|
| deg(A) | 2 | 2 | 1 | 1 | 1 | 1 | - | - |
| deg(B) | 3 | [ 3 ] | - | - | - | - | - | - |
| deg(C) | 4 | 3 | 2 | 1 | 1 | 1 | 0 | 0 |
| deg(D) | [ 5 ] | - | - | - | - | - | - | - |
| deg(E) | 4 | 3 | [ 3 ] | - | - | - | - | - |
| deg(F) | 4 | 3 | 3 | 2 | 1 | 0 | 0 | 0 |
| deg(G) | 3 | 3 | 3 | 2 | [ 2 ] | - | - | - |
| deg(H) | 3 | 3 | 3 | 3 | 2 | 1 | [ 1 ] | - |
| deg(I) | 4 | 3 | 3 | [ 3 ] | - | - | - | - |
| deg(J) | 4 | 3 | 2 | 2 | 1 | 1 | 1 | 0 |

[ volgorde inkleuren: J – H – F – C – A – G – I – E – B – D ]

--- PAGE 39 ---
39

# Signaaloefeningen

1
Gegeven is de graaf G.
[Afbeelding: Een graaf met zes knopen A, B, C, D, E, F die een ruimtelijk patroon vormen met een centrale X-overkruising.]

a) Geef de knopen en bogen door opsomming.
[ knopen: A, B, C, D, E, F ]
[ bogen: AB, AE, AF, BC, BD, BF, CD, CE, DE, EF ]

b) Bepaal de orde en grootte van deze graaf.
[ orde n: 6 ]
[ grootte m: 10 ]

c) Bepaal de graad van elke knoop.
[ deg(A) = 3 ] [ deg(D) = 3 ]
[ deg(B) = 4 ] [ deg(E) = 4 ]
[ deg(C) = 3 ] [ deg(F) = 3 ]

d) Is dit een planaire graaf, m.a.w. kan je deze graaf hertekenen zodat geen twee bogen elkaar snijden? Zo ja, bewijs d.m.v. een tekening.

[ Ja. ]
[Afbeelding: De graaf G opnieuw getekend in het roze waarbij er geen snijdende lijnen meer aanwezig zijn.]

>>> Verder oefenen: D1 t.e.m. D11

--- PAGE 40 ---
40

2
Zes vrienden (Ian, Jasper, Kobe, Luka, Milan en Noah) spraken gisterenavond af om nieuwtjes met elkaar uit te wisselen via sociale media. Iedereen had met exact drie vrienden contact.
• Ian had contact met Jasper, Kobe en Noah;
• Kobe had geen contact met Jasper;
• Milan had contact met Jasper, Luka en Noah.
Stel deze gegevens grafisch voor d.m.v. een graaf. Met wie had Luka contact?

[Afbeelding: Een magenta graaf met de knopen benoemd met beginletters: I, J, K, L, M, N verbonden.]

[ Antwoord: Luka had contact met Jasper, Kobe en Milan. ]

>>> Verder oefenen: D1 t.e.m. D11

3
Zoek een eulertoer in de volgende graaf.
[Afbeelding: Een graaf met knopen A tot en met J en vele bogen.]

[ bv. W = (AB – BD – DE – EB – BH – HC – CD – DF – FH – HG – GJ – JH – HI – IE – EA) ]

>>> Verder oefenen: D12 t.e.m. D19

--- PAGE 41 ---
41

4
Zoek een hamiltoncykel in de volgende graaf.
[Afbeelding: Een graaf met knopen A tot en met J en kruisende verbindingen.]

[ bv. W = (AH – HG – GB – BI – IJ – JE – EF – FC – CD – DA) ]

>>> Verder oefenen: D12 t.e.m. D19

5
Maak gebruik van het algoritme van Prim om de minimaal opspannende boom in de volgende graaf te bepalen. Bepaal ook zijn gewicht.

[Afbeelding: Gewogen graaf met knopen A, B, C, D, E, F, G.]

[ bv. ]
[ • starten uit A: boog AC ]
[ • vanuit A en C: boog AB ]
[ • vervolgens: bogen BD, DF, FG, GE ]

[ Totaal gewicht: 50 ]

>>> Verder oefenen: D20 t.e.m. D26

--- PAGE 42 ---
42

6
Maak gebruik van het algoritme van Kruskal om de minimaal opspannende boom in de volgende graaf te bepalen. Bepaal ook zijn gewicht.

[Afbeelding: Gewogen graaf met knopen A t/m H.]

[ • boog met het kleinste gewicht: BD ]
[ • boog op BD na met het kleinste gewicht: DE ]
[ • volgende boog (geen cykel): BC ]
[ • vervolgens: GH, EH, BA, HF ]
[ Totaal gewicht: 98 ]

>>> Verder oefenen: D20 t.e.m. D26

7
Bepaal in onderstaand netwerk de kortste route van A naar H.

[Afbeelding: Gewogen graaf met knopen A t/m H.]

| | A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|---|
| l(AX) | [ 0 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 16 ] | [ 17 ] | [ 32 ] | [ 21 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | [ 17 ] | [ 30 ] | [ 21 ] | [ 43 ] | [ ∞ ] | [ ∞ ] |
| | | | | | [ 30 ] | [ 21 ] | [ 43 ] | [ 37 ] | [ ∞ ] |
| | | | | | | [ 29 ] | | [ 43 ] | [ 36 ] | [ 58 ] |
| | | | | | | | | [ 38 ] | [ 36 ] | [ 58 ] |
| | | | | | | | | [ 38 ] | | [ 50 ] |
| | | | | | | | | | | [ 50 ] |

[ W = (AE – EG – GH) ]
[ l(W) = 50 ]

>>> Verder oefenen: D27 t.e.m. D31

--- PAGE 43 ---
43

8
Bepaal in onderstaand netwerk de kortste route van A naar J.

[Afbeelding: Gewogen graaf met knopen A t/m J.]

| | A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|---|
| l(AX) | [ 0 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 9 ] | [ 12 ] | [ 10 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | [ 12 ] | [ 10 ] | [ 23 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | [ 12 ] | | | [ 23 ] | [ 22 ] | [ 25 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | | | | [ 22 ] | [ 20 ] | [ 25 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | | | | [ 22 ] | | [ 25 ] | [ ∞ ] | [ 30 ] | [ ∞ ] |
| | | | | | | | | [ 25 ] | [ 30 ] | [ 29 ] | [ ∞ ] |
| | | | | | | | | | [ 30 ] | [ 29 ] | [ 44 ] |
| | | | | | | | | | [ 30 ] | | [ 40 ] |
| | | | | | | | | | | | [ 40 ] |

[ W = (AC – CE – EI – IJ) ]
[ l(W) = 40 ]

>>> Verder oefenen: D27 t.e.m. D31

--- PAGE 44 ---
44

9
Deze zomer plannen we een rondrit in de streek van Spa. Het vertrek- en eindpunt is Spa en we willen de steden Aywaille, Eupen, Malmedy, Stavelot, Theux, Trois-Ponts en Verviers bezoeken. Wat is een mogelijke optimale route?

| | SPA | AYWAILLE | EUPEN | MALMEDY | STAVELOT | THEUX | TROIS-PONTS | VERVIERS |
|---|---|---|---|---|---|---|---|---|
| SPA | - | 17 | 25 | 22 | 16 | 17 | 21 | 18 |
| AYWAILLE | 17 | - | 43 | 38 | 36 | 16 | 30 | 24 |
| EUPEN | 25 | 43 | - | 30 | 42 | 29 | 42 | 15 |
| MALMEDY | 22 | 38 | 30 | - | 8 | 30 | 14 | 31 |
| STAVELOT | 16 | 36 | 42 | 8 | - | 32 | 7 | 32 |
| THEUX | 17 | 16 | 29 | 30 | 32 | - | 34 | 9 |
| TROIS-PONTS | 21 | 30 | 42 | 14 | 7 | 34 | - | 37 |
| VERVIERS | 18 | 24 | 15 | 31 | 32 | 9 | 37 | - |

[Afbeelding: Een landkaart waarop in magenta een route getekend is langs al de genoemde steden.]
schaal: 1:500000

[ Spa – Aywaille – Theux – Verviers – ]
[ Eupen – Malmédy – Stavelot – Trois-Ponts – Spa ]
[ l(W) = 123 km ]

>>> Verder oefenen: D32 t.e.m. D36

10
Een handelsreiziger vertrekt uit stad A, moet vijf steden bezoeken en tenslotte weer huiswaarts keren naar A. Bepaal de kortst mogelijke route voor de handelsreiziger. De getallen naast de bogen stellen het aantal kilometer tussen de steden voor.

[Afbeelding: Volledig verbonden graaf met knopen A, B, C, D, E, F en hun gewichten.]

[ W = (AB – BF – FE – ED – DC – CA) ]
[ l(W) = 136 km ]

>>> Verder oefenen: D32 t.e.m. D36

--- PAGE 45 ---
45

11
In een dorp staan acht zendmasten, elk met een bereik zoals aangegeven op onderstaand schema. Zendmasten die elkaar overlappen moeten op een andere frequentie werken om storing te vermijden. Bepaal het minimaal aantal frequenties dat nodig is om deze zendmasten te laten werken op voorwaarde dat ze onderling géén storingen veroorzaken.

[Afbeelding: 8 Cirkels overlappend met middelpunten A t/m H.]

[Afbeelding: De equivalente abstracte graaf van de storingen, met bogen tussen knopen.]

| | start | verwijder knoop D | verwijder knoop E | verwijder knoop A | verwijder knoop C | verwijder knoop F |
|---|---|---|---|---|---|---|
| deg(A) | 3 | 2 | 2 | - | - | - |
| deg(B) | 3 | 2 | 2 | 1 | 0 | 0 |
| deg(C) | 4 | 3 | 2 | 2 | - | - |
| deg(D) | [ 6 ] | - | - | - | - | - |
| deg(E) | 5 | [ 4 ] | - | - | - | - |
| deg(F) | 4 | 3 | 2 | 2 | [ 1 ] | - |
| deg(G) | 2 | 2 | 1 | 1 | 1 | 0 |
| deg(H) | 3 | 2 | 1 | 0 | 0 | 0 |

[ volgorde inkleuren: B – G – H – F – C – A – E – D ]
[ Antwoord: Er zijn minimum 5 verschillende frequenties nodig om de zendmasten te laten werken zonder dat ze onderling storing veroorzaken. ]

>>> Verder oefenen: D37 t.e.m. D43

12
Kleur de volgende figuur met zo weinig mogelijk kleuren in zodat aaneengrenzende vakjes een verschillend kleur hebben.

[Afbeelding: Rechthoekige blokken-figuur, ingekleurd (cyan, rood, geel) en de bijhorende graaf (knopen A t/m H) er overheen getekend.]

| | start | verwijder knoop D | verwijder knoop B | verwijder knoop F | verwijder knoop G | verwijder knoop A |
|---|---|---|---|---|---|---|
| deg(A) | 2 | 2 | 1 | 1 | 1 | - |
| deg(B) | [ 4 ] | [ 3 ] | - | - | - | - |
| deg(C) | 3 | 2 | 1 | 1 | 0 | 0 |
| deg(D) | [ 5 ] | - | - | - | - | - |
| deg(E) | 4 | 3 | 2 | 1 | 1 | 0 |
| deg(F) | 4 | 3 | 3 | - | - | - |
| deg(G) | 4 | 3 | 3 | [ 2 ] | - | - |
| deg(H) | 2 | 2 | 2 | 1 | 0 | 0 |

[ volgorde inkleuren: C – E – H – A – G – F – B – D ]

>>> Verder oefenen: D37 t.e.m. D43

--- PAGE 46 ---
46

# Differentiatietraject

1
Gegeven is de graaf G.
a) Geef de knopen en bogen door opsomming.
b) Bepaal de orde en grootte van deze graaf.
c) Bepaal de graad van elke knoop.
d) Is dit een planaire graaf, m.a.w. kan je deze graaf hertekenen zodat geen twee bogen elkaar snijden?
Zo ja, toon aan met behulp van een tekening.

[Afbeelding: Een 3D-achtige abstracte graaf met knopen A, B, C, D, E, F, G, H.]

--- PAGE 47 ---
47

2
a) Teken de graaf G waarvoor geldt:
• knopen: P, Q, R, S, T, U
• bogen: PQ, PS, PT, PU, QU, RS, RU, ST, SU, TU
b) Bepaal de orde en grootte van deze graaf.
c) Bepaal de graad van elke knoop.
d) Bepaal ∆(G) en δ(G).

a)
[Afbeelding: De getekende graaf, roze lijnen. Knopen P, Q, R, S, T, U op hun plaats gezet als een ruimtelijk figuur.]

b)
[ orde n = 6 ]
[ grootte m = 10 ]

c)
[ deg(P) = 4, deg(Q) = 2, deg(R) = 2, deg(S) = 4, deg(T) = 3, deg(U) = 5 ]

d)
[ Δ(G) = 5 ]
[ δ(G) = 2 ]

--- PAGE 48 ---
48

3
a) Teken de graaf G waarvoor geldt:
• knopen: P, Q, R, S, T, U, V
• bogen: PT, PU, PV, QR, QS, QT, RS, RT, TU, UV
b) Bepaal de orde en grootte van deze graaf.
c) Bepaal de graad van elke knoop.
d) Bepaal ∆(G) en δ(G).

a)
[Afbeelding: De getekende graaf in het roze met knopen P, Q, R, S, T, U, V.]

b)
[ orde n = 7 ]
[ grootte m = 10 ]

c)
[ deg(P) = 3, deg(Q) = 3, deg(R) = 3, deg(S) = 2, deg(T) = 4, deg(U) = 3, deg(V) = 2 ]

d)
[ Δ(G) = 4 ]
[ δ(G) = 2 ]

4
Teken de planaire graaf G waarvoor geldt:
• buren van K: L, M, N
• buren van L: K, N, O
• buren van M: K, N, P
• buren van N: K, L, M, O, P, Q
• buren van O: L, N, Q
• buren van P: M, N, Q
• buren van Q: N, O, P

[Afbeelding: Een symmetrische planaire graaf (zeshoek-achtig met centraal punt N) getekend in het roze, met knopen K, L, M, N, O, P, Q.]

--- PAGE 49 ---
49

5
Teken een graaf G met orde 6 waarbij de graad van elke knoop gelijk is aan 4. Hoeveel bogen telt deze graaf?

[Afbeelding: Getekende reguliere graaf met zes knopen A, B, C, D, E, F die allen via 4 bogen verbonden zijn in het roze.]

[ Berekening: 6 ⋅ 4 / 2 = 12 ]
[ Deze graaf heeft 12 bogen. ]

6
Hoeveel bogen heeft een reguliere graaf met 12 knopen waarbij uit elke knoop 7 bogen vertrekken?

[ Berekening: 12 ⋅ 7 / 2 = 42 ]
[ Deze graaf heeft 42 bogen. ]

7
Een graaf bestaat uit 18 knopen en 21 bogen zodat elke knoop graad 2 of 3 heeft. Hoeveel knopen hebben graad 3?

[ Berekening: 18 ⋅ 2 / 2 = 18 ]
[ Elke knoop heeft 2 bogen, dat zijn 18 bogen. ]
[ Er blijven 3 bogen over om 6 knopen te verbinden. ]
[ Antwoord: Er hebben 6 knopen graad 3. ]

8
Een graaf bestaat uit 20 knopen en 34 bogen zodat elke knoop graad 3 of 5 heeft. Hoeveel knopen hebben graad 5?

[ Berekening: 20 ⋅ 3 / 2 = 30 ]
[ Elke knoop heeft 3 bogen, dat zijn 30 bogen. ]
[ Er blijven 4 bogen over om 4 knopen dubbel te verbinden. ]
[ Antwoord: Er hebben 4 knopen graad 5. ]

--- PAGE 50 ---
50

9
Zes meisjes (Anke, Britt, Charlotte, Dinah, Evy en Farah) stuurden elkaar in een sociale media app heel wat berichtjes heen en weer.
In totaal waren er negen onderlinge facebooklinken:
• Anke had met iedereen contact, behalve met Dinah.
• Dinah had met iedereen contact, behalve met Anke.
• Britt en Charlotte hadden enkel contact met Anke en Dinah.
Stel deze contacten grafisch voor d.m.v. een graaf.

[Afbeelding: Een ingetekende graaf (roze lijnen) met knopen A, B, C, D, E, F die de relaties weergeven.]

10
Zeven dorpen zijn via een spoornet met elkaar verbonden. Vanuit elk dorp vertrekken er drie of vier spoorlijnen. In totaal zijn er twaalf spoorlijnen:
• Dorp A is verbonden met de dorpen B, E en G.
• Dorp C is verbonden met de dorpen B, D en F.
• Dorp E is verbonden met de dorpen A, B en D.
• Dorp G is verbonden met de dorpen A, D en F.
Stel dit spoornet grafisch voor d.m.v. een graaf.

[Afbeelding: Een ingetekende planaire graaf (roze lijnen) met knopen A, B, C, D, E, F, G voor de spoorlijnen.]

--- PAGE 51 ---
51

11
Drie van de volgende vier grafen zijn gelijk. Welke?

a) [Afbeelding: Graaf a met knopen A t/m G]
b) [Afbeelding: Graaf b met knopen A t/m G]
c) [Afbeelding: Graaf c, onbenoemd (maar vergelijkbare topologie)]
d) [Afbeelding: Graaf d met knopen A t/m G]

[ a, b en d zijn gelijk. ]

12
Welke van volgende wandelingen zijn paden, welke zijn sporen, welke zijn cykels en welke zijn circuits?

[Afbeelding: Een rechthoekige graaf met kruisende diagonalen en knopen A, B, C, D, E, F.]

a) W1 = (BC – CD – DE – EF – FD – DB)
b) W2 = (EA – AB – BD – DE)
c) W3 = (FD – DC – CB – BD – DF)
d) W4 = (CF – FD – DE – EA – AB – BC)

[ a) circuit ]
[ b) cykel en circuit ]
[ c) gewone wandeling ]
[ d) cykel en circuit ]

--- PAGE 52 ---
52

13
Welke van volgende wandelingen zijn paden, welke zijn sporen, welke zijn cykels en welke zijn circuits?

[Afbeelding: Graaf met 8 knopen A, B, C, D, E, F, G, H.]

a) W1 = (AB – BC – CH – HD – DG)
b) W2 = (FH – HD – DB – BC – CH – HF)
c) W3 = (GD – DB – BC – CD – DH – HG)
d) W4 = (CE – EF – FH – HD – DB – BC)

[ a) pad en spoor ]
[ b) gewone wandeling ]
[ c) circuit ]
[ d) cykel en circuit ]

14
Zoek een eulertoer in de volgende graaf.

[Afbeelding: Graaf met 8 knopen A, B, C, D, E, F, G, H en kruisende bogen.]

[ bv. W = (AB – BE – ED – DB – BC – CG – GD – DH – HF – FE – EA) ]

--- PAGE 53 ---
53

15
Zoek een hamiltoncykel in de volgende graaf.

[Afbeelding: Graaf met knopen A, B, C, D, E, F, G, H.]

[ bv. W = (AB – BC – CG – GD – DH – HF – FE – EA) ]

16
Zoek een eulertoer in de volgende graaf.

[Afbeelding: Complexe graaf met knopen A, B, C, D, E, F, G, H, I, J.]

[ bv. W = (AE – EF – FH – HA – AF – FD – DB – BI – ID – DG – GC – CI – IJ – JC – CB – BE – ED – DA) ]

--- PAGE 54 ---
54

17
Zoek een hamiltoncykel in de volgende graaf.

[Afbeelding: Graaf met knopen A t/m N verbonden met talrijke bogen.]

[ bv. W = (AF – FB – BC – CK – KD – DN – NJ – JM – ML – LG – GI – IE – EH – HA) ]

--- PAGE 55 ---
55

18
a) Waarom is in deze graaf geen eulertoer mogelijk?
b) Hoeveel bogen moet men minimaal bijtekenen om van deze graaf een eulergraaf te maken?
c) Hoeveel bogen moet men minimaal schrappen om van deze graaf een eulergraaf te maken?

[Afbeelding: Graaf met knopen A t/m M]

[ a) De graad van B, D, E, G, L en M is oneven. ]
[ b) Om de graden even te maken, volstaan 3 extra bogen: bv. BL, EG en DM. ]
[ c) Om de graden even te maken, volstaat het om de bogen BE, ML en GD te schrappen, 3 bogen dus. ]

19
a) Is een hamiltoncykel mogelijk in deze graaf? Waarom niet?
b) Hoeveel bogen moet men minimaal bijtekenen om van deze graaf een hamiltongraaf te maken?

[Afbeelding: Zandloper-vormige graaf (twee deelgrafen verbonden via een centrale knoop L) met knopen A t/m O.]

[ a) Neen, om bv. de knopen B en K te bereiken, moet je tweemaal de knoop L passeren. ]
[ b) Drie bogen, bv. BO, CD en HI. We hebben dan de cykel W = (LK – KB – BO – ON – NC – CD – DF – FE – EM – MG – GH – HI – IA – AJ – JL). ]

--- PAGE 56 ---
56

20
In onderstaande graaf maken we de wandeling W = (AC – CB – BA – AF – FE – EC – CD – DG – GE – EF – FG – GA). 
Bepaal het gewicht van deze wandeling.

[Afbeelding: Graaf met gewogen bogen tussen knopen A, B, C, D, E, F, G.]

[ Gewicht van W = 10 + 5 + 13 + 8 + 5 + 6 + 8 + 12 + 9 + 5 + 11 + 14 = 106 ]

--- PAGE 57 ---
57

21
Maak gebruik van het algoritme van Prim om de minimaal opspannende boom in volgende graaf te bepalen. 
Bepaal ook zijn gewicht.

[Afbeelding: Graaf met knopen A, B, C, D, E, F en hun gewichten.]

[ bv. ]
[ • starten vanuit A: boog AB ]
[ • vanuit A en B: boog BC ]
[ • vervolgens: CE, ED, EF ]
[ Totaal gewicht: 69 ]

--- PAGE 58 ---
58

22
Maak gebruik van het algoritme van Kruskal om de minimaal opspannende boom in volgende graaf te bepalen. Bepaal ook zijn gewicht.

[Afbeelding: Gewogen graaf met knopen A, B, C, D, E, F.]

[ • boog met het kleinste gewicht: AD ]
[ • boog op AD na met het kleinste gewicht: DE ]
[ • volgende boog (geen cykel): AB ]
[ • vervolgens: DF, FC ]
[ Totaal gewicht: 39 ]

--- PAGE 59 ---
59

23
Maak gebruik van een algoritme om de minimaal opspannende boom in volgende graaf te bepalen. Bepaal ook zijn gewicht.

[Afbeelding: Gewogen graaf met knopen A t/m G.]

[ bogen CE, CD, DG, BC, AD, EF ]
[ Totaal gewicht: 87 ]

24
Maak gebruik van een algoritme om de minimaal opspannende boom in volgende graaf te bepalen. Bepaal ook zijn gewicht.

[Afbeelding: Gewogen graaf met knopen A t/m H.]

[ bogen CF, CD, AD, CE, FH, DG, BC ]
[ Totaal gewicht: 66 ]

--- PAGE 60 ---
60

25
Maak gebruik van een algoritme om de minimaal opspannende boom in volgende graaf te bepalen. Bepaal ook zijn gewicht.

[Afbeelding: Gewogen graaf met knopen A t/m J.]

[ bogen AC, FG, CD, DI, AF, GE, BC, IJ, HF ]
[ Totaal gewicht: 76 ]

26
Maak gebruik van een algoritme om de minimaal opspannende boom in volgende graaf te bepalen. Bepaal ook zijn gewicht.

[Afbeelding: Gewogen graaf met knopen A t/m L.]

[ bogen FI, JG, FD, IK, GH, AD, HL, BE, AB, JK, CE ]
[ Totaal gewicht: 236 ]

--- PAGE 61 ---
61

27
Bepaal in onderstaand netwerk de kortste route van A naar F.

[Afbeelding: Gewogen graaf A t/m F.]

| | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| l(AX) | [ 0 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 11 ] | [ 20 ] | [ 8 ] | [ 13 ] | [ ∞ ] |
| | | [ 11 ] | [ 20 ] | | [ 12 ] | [ 26 ] |
| | | | [ 20 ] | | [ 12 ] | [ 26 ] |
| | | | [ 19 ] | | | [ 26 ] |
| | | | | | | [ 25 ] |

[ W = (AD – DE – EC – CF) ]
[ l(W) = 25 ]

--- PAGE 62 ---
62

28
Bepaal in onderstaand netwerk de kortste route van A naar H.

[Afbeelding: Gewogen graaf A t/m H.]

| | A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|---|
| l(AX) | [ 0 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 17 ] | [ 21 ] | [ 20 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | [ 21 ] | [ 20 ] | [ 48 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | [ 21 ] | | [ 44 ] | [ ∞ ] | [ 39 ] | [ ∞ ] |
| | | | | | [ 44 ] | [ 46 ] | [ 38 ] | [ ∞ ] |
| | | | | | | [ 46 ] | [ 38 ] | [ 61 ] |
| | | | | | | [ 43 ] | | [ 61 ] |
| | | | | | | | | [ 60 ] |

[ W = (AC – CG – GF – FH) ]
[ l(W) = 60 ]

--- PAGE 63 ---
63

29
Bepaal in onderstaand netwerk de kortste route van A naar J.

[Afbeelding: Gewogen graaf A t/m J.]

| | A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|---|
| l(AX) | [ 0 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 24 ] | [ 31 ] | [ 27 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | [ 31 ] | [ 27 ] | [ ∞ ] | [ 68 ] | [ 60 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | [ 31 ] | | [ 66 ] | [ 68 ] | [ 60 ] | [ 57 ] | [ ∞ ] | [ ∞ ] |
| | | | | | [ 66 ] | [ 68 ] | [ 47 ] | [ 56 ] | [ ∞ ] | [ ∞ ] |
| | | | | | [ 66 ] | [ 65 ] | | [ 56 ] | [ ∞ ] | [ ∞ ] |
| | | | | | [ 66 ] | [ 65 ] | | | [ ∞ ] | [ 90 ] |
| | | | | | [ 66 ] | | | | [ 82 ] | [ 90 ] |
| | | | | | | | | | [ 82 ] | [ 90 ] |
| | | | | | | | | | | [ 90 ] |

[ W = (AC – CH – HJ) ]
[ l(W) = 90 ]

--- PAGE 64 ---
64

30
Bepaal in onderstaand netwerk de kortste route van A naar M.

[Afbeelding: Grote gewogen graaf van knoop A tot M.]

| | A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| l(AX) | [ 0 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 74 ] | [ 53 ] | [ 57 ] | [ 79 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 74 ] | | [ 57 ] | [ 79 ] | [ 98 ] | [ 100 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 74 ] | | | [ 79 ] | [ 98 ] | [ 100 ] | [ 101 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | | | [ 79 ] | [ 98 ] | [ 100 ] | [ 101 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | | | | [ 98 ] | [ 100 ] | [ 101 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | | | | | [ 100 ] | [ 101 ] | [ 170 ] | [ 138 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | | | | | | [ 101 ] | [ 170 ] | [ 138 ] | [ 148 ] | [ ∞ ] | [ ∞ ] |
| | | | | | | | | | [ 170 ] | [ 138 ] | [ 148 ] | [ 152 ] | [ ∞ ] |
| | | | | | | | | | [ 170 ] | | [ 148 ] | [ 152 ] | [ 205 ] |
| | | | | | | | | | [ 170 ] | | | [ 152 ] | [ 205 ] |
| | | | | | | | | | [ 170 ] | | | | [ 205 ] |
| | | | | | | | | | | | | | [ 205 ] |

[ W = (AC – CF – FJ – JM) ]
[ l(W) = 205 ]

--- PAGE 65 ---
65

31
Bepaal in onderstaand netwerk de kortste route van A naar P.

[Afbeelding: Zeer grote complexe gewogen graaf van A tot P.]

| | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| l(AX) | [ 0 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 36 ] | [ 30 ] | [ 39 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | [ 36 ] | | [ 39 ] | [ ∞ ] | [ 65 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | | [ 39 ] | [ 68 ] | [ 65 ] | [ ∞ ] | [ 99 ] | [ 96 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | | | [ 68 ] | [ 65 ] | [ 98 ] | [ 99 ] | [ 96 ] | [ ∞ ] | [ 108 ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] | [ ∞ ] |
| | | | | | [ 68 ] | | [ 98 ] | [ 99 ] | [ 96 ] | [ 110 ] | [ 108 ] | [ ∞ ] | [ ∞ ] | [ 120 ] | [ ∞ ] | [ ∞ ] |
| | | | | | | | [ 98 ] | [ 99 ] | [ 96 ] | [ 109 ] | [ 108 ] | [ ∞ ] | [ ∞ ] | [ 120 ] | [ ∞ ] | [ ∞ ] |
| | | | | | | | [ 98 ] | [ 99 ] | | [ 109 ] | [ 108 ] | [ 144 ] | [ 131 ] | [ 120 ] | [ ∞ ] | [ ∞ ] |
| | | | | | | | | [ 99 ] | | [ 109 ] | [ 108 ] | [ 144 ] | [ 131 ] | [ 120 ] | [ 171 ] | [ ∞ ] |
| | | | | | | | | | | [ 109 ] | [ 108 ] | [ 144 ] | [ 131 ] | [ 120 ] | [ 171 ] | [ ∞ ] |
| | | | | | | | | | | [ 109 ] | | [ 144 ] | [ 131 ] | [ 120 ] | [ 152 ] | [ ∞ ] |
| | | | | | | | | | | | | [ 144 ] | [ 131 ] | [ 120 ] | [ 152 ] | [ ∞ ] |
| | | | | | | | | | | | | [ 144 ] | [ 131 ] | | [ 152 ] | [ 190 ] |
| | | | | | | | | | | | | [ 144 ] | | | [ 152 ] | [ 190 ] |
| | | | | | | | | | | | | | | | [ 152 ] | [ 190 ] |
| | | | | | | | | | | | | | | | | [ 190 ] |

[ W = (AC – CF – FN – NP) ]
[ l(W) = 190 ]

--- PAGE 66 ---
66

32
Een pizzabezorger moet pizza’s leveren op vijf plaatsen.
Hij vertrekt vanuit de pizzeria (P) naar de vijf locaties en keert dan terug. Bepaal een optimale route voor de pizzabezorger. De cijfers naast de bogen stellen de tijdseenheden voor die hij nodig heeft om zich van de ene plaats naar de andere te begeven.

[Afbeelding: Een foto van een pizzabezorger op een scooter in de avond.]

[ W = (PB – BE – EA – AC – CD – DP) ]
[ l(W) = 76 ]

| | P | A | B | C | D | E |
|---|---|---|---|---|---|---|
| P | - | 12 | 11 | 15 | 18 | 17 |
| A | 12 | - | 13 | 12 | 19 | 11 |
| B | 11 | 13 | - | 14 | 16 | 10 |
| C | 15 | 12 | 14 | - | 14 | 19 |
| D | 18 | 19 | 16 | 14 | - | 16 |
| E | 17 | 11 | 10 | 19 | 16 | - |

33
Een vervoersfirma vertrekt vanuit het centrale depot in Dinant en moet goederen ophalen in Durbuy, Houffalize, La Roche-en-Ardenne, Marche-en-Famenne en Rochefort.
De onderlinge afstanden (in km langs de weg) vind je in onderstaand schema.
Bereken een optimaal traject voor de chauffeur.

[Afbeelding: Landkaart met een roze route getekend langs Dinant, Rochefort, Marche-en-Famenne, Durbuy, La Roche, Houffalize.]
schaal 1:750000

| | Dinant | Durbuy | Houffalize | La Roche | Marche-en-Famenne | Rochefort |
|---|---|---|---|---|---|---|
| Dinant | - | 52 | 93 | 61 | 41 | 36 |
| Durbuy | 52 | - | 57 | 29 | 18 | 33 |
| Houffalize | 93 | 57 | - | 31 | 52 | 66 |
| La Roche | 61 | 29 | 31 | - | 21 | 38 |
| Marche-en-Famenne | 41 | 18 | 52 | 21 | - | 13 |
| Rochefort | 36 | 33 | 66 | 38 | 13 | - |

[ Dinant – Rochefort – Marche-en-Famenne – Durbuy – La Roche – Houffalize – Dinant ]
[ l(W) = 220 km ]

--- PAGE 67 ---
67

34
Een handelsreiziger moet onderstaande steden bezoeken. Wat is een mogelijke kortste route?
Vertrek- en eindpunt bevindt zich in A. De getallen naast de bogen stellen het aantal kilometer tussen de steden voor.

[Afbeelding: Volledig verbonden graaf (A t/m F) met wegingen.]

[ W = (AB – BC – CD – DF – FE – EA) ]
[ l(W) = 279 km ]

35
Om de kosten voor het zomerkamp wat te drukken, houdt de jeugdbeweging een wafelenbak.
Nolan moet met zijn fiets wafels leveren bij acht gezinnen in de buurt. De tijd tussen de adressen onderling (in minuten) vind je in volgende tabel. Hij start en eindigt in K.
Stippel een optimale route voor Nolan uit.

| | K | A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|---|---|
| K | - | 9 | 10 | 9 | 8 | 5 | 6 | 3 | 4 |
| A | 9 | - | 3 | 9 | 9 | 4 | 3 | 7 | 8 |
| B | 10 | 3 | - | 6 | 7 | 6 | 5 | 7 | 7 |
| C | 9 | 9 | 6 | - | 2 | 10 | 8 | 6 | 5 |
| D | 8 | 9 | 7 | 2 | - | 9 | 8 | 5 | 3 |
| E | 5 | 4 | 6 | 10 | 9 | - | 2 | 5 | 6 |
| F | 6 | 3 | 5 | 8 | 8 | 2 | - | 4 | 5 |
| G | 3 | 7 | 7 | 6 | 5 | 5 | 4 | - | 2 |
| H | 4 | 8 | 7 | 5 | 3 | 6 | 5 | 2 | - |

[ W = (KG – GH – HD – DC – CB – BA – AF – FE – EK) ]
[ l(W) = 29 min ]

--- PAGE 68 ---
68

36
Een handelsreiziger vertrekt uit stad A, moet zes steden bezoeken en tenslotte weer huiswaarts keren naar A. 
Bepaal de kortst mogelijke route voor de handelsreiziger.

[Afbeelding: Volledig verbonden graaf (A t/m G) met gewichten.]

[ W = (AC – CF – FG – GE – ED – DB – BA) ]
[ l(W) = 259 ]

37
Bepaal een zo optimaal mogelijke kleuring voor deze graaf.

[Afbeelding: Graaf met knopen A t/m G in de vorm van veelhoeken gecombineerd.]

| | start | verwijder knoop B | verwijder knoop A | verwijder knoop E | verwijder knoop F |
|---|---|---|---|---|---|
| deg(A) | 3 | 2 | - | - | - |
| deg(B) | [ 4 ] | - | - | - | - |
| deg(C) | 3 | 2 | 1 | 0 | 0 |
| deg(D) | 2 | 1 | 1 | 0 | 0 |
| deg(E) | 2 | 2 | 2 | - | - |
| deg(F) | 2 | 1 | 1 | 1 | - |
| deg(G) | 2 | 2 | 1 | 1 | 0 |

[ volgorde inkleuren: C – D – G – F – E – A – B ]

--- PAGE 69 ---
69

38
Bepaal een zo optimaal mogelijke kleuring voor deze graaf.

[Afbeelding: Een graaf met knopen A t/m J in een waaierachtige structuur.]

| | start | verwijder knoop A | verwijder knoop C | verwijder knoop B | verwijder knoop F | verwijder knoop H | verwijder knoop G |
|---|---|---|---|---|---|---|---|
| deg(A) | [ 6 ] | - | - | - | - | - | - |
| deg(B) | 4 | 3 | 2 | - | - | - | - |
| deg(C) | [ 5 ] | [ 4 ] | - | - | - | - | - |
| deg(D) | 3 | 2 | 1 | 0 | 0 | 0 | 0 |
| deg(E) | 2 | 1 | 1 | 1 | 1 | 0 | 0 |
| deg(F) | 3 | 2 | 2 | [ 2 ] | - | - | - |
| deg(G) | 3 | 3 | 2 | 1 | 1 | [ 1 ] | - |
| deg(H) | 2 | 2 | 2 | 2 | [ 2 ] | - | - |
| deg(I) | 2 | 2 | 2 | 2 | 1 | 1 | 0 |
| deg(J) | 2 | 1 | 1 | 1 | 0 | 0 | 0 |

[ volgorde inkleuren: D – E – I – J – G – H – F – B – C – A ]

--- PAGE 70 ---
70

39
In een educatief centrum over het zeeleven wil men in verschillende aquaria een aantal vissen en zeedieren tentoonstellen. Omdat niet alle waterdieren vreedzaam kunnen samenleven in eenzelfde aquarium, heeft men een lijst gemaakt van welke zeedieren zeker niet samen mogen zitten.

| ZEEDIER | MAG NIET SAMEN MET |
|---|---|
| A | B, F, G |
| B | A, C, D, F |
| C | B, F |
| D | B, E, H |
| E | D, F, G, H |
| F | A, B, C, E, G |
| G | A, E, F |
| H | D, E |

[Afbeelding: Panoramische foto van zeedieren (roggen, vissen) in een aquarium, en toeschouwers als silhouet.]

Wat is het kleinste aantal aquaria dat men moet voorzien?

We stellen de zeedieren en hun relatie voor m.b.v. een graaf. Zeedieren die niet vreedzaam kunnen samenleven, stellen we voor via een boog.

[Afbeelding: Getekende graaf met knopen A t/m H op basis van bovenstaande lijst.]

| | start | verwijder knoop F | verwijder knoop B | verwijder knoop E | verwijder knoop A | verwijder knoop D |
|---|---|---|---|---|---|---|
| deg(A) | 3 | 2 | 1 | [ 1 ] | - | - |
| deg(B) | 4 | [ 3 ] | - | - | - | - |
| deg(C) | 2 | 1 | 0 | 0 | 0 | 0 |
| deg(D) | 3 | 3 | 2 | 1 | [ 1 ] | - |
| deg(E) | 4 | 3 | [ 3 ] | - | - | - |
| deg(F) | [ 5 ] | - | - | - | - | - |
| deg(G) | 3 | 2 | 2 | 1 | 0 | 0 |
| deg(H) | 2 | 2 | 2 | 1 | 1 | 0 |

[ volgorde inkleuren: C – G – H – D – A – E – B – F ]

[ Antwoord: Men moet minstens 4 aquaria voorzien. ]

--- PAGE 71 ---
71

40
In een dorp staan acht zendmasten, elk met een bereik zoals aangegeven op onderstaand schema. 
Zendmasten die elkaar overlappen, moeten op een andere frequentie werken om storing te vermijden. Bepaal het minimaal aantal frequenties die nodig zijn om deze zendmasten te laten werken op voorwaarde dat ze onderling géén storingen veroorzaken.

[Afbeelding: Een patroon van cirkels die overlappen. De middelpunten (zendmasten) zijn genummerd A t/m H.]

De masten en hun onderlinge storing stellen we voor d.m.v. een graaf.

[Afbeelding: Graaf getekend over de cirkels met knopen A t/m H.]

| | start | verwijder knoop D | verwijder knoop A | verwijder knoop C | verwijder knoop E | verwijder knoop F |
|---|---|---|---|---|---|---|
| deg(A) | 2 | [ 2 ] | - | - | - | - |
| deg(B) | 2 | 2 | 1 | 0 | 0 | 0 |
| deg(C) | 3 | 2 | [ 2 ] | - | - | - |
| deg(D) | [ 4 ] | - | - | - | - | - |
| deg(E) | 2 | 1 | 1 | [ 1 ] | - | - |
| deg(F) | 3 | 2 | 2 | 1 | [ 1 ] | - |
| deg(G) | 2 | 1 | 1 | 1 | 1 | 0 |
| deg(H) | 2 | 2 | 1 | 1 | 0 | 0 |

[ volgorde inkleuren: B – G – H – F – E – C – A – D ]

[ Antwoord: Men moet minstens 4 zendmasten voorzien. ]

--- PAGE 72 ---
72

41
Bepaal een zo optimaal mogelijke kleuring voor volgende graaf.

[Afbeelding: Grote graaf met knopen A t/m J (als een rooster/bruggenstructuur).]

| | start | verwijder knoop B | verwijder knoop C | verwijder knoop E | verwijder knoop A | verwijder knoop F | verwijder knoop D | verwijder knoop G |
|---|---|---|---|---|---|---|---|---|
| deg(A) | 5 | 4 | 3 | 2 | - | - | - | - |
| deg(B) | [ 6 ] | - | - | - | - | - | - | - |
| deg(C) | [ 6 ] | [ 5 ] | - | - | - | - | - | - |
| deg(D) | 5 | 4 | 3 | 2 | 1 | [ 1 ] | - | - |
| deg(E) | [ 6 ] | 5 | [ 4 ] | - | - | - | - | - |
| deg(F) | 4 | 3 | 2 | 2 | [ 2 ] | - | - | - |
| deg(G) | 4 | 3 | 2 | 2 | 2 | 1 | [ 1 ] | - |
| deg(H) | 2 | 2 | 2 | 2 | 2 | 1 | 1 | 0 |
| deg(I) | 2 | 2 | 2 | 1 | 1 | 1 | 0 | 0 |
| deg(J) | 2 | 2 | 2 | 1 | 0 | 0 | 0 | 0 |

[ volgorde inkleuren: H – I – J – G – D – F – A – E – C – B ]

--- PAGE 73 ---
73

42
Een klas gaat op driedaagse naar Parijs. Om de kosten wat te drukken, mogen de 21 leerlingen elk drie musea kiezen die ze willen bezoeken. Op de andere momenten doen ze een stadswandeling. De keuzes zijn als volgt:

| KEUZE A | KEUZE B | KEUZE C | KEUZE D | KEUZE E | KEUZE F | KEUZE G |
|---|---|---|---|---|---|---|
| Lucas | Lucas | Levi | Lucas | Levi | Adrian | Julia |
| Julia | Julia | Finn | Finn | Tess | Sara | Tess |
| Noor | Levi | Zoë | Zoë | Finn | Noah | Zoë |
| Daan | Tess | Sara | Adrian | Sara | Bram | Adrian |
| Evi | Noor | Lotte | Noor | Noah | Olivia | Noah |
| Luuk | Daan | Milan | Daan | Lotte | Fleur | Evi |
| James | Luuk | Sam | Evi | Bram | Lars | Luuk |
| | James | | Lotte | Olivia | | Olivia |
| | Sam | | Bram | Milan | | Milan |
| | | | Fleur | Sam | | James |
| | | | Lars | Fleur | | Lars |

[Afbeelding: Een foto van de Eiffeltoren met de Parijse stadsachtergrond.]

Hoe plannen de begeleidende leerkrachten de museabezoeken het best als ze de activiteiten zoveel mogelijk willen laten samenvallen?

[Afbeelding: Ingevulde en ingekleurde graaf met knopen A t/m G die de overlappingen/conflicten weergeeft.]

| | start | verwijder knoop D | verwijder knoop G | verwijder knoop B | verwijder knoop C | verwijder knoop E |
|---|---|---|---|---|---|---|
| deg(A) | 3 | 2 | 1 | 0 | 0 | 0 |
| deg(B) | 5 | 4 | [ 3 ] | - | - | - |
| deg(C) | 5 | 4 | 3 | [ 2 ] | - | - |
| deg(D) | [ 6 ] | - | - | - | - | - |
| deg(E) | 5 | 4 | 3 | 2 | [ 1 ] | - |
| deg(F) | 4 | 3 | 2 | 2 | 1 | 0 |
| deg(G) | [ 6 ] | [ 5 ] | - | - | - | - |

[ volgorde inkleuren: A – F – E – C – B – G – D ]

[ Antwoord: Men moet minstens 6 tijdsblokken voorzien. ]

--- PAGE 74 ---
74

43
Kleur de onderstaande figuur in met zo weinig mogelijk kleuren, zodat aaneengrenzende vakjes een verschillende kleur hebben.

[Afbeelding: Grote complexe Tetris-achtige blokkenpuzzel, ingekleurd met vijf kleuren (rood, geel, groen, blauw, paars).]

[Afbeelding: Dezelfde puzzel maar omgezet naar een knopen/bogen-graaf (A t/m N).]

| | start | verwijder knoop I | verwijder knoop B | verwijder knoop G | verwijder knoop E | verwijder knoop J | verwijder knoop L | verwijder knoop H | verwijder knoop C | verwijder knoop M |
|---|---|---|---|---|---|---|---|---|---|---|
| deg(A) | 3 | 3 | 2 | 2 | 1 | 1 | 1 | 0 | 0 | 0 |
| deg(B) | 4 | [ 4 ] | - | - | - | - | - | - | - | - |
| deg(C) | 3 | 3 | 2 | 1 | 1 | 1 | 1 | 1 | - | - |
| deg(D) | 2 | 2 | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| deg(E) | 5 | 4 | 3 | [ 3 ] | - | - | - | - | - | - |
| deg(F) | 5 | 4 | 3 | 2 | 1 | 1 | 1 | 1 | 0 | 0 |
| deg(G) | 5 | 4 | [ 4 ] | - | - | - | - | - | - | - |
| deg(H) | 4 | 3 | 3 | 3 | 2 | 2 | [ 2 ] | - | - | - |
| deg(I) | [ 7 ] | - | - | - | - | - | - | - | - | - |
| deg(J) | 5 | 4 | 4 | 3 | [ 3 ] | - | - | - | - | - |
| deg(K) | 3 | 2 | 2 | 2 | 2 | 2 | 1 | 0 | 0 | 0 |
| deg(L) | 3 | 3 | 3 | 3 | 3 | [ 3 ] | - | - | - | - |
| deg(M) | 4 | 3 | 3 | 3 | 3 | 2 | 1 | 1 | [ 1 ] | - |
| deg(N) | 3 | 3 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | 0 |

[ volgorde inkleuren: A – D – F – K – N – M – C – H – L – J – E – G – B – I ]

--- PAGE 75 ---
Auteurs Philip Bogaert, Björn Carreyn en Roger Van Nieuwenhuyze
Derde editie - Bestelnummer 94 606 0119 (module 08 van 18)
ISBN 978 90 4864 973 0 - KB D/2024/0147/206 - NUR 126/128/129 - Thema YPMF
Illustrator Jona Jamart - Design en lay-out die Keure
Verantwoordelijke uitgever die Keure, Kleine Pathoekeweg 3, 8000 Brugge
RPR 0405 108 325 - © Copyright die Keure, Brugge
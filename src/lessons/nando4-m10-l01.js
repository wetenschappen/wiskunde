export default {
    id: 'nando4-m10-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 10 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M10L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 10'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm"></p></div></div>`,
        formulaHint: 'Raadpleeg het handboek voor de volledige theorie.'
    },
    timeline: {
        stepA: {
            step: 'A', title: 'Instap', time: '15 min',
            cards: [
                { id: 'card-entry', type: 'digital', title: 'Diagnostische Toets', description: 'Wat weet je al?', action: 'entry-ticket', icon: 'PhQuestion' },
                { id: 'card-pres-a', type: 'class', title: 'Inleidende Instructie', description: 'Korte theorie.', action: 'presentation', slidesKey: 'slidesA' }
            ]
        },
        stepB: {
            step: 'B', title: 'Verwerken', time: '30 min',
            cards: [
                { id: 'card-pres-b', type: 'class', title: 'Uitgebreide Theorie', description: 'Stap voor stap uitgewerkt.', action: 'presentation', slidesKey: 'slidesB' },
                { id: 'card-workbook', type: 'paper', title: 'Boek Oefeningen', description: 'Maak oefeningen in het handboek.', action: 'workbook', icon: 'PhBookOpen' },
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'quadraticEquations', icon: 'PhGameController' }
            ]
        },
        stepC: {
            step: 'C', title: 'Afsluiting', time: '5 min',
            cards: [
                { id: 'card-pres-c', type: 'class', title: 'Samenvatting', description: 'Kern van de les.', action: 'presentation', slidesKey: 'slidesC' },
                { id: 'card-exit', type: 'digital', title: 'Exit Ticket', description: 'Reflectie op de les.', action: 'exit-ticket', icon: 'PhTarget' }
            ]
        }
    },
    activities: {
        'quadraticEquations': {
            type: 'quadraticEquations',
            title: 'Vergelijkingen en Ongelijkheden'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 10', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Herleid de vergelijking $y = -2(x + 3)^2 + 10$ tot de algemene vergelijking $y = ax^2 + bx + c$.<br>$y = -2(x^2 + 6x + 9) + 10$<br>$y = -2x^2 - 12x - 18 + 10$<br>$y = -2x^2 - 12x - 8$<br>**TIP**<br>$x^2 + 2ax + a^2 = (x + a)^2$<br>$x^2 - 2ax + a^2 = (x - a)^2$<br>## Opdracht 2<br>De grafiek van de functie $h$ met voorschrift $h(t) = -8t \cdot (t - 2)$ geeft de hoogte van een bal weer in functie van de tijd.<br>a) Welke vergelijking moet je oplossen om te weten na hoeveel seconde...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Tweedegraadsvergelijkingen en -ongelijkheden', content: '**Inhoud**<br>*   Instap<br>*   1 Ontbinden in factoren<br>*   2 Vergelijkingen van de tweede graad<br>*   3 Problemen oplossen met tweedegraadsvergelijkingen<br>*   4 Ongelijkheden van de tweede graad<br>*   5 Snijpunten van een rechte en een parabool<br>*   Signaaloefeningen<br>*   Differentiatietraject<br>*   Computationeel denken<br>*   Studiewijzer<br>### WAT JE AL KUNT<br>- de definitie van een functie van de tweede graad verwoorden<br>- de grafische kenmerken van de parabool opsommen<br>- $y = a(x - p)^2 + q$ onderzoeken<br>### WAT JE LEERT IN DEZE MODULE<br>- de discriminant en de wortelformule voor het oplossen van tweedegraadsvergelijkingen berekenen<br>- veeltermen van de tweede graad ontbinden in factoren<br>- een ongelijkheid van de tweede graad oplossen<br>- snijpunten van een rechte en een parabool algebraïsch interpreteren<br>- problemen oplossen die aanleiding geven tot een (on)gelijkheid van de tweede graad<br>### IN DE KIJKER<br>Je legt het verband tussen de oplossin', icon: 'book-open' },
        { layout: 'standard', title: 'Ontbinden in factoren', content: 'Ontbinden in factoren is een techniek waarbij je een veelterm (een som van eentermen) schrijft als een product.<br>## 1.1 Gemeenschappelijke factor afzonderen<br>**distributiviteit**<br>$-2 \cdot (3x^2 + x - 5) \rightarrow -6x^2 - 2x + 10$<br>**ontbinden door gemeenschappelijke factor voorop te plaatsen**<br>$-6x^2 - 2x + 10 \rightarrow -2 \cdot (3x^2 + x - 5)$<br>**distributiviteit**<br>$4x^2 \cdot (3x - 1) \rightarrow 12x^3 - 4x^2$<br>**ontbinden door gemeenschappelijke factor voorop te plaatsen**<br>$12x^3 - 4x^2 \rightarrow 4x^2 \cdot (3x - 1)$<br>**Hoe plaats je een gemeenschappelijke factor voorop?**<br>| methode | STAP 1: | Voor de haakjes plaats je de factor die in elke term voorkomt: |<br>| :--- | :--- | :--- |<br>| | | - de coëfficiënt is de grootste gemene deler van de voorkomende coëfficiënten; |<br>| | | - de gemeenschappelijke letters in hun laagst voorkomende exponent. |<br>| | STAP 2: | Tussen de haakjes plaats je het quotiënt van de veelterm met de factor die voorop we', icon: 'book-open' },
        { layout: 'standard', title: 'Vergelijkingen van de tweede graad', content: '## 2.1 Definities<br>De nulwaarden van de functie f met voorschrift $f(x) = ax^2 + bx + c$ (waarbij $a \neq 0$) vinden we door de volgende vergelijking op te lossen:<br>$ax^2 + bx + c = 0$<br>We noemen dit een **tweedegraadsvergelijking** of een **vierkantsvergelijking**.<br>Het is een veeltermvergelijking waarbij de exponent van de hoogste macht in $x$ gelijk is aan 2.<br>Een oplossing van deze vergelijking is een reëel getal $x$ waarvoor de vergelijking klopt.<br>De oplossingen van een veeltermvergelijking noemt men ook de **wortels** van de vergelijking.<br>Als $b = 0$ en/of $c = 0$, dan spreekt men van een **onvolledige vierkantsvergelijking**. De wortels van zo\'n vergelijkingen kunnen op een zeer eenvoudige manier gevonden worden.<br>Als alle coëfficiënten $a$, $b$ en $c$ verschillend van 0 zijn, spreekt men van een **volledige vierkantsvergelijking**. Het is iets moeilijker om zo\'n vergelijking op te lossen, maar men kan altijd gebruik maken van het algoritme met de discriminan', icon: 'book-open' },
        { layout: 'standard', title: 'Problemen oplossen met tweedegraadsvergelijkingen', content: '**Voorbeeld 1**<br>De som van de kwadraten van twee opeenvolgende gehele getallen is 265. Welke zijn deze twee getallen?<br>**Oplossing**<br>*   Onbekenden: het eerste getal: $x$<br>het daaropvolgende getal: $x + 1$<br>*   Vergelijking:<br>$x^2 + (x + 1)^2 = 265$<br>$x^2 + x^2 + 2x + 1 - 265 = 0$<br>$2x^2 + 2x - 264 = 0$<br>$x^2 + x - 132 = 0$<br>$D = b^2 - 4 \cdot a \cdot c$<br>$= 1^2 - 4 \cdot 1 \cdot (-132)$<br>$= 1 + 528$<br>$= 529$<br>$x_1 = \frac{-b + \sqrt{D}}{2a}$<br>$= \frac{-1 + \sqrt{529}}{2 \cdot 1}$<br>$= \frac{-1 + 23}{2}$<br>$= \frac{22}{2}$<br>$= 11$<br>$x_2 = \frac{-b - \sqrt{D}}{2a}$<br>$= \frac{-1 - \sqrt{529}}{2 \cdot 1}$<br>$= \frac{-1 - 23}{2}$<br>$= \frac{-24}{2}$<br>$= -12$<br>*   Antwoord: De gezochte getallen zijn 11 en 12 of $-12$ en $-11$.<br>**Voorbeeld 2**<br>Een rechthoekig tuintje heeft een oppervlakte van 168 m². Bepaal de lengte en de breedte als je weet dat de lengte 2 m langer is dan de breedte.<br>**Oplossing**<br>*   Onbekenden: de lengte van de tu', icon: 'book-open' },
        { layout: 'standard', title: 'Ongelijkheden van de tweede graad', content: '## 4.1 Tekenschema van een tweedegraadsfunctie<br>| | a < 0 | a > 0 |<br>| :--- | :--- | :--- |<br>| **D < 0** | [Afbeelding: Grafiek van een bergparabool die volledig onder de x-as ligt.] <br> $x$ | $-\infty$ | $+\infty$ <br> $f(x)$ | $-$ | [Afbeelding: Grafiek van een dalparabool die volledig boven de x-as ligt.] <br> $x$ | $-\infty$ | $+\infty$ <br> $f(x)$ | $+$ |<br>| **D = 0** | [Afbeelding: Grafiek van een bergparabool die de x-as raakt in het punt $x_1=x_2=\frac{-b}{2a}$.] <br> $x$ | $-\infty$ | $\frac{-b}{2a}$ | $+\infty$ <br> $f(x)$ | $-$ | $0$ | $-$ | [Afbeelding: Grafiek van een dalparabool die de x-as raakt in het punt $x_1=x_2=\frac{-b}{2a}$.] <br> $x$ | $-\infty$ | $\frac{-b}{2a}$ | $+\infty$ <br> $f(x)$ | $+$ | $0$ | $+$ |<br>| **D > 0** | [Afbeelding: Grafiek van een bergparabool die de x-as snijdt in de punten $x_1$ en $x_2$.] <br> $x$ | $-\infty$ | $x_1$ | $x_2$ | $+\infty$ <br> $f(x)$ | $-$ | $0$ | $+$ | $0$ | $-$ | [Afbeelding: Grafiek van een dalparabool die de x-a', icon: 'book-open' },
        { layout: 'standard', title: 'Snijpunten van een rechte en een parabool', content: '## 5.1 Coördinaten van snijpunt(en) bepalen<br>We zoeken de gemeenschappelijke punten van de parabool p en de rechte r met als vergelijkingen<br>$p \leftrightarrow y = x^2 + 4x - 7$<br>$r \leftrightarrow y = 2x + 1$<br>De x- en y-coördinaten van de snijpunten zijn de oplossingen van het stelsel<br>$\begin{cases} y = x^2 + 4x - 7 \\ y = 2x + 1 \end{cases}$<br>[Afbeelding: Een grafiek toont de dalparabool $p \leftrightarrow y = x^2 + 4x - 7$ (rode curve) en de rechte $r \leftrightarrow y = 2x + 1$ (rode rechte). De snijpunten van de parabool en de rechte zijn gemarkeerd met rode stippen en aangeduid als $S_1$ en $S_2$. $S_1$ ligt bij (-4, -7) en $S_2$ bij (2, 5).]<br>In beide vergelijkingen kan men de onbekende $y$ in het linkerlid plaatsen. Stel de twee rechterleden aan elkaar gelijk.<br>$x^2 + 4x - 7 = 2x + 1$<br>$x^2 + 4x - 2x - 7 - 1 = 0$<br>$x^2 + 2x - 8 = 0$<br>Men bekomt een tweedegraadsvergelijking in de onbekende $x$. De oplossing(en) van deze vergelijking zijn de x-coördinaten ', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Ontbind in zoveel mogelijk factoren.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

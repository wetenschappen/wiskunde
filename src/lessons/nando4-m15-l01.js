export default {
    id: 'nando4-m15-l01',
    subject: 'math',
    className: '4de Jaar',
    title: 'Module 15 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M15L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '4-Wiskunde',
        textbook: 'Nando 4 Module 15'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">1, 2, 3, 4, 5<br>**1**<br>Gegeven: A(2, 7) en B(-3, 6)<br>Gevraagd:<br>a) Bepaal de coördinaat van de vector $\vec{AB}$.<br>b) Bereken $||\vec{AB}||$.<br>a) co($\vec{AB}$) = $(-5, -1)$<br>b) $||\vec{AB}|| = \sqrt{25 + 1} = \sqrt{26}$<br>**2**<br>Gegeven:<br>[Afbeelding: Assenstelsel met x-as 0 tot 9 en y-as 0 tot 5. Punten A(2, 2), B(6, 4) en C(8, 2) zijn getekend. Vector $\vec{u}$ gaat van A naar B. Vector $\vec{v}$ gaat van A naar C.]<br>Gevraagd: Bereken $\vec{u} \cdot \vec{v} = \vec{AB} \cdot \vec{AC}$<br>co($\vec{u}$) = $(4, 2)$<br>co($\vec{v}$) = $(6, 0)$<br>$\vec{u} \cdot \vec{v} = 4 \cdot 6 + 2 \cdot 0 = 24$<br>**3**<br>Gegeven: $\vec{u}$ met coördinaat $\vec{u}(-2, -1)$<br>$\vec{v}$ met coördinaat $\vec{v}(4, 4)$<br>Gevraagd: Bepaal de grootte van de hoek $\alpha$ tussen de vectoren $\vec{u}$ en $\vec{v}$.<br>$\cos \alpha = \frac{a_1 a_2 + b_1 b_2}{\sqrt{a_1^2 + b_1^2} \cdot \sqrt{a_2^2 + b_2^2}}$<br>$= \frac{-2 \cdot 4 + (-1 \cdot 4)}{\sqrt{(-2)^2 + (-1)^2} \cdot \sqrt{4^2 + 4^2}}$<br>$= \frac{-8 - 4}{\sqrt{5} \cdot \sqrt{32}}$<br>$= \frac{-12}{\sqrt{160}}$<br>$= \frac{-12}{4\sqrt{10}}$<br>$= \frac{-3}{\sqrt{10}}$<br>$\Rightarrow \alpha = 161^\circ 33\' 54\'\'$<br>**4**<br>Je kan de arbeid $W$ berekenen door het scalair product uit te rekenen van de krachtvector $\vec{F}$ met de verplaatsingsvector $\vec{d}$.<br>Een wagentje wordt horizontaal 100 m verplaatst met een constante kracht van 80 N terwijl het handvat een hoek maakt van $30^\circ$ met de horizontale. Hoe </p></div></div>`,
        formulaHint: 'Raadpleeg het handboek voor de volledige theorie.'
    },
    timeline: {
        stepA: {
            step: 'A', title: 'Diagnostisch & Instap', time: '15 min',
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'analyticGeometry', icon: 'PhGameController' }
            ]
        },
        stepC: {
            step: 'C', title: 'Samenvatting & Exit', time: '5 min',
            cards: [
                { id: 'card-pres-c', type: 'class', title: 'Samenvatting', description: 'Kern van de les.', action: 'presentation', slidesKey: 'slidesC' },
                { id: 'card-exit', type: 'digital', title: 'Exit Ticket', description: 'Reflectie op de les.', action: 'exit-ticket', icon: 'PhTarget' }
            ]
        }
    },
    activities: {
        'analyticGeometry': {
            type: 'analyticGeometry',
            title: 'Analytische Meetkunde'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 4 Module 15', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Gegeven: de punten A(2, 5), B(7, 7), C(3, 4) en D(6, 1)<br>Gevraagd: de coördinaat van de vector $2 \vec{u} + 3 \vec{v}$<br>Oplossing:<br>co($\vec{u}$) = co($\vec{AB}$) = (5, 2)<br>co($\vec{v}$) = co($\vec{CD}$) = (3, -3)<br>co($2\vec{u}$) = (10, 4)<br>co($3\vec{v}$) = (9, -9)<br>co($2\vec{u} + 3\vec{v}$) = (19, -5)<br>[Afbeelding: Een assenstelsel met x-as van 0 tot 8 en y-as van 0 tot 8. Punt A(2,5), B(7,7) met vector $\vec{u}$ van A naar B. Punt C(3,4), D(6,1) met vector $\ve...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Analytische meetkunde', content: '**Inhoud**<br>1 Scalair product of inproduct van twee vectoren<br>2 Loodrechte stand van rechten<br>3 Afstand van een punt tot een rechte<br>Signaaloefeningen<br>Differentiatietraject<br>Studiewijzer<br>### WAT JE AL KUNT<br>- de coördinaat van een willekeurige vector bepalen<br>- bewerkingen met coördinaten van een vector<br>- de vergelijking van een rechte opstellen waarvan één punt en de richtingscoëfficiënt gegeven zijn<br>- de vectoriële en parametervergelijking van een rechte opstellen<br>### WAT JE LEERT IN DEZE MODULE<br>- het inproduct of scalair product van twee vectoren bepalen<br>- de hoek tussen twee vectoren berekenen met behulp van het inproduct<br>- de hoek tussen twee rechten berekenen met behulp van het inproduct<br>- het verband tussen de richtingscoëfficiënten van twee loodrecht op elkaar staande rechten bepalen<br>- de vergelijking van de loodlijn uit een punt op een rechte opstellen<br>- de vergelijking van de middelloodlijn van een lijnstuk opstellen<br>- de afst', icon: 'book-open' },
        { layout: 'standard', title: 'Scalair product of inproduct van twee vectoren', content: '## 1.1 Norm van een vector<br>**definitie IN WOORDEN**<br>De norm van een vector $\vec{AB}$ is de grootte van de vector en wordt gelijkgesteld aan de lengte van het lijnstuk $[AB]$.<br>**IN SYMBOLEN**<br>$||\vec{AB}|| = |AB|$<br>**Voorbeeld**<br>Gegeven: de punten A(3, 2) en B(7, 5)<br>Gevraagd: de grootte (lengte) van de vector $\vec{v} = \vec{AB}$<br>De lengte van het lijnstuk $|AB|$ vinden we door in de rechthoekige driehoek ABC de stelling van Pythagoras toe te passen:<br>$|AB|^2 = |AC|^2 + |CB|^2$<br>$|AB| = \sqrt{|AC|^2 + |CB|^2}$<br>$|AB| = \sqrt{4^2 + 3^2}$<br>$|AB| = 5$<br>en dus is $||\vec{AB}|| = |AB| = 5$<br>[Afbeelding: Assenstelsel met punt A(3,2), B(7,5) en hulppunt C(7,2). De vector $\vec{v}$ gaat van A naar B. De rechthoekige driehoek ABC is getekend.]<br>**Algemeen**<br>Gegeven: A($x_1, y_1$) en B($x_2, y_2$)<br>Gevraagd: $||\vec{AB}||$<br>Oplossing:<br>$|AC| = |x_2 - x_1|$<br>$|CB| = |y_2 - y_1|$<br>$|AB| = \sqrt{|AC|^2 + |CB|^2} = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2', icon: 'book-open' },
        { layout: 'standard', title: 'Loodrechte stand van rechten', content: '## 2.1 Verband tussen de richtingscoëfficiënt en richtvector van een rechte<br>Gegeven is een rechte $r$ met vergelijking $y = ax + b$.<br>De richtingscoëfficiënt van de rechte $r$ is $a$.<br>De rechte $r\'$ evenwijdig met $r$, door de oorsprong:<br>$r\' \leftrightarrow y = ax$<br>Het punt A(1, a) ligt op $r\'$, met andere woorden de vector $\vec{A}(1, a)$ is een richtvector van $r\'$ en dus ook van $r$.<br>[Afbeelding: Assenstelsel. Een rechte $r$ is getekend. Een tweede rechte $r\'$ gaat door de oorsprong evenwijdig met $r$. Punt $A(1, a)$ is aangeduid op $r\'$.]<br>## 2.2 Hoek tussen twee snijdende rechten<br>Bepaal de grootte van de (kleinste) hoek tussen twee snijdende rechten $e$ en $f$.<br>$e \leftrightarrow y = a_1x + b_1$<br>$f \leftrightarrow y = a_2x + b_2$<br>De vector $\vec{E}(1, a_1)$ is een richtvector van $e$, en vector $\vec{F}(1, a_2)$ is een richtvector van $f$.<br>De hoek tussen de richtvectoren $\vec{E}$ en $\vec{F}$ wordt gegeven door de formule:<br>$\cos(\vec{E},', icon: 'book-open' },
        { layout: 'standard', title: 'Afstand van een punt tot een rechte', content: '## 3.1 Formule en bewijs<br>**formule**<br>De afstand van een punt P($x_0, y_0$) tot de rechte $k$ met algemene vergelijking $ux + vy + w = 0$ is gelijk aan<br>$d(P, k) = \frac{|ux_0 + vy_0 + w|}{\sqrt{u^2 + v^2}}$<br>We bewijzen de formule door volgende stappen uit te voeren:<br>- Stap 1: $d(P, k)$ is de kortste weg van P tot de rechte $k$, dit is de afstand van P tot het voetpunt van de loodlijn uit P op $k$: $d(P, k) = |PS|$<br>- Stap 2: Teken de loodlijn $l$ vanuit het punt P op de rechte $k$.<br>$a_k = -\frac{u}{v} \Rightarrow a_l = \frac{v}{u}$<br>Stel de parametervergelijking van de rechte $l$ op:<br>$(x, y) = (x_0, y_0) + t(u, v)$ met $t \in \mathbb{R}$<br>- Stap 3: Zoek de waarde van $t$ van het snijpunt S van de rechten $l$ en $k$.<br>$S(x_0 + tu, y_0 + tv)$ ligt op de rechte $k \leftrightarrow ux + vy + w = 0$.<br>$u(x_0 + tu) + v(y_0 + tv) + w = 0$<br>$ux_0 + tu^2 + vy_0 + tv^2 + w = 0$<br>$t(u^2 + v^2) + ux_0 + vy_0 + w = 0$<br>$t = \frac{-(ux_0 + vy_0 + w)}{u^2 + v^2}$<br', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Gegeven: $\vec{u}$ met coördinaat $\vec{u}(9, 4)$', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

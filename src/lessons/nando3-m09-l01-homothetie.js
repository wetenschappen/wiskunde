export default {
    id: 'nando3-m09-l01-homothetie',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 09 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M09L1',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 09'
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'similarity', icon: 'PhRuler' }
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
        'similarity': {
            type: 'similarity',
            title: 'Thales & Homothetie'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 09', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>De omtrek van een voetbal is maximaal 70 cm. De omtrek van een tennisbal is maximaal 22 cm. Bepaal de gelijkvormigheidsfactor.<br>De gelijkvormigheidsfactor k is 70 / 22 = 3,1818... .<br>## Opdracht 2<br>Op een zonnige zomerdag vraag je je tijdens een partijtje basketbal af hoe hoog de ring van de basketbalkorf is. Je kan de ring niet aanraken.<br>[Afbeelding: Een persoon en een basketbalkorf die een schaduw werpen. De zonnestralen vallen evenwijdig in. Bij de persoon wordt een ...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Transformaties in het vlak', content: '## 1.1 Isometrieën en congruente figuren<br>Je leerde in het tweede jaar al om grafisch het beeld te bepalen van een vlakke figuur …<br>• door te spiegelen om een as.<br>• door te verschuiven over een vector.<br>• door te roteren over een hoek.<br>• door te spiegelen om een punt.<br>Het beeld van een vlakke figuur door één van deze transformaties, of een samenstelling van meerdere van deze transformaties, was steeds een vlakke figuur die congruent is met de oorspronkelijke figuur.<br>definitie<br>Een isometrie is een transformatie die een vlakke figuur afbeeldt op een congruente vlakke figuur.<br>Voorbeelden<br>spiegelen om een as<br>[Afbeelding: Driehoek ABC gespiegeld om as a naar driehoek A\'B\'C\']<br>verschuiven volgens een vector<br>[Afbeelding: Driehoek ABC verschoven volgens vector FG naar driehoek A\'B\'C\']<br>roteren over een hoek<br>[Afbeelding: Driehoek ABC geroteerd om punt C naar driehoek A\'B\'C\']<br>spiegelen om een punt<br>[Afbeelding: Driehoek ABC gespiegeld om punt', icon: 'book-open' },
        { layout: 'standard', title: 'De stelling van Thales', content: '## 2.1 Rechthoekige driehoeken met even grote scherpe hoeken<br>stelling<br>Twee rechthoekige driehoeken met één paar even grote scherpe hoeken zijn gelijkvormig.<br>Beschouw de twee rechthoekige driehoeken ∆ABC en ∆DEF uit de instapopdracht 1.<br>Gegeven: ∆ABC is rechthoekig in Â<br>∆DEF is rechthoekig in D^<br>BC // EF<br>Te bewijzen: ∆ABC ∼ ∆DEF<br>Bewijs:<br>In ∆ABC en ∆DEF geldt:<br>Â = D^ = 90° (gegeven)<br>C^ = F^ (overeenkomstige hoeken bij twee evenwijdigen en een snijlijn)<br>⟹ (HH) ∆ABC ∼ ∆DEF<br>[Afbeelding: Twee rechthoekige driehoeken ABC en DEF met evenwijdige schuine zijden.]<br>Merk op<br>Verticale voorwerpen werpen een schaduw die evenredig is met de hoogte van dat voorwerp.<br>## 2.2 Driehoeken met een gemeenschappelijk hoekpunt en evenwijdige zijden<br>stelling<br>Een rechte evenwijdig met een zijde van een driehoek bepaalt met de twee andere zijden een driehoek die gelijkvormig is met de gegeven driehoek.<br>Een willekeurige ∆ABC wordt gesneden door de rechte DE en', icon: 'book-open' }
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: '1. a) Bepaal grafisch het beeld door de homothetie met centrum K en factor 2.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};

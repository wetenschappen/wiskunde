export default {
    id: 'nando3-m09-l02-thales',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 09 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M09L2',
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'similarity', icon: 'PhRuler' }
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
        'similarity': {
            type: 'similarity',
            title: 'Thales & Homothetie'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 09', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Bewijs van de stelling van Thales', content: 'Gegeven: AB // CD<br>|CD| / |AB| = k<br>pba ([AB]) = [EF]<br>pba ([CD]) = [GH]<br>Te bewijzen: |GH| / |EF| = k<br>Bewijs:<br>• We maken een hulpconstructie:<br>Teken een rechte evenwijdig met AB door het punt E. Noem het snijpunt met BF het punt X.<br>Teken een rechte evenwijdig met CD door het punt G. Noem het snijpunt met HD het punt Y.<br>[Afbeelding: De projectiesituatie met de toegevoegde hulpconstructies EX // AB en GY // CD.]<br>• Uit deze constructie volgt:<br>Vierhoek ABXE is een parallellogram (de twee paar overstaande zijden zijn evenwijdig)<br>Vierhoek CDYG is een parallellogram (de twee paar overstaande zijden zijn evenwijdig)<br>We kunnen besluiten:<br>|AB| = |EX| en |CD| = |GY| (1)<br>• EX // GY want<br>EX // AB (hulpconstructie)<br>AB // CD (gegeven)<br>CD // GY (hulpconstructie)<br>• We tonen aan dat ∆EXF ∼ ∆GYH.<br>Ê = G^ (overeenkomstige hoeken bij EX // GY en snijlijn a)<br>F^ = H^ (overeenkomstige hoeken bij FX // HY en snijlijn a)<br>⟹ (HH) ∆EXF ∼ ∆GYH<br>⇓<br>|GY', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Metrische betrekkingen in een rechthoekige driehoek', content: 'Gegeven: ∆ABC is rechthoekig in B.<br>[BD] is de hoogtelijn uit B.<br>[Afbeelding: Rechthoekige driehoek ABC verdeeld in twee kleinere rechthoekige driehoeken ADB en BDC door hoogtelijn BD.]<br>We stellen vast: ∆ABC ∼ ∆ADB ∼ ∆BDC want:<br>In ∆ABC en ∆ADB geldt:<br>B^ = D^ (rechte hoeken)<br>Â = Â (gemeenschappelijke hoeken)<br>⟹ (HH) ∆ABC ∼ ∆ADB<br>|AB| / |AD| = |BC| / |DB| = |AC| / |AB|<br>|AB|² = |AC| · |AD|<br>In ∆ABC en ∆BDC geldt:<br>B^ = D^ (rechte hoeken)<br>C^ = C^ (gemeenschappelijke hoeken)<br>⟹ (HH) ∆ABC ∼ ∆BDC<br>|AB| / |BD| = |BC| / |DC| = |AC| / |BC|<br>|BC|² = |AC| · |DC|<br>In ∆ADB en ∆BDC geldt:<br>D^ = D^ (rechte hoeken)<br>Â = B^2 (Â + B^1 = 90° = B^2 + B^1)<br>⟹ (HH) ∆ADB ∼ ∆BDC<br>|AD| / |BD| = |DB| / |DC| = |AB| / |BC|<br>|BD|² = |AD| · |DC|<br>eigenschappen<br>IN WOORDEN<br>In een rechthoekige driehoek is het kwadraat van de lengte van een rechthoekszijde gelijk aan het product van de lengte van de schuine zijde en de lengte van de loodrechte projectie van deze r', icon: 'book-open' }
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

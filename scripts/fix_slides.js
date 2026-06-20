const fs = require('fs');
const file = 'src/lessons/elektriciteit-schakelingen-2.js';
let content = fs.readFileSync(file, 'utf8');

const startTag = '    slidesMixed: [';
const endTag = '    slidesSamenvatting: [';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find start or end tag');
    process.exit(1);
}

const slidesMixedReplacement = `    slidesMixed: [
        {
            layout: 'title',
            title: 'Oefeningen: Gemengde Schakelingen',
            subtitle: '6 basisoefeningen, progressief moeilijker',
            badge: 'Fysica - Oefeningen',
            icon: 'atom'
        },

        // ===================== BASIS 1: SUBSTITUTIEWEERSTAND =====================
        {
            layout: 'attention',
            title: 'Basis 1: Substitutieweerstand',
            content: 'R1 in serie met een parallelgroep van R2 en R3.<br>Bereken de totale weerstand.',
            highlight: 'Werk van binnen naar buiten.'
        },
        {
            layout: 'exercise-cycle',
            steps: [
                {
                    title: 'Opdracht',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-orange-50 rounded-xl p-6 border-l-4 border-brand-orange">
                                <h4 class="text-[1.6rem] font-bold text-brand-orange mb-3">Gegeven:</h4>
                                <ul class="text-[1.5rem] space-y-2 text-slate-700">
                                    <li>\\\\( R_1 = 40 \\\\, \\\\Omega \\\\) staat in serie met een parallelgroep.</li>
                                    <li>De parallelgroep bestaat uit \\\\( R_2 = 30 \\\\, \\\\Omega \\\\) en \\\\( R_3 = 60 \\\\, \\\\Omega \\\\).</li>
                                </ul>
                            </div>
                            <div class="bg-slate-100 rounded-xl p-6 border-l-4 border-slate-400">
                                <h4 class="text-[1.6rem] font-bold text-slate-600 mb-3">Gevraagd:</h4>
                                <p class="text-[1.5rem] text-slate-700">Bereken \\\\( R_{totaal} \\\\).</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 1: Parallelgroep',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-brand-orange text-white rounded-xl p-6">
                                <p class="text-[1.8rem] font-mono font-bold text-center">\\\\( \\\\dfrac{1}{R_{23}} = \\\\dfrac{1}{R_2} + \\\\dfrac{1}{R_3} \\\\)</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.8rem] font-bold text-slate-800">\\\\( \\\\dfrac{1}{R_{23}} = \\\\dfrac{1}{30} + \\\\dfrac{1}{60} = \\\\dfrac{3}{60} \\\\)</p>
                                <p class="text-[1.8rem] font-bold text-slate-800 mt-2">\\\\( R_{23} = \\\\dfrac{60}{3} = 20 \\\\, \\\\Omega \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 2: Serieschakeling',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.6rem] text-slate-700">Tel nu R1 op bij de parallelgroep:</p>
                                <p class="text-[1.8rem] font-bold text-slate-800 mt-3">\\\\( R_{totaal} = R_1 + R_{23} \\\\)</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-500">
                                <p class="text-[2.5rem] font-bold text-emerald-700">\\\\( R_{totaal} = 40 + 20 = 60 \\\\, \\\\Omega \\\\)</p>
                            </div>
                        </div>
                    \`
                }
            ]
        },

        // ===================== BASIS 2: STROOM EN SPANNING (OEF 3) =====================
        {
            layout: 'attention',
            title: 'Basis 2: Stroom en Spanning',
            content: 'Een tak met 4 lampjes parallel aan een tak met 3 weerstanden.',
            highlight: 'Kijk naar de eigenschappen van een parallelschakeling (U is gelijk) en een serieschakeling (I is gelijk).'
        },
        {
            layout: 'exercise-cycle',
            steps: [
                {
                    title: 'Opdracht',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-orange-50 rounded-xl p-6 border-l-4 border-brand-orange">
                                <h4 class="text-[1.6rem] font-bold text-brand-orange mb-3">Gegeven:</h4>
                                <ul class="text-[1.5rem] space-y-2 text-slate-700">
                                    <li>Tak 1: 4 identieke lampjes (L1 t.e.m. L4) in serie.</li>
                                    <li>Tak 2: 3 identieke weerstanden (R1 t.e.m. R3) in serie.</li>
                                    <li>Beide takken staan parallel op een bron van 24 V.</li>
                                    <li>Door R1 stroomt 0,4 A. Door L4 loopt 0,10 A.</li>
                                </ul>
                            </div>
                            <div class="bg-slate-100 rounded-xl p-6 border-l-4 border-slate-400">
                                <h4 class="text-[1.6rem] font-bold text-slate-600 mb-3">Gevraagd:</h4>
                                <ul class="text-[1.5rem] space-y-2 text-slate-700">
                                    <li>a) Wat is de stroom door R2 en R3?</li>
                                    <li>b) Wat is de totale stroom?</li>
                                    <li>c) Wat is de spanning over 1 lampje?</li>
                                </ul>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Deel A: Stroom in een tak',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
                                <p class="text-[1.4rem] text-amber-700"><strong>Regel:</strong> In een serieschakeling is de stroom overal gelijk.</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.6rem] text-slate-800">R1, R2 en R3 staan in serie met elkaar in tak 2.</p>
                                <p class="text-[1.9rem] font-bold text-emerald-700 mt-2">\\\\( I_{R2} = I_{R3} = I_{R1} = 0{,}4 \\\\, A \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Deel B: Totale stroom',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
                                <p class="text-[1.4rem] text-amber-700"><strong>Regel:</strong> De totale stroom verdeelt zich over de parallelle takken.</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.6rem] text-slate-800">Stroom tak 1 (lampjes) = 0,10 A.</p>
                                <p class="text-[1.6rem] text-slate-800 mt-2">Stroom tak 2 (weerstanden) = 0,4 A.</p>
                                <p class="text-[1.9rem] font-bold text-emerald-700 mt-4">\\\\( I_{tot} = 0{,}10 + 0{,}4 = 0{,}5 \\\\, A \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Deel C: Spanning over 1 lampje',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.6rem] text-slate-800">De tak met lampjes staat rechtstreeks op de bron, dus er staat 24 V over de hele tak.</p>
                                <p class="text-[1.6rem] text-slate-800 mt-2">Omdat er 4 identieke lampjes in serie staan, verdeelt de spanning zich gelijkmatig.</p>
                                <p class="text-[2.2rem] font-bold text-emerald-700 mt-4">\\\\( U_{lamp} = \\\\dfrac{24 \\\\, V}{4} = 6{,}0 \\\\, V \\\\)</p>
                            </div>
                        </div>
                    \`
                }
            ]
        },

        // ===================== BASIS 3: IDENTIEKE WEERSTANDEN =====================
        {
            layout: 'attention',
            title: 'Basis 3: Identieke weerstanden',
            content: 'Gemengde schakeling met identieke weerstanden.<br>Ampèremeter toont 3,6 mA. Wat is I_totaal?',
            highlight: 'Let op: identieke weerstanden = gelijke stroomverdeling!'
        },
        {
            layout: 'exercise-cycle',
            image: '/assets/circuit_L2_3.png',
            imageTitle: 'Basis 3',
            steps: [
                {
                    title: 'Opdracht: Stroomverdeling',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-orange-50 rounded-xl p-6 border-l-4 border-brand-orange">
                                <h4 class="text-[1.6rem] font-bold text-brand-orange mb-3">Gegeven:</h4>
                                <ul class="text-[1.5rem] space-y-2 text-slate-700">
                                    <li>Alle weerstanden zijn identiek</li>
                                    <li>\\\\( I_{tak} = 3{,}6 \\\\, mA \\\\) (door de tak met 1 weerstand)</li>
                                </ul>
                            </div>
                            <div class="bg-slate-100 rounded-xl p-6 border-l-4 border-slate-400">
                                <h4 class="text-[1.6rem] font-bold text-slate-600 mb-3">Gevraagd:</h4>
                                <p class="text-[1.5rem] text-slate-700">Bereken de totale stroomsterkte \\\\( I \\\\).</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 1: Analyseer de takken',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
                                <p class="text-[1.4rem] text-amber-700"><strong>3 takken</strong> met elk 1 weerstand, en <strong>1 tak</strong> met 2 weerstanden in serie.</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                                <p class="text-[1.5rem] text-slate-700">De tak met 2 weerstanden in serie heeft <strong>2× de weerstand</strong> → <strong>helft van de stroom</strong>.</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 2: Berekening',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.7rem] font-bold text-slate-800">\\\\( I = 3 \\\\cdot I_{tak} + \\\\dfrac{I_{tak}}{2} \\\\)</p>
                                <p class="text-[1.7rem] font-bold text-slate-800 mt-3">\\\\( = 3 \\\\cdot 3{,}6 \\\\, mA + 1{,}8 \\\\, mA \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Resultaat',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-500">
                                <p class="text-[1.6rem] text-emerald-600 mb-2">Antwoord:</p>
                                <p class="text-[2.8rem] font-bold text-emerald-700">\\\\( I = 12{,}6 \\\\, mA \\\\approx 13 \\\\, mA \\\\)</p>
                            </div>
                        </div>
                    \`
                }
            ]
        },

        // ===================== BASIS 4: MEERSTAPPEN GEMENGD =====================
        {
            layout: 'attention',
            title: 'Basis 4: Meerstappen gemengde schakeling',
            content: '5 weerstanden in een gemengde schakeling.<br>Bereken de substitutieweerstand.',
            highlight: 'Werk van binnen naar buiten: eerst parallel, dan serie, dan parallel.'
        },
        {
            layout: 'exercise-cycle',
            image: '/assets/circuit_L2_4.png',
            imageTitle: 'Basis 4',
            steps: [
                {
                    title: 'Opdracht: Substitutieweerstand',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-orange-50 rounded-xl p-6 border-l-4 border-brand-orange">
                                <h4 class="text-[1.6rem] font-bold text-brand-orange mb-3">Gegeven:</h4>
                                <ul class="text-[1.5rem] space-y-2 text-slate-700">
                                    <li>\\\\( R_1 = 40 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_2 = 30 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_3 = 20 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_4 = 10 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_5 = 50 \\\\, \\\\Omega \\\\)</li>
                                </ul>
                            </div>
                            <div class="bg-slate-100 rounded-xl p-6 border-l-4 border-slate-400">
                                <h4 class="text-[1.6rem] font-bold text-slate-600 mb-3">Gevraagd:</h4>
                                <p class="text-[1.5rem] text-slate-700">Bereken \\\\( R_{totaal} \\\\).</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 1: Parallelgroep R2, R3, R4',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-brand-orange text-white rounded-xl p-6">
                                <p class="text-[1.8rem] font-mono font-bold text-center">\\\\( \\\\dfrac{1}{R_{234}} = \\\\dfrac{1}{R_2} + \\\\dfrac{1}{R_3} + \\\\dfrac{1}{R_4} \\\\)</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.7rem] font-bold text-slate-800">\\\\( \\\\dfrac{1}{R_{234}} = \\\\dfrac{1}{30 \\\\, \\\\Omega} + \\\\dfrac{1}{20 \\\\, \\\\Omega} + \\\\dfrac{1}{10 \\\\, \\\\Omega} \\\\)</p>
                                <p class="text-[1.7rem] font-bold text-slate-800 mt-2">\\\\( = \\\\dfrac{2}{60 \\\\, \\\\Omega} + \\\\dfrac{3}{60 \\\\, \\\\Omega} + \\\\dfrac{6}{60 \\\\, \\\\Omega} = \\\\dfrac{11}{60 \\\\, \\\\Omega} \\\\)</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-500">
                                <p class="text-[1.8rem] font-bold text-emerald-700">\\\\( R_{234} = \\\\dfrac{60 \\\\, \\\\Omega}{11} = 5{,}5 \\\\, \\\\Omega \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 2: Serie R1 + R234',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.8rem] font-bold text-slate-800">\\\\( R_{1234} = R_1 + R_{234} = 40 \\\\, \\\\Omega + 5{,}5 \\\\, \\\\Omega = 45{,}5 \\\\, \\\\Omega \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 3: Parallel R1234 met R5',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.7rem] font-bold text-slate-800">\\\\( \\\\dfrac{1}{R} = \\\\dfrac{1}{R_{1234}} + \\\\dfrac{1}{R_5} = \\\\dfrac{1}{45{,}5 \\\\, \\\\Omega} + \\\\dfrac{1}{50 \\\\, \\\\Omega} \\\\)</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-500">
                                <p class="text-[1.6rem] text-emerald-600 mb-2">Antwoord:</p>
                                <p class="text-[2.5rem] font-bold text-emerald-700">\\\\( R = 23{,}8 \\\\, \\\\Omega \\\\approx 24 \\\\, \\\\Omega \\\\)</p>
                            </div>
                        </div>
                    \`
                }
            ]
        },

        // ===================== BASIS 5: WEERSTAND TERUGREKENEN =====================
        {
            layout: 'attention',
            title: 'Basis 5: Weerstand terugrekenen',
            content: 'Welke weerstand parallel met 14,6 Ω om 12,0 Ω te krijgen?',
            highlight: 'Dit is een "achterwaartse" oefening: je kent R_total, zoek R2.'
        },
        {
            layout: 'exercise-cycle',
            image: '/assets/circuit_L2_2.png',
            imageTitle: 'Basis 5',
            steps: [
                {
                    title: 'Opdracht: Weerstand terugrekenen',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-orange-50 rounded-xl p-6 border-l-4 border-brand-orange">
                                <h4 class="text-[1.6rem] font-bold text-brand-orange mb-3">Gegeven:</h4>
                                <ul class="text-[1.5rem] space-y-2 text-slate-700">
                                    <li>\\\\( R_1 = 14{,}6 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_{totaal} = 12{,}0 \\\\, \\\\Omega \\\\)</li>
                                    <li>Parallel geschakeld</li>
                                </ul>
                            </div>
                            <div class="bg-slate-100 rounded-xl p-6 border-l-4 border-slate-400">
                                <h4 class="text-[1.6rem] font-bold text-slate-600 mb-3">Gevraagd:</h4>
                                <p class="text-[1.5rem] text-slate-700">Bereken \\\\( R_2 \\\\).</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 1: Parallelformule herschrijven',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-brand-orange text-white rounded-xl p-6">
                                <p class="text-[1.8rem] font-mono font-bold text-center">\\\\( \\\\dfrac{1}{R} = \\\\dfrac{1}{R_1} + \\\\dfrac{1}{R_2} \\\\)</p>
                            </div>
                            <div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
                                <p class="text-[1.4rem] text-amber-700"><strong>Isoleren:</strong> \\\\( \\\\dfrac{1}{R_2} = \\\\dfrac{1}{R} - \\\\dfrac{1}{R_1} \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 2: Invullen',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.7rem] font-bold text-slate-800">\\\\( \\\\dfrac{1}{R_2} = \\\\dfrac{1}{12{,}0 \\\\, \\\\Omega} - \\\\dfrac{1}{14{,}6 \\\\, \\\\Omega} \\\\)</p>
                                <p class="text-[1.7rem] font-bold text-slate-800 mt-3">\\\\( = \\\\dfrac{14{,}6 \\\\, \\\\Omega - 12{,}0 \\\\, \\\\Omega}{12{,}0 \\\\, \\\\Omega \\\\cdot 14{,}6 \\\\, \\\\Omega} = \\\\dfrac{2{,}6}{175{,}2 \\\\, \\\\Omega} \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 3: Omkeren',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.9rem] font-bold text-slate-800">\\\\( R_2 = \\\\dfrac{175{,}2 \\\\, \\\\Omega}{2{,}6} \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Resultaat',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-500">
                                <p class="text-[1.6rem] text-emerald-600 mb-2">Antwoord:</p>
                                <p class="text-[2.8rem] font-bold text-emerald-700">\\\\( R_2 = 67{,}4 \\\\, \\\\Omega \\\\)</p>
                            </div>
                            <div class="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                                <p class="text-[1.3rem] text-blue-700"><strong>Check:</strong> \\\\( \\\\frac{1}{12} = \\\\frac{1}{14{,}6} + \\\\frac{1}{67{,}4} \\\\approx 0{,}0833 \\\\checkmark \\\\)</p>
                            </div>
                        </div>
                    \`
                }
            ]
        },

        // ===================== BASIS 6: ONTWERPOEFENING =====================
        {
            layout: 'attention',
            title: 'Basis 6: Ontwerpoefening',
            content: 'Je hebt een doosje vol weerstanden van 3,0 kΩ.<br>Hoe maak je hiermee precies 2,0 kΩ?',
            highlight: 'Combineer serie en parallel om de juiste waarde te vinden.'
        },
        {
            layout: 'exercise-cycle',
            steps: [
                {
                    title: 'Opdracht',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-orange-50 rounded-xl p-6 border-l-4 border-brand-orange">
                                <h4 class="text-[1.6rem] font-bold text-brand-orange mb-3">Gegeven:</h4>
                                <ul class="text-[1.5rem] space-y-2 text-slate-700">
                                    <li>Beschikbaar: onbeperkt aantal weerstanden van \\\\( 3{,}0 \\\\, k\\\\Omega \\\\).</li>
                                </ul>
                            </div>
                            <div class="bg-slate-100 rounded-xl p-6 border-l-4 border-slate-400">
                                <h4 class="text-[1.6rem] font-bold text-slate-600 mb-3">Gevraagd:</h4>
                                <p class="text-[1.5rem] text-slate-700">Bedenk een schakeling die in totaal \\\\( 2{,}0 \\\\, k\\\\Omega \\\\) weerstand heeft.</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 1: Experimenteren met identieke weerstanden',
                    content: \`
                        <div class="space-y-4">
                            <div class="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                                <p class="text-[1.5rem] text-slate-700">Wat als we 2 in serie zetten?</p>
                                <p class="text-[1.6rem] font-bold text-slate-800">\\\\( 3{,}0 + 3{,}0 = 6{,}0 \\\\, k\\\\Omega \\\\) (Te hoog)</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                                <p class="text-[1.5rem] text-slate-700">Wat als we 2 parallel zetten?</p>
                                <p class="text-[1.6rem] font-bold text-slate-800">\\\\( \\\\dfrac{3{,}0}{2} = 1{,}5 \\\\, k\\\\Omega \\\\) (Te laag)</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                                <p class="text-[1.5rem] text-slate-700">Wat als we 3 parallel zetten?</p>
                                <p class="text-[1.6rem] font-bold text-slate-800">\\\\( \\\\dfrac{3{,}0}{3} = 1{,}0 \\\\, k\\\\Omega \\\\) (Interessant!)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 2: De oplossing bouwen',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
                                <p class="text-[1.4rem] text-amber-700">We weten nu dat <strong>3 weerstanden in parallel</strong> exact 1,0 kΩ oplevert.</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-500">
                                <p class="text-[1.6rem] text-emerald-800">Als we zo'n <strong>groepje van 3 parallelle weerstanden</strong> in serie zetten met <strong>nog zo'n groepje van 3</strong>, dan krijgen we:</p>
                                <p class="text-[2.2rem] font-bold text-emerald-700 mt-4">\\\\( 1{,}0 \\\\, k\\\\Omega + 1{,}0 \\\\, k\\\\Omega = 2{,}0 \\\\, k\\\\Omega \\\\)</p>
                            </div>
                        </div>
                    \`
                }
            ]
        },

        // ===================== T25: GEMENGDE SCHAKELING =====================
        {
            layout: 'attention',
            title: 'Extra: T25 Gemengde schakeling',
            content: 'Bereken alle onbekende grootheden in deze extra oefening.',
            highlight: 'Dit is een extra oefening voor wie sneller klaar is.'
        },
        {
            layout: 'exercise-cycle',
            image: '/assets/circuit_L2_samenvatting_initial.png',
            imageTitle: 'T25: Gemengde schakeling',
            steps: [
                {
                    title: 'Opdracht: Alle onbekenden berekenen',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-orange-50 rounded-xl p-6 border-l-4 border-brand-orange">
                                <h4 class="text-[1.6rem] font-bold text-brand-orange mb-3">Gegeven:</h4>
                                <ul class="text-[1.5rem] space-y-2 text-slate-700">
                                    <li>Gemengde schakeling, zie schema in cursus (p. 53).</li>
                                    <li>\\\\( R_1 = 20 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_2 = 33 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_3 = 10 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_4 = 10 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_5 = 60 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( U = 30 \\\\, V \\\\)</li>
                                </ul>
                            </div>
                            <div class="bg-slate-100 rounded-xl p-6 border-l-4 border-slate-400">
                                <h4 class="text-[1.6rem] font-bold text-slate-600 mb-3">Gevraagd:</h4>
                                <p class="text-[1.5rem] text-slate-700">Alle spanningen en stroomsterktes.</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 1: Substitutieweerstand',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.5rem] text-slate-700">Berekening R_tot (zie cursus voor detail):</p>
                                <p class="text-[1.8rem] font-bold text-slate-800">\\\\( R_{23} = 7{,}7 \\\\, \\\\Omega \\\\)</p>
                                <p class="text-[1.8rem] font-bold text-slate-800 mt-2">\\\\( R_{1234} = 38 \\\\, \\\\Omega \\\\)</p>
                                <p class="text-[1.8rem] font-bold text-emerald-700 mt-2">\\\\( R = 23{,}2 \\\\, \\\\Omega \\\\approx 23 \\\\, \\\\Omega \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 2: Stroom en Spanningen',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.8rem] font-bold text-slate-800">\\\\( I = 1{,}3 \\\\, A \\\\)</p>
                                <p class="text-[1.8rem] font-bold text-slate-800 mt-2">\\\\( U_1 = 16 \\\\, V, I_1 = 0{,}8 \\\\, A \\\\)</p>
                                <p class="text-[1.8rem] font-bold text-slate-800 mt-2">\\\\( U_2 = 6 \\\\, V, I_2 = 0{,}18 \\\\, A \\\\)</p>
                                <p class="text-[1.8rem] font-bold text-slate-800 mt-2">\\\\( U_3 = 6 \\\\, V, I_3 = 0{,}6 \\\\, A \\\\)</p>
                                <p class="text-[1.8rem] font-bold text-slate-800 mt-2">\\\\( U_4 = 8 \\\\, V, I_4 = 0{,}8 \\\\, A \\\\)</p>
                                <p class="text-[1.8rem] font-bold text-slate-800 mt-2">\\\\( U_5 = 30 \\\\, V, I_5 = 0{,}50 \\\\, A \\\\)</p>
                            </div>
                        </div>
                    \`
                }
            ]
        },

        // ===================== T26: VOLLEDIGE ANALYSE =====================
        {
            layout: 'attention',
            title: 'Extra: T26 Volledige analyse',
            content: 'Bereken alle onbekende grootheden (U en I per component).',
            highlight: 'Dit is een extra oefening voor wie sneller klaar is.'
        },
        {
            layout: 'exercise-cycle',
            image: '/assets/circuit_L2_5.png',
            imageTitle: 'T26: Volledige analyse',
            steps: [
                {
                    title: 'Opdracht: Alle grootheden berekenen',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-orange-50 rounded-xl p-6 border-l-4 border-brand-orange">
                                <h4 class="text-[1.6rem] font-bold text-brand-orange mb-3">Gegeven:</h4>
                                <ul class="text-[1.5rem] space-y-2 text-slate-700">
                                    <li>\\\\( R_1 = 20 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_2 = 33 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_3 = 10 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_4 = 10 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_5 = 60 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( U_{bron} = 30 \\\\, V \\\\)</li>
                                </ul>
                            </div>
                            <div class="bg-slate-100 rounded-xl p-6 border-l-4 border-slate-400">
                                <h4 class="text-[1.6rem] font-bold text-slate-600 mb-3">Gevraagd:</h4>
                                <p class="text-[1.5rem] text-slate-700">Bereken alle spanningen en stroomsterktes.</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 1: Parallelgroep R2 en R3',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.7rem] font-bold text-slate-800">\\\\( \\\\dfrac{1}{R_{23}} = \\\\dfrac{1}{33 \\\\, \\\\Omega} + \\\\dfrac{1}{10 \\\\, \\\\Omega} \\\\)</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-500">
                                <p class="text-[1.8rem] font-bold text-emerald-700">\\\\( R_{23} = 7{,}7 \\\\, \\\\Omega \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 2: Serie R1 + R23 + R4',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.8rem] font-bold text-slate-800">\\\\( R_{1234} = 20 \\\\, \\\\Omega + 7{,}7 \\\\, \\\\Omega + 10 \\\\, \\\\Omega = 37{,}7 \\\\, \\\\Omega \\\\approx 38 \\\\, \\\\Omega \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 3: Parallel R1234 met R5',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.7rem] font-bold text-slate-800">\\\\( \\\\dfrac{1}{R} = \\\\dfrac{1}{R_{1234}} + \\\\dfrac{1}{R_5} = \\\\dfrac{1}{45{,}5 \\\\, \\\\Omega} + \\\\dfrac{1}{50 \\\\, \\\\Omega} \\\\)</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-500">
                                <p class="text-[1.8rem] font-bold text-emerald-700">\\\\( R = 23{,}2 \\\\, \\\\Omega \\\\approx 23 \\\\, \\\\Omega \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 4: Totale stroom',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-brand-dark text-white rounded-xl p-6">
                                <p class="text-[2rem] font-mono font-bold text-center">\\\\( I = \\\\dfrac{U}{R} \\\\)</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-500">
                                <p class="text-[1.8rem] font-bold text-emerald-700">\\\\( I = \\\\dfrac{30 \\\\, V}{23{,}2 \\\\, \\\\Omega} = 1{,}29 \\\\, A \\\\approx 1{,}3 \\\\, A \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 5: Spanning en stroom per tak',
                    content: \`
                        <div class="space-y-4">
                            <div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
                                <p class="text-[1.4rem] text-amber-700"><strong>Parallel:</strong> \\\\( U = U_{1234} = U_5 = 30 \\\\, V \\\\)</p>
                            </div>
                            <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                <p class="text-[1.4rem] text-blue-600">Stroom door R5:</p>
                                <p class="text-[1.7rem] font-bold text-blue-800">\\\\( I_5 = \\\\dfrac{30 \\\\, V}{60 \\\\, \\\\Omega} = 0{,}50 \\\\, A \\\\)</p>
                            </div>
                            <div class="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                                <p class="text-[1.4rem] text-purple-600">Stroom door R1234:</p>
                                <p class="text-[1.7rem] font-bold text-purple-800">\\\\( I_{1234} = 1{,}3 \\\\, A - 0{,}50 \\\\, A = 0{,}8 \\\\, A \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 6: Spanningen in tak R1234',
                    content: \`
                        <div class="space-y-4">
                            <div class="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                                <p class="text-[1.5rem] text-slate-700">\\\\( I_1 = I_{23} = I_4 = 0{,}8 \\\\, A \\\\) (serie)</p>
                            </div>
                            <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                <p class="text-[1.4rem] text-blue-600">\\\\( U_1 = 0{,}8 \\\\, A \\\\cdot 20 \\\\, \\\\Omega = 16 \\\\, V \\\\)</p>
                            </div>
                            <div class="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                                <p class="text-[1.4rem] text-purple-600">\\\\( U_{23} = 0{,}8 \\\\, A \\\\cdot 7{,}7 \\\\, \\\\Omega = 6 \\\\, V \\\\)</p>
                            </div>
                            <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                                <p class="text-[1.4rem] text-green-600">\\\\( U_4 = 0{,}8 \\\\, A \\\\cdot 10 \\\\, \\\\Omega = 8 \\\\, V \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 7: Stroom door R2 en R3',
                    content: \`
                        <div class="space-y-4">
                            <div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
                                <p class="text-[1.4rem] text-amber-700"><strong>Parallel:</strong> \\\\( U_2 = U_3 = U_{23} = 6 \\\\, V \\\\)</p>
                            </div>
                            <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                <p class="text-[1.4rem] text-blue-600">\\\\( I_2 = \\\\dfrac{6 \\\\, V}{33 \\\\, \\\\Omega} = 0{,}18 \\\\, A \\\\)</p>
                            </div>
                            <div class="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                                <p class="text-[1.4rem] text-purple-600">\\\\( I_3 = \\\\dfrac{6 \\\\, V}{10 \\\\, \\\\Omega} = 0{,}6 \\\\, A \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Resultatentabel',
                    content: \`
                        <div class="space-y-4">
                            <table class="w-full border-collapse text-center text-[1.2rem] rounded-xl overflow-hidden">
                                <tr class="bg-brand-dark text-white">
                                    <th class="p-3 border border-slate-300">Component</th>
                                    <th class="p-3 border border-slate-300">R (Ω)</th>
                                    <th class="p-3 border border-slate-300">U (V)</th>
                                    <th class="p-3 border border-slate-300">I (A)</th>
                                </tr>
                                <tr class="bg-slate-50">
                                    <td class="p-3 border border-slate-200 font-semibold">R1</td>
                                    <td class="p-3 border border-slate-200">20</td>
                                    <td class="p-3 border border-slate-200">16</td>
                                    <td class="p-3 border border-slate-200">0,8</td>
                                </tr>
                                <tr class="bg-white">
                                    <td class="p-3 border border-slate-200 font-semibold">R2</td>
                                    <td class="p-3 border border-slate-200">33</td>
                                    <td class="p-3 border border-slate-200">6</td>
                                    <td class="p-3 border border-slate-200">0,18</td>
                                </tr>
                                <tr class="bg-slate-50">
                                    <td class="p-3 border border-slate-200 font-semibold">R3</td>
                                    <td class="p-3 border border-slate-200">10</td>
                                    <td class="p-3 border border-slate-200">6</td>
                                    <td class="p-3 border border-slate-200">0,6</td>
                                </tr>
                                <tr class="bg-white">
                                    <td class="p-3 border border-slate-200 font-semibold">R4</td>
                                    <td class="p-3 border border-slate-200">10</td>
                                    <td class="p-3 border border-slate-200">8</td>
                                    <td class="p-3 border border-slate-200">0,8</td>
                                </tr>
                                <tr class="bg-slate-50">
                                    <td class="p-3 border border-slate-200 font-semibold">R5</td>
                                    <td class="p-3 border border-slate-200">60</td>
                                    <td class="p-3 border border-slate-200">30</td>
                                    <td class="p-3 border border-slate-200">0,50</td>
                                </tr>
                            </table>
                        </div>
                    \`
                }
            ]
        },

        // ===================== T27: VOLLEDIGE ANALYSE 2 =====================
        {
            layout: 'attention',
            title: 'Extra: T27 Volledige analyse 2',
            content: 'Ampèremeter toont 54,0 mA door R2.<br>Bereken alles.',
            highlight: 'Dit is een extra oefening voor wie sneller klaar is.'
        },
        {
            layout: 'exercise-cycle',
            image: '/assets/circuit_L2_6.png',
            imageTitle: 'T27: Volledige analyse 2',
            steps: [
                {
                    title: 'Opdracht: Alle grootheden berekenen',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-orange-50 rounded-xl p-6 border-l-4 border-brand-orange">
                                <h4 class="text-[1.6rem] font-bold text-brand-orange mb-3">Gegeven:</h4>
                                <ul class="text-[1.5rem] space-y-2 text-slate-700">
                                    <li>\\\\( R_1 = 100 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_2 = 200 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_3 = 300 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( R_4 = 400 \\\\, \\\\Omega \\\\)</li>
                                    <li>\\\\( I_2 = 54{,}0 \\\\, mA \\\\)</li>
                                </ul>
                            </div>
                            <div class="bg-slate-100 rounded-xl p-6 border-l-4 border-slate-400">
                                <h4 class="text-[1.6rem] font-bold text-slate-600 mb-3">Gevraagd:</h4>
                                <p class="text-[1.5rem] text-slate-700">Spanning en stroom door elke weerstand.</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 1: Spanning over R2',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-brand-dark text-white rounded-xl p-6">
                                <p class="text-[2rem] font-mono font-bold text-center">\\\\( U_2 = R_2 \\\\cdot I_2 \\\\)</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.8rem] font-bold text-slate-800">\\\\( U_2 = 200 \\\\, \\\\Omega \\\\cdot 54{,}0 \\\\, mA \\\\)</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-500">
                                <p class="text-[1.8rem] font-bold text-emerald-700">\\\\( U_2 = 10{,}8 \\\\, V \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 2: Parallelgroep R2 en R3',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
                                <p class="text-[1.4rem] text-amber-700"><strong>Parallel:</strong> \\\\( U_3 = U_2 = 10{,}8 \\\\, V \\\\)</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.8rem] font-bold text-slate-800">\\\\( I_3 = \\\\dfrac{10{,}8 \\\\, V}{300 \\\\, \\\\Omega} = 36{,}0 \\\\, mA \\\\)</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-500">
                                <p class="text-[1.8rem] font-bold text-emerald-700">\\\\( I_{23} = 54{,}0 \\\\, mA + 36{,}0 \\\\, mA = 90{,}0 \\\\, mA \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 3: Serie R4 met R23',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
                                <p class="text-[1.4rem] text-amber-700"><strong>Serie:</strong> \\\\( I_4 = I_{23} = 90{,}0 \\\\, mA \\\\)</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.8rem] font-bold text-slate-800">\\\\( U_4 = 400 \\\\, \\\\Omega \\\\cdot 90{,}0 \\\\, mA \\\\)</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-500">
                                <p class="text-[1.8rem] font-bold text-emerald-700">\\\\( U_4 = 36{,}0 \\\\, V \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 4: Tak R234',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.8rem] font-bold text-slate-800">\\\\( U_{234} = U_{23} + U_4 = 10{,}8 \\\\, V + 36{,}0 \\\\, V \\\\)</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-500">
                                <p class="text-[1.8rem] font-bold text-emerald-700">\\\\( U_{234} = 46{,}8 \\\\, V \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Stap 5: Parallelgroep R1 met R234',
                    content: \`
                        <div class="space-y-6">
                            <div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
                                <p class="text-[1.4rem] text-amber-700"><strong>Parallel:</strong> \\\\( U_1 = U_{234} = 46{,}8 \\\\, V \\\\)</p>
                            </div>
                            <div class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <p class="text-[1.8rem] font-bold text-slate-800">\\\\( I_1 = \\\\dfrac{46{,}8 \\\\, V}{100 \\\\, \\\\Omega} = 468 \\\\, mA \\\\)</p>
                            </div>
                        </div>
                    \`
                },
                {
                    title: 'Resultatentabel',
                    content: \`
                        <div class="space-y-4">
                            <table class="w-full border-collapse text-center text-[1.2rem] rounded-xl overflow-hidden">
                                <tr class="bg-brand-orange text-white">
                                    <th class="p-3 border border-slate-300">Component</th>
                                    <th class="p-3 border border-slate-300">R (Ω)</th>
                                    <th class="p-3 border border-slate-300">U (V)</th>
                                    <th class="p-3 border border-slate-300">I (mA)</th>
                                </tr>
                                <tr class="bg-orange-50">
                                    <td class="p-3 border border-slate-200 font-semibold">R1</td>
                                    <td class="p-3 border border-slate-200">100</td>
                                    <td class="p-3 border border-slate-200">46,8</td>
                                    <td class="p-3 border border-slate-200">468</td>
                                </tr>
                                <tr class="bg-white">
                                    <td class="p-3 border border-slate-200 font-semibold">R2</td>
                                    <td class="p-3 border border-slate-200">200</td>
                                    <td class="p-3 border border-slate-200">10,8</td>
                                    <td class="p-3 border border-slate-200">54,0</td>
                                </tr>
                                <tr class="bg-orange-50">
                                    <td class="p-3 border border-slate-200 font-semibold">R3</td>
                                    <td class="p-3 border border-slate-200">300</td>
                                    <td class="p-3 border border-slate-200">10,8</td>
                                    <td class="p-3 border border-slate-200">36,0</td>
                                </tr>
                                <tr class="bg-white">
                                    <td class="p-3 border border-slate-200 font-semibold">R4</td>
                                    <td class="p-3 border border-slate-200">400</td>
                                    <td class="p-3 border border-slate-200">36,0</td>
                                    <td class="p-3 border border-slate-200">90,0</td>
                                </tr>
                            </table>
                            <div class="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                                <p class="text-[1.4rem] text-blue-700"><strong>Totale stroom:</strong> \\\\( I_{totaal} = I_1 + I_{23} = 468 \\\\, mA + 90 \\\\, mA = 558 \\\\, mA \\\\)</p>
                            </div>
                        </div>
                    \`
                }
            ]
        }
    ],

\`;

const newContent = content.substring(0, startIndex) + slidesMixedReplacement + content.substring(endIndex);
fs.writeFileSync(file, newContent, 'utf8');
console.log('Success');

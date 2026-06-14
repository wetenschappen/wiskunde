const fs = require('fs');

const oef25 = `{
                    id: 'oef25',
                    title: 'Oefening 25',
                    steps: [
                        {
                            title: 'Opgave: Gemengde Schakeling',
                            description: 'Bereken alle onbekende grootheden voor deze schakeling. De bronspanning is 30 V.',
                            circuit: {
                                source: { label: 'U = 30 V' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        {
                                            type: 'series',
                                            children: [
                                                { type: 'resistor', id: 'r1', label: 'R_1', value: '20 Ω', u: 'U = ? V', i: 'I = ? A' },
                                                {
                                                    type: 'parallel',
                                                    children: [
                                                        { type: 'resistor', id: 'r2', label: 'R_2', value: '33 Ω', u: 'U = ? V', i: 'I = ? A' },
                                                        { type: 'resistor', id: 'r3', label: 'R_3', value: '10 Ω', u: 'U = ? V', i: 'I = ? A' }
                                                    ]
                                                },
                                                { type: 'resistor', id: 'r4', label: 'R_4', value: '10 Ω', u: 'U = ? V', i: 'I = ? A' }
                                            ]
                                        },
                                        { type: 'resistor', id: 'r5', label: 'R_5', value: '60 Ω', u: 'U = ? V', i: 'I = ? A' }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_1 \\\\)', u: '?', i: '?', r: '20' },
                                { label: '\\\\( R_2 \\\\)', u: '?', i: '?', r: '33' },
                                { label: '\\\\( R_3 \\\\)', u: '?', i: '?', r: '10' },
                                { label: '\\\\( R_4 \\\\)', u: '?', i: '?', r: '10' },
                                { label: '\\\\( R_5 \\\\)', u: '?', i: '?', r: '60' },
                                { label: 'Totaal', u: '30', i: '?', r: '?' }
                            ]
                        },
                        {
                            title: 'Stap 1: R2 en R3 in parallel',
                            description: 'We beginnen met het bepalen van de substitutieweerstand. \\\\( R_2 \\\\) en \\\\( R_3 \\\\) staan in parallel:<br><br>\\\\( \\\\dfrac{1}{R_{23}} = \\\\dfrac{1}{33} + \\\\dfrac{1}{10} \\\\implies R_{23} = 7.7 \\\\, \\\\Omega \\\\)',
                            circuit: {
                                source: { label: 'U = 30 V' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        {
                                            type: 'series',
                                            children: [
                                                { type: 'resistor', id: 'r1', label: 'R_1', value: '20 Ω', u: 'U = ? V', i: 'I = ? A' },
                                                { type: 'resistor', id: 'r23', label: 'R_{23}', value: '7.7 Ω', isSimplified: true, u: 'U = ? V', i: 'I = ? A' },
                                                { type: 'resistor', id: 'r4', label: 'R_4', value: '10 Ω', u: 'U = ? V', i: 'I = ? A' }
                                            ]
                                        },
                                        { type: 'resistor', id: 'r5', label: 'R_5', value: '60 Ω', u: 'U = ? V', i: 'I = ? A' }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_{23} \\\\)', u: '?', i: '?', r: '<span class="text-emerald-600 font-bold">7.7</span>', highlight: true }
                            ]
                        },
                        {
                            title: 'Stap 2: Serietak R1234',
                            description: '\\\\( R_1 \\\\), \\\\( R_{23} \\\\) en \\\\( R_4 \\\\) staan in serie:<br><br>\\\\( R_{1234} = 20 + 7.7 + 10 = 38 \\\\, \\\\Omega \\\\)',
                            circuit: {
                                source: { label: 'U = 30 V' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        { type: 'resistor', id: 'r1234', label: 'R_{1234}', value: '38 Ω', isSimplified: true, u: 'U = ? V', i: 'I = ? A' },
                                        { type: 'resistor', id: 'r5', label: 'R_5', value: '60 Ω', u: 'U = ? V', i: 'I = ? A' }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_{1234} \\\\)', u: '?', i: '?', r: '<span class="text-emerald-600 font-bold">38</span>', highlight: true },
                                { label: '\\\\( R_5 \\\\)', u: '?', i: '?', r: '60' },
                                { label: 'Totaal', u: '30', i: '?', r: '?' }
                            ]
                        },
                        {
                            title: 'Stap 3: Substitutieweerstand',
                            description: '\\\\( R_{1234} \\\\) en \\\\( R_5 \\\\) staan in parallel, we vinden de totale substitutieweerstand:<br><br>\\\\( \\\\dfrac{1}{R_{tot}} = \\\\dfrac{1}{37.7} + \\\\dfrac{1}{60} \\\\implies R_{tot} = 23.2 \\\\, \\\\Omega \\\\)',
                            circuit: {
                                source: { label: 'U = 30 V' },
                                root: { type: 'resistor', id: 'rtot', label: 'R_{tot}', value: '23.2 Ω', isSimplified: true, u: 'U = 30 V', i: 'I = ? A' }
                            },
                            table: [
                                { label: '\\\\( R_{tot} \\\\)', u: '30', i: '?', r: '<span class="text-emerald-600 font-bold">23.2</span>', highlight: true }
                            ]
                        },
                        {
                            title: 'Stap 4: Totale Stroom',
                            description: 'Met de wet van Ohm kunnen we nu de totale stroomsterkte berekenen:<br><br>\\\\( I_{tot} = \\\\dfrac{U}{R_{tot}} = \\\\dfrac{30}{23.2} = 1.3 \\\\, A \\\\)',
                            circuit: {
                                source: { label: 'U = 30 V' },
                                root: { type: 'resistor', id: 'rtot', label: 'R_{tot}', value: '23.2 Ω', u: 'U = 30 V', i: 'I = 1.3 A', isSimplified: true }
                            },
                            table: [
                                { label: 'Totaal', u: '30', i: '<span class="text-emerald-600 font-bold">1.3</span>', r: '23.2', highlight: true }
                            ]
                        },
                        {
                            title: 'Stap 5: Stroom door de parallelle takken',
                            description: 'We keren een stap terug. \\\\( R_{1234} \\\\) en \\\\( R_5 \\\\) staan parallel op de bron, dus \\\\( U_{1234} = U_5 = 30 \\\\, V \\\\).<br><br>\\\\( I_5 = \\\\dfrac{U_5}{R_5} = \\\\dfrac{30}{60} = 0.50 \\\\, A \\\\)<br>\\\\( I_{1234} = I_{tot} - I_5 = 1.3 - 0.50 = 0.8 \\\\, A \\\\)',
                            circuit: {
                                source: { label: 'U = 30 V' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        { type: 'resistor', id: 'r1234', label: 'R_{1234}', value: '38 Ω', isSimplified: true, u: 'U = 30 V', i: 'I = 0.8 A' },
                                        { type: 'resistor', id: 'r5', label: 'R_5', value: '60 Ω', isSimplified: true, u: 'U = 30 V', i: 'I = 0.5 A' }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_{1234} \\\\)', u: '<span class="text-emerald-600 font-bold">30</span>', i: '<span class="text-emerald-600 font-bold">0.8</span>', r: '38', highlight: true },
                                { label: '\\\\( R_5 \\\\)', u: '<span class="text-emerald-600 font-bold">30</span>', i: '<span class="text-emerald-600 font-bold">0.5</span>', r: '60', highlight: true }
                            ]
                        },
                        {
                            title: 'Stap 6: Spanningen in serie',
                            description: '\\\\( R_1 \\\\), \\\\( R_{23} \\\\) en \\\\( R_4 \\\\) staan in serie, dus is de stroom gelijk: \\\\( I_1 = I_{23} = I_4 = 0.8 \\\\, A \\\\).<br>Met de wet van Ohm vinden we de spanningen:<br>\\\\( U_1 = 0.8 \\\\cdot 20 = 16 \\\\, V \\\\)<br>\\\\( U_{23} = 0.8 \\\\cdot 7.7 = 6 \\\\, V \\\\)<br>\\\\( U_4 = 0.8 \\\\cdot 10 = 8 \\\\, V \\\\)',
                            circuit: {
                                source: { label: 'U = 30 V' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        {
                                            type: 'series',
                                            children: [
                                                { type: 'resistor', id: 'r1', label: 'R_1', value: '20 Ω', u: 'U = 16 V', i: 'I = 0.8 A', isSimplified: true },
                                                { type: 'resistor', id: 'r23', label: 'R_{23}', value: '7.7 Ω', u: 'U = 6 V', i: 'I = 0.8 A', isSimplified: true },
                                                { type: 'resistor', id: 'r4', label: 'R_4', value: '10 Ω', u: 'U = 8 V', i: 'I = 0.8 A', isSimplified: true }
                                            ]
                                        },
                                        { type: 'resistor', id: 'r5', label: 'R_5', value: '60 Ω', u: 'U = 30 V', i: 'I = 0.5 A' }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_1 \\\\)', u: '<span class="text-emerald-600 font-bold">16</span>', i: '<span class="text-emerald-600 font-bold">0.8</span>', r: '20', highlight: true },
                                { label: '\\\\( R_{23} \\\\)', u: '<span class="text-emerald-600 font-bold">6</span>', i: '<span class="text-emerald-600 font-bold">0.8</span>', r: '7.7', highlight: true },
                                { label: '\\\\( R_4 \\\\)', u: '<span class="text-emerald-600 font-bold">8</span>', i: '<span class="text-emerald-600 font-bold">0.8</span>', r: '10', highlight: true }
                            ]
                        },
                        {
                            title: 'Stap 7: Ontleden van R23',
                            description: '\\\\( R_2 \\\\) en \\\\( R_3 \\\\) staan parallel, dus hun spanning is gelijk aan \\\\( U_{23} = 6 \\\\, V \\\\).<br>Stroomsterkte berekenen met Ohm:<br>\\\\( I_2 = \\\\dfrac{6}{33} = 0.2 \\\\, A \\\\)<br>\\\\( I_3 = \\\\dfrac{6}{10} = 0.6 \\\\, A \\\\)<br><br>Alle waarden zijn nu berekend!',
                            circuit: {
                                source: { label: 'U = 30 V' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        {
                                            type: 'series',
                                            children: [
                                                { type: 'resistor', id: 'r1', label: 'R_1', value: '20 Ω', u: 'U = 16 V', i: 'I = 0.8 A' },
                                                {
                                                    type: 'parallel',
                                                    children: [
                                                        { type: 'resistor', id: 'r2', label: 'R_2', value: '33 Ω', u: 'U = 6 V', i: 'I = 0.2 A', isSimplified: true },
                                                        { type: 'resistor', id: 'r3', label: 'R_3', value: '10 Ω', u: 'U = 6 V', i: 'I = 0.6 A', isSimplified: true }
                                                    ]
                                                },
                                                { type: 'resistor', id: 'r4', label: 'R_4', value: '10 Ω', u: 'U = 8 V', i: 'I = 0.8 A' }
                                            ]
                                        },
                                        { type: 'resistor', id: 'r5', label: 'R_5', value: '60 Ω', u: 'U = 30 V', i: 'I = 0.5 A' }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_1 \\\\)', u: '16', i: '0.8', r: '20' },
                                { label: '\\\\( R_2 \\\\)', u: '<span class="text-emerald-600 font-bold">6</span>', i: '<span class="text-emerald-600 font-bold">0.2</span>', r: '33', highlight: true },
                                { label: '\\\\( R_3 \\\\)', u: '<span class="text-emerald-600 font-bold">6</span>', i: '<span class="text-emerald-600 font-bold">0.6</span>', r: '10', highlight: true },
                                { label: '\\\\( R_4 \\\\)', u: '8', i: '0.8', r: '10' },
                                { label: '\\\\( R_5 \\\\)', u: '30', i: '0.5', r: '60' },
                                { label: 'Totaal', u: '30', i: '1.3', r: '23.2' }
                            ]
                        }
                    ]
                }`;

const oef26 = `{
                    id: 'oef26',
                    title: 'Oefening 26',
                    steps: [
                        {
                            title: 'Opgave',
                            description: 'Bepaal de spanning over en de stroomsterkte door elke weerstand als je weet dat de ampèremeter 54,0 mA aangeeft.',
                            circuit: {
                                source: { label: 'U = ?' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        { type: 'resistor', id: 'r1', label: 'R_1', value: '100 Ω', u: 'U = ?', i: 'I = ?' },
                                        {
                                            type: 'series',
                                            children: [
                                                { type: 'resistor', id: 'r4', label: 'R_4', value: '400 Ω', u: 'U = ?', i: 'I = ?' },
                                                {
                                                    type: 'parallel',
                                                    children: [
                                                        { type: 'resistor', id: 'r2', label: 'R_2', value: '200 Ω', u: 'U = ?', i: 'I = 54 mA' },
                                                        { type: 'resistor', id: 'r3', label: 'R_3', value: '300 Ω', u: 'U = ?', i: 'I = ?' }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_1 \\\\)', u: '?', i: '?', r: '100' },
                                { label: '\\\\( R_2 \\\\)', u: '?', i: '0.054', r: '200' },
                                { label: '\\\\( R_3 \\\\)', u: '?', i: '?', r: '300' },
                                { label: '\\\\( R_4 \\\\)', u: '?', i: '?', r: '400' }
                            ]
                        },
                        {
                            title: 'Stap 1: Spanning over R2',
                            description: 'Bij \\\\( R_2 \\\\) zijn twee van de drie grootheden gekend. We berekenen de derde met de wet van Ohm:<br><br>\\\\( U_2 = R_2 \\\\cdot I_2 = 200 \\\\cdot 0.054 = 10.8 \\\\, V \\\\)',
                            circuit: {
                                source: { label: 'U = ?' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        { type: 'resistor', id: 'r1', label: 'R_1', value: '100 Ω', u: 'U = ?', i: 'I = ?' },
                                        {
                                            type: 'series',
                                            children: [
                                                { type: 'resistor', id: 'r4', label: 'R_4', value: '400 Ω', u: 'U = ?', i: 'I = ?' },
                                                {
                                                    type: 'parallel',
                                                    children: [
                                                        { type: 'resistor', id: 'r2', label: 'R_2', value: '200 Ω', u: 'U = 10.8 V', i: 'I = 54 mA', isSimplified: true },
                                                        { type: 'resistor', id: 'r3', label: 'R_3', value: '300 Ω', u: 'U = ?', i: 'I = ?' }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_2 \\\\)', u: '<span class="text-emerald-600 font-bold">10.8</span>', i: '0.054', r: '200', highlight: true }
                            ]
                        },
                        {
                            title: 'Stap 2: Stroom door R3',
                            description: '\\\\( R_3 \\\\) staat in parallel met \\\\( R_2 \\\\), dus \\\\( U_3 = U_2 = 10.8 \\\\, V \\\\).<br>De stroomsterkte door \\\\( R_3 \\\\) wordt dan:<br><br>\\\\( I_3 = \\\\dfrac{U_3}{R_3} = \\\\dfrac{10.8}{300} = 0.036 \\\\, A = 36.0 \\\\, mA \\\\)',
                            circuit: {
                                source: { label: 'U = ?' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        { type: 'resistor', id: 'r1', label: 'R_1', value: '100 Ω', u: 'U = ?', i: 'I = ?' },
                                        {
                                            type: 'series',
                                            children: [
                                                { type: 'resistor', id: 'r4', label: 'R_4', value: '400 Ω', u: 'U = ?', i: 'I = ?' },
                                                {
                                                    type: 'parallel',
                                                    children: [
                                                        { type: 'resistor', id: 'r2', label: 'R_2', value: '200 Ω', u: 'U = 10.8 V', i: 'I = 54 mA' },
                                                        { type: 'resistor', id: 'r3', label: 'R_3', value: '300 Ω', u: 'U = 10.8 V', i: 'I = 36 mA', isSimplified: true }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_2 \\\\)', u: '10.8', i: '0.054', r: '200' },
                                { label: '\\\\( R_3 \\\\)', u: '<span class="text-emerald-600 font-bold">10.8</span>', i: '<span class="text-emerald-600 font-bold">0.036</span>', r: '300', highlight: true }
                            ]
                        },
                        {
                            title: 'Stap 3: Spanning over R4',
                            description: '\\\\( I_{23} \\\\) is de som van \\\\( I_2 \\\\) en \\\\( I_3 \\\\): \\\\( I_{23} = 54 + 36 = 90 \\\\, mA \\\\).<br>\\\\( R_4 \\\\) staat in serie met \\\\( R_{23} \\\\), dus \\\\( I_4 = I_{23} = 90 \\\\, mA \\\\).<br><br>Spanning door \\\\( R_4 \\\\): \\\\( U_4 = I_4 \\\\cdot R_4 = 0.090 \\\\cdot 400 = 36.0 \\\\, V \\\\)',
                            circuit: {
                                source: { label: 'U = ?' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        { type: 'resistor', id: 'r1', label: 'R_1', value: '100 Ω', u: 'U = ?', i: 'I = ?' },
                                        {
                                            type: 'series',
                                            children: [
                                                { type: 'resistor', id: 'r4', label: 'R_4', value: '400 Ω', u: 'U = 36 V', i: 'I = 90 mA', isSimplified: true },
                                                { type: 'resistor', id: 'r23', label: 'R_{23}', value: '120 Ω', u: 'U = 10.8 V', i: 'I = 90 mA' }
                                            ]
                                        }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_4 \\\\)', u: '<span class="text-emerald-600 font-bold">36.0</span>', i: '<span class="text-emerald-600 font-bold">0.090</span>', r: '400', highlight: true }
                            ]
                        },
                        {
                            title: 'Stap 4: Stroom door R1',
                            description: 'De totale spanning in de tak \\\\( R_{234} \\\\) is: \\\\( U_{234} = U_{23} + U_4 = 10.8 + 36.0 = 46.8 \\\\, V \\\\).<br>\\\\( R_1 \\\\) staat parallel met deze tak, dus \\\\( U_1 = U_{234} = 46.8 \\\\, V \\\\).<br><br>Stroomsterkte: \\\\( I_1 = \\\\dfrac{U_1}{R_1} = \\\\dfrac{46.8}{100} = 0.468 \\\\, A \\\\)',
                            circuit: {
                                source: { label: 'U = 46.8 V' },
                                root: {
                                    type: 'parallel',
                                    children: [
                                        { type: 'resistor', id: 'r1', label: 'R_1', value: '100 Ω', u: 'U = 46.8 V', i: 'I = 468 mA', isSimplified: true },
                                        { type: 'resistor', id: 'r234', label: 'R_{234}', value: '520 Ω', u: 'U = 46.8 V', i: 'I = 90 mA' }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_1 \\\\)', u: '<span class="text-emerald-600 font-bold">46.8</span>', i: '<span class="text-emerald-600 font-bold">0.468</span>', r: '100', highlight: true },
                                { label: '\\\\( R_2 \\\\)', u: '10.8', i: '0.054', r: '200' },
                                { label: '\\\\( R_3 \\\\)', u: '10.8', i: '0.036', r: '300' },
                                { label: '\\\\( R_4 \\\\)', u: '36.0', i: '0.090', r: '400' }
                            ]
                        }
                    ]
                }`;

const code = `
                ${oef25},
                ${oef26}
`;

let content = fs.readFileSync('src/lessons/elektriciteit-schakelingen-2.js', 'utf8');

const startMarker = "id: 'oef25',";
const endMarker = "simplifyCircuit: {";

const startIndex = content.indexOf(startMarker) - 20; 
const endIndex = content.indexOf(endMarker) - 10;

const pre = content.substring(0, startIndex);
const post = content.substring(endIndex);

fs.writeFileSync('src/lessons/elektriciteit-schakelingen-2.js', pre + code + post);

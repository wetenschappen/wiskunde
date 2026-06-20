const fs = require('fs');

const oef27 = `{
                    id: 'oef27',
                    title: 'Oefening 27',
                    steps: [
                        {
                            title: 'Opgave',
                            description: 'Bereken voor elke weerstand de spanning over en de stroomsterkte door de weerstand. Bereken de totale weerstand en totale stroomsterkte.',
                            circuit: {
                                source: { label: 'U = 20 V' },
                                root: {
                                    type: 'series',
                                    children: [
                                        {
                                            type: 'parallel',
                                            children: [
                                                { type: 'resistor', id: 'r1', label: 'R_1', value: '20 Ω', u: 'U = ?', i: 'I = ?' },
                                                {
                                                    type: 'series',
                                                    children: [
                                                        { type: 'resistor', id: 'r2', label: 'R_2', value: '20 Ω', u: 'U = ?', i: 'I = ?' },
                                                        {
                                                            type: 'parallel',
                                                            children: [
                                                                { type: 'resistor', id: 'r3', label: 'R_3', value: '15 Ω', u: 'U = ?', i: 'I = ?' },
                                                                { type: 'resistor', id: 'r4', label: 'R_4', value: '30 Ω', u: 'U = ?', i: 'I = ?' },
                                                                {
                                                                    type: 'series',
                                                                    children: [
                                                                        { type: 'resistor', id: 'r5', label: 'R_5', value: '45 Ω', u: 'U = ?', i: 'I = ?' },
                                                                        { type: 'resistor', id: 'r6', label: 'R_6', value: '10 Ω', u: 'U = ?', i: 'I = ?' }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        { type: 'resistor', id: 'r7', label: 'R_7', value: '10 Ω', u: 'U = ?', i: 'I = ?' }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_1 \\\\)', u: '?', i: '?', r: '20' },
                                { label: '\\\\( R_2 \\\\)', u: '?', i: '?', r: '20' },
                                { label: '\\\\( R_3 \\\\)', u: '?', i: '?', r: '15' },
                                { label: '\\\\( R_4 \\\\)', u: '?', i: '?', r: '30' },
                                { label: '\\\\( R_5 \\\\)', u: '?', i: '?', r: '45' },
                                { label: '\\\\( R_6 \\\\)', u: '?', i: '?', r: '10' },
                                { label: '\\\\( R_7 \\\\)', u: '?', i: '?', r: '10' },
                                { label: 'Totaal', u: '20', i: '?', r: '?' }
                            ]
                        },
                        {
                            title: 'Stap 1: Substitutieweerstand',
                            description: 'We vereenvoudigen het schema door steeds kleinere groepen samen te nemen:<br><br>\\\\( R_{56} = 45 + 10 = 55 \\\\, \\\\Omega \\\\)<br>\\\\( R_{3456} \\\\): \\\\( \\\\dfrac{1}{15} + \\\\dfrac{1}{30} + \\\\dfrac{1}{55} \\\\implies R_{3456} = 8.5 \\\\, \\\\Omega \\\\)<br>\\\\( R_{23456} = 20 + 8.5 = 28.5 \\\\, \\\\Omega \\\\)<br>\\\\( R_{123456} \\\\): \\\\( \\\\dfrac{1}{20} + \\\\dfrac{1}{28.5} \\\\implies R_{123456} = 12 \\\\, \\\\Omega \\\\)<br>Totale weerstand: \\\\( R_{tot} = 12 + 10 = 22 \\\\, \\\\Omega \\\\)',
                            circuit: {
                                source: { label: 'U = 20 V' },
                                root: { type: 'resistor', id: 'rtot', label: 'R_{tot}', value: '22 Ω', u: 'U = 20 V', i: 'I = ?' }
                            },
                            table: [
                                { label: '\\\\( R_{tot} \\\\)', u: '20', i: '?', r: '<span class="text-emerald-600 font-bold">22</span>', highlight: true }
                            ]
                        },
                        {
                            title: 'Stap 2: Totale Stroomsterkte',
                            description: 'Nu we de totale spanning en de totale weerstand kennen, berekenen we de stroom door het geheel:\\\\( I_{tot} = \\\\dfrac{U}{R_{tot}} = \\\\dfrac{20}{22} = 0.91 \\\\, A \\\\)<br><br>De stroom \\\\( I_{tot} \\\\) gaat volledig door \\\\( R_7 \\\\), dus: \\\\( I_7 = 0.91 \\\\, A \\\\)',
                            circuit: {
                                source: { label: 'U = 20 V' },
                                root: {
                                    type: 'series',
                                    children: [
                                        { type: 'resistor', id: 'r123456', label: 'R_{1..6}', value: '12 Ω', u: 'U = ?', i: 'I = 0.91 A' },
                                        { type: 'resistor', id: 'r7', label: 'R_7', value: '10 Ω', u: 'U = ?', i: 'I = 0.91 A' }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_7 \\\\)', u: '?', i: '<span class="text-emerald-600 font-bold">0.91</span>', r: '10', highlight: true },
                                { label: 'Totaal', u: '20', i: '<span class="text-emerald-600 font-bold">0.91</span>', r: '22', highlight: true }
                            ]
                        },
                        {
                            title: 'Stap 3: Verder ontleden!',
                            description: 'Probeer het zelf stap per stap. Bereken \\\\( U_7 \\\\). Trek deze af van de totale spanning om de spanning over de linkse parallelgroep te vinden. Zo kan je de rest oplossen!',
                            circuit: {
                                source: { label: 'U = 20 V' },
                                root: {
                                    type: 'series',
                                    children: [
                                        {
                                            type: 'parallel',
                                            children: [
                                                { type: 'resistor', id: 'r1', label: 'R_1', value: '20 Ω', u: 'U = ?', i: 'I = ?' },
                                                {
                                                    type: 'series',
                                                    children: [
                                                        { type: 'resistor', id: 'r2', label: 'R_2', value: '20 Ω', u: 'U = ?', i: 'I = ?' },
                                                        {
                                                            type: 'parallel',
                                                            children: [
                                                                { type: 'resistor', id: 'r3', label: 'R_3', value: '15 Ω', u: 'U = ?', i: 'I = ?' },
                                                                { type: 'resistor', id: 'r4', label: 'R_4', value: '30 Ω', u: 'U = ?', i: 'I = ?' },
                                                                {
                                                                    type: 'series',
                                                                    children: [
                                                                        { type: 'resistor', id: 'r5', label: 'R_5', value: '45 Ω', u: 'U = ?', i: 'I = ?' },
                                                                        { type: 'resistor', id: 'r6', label: 'R_6', value: '10 Ω', u: 'U = ?', i: 'I = ?' }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        { type: 'resistor', id: 'r7', label: 'R_7', value: '10 Ω', u: 'U = 9.1 V', i: 'I = 0.91 A', isSimplified: true }
                                    ]
                                }
                            },
                            table: [
                                { label: '\\\\( R_1 \\\\)', u: '?', i: '?', r: '20' },
                                { label: '\\\\( R_2 \\\\)', u: '?', i: '?', r: '20' },
                                { label: '\\\\( R_3 \\\\)', u: '?', i: '?', r: '15' },
                                { label: '\\\\( R_4 \\\\)', u: '?', i: '?', r: '30' },
                                { label: '\\\\( R_5 \\\\)', u: '?', i: '?', r: '45' },
                                { label: '\\\\( R_6 \\\\)', u: '?', i: '?', r: '10' },
                                { label: '\\\\( R_7 \\\\)', u: '<span class="text-emerald-600 font-bold">9.1</span>', i: '0.91', r: '10', highlight: true },
                                { label: 'Totaal', u: '20', i: '0.91', r: '22' }
                            ]
                        }
                    ]
                }`;

let content = fs.readFileSync('src/lessons/elektriciteit-schakelingen-2.js', 'utf8');

const insertPos = content.indexOf('simplifyCircuit: {') - 10;
const pre = content.substring(0, insertPos);
const post = content.substring(insertPos);

fs.writeFileSync('src/lessons/elektriciteit-schakelingen-2.js', pre + ',' + oef27 + post);

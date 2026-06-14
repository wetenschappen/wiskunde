import { generateAllTopologies, assignLabels } from '../circuit/generator';
import type { TopologyNode } from '../types/circuit';
import { MAX_RESISTORS } from '../types/circuit';

export interface Problem {
    id: string;
    number: number;
    resistorCount: number;
    label: string;
    topology: TopologyNode;
}

// Generate the catalog once
const CATALOG: Problem[] = [];
let problemCounter = 1;

for (let n = 1; n <= MAX_RESISTORS; n++) {
    const topologies = generateAllTopologies(n);
    
    // Sort topologies to have some consistency (e.g. pure series first, pure parallel last, or just by canonical string)
    topologies.forEach((topology) => {
        // Label resistors cleanly R1, R2...
        const labeledTopology = assignLabels(JSON.parse(JSON.stringify(topology)), { count: 1 }, { count: 1 });
        
        CATALOG.push({
            id: `problem-${problemCounter}`,
            number: problemCounter,
            resistorCount: n,
            label: `Oefening ${problemCounter}`,
            topology: labeledTopology
        });
        problemCounter++;
    });
}

export function getAllProblems(): Problem[] {
    return CATALOG;
}

export function getProblemById(id: string): Problem | undefined {
    return CATALOG.find(p => p.id === id);
}

export function getProblemByNumber(num: number): Problem | undefined {
    return CATALOG.find(p => p.number === num);
}

export function getProblemsByResistorCount(count: number): Problem[] {
    return CATALOG.filter(p => p.resistorCount === count);
}

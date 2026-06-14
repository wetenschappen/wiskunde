import type { Circuit, SolverResult } from '../types/circuit';

export function solveCircuit(circuit: Circuit): SolverResult | null {
  try {
    // 1. Union-Find for wires to merge nodes
    const parent = new Map<string, string>();
    circuit.nodes.forEach(n => parent.set(n.id, n.id));
    
    const find = (i: string): string => {
      if (parent.get(i) === i) return i;
      const root = find(parent.get(i)!);
      parent.set(i, root);
      return root;
    };
    
    const union = (i: string, j: string) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent.set(rootI, rootJ);
      }
    };
    
    // Connect nodes via wires
    circuit.wires.forEach(w => {
      union(w.from, w.to);
    });

    // 2. Identify unique nodes
    const groundOriginal = circuit.voltageSource.negativeNode;
    const groundNode = find(groundOriginal);
    
    const uniqueNodes = new Set<string>();
    circuit.nodes.forEach(n => {
      uniqueNodes.add(find(n.id));
    });
    
    const unknownNodes = Array.from(uniqueNodes).filter(id => id !== groundNode);
    if (unknownNodes.length === 0) return null;

    const n = unknownNodes.length;
    const G: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    const I: number[] = Array(n).fill(0);
    
    const nodeIndex = new Map<string, number>();
    unknownNodes.forEach((id, idx) => nodeIndex.set(id, idx));

    // 3. Process voltage source explicitly
    const vSourcePos = find(circuit.voltageSource.positiveNode);
    const vSourceVal = circuit.voltageSource.value;

    // 4. Process resistors
    const enabledComponents = circuit.components.filter(c => c.enabled);
    enabledComponents.forEach(comp => {
      if (comp.type === 'resistor') {
        // Validate resistance value to prevent division by zero
        if (comp.value <= 0) {
          console.warn(`Resistor ${comp.id} has invalid value ${comp.value}Ω, skipping`);
          return;
        }

        const n1 = find(comp.nodes[0]);
        const n2 = find(comp.nodes[1]);
        if (n1 === n2) return; // shorted out

        const conductance = 1 / comp.value;
        
        if (nodeIndex.has(n1)) G[nodeIndex.get(n1)!][nodeIndex.get(n1)!] += conductance;
        if (nodeIndex.has(n2)) G[nodeIndex.get(n2)!][nodeIndex.get(n2)!] += conductance;
        
        if (nodeIndex.has(n1) && nodeIndex.has(n2)) {
          G[nodeIndex.get(n1)!][nodeIndex.get(n2)!] -= conductance;
          G[nodeIndex.get(n2)!][nodeIndex.get(n1)!] -= conductance;
        }
      }
    });

    // 5. Apply voltage source equation
    if (nodeIndex.has(vSourcePos)) {
      const idx = nodeIndex.get(vSourcePos)!;
      for (let j = 0; j < n; j++) {
        G[idx][j] = j === idx ? 1 : 0;
      }
      I[idx] = vSourceVal;
    }

    // 6. Solve
    const voltages = solveLinearSystem(G, I);
    if (!voltages) return null;

    // 7. Extract results
    const nodeVoltages = new Map<string, number>();
    circuit.nodes.forEach(node => {
      const root = find(node.id);
      if (root === groundNode) {
        nodeVoltages.set(node.id, 0);
      } else {
        nodeVoltages.set(node.id, voltages[nodeIndex.get(root)!]);
      }
    });

    const branchCurrents = new Map<string, number>();
    const componentVoltages = new Map<string, number>();
    const componentPowers = new Map<string, number>();
    
    let totalPower = 0;

    enabledComponents.forEach(comp => {
      if (comp.type === 'resistor') {
        const v1 = nodeVoltages.get(comp.nodes[0]) || 0;
        const v2 = nodeVoltages.get(comp.nodes[1]) || 0;
        const voltage = Math.abs(v1 - v2);
        componentVoltages.set(comp.id, voltage);
        
        const current = voltage / comp.value;
        branchCurrents.set(comp.id, current);
        
        const power = voltage * current;
        componentPowers.set(comp.id, power);
        totalPower += power;
      }
    });

    const totalCurrent = vSourceVal > 0 ? totalPower / vSourceVal : 0;
    const equivalentResistance = totalCurrent > 0 ? vSourceVal / totalCurrent : Infinity;
    
    return {
      nodeVoltages,
      branchCurrents,
      componentVoltages,
      componentPowers,
      totalCurrent,
      equivalentResistance
    };
  } catch (e) {
    console.error('Solver error:', e);
    return null;
  }
}

function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i]]);
  
  // Gaussian elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    let maxVal = Math.abs(augmented[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(augmented[row][col]) > maxVal) {
        maxVal = Math.abs(augmented[row][col]);
        maxRow = row;
      }
    }
    
    if (maxVal < 1e-10) {
      console.warn('Singular or near-singular matrix detected, solver may produce unreliable results');
      return null;
    }
    
    // Swap rows
    [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];
    
    // Eliminate
    for (let row = col + 1; row < n; row++) {
      const factor = augmented[row][col] / augmented[col][col];
      for (let j = col; j <= n; j++) {
        augmented[row][j] -= factor * augmented[col][j];
      }
    }
  }
  
  // Back substitution
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(augmented[i][i]) < 1e-10) {
      console.warn(`Near-zero pivot at row ${i} during back substitution`);
      return null;
    }
    let sum = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= augmented[i][j] * x[j];
    }
    x[i] = sum / augmented[i][i];
  }
  
  return x;
}

export interface ReverseSolveResult {
  unknownResistorValue: number;
  isValid: boolean;
  errorMessage?: string;
}

export function solveForUnknownResistor(
  circuit: Circuit,
  unknownResistorId: string,
  targetTotalResistance: number
): ReverseSolveResult {
  // Binary search for the unknown resistor value
  let low = 0.1;
  let high = 100000;
  const tolerance = 0.01;
  
  const unknownComp = circuit.components.find(c => c.id === unknownResistorId);
  if (!unknownComp) {
    return { unknownResistorValue: 0, isValid: false, errorMessage: 'Component not found' };
  }
  
  // Clone circuit components to not mutate the original during search
  const clonedCircuit: Circuit = {
    ...circuit,
    components: circuit.components.map(c => ({ ...c }))
  };
  const clonedUnknownComp = clonedCircuit.components.find(c => c.id === unknownResistorId)!;
  
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    
    // Temporarily set the unknown resistor value
    clonedUnknownComp.value = mid;
    
    // Calculate total resistance with this value
    const result = solveCircuit(clonedCircuit);
    if (!result) {
      return { unknownResistorValue: 0, isValid: false, errorMessage: 'Circuit solve failed' };
    }
    const calculatedTotal = result.equivalentResistance;
    
    if (Math.abs(calculatedTotal - targetTotalResistance) < tolerance) {
      return { unknownResistorValue: mid, isValid: true };
    }
    
    if (calculatedTotal < targetTotalResistance) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return { unknownResistorValue: (low + high) / 2, isValid: true };
}

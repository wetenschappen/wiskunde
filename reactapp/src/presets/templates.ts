import type { Circuit } from '../types/circuit';
import { topologyToCircuit } from '../circuit/topology';
import { getProblemById } from './catalog';

export function createPresetCircuit(problemId: string): Circuit {
  const problem = getProblemById(problemId);
  
  if (!problem) {
    // Fallback if no problem found
    return topologyToCircuit({ id: 'root', type: 'resistor', resistorId: 'R1' });
  }

  return topologyToCircuit(problem.topology);
}

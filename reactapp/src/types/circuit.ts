export interface GridNode {
  id: string;
  x: number;
  y: number;
  type: 'junction' | 'terminal';
}

export interface Component {
  id: string;
  type: 'voltageSource' | 'resistor';
  value: number;
  nodes: [string, string];
  enabled: boolean;
}

export interface Wire {
  id: string;
  from: string;
  to: string;
  topologyId?: string; // Links wire to a topology node for current computation
  current?: number;    // Computed via post-processing
}

export interface Circuit {
  nodes: GridNode[];
  components: Component[];
  wires: Wire[];
  voltageSource: {
    value: number;
    positiveNode: string;
    negativeNode: string;
  };
  topology?: TopologyNode;
}

export type TopologyNodeType = 'resistor' | 'series' | 'parallel';

export interface TopologyNode {
  id: string;
  type: TopologyNodeType;
  children?: TopologyNode[];
  resistorId?: string;
  // Layout metadata
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export interface SolverResult {
  nodeVoltages: Map<string, number>;
  branchCurrents: Map<string, number>;
  componentVoltages: Map<string, number>;
  componentPowers: Map<string, number>;
  totalCurrent: number;
  equivalentResistance: number;
}

export interface SimplificationStep {
  type: 'series' | 'parallel';
  components: string[];
  equivalentValue: number;
  explanation: string;
  latexFormula?: string;
  textExplanation?: string;
}

export type ProblemMode = 'classic' | 'find_resistor' | 'find_voltage' | 'find_current';

export interface ProblemConfig {
  mode: ProblemMode;
  unknownComponentId?: string;
  givenTotalResistance?: number;
  givenTotalCurrent?: number;
}

export interface CircuitConfiguration {
  id: string;
  label: string;
  topology: TopologyNode;
}

export type CircuitPreset = string;

export const MAX_RESISTORS = 6;
export const SVG_WIDTH = 1000;
export const SVG_HEIGHT = 600;
export const MARGIN = 60;


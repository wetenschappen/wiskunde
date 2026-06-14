import type { Circuit, GridNode, Component, Wire, TopologyNode } from '../types/circuit';

const R_WIDTH = 8.0;
const H_SPACING = 4.0;
const V_SPACING = 6.0;

interface Measurement {
  width: number;
  up: number;
  down: number;
  children?: Measurement[];
}

function measureNode(node: TopologyNode): Measurement {
  if (node.type === 'resistor') {
    return { width: R_WIDTH, up: 1.0, down: 1.0 };
  }
  if (node.type === 'series') {
    const children = node.children!.map(measureNode);
    const width = children.reduce((sum, c) => sum + c.width, 0) + (children.length - 1) * H_SPACING;
    const up = Math.max(...children.map(c => c.up));
    const down = Math.max(...children.map(c => c.down));
    return { width, up, down, children };
  }
  if (node.type === 'parallel') {
    const children = node.children!.map(measureNode);
    const branchWidths = children.map(c => c.width);
    const maxWidth = Math.max(...branchWidths);
    const width = maxWidth + 2 * H_SPACING; 
    
    let totalHeight = 0;
    for (let i = 0; i < children.length; i++) {
      totalHeight += children[i].up + children[i].down;
      if (i < children.length - 1) totalHeight += V_SPACING;
    }
    
    const up = totalHeight / 2;
    const down = totalHeight / 2;
    return { width, up, down, children };
  }
  return { width: 0, up: 0, down: 0 };
}

class LayoutContext {
  nodes: GridNode[] = [];
  wires: Wire[] = [];
  components: Component[] = [];
  nodeCount = 0;
  wireCount = 0;

  createNode(x: number, y: number): string {
    const existing = this.nodes.find(n => Math.abs(n.x - x) < 0.01 && Math.abs(n.y - y) < 0.01);
    if (existing) return existing.id;
    const id = `n${this.nodeCount++}`;
    this.nodes.push({ id, x, y, type: 'junction' });
    return id;
  }

  createWire(from: string, to: string, topologyId?: string) {
    if (from === to) return;
    const exists = this.wires.some(w => (w.from === from && w.to === to) || (w.from === to && w.to === from));
    if (exists) return;
    this.wires.push({ id: `w${this.wireCount++}`, from, to, topologyId });
  }

  drawPath(points: [number, number][], topologyId?: string): string[] {
    if (points.length < 2) return [];
    const pathNodes = points.map(p => this.createNode(p[0], p[1]));
    for (let i = 0; i < pathNodes.length - 1; i++) {
      this.createWire(pathNodes[i], pathNodes[i+1], topologyId);
    }
    return pathNodes;
  }
}

function placeNode(node: TopologyNode, ctx: LayoutContext, x: number, y: number, m: Measurement) {
  if (node.type === 'resistor') {
    const n1 = ctx.createNode(x, y);
    const n2 = ctx.createNode(x + m.width, y);
    ctx.components.push({
      id: node.resistorId || 'R?',
      type: 'resistor',
      value: 100,
      nodes: [n1, n2],
      enabled: true
    });
    return;
  }
  if (node.type === 'series') {
    let currentX = x;
    for (let i = 0; i < node.children!.length; i++) {
      const child = node.children![i];
      const cM = m.children![i];
      placeNode(child, ctx, currentX, y, cM);
      currentX += cM.width;
      if (i < node.children!.length - 1) {
        ctx.drawPath([[currentX, y], [currentX + H_SPACING, y]], node.id);
        currentX += H_SPACING;
      }
    }
    return;
  }
  if (node.type === 'parallel') {
    const startX = x + H_SPACING;
    const endX = x + m.width - H_SPACING;
    
    let currentY = y - m.up;
    const yOffsets: number[] = [];
    for (let i = 0; i < node.children!.length; i++) {
      const cM = m.children![i];
      const branchY = currentY + cM.up;
      yOffsets.push(branchY);
      currentY = branchY + cM.down + V_SPACING;
    }
    
    // Vertical split rails bridging all intermediates structurally
    // We MUST include the entry/exit 'y' level in these rails to ensure topology connects
    const allYValues = Array.from(new Set([...yOffsets, y])).sort((a, b) => a - b);
    const leftRailPoints = allYValues.map(ry => [startX, ry] as [number, number]);
    const rightRailPoints = allYValues.map(ry => [endX, ry] as [number, number]);
    ctx.drawPath(leftRailPoints, node.id);
    ctx.drawPath(rightRailPoints, node.id);
    
    // Entry / Exit
    ctx.drawPath([[x, y], [startX, y]], node.id);
    ctx.drawPath([[endX, y], [x + m.width, y]], node.id);
    
    for (let i = 0; i < node.children!.length; i++) {
      const child = node.children![i];
      const cM = m.children![i];
      const bY = yOffsets[i];
      
      const availableW = endX - startX - H_SPACING;
      const padding = (availableW - cM.width) / 2;
      const childX = startX + H_SPACING/2 + padding;
      
      // Wire into child
      ctx.drawPath([[startX, bY], [childX, bY]], child.id);
      
      placeNode(child, ctx, childX, bY, cM);
      
      // Wire out of child
      const childEndX = childX + cM.width;
      ctx.drawPath([[childEndX, bY], [endX, bY]], child.id);
    }
    return;
  }
}

export function topologyToCircuit(root: TopologyNode): Circuit {
  const ctx = new LayoutContext();
  const m = measureNode(root);
  
  const startX = 3.0;
  const startY = 0.0;
  
  placeNode(root, ctx, startX, startY, m);
  
  const endX = startX + m.width;
  
  // Create the voltage source at the middle bottom
  const vsXCenter = startX + m.width / 2;
  const vsYBot = Math.max(m.down + 4.0, 6.0); 
  
  // Position terminals: Positive on the right, Negative on the left
  const vSourcePos = ctx.createNode(vsXCenter + 1.0, vsYBot);
  const vSourceNeg = ctx.createNode(vsXCenter - 1.0, vsYBot);
  
  // Wire from VS- (left) back to circuit entry (startX, 0)
  ctx.drawPath([
    [vsXCenter - 1.0, vsYBot],
    [startX, vsYBot],
    [startX, startY]
  ], root.id);

  // Wire from circuit exit (endX, 0) to VS+ (right)
  ctx.drawPath([
    [endX, startY],
    [endX, vsYBot],
    [vsXCenter + 1.0, vsYBot]
  ], root.id);
  
  return {
    nodes: ctx.nodes,
    components: ctx.components,
    wires: ctx.wires,
    voltageSource: {
      value: 12,
      positiveNode: vSourcePos,
      negativeNode: vSourceNeg
    },
    topology: root
  };
}

export function computeWireCurrents(circuit: Circuit, results: import('../types/circuit').SolverResult): Map<string, number> {
  const wireCurrents = new Map<string, number>();
  if (!circuit.topology) return wireCurrents;

  const currentMap = new Map<string, number>();

  const computeNodeCurrent = (node: TopologyNode): number => {
    if (node.type === 'resistor') {
      const current = results.branchCurrents.get(node.resistorId!) || 0;
      currentMap.set(node.id, current);
      return current;
    }

    if (node.type === 'series') {
      const childCurrents = (node.children || []).map(computeNodeCurrent);
      const current = childCurrents[0] || 0; 
      currentMap.set(node.id, current);
      return current;
    }

    if (node.type === 'parallel') {
      const childCurrents = (node.children || []).map(computeNodeCurrent);
      const current = childCurrents.reduce((a, b) => a + b, 0); 
      currentMap.set(node.id, current);
      return current;
    }

    return 0;
  };

  computeNodeCurrent(circuit.topology);

  circuit.wires.forEach(wire => {
    if (wire.topologyId && currentMap.has(wire.topologyId)) {
      wireCurrents.set(wire.id, currentMap.get(wire.topologyId)!);
    } else {
      wireCurrents.set(wire.id, results.totalCurrent); 
    }
  });

  return wireCurrents;
}

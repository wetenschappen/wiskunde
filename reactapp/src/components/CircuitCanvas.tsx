import type { Circuit, Component, GridNode, Wire, ProblemConfig } from '../types/circuit';
import { SVG_WIDTH, SVG_HEIGHT, MARGIN } from '../types/circuit';
import type { FC } from 'react';
import { useState } from 'react';

interface CircuitCanvasProps {
  circuit: Circuit;
  selectedNodes: string[];
  onNodeClick: (nodeId: string) => void;
  problemConfig?: ProblemConfig;
  highlightedComponents?: string[];
}

export const CircuitCanvas: FC<CircuitCanvasProps> = ({
  circuit,
  selectedNodes,
  onNodeClick,
  problemConfig,
  highlightedComponents = []
}) => {
  const { nodes, components, wires, voltageSource } = circuit;
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  if (nodes.length === 0) return null;

  // Find bounding box for auto-scaling
  const allX = nodes.map(n => n.x);
  const allY = nodes.map(n => n.y);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  // Use fixed canvas dimensions from types
  const canvasWidth = SVG_WIDTH || 1000;
  const canvasHeight = SVG_HEIGHT || 600;
  const margin = MARGIN || 40;

  // Scaling factor to fit in bounded canvas
  const scaleX = (canvasWidth - 2 * margin) / (contentWidth || 1);
  const scaleY = (canvasHeight - 2 * margin) / (contentHeight || 1);
  const scale = Math.min(scaleX, scaleY);

  const totalWidth = contentWidth * scale;
  const totalHeight = contentHeight * scale;
  const offsetX = margin + (canvasWidth - 2 * margin - totalWidth) / 2;
  const offsetY = margin + (canvasHeight - 2 * margin - totalHeight) / 2;

  const toSvgX = (x: number) => offsetX + (x - minX) * scale;
  const toSvgY = (y: number) => offsetY + (y - minY) * scale;

  // Render voltage source (Battery style)
  const renderVoltageSource = () => {
    const posNode = nodes.find(n => n.id === voltageSource.positiveNode);
    const negNode = nodes.find(n => n.id === voltageSource.negativeNode);
    if (!posNode || !negNode) return null;

    const x1 = toSvgX(posNode.x);
    const y1 = toSvgY(posNode.y);
    const x2 = toSvgX(negNode.x);
    const y2 = toSvgY(negNode.y);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    const gap = 16;
    const longLine = 32;
    const shortLine = 20;
    const length = Math.hypot(x2 - x1, y2 - y1);

    return (
      <g key="vsource">
        <g transform={`translate(${midX}, ${midY}) rotate(${angle})`}>
            {/* Leads connecting to the nodes */}
            <line x1={-length/2} y1={0} x2={-gap/2} y2={0} stroke="#1a1a1a" strokeWidth="2.5" />
            <line x1={gap/2} y1={0} x2={length/2} y2={0} stroke="#1a1a1a" strokeWidth="2.5" />

            {/* Pos terminal (long thin line) - Placed at -gap/2 because rotation points towards NegNode */}
            <line x1={-gap/2} y1={-longLine/2} x2={-gap/2} y2={longLine/2} stroke="#1a1a1a" strokeWidth="2.5" />
            {/* Neg terminal (short thick line) - Placed at gap/2 */}
            <line x1={gap/2} y1={-shortLine/2} x2={gap/2} y2={shortLine/2} stroke="#1a1a1a" strokeWidth="5" />
        </g>
        
        {/* Value text placed BELOW the battery component */}
        <text 
            x={midX} 
            y={midY + 45} 
            fontSize="18" 
            fontWeight="700" 
            textAnchor="middle" 
            fill={problemConfig?.mode === 'find_voltage' ? "#D97706" : "#1a1a1a"}
        >
          {problemConfig?.mode === 'find_voltage' ? "? V" : `${voltageSource.value} V`}
        </text>
      </g>
    );
  };

  // Render resistor (European style: rectangle)
  const renderResistor = (comp: Component) => {
    const node1 = nodes.find(n => n.id === comp.nodes[0]);
    const node2 = nodes.find(n => n.id === comp.nodes[1]);
    if (!node1 || !node2) return null;

    const x1 = toSvgX(node1.x);
    const y1 = toSvgY(node1.y);
    const x2 = toSvgX(node2.x);
    const y2 = toSvgY(node2.y);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    const isHorizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
    
    const resistorLength = 40;
    const resistorWidth = 14;
    const fontSizeLabel = 14;
    const fontSizeValue = 12;

    const length = Math.hypot(x2 - x1, y2 - y1);
    const isHighlighted = highlightedComponents.includes(comp.id);
    const isUnknown = problemConfig?.mode === 'find_resistor' && problemConfig.unknownComponentId === comp.id;
    
    return (
      <g key={comp.id}>
        <g transform={`translate(${midX}, ${midY}) rotate(${angle})`}>
          {/* Leads */}
          <line x1={-length/2} y1={0} x2={-resistorLength/2} y2={0} stroke={isHighlighted ? "#0066cc" : "#1a1a1a"} strokeWidth={isHighlighted ? 3.5 : 2.5} />
          <line x1={resistorLength/2} y1={0} x2={length/2} y2={0} stroke={isHighlighted ? "#0066cc" : "#1a1a1a"} strokeWidth={isHighlighted ? 3.5 : 2.5} />
          
          {/* Resistor body */}
          <rect
            x={-resistorLength / 2}
            y={-resistorWidth / 2}
            width={resistorLength}
            height={resistorWidth}
            fill={isHighlighted ? "#e6f3ff" : "#ffffff"}
            stroke={isHighlighted ? "#0066cc" : isUnknown ? "#F59E0B" : "#1a1a1a"}
            strokeWidth={isHighlighted ? 3.5 : 2.5}
            rx="2"
            style={{ transition: 'all 0.2s' }}
          />
        </g>
        
        {/* Labels strictly next to the component */}
        <g transform={`translate(${midX}, ${midY})`}>
             <text 
                y={isHorizontal ? -16 : -resistorLength/2 + 8} 
                x={isHorizontal ? 0 : 20}
                fontSize={fontSizeLabel} 
                fontWeight="700"
                textAnchor={isHorizontal ? "middle" : "start"} 
                fill={isHighlighted ? "#0066cc" : "#1a1a1a"}
              >
                {comp.id}
              </text>
              <text 
                y={isHorizontal ? 30 : resistorLength/2 + 2} 
                x={isHorizontal ? 0 : 20}
                fontSize={fontSizeValue} 
                fontWeight="600"
                textAnchor={isHorizontal ? "middle" : "start"} 
                fill={isUnknown ? "#D97706" : isHighlighted ? "#0066cc" : "#666666"}
              >
                {isUnknown ? "? Ω" : `${comp.value} Ω`}
              </text>
        </g>
      </g>
    );
  };

  const renderWire = (wire: Wire) => {
    const node1 = nodes.find(n => n.id === wire.from);
    const node2 = nodes.find(n => n.id === wire.to);
    if (!node1 || !node2) return null;

    const x1 = toSvgX(node1.x);
    const y1 = toSvgY(node1.y);
    const x2 = toSvgX(node2.x);
    const y2 = toSvgY(node2.y);

    return (
      <g key={wire.id}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinecap="square"
        />
      </g>
    );
  };

  const renderNode = (node: GridNode) => {
    const x = toSvgX(node.x);
    const y = toSvgY(node.y);
    const isSelected = selectedNodes.includes(node.id);
    const isHovered = hoveredNodeId === node.id;

    return (
      <circle
        key={node.id}
        cx={x}
        cy={y}
        r={isSelected || isHovered ? 6 : 4}
        fill={isSelected ? '#0066cc' : isHovered ? '#93c5fd' : (node.type === 'junction' ? 'transparent' : '#ffffff')}
        stroke={isSelected ? '#0066cc' : isHovered ? '#0066cc' : 'transparent'}
        strokeWidth={isSelected || isHovered ? 3 : 1.5}
        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={() => onNodeClick(node.id)}
        onMouseEnter={() => setHoveredNodeId(node.id)}
        onMouseLeave={() => setHoveredNodeId(null)}
      />
    );
  };

  return (
    <svg 
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} 
      width="100%" 
      height="100%"
      style={{ background: '#ffffff', borderRadius: '12px' }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background patterns: subtle dot grid */}
      <defs>
        <pattern id="dotGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#f0f0f0" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotGrid)" />

      {/* Wiring layer */}
      {wires.map(renderWire)}

      {/* Nodes layer (invisible clickable areas mostly) */}
      {nodes.map(renderNode)}

      {/* Components layer */}
      {renderVoltageSource()}
      {components.filter(c => c.type === 'resistor').map(renderResistor)}
    </svg>
  );
};


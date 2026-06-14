import { useState } from 'react';
import type { Circuit, SimplificationStep, TopologyNode, ProblemConfig, ProblemMode } from '../types/circuit';
import * as katex from 'katex';
import { getCircuitPrecision, formatSigFigs } from '../utils/physics';
import 'katex/dist/katex.min.css';
import './EducationalHints.css';

interface EducationalHintsProps {
  circuit: Circuit;
  onHighlightComponents: (componentIds: string[]) => void;
  problemConfig?: ProblemConfig;
}

const MathDisplay: React.FC<{ latex: string }> = ({ latex }) => {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: false
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

interface InstructionItemProps {
  icon: string;
  text: string;
  hint: string;
  hasLatex?: boolean;
}

const InstructionItem: React.FC<InstructionItemProps> = ({ icon, text, hint, hasLatex }) => {
  const [expanded, setExpanded] = useState(false);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  return (
    <li className="instruction-item">
      <button
        className="instruction-button"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={handleKeyDown}
      >
        <span className="instruction-icon">{icon}</span>
        <span className="instruction-text">{text}</span>
        <span className={`instruction-arrow${expanded ? ' expanded' : ''}`}>▼</span>
      </button>
      {expanded && (
        <div className="instruction-hint">
          {hasLatex ? <MathDisplay latex={hint} /> : hint}
        </div>
      )}
    </li>
  );
};

const getInstructionsForMode = (mode: ProblemMode, unknownId?: string): InstructionItemProps[] => {
  switch (mode) {
    case 'classic':
      return [
        { icon: '1', text: 'Bepaal de vervangingsweerstand van het circuit', hint: 'Vereenvoudig stap voor stap: combineer serie- en parallelweerstanden' },
        { icon: '2', text: 'Bereken de totale stroom door het circuit', hint: '\\text{Gebruik de wet van Ohm: } I_{totaal} = \\frac{V_{bron}}{R_{totaal}}', hasLatex: true },
        { icon: '3', text: 'Bepaal de spanning over elke weerstand', hint: '\\text{Serie: } V = I \\cdot R \\quad \\text{Parallel: spanning is gelijk over alle takken}', hasLatex: true },
        { icon: '4', text: 'Bereken de stroom door elke weerstand', hint: '\\text{Gebruik } I = \\frac{V}{R} \\text{ voor elke weerstand}', hasLatex: true }
      ];
    case 'find_resistor':
      return [
        { icon: '1', text: `Vind de waarde van ${unknownId || 'de onbekende weerstand'}`, hint: 'Je moet terugrekenen vanuit de gegeven informatie.' },
        { icon: '2', text: 'Bereken eerst R_totaal', hint: '\\text{Gebruik } R_{totaal} = \\frac{V_{bron}}{I_{totaal}}', hasLatex: true },
        { icon: '3', text: 'Stel een vergelijking op voor R_totaal', hint: '\\text{Druk } R_{totaal} \\text{ uit in de bekende weerstanden en } R_{onbekend}', hasLatex: true },
        { icon: '4', text: 'Los de vergelijking op naar de onbekende', hint: 'Isoleer de onbekende variabele aan één kant van de vergelijking.' }
      ];
    case 'find_voltage':
      return [
        { icon: '1', text: 'Vind de bronspanning', hint: 'Bereken de spanning die nodig is om de gegeven stroom te veroorzaken.' },
        { icon: '2', text: 'Bereken eerst R_totaal', hint: 'Vervang de hele schakeling door één vervangingsweerstand.' },
        { icon: '3', text: 'Gebruik V = I × R', hint: 'V_{bron} = I_{totaal} \\cdot R_{totaal}', hasLatex: true }
      ];
    case 'find_current':
      return [
        { icon: '1', text: 'Vind de totale stroom', hint: 'Gebruik de bronspanning en de totale weerstand.' },
        { icon: '2', text: 'Bereken eerst R_totaal', hint: 'Vervang de hele schakeling door één vervangingsweerstand.' },
        { icon: '3', text: 'Gebruik I = V / R', hint: 'I_{totaal} = \\frac{V_{bron}}{R_{totaal}}', hasLatex: true }
      ];
    default:
      return [];
  }
};

export const EducationalHints: React.FC<EducationalHintsProps> = ({
  circuit,
  onHighlightComponents,
  problemConfig
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const getSteps = (rootNode: TopologyNode | undefined): SimplificationStep[] => {
    if (!rootNode || rootNode.type === 'resistor') return [];

    const steps: SimplificationStep[] = [];
    let stepCounter = 1;
    const precision = getCircuitPrecision(circuit);

    const simplify = (n: TopologyNode): { name: string, val: number, allIds: string[] } => {
      if (n.type === 'resistor') {
        const comp = circuit.components.find(c => c.id === n.resistorId);
        return { name: n.resistorId!, val: comp?.value || 0, allIds: [n.resistorId!] };
      }

      const childResults = n.children!.map(c => simplify(c));
      const childNames = childResults.map(cr => cr.name);
      const childVals = childResults.map(cr => cr.val);
      const allIds = childResults.flatMap(cr => cr.allIds);

      let eqValue = 0;
      let explanation = '';
      let textExplanation = '';
      let latexFormula = '';
      const stepName = `R_v${stepCounter++}`;

      if (n.type === 'series') {
        eqValue = childVals.reduce((a, b) => a + b, 0);
        const eqValStr = formatSigFigs(eqValue, precision, false);
        const childValStrList = childVals.map(v => formatSigFigs(v, precision, false));
        
        explanation = `Vervang ${childNames.join(' en ')} (staan in serie):\n${stepName} = ${childValStrList.join(' + ')} = ${eqValStr} Ω`;

        const latexStepName = `R_{v${stepName.slice(3)}}`;
        const latexValStrs = childVals.map(v => formatSigFigs(v, precision, true)).join(' + ');

        latexFormula = `${latexStepName} = ${latexValStrs} = ${formatSigFigs(eqValue, precision, true)} \\, \\Omega`;
        textExplanation = `Vervang ${childNames.join(' en ')} (staan in serie):`;

        steps.push({ type: 'series', components: allIds, equivalentValue: eqValue, explanation, latexFormula, textExplanation });
      } else if (n.type === 'parallel') {
        const invSum = childVals.reduce((a, b) => a + (b === 0 ? 0 : 1/b), 0);
        eqValue = invSum === 0 ? 0 : 1 / invSum;
        const eqValStr = formatSigFigs(eqValue, precision, false);
        const childValStrList = childVals.map(v => `1/${formatSigFigs(v, precision, false)}`);

        explanation = `Vervang ${childNames.join(' en ')} (staan parallel):\n1/${stepName} = ${childValStrList.join(' + ')} → ${stepName} = ${eqValStr} Ω`;

        const latexFractions = childVals.map(v => `\\frac{1}{${formatSigFigs(v, precision, true)}}`).join(' + ');
        const latexStepName = `R_{v${stepName.slice(3)}}`;

        latexFormula = `\\frac{1}{${latexStepName}} = ${latexFractions} \\rightarrow ${latexStepName} = ${formatSigFigs(eqValue, precision, true)} \\, \\Omega`;
        textExplanation = `Vervang ${childNames.join(' en ')} (staan parallel):`;

        steps.push({ type: 'parallel', components: allIds, equivalentValue: eqValue, explanation, latexFormula, textExplanation });
      }

      return { name: stepName, val: eqValue, allIds };
    };

    simplify(rootNode);
    return steps;
  };

  const steps = getSteps(circuit.topology);

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    onHighlightComponents(steps[stepIndex]?.components || []);
  };

  if (!showHints) {
    return (
      <div style={{ marginTop: 'var(--space-5)' }}>
        <button className="hints-toggle" onClick={() => setShowHints(true)}>
          Hulp bij oplossen
        </button>
        <p className="hints-hint-text">Klik voor stap-voor-stap uitleg.</p>
      </div>
    );
  }

  const instructions = problemConfig ? getInstructionsForMode(problemConfig.mode, problemConfig.unknownComponentId) : getInstructionsForMode('classic');

  return (
    <div className="hints-panel">
      <div className="hints-header">
        <h3>Oploshints</h3>
        <button
          className="hints-close"
          onClick={() => {
            setShowHints(false);
            onHighlightComponents([]);
          }}
        >
          Sluiten
        </button>
      </div>

      <div className="instructions-section">
        <h4 className="instructions-title">Wat moet je berekenen?</h4>
        <ul className="instructions-list">
          {instructions.map((inst, idx) => (
            <InstructionItem key={idx} {...inst} />
          ))}
        </ul>
      </div>

      {steps.length === 0 ? (
        <p className="empty-state">Vul eerst een schakeling met meerdere weerstanden in. Deze schakeling kan niet verder vereenvoudigd worden.</p>
      ) : (
        <div className="steps-list">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step-card${currentStep === index ? ' active' : ''}`}
              onClick={() => handleStepClick(index)}
            >
              <div className="step-header">
                <span className={`step-badge ${step.type}`}>{step.type === 'series' ? 'Serie' : 'Parallel'}</span>
                <span className="step-number">Stap {index + 1}</span>
              </div>
              <div className="step-content">
                <div className="step-explanation">
                  <MathDisplay latex={`${(step.textExplanation || step.explanation.split('\n')[0])
                    .replace(/R_v(\d+)/g, 'R_{v$1}')
                    .replace(/R(\d+)/g, 'R_{$1}')
                    .split(/(R_{v?\d+})/)
                    .map(part => part.startsWith('R_{') ? part : `\\text{${part}}`)
                    .join('')}`} />
                </div>
                {step.latexFormula && (
                  <div className="step-formula">
                    <MathDisplay latex={step.latexFormula} />
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="memory-aid">
            <h4>Geheugensteuntje</h4>
            <ul>
              <li><strong>Serie:</strong> Tel de waarden gewoon op.</li>
              <li><strong>Parallel:</strong> Gebruik de omgekeerden (1/R).</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

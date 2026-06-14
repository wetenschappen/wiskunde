import { useState, useCallback, useEffect } from 'react';
import type { Circuit, SolverResult, ProblemConfig, ProblemMode } from './types/circuit';
import { createPresetCircuit } from './presets/templates';
import { solveCircuit } from './circuit/solver';
import { CircuitCanvas } from './components/CircuitCanvas';
import { ControlPanel } from './components/ControlPanel';
import { EducationalHints } from './components/EducationalHints';
import './App.css';

function App() {
  const [currentProblemId, setCurrentProblemId] = useState<string>('problem-1');
  const [circuit, setCircuit] = useState<Circuit>(() => createPresetCircuit('problem-1'));
  const [results, setResults] = useState<SolverResult | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [highlightedComponents, setHighlightedComponents] = useState<string[]>([]);
  const [problemConfig, setProblemConfig] = useState<ProblemConfig>({ mode: 'classic' });

  const handleProblemModeChange = useCallback((mode: ProblemMode) => {
    setProblemConfig(prev => ({ 
      ...prev, 
      mode, 
      unknownComponentId: undefined,
      givenTotalCurrent: undefined,
      givenTotalResistance: undefined
    }));
    setResults(null);
  }, []);

  const handleUnknownResistorChange = useCallback((componentId: string) => {
    setProblemConfig(prev => ({ ...prev, unknownComponentId: componentId }));
  }, []);

  const handleGivenTotalResistanceChange = useCallback((value: number) => {
    setProblemConfig(prev => ({ ...prev, givenTotalResistance: value }));
  }, []);

  const handleGivenTotalCurrentChange = useCallback((value: number) => {
    setProblemConfig(prev => ({ ...prev, givenTotalCurrent: value }));
  }, []);

  const handleProblemChange = useCallback((problemId: string) => {
    setCurrentProblemId(problemId);
    const newCircuit = createPresetCircuit(problemId);
    setCircuit(newCircuit);
    setResults(null);
    setSelectedNodes([]);
    setHighlightedComponents([]);
  }, []);

  const handleUpdateCircuit = useCallback((newCircuit: Circuit) => {
    setCircuit(newCircuit);
  }, []);

  // Auto-solve when circuit values change if we already have results
  useEffect(() => {
    if (results) {
      const newResults = solveCircuit(circuit);
      setResults(newResults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuit.components, circuit.voltageSource.value]);

  const handleSolve = useCallback(() => {
    const solution = solveCircuit(circuit);
    setResults(solution);
  }, [circuit]);

  const handleReset = useCallback(() => {
    const freshCircuit = createPresetCircuit(currentProblemId);
    setCircuit(freshCircuit);
    setResults(null);
    setSelectedNodes([]);
    setHighlightedComponents([]);
  }, [currentProblemId]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      }
      if (prev.length >= 2) {
        return [nodeId];
      }
      return [...prev, nodeId];
    });
  }, []);

  const handleHighlightComponents = useCallback((componentIds: string[]) => {
    setHighlightedComponents(componentIds);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gelijkstroomschakelingen</h1>
        <div className="subtitle">| Serie- en Parallelschakelingen</div>
      </header>

      <main className="app-main">
        <div className="circuit-section">
          <div className="canvas-container">
            <CircuitCanvas
              circuit={circuit}
              selectedNodes={selectedNodes}
              onNodeClick={handleNodeClick}
              problemConfig={problemConfig}
              highlightedComponents={highlightedComponents}
            />
          </div>
          
          {highlightedComponents.length > 0 && (
            <div className="highlight-banner">
              Gemarkeerd: {highlightedComponents.join(', ')}
            </div>
          )}

          <div className="hints-section">
            <EducationalHints
              circuit={circuit}
              onHighlightComponents={handleHighlightComponents}
              problemConfig={problemConfig}
            />
          </div>
        </div>

        <div className="control-section">
          <ControlPanel
            circuit={circuit}
            currentProblemId={currentProblemId}
            onProblemChange={handleProblemChange}
            onUpdateCircuit={handleUpdateCircuit}
            onSolve={handleSolve}
            onReset={handleReset}
            results={results}
            problemConfig={problemConfig}
            onProblemModeChange={handleProblemModeChange}
            onUnknownResistorChange={handleUnknownResistorChange}
            onGivenTotalResistanceChange={handleGivenTotalResistanceChange}
            onGivenTotalCurrentChange={handleGivenTotalCurrentChange}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Ontwikkeld door Albert Shalaj © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default App;
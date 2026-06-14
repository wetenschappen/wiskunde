import type { Circuit, SolverResult, ProblemConfig, ProblemMode } from '../types/circuit';
import { MAX_RESISTORS } from '../types/circuit';
import { getAllProblems, getProblemByNumber } from '../presets/catalog';
import { solveForUnknownResistor } from '../circuit/solver';
import { useState, useEffect, useCallback } from 'react';
import * as katex from 'katex';
import { getCircuitPrecision, formatSigFigs } from '../utils/physics';
import './ControlPanel.css';

const MathDisplay: React.FC<{ latex: string }> = ({ latex }) => {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: false
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const parseNumber = (value: string): number | undefined => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};

/**
 * A number input that allows the user to fully clear the field.
 * Maintains a local string state so backspacing through all digits works.
 * Commits valid positive numbers to the parent on change; restores last
 * valid value on blur if the field is left empty.
 */
const EditableNumberInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}> = ({ value, onChange, min, max, step, className }) => {
  const [localValue, setLocalValue] = useState<string>(String(value));

  // Sync local state when the external value changes (e.g. problem switch, reset)
  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);

    // Commit to parent if it's a valid positive number
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed > 0) {
      onChange(parsed);
    }
  }, [onChange]);

  const handleBlur = useCallback(() => {
    const parsed = parseFloat(localValue);
    if (isNaN(parsed) || parsed <= 0) {
      // Restore the last valid value from the parent
      setLocalValue(String(value));
    }
  }, [localValue, value]);

  return (
    <input
      type="number"
      className={className}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      min={min}
      max={max}
      step={step}
    />
  );
};

interface ControlPanelProps {
  circuit: Circuit;
  currentProblemId: string;
  onProblemChange: (problemId: string) => void;
  onUpdateCircuit: (circuit: Circuit) => void;
  onSolve: () => void;
  onReset: () => void;
  results?: SolverResult | null;
  problemConfig: ProblemConfig;
  onProblemModeChange: (mode: ProblemMode) => void;
  onUnknownResistorChange: (componentId: string) => void;
  onGivenTotalResistanceChange: (value: number) => void;
  onGivenTotalCurrentChange: (value: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  circuit,
  currentProblemId,
  onProblemChange,
  onUpdateCircuit,
  onSolve,
  onReset,
  results,
  problemConfig,
  onProblemModeChange,
  onUnknownResistorChange,
  onGivenTotalResistanceChange,
  onGivenTotalCurrentChange
}) => {
  const allProblems = getAllProblems();
  const [jumpNumber, setJumpNumber] = useState<string>('');

  const handleVoltageChange = useCallback((value: number) => {
    onUpdateCircuit({
      ...circuit,
      voltageSource: { ...circuit.voltageSource, value }
    });
  }, [circuit, onUpdateCircuit]);

  const handleResistorValueChange = useCallback((id: string, value: number) => {
    const newComponents = circuit.components.map(c => c.id === id ? { ...c, value } : c);
    onUpdateCircuit({ ...circuit, components: newComponents });
  }, [circuit, onUpdateCircuit]);

  const handleJumpToProblem = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpNumber);
    if (!isNaN(num)) {
      const problem = getProblemByNumber(num);
      if (problem) {
        onProblemChange(problem.id);
        setJumpNumber('');
      }
    }
  };

  const groupedProblems = Array.from({ length: MAX_RESISTORS }, (_, i) => i + 1)
    .map(count => ({
      count,
      problems: allProblems.filter(p => p.resistorCount === count)
    }))
    .filter(group => group.problems.length > 0);

  return (
    <div className="control-panel">
      <h2>Schakeling Instellen</h2>

      <div className="form-group">
        <label className="form-label">Kies een oefening</label>
        <form onSubmit={handleJumpToProblem} className="jump-form">
          <input
            type="number"
            className="form-input"
            placeholder="Typ een nummer..."
            value={jumpNumber}
            onChange={(e) => setJumpNumber(e.target.value)}
            min="1"
            max={allProblems.length}
          />
          <button type="submit" className="btn-goto">Ga</button>
        </form>
        <select
          className="form-select"
          value={currentProblemId}
          onChange={(e) => onProblemChange(e.target.value)}
        >
          {groupedProblems.map(group => (
            <optgroup key={group.count} label={`${group.count} weerstand${group.count > 1 ? 'en' : ''}`}>
              {group.problems.map(problem => (
                <option key={problem.id} value={problem.id}>
                  Oefening {problem.number}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <hr className="divider" />

      <div className="form-group">
        <label className="form-label">Type opgave</label>
        <select
          className="form-select"
          value={problemConfig.mode}
          onChange={(e) => onProblemModeChange(e.target.value as ProblemMode)}
        >
          <option value="classic">Klassiek: Bereken stroom en spanning</option>
          <option value="find_resistor">Vind onbekende weerstand (R = ?)</option>
          <option value="find_voltage">Vind bronspanning (V = ?)</option>
          <option value="find_current">Vind totale stroom (I = ?)</option>
        </select>
      </div>

      {problemConfig.mode === 'find_resistor' && (
        <div className="form-group">
          <label className="form-label">Welke weerstand is onbekend?</label>
          <select
            className="form-select"
            value={problemConfig.unknownComponentId || ''}
            onChange={(e) => onUnknownResistorChange(e.target.value)}
          >
            <option value="">-- Kies een weerstand --</option>
            {circuit.components.filter(c => c.type === 'resistor').map(c => (
              <option key={c.id} value={c.id}>{c.id}</option>
            ))}
          </select>

          <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>Gegeven totale stroom (A)</label>
          <input
            type="number"
            className="form-input"
            value={problemConfig.givenTotalCurrent ?? ''}
            onChange={(e) => onGivenTotalCurrentChange(parseNumber(e.target.value) ?? 0)}
            placeholder="bijv. 2.5"
          />

          <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>Of gegeven totale weerstand (Ω)</label>
          <input
            type="number"
            className="form-input"
            value={problemConfig.givenTotalResistance ?? ''}
            onChange={(e) => onGivenTotalResistanceChange(parseNumber(e.target.value) ?? 0)}
            placeholder="bijv. 150"
          />
        </div>
      )}

      {problemConfig.mode === 'find_voltage' && (
        <div className="form-group">
          <label className="form-label">Gegeven totale stroom (A)</label>
          <input
            type="number"
            className="form-input"
            value={problemConfig.givenTotalCurrent ?? ''}
            onChange={(e) => onGivenTotalCurrentChange(parseNumber(e.target.value) ?? 0)}
            placeholder="bijv. 1.2"
          />
        </div>
      )}

      <hr className="divider" />

      <div className="voltage-control">
        <label className="form-label">Bronspanning (U)</label>
        <div className="voltage-display">
          {problemConfig.mode === 'find_voltage' ? (
            <span className="voltage-unknown">? V</span>
          ) : (
            <>
              <EditableNumberInput
                className="value"
                value={circuit.voltageSource.value}
                onChange={handleVoltageChange}
                min={0}
                max={100}
                step={0.5}
              />
              <span className="unit">V</span>
            </>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Weerstandswaarden</label>
        <div className="resistor-grid">
          {circuit.components.filter(c => c.type === 'resistor').map((comp) => {
            const isUnknown = problemConfig.mode === 'find_resistor' && problemConfig.unknownComponentId === comp.id;
            return (
              <div key={comp.id} className={`resistor-item${isUnknown ? ' is-unknown' : ''}`}>
                <span className="label">{comp.id}</span>
                {isUnknown ? (
                  <span className="unknown">? Ω</span>
                ) : (
                  <>
                    <EditableNumberInput
                      className="value"
                      value={comp.value}
                      onChange={(v) => handleResistorValueChange(comp.id, v)}
                      min={0.1}
                      max={10000}
                      step={1}
                    />
                    <span className="unit">Ω</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-primary" onClick={onSolve}>
          Bereken Uitkomst
        </button>
      </div>
      <div style={{ height: '0.75rem' }} />
      <button className="btn btn-secondary" onClick={onReset}>
        Nieuwe start
      </button>

      {results && (
        <div className="results-section">
          <h3 className="results-title">Meetresultaten</h3>

          {problemConfig.mode === 'find_resistor' && problemConfig.unknownComponentId && (
            (() => {
              const targetR = problemConfig.givenTotalResistance ||
                (circuit.voltageSource.value > 0 && problemConfig.givenTotalCurrent ?
                  circuit.voltageSource.value / problemConfig.givenTotalCurrent : undefined);
              const solved = targetR ? solveForUnknownResistor(circuit, problemConfig.unknownComponentId, targetR) : null;
              const precision = getCircuitPrecision(circuit);
              return (
                <div className="solution-box">
                  Oplossing: {problemConfig.unknownComponentId} = {solved?.isValid ? `${formatSigFigs(solved.unknownResistorValue, precision, false)} Ω` : 'Kan niet berekend worden'}
                </div>
              );
            })()
          )}
          {problemConfig.mode === 'find_voltage' && problemConfig.givenTotalCurrent && (
            <div className="solution-box">
              Oplossing: Bronspanning = {results.equivalentResistance === Infinity
                ? 'Oneindig (geen stroom mogelijk)'
                : `${formatSigFigs(problemConfig.givenTotalCurrent * results.equivalentResistance, getCircuitPrecision(circuit), false)} V`}
            </div>
          )}
          {problemConfig.mode === 'find_current' && (
            <div className="solution-box">
              Oplossing: Totale stroom = {formatSigFigs(results.totalCurrent * 1000, getCircuitPrecision(circuit), false)} mA
            </div>
          )}

          {problemConfig.mode === 'classic' && (
            <table className="results-table">
              <thead>
                <tr>
                  <th>C.</th>
                  <th>Spanning</th>
                  <th>Stroom</th>
                </tr>
              </thead>
              <tbody>
                {circuit.components.filter(c => c.type === 'resistor').map(comp => {
                  const precision = getCircuitPrecision(circuit);
                  return (
                    <tr key={comp.id}>
                      <td className="component-id">{comp.id}</td>
                      <td className="voltage">
                        <MathDisplay latex={`${formatSigFigs(results.componentVoltages.get(comp.id) || 0, precision, true)} \\, \\text{V}`} />
                      </td>
                      <td className="current">
                        <MathDisplay latex={`${formatSigFigs((results.branchCurrents.get(comp.id) || 0) * 1000, precision, true)} \\, \\text{mA}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

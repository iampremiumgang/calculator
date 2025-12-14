import React, { useState, useEffect, useCallback } from 'react';
import { CalculatorMode, CalculatorState, HistoryItem } from './types';
import Display from './components/Display';
import Button from './components/Button';
import History from './components/History';
import { solveWithGemini } from './services/gemini';
import { 
  History as HistoryIcon, 
  Settings, 
  Delete, 
  Sparkles,
  Calculator as CalcIcon,
  Sigma
} from 'lucide-react';

// Safe evaluation function for basic math
const safeEvaluate = (expression: string): string => {
  try {
    // Sanitize: allow numbers, operators, parens, decimal, and basic Math functions
    const sanitized = expression.replace(/[^0-9+\-*/().^%a-zMath\s]/gi, '');
    
    // Replace common symbols
    const parsed = sanitized
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/π/g, 'Math.PI')
      .replace(/e/g, 'Math.E');

    // Use Function constructor for constrained evaluation
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${parsed}`)();
    
    if (!isFinite(result) || isNaN(result)) return "Error";
    
    // Format precision
    return Number(result.toPrecision(12)).toString().replace(/\.?0+$/, '');
  } catch (e) {
    return "Error";
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    input: '',
    result: '',
    history: [],
    mode: CalculatorMode.BASIC,
    error: null,
    isLoading: false
  });
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nova-calc-history');
    if (saved) {
      try {
        setState(prev => ({ ...prev, history: JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  // Save history to local storage on change
  useEffect(() => {
    localStorage.setItem('nova-calc-history', JSON.stringify(state.history));
  }, [state.history]);

  const handleClear = () => {
    setState(prev => ({ ...prev, input: '', result: '', error: null }));
  };

  const handleDelete = () => {
    setState(prev => ({ ...prev, input: prev.input.slice(0, -1) }));
  };

  const handleInput = (val: string) => {
    setState(prev => {
      // Prevent multiple decimals in a number segment (simplified check)
      if (val === '.' && prev.input.endsWith('.')) return prev;
      return { ...prev, input: prev.input + val };
    });
  };

  const calculate = useCallback(async () => {
    const { input, mode } = state;
    if (!input) return;

    // AI Mode
    if (mode === CalculatorMode.AI) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const aiResponse = await solveWithGemini(input);
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          expression: input,
          result: aiResponse.result,
          timestamp: Date.now(),
          isAi: true
        };
        
        setState(prev => ({
          ...prev,
          input: '',
          result: aiResponse.result,
          history: [newItem, ...prev.history],
          isLoading: false
        }));
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          error: "AI Error", 
          isLoading: false 
        }));
      }
      return;
    }

    // Basic/Scientific Mode
    const result = safeEvaluate(input);
    if (result === "Error") {
      setState(prev => ({ ...prev, error: "Syntax Error" }));
    } else {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: input,
        result: result,
        timestamp: Date.now()
      };
      setState(prev => ({
        ...prev,
        input: '',
        result: result,
        history: [newItem, ...prev.history]
      }));
    }
  }, [state.input, state.mode]); // Only depend on input and mode, state is handled by functional updates

  // Handle Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.mode === CalculatorMode.AI) return; // Let user type normally in AI mode if we had a text input (simulated here)

      const key = e.key;
      
      if (/[0-9.]/.test(key)) handleInput(key);
      if (['+', '-', '*', '/', '(', ')', '%', '^'].includes(key)) handleInput(key);
      if (key === 'Enter') { e.preventDefault(); calculate(); }
      if (key === 'Backspace') handleDelete();
      if (key === 'Escape') handleClear();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calculate, state.mode]); // Added calculate and state.mode to dependencies

  // Toggle Mode
  const toggleMode = (newMode: CalculatorMode) => {
    setState(prev => ({ ...prev, mode: newMode }));
  };

  // Render Keypad Grid
  const renderKeypad = () => {
    const isSci = state.mode === CalculatorMode.SCIENTIFIC;
    
    return (
      <div className={`grid gap-3 transition-all duration-300 ${isSci ? 'grid-cols-5' : 'grid-cols-4'}`}>
        
        {/* Row 1: Clear, Sci Ops, Div */}
        <Button label="AC" onClick={handleClear} variant="danger" className={isSci ? "" : "col-span-1"} />
        {isSci && <Button label="sin" onClick={() => handleInput('sin(')} variant="secondary" />}
        {isSci && <Button label="cos" onClick={() => handleInput('cos(')} variant="secondary" />}
        <Button label={<Delete size={24} />} onClick={handleDelete} variant="secondary" />
        <Button label="÷" onClick={() => handleInput('/')} variant="accent" />

        {/* Row 2: 7-9, Mul */}
        {isSci && <Button label="tan" onClick={() => handleInput('tan(')} variant="secondary" />}
        <Button label="7" onClick={() => handleInput('7')} />
        <Button label="8" onClick={() => handleInput('8')} />
        <Button label="9" onClick={() => handleInput('9')} />
        <Button label="×" onClick={() => handleInput('*')} variant="accent" />

        {/* Row 3: 4-6, Sub */}
        {isSci && <Button label="ln" onClick={() => handleInput('ln(')} variant="secondary" />}
        <Button label="4" onClick={() => handleInput('4')} />
        <Button label="5" onClick={() => handleInput('5')} />
        <Button label="6" onClick={() => handleInput('6')} />
        <Button label="-" onClick={() => handleInput('-')} variant="accent" />

        {/* Row 4: 1-3, Add */}
        {isSci && <Button label="log" onClick={() => handleInput('log(')} variant="secondary" />}
        <Button label="1" onClick={() => handleInput('1')} />
        <Button label="2" onClick={() => handleInput('2')} />
        <Button label="3" onClick={() => handleInput('3')} />
        <Button label="+" onClick={() => handleInput('+')} variant="accent" />

        {/* Row 5: 0, Dot, Equals */}
        {isSci && <Button label="π" onClick={() => handleInput('π')} variant="secondary" />}
        <Button label="0" onClick={() => handleInput('0')} className="col-span-2" />
        <Button label="." onClick={() => handleInput('.')} />
        <Button label="=" onClick={calculate} variant="primary" />
        
        {/* Extra Sci Row if needed */}
        {isSci && (
          <>
            <Button label="(" onClick={() => handleInput('(')} variant="secondary" />
            <Button label=")" onClick={() => handleInput(')')} variant="secondary" />
            <Button label="^" onClick={() => handleInput('^')} variant="secondary" />
            <Button label="√" onClick={() => handleInput('sqrt(')} variant="secondary" />
            <Button label="e" onClick={() => handleInput('e')} variant="secondary" />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans text-gray-100 selection:bg-blue-500/30">
      
      {/* Main Container */}
      <div className="relative w-full max-w-lg bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-800 p-6 md:p-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-full">
            <button
              onClick={() => toggleMode(CalculatorMode.BASIC)}
              className={`p-2 rounded-full transition-all ${state.mode === CalculatorMode.BASIC ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              title="Basic Mode"
            >
              <CalcIcon size={18} />
            </button>
            <button
              onClick={() => toggleMode(CalculatorMode.SCIENTIFIC)}
              className={`p-2 rounded-full transition-all ${state.mode === CalculatorMode.SCIENTIFIC ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              title="Scientific Mode"
            >
              <Sigma size={18} />
            </button>
            <button
              onClick={() => toggleMode(CalculatorMode.AI)}
              className={`p-2 rounded-full transition-all ${state.mode === CalculatorMode.AI ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-400 hover:text-purple-300'}`}
              title="AI Mode"
            >
              <Sparkles size={18} />
            </button>
          </div>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <HistoryIcon size={24} />
          </button>
        </div>

        {/* Display */}
        <Display 
          input={state.input} 
          result={state.result} 
          mode={state.mode}
          isLoading={state.isLoading}
        />

        {/* AI Input Area (Alternative to Keypad for AI Mode) */}
        {state.mode === CalculatorMode.AI ? (
          <div className="h-[420px] flex flex-col gap-4">
             <div className="flex-1 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700 p-4 flex flex-col justify-center items-center text-center text-gray-400">
               <Sparkles size={48} className="mb-4 text-purple-500/50" />
               <p className="text-sm px-4">
                 Enter any math problem, conversion, or question. <br/>
                 <span className="text-purple-400">"Volume of a sphere with radius 5"</span>
               </p>
             </div>
             
             <div className="flex gap-2">
               <input 
                  type="text" 
                  className="flex-1 bg-gray-800 border-gray-700 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Ask Gemini..."
                  value={state.input}
                  onChange={(e) => setState(prev => ({...prev, input: e.target.value}))}
                  onKeyDown={(e) => e.key === 'Enter' && calculate()}
               />
               <button 
                 onClick={calculate}
                 disabled={state.isLoading || !state.input}
                 className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl px-6 font-bold shadow-lg shadow-purple-900/20 transition-all"
               >
                 GO
               </button>
             </div>
             
             {/* Quick Actions / Suggestions */}
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setState(prev => ({...prev, input: "Solve 2x + 5 = 15"}))} className="whitespace-nowrap px-3 py-2 bg-gray-800 rounded-xl text-xs hover:bg-gray-700 transition">Solve Equation</button>
                <button onClick={() => setState(prev => ({...prev, input: "Convert 150 lbs to kg"}))} className="whitespace-nowrap px-3 py-2 bg-gray-800 rounded-xl text-xs hover:bg-gray-700 transition">Unit Conversion</button>
                <button onClick={() => setState(prev => ({...prev, input: "Derivative of x^2"}))} className="whitespace-nowrap px-3 py-2 bg-gray-800 rounded-xl text-xs hover:bg-gray-700 transition">Calculus</button>
             </div>
          </div>
        ) : (
          /* Standard Keypad */
          <div className="h-[420px] overflow-y-auto custom-scrollbar">
             {renderKeypad()}
          </div>
        )}

      </div>

      {/* History Sidebar */}
      <History 
        history={state.history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={(item) => {
          setState(prev => ({ ...prev, input: item.expression, mode: item.isAi ? CalculatorMode.AI : prev.mode }));
          setIsHistoryOpen(false);
        }}
        onClear={() => setState(prev => ({ ...prev, history: [] }))}
      />
      
      {/* Overlay for mobile history */}
      {isHistoryOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
import React, { useEffect, useRef } from 'react';
import { CalculatorMode } from '../types';

interface DisplayProps {
  input: string;
  result: string;
  mode: CalculatorMode;
  isLoading: boolean;
}

const Display: React.FC<DisplayProps> = ({ input, result, mode, isLoading }) => {
  const inputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to end of input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [input]);

  // Dynamic font size based on length
  const getInputFontSize = () => {
    if (input.length > 20) return 'text-2xl';
    if (input.length > 12) return 'text-3xl';
    return 'text-5xl';
  };

  return (
    <div className="flex flex-col items-end justify-end w-full h-40 md:h-48 p-6 bg-gray-900/50 rounded-3xl border border-gray-800/50 mb-4 relative overflow-hidden">
      {/* Mode Indicator */}
      <div className="absolute top-4 left-4">
        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
          mode === CalculatorMode.AI ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
          mode === CalculatorMode.SCIENTIFIC ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
          'bg-gray-700/50 text-gray-400'
        }`}>
          {mode === CalculatorMode.AI ? 'Gemini AI' : mode}
        </span>
      </div>

      {/* Main Input */}
      <div 
        ref={inputRef}
        className={`w-full text-right font-mono font-light tracking-tight text-white whitespace-nowrap overflow-x-auto overflow-y-hidden no-scrollbar pb-1 transition-all duration-200 ${getInputFontSize()}`}
      >
        {input || '0'}
      </div>

      {/* Result Preview or Loading State */}
      <div className="h-8 mt-2 w-full flex justify-end items-center">
        {isLoading ? (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        ) : (
          <span className="text-gray-400 text-xl font-medium truncate max-w-full">
            {result ? `= ${result}` : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default Display;
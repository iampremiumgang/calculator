import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2, Sparkles, X } from 'lucide-react';

interface HistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelect, onClear, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-full md:w-80 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-2 text-gray-100">
          <Clock size={20} />
          <h2 className="text-lg font-semibold">History</h2>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={onClear}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-red-400 transition-colors"
            title="Clear History"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-3 custom-scrollbar">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
            <Clock size={48} className="mb-4" />
            <p>No history yet</p>
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full bg-gray-800/50 hover:bg-gray-800 p-4 rounded-xl text-left transition-all duration-200 group border border-transparent hover:border-gray-700"
            >
              <div className="text-sm text-gray-400 mb-1 flex items-center gap-2 truncate">
                {item.isAi && <Sparkles size={12} className="text-purple-400" />}
                <span className="truncate">{item.expression}</span>
              </div>
              <div className="text-xl text-white font-medium text-right group-hover:text-blue-400 transition-colors">
                = {item.result}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
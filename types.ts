export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  isAi?: boolean;
}

export enum CalculatorMode {
  BASIC = 'BASIC',
  SCIENTIFIC = 'SCIENTIFIC',
  AI = 'AI'
}

export interface CalculatorState {
  input: string;
  result: string;
  history: HistoryItem[];
  mode: CalculatorMode;
  error: string | null;
  isLoading: boolean;
}
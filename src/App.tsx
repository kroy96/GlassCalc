/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Delete, RotateCcw, History, X, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  equation: string;
  result: string;
  timestamp: number;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('glass_calc_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('glass_calc_history', JSON.stringify(history));
  }, [history]);

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      const result = new Function(`return ${fullEquation}`)();
      const resultStr = String(result);
      
      // Add to history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        equation: fullEquation,
        result: resultStr,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items

      setDisplay(resultStr);
      setEquation('');
    } catch (e) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const useHistoryItem = (item: HistoryItem) => {
    setDisplay(item.result);
    setEquation('');
    setShowHistory(false);
  };

  const Button = ({ label, onClick, variant = 'default', className = '', key }: { label: string | React.ReactNode, onClick: () => void, variant?: 'default' | 'primary' | 'accent', className?: string, key?: React.Key }) => {
    const baseClass = variant === 'primary' ? 'glass-button-primary' : variant === 'accent' ? 'glass-button-accent' : 'glass-button';
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`h-16 rounded-2xl flex items-center justify-center text-lg font-medium ${baseClass} ${className}`}
      >
        {label}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative font-sans">
      <div className="atmosphere" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[360px] glass-panel rounded-[40px] p-8 overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 opacity-60">
            <Calculator size={20} />
            <span className="text-sm font-medium tracking-widest uppercase">GlassCalc</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-60"
          >
            <History size={20} />
          </motion.button>
        </div>

        {/* Display */}
        <div className="mb-8 text-right">
          <div className="text-sm text-white/40 font-mono mb-2 h-5 overflow-hidden">
            {equation}
          </div>
          <div className="text-6xl font-light tracking-tight truncate">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
          <Button label={<RotateCcw size={20} />} onClick={clear} variant="accent" />
          <Button label="/" onClick={() => handleOperator('/')} variant="primary" />
          <Button label="*" onClick={() => handleOperator('*')} variant="primary" />
          <Button label={<Delete size={20} />} onClick={() => setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0')} variant="accent" />

          {[7, 8, 9].map(n => <Button key={n} label={String(n)} onClick={() => handleNumber(String(n))} />)}
          <Button label="-" onClick={() => handleOperator('-')} variant="primary" />

          {[4, 5, 6].map(n => <Button key={n} label={String(n)} onClick={() => handleNumber(String(n))} />)}
          <Button label="+" onClick={() => handleOperator('+')} variant="primary" />

          {[1, 2, 3].map(n => <Button key={n} label={String(n)} onClick={() => handleNumber(String(n))} />)}
          <Button label="=" onClick={calculate} variant="primary" className="row-span-2 h-full" />

          <div className="col-span-2">
            <Button label="0" onClick={() => handleNumber('0')} className="w-full" />
          </div>
          <Button label="." onClick={() => handleNumber('.')} />
        </div>

        {/* History Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-20 glass-panel rounded-[40px] p-8 flex flex-col"
              style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">History</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={clearHistory}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-red-400"
                    title="Clear History"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                    <History size={48} className="mb-4" />
                    <p className="text-sm uppercase tracking-widest">No history yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => useHistoryItem(item)}
                      className="group cursor-pointer p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="text-xs text-white/40 font-mono mb-1 truncate">
                        {item.equation} =
                      </div>
                      <div className="text-xl font-medium">
                        {item.result}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

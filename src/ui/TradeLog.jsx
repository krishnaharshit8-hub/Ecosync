import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEcoStore from '../store/useEcoStore';

const SOURCE_COLORS = {
  Solar: '#FFD700',
  Wind: '#00D4FF',
  Hydro: '#0066FF',
  Gas: '#FF6B00',
  Grid: '#00F5A0',
};

export default function TradeLog() {
  const tradeLog = useEcoStore((s) => s.tradeLog);
  const visibleLogs = tradeLog.slice(0, 5);

  return (
    <div className="px-4 pb-4">
      <h3 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.1em] mb-2">
        Live Trade Log
      </h3>
      <div className="space-y-1 h-[200px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {visibleLogs.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="rounded-md px-3 py-2 text-xs font-mono tabular-nums"
              style={{
                background: 'rgba(10, 22, 40, 0.5)',
                borderLeft: `2px solid ${SOURCE_COLORS[entry.source] || '#00D4FF'}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-300 pointer-events-none">{entry.message}</span>
              </div>
              <div className="text-gray-500 text-[10px] mt-1 tracking-widest">{entry.time}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        {visibleLogs.length === 0 && (
          <div className="text-xs text-gray-600 text-center py-4 font-mono">
            Waiting for trades...
          </div>
        )}
      </div>
    </div>
  );
}

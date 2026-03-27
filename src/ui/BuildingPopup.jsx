import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEcoStore from '../store/useEcoStore';

const TYPE_ICONS = {
  hospital: '🏥',
  commercial: '🏢',
  residential: '🏠',
};

export default function BuildingPopup() {
  const selectedBuilding = useEcoStore((s) => s.selectedBuilding);
  const clearSelection = useEcoStore((s) => s.clearSelection);
  const toggleBuilding = useEcoStore((s) => s.toggleBuilding);

  return (
    <AnimatePresence>
      {selectedBuilding && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-[70px] left-4 w-[280px] z-[200] rounded-xl overflow-hidden glass-panel border border-cyan-500/30 shadow-2xl"
        >
          {/* Header */}
          <div className="bg-cyan-900/30 p-3 border-b border-white/10 flex justify-between items-start">
            <div>
              <div className="text-[13px] font-bold text-white tracking-widest font-mono">
                {TYPE_ICONS[selectedBuilding.type]} {selectedBuilding.code}
              </div>
              <div className="text-[11px] text-cyan-300 mt-1 font-medium bg-black/30 px-2 py-0.5 rounded inline-block">
                {selectedBuilding.name}
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3">
            {/* Status Section */}
            <div className="space-y-1 text-[11px] font-mono tabular-nums">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">STATUS</span>
                <span style={{ color: selectedBuilding.active ? '#00F5A0' : '#FF3333' }}>
                  {selectedBuilding.active ? '● ONLINE' : '● OFFLINE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <span className="text-white capitalize">{selectedBuilding.type} {selectedBuilding.type === 'hospital' && '(Critical)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Consumption</span>
                <span className="text-white">{selectedBuilding.consumption_kw.toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Battery SoC</span>
                <span className="text-white">{selectedBuilding.battery_soc}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Production</span>
                <span className="text-white">0.0 kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Net Draw</span>
                <span className="text-orange-400">-{selectedBuilding.consumption_kw.toFixed(1)} kW</span>
              </div>
            </div>

            {/* Split depending on Active state */}
            {selectedBuilding.active ? (
              <>
                <div className="h-px bg-white/10 my-3" />
                <div className="space-y-2">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Power Source</div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <div className="flex-1 h-3 bg-gray-800 rounded overflow-hidden flex">
                      <div className="h-full bg-yellow-500 w-[62%]" />
                      <div className="h-full bg-blue-500 w-[38%]" />
                    </div>
                    <span className="text-gray-300 whitespace-nowrap">Solar 62%</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <div className="flex-1 h-3 bg-gray-800 rounded overflow-hidden flex">
                       <div className="h-full bg-cyan-400 w-[100%]" />
                    </div>
                    <span className="text-gray-300 whitespace-nowrap">Grid 38% </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleBuilding(selectedBuilding.id)}
                  className="w-full mt-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded py-2 text-xs font-bold tracking-widest transition-colors"
                >
                  TURN OFF BUILDING
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-white/10 my-3" />
                
                <div className="bg-cyan-950/40 border border-cyan-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-cyan-400 animate-pulse">⛓</span>
                     <span className="text-[10px] font-bold text-cyan-300 tracking-widest">BLOCKCHAIN BACKUP ACTIVE</span>
                  </div>
                  
                  <div className="space-y-1.5 text-[10px] font-mono tabular-nums text-gray-400">
                    <div className="flex justify-between">
                      <span>Smart Contract</span>
                      <span className="text-cyan-200 truncate ml-4 border-b border-cyan-900 pb-0.5 max-w-[120px]">
                        0x4f2a9b...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Backup Node</span>
                      <span className="text-white">{selectedBuilding.backupNode || 'WAITING'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Power Routed</span>
                      <span className="text-orange-300">{selectedBuilding.consumption_kw.toFixed(1)} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TX Hash</span>
                      <span className="text-cyan-500 truncate ml-4 max-w-[120px]">
                        {selectedBuilding.txHash || 'PENDING...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confirmed</span>
                      <span className="text-gray-300">Block #{selectedBuilding.blockNum || '---'}</span>
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-cyan-900/50">
                      <span>Status</span>
                      <span className="text-green-400">✓ SETTLED</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleBuilding(selectedBuilding.id)}
                  className="w-full mt-4 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded py-2 text-xs font-bold tracking-widest transition-colors"
                >
                  RESTORE BUILDING
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

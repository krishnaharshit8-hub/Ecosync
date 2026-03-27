import React from 'react';
import Scene from './components/Scene';
import SidePanel from './ui/SidePanel';
import BuildingPopup from './ui/BuildingPopup';
import useGridBalance from './hooks/useGridBalance';
import useAutoBalance from './hooks/useAutoBalance';
import useEcoStore from './store/useEcoStore';

// Only render warning when gas is actually boosting (gas > 30kW baseline)
function WarningBanner() {
  const powerSources = useEcoStore((s) => s.powerSources);
  const gridStatus = useEcoStore((s) => s.gridStatus);

  if (powerSources.gas.output_kw > 30 && powerSources.gas.active) {
    return (
      <div
        className="fixed z-[99] px-5 py-2 rounded-full text-[13px] font-mono w-auto max-w-[380px]"
        style={{
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 107, 0, 0.12)',
          border: '1px solid rgba(255, 107, 0, 0.35)',
          color: '#FF9D4D',
          backdropFilter: 'blur(8px)',
        }}
      >
        ⚡ Grid Stressed — Gas Backup Online ({powerSources.gas.output_kw.toFixed(1)} kW)
      </div>
    );
  }

  if (gridStatus.status === 'WARNING') {
    return (
      <div
        className="fixed z-[99] px-5 py-2 rounded-full text-[13px] font-mono w-auto max-w-[380px]"
        style={{
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 107, 0, 0.12)',
          border: '1px solid rgba(255, 107, 0, 0.35)',
          color: '#FF8800',
          backdropFilter: 'blur(8px)',
        }}
      >
        ⚠ Grid Under Pressure
      </div>
    );
  }

  return null;
}

function MinimalHUD() {
  const gridStatus = useEcoStore((s) => s.gridStatus);
  const statusColor = gridStatus.status === 'CRITICAL' ? '#FF3333'
    : gridStatus.status === 'WARNING' ? '#FF6B00'
    : '#00F5A0';

  return (
    <>
      {/* Branding top-left */}
      <div className="fixed top-[16px] left-[16px] z-[100] flex items-center gap-2 pointer-events-auto">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center pointer-events-auto"
          style={{ background: 'linear-gradient(135deg, #00D4FF, #00F5A0)' }}>
          <span className="text-sm font-bold text-black">⚡</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-wide text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              EcoSync
            </h1>
            <div className="flex items-center gap-1.5 bg-black/30 px-1.5 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] font-mono text-green-400">LIVE</span>
            </div>
          </div>
          <p className="text-[9px] text-gray-400">AI Microgrid Simulator</p>
        </div>
      </div>

      {/* Grid status top-right (leaves room for hamburger) */}
      <div className="fixed top-[16px] right-[72px] z-[100] flex flex-col items-center bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5 pointer-events-auto shadow-lg">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Grid Balance</div>
        <div className="text-xl font-bold font-mono tabular-nums leading-none" style={{ color: statusColor }}>
           {gridStatus.balance > 0 ? '+' : ''}{gridStatus.balance?.toFixed(1) || '0.0'} <span className="text-xs text-gray-500">kW</span>
        </div>
        <div className={`mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono inline-block
          ${gridStatus.status === 'CRITICAL' ? 'status-critical' : gridStatus.status === 'WARNING' ? 'status-warning' : 'status-optimized'}
        `}>
          {gridStatus.status}
        </div>
      </div>
    </>
  );
}

function HamburgerToggle() {
  const sidePanelOpen = useEcoStore((s) => s.sidePanelOpen);
  const setSidePanelOpen = useEcoStore((s) => s.setSidePanelOpen);

  return (
    <button
      className="hamburger-btn fixed top-[16px] right-[16px] z-[200] w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-lg"
      onClick={() => setSidePanelOpen(!sidePanelOpen)}
    >
      <span className="text-white text-2xl font-mono leading-none flex items-center justify-center">
        {sidePanelOpen ? '✕' : '☰'}
      </span>
    </button>
  );
}

function AppContent() {
  useGridBalance();
  useAutoBalance();

  return (
    <div className="w-full h-full flex overflow-hidden bg-[#060D1A]" id="app-root">
      {/* 3D Scene always full screen viewport */}
      <div className="absolute inset-0 z-0" id="scene-container">
        <Scene />
      </div>

      <WarningBanner />
      <MinimalHUD />
      <HamburgerToggle />
      <BuildingPopup />
      <SidePanel />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

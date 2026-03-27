import React from 'react';
import useEcoStore from '../store/useEcoStore';

const SOURCE_CONFIG = {
  solar: { icon: '☀️', label: 'Solar', color: '#FFD700', borderColor: 'rgba(255, 215, 0, 0.3)' },
  wind: { icon: '💨', label: 'Wind', color: '#00D4FF', borderColor: 'rgba(0, 212, 255, 0.3)' },
  hydro: { icon: '💧', label: 'Hydro', color: '#0066FF', borderColor: 'rgba(0, 102, 255, 0.3)' },
  gas: { icon: '🔥', label: 'Gas', color: '#FF6B00', borderColor: 'rgba(255, 107, 0, 0.3)' },
};

function Sparkline({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="sparkline-container">
      {data.map((val, i) => (
        <div
          key={i}
          className="sparkline-bar"
          style={{
            height: `${(val / max) * 100}%`,
            background: color,
            opacity: 0.3 + (i / data.length) * 0.7,
          }}
        />
      ))}
    </div>
  );
}

function GasBar({ output, max }) {
  const baselinePercent = Math.min(30, output) / max * 100;
  const boostPercent = Math.max(0, output - 30) / max * 100;
  
  return (
    <div className="w-full h-5 bg-gray-900/50 rounded flex items-end overflow-hidden relative border border-white/5">
      <div 
        className="h-full bg-green-500/80 transition-all duration-300"
        style={{ width: `${(30 / max) * 100}%` }}
      />
      <div 
        className="h-full bg-orange-500/90 transition-all duration-300 shadow-[0_0_8px_rgba(255,165,0,0.5)]"
        style={{ width: `${boostPercent}%`, opacity: boostPercent > 0 ? 1 : 0 }}
      />
      <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[8px] font-mono text-white/50 pointer-events-none">
        <span>0</span>
        <span className="relative z-10">30</span>
        <span>70</span>
      </div>
      {/* 30kW marker line */}
      <div className="absolute top-0 bottom-0 left-[42.8%] w-px bg-white/20" />
    </div>
  );
}

export default function PowerCards() {
  const powerSources = useEcoStore((s) => s.powerSources);
  const togglePowerSource = useEcoStore((s) => s.togglePowerSource);

  return (
    <div className="space-y-2 px-4">
      <h3 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.1em] mb-2">
        Power Sources
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(powerSources).map(([key, data]) => {
          const config = SOURCE_CONFIG[key];
          return (
            <div
              key={key}
              className="rounded-lg p-3 transition-all duration-300 border"
              style={{
                background: data.active
                  ? 'rgba(10, 22, 40, 0.8)'
                  : 'rgba(10, 15, 25, 0.5)',
                borderColor: data.active ? config.borderColor : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{config.icon}</span>
                  <span className="text-[11px] font-medium tracking-[0.1em] uppercase" style={{ color: data.active ? config.color : 'rgba(255,255,255,0.5)' }}>
                    {config.label}
                  </span>
                </div>
                <button
                  onClick={() => togglePowerSource(key)}
                  className={`toggle-switch ${data.active ? 'active' : ''}`}
                  style={{
                    '--toggle-color': config.color,
                  }}
                  id={`toggle-${key}`}
                />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: data.active ? '#fff' : '#444' }}>
                {data.output_kw.toFixed(1)}
                <span className="text-[11px] font-normal text-gray-500 ml-1">kW</span>
              </div>
              <div className="mt-2 h-5 flex items-end">
                {key === 'gas' ? (
                  <GasBar output={data.output_kw} max={data.max_kw} />
                ) : (
                  <Sparkline data={data.history} color={config.color} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

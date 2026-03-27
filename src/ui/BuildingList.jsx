import React from 'react';
import useEcoStore from '../store/useEcoStore';

const TYPE_ICONS = {
  hospital: '🏥',
  commercial: '🏢',
  residential: '🏠',
};

const TYPE_COLORS = {
  hospital: '#ff4444',
  commercial: '#00aaff',
  residential: '#00dd77',
};

export default function BuildingList() {
  const buildings = useEcoStore((s) => s.buildings);
  const toggleBuilding = useEcoStore((s) => s.toggleBuilding);
  const selectBuilding = useEcoStore((s) => s.selectBuilding);
  const selectedBuilding = useEcoStore((s) => s.selectedBuilding);

  return (
    <div className="px-4">
      <h3 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.1em] mb-2">
        Buildings ({buildings.filter(b => b.active).length}/{buildings.length})
      </h3>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        {buildings.map((b) => {
          const isSelected = selectedBuilding?.id === b.id;
          return (
            <div
              key={b.id}
              className="flex items-center gap-2 rounded-md px-3 h-12 cursor-pointer transition-all duration-200"
              style={{
                background: isSelected
                  ? 'rgba(0, 212, 255, 0.1)'
                  : 'rgba(10, 22, 40, 0.4)',
                border: isSelected
                  ? '1px solid rgba(0, 212, 255, 0.3)'
                  : '1px solid transparent',
              }}
              onClick={() => selectBuilding(b)}
              id={`building-row-${b.id}`}
            >
              {/* Status dot */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: b.active
                    ? (b.battery_soc > 30 ? '#00F5A0' : '#FFD700')
                    : '#FF3333',
                  boxShadow: b.active
                    ? `0 0 4px ${b.battery_soc > 30 ? '#00F5A0' : '#FFD700'}`
                    : '0 0 4px #FF3333',
                }}
              />

              {/* Icon & name */}
              <span className="text-sm">{TYPE_ICONS[b.type]}</span>
              <span className="text-xs font-mono tabular-nums flex-1" style={{ color: b.active ? '#ccc' : '#555' }}>
                {b.name}
              </span>

              {/* Consumption bar */}
              <div className="w-12 h-1.5 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: b.active ? `${Math.min(100, (b.consumption_kw / 14) * 100)}%` : '0%',
                    background: TYPE_COLORS[b.type],
                    opacity: b.active ? 1 : 0.3,
                  }}
                />
              </div>

              {/* Toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleBuilding(b.id); }}
                className={`toggle-switch ${b.active ? 'active' : ''}`}
                style={{ transform: 'scale(0.7)' }}
                id={`toggle-building-${b.id}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

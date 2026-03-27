import { useEffect, useRef } from 'react';
import useEcoStore from '../store/useEcoStore';

export function useGridBalance() {
  const intervalRef = useRef(null);

  useEffect(() => {
    const calculate = () => {
      const state = useEcoStore.getState();
      const { powerSources, buildings } = state;

      // Calculate total supply from active sources
      let totalSupply = 0;
      Object.values(powerSources).forEach((ps) => {
        if (ps.active) totalSupply += ps.output_kw;
      });

      // Calculate total demand from active buildings
      let totalDemand = 0;
      let activeCount = 0;
      buildings.forEach((b) => {
        if (b.active) {
          totalDemand += b.consumption_kw;
          activeCount++;
        }
      });

      const balance = totalSupply - totalDemand;
      const efficiency = totalDemand > 0
        ? Math.min(100, Math.round((totalSupply / totalDemand) * 100))
        : 100;

      let status = 'OPTIMIZED';
      if (balance < -10) status = 'CRITICAL';
      else if (balance < 0) status = 'WARNING';

      const gridStatus = {
        balance: parseFloat(balance.toFixed(1)),
        status,
        efficiency,
        totalSupply: parseFloat(totalSupply.toFixed(1)),
        totalDemand: parseFloat(totalDemand.toFixed(1)),
        activeBuildings: activeCount,
      };

      state.updateGridStatus(gridStatus);

      // Log balance changes
      const prev = state.gridStatus;
      if (prev.status !== status) {
        console.log(`[Grid] Status changed: ${prev.status} → ${status} | Balance: ${balance.toFixed(1)} kW`);
      }
    };

    calculate();
    intervalRef.current = setInterval(calculate, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}

export default useGridBalance;

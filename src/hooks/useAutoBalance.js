import { useEffect, useRef } from 'react';
import useEcoStore from '../store/useEcoStore';

export function useAutoBalance() {
  const intervalRef = useRef(null);

  useEffect(() => {
    const autoBalance = () => {
      const state = useEcoStore.getState();
      const { gridStatus, powerSources, weatherData, weatherOverride, buildings } = state;

      // Apply weather override modifiers
      let currentClouds = weatherData.clouds;
      let currentWindSpeed = weatherData.wind_speed;
      let solarMultiplier = 1.0;
      let windMultiplier = 1.0;
      
      switch (weatherOverride) {
        case 'OVERCAST':
          currentClouds = 100;
          break;
        case 'THUNDERSTORM':
          currentClouds = 100;
          currentWindSpeed = 15;
          windMultiplier = 2.0; // MAX wind
          break;
        case 'HEAT_WAVE':
          currentClouds = 0;
          solarMultiplier = 1.4; // Boosted solar
          break;
        case 'BLIZZARD':
          currentClouds = 100;
          currentWindSpeed = 20;
          windMultiplier = 0.5; // Iced turbines
          break;
        case 'PERFECT_WIND':
          currentClouds = 20;
          currentWindSpeed = 18;
          windMultiplier = 2.5; // MAX output
          break;
      }

      // 1. Calculate Solar (capped at logic or max)
      let calculatedSolar = 0;
      if (powerSources.solar.active) {
        if (weatherOverride === 'THUNDERSTORM' || weatherOverride === 'BLIZZARD' || weatherOverride === 'OVERCAST') {
            calculatedSolar = 0;
        } else {
            const irradiance = 1.0;
            calculatedSolar = 50 * (1 - currentClouds / 100) * irradiance * solarMultiplier;
        }
        state.updatePowerOutput('solar', Math.max(0, Math.min(powerSources.solar.max_kw, calculatedSolar)));
      }

      // 2. Calculate Wind
      let calculatedWind = 0;
      if (powerSources.wind.active) {
        calculatedWind = Math.min(powerSources.wind.max_kw, 0.5 * Math.pow(currentWindSpeed, 2) * windMultiplier);
        if (weatherOverride === 'THUNDERSTORM') calculatedWind = powerSources.wind.max_kw;
        if (weatherOverride === 'PERFECT_WIND') calculatedWind = powerSources.wind.max_kw;
        state.updatePowerOutput('wind', Math.max(0, calculatedWind));
      }

      // 3. Hydro is stable
      let currentHydro = 0;
      if (powerSources.hydro.active) {
        currentHydro = 40 + (Math.random() - 0.5) * 2;
        state.updatePowerOutput('hydro', currentHydro);
      }

      // 4. Gas Auto-Ramping Logic
      // Total demand from active buildings
      let totalDemand = 0;
      buildings.forEach((b) => {
        if (b.active) totalDemand += b.consumption_kw;
      });

      // Gas operates at baseline 30kW
      const gasBaseline = 30;
      if (powerSources.gas.active) {
        // shortage = total_demand - (solar + wind + hydro + baseline_gas)
        const renewablesTotal = calculatedSolar + calculatedWind + currentHydro;
        const shortage = totalDemand - (renewablesTotal + gasBaseline);
        
        let gasKw = gasBaseline; // start at 30
        if (shortage > 0) {
            gasKw = Math.min(powerSources.gas.max_kw, gasBaseline + shortage);
        }
        
        state.updatePowerOutput('gas', gasKw);
      } else {
         state.updatePowerOutput('gas', 0);
      }

      // Generate random trade events
      if (Math.random() < 0.15) {
        const activeBuildings = buildings.filter((b) => b.active);
        if (activeBuildings.length >= 2) {
          const from = activeBuildings[Math.floor(Math.random() * activeBuildings.length)];
          let to = activeBuildings[Math.floor(Math.random() * activeBuildings.length)];
          while (to.id === from.id) {
            to = activeBuildings[Math.floor(Math.random() * activeBuildings.length)];
          }
          const sources = ['Solar', 'Wind', 'Hydro', 'Gas'];
          const activeSources = sources.filter((s) => powerSources[s.toLowerCase()]?.active);
          const source = activeSources[Math.floor(Math.random() * activeSources.length)] || 'Grid';
          const kw = parseFloat((0.5 + Math.random() * 4).toFixed(1));

          state.addTradeLog({
            id: Date.now(),
            from: from.name,
            to: to.name,
            kw,
            source,
            time: new Date().toLocaleTimeString(),
            message: `${from.name} → ${to.name} | ${kw} kW | ${source}`,
          });
        }
      }
    };

    intervalRef.current = setInterval(autoBalance, 2000);
    setTimeout(autoBalance, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}

export default useAutoBalance;

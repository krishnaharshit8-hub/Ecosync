import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  Battery, 
  Sun, 
  Cloud, 
  AlertTriangle,
  Server,
  Cpu,
  Menu,
  X,
  Maximize2,
  Minimize2,
  CloudRain,
  ShieldAlert,
  DollarSign
} from 'lucide-react';
import { CityGrid } from '@/components/threejs/CityGrid';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import HomePage from '@/pages/HomePage';
import { LogTerminal } from '@/components/terminal/LogTerminal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { 
  BuildingTelemetry, 
  AgentLog, 
  AnalyticsSummary, 
  MarketStatus,
  GridEvent 
} from '@/types';
import './App.css';

// WebSocket connection hook
function useWebSocket(url: string) {
  const [connected, setConnected] = useState(false);
  const [buildings, setBuildings] = useState<BuildingTelemetry[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [gridEvents, setGridEvents] = useState<GridEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'telemetry':
              setBuildings(prev => {
                const existing = prev.findIndex(b => b.building_id === data.data.building_id);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = data.data;
                  return updated;
                }
                return [...prev, data.data];
              });
              break;
            
            case 'agent_log':
              setLogs(prev => [...prev, data.data]);
              break;
            
            case 'grid_event':
              setGridEvents(prev => [...prev, data.data]);
              break;
            
            case 'buildings_list':
              setBuildings(data.data);
              break;
          }
        } catch (e) {
          console.error('WebSocket message error:', e);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [url]);

  const sendMessage = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { connected, buildings, logs, gridEvents, sendMessage };
}

// API polling hook for analytics
function useAnalyticsPolling(interval: number = 5000) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [history, setHistory] = useState<{ time: string; load: number; generation: number; efficiency: number; traditional: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch market status FIRST to include in history
        let currentMarketPrice = 0.15;
        const marketRes = await fetch('/api/market/status');
        if (marketRes.ok) {
          const marketData = await marketRes.json();
          setMarketStatus(marketData);
          currentMarketPrice = marketData.current_price;
        }

        // Fetch analytics
        const analyticsRes = await fetch('/api/analytics/summary');
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
          
          // Update history
          setHistory(prev => {
            const newPoint = {
              time: new Date().toLocaleTimeString(),
              load: analyticsData.total_load,
              generation: analyticsData.total_generation,
              efficiency: analyticsData.grid_efficiency,
              traditional: 65, // Traditional grid baseline
              price: currentMarketPrice
            };
            const updated = [...prev, newPoint];
            return updated.slice(-50); // Keep last 50 points
          });
        }
      } catch (e) {
        console.error('API fetch error:', e);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [interval]);

  return { analytics, marketStatus, history };
}

// Main App Component
function App() {
  const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = typeof window !== 'undefined' ? `${wsProtocol}//${window.location.host}/ws` : 'ws://localhost:8000/ws';
  const { connected, buildings, logs, gridEvents } = useWebSocket(wsUrl);
  const { analytics, marketStatus, history } = useAnalyticsPolling(5000);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingTelemetry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const [page, setPage] = useState('home');
  const [mockTick, setMockTick] = useState(0);

  const MOCK_BUILDINGS = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      building_id: i + 1,
      building_type: i === 0 ? 'hospital' 
        : i === 1 ? 'datacenter' 
        : i < 5 ? 'commercial' 
        : 'residential',
      load: parseFloat((Math.random() * 80 + 20).toFixed(1)),
      solar_generation: parseFloat((Math.random() * 60 + 10).toFixed(1)),
      battery_soc: parseFloat((Math.random() * 70 + 20).toFixed(1)),
      grid_connected: true,
      is_selling: Math.random() > 0.6,
      is_buying: Math.random() > 0.7,
      is_critical: i < 3,
      net_energy: parseFloat((Math.random() * 40 - 20).toFixed(1)),
      trading_status: ['selling','buying','idle'][Math.floor(Math.random()*3)],
    }));
  }, [mockTick]);

  useEffect(() => {
    if (buildings.length === 0) {
      const interval = setInterval(() => {
        // trigger re-render with new random values
        setMockTick(t => t + 1)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [buildings.length]);

  const displayBuildings = buildings.length > 0 ? buildings : MOCK_BUILDINGS;

  // Get active grid events
  const activeEvents = gridEvents.filter(e => e.active);
  const hasCloudCover = activeEvents.some(e => e.type === 'cloud_cover');
  const hasGridFailure = activeEvents.some(e => e.type === 'grid_failure');

  const triggerEvent = async (type: string, payload: any = {}) => {
    try {
      await fetch('/api/grid/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: type, ...payload })
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (page === 'home') {
    return <HomePage onNavigateToDashboard={() => setPage('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Back to Home button — positioned below the header bar */}
      <button
        onClick={() => setPage('home')}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(0,245,160,0.2)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,160,0.5)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(0,245,160,0.1)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,160,0.3)';
        }}
        style={{
          position: 'fixed',
          top: '72px',
          left: '16px',
          zIndex: 100,
          background: 'rgba(0,245,160,0.1)',
          border: '1px solid rgba(0,245,160,0.3)',
          borderRadius: '8px',
          padding: '8px 14px',
          color: '#00F5A0',
          fontSize: '12px',
          cursor: 'pointer',
          fontFamily: 'IBM Plex Mono, monospace',
          letterSpacing: '1px',
          backdropFilter: 'blur(8px)',
          transition: 'background 0.2s ease, border-color 0.2s ease',
        }}
      >
        ← Home
      </button>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/40 backdrop-blur-xl border-b border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-emerald-500/30 rounded-lg blur-sm animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                EcoSync
              </h1>
              <p className="text-xs text-slate-400">Smart Energy Microgrid</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-4">
            <StatusBadge 
              icon={Server} 
              label="API" 
              active={connected} 
              activeColor="text-emerald-400"
            />
            <StatusBadge 
              icon={Cpu} 
              label="AI Agents" 
              active={buildings.length > 0} 
              activeColor="text-cyan-400"
            />
            <StatusBadge 
              icon={Sun} 
              label="Solar" 
              active={!hasCloudCover} 
              activeColor="text-amber-400"
            />
            <StatusBadge 
              icon={Activity} 
              label="Grid" 
              active={!hasGridFailure} 
              activeColor="text-green-400"
            />
            
            {/* Control Panel Buttons */}
            <div className="hidden xl:flex items-center gap-2 ml-6 pl-6 border-l border-slate-700/50">
              <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/20 text-blue-300" onClick={() => triggerEvent('cloud_cover', { intensity: 0.8, duration: 30 })}>
                <CloudRain className="w-3 h-3 mr-1.5" /> Cloud Cover
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-red-500/50 bg-red-500/5 hover:bg-red-500/20 text-red-300" onClick={() => triggerEvent('grid_failure', { duration: 60 })}>
                <ShieldAlert className="w-3 h-3 mr-1.5" /> Grid Failure
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/20 text-amber-300" onClick={() => triggerEvent('price_update', { price: 0.50 })}>
                <DollarSign className="w-3 h-3 mr-1.5" /> Price Surge
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-slate-900 border-emerald-500/30">
              <SheetHeader>
                <SheetTitle className="text-emerald-400">System Status</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <MobileStatusItem 
                  icon={Server} 
                  label="WebSocket" 
                  value={connected ? 'Connected' : 'Disconnected'}
                  status={connected ? 'good' : 'bad'}
                />
                <MobileStatusItem 
                  icon={Cpu} 
                  label="Active Buildings" 
                  value={buildings.length.toString()}
                  status="good"
                />
                <MobileStatusItem 
                  icon={TrendingUp} 
                  label="Grid Efficiency" 
                  value={`${analytics?.grid_efficiency.toFixed(1) || 0}%`}
                  status={analytics && analytics.grid_efficiency > 70 ? 'good' : 'warning'}
                />
                <MobileStatusItem 
                  icon={Battery} 
                  label="Avg Battery SoC" 
                  value={`${analytics?.avg_battery_soc.toFixed(1) || 0}%`}
                  status={analytics && analytics.avg_battery_soc > 30 ? 'good' : 'warning'}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Alert Banner */}
        {(hasCloudCover || hasGridFailure) && (
          <div className={`px-4 py-2 flex items-center gap-2 ${
            hasGridFailure ? 'bg-red-500/20 border-b border-red-500/50' : 'bg-amber-500/20 border-b border-amber-500/50'
          }`}>
            <AlertTriangle className={`w-4 h-4 ${hasGridFailure ? 'text-red-400' : 'text-amber-400'}`} />
            <span className={`text-sm ${hasGridFailure ? 'text-red-300' : 'text-amber-300'}`}>
              {hasGridFailure 
                ? '⚠️ GRID FAILURE DETECTED - Buildings operating in island mode'
                : '☁️ Cloud cover event - Solar generation reduced by 80%'
              }
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* 3D City View */}
          <div className="flex-1 relative">
            <CityGrid 
              buildings={displayBuildings} 
              onBuildingClick={setSelectedBuilding}
            />
            
            {/* Building Info Overlay */}
            {selectedBuilding && (
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-lg p-4 max-w-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-emerald-400">
                    Building #{selectedBuilding.building_id}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setSelectedBuilding(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="capitalize">{selectedBuilding.building_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Load:</span>
                    <span>{selectedBuilding.load.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Solar:</span>
                    <span className="text-green-400">{selectedBuilding.solar_generation.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Battery:</span>
                    <span className={selectedBuilding.battery_soc < 30 ? 'text-red-400' : 'text-emerald-400'}>
                      {selectedBuilding.battery_soc.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <Badge 
                      variant="outline"
                      className={`
                        ${selectedBuilding.is_selling ? 'border-green-500 text-green-400' : ''}
                        ${selectedBuilding.is_buying ? 'border-amber-500 text-amber-400' : ''}
                        ${selectedBuilding.is_critical ? 'border-red-500 text-red-400' : ''}
                        ${!selectedBuilding.is_selling && !selectedBuilding.is_buying && !selectedBuilding.is_critical ? 'border-blue-500 text-blue-400' : ''}
                      `}
                    >
                      {selectedBuilding.is_selling && 'Selling'}
                      {selectedBuilding.is_buying && 'Buying'}
                      {selectedBuilding.is_critical && 'Critical'}
                      {!selectedBuilding.is_selling && !selectedBuilding.is_buying && !selectedBuilding.is_critical && 'Balanced'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-lg p-3">
              <h4 className="text-xs font-bold text-slate-400 mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>Selling Energy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span>Buying Energy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500 animate-pulse" />
                  <span>Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span>Priority Building</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>Balanced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Analytics */}
          <div className="hidden lg:block w-96 bg-slate-900/50 border-l border-emerald-500/30 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Analytics Dashboard
              </h2>
              <AnalyticsDashboard 
                buildings={displayBuildings}
                analytics={analytics}
                marketStatus={marketStatus}
                history={history}
                onBuildingSelect={setSelectedBuilding}
              />
            </div>
          </div>
        </div>

        {/* Terminal Section */}
        <div 
          className={`border-t border-emerald-500/30 bg-slate-950 transition-all duration-300 ${
            terminalExpanded ? 'h-96' : 'h-48'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-emerald-500/30">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">AI Agent Logs</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setTerminalExpanded(!terminalExpanded)}
            >
              {terminalExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="h-[calc(100%-2.5rem)]">
            <LogTerminal logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ 
  icon: Icon, 
  label, 
  active, 
  activeColor 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  activeColor: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className={`w-4 h-4 ${active ? activeColor : 'text-slate-500'}`} />
      <span className={active ? 'text-slate-300' : 'text-slate-500'}>{label}</span>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
    </div>
  );
}

// Mobile Status Item
function MobileStatusItem({ 
  icon: Icon, 
  label, 
  value, 
  status 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  status: 'good' | 'warning' | 'bad';
}) {
  const statusColors = {
    good: 'text-green-400',
    warning: 'text-amber-400',
    bad: 'text-red-400'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-400" />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className={`text-sm font-medium ${statusColors[status]}`}>{value}</span>
    </div>
  );
}

export default App;

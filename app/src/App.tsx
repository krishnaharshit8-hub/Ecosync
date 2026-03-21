import { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  Battery, 
  Sun, 
  Cloud, 
  Server,
  Cpu,
  Menu,
  X,
  Maximize2,
  Minimize2
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
import type { BuildingTelemetry } from '@/types';
import './App.css';

const BUILDING_TYPES = [
  { type: 'hospital',   baseLoad: 500, solar: 300, battery: 2000, priority: true },
  { type: 'datacenter', baseLoad: 800, solar: 200, battery: 3000, priority: true },
  { type: 'emergency',  baseLoad: 300, solar: 150, battery: 1500, priority: true },
  { type: 'commercial', baseLoad: 150, solar: 100, battery: 500,  priority: false },
  { type: 'commercial', baseLoad: 120, solar: 80,  battery: 400,  priority: false },
  { type: 'commercial', baseLoad: 180, solar: 120, battery: 600,  priority: false },
  { type: 'commercial', baseLoad: 200, solar: 150, battery: 700,  priority: false },
  { type: 'commercial', baseLoad: 160, solar: 90,  battery: 450,  priority: false },
  { type: 'commercial', baseLoad: 140, solar: 110, battery: 480,  priority: false },
  { type: 'commercial', baseLoad: 220, solar: 130, battery: 550,  priority: false },
  { type: 'commercial', baseLoad: 190, solar: 140, battery: 520,  priority: false },
  { type: 'commercial', baseLoad: 170, solar: 95,  battery: 460,  priority: false },
  { type: 'residential', baseLoad: 30, solar: 25, battery: 100, priority: false },
  { type: 'residential', baseLoad: 25, solar: 20, battery: 80,  priority: false },
  { type: 'residential', baseLoad: 35, solar: 30, battery: 120, priority: false },
  { type: 'residential', baseLoad: 28, solar: 22, battery: 90,  priority: false },
  { type: 'residential', baseLoad: 32, solar: 28, battery: 110, priority: false },
  { type: 'residential', baseLoad: 27, solar: 18, battery: 85,  priority: false },
  { type: 'residential', baseLoad: 33, solar: 26, battery: 105, priority: false },
  { type: 'residential', baseLoad: 29, solar: 24, battery: 95,  priority: false },
  { type: 'residential', baseLoad: 31, solar: 27, battery: 108, priority: false },
  { type: 'residential', baseLoad: 26, solar: 21, battery: 88,  priority: false },
  { type: 'residential', baseLoad: 34, solar: 29, battery: 115, priority: false },
  { type: 'residential', baseLoad: 28, solar: 23, battery: 92,  priority: false },
  { type: 'residential', baseLoad: 30, solar: 25, battery: 100, priority: false },
  { type: 'residential', baseLoad: 25, solar: 19, battery: 82,  priority: false },
  { type: 'residential', baseLoad: 36, solar: 31, battery: 118, priority: false },
  { type: 'residential', baseLoad: 27, solar: 22, battery: 88,  priority: false },
  { type: 'residential', baseLoad: 32, solar: 26, battery: 104, priority: false },
  { type: 'residential', baseLoad: 29, solar: 24, battery: 96,  priority: false },
  { type: 'residential', baseLoad: 31, solar: 25, battery: 102, priority: false },
  { type: 'residential', baseLoad: 33, solar: 27, battery: 112, priority: false },
  { type: 'residential', baseLoad: 28, solar: 23, battery: 94,  priority: false },
  { type: 'residential', baseLoad: 30, solar: 25, battery: 100, priority: false },
  { type: 'residential', baseLoad: 26, solar: 20, battery: 84,  priority: false },
  { type: 'residential', baseLoad: 35, solar: 29, battery: 116, priority: false },
  { type: 'residential', baseLoad: 27, solar: 22, battery: 90,  priority: false },
  { type: 'residential', baseLoad: 32, solar: 27, battery: 106, priority: false },
  { type: 'residential', baseLoad: 29, solar: 23, battery: 97,  priority: false },
  { type: 'residential', baseLoad: 31, solar: 26, battery: 103, priority: false },
  { type: 'residential', baseLoad: 34, solar: 28, battery: 114, priority: false },
  { type: 'residential', baseLoad: 28, solar: 22, battery: 91,  priority: false },
  { type: 'residential', baseLoad: 30, solar: 25, battery: 101, priority: false },
  { type: 'residential', baseLoad: 26, solar: 21, battery: 86,  priority: false },
  { type: 'residential', baseLoad: 35, solar: 30, battery: 117, priority: false },
  { type: 'residential', baseLoad: 27, solar: 22, battery: 89,  priority: false },
  { type: 'residential', baseLoad: 33, solar: 27, battery: 107, priority: false },
  { type: 'residential', baseLoad: 29, solar: 24, battery: 98,  priority: false },
  { type: 'residential', baseLoad: 31, solar: 26, battery: 104, priority: false },
  { type: 'residential', baseLoad: 34, solar: 28, battery: 113, priority: false },
]

function generateBuildings(tick: number) {
  const hour = (6 + (tick * 0.05)) % 24
  const solarFactor = hour >= 6 && hour <= 19
    ? Math.sin(Math.PI * (hour - 6) / 13) * (0.8 + Math.random() * 0.2)
    : 0

  return BUILDING_TYPES.map((config, i) => {
    const noise = 0.85 + Math.random() * 0.3
    const eveningBoost = 1 + 0.4 * Math.max(0, Math.sin(Math.PI * (hour - 14) / 8))
    const load = parseFloat((config.baseLoad * eveningBoost * noise).toFixed(1))
    const solar = parseFloat((config.solar * solarFactor * noise).toFixed(1))
    const net = solar - load
    const battery = parseFloat((30 + Math.sin(tick * 0.05 + i) * 35 + 35).toFixed(1))

    return {
      building_id: i + 1,
      building_type: config.type,
      load,
      solar_generation: solar,
      battery_soc: battery,
      grid_connected: true,
      is_selling: net > 20,
      is_buying: net < -20,
      is_critical: config.priority,
      is_priority: config.priority,
      net_energy: parseFloat(net.toFixed(1)),
      trading_status: net > 20 ? 'selling' : net < -20 ? 'buying' : 'idle',
      grid_frequency: parseFloat((Math.random() * 0.2 + 59.9).toFixed(2)),
      timestamp: new Date().toISOString(),
    }
  })
}

function generateLogs(buildings: any[], tick: number) {
  const sellers = buildings.filter(b => b.is_selling)
  const buyers = buildings.filter(b => b.is_buying)
  const logs = []
  const ts = new Date().toLocaleTimeString()

  if (sellers.length && buyers.length && tick % 3 === 0) {
    const s = sellers[Math.floor(Math.random() * sellers.length)]
    const b = buyers[Math.floor(Math.random() * buyers.length)]
    const amt = (Math.random() * 50 + 10).toFixed(1)
    const price = (0.06 + Math.random() * 0.04).toFixed(3)
    logs.push({
      id: tick,
      timestamp: ts,
      level: 'success',
      agent_id: s.building_id,
      message: `Building #${s.building_id} → Building #${b.building_id}: Trade ${amt}kW @ $${price}/kWh ✓`,
      type: 'trade'
    })
  }

  buildings.forEach(b => {
    if (Math.random() > 0.85) {
      const msgs = {
        selling: `Building #${b.building_id}: Surplus ${b.net_energy}kW detected. Broadcasting ASK @ $0.07/kWh`,
        buying:  `Building #${b.building_id}: Deficit ${Math.abs(b.net_energy)}kW. Submitting BID @ $0.09/kWh`,
        idle:    `Building #${b.building_id}: Balanced. Battery ${b.battery_soc}%. Monitoring grid...`,
      }
      logs.push({
        id: tick + Math.random(),
        timestamp: ts,
        level: b.trading_status === 'selling' ? 'info' 
             : b.trading_status === 'buying' ? 'warning' : 'debug',
        agent_id: b.building_id,
        message: msgs[b.trading_status as keyof typeof msgs],
        type: 'agent'
      })
    }
  })

  return logs
}

function generateAnalytics(buildings: any[]) {
  const totalLoad = buildings.reduce((s, b) => s + b.load, 0)
  const totalGen  = buildings.reduce((s, b) => s + b.solar_generation, 0)
  const avgBatt   = buildings.reduce((s, b) => s + b.battery_soc, 0) / buildings.length
  const efficiency = Math.min(100, (totalGen / Math.max(totalLoad, 1)) * 100)
  const sellers = buildings.filter(b => b.is_selling).length
  const buyers  = buildings.filter(b => b.is_buying).length

  return {
    total_load:       parseFloat(totalLoad.toFixed(1)),
    total_generation: parseFloat(totalGen.toFixed(1)),
    avg_battery_soc:  parseFloat(avgBatt.toFixed(1)),
    grid_efficiency:  parseFloat(efficiency.toFixed(1)),
    active_sellers:   sellers,
    active_buyers:    buyers,
    total_buildings:  buildings.length,
    trades_today:     Math.floor(Math.random() * 50 + 20),
    co2_saved:        parseFloat((totalGen * 0.4).toFixed(1)),
    net_grid_flow:    parseFloat((totalLoad - totalGen).toFixed(1)),
    building_count:   buildings.length,
    timestamp:        new Date().toISOString(),
  }
}

function generateMarketStatus(tick: number) {
  return {
    current_price:   parseFloat((0.08 + Math.sin(tick * 0.02) * 0.04).toFixed(3)),
    trades_today:    Math.floor(tick * 0.3),
    total_volume:    parseFloat((tick * 2.5).toFixed(1)),
    grid_stability:  parseFloat((85 + Math.sin(tick * 0.05) * 10).toFixed(1)),
    active_sellers:  Math.floor(Math.random() * 15 + 5),
    active_buyers:   Math.floor(Math.random() * 12 + 3),
    critical_buildings: Math.floor(Math.random() * 3),
  }
}

// Main App Component
function App() {
  const [, setTick] = useState(0)
  const [buildings, setBuildings] = useState(() => generateBuildings(0))
  const [logs, setLogs] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [analytics, setAnalytics] = useState(() => generateAnalytics(generateBuildings(0)))
  const [marketStatus, setMarketStatus] = useState(() => generateMarketStatus(0))
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingTelemetry | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [terminalExpanded, setTerminalExpanded] = useState(false)
  const [page, setPage] = useState('home')
  const connected = true  // always show as connected in demo

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => {
        const newTick = t + 1
        const newBuildings = generateBuildings(newTick)
        const newAnalytics = generateAnalytics(newBuildings)
        const newMarket    = generateMarketStatus(newTick)
        const newLogs      = generateLogs(newBuildings, newTick)

        setBuildings(newBuildings)
        setAnalytics(newAnalytics)
        setMarketStatus(newMarket)
        setLogs(prev => [...prev, ...newLogs].slice(-100))
        setHistory(prev => [...prev, {
          time:        new Date().toLocaleTimeString(),
          load:        newAnalytics.total_load,
          generation:  newAnalytics.total_generation,
          efficiency:  newAnalytics.grid_efficiency,
          traditional: 65,
          price:       newMarket.current_price,
        }].slice(-50))

        return newTick
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

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
              active={true} 
              activeColor="text-amber-400"
            />
            <StatusBadge 
              icon={Activity} 
              label="Grid" 
              active={true} 
              activeColor="text-green-400"
            />
            
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


      </header>

      {/* Main Content */}
      <main className="pt-16 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* 3D City View */}
          <div className="flex-1 relative">
            <CityGrid 
              buildings={buildings} 
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
                buildings={buildings}
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

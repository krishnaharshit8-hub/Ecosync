import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'

// ─────────────────────── SIMULATION ENGINE ───────────────────────
const BUILDING_TYPES = [
  { type: 'hospital',    baseLoad: 500, solar: 300, battery: 2000, priority: true  },
  { type: 'datacenter',  baseLoad: 800, solar: 200, battery: 3000, priority: true  },
  { type: 'commercial',  baseLoad: 150, solar: 100, battery: 500,  priority: false },
  { type: 'commercial',  baseLoad: 120, solar: 80,  battery: 400,  priority: false },
  { type: 'commercial',  baseLoad: 180, solar: 120, battery: 600,  priority: false },
  { type: 'residential', baseLoad: 30,  solar: 25,  battery: 100,  priority: false },
  { type: 'residential', baseLoad: 25,  solar: 20,  battery: 80,   priority: false },
  { type: 'residential', baseLoad: 35,  solar: 30,  battery: 120,  priority: false },
  { type: 'residential', baseLoad: 28,  solar: 22,  battery: 90,   priority: false },
  { type: 'residential', baseLoad: 32,  solar: 28,  battery: 110,  priority: false },
]

function generateBuildings(tick) {
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
      net_energy: parseFloat(net.toFixed(1)),
      trading_status: net > 20 ? 'selling' : net < -20 ? 'buying' : 'idle',
    }
  })
}

function generateLogs(buildings, tick) {
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
      message: `Building #${s.building_id} → #${b.building_id}: Trade ${amt}kW @ $${price}/kWh ✓`,
    })
  }

  buildings.forEach(b => {
    if (Math.random() > 0.88) {
      const msgs = {
        selling: `#${b.building_id}: Surplus ${b.net_energy}kW — ASK @ $0.07/kWh`,
        buying:  `#${b.building_id}: Deficit ${Math.abs(b.net_energy)}kW — BID @ $0.09/kWh`,
        idle:    `#${b.building_id}: Balanced. Battery ${b.battery_soc}%`,
      }
      logs.push({
        id: tick + Math.random(),
        timestamp: ts,
        level: b.trading_status === 'selling' ? 'info' : b.trading_status === 'buying' ? 'warning' : 'debug',
        message: msgs[b.trading_status],
      })
    }
  })
  return logs
}

function generateAnalytics(buildings) {
  const totalLoad = buildings.reduce((s, b) => s + b.load, 0)
  const totalGen  = buildings.reduce((s, b) => s + b.solar_generation, 0)
  const avgBatt   = buildings.reduce((s, b) => s + b.battery_soc, 0) / buildings.length
  const efficiency = Math.min(100, (totalGen / Math.max(totalLoad, 1)) * 100)
  return {
    total_load:       parseFloat(totalLoad.toFixed(1)),
    total_generation: parseFloat(totalGen.toFixed(1)),
    avg_battery_soc:  parseFloat(avgBatt.toFixed(1)),
    grid_efficiency:  parseFloat(efficiency.toFixed(1)),
    net_grid_flow:    parseFloat((totalLoad - totalGen).toFixed(1)),
    active_sellers:   buildings.filter(b => b.is_selling).length,
    active_buyers:    buildings.filter(b => b.is_buying).length,
  }
}

function generateMarketStatus(tick) {
  return {
    current_price: parseFloat((0.08 + Math.sin(tick * 0.02) * 0.04).toFixed(3)),
    trades_today: Math.floor(tick * 0.3),
    total_volume: parseFloat((tick * 2.5).toFixed(1)),
  }
}

// ─────────────────────── DESIGN TOKENS ───────────────────────
const T = {
  bg:     '#04101E',
  panel:  '#0B1929',
  green:  '#00F5A0',
  blue:   '#00D4FF',
  amber:  '#F59E0B',
  red:    '#EF4444',
  text:   '#CBD5E1',
  muted:  '#475569',
  mono:   "'IBM Plex Mono', monospace",
}

// ─────────────────────── DASHBOARD COMPONENT ─────────────────────
function Dashboard({ onBack }) {
  const [, setTick] = useState(0)
  const [buildings, setBuildings] = useState(() => generateBuildings(0))
  const [logs, setLogs] = useState([])
  const [analytics, setAnalytics] = useState(() => generateAnalytics(generateBuildings(0)))
  const [market, setMarket] = useState(() => generateMarketStatus(0))

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => {
        const newTick = t + 1
        const newBuildings = generateBuildings(newTick)
        setBuildings(newBuildings)
        setAnalytics(generateAnalytics(newBuildings))
        setMarket(generateMarketStatus(newTick))
        setLogs(prev => [...prev, ...generateLogs(newBuildings, newTick)].slice(-60))
        return newTick
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const sellers = buildings.filter(b => b.is_selling)
  const buyers  = buildings.filter(b => b.is_buying)
  const critical = buildings.filter(b => b.is_critical)

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.mono }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(4,16,30,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${T.green}33`,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{
            background: `${T.green}18`, border: `1px solid ${T.green}44`,
            borderRadius: 8, padding: '6px 14px', color: T.green,
            cursor: 'pointer', fontFamily: T.mono, fontSize: 12,
          }}>← Home</button>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.green }}>⚡ EcoSync</span>
          <span style={{ fontSize: 11, color: T.muted }}>Live Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
          <span style={{ color: T.green }}>● API Connected</span>
          <span style={{ color: T.green }}>● {buildings.length} Buildings</span>
        </div>
      </header>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, padding: '16px 20px' }}>
        {[
          { label: 'Grid Efficiency', value: `${analytics.grid_efficiency.toFixed(1)}%`, color: T.green },
          { label: 'Total Generation', value: `${analytics.total_generation.toFixed(0)} kW`, color: T.blue },
          { label: 'Net Grid Flow', value: `${analytics.net_grid_flow.toFixed(0)} kW`, color: analytics.net_grid_flow < 0 ? T.green : T.amber },
          { label: 'Avg Battery SoC', value: `${analytics.avg_battery_soc.toFixed(1)}%`, color: '#A855F7' },
          { label: 'Market Price', value: `$${market.current_price.toFixed(3)}/kWh`, color: T.amber },
          { label: 'Trades Today', value: `${market.trades_today}`, color: T.green },
        ].map((m, i) => (
          <div key={i} style={{
            background: T.panel, border: `1px solid ${m.color}33`,
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Market Status Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 20px 16px' }}>
        <div style={{ background: T.panel, border: `1px solid ${T.green}33`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, color: T.muted }}>Active Sellers</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.green }}>{sellers.length}</div>
        </div>
        <div style={{ background: T.panel, border: `1px solid ${T.amber}33`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, color: T.muted }}>Active Buyers</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.amber }}>{buyers.length}</div>
        </div>
        <div style={{ background: T.panel, border: `1px solid ${T.red}33`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, color: T.muted }}>Critical Buildings</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.red }}>{critical.length}</div>
        </div>
      </div>

      {/* Buildings Grid */}
      <div style={{ padding: '0 20px 16px' }}>
        <h3 style={{ fontSize: 13, color: T.green, marginBottom: 12, fontWeight: 600 }}>🏢 Building Telemetry</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {buildings.map(b => {
            const statusColor = b.is_selling ? T.green : b.is_buying ? T.amber : b.is_critical ? T.red : T.blue
            return (
              <div key={b.building_id} style={{
                background: T.panel, border: `1px solid ${statusColor}33`,
                borderLeft: `3px solid ${statusColor}`,
                borderRadius: 10, padding: '14px 16px',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>#{b.building_id}</span>
                  <span style={{ fontSize: 9, textTransform: 'capitalize', color: T.muted }}>{b.building_type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                  <span style={{ color: T.muted }}>Load</span>
                  <span>{b.load.toFixed(1)} kW</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                  <span style={{ color: T.muted }}>Solar</span>
                  <span style={{ color: T.green }}>{b.solar_generation.toFixed(1)} kW</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                  <span style={{ color: T.muted }}>Battery</span>
                  <span style={{ color: b.battery_soc < 30 ? T.red : T.green }}>{b.battery_soc.toFixed(1)}%</span>
                </div>
                {/* Battery Bar */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 8 }}>
                  <div style={{ height: '100%', background: b.battery_soc > 60 ? T.green : b.battery_soc > 30 ? T.amber : T.red, width: `${b.battery_soc}%`, borderRadius: 2, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: b.net_energy >= 0 ? T.green : T.red }}>
                    {b.net_energy >= 0 ? '+' : ''}{b.net_energy.toFixed(1)} kW
                  </span>
                  <span style={{
                    fontSize: 8, padding: '2px 8px', borderRadius: 8, fontWeight: 700,
                    background: `${statusColor}18`, color: statusColor,
                    border: `1px solid ${statusColor}33`, textTransform: 'uppercase',
                  }}>{b.trading_status}</span>
                </div>
                {b.is_critical && (
                  <div style={{
                    marginTop: 6, fontSize: 7, color: T.red,
                    background: 'rgba(239,68,68,0.1)', borderRadius: 4,
                    padding: '2px 6px', textAlign: 'center', letterSpacing: 1,
                  }}>CRITICAL INFRASTRUCTURE</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Agent Logs */}
      <div style={{ padding: '0 20px 24px' }}>
        <h3 style={{ fontSize: 13, color: T.green, marginBottom: 12, fontWeight: 600 }}>🤖 AI Agent Logs</h3>
        <div style={{
          background: T.panel, border: `1px solid ${T.green}22`, borderRadius: 10,
          padding: 16, maxHeight: 280, overflowY: 'auto',
          fontFamily: T.mono, fontSize: 11,
        }}>
          {logs.length === 0 && (
            <div style={{ color: T.muted, textAlign: 'center', padding: 20 }}>
              Waiting for agent activity...
            </div>
          )}
          {logs.slice().reverse().map((log, i) => (
            <div key={i} style={{
              padding: '6px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              color: log.level === 'success' ? T.green : log.level === 'warning' ? T.amber : log.level === 'info' ? T.blue : T.muted,
            }}>
              <span style={{ color: T.muted, marginRight: 8 }}>{log.timestamp}</span>
              {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────── ROOT APP ───────────────────────
function App() {
  const [page, setPage] = useState('home')

  return page === 'home'
    ? <HomePage onNavigateToDashboard={() => setPage('dashboard')} />
    : <Dashboard onBack={() => setPage('home')} />
}

export default App

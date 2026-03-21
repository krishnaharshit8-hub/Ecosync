interface House {
  id: string
  x: number
  y: number
  action: 'SELL' | 'BUY' | 'IDLE'
  color: string
  productionKw: number
}

interface ActiveTrade {
  seller: string
  buyer: string
  amount_kw: number
}

interface GridMapProps {
  houses?: House[]
  trades?: ActiveTrade[]
  width?: number
  height?: number
}

const DEFAULT_HOUSES: House[] = [
  { id: 'H1', x: 80,  y: 70,  action: 'IDLE', color: '#00F5A0', productionKw: 3 },
  { id: 'H2', x: 220, y: 50,  action: 'IDLE', color: '#00D4FF', productionKw: 2.5 },
  { id: 'H3', x: 360, y: 80,  action: 'IDLE', color: '#7C6BFF', productionKw: 4 },
  { id: 'H4', x: 150, y: 180, action: 'IDLE', color: '#FF6B6B', productionKw: 5 },
  { id: 'H5', x: 300, y: 170, action: 'IDLE', color: '#FFD166', productionKw: 3.5 },
]

export function GridMap({
  houses = DEFAULT_HOUSES,
  trades = [],
  width = 420,
  height = 240
}: GridMapProps) {
  const actionColor = (a: string) =>
    a === 'SELL' ? '#00F5A0' : a === 'BUY' ? '#FF6B6B' : '#475569'

  const getHouse = (id: string) => houses.find(h => h.id === id)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(0,245,160,0.08)',
      borderRadius: 10, padding: 12, overflow: 'hidden'
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1, marginBottom: 10,
        fontFamily: 'IBM Plex Mono, monospace' }}>
        🗺 GRID MAP — ENERGY FLOW
      </div>
      <svg width={width} height={height} style={{ display: 'block' }}>
        <defs>
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none"
              stroke="rgba(0,245,160,0.05)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#mapGrid)"/>

        {/* Trade flow lines */}
        {trades.map((trade, i) => {
          const s = getHouse(trade.seller)
          const b = getHouse(trade.buyer)
          if (!s || !b) return null
          return (
            <g key={i}>
              <line x1={s.x} y1={s.y} x2={b.x} y2={b.y}
                stroke="#FFD166" strokeWidth="1.5" strokeOpacity="0.5"
                strokeDasharray="5 3"/>
              <circle
                cx={(s.x + b.x) / 2}
                cy={(s.y + b.y) / 2}
                r="4" fill="#FFD166" fillOpacity="0.8"/>
              <text
                x={(s.x + b.x) / 2 + 6}
                y={(s.y + b.y) / 2 - 4}
                fill="#FFD166" fontSize="8"
                fontFamily="IBM Plex Mono, monospace">
                {trade.amount_kw.toFixed(1)}kW
              </text>
            </g>
          )
        })}

        {/* House nodes */}
        {houses.map(house => {
          const c = actionColor(house.action)
          return (
            <g key={house.id}>
              <circle cx={house.x} cy={house.y} r="20"
                fill="rgba(0,0,0,0.6)"
                stroke={c} strokeWidth="1.5"
                style={{ filter: `drop-shadow(0 0 6px ${c}44)` }}/>
              <circle cx={house.x} cy={house.y} r="5"
                fill={c} fillOpacity="0.9"/>
              <text x={house.x} y={house.y + 32}
                textAnchor="middle" fill="rgba(255,255,255,0.6)"
                fontSize="9" fontFamily="IBM Plex Mono, monospace"
                fontWeight="700">
                {house.id}
              </text>
              <text x={house.x} y={house.y + 42}
                textAnchor="middle" fill={c}
                fontSize="8" fontFamily="IBM Plex Mono, monospace">
                {house.action}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

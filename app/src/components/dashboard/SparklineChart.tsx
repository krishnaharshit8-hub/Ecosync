interface DataPoint {
  t: number
  prod: number
  cons: number
}

interface SparklineChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  showLabels?: boolean
}

export function SparklineChart({
  data, width = 400, height = 80, showLabels = true
}: SparklineChartProps) {
  if (!data || data.length < 2) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 10,
        fontFamily: 'IBM Plex Mono, monospace' }}>
        Collecting data...
      </div>
    )
  }

  const max = Math.max(...data.map(d => Math.max(d.prod, d.cons)), 0.1)
  const pts = (key: 'prod' | 'cons') =>
    data.map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - (d[key] / max) * (height - 8) - 4
      return `${x},${y}`
    }).join(' ')

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="gradProd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#00F5A0" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t} x1="0" y1={height * t} x2={width} y2={height * t}
          stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
      ))}
      {/* Production line */}
      <polyline points={pts('prod')} fill="none"
        stroke="#00F5A0" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Consumption line */}
      <polyline points={pts('cons')} fill="none"
        stroke="#00D4FF" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="4 2"/>
      {/* Live dot at end */}
      {data.length > 0 && (
        <circle
          cx={(data.length - 1) / (data.length - 1) * width}
          cy={height - (data[data.length-1].prod / max) * (height - 8) - 4}
          r="3" fill="#00F5A0"
          style={{ filter: 'drop-shadow(0 0 4px #00F5A0)' }}
        />
      )}
      {showLabels && (
        <>
          <text x="4" y={height - 4} fill="rgba(255,255,255,0.2)" fontSize="8"
            fontFamily="IBM Plex Mono, monospace">60s ago</text>
          <text x={width - 4} y={height - 4} fill="rgba(255,255,255,0.2)" fontSize="8"
            textAnchor="end" fontFamily="IBM Plex Mono, monospace">now</text>
        </>
      )}
    </svg>
  )
}

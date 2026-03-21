import { useEffect, useRef } from 'react'

interface Trade {
  trade_id?: string
  seller: string
  buyer: string
  amount_kw: number
  price_per_kwh?: number
  tx_hash?: string
  timestamp: string
}

interface TradeLogProps {
  trades: Trade[]
  maxHeight?: number
}

export function TradeLog({ trades, maxHeight = 240 }: TradeLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [trades])

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(124,107,255,0.15)',
      borderRadius: 10, overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        fontSize: 10, color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>⛓ BLOCKCHAIN TRADE LOG</span>
        <span style={{ color: '#00F5A0' }}>● LIVE</span>
      </div>

      {/* Trade list */}
      <div ref={scrollRef} style={{ maxHeight, overflowY: 'auto', padding: '6px 0' }}>
        {trades.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center',
            color: 'rgba(255,255,255,0.2)', fontSize: 10,
            fontFamily: 'IBM Plex Mono, monospace' }}>
            Awaiting trades...
          </div>
        ) : (
          [...trades].reverse().map((trade, i) => (
            <div key={i} style={{
              padding: '8px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ fontSize: 11 }}>
                <span style={{ color: '#00F5A0', fontFamily: 'IBM Plex Mono, monospace' }}>
                  {trade.seller}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.25)', margin: '0 6px' }}>→</span>
                <span style={{ color: '#00D4FF', fontFamily: 'IBM Plex Mono, monospace' }}>
                  {trade.buyer}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#FFD166', fontFamily: 'IBM Plex Mono, monospace' }}>
                  {typeof trade.amount_kw === 'number' ? trade.amount_kw.toFixed(2) : trade.amount_kw} kW
                </div>
                {trade.tx_hash && (
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)',
                    fontFamily: 'IBM Plex Mono, monospace', marginTop: 1 }}>
                    {trade.tx_hash.slice(0, 10)}...{trade.tx_hash.slice(-6)}
                  </div>
                )}
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 1,
                  fontFamily: 'IBM Plex Mono, monospace' }}>
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

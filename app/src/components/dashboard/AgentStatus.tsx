interface AgentState {
  house_id: string
  action: 'SELL' | 'BUY' | 'IDLE'
  reason: string
  bid_price?: number
  ask_price?: number
  timestamp?: string
}

interface AgentStatusProps {
  agents: AgentState[]
}

export function AgentStatus({ agents }: AgentStatusProps) {
  const actionColor = (a: string) =>
    a === 'SELL' ? '#00F5A0' : a === 'BUY' ? '#FF6B6B' : '#475569'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(0,212,255,0.12)',
      borderRadius: 10, overflow: 'hidden'
    }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        fontSize: 10, color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace'
      }}>
        🤖 AGENT STATUS
      </div>
      <div style={{ padding: '6px 0' }}>
        {agents.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center',
            color: 'rgba(255,255,255,0.2)', fontSize: 10,
            fontFamily: 'IBM Plex Mono, monospace' }}>
            No agent data
          </div>
        ) : (
          agents.map((agent) => (
            <div key={agent.house_id} style={{
              padding: '8px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', gap: 10
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#fff',
                    fontFamily: 'IBM Plex Mono, monospace'
                  }}>
                    {agent.house_id}
                  </span>
                  <span style={{
                    fontSize: 8, padding: '1px 6px', borderRadius: 6,
                    fontWeight: 700, letterSpacing: 0.5,
                    background: `${actionColor(agent.action)}18`,
                    color: actionColor(agent.action),
                    border: `1px solid ${actionColor(agent.action)}33`
                  }}>
                    {agent.action}
                  </span>
                </div>
                <div style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'IBM Plex Mono, monospace',
                  lineHeight: 1.4,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {agent.reason}
                </div>
              </div>
              {(agent.bid_price || agent.ask_price) && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 9, color: '#FFD166',
                    fontFamily: 'IBM Plex Mono, monospace' }}>
                    ${(agent.bid_price || agent.ask_price || 0).toFixed(3)}/kWh
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

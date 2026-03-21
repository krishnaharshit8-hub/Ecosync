import { useState, useEffect } from 'react'

interface HouseCardProps {
  id: string
  name: string
  productionKw: number
  consumptionKw: number
  batterySoc: number
  action: 'SELL' | 'BUY' | 'IDLE'
  priorityClass: 'critical' | 'residential' | 'commercial'
  color: string
}

export function HouseCard({
  id, name, productionKw, consumptionKw,
  batterySoc, action, priorityClass, color
}: HouseCardProps) {
  const netKw = (productionKw - consumptionKw).toFixed(2)
  const netPositive = parseFloat(netKw) >= 0
  const actionColor = action === 'SELL' ? '#00F5A0'
    : action === 'BUY' ? '#FF6B6B' : '#475569'

  // Radial battery ring SVG
  const r = 18
  const circ = 2 * Math.PI * r
  const dash = (batterySoc / 100) * circ

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}22`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 10,
      padding: '14px 12px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLElement).style.boxShadow = 'none'
    }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 1 }}>{id}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{name}</div>
        </div>
        {/* Battery ring */}
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5"/>
          <circle cx="22" cy="22" r={r} fill="none" stroke={color}
            strokeWidth="3.5"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            transform="rotate(-90 22 22)"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
          <text x="22" y="26" textAnchor="middle" fill={color} fontSize="9" fontWeight="700">
            {batterySoc}%
          </text>
        </svg>
      </div>

      {/* Production bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
          <span>Production</span><span style={{ color: '#00F5A0' }}>{productionKw}kW</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
          <div style={{ height: '100%', borderRadius: 2, background: '#00F5A0', width: `${Math.min((productionKw / 8) * 100, 100)}%`, transition: 'width 0.8s ease' }}/>
        </div>
      </div>

      {/* Consumption bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
          <span>Consumption</span><span style={{ color: '#00D4FF' }}>{consumptionKw}kW</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
          <div style={{ height: '100%', borderRadius: 2, background: '#00D4FF', width: `${Math.min((consumptionKw / 8) * 100, 100)}%`, transition: 'width 0.8s ease' }}/>
        </div>
      </div>

      {/* Net + action badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: netPositive ? '#00F5A0' : '#FF6B6B'
        }}>
          {netPositive ? '+' : ''}{netKw} kW
        </div>
        <div style={{
          fontSize: 8, padding: '2px 8px', borderRadius: 8, fontWeight: 700,
          background: `${actionColor}18`, color: actionColor,
          border: `1px solid ${actionColor}33`
        }}>
          {action}
        </div>
      </div>

      {/* Priority badge for critical */}
      {priorityClass === 'critical' && (
        <div style={{
          marginTop: 6, fontSize: 7.5, color: '#FF6B6B',
          background: 'rgba(255,107,107,0.1)', borderRadius: 4,
          padding: '2px 6px', textAlign: 'center', letterSpacing: 1
        }}>
          CRITICAL INFRASTRUCTURE
        </div>
      )}
    </div>
  )
}

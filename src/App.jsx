import { useState } from 'react'
import HomePage from './pages/HomePage'

function App() {
  const [page, setPage] = useState('home')

  return page === 'home'
    ? <HomePage onNavigateToDashboard={() => setPage('dashboard')} />
    : (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#04101E',
        color: '#CBD5E1',
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#00F5A0' }}>
            ⚡ Dashboard Coming Soon
          </h1>
          <p style={{ marginBottom: '2rem', color: '#475569' }}>
            The live monitoring dashboard is under construction.
          </p>
          <button
            onClick={() => setPage('home')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid rgba(0,245,160,0.3)',
              color: '#00F5A0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    )
}

export default App

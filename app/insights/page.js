'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function NavBar({ active }) {
  const links = [
    { href: '/', label: 'Check-in', emoji: '✏️' },
    { href: '/dashboard', label: 'Dashboard', emoji: '📊' },
    { href: '/history', label: 'History', emoji: '📋' },
    { href: '/insights', label: 'Insights', emoji: '🧠' },
    { href: '/export', label: 'Export', emoji: '⬇️' },
  ]
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: 'rgba(15,15,20,0.95)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '0.75rem 0 1.25rem',
      backdropFilter: 'blur(20px)',
      zIndex: 100,
    }}>
      {links.map(link => (
        <a key={link.href} href={link.href} style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '0.25rem',
          color: active === link.href ? '#818cf8' : '#64748b',
          textDecoration: 'none',
        }}>
          <span style={{ fontSize: '1.4rem' }}>{link.emoji}</span>
          <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>{link.label}</span>
        </a>
      ))}
    </nav>
  )
}

function InsightCard({ insight }) {
  const colors = {
    correlation: { bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)', title: '#a5b4fc' },
    pattern: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', title: '#6ee7b7' },
    outlier: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', title: '#fcd34d' },
    reflection: { bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.2)', title: '#f9a8d4' },
  }
  const style = colors[insight.type] || colors.correlation

  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: '20px',
      padding: '1.25rem',
      marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '1.4rem' }}>{insight.emoji}</span>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: style.title }}>{insight.title}</h3>
      </div>
      <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6' }}>{insight.body}</p>
    </div>
  )
}

export default function Insights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [entryCount, setEntryCount] = useState(0)
  const [error, setError] = useState(null)
  const [lastGenerated, setLastGenerated] = useState(null)

  useEffect(() => {
    checkEntries()
  }, [])

  async function checkEntries() {
    const { data } = await supabase
      .from('entries')
      .select('id')
      .order('date', { ascending: false })
      .limit(30)
    setEntryCount(data?.length || 0)
  }

  async function generateInsights() {
    setLoading(true)
    setError(null)
    try {
      const { data: entries } = await supabase
        .from('entries')
        .select('*')
        .order('date', { ascending: false })
        .limit(30)

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })

      const json = await res.json()
      if (json.error) throw new Error(json.error)
      if (json.insight) {
        setInsights([{ type: 'pattern', emoji: '📊', title: 'Not enough data', body: json.insight }])
      } else {
        setInsights(json.insights)
        setLastGenerated(new Date().toLocaleTimeString())
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f14 0%, #131320 50%, #0f0f14 100%)',
      paddingBottom: '5rem',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '1.5rem 1.5rem 1rem',
        position: 'sticky', top: 0, zIndex: 10,
        backdropFilter: 'blur(20px)',
      }}>
        <h1 style={{
          fontSize: '1.5rem', fontWeight: '700',
          background: 'linear-gradient(135deg, #c084fc, #818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>AI Insights</h1>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Based on your last {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: '680px', margin: '0 auto' }}>

        {/* Generate button */}
        <button
          onClick={generateInsights}
          disabled={loading || entryCount < 3}
          style={{
            width: '100%',
            padding: '1.1rem',
            borderRadius: '16px',
            border: 'none',
            background: loading
              ? 'rgba(129,140,248,0.2)'
              : 'linear-gradient(135deg, #c084fc, #818cf8)',
            color: 'white',
            fontSize: '1.05rem',
            fontWeight: '700',
            cursor: loading || entryCount < 3 ? 'not-allowed' : 'pointer',
            opacity: entryCount < 3 ? 0.5 : 1,
            transition: 'all 0.3s ease',
            marginBottom: '1.5rem',
          }}
        >
          {loading ? '🧠 Analyzing your data...' : '✨ Generate Insights'}
        </button>

        {entryCount < 3 && (
          <div style={{
            textAlign: 'center', color: '#475569',
            fontSize: '0.9rem', marginBottom: '1.5rem',
          }}>
            Log at least 3 days to unlock insights.<br />
            You have {entryCount} so far.
          </div>
        )}

        {lastGenerated && (
          <p style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '1rem', textAlign: 'center' }}>
            Generated at {lastGenerated} · Not medical advice
          </p>
        )}

        {error && (
          <div style={{
            padding: '1rem', borderRadius: '12px', marginBottom: '1rem',
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#fca5a5', fontSize: '0.9rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}

        {insights.length === 0 && !loading && entryCount >= 3 && (
          <div style={{
            textAlign: 'center', color: '#334155',
            padding: '3rem', fontSize: '0.9rem',
          }}>
            Tap the button above to analyze your patterns.
          </div>
        )}
      </div>

      <NavBar active="/insights" />
    </main>
  )
}
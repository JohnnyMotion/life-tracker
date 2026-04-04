'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LayoutDashboard, ClipboardList, Sparkles, Download, PenLine } from 'lucide-react'

function NavBar({ active }) {
  const links = [
    { href: '/',          label: 'Log',       Icon: PenLine         },
    { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/history',   label: 'History',   Icon: ClipboardList   },
    { href: '/insights',  label: 'Insights',  Icon: Sparkles        },
    { href: '/export',    label: 'Export',    Icon: Download        },
  ]
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(7,7,15,0.88)',
      borderTop: '0.5px solid rgba(255,255,255,0.07)',
      display: 'flex', justifyContent: 'space-around',
      paddingTop: '14px',
      paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 20px))',
      backdropFilter: 'blur(40px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
      zIndex: 100,
    }}>
      {links.map(({ href, label, Icon }) => {
        const isActive = active === href
        return (
          <a key={href} href={href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '4px',
            textDecoration: 'none', minWidth: '44px',
            color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
            transition: 'color 0.2s ease', position: 'relative',
          }}>
            {isActive && (
              <div style={{
                position: 'absolute', top: '-10px',
                left: '50%', transform: 'translateX(-50%)',
                width: '28px', height: '2px',
                background: 'linear-gradient(90deg, transparent, #818cf8, transparent)',
                borderRadius: '99px',
              }} />
            )}
            <Icon size={18} strokeWidth={isActive ? 1.75 : 1.5} />
            <span style={{ fontSize: '9px', fontWeight: isActive ? '500' : '400', letterSpacing: '0.03em' }}>{label}</span>
          </a>
        )
      })}
    </nav>
  )
}

const TYPE_STYLES = {
  correlation: { accent: '#818cf8', tint: 'rgba(129,140,248,0.055)' },
  pattern:     { accent: '#34d399', tint: 'rgba(52,211,153,0.05)'   },
  outlier:     { accent: '#f59e0b', tint: 'rgba(245,158,11,0.05)'   },
  reflection:  { accent: '#f472b6', tint: 'rgba(244,114,182,0.05)'  },
}

function InsightCard({ insight }) {
  const { accent, tint } = TYPE_STYLES[insight.type] || TYPE_STYLES.correlation

  return (
    <div style={{
      background: `linear-gradient(160deg, ${tint} 0%, transparent 60%), linear-gradient(160deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.018) 100%)`,
      backdropFilter: 'blur(24px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
      borderRadius: '18px', padding: '18px 18px 16px', marginBottom: '8px',
      border: '1px solid rgba(255,255,255,0.07)',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.05) 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px', lineHeight: 1 }}>{insight.emoji}</span>
        <h3 style={{ fontSize: '13px', fontWeight: '400', color: accent, letterSpacing: '-0.01em' }}>{insight.title}</h3>
      </div>
      <p style={{ fontSize: '13px', fontWeight: '300', color: 'rgba(255,255,255,0.55)', lineHeight: '1.65', letterSpacing: '-0.005em' }}>{insight.body}</p>
    </div>
  )
}

export default function Insights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [entryCount, setEntryCount] = useState(0)
  const [error, setError] = useState(null)
  const [lastGenerated, setLastGenerated] = useState(null)

  useEffect(() => { checkEntries() }, [])

  async function checkEntries() {
    const { data } = await supabase.from('entries').select('id').order('date', { ascending: false }).limit(30)
    setEntryCount(data?.length || 0)
  }

  async function generateInsights() {
    setLoading(true)
    setError(null)
    try {
      const { data: entries } = await supabase.from('entries').select('*').order('date', { ascending: true })
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
      background: `
        radial-gradient(ellipse 90% 55% at 10% -5%, rgba(88,66,160,0.2) 0%, transparent 65%),
        radial-gradient(ellipse 60% 40% at 90% 8%, rgba(20,50,120,0.15) 0%, transparent 65%),
        #07070f
      `,
      paddingBottom: '7rem',
    }}>
      <div style={{ padding: 'calc(3.5rem + env(safe-area-inset-top,0px)) 1.25rem 1rem' }}>
        <p style={{ fontSize: '10px', fontWeight: '400', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Based on {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: '300', letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.88)', lineHeight: 1.1 }}>AI Insights</h1>
      </div>

      <div style={{ padding: '0 1.1rem', maxWidth: '680px', margin: '0 auto' }}>

        <button
          onClick={generateInsights}
          disabled={loading || entryCount < 3}
          style={{
            width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
            background: loading
              ? 'rgba(129,140,248,0.15)'
              : 'linear-gradient(135deg, rgba(109,96,192,0.95) 0%, rgba(79,70,229,0.9) 100%)',
            color: 'rgba(255,255,255,0.92)', fontSize: '13px', fontWeight: '400',
            letterSpacing: '0.01em',
            cursor: loading || entryCount < 3 ? 'not-allowed' : 'pointer',
            opacity: entryCount < 3 ? 0.4 : 1,
            transition: 'all 0.25s ease', marginBottom: '12px',
            boxShadow: '0 0 0 1px rgba(109,96,192,0.35), 0 4px 20px rgba(79,70,229,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
          {loading ? 'Analyzing your data…' : 'Generate Insights'}
        </button>

        {entryCount < 3 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '300', marginBottom: '16px', letterSpacing: '-0.005em' }}>
            Log at least 3 days to unlock insights. You have {entryCount} so far.
          </div>
        )}

        {lastGenerated && (
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', marginBottom: '12px', textAlign: 'center', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            Generated at {lastGenerated} · Not medical advice
          </p>
        )}

        {error && (
          <div style={{
            padding: '12px 14px', borderRadius: '12px', marginBottom: '12px',
            background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)',
            color: 'rgba(252,165,165,0.8)', fontSize: '12px', fontWeight: '300',
          }}>
            {error}
          </div>
        )}

        {insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}

        {insights.length === 0 && !loading && entryCount >= 3 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', padding: '3rem', fontSize: '13px', fontWeight: '300', letterSpacing: '-0.005em' }}>
            Tap the button above to analyze your patterns.
          </div>
        )}
      </div>

      <NavBar active="/insights" />
    </main>
  )
}

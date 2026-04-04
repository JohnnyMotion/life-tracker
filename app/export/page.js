'use client'

import { useState } from 'react'
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

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Export() {
  const [loading, setLoading] = useState(false)
  const [entryCount, setEntryCount] = useState(null)
  const [done, setDone] = useState(null)

  async function fetchAll() {
    const { data } = await supabase.from('entries').select('*').order('date', { ascending: true })
    return data || []
  }

  async function handleExportJSON() {
    setLoading(true)
    setDone(null)
    const data = await fetchAll()
    const json = JSON.stringify(data, null, 2)
    const date = new Date().toISOString().split('T')[0]
    downloadFile(json, `life-tracker-${date}.json`, 'application/json')
    setEntryCount(data.length)
    setDone('json')
    setLoading(false)
  }

  async function handleExportCSV() {
    setLoading(true)
    setDone(null)
    const data = await fetchAll()
    if (!data.length) return setLoading(false)

    const headers = Object.keys(data[0])
    const rows = data.map(row =>
      headers.map(h => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`
        return val
      }).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const date = new Date().toISOString().split('T')[0]
    downloadFile(csv, `life-tracker-${date}.csv`, 'text/csv')
    setEntryCount(data.length)
    setDone('csv')
    setLoading(false)
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
          Your data
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: '300', letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.88)', lineHeight: 1.1 }}>Export</h1>
      </div>

      <div style={{ padding: '0 1.1rem', maxWidth: '680px', margin: '0 auto' }}>

        {/* Info card */}
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.018) 100%)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          borderRadius: '18px', padding: '18px',
          marginBottom: '12px',
          border: '1px solid rgba(255,255,255,0.07)',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.05) 100%)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)' }} />
          <p style={{ fontSize: '13px', fontWeight: '300', color: 'rgba(255,255,255,0.45)', lineHeight: '1.65', letterSpacing: '-0.005em' }}>
            Your data belongs to you. Export it anytime as JSON (great for backups) or CSV (opens in Excel or Google Sheets).
          </p>
        </div>

        {/* JSON button */}
        <button
          onClick={handleExportJSON}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
            background: done === 'json'
              ? 'linear-gradient(135deg, rgba(52,211,153,0.9) 0%, rgba(5,150,105,0.85) 100%)'
              : 'linear-gradient(135deg, rgba(109,96,192,0.95) 0%, rgba(79,70,229,0.9) 100%)',
            color: 'rgba(255,255,255,0.92)', fontSize: '13px', fontWeight: '400',
            letterSpacing: '0.01em', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1, transition: 'all 0.25s ease', marginBottom: '8px',
            boxShadow: done === 'json'
              ? '0 0 0 1px rgba(52,211,153,0.25), 0 4px 20px rgba(52,211,153,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
              : '0 0 0 1px rgba(109,96,192,0.35), 0 4px 20px rgba(79,70,229,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
          {done === 'json' ? `✓  Downloaded ${entryCount} entries as JSON` : 'Export as JSON'}
        </button>

        {/* CSV button */}
        <button
          onClick={handleExportCSV}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', borderRadius: '14px',
            border: done === 'csv' ? 'none' : '1px solid rgba(255,255,255,0.07)',
            background: done === 'csv'
              ? 'linear-gradient(135deg, rgba(52,211,153,0.9) 0%, rgba(5,150,105,0.85) 100%)'
              : 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.012) 100%)',
            color: done === 'csv' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.4)',
            fontSize: '13px', fontWeight: '400', letterSpacing: '0.01em',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1, transition: 'all 0.25s ease',
            boxShadow: done === 'csv'
              ? '0 0 0 1px rgba(52,211,153,0.25), 0 4px 20px rgba(52,211,153,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
              : '0 1px 2px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.12)',
            position: 'relative', overflow: 'hidden',
          }}>
          {done === 'csv' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />}
          {done === 'csv' ? `✓  Downloaded ${entryCount} entries as CSV` : 'Export as CSV'}
        </button>

        <p style={{
          textAlign: 'center', color: 'rgba(255,255,255,0.1)',
          fontSize: '10px', fontWeight: '300',
          marginTop: '16px', letterSpacing: '0.03em', textTransform: 'uppercase',
        }}>
          Includes all fields for every entry
        </p>
      </div>

      <NavBar active="/export" />
    </main>
  )
}

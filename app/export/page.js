'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

function NavBar({ active }) {
  const links = [
    { href: '/', label: 'Check-in', emoji: '✏️' },
    { href: '/dashboard', label: 'Dashboard', emoji: '📊' },
    { href: '/history', label: 'History', emoji: '📋' },
    { href: '/insights', label: 'Insights', emoji: '🧠' },
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
    const { data } = await supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: true })
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
          background: 'linear-gradient(135deg, #34d399, #818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Export Data</h1>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Download all your entries
        </p>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: '680px', margin: '0 auto' }}>

        {/* Info card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '20px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Your data belongs to you. Export it anytime as JSON (great for backups) or CSV (opens in Excel or Google Sheets).
          </p>
        </div>

        {/* JSON button */}
        <button
          onClick={handleExportJSON}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1.1rem',
            borderRadius: '16px',
            border: 'none',
            background: done === 'json'
              ? 'linear-gradient(135deg, #34d399, #059669)'
              : 'linear-gradient(135deg, #818cf8, #c084fc)',
            color: 'white',
            fontSize: '1.05rem',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.3s ease',
            marginBottom: '0.75rem',
          }}
        >
          {done === 'json' ? `✓ Downloaded ${entryCount} entries as JSON` : '⬇ Export as JSON'}
        </button>

        {/* CSV button */}
        <button
          onClick={handleExportCSV}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1.1rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: done === 'csv'
              ? 'linear-gradient(135deg, #34d399, #059669)'
              : 'rgba(255,255,255,0.04)',
            color: done === 'csv' ? 'white' : '#94a3b8',
            fontSize: '1.05rem',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.3s ease',
          }}
        >
          {done === 'csv' ? `✓ Downloaded ${entryCount} entries as CSV` : '⬇ Export as CSV'}
        </button>

        <p style={{
          textAlign: 'center',
          color: '#334155',
          fontSize: '0.8rem',
          marginTop: '1.5rem',
        }}>
          Exports include all fields for every entry you've logged.
        </p>
      </div>

      <NavBar active="/export" />
    </main>
  )
}
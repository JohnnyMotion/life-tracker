'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'

const METRICS = [
  { key: 'happiness', label: 'Happiness', color: '#34d399' },
  { key: 'motivation', label: 'Motivation', color: '#f59e0b' },
  { key: 'focus', label: 'Focus', color: '#818cf8' },
  { key: 'stress', label: 'Stress', color: '#f87171' },
  { key: 'sleep_quality', label: 'Sleep Quality', color: '#60a5fa' },
  { key: 'work_stress', label: 'Work Stress', color: '#fb923c' },
  { key: 'wife_relationship', label: 'Relationship', color: '#f472b6' },
]

function average(arr) {
  if (!arr.length) return 0
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
}

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

function StatCard({ label, value, color, subtitle }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '16px',
      padding: '1rem 1.25rem',
      border: '1px solid rgba(255,255,255,0.06)',
      flex: '1',
      minWidth: '130px',
    }}>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: color }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>{subtitle}</div>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e1e2e',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
      }}>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color, fontSize: '0.9rem', fontWeight: '600' }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(30)
  const [metricA, setMetricA] = useState('happiness')
  const [metricB, setMetricB] = useState('sleep_quality')

  useEffect(() => {
    fetchEntries()
  }, [range])

  async function fetchEntries() {
    setLoading(true)
    const from = new Date()
    from.setDate(from.getDate() - range)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .gte('date', from.toISOString().split('T')[0])
      .order('date', { ascending: true })
    if (!error) setEntries(data || [])
    setLoading(false)
  }

  const chartData = entries.map(e => ({
    ...e,
    day: new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const last7 = entries.slice(-7)
  const medsOn = entries.filter(e => e.adhd_meds)
  const medsOff = entries.filter(e => !e.adhd_meds)

  const medsComparison = METRICS.slice(0, 4).map(m => ({
    metric: m.label,
    'With Meds': Number(average(medsOn.map(e => e[m.key]))),
    'Without Meds': Number(average(medsOff.map(e => e[m.key]))),
  }))

  const exerciseStreak = (() => {
    let streak = 0
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].exercise) streak++
      else break
    }
    return streak
  })()

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
          background: 'linear-gradient(135deg, #34d399, #60a5fa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          {[7, 14, 30].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '0.35rem 0.9rem', borderRadius: '20px', border: 'none',
              background: range === r ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.06)',
              color: range === r ? '#c7d2fe' : '#64748b',
              fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
            }}>{r}d</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: '780px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: '3rem' }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: '3rem' }}>No entries yet.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <StatCard label="Avg Happiness" value={average(last7.map(e => e.happiness))} color="#34d399" subtitle="Last 7 days" />
              <StatCard label="Avg Focus" value={average(last7.map(e => e.focus))} color="#818cf8" subtitle="Last 7 days" />
              <StatCard label="Avg Sleep" value={average(last7.map(e => e.sleep_hours)) + 'h'} color="#60a5fa" subtitle="Last 7 days" />
              <StatCard label="Exercise Streak" value={exerciseStreak} color="#f59e0b" subtitle={exerciseStreak === 1 ? 'day' : 'days'} />
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
              padding: '1.25rem', marginBottom: '1rem',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📈 Trends
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {['A', 'B'].map((slot, i) => {
                  const current = i === 0 ? metricA : metricB
                  const setter = i === 0 ? setMetricA : setMetricB
                  return (
                    <select key={slot} value={current} onChange={e => setter(e.target.value)} style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px', color: '#e2e8f0',
                      padding: '0.4rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer',
                    }}>
                      {METRICS.map(m => (
                        <option key={m.key} value={m.key} style={{ background: '#1e1e2e' }}>{m.label}</option>
                      ))}
                    </select>
                  )
                })}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey={metricA} name={METRICS.find(m => m.key === metricA)?.label} stroke={METRICS.find(m => m.key === metricA)?.color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey={metricB} name={METRICS.find(m => m.key === metricB)?.label} stroke={METRICS.find(m => m.key === metricB)?.color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {medsOn.length > 0 && medsOff.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
                padding: '1.25rem', marginBottom: '1rem',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💊 Meds Days vs No-Meds Days
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={medsComparison} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.8rem' }} />
                    <Bar dataKey="With Meds" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Without Meds" fill="#475569" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
              padding: '1.25rem', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📊 {range}-Day Averages
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {METRICS.map(m => {
                  const avg = Number(average(entries.map(e => e[m.key]).filter(Boolean)))
                  const pct = (avg / 10) * 100
                  return (
                    <div key={m.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{m.label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: m.color }}>{avg}</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '99px', height: '6px' }}>
                        <div style={{
                          background: m.color, width: `${pct}%`,
                          height: '100%', borderRadius: '99px',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
      <NavBar active="/dashboard" />
    </main>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'
import {
  PenLine, LayoutDashboard, ClipboardList,
  Sparkles, Download, TrendingUp, Pill, Activity
} from 'lucide-react'

const PALETTE = {
  happiness:        { line: '#34d399', glow: 'rgba(52,211,153,0.3)'   },
  motivation:       { line: '#f59e0b', glow: 'rgba(245,158,11,0.3)'   },
  focus:            { line: '#818cf8', glow: 'rgba(129,140,248,0.3)'  },
  stress:           { line: '#f87171', glow: 'rgba(248,113,113,0.3)'  },
  sleep_quality:    { line: '#60a5fa', glow: 'rgba(96,165,250,0.3)'   },
  work_stress:      { line: '#fb923c', glow: 'rgba(251,146,60,0.3)'   },
  wife_relationship:{ line: '#f472b6', glow: 'rgba(244,114,182,0.3)'  },
  sleep_hours:      { line: '#a78bfa', glow: 'rgba(167,139,250,0.3)'  },
}

const METRICS = [
  { key: 'happiness',         label: 'Happiness'     },
  { key: 'motivation',        label: 'Motivation'    },
  { key: 'focus',             label: 'Focus'         },
  { key: 'stress',            label: 'Stress'        },
  { key: 'sleep_quality',     label: 'Sleep Quality' },
  { key: 'work_stress',       label: 'Work Stress'   },
  { key: 'wife_relationship', label: 'Relationship'  },
]

function average(arr) {
  const clean = arr.filter(v => v != null && !isNaN(v))
  if (!clean.length) return 0
  return (clean.reduce((a, b) => a + b, 0) / clean.length).toFixed(1)
}

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
      paddingTop: '10px',
      paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 16px))',
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
            transition: 'color 0.2s ease',
            position: 'relative',
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

function GlassCard({ children, style = {} }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.018) 100%)',
      backdropFilter: 'blur(24px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
      borderRadius: '18px',
      border: '1px solid rgba(255,255,255,0.07)',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2), 0 16px 48px rgba(0,0,0,0.1)',
      ...style,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.05) 100%)',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '1px', height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)',
      }} />
      {children}
    </div>
  )
}

function StatCard({ label, value, color, subtitle }) {
  return (
    <GlassCard style={{ flex: 1, minWidth: '130px', padding: '16px 14px' }}>
      <div style={{
        fontSize: '9px', fontWeight: '400',
        color: 'rgba(255,255,255,0.25)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: '6px',
      }}>{label}</div>
      <div style={{
        fontSize: '36px', fontWeight: '200',
        color: color, letterSpacing: '-0.04em',
        lineHeight: 1,
        textShadow: `0 0 24px ${color}60`,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      {subtitle && (
        <div style={{
          fontSize: '9px', fontWeight: '300',
          color: 'rgba(255,255,255,0.2)',
          marginTop: '4px', letterSpacing: '0.02em',
        }}>{subtitle}</div>
      )}
    </GlassCard>
  )
}

function SectionLabel({ title, Icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '20px 0 10px',
    }}>
      <Icon size={13} strokeWidth={1.5} color="rgba(255,255,255,0.3)" />
      <span style={{
        fontSize: '10px', fontWeight: '500',
        color: 'rgba(255,255,255,0.28)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>{title}</span>
      <div style={{
        flex: 1, height: '0.5px',
        background: 'linear-gradient(to right, rgba(255,255,255,0.08), transparent)',
      }} />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(7,7,15,0.92)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '10px 14px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '6px', letterSpacing: '0.04em' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: '13px', fontWeight: '300', letterSpacing: '-0.01em' }}>
          {p.name}: <span style={{ fontWeight: '500' }}>{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(30)
  const [metricA, setMetricA] = useState('happiness')
  const [metricB, setMetricB] = useState('sleep_quality')

  useEffect(() => { fetchEntries() }, [range])

  async function fetchEntries() {
    setLoading(true)
    const from = new Date()
    from.setDate(from.getDate() - range)
    const { data } = await supabase
      .from('entries').select('*')
      .gte('date', from.toISOString().split('T')[0])
      .order('date', { ascending: true })
    setEntries(data || [])
    setLoading(false)
  }

  const chartData = entries.map(e => ({
    ...e,
    day: new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const last7 = entries.slice(-7)
  const medsOn  = entries.filter(e => e.adhd_meds)
  const medsOff = entries.filter(e => !e.adhd_meds)

  const medsComparison = METRICS.slice(0, 4).map(m => ({
    metric: m.label,
    'With Meds':    Number(average(medsOn.map(e => e[m.key]))),
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

  const selectStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: '400',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.01em',
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 90% 55% at 10% -5%, rgba(88,66,160,0.18) 0%, transparent 65%),
        radial-gradient(ellipse 60% 40% at 90% 8%, rgba(20,50,120,0.13) 0%, transparent 65%),
        #07070f
      `,
      paddingBottom: '7rem',
    }}>

      <div style={{
        padding: 'calc(3.5rem + env(safe-area-inset-top,0px)) 1.25rem 0',
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <p style={{
            fontSize: '10px', fontWeight: '400',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: '6px',
          }}>Overview</p>
          <h1 style={{
            fontSize: '28px', fontWeight: '300',
            letterSpacing: '-0.04em',
            color: 'rgba(255,255,255,0.88)',
          }}>Dashboard</h1>
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', paddingBottom: '4px' }}>
          {[7, 14, 30].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '5px 12px', borderRadius: '99px',
              border: range === r ? '1px solid rgba(129,140,248,0.4)' : '1px solid rgba(255,255,255,0.07)',
              background: range === r ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.03)',
              color: range === r ? 'rgba(196,181,253,0.9)' : 'rgba(255,255,255,0.28)',
              fontSize: '11px', fontWeight: '400',
              cursor: 'pointer', transition: 'all 0.2s ease',
              letterSpacing: '0.02em',
            }}>{r}d</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 1.1rem', maxWidth: '780px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '4rem', fontSize: '13px', fontWeight: '300' }}>Loading…</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '4rem', fontSize: '13px', fontWeight: '300' }}>No entries yet.</div>
        ) : (
          <>
            <SectionLabel title="Last 7 Days" Icon={Activity} />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <StatCard label="Avg Happiness" value={average(last7.map(e => e.happiness))}        color={PALETTE.happiness.line}   subtitle="happiness" />
              <StatCard label="Avg Focus"     value={average(last7.map(e => e.focus))}             color={PALETTE.focus.line}       subtitle="focus"     />
              <StatCard label="Avg Sleep"     value={average(last7.map(e => e.sleep_hours)) + 'h'} color={PALETTE.sleep_hours.line} subtitle="sleep"     />
              <StatCard label="Streak"        value={exerciseStreak}                                color={PALETTE.motivation.line}  subtitle={exerciseStreak === 1 ? 'day active' : 'days active'} />
            </div>

            <SectionLabel title="Trends" Icon={TrendingUp} />
            <GlassCard style={{ padding: '20px 16px 12px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[0, 1].map(i => {
                  const current = i === 0 ? metricA : metricB
                  const setter  = i === 0 ? setMetricA : setMetricB
                  return (
                    <select key={i} value={current} onChange={e => setter(e.target.value)} style={selectStyle}>
                      {METRICS.map(m => (
                        <option key={m.key} value={m.key} style={{ background: '#07070f' }}>{m.label}</option>
                      ))}
                    </select>
                  )
                })}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <defs>
                    <filter id="glow-a">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <filter id="glow-b">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey={metricA}
                    name={METRICS.find(m => m.key === metricA)?.label}
                    stroke={PALETTE[metricA]?.line || '#818cf8'}
                    strokeWidth={1.5} dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: PALETTE[metricA]?.line }}
                    filter="url(#glow-a)"
                  />
                  <Line type="monotone" dataKey={metricB}
                    name={METRICS.find(m => m.key === metricB)?.label}
                    stroke={PALETTE[metricB]?.line || '#60a5fa'}
                    strokeWidth={1.5} dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: PALETTE[metricB]?.line }}
                    filter="url(#glow-b)"
                    strokeDasharray="4 2"
                  />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>

            {medsOn.length > 0 && medsOff.length > 0 && (
              <>
                <SectionLabel title="Meds Days vs No-Meds" Icon={Pill} />
                <GlassCard style={{ padding: '20px 16px 12px', marginBottom: '4px' }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={medsComparison}
                      barGap={3}
                      barCategoryGap="35%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={20} />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      />
                      <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: 'Inter', paddingTop: '12px' }} />
                      <Bar dataKey="With Meds"    fill="#818cf8" radius={[4,4,0,0]} opacity={0.9} />
                      <Bar dataKey="Without Meds" fill="#64748b" radius={[4,4,0,0]} opacity={0.75} />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>
              </>
            )}

            <SectionLabel title={`${range}-Day Averages`} Icon={Activity} />
            <GlassCard style={{ padding: '20px 18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {METRICS.map(m => {
                  const avg = Number(average(entries.map(e => e[m.key]).filter(Boolean)))
                  const pct = (avg / 10) * 100
                  const pal = PALETTE[m.key]
                  return (
                    <div key={m.key}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-end', marginBottom: '7px',
                      }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '400',
                          color: 'rgba(255,255,255,0.35)',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>{m.label}</span>
                        <span style={{
                          fontSize: '22px', fontWeight: '200',
                          color: pal.line, letterSpacing: '-0.04em',
                          lineHeight: 1,
                          textShadow: `0 0 16px ${pal.glow}`,
                          fontVariantNumeric: 'tabular-nums',
                        }}>{avg}</span>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '99px', height: '3px', overflow: 'hidden',
                      }}>
                        <div style={{
                          background: `linear-gradient(90deg, ${pal.line}, ${pal.line}99)`,
                          width: `${pct}%`, height: '100%',
                          borderRadius: '99px',
                          boxShadow: `0 0 8px ${pal.glow}`,
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </>
        )}
      </div>
      <NavBar active="/dashboard" />
    </main>
  )
}
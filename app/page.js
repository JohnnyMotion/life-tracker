'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import {
  Pill, Moon, Zap, Heart, Briefcase,
  NotebookPen, LayoutDashboard, ClipboardList,
  Sparkles, Download, PenLine, Wind,
  Coffee, Sunrise, Dumbbell, Wine
} from 'lucide-react'

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  sleep_hours: 7,
  sleep_quality: 7,
  adhd_meds: false,
  caffeine_level: 2,
  exercise_level: 0,
  mindfulness: false,
  happiness: 7,
  motivation: 7,
  focus: 7,
  stress: 4,
  wife_relationship: 8,
  work_stress: 5,
  morning_quality: 7,
  alcohol: 0,
  note: '',
}

const PALETTE = {
  sleep_hours:      { line: '#818cf8', glow: 'rgba(129,140,248,0.3)' },
  sleep_quality:    { line: '#818cf8', glow: 'rgba(129,140,248,0.3)' },
  caffeine_level:   { line: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
  focus:            { line: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
  motivation:       { line: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
  happiness:        { line: '#34d399', glow: 'rgba(52,211,153,0.3)'  },
  stress:           { line: '#f87171', glow: 'rgba(248,113,113,0.3)' },
  work_stress:      { line: '#60a5fa', glow: 'rgba(96,165,250,0.3)'  },
  wife_relationship:{ line: '#f472b6', glow: 'rgba(244,114,182,0.3)' },
  morning_quality:  { line: '#fcd34d', glow: 'rgba(252,211,77,0.3)'  },
  alcohol:          { line: '#c084fc', glow: 'rgba(192,132,252,0.3)' },
  exercise_level:   { line: '#34d399', glow: 'rgba(52,211,153,0.3)'  },
}

const EXERCISE_LABELS = ['Sedentary', 'Light', 'Moderate', 'Full workout']

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

function MetricSlider({ label, name, value, onChange, min = 1, max = 10, customLabel }) {
  const pal = PALETTE[name] || { line: '#818cf8', glow: 'rgba(129,140,248,0.3)' }
  const pct = ((value - min) / (max - min)) * 100
  const track = `linear-gradient(to right,
    ${pal.line} 0%,
    ${pal.line} ${pct}%,
    rgba(255,255,255,0.07) ${pct}%,
    rgba(255,255,255,0.07) 100%
  )`
  const displayValue = customLabel
    ? customLabel(value)
    : name === 'sleep_hours' ? `${value}h` : value

  return (
    <div style={{ marginBottom: '1.6rem' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', marginBottom: '10px',
      }}>
        <span style={{
          fontSize: '11px', fontWeight: '400',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>{label}</span>
        <span style={{
          fontSize: customLabel ? '16px' : '36px',
          fontWeight: '200',
          color: pal.line,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          textShadow: `0 0 30px ${pal.glow}`,
          transition: 'all 0.1s ease',
          fontVariantNumeric: 'tabular-nums',
        }}>{displayValue}</span>
      </div>
      <div style={{ position: 'relative', padding: '4px 0' }}>
        <input
          type="range" min={min} max={max} step="1"
          value={value}
          onChange={e => onChange(name, Number(e.target.value))}
          style={{
            width: '100%', height: '6px',
            borderRadius: '99px', outline: 'none',
            cursor: 'pointer', background: track,
            WebkitAppearance: 'none', appearance: 'none',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)', fontWeight: '300' }}>{min}</span>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)', fontWeight: '300' }}>{max}</span>
      </div>
    </div>
  )
}

function Toggle({ label, name, value, onChange, Icon }) {
  return (
    <button onClick={() => onChange(name, !value)} style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '14px 16px', flex: 1,
      borderRadius: '16px',
      border: value
        ? '1px solid rgba(129,140,248,0.35)'
        : '1px solid rgba(255,255,255,0.06)',
      background: value
        ? 'linear-gradient(160deg, rgba(129,140,248,0.14) 0%, rgba(79,70,229,0.06) 100%)'
        : 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      cursor: 'pointer', transition: 'all 0.2s ease',
      boxShadow: value
        ? '0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07)'
        : '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
      position: 'relative', overflow: 'hidden',
    }}>
      {value && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.4), transparent)',
        }} />
      )}
      <Icon size={16} strokeWidth={1.5} color={value ? 'rgba(196,181,253,0.9)' : 'rgba(255,255,255,0.25)'} />
      <span style={{
        fontSize: '13px', fontWeight: '400',
        color: value ? 'rgba(196,181,253,0.9)' : 'rgba(255,255,255,0.3)',
        letterSpacing: '-0.01em', transition: 'color 0.2s ease',
      }}>{label}</span>
      <div style={{
        marginLeft: 'auto',
        width: '16px', height: '16px', borderRadius: '50%',
        border: value ? 'none' : '1px solid rgba(255,255,255,0.15)',
        background: value ? 'linear-gradient(145deg, #9d8df5, #6d60c0)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: value ? '0 0 10px rgba(124,111,205,0.6)' : 'none',
        transition: 'all 0.2s ease',
      }}>
        {value && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  )
}

function Section({ title, accent, Icon, children }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '20px 0 12px',
      }}>
        <Icon size={13} strokeWidth={1.5} color={accent} style={{ opacity: 0.7 }} />
        <span style={{
          fontSize: '10px', fontWeight: '500',
          color: accent, opacity: 0.65,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>{title}</span>
        <div style={{
          flex: 1, height: '0.5px',
          background: `linear-gradient(to right, ${accent}30, transparent)`,
        }} />
      </div>
      <div style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.018) 100%)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderRadius: '18px',
        padding: '20px 18px 8px',
        border: '1px solid rgba(255,255,255,0.07)',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2), 0 16px 48px rgba(0,0,0,0.1)',
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
    </div>
  )
}

export default function Home() {
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [yesterday, setYesterday] = useState(null)

  useEffect(() => { fetchYesterday() }, [])

  async function fetchYesterday() {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const { data } = await supabase
      .from('entries').select('*')
      .eq('date', d.toISOString().split('T')[0]).single()
    if (data) setYesterday(data)
  }

  const handleChange = (name, value) =>
    setForm(prev => ({ ...prev, [name]: value }))

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      const { error } = await supabase
        .from('entries').upsert([form], { onConflict: 'date' })
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const miniStats = yesterday ? [
    { label: 'Mood',   value: yesterday.happiness,       color: PALETTE.happiness.line        },
    { label: 'Focus',  value: yesterday.focus,            color: PALETTE.focus.line            },
    { label: 'Sleep',  value: `${yesterday.sleep_hours}h`,color: PALETTE.sleep_hours.line      },
    { label: 'Stress', value: yesterday.stress,           color: PALETTE.stress.line           },
  ] : null

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

      <div style={{
        padding: 'calc(3.5rem + env(safe-area-inset-top,0px)) 1.25rem 1.25rem',
      }}>
        <p style={{
          fontSize: '10px', fontWeight: '400',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{
          fontSize: '28px', fontWeight: '300',
          letterSpacing: '-0.04em',
          color: 'rgba(255,255,255,0.88)', lineHeight: 1.1,
        }}>Daily Check-in</h1>
      </div>

      <div style={{ padding: '0 1.1rem', maxWidth: '680px', margin: '0 auto' }}>

        {/* Yesterday strip */}
        {miniStats && (
          <div style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '14px', padding: '12px 16px', marginBottom: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.15)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '0.5px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            }} />
            <span style={{
              fontSize: '9px', fontWeight: '400',
              color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginRight: '16px', whiteSpace: 'nowrap',
            }}>Yesterday</span>
            {miniStats.map(s => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  fontSize: '22px', fontWeight: '200',
                  color: s.color, letterSpacing: '-0.04em', lineHeight: 1.1,
                  textShadow: `0 0 20px ${s.color}60`,
                }}>{s.value}</div>
                <div style={{
                  fontSize: '8px', fontWeight: '400',
                  color: 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px',
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Date */}
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.012) 100%)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '14px', padding: '11px 16px', marginBottom: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 2px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.12)',
        }}>
          <span style={{ fontSize: '10px', fontWeight: '400', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Date</span>
          <input type="date" value={form.date}
            onChange={e => handleChange('date', e.target.value)}
            style={{
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '300',
              cursor: 'pointer', outline: 'none',
              fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em',
            }}
          />
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <Toggle label="ADHD Meds"   name="adhd_meds"   value={form.adhd_meds}   onChange={handleChange} Icon={Pill}  />
          <Toggle label="Mindfulness" name="mindfulness" value={form.mindfulness} onChange={handleChange} Icon={Wind}  />
        </div>

        {/* Sleep */}
        <Section title="Sleep" accent={PALETTE.sleep_hours.line} Icon={Moon}>
          <MetricSlider label="Hours slept"   name="sleep_hours"   value={form.sleep_hours}   onChange={handleChange} min={0} max={12} />
          <MetricSlider label="Sleep quality" name="sleep_quality" value={form.sleep_quality} onChange={handleChange} min={1} max={10} />
        </Section>

        {/* Morning */}
        <Section title="Morning" accent={PALETTE.morning_quality.line} Icon={Sunrise}>
          <MetricSlider label="Morning quality" name="morning_quality" value={form.morning_quality} onChange={handleChange} min={1} max={10} />
        </Section>

        {/* Energy */}
        <Section title="Energy & Focus" accent={PALETTE.caffeine_level.line} Icon={Zap}>
          <MetricSlider label="Caffeine"   name="caffeine_level" value={form.caffeine_level} onChange={handleChange} min={0} max={5} />
          <MetricSlider label="Focus"      name="focus"          value={form.focus}          onChange={handleChange} min={1} max={10} />
          <MetricSlider label="Motivation" name="motivation"     value={form.motivation}     onChange={handleChange} min={1} max={10} />
        </Section>

        {/* Wellbeing */}
        <Section title="Wellbeing" accent={PALETTE.happiness.line} Icon={Heart}>
          <MetricSlider label="Happiness" name="happiness" value={form.happiness} onChange={handleChange} min={1} max={10} />
          <MetricSlider label="Stress"    name="stress"    value={form.stress}    onChange={handleChange} min={1} max={10} />
        </Section>

        {/* Body */}
        <Section title="Body" accent={PALETTE.exercise_level.line} Icon={Dumbbell}>
          <MetricSlider
            label="Exercise"
            name="exercise_level"
            value={form.exercise_level}
            onChange={handleChange}
            min={0} max={3}
            customLabel={v => EXERCISE_LABELS[v]}
          />
          <MetricSlider
            label="Alcohol"
            name="alcohol"
            value={form.alcohol}
            onChange={handleChange}
            min={0} max={5}
          />
        </Section>

        {/* Work & Relationships */}
        <Section title="Work & Relationships" accent={PALETTE.work_stress.line} Icon={Briefcase}>
          <MetricSlider label="Work stress"  name="work_stress"      value={form.work_stress}      onChange={handleChange} min={1} max={10} />
          <MetricSlider label="Relationship" name="wife_relationship" value={form.wife_relationship} onChange={handleChange} min={1} max={10} />
        </Section>

        {/* Note */}
        <Section title="Note" accent="rgba(255,255,255,0.3)" Icon={NotebookPen}>
          <textarea
            value={form.note}
            onChange={e => handleChange('note', e.target.value)}
            placeholder="Anything on your mind today…"
            rows={3}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '10px', padding: '12px 14px',
              color: 'rgba(255,255,255,0.65)',
              fontSize: '13px', fontWeight: '300', lineHeight: '1.65',
              resize: 'none', outline: 'none',
              fontFamily: 'Inter, sans-serif', letterSpacing: '-0.005em',
              marginBottom: '8px',
            }}
          />
        </Section>

        {/* Save */}
        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
          background: saved
            ? 'linear-gradient(135deg, rgba(52,211,153,0.9) 0%, rgba(5,150,105,0.85) 100%)'
            : 'linear-gradient(135deg, rgba(109,96,192,0.95) 0%, rgba(79,70,229,0.9) 100%)',
          color: 'rgba(255,255,255,0.92)',
          fontSize: '13px', fontWeight: '400', letterSpacing: '0.01em',
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.5 : 1, transition: 'all 0.25s ease',
          marginTop: '8px',
          boxShadow: saved
            ? '0 0 0 1px rgba(52,211,153,0.25), 0 4px 20px rgba(52,211,153,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 0 0 1px rgba(109,96,192,0.35), 0 4px 20px rgba(79,70,229,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }} />
          {saving ? 'Saving…' : saved ? '✓  Saved' : 'Save Check-in'}
        </button>

        {error && (
          <div style={{
            marginTop: '8px', padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(248,113,113,0.06)',
            border: '1px solid rgba(248,113,113,0.15)',
            color: 'rgba(252,165,165,0.8)', fontSize: '12px', fontWeight: '300',
          }}>⚠ {error}</div>
        )}
      </div>

      <NavBar active="/" />
    </main>
  )
}
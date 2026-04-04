'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  Pill, Moon, Zap, Heart, Briefcase,
  NotebookPen, LayoutDashboard, ClipboardList,
  Sparkles, Download, PenLine, Wind, Sunrise, Dumbbell,
} from 'lucide-react'

const PALETTE = {
  sleep_hours:       { line: '#818cf8', glow: 'rgba(129,140,248,0.3)' },
  sleep_quality:     { line: '#818cf8', glow: 'rgba(129,140,248,0.3)' },
  caffeine_level:    { line: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
  focus:             { line: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
  motivation:        { line: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
  happiness:         { line: '#34d399', glow: 'rgba(52,211,153,0.3)'  },
  stress:            { line: '#f87171', glow: 'rgba(248,113,113,0.3)' },
  work_stress:       { line: '#60a5fa', glow: 'rgba(96,165,250,0.3)'  },
  wife_relationship: { line: '#f472b6', glow: 'rgba(244,114,182,0.3)' },
  morning_quality:   { line: '#fcd34d', glow: 'rgba(252,211,77,0.3)'  },
  alcohol:           { line: '#c084fc', glow: 'rgba(192,132,252,0.3)' },
  exercise_level:    { line: '#34d399', glow: 'rgba(52,211,153,0.3)'  },
  brain_rot:         { line: '#f87171', glow: 'rgba(248,113,113,0.3)' },
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

function ModalSlider({ label, name, value, onChange, min = 1, max = 10, customLabel }) {
  const pal = PALETTE[name] || { line: '#818cf8', glow: 'rgba(129,140,248,0.3)' }
  const pct = ((value - min) / (max - min)) * 100
  const track = `linear-gradient(to right, ${pal.line} 0%, ${pal.line} ${pct}%, rgba(255,255,255,0.07) ${pct}%, rgba(255,255,255,0.07) 100%)`
  const displayValue = customLabel ? customLabel(value) : name === 'sleep_hours' ? `${value}h` : value

  return (
    <div style={{ marginBottom: '1.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: '400', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{
          fontSize: customLabel ? '16px' : '28px', fontWeight: '200', color: pal.line,
          letterSpacing: '-0.04em', lineHeight: 1,
          textShadow: `0 0 20px ${pal.glow}`, fontVariantNumeric: 'tabular-nums',
        }}>{displayValue}</span>
      </div>
      <input
        type="range" min={min} max={max} step="1" value={value}
        onChange={e => onChange(name, Number(e.target.value))}
        style={{
          width: '100%', height: '6px', borderRadius: '99px',
          outline: 'none', cursor: 'pointer', background: track,
          WebkitAppearance: 'none', appearance: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)', fontWeight: '300' }}>{min}</span>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)', fontWeight: '300' }}>{max}</span>
      </div>
    </div>
  )
}

function ModalToggle({ label, name, value, onChange, Icon }) {
  return (
    <button onClick={() => onChange(name, !value)} style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '14px 16px', width: '100%', borderRadius: '14px',
      border: value ? '1px solid rgba(129,140,248,0.35)' : '1px solid rgba(255,255,255,0.06)',
      background: value
        ? 'linear-gradient(160deg, rgba(129,140,248,0.14) 0%, rgba(79,70,229,0.06) 100%)'
        : 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: '10px',
      boxShadow: value
        ? '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)'
        : '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <Icon size={16} strokeWidth={1.5} color={value ? 'rgba(196,181,253,0.9)' : 'rgba(255,255,255,0.25)'} />
      <span style={{ fontSize: '13px', fontWeight: '400', color: value ? 'rgba(196,181,253,0.9)' : 'rgba(255,255,255,0.3)', letterSpacing: '-0.01em', transition: 'color 0.2s ease' }}>{label}</span>
      <div style={{
        marginLeft: 'auto', width: '16px', height: '16px', borderRadius: '50%',
        border: value ? 'none' : '1px solid rgba(255,255,255,0.15)',
        background: value ? 'linear-gradient(145deg, #9d8df5, #6d60c0)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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

function SectionLabel({ title, accent, Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', marginTop: '4px' }}>
      <Icon size={11} strokeWidth={1.5} color={accent} />
      <span style={{ fontSize: '10px', fontWeight: '500', color: accent, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</span>
      <div style={{ flex: 1, height: '0.5px', background: `linear-gradient(to right, ${accent}30, transparent)` }} />
    </div>
  )
}

function EntryCard({ entry, onEdit }) {
  const date = new Date(entry.date + 'T00:00:00')
  const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })
  const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })

  const pills = [
    { key: 'happiness',   value: entry.happiness,   color: '#34d399', label: 'Happy' },
    { key: 'focus',       value: entry.focus,       color: '#818cf8', label: 'Focus' },
    { key: 'sleep_hours', value: `${entry.sleep_hours}h`, color: '#60a5fa', label: 'Sleep' },
    { key: 'stress',      value: entry.stress,      color: '#f87171', label: 'Stress' },
  ]

  return (
    <div onClick={() => onEdit(entry)} style={{
      background: 'linear-gradient(160deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.018) 100%)',
      backdropFilter: 'blur(24px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
      borderRadius: '18px', padding: '16px 18px', marginBottom: '8px',
      border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: '14px',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.05) 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)' }} />

      <div style={{
        minWidth: '44px', textAlign: 'center',
        background: 'rgba(129,140,248,0.08)', borderRadius: '12px', padding: '8px 6px', flexShrink: 0,
      }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{dayLabel}</div>
        <div style={{ fontSize: '22px', fontWeight: '200', color: 'rgba(196,181,253,0.9)', lineHeight: 1.1, letterSpacing: '-0.04em' }}>{date.getDate()}</div>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>{monthLabel}</div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: entry.note ? '8px' : '0' }}>
          {pills.map(p => (
            <div key={p.key} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px 8px', minWidth: '40px',
            }}>
              <span style={{ fontSize: '14px', fontWeight: '200', color: p.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{p.value}</span>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{p.label}</span>
            </div>
          ))}
          {entry.adhd_meds && (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(129,140,248,0.1)', borderRadius: '10px', padding: '4px 8px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(196,181,253,0.7)' }}>Meds</span>
            </div>
          )}
          {entry.exercise_level > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(52,211,153,0.1)', borderRadius: '10px', padding: '4px 8px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(110,231,183,0.7)' }}>{EXERCISE_LABELS[entry.exercise_level]}</span>
            </div>
          )}
        </div>
        {entry.note && (
          <div style={{ fontSize: '11px', fontWeight: '300', color: 'rgba(255,255,255,0.22)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>
            "{entry.note}"
          </div>
        )}
      </div>

      <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: '14px', flexShrink: 0 }}>›</div>
    </div>
  )
}

function EditModal({ entry, onClose, onSave }) {
  const [form, setForm] = useState({ ...entry })
  const [saving, setSaving] = useState(false)

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('entries').update(form).eq('id', form.id)
    setSaving(false)
    if (!error) onSave(form)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: `radial-gradient(ellipse 80% 40% at 20% -10%, rgba(88,66,160,0.18) 0%, transparent 60%), #0d0d1a`,
        borderRadius: '24px 24px 0 0',
        padding: '0 1.25rem 1.25rem',
        width: '100%', maxHeight: '88vh', overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none',
        position: 'relative',
      }}>
        {/* Sticky header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(13,13,26,0.92)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          padding: '20px 0 16px', marginBottom: '4px',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Editing</p>
              <h2 style={{ fontSize: '18px', fontWeight: '300', color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.03em' }}>
                {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '50%', width: '34px', height: '34px',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '15px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        </div>

        {/* Toggles */}
        <div style={{ marginTop: '20px' }}>
          <SectionLabel title="Quick Toggles" accent="rgba(255,255,255,0.35)" Icon={Pill} />
          <ModalToggle label="ADHD Meds"   name="adhd_meds"   value={!!form.adhd_meds}   onChange={handleChange} Icon={Pill} />
          <ModalToggle label="Mindfulness" name="mindfulness" value={!!form.mindfulness} onChange={handleChange} Icon={Wind} />
        </div>

        {/* Sleep */}
        <div style={{ marginTop: '8px' }}>
          <SectionLabel title="Sleep" accent="#818cf8" Icon={Moon} />
          <ModalSlider label="Hours slept"   name="sleep_hours"   value={form.sleep_hours   ?? 7} onChange={handleChange} min={0} max={12} />
          <ModalSlider label="Sleep quality" name="sleep_quality" value={form.sleep_quality ?? 7} onChange={handleChange} min={1} max={10} />
        </div>

        {/* Morning */}
        <div>
          <SectionLabel title="Morning" accent="#fcd34d" Icon={Sunrise} />
          <ModalSlider label="Morning quality" name="morning_quality" value={form.morning_quality ?? 7} onChange={handleChange} min={1} max={10} />
        </div>

        {/* Energy & Focus */}
        <div>
          <SectionLabel title="Energy & Focus" accent="#f59e0b" Icon={Zap} />
          <ModalSlider label="Caffeine"   name="caffeine_level" value={form.caffeine_level ?? 2} onChange={handleChange} min={0} max={5} />
          <ModalSlider label="Focus"      name="focus"          value={form.focus          ?? 7} onChange={handleChange} min={1} max={10} />
          <ModalSlider label="Motivation" name="motivation"     value={form.motivation     ?? 7} onChange={handleChange} min={1} max={10} />
        </div>

        {/* Wellbeing */}
        <div>
          <SectionLabel title="Wellbeing" accent="#34d399" Icon={Heart} />
          <ModalSlider label="Happiness" name="happiness" value={form.happiness ?? 7} onChange={handleChange} min={1} max={10} />
          <ModalSlider label="Stress"    name="stress"    value={form.stress    ?? 4} onChange={handleChange} min={1} max={10} />
        </div>

        {/* Body */}
        <div>
          <SectionLabel title="Body" accent="#34d399" Icon={Dumbbell} />
          <ModalSlider label="Exercise" name="exercise_level" value={form.exercise_level ?? 0} onChange={handleChange} min={0} max={3} customLabel={v => EXERCISE_LABELS[v]} />
          <ModalSlider label="BrainRot" name="brain_rot"      value={form.brain_rot      ?? 0} onChange={handleChange} min={0} max={8} />
          <ModalSlider label="Alcohol"  name="alcohol"        value={form.alcohol        ?? 0} onChange={handleChange} min={0} max={5} />
        </div>

        {/* Work & Relationships */}
        <div>
          <SectionLabel title="Work & Relationships" accent="#60a5fa" Icon={Briefcase} />
          <ModalSlider label="Work stress"  name="work_stress"      value={form.work_stress       ?? 5} onChange={handleChange} min={1} max={10} />
          <ModalSlider label="Relationship" name="wife_relationship" value={form.wife_relationship  ?? 8} onChange={handleChange} min={1} max={10} />
        </div>

        {/* Note */}
        <div style={{ marginBottom: '20px' }}>
          <SectionLabel title="Note" accent="rgba(255,255,255,0.3)" Icon={NotebookPen} />
          <textarea
            value={form.note || ''}
            onChange={e => handleChange('note', e.target.value)}
            placeholder="Anything on your mind…" rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px',
              padding: '12px 14px', color: 'rgba(255,255,255,0.65)',
              fontSize: '13px', fontWeight: '300', lineHeight: '1.65',
              resize: 'none', outline: 'none',
              fontFamily: 'Inter, sans-serif', letterSpacing: '-0.005em',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
          background: 'linear-gradient(135deg, rgba(109,96,192,0.95) 0%, rgba(79,70,229,0.9) 100%)',
          color: 'rgba(255,255,255,0.92)', fontSize: '13px', fontWeight: '400',
          letterSpacing: '0.01em', cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.5 : 1, transition: 'all 0.25s ease',
          boxShadow: '0 0 0 1px rgba(109,96,192,0.35), 0 4px 20px rgba(79,70,229,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <div style={{ height: 'calc(env(safe-area-inset-bottom, 16px) + 16px)' }} />
      </div>
    </div>
  )
}

export default function History() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    setLoading(true)
    const { data } = await supabase.from('entries').select('*').order('date', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const handleSave = (updated) => {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
    setEditing(null)
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
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: '300', letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.88)', lineHeight: 1.1 }}>History</h1>
      </div>

      <div style={{ padding: '0 1.1rem', maxWidth: '680px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '3rem', fontSize: '13px', fontWeight: '300' }}>Loading…</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '3rem', fontSize: '13px', fontWeight: '300' }}>No entries yet.</div>
        ) : (
          entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} onEdit={setEditing} />
          ))
        )}
      </div>

      {editing && (
        <EditModal entry={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}

      <NavBar active="/history" />
    </main>
  )
}

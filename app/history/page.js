'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FIELDS = [
  { key: 'sleep_hours',      label: 'Sleep Hours',     min: 0,  max: 12, type: 'slider' },
  { key: 'sleep_quality',    label: 'Sleep Quality',   min: 1,  max: 10, type: 'slider' },
  { key: 'adhd_meds',        label: 'ADHD Meds',       type: 'toggle', emoji: '💊' },
  { key: 'mindfulness',      label: 'Mindfulness',     type: 'toggle', emoji: '🌬️' },
  { key: 'morning_quality',  label: 'Morning Quality', min: 1,  max: 10, type: 'slider' },
  { key: 'caffeine_level',   label: 'Caffeine',        min: 0,  max: 5,  type: 'slider' },
  { key: 'exercise_level',   label: 'Exercise',        min: 0,  max: 3,  type: 'slider' },
  { key: 'focus',            label: 'Focus',           min: 1,  max: 10, type: 'slider' },
  { key: 'motivation',       label: 'Motivation',      min: 1,  max: 10, type: 'slider' },
  { key: 'happiness',        label: 'Happiness',       min: 1,  max: 10, type: 'slider' },
  { key: 'stress',           label: 'Stress',          min: 1,  max: 10, type: 'slider' },
  { key: 'brain_rot',        label: 'BrainRot',        min: 0,  max: 8,  type: 'slider' },
  { key: 'alcohol',          label: 'Alcohol',         min: 0,  max: 5,  type: 'slider' },
  { key: 'work_stress',      label: 'Work Stress',     min: 1,  max: 10, type: 'slider' },
  { key: 'wife_relationship',label: 'Relationship',    min: 1,  max: 10, type: 'slider' },
]

const COLORS = {
  happiness: '#34d399', motivation: '#f59e0b', focus: '#818cf8',
  stress: '#f87171', sleep_quality: '#60a5fa', work_stress: '#fb923c',
  wife_relationship: '#f472b6', sleep_hours: '#60a5fa', caffeine_level: '#f59e0b',
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
      paddingTop: '14px',
      paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 20px))',
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

function EntryCard({ entry, onEdit }) {
  const date = new Date(entry.date + 'T00:00:00')
  const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })

  const pills = [
    { label: `😊 ${entry.happiness}`, color: '#34d399' },
    { label: `🎯 ${entry.focus}`, color: '#818cf8' },
    { label: `😴 ${entry.sleep_hours}h`, color: '#60a5fa' },
    { label: `😤 ${entry.stress}`, color: '#f87171' },
  ]

  return (
    <div
      onClick={() => onEdit(entry)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '20px',
        padding: '1.1rem 1.25rem',
        marginBottom: '0.75rem',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div style={{
        minWidth: '48px', textAlign: 'center',
        background: 'rgba(129,140,248,0.1)',
        borderRadius: '12px', padding: '0.5rem 0.25rem',
      }}>
        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{dayLabel}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#c7d2fe' }}>{date.getDate()}</div>
        <div style={{ fontSize: '0.65rem', color: '#475569' }}>{date.toLocaleDateString('en-US', { month: 'short' })}</div>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
        {pills.map(p => (
          <span key={p.label} style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: '20px',
            padding: '0.2rem 0.6rem', fontSize: '0.8rem',
            color: p.color, fontWeight: '600',
          }}>{p.label}</span>
        ))}
        {entry.adhd_meds && <span style={{ background: 'rgba(129,140,248,0.15)', borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', color: '#a5b4fc', fontWeight: '600' }}>💊 Meds</span>}
        {entry.exercise && <span style={{ background: 'rgba(52,211,153,0.15)', borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', color: '#6ee7b7', fontWeight: '600' }}>🏃 Exercise</span>}
      </div>

      {entry.note && (
        <div style={{ fontSize: '0.78rem', color: '#475569', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          "{entry.note}"
        </div>
      )}
      <div style={{ color: '#334155', fontSize: '1rem' }}>›</div>
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        background: '#131320', borderRadius: '24px 24px 0 0',
        padding: '1.5rem', width: '100%', maxHeight: '85vh',
        overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0' }}>
            Edit — {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem',
          }}>✕</button>
        </div>

        {FIELDS.map(field => (
          <div key={field.key} style={{ marginBottom: '1.25rem' }}>
            {field.type === 'slider' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{field.label}</label>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: COLORS[field.key] || '#818cf8' }}>{form[field.key]}</span>
                </div>
                <input
                  type="range" min={field.min} max={field.max} step="1"
                  value={form[field.key] || 0}
                  onChange={e => handleChange(field.key, Number(e.target.value))}
                  style={{ width: '100%', accentColor: COLORS[field.key] || '#818cf8', cursor: 'pointer' }}
                />
              </>
            ) : (
              <button
                onClick={() => handleChange(field.key, !form[field.key])}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem 1.25rem', borderRadius: '14px',
                  border: form[field.key] ? '2px solid #818cf8' : '2px solid #1e293b',
                  background: form[field.key] ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.03)',
                  color: form[field.key] ? '#c7d2fe' : '#64748b',
                  cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', width: '100%',
                }}
              >
                <span>{field.emoji}</span>
                <span>{field.label}</span>
                <span style={{ marginLeft: 'auto' }}>{form[field.key] ? '✓' : '○'}</span>
              </button>
            )}
          </div>
        ))}

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Note</label>
          <textarea
            value={form.note || ''}
            onChange={e => handleChange('note', e.target.value)}
            rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
              padding: '0.875rem', color: '#e2e8f0', fontSize: '0.95rem',
              resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: '1rem', borderRadius: '14px', border: 'none',
          background: 'linear-gradient(135deg, #818cf8, #c084fc)',
          color: 'white', fontSize: '1rem', fontWeight: '700',
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <div style={{ height: '1rem' }} />
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
          background: 'linear-gradient(135deg, #f59e0b, #f472b6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>History</h1>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} total
        </p>
      </div>

      <div style={{ padding: '1.25rem', maxWidth: '680px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: '3rem' }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: '3rem' }}>No entries yet.</div>
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
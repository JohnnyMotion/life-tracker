'use client'

import { useState } from 'react'
import { supabase } from './lib/supabase'

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  sleep_hours: 7,
  sleep_quality: 7,
  adhd_meds: false,
  caffeine_level: 2,
  exercise: false,
  happiness: 7,
  motivation: 7,
  focus: 7,
  stress: 4,
  wife_relationship: 8,
  work_stress: 5,
  note: '',
}

function Slider({ label, name, value, onChange, min = 1, max = 10, color = '#818cf8' }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <label style={{ fontSize: '0.95rem', color: '#94a3b8' }}>{label}</label>
        <span style={{
          fontSize: '1.1rem',
          fontWeight: '700',
          color: color,
          background: 'rgba(129,140,248,0.1)',
          padding: '0 10px',
          borderRadius: '8px'
        }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={e => onChange(name, Number(e.target.value))}
        style={{ width: '100%', accentColor: color, height: '6px', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        <span style={{ fontSize: '0.7rem', color: '#475569' }}>{min}</span>
        <span style={{ fontSize: '0.7rem', color: '#475569' }}>{max}</span>
      </div>
    </div>
  )
}

function Toggle({ label, name, value, onChange, emoji }) {
  return (
    <button
      onClick={() => onChange(name, !value)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        borderRadius: '16px',
        border: value ? '2px solid #818cf8' : '2px solid #1e293b',
        background: value ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.03)',
        color: value ? '#c7d2fe' : '#64748b',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        flex: 1,
      }}
    >
      <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
      <span>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>{value ? '✓' : '○'}</span>
    </button>
  )
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

export default function Home() {
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('entries')
        .upsert([form], { onConflict: 'date' })
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const sections = [
    {
      title: '😴 Sleep',
      color: '#818cf8',
      fields: [
        { type: 'slider', label: 'Hours slept', name: 'sleep_hours', min: 0, max: 12, color: '#818cf8' },
        { type: 'slider', label: 'Sleep quality', name: 'sleep_quality', color: '#818cf8' },
      ]
    },
    {
      title: '⚡ Energy & Focus',
      color: '#f59e0b',
      fields: [
        { type: 'slider', label: 'Caffeine level', name: 'caffeine_level', min: 0, max: 5, color: '#f59e0b' },
        { type: 'slider', label: 'Focus', name: 'focus', color: '#f59e0b' },
        { type: 'slider', label: 'Motivation', name: 'motivation', color: '#f59e0b' },
      ]
    },
    {
      title: '💚 Wellbeing',
      color: '#34d399',
      fields: [
        { type: 'slider', label: 'Happiness', name: 'happiness', color: '#34d399' },
        { type: 'slider', label: 'Stress', name: 'stress', color: '#f87171' },
      ]
    },
    {
      title: '💼 Work & Relationships',
      color: '#60a5fa',
      fields: [
        { type: 'slider', label: 'Work stress', name: 'work_stress', color: '#60a5fa' },
        { type: 'slider', label: 'Relationship quality', name: 'wife_relationship', color: '#f472b6' },
      ]
    },
  ]

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f14 0%, #131320 50%, #0f0f14 100%)',
      paddingBottom: '5rem',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '1.5rem 1.5rem 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(20px)',
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #818cf8, #c084fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>Daily Check-in</h1>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: '680px', margin: '0 auto' }}>

        {/* Date picker */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
            Logging for
          </label>
          <input
            type="date"
            value={form.date}
            onChange={e => handleChange('date', e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e2e8f0',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none',
            }}
          />
        </div>

        {/* Toggles */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <Toggle label="ADHD Meds" name="adhd_meds" value={form.adhd_meds} onChange={handleChange} emoji="💊" />
          <Toggle label="Exercised" name="exercise" value={form.exercise} onChange={handleChange} emoji="🏃" />
        </div>

        {/* Sections */}
        {sections.map(section => (
          <div key={section.title} style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '20px',
            padding: '1.25rem',
            marginBottom: '1rem',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h2 style={{
              fontSize: '0.9rem',
              fontWeight: '700',
              color: section.color,
              marginBottom: '1.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{section.title}</h2>
            {section.fields.map(field => (
              <Slider
                key={field.name}
                label={field.label}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                min={field.min}
                max={field.max}
                color={field.color}
              />
            ))}
          </div>
        ))}

        {/* Note */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '20px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h2 style={{
            fontSize: '0.9rem',
            fontWeight: '700',
            color: '#94a3b8',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>📝 Note</h2>
          <textarea
            value={form.note}
            onChange={e => handleChange('note', e.target.value)}
            placeholder="Anything on your mind today..."
            rows={3}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '0.875rem',
              color: '#e2e8f0',
              fontSize: '0.95rem',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '1.1rem',
            borderRadius: '16px',
            border: 'none',
            background: saved
              ? 'linear-gradient(135deg, #34d399, #059669)'
              : 'linear-gradient(135deg, #818cf8, #c084fc)',
            color: 'white',
            fontSize: '1.05rem',
            fontWeight: '700',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.3s ease',
            letterSpacing: '0.02em',
          }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Check-in'}
        </button>

        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#fca5a5',
            fontSize: '0.9rem',
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      <NavBar active="/" />
    </main>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import {
  Pill, Moon, Zap, Heart, Briefcase,
  NotebookPen, LayoutDashboard, ClipboardList,
  Sparkles, Download, PenLine, Wind,
  Sunrise, Dumbbell, ChevronRight, TrendingUp, TrendingDown, Minus, Brain
} from 'lucide-react'

const DEFAULT_FORM = {
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
  brain_rot: 0,
  note: '',
}

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
const SLIDER_FIELDS = [
  'sleep_hours','sleep_quality','caffeine_level','focus','motivation',
  'happiness','stress','work_stress','wife_relationship',
  'morning_quality','alcohol','exercise_level','brain_rot'
]

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
      paddingTop: '16px',
      paddingBottom: 'calc(18px + env(safe-area-inset-bottom, 22px))',
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

function BriefingStrip({ recentEntries, lastInsight, whatsHot, exerciseStreak, briefingLoaded }) {
  const canvasRef        = useRef(null)
  const rafRef           = useRef(null)
  const particlesRef     = useRef([])
  const mouseRef         = useRef({ x: -999, y: -999 })
  const dissolvingRef    = useRef(false)
  const dissolveStartRef = useRef(null)

  const [canvasVisible, setCanvasVisible] = useState(true)
  const [cardsAnimated, setCardsAnimated] = useState(false)

  // ── Particle animation loop ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const W = canvas.width  = canvas.offsetWidth || window.innerWidth
    const H = canvas.height = 110

    particlesRef.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }))

    function loop(ts) {
      ctx.clearRect(0, 0, W, H)
      const particles = particlesRef.current
      const { x: mx, y: my } = mouseRef.current

      let progress = 0
      if (dissolvingRef.current) {
        if (!dissolveStartRef.current) dissolveStartRef.current = ts
        progress = Math.min(1, (ts - dissolveStartRef.current) / 800)
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Touch / mouse repulsion
        const mdx = p.x - mx
        const mdy = p.y - my
        const md2 = mdx * mdx + mdy * mdy
        if (md2 < 3600 && md2 > 0) {         // 60px radius
          const md = Math.sqrt(md2)
          const f  = 0.04 * (1 - md / 60)
          p.vx += (mdx / md) * f
          p.vy += (mdy / md) * f
        }

        // Particle–particle forces
        for (let j = i + 1; j < particles.length; j++) {
          const q  = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const d2 = dx * dx + dy * dy
          if (d2 > 0 && d2 < 6400) {         // 80px radius
            const d  = Math.sqrt(d2)
            const nx = dx / d
            const ny = dy / d
            if (d < 20) {
              // Repulsion – prevent clumping
              const f = 0.008 * (1 - d / 20)
              p.vx += nx * f;  p.vy += ny * f
              q.vx -= nx * f;  q.vy -= ny * f
            } else {
              // Weak attraction
              const f = 0.0015 * (1 - d / 80)
              p.vx -= nx * f;  p.vy -= ny * f
              q.vx += nx * f;  q.vy += ny * f
            }
          }
        }

        // Speed cap
        const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (sp > 0.3) { p.vx = (p.vx / sp) * 0.3; p.vy = (p.vy / sp) * 0.3 }

        // Dissolution: drift upward
        if (dissolvingRef.current) p.vy -= 0.05

        p.x += p.vx
        p.y += p.vy

        // Edge wrap (only when not dissolving)
        if (!dissolvingRef.current) {
          if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W
          if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H
        }

        // Draw
        const alpha = 0.18 * (1 - progress)
        if (alpha > 0.001) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(129,140,248,${alpha.toFixed(3)})`
          ctx.fill()
        }
      }

      if (dissolvingRef.current && progress >= 1) return   // loop ends naturally
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  // ── Dissolution + card entrance when data arrives ───────────────────────────
  useEffect(() => {
    if (!briefingLoaded) return
    dissolvingRef.current = true
    // Cards: render invisible first, animate in next frame
    requestAnimationFrame(() => setCardsAnimated(true))
    // Canvas: hide after dissolution completes
    setTimeout(() => setCanvasVisible(false), 900)
  }, [briefingLoaded])

  // ── Mouse / touch tracking (on outer container, bubbles from cards row) ─────
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
  const handleTouchMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const t = e.touches[0]
    mouseRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top }
  }
  const clearMouse = () => { mouseRef.current = { x: -999, y: -999 } }

  // ── Build cards (same content as before) ────────────────────────────────────
  const TrendIcon  = whatsHot?.trend === 'up' ? TrendingUp : whatsHot?.trend === 'down' ? TrendingDown : Minus
  const trendColor = whatsHot?.trend === 'up' ? '#34d399'  : whatsHot?.trend === 'down' ? '#f87171'    : '#818cf8'

  const cards = [
    lastInsight && {
      key: 'insight', width: '260px',
      content: (
        <a href="/insights" style={{ textDecoration: 'none', display: 'block', padding: '14px 16px', height: '100%' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Latest Insight</div>
          <div style={{ fontSize: '13px', fontWeight: '300', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, letterSpacing: '-0.01em' }}>"{lastInsight}"</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            <span style={{ fontSize: '10px', color: '#818cf8' }}>Full report</span>
            <ChevronRight size={10} color="#818cf8" />
          </div>
        </a>
      ),
    },
    exerciseStreak > 0 && {
      key: 'streak', width: '140px',
      content: (
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Exercise</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{ fontSize: '36px', fontWeight: '200', color: '#f59e0b', letterSpacing: '-0.04em', lineHeight: 1, textShadow: '0 0 20px rgba(245,158,11,0.4)' }}>{exerciseStreak}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', paddingBottom: '4px' }}>day streak</div>
          </div>
        </div>
      ),
    },
    whatsHot && {
      key: 'whatshot', width: '160px',
      content: (
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>What's Hot</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
            <TrendIcon size={14} color={trendColor} strokeWidth={1.5} />
            <span style={{ fontSize: '11px', fontWeight: '500', color: trendColor }}>{whatsHot.metric}</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: '300', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, letterSpacing: '-0.01em' }}>{whatsHot.headline}</div>
          {whatsHot.value && (
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>{whatsHot.value}</div>
          )}
        </div>
      ),
    },
  ].filter(Boolean)

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: '8px',
        // Reserve space for canvas when no cards are loaded yet
        minHeight: !cards.length && canvasVisible ? '90px' : 'auto',
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={clearMouse}
      onTouchEnd={clearMouse}
    >
      {/* Particle canvas — sits behind everything, pointer-events off */}
      {canvasVisible && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '110px',
            display: 'block', pointerEvents: 'none',
          }}
        />
      )}

      {/* Cards row — rendered as soon as data exists, animated on briefingLoaded */}
      {cards.length > 0 && (
        <div style={{
          overflowX: 'auto', overflowY: 'hidden',
          display: 'flex', gap: '8px',
          padding: '0 1.1rem',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
        }}>
          {cards.map((card, index) => (
            <div key={card.key} style={{
              flexShrink: 0,
              width: card.width,
              minHeight: '90px',
              background: 'linear-gradient(160deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.018) 100%)',
              backdropFilter: 'blur(24px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.07)',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)',
              // ── Entrance animation ──
              opacity: cardsAnimated ? 1 : 0,
              transform: cardsAnimated ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
              transition: `opacity 500ms cubic-bezier(0.34,1.56,0.64,1) ${index * 80}ms, transform 500ms cubic-bezier(0.34,1.56,0.64,1) ${index * 80}ms`,
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.05) 100%)',
              }} />
              {card.content}
            </div>
          ))}
          <div style={{ flexShrink: 0, width: '4px' }} />
        </div>
      )}
    </div>
  )
}

function MetricSlider({ label, name, value, onChange, min = 1, max = 10, customLabel, touched, justTouched }) {
  const pal = PALETTE[name] || { line: '#818cf8', glow: 'rgba(129,140,248,0.3)' }
  const pct = ((value - min) / (max - min)) * 100
  const track = `linear-gradient(to right, ${pal.line} 0%, ${pal.line} ${pct}%, rgba(255,255,255,0.07) ${pct}%, rgba(255,255,255,0.07) 100%)`
  const displayValue = customLabel ? customLabel(value) : name === 'sleep_hours' ? `${value}h` : value

  return (
    <div style={{ marginBottom: '1.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
        <span style={{
          fontSize: '11px', fontWeight: '400',
          color: touched ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.28)',
          letterSpacing: '0.04em', textTransform: 'uppercase',
          transition: 'color 0.3s ease',
        }}>{label}</span>
        <span style={{
          fontSize: customLabel ? '16px' : '36px',
          fontWeight: '200', color: touched ? pal.line : `${pal.line}88`,
          letterSpacing: '-0.04em', lineHeight: 1,
          textShadow: touched ? `0 0 30px ${pal.glow}` : 'none',
          transition: 'color 0.3s ease, text-shadow 0.3s ease',
          fontVariantNumeric: 'tabular-nums',
          display: 'inline-block',
          animation: justTouched ? 'valuePulse 200ms ease-out' : 'none',
        }}>{displayValue}</span>
      </div>
      <input
        type="range" min={min} max={max} step="1" value={value}
        onChange={e => onChange(name, Number(e.target.value))}
        style={{
          width: '100%', height: '6px', borderRadius: '99px',
          outline: 'none', cursor: 'pointer', background: track,
          WebkitAppearance: 'none', appearance: 'none',
          opacity: touched ? 1 : 0.6, transition: 'opacity 0.3s ease',
        }}
      />
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
      padding: '14px 16px', flex: 1, borderRadius: '16px',
      border: value ? '1px solid rgba(129,140,248,0.35)' : '1px solid rgba(255,255,255,0.06)',
      background: value
        ? 'linear-gradient(160deg, rgba(129,140,248,0.14) 0%, rgba(79,70,229,0.06) 100%)'
        : 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
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

function Section({ title, accent, Icon, tint, children }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 0 12px' }}>
        <Icon size={13} strokeWidth={1.5} color={accent} style={{ opacity: 0.7 }} />
        <span style={{ fontSize: '10px', fontWeight: '500', color: accent, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</span>
        <div style={{ flex: 1, height: '0.5px', background: `linear-gradient(to right, ${accent}30, transparent)` }} />
      </div>
      <div style={{
        background: tint
          ? `linear-gradient(160deg, ${tint} 0%, transparent 100%), linear-gradient(160deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.018) 100%)`
          : 'linear-gradient(160deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.018) 100%)',
        backdropFilter: 'blur(24px) saturate(1.4)', WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderRadius: '18px', padding: '20px 18px 8px',
        border: '1px solid rgba(255,255,255,0.07)',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2), 0 16px 48px rgba(0,0,0,0.1)',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.05) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)' }} />
        {children}
      </div>
    </div>
  )
}

export default function Home() {
  const [form, setForm]                   = useState({ ...DEFAULT_FORM })
  const [touched, setTouched]             = useState({})
  const [justTouched, setJustTouched]     = useState({})
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [error, setError]                 = useState(null)
  const [todayEntry, setTodayEntry]       = useState(null)
  const [recentEntries, setRecentEntries] = useState([])
  const [lastInsight, setLastInsight]     = useState(null)
  const [whatsHot, setWhatsHot]           = useState(null)
  const [lastSavedTime, setLastSavedTime] = useState(null)
  const [briefingLoaded, setBriefingLoaded] = useState(false)

  useEffect(() => {
    fetchToday()
    fetchRecent()
  }, [])

  async function fetchToday() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('entries').select('*').eq('date', today).single()
    if (data) {
      setTodayEntry(data)
      setForm(data)
      setLastSavedTime(new Date(data.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
      const t = {}
      SLIDER_FIELDS.forEach(f => { t[f] = true })
      setTouched(t)
    }
  }

  async function fetchRecent() {
    const { data } = await supabase
      .from('entries').select('*')
      .order('date', { ascending: true })
    const entries = data || []
    setRecentEntries(entries)
    await loadOrFetchBriefing(entries)
    setBriefingLoaded(true)
  }

  async function loadOrFetchBriefing(entries) {
    try {
      const cacheKey     = 'briefing_v2'
      const cacheTimeKey = 'briefing_v2_time'
      const cached       = localStorage.getItem(cacheKey)
      const cachedTime   = localStorage.getItem(cacheTimeKey)
      const sixHours     = 6 * 60 * 60 * 1000

      if (cached && cachedTime && Date.now() - Number(cachedTime) < sixHours) {
        const parsed = JSON.parse(cached)
        setLastInsight(parsed.oneliner)
        setWhatsHot(parsed.whatsHot)
        return
      }

      if (!entries || entries.length < 3) return

      const res  = await fetch('/api/oneliner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      const json = await res.json()
      if (json.oneliner || json.whatsHot) {
        setLastInsight(json.oneliner)
        setWhatsHot(json.whatsHot)
        localStorage.setItem(cacheKey, JSON.stringify(json))
        localStorage.setItem(cacheTimeKey, String(Date.now()))
      }
    } catch {}
  }

  const exerciseStreak = (() => {
    let streak = 0
    const sorted = [...recentEntries].sort((a, b) => b.date.localeCompare(a.date))
    for (let i = 0; i < sorted.length; i++) {
      if ((sorted[i].exercise_level || 0) > 0) streak++
      else break
    }
    return streak
  })()

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }))
      setJustTouched(prev => ({ ...prev, [name]: true }))
      setTimeout(() => setJustTouched(prev => ({ ...prev, [name]: false })), 300)
    }
  }

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      const { error } = await supabase.from('entries').upsert([form], { onConflict: 'date' })
      if (error) throw error
      setSaved(true)
      setTodayEntry(form)
      setLastSavedTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
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
      {/* Keyframes for slider value pulse */}
      <style>{`
        @keyframes valuePulse {
          0%   { transform: scale(1);    }
          50%  { transform: scale(1.15); }
          100% { transform: scale(1);    }
        }
      `}</style>

      <div style={{ padding: 'calc(1.5rem + env(safe-area-inset-top,0px)) 1.25rem 1rem' }}>
        <p style={{ fontSize: '10px', fontWeight: '400', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: '300', letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.88)', lineHeight: 1.1 }}>Daily Check-in</h1>
      </div>

      <BriefingStrip
        recentEntries={recentEntries}
        lastInsight={lastInsight}
        whatsHot={whatsHot}
        exerciseStreak={exerciseStreak}
        briefingLoaded={briefingLoaded}
      />

      <div style={{ padding: '0 1.1rem', maxWidth: '680px', margin: '0 auto' }}>

        {todayEntry && lastSavedTime && (
          <div style={{
            background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.18)',
            borderRadius: '12px', padding: '10px 14px', marginBottom: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '11px', fontWeight: '400', color: 'rgba(196,181,253,0.7)', letterSpacing: '-0.01em' }}>Continuing today's entry</span>
            <span style={{ fontSize: '11px', color: 'rgba(129,140,248,0.5)', fontWeight: '300' }}>last saved {lastSavedTime}</span>
          </div>
        )}

        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.012) 100%)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '14px', padding: '11px 16px', marginBottom: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 2px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.12)',
        }}>
          <span style={{ fontSize: '10px', fontWeight: '400', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Date</span>
          <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '300', cursor: 'pointer', outline: 'none', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <Toggle label="ADHD Meds"   name="adhd_meds"   value={form.adhd_meds}   onChange={handleChange} Icon={Pill} />
          <Toggle label="Mindfulness" name="mindfulness" value={form.mindfulness} onChange={handleChange} Icon={Wind} />
        </div>

        <Section title="Sleep" accent={PALETTE.sleep_hours.line} Icon={Moon} tint="rgba(129,140,248,0.055)">
          <MetricSlider label="Hours slept"   name="sleep_hours"   value={form.sleep_hours}   onChange={handleChange} min={0} max={12} touched={touched.sleep_hours}   justTouched={justTouched.sleep_hours} />
          <MetricSlider label="Sleep quality" name="sleep_quality" value={form.sleep_quality} onChange={handleChange} min={1} max={10} touched={touched.sleep_quality} justTouched={justTouched.sleep_quality} />
        </Section>

        <Section title="Morning" accent={PALETTE.morning_quality.line} Icon={Sunrise} tint="rgba(252,211,77,0.045)">
          <MetricSlider label="Morning quality" name="morning_quality" value={form.morning_quality} onChange={handleChange} min={1} max={10} touched={touched.morning_quality} justTouched={justTouched.morning_quality} />
        </Section>

        <Section title="Energy & Focus" accent={PALETTE.caffeine_level.line} Icon={Zap} tint="rgba(245,158,11,0.05)">
          <MetricSlider label="Caffeine"   name="caffeine_level" value={form.caffeine_level} onChange={handleChange} min={0} max={5}  touched={touched.caffeine_level} justTouched={justTouched.caffeine_level} />
          <MetricSlider label="Focus"      name="focus"          value={form.focus}          onChange={handleChange} min={1} max={10} touched={touched.focus}          justTouched={justTouched.focus} />
          <MetricSlider label="Motivation" name="motivation"     value={form.motivation}     onChange={handleChange} min={1} max={10} touched={touched.motivation}     justTouched={justTouched.motivation} />
        </Section>

        <Section title="Wellbeing" accent={PALETTE.happiness.line} Icon={Heart} tint="rgba(52,211,153,0.05)">
          <MetricSlider label="Happiness" name="happiness" value={form.happiness} onChange={handleChange} min={1} max={10} touched={touched.happiness} justTouched={justTouched.happiness} />
          <MetricSlider label="Stress"    name="stress"    value={form.stress}    onChange={handleChange} min={1} max={10} touched={touched.stress}    justTouched={justTouched.stress} />
        </Section>

        <Section title="Body" accent={PALETTE.exercise_level.line} Icon={Dumbbell} tint="rgba(52,211,153,0.04)">
          <MetricSlider label="Exercise"  name="exercise_level" value={form.exercise_level} onChange={handleChange} min={0} max={3}  customLabel={v => EXERCISE_LABELS[v]} touched={touched.exercise_level} justTouched={justTouched.exercise_level} />
          <MetricSlider label="BrainRot"  name="brain_rot"      value={form.brain_rot}      onChange={handleChange} min={0} max={8}  touched={touched.brain_rot}      justTouched={justTouched.brain_rot} />
          <MetricSlider label="Alcohol"   name="alcohol"        value={form.alcohol}        onChange={handleChange} min={0} max={5}  touched={touched.alcohol}        justTouched={justTouched.alcohol} />
        </Section>

        <Section title="Work & Relationships" accent={PALETTE.work_stress.line} Icon={Briefcase} tint="rgba(96,165,250,0.055)">
          <MetricSlider label="Work stress"  name="work_stress"      value={form.work_stress}      onChange={handleChange} min={1} max={10} touched={touched.work_stress}      justTouched={justTouched.work_stress} />
          <MetricSlider label="Relationship" name="wife_relationship" value={form.wife_relationship} onChange={handleChange} min={1} max={10} touched={touched.wife_relationship} justTouched={justTouched.wife_relationship} />
        </Section>

        <Section title="Note" accent="rgba(255,255,255,0.3)" Icon={NotebookPen} tint="rgba(255,255,255,0.025)">
          <textarea
            value={form.note} onChange={e => handleChange('note', e.target.value)}
            placeholder="Anything on your mind today…" rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px',
              padding: '12px 14px', color: 'rgba(255,255,255,0.65)',
              fontSize: '13px', fontWeight: '300', lineHeight: '1.65',
              resize: 'none', outline: 'none',
              fontFamily: 'Inter, sans-serif', letterSpacing: '-0.005em', marginBottom: '8px',
            }}
          />
        </Section>

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
          background: saved
            ? 'linear-gradient(135deg, rgba(52,211,153,0.9) 0%, rgba(5,150,105,0.85) 100%)'
            : 'linear-gradient(135deg, rgba(109,96,192,0.95) 0%, rgba(79,70,229,0.9) 100%)',
          color: 'rgba(255,255,255,0.92)', fontSize: '13px', fontWeight: '400',
          letterSpacing: '0.01em', cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.5 : 1, transition: 'all 0.25s ease', marginTop: '8px',
          boxShadow: saved
            ? '0 0 0 1px rgba(52,211,153,0.25), 0 4px 20px rgba(52,211,153,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 0 0 1px rgba(109,96,192,0.35), 0 4px 20px rgba(79,70,229,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
          {saving ? 'Saving…' : saved ? '✓  Saved' : 'Save Check-in'}
        </button>

        {error && (
          <div style={{ marginTop: '8px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', color: 'rgba(252,165,165,0.8)', fontSize: '12px', fontWeight: '300' }}>
            ⚠ {error}
          </div>
        )}
      </div>
      <NavBar active="/" />
    </main>
  )
}

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { entries } = await request.json()

    if (!entries || entries.length < 3) {
      return Response.json({
        insight: "Log at least 3 days of data to start seeing insights."
      })
    }

    const summary = entries.map(e => ({
      date: e.date,
      sleep: `${e.sleep_hours}h (quality: ${e.sleep_quality}/10)`,
      morningQuality: e.morning_quality,
      meds: e.adhd_meds ? 'yes' : 'no',
      caffeine: e.caffeine_level,
      exerciseLevel: e.exercise_level,
      mindfulness: e.mindfulness ? 'yes' : 'no',
      alcohol: e.alcohol,
      happiness: e.happiness,
      motivation: e.motivation,
      focus: e.focus,
      stress: e.stress,
      relationship: e.wife_relationship,
      workStress: e.work_stress,
      note: e.note || '',
    }))

    const prompt = `You are a thoughtful personal analytics assistant. A person has shared their daily life tracking data with you. Your job is to notice patterns, correlations, and interesting observations — always with careful, non-clinical language.

PRIVATE FIELD GLOSSARY — for your reasoning only. Never reveal, paraphrase, or hint at these definitions in your output. These are internal analysis notes only:
- "mindfulness" = solo sexual release / masturbation. It is a solitary, private activity with no causal link to the "relationship" field. Reason about it purely as a physiological self-regulation behavior — a legitimate variable for stress relief, mood stabilization, sleep onset, and next-day focus. It may appear as an inverse correlate of relationship intimacy scores but is never caused by or directed at the relationship. When surfacing insights about this variable, refer to it only and always as "mindfulness practice" — never with any language that hints at its true nature, even obliquely. Keep all observations completely neutral, matter-of-fact, and indistinguishable from genuine mindfulness meditation.
- "exerciseLevel" = 0 (sedentary), 1 (light movement), 2 (moderate exercise), 3 (full workout). Treat as an ordinal scale.
- "morningQuality" = how the morning felt overall, 1–10. This may be affected by family dynamics, kids' school routines, and household chaos — not just sleep. Look for correlations with sleep, stress, and day-level mood/focus.
- "alcohol" = number of alcoholic drinks consumed, 0–5. Look for next-day effects on sleep quality, mood, focus, and stress. Be matter-of-fact, non-judgmental.

FIELD REFERENCE:
- sleep: hours + subjective quality
- morningQuality: 1–10, how the morning went
- meds: ADHD medication taken yes/no
- caffeine: 0–5 consumption level
- exerciseLevel: 0–3 ordinal scale
- mindfulness: yes/no (see above)
- alcohol: 0–5 drinks
- happiness, motivation, focus: 1–10 subjective scores
- stress, workStress: 1–10 (higher = more stressed)
- relationship: 1–10 relationship quality score

Here is their data from the last ${entries.length} days:

${JSON.stringify(summary, null, 2)}

Please provide 4-6 insights based on this data. Follow these rules strictly:
- Use cautious language throughout: "may suggest", "seems associated with", "you might notice", "it's possible that"
- Never act like a doctor or therapist
- Never make definitive claims
- Look for: correlations between metrics, meds vs no-meds days, sleep patterns, exercise impact, morning quality patterns, alcohol next-day effects, mindfulness practice effects on stress/mood/sleep/focus, streaks, outlier days, and lagging effects (e.g. does poor sleep affect next-day motivation? Does alcohol affect next-day focus?)
- Include one gentle reflection prompt — a question for them to consider
- Keep each insight to 2-3 sentences max
- Format your response as a JSON array like this:
[
  { "type": "correlation", "emoji": "😴", "title": "Sleep & Focus", "body": "..." },
  { "type": "pattern", "emoji": "💊", "title": "Meds Days", "body": "..." },
  { "type": "outlier", "emoji": "⚡", "title": "Your Best Day", "body": "..." },
  { "type": "reflection", "emoji": "🪞", "title": "Something to Consider", "body": "..." }
]

Return ONLY the JSON array. No markdown, no backticks, no preamble, no extra text. Just the raw JSON starting with [ and ending with ].`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    let text = message.content[0].text.trim()
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    const insights = JSON.parse(text)
    return Response.json({ insights })

  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
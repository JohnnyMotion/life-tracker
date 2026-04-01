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
      meds: e.adhd_meds ? 'yes' : 'no',
      caffeine: e.caffeine_level,
      exercise: e.exercise ? 'yes' : 'no',
      happiness: e.happiness,
      motivation: e.motivation,
      focus: e.focus,
      stress: e.stress,
      relationship: e.wife_relationship,
      workStress: e.work_stress,
      note: e.note || '',
    }))

    const prompt = `You are a thoughtful personal analytics assistant. A person has shared their daily life tracking data with you. Your job is to notice patterns, correlations, and interesting observations — but always with careful, non-clinical language.

Here is their data from the last ${entries.length} days:

${JSON.stringify(summary, null, 2)}

Please provide 4-6 insights based on this data. Follow these rules strictly:
- Use cautious language: "may suggest", "seems associated with", "you might notice", "it's possible that"
- Never act like a doctor or therapist
- Never make definitive claims
- Look for: correlations between metrics, the effect of meds vs no-meds days, sleep patterns, exercise impact, streaks, outlier days
- Also include one gentle reflection prompt — a question for them to consider
- Keep each insight to 2-3 sentences max
- Format your response as a JSON array like this:
[
  { "type": "correlation", "emoji": "😴", "title": "Sleep & Focus", "body": "..." },
  { "type": "pattern", "emoji": "💊", "title": "Meds Days", "body": "..." },
  { "type": "outlier", "emoji": "⚡", "title": "Your Best Day", "body": "..." },
  { "type": "reflection", "emoji": "🪞", "title": "Something to Consider", "body": "..." }
]

Return ONLY the JSON array with no markdown, no code fences, no backticks, no extra text. Just the raw JSON array starting with [ and ending with ]`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    // Strip any markdown code fences just in case
    let text = message.content[0].text.trim()
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    const insights = JSON.parse(text)
    return Response.json({ insights })

  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
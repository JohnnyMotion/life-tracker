import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { entries } = await request.json()

    if (!entries || entries.length < 3) {
      return Response.json({ oneliner: null, whatsHot: null })
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
      brainRot: e.brain_rot,
      happiness: e.happiness,
      motivation: e.motivation,
      focus: e.focus,
      stress: e.stress,
      relationship: e.wife_relationship,
      workStress: e.work_stress,
    }))

    const prompt = `You are a personal analytics assistant. Analyze this person's last ${entries.length} days of tracking data.

PRIVATE FIELD GLOSSARY — internal only, never reference directly:
- "mindfulness" = solo sexual release. Refer to only as "mindfulness practice" if mentioned. Keep completely neutral.
- "exerciseLevel" = 0 (sedentary), 1 (light), 2 (moderate), 3 (full workout)
- "morningQuality" = how the morning went, affected by family/household dynamics
- "alcohol" = drinks consumed, 0–5
- "brainRot" = hours of mindless phone/social media scrolling, 0–8

Data:
${JSON.stringify(summary, null, 2)}

Return a JSON object with exactly two fields:

1. "oneliner": One sentence (max 20 words) — a specific, quietly interesting observation about a pattern or correlation. Use cautious language. Don't start with "I". Should feel like a smart friend noticed something.

2. "whatsHot": Pick the single most interesting metric movement from the last 7 days — biggest improvement, sharpest drop, surprising correlation, or notable streak. Return an object:
{
  "metric": "human readable metric name",
  "trend": "up" | "down" | "steady" | "volatile",
  "headline": "one punchy phrase, max 6 words, no period",
  "value": "a relevant number or range e.g. avg 7.4 or +2.1"
}

Return ONLY valid JSON. No markdown, no backticks, no extra text.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    let text = message.content[0].text.trim()
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const result = JSON.parse(text)

    return Response.json({
      oneliner: result.oneliner || null,
      whatsHot: result.whatsHot || null,
    })

  } catch (err) {
    console.error(err)
    return Response.json({ oneliner: null, whatsHot: null })
  }
}
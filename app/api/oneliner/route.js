import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { entries } = await request.json()

    if (!entries || entries.length < 3) {
      return Response.json({ oneliner: null })
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
    }))

    const prompt = `You are a personal analytics assistant. Based on this person's last ${entries.length} days of data, write exactly ONE sentence — a single, specific, quietly interesting observation about a pattern, correlation, or trend you notice.

PRIVATE FIELD GLOSSARY — internal only, never reference directly:
- "mindfulness" = solo sexual release. Refer to only as "mindfulness practice" if mentioned at all. Keep completely neutral.
- "exerciseLevel" = 0 (sedentary), 1 (light), 2 (moderate), 3 (full workout)
- "morningQuality" = how the morning went, affected by family/household dynamics
- "alcohol" = drinks consumed, 0–5

Data:
${JSON.stringify(summary, null, 2)}

Rules:
- One sentence only. No preamble, no explanation, no period at the end if it feels more natural without
- Make it specific to their actual data — not generic
- Use cautious language: "may suggest", "seems associated with", "tends to follow"
- Should feel like a smart friend noticed something, not a robot reporting a stat
- Do NOT start with "I" or "Your"
- Maximum 20 words

Return only the sentence. Nothing else.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [{ role: 'user', content: prompt }],
    })

    const oneliner = message.content[0].text.trim()
    return Response.json({ oneliner })

  } catch (err) {
    console.error(err)
    return Response.json({ oneliner: null })
  }
}
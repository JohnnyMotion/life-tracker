import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const ONELINER_LENSES = [
  "lag effects — how yesterday affected today",
  "the meds pattern and what changes on those days",
  "whether bad mornings bleed into the rest of the day",
  "long-term drift over weeks or months",
  "the avoidance/brain_rot pattern and what triggers it",
  "sleep and alcohol and their downstream effects",
  "outlier days — best or worst and what was different",
  "the relationship between exercise and next-day state",
]

export async function POST(request) {
  try {
    const { entries } = await request.json()

    if (!entries || entries.length < 3) {
      return Response.json({ oneliner: null, whatsHot: null })
    }

    const lens = ONELINER_LENSES[Math.floor(Math.random() * ONELINER_LENSES.length)]

    const summary = entries.map(e => ({
      date: e.date,
      lastNightSleep: `${e.sleep_hours}h (quality: ${e.sleep_quality}/10)`,
      morningQuality: e.morning_quality,
      meds: e.adhd_meds ? 'yes' : 'no',
      caffeine: e.caffeine_level,
      exerciseLevel: e.exercise_level,
      mindfulness: e.mindfulness ? 'yes' : 'no',
      alcoholThisEvening: e.alcohol,
      brainRot: e.brain_rot,
      happiness: e.happiness,
      motivation: e.motivation,
      focus: e.focus,
      stress: e.stress,
      relationship: e.wife_relationship,
      workStress: e.work_stress,
    }))

    const prompt = `You are a sharp personal analytics assistant with full access to ${entries.length} days of this person's tracking data.

CONTEXT (internalize — never quote back):
- Self-employed, diagnosed ADHD, sporadic meds (Ritalin/Adderall). Meds = highest leverage variable.
- morningQuality: 1=WWIII school run chaos, 10=everyone out alive and on time. NOT about how rested he felt.
- alcoholThisEvening = tonight's drinks → affects TOMORROW's sleep and morning, not today.
- brainRot = avoidance/scrolling hours. Signals dark playground spiral.
- Best days = felt like he made a real difference. Output, not hours.
- "mindfulness" = solo private stress-relief. ALWAYS say "mindfulness practice" only. Completely neutral.
- exerciseLevel: 0=sedentary, 1=light, 2=moderate, 3=full workout.
- Lag effects matter: yesterday's alcohol → today's morning/sleep. Sleep → today's focus. Morning → afternoon bleed-through?

THIS GENERATION'S FOCUS: ${lens}

Data (${entries.length} days, oldest first):
${JSON.stringify(summary, null, 2)}

Return a JSON object with exactly two fields:

1. "oneliner": One sentence, max 20 words. A specific observation through today's lens. Cautious language. Don't start with "I". Should feel like a smart friend noticed something real — not a generic wellness tip. Can reference long-term patterns if genuinely interesting.

2. "whatsHot": The single most interesting metric movement right now:
{
  "metric": "human readable name",
  "trend": "up" | "down" | "steady" | "volatile",
  "headline": "punchy phrase max 6 words no period",
  "value": "relevant number e.g. avg 7.4 or +2.1"
}

Return ONLY valid JSON. No markdown, no backticks, nothing else.`

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
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const PERSPECTIVE_LENSES = [
  "Focus particularly on lag effects — how does what happened yesterday or the night before affect today?",
  "Focus particularly on the meds variable — when are they taken, what changes, what doesn't?",
  "Focus on the morning quality metric and whether it actually bleeds into the rest of the day despite his belief that he compartmentalizes.",
  "Look for long-term drift and slow trends over weeks or months — things that wouldn't be visible in a single week.",
  "Focus on outlier days — best days, worst days, and what was different about them.",
  "Look for the avoidance/brain_rot pattern — what conditions precede high brain_rot days?",
  "Focus on the relationship between sleep, alcohol, and next-day performance.",
  "Look for streaks — positive and negative — and what breaks them.",
  "Focus on work stress and output anxiety — what days does he feel most productive vs most stuck?",
  "Look for the role of exercise and mindfulness practice on subsequent days.",
]

export async function POST(request) {
  try {
    const { entries } = await request.json()

    if (!entries || entries.length < 3) {
      return Response.json({
        insight: "Log at least 3 days of data to start seeing insights."
      })
    }

    const lens = PERSPECTIVE_LENSES[Math.floor(Math.random() * PERSPECTIVE_LENSES.length)]

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
      note: e.note || '',
    }))

    const prompt = `You are a sharp, empathetic personal analytics assistant with full access to this person's complete tracking history — ${entries.length} days of data spanning ${entries.length > 30 ? 'several months' : 'recent weeks'}. You have the freedom and judgment to surface insights from any time horizon — yesterday, last week, last month, or long-term drift — whatever is actually interesting and useful. Don't always lead with the same observations. Be genuinely curious about what the data shows.

ABOUT THIS PERSON (internalize completely — never quote these notes back):
- Self-employed creative/business professional. 9 months into a brutal stretch after business partner split. Work stress is output-anxiety and self-worth anxiety, not people stress.
- Diagnosed ADHD. Alternates between Ritalin and Adderall (quick and long release), taken sporadically. Meds are likely his single highest-leverage variable.
- Classic ADHD procrastination — prone to "dark playground" avoidance spirals. brain_rot = hours lost to mindless scrolling/avoidance (0-8h).
- Best days = felt like he made a real difference. Not hours — impact. Worst pattern = avoidance spiral → guilt → more avoidance.
- Morning school run with neurospicy kids is the hardest part of every day. morningQuality: 1=full WWIII (shouting, crying, chaos, late), 10=mission accomplished (everyone out alive and on time). This is NOT about how rested he felt — it's purely about execution and chaos level. Wife (fiery, emotionally expressive) can amplify or de-escalate.
- He believes he compartmentalizes bad mornings once work starts. This may not be true — look for evidence.
- relationship score = whole household harmony (him + wife + kids).
- Alcohol is always evening/dinner — so today's alcohol affects TOMORROW's sleep and morning, not today's.
- sleep_hours and sleep_quality = last night's sleep.
- Remote, self-employed. High pressure to generate business and output.
- Mindfulness practice is solo and private. Always refer to as "mindfulness practice" only — never hint at its nature.
- exerciseLevel: 0=sedentary, 1=light, 2=moderate, 3=full workout.

KEY LAG RELATIONSHIPS TO ANALYZE:
- Yesterday's alcohol → today's sleep quality, morning chaos tolerance, mood
- Last night's sleep → today's focus, motivation, stress tolerance, morning execution
- Morning quality → afternoon mood/work stress (compartmentalization question)
- Meds → focus, motivation, brain_rot reduction, caffeine drop
- Brain_rot ↔ work_stress and motivation (which causes which?)
- Mindfulness practice → next-day stress, mood, relationship score
- Exercise → next-day motivation, focus, mood

PRIVATE FIELD GLOSSARY — never reference these definitions:
- "mindfulness" = solo sexual release. Refer ONLY as "mindfulness practice." Completely neutral always.
- "brainRot" = avoidance/scrolling hours
- "alcoholThisEvening" = tonight's drinks — affects tomorrow
- "morningQuality" = school run chaos level only

THIS GENERATION'S ANALYTICAL LENS:
${lens}
Use this as your primary focus, but don't ignore other genuinely interesting patterns you notice.

FULL DATA (${entries.length} days, oldest first):
${JSON.stringify(summary, null, 2)}

Provide 4-6 insights. Rules:
- Use cautious language throughout: "may suggest", "seems associated with", "you might notice", "it's possible that"
- Be specific — reference actual dates, numbers, patterns from the data
- When surfacing a long-term pattern, say so: "over the past several weeks..." vs "recently..."
- Call out lag effects explicitly: "on days following higher alcohol scores..."
- Flag the meds pattern if visible — it's the most actionable variable
- Look for the compartmentalization question actively
- One insight should be a genuine reflection prompt — something worth sitting with, not just a stat
- Never act like a doctor or therapist
- Never make definitive claims
- 2-3 sentences per insight maximum
- Format as JSON array:
[
  { "type": "correlation", "emoji": "😴", "title": "Short title", "body": "..." },
  { "type": "pattern", "emoji": "💊", "title": "Short title", "body": "..." },
  { "type": "outlier", "emoji": "⚡", "title": "Short title", "body": "..." },
  { "type": "reflection", "emoji": "🪞", "title": "Something to Sit With", "body": "..." }
]

Return ONLY the JSON array. No markdown, no backticks, no preamble. Raw JSON starting with [ and ending with ].`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
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
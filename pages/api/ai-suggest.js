// Optional AI suggestion endpoint. Uses OpenAI if OPENAI_API_KEY is set.

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { fullName } = req.body || {}
  if(!fullName) return res.status(400).json({ error: 'Missing fullName' })

  const key = process.env.OPENAI_API_KEY
  if(!key){
    // Fallback: simple local suggestion
    const parts = fullName.split(' ').filter(Boolean)
    const short = parts.slice(0,2).join(' ')
    return res.status(200).json({ suggestion: `Suggested short name: ${short || fullName}` })
  }

  try{
    // Call OpenAI Chat Completions (if user sets API key)
    const prompt = `Given the full name "${fullName}", suggest a short friendly reference sentence (1 line) that can be used as a confirmation message for an event registration.`
    const payload = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 60,
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(payload)
    })

    if(!r.ok){
      const text = await r.text()
      console.error('OpenAI error', r.status, text)
      return res.status(500).json({ error: 'AI service error' })
    }

    const j = await r.json()
    const suggestion = j?.choices?.[0]?.message?.content || null
    return res.status(200).json({ suggestion })
  }catch(err){
    console.error('AI handler error', err)
    return res.status(500).json({ error: 'AI request failed' })
  }
}

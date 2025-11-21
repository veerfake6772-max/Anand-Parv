const { insertRegistration } = require('../../lib/db')

// Next.js API route to save registration
export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { fullName, sabha, reference, relation, phone } = req.body || {}
  if(!fullName || !sabha) return res.status(400).json({ error: 'Missing required fields' })

  try{
    const result = await insertRegistration({ fullName, sabha, reference, relation, phone })
    return res.status(200).json({ ok: true, id: result.id })
  }catch(err){
    console.error('DB insert error', err)
    return res.status(500).json({ error: 'Failed to save registration' })
  }
}

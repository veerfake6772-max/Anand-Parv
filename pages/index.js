import { useState } from 'react'

export default function Home(){
  const [fullName, setFullName] = useState('')
  const [sabha, setSabha] = useState('Yes')
  const [reference, setReference] = useState('')
  const [relation, setRelation] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function handlePhoneChange(e) {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(value)
  }

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const payload = { fullName, sabha, reference: sabha==='No'? reference: null, relation: sabha==='No'? relation: null, phone: sabha==='No'? phone: null }
    try{
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if(res.ok){
        setMessage('Registration saved. Thank you!')
        setFullName('')
        setSabha('Yes')
        setReference('')
        setRelation('')
        setPhone('')
      } else {
        setMessage(data?.error || 'Failed to save')
      }
    }catch(err){
      setMessage('Network error: '+err.message)
    }finally{setLoading(false)}
  }

  return (
    <div className="container">
      <h1>Anand Parv — Registration (Malad East, 15 Dec)</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Full name</label>
          <input value={fullName} onChange={e=>setFullName(e.target.value)} required />
        </div>

        <div className="field">
          <label>Are you joining the Sabha?</label>
          <select value={sabha} onChange={e=>setSabha(e.target.value)}>
            <option>Yes</option>
            <option>No</option>
          </select>
          <small>Choose "No" to provide a reference person.</small>
        </div>

        {sabha === 'No' && (
          <>
            <div className="field">
              <label>Reference (Full name)</label>
              <input value={reference} onChange={e=>setReference(e.target.value)} required={sabha==='No'} />
            </div>
            <div className="field">
              <label>Relation with reference</label>
              <input value={relation} onChange={e=>setRelation(e.target.value)} required={sabha==='No'} />
            </div>
            <div className="field">
              <label>Reference phone number</label>
              <input value={phone} onChange={handlePhoneChange} required={sabha==='No'} placeholder="10-digit phone number" />
              <small>10 digits only</small>
            </div>
          </>
        )}

        <div style={{display:'flex',gap:8}}>
          <button type="submit" disabled={loading}>{loading? 'Saving...':'Register'}</button>
        </div>
      </form>

      {message && <p style={{marginTop:16}}>{message}</p>}

      <hr style={{marginTop:20}} />
      <section>
        <h3>Notes</h3>
        <ul>
          <li>Event: <strong>Anand Parv</strong> — Malad East — 15 Dec</li>
          <li>Data stored locally in a server-side SQLite database.</li>
        </ul>
      </section>

      <p>
        <a href="/admin" style={{color:'#3b82f6'}}>
          → View all registrations (Admin)
        </a>
      </p>
    </div>
  )
}

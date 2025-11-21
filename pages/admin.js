import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Admin() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/registrations')
      if (res.status === 401) {
        setChecking(false)
        router.push('/login')
        return
      }
      if (res.ok) {
        setAuthenticated(true)
        setChecking(false)
        fetchRegistrations()
      }
    } catch (err) {
      setError('Auth check failed')
      setChecking(false)
    }
  }

  async function fetchRegistrations() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/registrations')
      const json = await res.json()
      if (res.ok) {
        setRegistrations(json.data || [])
      } else {
        setError(json?.error || 'Failed to load')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function exportCSV() {
    if (!registrations.length) {
      alert('No data to export')
      return
    }

    const headers = ['ID', 'Full Name', 'Sabha', 'Reference', 'Relation', 'Phone', 'Created At']
    const rows = registrations.map(r => [
      r.id,
      r.fullName,
      r.sabha,
      r.reference || '',
      r.relation || '',
      r.phone || '',
      r.created_at || ''
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `anand-parv-registrations-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function startEdit(reg) {
    setEditingId(reg.id)
    setEditForm({
      fullName: reg.fullName,
      sabha: reg.sabha,
      reference: reg.reference || '',
      relation: reg.relation || '',
      phone: reg.phone || ''
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
  }

  function handleEditPhoneChange(value) {
    const phoneOnly = value.replace(/\D/g, '').slice(0, 10)
    setEditForm({ ...editForm, phone: phoneOnly })
  }

  async function saveEdit() {
    if (!editForm.fullName || !editForm.sabha) {
      alert('Full name and Sabha are required')
      return
    }

    try {
      const res = await fetch(`/api/registration?id=${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editForm.fullName,
          sabha: editForm.sabha,
          reference: editForm.sabha === 'No' ? editForm.reference : null,
          relation: editForm.sabha === 'No' ? editForm.relation : null,
          phone: editForm.sabha === 'No' ? editForm.phone : null
        })
      })

      if (res.ok) {
        setEditingId(null)
        setEditForm({})
        fetchRegistrations()
      } else {
        alert('Failed to save changes')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this registration?')) return

    try {
      const res = await fetch(`/api/registration?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchRegistrations()
      } else {
        alert('Failed to delete')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <div className="container">
      <h1>Admin — Anand Parv Registrations</h1>

      {checking && <p>Checking authentication...</p>}
      {!checking && !authenticated && <p>Not authenticated. Redirecting...</p>}

      {authenticated && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <button onClick={fetchRegistrations} style={{ marginRight: '8px' }}>
              Refresh
            </button>
            <button onClick={exportCSV}>
              Export CSV
            </button>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {registrations.length === 0 && !loading && <p>No registrations yet.</p>}

          {registrations.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Full Name</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Sabha</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Reference</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Relation</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Created At</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(r => (
                    editingId === r.id ? (
                      <tr key={r.id} style={{ backgroundColor: '#fef3c7', borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px' }}>{r.id}</td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="text"
                            value={editForm.fullName}
                            onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                            style={{ width: '100%', padding: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <select
                            value={editForm.sabha}
                            onChange={e => setEditForm({ ...editForm, sabha: e.target.value })}
                            style={{ width: '100%', padding: '4px' }}
                          >
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </td>
                        <td style={{ padding: '8px' }}>
                          {editForm.sabha === 'No' && (
                            <input
                              type="text"
                              value={editForm.reference}
                              onChange={e => setEditForm({ ...editForm, reference: e.target.value })}
                              style={{ width: '100%', padding: '4px' }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {editForm.sabha === 'No' && (
                            <input
                              type="text"
                              value={editForm.relation}
                              onChange={e => setEditForm({ ...editForm, relation: e.target.value })}
                              style={{ width: '100%', padding: '4px' }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {editForm.sabha === 'No' && (
                            <input
                              type="text"
                              value={editForm.phone}
                              onChange={e => handleEditPhoneChange(e.target.value)}
                              placeholder="10 digits"
                              style={{ width: '100%', padding: '4px' }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '8px' }}>—</td>
                        <td style={{ padding: '8px' }}>
                          <button onClick={saveEdit} style={{ marginRight: '4px', padding: '4px 8px' }}>
                            Save
                          </button>
                          <button onClick={cancelEdit} style={{ padding: '4px 8px' }}>
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px' }}>{r.id}</td>
                        <td style={{ padding: '8px' }}>{r.fullName}</td>
                        <td style={{ padding: '8px' }}>{r.sabha}</td>
                        <td style={{ padding: '8px' }}>{r.reference || '—'}</td>
                        <td style={{ padding: '8px' }}>{r.relation || '—'}</td>
                        <td style={{ padding: '8px' }}>{r.phone || '—'}</td>
                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>{r.created_at || '—'}</td>
                        <td style={{ padding: '8px' }}>
                          <button onClick={() => startEdit(r)} style={{ marginRight: '4px', padding: '4px 8px' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(r.id)} style={{ padding: '4px 8px', backgroundColor: '#fecaca', color: '#991b1b' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <hr style={{ marginTop: '24px' }} />
          <p>
            <a href="/" style={{ color: '#3b82f6' }}>
              ← Back to Registration
            </a>
          </p>
        </>
      )}
    </div>
  )
}
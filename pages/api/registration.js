const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { isAuthenticated } = require('../../lib/auth');

const dbPath = path.join(process.cwd(), 'data', 'registrations.db');

function checkAuth(req) {
  return isAuthenticated(req);
}

function updateRegistration(id, { fullName, sabha, reference, relation, phone }) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    const stmt = db.prepare(
      `UPDATE registrations SET fullName=?, sabha=?, reference=?, relation=?, phone=? WHERE id=?`
    );
    stmt.run(fullName, sabha, reference || null, relation || null, phone || null, id, function(err) {
      db.close();
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
    stmt.finalize();
  });
}

function deleteRegistration(id) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    const stmt = db.prepare(`DELETE FROM registrations WHERE id=?`);
    stmt.run(id, function(err) {
      db.close();
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
    stmt.finalize();
  });
}

export default async function handler(req, res) {
  const { id } = req.query;

  // Require authentication for edit/delete
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { fullName, sabha, reference, relation, phone } = req.body || {};
    if (!fullName || !sabha) return res.status(400).json({ error: 'Missing required fields' });

    try {
      const result = await updateRegistration(id, { fullName, sabha, reference, relation, phone });
      return res.status(200).json({ ok: true, changes: result.changes });
    } catch (err) {
      console.error('Update error', err);
      return res.status(500).json({ error: 'Failed to update registration' });
    }
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing id' });

    try {
      const result = await deleteRegistration(id);
      return res.status(200).json({ ok: true, changes: result.changes });
    } catch (err) {
      console.error('Delete error', err);
      return res.status(500).json({ error: 'Failed to delete registration' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

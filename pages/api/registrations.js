const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { isAuthenticated } = require('../../lib/auth');

const dbPath = path.join(process.cwd(), 'data', 'registrations.db');

function getAllRegistrations() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.all(`SELECT * FROM registrations ORDER BY created_at DESC`, (err, rows) => {
      db.close();
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const registrations = await getAllRegistrations();
    return res.status(200).json({ data: registrations });
  } catch (err) {
    console.error('Query error', err);
    return res.status(500).json({ error: 'Failed to fetch registrations' });
  }
}

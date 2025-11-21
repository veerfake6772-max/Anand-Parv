const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'registrations.db');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    sabha TEXT NOT NULL,
    reference TEXT,
    relation TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

function insertRegistration({ fullName, sabha, reference = null, relation = null, phone = null }){
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO registrations (fullName, sabha, reference, relation, phone) VALUES (?,?,?,?,?)`);
    stmt.run(fullName, sabha, reference, relation, phone, function(err){
      if(err) return reject(err);
      resolve({ id: this.lastID });
    });
    stmt.finalize();
  });
}

module.exports = { insertRegistration, dbPath };

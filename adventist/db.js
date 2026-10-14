const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'app.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

function getValue(key) {
  const row = db.prepare('SELECT value FROM kv WHERE key = ?').get(key);
  return row ? row.value : null;
}

function setValue(key, value) {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  return db.prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, v);
}

module.exports = {
  getDashboard() {
    const raw = getValue('dashboard');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  setDashboard(obj) {
    return setValue('dashboard', JSON.stringify(obj));
  },
  // generic helpers
  getValue,
  setValue
};

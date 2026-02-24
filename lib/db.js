const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'redflag.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY,
        image_path TEXT,
        bio TEXT,
        status TEXT DEFAULT 'pending',
        score INTEGER,
        risk_label TEXT,
        analysis_json TEXT,
        paid INTEGER DEFAULT 0,
        stripe_session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}

function createScan({ id, imagePath, bio }) {
  const db = getDb();
  db.prepare(
    'INSERT INTO scans (id, image_path, bio) VALUES (?, ?, ?)'
  ).run(id, imagePath, bio || '');
  return { id };
}

function getScan(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM scans WHERE id = ?').get(id);
}

function updateScanResult(id, { score, riskLabel, analysisJson }) {
  const db = getDb();
  db.prepare(
    'UPDATE scans SET status = ?, score = ?, risk_label = ?, analysis_json = ? WHERE id = ?'
  ).run('complete', score, riskLabel, JSON.stringify(analysisJson), id);
}

function updateScanError(id) {
  const db = getDb();
  db.prepare('UPDATE scans SET status = ? WHERE id = ?').run('error', id);
}

function markPaid(id, stripeSessionId) {
  const db = getDb();
  db.prepare(
    'UPDATE scans SET paid = 1, stripe_session_id = ? WHERE id = ?'
  ).run(stripeSessionId, id);
}

module.exports = { getDb, createScan, getScan, updateScanResult, updateScanError, markPaid };

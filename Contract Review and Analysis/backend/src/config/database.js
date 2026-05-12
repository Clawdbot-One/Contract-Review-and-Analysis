const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../contract_review.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database successfully');
    initTables();
  }
});

const seedAdminUsers = async () => {
  const admins = [
    { username: 'root', email: 'root@contract-review.com', password: 'root@2026', role: 'admin' },
    { username: 'admin', email: 'admin@contract-review.com', password: 'admin@2026', role: 'admin' },
    { username: 'master', email: 'master@contract-review.com', password: 'master@2026', role: 'admin' },
  ];

  for (const admin of admins) {
    const existing = await query('SELECT id FROM users WHERE username = ?', [admin.username]);
    if (existing.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);
      await run(
        'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        [admin.username, admin.email, hashedPassword, admin.role, 'active']
      );
      console.log(`Admin user created: ${admin.username} / ${admin.password}`);
    }
  }
};

const initTables = async () => {
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => { if (err) reject(err); else resolve(); });
  });

  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT NOT NULL,
        uploader_id INTEGER,
        file_path TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploader_id) REFERENCES users(id)
      )
    `, (err) => { if (err) reject(err); else resolve(); });
  });

  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        subcategory TEXT NOT NULL,
        rule_name TEXT NOT NULL,
        rule_content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => { if (err) reject(err); else resolve(); });
  });

  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER,
        agent_id TEXT NOT NULL,
        report_content TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contract_id) REFERENCES contracts(id)
      )
    `, (err) => { if (err) reject(err); else resolve(); });
  });

  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS approvals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER,
        approver_id INTEGER,
        status TEXT NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contract_id) REFERENCES contracts(id),
        FOREIGN KEY (approver_id) REFERENCES users(id)
      )
    `, (err) => { if (err) reject(err); else resolve(); });
  });

  console.log('Database tables initialized successfully');

  await seedAdminUsers();
};

// 封装查询方法
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// 封装执行方法
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

module.exports = { db, query, run };
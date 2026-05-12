const pool = require('./database');

const initDatabase = async () => {
  try {
    // 创建用户表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建合同表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100) NOT NULL,
        uploader_id INTEGER REFERENCES users(id),
        file_path VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建审核规则表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_rules (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100) NOT NULL,
        rule_name VARCHAR(255) NOT NULL,
        rule_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建审核报告表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_reports (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER REFERENCES contracts(id),
        agent_id VARCHAR(100) NOT NULL,
        report_content TEXT NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建审批表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS approvals (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER REFERENCES contracts(id),
        approver_id INTEGER REFERENCES users(id),
        status VARCHAR(20) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
  } finally {
    pool.end();
  }
};

initDatabase();
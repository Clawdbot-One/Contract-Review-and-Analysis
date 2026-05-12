const { run, query } = require('../src/config/database');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
  try {
    console.log('正在初始化管理员用户...');
    
    // 检查是否已存在管理员
    const existingAdmin = await query('SELECT * FROM users WHERE role = ?', ['admin']);
    if (existingAdmin.length > 0) {
      console.log('管理员用户已存在');
      process.exit(0);
    }
    
    // 创建密码
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建管理员用户
    await run(
      'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      ['admin', 'admin@example.com', hashedPassword, 'admin', 'active']
    );
    
    console.log('管理员用户创建成功！');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('邮箱: admin@example.com');
    
    process.exit(0);
  } catch (error) {
    console.error('初始化管理员用户失败:', error);
    process.exit(1);
  }
};

initAdmin();

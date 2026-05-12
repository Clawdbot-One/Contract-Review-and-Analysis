const { query, run } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userController = {
  // 用户注册
  register: async (req, res) => {
    try {
      const { username, email, password, department } = req.body;
      
      // 检查用户名是否已存在
      const existingUser = await query('SELECT * FROM users WHERE username = ?', [username]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // 检查邮箱是否已存在
      const existingEmail = await query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // 创建用户
      const newUser = await run(
        'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, 'user', 'pending']
      );
      
      res.status(201).json({ message: 'User registered successfully. Waiting for approval.' });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 用户登录
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // 查找用户
      const user = await query('SELECT * FROM users WHERE username = ?', [username]);
      if (user.length === 0) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
      
      // 检查用户状态
      if (user[0].status !== 'active') {
        return res.status(400).json({ message: 'Account is not active. Please wait for approval.' });
      }
      
      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user[0].password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { id: user[0].id, username: user[0].username, role: user[0].role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.json({
        message: '登录成功',
        token,
        user: {
          id: user[0].id,
          username: user[0].username,
          email: user[0].email,
          role: user[0].role,
          status: user[0].status
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 获取当前用户信息
  getCurrentUser: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await query('SELECT id, username, email, role, status FROM users WHERE id = ?', [userId]);
      if (user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user: user[0] });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 获取所有用户（管理员）
  getUsers: async (req, res) => {
    try {
      // 检查是否为管理员
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const users = await query('SELECT id, username, email, role, status, created_at FROM users');
      res.json({ users: users });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 审批用户
  approveUser: async (req, res) => {
    try {
      // 检查是否为管理员
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const userId = req.params.id;
      await run('UPDATE users SET status = ? WHERE id = ?', ['active', userId]);
      res.json({ message: 'User approved successfully' });
    } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 更新用户信息
  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const { username, email, role, status } = req.body;
      
      // 检查是否为管理员或更新自己的信息
      if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      await run(
        'UPDATE users SET username = ?, email = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [username, email, role, status, userId]
      );
      
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 删除用户
  deleteUser: async (req, res) => {
    try {
      // 检查是否为管理员
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const userId = req.params.id;
      await run('DELETE FROM users WHERE id = ?', [userId]);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = userController;
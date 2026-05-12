const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 导入路由
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// 配置中间件
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 确保上传目录存在
const uploadDirs = [
  './uploads',
  './uploads/temp'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 挂载路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
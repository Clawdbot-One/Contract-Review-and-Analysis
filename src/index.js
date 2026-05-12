const express = require('express');
const contractRoutes = require('./routes/contract');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/contracts', contractRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`服务已启动，端口: ${PORT}`);
  });
}

module.exports = app;

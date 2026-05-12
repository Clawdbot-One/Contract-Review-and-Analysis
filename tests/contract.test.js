const request = require('supertest');
const app = require('../src/index');

describe('健康检查接口', () => {
  test('GET /health 返回状态正常', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('合同分析接口', () => {
  test('POST /api/contracts/analyze 分析有效合同', async () => {
    const response = await request(app)
      .post('/api/contracts/analyze')
      .send({ content: '甲方与乙方签订合同，约定违约条款' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.riskScore).toBeGreaterThan(0);
    expect(response.body.data.keywords).toContain('甲方');
    expect(response.body.data.keywords).toContain('乙方');
  });

  test('POST /api/contracts/analyze 空内容返回错误', async () => {
    const response = await request(app)
      .post('/api/contracts/analyze')
      .send({ content: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('合同内容不能为空');
  });

  test('POST /api/contracts/analyze 高风险内容评分', async () => {
    const response = await request(app)
      .post('/api/contracts/analyze')
      .send({ content: '违约赔偿条款：乙方违约需支付高额罚款' });

    expect(response.status).toBe(200);
    expect(response.body.data.riskScore).toBe(60);
  });
});

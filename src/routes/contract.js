const express = require('express');
const router = express.Router();

router.post('/analyze', (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: '合同内容不能为空' });
  }

  const riskScore = analyzeRisk(content);
  const keywords = extractKeywords(content);

  res.json({
    success: true,
    data: {
      riskScore,
      keywords,
      summary: `分析了 ${content.length} 个字符的合同文本`
    }
  });
});

function analyzeRisk(content) {
  const riskKeywords = ['违约', '赔偿', '责任', '风险', '罚款'];
  let score = 0;
  riskKeywords.forEach(keyword => {
    if (content.includes(keyword)) score += 20;
  });
  return Math.min(score, 100);
}

function extractKeywords(content) {
  const commonWords = ['甲方', '乙方', '合同', '协议', '条款'];
  return commonWords.filter(word => content.includes(word));
}

module.exports = router;

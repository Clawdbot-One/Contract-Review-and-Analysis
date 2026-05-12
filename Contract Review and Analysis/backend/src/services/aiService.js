const { OpenAI } = require('openai');
const { LLMChain, PromptTemplate } = require('langchain');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 初始化OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const aiService = {
  // 提取合同内容
  extractContractContent: async (filePath) => {
    try {
      // 这里可以根据文件类型使用不同的提取方法
      // 暂时模拟提取内容
      return '这是一份销售合同，甲方为ABC公司，乙方为XYZ公司，合同金额为100万元，有效期为2026年1月1日至2026年12月31日。';
    } catch (error) {
      console.error('Error extracting contract content:', error);
      throw error;
    }
  },
  
  // 读取审核规则
  readAuditRules: (category, subcategory) => {
    try {
      const rulePath = path.join(__dirname, '../../rules', category, `${subcategory}.md`);
      if (fs.existsSync(rulePath)) {
        return fs.readFileSync(rulePath, 'utf8');
      }
      return '默认审核规则：检查合同的完整性、合法性和合规性。';
    } catch (error) {
      console.error('Error reading audit rules:', error);
      return '默认审核规则：检查合同的完整性、合法性和合规性。';
    }
  },
  
  // 智能审核合同
  auditContract: async (contractContent, category, subcategory) => {
    try {
      // 读取审核规则
      const rules = aiService.readAuditRules(category, subcategory);
      
      // 构建prompt
      const prompt = `
      你是一名专业的合同审核专家，负责根据以下规则审核合同内容：
      
      ${rules}
      
      请审核以下合同内容，并提供详细的审核报告，包括：
      1. 合同是否符合所有规则
      2. 发现的问题和风险点
      3. 改进建议
      4. 审核结论（通过/不通过）
      
      合同内容：
      ${contractContent}
      `;
      
      // 调用OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一名专业的合同审核专家，精通各种类型合同的审核标准和要求。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error auditing contract:', error);
      throw error;
    }
  },
  
  // 生成审核报告
  generateAuditReport: async (contractId, contractContent, category, subcategory) => {
    try {
      const auditResult = await aiService.auditContract(contractContent, category, subcategory);
      
      // 分析审核结果，判断是否通过
      const status = auditResult.includes('通过') ? 'approved' : 'rejected';
      
      return {
        contract_id: contractId,
        agent_id: 'gpt-4',
        report_content: auditResult,
        status: status
      };
    } catch (error) {
      console.error('Error generating audit report:', error);
      throw error;
    }
  }
};

module.exports = aiService;
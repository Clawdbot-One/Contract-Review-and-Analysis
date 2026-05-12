const { query, run } = require('../config/database');
const fs = require('fs');
const path = require('path');
const aiService = require('../services/aiService');

const contractController = {
  // 上传合同
  uploadContract: async (req, res) => {
    try {
      const { title, category, subcategory, description } = req.body;
      const uploaderId = req.user.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // 确保上传目录存在
      const uploadDir = path.join(__dirname, '../../uploads', category, subcategory);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // 生成唯一文件名
      const fileName = `${Date.now()}_${path.basename(file.originalname)}`;
      const filePath = path.join(uploadDir, fileName);
      
      // 移动文件到目标目录
      fs.renameSync(file.path, filePath);
      
      // 保存合同信息到数据库
      const newContract = await run(
        'INSERT INTO contracts (title, category, subcategory, uploader_id, file_path, status) VALUES (?, ?, ?, ?, ?, ?)',
        [title, category, subcategory, uploaderId, filePath, 'pending']
      );
      
      // 触发智能审核
      setTimeout(async () => {
        try {
          // 更新合同状态为审核中
          await run(
            'UPDATE contracts SET status = ? WHERE id = ?',
            ['auditing', newContract.lastID]
          );
          
          // 提取合同内容
          const contractContent = await aiService.extractContractContent(filePath);
          
          // 生成审核报告
          const auditReport = await aiService.generateAuditReport(
            newContract.lastID,
            contractContent,
            category,
            subcategory
          );
          
          // 保存审核报告到数据库
          await run(
            'INSERT INTO audit_reports (contract_id, agent_id, report_content, status) VALUES (?, ?, ?, ?)',
            [auditReport.contract_id, auditReport.agent_id, auditReport.report_content, auditReport.status]
          );
          
          // 更新合同状态
          const nextStatus = auditReport.status === 'approved' ? 'pending_approval' : 'rejected';
          await run(
            'UPDATE contracts SET status = ? WHERE id = ?',
            [nextStatus, newContract.lastID]
          );
        } catch (error) {
          console.error('Error during AI audit:', error);
          // 审核失败时，设置为待审批状态
          await run(
            'UPDATE contracts SET status = ? WHERE id = ?',
            ['pending_approval', newContract.lastID]
          );
        }
      }, 1000);
      
      res.status(201).json({
        message: 'Contract uploaded successfully',
        contract: {
          id: newContract.lastID,
          title: title,
          category: category,
          subcategory: subcategory,
          uploader_id: uploaderId,
          file_path: filePath,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('Error uploading contract:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 获取合同列表
  getContracts: async (req, res) => {
    try {
      const { status, category, subcategory, startDate, endDate } = req.query;
      
      let sql = 'SELECT * FROM contracts WHERE 1=1';
      const params = [];
      
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      
      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }
      
      if (subcategory) {
        sql += ' AND subcategory = ?';
        params.push(subcategory);
      }
      
      if (startDate) {
        sql += ' AND created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += ' AND created_at <= ?';
        params.push(endDate);
      }
      
      sql += ' ORDER BY created_at DESC';
      
      const contracts = await query(sql, params);
      res.json({ contracts: contracts });
    } catch (error) {
      console.error('Error getting contracts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 获取合同详情
  getContractById: async (req, res) => {
    try {
      const contractId = req.params.id;
      const contract = await query('SELECT * FROM contracts WHERE id = ?', [contractId]);
      
      if (contract.length === 0) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      res.json({ contract: contract[0] });
    } catch (error) {
      console.error('Error getting contract:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 更新合同信息
  updateContract: async (req, res) => {
    try {
      const contractId = req.params.id;
      const { title, category, subcategory, status } = req.body;
      
      await run(
        'UPDATE contracts SET title = ?, category = ?, subcategory = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, category, subcategory, status, contractId]
      );
      
      res.json({ message: 'Contract updated successfully' });
    } catch (error) {
      console.error('Error updating contract:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 删除合同
  deleteContract: async (req, res) => {
    try {
      const contractId = req.params.id;
      
      // 获取合同信息
      const contract = await query('SELECT file_path FROM contracts WHERE id = ?', [contractId]);
      if (contract.length === 0) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      // 删除文件
      const filePath = contract[0].file_path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // 删除合同记录
      await run('DELETE FROM contracts WHERE id = ?', [contractId]);
      
      res.json({ message: 'Contract deleted successfully' });
    } catch (error) {
      console.error('Error deleting contract:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 获取审核报告
  getAuditReport: async (req, res) => {
    try {
      const contractId = req.params.id;
      const report = await query('SELECT * FROM audit_reports WHERE contract_id = ? ORDER BY created_at DESC', [contractId]);
      
      if (report.length === 0) {
        return res.status(404).json({ message: 'Audit report not found' });
      }
      
      res.json({ report: report[0] });
    } catch (error) {
      console.error('Error getting audit report:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = contractController;
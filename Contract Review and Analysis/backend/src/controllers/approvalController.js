const { query, run } = require('../config/database');

const approvalController = {
  // 获取我的审批任务
  getMyApprovals: async (req, res) => {
    try {
      const approverId = req.user.id;
      const approvals = await query(
        'SELECT a.*, c.title, c.category, c.subcategory FROM approvals a JOIN contracts c ON a.contract_id = c.id WHERE a.approver_id = ? ORDER BY a.created_at DESC',
        [approverId]
      );
      res.json({ approvals: approvals });
    } catch (error) {
      console.error('Error getting approvals:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 获取审批详情
  getApprovalById: async (req, res) => {
    try {
      const approvalId = req.params.id;
      const approval = await query('SELECT * FROM approvals WHERE id = ?', [approvalId]);
      
      if (approval.length === 0) {
        return res.status(404).json({ message: 'Approval not found' });
      }
      
      res.json({ approval: approval[0] });
    } catch (error) {
      console.error('Error getting approval:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 创建审批
  createApproval: async (req, res) => {
    try {
      const { contract_id, status, comment } = req.body;
      const approverId = req.user.id;
      
      // 检查合同是否存在
      const contract = await query('SELECT * FROM contracts WHERE id = ?', [contract_id]);
      if (contract.length === 0) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      // 创建审批记录
      const newApproval = await run(
        'INSERT INTO approvals (contract_id, approver_id, status, comment) VALUES (?, ?, ?, ?)',
        [contract_id, approverId, status, comment]
      );
      
      // 更新合同状态
      if (status === 'approved') {
        await run('UPDATE contracts SET status = ? WHERE id = ?', ['approved_final', contract_id]);
      } else if (status === 'rejected') {
        await run('UPDATE contracts SET status = ? WHERE id = ?', ['rejected', contract_id]);
      }
      
      res.status(201).json({
        message: 'Approval created successfully'
      });
    } catch (error) {
      console.error('Error creating approval:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 更新审批
  updateApproval: async (req, res) => {
    try {
      const approvalId = req.params.id;
      const { status, comment } = req.body;
      
      // 获取审批信息
      const approval = await query('SELECT * FROM approvals WHERE id = ?', [approvalId]);
      if (approval.length === 0) {
        return res.status(404).json({ message: 'Approval not found' });
      }
      
      // 更新审批记录
      await run(
        'UPDATE approvals SET status = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, comment, approvalId]
      );
      
      // 更新合同状态
      if (status === 'approved') {
        await run('UPDATE contracts SET status = ? WHERE id = ?', ['approved_final', approval[0].contract_id]);
      } else if (status === 'rejected') {
        await run('UPDATE contracts SET status = ? WHERE id = ?', ['rejected', approval[0].contract_id]);
      }
      
      res.json({ message: 'Approval updated successfully' });
    } catch (error) {
      console.error('Error updating approval:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // 获取合同的审批历史
  getContractApprovals: async (req, res) => {
    try {
      const contractId = req.params.id;
      const approvals = await query(
        'SELECT a.*, u.username FROM approvals a JOIN users u ON a.approver_id = u.id WHERE a.contract_id = ? ORDER BY a.created_at DESC',
        [contractId]
      );
      res.json({ approvals: approvals });
    } catch (error) {
      console.error('Error getting contract approvals:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = approvalController;
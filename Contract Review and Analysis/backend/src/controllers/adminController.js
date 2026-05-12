const { query, run } = require('../config/database');

const adminController = {
  getStats: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const totalUsers = await query('SELECT COUNT(*) as count FROM users');
      const activeUsers = await query("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
      const pendingUsers = await query("SELECT COUNT(*) as count FROM users WHERE status = 'pending'");
      const totalContracts = await query('SELECT COUNT(*) as count FROM contracts');
      const pendingContracts = await query("SELECT COUNT(*) as count FROM contracts WHERE status = 'pending'");
      const auditingContracts = await query("SELECT COUNT(*) as count FROM contracts WHERE status = 'auditing'");
      const approvedContracts = await query("SELECT COUNT(*) as count FROM contracts WHERE status IN ('pending_approval', 'approved_final')");
      const rejectedContracts = await query("SELECT COUNT(*) as count FROM contracts WHERE status = 'rejected'");
      const totalApprovals = await query('SELECT COUNT(*) as count FROM approvals');
      const pendingApprovals = await query("SELECT COUNT(*) as count FROM approvals WHERE status = 'pending'");
      const totalRules = await query('SELECT COUNT(*) as count FROM audit_rules');
      const totalReports = await query('SELECT COUNT(*) as count FROM audit_reports');

      const recentUsers = await query('SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 5');
      const recentContracts = await query('SELECT id, title, category, status, created_at FROM contracts ORDER BY created_at DESC LIMIT 5');

      res.json({
        users: {
          total: totalUsers[0].count,
          active: activeUsers[0].count,
          pending: pendingUsers[0].count,
        },
        contracts: {
          total: totalContracts[0].count,
          pending: pendingContracts[0].count,
          auditing: auditingContracts[0].count,
          approved: approvedContracts[0].count,
          rejected: rejectedContracts[0].count,
        },
        approvals: {
          total: totalApprovals[0].count,
          pending: pendingApprovals[0].count,
        },
        rules: {
          total: totalRules[0].count,
        },
        reports: {
          total: totalReports[0].count,
        },
        recentUsers,
        recentContracts,
      });
    } catch (error) {
      console.error('Error getting admin stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getRules: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const rules = await query('SELECT * FROM audit_rules ORDER BY created_at DESC');
      res.json({ rules });
    } catch (error) {
      console.error('Error getting rules:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  createRule: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { category, subcategory, rule_name, rule_content } = req.body;
      const result = await run(
        'INSERT INTO audit_rules (category, subcategory, rule_name, rule_content) VALUES (?, ?, ?, ?)',
        [category, subcategory, rule_name, rule_content]
      );

      res.status(201).json({
        message: 'Rule created successfully',
        rule: { id: result.lastID, category, subcategory, rule_name, rule_content },
      });
    } catch (error) {
      console.error('Error creating rule:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updateRule: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const ruleId = req.params.id;
      const { category, subcategory, rule_name, rule_content } = req.body;

      await run(
        'UPDATE audit_rules SET category = ?, subcategory = ?, rule_name = ?, rule_content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [category, subcategory, rule_name, rule_content, ruleId]
      );

      res.json({ message: 'Rule updated successfully' });
    } catch (error) {
      console.error('Error updating rule:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  deleteRule: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const ruleId = req.params.id;
      await run('DELETE FROM audit_rules WHERE id = ?', [ruleId]);
      res.json({ message: 'Rule deleted successfully' });
    } catch (error) {
      console.error('Error deleting rule:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getSystemInfo: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      res.json({
        uptime: Math.floor(uptime),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        },
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
      });
    } catch (error) {
      console.error('Error getting system info:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = adminController;

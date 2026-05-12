const { query, run } = require('../config/database');
const fs = require('fs');
const path = require('path');

const fileController = {
  getFiles: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const contracts = await query('SELECT id, title, category, subcategory, file_path, created_at FROM contracts');

      const files = contracts.map(contract => ({
        id: contract.id,
        name: contract.title,
        category: contract.category,
        subcategory: contract.subcategory,
        path: contract.file_path,
        size: fs.existsSync(contract.file_path) ? fs.statSync(contract.file_path).size : 0,
        created_at: contract.created_at
      }));

      res.json({ files });
    } catch (error) {
      console.error('Error getting files:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  downloadFile: async (req, res) => {
    try {
      const contractId = req.params.id;

      const contract = await query('SELECT title, file_path FROM contracts WHERE id = ?', [contractId]);
      if (contract.length === 0) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      const filePath = contract[0].file_path;
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(contract[0].title)}.pdf"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  deleteFile: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const contractId = req.params.id;

      const contract = await query('SELECT file_path FROM contracts WHERE id = ?', [contractId]);
      if (contract.length === 0) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      const filePath = contract[0].file_path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await run('DELETE FROM contracts WHERE id = ?', [contractId]);

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  cleanTempFiles: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const tempDir = path.join(__dirname, '../../uploads/temp');
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
          const filePath = path.join(tempDir, file);
          fs.unlinkSync(filePath);
        });
      }

      res.json({ message: 'Temp files cleaned successfully' });
    } catch (error) {
      console.error('Error cleaning temp files:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = fileController;

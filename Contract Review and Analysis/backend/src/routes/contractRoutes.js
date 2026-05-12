const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/temp');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 需要认证的路由
router.post('/upload', auth, upload.single('file'), contractController.uploadContract);
router.get('/', auth, contractController.getContracts);
router.get('/:id', auth, contractController.getContractById);
router.put('/:id', auth, contractController.updateContract);
router.delete('/:id', auth, contractController.deleteContract);
router.get('/:id/audit-report', auth, contractController.getAuditReport);

module.exports = router;
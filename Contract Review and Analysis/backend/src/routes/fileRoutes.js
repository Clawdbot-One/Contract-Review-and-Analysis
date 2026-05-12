const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');

// 需要认证的路由
router.get('/', auth, fileController.getFiles);
router.get('/download/:id', auth, fileController.downloadFile);
router.delete('/:id', auth, fileController.deleteFile);
router.post('/clean-temp', auth, fileController.cleanTempFiles);

module.exports = router;
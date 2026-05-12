const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const auth = require('../middleware/auth');

// 需要认证的路由
router.get('/my', auth, approvalController.getMyApprovals);
router.get('/:id', auth, approvalController.getApprovalById);
router.post('/', auth, approvalController.createApproval);
router.put('/:id', auth, approvalController.updateApproval);

module.exports = router;
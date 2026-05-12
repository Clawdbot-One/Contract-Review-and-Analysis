const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.get('/stats', auth, adminController.getStats);
router.get('/system', auth, adminController.getSystemInfo);
router.get('/rules', auth, adminController.getRules);
router.post('/rules', auth, adminController.createRule);
router.put('/rules/:id', auth, adminController.updateRule);
router.delete('/rules/:id', auth, adminController.deleteRule);

module.exports = router;

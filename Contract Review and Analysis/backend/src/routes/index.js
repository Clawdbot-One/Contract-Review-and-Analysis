const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const contractRoutes = require('./contractRoutes');
const approvalRoutes = require('./approvalRoutes');
const fileRoutes = require('./fileRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', userRoutes);
router.use('/users', userRoutes);
router.use('/contracts', contractRoutes);
router.use('/approvals', approvalRoutes);
router.use('/files', fileRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
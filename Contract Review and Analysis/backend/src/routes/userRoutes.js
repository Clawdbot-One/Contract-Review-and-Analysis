const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 认证路由
router.post('/register', userController.register);
router.post('/login', userController.login);

// 需要认证的路由
router.get('/me', auth, userController.getCurrentUser);
router.get('/', auth, userController.getUsers);
router.put('/:id/approve', auth, userController.approveUser);
router.put('/:id', auth, userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;
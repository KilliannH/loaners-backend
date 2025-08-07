const express = require('express');
const router = express.Router();
const { getMe, getById, updateProfile } = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/me', authMiddleware, getMe);
router.get('/:id', authMiddleware, getById);
router.put('/me', authMiddleware, updateProfile);

module.exports = router;
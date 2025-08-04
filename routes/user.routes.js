const express = require('express');
const router = express.Router();
const { getMe, updateUserProfile } = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateUserProfile);

module.exports = router;
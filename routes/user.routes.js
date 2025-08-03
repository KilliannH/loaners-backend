const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/me', authMiddleware, getMe);

module.exports = router;
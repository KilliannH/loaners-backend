const express = require('express');
const router = express.Router();
const { getMe, getById, updateProfile } = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

console.log("✅ user.routes.js chargé");

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateProfile);
router.get('/:id', authMiddleware, getById);

module.exports = router;
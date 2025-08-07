const express = require('express');
const router = express.Router();
const { getMe, getById, updateProfile } = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateProfile);
router.get('/:id', authMiddleware, getById);

router.get("/test", (req, res) => {
  res.send("🧪 Route test OK");
});

module.exports = router;
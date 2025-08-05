const express = require('express');
const router = express.Router();
const {
  getUnread,
  markRead
} = require('../controllers/notification.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/unread', authMiddleware, getUnread);
router.post('/mark-read/:eventId', authMiddleware, markRead);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getChatByEvent, getUserChatRooms } = require('../controllers/chat.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get("/rooms", authMiddleware, getUserChatRooms);
router.get('/:eventId', authMiddleware, getChatByEvent);
module.exports = router;
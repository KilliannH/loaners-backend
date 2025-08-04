const express = require('express');
const router = express.Router();
const { createEvent } = require('../controllers/event.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { getNearbyEvents } = require('../controllers/event.controller');

router.post('/', authMiddleware, createEvent);
router.get('/nearby', authMiddleware, getNearbyEvents);

module.exports = router;
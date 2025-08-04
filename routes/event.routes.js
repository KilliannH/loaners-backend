const express = require('express');
const router = express.Router();
const {
  createEvent,
  getNearbyEvents,
  getMyEvents,
  joinEvent,
  getEventById
} = require('../controllers/event.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Routes spécifiques d'abord
router.post('/', authMiddleware, createEvent);
router.get('/nearby', authMiddleware, getNearbyEvents);
router.get('/mine', authMiddleware, getMyEvents);
router.post('/:id/join', authMiddleware, joinEvent);

// Ensuite la route dynamique
router.get('/:id', authMiddleware, getEventById);

module.exports = router;
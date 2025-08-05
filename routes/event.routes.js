const express = require('express');
const router = express.Router();
const {
  createEvent,
  getNearbyEvents,
  getMyEvents,
  getMyInvolvedEvents,
  joinEvent,
  leaveEvent,
  getEventById
} = require('../controllers/event.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Routes spécifiques d'abord
router.post('/', authMiddleware, createEvent);
router.get('/nearby', authMiddleware, getNearbyEvents);
router.get('/mine', authMiddleware, getMyEvents);
router.get('/my-involved', authMiddleware, getMyInvolvedEvents);
router.post('/:id/join', authMiddleware, joinEvent);
router.post('/:id/leave', authMiddleware, leaveEvent);

// Ensuite la route dynamique
router.get('/:id', authMiddleware, getEventById);

module.exports = router;
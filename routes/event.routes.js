const express = require('express');
const router = express.Router();
const {
  createEvent,
  getNearbyEvents,
  getMyEvents,
  getMyInvolvedEvents,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent,
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
router.put("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);
// Ensuite la route dynamique
router.get('/:id', authMiddleware, getEventById);

module.exports = router;
const express = require('express');
const router = express.Router();

// Routes d'API
router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/locations', require('./location.routes'));
router.use('/events', require('./event.routes'));

module.exports = router;
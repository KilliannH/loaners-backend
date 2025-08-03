const express = require('express');
const router = express.Router();
const { createLocation } = require('../controllers/location.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/', authMiddleware, createLocation);

module.exports = router;
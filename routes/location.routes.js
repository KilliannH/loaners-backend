const express = require('express');
const router = express.Router();
const {
  createLocation,
  searchLocations
} = require('../controllers/location.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/', authMiddleware, createLocation);
router.get('/', authMiddleware, searchLocations);

module.exports = router;
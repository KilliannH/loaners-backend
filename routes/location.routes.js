const express = require('express');
const router = express.Router();
const {
  createLocation,
  searchLocations
} = require('../controllers/location.controller');

router.post('/', createLocation);
router.get('/', searchLocations);

module.exports = router;
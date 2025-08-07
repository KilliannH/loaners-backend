const express = require('express');
const router = express.Router();
const { signup, login, refresh, googleSignup } = require('../controllers/auth.controller');

router.post('/google', googleSignup);
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);

module.exports = router;
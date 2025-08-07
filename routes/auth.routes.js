const express = require('express');
const router = express.Router();
const { signup, login, refresh, googleSignup, verifyEmail, resendVerification } = require('../controllers/auth.controller');

router.post('/google', googleSignup);
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
module.exports = router;
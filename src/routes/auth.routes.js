const express = require('express');
const router = express.Router();
const { authControllers: {handleSignup, handleVerifyCode, handleLogin} } = require('controllers');
const { authMiddlewares: {validateSignup, validateCode, loginLimiter, validateLogin} } = require('middlewares');

router.post('/signup', validateSignup, handleSignup);
router.post('/verify-code', validateCode, handleVerifyCode);
router.post('/login', loginLimiter, validateLogin, handleLogin);

module.exports = router;
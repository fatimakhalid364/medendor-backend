const express = require('express');
const router = express.Router();
const { authControllers: {handleSignup, handleVerifyCode, handleLogin, handleLogout, handleRefreshAccessToken} } = require('controllers');
const { authMiddlewares: {validateSignup, validateCode, loginLimiter, validateLogin, validateLogout, validateRefreshAccessToken} } = require('middlewares');

router.post('/signup', validateSignup, handleSignup);
router.post('/verify-code', validateCode, handleVerifyCode);
router.post('/login', loginLimiter, validateLogin, handleLogin);
router.post('/logout', validateLogout, handleLogout);
router.post('/refresh', validateRefreshAccessToken, handleRefreshAccessToken)


module.exports = router;
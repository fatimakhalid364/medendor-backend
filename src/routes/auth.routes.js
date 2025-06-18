const express = require('express');
const router = express.Router();
const { authControllers: {handleSignup, handleVerifyCode} } = require('controllers');
const { authMiddlewares: {validateSignup, validateCode} } = require('middlewares');

router.post('/signup', validateSignup, handleSignup);
router.post('/verify-code', validateCode, handleVerifyCode);

module.exports = router;
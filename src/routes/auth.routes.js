const express = require('express');
const router = express.Router();

const { 
    handleSignup,
    handleResendVerificationCode, 
    handleVerifyCode, 
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    handleChangePassword, 
    handleLogout, 
    handleRefreshAccessToken
} = require('controllers/auth.controller');

const { 
    validateSignup,
    validateResendVerificationCode,
    validateCode, 
    loginLimiter, 
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateCangePassword, 
    validateRefreshAccessToken,
    authenticateSession
} = require('middlewares/auth.middleware');

router.post('/signup', validateSignup, handleSignup);
router.get('/resend-verification-code', validateResendVerificationCode, handleResendVerificationCode )
router.post('/verify-code', validateCode, handleVerifyCode);
router.post('/login', loginLimiter, validateLogin, handleLogin);
router.post('/forgot-password', validateForgotPassword, handleForgotPassword);
router.post('/reset-password', validateResetPassword, handleResetPassword);
router.post('/change-password', authenticateSession, validateCangePassword, handleChangePassword  )
router.post('/logout', authenticateSession, handleLogout);
router.post('/refresh', validateRefreshAccessToken, handleRefreshAccessToken)


module.exports = router;
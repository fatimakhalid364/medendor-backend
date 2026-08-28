const {authServices: {signup, verifyCode, login, logout, refreshAccessToken}} = require('services');
const { forgotPassword, resendVerificationCode, resetPassword, changePassword } = require('../services/auth.service');

const handleSignup = async(req, res) => {
    console.log('Handling signup request:', req.body);
    const { role, ...data } = req.body;
    const result = await signup(data, role);
    res.status(201).json(result);
}

const handleResendVerificationCode = async(req, res) => {
    console.log('Inside handleResendVerificationCode service: ', req.body);

    const {email} = req.body;

    const {success, code, message} = await resendVerificationCode(email);

    res.status(200).json(
        {
            success,
            code,
            message
        }
    )
}

const handleVerifyCode = async(req, res) => {
    console.log('Handling verification code request:', req.body);
    const { email, code } = req.body;
    const result = await verifyCode(email, code);
    res.status(200).json(result);
}

const handleLogin = async (req, res) => {
    console.log('Handling login request:', req.body, req.ip);
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');

    const { accessToken, refreshToken, csrfToken, user, message, success, code } = await login(email, password, ip, userAgent);

    res
    .status(200)
    .cookie('access_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
    })
    .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
    })
    .cookie('csrf_token', csrfToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/'
    })
    .json({
        success: success,
        code: code,
        message: message,
        user: user
    });
};

const handleForgotPassword = async(req, res) => {
    const {email} = req.body;

    const {success, code, message} = await forgotPassword(email);

    res.status(200).json(
        {
            success,
            code,
            message
        }
    );

};

const handleResetPassword = async(req, res)=> {
    const {newPassword, resetToken} = req.body;

    const {success, code, message} = await resetPassword(newPassword, resetToken);

    res.status(200).json(
        {
            success,
            code,
            message
        }
    );
};

const handleChangePassword = async(req, res) => {
    const {newPassword, currentPassword} = req.body;
    const {userId, sessionId} = req.user;

    const {success, code, message} = await changePassword(
        currentPassword,
        newPassword,
        userId,
        sessionId
    );

    res.status(200).json(
        {
            success,
            code,
            message
        }
    );

};

const handleLogout = async(req, res) => {
    console.log('Handling logout request:', req.auth)
    const {sessionId} = req.user;

    const {success, code, message} = await logout(sessionId);

    res.clearCookie('access-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
    });

    res.clearCookie('refresh-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
    });

    res.clearCookie('csrf-token', {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/'
    });
    return res.status(200).json({
        success,
        code,
        message
    });
}

const handleRefreshAccessToken = async(req, res) => {
    console.log('Handling refresh access token request:', req.auth);
    const {
        redisSession,
        refreshToken,
        userId
    } = req.auth;

    const {success, message, newAccessToken, newRefreshToken, newCsrfToken} = await refreshAccessToken(
        redisSession,
        refreshToken,
        userId
    );
    res.status(200)
        .cookie(
            'access_token',
            newAccessToken,
            {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            }
        )
        .cookie(
            'refresh_token',
            newRefreshToken,
            {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
            }
        )
        .cookie(
            'csrf_token',
            newCsrfToken,
            {
                httpOnly: false,
                secure: true,
                sameSite: 'none',
            }
        )
        .json({
            success,
            code, 
            message
        });
}

module.exports = {
    handleSignup,
    handleResendVerificationCode, 
    handleVerifyCode, 
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    handleChangePassword, 
    handleLogout, 
    handleRefreshAccessToken}
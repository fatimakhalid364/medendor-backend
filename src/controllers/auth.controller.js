const {authServices: {signup, verifyCode, login, logout, refreshAccessToken}} = require('services');

const handleSignup = async(req, res) => {
    console.log('Handling signup request:', req.body);
    const { role, ...data } = req.body;
    const result = await signup(data, role);
    res.status(201).json(result);
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

const handleLogout = async(req, res) => {
    console.log('Handling logout request:', req.auth)
    const {accessToken, refreshToken} = req.auth;

    const {success, message} = await logout(accessToken, refreshToken);

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
}

const handleRefreshAccessToken = async(req, res) => {
        console.log('Handling refresh access token request:', req.auth);
        const {refreshToken, csrfToken, decoded} = req.auth;

        const {success, message, code, newAccessToken, newRefreshToken, newCsrfToken} = await refreshAccessToken(refreshToken, csrfToken, decoded);
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
                message
            });
}

module.exports = {handleSignup, handleVerifyCode, handleLogin, handleLogout, handleRefreshAccessToken}
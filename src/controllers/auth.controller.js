const {authServices: {signup, verifyCode, login}} = require('services');

const handleSignup = async(req, res) => {
    try {
        console.log('Handling signup request:', req.body);
        const { role, ...data } = req.body;
        const result = await signup(data, role);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred during signup',
        });
    }
}

const handleVerifyCode = async(req, res) => {
    try {
        console.log('Handling verification code request:', req.body);
        const { email, code } = req.body;
        const result = await verifyCode(email, code);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred during verification',
        });
    }
}

const handleLogin = async (req, res) => {
    try {
        console.log('Handling login request:', req.body, req.ip);
        const { email, password } = req.body;
        const ip = req.ip;
        const userAgent = req.get('User-Agent');

        const { accessToken, refreshToken, csrfToken, user, message, success } = await login(email, password, ip, userAgent);

        res
        .status(200)
        .cookie('access_token', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000
        })
        .cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .cookie('csrf_token', csrfToken, {
            httpOnly: false,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000
        })
        .json({
            success: success,
            message: message,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred during login',
        });
    }
};

module.exports = {handleSignup, handleVerifyCode, handleLogin}
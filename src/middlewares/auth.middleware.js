const {enum: {rolesArray}} = require('constants');
const rateLimit = require('express-rate-limit');
const {jwtUtils: {verifyAccessToken, verifyCsrfToken}} = require('utils');

const validateSignup = (req, res, next) => {
    const { role, ...data } = req.body;
    console.log('Validating signup request:', role, data);
    if (!role || !rolesArray.includes(role)) {
        return res.status(400).json({ message: 'Invalid or missing role' });
    }

    const { firstName, lastName, email, password } = data;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'First name, last name, email, and password are required' });
    }

    next(); 
}

const validateCode = (req, res, next) => {
    console.log('Validating code:', req.body);
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (typeof code !== 'string' || code.length !== 6) {
        return res.status(400).json({ message: 'Verification code must be a 6-digit string.' });
    }

    next();
};

const validateLogin = (req, res, next) => {
    console.log('Validating login:', req.body);
    const { email, password } = req.body;
    if (!email || !password) 
        return res.status(400).json({ error: 'Email and password are required' });
    next();
};


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { error: 'Too many login attempts. Please try again later.' },
    standardHeaders: true, 
    legacyHeaders: false   
});

const authenticateSession = async (req, res, next) => {
    try {
        console.log('Authenticating session with headers and cookies:', req.headers, req.cookies);
        const csrfToken = req.headers['csrf-token'];
        if (!csrfToken) {
        return res.status(400).json({ message: 'CSRF token is missing' });
        }

        const accessToken = req.cookies['access-token'];
        if (!accessToken) {
        return res.status(401).json({ message: 'Access token is missing' });
        }

        let decodedAccess, decodedCsrf;
        try {
        decodedAccess = verifyAccessToken(accessToken);
        decodedCsrf = verifyCsrfToken(csrfToken);
        } catch (err) {
        return res.status(401).json({
            message: 'Access token or CSRF Token has expired',
        });
        }

        const {jti: accessJti, role, sub} = decodedAccess;
        const {jti: csrfJti} = decodedCsrf;

        if (accessJti !== csrfJti) {
        return res.status(403).json({ message: 'JTI mismatch between access and csrf tokens' });
        }

        const isTokenActive = await redisClient.get(`access:${accessJti}`);
        if (!isTokenActive) {
        return res.status(401).json({
            message: 'Access token has been revoked',
        });
        }

        const isValidRole = rolesArray.includes(role);
        if (!isValidRole) {
        return res.status(403).json({ message: 'Invalid user role' });
        }
        req.user = {
        id: sub,
        role: role,
        };

        next();
    } catch (error) {
        console.error('An error occured while authenticating the session:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
};





module.exports = {
    validateSignup,
    validateCode,
    validateLogin,
    loginLimiter,
    authenticateSession,
};
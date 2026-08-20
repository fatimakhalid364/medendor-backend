const {enum: {rolesArray}} = require('constants');
const rateLimit = require('express-rate-limit');
const {jwtUtils: {verifyAccessToken, verifyRefreshToken}} = require('utils');
const AppError = require('utils/AppError');
const {safeCompare, hashToken} = require('utils/crypto.utils');
const { revokeAndSyncSessionToRedis } = require('services/session.service');
const {session: Session} = require('models/session.model');

const validateSignup = (req, res, next) => {
    const { role, ...data } = req.body;
    console.log('Validating signup request:', role, data);
    if (!role || !rolesArray.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing role' });
    }

    const { firstName, lastName, email, password } = data;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: 'First name, last name, email, and password are required' });
    }

    next(); 
}

const validateCode = (req, res, next) => {
    console.log('Validating code:', req.body);
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    if (typeof code !== 'string' || code.length !== 6) {
        return res.status(400).json({ success: false, message: 'Verification code must be a 6-digit string.' });
    }

    next();
};

const validateLogin = (req, res, next) => {
    console.log('Validating login:', req.body);
    const { email, password } = req.body;
    if (!email || !password) 
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    next();
};


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { error: 'Too many login attempts. Please try again later.' },
    standardHeaders: true, 
    legacyHeaders: false   
});

const validateLogoutRequest = (req, res, next) => {
    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token

    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: 'Access token missing'
        });
    }

    req.auth = {
        accessToken,
        refreshToken
    };

    next();
};

const validateRefreshToken = async (
    refreshToken,
    incomingRefreshJti,
    storedRefreshJti,
    storedRefreshHash
) => {

    if (!refreshToken){
        console.error('Refresh token missing.');

        throw new AppError(
            'Your session has expired. Please login again.',
            401,
            'REFRESH_TOKEN_MISSING'
        )
    }

    const incomingRefreshHash =
        hashToken(refreshToken);

    const hashMatches =
        safeCompare(
            incomingRefreshHash,
            storedRefreshHash
        );

    const jtiMatches =
        safeCompare(
            incomingRefreshJti,
            storedRefreshJti
        );

    if (
        !hashMatches ||
        !jtiMatches
    ) {
        await revokeAndSyncSessionToRedis(session, 'Refresh token reuse detected.');
        console.error('Refresh token reuse detected.')
        throw new AppError(
            'Refresh token reuse detected.',
            401,
            'REFRESH_TOKEN_REUSE_DETECTED'
        );
    }

    return incomingRefreshHash;

};

const validateCsrfToken = (
    csrfToken,
    storedCsrfHash
) => {

    if (!csrfToken) {
        throw new AppError(
            'CSRF validation failed.',
            403,
            'CSRF_TOKEN_MISSING'
        );
    }

    const incomingCsrfHash =
        hashToken(csrfToken);

    if (
        !safeCompare(
            incomingCsrfHash,
            storedCsrfHash
        )
    ) {
        throw new AppError(
            'CSRF validation failed.',
            403,
            'CSRF_VALIDATION_FAILED'
        );
    }
};

const getValidSession = async (sid, user) => {

    const session =
        await Session.findOne({
            sessionId: sid
        });

    if (!session) {
        throw new AppError(
            'Invalid session.',
            401,
            'INVALID_SESSION'
        );
    }

    if (
        session.user.toString() !== user
    ) {
        throw new AppError(
            'Invalid session.',
            401,
            'INVALID_SESSION'
        );
    }

    if (session.revokedAt) {
        throw new AppError(
            'Session has been revoked.',
            401,
            'SESSION_REVOKED'
        );
    }

    const now = new Date();

    if (
        session.expiresAt <= now ||
        session.absoluteExpiresAt <= now
    ) {

        await revokeAndSyncSessionToRedis(session, 'Session expired');

        throw new AppError(
            'Session has expired.',
            401,
            'SESSION_EXPIRED'
        );
    }

    return session;
};


const validateRefreshAccessToken = async(req, res, next) => {
        const refreshToken = req.cookies['refreshToken'];
        const csrfToken = req.cookies['csrfToken'];

        const decoded =
            verifyRefreshToken(refreshToken);

        if (!decoded){
            throw new AppError(
               'Your session has expired. Please login again',
                401,
                'INVALID_REFRESH_TOKEN' 
            )
        }

        const {sub: user, sid, jti: incomingRefreshJti, type} = decoded;

        const session = await getValidSession(sid, user);

        const {
            csrfTokenHash: storedCsrfHash,
            refreshTokenHash: storedRefreshHash,
            refreshJti: storedRefreshJti 
            } = session;

        await validateRefreshToken(
            refreshToken,
            incomingRefreshJti,
            storedRefreshJti,
            storedRefreshHash
        )

        await validateCsrfToken(csrfToken, storedCsrfHash );

        req.auth = {
            refreshToken,
            csrfToken,
            decoded
        };
        
        next();
}

const authenticateSession = async (req, res, next) => {
    try {
        console.log('Authenticating session with headers and cookies:', req.headers, req.cookies);
        const csrfToken = req.headers['csrf-token'];
        if (!csrfToken) {
        return res.status(400).json({ message: 'CSRF token is missing' });
        }

        const accessToken = req.cookies['access-token'];
        if (!accessToken) {
                throw new AppError(
                'Authentication required.',
                401,
                'ACCESS_TOKEN_MISSING'
            );
        }

        let decodedAccess;
        try {
        decodedAccess = verifyAccessToken(accessToken);
        } catch (err) {
        return res.status(401).json({
            message: 'Access token has expired or is invalid',
        });
        }

        const {accessJti, role, sub} = decodedAccess;

         const sessionData = await redisClient.get(
            `session:${accessJti}`
        );

        if (!sessionData) {
            return res.status(401).json({
                message: 'Session has expired or been revoked'
            });
        }

        const session = JSON.parse(sessionData);

        if (session.csrfToken !== csrfToken) {
            return res.status(403).json({
                message: 'Invalid CSRF token'
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
    validateRefreshAccessToken,
    
};
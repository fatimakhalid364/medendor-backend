const {enum: {rolesArray}} = require('constants');
const rateLimit = require('express-rate-limit');
const {jwtUtils: {verifyAccessToken, verifyRefreshToken}} = require('utils');
const AppError = require('utils/AppError');
const {safeCompare, hashToken} = require('utils/crypto.utils');
const { revokeAndSyncSessionToRedis } = require('services/session.service');
const {session: Session} = require('models/session.model');
const { getCachedSession } = require('../utils/session.utils');


const validateSignup = (req, res, next) => {
    const { role, ...data } = req.body;
    console.log('Validating signup request:', role, data);
    if (!role || !rolesArray.includes(role)) {
        throw new AppError(
            'Role field is missing or is invalid.',
            400,
            'REQUIRED_FIELD_MISSING'
        );
    }

    const { firstName, lastName, email, password } = data;

    if (!firstName || !lastName || !email || !password) {
        throw new AppError(
            'One or more of the following fields is missing: first name, last name, email, password',
            400,
            'REQUIRED_FIELD_MISSING'
        );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError(
            'Please provide a valid email address.',
            400,
            'INVALID_EMAIL'
        );
    }

    if (password.length < 8) {
        throw new AppError(
            'Password must be at least 8 characters long.',
            400,
            'INVALID_PASSWORD'
        );
    }

    if (password.length > 128) {
        throw new AppError(
            'Password must not exceed 128 characters.',
            400,
            'INVALID_PASSWORD'
        );
    }

    next(); 
}

const validateCode = (req, res, next) => {
    console.log('Validating code:', req.body);
    const { email, code } = req.body;

    if (!email || !code) {
        throw new AppError(
            'Email or code is missing.',
            400,
            'REQUIRED_FIELD_MISSING'
        );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError(
            'Please provide a valid email address.',
            400,
            'INVALID_EMAIL'
        );
    }

    if (typeof code !== 'string' || code.length !== 6) {
        throw new AppError(
            'Invalid code.',
            400,
            'INVALID_CODE'
        );
    }

    next();
};

const validateLogin = (req, res, next) => {
    console.log('Validating login:', req.body);
    const { email, password } = req.body;
    if (!email || !password) 
        throw new AppError(
            'Email or password is missing.',
            400,
            'INVALID_CREDENTIALS'
        );
    next();
};


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { error: 'Too many login attempts. Please try again later.' },
    standardHeaders: true, 
    legacyHeaders: false   
});

const validateLogout = (req, res, next) => {
    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token

    if (!accessToken || !refreshToken) {
        throw new AppError(
            'Your session has expired. Please login again',
            401,
            'AUTH_TOKEN_MISSING'
        );
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
    storedRefreshHash,
    session
) => {

    if (!refreshToken){
        console.error('Refresh token missing.');

        throw new AppError(
            'Your session has expired. Please login again.',
            401,
            'REFRESH_TOKEN_MISSING'
        )
    }

    const incomingRefreshHash = hashToken(refreshToken);

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
};

const validateCsrfToken = (
    csrfToken,
    storedCsrfHash
) => {

    if (!csrfToken) {
        console.error('csrf token missing');
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
        console.error('Csrf is invalid.')
        throw new AppError(
            'CSRF validation failed.',
            403,
            'CSRF_VALIDATION_FAILED'
        );
    }
};

const validateSession = async (session, userId) => {

    if (!session) {
        console.error('Session not found')
        throw new AppError(
            'Session not found for this user. Please login.',
            401,
            'INVALID_SESSION'
        );
    }

    if (
        session.userId !== userId
    ) {
        console.error('Invalid userId');
        throw new AppError(
            'Invalid session.',
            401,
            'INVALID_SESSION'
        );
    }

    if (session.revoked) {
        console.error('Session has been revoked.')
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

        console.error('Session has expired.')

        throw new AppError(
            'Session has expired.',
            401,
            'SESSION_EXPIRED'
        );
    }
};


const validateRefreshAccessToken = async(req, res, next) => {
    const refreshToken = req.cookies['refreshToken'];
    const csrfToken = req.cookies['csrfToken'];

    let decoded
    try {
        decoded =
        verifyRefreshToken(refreshToken);
    }catch(error){
        throw new AppError(
            'Your session has expired. Please login again',
            401,
            'INVALID_REFRESH_TOKEN' 
        )
    }

    const {sub: userId, sid, jti: incomingRefreshJti, type} = decoded;

    let redisSession;

    try{
        redisSession = await getCachedSession(sid);
    }catch(error){
        console.error('Failed to retrieve cached session from redis.');
        throw new AppError(
            'Service is temporarily unavailable. Please try again later.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        )
    }

    await validateSession(redisSession, userId);

    const {
        csrfTokenHash: storedCsrfHash,
        refreshTokenHash: storedRefreshHash,
        refreshJti: storedRefreshJti 
        } = redisSession;

    await validateRefreshToken(
        refreshToken,
        incomingRefreshJti,
        storedRefreshJti,
        storedRefreshHash,
        redisSession
    )

    validateCsrfToken(csrfToken, storedCsrfHash );

    req.auth = {
        redisSession,
        refreshToken,
        userId
    };
    
    next();
}

const authenticateSession = async (req, res, next) => {
    console.log('Authenticating session with headers and cookies:', req.headers, req.cookies);
    
    const accessToken = req.cookies['access-token'];
    const csrfToken = req.headers['csrf-token'];

    if (!accessToken) {
            throw new AppError(
            'Your session has expired. Please try again.',
            401,
            'ACCESS_TOKEN_MISSING'
        );
    }

    let decoded;
    try {
            decoded = verifyAccessToken(accessToken);
    } catch (err) {
        throw new AppError(
            'Your session has expired. Please try again.',
            401,
            'ACCESS_TOKEN_INVALID'
        )
    }

    const {sub: userId, sid, jti: incomingAccessJti, type} = decoded;

    let redisSession;

    try{
        redisSession = await getCachedSession(sid);
    }catch(error){
        console.error('Failed to retrieve cached session from redis.');
        throw new AppError(
            'Service is temporarily unavailable. Please try again later.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        )
    }

    await validateSession(redisSession, userId);

    const {
        csrfTokenHash: storedCsrfHash,
        role
    } = redisSession;

    validateCsrfToken(csrfToken, storedCsrfHash );
    
    const isValidRole = rolesArray.includes(role);
    if (!isValidRole) {
        console.error('Invalid role');
        throw new AppError(
            'Invalid session.',
            401,
            'INVALID_SESSION'
        );
    }
    req.user = {
        id: sub,
        role: role,
    };

    next();
};





module.exports = {
    validateSignup,
    validateCode,
    validateLogin,
    loginLimiter,
    authenticateSession,
    validateRefreshAccessToken,
    validateLogout
};
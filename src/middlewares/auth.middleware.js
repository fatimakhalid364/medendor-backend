const {enum: {rolesArray}} = require('constants');
const rateLimit = require('express-rate-limit');
const {jwtUtils: {verifyAccessToken, verifyRefreshToken}} = require('utils');
const AppError = require('utils/AppError');
const {safeCompare, hashToken} = require('utils/crypto.utils');
const { revokeAndSyncSessionToRedis } = require('services/session.service');
const {session: Session} = require('models/session.model');
const { getCachedSession } = require('../utils/session.utils');
const { redisClient } = require('config/redis');


const validateSignup = (req, res, next) => {
    const { role, ...data } = req.body;
    console.log('Validating signup request:', role, data);
    if (!role || !rolesArray.includes(role)) {
        return next(
            new AppError(
                'Role field is missing or is invalid.',
                400,
                'REQUIRED_FIELD_MISSING'
            )
        );

    }

    const { firstName, lastName, email, password } = data;

    if (!firstName || !lastName || !email || !password) {
        return next(
            new AppError(
                'One or more of the following fields is missing: first name, last name, email, password',
                400,
                'REQUIRED_FIELD_MISSING'
            )
        )
    }

    try{
        validateEmail(email);
    }catch(error){
        return next(error)
    }

    try{
        validatePassword(password);
    }catch(error){
        return next(error)
    }


    next(); 
}

const validateCode = (req, res, next) => {
    console.log('Validating code:', req.body);
    const { email, code } = req.body;

    if (!email || !code) {
        return next(
            new AppError(
                'Email or code is missing.',
                400,
                'REQUIRED_FIELD_MISSING'
            )
        )
    }

    try{
        validateEmail(email);
    }catch(error){
        return next(error)
    }

    if (typeof code !== 'string' || code.length !== 6) {
        return next(
            new AppError(
                'Invalid code.',
                400,
                'INVALID_CODE'
            )
        )
    }

    next();
};

const validateLogin = (req, res, next) => {
    console.log('Validating login:', req.body);
    const { email, password } = req.body;
    if (!email || !password){
        return next(
            new AppError(
                'Email or password is missing.',
                400,
                'INVALID_CREDENTIALS'
            )
        )
    } 
    next();
};


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { error: 'Too many login attempts. Please try again later.' },
    standardHeaders: true, 
    legacyHeaders: false   
});

const validateForgotPassword = (req, res, next) => {
    try{
        validateEmail(email);
    }catch(error){
        return next(error)
    }

    next();
}

const validateResetPassword = async(req, res, next) => {
    console.log('inside validateResetPasword');

    const {resetToken, newPassword} = req.body;

    // const resetTokenHash = hashToken(resetToken);

    // const key = `password-reset:${resetTokenHash}`;

    // let userId;

    // try {
    //     userId = await redisClient.get(key)
    // }catch(error){
    //     console.error('Failed to extract password reset key from redis', error);
    //     return next(
    //         new AppError(
    //             'Authentication service is temporarily unavailable.',
    //             503,
    //             'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
    //         )
    //     )
    // }

    // if (!userId) {
    //     return next(
    //         new AppError(
    //             'This password reset link is invalid or has expired.',
    //             400,
    //             'INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN'
    //         )
    //     );
    // }

    try{
        validatePassword(newPassword);
    }catch(error){
        return next(error)
    }

    req.resetToken = resetToken;

    next();
}

const validateCangePassword = (req, res, next)=>{
    const {newPassword, currentPassword} = req.body;

    try{
        validatePassword(newPassword);
        validatePassword(currentPassword)
    }catch(error){
        return next(error)
    }

    req.resetToken = resetToken;

    next();
}

const validateRefreshAccessToken = async(req, res, next) => {
    const refreshToken = req.cookies['refreshToken'];
    const csrfToken = req.cookies['csrfToken'];

    let decoded
    try {
        decoded = verifyRefreshToken(refreshToken);
    }catch(error){
        console.error('Invalid or expired refresh token: ', error)
        return next(
            new AppError(
                'Your session has expired. Please login again',
                401,
                'INVALID_OR_EXPIRED_REFRESH_TOKEN'
            )
        )
    }

    const {sub: userId, sid, jti: incomingRefreshJti, type} = decoded;

    let redisSession;

    try{
        redisSession = await getCachedSession(sid);
    }catch(error){
        console.error('Failed to retrieve cached session from redis: ', error);
        return next(
            new AppError(
                'Service is temporarily unavailable. Please try again later.',
                503,
                'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
            )
        )
    }

    const {
        csrfTokenHash: storedCsrfHash,
        refreshTokenHash: storedRefreshHash,
        refreshJti: storedRefreshJti 
    } = redisSession;

    try{
        await validateSession(redisSession, userId);
        await validateRefreshToken(
            refreshToken,
            incomingRefreshJti,
            storedRefreshJti,
            storedRefreshHash,
            redisSession
        )
        validateCsrfToken(csrfToken, storedCsrfHash );
    }catch(error){
        return next(error)
    }

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
            console.error('Access token missing in authenticate session middleware')
            return next(
                new AppError(
                    'Your session has expired. Please try again.',
                    401,
                    'ACCESS_TOKEN_MISSING'
                )
            )
    }

    let decoded;
    try {
            decoded = verifyAccessToken(accessToken);
    } catch (error) {
        console.error('Access token verification failed: ', error)
        return next (
            new AppError(
                'Your session has expired. Please try again.',
                401,
                'ACCESS_TOKEN_INVALID'
            )
        )
    }

    const {sub: userId, sid, jti: incomingAccessJti, type} = decoded;

    let redisSession;

    try{
        redisSession = await getCachedSession(sid);
    }catch(error){
        console.error('Failed to retrieve cached session from redis: ', error);
        return next(
            new AppError(
                'Service is temporarily unavailable. Please try again later.',
                503,
                'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
            )
        ) 
    }

    const {
        csrfTokenHash: storedCsrfHash,
        role
    } = redisSession;

    try {
        await validateSession(redisSession, userId);
        validateCsrfToken(csrfToken, storedCsrfHash );
    }catch(error){
        return next(error);
    }
    
    const isValidRole = rolesArray.includes(role);
    if (!isValidRole) {
        console.error('Invalid role');
        return next (
            new AppError(
                'Invalid session.',
                401,
                'INVALID_SESSION'
            )
        )
    }
    req.user = {
        userId: sub,
        role: role,
        sessionId: sid
    };

    next();
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError(
            'Please provide a valid email address.',
            400,
            'INVALID_EMAIL'
        );
    }
}


const validatePassword = (password) => {

    if (typeof password !== 'string') {
        throw new AppError(
            'Password must be a string.',
            400,
            'INVALID_PASSWORD'
        );
    }

    if (password.length === 0) {
        throw new AppError(
            'Password is required.',
            400,
            'PASSWORD_REQUIRED'
        );
    }

    if (password.trim().length === 0) {
        throw new AppError(
            'Password cannot contain only whitespace.',
            400,
            'INVALID_PASSWORD'
        );
    }

    if (password.length < 12) {
        throw new AppError(
            'Password must be at least 12 characters long.',
            400,
            'PASSWORD_TOO_SHORT'
        );
    }

    if (password.length > 128) {
        throw new AppError(
            'Password must not exceed 128 characters.',
            400,
            'PASSWORD_TOO_LONG'
        );
    }

    if (!/[A-Z]/.test(password)) {
        throw new AppError(
            'Password must contain at least one uppercase letter.',
            400,
            'PASSWORD_MISSING_UPPERCASE'
        );
    }

    if (!/[a-z]/.test(password)) {
        throw new AppError(
            'Password must contain at least one lowercase letter.',
            400,
            'PASSWORD_MISSING_LOWERCASE'
        );
    }

    if (!/[0-9]/.test(password)) {
        throw new AppError(
            'Password must contain at least one number.',
            400,
            'PASSWORD_MISSING_NUMBER'
        );
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        throw new AppError(
            'Password must contain at least one special character.',
            400,
            'PASSWORD_MISSING_SPECIAL'
        );
    }
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






module.exports = {
    validateSignup,
    validateCode,
    validateLogin,
    loginLimiter,
    validateForgotPassword,
    validateResetPassword,
    authenticateSession,
    validateRefreshAccessToken,
    validateCangePassword
};
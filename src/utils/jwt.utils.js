const {env: {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, CSRF_TOKEN_SECRET, JWT_ISSUER, JWT_AUDIENCE}} = require('config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {ACCESS_TOKEN_TTL_MS, SLIDING_TTL_MS, ABSOLUTE_TTL_MS} = require('config/auth.config');



// const generateTokens = (userId, role, sessionId) => {
//     const accessJti = uuidv4();
//     const refreshJti = uuidv4();

//     const accessToken = jwt.sign(
//         { sub: userId, sessionId, accessJti, type: 'access', role },
//         ACCESS_TOKEN_SECRET,
//         { expiresIn: '15m' }
//     );

//     const refreshToken = jwt.sign(
//         { sub: userId, sessionId, refreshJti, type: 'refresh' },
//         REFRESH_TOKEN_SECRET,
//         { expiresIn: '7d' }
//     );

    


//     return { accessToken, refreshToken, accessJti, refreshJti };
// };

// const verifyAccessToken = (token) => jwt.verify(token, ACCESS_TOKEN_SECRET);
// const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_TOKEN_SECRET);

// module.exports = {
//     generateTokens,
//     verifyAccessToken,
//     verifyRefreshToken
// };



const ACCESS_TOKEN_TTL_SECONDS = ACCESS_TOKEN_TTL_MS/1000;
const REFRESH_TOKEN_SLIDING_TTL_SECONDS = SLIDING_TTL_MS/1000;

const {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    JWT_ISSUER,
    JWT_AUDIENCE,
} = process.env;

const getTokenTtl = (expiresAt, maxTtlSeconds) => {
    const remainingSeconds = Math.floor(
        (expiresAt.getTime() - Date.now()) / 1000
    );

    if (remainingSeconds <= 0) {
        throw new Error('Session has expired');
    }

    return Math.min(
        maxTtlSeconds,
        remainingSeconds
    );
};

const generateAccessToken = ({
    userId,
    sessionId,
    expiresAt,
    accessJti
}) => {

    const ttl = genTokenTtl(expiresAt, ACCESS_TOKEN_TTL_SECONDS);

    return jwt.sign(
        {
            sub: userId.toString(),
            sid: sessionId,
            type: 'access',
            jti: accessJti,
        },
        ACCESS_TOKEN_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: ttl,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        }
    );
};

const generateRefreshToken = ({
    userId,
    sessionId,
    expiresAt,
    refreshJti
}) => {
    
    const ttl = genTokenTtl(expiresAt, REFRESH_TOKEN_SLIDING_TTL_SECONDS);

    return jwt.sign(
        {
            sub: userId.toString(),
            sid: sessionId,
            jti: refreshJti,
            type: 'refresh',
        },
        REFRESH_TOKEN_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: ttl,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        ACCESS_TOKEN_SECRET,
        {
            algorithms: ['HS256'],
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        }
    );
};

const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        REFRESH_TOKEN_SECRET,
        {
            algorithms: ['HS256'],
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};

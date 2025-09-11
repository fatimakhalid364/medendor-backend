const {env: {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, CSRF_TOKEN_SECRET}} = require('config');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const generateTokens = (userId, role) => {
    const jti = uuidv4();

    const accessToken = jwt.sign(
        { sub: userId, jti, type: 'access', role },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { sub: userId, jti, type: 'refresh' },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    const csrfToken = jwt.sign(
        { sub: userId, type: 'csrf' },
        CSRF_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    return { accessToken, refreshToken, csrfToken, jti };
};

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_TOKEN_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_TOKEN_SECRET);
const verifyCsrfToken = (token) => jwt.verify(token, CSRF_TOKEN_SECRET);

module.exports = {
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
    verifyCsrfToken,
};

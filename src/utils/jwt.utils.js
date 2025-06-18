const {env: {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, CSRF_TOKEN_SECRET}} = require('config');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const generateTokens = (userId) => {
    const jti = uuidv4();

    const accessToken = jwt.sign(
        { sub: userId, jti, type: 'access' },
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

module.exports = { generateTokens };

const {
    redisClient,
} = require('config').redis;

const getSessionKey = (sessionId) => {
    return `auth:session:${sessionId}`;
};

const getTTLSeconds = (date) => {
    return Math.max(
        1,
        Math.floor(
            (date.getTime() - Date.now()) / 1000
        )
    );
};

const cacheSession = async (session) => {
    const key = getSessionKey(
        session.sessionId
    );

    const data = {
        userId: session.user.toString(),
        sessionId: session.sessionId,
        revoked: Boolean(session.revokedAt),
        expiresAt:
            session.expiresAt.getTime(),
        absoluteExpiresAt:
            session.absoluteExpiresAt.getTime(),
        revokedAt:
            session.revokedAt
                ? session.revokedAt.getTime()
                : null,
    };

    const ttlDate = session.revokedAt
        ? session.absoluteExpiresAt
        : session.expiresAt;

    const ttl = getTTLSeconds(ttlDate);

    await redisClient.set(
        key,
        JSON.stringify(data),
        {
            EX: ttl,
        }
    );
};

const getCachedSession = async (sessionId) => {
    const key = getSessionKey(sessionId);

    const data = await redisClient.get(key);

    if (!data) {
        return null;
    }

    return JSON.parse(data);
};

const markSessionRevoked = async (
    sessionId,
    absoluteExpiresAt
) => {
    const key = getSessionKey(sessionId);

    const data = {
        sessionId,
        revoked: true,
        revokedAt: Date.now(),
    };

    const ttl = getTTLSeconds(
        absoluteExpiresAt
    );

    await redisClient.set(
        key,
        JSON.stringify(data),
        {
            EX: ttl,
        }
    );
};

module.exports = {
    cacheSession,
    getCachedSession,
    markSessionRevoked,
};
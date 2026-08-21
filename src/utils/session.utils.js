const {
    SLIDING_TTL_MS,
    ABSOLUTE_TTL_MS,
} = require('config/auth.config');
const {
    redisClient,
} = require('config/redis');
const {
    CACHE_SESSION_SCRIPT,
    MARK_SESSION_REVOKED_SCRIPT
} = require('scripts/session.scripts');

const {
    redisClient,
} = require('config').redis;

const {serializeSessionForRedis} = require('./serializers.utils')

const calculateSessionExpiry = (now = Date.now()) => {
    const absoluteExpiresAt =
        new Date(now + ABSOLUTE_TTL_MS);

    const expiresAt =
        new Date(
            Math.min(
                now + SLIDING_TTL_MS,
                absoluteExpiresAt.getTime()
            )
        );

    return {
        expiresAt,
        absoluteExpiresAt,
    };
};

const getSessionKey = (sessionId) => {
    return `auth:session:${sessionId}`;
};

const getTTLSeconds = (expiresAt) => {
    const expiresAtMs = expiresAt.getTime();

    const remainingMs =
        expiresAtMs - Date.now();

    if (remainingMs <= 0) {
        return null;
    }

    return Math.max(
        1,
        Math.ceil(remainingMs / 1000)
    );
};

const getSessionTTL = (session) => {
    const ttlDate = session.revokedAt
        ? session.absoluteExpiresAt
        : session.expiresAt;

    return getTTLSeconds(ttlDate);
};


// const cacheSession = async (session) => {
//     try {
//         const key = getSessionKey(
//             session.sessionId
//         );

//         const data = {
//             userId: session.user.toString(),
//             sessionId: session.sessionId,
//             revoked: Boolean(session.revokedAt),
//             expiresAt:
//                 session.expiresAt.getTime(),
//             absoluteExpiresAt:
//                 session.absoluteExpiresAt.getTime(),
//             revokedAt:
//                 session.revokedAt
//                     ? session.revokedAt.getTime()
//                     : null,
//         };

//         const ttlDate = session.revokedAt
//             ? session.absoluteExpiresAt
//             : session.expiresAt;

//         const ttl = getTTLSeconds(ttlDate);

//         await redisClient.set(
//             key,
//             JSON.stringify(data),
//             {
//                 EX: ttl,
//             }
//         );
//     }catch(error){
//         throw new Error(error.message || 'Failed to cache session in redis.')
//     }
// };

const cacheSession = async (session, role) => {
    const key =
        getSessionKey(session.sessionId);

    const ttl =
        getSessionTTL(session);

    /*
        * If the session has already expired, do not create
        * a Redis key with an invalid/zero TTL.
        */
    if (ttl === null) {
        return false;
    }

    const data =
        serializeSessionForRedis(session, role);

    const result =
        await redisClient.eval(
            CACHE_SESSION_SCRIPT,
            {
                keys: [key],

                arguments: [
                    JSON.stringify(data),
                    String(ttl),
                ],
            }
        );

    /*
        * 1 = Redis accepted the state.
        * 0 = Redis rejected it because it was stale or would
        *      resurrect a revoked session.
        */
    return Number(result) === 1;
};

const getCachedSession = async (sessionId) => {
    const key = getSessionKey(sessionId);

    const data = await redisClient.get(key);

    if (!data) {
        return null;
    }

    return JSON.parse(data);
};

// const markSessionRevoked = async (
//     sessionId,
//     absoluteExpiresAt,
//     revokedAt
// ) => {
//     const key = getSessionKey(sessionId);

//     const data = {
//         sessionId,
//         revoked: true,
//         revokedAt: Date.now(),
//     };

//     const ttl = getTTLSeconds(
//         absoluteExpiresAt
//     );

//     await redisClient.set(
//         key,
//         JSON.stringify(data),
//         {
//             EX: ttl,
//         }
//     );
// };

const markSessionRevoked = async (
    sessionId,
    absoluteExpiresAt,
    version
) => {
    const key =
        getSessionKey(sessionId);

    const ttl =
        getTTLSeconds(
            absoluteExpiresAt
        );

    /*
     * Nothing should be stored after the absolute lifetime.
     */
    if (ttl === null) {
        return false;
    }

    const revokedAt =
        Date.now();

    const result =
        await redisClient.eval(
            MARK_SESSION_REVOKED_SCRIPT,
            {
                keys: [key],

                arguments: [
                    String(revokedAt),
                    String(version),
                    String(ttl),
                    sessionId,
                ],
            }
        );

    return Number(result) === 1;
};


module.exports = {
    calculateSessionExpiry,
    cacheSession,
    getCachedSession,
    markSessionRevoked,
};
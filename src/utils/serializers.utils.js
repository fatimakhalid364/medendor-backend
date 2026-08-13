const convertToPublicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
});

const serializeSessionForRedis = (session) => ({
    userId: session.user.toString(),

    sessionId: session.sessionId,

    revoked: Boolean(session.revokedAt),

    expiresAt: session.expiresAt.getTime(),

    absoluteExpiresAt:
        session.absoluteExpiresAt.getTime(),

    revokedAt: session.revokedAt
        ? session.revokedAt.getTime()
        : null,

    /*
     * Used by Redis to reject stale writes.
     */
    version: session.version,
});

module.exports = {
    convertToPublicUser,
    serializeSessionForRedis
};
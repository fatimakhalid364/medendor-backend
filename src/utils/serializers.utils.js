const convertToPublicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
});

const serializeSessionForRedis = (session, role) => ({
    userId: session.userId.toString(),

    sessionId: session.sessionId,

    role: role,

    refreshTokenHash: session.refreshTokenHash,

    refreshJti: session.refreshJti,

    csrfTokenHash: session.csrfTokenHash,

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
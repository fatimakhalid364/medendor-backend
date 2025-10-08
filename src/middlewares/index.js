module.exports = {
    authMiddlewares: require('./auth.middleware'),
    symptomCheckerMiddlewares: require('./symptomChecker.middleware'),
    profileMiddlewares: require('./profile.middleware'),
    doctorProfileMiddlewares: require('./profile/doctor.middleware'),
}
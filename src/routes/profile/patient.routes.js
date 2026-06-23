const express = require('express');
const router = express.Router();

const {
    patientMiddlewares: {
        validateIsPatient,
        validateBasicPatientInfo,
        validateHealthInterests
    },
    authMiddlewares: {
        authenticateSession
    },
} = require('middlewares');

const {validateRequestFields} = require('middlewares/profile.middleware')

const multer = require('multer');
const { cloudinary: { storage } } = require('config');

const {
    patientControllers: {
        handleAddBasicPatientInfo,
        handleUpdateBasicPatientInfo,
        handleAddHealthInterests,
        handleUpdateHealthInterests,
        handleAddPrivacyPreferences,
        handleUpdatePrivacyPreferences,
        handleAddPatientFinalTouches,
        handleUpdatePatientFinalTouches,
        handleAddJoinedCommunitiesArray,
        handleLeaveCommunities
    }
} = require('controllers');

const upload = multer({ storage });

/*
|--------------------------------------------------------------------------
| Global Middleware (Patient-only routes)
|--------------------------------------------------------------------------
*/

router.use(authenticateSession);
router.use(validateIsPatient);

/*
|--------------------------------------------------------------------------
| Basic Patient Info
|--------------------------------------------------------------------------
*/

router.post(
    '/basic-info',
    upload.single('profilePicture'),
    validateBasicPatientInfo,
    handleAddBasicPatientInfo
);

router.put(
    '/basic-info',
    upload.single('profilePicture'),
    handleUpdateBasicPatientInfo
);

/*
|--------------------------------------------------------------------------
| Health Interests
|--------------------------------------------------------------------------
*/

router.post(
    '/health-interests',
    validateHealthInterests,
    handleAddHealthInterests
);

router.put(
    '/health-interests',
    validateRequestFields,
    handleUpdateHealthInterests
);

/*
|--------------------------------------------------------------------------
| Privacy Preferences
|--------------------------------------------------------------------------
*/

router.post(
    '/privacy-preferences',
    handleAddPrivacyPreferences
);

router.put(
    '/privacy-preferences',
    validateRequestFields,
    handleUpdatePrivacyPreferences
);

/*
|--------------------------------------------------------------------------
| Final Touches
|--------------------------------------------------------------------------
*/

router.post(
    '/final-touches',
    handleAddPatientFinalTouches
);

router.put(
    '/final-touches',
    validateRequestFields,
    handleUpdatePatientFinalTouches
);

/*
|--------------------------------------------------------------------------
| Communities
|--------------------------------------------------------------------------
*/

router.post(
    '/communities',
    handleAddJoinedCommunitiesArray
);

router.delete(
    '/communities',
    handleLeaveCommunities
);

module.exports = router;
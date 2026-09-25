const express = require('express');
const router = express.Router();

const {validateIsPatient} = require('middlewares/patient.middleware');

const {makeUpdatePath} = require('middlewares/profile.middleware')
const {basicProfileZodSchema} = require('validators/basicProfile.zod');
const {communitiesZodSchema} = require('validators/communities.zod');
const {
    healthInterestsZodSchema,
    privacyPreferencesZodSchema,
    finalTouchesZodSchema
} = require('validators/profileChunks/pateint');

const {authenticateSession} = require('middlewares/auth.middleware');
const validate = require('middlewares/validation.middleware');

const upload = require('config/multer');

const {
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
    } = require('controllers/profile/patient.controller');

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
    validate(basicProfileZodSchema.addition),
    handleAddBasicPatientInfo
);

router.put(
    '/basic-info',
    upload.single('profilePicture'),
    validate(basicProfileZodSchema.update),
    handleUpdateBasicPatientInfo
);

/*
|--------------------------------------------------------------------------
| Health Interests
|--------------------------------------------------------------------------
*/

router.post(
    '/health-interests',
    validate(healthInterestsZodSchema.addition),
    handleAddHealthInterests
);

router.put(
    '/health-interests',
    validate(healthInterestsZodSchema.update),
    makeUpdatePath('healthInterests'),
    handleUpdateHealthInterests
);

/*
|--------------------------------------------------------------------------
| Privacy Preferences
|--------------------------------------------------------------------------
*/

router.post(
    '/privacy-preferences',
    validate(privacyPreferencesZodSchema.addition),
    handleAddPrivacyPreferences
);

router.put(
    '/privacy-preferences',
    validate(privacyPreferencesZodSchema.update),
    makeUpdatePath('privacyPreferences'),
    handleUpdatePrivacyPreferences
);

/*
|--------------------------------------------------------------------------
| Final Touches
|--------------------------------------------------------------------------
*/

router.post(
    '/final-touches',
    validate(finalTouchesZodSchema.addition),
    handleAddPatientFinalTouches
);

router.put(
    '/final-touches',
    validate(finalTouchesZodSchema.update),
    makeUpdatePath('finalTouches'),
    handleUpdatePatientFinalTouches
);

/*
|--------------------------------------------------------------------------
| Communities
|--------------------------------------------------------------------------
*/

router.post(
    '/communities',
    validate(communitiesZodSchema),
    handleAddJoinedCommunitiesArray
);

router.delete(
    '/communities',
    validate(communitiesZodSchema),
    handleLeaveCommunities
);

module.exports = router;
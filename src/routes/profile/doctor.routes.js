const express = require('express');
const router = express.Router();
const {
        validateIsDoctor, 
        validateBasicDoctorInfo,
        validateAvailabilityDetails, 
        validateCredentialDetails, 
        validateProfessionalDetails, 
        validateDoctorFinalTouches,
        validateCommunitiesArray
    } = require('middlewares/profile/doctor.middleware');
const {authenticateSession} = require('middlewares/auth.middleware')
const multer = require('multer');
const {storage} = require('config/cloudinary');
const { 
    handleAddBasicDoctorInfo,
    handleUpdateBasicDoctorInfo,
    handleAddProfessionalDetails,
    handleUpdateProfessionalDetails,
    handleAddCredentials,
    handleUpdateCredentials,
    handleAddAvailabilityDetails,
    handleUpdateAvailabilityDetails,
    handleAddJoinedCommunitiesArray,
    handleLeaveCommunities,
    handleAddFinalTouches,
    handleUpdateFinalTouches
} = require('controllers/profile/doctor.controller');

const {
    availabilitySchema, 
    credentialsSchema, 
    professionalDetailsSchema,
    finalTouchesSchema
} = require('models/profileChunks/doctor');

const {validateRequestFieldsForUpdate} = require('middlewares/profile.middleware');

const upload = multer({ storage });

router.use(authenticateSession);
router.use(validateIsDoctor);

/*
|--------------------------------------------------------------------------
| Basic Doctor Info
|--------------------------------------------------------------------------
*/

router.post(
    '/basic-info',
    upload.single('profilePicture'),
    validateBasicDoctorInfo,
    handleAddBasicDoctorInfo
);

router.patch(
    '/basic-info',
    upload.single('profilePicture'),
    handleUpdateBasicDoctorInfo
);

/*
|--------------------------------------------------------------------------
| Professional Details
|--------------------------------------------------------------------------
*/

router.post(
    '/professional-details',
    validateProfessionalDetails,
    handleAddProfessionalDetails
);

router.patch(
    '/professional-details',
    validateRequestFieldsForUpdate(professionalDetailsSchema, 'professionalDetails'),
    handleUpdateProfessionalDetails
);

/*
|--------------------------------------------------------------------------
| Credentials
|--------------------------------------------------------------------------
*/

router.post(
    '/credentials',
    validateCredentialDetails,
    handleAddCredentials
);

router.patch(
    '/credentials',
    validateRequestFieldsForUpdate(credentialsSchema, 'credentials'),
    handleUpdateCredentials
);

/*
|--------------------------------------------------------------------------
| Availability
|--------------------------------------------------------------------------
*/

router.post(
    '/availability',
    validateAvailabilityDetails,
    handleAddAvailabilityDetails
);

router.patch(
    '/availability',
    validateRequestFieldsForUpdate(availabilitySchema, 'availability'),
    handleUpdateAvailabilityDetails
);

/*
|--------------------------------------------------------------------------
| Communities
|--------------------------------------------------------------------------
*/

router.post(
    '/communities',
    validateCommunitiesArray,
    handleAddJoinedCommunitiesArray
);

router.delete(
    '/communities',
    handleLeaveCommunities
);

/*
|--------------------------------------------------------------------------
| Final Touches
|--------------------------------------------------------------------------
*/

router.post(
    '/final-touches',
    handleAddFinalTouches
);

router.patch(
    '/final-touches',
    validateRequestFieldsForUpdate(finalTouchesSchema, 'finalTouches'),
    handleUpdateFinalTouches
);


module.exports = router;
const express = require('express');
const router = express.Router();

const {basicProfileZodSchema} = require('validators/basicProfile.zod');
const {
    availabilityZodSchema,
    communitiesZodSchema,
    professionalDetailsZodSchema,
    credentialsZodSchema,
    finalTouchesZodSchema
} = require('validators/profileChunks/doctor');

const validate = require('middlewares/validation.middleware');
const {authenticateSession} = require('middlewares/auth.middleware');
const makeUpdatePath = require('middlewares/profile.middleware');
const {validateIsDoctor, validateDoctorAge} = require('middlewares/profile/doctor.middleware');

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





const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },

    fileFilter: (req, file, cb) => {

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
                new AppError(
                    'Profile picture must be a JPEG, PNG, or WebP image.',
                    400,
                    'INVALID_PROFILE_PICTURE_TYPE'
                )
            );
        }

        cb(null, true);
    }
});

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
    validateDoctorAge,
    validate(basicProfileZodSchema.addition),
    handleAddBasicDoctorInfo
);

router.patch(
    '/basic-info',
    upload.single('profilePicture'),
    validateDoctorAge,
    validate(basicProfileZodSchema.update),
    handleUpdateBasicDoctorInfo
);

/*
|--------------------------------------------------------------------------
| Professional Details
|--------------------------------------------------------------------------
*/

router.post(
    '/professional-details',
    validate(professionalDetailsZodSchema.addition),
    handleAddProfessionalDetails
);

router.patch(
    '/professional-details',
    validate(professionalDetailsZodSchema.update),
    makeUpdatePath('professionalDetails'),
    handleUpdateProfessionalDetails
);

/*
|--------------------------------------------------------------------------
| Credentials
|--------------------------------------------------------------------------
*/

router.post(
    '/credentials',
    validate(credentialsZodSchema.addition),
    handleAddCredentials
);

router.patch(
    '/credentials',
    validate(credentialsZodSchema.update),
    makeUpdatePath('credentials'),
    handleUpdateCredentials
);

/*
|--------------------------------------------------------------------------
| Availability
|--------------------------------------------------------------------------
*/

router.post(
    '/availability',
    validate(availabilityZodSchema.addition),
    handleAddAvailabilityDetails
);

router.patch(
    '/availability',
    validate(availabilityZodSchema.update),
    makeUpdatePath('availability'),
    handleUpdateAvailabilityDetails
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

/*
|--------------------------------------------------------------------------
| Final Touches
|--------------------------------------------------------------------------
*/

router.post(
    '/final-touches',
    validate(finalTouchesZodSchema.addition),
    handleAddFinalTouches
);

router.patch(
    '/final-touches',
    validate(finalTouchesZodSchema.update),
    makeUpdatePath('finalTouches'),
    handleUpdateFinalTouches
);


module.exports = router;
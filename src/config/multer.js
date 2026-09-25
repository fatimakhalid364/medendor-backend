const multer = require('multer');
const {storage} = require('config/cloudinary');
const {mimeTypesArray} = require('constants/enum');

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },

    fileFilter: (req, file, cb) => {

        if (!mimeTypesArray.includes(file.mimetype)) {
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

module.exports = upload;
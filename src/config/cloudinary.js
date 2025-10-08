const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = require('./env');


cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'profile_pictures',        
        allowed_formats: ['jpg', 'jpeg', 'png'],
    }
});

module.exports = { cloudinary, storage };

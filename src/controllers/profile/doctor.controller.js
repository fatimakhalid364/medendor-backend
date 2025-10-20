const { doctorProfileServices: {
    addBasicDoctorInfo,
    updateBasicDoctorInfo,
    addProfessionalDetails,
    updateProfessionalDetails,
    addCredentials,
    updateCredentials,
    addAvailabilityDetails,
    updateAvailabilityDetails,
    addJoinedCommunitiesArray,
    leaveCommunities,
    addFinalTouches,
    updateFinalTouches
}} = require('services');


const handleAddBasicDoctorInfo = async(req, res) => {
    try {
        console.log('Handling addBasicDoctorInfo request:', req.body, req.user);
        const userId = req.user.id;
        const textFields = req.body;
        const profilePictureUrl = req.file.path;
        const basicDoctorInfo = { ...textFields, profilePicture: profilePictureUrl };

        const result = await addBasicDoctorInfo(userId, basicDoctorInfo);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding basic doctor info',
        });
    }
}

const handleUpdateBasicDoctorInfo = async(req, res) => {
    try {
        console.log('Handling addBasicDoctorInfo request:', req.body, req.user);
        const userId = req.user.id;
        const textFields = req.body;
        const profilePictureUrl = req.file.path;
        let basicDoctorInfo;
        if (!profilePictureUrl) {
            basicDoctorInfo = textFields;
        } else {
            basicDoctorInfo = { ...textFields, profilePicture: profilePictureUrl };
        }

        const result = await updateBasicDoctorInfo(userId, basicDoctorInfo);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding basic doctor info',
        });
    }
}

module.exports = {handleAddBasicDoctorInfo};
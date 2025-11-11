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
        console.log('Handling updateBasicDoctorInfo request:', req.body, req.user);
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
            message: error.message || 'An error occurred while updating basic doctor info',
        });
    }
}

const handleAddProfessionalDetails = async(req, res) => {
    try {
        console.log('Handling addProfessionalDetails request:', req.body, req.user);
        const userId = req.user.id;
        const professionalDetailsData = req.body;

        const result = await addProfessionalDetails(userId, professionalDetailsData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding professional details',
        });
    }
}


const handleUpdateProfessionalDetails = async(req, res) => {
    try {
        console.log('Handling updateProfessionalDetails request:', req.body, req.user);
        const userId = req.user.id;
        const professionalDetailsData = req.body;

        const result = await updateProfessionalDetails(userId, professionalDetailsData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while updating professional details',
        });
    }
}

const handleAddCredentials = async(req, res) => {
    try {
        console.log('Handling addCredentials request:', req.body, req.user);
        const userId = req.user.id;
        const credentialsData = req.body;

        const result = await addCredentials(userId, credentialsData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding credentials',
        });
    }
}

const handleUpdateCredentials = async(req, res) => {
    try {
        console.log('Handling updateCredentials request:', req.body, req.user);
        const userId = req.user.id;
        const credentialsData = req.body;

        const result = await updateCredentials(userId, credentialsData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while updating credentials',
        });
    }
}

const handleAddAvailabilityDetails = async(req, res) => {
    try {
        console.log('Handling addAvailabilityDetails request:', req.body, req.user);
        const userId = req.user.id;
        const availabilityDetails = req.body;

        const result = await addAvailabilityDetails(userId, availabilityDetails);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding availability details',
        });
    }
}

const handleUpdateAvailabilityDetails = async(req, res) => {
    try {
        console.log('Handling updateAvailabilityDetails request:', req.body, req.user);
        const userId = req.user.id;
        const availabilityDetails = req.body;

        const result = await updateAvailabilityDetails(userId, availabilityDetails);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while updating availability details',
        });
    }
}


const handleAddJoinedCommunitiesArray = async(req, res) => {
    try {
        console.log('Handling addJoinedCommunitiesArray request:', req.body, req.user);
        const userId = req.user.id;
        const joinedCommunitiesArray = req.body;

        const result = await addJoinedCommunitiesArray(userId, joinedCommunitiesArray);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding joined communities',
        });
    }
}

const handleLeaveCommunities = async(req, res) => {
    try {
        console.log('Handling leaveCommunities request:', req.body, req.user);
        const userId = req.user.id;
        const leftCommunitiesArray = req.body;

        const result = await leaveCommunities(userId, leftCommunitiesArray);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while leaving communities',
        });
    }
}

const handleAddFinalTouches = async(req, res) => {
    try {
        console.log('Handling addFinalTouches request:', req.body, req.user);
        const userId = req.user.id;
        const finalTouchesData = req.body;

        const result = await addFinalTouches(userId, finalTouchesData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding final touches',
        });
    }
}


const handleUpdateFinalTouches = async(req, res) => {
    try {
        console.log('Handling updateFinalTouches request:', req.body, req.user);
        const userId = req.user.id;
        const finalTouchesData = req.body;

        const result = await updateFinalTouches(userId, finalTouchesData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while updating final touches',
        });
    }
}

module.exports = {
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
};
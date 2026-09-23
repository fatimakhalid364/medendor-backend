const {
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
} = require('services/profile/doctor.service');


const handleAddBasicDoctorInfo = async(req, res) => {
    console.log('Handling addBasicDoctorInfo request:', req.body, req.user);
    const userId = req.user.id;
    const textFields = req.body;
    const profilePictureUrl = req.file?.path;
    const basicDoctorInfo = { ...textFields, profilePicture: profilePictureUrl };

    const result = await addBasicDoctorInfo(userId, basicDoctorInfo);
    res.status(201).json(result);
}

const handleUpdateBasicDoctorInfo = async(req, res) => {
        console.log('Handling updateBasicDoctorInfo request:', req.body, req.user);
        const userId = req.user.id;
        const textFields = req.body;
        const profilePictureUrl = req.file?.path;
        let basicDoctorInfo;
        if (!profilePictureUrl) {
            basicDoctorInfo = textFields;
        } else {
            basicDoctorInfo = { ...textFields, profilePicture: profilePictureUrl };
        }

        const result = await updateBasicDoctorInfo(userId, basicDoctorInfo);
        res.status(200).json(result);
    }


const handleAddProfessionalDetails = async(req, res) => {
        console.log('Handling addProfessionalDetails request:', req.body, req.user);
        const userId = req.user.id;
        const professionalDetailsData = req.body;

        const result = await addProfessionalDetails(userId, professionalDetailsData);
        res.status(201).json(result);
} 


const handleUpdateProfessionalDetails = async(req, res) => {
        console.log('Handling updateProfessionalDetails request:', req.body, req.user);
        const userId = req.user.id;
        const updateData = req.updateData;

        const result = await updateProfessionalDetails(userId, updateData);
        res.status(200).json(result);
}


const handleAddCredentials = async(req, res) => {
        console.log('Handling addCredentials request:', req.body, req.user);
        const userId = req.user.id;
        const credentialsData = req.body;

        const result = await addCredentials(userId, credentialsData);
        res.status(201).json(result);
} 

const handleUpdateCredentials = async(req, res) => {
        console.log('Handling updateCredentials request:', req.body, req.user);
        const userId = req.user.id;
        const updateData = req.updateData;

        const result = await updateCredentials(userId, updateData);
        res.status(200).json(result);
} 

const handleAddAvailabilityDetails = async(req, res) => {
        console.log('Handling addAvailabilityDetails request:', req.body, req.user);
        const userId = req.user.id;
        const availabilityDetails = req.body;

        const result = await addAvailabilityDetails(userId, availabilityDetails);
        res.status(201).json(result);
} 

const handleUpdateAvailabilityDetails = async(req, res) => {
        console.log('Handling updateAvailabilityDetails request:', req.body, req.user);
        const userId = req.user.id;
        const updateData = req.updateData;

        const result = await updateAvailabilityDetails(userId, updateData);
        res.status(200).json(result);
} 


const handleAddJoinedCommunitiesArray = async(req, res) => {
        console.log('Handling addJoinedCommunitiesArray request:', req.body, req.user);
        const userId = req.user.id;
        const communitiesArray = req.body;

        const result = await addJoinedCommunitiesArray(userId, communitiesArray);
        res.status(201).json(result);
    } 

const handleLeaveCommunities = async(req, res) => {
        console.log('Handling leaveCommunities request:', req.body, req.user);
        const userId = req.user.id;
        const leftCommunitiesArray = req.body;

        const result = await leaveCommunities(userId, leftCommunitiesArray);
        res.status(200).json(result);
    } 

const handleAddFinalTouches = async(req, res) => {
        console.log('Handling addFinalTouches request:', req.body, req.user);
        const userId = req.user.id;
        const finalTouchesData = req.body;

        const result = await addFinalTouches(userId, finalTouchesData);
        res.status(201).json(result);
    } 


const handleUpdateFinalTouches = async(req, res) => {
        console.log('Handling updateFinalTouches request:', req.body, req.user);
        const userId = req.user.id;
        const updateData = req.updateData;

        const result = await updateFinalTouches(userId, updateData);
        res.status(200).json(result);
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
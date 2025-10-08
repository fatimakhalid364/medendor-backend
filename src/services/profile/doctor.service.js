const {basicProfile: BasicProfile, doctor: Doctor} = require('models');

//basicDoctorInfo

const addBasicDoctorInfo = async (userId, basicDoctorInfo) => {
    try {
        console.log('Inside addDoctorBasicInfo service:', 'data:',basicDoctorInfo, 'and id:', userId);
        const existingProfile = await BasicProfile.findOne({ user: userId });
        if (existingProfile) {
        throw new Error('BasicdoctorInfo already registered');
        }

        const basicProfile = new BasicProfile({
        user: userId,
        ...basicDoctorInfo
        });

        await basicProfile.save();
        return { success: true, message: `Basic Doctor Info created successfully.` };
    } catch (error) {
        console.error('Error during adding basic doctor info:', error);
        throw new Error(error.message || 'addBasicDoctorInfo failed');
    }
};

const updateBasicDoctorInfo = async (userId, basicDoctorInfo) => {
    try {
        let basicProfile = await BasicProfile.findOneAndUpdate({ user: userId });

        if (!basicProfile) {
        throw new Error("Basic doctor info not found for this user.");
        }

        basicProfile = {
        ...basicProfile.toObject(),
        ...basicDoctorInfo
        }

        await basicProfile.save();

        return { success: true, message: `Basic Doctor Info updated successfully.` };
        } catch (error) {
        console.error("Error in updateBasicDoctorInfo service:", error);
        throw new Error(error.message || "Unable to update basic doctor info");
    }
};

//professionalDetails

const addProfessionalDetails = async (userId, professionalDetailsData) => {
    try {
        console.log('Inside addProfessionalDetails service:', 'data:',professionalDetailsData, 'and id:', userId);
        let existingDoctorDetails = await Doctor.findOne({ user: userId });

        if (!existingDoctorDetails) {
            const doctorDetails = new Doctor({
            user: userId,
            professionalDetails: professionalDetailsData,
            });
            await doctorDetails.save();
            return { success: true, message: `Professional details added successfully.` };
        }
        if (existingDoctorDetails.professionalDetails &&  Object.keys(existingDoctorDetails.professionalDetails.toObject()).length > 0) {
            throw new Error('Professional details already added');
        } else {
            existingDoctorDetails.professionalDetails = professionalDetailsData;
            await existingDoctorDetails.save();
            return { success: true, message: `Professional details added successfully.` };
        }
    } catch (error) {
        console.error('Error during adding professsional details:', error);
        throw new Error(error.message || 'addProfessionalDetails failed');
    }
};

const updateProfessionalDetails = async (userId, professionalDetailsData) => {
    try {
        const doctorDetails = await Doctor.findOne({ user: userId });
        if (!doctorDetails) {
        throw new Error("Doctor details not found for this user.");
        }

        if (!doctorDetails.professionalDetails || Object.keys(doctorDetails.professionalDetails.toObject()).length === 0) {
        throw new Error("Professional details not found. Please add them before updating.");
        }

        doctorDetails.professionalDetails = {
        ...doctorDetails.professionalDetails.toObject(),
        ...professionalDetailsData
        };

        await doctorDetails.save();

        return { success: true, message: "Professional details updated successfully." };
    } catch (error) {
        console.error("Error in updateProfessionalDetails service:", error);
        throw new Error(error.message || "Unable to update professional details");
    }
};

//credentials


const addCredentials = async (userId, credentialsData) => {
    try {
        console.log('Inside addCredentials service:', 'data:',credentialsData, 'and id:', userId);
        let existingDoctorDetails = await Doctor.findOne({ user: userId });

        if (!existingDoctorDetails) {
            const doctorDetails = new Doctor({
            user: userId,
            credentials: credentialsData,
            });
            await doctorDetails.save();
            return { success: true, message: `Credentials added successfully.` };
        }
        if (existingDoctorDetails.credentials &&  Object.keys(existingDoctorDetails.credentials.toObject()).length > 0) {
            throw new Error('Credentials already added');
        } else {
            existingDoctorDetails.credentials = credentialsData;
            await existingDoctorDetails.save();
            return { success: true, message: `Credentials added successfully.` };
        }
    } catch (error) {
        console.error('Error during adding credentials:', error);
        throw new Error(error.message || 'addCredentials failed');
    }
};


const updateCredentials = async (userId, credentialsData) => {
    try {
        const doctorDetails = await Doctor.findOne({ user: userId });
        if (!doctorDetails) {
        throw new Error("Doctor details not found for this user.");
        }

        if (!doctorDetails.credentials || Object.keys(doctorDetails.credentials.toObject()).length === 0) {
        throw new Error("Credentials not found. Please add them before updating.");
        }

        doctorDetails.credentials = {
        ...doctorDetails.credentials.toObject(),
        ...credentialsData
        };

        await doctorDetails.save();

        return { success: true, message: "Credentials updated successfully." };
    } catch (error) {
        console.error("Error in updateCredentials service:", error);
        throw new Error(error.message || "Unable to update credentials");
    }
};

//availability


const addAvailabilityDetails = async (userId, availabilityDetailsData) => {
    try {
        console.log('Inside addAvailabilityDetails service:', 'data:',availabilityDetailsData, 'and id:', userId);
        let existingDoctorDetails = await Doctor.findOne({ user: userId });

        if (!existingDoctorDetails) {
            const doctorDetails = new Doctor({
            user: userId,
            availabilityDetails: availabilityDetailsData,
            });
            await doctorDetails.save();
            return { success: true, message: `Availability details added successfully.` };
        }
        if (existingDoctorDetails.availabilityDetails &&  Object.keys(existingDoctorDetails.availabilityDetails.toObject()).length > 0) {
            throw new Error('Availability details already added');
        } else {
            existingDoctorDetails.availabilityDetails = availabilityDetailsData;
            await existingDoctorDetails.save();
            return { success: true, message: `Availability details added successfully.` };
        }
    } catch (error) {
        console.error('Error during adding availability details:', error);
        throw new Error(error.message || 'addAvailabilityDetails failed');
    }
};


const updateAvailabilityDetails = async (userId, availabilityDetailsData) => {
    try {
        const doctorDetails = await Doctor.findOne({ user: userId });
        if (!doctorDetails) {
        throw new Error("Doctor details not found for this user.");
        }

        if (!doctorDetails.availabilityDetails || Object.keys(doctorDetails.availabilityDetails.toObject()).length === 0) {
        throw new Error("Availability details not found. Please add them before updating.");
        }

        doctorDetails.availabilityDetails = {
        ...doctorDetails.availabilityDetails.toObject(),
        ...availabilityDetailsData
        };

        await doctorDetails.save();

        return { success: true, message: "Availability details updated successfully." };
    } catch (error) {
        console.error("Error in updateAvailabilityDetails service:", error);
        throw new Error(error.message || "Unable to update availability details");
    }
};


//communitiesToJoin

const addCommunitiesToJoin = async (userId, communitiesToJoin) => {
    try {
        console.log('Inside addCommunitiesToJoin service:', 'data:',communitiesToJoin, 'and id:', userId);
        let existingDoctorDetails = await Doctor.findOne({ user: userId });

        if (!existingDoctorDetails) {
            const doctorDetails = new Doctor({
            user: userId,
            joinCommunities: communitiesToJoin,
            });
            await doctorDetails.save();
            return { success: true, message: `Joined communities added successfully.` };
        }
        if (existingDoctorDetails.joinCommunities &&  Object.keys(existingDoctorDetails.joinCommunities.toObject()).length > 0) {
            throw new Error('Joined communities already added');
        } else {
            existingDoctorDetails.joinCommunities = communitiesToJoin;
            await existingDoctorDetails.save();
            return { success: true, message: `Joined communities added successfully.` };
        }
    } catch (error) {
        console.error('Error during adding joined communities:', error);
        throw new Error(error.message || 'addCommunitiesToJoin failed');
    }
};


const updateCommunitiesToJoin = async (userId, communitiesToJoin) => {
    try {
        const doctorDetails = await Doctor.findOne({ user: userId });
        if (!doctorDetails) {
        throw new Error("Doctor details not found for this user.");
        }

        if (!doctorDetails.availabilityDetails || Object.keys(doctorDetails.availabilityDetails.toObject()).length === 0) {
        throw new Error("Availability details not found. Please add them before updating.");
        }

        doctorDetails.availabilityDetails = {
        ...doctorDetails.availabilityDetails.toObject(),
        ...availabilityDetailsData
        };

        await doctorDetails.save();

        return { success: true, message: "Availability details updated successfully." };
    } catch (error) {
        console.error("Error in updateAvailabilityDetails service:", error);
        throw new Error(error.message || "Unable to update availability details");
    }
};





const {basicProfile: BasicProfile, doctor: Doctor} = require('models');
const mongoose = require('mongoose');
const {basicUtils: { isEmptyDeep }} = require('utils');
const {mails: {verifyDocMailSub, verifyDocMailHtml}} = require('constants');


//basicDoctorInfo

const addBasicDoctorInfo = async (userId, basicDoctorInfo) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        console.log('Inside addDoctorBasicInfo service:', { userId, basicDoctorInfo });

        const existingProfile = await BasicProfile.findOne({ user: userId }).session(session);
        if (existingProfile) {
            throw new Error('Basic doctor info already registered.');
        }

        const basicProfile = new BasicProfile({
            user: userId,
            ...basicDoctorInfo,
        });
        await basicProfile.save({ session });

        const doctor = new Doctor({
            user: userId,
            basicProfile: basicProfile._id,
        });
        await doctor.save({ session });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Basic doctor info created and linked successfully.',
        };
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error('Error during adding basic doctor info:', error);
        throw new Error(`addBasicDoctorInfo failed: ${error.message}`);
    } finally {
        session.endSession();
    }
};

const updateBasicDoctorInfo = async (userId, basicDoctorInfo) => {
    try {
        const updatedProfile = await BasicProfile.findOneAndUpdate(
            { user: userId },
            { $set: basicDoctorInfo },
            { runValidators: true, strict: true }, 
        );

        if (!updatedProfile) {
        throw new Error("Basic doctor info not found for this user.");
        }

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
            throw new Error('Please add basic profile before adding professional details.');
        }

        const detailsObj = existingDoctorDetails.professionalDetails?.toObject?.() ?? {};
        if (!isEmptyDeep(detailsObj)) {
            throw new Error("Professional details already added");
        } 

        existingDoctorDetails.professionalDetails = professionalDetailsData;
        await existingDoctorDetails.save();
        return { success: true, message: `Professional details added successfully.` };

    } catch (error) {
        console.error('Error during adding professsional details:', error);
        throw new Error(error.message || 'addProfessionalDetails failed');
    }
};

const updateProfessionalDetails = async (userId, professionalDetailsData) => {
    try {
        const doctorDetails = await Doctor.findOne({ user: userId, professionalDetails: { $exists: true, $ne: {} } });

        if (!doctorDetails) {
        throw new Error("Doctor profile or professional details not found. Please add them before updating");
        }

        const {professionalDetails} = doctorDetails; 
        for (const [k, v] of Object.entries(professionalDetailsData)) { professionalDetails[k] = v; }

        // doctorDetails.markModified('professionalDetails');
        // doctorDetails.markModified('professionalDetails.experience');

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
            throw new Error('Please add basic profile before adding credentials.');
        }

        const detailsObj = existingDoctorDetails.credentials?.toObject?.() ?? {};
        if (!isEmptyDeep(detailsObj)) {
            throw new Error("Credentials already added");
        } 

        existingDoctorDetails.credentials = credentialsData;
        await existingDoctorDetails.save();
        return { success: true, message: `Credentials added successfully.` };

    } catch (error) {
        console.error('Error during adding credentials:', error);
        throw new Error(error.message || 'addCredentials failed');
    }
};


const updateCredentials = async (userId, credentialsData) => {
    try {
        const doctorDetails = await Doctor.findOne({ user: userId, credentials: { $exists: true, $ne: {} } });

        if (!doctorDetails) {
        throw new Error("Doctor profile or credentials not found. Please add them before updating");
        }

        const {credentials} = doctorDetails; 
        for (const [k, v] of Object.entries(credentialsData)) { credentials[k] = v; }
        
        // doctorDetails.markModified('credentials');
        // doctorDetails.markModified('credentials.education');
        // doctorDetails.markModified('credentials.certifications');

        await doctorDetails.save();

        return { success: true, message: "Credentials updated successfully." };
    } catch (error) {
        console.error("Error in updateCredentials service:", error);
        throw new Error(error.message || "Unable to update credentials");
    }
};

//availability


const addAvailabilityDetails = async (userId, availabilityDetails) => {
    try {
        console.log('Inside addAvailabilityDetails service:', 'data:',availabilityDetails, 'and id:', userId);
        let existingDoctorDetails = await Doctor.findOne({ user: userId });

        if (!existingDoctorDetails) {
            throw new Error('Please add basic profile before adding availability details.');
        }

        const detailsObj = existingDoctorDetails.availability?.toObject?.() ?? {};
        if (!isEmptyDeep(detailsObj)) {
            throw new Error("Availability details already added");
        } 

        existingDoctorDetails.availability = availabilityDetails;
        await existingDoctorDetails.save();
        return { success: true, message: `Availability details added successfully.` };

    } catch (error) {
        console.error('Error during adding availability details:', error);
        throw new Error(error.message || 'addAvailabilityDetails failed');
    }
};


const updateAvailabilityDetails = async (userId, availabilityDetails) => {
    try {
        const doctorDetails = await Doctor.findOne({ user: userId, availability: { $exists: true, $ne: {} } });

        if (!doctorDetails) {
        throw new Error("Doctor profile or availability not found. Please add them before updating");
        }

        const {availability} = doctorDetails; 
        for (const [k, v] of Object.entries(availabilityDetails)) { availability[k] = v; }
        
        // doctorDetails.markModified('availability');
        // doctorDetails.markModified('availability.appiontmentTimeSlots');
        // doctorDetails.markModified('availability.workplaces');

        await doctorDetails.save();

        return { success: true, message: "Availability details updated successfully." };
    } catch (error) {
        console.error("Error in updateAvailabilityDetails service:", error);
        throw new Error(error.message || "Unable to update availability details");
    }
};


//communitiesToJoin

const addJoinedCommunitiesArray = async (userId, joinedCommunitiesArray) => {
    try {
        console.log('Inside addJoinedCommunities service:', 'data:',joinedCommunitiesArray, 'and id:', userId);
        let existingDoctorDetails = await Doctor.findOne({ user: userId });

        if (!existingDoctorDetails) {
            throw new Error('Please add basic profile before adding communities.');
        }
        if (existingDoctorDetails.joinedCommunities) {
            existingDoctorDetails.joinedCommunities = [
                ...new Set([...existingDoctorDetails.joinedCommunities, ...joinedCommunitiesArray])
            ];
            await existingDoctorDetails.save();
            return { success: true, message: `Joined communities added successfully.` };
        }
    } catch (error) {
        console.error('Error during adding joined communities:', error);
        throw new Error(error.message || 'addCommunitiesToJoin failed');
    }
};


const leaveCommunities = async (userId, leftCommunitiesArray) => {
    try {
        console.log('Inside leaveCommunities service:', 'data:', leftCommunitiesArray, 'and id:', userId);

        const existingDoctorDetails = await Doctor.findOne({ user: userId });
        if (!existingDoctorDetails) {
            throw new Error('Doctor profile not found');
        }

        if (Array.isArray(existingDoctorDetails.joinedCommunities) && existingDoctorDetails.joinedCommunities.length > 0) {
            existingDoctorDetails.joinedCommunities = existingDoctorDetails.joinedCommunities.filter(
                (community) => !leftCommunitiesArray.includes(community)
            );

            await existingDoctorDetails.save();
            return { success: true, message: 'Communities left successfully.' };
        }

        return { success: false, message: 'No joined communities found.' };

    } catch (error) {
        console.error('Error during leaving communities:', error);
        throw new Error(error.message || 'leaveCommunities failed');
    }
};



//final touches

const addFinalTouches = async (userId, finalTouchesData) => {
    try {
        console.log('Inside addFinalTouches service:', 'data:',finalTouchesData, 'and id:', userId);
        let existingDoctorDetails = await Doctor.findOne({ user: userId });

        if (!existingDoctorDetails) {
            throw new Error('Please add basic profile before adding final touches.');
        }

        const detailsObj = existingDoctorDetails.finalTouches?.toObject?.() ?? {};
        if (!isEmptyDeep(detailsObj)) {
            throw new Error("Final touches already added");
        } 

        existingDoctorDetails.finalTouches = finalTouchesData;
        await existingDoctorDetails.save();
        return { success: true, message: `Final touches added successfully.` };

    } catch (error) {
        console.error('Error during adding final touches:', error);
        throw new Error(error.message || 'addFinalTouches failed');
    }
};


const updateFinalTouches = async (userId, finalTouchesData) => {
    try {
        const doctorDetails = await Doctor.findOne({ user: userId, finalTouches: { $exists: true, $ne: {} } });

        if (!doctorDetails) {
            throw new Error("Doctor profile or final touches not found. Please add them before updating");
        }

        const {finalTouches} = doctorDetails; 

        for (const [section, values] of Object.entries(finalTouchesData)) {
            if (finalTouches[section] !== undefined) {
                if (typeof values === 'object' && values !== null) {
                for (const [key, val] of Object.entries(values)) {
                    finalTouches[section][key] = val;
                }
                // doctorDetails.markModified(`finalTouches.${section}`);
                }
            } else {
                throw new Error(`Final touches section '${section}' does not exist.`);
            }
        }

        await doctorDetails.save();

        return { success: true, message: "Final touches updated successfully." };
    } catch (error) {
        console.error("Error in updateFinalTouches service:", error);
        throw new Error(error.message || "Unable to update final touches");
    }
};

module.exports = {
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
};


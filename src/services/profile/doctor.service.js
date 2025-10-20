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
        const doctorDetails = await Doctor.findOne({ user: userId, professionalDetails: { $exists: true, $ne: {} } });

        if (!doctorDetails) {
        throw new Error("Doctor profile or professional details not found. Please add them before updating");
        }

        const {professionalDetails} = doctorDetails; 
        for (const [k, v] of Object.entries(professionalDetailsData)) { professionalDetails[k] = v; }

        doctorDetails.markModified('professionalDetails');
        doctorDetails.markModified('professionalDetails.experience');

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
        const doctorDetails = await Doctor.findOne({ user: userId, credentials: { $exists: true, $ne: {} } });

        if (!doctorDetails) {
        throw new Error("Doctor profile or credentials not found. Please add them before updating");
        }

        const {credentials} = doctorDetails; 
        for (const [k, v] of Object.entries(credentialsData)) { credentials[k] = v; }
        
        doctorDetails.markModified('credentials');
        doctorDetails.markModified('credentials.education');
        doctorDetails.markModified('credentials.certifications');

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
            const doctorDetails = new Doctor({
            user: userId,
            availability: availabilityDetails,
            });
            await doctorDetails.save();
            return { success: true, message: `Availability details added successfully.` };
        }
        if (existingDoctorDetails.availability &&  Object.keys(existingDoctorDetails.availability.toObject()).length > 0) {
            throw new Error('Availability details already added');
        } else {
            existingDoctorDetails.availability = availabilityDetails;
            await existingDoctorDetails.save();
            return { success: true, message: `Availability details added successfully.` };
        }
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
        
        doctorDetails.markModified('availability');
        doctorDetails.markModified('availability.appiontmentTimeSlots');
        doctorDetails.markModified('availability.workplaces');

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
            const doctorDetails = new Doctor({
            user: userId,
            joinedCommunities: joinedCommunitiesArray,
            });
            await doctorDetails.save();
            return { success: true, message: `Joined communities added successfully.` };
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
            const doctorDetails = new Doctor({
            user: userId,
            finalTouches: finalTouchesData,
            });
            await doctorDetails.save();
            return { success: true, message: `Final touches added successfully.` };
        }
        if (existingDoctorDetails.finalTouches &&  Object.keys(existingDoctorDetails.finalTouches.toObject()).length > 0) {
            throw new Error('Final touches already added');
        } else {
            existingDoctorDetails.finalTouches = finalTouchesData;
            await existingDoctorDetails.save();
            return { success: true, message: `Final touches added successfully.` };
        }
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
                doctorDetails.markModified(`finalTouches.${section}`);
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


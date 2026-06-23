const BasicProfile = require('models/basicProfile.model');
const mongoose = require('mongoose');
const Patient = require('models/patient.model');
const {
  finalTouchesModel: { finalTouchesSchema },
  healthInterestsModel: {healthInterestsSchema},
  privacyPreferencesModel: {privacyPreferencesSchema}
} = require('models/profileSubModels/patient');

const { isEmptyDeep } = require('utils/basic.utils');

const addBasicPatientInfo = async(userId, basicPatientInfo)=> {
    const session = await mongoose.startSession();
    
        try {
            session.startTransaction();
    
            console.log('Inside addBasicPatientInfo service:', { userId, basicPatientInfo });
    
            const existingProfile = await BasicProfile.findOne({ user: userId }).session(session);
            if (existingProfile) {
                throw new Error('Basic patient info already registered.');
            }
    
            const basicProfile = new BasicProfile({
                user: userId,
                ...basicDoctorInfo,
            });
            await basicProfile.save({ session });
    
            const patient = new Patient({
                user: userId,
                basicProfile: basicProfile._id,
            });
            await patient.save({ session });
    
            await session.commitTransaction();
    
            return {
                success: true,
                message: 'Basic patient info created and linked successfully.',
            };
        } catch (error) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
    
            console.error('Error during adding basic patient info:', error);
            throw new Error(`addBasicPatientInfo failed: ${error.message}`);
        } finally {
            session.endSession();
        }
}


const updateBasicPatientInfo = async (userId, basicPatientInfo) => {
    try {
        const updatedProfile = await BasicProfile.findOneAndUpdate(
            { user: userId },
            { $set: basicPatientInfo },
            { runValidators: true, strict: true }, 
        );

        if (!updatedProfile) {
        throw new Error("Basic patient info not found for this user.");
        }

        return { success: true, message: `Basic Patient Info updated successfully.` };
        } catch (error) {
        console.error("Error in updateBasicPatientInfo service:", error);
        throw new Error(error.message || "Unable to update basic patient info");
    }
};

const addHealthInterests = async(userId, healthInterestsData)=> {
    try {
        console.log("Inside addHealthInterests service")
        const existingPatientDetails = await Patient.findOne({user: userId, healthInterests: {exists: true}});
        if (!existingPatientDetails){
            throw new Error("Please add basic profile before adding health interests.")
        }
        const detailsObj = existingPatientDetails?.toObject?.() || {}
        if (!isEmptyDeep(detailsObj.healthInterests)){
            throw new Error("Health interests already added.")
        }
        existingPatientDetails.healthInterests = healthInterestsData;
        await existingPatientDetails.save();

        return { success: true, message: `Health interests added successfully.` };
    }catch(error){
        console.error("Error in addHealthInterests service:", error);
        throw new Error(error.message || "Unable to add health interests.")
    }
}

const updateHealthInterests = async(userId, healthInterestsData, updateData)=> {
    try {
        console.log("Inside updateHealthInterests service");
        // Object.keys(healthInterestsData).forEach(key=>
        //     {
        //         if(!(key in healthInterestsSchema.paths)){
        //             throw new Error(`Invalid key ${key}`)
        //         }
        //         setObj[`healthInterests.${key}`] = healthInterestsData[key]
        //     }
        // )
        const patientDetails = await Patient.findOneAndUpdate(
            {user: userId}, 
            {$set: updateData},
            {
                runValidators: true,
                strict: true,
                new: true
            }
        );

        if (!patientDetails){
            throw new Error("Basic profile not added for this user.")
        }

        return { success: true, message: `Health interests updated successfully.` };

    }catch(error){
        console.error("Error in updateHealthInterests service:", error);
        throw new Error(error.message || "Unable to update health interests.")
    }
}

const addPrivacyPreferences = async(userId, privacyPreferencesData)=> {
    try{
        console.log("inside addPrivacyPreferences service");
        const existingPatientDetails = Patient.findOne({user: userId, privacyPreferences: {$exists: true}})
        if (!existingPatientDetails){
            throw new Error("Please add basic profile before adding privacy preferences.")
        }
        const detailsObj = existingPatientDetails?.privacyPreferences?.toObject?.() || {};

        if(!isEmptyDeep(detailsObj)){
            throw new Error("Privacy preferences already added.");
        }

        existingPatientDetails.privacyPreferences = privacyPreferencesData;

        await existingPatientDetails.save();

        return { success: true, message: `Privacy preferences added successfully.` };

    }catch(error){
         console.error("Error in addPrivacyPreferences service:", error);
        throw new Error(error.message || "Unable to update privacy preferences.")
    }
}

const updatePrivacyPreferences = async(userId, privacyPreferencesData, updateData)=> {
    try {
        console.log("Inside updateprivacyPreferences service");
        
        // Object.keys(privacyPreferencesData).forEach(key=>{
        //         if(!(key in privacyPreferencesSchema.paths)){
        //         throw new Error(`Invalid key ${key}`)
        //         }
        //         setObj[`privacyPreferences.${key}`] = privacyPreferencesData[key]
        //     }
        // )
        const patientDetails = await Patient.findOneAndUpdate(
            {user: userId}, 
            {$set: updateData},
            {
                runValidators: true,
                strict: true,
                new: true
            }
        );

        if (!patientDetails){
            throw new Error("Basic profile not added for this user.")
        }
        return { success: true, message: `Privacy preferences updated successfully.` };

    }catch(error){
        console.error("Error in updatePrivacyPreferences service:", error);
        throw new Error(error.message || "Unable to update privacy preferences.")
    }
}


const addPatientFinalTouches = async (userId, finalTouchesData) => {
    try {
        console.log('Inside addPatientFinalTouches service:', 'data:',finalTouchesData, 'and id:', userId);
        let existingPatientDetails = await Patient.findOne({ user: userId });

        if (!existingPatientDetails) {
            throw new Error('Please add basic profile before adding final touches.');
        }

        const detailsObj = existingPatientDetails.finalTouches?.toObject?.() ?? {};
        if (!isEmptyDeep(detailsObj)) {
            throw new Error("Final touches already added");
        } 

        existingPatientDetails.finalTouches = finalTouchesData;
        await existingPatientDetails.save();
        return { success: true, message: `Final touches added successfully.` };

    } catch (error) {
        console.error('Error during adding final touches:', error);
        throw new Error(error.message || 'addFinalTouches failed');
    }
};

const updatePatientFinalTouches = async (userId, finalTouchesData, updateData) => {
    try{
        console.log("Inside updatePatientFinalTouches service.");

        // const updatedFields = {};
        // for(const [key, value] of Object.entries(finalTouchesData)){
        //     if (!(key in finalTouchesSchema.paths)){
        //         throw new Error(`Invalid key:${key}`)
        //     }
        //     for (const [subKey, subValue] of Object.keys(value)){
        //         if(!(subKey in finalTouchesSchema.paths[key].schema.paths)){
        //             throw new Error(`Invalid subKey: ${subKey}`)
        //         }
        //         updatedFields[`finalTouches.${key}.${subKey}`] = subValue
        //     }
        // }

        const patientDetails = Patient.findOneAndUpdate(
            {user: userId},
            {$set: updateData},
            {
                runValidators: true,
                new: true,
                strict: true
            }
        );

        if (!patientDetails){
            throw new Error("Basic profile not added for this user.")
        }
        return { success: true, message: `Patient's final touches updated successfully.` };

        }catch(error){
            console.error("Error in updatePatientFinalTouches service:", error);
            throw new Error(error.message || "Unable to update patient's final touches.")
        }
}

const addJoinedCommunitiesArray = async (userId, joinedCommunitiesArray) => {
    try {
        console.log('Inside addJoinedCommunities service:', 'data:',joinedCommunitiesArray, 'and id:', userId);
        let existingPatientDetails = await Patient.findOne({ user: userId });

        if (!existingPatientDetails) {
            throw new Error('Please add basic profile before adding communities.');
        }
        if (existingPatientDetails.joinedCommunities) {
            existingPatientDetails.joinedCommunities = [
                ...new Set([...existingPatientDetails.joinedCommunities, ...joinedCommunitiesArray])
            ];
            await existingPatientDetails.save();
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

        const existingPatientDetails = await Patient.findOne({ user: userId });
        if (!existingPatientDetails) {
            throw new Error('Patient profile not found');
        }

        if (Array.isArray(existingPatientDetails.joinedCommunities) && existingPatientDetails.joinedCommunities.length > 0) {
            existingPatientDetails.joinedCommunities = existingPatientDetails.joinedCommunities.filter(
                (community) => !leftCommunitiesArray.includes(community)
            );

            await existingPatientDetails.save();
            return { success: true, message: 'Communities left successfully.' };
        }

        return { success: false, message: 'No joined communities found.' };

    } catch (error) {
        console.error('Error during leaving communities:', error);
        throw new Error(error.message || 'leaveCommunities failed');
    }
};

module.exports = {
    addBasicPatientInfo,
    updateBasicPatientInfo,
    addHealthInterests,
    updateHealthInterests,
    addPrivacyPreferences,
    updatePrivacyPreferences,
    addPatientFinalTouches,
    updatePatientFinalTouches,
    addJoinedCommunitiesArray,
    leaveCommunities
}


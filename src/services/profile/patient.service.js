const BasicProfile = require('models/basicProfile.model');
const mongoose = require('mongoose');
const Patient = require('models/patient.model');
const {
  finalTouchesModel: { finalTouchesSchema },
  healthInterestsModel: {healthInterestsSchema},
  privacyPreferencesModel: {privacyPreferencesSchema}
} = require('models/profileChunks/patient');

const AppError = require('utils/appError.utils');

const { isEmptyDeep } = require('utils/basic.utils');

const addBasicPatientInfo = async(userId, basicPatientInfo)=> {
    const session = await mongoose.startSession();
    
        try {
            session.startTransaction();
    
            console.log('Inside addBasicPatientInfo service:', { userId, basicPatientInfo });
    
            const existingProfile = await BasicProfile.findOne({ user: userId }).session(session);
            if (existingProfile) {
                throw new AppError(
                    'Basic patient info already registered.',
                    409,
                    'BASIC_PATIENT_INFO_ALREADY_ADDED'
                );
            }
    
            const basicProfile = new BasicProfile({
                user: userId,
                ...basicPatientInfo,
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
                if (error instanceof AppError) {
                throw error;
            }

            throw new AppError(
                'Unable to add basic patient info.',
                500,
                'ADD_BASIC_PATIENT_INFO_FAILED'
            );
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
            throw new AppError(
                "Basic patient info not found for this user.",
                409,
                "BASIC_PATIENT_INFO_NOT_FOUND"
            );
        }

        return { success: true, message: `Basic Patient Info updated successfully.` };
        } catch (error) {
        console.error("Error in updateBasicPatientInfo service:", error);
        throw new Error(error.message || "Unable to update basic patient info");
    }
};

const addHealthInterests = async(userId, healthInterestsData)=> {
    console.log("Inside addHealthInterests service")
    const existingPatientDetails = await Patient.findOne({user: userId});
    if (!existingPatientDetails){
        throw new AppError(
            "Please add basic profile before adding health interests.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }
    // const detailsObj = existingPatientDetails?.toObject?.() || {}
    if (existingPatientDetails.healthInterests){
        throw new AppError(
            "Health interests already added.",
            409,
            'HEALTH_INTERESTS_ALREADY_ADDED'
        )
    }
    existingPatientDetails.healthInterests = healthInterestsData;
    await existingPatientDetails.save();

    return { success: true, message: `Health interests added successfully.` };
}

const updateHealthInterests = async(userId, updateData)=> {
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
        throw new AppError(
            "Basic profile not added for this user.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    return { success: true, message: `Health interests updated successfully.` };
}

const addPrivacyPreferences = async(userId, privacyPreferencesData)=> {
    console.log("inside addPrivacyPreferences service");
    const existingPatientDetails = await Patient.findOne({user: userId})
    if (!existingPatientDetails){
        throw new AppError(
            "Please add basic profile before adding health interests.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }
    // const detailsObj = existingPatientDetails?.privacyPreferences?.toObject?.() || {};

    if(existingPatientDetails.privacyPreferences){
        throw new AppError(
            "Privacy preferences already added.",
            409,
            'PRIVACY_PREFERENCES_ALREADY_ADDED'
        )
    }

    existingPatientDetails.privacyPreferences = privacyPreferencesData;

    await existingPatientDetails.save();

    return { success: true, message: `Privacy preferences added successfully.` };

}


const updatePrivacyPreferences = async(userId, updateData)=> {
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
        throw new AppError(
            "Basic profile not added for this user.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }
    return { success: true, message: `Privacy preferences updated successfully.` };

}

const addPatientFinalTouches = async (userId, finalTouchesData) => {
    console.log('Inside addPatientFinalTouches service:', 'data:',finalTouchesData, 'and id:', userId);
    let existingPatientDetails = await Patient.findOne({ user: userId });

    if (!existingPatientDetails) {
        throw new AppError(
            "Please add basic profile before adding health interests.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    if (existingPatientDetails.finalTouches) {
        throw new AppError(
            "Final touches already added.",
            409,
            'FINAL_TOUCHES_ALREADY_ADDED'
        )
    } 

    existingPatientDetails.finalTouches = finalTouchesData;
    await existingPatientDetails.save();
    return { success: true, message: `Final touches added successfully.` };
} 

const updatePatientFinalTouches = async (userId, updateData) => {
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

    const patientDetails = await Patient.findOneAndUpdate(
        {user: userId},
        {$set: updateData},
        {
            runValidators: true,
            new: true,
            strict: true
        }
    );

    if (!patientDetails){
        throw new AppError(
            "Basic profile not added for this user.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }
    return { success: true, message: `Patient's final touches updated successfully.` };

}

const addJoinedCommunitiesArray = async (userId, communitiesArray) => {
    console.log('Inside addJoinedCommunities service:', 'data:',communitiesArray, 'and id:', userId);
    let existingPatientDetails = await Patient.findOne({ user: userId });

    if (!existingPatientDetails) {
        throw new AppError(
            "Please add basic profile before adding health interests.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }
    
    existingPatientDetails.communities = [
        ...new Set([...existingPatientDetails.communities, ...communitiesArray])
    ];
    await existingPatientDetails.save();
    return { success: true, message: `Joined communities added successfully.` };
} 


const leaveCommunities = async (userId, leftCommunitiesArray) => {
    console.log('Inside leaveCommunities service:', 'data:', leftCommunitiesArray, 'and id:', userId);

    const existingPatientDetails = await Patient.findOne({ user: userId });
    if (!existingPatientDetails) {
        throw new AppError(
            "Basic profile not added for this user.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    if (Array.isArray(existingPatientDetails.communities) && existingPatientDetails.communities.length > 0) {
        existingPatientDetails.communities = existingPatientDetails.communities.filter(
            (community) => !leftCommunitiesArray.includes(community)
        );

        await existingPatientDetails.save();
        return { success: true, message: 'Communities left successfully.' };
    }

    return { success: false, message: 'No joined communities found.' };

} 

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


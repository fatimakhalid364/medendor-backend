const { basicUtils } = require('utils');

const createFrozenEnumArray = basicUtils.createFrozenEnumArray;

const rolesArray = createFrozenEnumArray(['doctor', 'patient', 'admin', 'super-admin']);

const issuingAuthArray = createFrozenEnumArray(['PMC', 'SMC', 'NMC', 'GMC', 'other']);

const workPlaceStatusArray = createFrozenEnumArray(['current', 'previous']);

const genderArray = createFrozenEnumArray(['male', 'female', 'other']);

const mimeTypesArray = createFrozenEnumArray([
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/avif',
    'image/webp',
]);

const openToArray = createFrozenEnumArray([
    'collaborations',
    'jobOpportunities',
    'mentoring'
]);

const notifKeysArray = createFrozenEnumArray([
    'emailNotifications',
    'inAppNotifications',
    'newsletterUpdates',
    'allNotifications'
]);

const visibilityKeysArray = createFrozenEnumArray([
    'showContactInfo',
    'showEducation',
    'showWorkExperience',
    'showLanguagesSpoken',
    'showAvailabilityStatus'
]);

const communitiesArray = Object.freeze([
    'generalCare',
    'cardiovascularCare',
    'diabeticCare',
    'respiratoryCare',
    'renalCare',
    'cancerCare',
    'jointBoneMuscleCare',
    'mentalCare',
    'neurologicalCare',
    'childCare',
    'pregnancyCare'
]);

module.exports = {
    rolesArray,  
    issuingAuthArray, 
    workPlaceStatusArray,
    genderArray,
    mimeTypesArray,
    openToArray,
    notifKeysArray,
    visibilityKeysArray,
    communitiesArray
}
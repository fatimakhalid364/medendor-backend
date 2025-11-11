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

const communitiesArray = createFrozenEnumArray([
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

const specialtiesArray = createFrozenEnumArray([
    "Allergy & Immunology",
    "Anesthesiology",
    "Colon & Rectal Surgery",
    "Dermatology",
    "Emergency Medicine",
    "Family Medicine",
    "Internal Medicine",
    "Medical Genetics & Genomics",
    "Neurological Surgery",
    "Nuclear Medicine",
    "Obstetrics & Gynecology",
    "Ophthalmology",
    "Orthopaedic Surgery",
    "Otolaryngology",
    "Pathology",
    "Pediatrics",
    "Physical Medicine & Rehabilitation",
    "Plastic Surgery",
    "Preventive Medicine",
    "Psychiatry & Neurology",
    "Radiology",
    "Surgery",
    "Thoracic Surgery",
    "Urology",
    "Other Specialty"
]
);

const verificationStatusArray = createFrozenEnumArray(['pending', 'verified', 'rejected']);

const adminStatusArray = createFrozenEnumArray(['invited','active','suspended','disabled']);

module.exports = {
    rolesArray,  
    issuingAuthArray, 
    workPlaceStatusArray,
    genderArray,
    mimeTypesArray,
    openToArray,
    notifKeysArray,
    visibilityKeysArray,
    communitiesArray,
    verificationStatusArray,
    specialtiesArray,
    adminStatusArray
}
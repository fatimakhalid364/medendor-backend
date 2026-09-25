
const AppError = require('utils/appError.utils');


const validateIsDoctor = (req, res, next) => {
    const user = req.user; 
    console.log('Validating if user is doctor:', user);

    if (!user || user.role !== 'doctor') {
        return next(
            new AppError(
                'Only doctors an access this route',
                403,
                'INVALID_ROLE'
            )
        );
    }

    next();
}

const validateDoctorAge = (req, res, next) => {
    const {
        dateOfBirth
    } = req.body;

    if (dateOfBirth){
        const birthDate = new Date(dateOfBirth);

        if (Number.isNaN(birthDate.getTime())) {
            return next(
                new AppError(
                    'Invalid date of birth.',
                    400,
                    'INVALID_DATE_OF_BIRTH'
                )
            );
        }

        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        const hasHadBirthdayThisYear =
            today.getMonth() > birthDate.getMonth() ||
            (
                today.getMonth() === birthDate.getMonth() &&
                today.getDate() >= birthDate.getDate()
            );

        if (!hasHadBirthdayThisYear) {
            age--;
        }

        if (age < 25) {
            return next(
                new AppError(
                    'A doctor should be 25 years or older.',
                    400,
                    'INVALID_AGE'
                )
            );
        }
    } 

    

    next();
};



module.exports = {
    validateIsDoctor, 
    validateDoctorAge
};

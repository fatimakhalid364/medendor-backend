const validateIsDoctor = (req, res, next) => {
    const user = req.user; 

    if (!user || user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied. Only doctors can create, update or get doctor details.' });
    }

    next();
}

const validateDoctorData = (req, res, next) => {
    const {
        specialty,
        licenseNumber,
        experience,
        education,
        workplaces
    } = req.body;

    if (!specialty || !licenseNumber || !experience?.length || !education?.length || !workplaces?.length) {
        return res.status(400).json({ message: 'Missing required doctor details.' });
    }

    next();
};

module.exports = {validateIsDoctor, validateDoctorData}
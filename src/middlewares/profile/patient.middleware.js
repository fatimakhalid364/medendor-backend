

const validateIsPatient = (req, res, next) => {
    const user = req.user; 
    console.log('Validating if user is patient:', user);

    if (!user || user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied. Only patients can create, update or get patient details.' });
    }

    next();
}



module.exports = {validateIsPatient}
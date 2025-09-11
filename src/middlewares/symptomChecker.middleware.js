const validateSymptomsArray = (req, res, next) => {
    const { symptoms } = req.body;

    console.log("Validating symptoms input:", symptoms);

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({ message: "Symptoms must be a non-empty array" });
    }

    next(); 
};

module.exports = {validateSymptomsArray};
const {symptomCheckerServices: {getMatchingConditions}} = require('services');

const handleGetMatchingConditions = async(req, res) => {
    try {
        console.log('Handling getMatchingConditions request:', req.body);
        const {symptoms: symptomsArray} = req.body;
        const result = await getMatchingConditions(symptomsArray);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while fetching matching conditions',
        });
    }
}

module.exports = {handleGetMatchingConditions};
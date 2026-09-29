const {getCities} = require('services/locations.service')


const handleGetCities = async(req, res) => {

    console.log('inside handleGetCities controller');
    const countryCode = req.query.country;

    const result = await getCities(countryCode);

    res.status(200).json(result);
}

module.exports = handleGetCities;
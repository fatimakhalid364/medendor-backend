const Country = require("models/locations/country.model");
const City = require("models/locations/city.model");
const AppError = require('utils/appError.utils');

const getCities = async(countryCode) => {
    console.log('inside getCities service');

    const country = await Country.findOne({
        code: countryCode
    });

    if (!country){
        throw new AppError(
            'Country not found',
            404,
            'COUNTRY_NOT_FOUND'
        )
    }

    const countryId = country._id;

    const cities = await City.find({
        country: countryId
    })
        .select("_id name")
        .sort({ name: 1 })
        .lean();

    if (!cities?.length){
        throw new AppError(
            'No city found for this country',
            404,
            'NO_CITY_FOUND'
        )
    }

    const formattedCities = cities.map((city) => ({
        value: city._id.toString(),
        label: city.name
    }));

    return {
        success: true,
        code: 'CITIES_FOUND',
        message: 'Cities found successfully',
        cities: formattedCities
    }
}

module.exports = getCities

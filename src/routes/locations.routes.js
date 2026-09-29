const validate = require('middlewares/validation.middleware');
const {authenticateSession} = require('middlewares/auth.middleware');
const handleGetCities = require('controllers/locations.controller');
const getCitiesQuerySchema = require('validators/locations.zod');

router.use(authenticateSession);

router.get(
    '/cities',
    validate(getCitiesQuerySchema, 'query'),
    handleGetCities
)
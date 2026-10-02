const validate = require('middlewares/validation.middleware');
const {authenticateSession} = require('middlewares/auth.middleware');
const handleGetCities = require('controllers/locations.controller');
const getCitiesQuerySchema = require('validators/locations.zod');
const express = require('express');
const router = express.Router();

router.use(authenticateSession);

router.get(
    '/cities',
    validate(getCitiesQuerySchema, 'query'),
    handleGetCities
);

module.exports = router;
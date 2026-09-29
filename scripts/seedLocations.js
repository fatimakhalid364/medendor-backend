require('module-alias/register');
const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const mongoose = require("mongoose");
const {MONGO_URI} = require("config/env");

const Country = require("models/locations/country.model");
const State = require("models/locations/state.model");
const City = require("models/locations/city.model");

/*
 * --------------------------------------------------
 * Load compressed location dataset
 * --------------------------------------------------
 */

const locationsPath = path.join(
  __dirname,
  "../data/seedData/locations.json.gz"
);

const compressed = fs.readFileSync(locationsPath);

const json = zlib
  .gunzipSync(compressed)
  .toString("utf8");

const locationsData = JSON.parse(json);

if (!Array.isArray(locationsData)) {
  throw new Error(
    "Invalid locations dataset: expected an array of countries."
  );
}

const countriesData = locationsData;

/*
 * --------------------------------------------------
 * Seed locations
 * --------------------------------------------------
 */

const seedLocations = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("Connected to MongoDB");

    /*
     * --------------------------------------------------
     * 1. Countries
     * --------------------------------------------------
     */

    const countryOperations = countriesData.map((country) => ({
      updateOne: {
        filter: {
          code: country.iso2,
        },

        update: {
          $set: {
            code: country.iso2,
            name: country.name,
          },
        },

        upsert: true,
      },
    }));

    if (countryOperations.length > 0) {
      await Country.bulkWrite(countryOperations, {
        ordered: false,
      });
    }

    console.log(
      `Seeded ${countryOperations.length} countries.`
    );

    /*
     * --------------------------------------------------
     * 2. Build country lookup
     * --------------------------------------------------
     */

    const countries = await Country.find({})
      .select("_id code")
      .lean();

    const countryMap = new Map(
      countries.map((country) => [
        country.code,
        country._id,
      ])
    );

    /*
     * --------------------------------------------------
     * 3. States
     * --------------------------------------------------
     */

    const stateOperations = [];

    for (const country of countriesData) {
      const countryId = countryMap.get(country.iso2);

      if (!countryId) {
        console.warn(
          `Skipping states for country "${country.name}" because the country was not found.`
        );

        continue;
      }

      const states = country.states || [];

      for (const state of states) {
        /*
         * DR5HN uses "iso2" for the state's code.
         */

        if (!state.iso2) {
          console.warn(
            `Skipping state "${state.name}" in "${country.name}" because it has no ISO2 code.`
          );

          continue;
        }

        stateOperations.push({
          updateOne: {
            filter: {
              country: countryId,
              code: state.iso2,
            },

            update: {
              $set: {
                country: countryId,
                code: state.iso2,
                name: state.name,
              },
            },

            upsert: true,
          },
        });
      }
    }

    if (stateOperations.length > 0) {
      await State.bulkWrite(stateOperations, {
        ordered: false,
      });
    }

    console.log(
      `Processed ${stateOperations.length} states.`
    );

    /*
     * --------------------------------------------------
     * 4. Build state lookup
     * --------------------------------------------------
     */

    const states = await State.find({})
      .select("_id country code")
      .lean();

    const stateMap = new Map(
      states.map((state) => [
        `${state.country.toString()}:${state.code}`,
        state._id,
      ])
    );

    /*
     * --------------------------------------------------
     * 5. Cities
     * --------------------------------------------------
     */

    const cityOperations = [];

    for (const country of countriesData) {
      const countryId = countryMap.get(country.iso2);

      if (!countryId) {
        continue;
      }

      const states = country.states || [];

      for (const state of states) {
        if (!state.iso2) {
          continue;
        }

        const stateId = stateMap.get(
          `${countryId.toString()}:${state.iso2}`
        );

        if (!stateId) {
          console.warn(
            `Skipping cities for state "${state.name}" because the state was not found.`
          );

          continue;
        }

        const cities = state.cities || [];

        for (const city of cities) {
          cityOperations.push({
            updateOne: {
              filter: {
                state: stateId,
                name: city.name,
              },

              update: {
                $set: {
                  country: countryId,
                  state: stateId,
                  name: city.name,
                },
              },

              upsert: true,
            },
          });
        }
      }
    }

    /*
     * --------------------------------------------------
     * 6. Write cities in batches
     * --------------------------------------------------
     */

    const BATCH_SIZE = 1000;

    for (
      let i = 0;
      i < cityOperations.length;
      i += BATCH_SIZE
    ) {
      const batch = cityOperations.slice(
        i,
        i + BATCH_SIZE
      );

      await City.bulkWrite(batch, {
        ordered: false,
      });

      console.log(
        `Processed cities: ${Math.min(
          i + BATCH_SIZE,
          cityOperations.length
        )}/${cityOperations.length}`
      );
    }

    console.log(
      `Successfully processed ${cityOperations.length} cities.`
    );

    console.log("Location seeding completed.");
  } catch (error) {
    console.error(
      "Location seeding failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedLocations();


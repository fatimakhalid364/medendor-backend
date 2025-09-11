require('module-alias/register');
const mongoose = require("mongoose");
const { db } = require("config");
const {conditions: Conditions} = require("models");
const conditions = require("../jsonData/conditions.json");

const seedDB = async () => {
    try {
        const connection = db.connection;
        await connection(); 

        await Conditions.deleteMany();
        console.log("🧹 Cleared existing conditions");

        await Conditions.insertMany(conditions);
        console.log("🌱 Inserted new conditions");

    } catch (err) {
        console.error("❌ Seeding error:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from DB");
    }
};

seedDB();

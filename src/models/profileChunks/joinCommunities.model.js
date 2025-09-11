const mongoose = require('mongoose');

const joinCommunitiesSchema = new mongoose.Schema({
    joinedCommunities: {
        type: [String],
        default: [],
    }
}, { _id: false });

module.exports = { joinCommunitiesSchema };

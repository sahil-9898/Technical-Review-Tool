const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    name: String,
    createdAt: {type : String, default : new Date().toLocaleString()},
    objective: String,
    panelMembers: [{
        name: String,
        comment: {
            comment: String,
            severity: String,
            status: String,
            changeDesc: String,
            commitLink: String,
        }
    }]
});

module.exports = mongoose.model("review", reviewSchema);
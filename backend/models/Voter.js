const mongoose = require("mongoose");

const VoterSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  // Store voted positions as a map of positionId -> true
  hasVoted: { 
    type: Map, 
    of: Boolean, 
    default: new Map()
  }
});

module.exports = mongoose.model("Voter", VoterSchema);

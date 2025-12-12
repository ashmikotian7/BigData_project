const mongoose = require("mongoose");

const VoteActivitySchema = new mongoose.Schema({
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: "Voter", required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
  positionId: { type: mongoose.Schema.Types.ObjectId, ref: "Position", required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VoteActivity", VoteActivitySchema);
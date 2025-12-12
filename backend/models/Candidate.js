const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  name: String,
  party: String,
  manifesto: String,
  photoUrl: String,
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  positionId: { type: mongoose.Schema.Types.ObjectId, ref: "Position", required: true },
  votes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Candidate", CandidateSchema);

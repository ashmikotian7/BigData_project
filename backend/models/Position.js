const mongoose = require("mongoose");

const PositionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  voteEndTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Position", PositionSchema);
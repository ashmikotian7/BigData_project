const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  positions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Position" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Group", GroupSchema);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Import routes
const candidateRoutes = require('./routes/candidateRoutes');
const voterRoutes = require('./routes/voterRoutes');
const voteRoutes = require('./routes/voteRoutes');
const groupRoutes = require('./routes/groupRoutes');
const positionRoutes = require('./routes/positionRoutes');

// Use routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/auth', voterRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/positions', positionRoutes);

// Simple test route
app.get("/", (req, res) => {
  res.send("Backend running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
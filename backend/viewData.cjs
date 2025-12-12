const mongoose = require('mongoose');
require('dotenv').config();

// Models
const Candidate = require('./models/Candidate');
const Voter = require('./models/Voter');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Fetch all candidates
    const candidates = await Candidate.find({});
    console.log('\n=== CANDIDATES ===');
    console.log(candidates);
    
    // Fetch all voters
    const voters = await Voter.find({});
    console.log('\n=== VOTERS ===');
    console.log(voters);
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
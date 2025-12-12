const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Voter = require('../models/Voter');

// Helper function to generate JWT token
const generateToken = (voterId) => {
  return jwt.sign({ voterId }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '24h'
  });
};

// POST /api/auth/register - Register a new voter
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Check if voter already exists
    const existingVoter = await Voter.findOne({ email });
    if (existingVoter) {
      return res.status(400).json({ message: 'Voter with this email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create new voter
    const voter = new Voter({
      name,
      email,
      passwordHash
    });
    
    const savedVoter = await voter.save();
    
    // Generate token
    const token = generateToken(savedVoter._id);
    
    res.status(201).json({
      token,
      voter: {
        id: savedVoter._id,
        name: savedVoter.name,
        email: savedVoter.email
      }
    });
  } catch (error) {
    console.error('Error registering voter:', error);
    res.status(500).json({ message: 'Server error while registering voter' });
  }
});

// POST /api/auth/login - Login a voter
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find voter
    const voter = await Voter.findOne({ email });
    if (!voter) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, voter.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(voter._id);
    
    res.json({
      token,
      voter: {
        id: voter._id,
        name: voter.name,
        email: voter.email
      }
    });
  } catch (error) {
    console.error('Error logging in voter:', error);
    res.status(500).json({ message: 'Server error while logging in voter' });
  }
});

// GET /api/voters/profile - Get voter profile
router.get('/profile', async (req, res) => {
  try {
    // Extract voter ID from token (assuming it's added by auth middleware)
    const voterId = req.voterId;
    
    const voter = await Voter.findById(voterId).select('-passwordHash');
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    res.json(voter);
  } catch (error) {
    console.error('Error fetching voter profile:', error);
    res.status(500).json({ message: 'Server error while fetching voter profile' });
  }
});

module.exports = router;
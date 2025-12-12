const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const Candidate = require('../models/Candidate');
const Voter = require('../models/Voter');

// Middleware to verify JWT token
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.voterId = decoded.voterId;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// POST /api/votes - Cast a vote
router.post('/', authenticate, voteController.castVote);

// GET /api/votes/results/:positionId - Get voting results for a position
router.get('/results/:positionId', voteController.getResultsByPosition);

// GET /api/votes/public-results/:positionId - Get public voting results for a position
router.get('/public-results/:positionId', voteController.getPublicResultsByPosition);

// GET /api/votes/my-positions - Get positions voted by current user
router.get('/my-positions', authenticate, voteController.getVoterPositions);

module.exports = router;
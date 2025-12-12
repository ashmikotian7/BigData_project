const Candidate = require("../models/Candidate");
const Voter = require("../models/Voter");
const Position = require("../models/Position");
const VoteActivity = require("../models/VoteActivity");
const Group = require("../models/Group");

// Cast a vote
exports.castVote = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const voterId = req.voterId; // Set by auth middleware
    
    // Validation
    if (!candidateId) {
      return res.status(400).json({ message: 'Candidate ID is required' });
    }
    
    // Check if candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Get position and group info
    const position = await Position.findById(candidate.positionId);
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    const group = await Group.findById(candidate.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if voting period has ended
    const now = new Date();
    if (now > position.voteEndTime) {
      return res.status(400).json({ message: 'Voting period for this position has ended' });
    }
    
    // Check if voter has already voted for this position
    const voter = await Voter.findById(voterId);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    // Check if voter has already voted for this position
    if (voter.hasVoted.get(position._id.toString())) {
      return res.status(400).json({ message: 'You have already voted for this position' });
    }
    
    // Record the vote
    const voteActivity = new VoteActivity({
      voterId,
      candidateId,
      positionId: position._id,
      groupId: group._id
    });
    
    await voteActivity.save();
    
    // Increment candidate votes
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { votes: 1 } },
      { new: true }
    );
    
    // Mark voter as having voted for this position
    voter.hasVoted.set(position._id.toString(), true);
    await voter.save();
    
    res.json({
      message: 'Vote cast successfully',
      candidate: updatedCandidate
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ message: 'Server error while casting vote' });
  }
};

// Get voting results for a position
exports.getResultsByPosition = async (req, res) => {
  try {
    const { positionId } = req.params;
    
    // Get position
    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    // Get all candidates for this position
    const candidates = await Candidate.find({ positionId }).sort({ votes: -1 });
    
    // Calculate total votes for this position
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    
    // Add percentage to each candidate
    const candidatesWithPercentage = candidates.map(candidate => ({
      ...candidate.toObject(),
      percentage: totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0
    }));
    
    // Determine winners
    let winners = [];
    if (candidatesWithPercentage.length > 0) {
      const maxVotes = candidatesWithPercentage[0].votes;
      winners = candidatesWithPercentage.filter(candidate => candidate.votes === maxVotes);
    }
    
    // Check if voting has ended
    const now = new Date();
    const votingEnded = now > position.voteEndTime;
    
    res.json({
      position,
      candidates: candidatesWithPercentage,
      winners,
      totalVotes,
      votingEnded
    });
  } catch (error) {
    console.error('Error fetching voting results:', error);
    res.status(500).json({ message: 'Server error while fetching voting results' });
  }
};

// Get public results for a position (after voting ends)
exports.getPublicResultsByPosition = async (req, res) => {
  try {
    const { positionId } = req.params;
    
    // Get position
    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    // Check if voting has ended
    const now = new Date();
    const votingEnded = now > position.voteEndTime;
    
    if (!votingEnded) {
      return res.status(400).json({ message: 'Voting period for this position has not ended yet' });
    }
    
    // Get all candidates for this position
    const candidates = await Candidate.find({ positionId }).sort({ votes: -1 });
    
    // Calculate total votes for this position
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    
    // Add percentage to each candidate
    const candidatesWithPercentage = candidates.map(candidate => ({
      ...candidate.toObject(),
      percentage: totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0
    }));
    
    // Determine winners
    let winners = [];
    if (candidatesWithPercentage.length > 0) {
      const maxVotes = candidatesWithPercentage[0].votes;
      winners = candidatesWithPercentage.filter(candidate => candidate.votes === maxVotes);
    }
    
    res.json({
      position,
      candidates: candidatesWithPercentage,
      winners,
      totalVotes,
      votingEnded
    });
  } catch (error) {
    console.error('Error fetching public voting results:', error);
    res.status(500).json({ message: 'Server error while fetching voting results' });
  }
};

// Get voter's voted positions
exports.getVoterPositions = async (req, res) => {
  try {
    const voterId = req.voterId; // Set by auth middleware
    
    const voter = await Voter.findById(voterId);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    // Return the positions the voter has voted for
    const votedPositions = Array.from(voter.hasVoted.keys());
    res.json({ votedPositions });
  } catch (error) {
    console.error('Error fetching voter positions:', error);
    res.status(500).json({ message: 'Server error while fetching voter positions' });
  }
};
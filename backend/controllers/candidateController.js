const Candidate = require("../models/Candidate");
const Group = require("../models/Group");
const Position = require("../models/Position");

// Get all candidates
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ name: 1 });
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Server error while fetching candidates' });
  }
};

// Create a new candidate
exports.createCandidate = async (req, res) => {
  try {
    const { name, party, manifesto, photoUrl, groupId, positionId } = req.body;
    
    // Validation
    if (!name || !party || !manifesto || !groupId || !positionId) {
      return res.status(400).json({ message: 'Name, party, manifesto, group, and position are required' });
    }
    
    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Verify position exists and belongs to the group
    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    if (position.groupId.toString() !== groupId) {
      return res.status(400).json({ message: 'Position does not belong to the specified group' });
    }
    
    const candidate = new Candidate({
      name,
      party,
      manifesto,
      photoUrl: photoUrl || undefined,
      groupId,
      positionId
    });
    
    const savedCandidate = await candidate.save();
    res.status(201).json(savedCandidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ message: 'Server error while creating candidate' });
  }
};

// Update a candidate
exports.updateCandidate = async (req, res) => {
  try {
    const { name, party, manifesto, photoUrl } = req.body;
    
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { name, party, manifesto, photoUrl },
      { new: true, runValidators: true }
    );
    
    if (!updatedCandidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    res.json(updatedCandidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ message: 'Server error while updating candidate' });
  }
};

// Delete a candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const deletedCandidate = await Candidate.findByIdAndDelete(req.params.id);
    
    if (!deletedCandidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ message: 'Server error while deleting candidate' });
  }
};

// Get candidates by position
exports.getCandidatesByPosition = async (req, res) => {
  try {
    const { positionId } = req.params;
    
    // Verify position exists
    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    const candidates = await Candidate.find({ positionId }).sort({ name: 1 });
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates by position:', error);
    res.status(500).json({ message: 'Server error while fetching candidates' });
  }
};
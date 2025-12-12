const Position = require("../models/Position");
const Group = require("../models/Group");

// Create a new position
exports.createPosition = async (req, res) => {
  try {
    const { name, description, groupId, voteEndTime } = req.body;
    
    // Validation
    if (!name || !groupId || !voteEndTime) {
      return res.status(400).json({ message: "Position name, group ID, and vote end time are required" });
    }
    
    // Validate date
    const endTime = new Date(voteEndTime);
    if (isNaN(endTime.getTime())) {
      return res.status(400).json({ message: "Invalid vote end time format" });
    }
    
    // Check if position already exists in this group
    const existingPosition = await Position.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      groupId 
    });
    if (existingPosition) {
      return res.status(400).json({ message: "Position with this name already exists in this group" });
    }
    
    const position = new Position({
      name,
      description: description || "",
      groupId,
      voteEndTime: endTime
    });
    
    const savedPosition = await position.save();
    
    // Add position to group
    await Group.findByIdAndUpdate(groupId, {
      $push: { positions: savedPosition._id }
    });
    
    res.status(201).json(savedPosition);
  } catch (error) {
    console.error("Error creating position:", error);
    res.status(500).json({ message: "Server error while creating position" });
  }
};

// Get positions by group ID
exports.getPositionsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const positions = await Position.find({ groupId }).sort({ name: 1 });
    res.json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ message: "Server error while fetching positions" });
  }
};

// Get position by ID
exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.json(position);
  } catch (error) {
    console.error("Error fetching position:", error);
    res.status(500).json({ message: "Server error while fetching position" });
  }
};
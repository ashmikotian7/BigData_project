const Group = require("../models/Group");
const Position = require("../models/Position");

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }
    
    // Check if group already exists
    const existingGroup = await Group.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingGroup) {
      return res.status(400).json({ message: "Group with this name already exists" });
    }
    
    const group = new Group({
      name,
      description: description || ""
    });
    
    const savedGroup = await group.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Server error while creating group" });
  }
};

// Join or get existing group
exports.joinGroup = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }
    
    // Find group
    const group = await Group.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    res.json(group);
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Server error while joining group" });
  }
};

// Get all groups
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().sort({ name: 1 });
    res.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Server error while fetching groups" });
  }
};

// Get group by ID with positions
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate("positions");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ message: "Server error while fetching group" });
  }
};
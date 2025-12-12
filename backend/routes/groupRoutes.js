const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// POST /api/groups - Create a new group
router.post('/', groupController.createGroup);

// POST /api/groups/join - Join an existing group
router.post('/join', groupController.joinGroup);

// GET /api/groups - Get all groups
router.get('/', groupController.getAllGroups);

// GET /api/groups/:id - Get group by ID
router.get('/:id', groupController.getGroupById);

module.exports = router;
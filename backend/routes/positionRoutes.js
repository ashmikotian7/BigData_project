const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');

// POST /api/positions - Create a new position
router.post('/', positionController.createPosition);

// GET /api/positions/group/:groupId - Get positions by group ID
router.get('/group/:groupId', positionController.getPositionsByGroup);

// GET /api/positions/:id - Get position by ID
router.get('/:id', positionController.getPositionById);

module.exports = router;
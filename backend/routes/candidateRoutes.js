const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');

// GET /api/candidates - Get all candidates
router.get('/', candidateController.getAllCandidates);

// POST /api/candidates - Create a new candidate
router.post('/', candidateController.createCandidate);

// PUT /api/candidates/:id - Update a candidate
router.put('/:id', candidateController.updateCandidate);

// DELETE /api/candidates/:id - Delete a candidate
router.delete('/:id', candidateController.deleteCandidate);

// GET /api/candidates/position/:positionId - Get candidates by position
router.get('/position/:positionId', candidateController.getCandidatesByPosition);

module.exports = router;
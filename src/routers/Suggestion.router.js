const express = require('express');
const {
  getAllSuggestions,
  createSuggestion,
  getLatestDraft,
  updateSuggestion,
  manageSuggestion,
} = require('../models/Suggestion.model.js');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();

// Route for getting all suggestions with sorting and filtering
router.get('/', (req, res, next) => {
  const { searchTerm, sortBy = 'createdAt', sortOrder = 'asc', tags } = req.query;

  // Parse tags into an array if present
  const tagsArray = tags ? tags.split(',') : [];

  getAllSuggestions(searchTerm, sortBy, sortOrder, tagsArray)
      .then((suggestions) => res.status(200).json(suggestions))
      .catch(next);
});

// Route for creating a new suggestion
router.post('/', jwtMiddleware.verifyToken, (req, res, next) => {
  const { title = "", description = "", tag = "" } = req.body;

  const userId = res.locals.userId; // Extracted from token by middleware

  // Allow drafts with empty fields
  createSuggestion({ title, description, tag, createdById: userId })
      .then(newSuggestion => res.status(201).json(newSuggestion))
      .catch(next);
});




// Fetch the latest draft suggestion
router.get('/draft', jwtMiddleware.verifyToken, (req, res, next) => {
  const userId = res.locals.userId;

  getLatestDraft(userId)
      .then(draft => {
          if (!draft) {
              return res.status(404).json({ message: "No draft found" });
          }
          res.status(200).json(draft);
      })
      .catch(next);
});

// Update a draft suggestion
router.put('/:id', jwtMiddleware.verifyToken, (req, res, next) => {
  let { id } = req.params;
  
  // Force id to be an integer
  id = parseInt(id, 10);

  // Check if the id is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format, must be an integer' });
  }

  const { title, description, tags, status } = req.body;

  // Proceed with the update
  updateSuggestion(id, { title, description, tags, status })
      .then(updated => res.status(200).json(updated))
      .catch(next);
});

// Manage a suggestion (approve/reject)
router.put('/admin/:id/manage', (req, res, next) => {
  let { id } = req.params;
  id = parseInt(id, 10);

  if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format, must be an integer' });
  }

  const { status, reason } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be "APPROVED" or "REJECTED".' });
  }

  if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Reason is required for status update.' });
  }

  manageSuggestion(id, status, reason)
      .then((updatedSuggestion) => res.status(200).json(updatedSuggestion))
      .catch(next);
});



module.exports = router;
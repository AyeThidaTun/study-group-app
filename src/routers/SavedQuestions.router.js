const express = require('express');
const { bookmarkQuestion, getSavedQuestions, removeSavedQuestion } = require('../models/SavedQuestions.model');
const router = express.Router();

// Route to bookmark or unbookmark a question
router.post('/:questionID/bookmark', async (req, res, next) => {
  const { userID } = req.body;
  const { questionID } = req.params;
  try {
    const result = await bookmarkQuestion(userID, parseInt(questionID, 10));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Route to fetch saved questions
router.get('/', async (req, res) => {
    const { userID } = req.query;
    try {
      console.log('Fetching saved questions for userID:', userID);
      const savedQuestions = await getSavedQuestions(parseInt(userID, 10)); // Parse userID to an integer
      res.json(savedQuestions);
    } catch (error) {
      console.error('Error fetching saved questions:', error);
      res.status(500).json({ error: 'Failed to load saved questions.' });
    }
});  

// Route to remove a saved question
router.delete('/:id', async (req, res, next) => {
  const { userID } = req.body;
  const { id } = req.params;
  try {
    const result = await removeSavedQuestion(userID, parseInt(id, 10));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

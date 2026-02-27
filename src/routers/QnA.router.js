const express = require('express');
const multer = require('multer'); // Import Multer for file uploads
const path = require('path');
const router = express.Router();

const {
  getFilteredQuestions,
  getModulesBySchool,
  getSchools,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createAnswer,
  publishAnswer,
  updateAnswer,
  deleteAnswer,
  toggleLikeQuestion,
  toggleLikeAnswer,
  updateQuestionStatus,
  autoArchiveQuestions
} = require('../models/QnA.model');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/images');
    cb(null, uploadPath); // Save files to the 'images' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Use timestamp for unique filenames
  },
});


// Set up multer for file upload
const upload = multer({ storage });

// Route to fetch filtered questions
router.get('/questions', async (req, res) => {
  try {
    const {search, schoolId, moduleId, status, sortBy } = req.query;

    // Format the filters as an object
    const filters = {
      search: search || '',  // Default to empty string if not provided
      schoolId: schoolId || '',  // Default to empty string if not provided
      moduleId: moduleId || '',  // Default to empty string if not provided
      status: status || 'ACTIVE,SOLVED',  // Default to 'ACTIVE,SOLVED' if not provided
    };

    // Call the model function to get filtered questions
    const questions = await getFilteredQuestions(filters, sortBy);

    // Send the filtered questions as response
    res.json(questions);
  } catch (error) {
    console.error('Error fetching filtered questions:', error);
    res.status(500).json({ error: 'Failed to load questions.' });
  }
});

// Automated job to run this every day
setInterval(() => {
  autoArchiveQuestions();
}, 24 * 60 * 60 * 1000); // Run every 24 hours

// Route to get all schools
router.get('/schools', async (req, res, next) => {
  try {
    const schools = await getSchools();  // Call the model function to fetch schools
    res.json(schools);
  } catch (error) {
    next(error);
  }
});

// Route to get modules by school
router.get('/modules', async (req, res, next) => {
  const { schoolId } = req.query;
  try {
    const modules = await getModulesBySchool(schoolId);  // Call the model function to fetch modules
    res.json(modules);
  } catch (error) {
    next(error);
  }
});

// POST route for creating a question
router.post('/questions', upload.single('image'), async (req, res, next) => {
  try {
    const { userID, title, content, moduleCode } = req.body;
    const filePath = req.file ? `/images/${req.file.filename}` : null;

    const newQuestion = await createQuestion(userID, title, content, moduleCode, filePath);
    res.json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    next(error);
  }
});

// Mark question as solved
router.post('/questions/:questionID/solve', async (req, res, next) => {
  const { questionID } = req.params;

  try {
    const updatedQuestion = await updateQuestionStatus(questionID, 'SOLVED');
    res.json(updatedQuestion);  // Send the updated question
  } catch (error) {
    next(error);
  }
});

// Update question details
router.put('/questions/:questionID', async (req, res, next) => {
  const { questionID } = req.params;
  const { title, content } = req.body;

  try {
    const updatedQuestion = await updateQuestion(questionID, title, content);
    res.json(updatedQuestion);  // Send the updated question
  } catch (error) {
    next(error);
  }
});

// Route to delete a question
router.delete('/questions/:questionID', async (req, res, next) => {
  const { questionID } = req.params;
  const { userID } = req.body;
  try {
    const result = await deleteQuestion(questionID, userID);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Route to create a new answer
router.post('/answers', async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log incoming data
    const { userID, questionID, content, status } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Answer content is required.' });
    }

    if (!['DRAFT', 'PUBLISHED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const newAnswer = await createAnswer(userID, questionID, content, status);
    res.status(201).json(newAnswer);
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route to update an answer
router.put('/answers/:answerID', async (req, res, next) => {
  const { answerID } = req.params;
  const { userID, content } = req.body;
  try {
    const updatedAnswer = await updateAnswer(answerID, userID, content);
    res.json(updatedAnswer);
  } catch (error) {
    next(error);
  }
});


// Route to publish an answer
router.put('/answers/:answerID/publish', async (req, res, next) => {
  const { answerID } = req.params;
  const { userID } = req.body;

  try {
    const result = await publishAnswer(answerID, userID);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Route to delete an answer
router.delete('/answers/:answerID', async (req, res, next) => {
  const { answerID } = req.params;
  const { userID } = req.body;
  try {
    const result = await deleteAnswer(answerID, userID);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Route to like/unlike a question
router.post('/questions/:questionID/like', async (req, res, next) => {
  const { userID } = req.body;
  const { questionID } = req.params;

  try {
    const result = await toggleLikeQuestion(userID, parseInt(questionID, 10));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Route to like/unlike an answer
router.post('/answers/:answerID/like', async (req, res, next) => {
  const { userID } = req.body;
  const { answerID } = req.params;

  try {
    const result = await toggleLikeAnswer(userID, parseInt(answerID, 10));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
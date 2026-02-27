const express = require('express');
const {
  getAllSchools,
  getModulesBySchoolIdAndSearch,
  getQuizzesByModuleCode,
  getQuizAttempts,
  startQuizAttempt,
  getQuizQuestions,
  calculateScore,
  submitQuizAttempt,
  getQuizResults, 
  getDecksByModule,
  getFlashcardsByDeckId,
  updateOrInsertDeckProgress,
  completeDeckProgress,
} = require('../models/Quiz.model.js');
const router = express.Router();

// Route for getting all Schools
router.get('/school', (req, res, next) => {
  getAllSchools()
    .then((schools) => res.status(200).json(schools))
    .catch(next);
});

// Route for getting Modules by schoolId and search query
router.get('/module', (req, res, next) => {
  const schoolId = req.query.schoolId; // Get schoolId from query params
  const search = req.query.search || ''; // Optional search query

  if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
  }

  getModulesBySchoolIdAndSearch(schoolId, search)
      .then((modules) => res.status(200).json(modules))
      .catch(next);
});


// Route for getting Quizzes by moduleCode with filters
router.get('/quizForModule', (req, res, next) => {
  const modCode = req.query.modCode; // Get modCode from query params
  const userId = req.query.userId; // Assuming you have user ID from authentication middleware
  const semester = req.query.semester; // Get semester filter
  const academicYear = req.query.academicYear; // Get academicYear filter
  const status = req.query.status; // Get status filter

  console.log('status:', status);

  if (!modCode) {
    return res.status(400).json({ error: 'modCode is required' });
  }

  getQuizzesByModuleCode(modCode, userId, semester, academicYear, status)
    .then((quizzes) => {

      const formattedQuizzes = quizzes.map((quiz) => {
        const attempts = quiz.attempts || [];
        const highestScore = attempts.length
          ? Math.max(...attempts.map((attempt) => attempt.score || 0))
          : null; // If no attempts, highestScore is null

        return {
          quizId: quiz.quizId,
          topic: quiz.topic,
          year: quiz.year,
          semester: quiz.semester,
          createdAt: quiz.createdAt,
          modName: quiz.module.modName,
          schoolFullName: quiz.module.school.fullName,
          status: attempts.length > 0 
            ? attempts[0].status // Use the first attempt's status
            : "Not Attempted", // Default to "Not Attempted" if no attempts exist
          highestScore: highestScore !== null ? highestScore : "No attempts", // Return highest score or a fallback message
          questionCount: quiz._count.questions, // Include the question count
        };
      });

      res.status(200).json(formattedQuizzes);
    })
    .catch(next);
});


// Route to retrieve all attempts for a specific quiz and user
router.get('/getAttempts', (req, res, next) => {
  const { quizId, userId } = req.query; // quizId and userId passed as query parameters

  if (!quizId || !userId) {
    return res.status(400).json({ error: 'quizId and userId are required' });
  }

  getQuizAttempts(quizId, userId)
    .then((attempts) => {
      if (!attempts || attempts.length === 0) {
        return res.status(404).json({ message: 'No attempts found for this quiz and user' });
      }

      const formattedAttempts = attempts.map((attempt) => ({
        attemptId: attempt.attemptId,
        quizId: attempt.quizId,
        startedAt: attempt.startedAt,
        endedAt: attempt.endedAt,
        status: attempt.status,
        score: attempt.score,
        questionCount: attempt.quiz._count.questions, // Include the total number of questions
      }));

      res.status(200).json(formattedAttempts);
    })
    .catch(next);
});


router.post('/startAttempt', (req, res, next) => {
  const { quizId, userId } = req.body; // quizId and userId are passed in the request body

  // Parse quizId as an integer
  const quizIdInt = parseInt(quizId, 10);

  if (!quizId || !userId || isNaN(quizIdInt)) {
    return res.status(400).json({ error: 'Valid quizId and userId are required' });
  }

  startQuizAttempt(quizIdInt, userId)
    .then((attempt) => res.status(201).json(attempt))
    .catch(next);
});


router.get('/questions', (req, res, next) => {
  const quizId = req.query.quizId; // quizId is passed as a query parameter

  // Parse quizId as an integer
  const quizIdInt = parseInt(quizId, 10);

  if (!quizId || isNaN(quizIdInt)) {
    return res.status(400).json({ error: 'Valid quizId is required' });
  }

  getQuizQuestions(quizIdInt)
    .then((questions) => {
      const formattedQuestions = questions.map((q) => ({
        itemId: q.quizItem.itemId,
        text: q.quizItem.text,
        options: [q.quizItem.option1, q.quizItem.option2, q.quizItem.option3, q.quizItem.option4],
      }));
      res.status(200).json(formattedQuestions);
    })
    .catch(next);
});

// Route to calculate score based on progress
router.post('/calculateScore', (req, res, next) => {
  const { progress } = req.body;

  console.log('progress:', progress);

  if (!progress || typeof progress !== 'object') {
    return res.status(400).json({ error: 'Progress data is required and must be an object' });
  }

  calculateScore(progress)
    .then((score) => res.json({ score: score }))
    .catch((error) => {
      console.error('Error calculating score:', error);
      next(error); // Pass the error to the next middleware (e.g., error handler)
    });
});


router.post('/submitAttempt', (req, res, next) => {
  const { attemptId, progress, score } = req.body; // Data passed in the request body

  // Parse attemptId as an integer
  const attemptIdInt = parseInt(attemptId, 10);

  if (!attemptId || isNaN(attemptIdInt) || progress === undefined || score === undefined) {
    return res.status(400).json({ error: 'attemptId, progress, and score are required' });
  }

  console.log('progress:', progress);

  submitQuizAttempt(attemptIdInt, progress, score)
    .then((attempt) => res.status(200).json({ message: 'Quiz submitted successfully', attempt }))
    .catch(next);
});

// Fetch quiz results for a specific attempt
router.get('/getResults', (req, res, next) => {
  const attemptId = req.query.attemptId;

  if (!attemptId) {
    return res.status(400).json({ error: 'attemptId is required' });
  }

  getQuizResults(attemptId)
    .then((result) => {
      if (!result) {
        return res.status(404).json({ error: 'No results found for the given attemptId' });
      }

      const formattedResults = {
        attemptId: result.attemptId,
        quizId: result.quizId,
        startedAt: result.startedAt,
        endedAt: result.endedAt,
        score: result.score,
        questions: result.quiz.questions.map((q) => {
            const userAnswer = result.progress[q.quizItem.itemId] || null;

            // Initialize variables for user answer and option label
            let userAnswerText = null;
            let userAnswerOption = 'Option 0'; // Default to "Option 0" if no answer

            // Check if userAnswer is provided and find the correct option label
            if (userAnswer) {
              // Find the corresponding option index
              const userAnswerIndex = [q.quizItem.option1, q.quizItem.option2, q.quizItem.option3, q.quizItem.option4].indexOf(userAnswer);

              if (userAnswerIndex !== -1) {
                userAnswerText = userAnswer; // Assign the answer text (e.g., "Eclipse")
                userAnswerOption = `Option ${userAnswerIndex + 1}`; // Option label (e.g., "Option 1")
              }
            }

            // Mapping correctAnswer to the corresponding option text
            const correctAnswerIndex = ['option1', 'option2', 'option3', 'option4'].indexOf(q.quizItem.answer);
            const correctAnswerText = q.quizItem[q.quizItem.answer]; // e.g., "Eclipse"
            const correctAnswerOption = `Option ${correctAnswerIndex + 1}`;

            return {
                text: q.quizItem.text,
                options: [
                    q.quizItem.option1,
                    q.quizItem.option2,
                    q.quizItem.option3,
                    q.quizItem.option4,
                ],
                correctAnswer: correctAnswerText,
                correctAnswerOption: correctAnswerOption,
                userAnswer: userAnswerText, // Return the user answer text (e.g., "Eclipse")
                userAnswerOption: userAnswerOption, // Return the user answer option label (e.g., "Option 1")
            };
        }),
      };

      // Debug: Log the final formatted results
      console.log('Formatted Results:', formattedResults);

      res.status(200).json(formattedResults);
    })
    .catch(next);
});

// Route to fetch flashcards by modCode, userId, and optional status, semester, and academicYear
router.get('/flashcardForModule', (req, res) => {
  const { modCode, userId, status, semester, academicYear } = req.query;

  if (!modCode || !userId) {
    return res.status(400).json({ message: 'modCode and userId are required' });
  }

  console.log("req.query:", req.query);

  // Convert status to a numeric value (an array if multiple statuses are passed)
  let statusValues = [];
  if (status) {
    statusValues = status.split(',').map(s => {
      if (s === 'Not Attempted') return 0;
      if (s === 'In Progress') return 1;
      if (s === 'Completed') return 2;
      throw new Error('Invalid status value');
    });
  }

  // Split semester and academicYear into arrays in case multiple values are passed
  const semesters = semester ? semester.split(',') : [];
  const years = academicYear ? academicYear.split(',') : [];

  // Fetch decks for the module and user from the model using then/catch
  getDecksByModule(modCode, userId, statusValues, semesters, years)
    .then(decks => {
      if (decks.length === 0) {
        return res.status(404).json({ message: 'No decks found for this module' });
      }

      // Ensure progress is mapped correctly
      const updatedDecks = decks.map(deck => {
        let updatedProgress;

        // Transform progress values for the current deck
        if (deck.progress === 0) {
          updatedProgress = ['Not Started']; // Default to 'Not Started'
        } else if (deck.progress === 1) {
          updatedProgress = ['In Progress'];
        } else if (deck.progress === 2) {
          updatedProgress = ['Mastered'];
        } else {
          updatedProgress = ['Unknown']; // Fallback for unexpected values
        }

        console.log('updatedProgress:', updatedProgress);
        console.log('deck:', deck);

        return {
          ...deck,
          progress: updatedProgress, // Replace progress entirely with the updated one
        };
      });

      res.status(200).json(updatedDecks);
    })
    .catch(error => {
      console.error('Error fetching decks:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});


// Route to get all flashcards for a specific deck
router.get('/:deckId/flashcards', (req, res, next) => {
  const { deckId } = req.params;
  getFlashcardsByDeckId(deckId)
    .then((flashcards) => res.status(200).json(flashcards))
    .catch(next);
});

// Route to update or insert the user's progress on a deck
router.post('/deck/startDeckProgress', (req, res, next) => {
  const { userId, deckId } = req.body;  // User ID, Deck ID, and progress

  if (!userId || !deckId) {
      return res.status(400).json({ error: 'userId and deckId are required' });
  }

  // After the user starts a deck, update the progress to 1 (In Progress)
  const progress = 1;

  updateOrInsertDeckProgress(userId, deckId, progress)
      .then((result) => res.status(200).json({ message: 'Progress updated/inserted successfully', result }))
      .catch(next);
});

// Route to update the user's progress on a deck (Completed)
router.put('/deck/completeDeckProgress', (req, res, next) => {
  const { userId, deckId } = req.body;  // User ID, Deck ID, and progress

  if (!userId || !deckId) {
      return res.status(400).json({ error: 'userId and deckId are required' });
  }

  console.log('userId:', userId);
  console.log('deckId:', deckId);

  // After the user completes a deck, update the progress to 2 (Mastered)
  const progress = 2;

  completeDeckProgress(userId, deckId, progress)
      .then((result) => res.status(200).json({ message: 'Progress updated successfully', result }))
      .catch(next);
});

module.exports = router;
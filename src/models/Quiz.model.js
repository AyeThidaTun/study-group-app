const prisma = require('./prismaClient');

module.exports.getAllSchools = async function () {
  return prisma.school.findMany();
};

module.exports.getModulesBySchoolIdAndSearch = async function (schoolId, search) {
  return prisma.module.findMany({
    where: {
      schoolId: parseInt(schoolId),
      modName: {
        contains: search, // Perform a case-insensitive partial match
        mode: 'insensitive',
      },
    },
  });
};

module.exports.getQuizzesByModuleCode = async function (modCode, userId, semester, academicYear, status) {
  const whereConditions = {
    modCode: modCode, // Filter by module code
  };

  // Parse and apply semester filter
  if (semester) {
    const semesterArray = semester.split(','); // Convert comma-separated string to array
    whereConditions.semester = { in: semesterArray }; // Use Prisma's `in` operator
  }

  // Parse and apply academic year filter
  if (academicYear) {
    const yearArray = academicYear.split(','); // Convert comma-separated string to array
    whereConditions.year = { in: yearArray }; // Use Prisma's `in` operator
  }

  // Step 1: Fetch quizzes that match the module code, semester, and academic year
  const quizzes = await prisma.quiz.findMany({
    where: whereConditions,
    include: {
      module: {
        select: {
          modName: true,
          school: {
            select: {
              fullName: true,
            },
          },
        },
      },
      _count: { // Fetch the count of related questions
        select: { questions: true },
      },
      attempts: { // Fetch attempts along with the status
        where: { userId: parseInt(userId) }, // Only fetch attempts for the specified user
        select: { status: true, score: true, quizId: true, userId: true }, // Include the quizId and userId to match
      },
    },
  });

  // Step 2: Attach status to each quiz based on quiz attempts
  const quizzesWithStatus = quizzes.map((quiz) => {
    // Check if a quiz attempt exists for this user
    const attempt = quiz.attempts.find((attempt) => attempt.userId === parseInt(userId) && attempt.quizId === quiz.quizId);
    
    // If attempt exists, use the status from the attempt, else default to "Not Attempted"
    const status = attempt ? attempt.status : "Not Attempted";

    return {
      ...quiz,
      status: status, // Attach the status to the quiz
    };
  });

  // Step 3: If status filter is provided, filter quizzes by the provided statuses
  if (status) {
    
    // Convert the comma-separated status string to an array
    const statusesArray = status.split(',').map(s => s.trim());

    // Filter quizzes based on whether their status matches any of the provided statuses
    const filteredQuizzes = quizzesWithStatus.filter((quiz) => statusesArray.includes(quiz.status));

    return filteredQuizzes;
  }

  // If no status filter is provided, return all quizzes with their status
  return quizzesWithStatus;
};

module.exports.getQuizAttempts = async function (quizId, userId) {
  return prisma.quizAttempt.findMany({
    where: {
      quizId: parseInt(quizId, 10), // Ensure quizId is a number
      userId: parseInt(userId, 10), // Ensure userId is a number
      status: 'Completed', // Filter to only retrieve attempts with status "Completed"
    },
    include: {
      quiz: {
        select: {
          _count: {
            select: { questions: true }, // Include question count
          },
        },
      },
    },
  });
};

module.exports.startQuizAttempt = async function (quizId, userId) {
  // Check if there are any questions for the specified quizId
  const quizQuestions = await prisma.quizQuestion.findFirst({
    where: {
      quizId: quizId,
    },
  });

  // If no questions exist for the quiz, return early
  if (!quizQuestions) {
    return { error: 'No questions found for this quiz.' }; // Return an appropriate message or response
  }

  // Check if the quiz attempt already exists for the user and quiz
  const existingAttempt = await prisma.quizAttempt.findFirst({
    where: {
      quizId: quizId,
      userId: userId,
      status: 'In Progress', // Check if the attempt is in progress
    },
  });

  // If the attempt already exists, return it
  if (existingAttempt) {
    return existingAttempt;
  }

  // If no attempt exists, create a new one
  return prisma.quizAttempt.create({
    data: {
      quizId: quizId,
      userId: userId,
      startedAt: new Date(),
      progress: {}, // Initialize empty progress
    },
  });
};

module.exports.getQuizQuestions = async function (quizId) {
  return prisma.quizQuestion.findMany({
    where: { quizId },
    include: {
      quizItem: {
        select: {
          itemId: true,
          text: true,
          option1: true,
          option2: true,
          option3: true,
          option4: true,
        },
      },
    },
  });
};

// Function to calculate the score based on user progress
module.exports.calculateScore = async function (progress) {
  let score = 0;

  // Ensure progress contains data
  if (!progress || typeof progress !== 'object') {
    throw new Error('Invalid progress data');
  }

  console.log('Progress Data:', progress);  // Log the progress data passed to the function

  // Extract question IDs (itemId) from the progress object keys
  const questionIds = Object.keys(progress).map(Number); // Convert keys to integers (item IDs)
  console.log('Question IDs:', questionIds); // Log the question IDs extracted from progress

  // Fetch quiz items from the database where the itemId matches the question IDs in progress
  const quizItems = await prisma.quizItem.findMany({
    where: {
      itemId: { in: questionIds }, // Filter quiz items based on the question IDs
    },
  });

  console.log('Quiz Items Retrieved:', quizItems);  // Log the quiz items retrieved from the database

  // Iterate through each quiz item to compare the user answer
  quizItems.forEach((item) => {
    const userAnswer = progress[item.itemId]; // Get the user's answer from progress
    const correctAnswerOption = item[item.answer]; // Get the correct answer based on the option (e.g., "Eclipse" for option1)

    console.log(`Comparing User Answer: ${userAnswer} with Correct Answer: ${correctAnswerOption}`); // Log the comparison

    // Check if the user's selected answer matches the correct option text
    if (userAnswer === correctAnswerOption) {
      score++; // Increment score if the answer matches the correct option text
    }
  });

  console.log('Calculated score:', score); // Log the final calculated score

  return score; // Return the calculated score
};

// Model to update the quiz attempt with the progress and score after user submits
// Awards points based on the percentage score if the attempt is the first "Completed" attempt
module.exports.submitQuizAttempt = async function (attemptId, progress, score) {
  // Find the quiz attempt using attemptId
  const attempt = await prisma.quizAttempt.findUnique({
    where: { attemptId },
  });

  if (!attempt) {
    throw new Error("Quiz attempt not found.");
  }

  const { quizId, userId } = attempt;

  // Check if any attempt for this quiz by this user is already "Completed"
  const existingCompletedAttempt = await prisma.quizAttempt.findFirst({
    where: {
      quizId,
      userId,
      status: "Completed",
    },
  });

  // Count total questions in the quiz
  const totalQuestions = await prisma.quizQuestion.count({
    where: { quizId },
  });

  if (totalQuestions === 0) {
    throw new Error("No questions found for this quiz.");
  }

  // Calculate percentage score
  const percentageScore = (score / totalQuestions) * 100;

  // Calculate points awarded based on percentage
  const maxPoints = 150; // Max points for 100%
  const pointsEarned = Math.round((percentageScore / 100) * maxPoints);

  // Update the quiz attempt status regardless
  await prisma.quizAttempt.update({
    where: { attemptId },
    data: {
      status: "Completed",
      progress,
      score,
      endedAt: new Date(),
    },
  });

  // If a completed attempt exists, do not award points
  if (existingCompletedAttempt) {
    return { message: "Quiz attempt updated, but points were not awarded as a completed attempt already exists." };
  }

  // Award points (only for the first completed attempt)
  await prisma.pointsTransaction.create({
    data: {
      userId,
      points: pointsEarned,
      type: "QUIZ",
      description: `Earned ${pointsEarned} points for quiz ${quizId} (${percentageScore.toFixed(2)}%)`,
    },
  });

  // Update user points
  await prisma.user.update({
    where: { userId },
    data: {
      points: {
        increment: pointsEarned, // Add earned points
      },
    },
  });

  return { message: "Quiz attempt submitted successfully, points awarded.", pointsEarned };
};

// Fetch quiz results for a specific attempt
module.exports.getQuizResults = async function (attemptId) {
  return prisma.quizAttempt.findUnique({
    where: { attemptId: parseInt(attemptId, 10) },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              quizItem: {
                select: {
                  itemId: true,
                  text: true,
                  option1: true,
                  option2: true,
                  option3: true,
                  option4: true,
                  answer: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

// Fetch decks based on modCode and userId
module.exports.getDecksByModule = async function (modCode, userId, statusValues, semesters, years) {
  console.log('statusValues:', statusValues);
  try {
    // Fetch all decks for the given modCode, semester, and academicYear
    const decks = await prisma.deck.findMany({
      where: {
        modCode: modCode,
        semester: { in: semesters.length > 0 ? semesters : undefined }, // Apply semester filter if provided
        year: { in: years.length > 0 ? years : undefined }, // Apply year filter if provided
      },
    });

    // Fetch the progress for each deck and user
    const deckProgress = await Promise.all(
      decks.map(async (deck) => {
        // Fetch the progress for the specific deck and user
        const progressRecords = await prisma.deckProgress.findFirst({
          where: {
            deckId: deck.deckId,
            userId: parseInt(userId), // Convert userId to integer
          },
        });

        // If no progress records exist, consider as 'Not Attempted' (0)
        const progress = progressRecords ? progressRecords.progress : 0;

        // If a status filter is applied, only include decks with matching progress
        if (statusValues.length > 0 && !statusValues.includes(progress)) {
          return null; // Exclude this deck
        }

        // Return deck with progress included
        return { ...deck, progress };
      })
    );

    // Filter out any null results (decks that didn't match the status filter)
    return deckProgress.filter(deck => deck !== null);

  } catch (error) {
    console.error('Error in getDecksByModule:', error);
    throw new Error('Error fetching decks');
  }
};

// Get all flashcards for a specific deck
module.exports.getFlashcardsByDeckId = async function (deckId) {
  return prisma.flashcard.findMany({
    where: { deckId: parseInt(deckId) },
  });
};

// Function to insert or update user's progress on a deck
module.exports.updateOrInsertDeckProgress = async function (userId, deckId, progress) {
  // Check if the deck exists in the flashcard entity
  const deckExists = await prisma.flashcard.findFirst({
    where: {
      deckId: parseInt(deckId),
    },
  });

  // If the deck does not exist, return immediately
  if (!deckExists) {
    console.log('Deck does not exist.');
    return;
  }

  // Check if the user already has a progress record for the deck
  const existingProgress = await prisma.deckProgress.findFirst({
    where: {
      userId: parseInt(userId),
      deckId: parseInt(deckId),
    },
  });

  if (existingProgress) {
    // If the progress is already 2 (Completed), do not change it
    if (existingProgress.progress === 2) {
      console.log('Deck already completed. No changes made.');
      return existingProgress;
    }
  
    // Otherwise, update the progress
    return prisma.deckProgress.update({
      where: { deckProgressId: existingProgress.deckProgressId },
      data: { progress: progress },
    });
  } else {
    // If the user does not have progress, insert a new record
    return prisma.deckProgress.create({
      data: {
        userId: parseInt(userId),
        deckId: parseInt(deckId),
        progress: progress,
      },
    });
  }  
};

// Function to complete deck progress and award points if it's the first time completing
module.exports.completeDeckProgress = function (userId, deckId, progress) {
  return prisma.deckProgress.findFirst({
    where: {
      userId: parseInt(userId),
      deckId: parseInt(deckId),
    },
  }).then(existingProgress => {
    console.log('Existing Progress:', existingProgress);
    console.log('Progress:', progress);
    if (existingProgress && existingProgress.progress === 2) {
      console.log('Deck already completed before. No points awarded.');
      return prisma.deckProgress.update({
        where: { deckProgressId: existingProgress.deckProgressId },
        data: { progress: progress },
      });
    }

    return prisma.flashcard.count({
      where: { deckId: parseInt(deckId) },
    }).then(flashcardCount => {
      if (flashcardCount === 0) {
        console.log('Deck does not exist or has no flashcards.');
        return;
      }

      const pointsEarned = Math.round(flashcardCount * Math.PI);

      return prisma.$transaction([
        prisma.deckProgress.update({
          where: { deckProgressId: existingProgress.deckProgressId },
          data: { progress: progress },
        }),
        prisma.user.update({
          where: { userId: parseInt(userId) },
          data: { points: { increment: pointsEarned } },
        }),
        prisma.pointsTransaction.create({
          data: {
            userId: parseInt(userId),
            points: pointsEarned,
            type: "FLASHCARD",
            description: `Earned ${pointsEarned} points for completing deck ${deckId}`,
          },
        }),
      ]);
    });
  });
};








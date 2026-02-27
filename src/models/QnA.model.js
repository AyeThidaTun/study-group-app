const prisma = require('./prismaClient');

module.exports.getFilteredQuestions = async function (filters, sortBy) {
  const { search, schoolId, moduleId, status } = filters;

  // Handle status: Convert to array if string, or directly use array/object
  const statuses =
    typeof status === 'string'
      ? status.split(',')  // Convert string to array by splitting on commas
      : Array.isArray(status)
      ? status  // If already an array, use it directly
      : status?.in || [];  // If status is an object with `in` (e.g., Prisma-compatible)

  console.log('Processed Status Array:', statuses);  // Log to ensure status is processed

  // Construct the "where" filter object for Prisma query
  const where = {
    ...(search
      ? { 
          OR: [
            { title: { contains: search, mode: 'insensitive' } },  // Case-insensitive search on title
            { content: { contains: search, mode: 'insensitive' } }  // Case-insensitive search on content
          ]
        }
      : {}),
    ...(schoolId ? { module: { schoolId: parseInt(schoolId, 10) } } : {}),
    ...(moduleId ? { modCode: moduleId } : {}),
    ...(statuses.length > 0 ? { status: { in: statuses } } : {}),  // Apply status filter if not empty
  };

  console.log('Generated Where Clause:', where);  // Log to check the generated where clause

  const orderBy = sortBy === 'newest'
    ? { createdAt: 'desc' }
    : sortBy === 'oldest'
    ? { createdAt: 'asc' }
    : sortBy === 'most-popular'
    ? { likesList: { _count: 'desc' } }
    : sortBy === 'least-popular'
    ? { likesList: { _count: 'asc' } }
    : {};

  // Perform the query with Prisma
  return prisma.question.findMany({
    where,
    include: {
      user: { select: { name: true } },
      module: { select: { modName: true, schoolId: true } },
      answers: {
        include: {
          user: { select: { name: true } },
          likesList: { select: { userID: true } },
        },
      },
      likesList: { select: { userID: true } },
      savedBy: { select: { userID: true } },
    },
    orderBy,
  });
};

// Function to get all schools
module.exports.getSchools = async function () {
  return prisma.school.findMany({
    select: { id: true, shortName: true },
  });
};

// Function to get modules by schoolId
module.exports.getModulesBySchool = async function (schoolId) {
  return prisma.module.findMany({
    where: { schoolId: parseInt(schoolId, 10) },
    select: { modCode: true, modName: true },
  });
};

// Question archival logic
module.exports.autoArchiveQuestions = async function () {
  const archiveDate = new Date();
  archiveDate.setDate(archiveDate.getDate() - 90); // 90 days ago

  await prisma.question.updateMany({
    where: {
      status: 'ACTIVE', // Only consider active questions
      AND: [
        // Ensure no answers have been updated or created in the last 90 days
        {
          answers: {
            none: {
              updatedAt: { gte: archiveDate }, // No answer updated in the last 90 days
            },
          },
        },
        {
          answers: {
            none: {
              createdAt: { gte: archiveDate }, // No answer created in the last 90 days
            },
          },
        },
      ],
    },
    data: {
      status: 'ARCHIVED', // Archive the question
    },
  });
};

// Publish an answer
module.exports.publishAnswer = async function (answerID, userID) {
  const answer = await prisma.answer.findUnique({
    where: { answerID: parseInt(answerID, 10) },
  });

  if (!answer) throw new Error('Answer not found');
  if (answer.userID !== userID) throw new Error('Unauthorized');

  return prisma.answer.update({
    where: { answerID: parseInt(answerID, 10) },
    data: { status: 'PUBLISHED' },
  });
};

module.exports.createQuestion = async function (userID, title, content, moduleCode, filePath) {
  if (!title || !content || !moduleCode) {
    throw new Error("Title, content, and module fields are required.");
  }

  const module = await prisma.module.findUnique({
    where: { modCode: moduleCode },
  });

  if (!module) {
    throw new Error("Module not found.");
  }

  return prisma.question.create({
    data: {
      title,
      content,
      filePath: filePath || null, // Save file path if present
      user: {
        connect: { userId: parseInt(userID, 10) },
      },
      module: {
        connect: { modCode: module.modCode },
      },
    },
  });
};


module.exports.updateQuestionStatus = async function (questionID, status) {
  // Ensure status is valid
  const validStatuses = ['ACTIVE', 'SOLVED', 'ARCHIVED'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  return prisma.question.update({
    where: { questionID: parseInt(questionID) },
    data: { status: status },
  });
};

module.exports.updateQuestion = async function (questionID, title, content) {
  return prisma.question.update({
    where: { questionID: parseInt(questionID, 10) },
    data: {
      title,
      content,
      updatedAt: new Date(), // Update the timestamp when the question is edited
    },
  });
};

module.exports.deleteQuestion = async function (questionID, userID) {
  const question = await prisma.question.findUnique({ where: { questionID: parseInt(questionID, 10) } });
  if (question.userID === userID) {
    return prisma.question.delete({ where: { questionID: parseInt(questionID, 10) } });
  } else {
    throw new Error('Unauthorized: Only the question owner can delete this question.');
  }
};

module.exports.createAnswer = async function (userID, questionID, content, status) {
  if (!content) {
    throw new Error("Answer content is required.");
  }

  return prisma.answer.create({
    data: { 
      userID: parseInt(userID, 10), // Ensure userId is an integer 
      questionID, 
      content, 
      status: status || 'DRAFT', // Default to DRAFT if not specified
    },
  });
};


module.exports.updateAnswer = async function (answerID, userID, content) {
  const answer = await prisma.answer.findUnique({ where: { answerID: parseInt(answerID, 10) } });
  if (answer.userID !== userID) {
    throw new Error('Unauthorized: Only the answer owner can update this answer.');
  }
  return prisma.answer.update({
    where: { answerID: parseInt(answerID, 10) },
    data: { content, updatedAt: new Date() },
  });
};
module.exports.deleteAnswer = async function (answerID, userID) {
  const answer = await prisma.answer.findUnique({ where: { answerID: parseInt(answerID, 10) } });
  if (answer.userID === userID) {
    return prisma.answer.delete({ where: { answerID: parseInt(answerID, 10) } });
  } else {
    throw new Error('Unauthorized: Only the answer owner can delete this answer.');
  }
};

// Toggle like on a question
module.exports.toggleLikeQuestion = async function (userID, questionID) {
  const existingLike = await prisma.like.findFirst({
    where: { userID, questionID },
  });

  if (existingLike) {
    // If already liked, remove the like
    await prisma.like.delete({ where: { likeID: existingLike.likeID } });
    return { message: 'Like removed', liked: false };
  } else {
    // Add a new like
    await prisma.like.create({ data: { userID, questionID } });
    return { message: 'Liked', liked: true };
  }
};

// Toggle like on an answer
module.exports.toggleLikeAnswer = async function (userID, answerID) {
  const existingLike = await prisma.like.findFirst({
    where: { userID, answerID },
  });

  if (existingLike) {
    // If already liked, remove the like
    await prisma.like.delete({ where: { likeID: existingLike.likeID } });
    return { message: 'Like removed', liked: false };
  } else {
    // Add a new like
    await prisma.like.create({ data: { userID, answerID } });
    return { message: 'Liked', liked: true };
  }
};

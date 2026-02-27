const prisma = require('./prismaClient');

// Bookmark a question
module.exports.bookmarkQuestion = async function (userID, questionID) {
    // Check if the user has already bookmarked the question
    const existingBookmark = await prisma.savedQuestion.findFirst({
      where: { userID, questionID },
    });
  
    if (existingBookmark) {
      // If the question is already bookmarked, remove it (unbookmark)
      await prisma.savedQuestion.delete({
        where: { id: existingBookmark.id },
      });
      return { message: 'Unbookmarked' };
    } else {
      // If not, add the bookmark
      await prisma.savedQuestion.create({
        data: {
          userID,
          questionID,
        },
      });
      return { message: 'Bookmarked' };
    }
};

module.exports.getSavedQuestions = async function (userID) {
  try {
    return prisma.savedQuestion.findMany({
      where: { userID: parseInt(userID, 10) },
      include: {
        question: {
          include: {
            module: { select: { modName: true } }, // Include module name
            user: { select: { name: true } }, // Include question poster's name
            answers: {
              include: {
                user: { select: { name: true } }, // Include answer poster's name
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching saved questions:', error);
    throw error;
  }
};
  


module.exports.removeSavedQuestion = async function (userID, id) {
    await prisma.savedQuestion.deleteMany({
        where: { id, userID },
    });
    return { message: 'Removed from saved questions.' };
};

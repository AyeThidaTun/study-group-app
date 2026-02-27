const bcrypt = require('bcrypt');
const prisma = require('./prismaClient');

module.exports.getAllUsers = async function () {
  return prisma.user.findMany();
};

module.exports.getUserById = async function (userId) {
  return prisma.user.findUnique({
    where: { userId: parseInt(userId, 10) },  // Ensure the userId is an integer if it's stored as such
  });
};

module.exports.getAllAvatars = async function () {
  return prisma.avatar.findMany();
};

// ##############################################################
// Authentication Models Start
// ##############################################################
module.exports.loginUser = async function loginUser(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        userId: true,
        email: true,
        password: true,
        userRole: true, // Include role in the query
        isTutor: true
      }
    });

    if (!user) {
      return null; // Return null if the user is not found
    }

    // Update the user's status to "ONLINE"
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        status: "ONLINE",
        lastLogin: new Date() // Update the lastLogin timestamp for firefox users
      }
    });

    return user; // Return user object if found or null if not found
  } catch (error) {
    console.error("Error during login:", error); // Log the error for debugging
    throw new Error("Error during login");
  }
};


module.exports.updateLastLoginDetails = async function (userId) {
  try {

    console.log('Updating last login for user with ID:', userId);  // Log the userId

    return prisma.user.update({
      where: { userId: userId },
      data: { lastLogin: new Date() },
    });
  } catch (error) {
    if (error instanceof prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('Record not found');
    }
    throw new Error(error.message);
  }
};

module.exports.registerUser = async function (userData) {
  try {
    return await prisma.user.create({
      data: userData,
    });
  } catch (error) {
    // Handle Prisma unique constraint error (duplicate email)
    if (error.code === 'P2002' && error.meta.target.includes('email')) {
      throw new Error('Email already registered');
    }
    console.error('Error creating user:', error);
    throw new Error('Error creating user');
  }
};

module.exports.updateUserStatus = async function (userId, status) {
  try {
      // Update the user's status in the database
      await prisma.user.update({
          where: { userId: userId },
          data: { status: status },
      });

      return true;
  } catch (error) {
      console.error('Error updating user status:', error);
      throw new Error('Error updating user status');
  }
};

// Update last activity timestamp
module.exports.updateLastActivity = async function (userId, lastActivity) {
  try {
      await prisma.user.update({
          where: { userId },
          data: { lastActivity: new Date(lastActivity) },
      });
      return true;
  } catch (error) {
      console.error('Error updating last activity:', error);
      throw new Error('Error updating last activity');
  }
};

// Mark inactive users as OFFLINE
module.exports.markOfflineUsers = async function (timeout) {
  const now = new Date();
  try {
      const usersToMarkOffline = await prisma.user.findMany({
          where: {
              status: 'ONLINE',
              lastActivity: { lt: new Date(now - timeout) },
          },
      });

      await Promise.all(
          usersToMarkOffline.map(user =>
              prisma.user.update({
                  where: { userId: user.userId },
                  data: { status: 'OFFLINE' },
              })
          )
      );

      console.log('Inactive users marked as OFFLINE');
  } catch (error) {
      console.error('Error marking offline users:', error);
      throw new Error('Error marking offline users');
  }
};

// ##############################################################
// Authentication Models End
// ##############################################################


module.exports.retrieveUserProfile = async function (email) {
  try {
    // Retrieve user data with avatar imageName explicitly linked via avatarId
    const user = await prisma.user.findUnique({
      where: {
        email: email, // Using the email to search for the user
      },
      include: {
        avatar: { // Use Prisma's relational field to include Avatar
          select: {
            imageName: true, // Select only the imageName from the Avatar table
          },
        },
      },
    });

    if (user) {
      // Merge the user's data with the imageName from the Avatar table
      return {
        userId: user.userId,
        email: user.email,
        name: user.name,
        points: user.points,
        lastLogin: user.lastLogin,
        bio: user.bio,
        academicLevel: user.academicLevel,
        skills: user.skills,
        subjectInterests: user.subjectInterests,
        adminNumber: user.adminNumber,
        avatarId: user.avatarId,
        imageName: user.avatar?.imageName || null, // Include imageName, linked by avatarId
      };
    }

    return null; // Return null if no user is found
  } catch (error) {
    console.error('Error retrieving user profile:', error); // Log any errors
    throw new Error('Error retrieving user profile');
  }
};

module.exports.updateUserAvatar = async function (userId, imageName) {
  try {
    // Find the avatar ID corresponding to the provided imageName
    const avatar = await prisma.avatar.findFirst({
      where: {
        imageName: imageName, // Match the imageName
      },
      select: {
        avatarId: true, // Select only the avatarId
      },
    });

    if (!avatar) {
      throw new Error('Avatar not found');
    }

    // Update the user's avatarId
    const updatedUser = await prisma.user.update({
      where: { userId }, // Find the user by userId
      data: { avatarId: avatar.avatarId }, // Update the avatarId
    });

    return updatedUser; // Return the updated user object
  } catch (error) {
    console.error('Error updating user avatar:', error);
    throw new Error('Error updating user avatar');
  }
};

module.exports.updateUserProfile = async function (userId, updatedData) {
  try {
    // Update the user profile based on the provided data
    const updatedUser = await prisma.user.update({
      where: {
        userId: userId, // Match by userId
      },
      data: updatedData, // Use the provided updatedData
    });

    return updatedUser; // Return the updated user details
  } catch (error) {
    if (error instanceof prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('User not found');
    }
    console.error('Error updating profile:', error);
    throw new Error('Error updating profile');
  }
};

module.exports.deleteUserProfile = async function (userId) {
  try {
    await prisma.$transaction(async (prisma) => {
      // Delete the user profile
      await prisma.user.delete({
        where: { userId: userId },
      });
    });

    console.log('User profile and associated records deleted successfully!');
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw new Error('Error deleting user profile');
  }
};


module.exports.countUsers = async function () {
  try {
    const count = await prisma.user.count(); // Count the number of users
    return count;
  } catch (error) {
    console.error('Error counting users:', error);
    throw new Error('Error counting users');
  }
};

module.exports.getTopUsersByPoints = async function () {
  try {
    // Fetch the top 5 users ordered by points in descending order
    const topUsers = await prisma.user.findMany({
      orderBy: {
        points: 'desc', // Order by points in descending order
      },
      take: 5, // Limit the result to the top 5 users
      select: {
        name: true, // Select only the name
        points: true, // Select the points
      },
    });

    return topUsers; // Return the array of top users
  } catch (error) {
    console.error('Error retrieving top users by points:', error); // Log any errors
    throw new Error('Error retrieving top users by points');
  }
};

// Model to retrieve information for the quiz completion line chart
module.exports.getQuizCompletionTrends = async function (timeInterval) {
  return prisma.$queryRaw`
    SELECT 
      DATE_TRUNC(${timeInterval}, "endedAt") AS interval, 
      COUNT(*) AS completedQuizzes
    FROM "QuizAttempt"
    WHERE status = 'Completed'
    GROUP BY interval
    ORDER BY interval ASC;
  `;
};

// Function to verify the old password
module.exports.verifyOldPassword = async function (userId, oldPassword) {
  try {
    // Find the user by their userId
    const user = await prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Use bcrypt to compare the old password with the stored hashed password
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      throw new Error('Old password is incorrect');
    }

    return true; // Return true if password is correct
  } catch (error) {
    console.error('Error verifying old password:', error);
    throw new Error('Error verifying old password');
  }
};

// Function to update the new password
module.exports.updatePassword = async function (userId, hashedPassword) {
  try {
    // Update the user's password with the newly hashed password
    await prisma.user.update({
      where: { userId: userId },
      data: { password: hashedPassword },
    });

    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw new Error('Error updating password');
  }
};
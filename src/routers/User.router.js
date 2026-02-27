const express = require('express');
const {
  getAllUsers,
  getUserById,
  loginUser,
  updateLastLoginDetails,
  registerUser,
  updateUserStatus,
  updateLastActivity,
  markOfflineUsers,
  retrieveUserProfile,
  getAllAvatars,
  updateUserAvatar,
  updateUserProfile,
  deleteUserProfile,
  verifyOldPassword,
  updatePassword,
  countUsers,
  getTopUsersByPoints,
  getQuizCompletionTrends
} = require('../models/User.model');
const bcryptMiddleware = require('../middleware/bcryptMiddleware');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();

// Route for getting all user
router.get('/', (req, res, next) => {
  getAllUsers()
    .then((users) => res.status(200).json(users))
    .catch(next);
});

// Route for getting user by userId
router.get('/retrieveUserById/:userId', (req, res, next) => {
  const userId = req.params.userId;
  
  getUserById(userId)
    .then((user) => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch(next);
});

// ##############################################################
// Authentication Routes Start
// ##############################################################
// Route for login
router.post(
  "/login",
  (req, res, next) => {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
      }

      loginUser(email)
          .then((user) => {
              if (!user) {
                  return res.status(401).json({ message: "Invalid email or password" });
              }

              console.log("User found role:", user.userRole);

              res.locals.hash = user.password; // Storing hash for bcrypt comparison
              res.locals.userId = user.userId;
              res.locals.email = user.email;
              res.locals.userRole = user.userRole; // Pass userRole for token generation
              res.locals.isTutor= user.isTutor;

              next(); // Proceed to bcryptMiddleware.comparePassword
          })
          .catch((error) => {
              res.status(500).json({ message: error.message });
          });
  },
  bcryptMiddleware.comparePassword,
  jwtMiddleware.generateToken,
  jwtMiddleware.sendToken
);



// Route to update last login details
router.put('/updateLoginDetails', jwtMiddleware.verifyToken, (req, res, next) => {
  const userId = res.locals.userId;

  updateLastLoginDetails(userId)
    .then(() => res.status(200).json({ msg: 'Updated!' }))
    .catch(next);
});

// Route for user registration
router.post('/register', bcryptMiddleware.hashPassword, (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const userData = {
    email,
    password: res.locals.hash, // Hashed password
    name,
  };

  registerUser(userData)
    .then((newUser) => res.status(201).json({ message: 'User registered successfully', userId: newUser.userId }))
    .catch((error) => {
      console.error('Error during registration:', error);
      res.status(500).json({ message: error.message || 'An error occurred during registration' });
    });
});

// Route for logging out the user
router.post('/logout', jwtMiddleware.verifyToken, (req, res) => {
  const userId = res.locals.userId; // Extract userId from the JWT token

  // Update the user's status to OFFLINE in the database
  updateUserStatus(userId, 'OFFLINE')
      .then(() => {
          res.status(200).json({ message: 'User logged out successfully' });
      })
      .catch((error) => {
          console.error('Error during logout:', error);
          res.status(500).json({ message: 'Failed to log out the user' });
      });
});

// Update last activity
router.put('/last-activity', jwtMiddleware.verifyToken, async (req, res) => {
  const userId = res.locals.userId; // Extracted from JWT middleware
  const { lastActivity } = req.body;

  try {
      await updateLastActivity(userId, lastActivity);
      res.status(200).json({ message: 'Last activity updated successfully' });
  } catch (error) {
      console.error('Error updating last activity:', error);
      res.status(500).json({ message: 'Failed to update last activity' });
  }
});

// Periodic timer (30 mins) for marking users offline
// Made specfically for firefox users and when the frontend logout timer fails
const THIRTY_MINUTES = 30 * 60 * 1000;

setInterval(async () => {
  try {
      await markOfflineUsers(THIRTY_MINUTES);
  } catch (error) {
      console.error('Error running inactivity timer:', error);
  }
}, THIRTY_MINUTES);
// ##############################################################
// Authentication Routes End
// ##############################################################


// ##############################################################
// Profile Routes Start
// ##############################################################

// Route for fetching the logged-in user's profile data
router.get('/profile', jwtMiddleware.verifyToken, (req, res, next) => {
  const { email } = res.locals; // Get the email from the decoded token in res.locals
  console.log('Email:', email); // Log the email for debugging

  retrieveUserProfile(email)
    .then((user) => {
      if (user) {
        res.status(200).json(user); // Send the user data back if found
      } else {
        res.status(404).json({ message: 'User not found' }); // If user not found, send 404
      }
    })
    .catch(next); // Pass any errors to the error handler
});

// Route for getting all avatars for profile picture update
router.get('/avatars', (req, res, next) => {
  getAllAvatars()
    .then((avatars) => res.status(200).json(avatars))
    .catch(next);
});

// Route to update the avatar for a user
router.put('/profile/avatar', jwtMiddleware.verifyToken, async (req, res) => {
  const userId = res.locals.userId; // Get the user ID from the verified token
  const { imageName } = req.body; // Get the imageName from the request body

  if (!imageName) {
      return res.status(400).json({ message: 'Image name is required' });
  }

  try {
      // Call the model function to update the avatar
      const updatedUser = await updateUserAvatar(userId, imageName);

      if (updatedUser) {
          return res.status(200).json({ message: 'Avatar updated successfully', updatedUser });
      } else {
          return res.status(404).json({ message: 'Avatar or user not found' });
      }
  } catch (error) {
      console.error('Error updating avatar:', error);
      return res.status(500).json({ message: 'Failed to update avatar', error: error.message });
  }
});


// Route for updating user profile
router.put('/profile', jwtMiddleware.verifyToken, (req, res) => {
  const userId = res.locals.userId; // Extract userId from token
  const updatedData = req.body; // Extract data to be updated from request body

  updateUserProfile(userId, updatedData)
    .then((updatedUser) => {
      if (updatedUser) {
        res.status(200).json({ message: 'Profile updated successfully', updatedUser });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    })
    .catch((error) => {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    });
});

// Route to delete user profile
router.delete('/profile', jwtMiddleware.verifyToken, (req, res, next) => {
  const userId = res.locals.userId; // User ID from JWT token

  // Call the model function to delete the profile
  deleteUserProfile(userId)
    .then(() => {
      res.status(200).json({ message: 'Profile deleted successfully' });
    })
    .catch(next); // Pass any errors to the error handler
});

// Route for verifying the old password
router.post('/profile/verifyPassword', jwtMiddleware.verifyToken, (req, res) => {
  const { oldPassword } = req.body;
  const userId = res.locals.userId; // Get the userId from the JWT token

  if (!oldPassword) {
    return res.status(400).json({ message: 'Old password is required' });
  }

  // Call the model function to verify the old password
  verifyOldPassword(userId, oldPassword)
    .then(() => {
      res.status(200).json({ success: true, message: 'Old password verified successfully' });
    })
    .catch((error) => {
      res.status(400).json({ message: error.message });
    });
});

// Route for updating the password
router.put('/profile/updatePassword', jwtMiddleware.verifyToken, (req, res) => {
  const { newPassword } = req.body;
  const userId = res.locals.userId;

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  // Set the password to be hashed in the body of the request for the middleware
  req.body.password = newPassword;  // Pass the newPassword as "password" to the hashPassword middleware

  // Call the hashPassword middleware to hash the new password
  bcryptMiddleware.hashPassword(req, res, () => {
    // After the password is hashed, we can access the hash in res.locals.hash
    const hashedPassword = res.locals.hash;

    // Update the password in the database
    updatePassword(userId, hashedPassword)
      .then(() => {
        res.status(200).json({ success: true, message: 'Password updated successfully' });
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
  });
});




// ##############################################################
// Profile Routes End
// ##############################################################

// ##############################################################
// Homepage Routes Start
// ##############################################################

// Route for counting the number of users
router.get('/count', (req, res,) => {
  countUsers()
    .then((count) => res.status(200).json({ userCount: count }))
    .catch((error) => {
      console.error('Error counting users:', error);
      res.status(500).json({ message: 'Error counting users' });
    });
});

// Route for getting the top 5 users by points
router.get('/topUsers', (req, res,) => {
  getTopUsersByPoints()
    .then((users) => {
      if (users.length > 0) {
        res.status(200).json(users);  // Return the list of top users if found
      } else {
        res.status(404).json({ message: 'No users found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching top users:', error);
      res.status(500).json({ message: 'Error fetching top users' });
    });
});

router.get('/quizCompletionTrends', (req, res) => {
  const timeInterval = req.query.timeInterval || 'week'; // Default to weekly grouping

  getQuizCompletionTrends(timeInterval)
    .then((trends) => {
      console.log('Trends:', trends);

      const formattedTrends = trends.map((trend) => ({
        interval: trend.interval,
        completedQuizzes: Number(trend.completedquizzes), // Convert BigInt to Number
      }));

      res.status(200).json(formattedTrends);
    })
    .catch((error) => {
      console.error('Error fetching quiz trends:', error);
      res.status(500).json({ error: 'Failed to fetch quiz trends data' });
    });
});
// ##############################################################
// Homepage Routes End
// ##############################################################


module.exports = router;

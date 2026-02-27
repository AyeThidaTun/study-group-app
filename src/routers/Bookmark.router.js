const express = require('express');
const {
  getBookmarkById,
  updateBookmarkProgress,
  getBookmarksByUser,
  createBookmark, 
  deleteBookmark,
  updateBookmarkStatus
} = require('../models/Bookmark.model');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();

// GET /:id - Get bookmark by ID
router.get('/:id/book', jwtMiddleware.verifyToken, (req, res, next) => {
  const { id } = req.params;
  const userId = res.locals.userId;

  // Convert id to an integer
  const bookmarkId = parseInt(id, 10);

  if (isNaN(bookmarkId)) {
    return res.status(400).json({ error: 'Invalid bookmark ID' });
  }

  getBookmarkById(bookmarkId, userId)
    .then((bookmark) => res.status(200).json(bookmark))
    .catch(next);
});



router.patch('/:id/progress', jwtMiddleware.verifyToken, (req, res, next) => {
  const { id } = req.params;
  const userId = res.locals.userId;
  const { progress } = req.body;

  const bookmarkId = parseInt(id, 10);

  if (isNaN(bookmarkId) || progress < 0 || progress > 100) {
    return res.status(400).json({ error: 'Invalid bookmark ID or progress value' });
  }

  updateBookmarkProgress(bookmarkId, userId, progress)
    .then((updatedBookmark) => res.status(200).json(updatedBookmark))
    .catch(next);
});


// Route to get all bookmarks for the logged-in user
router.get('/', jwtMiddleware.verifyToken, (req, res, next) => {
  const userId = res.locals.userId;
  console.log("bookmarks route hit", userId);

  getBookmarksByUser(userId)
    .then((bookmarks) => res.status(200).json(bookmarks))
    .catch(next);
});


// Route to create a bookmark for the logged-in user
router.post('/', jwtMiddleware.verifyToken, (req, res, next) => {
  const userId = res.locals.userId;  // Get the userId from the authenticated user's token
  const { resourceId } = req.body;  // Get resourceId from the request body

  // Call the model function to create a bookmark
  createBookmark(userId, resourceId)
    .then((bookmark) => {
      res.status(201).json(bookmark);  // If successful, return the bookmark
    })
    .catch((error) => {
      // Check if the error message is for a duplicate bookmark
      if (error.message === 'This resource is already bookmarked.') {
        res.status(400).json({ message: error.message });  // If already bookmarked, send a 400 response
      } else {
        next(error);  // For any other errors, pass it to the error handler
      }
    });
});


router.delete('/:id', jwtMiddleware.verifyToken, (req, res, next) => {
  const { id } = req.params;
  const userId = res.locals.userId;

  // Convert id to an integer
  const bookmarkId = parseInt(id, 10);

  if (isNaN(bookmarkId)) {
    return res.status(400).json({ error: 'Invalid bookmark ID' });
  }

  deleteBookmark(bookmarkId, userId)
    .then((deletedBookmark) => res.status(200).json(deletedBookmark))
    .catch(next);
});

///////////////////edited

// Route to update bookmark status
router.patch('/:id/status', jwtMiddleware.verifyToken, (req, res, next) => {
  const { id } = req.params;
  const userId = res.locals.userId;
  const { status } = req.body; // Expecting `status` in the request body

  // Convert id to an integer
  const bookmarkId = parseInt(id, 10);

  if (isNaN(bookmarkId)) {
    return res.status(400).json({ error: 'Invalid bookmark ID' });
  }

  updateBookmarkStatus(bookmarkId, userId, status)
    .then((updatedBookmark) => res.status(200).json(updatedBookmark))
    .catch(next);
});


module.exports = router;

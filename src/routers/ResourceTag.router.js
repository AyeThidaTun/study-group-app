const express = require('express');
const {
  createResourceTag,
  getTagsByResource,
  deleteResourceTag,
} = require('../models/ResourceTag.model');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();

// Route to get all tags for a specific resource
router.get('/:resourceId', (req, res, next) => {
  const { resourceId } = req.params;

  // Convert resourceId to an integer before passing it to the database query
  const resourceIdInt = parseInt(resourceId, 10);

  if (isNaN(resourceIdInt)) {
    return res.status(400).json({ error: 'Invalid resource ID' });
  }

  getTagsByResource(resourceIdInt)
    .then((tags) => res.status(200).json(tags))
    .catch(next);
});

// // Route to add a tag to a resource (only if owned by the user)
// router.post('/', jwtMiddleware.verifyToken, (req, res, next) => {
//   const { resourceId, tagId } = req.body;
//   const userId = res.locals.userId;

//   createResourceTag(resourceId, tagId, userId)
//     .then((resourceTag) => res.status(201).json(resourceTag))
//     .catch(next);
// });

router.post('/', jwtMiddleware.verifyToken, async (req, res, next) => {
  const { resourceId, tagIds } = req.body; // Expecting tagIds to be an array
  const userId = res.locals.userId;

  console.log('Route hit, Body:', req.body);
  console.log('Resource ID:', resourceId);
  console.log('User ID:', userId);
  console.log('Tag IDs:', tagIds);

  // Validate the input
  if (!resourceId || !Array.isArray(tagIds) || tagIds.length === 0) {
    return res.status(400).json({ error: 'Invalid resourceId or tagIds' });
  }

  // Convert resourceId and tagIds to integers
  const numericResourceId = parseInt(resourceId, 10);
  const numericTagIds = tagIds.map(tagId => parseInt(tagId, 10)).filter(id => !isNaN(id));

  if (isNaN(numericResourceId) || numericTagIds.length === 0) {
    return res.status(400).json({ error: 'Invalid resourceId or tagIds' });
  }

  try {
    // Process each tagId
    const resourceTags = await Promise.all(
      numericTagIds.map(tagId => createResourceTag(numericResourceId, tagId, userId))
    );

    return res.status(201).json({
      message: 'Tags added to resource successfully',
      resourceTags,
    });
  } catch (error) {
    console.error('Error processing tags:', error);
    next(error); // Forward the error to the error-handling middleware
  }
});


// router.post('/', jwtMiddleware.verifyToken, async (req, res, next) => {
//   const { resourceId, tagIds } = req.body; // Expecting tagIds to be an array
//   const userId = res.locals.userId;

//   console.log('Route hit, Body:', req.body);
//   console.log('Resource ID:', resourceId);
//   console.log('User ID:', userId);
//   console.log('Tag IDs:', tagIds);

//   // Validate the input
//   if (!resourceId || !Array.isArray(tagIds) || tagIds.length === 0) {
//     return res.status(400).json({ error: 'Invalid resourceId or tagIds' });
//   }

//   try {
//     // Process each tagId
//     const resourceTags = await Promise.all(
//       tagIds.map(tagId => createResourceTag(resourceId, tagId, userId))
//     );

//     return res.status(201).json({
//       message: 'Tags added to resource successfully',
//       resourceTags,
//     });
//   } catch (error) {
//     console.error('Error processing tags:', error);
//     next(error); // Forward the error to the error-handling middleware
//   }
// });



// Route to remove a tag from a resource (only if owned by the user)
router.delete('/', jwtMiddleware.verifyToken, (req, res, next) => {
  const { resourceId, tagId } = req.body;
  const userId = res.locals.userId;

  deleteResourceTag(resourceId, tagId, userId)
    .then((deletedResourceTag) => res.status(200).json(deletedResourceTag))
    .catch(next);
});

module.exports = router;

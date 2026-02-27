const express = require('express');
const {
  getResourceByResourceId,
  getResourcesByUserId,
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
  createResourceTag,
  getMostBookmarkedResources,
  getPopularResources,
} = require('../models/Resource.model');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();

// Route to get a resource by resource ID
router.get('/Res/:id', (req, res) => {
  const { id } = req.params; // Extract the resource ID from the request params

  getResourceByResourceId(id)
    .then((resource) => res.status(200).json(resource)) // Return resource details as a response
    .catch((error) => {
      console.error('Error:', error);
      res.status(404).json({ error: 'Resource not found' }); // Handle resource not found
    });
});

// Route to get resources by user ID
router.get('/User/:userId', jwtMiddleware.verifyToken, (req, res, next) => {
  const { userId } = req.params;
  const requestingUserId = res.locals.userId;

  // Ensure users can only access their own resources
  if (parseInt(userId, 10) !== requestingUserId) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  getResourcesByUserId(userId)
    .then((resources) => res.status(200).json(resources))
    .catch(next);
});


// Route to get all resources
router.get('/', (req, res, next) => {
  console.log("router hit to get all resources");
  getAllResources()
    .then((resources) => res.status(200).json(resources))
    .catch(next);
});

// Route to create a new resource
router.post('/', jwtMiddleware.verifyToken, (req, res, next) => {
  const { title, description } = req.body;
  const createdById = res.locals.userId;

  createResource(title, description, createdById)
    .then((resource) => res.status(201).json(resource))
    .catch(next);
});

// Route to update a resource (only if owned by the user)
router.put('/:id', jwtMiddleware.verifyToken, (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  const userId = res.locals.userId;

  updateResource(id, data, userId)
    .then((updatedResource) => res.status(200).json(updatedResource))
    .catch(next);
});

// Route to delete a resource (only if owned by the user)
router.delete('/:id', jwtMiddleware.verifyToken, (req, res, next) => {
  const { id } = req.params;
  const userId = res.locals.userId;

  deleteResource(id, userId)
    .then((deletedResource) => res.status(200).json(deletedResource))
    .catch(next);
});

// Add multiple tags to a resource
router.post('/add-tags', jwtMiddleware.verifyToken, async (req, res, next) => {
  const { resourceId, tagIds } = req.body;
  const userId = res.locals.userId;

  try {
    await Promise.all(tagIds.map(tagId => createResourceTag(resourceId, tagId, userId)));
    res.status(201).json({ message: 'Tags added successfully' });
  } catch (error) {
    next(error);
  }
});

// Route to get the 5 most bookmarked resources within a specific time range (default last week)
router.get('/most-bookmarked',(req, res, next) => {
  const { startDate, endDate } = req.query;
  console.log("router hit", req.query);

  getMostBookmarkedResources(startDate, endDate)
    .then((resources) => res.status(200).json(resources))
    .catch(next);
});

// // Route to fetch popular resources
// router.get('/popular-resources', (req, res, next) => {
//   console.log("router hit");
//   getPopularResources()
//     .then((resources) => res.status(200).json(resources))
//     .catch(next);
// });

router.get('/popular-resources', (req, res) => {
  getPopularResources()
    .then((resources) => res.status(200).json(resources))
    .catch((err) => {
      console.error('Route error:', err);
      res.status(500).send('Internal Server Error');
    });
});




module.exports = router;

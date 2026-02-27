const express = require('express');
const {
  getResourcesByTagId,
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
} = require('../models/Tag.model');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();



// Route to get all resources related to a specific tag ID
router.get('/:id/resources', (req, res, next) => {
  const { id } = req.params;

  getResourcesByTagId(id)
    .then((resources) => res.status(200).json(resources))
    .catch(next);
});


// Route to get all tags
router.get('/', (req, res, next) => {
  getAllTags()
    .then((tags) => res.status(200).json(tags))
    .catch(next);
});

// Route to create a new tag
router.post('/', jwtMiddleware.verifyToken, (req, res, next) => {
  const { name } = req.body;
  const userId = res.locals.userId;

  createTag(name, userId)
    .then((tag) => res.status(201).json(tag))
    .catch(next);
});

// Route to update a tag by ID (only if owned by the user)
router.put('/:id', jwtMiddleware.verifyToken, (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  const userId = res.locals.userId;

  updateTag(id, data, userId)
    .then((updatedTag) => res.status(200).json(updatedTag))
    .catch(next);
});

// Route to delete a tag by ID (only if owned by the user)
router.delete('/:id', jwtMiddleware.verifyToken, (req, res, next) => {
  const { id } = req.params;
  const userId = res.locals.userId;

  deleteTag(id, userId)
    .then((deletedTag) => res.status(200).json(deletedTag))
    .catch(next);
});

module.exports = router;

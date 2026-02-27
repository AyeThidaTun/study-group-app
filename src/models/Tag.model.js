const prisma = require('./prismaClient');

// Get all resources associated with a specific tag ID
module.exports.getResourcesByTagId = function getResourcesByTagId(tagId) {
  const intTagId = parseInt(tagId, 10); // Ensure the tagId is an integer

  return prisma.resourceTag
    .findMany({
      where: { tagId: intTagId }, // Filter by tagId
      include: {
        resource: true, // Include the associated resources
      },
    })
    .then((resourceTags) => {
      // Extract the resources from the resourceTags
      const resources = resourceTags.map((rt) => rt.resource);
      console.log(`Resources for tag ${intTagId}:`, resources);
      return resources;
    })
    .catch((error) => {
      console.error('Error fetching resources by tag ID:', error);
      throw error;
    });
};


// Create a new Tag
module.exports.createTag = function createTag(name, userId) {
  return prisma.tag.create({
    data: { name, userId }, // Ensure tags have an owner (userId)
  })
  .then((tag) => {
    console.log('Tag created:', tag);
    return tag;
  });
};

// Get all Tags
module.exports.getAllTags = function getAllTags() {
  return prisma.tag.findMany()
  .then((tags) => {
    console.log('All tags:', tags);
    return tags;
  });
};

// Update a Tag by ID (only if user is the owner)
module.exports.updateTag = function updateTag(id, data, userId) {
  // Convert id to integer before passing to Prisma
  const intId = parseInt(id, 10);

  return prisma.tag.findUnique({ where: { id: intId } })
    .then((tag) => {
      if (!tag) throw new Error('Tag not found');
      if (tag.userId !== userId) throw new Error('Unauthorized'); // Ownership check
      return prisma.tag.update({
        where: { id: intId },
        data,
      });
    })
    .then((updatedTag) => {
      console.log('Tag updated:', updatedTag);
      return updatedTag;
    });
};

// Delete a Tag by ID (only if user is the owner)
module.exports.deleteTag = function deleteTag(id, userId) {
  // Convert id to integer before passing to Prisma
  const intId = parseInt(id, 10);

  return prisma.tag.findUnique({ where: { id: intId } })
    .then((tag) => {
      if (!tag) throw new Error('Tag not found');
      if (tag.userId !== userId) throw new Error('Unauthorized'); // Ownership check
      return prisma.tag.delete({ where: { id: intId } });
    })
    .then((deletedTag) => {
      console.log('Tag deleted:', deletedTag);
      return deletedTag;
    });
};

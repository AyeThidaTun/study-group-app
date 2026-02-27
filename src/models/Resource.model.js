const prisma = require('./prismaClient');

// // Get resources by user ID
// module.exports.getResourcesByUserId = function getResourcesByUserId(userId) {
//   return prisma.resource.findMany({
//     where: { createdById: userId },
//     include: {
//       resourceTag: { include: { tag: true } }, // Include tags associated with each resource
//       User: true, // Include user details
//     },
//   })
//     .then((resources) => {
//       console.log('Resources fetched for user:', userId, resources);
//       return resources;
//     })
//     .catch((error) => {
//       console.error('Error fetching resources by user ID:', error);
//       throw error;
//     });
// };


// Get resource by resource ID
module.exports.getResourceByResourceId = function getResourceByResourceId(resourceId) {
  return prisma.resource.findUnique({
    where: {
      id: parseInt(resourceId, 10), // Ensure the ID is an integer
    },
    include: {
      resourceTag: {
        include: {
          tag: true,
        },
      },
      User: true, // Include user details (creator of the resource)
    },
  })
    .then((resource) => {
      if (!resource) {
        throw new Error('Resource not found');
      }
      return resource;
    })
    .catch((error) => {
      console.error('Error fetching resource by ID:', error);
      throw error;
    });
};

module.exports.getResourcesByUserId = function getResourcesByUserId(userId) {
  return prisma.resource.findMany({
    where: {
      createdById: parseInt(userId, 10), // Convert userId to an integer
    },
    include: {
      resourceTag: {
        include: {
          tag: true,
        },
      },
      User: true,
    },
  });
};



// module.exports.getMostBookmarkedResources = function getMostBookmarkedResources(startDate, endDate) {
//   // Ensure dates are provided or set defaults
//   const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7)); // Default: last 7 days
//   const end = endDate ? new Date(endDate) : new Date(); // Default: now

//   return prisma.bookmark.groupBy({
//     by: ['resourceId'],
//     where: {
//       createdAt: {
//         gte: start,
//         lte: end,
//       },
//     },
//     _count: {
//       resourceId: true,
//     },
//     orderBy: {
//       _count: {
//         resourceId: 'desc',
//       },
//     },
//     take: 10, // Limit to top 10 resources
//   })
//     .then(async (bookmarks) => {
//       // Fetch resource details
//       const resourceIds = bookmarks.map((b) => b.resourceId);
//       const resources = await prisma.resource.findMany({
//         where: { id: { in: resourceIds } },
//         include: {
//           User: true,
//         },
//       });

//       // Map bookmarks count to resources
//       return resources.map((resource) => ({
//         ...resource,
//         bookmarkCount: bookmarks.find((b) => b.resourceId === resource.id)._count.resourceId,
//       }));
//     });
// };


module.exports.getPopularResources = function getPopularResources() {
  return prisma.bookmark.groupBy({
    by: ['resourceId'],
    _count: {
      resourceId: true,
    },
    orderBy: {
      _count: {
        resourceId: 'desc',
      },
    },
    take: 6, // Fetch top 5 popular resources
  })
    .then(async (bookmarks) => {
      const resourceIds = bookmarks.map((b) => b.resourceId);
      const resources = await prisma.resource.findMany({
        where: { id: { in: resourceIds } },
        include: {
          User: true,
        },
      });

      return resources.map((resource) => ({
        ...resource,
        bookmarkCount: bookmarks.find((b) => b.resourceId === resource.id)._count.resourceId,
      }));
    });
};


module.exports.getMostBookmarkedResources = function getMostBookmarkedResources(startDate, endDate) {
  // Ensure dates are provided or set defaults
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7)); // Default: last 7 days
  const end = endDate ? new Date(endDate) : new Date(); // Default: now

  return prisma.bookmark.groupBy({
    by: ['resourceId'],
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    _count: {
      resourceId: true,
    },
    orderBy: {
      _count: {
        resourceId: 'desc',
      },
    },
    take: 6, // Limit to top 3 resources
  })
    .then(async (bookmarks) => {
      // Fetch resource details for the top 3 resources
      const resourceIds = bookmarks.map((b) => b.resourceId);
      const resources = await prisma.resource.findMany({
        where: { id: { in: resourceIds } },
        include: {
          User: true,
        },
      });

      // Map bookmarks count to resources
      return resources.map((resource) => ({
        ...resource,
        bookmarkCount: bookmarks.find((b) => b.resourceId === resource.id)._count.resourceId,
      }));
    });
};


// Create a new ResourceTag
module.exports.createResourceTag = function createResourceTag(resourceId, tagId, userId) {
  return prisma.resource.findUnique({ where: { id: resourceId } })
    .then((resource) => {
      if (!resource) throw new Error('Resource not found'); // Ensure the resource exists
      if (resource.createdById !== userId) throw new Error('Unauthorized'); // Ownership check

      return prisma.tag.findUnique({ where: { id: tagId } });
    })
    .then((tag) => {
      if (!tag) throw new Error('Tag not found'); // Ensure the tag exists
      if (tag.userId !== userId) throw new Error('Unauthorized'); // Ownership check

      return prisma.resourceTag.create({
        data: {
          resourceId,
          tagId,
          userId,
        },
      });
    })
    .then((resourceTag) => {
      console.log('ResourceTag created:', resourceTag);
      return resourceTag;
    });
};


// Create a new Resource
module.exports.createResource = function createResource(title, description, createdById) {
    return prisma.resource.create({
      data: {
        title,
        description,
        createdById,
      },
    })
    .then((resource) => {
      // console.log('Resource created:', resource);
      return resource;
    });
  };
  
  // Get all Resources
  module.exports.getAllResources = function getAllResources() {
    return prisma.resource.findMany({
      include: { User: true, resourceTag: { include: { tag: true } } },
    })
    .then((resources) => {
      
      return resources;
    });
  };
  
// Update a Resource by ID (only if user is the owner)
module.exports.updateResource = function updateResource(id, data, userId) {
  const resourceId = parseInt(id, 10); // Convert `id` to an integer

  return prisma.resource.findUnique({ where: { id: resourceId } })
    .then((resource) => {
      if (!resource) throw new Error('Resource not found');
      if (resource.createdById !== userId) throw new Error('Unauthorized'); // Ownership check
      return prisma.resource.update({
        where: { id: resourceId },
        data,
      });
    })
    .then((updatedResource) => {
      console.log('Resource updated:', updatedResource);
      return updatedResource;
    });
};

// Delete a Resource by ID (only if user is the owner)
module.exports.deleteResource = function deleteResource(id, userId) {
  const resourceId = parseInt(id, 10); // Convert `id` to an integer

  return prisma.resource.findUnique({ where: { id: resourceId } })
    .then((resource) => {
      if (!resource) throw new Error('Resource not found');
      if (resource.createdById !== userId) throw new Error('Unauthorized'); // Ownership check
      return prisma.resource.delete({ where: { id: resourceId } });
    })
    .then((deletedResource) => {
      console.log('Resource deleted:', deletedResource);
      return deletedResource;
    });
};

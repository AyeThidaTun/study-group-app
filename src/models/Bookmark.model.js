const prisma = require('./prismaClient');


module.exports.getBookmarkById = async function getBookmarkById(id, userId) {
  try {
    // Find the bookmark
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
      include: {
        resource: true, // Include the associated resource, if needed
      },
    });

    if (!bookmark) {
      throw new Error('Bookmark not found');
    }

    if (bookmark.userId !== userId) {
      throw new Error('Unauthorized');
    }

    console.log('Bookmark fetched:', bookmark);
    return bookmark;
  } catch (error) {
    console.error('Error fetching bookmark:', error);
    throw error;
  }
};



module.exports.updateBookmarkProgress = async function updateBookmarkProgress(id, userId, progress) {
  try {
    const bookmark = await prisma.bookmark.findUnique({ where: { id } });

    if (!bookmark) {
      throw new Error('Bookmark not found');
    }

    if (bookmark.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: { progress },
    });

    console.log('Bookmark progress updated:', updatedBookmark);
    return updatedBookmark;

  } catch (error) {
    console.error('Error updating bookmark progress:', error);
    throw error;
  }
};


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



module.exports.createBookmark = function createBookmark(userId, resourceId) {
  // Convert resourceId to integer if it's a string
  const resourceIdInt = parseInt(resourceId, 10);

  if (isNaN(resourceIdInt)) {
      throw new Error('Invalid resourceId, must be an integer.');
  }

  // Check if the bookmark already exists for the user and resource
  return prisma.bookmark.findFirst({
    where: {
      userId: userId,
      resourceId: resourceIdInt
    }
  })
  .then(existingBookmark => {
    if (existingBookmark) {
      throw new Error('This resource is already bookmarked.');
    }

    // If no existing bookmark is found, create a new one
    return prisma.bookmark.create({
      data: {
        userId,
        resourceId: resourceIdInt,  // Ensure it's an integer
      }
    });
  })
  .then((bookmark) => {
    console.log('Bookmark created:', bookmark);
    return bookmark;
  })
  .catch((error) => {
    console.error('Error creating bookmark:', error);
    throw error;
  });
};

  // Get all Bookmarks for a User
  module.exports.getBookmarksByUser = function getBookmarksByUser(userId) {
    return prisma.bookmark.findMany({
      where: { userId },
      include: { resource: true },
    })
    .then((bookmarks) => {
      console.log(`Bookmarks for user ${userId}:`, bookmarks);
      return bookmarks;
    });
  };
  
  module.exports.deleteBookmark = async function deleteBookmark(id, userId) {
    try {
      const bookmark = await prisma.bookmark.findUnique({ where: { id } });
  
      if (!bookmark) {
        throw new Error('Bookmark not found');
      }
  
      if (bookmark.userId !== userId) {
        throw new Error('Unauthorized');
      }
  
      const deletedBookmark = await prisma.bookmark.delete({ where: { id } });
      console.log('Bookmark deleted:', deletedBookmark);
      return deletedBookmark;
  
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  };
  

  ////////////////edited
  module.exports.updateBookmarkStatus = async function updateBookmarkStatus(id, userId, newStatus) {
    try {
      // Validate the status
      const validStatuses = ['UNREAD', 'READING', 'FINISHED'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status value');
      }
  
      // Find the bookmark
      const bookmark = await prisma.bookmark.findUnique({ where: { id } });
  
      if (!bookmark) {
        throw new Error('Bookmark not found');
      }
  
      if (bookmark.userId !== userId) {
        throw new Error('Unauthorized');
      }
  
      // Update the bookmark's status
      const updatedBookmark = await prisma.bookmark.update({
        where: { id },
        data: { status: newStatus },
      });
  
      console.log('Bookmark status updated:', updatedBookmark);
      return updatedBookmark;
  
    } catch (error) {
      console.error('Error updating bookmark status:', error);
      throw error;
    }
  };

  
  
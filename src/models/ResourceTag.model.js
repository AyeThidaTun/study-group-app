const prisma = require('./prismaClient');



// // Link a Tag to a Resource (only if user owns the resource)
// module.exports.createResourceTag = function createResourceTag(resourceId, tagId, userId) {
//     return prisma.resource.findUnique({ where: { id: resourceId } })
//       .then((resource) => {
//         if (resource.createdById !== userId) throw new Error('Unauthorized'); // Ownership check
//         return prisma.resourceTag.create({
//           data: { resourceId, tagId },
//         });
//       })
//       .then((resourceTag) => {
//         console.log('ResourceTag created:', resourceTag);
//         return resourceTag;
//       });
//   };

module.exports.createResourceTag = function createResourceTag(resourceId, tagId, userId) {
  return prisma.resource.findUnique({ where: { id: resourceId } })
    .then((resource) => {
      if (!resource) throw new Error('Resource not found'); // Ensure the resource exists
      if (resource.createdById !== userId) throw new Error('Unauthorized'); // Ownership check

      // Create the resource tag association
      return prisma.resourceTag.create({
        data: {
          resource: { connect: { id: resourceId } }, // Connect the resource
          tag: { connect: { id: tagId } },           // Connect the tag
          user: { connect: { userId } },             // Connect the user
        },
      });
    })
    .then((resourceTag) => {
      console.log('ResourceTag created:', resourceTag);
      return resourceTag;
    });
};
// module.exports.createResourceTag = function createResourceTag(resourceId, tagId, userId) {
//   return prisma.resource.findUnique({ where: { id: resourceId } })
//     .then((resource) => {
//       if (!resource) throw new Error('Resource not found'); // Ensure the resource exists
//       if (resource.createdById !== userId) throw new Error('Unauthorized'); // Ownership check

//       return prisma.resourceTag.create({
//         data: {
//           resource: { connect: { id: resourceId } }, // Connect the resource
//           tag: { connect: { id: tagId } },           // Connect the tag
//           user: { connect: { userId } }                // Connect the user
//         }
//       });
//     })
//     .then((resourceTag) => {
//       console.log('ResourceTag created:', resourceTag);
//       return resourceTag;
//     });
// };



// module.exports.createResourceTag = function createResourceTag(resourceId, tagId, userId) {
//   return prisma.resource.findUnique({ where: { id: resourceId } })
//     .then((resource) => {
//       if (!resource) throw new Error('Resource not found'); // Ensure the resource exists
//       if (resource.createdById !== userId) throw new Error('Unauthorized'); // Ownership check
//       return prisma.resourceTag.create({
//         data: { 
//           resourceId, 
//           tagId,
//           // Connect the existing resource and tag
//           resource: {
//             connect: { id: resourceId }, // This ensures the resource is linked
//           },
//           tag: {
//             connect: { id: tagId }, // This ensures the tag is linked
//           },
//           user: {
//             connect: { userId }, // Connect the user based on userId (you can adjust this if you need the user to be created or connected in a different way)
//           },
//         }
//       });
//     })
//     .then((resourceTag) => {
//       console.log('ResourceTag created:', resourceTag);
//       return resourceTag;
//     });
// };

  
 // Get all Tags for a Resource
module.exports.getTagsByResource = function getTagsByResource(resourceId) {
  return prisma.resourceTag.findMany({
    where: { resourceId },
    include: { tag: true },
  })
  .then((tags) => {
    console.log(`Tags for resource ${resourceId}:`, tags);
    return tags;
  });
};

  // Unlink a Tag from a Resource (only if user owns the resource)
  module.exports.deleteResourceTag = function deleteResourceTag(resourceId, tagId, userId) {
    return prisma.resource.findUnique({ where: { id: resourceId } })
      .then((resource) => {
        if (resource.createdById !== userId) throw new Error('Unauthorized'); // Ownership check
        return prisma.resourceTag.delete({
           // eslint-disable-next-line camelcase
          where: { resourceId_tagId: { resourceId, tagId } },
        });
      })
      .then((deletedResourceTag) => {
        console.log('ResourceTag deleted:', deletedResourceTag);
        return deletedResourceTag;
      });
  };
  
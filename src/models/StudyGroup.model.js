const prisma = require('./prismaClient');

// Fetch all study groups
module.exports.getAllStudyGroups = async function () {
  try {
      const groups = await prisma.studyGroup.findMany({
          include: {
              members: {
                  select: {
                      userId: true, // Include only userId of members
                  },
              },
          },
      });

      // Add member count to each group
      const groupsWithMemberCount = groups.map(group => ({
          ...group,
          memberCount: group.members.length, // Count the number of members
          members: group.members.map(member => member.userId), // Transform members to an array of user IDs
      }));

      console.log(groupsWithMemberCount); // For debugging purposes

      return groupsWithMemberCount;
  } catch (error) {
      console.error('Error fetching study groups:', error);
      throw new Error('Error fetching study groups');
  }
};


// Create a new study group
module.exports.createStudyGroup = async function (studyGroupData) {
  try {
    // Create the study group
    const newGroup = await prisma.studyGroup.create({
      data: studyGroupData,
    });

    // Automatically add the creator to the UserStudyGroup table
    await prisma.userStudyGroup.create({
      data: {
        userId: studyGroupData.createdBy,
        groupId: newGroup.groupId, // Use the ID of the newly created group
      },
    });

    return newGroup;
  } catch (error) {
    console.error('Error creating study group:', error);
    throw new Error('Error creating study group');
  }
};

// Function to add a user to a study group
module.exports.addUserToGroup = async function (userId, groupId) {
    try {
      // Check if the user and group exist
      const user = await prisma.user.findUnique({ where: { userId } });
      if (!user) throw new Error('User not found');
  
      const group = await prisma.studyGroup.findUnique({ where: { groupId } });
      if (!group) throw new Error('Study group not found');
  
      // Check if the user is already a member of the group
      const existingMembership = await prisma.userStudyGroup.findUnique({
        where: { 
        // eslint-disable-next-line camelcase
        userId_groupId: { userId, groupId } },
      });
      if (existingMembership) throw new Error('User is already a member of this study group');
  
      // Add the user to the study group (insert into UserStudyGroup)
      return await prisma.userStudyGroup.create({
        data: {
          userId,
          groupId,
        },
      });
    } catch (error) {
      console.error('Error joining study group:', error);
      throw new Error(error.message || 'Error joining study group');
    }
  };

// Fetch groups joined by a specific user
module.exports.getUserJoinedGroups = async function (userId) {
  try {
    const memberships = await prisma.userStudyGroup.findMany({
      where: { userId },
      include: {
        studyGroup: true, // Include study group details
      },
    });

    console.log('Fetched groups for user:', memberships);

    return memberships.map((membership) => membership.studyGroup);
  } catch (error) {
    console.error('Error fetching joined groups:', error);
    throw new Error('Error fetching joined groups');
  }
};

// Remove a user from a study group
module.exports.removeUserFromGroup = async function (userId, groupId) {
  try {
    const membership = await prisma.userStudyGroup.findUnique({
      where: { 
      // eslint-disable-next-line camelcase
      userId_groupId: { userId, groupId } },
    });
    if (!membership) throw new Error('Membership not found');

    return await prisma.userStudyGroup.delete({
      where: { 
      // eslint-disable-next-line camelcase
      userId_groupId: { userId, groupId } },
    });
  } catch (error) {
    console.error('Error leaving study group:', error);
    throw new Error('Error leaving study group');
  }
};

module.exports.deleteStudyGroupAsCreator = async function (userId, groupId) {
  try {
    // Verify the user is the creator of the group
    const group = await prisma.studyGroup.findUnique({
      where: { groupId },
    });

    if (!group) throw new Error("Study group not found");
    if (group.createdBy !== userId) throw new Error("You are not authorized to delete this group");

    // Delete the study group and its related memberships
    await prisma.userStudyGroup.deleteMany({ where: { groupId } }); // Remove all memberships
    await prisma.studyGroup.delete({ where: { groupId } }); // Remove the group itself

    return { message: "Group deleted successfully" };
  } catch (error) {
    console.error("Error deleting study group:", error);
    throw new Error(error.message || "Error deleting study group");
  }
};


// Fetch study group by groupId
module.exports.getStudyGroupById = async function (groupId) {
  try {
    const group = await prisma.studyGroup.findUnique({
      where: {
        groupId: parseInt(groupId), // Ensure groupId is an integer
      },
      include: {
        members: {
          select: {
            userId: true, // Include only userId of members
            user: {        // Assuming you have a User model related to members
              select: {
                name: true, // Include the user's name
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new Error("Study group not found");
    }

    // Add member count and transform members
    const groupWithDetails = {
      ...group,
      memberCount: group.members.length, // Count the number of members
      members: group.members.map((member) => ({
        userId: member.userId,
        name: member.user.name, // Assuming `name` is a field in the User model
      })),
    };

    console.log(groupWithDetails); // For debugging purposes

    return groupWithDetails;
  } catch (error) {
    console.error("Error fetching study group by ID:", error);
    throw new Error("Error fetching study group");
  }
};

module.exports.getGroupNameById = async function (groupId) {
  try {
    const groupName = await prisma.studyGroup.findUnique({
      where: { groupId: parseInt(groupId) },
    });

    if (!groupName) {
      throw new Error("Study group not found");
    }

    console.log('group name fetched: ', groupName); // For debugging purposes

    return groupName;
  } catch (error) {
    console.error("Error fetching study group by ID:", error);
    throw new Error("Error fetching study group");
  }
};

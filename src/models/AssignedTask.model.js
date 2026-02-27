const prisma = require('./prismaClient');

module.exports = {
  // AssignedTask.model.js
  getAssignedByUser: async (userId) => {
    return prisma.assignedTask.findMany({
      where: { assignerId: userId },
      include: {
        assignee: {
          select: {
            userId: true,
            name: true,
            email: true
          }
        },
        todo: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // In AssignedTask.model.jss
getAssignedToUser: async (userId) => {
  return prisma.assignedTask.findMany({
    where: { assigneeId: userId },
    include: {
      assigner: {
        select: {
          userId: true,
          name: true,
          email: true
        }
      },
      todo: true
    },
    orderBy: { createdAt: 'desc' }
  });
},

  // AssignedTask.model.js
  createAssignment: async (taskData) => {
    // Validate required fields
    const requiredFields = ['title', 'dueDate', 'assignerId', 'assigneeId']; // Changed to singular
    const missingFields = requiredFields.filter(field => !taskData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  
    // Validate date format
    if (isNaN(new Date(taskData.dueDate).getTime())) {
      throw new Error('Invalid due date format');
    }
  
    return prisma.assignedTask.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        dueDate: new Date(taskData.dueDate),
        category: taskData.category,
        priority: taskData.priority,
        assignerId: parseInt(taskData.assignerId, 10),
        assigneeId: taskData.assigneeId, // Changed to singular
        status: 'PENDING'
      }
    });
  },

  updateAssignment: async (id, updateData) => {
    return prisma.assignedTask.update({
      where: { id },
      data: updateData
    });
  },
  getUserStudyGroups: async (userId) => {
    return prisma.userStudyGroup.findMany({
      where: { userId },
      include: { studyGroup: true }
    });
  },

  getGroupMembers: async (groupId) => {
    return prisma.userStudyGroup.findMany({
      where: { groupId },
      include: { user: true }
    });
  },

  getCommonGroups: async (assignerId, assigneeId) => {
    const assignerGroups = await prisma.userStudyGroup.findMany({
      where: { userId: assignerId },
      select: { groupId: true }
    });

    const assigneeGroups = await prisma.userStudyGroup.findMany({
      where: { userId: assigneeId },
      select: { groupId: true }
    });

    const commonGroups = assignerGroups.filter(ag => 
      assigneeGroups.some(aeg => aeg.groupId === ag.groupId)
    );
    
    return commonGroups.length > 0;
  },

  validateGroupMembership: async (assignerId, assigneeId) => {
    const assignerGroups = await prisma.userStudyGroup.findMany({
      where: { userId: assignerId },
      select: { groupId: true }
    });

    const commonGroups = await prisma.userStudyGroup.findMany({
      where: {
        userId: assigneeId,
        groupId: { in: assignerGroups.map(g => g.groupId) }
      }
    });

    return commonGroups.length > 0;
  },

  getAssignedByUserWithStatus: async (userId) => {
    return prisma.assignedTask.findMany({
      where: { assignerId: userId },
      include: {
        assignee: true,
        todo: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },
};
const prisma = require('./prismaClient');

module.exports.getGlobalNotifications = async function (userId, statusFilter, sortBy) {
  // First, get all global notifications
  const globalNotifications = await prisma.notification.findMany({
    where: {
      isGlobal: true,
    },
    orderBy: {
      createdAt: 'desc', // Default ordering is descending by createdAt
    },
  });

  // Then, get all UserNotification entries for this user
  const userNotifications = await prisma.userNotification.findMany({
    where: {
      userId: userId,
      notificationId: {
        in: globalNotifications.map(n => n.id)
      },
    },
    select: {
      notificationId: true,
      status: true,
    }
  });

  // Create a map for quick lookup
  const userNotificationMap = new Map(
    userNotifications.map(un => [un.notificationId, un.status])
  );

  // Merge the data and default to 'UNREAD' if no UserNotification entry exists
  let notifications = globalNotifications.map(notification => ({
    ...notification,
    status: userNotificationMap.get(notification.id) || 'UNREAD',
  }));

  // Apply status filter if provided
  if (statusFilter) {
    notifications = notifications.filter(notification => notification.status === statusFilter);
  }

  // Sorting by date if needed (ascending or descending)
  if (sortBy === 'DATEASC') {
    notifications = notifications.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Ascending
  } else if (sortBy === 'DATEDESC') {
    notifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Descending
  }

  // Sorting by status if needed
  if (sortBy === 'READ' || sortBy === 'UNREAD') {
    notifications = notifications.sort((a) => {
      if (a.status === sortBy) {
        return -1;
      }
      return 1;
    });
  }

  return notifications;
};

module.exports.getPersonalNotifications = async function (userId, statusFilter, sortBy) {
  // Fetch personal notifications specifically linked to the user
  const userNotifications = await prisma.userNotification.findMany({
    where: {
      userId: parseInt(userId), // Match specific user ID
      notification: {
        isGlobal: false, // Exclude global notifications
      },
    },
    include: {
      notification: true, // Include related notification details
    },
    orderBy: {
      createdAt: 'desc', // Order by creation date of the UserNotification entry
    },
  });

  // If no matching notifications exist for the user, return an empty array
  if (!userNotifications.length) {
    return [];
  }

  // Map user notifications to include status and notification details
  let notifications = userNotifications.map((un) => ({
    ...un.notification, // Include notification details
    status: un.status, // Include user-specific status
  }));

  // Apply the status filter if provided
  if (statusFilter) {
    notifications = notifications.filter((notification) => notification.status === statusFilter);
  }

  // Sort by date if needed (ascending or descending)
  if (sortBy === 'DATEASC') {
    notifications = notifications.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Ascending
  } else if (sortBy === 'DATEDESC') {
    notifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Descending
  }

  // Sort by status if needed
  if (sortBy === 'READ' || sortBy === 'UNREAD') {
    notifications = notifications.sort((a) => {
      if (a.status === sortBy) {
        return -1;
      }
      return 1;
    });
  }

  return notifications;
};





// Mark a notification as read using notification id and user id
module.exports.markNotificationAsRead = async function (userId, notificationId) {
  // Check if a user-specific notification entry exists
  let userNotification = await prisma.userNotification.findFirst({
    where: {
      userId: userId,
      notificationId: notificationId,
    },
  });

  if (!userNotification) {
    // Create a new entry specific to this user
    userNotification = await prisma.userNotification.create({
      data: {
        userId: userId,
        notificationId: notificationId,
        status: 'READ', // Marking it as read during creation
        createdAt: new Date(),
      },
    });

    console.log(
      `User-specific notification created and marked as read for User ${userId}, Notification ${notificationId}.`
    );
  } else {
    // Update the existing entry for this user
    await prisma.userNotification.update({
      where: {
        id: userNotification.id, // Use unique ID of the specific entry
      },
      data: {
        status: 'READ',
      },
    });

    console.log(
      `User-specific notification updated and marked as read for User ${userId}, Notification ${notificationId}.`
    );
  }

  return userNotification;
};


// Mark a notification as unread
module.exports.markNotificationAsUnread = async function (userId, notificationId) {
  const userNotification = await prisma.userNotification.findFirst({
    where: {
      userId: userId,
      notificationId: notificationId,
    },
  });

  if (!userNotification) {
    // Create a new entry specific to this user
    await prisma.userNotification.create({
      data: {
        userId: userId,
        notificationId: notificationId,
        status: 'UNREAD',
        createdAt: new Date(),
      },
    });

    return { message: `User-specific notification created and marked as unread for User ${userId}, Notification ${notificationId}.` };
  }

  // Update the existing entry for this user
  await prisma.userNotification.update({
    where: {
      id: userNotification.id,
    },
    data: {
      status: 'UNREAD',
    },
  });

  return { message: `User-specific notification marked as unread for User ${userId}, Notification ${notificationId}.` };
};

// Schedule notification creation for tasks due soon and overdue tasks.
setInterval(module.exports.createTaskDueNotifications = async function () {
  const currentDateTime = new Date();
  const oneDayFromNow = new Date(currentDateTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

  // Get tasks due within 24 hours using raw SQL
  const tasksDueSoon = await prisma.$queryRaw`
    SELECT t.*, u."id" as "userId"
    FROM "Todo" t
    JOIN "User" u ON t."userId" = u."id"
    WHERE t."dueDate" BETWEEN ${currentDateTime} AND ${oneDayFromNow}
    AND t."completed" = false;
  `;

  for (const task of tasksDueSoon) {
    await prisma.$executeRaw`
      INSERT INTO "Notification" ("type", "title", "message")
      VALUES ('PERSONAL', ${`Task Due Soon: ${task.title}`}, ${`Your task "${task.title}" is due soon (within 24 hours)!`})
      RETURNING "id";
    `;

    // Get the last inserted notification ID
    const notificationId = await prisma.$queryRaw`
      SELECT "id" FROM "Notification"
      ORDER BY "createdAt" DESC
      LIMIT 1;
    `;

    if (notificationId.length > 0) {
      await prisma.$executeRaw`
        INSERT INTO "UserNotification" ("notificationId", "userId", "status")
        VALUES (${notificationId[0].id}, ${task.userId}, 'UNREAD');
      `;
    }
  }
}, 24 * 60 * 60 * 1000); // Runs every 1 hour



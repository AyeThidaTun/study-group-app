const prisma = require("./prismaClient");

// Save a new message to the database
module.exports.saveMessage = async function (content, groupId, userId, io) {
    try {
      const userExists = await prisma.user.findUnique({
        where: { userId: parseInt(userId) },
      });
      if (!userExists) {
        throw new Error(`User with ID ${userId} does not exist`);
      }
  
      const groupExists = await prisma.studyGroup.findUnique({
        where: { groupId: parseInt(groupId) },
      });
      if (!groupExists) {
        throw new Error(`Group with ID ${groupId} does not exist`);
      }
  
      const message = await prisma.message.create({
        data: {
          senderId: parseInt(userId),
          content,
          groupId: parseInt(groupId),
          createdAt: new Date(),
        },
      });
  
      const sender = await prisma.user.findUnique({
        where: { userId: parseInt(userId) },
        select: { name: true },
      });
  
      io.emit('chat message', {
        content: message.content,
        senderName: sender ? sender.name : 'Unknown',
      });
  
      return {
        ...message,
        senderName: sender ? sender.name : 'Unknown',
      };
    } catch (error) {
      console.error("Error saving message:", error);
      throw new Error("Error saving message");
    }
  };
  
module.exports.loadMessages = async function (groupId) {
  try {
    // Fetch messages for the group and include the sender's information (user name)
    const messages = await prisma.message.findMany({
      where: {
        groupId: parseInt(groupId), // Filter by groupId
      },
      select: {
        content: true, // Message content
        senderId: true, // The ID of the user who sent the message (correct field name)
        createdAt: true, // Optionally, you can include the timestamp of the message
      },
    });

    // For each message, retrieve the sender's name using the senderId
    const messagesWithSenderNames = await Promise.all(
      messages.map(async (message) => {
        const sender = await prisma.user.findUnique({
          where: {
            userId: message.senderId, // Use senderId instead of userId
          },
          select: {
            name: true, // Only select the user's name
          },
        });

        // Return the message along with the sender's name
        return {
          senderId: message.senderId,
          content: message.content,
          senderName: sender ? sender.name : "Unknown", // Default to 'Unknown' if user not found
          createdAt: message.createdAt, // Include message timestamp
        };
      })
    );

    return messagesWithSenderNames;
  } catch (error) {
    console.error("Error loading messages:", error);
    throw new Error("Error loading messages");
  }
};

module.exports.createPoll = async function (question, options, groupId, userId, io) {
  try {
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { userId: parseInt(userId) },
    });
    if (!userExists) throw new Error(`User with ID ${userId} does not exist`);

    // Check if group exists
    const groupExists = await prisma.studyGroup.findUnique({
      where: { groupId: parseInt(groupId) },
    });
    if (!groupExists) throw new Error(`Group with ID ${groupId} does not exist`);

    // Create the poll
    const poll = await prisma.poll.create({
      data: {
        question,
        groupId: parseInt(groupId),
        createdBy: parseInt(userId),
        createdAt: new Date(),
      },
    });

    // Save poll options
    const pollOptions = options.map((option) => ({
      pollId: poll.pollId,
      text: option,
    }));
    await prisma.pollOption.createMany({ data: pollOptions });

    // Fetch poll with options
    const savedPoll = await prisma.poll.findUnique({
      where: { pollId: poll.pollId },
      include: {
        options: {
          select: {
            pollOptionId: true,
            text: true,
            votes: true
          }
        },
        creator: { 
          select: { name: true }
        }
      },
    });

    // Emit poll event to group
    io.emit(`poll:${groupId}`, savedPoll);
    console.log('saved poll: ', savedPoll);
    return {
      pollId: savedPoll.pollId,
      question: savedPoll.question,
      createdBy: savedPoll.createdBy,
      creatorName: savedPoll.creator?.name || "Unknown", 
      options: savedPoll.options,
      createdAt: savedPoll.createdAt
    };
  } catch (error) {
    console.error("Error creating poll:", error);
    throw new Error("Error creating poll");
  }
};

module.exports.getPolls = async function (groupId) {
  try {
    console.log(`Fetching polls from database for groupId: ${groupId}`);

    // Fetch polls and include options & creator's name in a single query
    const polls = await prisma.poll.findMany({
      where: { groupId: parseInt(groupId) },
      include: {
        options: {
          select: {
            pollOptionId: true,
            text: true,
            votes: true
          }
        },
        creator: { 
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the result
    return polls.map(poll => ({
      pollId: poll.pollId,
      question: poll.question,
      createdBy: poll.createdBy,
      creatorName: poll.creator?.name || "Unknown", 
      options: poll.options,
      createdAt: poll.createdAt
    }));

  } catch (error) {
    console.error("Error loading polls:", error);
    throw new Error("Error loading polls");
  }
};

module.exports.updateVote = async function (pollId, pollOptionId) {
  try {
    console.log(`Updating vote for pollId: ${pollId}, pollOptionId: ${pollOptionId}`);

    // Fetch the poll option and ensure it exists
    const pollOption = await prisma.pollOption.findUnique({
      where: { pollOptionId: parseInt(pollOptionId) },
    });

    if (!pollOption) {
      throw new Error('Poll option not found');
    }

    // Increment the vote count for the selected poll option
    const updatedPollOption = await prisma.pollOption.update({
      where: { pollOptionId: parseInt(pollOptionId) },
      data: {
        votes: pollOption.votes + 1,
      },
    });

    console.log('Poll option updated:', updatedPollOption);
    return updatedPollOption;
  } catch (error) {
    console.error('Error updating vote:', error);
    throw new Error('Error updating vote');
  }
};
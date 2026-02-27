const prisma = require("./prismaClient");

module.exports.createFeedback = async function (feedbackData) {
    try {
      const feedbackEntries = [];
      
      // Loop through each member in the feedbackData
      for (const memberId in feedbackData.members) {
        const memberFeedback = feedbackData.members[memberId];
  
        // Ensure ratings are present before calculating the average
        if (memberFeedback.ratings) {
          const ratings = Object.values(memberFeedback.ratings).map(Number);
          const totalRating = parseInt(ratings.reduce((sum, rating) => sum + rating, 0));
          console.log('total rating: ', totalRating);
          const avgRating = parseFloat((totalRating / ratings.length).toFixed(2)); // Calculate average rating
          console.log('average rating: ', avgRating);
  
          // Update feedback in the database
          const feedbackEntry = await prisma.feedback.update({
            where: {
              // eslint-disable-next-line camelcase
              bookingId_giverId_receiverId: {
                bookingId: parseInt(feedbackData.bookingId),
                giverId: parseInt(feedbackData.giverId),
                receiverId: parseInt(memberId),
              },
            },
            data: {
              comments: memberFeedback.comments || null,
              rating: avgRating,
              state: "COMPLETED",
            },
          });

          feedbackEntries.push(feedbackEntry);
          console.log('feedback entries: ', feedbackEntries);
        }
      }
  
      return { success: true, feedbackEntries };
    } catch (error) {
      console.error("Error creating feedback:", error.message);
  
      // Return specific error messages if needed
      if (error.code === "P2025") {
        return { success: false, message: "Feedback entry not found" };
      }
  
      return { success: false, message: "Error creating feedback" };
    }
  };
  

module.exports.getGroupDetailsByGroupId = async function (groupId) {
  try {
    // Fetch group details by groupId, including the group name and its members
    const groupDetails = await prisma.studyGroup.findUnique({
      where: { groupId: parseInt(groupId) },
      select: {
        name: true, // Select group name
        members: {
          select: {
            userId: true,
            user: {
              select: {
                name: true, // Select member name from the User relation
              },
            },
          },
        },
      },
    });

    if (!groupDetails) {
      throw new Error("Group not found");
    }

    return groupDetails;
  } catch (error) {
    console.error("Error fetching group details:", error.message);
    throw new Error("Error fetching group details");
  }
};

module.exports.getGroupIdByBookingId = async function (bookingId) {
  try {
    // Fetch the booking with the provided bookingId
    const booking = await prisma.booking.findUnique({
      where: {
        bookingId: bookingId,
      },
      select: {
        groupId: true, // Only select the groupId field
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking.groupId;
  } catch (error) {
    console.error("Error fetching groupId by bookingId:", error.message);
    throw new Error("Error fetching groupId");
  }
};

module.exports.updateState = async function (bookingId, giverId, receiverId, state) {
    try {
      // Update the feedback state for the specified bookingId, giverId, and receiverId
      const updatedFeedback = await prisma.feedback.updateMany({
        where: {
          bookingId: parseInt(bookingId),
          giverId: parseInt(giverId),
          receiverId: parseInt(receiverId),
        },
        data: {
          state: state,
        },
      });
  
      if (updatedFeedback.count === 0) {
        throw new Error("No feedback entry found for the given bookingId, giverId, and receiverId.");
      }
  
      return updatedFeedback;
    } catch (error) {
      console.error("Error updating feedback state:", error.message);
      throw new Error("Error updating feedback state");
    }
  };

  // Model to Get Pending Feedbacks of User
module.exports.getPendingUserFeedbacks = async function (userId, groupFilter) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        studyGroup: {
          name: groupFilter === "all" ? undefined : groupFilter,
          members: {
            some: {
              userId: parseInt(userId),
            },
          },
        },
        status: "confirmed", // Only confirmed bookings
        Feedback: {
          some: {
            giverId: parseInt(userId),
            state: "PENDING", // Filter only pending feedback
          },
        },
      },
      orderBy: { bookingDate: "desc" },
      include: {
        studyRoom: true,
        roomSlot: true,
        studyGroup: true,
        Feedback: true,
      },
    });

    return bookings.map((booking) => {
      const pendingFeedback = booking.Feedback.filter(
        (fb) => fb.giverId === parseInt(userId) && fb.state === "PENDING"
      );

      return {
        bookingId: booking.bookingId,
        status: booking.status,
        roomName: booking.studyRoom.name,
        roomLocation: booking.studyRoom.location,
        bookingDate: booking.bookingDate.toISOString().split("T")[0],
        startTime: booking.roomSlot.startTime,
        endTime: booking.roomSlot.endTime,
        groupName: booking.studyGroup.name,
        feedbackState: "PENDING", // Since we're filtering for pending
        feedbackId: pendingFeedback.map((fb) => fb.feedbackId), // Optional, in case you need IDs
      };
    });
  } catch (error) {
    console.error("Error fetching pending feedbacks:", error);
    throw new Error("Error fetching pending feedbacks");
  }
};

module.exports.getDisclosedUserFeedbacks = async function (userId, groupFilter) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        studyGroup: {
          name: groupFilter === "all" ? undefined : groupFilter,
          members: {
            some: {
              userId: parseInt(userId),
            },
          },
        },
        status: "confirmed",
        Feedback: {
          some: {
            receiverId: parseInt(userId),
            state: "DISCLOSED",
          },
        },
      },
      orderBy: { bookingDate: "desc" },
      include: {
        studyRoom: true,
        roomSlot: true,
        studyGroup: true,
        Feedback: {
          include: {
            Giver: {
              select: {
                userId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Flatten the response: return one entry per feedback
    const disclosedFeedbacks = [];
    
    bookings.forEach((booking) => {
      booking.Feedback.forEach((fb) => {
        console.log('receiver id: ', fb.receiverId);
        if (fb.receiverId === parseInt(userId) && fb.state === "DISCLOSED") {
          disclosedFeedbacks.push({
            feedbackId: fb.feedbackId,
            bookingId: booking.bookingId,
            roomName: booking.studyRoom.name,
            roomLocation: booking.studyRoom.location,
            bookingDate: booking.bookingDate.toISOString().split("T")[0],
            startTime: booking.roomSlot.startTime,
            endTime: booking.roomSlot.endTime,
            groupName: booking.studyGroup.name,
            feedbackState: "DISCLOSED",
            feedbackComments: fb.comments,
            feedbackRating: fb.rating,
            feedbackGiver: fb.Giver.name, // Each feedback now has its own giver
          });
        }
      });
    });
    console.log('disclosed feedbacks: ', disclosedFeedbacks);
    return disclosedFeedbacks;
  } catch (error) {
    console.error("Error fetching disclosed feedbacks:", error);
    throw new Error("Error fetching disclosed feedbacks");
  }
};

module.exports.getFilteredFeedbacks = async function (userId, startDate, endDate) {
  console.log('startDate from model: ', startDate);
  console.log('endDate from model: ', endDate);
  
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        studyGroup: {
          members: {
            some: {
              userId: 4
            }
          }
        },
        status: "confirmed",
        Feedback: {
          some: {
            receiverId: 4,
            state: "DISCLOSED"
          }
        },
        bookingDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: {
        bookingDate: "desc"
      },
      include: {
        studyRoom: true,
        roomSlot: true,
        studyGroup: {
          select: {
            name: true  // Now correctly inside the include block
          }
        },
        Feedback: {
          include: {
            Giver: {
              select: {
                userId: true,
                name: true
              }
            }
          }
        }
      }
    });        

    // Flatten the response: return one entry per feedback
    const disclosedFeedbacks = [];
    
    bookings.forEach((booking) => {
      booking.Feedback.forEach((fb) => {
        if (fb.receiverId === parseInt(userId) && fb.state === "DISCLOSED") {
          disclosedFeedbacks.push({
            feedbackId: fb.feedbackId,
            bookingId: booking.bookingId,
            roomName: booking.studyRoom.name,
            roomLocation: booking.studyRoom.location,
            bookingDate: booking.bookingDate.toISOString().split("T")[0],
            startTime: booking.roomSlot.startTime,
            endTime: booking.roomSlot.endTime,
            groupName: booking.studyGroup.name,
            feedbackState: "DISCLOSED",
            feedbackComments: fb.comments,
            feedbackRating: fb.rating,
            feedbackGiver: fb.Giver.name, // Each feedback now has its own giver
          });
        }
      });
    });

    return disclosedFeedbacks;
  } catch (error) {
    console.error("Error fetching filtered feedbacks:", error);
    throw new Error("Error fetching filtered feedbacks");
  }
};

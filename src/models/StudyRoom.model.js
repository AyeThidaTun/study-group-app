const prisma = require("./prismaClient");

// Fetch all study rooms
module.exports.getAllStudyRooms = async function () {
  try {
    const rooms = await prisma.studyRoom.findMany();

    const roomsWithDetails = rooms.map((room) => ({
      ...room,
    }));

    // console.log(roomsWithDetails); // For debugging purposes
    return roomsWithDetails;
  } catch (error) {
    console.error("Error fetching study rooms:", error);
    throw new Error("Error fetching study rooms");
  }
};

module.exports.getRoomTypes = async function () {
  try {
    const roomTypes = await prisma.studyRoom.findMany({
      select: { roomType: true },
      distinct: ["roomType"],
    });
    return roomTypes.map((room) => room.roomType);
  } catch (error) {
    console.error("Error fetching room types:", error);
    throw new Error("Error fetching room types");
  }
};

module.exports.getStudyRoomsByType = async function (roomType) {
  try {
    // Check if a specific `roomType` is provided
    const filter = roomType ? { roomType } : {};

    // Fetch filtered rooms or all rooms if no filter
    const rooms = await prisma.studyRoom.findMany({
      where: filter, // Apply filter conditionally
    });

    return rooms;
  } catch (error) {
    console.error("Error fetching study rooms by type:", error);
    throw new Error("Error fetching study rooms");
  }
};

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
    const groupsWithMemberCount = groups.map((group) => ({
      ...group,
      memberCount: group.members.length, // Count the number of members
      members: group.members.map((member) => member.userId), // Transform members to an array of user IDs
    }));

    console.log(groupsWithMemberCount); // For debugging purposes

    return groupsWithMemberCount;
  } catch (error) {
    console.error("Error fetching study groups:", error);
    throw new Error("Error fetching study groups");
  }
};

// Create a booking
module.exports.createBooking = async function (
  roomId,
  groupId,
  bookingDate,
  slotId
) {
  try {
    // Check if booking already exists
    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId: roomId,
        slotId: slotId,
        bookingDate: bookingDate,
        status: "confirmed", // Check if the status is confirmed
      },
    });

    if (existingBooking) {
      // Handle error: a confirmed booking already exists for this room at the selected time
      console.error(
        "Error creating booking: A confirmed booking already exists for this room at the selected time."
      );
      throw new Error(
        "A confirmed booking already exists for this room at the selected time."
      );
    }

    // Set the timeout to 30 minutes from the current time
    const timeoutPeriod = 30 * 60 * 1000; // 30 minutes in milliseconds
    const timeoutTimestamp = new Date(Date.now() + timeoutPeriod).toISOString(); // Calculate timeout

    // Proceed with creating a new booking if no existing booking is found
    const booking = await prisma.booking.create({
      data: {
        roomId: roomId,
        groupId: groupId,
        bookingDate: bookingDate,
        slotId: slotId,
        status: "pending",
        timeout: timeoutTimestamp,
      },
    });

    return booking; // Return the new booking
  } catch (error) {
    console.error("Error creating booking:", error.message);
    throw new Error("Error creating booking");
  }
};

module.exports.getAvailableSlotsForRoom = async function (
  roomId,
  selectedDate
) {
  try {
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0); // Set the time to 00:00:00 for consistency

    // Convert the date to the ISO format (YYYY-MM-DD) for comparison
    const formattedSelectedDate = selectedDateStart.toISOString();

    // Get the next day's date (to filter the bookings up until 23:59:59)
    const nextDay = new Date(selectedDateStart);
    nextDay.setDate(selectedDateStart.getDate() + 1); // Add one day to selectedDate
    const formattedNextDay = nextDay.toISOString();

    // Fetch StudyRoom along with its bookings and associated room slots
    const room = await prisma.studyRoom.findUnique({
      where: {
        roomId: roomId, // Make sure roomId is an integer
      },
      include: {
        bookings: {
          where: {
            bookingDate: {
              gte: formattedSelectedDate, // Start of the selected date
              lt: formattedNextDay, // Before the next day (end of the selected date)
            },
            status: "confirmed", // Only include bookings that are confirmed
          },
          include: {
            roomSlot: true, // Include the related RoomSlot for each booking
          },
        },
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    // Fetch all available room slots
    const allRoomSlots = await prisma.roomSlot.findMany();

    // Debugging: Log room bookings and available slots
    console.log("Room bookings:", room.bookings);
    console.log("All room slots:", allRoomSlots);

    // Identify available slots based on confirmed bookings for the selected date
    const availableSlots = allRoomSlots.map((slot) => {
      // Check if this slot is already booked with a confirmed booking
      const isAvailable = !room.bookings.some(
        (booking) => booking.roomSlot.slotId === slot.slotId
      );

      console.log(
        `Slot ${slot.slotId}: ${isAvailable ? "Available" : "Booked"}`
      );

      return {
        slotId: slot.slotId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: isAvailable,
      };
    });

    console.log("available slots from model:", availableSlots);

    return {
      roomId: room.roomId,
      name: room.name,
      roomType: room.roomType,
      location: room.location,
      capacity: room.capacity,
      slots: availableSlots,
    };
  } catch (error) {
    console.error("Error fetching available slots for room:", error);
    throw new Error("Error fetching available slots for room");
  }
};

module.exports.getUserBookings = async function (
  userId,
  sortOrder,
  statusFilter
) {
  try {
    console.log("sortOrder from params: ", sortOrder);
    console.log("filterOrder from params: ", statusFilter);

    const bookings = await prisma.booking.findMany({
      where: {
        studyGroup: {
          members: {
            some: {
              userId: parseInt(userId), // Ensure `userId` is an integer
            },
          },
        },
        status: statusFilter === "all" ? undefined : statusFilter, // If 'all' is selected, don't filter by status
      },
      orderBy:
        sortOrder === "asc"
          ? { bookingDate: "asc" }
          : sortOrder === "desc"
          ? { bookingDate: "desc" }
          : { createdAt: "desc" },
      include: {
        studyRoom: true, // Include room details
        roomSlot: true, // Include time slot details
        studyGroup: true, // Include group details
      },
    });

    if (!bookings || bookings.length === 0) {
      return [];
    }

    return bookings.map((booking) => ({
      bookingId: booking.bookingId,
      status: booking.status,
      roomName: booking.studyRoom.name,
      roomLocation: booking.studyRoom.location,
      bookingDate: booking.bookingDate.toISOString().split("T")[0], // Format to YYYY-MM-DD
      startTime: booking.roomSlot.startTime,
      endTime: booking.roomSlot.endTime,
      groupName: booking.studyGroup.name,
    }));
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw new Error("Error fetching user bookings");
  }
};

// Get confirmed bookings of user for feedback system
module.exports.getConfirmedUserBookings = async function (userId, groupFilter) {
  console.log('group filter from model: ', groupFilter);
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
      },
      orderBy: { bookingDate: "desc" },
      include: {
        studyRoom: true,
        roomSlot: true,
        studyGroup: true,
        Feedback: true, // Include related feedback data
      },
    });

    // Map bookings and filter feedback relevant to the user
    return bookings.map((booking) => {
      console.log("Feedback state from confirmed booking:", booking.Feedback);

      // Filter feedback where the logged-in user is the giver
      const userFeedback = booking.Feedback.filter(
        (fb) => fb.giverId === parseInt(userId)
      );

      // Determine feedback state for the logged-in user
      const feedbackState = userFeedback.length
        ? userFeedback.every((fb) => fb.state === "UNACTIVATED")
          ? "UNACTIVATED" // All feedback is UNACTIVATED
          : userFeedback.find((fb) => fb.state === "PENDING")?.state || // Check for PENDING
            userFeedback.find((fb) => fb.state === "EXPIRED")?.state || // Check for EXPIRED
            "COMPLETED" // Default to COMPLETED
        : "UNACTIVATED"; // No feedback exists

        console.log("Filtered user feedback:", userFeedback);
        console.log("Determined feedback state:", feedbackState);
        
      return {
        bookingId: booking.bookingId,
        status: booking.status,
        roomName: booking.studyRoom.name,
        roomLocation: booking.studyRoom.location,
        bookingDate: booking.bookingDate.toISOString().split("T")[0],
        startTime: booking.roomSlot.startTime,
        endTime: booking.roomSlot.endTime,
        groupName: booking.studyGroup.name,
        feedbackState: feedbackState,
        feedbackAllowed: feedbackState === "PENDING", // Allow feedback only when PENDING
        feedbackExpired: feedbackState === "EXPIRED", // Mark as expired if state is EXPIRED
      };
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw new Error("Error fetching user bookings");
  }
};


// Function to handle conflicting pending bookings and cancellation
async function handleConflictingBookings(prisma, bookingToConfirm) {
  const conflictingPendingBookings = await prisma.booking.findMany({
    where: {
      roomId: bookingToConfirm.roomId,
      slotId: bookingToConfirm.slotId,
      status: "pending",
    },
  });

  console.log("Conflicting pending bookings:", conflictingPendingBookings);

  // Cancel all conflicting pending bookings except the current one
  for (const booking of conflictingPendingBookings) {
    if (booking.bookingId !== bookingToConfirm.bookingId) {
      await prisma.booking.update({
        where: { bookingId: parseInt(booking.bookingId) },
        data: { status: "cancelled" },
      });
    }
  }
}

// Function to handle confirmation of a booking and cancellation of others
async function confirmBookingLogic(prisma, bookingId) {
  const bookingToConfirm = await prisma.booking.findUnique({
    where: { bookingId: parseInt(bookingId) },
  });

  if (!bookingToConfirm) {
    throw new Error("Booking not found");
  }

  // Check if any booking is already confirmed for the same room and time slot
  const existingConfirmedBooking = await prisma.booking.findFirst({
    where: {
      roomId: bookingToConfirm.roomId,
      slotId: bookingToConfirm.slotId,
      status: "confirmed",
    },
  });

  console.log("Existing confirmed booking:", existingConfirmedBooking);

  if (existingConfirmedBooking) {
    if (existingConfirmedBooking.bookingId !== bookingToConfirm.bookingId) {
      const cancelledBooking = await prisma.booking.update({
        where: { bookingId: parseInt(bookingToConfirm.bookingId) },
        data: { status: "cancelled" },
      });

      return {
        success: false,
        message:
          "Another booking is already confirmed. Your booking has been cancelled.",
        data: cancelledBooking,
      };
    }
  } else {
    await handleConflictingBookings(prisma, bookingToConfirm);
  }

  const confirmedBooking = await prisma.booking.update({
    where: { bookingId: parseInt(bookingId) },
    data: { status: "confirmed" },
  });

  return confirmedBooking;
}

// Function to create feedback entries for all group members
async function createFeedbackEntries(prisma, confirmedBooking) {
  const groupMembers = await prisma.userStudyGroup.findMany({
    where: { groupId: parseInt(confirmedBooking.groupId) },
  });

  for (const giver of groupMembers) {
    for (const receiver of groupMembers) {
      if (giver.userId !== receiver.userId) {
        const feedbackExists = await prisma.Feedback.findFirst({
          where: {
            bookingId: confirmedBooking.bookingId,
            giverId: giver.userId,
            receiverId: receiver.userId,
          },
        });

        if (!feedbackExists) {
          await prisma.Feedback.create({
            data: {
              bookingId: confirmedBooking.bookingId,
              giverId: giver.userId,
              receiverId: receiver.userId,
              state: "UNACTIVATED", // Set initial state
            },
          });

          console.log("Feedback created for:", {
            giver: giver.userId,
            receiver: receiver.userId,
            bookingId: confirmedBooking.bookingId,
          });
        } else {
          console.log("Feedback already exists for:", {
            giver: giver.userId,
            receiver: receiver.userId,
            bookingId: confirmedBooking.bookingId,
          });
        }
      }
    }
  }

  console.log("Feedback inserted!!");
}

// Main function to confirm the booking
module.exports.confirmBooking = async (bookingId) => {
  console.log("confirm booking reached");
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Confirm the booking logic
      const confirmedBooking = await confirmBookingLogic(prisma, bookingId);

      return confirmedBooking;
    });
    console.log('result: ', result)

    // Create feedback entries OUTSIDE the transaction
    await createFeedbackEntries(prisma, result);

    return {
      success: true,
      message: "Booking confirmed successfully!",
      data: result,
    };
  } catch (error) {
    console.error(error);
    console.error("Error confirming booking:", error.message);
    throw new Error(
      "An unexpected error occurred while confirming the booking."
    );
  }
};


// Cancel a booking
module.exports.cancelBooking = async (bookingId) => {
  try {
    const updatedBooking = await prisma.booking.update({
      where: {
        bookingId: parseInt(bookingId),
      },
      data: {
        status: "cancelled",
      },
    });
    return updatedBooking;
  } catch (error) {
    console.error("Error cancelling booking:", error.message);
    throw new Error("Failed to cancel booking.");
  }
};

module.exports.getUserConfirmedBookingsCount = async function (
  userId,
  statusFilter
) {
  try {
    const whereCondition = {
      studyGroup: {
        members: {
          some: {
            userId: parseInt(userId), // Ensure `userId` is an integer
          },
        },
      },
    };

    // Add status filter if it's not 'all'
    if (statusFilter !== "all") {
      whereCondition.status = statusFilter;
    }

    const count = await prisma.booking.count({
      where: whereCondition,
    });

    return count; // Return the count of bookings matching the filter
  } catch (error) {
    console.error("Error fetching confirmed bookings count:", error);
    throw new Error("Error fetching confirmed bookings count");
  }
};

module.exports.getUserBookingsWithCount = async function (
  userId,
  sortOrder,
  statusFilter
) {
  try {
    // Fetch user bookings based on status filter
    const bookings = await module.exports.getUserBookings(
      userId,
      sortOrder,
      statusFilter
    );

    // Fetch the count of confirmed bookings based on the same filter
    const confirmedBookingsCount =
      await module.exports.getUserConfirmedBookingsCount(userId, statusFilter);

    return {
      bookings,
      confirmedBookingsCount, // Include the count of confirmed bookings
    };
  } catch (error) {
    console.error("Error fetching user bookings with count:", error);
    throw new Error("Error fetching user bookings with count");
  }
};

const prisma = require('./prismaClient');



module.exports.getRecommendedTutors = async function getRecommendedTutors(userId) {
  try {
    // Fetch the tutee profile based on userId from the User table
    const tuteeProfile = await prisma.user.findUnique({
      where: { userId: parseInt(userId) }, // Ensure the userId is an integer
      select: {
        subjectInterests: true,
        academicLevel: true,
        skills: true,
        isTutor: true, // Check if the user is a tutee (isTutor: false)
      },
    });

    // Check if the user is a tutee (isTutor: false)
    if (!tuteeProfile || tuteeProfile.isTutor) {
      throw new Error('User is not a tutee or not found');
    }

    const { subjectInterests, academicLevel, skills = '' } = tuteeProfile; // Default skills to an empty string if null or undefined

    // Split the skills string into an array (if it's a string)
    const skillsArray = skills.split(',').map(skill => skill.trim()).filter(Boolean); // Split by comma, trim spaces, and remove empty strings

    // Fetch tutors based on the tutee profile
    const tutors = await prisma.tutorProfile.findMany({
      select: {
        tutorId: true, // Directly select tutorId from the tutorProfile table
        user: {
          select: {
            userId: true, // User ID (acts as tutorId in some cases)
            name: true,
            avatarId: true,
            academicLevel: true,
            skills: true,
            avatar: {
              select: {
                imageName: true, // Select avatar imageName from the Avatar model
              },
            },
          },
        },
        rating: true,        // Select the rating field directly
        experience: true,    // Select the experience field directly
      },
    });

    // Calculate scores based on matching criteria
    const scoredTutors = tutors.map(tutor => {
      let score = 0;
      const { tutorId, user, experience, rating } = tutor;

      // Match subject interests
      if (subjectInterests && subjectInterests.includes(user.subject)) {
        score += 50;
      }

      // Match academic level
      if (user.academicLevel === academicLevel) {
        score += 30;
      }

      // Match skills
      const skillMatches = skillsArray.filter(skill => {
        const skillsMatch = user.skills
          ? user.skills.toLowerCase().includes(skill.toLowerCase())
          : false;
        return skillsMatch;
      });
      score += skillMatches.length * 10;

      // Boost based on ratings and experience
      score += rating * 5;
      score += experience * 2;

      // Return tutor-specific info with the avatar's imageName included
      return {
        tutorId, // Include tutorId directly
        name: user.name,
        academicLevel: user.academicLevel,
        skills:user.skills,
        avatarImage: user.avatar?.imageName || 'default-avatar.png', // Include avatar's imageName
        rating,
        experience,
        score,
      };
    }).filter(Boolean); // Remove null entries (tutors without profiles)

    // Sort tutors by score
    scoredTutors.sort((a, b) => b.score - a.score);
    console.log("the tutors are",tutors);

    return scoredTutors.slice(0, 6); // Return top 6 tutors
  } catch (error) {
    console.error('Error fetching recommended tutors:', error);
    throw error;
  }
};


///////////////////////////////////////////////
//hiring a tutor
//////////////////////////////////////////////

// module.exports.hireTutor = async function hireTutor(tuteeId, tutorId, slotId, durationMonths = 1) {
//   try {
//     console.log("HI I am inside hiretutor function")
//     // Step 1: Validate the slot
//     const slot = await prisma.availabilitySlot.findUnique({
//       where: { id: parseInt(slotId) },
//     });

//     if (!slot) throw new Error('Slot not found.');
//     if (slot.tutorId !== tutorId) throw new Error('Slot does not belong to the specified tutor.');

//     // Step 2: Calculate the startDate (3 days from now) and endDate
//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() + 3); // Start date is 3 days after booking
//     console.log("inserted start date", startDate);

//     const endDate = new Date(startDate);
//     endDate.setMonth(endDate.getMonth() + durationMonths); // Extend by the booking duration

//     // Step 3: Check for conflicting bookings
//     const conflictingBookings = await prisma.tutorBooking.findMany({
//       where: {
//         slotId: slotId,
//         OR: [
//           {
//             startDate: { lte: endDate },
//             endDate: { gte: startDate },
//           },
//         ],
//       },
//     });

//     if (conflictingBookings.length > 0) {
//       throw new Error('This slot is already booked for the selected duration.');
//     }

//     // Step 4: Create a new booking with status "Pending"
//     const newBooking = await prisma.tutorBooking.create({
//       data: {
//         tuteeId,
//         slotId,
//         durationMonths,
//         startDate,
//         endDate,
//         status: "Pending", // Ensures the booking starts as Pending
//       },
//     });

//     return { message: 'Tutor hired successfully, awaiting approval', booking: newBooking };
//   } catch (error) {
//     console.error('Error hiring tutor:', error);
//     throw error;
//   }
// };

module.exports.hireTutor = async function hireTutor(tuteeId, tutorId, slotId, durationMonths = 1) {
  try {
    console.log("HI I am inside hireTutor function");

    // Step 1: Validate the slot
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: parseInt(slotId) },
    });

    if (!slot) throw new Error('Slot not found.');
    if (slot.tutorId !== tutorId) throw new Error('Slot does not belong to the specified tutor.');

    // Step 2: Extract slot's dayOfWeek, startTime, and endTime
    const { dayOfWeek, startTime, endTime } = slot;

    // Step 3: Check for conflicting bookings **by the same tutee on the same day**
    const conflictingBookings = await prisma.tutorBooking.findMany({
      where: {
        tuteeId: tuteeId,
        status: { not: "Cancelled" }, // Ignore cancelled bookings
        slot: {
          dayOfWeek: dayOfWeek, // Only check for bookings on the same day
        },
      },
      include: {
        slot: true, // Include slot details to compare times
      },
    });

    // Step 4: Check if any existing booking overlaps with the new one
    for (const booking of conflictingBookings) {
      const bookedStart = booking.slot.startTime; // Existing booking startTime
      const bookedEnd = booking.slot.endTime; // Existing booking endTime

      if (
        (startTime >= bookedStart && startTime < bookedEnd) || // New start overlaps
        (endTime > bookedStart && endTime <= bookedEnd) || // New end overlaps
        (startTime <= bookedStart && endTime >= bookedEnd) // New booking fully covers an existing one
      ) {
        throw new Error(`You already have a booking on ${dayOfWeek} from ${bookedStart} to ${bookedEnd}.`);
      }
    }

    // Step 5: Create a new booking with status "Pending"
    const newBooking = await prisma.tutorBooking.create({
      data: {
        tuteeId,
        slotId,
        durationMonths,
        startDate: new Date(), // Booking starts now
        endDate: new Date(), // Placeholder; duration isn't needed for time-based checks
        status: "Pending",
      },
    });

    return { message: 'Tutor hired successfully, awaiting approval', booking: newBooking };
  } catch (error) {
    console.error('Error hiring tutor:', error);
    throw error;
  }
};



/////////////////////////////////////////////////
//view availability
////////////////////////////////////////////////

/**
 * Fetch availability for a specific tutor
 * @param {string} tutorId - ID of the tutor
 * @returns {Promise<Array>} - Array of available time slots
 */
module.exports.getTutorAvailability = async function getTutorAvailability(tutorId) {
  try {
    console.log("getTutorAvail",tutorId);
    // Fetch the availability slots for the given tutor
    const availability = await prisma.availabilitySlot.findMany({
      where: { tutorId: parseInt(tutorId) }, // Ensure tutorId is an integer
      select: {
        id: true, // Slot ID
        dayOfWeek: true,
        startTime: true,
        endTime: true,
      },
      orderBy: {
        startTime: 'asc', // Order by start time for better user experience
      },
    });
      console.log("availability", availability);
    return availability;
  } catch (error) {
    console.error('Error fetching tutor availability:', error);
    throw error;
  }
};

/////////////////////////////////////////////////
//view availability
////////////////////////////////////////////////

/**
 * Fetch availability for a specific tutor, including whether each slot is booked
 * @param {string} tutorId - ID of the tutor
 * @returns {Promise<Array>} - Array of available time slots with booking status
 */
module.exports.getTutorSlot = async function getTutorSlot(tutorId) {
  try {
    console.log("getTutorAvail", tutorId);

    // Fetch availability slots for the given tutor, including booking info
    const availability = await prisma.availabilitySlot.findMany({
      where: { tutorId: parseInt(tutorId) }, // Ensure tutorId is an integer
      select: {
        id: true, 
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        tutorBookings: {
          select: {
            id: true,  // Get the booking ID if booked
            status: true, // Check the status of the booking
          }
        }
      },
      orderBy: {
        startTime: 'asc', // Order by start time for better UX
      },
    });

    // Map availability slots and add `isBooked` field
    const availabilityWithBookingStatus = availability.map(slot => ({
      ...slot,
      isBooked: slot.tutorBookings.length > 0, // If any booking exists, mark as booked
    }));

    console.log("availability", availabilityWithBookingStatus);
    return availabilityWithBookingStatus;
  } catch (error) {
    console.error('Error fetching tutor availability:', error);
    throw error;
  }
};


/////////////////////////////////////////
//fetch details for tutor
////////////////////////////////////////

module.exports.getTutorDetails = async function getTutorDetails(tutorId) {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { tutorId: parseInt(tutorId) },
      include: {
        user: true,
        availabilitySlots: {
          include: {
            tutorBookings: true, // Corrected relation
          },
        },
      },
    });

    if (!tutor) {
      throw new Error('Tutor not found');
    }

    // Return tutor details including booked slots
    return {
      tutorId: tutor.tutorId,
      name: tutor.user.name,
      academicLevel: tutor.user.academicLevel,
      skills: tutor.user.skills,
      rating: tutor.rating,
      experience: tutor.experience,
      availabilitySlots: tutor.availabilitySlots.map(slot => ({
        ...slot,
        isBooked: slot.tutorBookings.length > 0, // Check if the slot has bookings
      })),
    };
  } catch (error) {
    console.error('Error fetching tutor details:', error);
    throw error;
  }
};



//////////////////////////////////////
//fetch users' tutors
///////////////////////////////////////
module.exports.getUserTutors = async function getUserTutors(userId) {
  try {
    // Fetch all bookings for the user, including tutor and slot details
    const bookings = await prisma.tutorBooking.findMany({
      where: { tuteeId: userId },
      include: {
        slot: {
          include: {
            tutor: {
              include: {
                user: true, // Include tutor's user details
              },
            },
          },
        },
      },
    });

    // Group bookings by tutor
    const tutorsMap = {};

    bookings.forEach(booking => {
      const tutorId = booking.slot.tutor.tutorId;

      if (!tutorsMap[tutorId]) {
        tutorsMap[tutorId] = {
          tutorId,
          name: booking.slot.tutor.user.name,
          subject: booking.slot.tutor.subject,
          rating: booking.slot.tutor.rating,
          experience: booking.slot.tutor.experience,
          bookings: [],
        };
      }

      // Add booking details under the respective tutor
      tutorsMap[tutorId].bookings.push({
        id:booking.id,
        day: booking.slot.dayOfWeek,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        status: booking.status,
        startDate: booking.startDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        endDate: booking.endDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      });
    });

    // Convert the map to an array
    const tutors = Object.values(tutorsMap);
    return tutors;
  } catch (error) {
    console.error('Error fetching user tutors:', error);
    throw error;
  }
};

/////////////////////////////////
//fetching all tutors
/////////////////////////////////
module.exports.getAllTutors = async function getAllTutors() {
  try {
    const tutors = await prisma.tutorProfile.findMany({
      include: {
        user: true, // Include user details for the tutor
        availabilitySlots: true, // Include availability slots
      },
    });

    // Map tutors to format the response
    return tutors.map(tutor => ({
      tutorId: tutor.tutorId,
      name: tutor.user.name,
      subject: tutor.subject,
      rating: tutor.rating,
      experience: tutor.experience,
      availability: tutor.availabilitySlots.map(slot => ({
        day: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    }));
  } catch (error) {
    console.error('Error fetching tutors:', error);
    throw error;
  }
};

//////////////////////////////////////
//filtering tutors
//////////////////////////////////////
module.exports.getFilteredTutors = async function getFilteredTutors(filters) {
  try {
    const { day, subject, name } = filters;

    const tutors = await prisma.tutorProfile.findMany({
      where: {
        AND: [
          // Apply day filter if provided
          day
            ? {
                availabilitySlots: {
                  some: {
                    dayOfWeek: { equals: day },
                  },
                },
              }
            : {},

          // Apply subject filter if provided
          subject ? { subject: { contains: subject, mode: 'insensitive' } } : {},

          // Apply name filter if provided
          name ? { user: { name: { contains: name, mode: 'insensitive' } } } : {},
        ],
      },
      include: {
        user: true, // Include user details for the tutor
        availabilitySlots: true, // Include availability slots
      },
    });

    return tutors.map(tutor => ({
      tutorId: tutor.tutorId,
      name: tutor.user.name,
      subject: tutor.subject,
      rating: tutor.rating,
      experience: tutor.experience,
      availability: tutor.availabilitySlots.map(slot => ({
        day: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    }));
  } catch (error) {
    console.error('Error filtering tutors:', error);
    throw error;
  }
};

////////////////////////////
//get all subjects
module.exports.getAllSubjects = async function getAllSubjects() {
  try {
    const subjects = await prisma.tutorProfile.findMany({
      select: { subject: true },
      distinct: ['subject'],
    });

    return subjects.map(subject => subject.subject);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};



///////////////////////////////////////


//Tutors


////////////////////////////////////




module.exports.getTuteesForTutor = async function getTuteesForTutor(userId) {
  try {
    // Fetch the tutor profile based on the userId
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: userId },
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found for the given user.');
    }

    const tutorId = tutorProfile.tutorId;

    // Fetch all bookings where this tutor is associated
    const tutees = await prisma.tutorBooking.findMany({
      where: {
        slot: {
          tutorId: tutorId,
        },
      },
      include: {
        tutee: true, // Include tutee details (from the User model)
        slot: {
          include: {
            tutor: true, // Include the tutor details for the slot
          },
        },
      },
    });

    // Map and format the tutees with the required details, including the booking ID
    return tutees.map(booking => ({
      bookingId: booking.id,  // Include booking ID in the response
      tuteeName: booking.tutee.name,
      tuteeEmail: booking.tutee.email,
      subject: booking.slot.tutor.subject || 'N/A', // Use 'N/A' if subject is undefined
      status: booking.status,
      startDate: booking.startDate,
      endDate: booking.endDate,
      day: booking.slot.dayOfWeek,
      startTime: booking.slot.startTime,
      endTime: booking.slot.endTime,
    }));
  } catch (error) {
    console.error('Error fetching tutees for tutor:', error.message);
    throw error;
  }
};


/////////////////////////////////////////
//approve booking
/////////////////////////////////////////

module.exports.approveBookingForTutor = async function approveBookingForTutor(bookingId) {
  try {
    console.log("the booking id is",bookingId);
    const booking = await prisma.tutorBooking.findUnique({ where: { id: bookingId } });

    if (!booking || booking.status !== 'Pending') {
      return null; // Return null if the booking is not found or not in Pending status
    }

    await prisma.tutorBooking.update({
      where: { id: bookingId },
      data: { status: 'Approved' },
    });

    return true; // Successfully updated
  } catch (error) {
    console.error('Error approving booking:', error.message);
    throw error;
  }
};

/////////////////////////////////////////
//cancel booking
/////////////////////////////////////////

module.exports.cancelBookingForTutor = async function cancelBookingForTutor(bookingId) {
  try {
    console.log("the booking id is",bookingId);
    const booking = await prisma.tutorBooking.findUnique({ where: { id: bookingId } });

    if (!booking || booking.status !== 'Pending') {
      return null; // Return null if the booking is not found or not in Pending status
    }

    await prisma.tutorBooking.update({
      where: { id: bookingId },
      data: { status: 'Cancelled' },
    });

    return true; // Successfully updated
  } catch (error) {
    console.error('Error cancelling booking:', error.message);
    throw error;
  }
};

////////////////////////////////////////////

// Fetch user details by userId
module.exports.getUserDetails = async function getUserDetails(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: parseInt(userId, 10) }, // Ensure userId is an integer
      select: {
        name: true,
        bio: true,
        academicLevel: true,
        skills: true,
        subjectInterests: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};


module.exports.getTutorIdByUserId = async function getTutorIdByUserId(userId) {
  try {
    console.log("Inside model, received userId:", userId);

    if (!userId || isNaN(userId)) {
      throw new Error("Invalid userId provided to model");
    }

    // Ensure `userId` is an integer before querying
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: userId }, // Prisma requires an integer here
    });

    if (!tutor) {
      throw new Error('Tutor not found');
    }

    return tutor.tutorId;
  } catch (error) {
    console.error('Error fetching tutor id:', error);
    throw error;
  }
};


// Add new slot with conflict checking
module.exports.addSlot = async function addSlot(slotData) {
  try {
    const { tutorId, dayOfWeek, startTime, endTime } = slotData;

    
        console.log("Received tutorId:", tutorId);

    // Convert times to a comparable format (HH:mm:ss)
    const newStartTime = startTime;
    const newEndTime = endTime;

    // Check for conflicting slots
    const conflictingSlots = await prisma.availabilitySlot.findMany({
      where: {
        tutorId: tutorId, // Ensure it's the same tutor
        dayOfWeek: dayOfWeek, // Ensure it's the same day
        OR: [
          {
            startTime: { lte: newEndTime }, // Existing slot starts before or during new slot
            endTime: { gte: newStartTime }  // Existing slot ends after or during new slot
          }
        ]
      }
    });

    // If conflicts exist, prevent slot creation
    if (conflictingSlots.length > 0) {
      throw { status: 400, message: "Slot conflicts with an existing schedule." };
    }

    // No conflict, proceed to add the new slot
    return await prisma.availabilitySlot.create({
      data: slotData,
    });

  } catch (error) {
    console.error('Error adding slot:', error);
    throw error;
  }
};



// Delete a slot
module.exports.deleteSlot = async function deleteSlot(slotId) {
  try {
    await prisma.availabilitySlot.delete({
      where: { id: parseInt(slotId) },
    });

    return { success: true, message: "Slot deleted successfully" };
  } catch (error) {
    if (error.code === 'P2003') {
      console.error('Slot cannot be deleted since it is booked by a tutee.');
      throw { status: 400, message: 'The slot cannot be deleted since it is taken by a tutee.' };
    } else {
      console.error('Error deleting slot:', error);
      throw { status: 500, message: 'An unexpected error occurred.' };
    }
  }
};


// // Update a slot
// module.exports.updateSlot = async function updateSlot(slotId, data) {
//   try {
//     const updatedSlot = await prisma.availabilitySlot.update({
//       where: { id: parseInt(slotId) },
//       data: {
//         dayOfWeek: data.dayOfWeek,
//         startTime: data.startTime,
//         endTime: data.endTime,
//       },
//     });

//     return { success: true, message: "Slot updated successfully", slot: updatedSlot };
//   } catch (error) {
//     if (error.code === 'P2003') {
//       console.error('Slot cannot be updated since it is booked by a tutee.');
//       throw { status: 400, message: 'The slot cannot be updated since it is taken by a tutee.' };
//     } else {
//       console.error('Error updating slot:', error);
//       throw { status: 500, message: 'An unexpected error occurred while updating the slot.' };
//     }
//   }
// };


// module.exports.updateSlot = async function updateSlot(slotId, data) {
//   try {
//     // Check for conflicts with existing slots
//     const existingConflict = await prisma.availabilitySlot.findFirst({
//       where: {
//         tutorId: data.tutorId, // Ensure checking for the same tutor
//         dayOfWeek: data.dayOfWeek,
//         NOT: { id: parseInt(slotId) }, // Exclude the current slot being updated
//         OR: [
//           {
//             startTime: { lt: data.endTime }, // New slot starts before another slot ends
//             endTime: { gt: data.startTime }, // New slot ends after another slot starts
//           },
//         ],
//       },
//     });

//     if (existingConflict) {
//       throw { status: 400, message: "Slot conflicts with an existing schedule." };
//     }

//     // Update the slot if no conflicts
//     const updatedSlot = await prisma.availabilitySlot.update({
//       where: { id: parseInt(slotId) },
//       data: {
//         dayOfWeek: data.dayOfWeek,
//         startTime: data.startTime,
//         endTime: data.endTime,
//       },
//     });

//     return { success: true, message: "Slot updated successfully", slot: updatedSlot };
//   } catch (error) {
//     if (error.status === 400) {
//       throw error; // Pass conflict error directly
//     } else if (error.code === "P2003") {
//       console.error("Slot cannot be updated since it is booked by a tutee.");
//       throw { status: 400, message: "The slot cannot be updated since it is taken by a tutee." };
//     } else {
//       console.error("Error updating slot:", error);
//       throw { status: 500, message: "An unexpected error occurred while updating the slot." };
//     }
//   }
// };

module.exports.updateSlot = async function updateSlot(slotId, data,tutorId) {
  try {
    // Ensure tutorId is an integer before passing it to the query
    const tutorIdInt = parseInt(tutorId, 10);
    console.log(data);

    if (isNaN(tutorIdInt)) {
      throw new Error('Invalid tutorId provided');
    }

    // Retrieve the tutor's existing slots (filtered by tutorId)
    const conflictingBookings = await prisma.availabilitySlot.findMany({
      where: {
        tutorId: tutorIdInt, // Ensure checking for the same tutor
        dayOfWeek: data.dayOfWeek, // Ensure checking for the same day
        NOT: { id: parseInt(slotId, 10) }, // Exclude the current slot being updated
      },
      select: {
        id: true, // Slot ID
        dayOfWeek: true,
        startTime: true,
        endTime: true,
      },
      orderBy: {
        startTime: 'asc', // Order by start time for better user experience
      },
    });

    // Check if any existing booking overlaps with the new one
    for (const booking of conflictingBookings) {
      const bookedStart = booking.startTime;
      const bookedEnd = booking.endTime;

      if (
        (data.startTime >= bookedStart && data.startTime < bookedEnd) ||
        (data.endTime > bookedStart && data.endTime <= bookedEnd) ||
        (data.startTime <= bookedStart && data.endTime >= bookedEnd)
      ) {
        throw new Error(`You already have a booking on ${data.dayOfWeek} from ${bookedStart} to ${bookedEnd}.`);
      }
    }

    // If no conflicts, proceed to update the slot
    const updatedSlot = await prisma.availabilitySlot.update({
      where: { id: parseInt(slotId, 10) },
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });

    return { success: true, message: "Slot updated successfully", slot: updatedSlot };
  } catch (error) {
    if (error.message.includes("booking")) {
      throw { status: 400, message: error.message };
    } else if (error.code === "P2003") {
      console.error("Slot cannot be updated since it is booked by a tutee.");
      throw { status: 400, message: "The slot cannot be updated since it is taken by a tutee." };
    } else {
      console.error("Error updating slot:", error);
      throw { status: 500, message: "An unexpected error occurred while updating the slot." };
    }
  }
};



/**
 * Extend a completed booking by updating its status to "Approved"
 * and recalculating startDate and endDate based on the new duration.
 */
module.exports.extendBooking = async function extendBooking(bookingId, newDurationMonths) {
  try {
    // Find the booking to ensure it exists and is completed
    const booking = await prisma.tutorBooking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

 

    // Calculate new dates
    const newStartDate = new Date(); // Set new start date as today
    const newEndDate = new Date(newStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + newDurationMonths);

    // Update the booking status, startDate, and endDate
    const updatedBooking = await prisma.tutorBooking.update({
      where: { id: parseInt(bookingId) },
      data: {
        status: 'Approved',
        startDate: newStartDate,
        endDate: newEndDate,
        durationMonths: newDurationMonths,
      },
    });

    return updatedBooking;
  } catch (error) {
    console.error('Error extending booking:', error);
    throw error;
  }
};


// Model function to mark booking as completed
module.exports.markBookingComplete = async function markBookingComplete(bookingId) {
  try {
    // Get the current date and time
    const currentTime = new Date();

    // Update the booking status to 'Completed' and set the endDate to the current time
    const updatedBooking = await prisma.tutorBooking.update({
      where: { id: parseInt(bookingId) },
      data: {
        status: 'Completed',
        endDate: currentTime, // Set the end date to current time
      },
    });

    // If no booking is found, throw an error
    if (!updatedBooking) {
      throw new Error('Booking not found or already completed');
    }

    // Return the updated booking details
    return updatedBooking;
  } catch (error) {
    console.error('Error marking booking as completed:', error);
    throw error;
  }
};

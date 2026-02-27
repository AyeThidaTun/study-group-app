const prisma = require("./prismaClient");

// Function to update feedback states
async function updateFeedbackStates() {
  try {
    console.log("Running cron job to update feedback states...");

    const today = new Date();
    today.toLocaleString();
    // today.setDate(today.getDate() + 2); // Move the date forward (for testing purposes)

    const yesterday = new Date(today.getTime() - 86400000); // 24 hours ago
    const twoDaysAgo = new Date(today.getTime() - 2 * 86400000); // 48 hours ago

    // Strip the time portion from dates for accurate comparison
    today.setUTCHours(0, 0, 0, 0);
    yesterday.setUTCHours(0, 0, 0, 0);
    twoDaysAgo.setUTCHours(0, 0, 0, 0);

    console.log("today: ", today);

    // Fetch all feedback records
    const feedbacks = await prisma.Feedback.findMany({
      include: { Booking: true }, // Include related booking data
    });

    for (const feedback of feedbacks) {
      // console.log("feedback data: ", feedback);
      // console.log("comments before processing: ", feedback.comments);
      const bookingDate = new Date(feedback.Booking.bookingDate);
      bookingDate.setUTCHours(0, 0, 0, 0);
      // console.log("booking date: ", bookingDate);
      let newState;
      // Calculate days elapsed since booking date
      const daysElapsed = Math.floor(
        (today.getTime() - bookingDate.getTime()) / 86400000
      );
      // console.log("days elapsed: ", daysElapsed);
      
      // Skip feedbacks for future sessions
      if (bookingDate > today) {
        console.log('Skipping feedback for future session:', feedback.feedbackId);
        continue;
      }

      // Check if feedback is in COMPLETED state and should transition to DISCLOSED
      if (feedback.state === "COMPLETED" && daysElapsed > 2 && feedback.comments) {
        newState = "DISCLOSED"; // Transition to DISCLOSED after 2 days with comments
      } else {
        // Determine the new state based on elapsed time and comments
        if (daysElapsed === 0) {
          newState = "UNACTIVATED"; // Prevent feedback submission
        } else if (daysElapsed === 1 || daysElapsed === 2) {
          newState = feedback.comments ? "COMPLETED" : "PENDING";
        } else if (daysElapsed > 2) {
          newState = feedback.comments ? "COMPLETED" : "EXPIRED";
        }
      }

      // Update only if the state has changed
      if (newState && feedback.state !== newState) {
        await prisma.Feedback.update({
          where: { feedbackId: feedback.feedbackId },
          data: { state: newState },
        });
        console.log(`Updated feedback ${feedback.feedbackId} to state: ${newState}`);
      }
    }

    console.log("Feedback states updated successfully!");
  } catch (error) {
    console.error("Error updating feedback states:", error);
  }
}

module.exports = updateFeedbackStates;

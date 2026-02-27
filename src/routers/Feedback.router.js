const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getGroupIdByBookingId,
  getGroupDetailsByGroupId,
  updateState,
  getPendingUserFeedbacks,
  getDisclosedUserFeedbacks,
  getFilteredFeedbacks
} = require("../models/Feedback.model");

router.get("/getGroupMembers/:groupId", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const groupDetails = await getGroupDetailsByGroupId(groupId);

    res.json({
      success: true,
      name: groupDetails.name,
      members: groupDetails.members,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/getGroupIdByBookingId/:bookingId", async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId); // Ensure the bookingId is a number
    const groupId = await getGroupIdByBookingId(bookingId);

    res.json({ success: true, groupId: groupId });
  } catch (error) {
    console.error("Error fetching groupId:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit feedback
router.post("/submitFeedback", async (req, res) => {
  try {
    const feedbackData = req.body;

    // Ensure feedbackData has the necessary structure
    if (!feedbackData.bookingId || !feedbackData.giverId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing required fields (bookingId or giverId).",
        });
    }

    // Call the createFeedback function to handle the feedback data
    const result = await createFeedback(feedbackData);

    // Send success response with the feedback entries
    res.json({ success: true, feedbackEntries: result.feedbackEntries });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/updateFeedbackState", async (req, res) => {
    try {
      const { bookingId, giverId, receiverId, state } = req.body;
  
      // Ensure the required fields are provided
      if (!bookingId || !giverId || !receiverId || !state) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields (bookingId, giverId, receiverId, or state).",
        });
      }
  
      // Call the updateFeedbackState function
      const result = await updateState(bookingId, giverId, receiverId, state);
  
      // Send success response
      res.json({
        success: true,
        message: `Feedback state updated successfully for bookingId: ${bookingId}, giverId: ${giverId}, receiverId: ${receiverId}`,
        updatedEntries: result.count, // Number of entries updated
      });
    } catch (error) {
      console.error("Error updating feedback state:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Router for Pending Feedbacks
router.get('/pendingFeedbacks/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const pendingFeedbacks = await getPendingUserFeedbacks(userId);
    res.json(pendingFeedbacks);
  } catch (error) {
    console.error("Error fetching pending feedbacks:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/disclosedFeedbacks/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const disclosedFeedbacks = await getDisclosedUserFeedbacks(userId);
    res.json(disclosedFeedbacks);
  } catch (error) {
    console.error("Error fetching pending feedbacks:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/filteredFeedbacks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    console.log('startDate from query: ', startDate);
    console.log('endDate from query: ', endDate);

    const feedbacks = await getFilteredFeedbacks(userId, startDate, endDate);
    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching filtered feedbacks:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;

const express = require("express");
const router = express.Router();
const {
getAllStudyRooms,
getRoomTypes,
getStudyRoomsByType,
getAllStudyGroups,
createBooking,
getAvailableSlotsForRoom,
getUserBookings,
confirmBooking,
cancelBooking,
getUserBookingsWithCount,
getConfirmedUserBookings
} = require('../models/StudyRoom.model');

// Retrieve all study rooms
router.get("/all", (req, res, next) => {
    getAllStudyRooms()
      .then((rooms) => res.status(200).json(rooms))
      .catch(next);
});

router.get("/types", (req, res, next) => {
  getRoomTypes()
    .then((types) => res.status(200).json(types))
    .catch(next);
});

// Route to get rooms filtered by roomType
router.get("/:type", async (req, res, next) => {
  const { type } = req.params; // Extract `type` from the path parameter
  // console.log("roomType from router: ", type);

  try {
    const rooms = await getStudyRoomsByType(type); // Pass `type` to the model
    res.status(200).json(rooms);
  } catch (error) {
    next(error); // Forward error to the error handler
  }
});

// Retrieve all study groups
router.get("/studyGroup", async (req, res, next) => {
  try {
    const groups = await getAllStudyGroups();
    res.status(200).json(groups);
  } catch (error) {
    next(error); // Pass error to global error handler
  }
});

// Create a booking
router.post("/bookRoom", async (req, res, next) => {
  const { roomId, groupId, selectedDate, slotId } = req.body;
  console.log("selected date for book router: ", selectedDate);
  if (!roomId || !groupId || !selectedDate) {
    return res.status(400).json({ error: "Room ID, group ID and booking date are required" });
  }

  try {
    const booking = await createBooking(roomId, groupId, selectedDate, slotId);
    res.status(201).json({ message: "Room successfully booked", booking });
  } catch (error) {
    next(error);
  }
});

// Route to get available slots for a specific room and selected date
router.get("/slots/:roomId", async (req, res, next) => {
  const { roomId } = req.params;
  const parsedRoomId = parseInt(roomId, 10);
  const { selectedDate } = req.query;  // Date passed in query params

  if (!selectedDate) {
    return res.status(400).json({ error: "Please provide a date" });
  }

  try {
    const availableRoom = await getAvailableSlotsForRoom(parsedRoomId, new Date(selectedDate));
    res.status(200).json(availableRoom);
  } catch (error) {
    next(error);
  }
});

router.get('/myBookings/:userId', async (req, res) => {
  try {
    const userId = req.params.userId; // Retrieve userId from route parameter
    const sortOrder = req.query.sortOrder || "all"; // Get sortOrder from query params
    const statusFilter = req.query.statusFilter || "all";
    const bookings = await getUserBookings(userId, sortOrder, statusFilter); // Pass sortOrder to the function
    res.json(bookings);
  } catch (error) {
    console.error('Error in /myBookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm a booking
router.put('/confirmBooking/:bookingId', async (req, res) => {
  try {
    const result = await confirmBooking(req.params.bookingId);

    if (!result.success) {
      return res.status(409).json({ error: result.message }); // Conflict
    }

    res.status(200).json({ message: result.message, data: result.data });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to confirm booking. Please try again later.' });
  }
});

// Cancel a booking
router.put('/cancelBooking/:bookingId', async (req, res) => {
  const { bookingId } = req.params;

  try {
    const updatedBooking = await cancelBooking(bookingId);
    res.status(200).json({
      message: 'Booking cancelled successfully.',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error in cancelBooking route:', error.message);
    res.status(500).json({
      message: 'Failed to cancel booking.',
    });
  }
});

router.get("/userBookingsCount/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { statusFilter = 'all' } = req.query; // Get the filter from the query params

    // Pass the statusFilter to the function
    const { confirmedBookingsCount } = await getUserBookingsWithCount(userId, 'asc', statusFilter);
  res.status(200).json({ confirmedBookingsCount });
  } catch (error) {
    console.error("Error fetching confirmed bookings count:", error);
    res.status(500).json({ error: "Failed to fetch confirmed bookings count" });
  }
});

router.get('/confirmedBookings/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookings = await getConfirmedUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching confirmed bookings:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
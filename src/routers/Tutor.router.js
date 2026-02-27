
const express = require('express');
const { getRecommendedTutors, hireTutor,getTutorAvailability,
  getTutorDetails,getUserTutors,getAllTutors,getFilteredTutors,
  getAllSubjects, getTuteesForTutor,approveBookingForTutor,
  cancelBookingForTutor,getUserDetails ,getTutorIdByUserId , 
  addSlot, deleteSlot,updateSlot,getTutorSlot,extendBooking,markBookingComplete } = require('../models/Tutor.model'); // Your model file
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();

// Route to get recommended tutors for a tutee
router.get('/recommendations/:userId', jwtMiddleware.verifyToken, async (req, res, next) => {
  try {
    const { userId } = req.params; // Extract userId from the URL params

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Pass the userId to the model, and let it handle the rest
    const recommendedTutors = await getRecommendedTutors(userId);
    res.status(200).json(recommendedTutors);
  } catch (error) {
    console.error('Error fetching recommended tutors:', error);
    next(error); // Pass error to the next middleware for handling
  }
});


//////////////////////////////////////////
//hiring a tutor
//////////////////////////////////////////
router.post('/:tutorId/hire', jwtMiddleware.verifyToken, async (req, res) => {
  try {

    const { tutorId } = req.params;
    const { tuteeId, slotId, durationMonths } = req.body;
    console.log(tuteeId, tutorId, slotId, durationMonths);

    if (!tuteeId || !slotId) {
      return res.status(400).json({ error: 'Tutee ID and Slot ID are required.' });
    }

    const result = await hireTutor(
      parseInt(tuteeId),
      parseInt(tutorId),
      parseInt(slotId),
      parseInt(durationMonths || 1)
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////////
//view user availability
///////////////////////////////////////
// Route to get tutor availability
router.get('/:tutorId/availability', jwtMiddleware.verifyToken, async (req, res, next) => {
  try {
    const { tutorId } = req.params;

    if (!tutorId) {
      return res.status(400).json({ error: 'Tutor ID is required' });
    }

    // Fetch availability from the model
    const availability = await getTutorAvailability(tutorId);

    res.status(200).json(availability);
  } catch (error) {
    console.error('Error fetching tutor availability:', error);
    next(error); // Pass error to the next middleware for handling
  }
});


////////////////////////////////////////
//view user slots
///////////////////////////////////////
// Route to get tutor availability
router.get('/:tutorId/availability/slot', jwtMiddleware.verifyToken, async (req, res, next) => {
  try {
    const { tutorId } = req.params;

    if (!tutorId) {
      return res.status(400).json({ error: 'Tutor ID is required' });
    }

    // Fetch availability from the model
    const availability = await getTutorSlot(tutorId);

    res.status(200).json(availability);
  } catch (error) {
    console.error('Error fetching tutor availability:', error);
    next(error); // Pass error to the next middleware for handling
  }
});






// Endpoint to fetch tutor details
router.get('/:tutorId/details', jwtMiddleware.verifyToken, async (req, res) => {
  try {
    const { tutorId } = req.params;

    // Fetch tutor details from the model
    const tutorDetails = await getTutorDetails(tutorId);

    res.status(200).json(tutorDetails); // Return the tutor details as JSON response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch the user's tutors
router.get('/your-tutors', jwtMiddleware.verifyToken, async (req, res) => {
  try {
    console.log("I am here",res.locals.userId);
    const userId = res.locals.userId; // Extract user ID from the JWT token

    // Fetch the user's tutors from the model
    const tutors = await getUserTutors(userId);

    res.status(200).json(tutors); // Return tutors as JSON response
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ error: error.message });
  }
});



// Endpoint to fetch all tutors
router.get('/all-tutors', async (req, res) => {
  try {
    const tutors = await getAllTutors();
    res.status(200).json(tutors); // Return the list of all tutors as JSON
  } catch (error) {
    console.error('Error fetching all tutors:', error);
    res.status(500).json({ error: error.message });
  }
});


// Endpoint to fetch filtered tutors
router.get('/filtered-tutors', async (req, res) => {
  try {
    const { day, subject, name } = req.query;

    const tutors = await getFilteredTutors({ day, subject, name });

    res.status(200).json(tutors); // Return filtered tutors as JSON
  } catch (error) {
    console.error('Error filtering tutors:', error);
    res.status(500).json({ error: error.message });
  }
});


// Endpoint to fetch all unique subjects
router.get('/subjects', async (req, res) => {
  try {
    // Fetch unique subjects
    const subjects = await getAllSubjects();

    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: error.message });
  }
});


///////////////////////////////////////


//Tutors


////////////////////////////////////


// Endpoint to fetch tutees for the currently logged-in tutor
router.get('/myTutees/:tutorUserId', async (req, res) => {
  try {
    
    const userId =  parseInt(req.params.tutorUserId); // Get userId from middleware (e.g., JWT token)
    console.log("fetching tutees", userId);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    // Fetch tutees using the model
    const tutees = await getTuteesForTutor(userId);

    res.status(200).json(tutees); // Send the list of tutees as JSON
  } catch (error) {
    console.error('Error fetching tutees:', error);
    res.status(500).json({ error: error.message });
  }
});



// Approve a booking if it's pending
router.patch('/approveBooking/:bookingId', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const result = await approveBookingForTutor(bookingId);

    if (!result) {
      return res.status(400).json({ error: 'Only pending bookings can be approved.' });
    }

    res.status(200).json({ message: 'Booking approved successfully.' });
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({ error: 'Failed to approve booking.' });
  }
});

// Cancel a booking if it's pending
router.patch('/cancelBooking/:bookingId', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const result = await cancelBookingForTutor(bookingId);

    if (!result) {
      return res.status(400).json({ error: 'Only pending bookings can be cancelled.' });
    }

    res.status(200).json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

// Endpoint to fetch user details by userId
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await getUserDetails(userId);
    res.status(200).json(user); // Return user details as JSON
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: error.message });
  }
});



// Get tutor id by userId
router.get('/tutor-id/:userId', jwtMiddleware.verifyToken, async (req, res) => {
  console.log("Inside router");

  try {
    // Ensure `userId` is correctly retrieved
    const userId = parseInt(req.params.userId); 

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    console.log("Extracted userId:", userId);
    
    // Call the model function to get the tutor id
    const tutorId = await getTutorIdByUserId(userId);
    res.json({ tutorId });

  } catch (error) {
    console.error('Error fetching tutor id:', error);
    res.status(500).json({ error: error.message });
  }
});




// Get tutor's availability slots

router.get('/:tutorId/availability', jwtMiddleware.verifyToken, async (req, res) => {
  const { tutorId } = req.params;
  try {
    const slots = await getTutorAvailability(tutorId);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching availability:', error); // Logs the error to the console
    res.status(500).json({ error: 'Error fetching availability' });
  }
});

// Add a new slot

router.post('/:tutorId/availability', jwtMiddleware.verifyToken, async (req, res) => {
  const { tutorId } = req.params;
  const { dayOfWeek, startTime, endTime } = req.body;
  try {
    const newSlot = await addSlot({ tutorId: parseInt(tutorId), dayOfWeek, startTime, endTime });
    res.json(newSlot);
  } catch (error) {
    console.error('Error fetching availability:', error); // Logs the error to the console
    res.status(500).json({ error: 'Error adding slot' });
  }
});

router.delete('/:tutorId/availability/:slotId', async (req, res) => {
  try {
    const result = await deleteSlot(req.params.slotId);
    res.json(result); // Send success response
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});

// Update a slot
router.put('/:tutorId/availability/:slotId', async (req, res) => {
  try {
    const result = await updateSlot(req.params.slotId, req.body, req.params.tutorId);
    res.json(result); // Send success response
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});

// Route to extend a completed booking
router.put('/extend/:bookingId', jwtMiddleware.verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { durationMonths } = req.body; // Get the new duration from request

    if (!durationMonths || durationMonths < 1) {
      return res.status(400).json({ error: 'Duration must be at least 1 month' });
    }

    // Call model function to update the booking
    const updatedBooking = await extendBooking(bookingId, parseInt(durationMonths));

    res.status(200).json({ message: 'Booking extended successfully', booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Router endpoint to mark booking as completed
router.post('/mark-booking-complete/:bookingId', jwtMiddleware.verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.bookingId; // Get bookingId from URL parameters

    // Call the model function to update the booking status to completed
    const updatedBooking = await markBookingComplete(bookingId);

    // Return the updated booking details as a response
    res.status(200).json({
      message: 'Booking marked as completed successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error marking booking as complete:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

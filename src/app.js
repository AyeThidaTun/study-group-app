const express = require('express');
const bodyParser = require('body-parser');
const createError = require('http-errors');
const path = require('path');
const fs = require('fs');
var cors = require('cors');
const io = require('socket.io')();

const taskRouter = require('./routers/Task.router');
const statusRouter = require('./routers/Status.router');
const personRouter = require('./routers/Person.router');
const userRouter = require('./routers/User.router');
const quizRouter = require('./routers/Quiz.router');
const suggestionRouter = require('./routers/Suggestion.router');
const notificationRouter = require('./routers/Notification.router');
const shopRouter = require('./routers/Shop.router');
const qnaRouter = require('./routers/QnA.router');
const todoRouter = require('./routers/Todo.router');
const assignTaskRouter = require('./routers/AssignedTask.router');
const resourceRouter = require('./routers/Resource.router');
const bookmarkRouter = require('./routers/Bookmark.router');
const tagRouter = require('./routers/Tag.router');
const tutorRouter = require('./routers/Tutor.router');              
const resourceTagRouter = require('./routers/ResourceTag.router');
const groupRouter = require('./routers/StudyGroup.router');
const studyRoomRouter = require('./routers/StudyRoom.router')
const savedQuestionRouter = require('./routers/SavedQuestions.router');
const messageRouter = require('./routers/Chat.router.js')(io);
const feedbackRouter = require('./routers/Feedback.router.js');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const app = express();
app.use(express.json());
// Allow all origins
app.use(cors());

// Increase payload limit for JSON requests
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/tasks', taskRouter);
app.use('/statuses', statusRouter);
app.use('/persons', personRouter);
app.use('/users', userRouter);
app.use('/quizzes', quizRouter);
app.use('/suggestions', suggestionRouter);
app.use('/notifications', notificationRouter);
app.use('/shop', shopRouter);
app.use('/qnas', qnaRouter);
app.use('/savedQuestions', savedQuestionRouter);
app.use('/todos', todoRouter);
app.use('/assignments', assignTaskRouter);
app.use('/resources', resourceRouter);
app.use('/bookmarks', bookmarkRouter);
app.use('/tags', tagRouter); 
app.use('/resourceTags', resourceTagRouter);
app.use('/tutor', tutorRouter);
app.use('/studyGroup', groupRouter);
app.use('/studyRoom', studyRoomRouter);
app.use('/messages', messageRouter);
app.use('/feedback', feedbackRouter);

app.use((req, res, next) => {
  next(createError(404, `Unknown resource ${req.method} ${req.originalUrl}`));
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  res
    .status(error.status || 500)
    .json({ error: error.message || 'Unknown Server Error!' });
});

const cron = require('node-cron');


/////////////////////////////////
//Anna's cron jobs
////////////////////////////////

// booking status update
const updateBookingStatus = require('./models/updateBookingStatus.model.js');

// Schedule a cron job to run every minute
cron.schedule("* * * * * ", updateBookingStatus);
// cron.schedule("*/5 * * * * *", updateBookingStatus); // testing purpose

// feedback states update
const updateFeedbackStates = require('./models/updateFeedbackStates.model.js');

// Schedule the cron job to run daily at midnight
cron.schedule("0 0 * * * *", updateFeedbackStates);
// cron.schedule("*/5 * * * * *", updateFeedbackStates); // testing purpose

////////////////////////////////////////////////////////////////////////////////////////////


const { cancelExpiredBookings } = require('./models/updateTutorBookingStatus.model.js');

// Schedule the cron job to run daily at midnight
cron.schedule('0 0 * * * *', async () => {
  console.log('Checking and updating booking statuses...');
  try {
    await cancelExpiredBookings();
  } catch (error) {
    console.error('Error updating booking statuses:', error);
  }
});


module.exports = app;

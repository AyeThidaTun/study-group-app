const express = require('express');
const { 
  saveMessage, 
  loadMessages,
  createPoll,
  getPolls,
  updateVote
} = require('../models/Chat.model');

module.exports = (io) => {
  const router = express.Router();

  // Endpoint to save a message
  router.post('/save', async (req, res) => {
    const { content, groupId, userId } = req.body;
  
    try {
      // Pass the `io` instance to `saveMessage`
      const message = await saveMessage(content, groupId, userId, io);
      res.status(200).json(message);
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(400).json({ error: error.message || 'Error saving message' });
    }
  });

  // Endpoint to load messages
  router.get('/:groupId', async (req, res) => {
    const { groupId } = req.params;
    console.log('Fetching messages for group:', groupId); // Debug log
  
    try {
      const messages = await loadMessages(groupId);
      if (!messages || messages.length === 0) {
        return res.status(404).json({ error: 'No messages found for this group.' });
      }
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error); // Log the error
      res.status(500).json({ error: 'Failed to load messages' });
    }
  });

  // Create a new poll
  router.post('/createPoll', async (req, res) => {
    const { question, options, groupId, userId } = req.body;
    console.log('req body question: ', req.body.question);
    try {
      const poll = await createPoll(question, options, groupId, userId, io);
      res.status(201).json(poll);
    } catch (error) {
      console.error('Error creating poll:', error);
      res.status(400).json({ error: error.message || 'Error creating poll' });
    }
  });

  // Get Polls by Group ID
  router.get('/getPoll/:groupId', async (req, res) => {
    const { groupId } = req.params;

    try {
      console.log(`Fetching polls for group ${groupId}`); // Debugging log
      const polls = await getPolls(groupId);
      
      if (!polls.length) {
        return res.status(404).json({ message: "No polls found for this group." });
      }

      res.status(200).json(polls);
    } catch (error) {
      console.error('Error fetching polls:', error);
      res.status(500).json({ error: 'Failed to load polls' });
    }
  });

  router.put('/vote', async (req, res) => {
    const { pollId, pollOptionId } = req.body;
  
    try {
      console.log(`Processing vote for pollId: ${pollId}, pollOptionId: ${pollOptionId}`);
  
      if (!pollId || !pollOptionId) {
        return res.status(400).json({ message: 'PollId and PollOptionId are required' });
      }
  
      // Update the vote for the selected poll option
      const updatedPollOption = await updateVote(pollId, pollOptionId);
  
      // Respond with the updated poll option after vote increment
      res.status(200).json({
        message: 'Vote updated successfully',
        updatedPollOption,
      });
    } catch (error) {
      console.error('Error processing vote:', error);
      res.status(500).json({ error: 'Failed to update vote' });
    }
  });
  
  return router;
};



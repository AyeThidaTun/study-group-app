const express = require('express');
const router = express.Router();
const assignedTaskModel = require('../models/AssignedTask.model');

// Add enhanced error handling to /my-groups endpoint
router.get('/my-groups/:id', async (req, res) => {
   const userId = parseInt(req.params.id);
  try {
      if (!userId) {
        console.log(userId);
          return res.status(401).json({ error: "Authentication required" });
      }

      const groups = await assignedTaskModel.getUserStudyGroups(userId);
      
      // Handle case where group relations might be missing
      const validGroups = groups
          .map(g => g.studyGroup)
          .filter(group => group !== null);

      res.json(validGroups);

  } catch (error) {
      console.error("GET /my-groups error:", error);
      res.status(500).json({ 
          error: "Failed to fetch groups",
          details: error.message 
      });
  }
});

router.get('/:groupId/members', async (req, res) => {
  try {
      const groupId = parseInt(req.params.groupId);
      const assignerId = req.params.userId; // Get the assigner's ID

      if (isNaN(groupId)) {
          return res.status(400).json({ error: "Invalid group ID" });
      }

      const members = await assignedTaskModel.getGroupMembers(groupId);

      // Validate group membership for each member being fetched
      const validMembers = members.filter(async (member) => {
          const isValid = await assignedTaskModel.validateGroupMembership(assignerId, member.user.userId);
          return isValid;
      });

      const membersData = validMembers.map((member) => member.user);

      res.json(membersData);

  } catch (error) {
      console.error(`GET /${req.params.groupId}/members error:`, error);
      res.status(500).json({
          error: "Failed to fetch members",
          details: error.message
      });
  }
});

router.get('/:groupId/members', async (req, res) => {
  try {
      const groupId = parseInt(req.params.groupId);
      if (isNaN(groupId)) {
          return res.status(400).json({ error: "Invalid group ID" });
      }

      const members = await assignedTaskModel.getGroupMembers(groupId);
      
      // Filter out any null user references
      const validMembers = members
          .map(m => m.user)
          .filter(user => user !== null);

      res.json(validMembers);

  } catch (error) {
      console.error(`GET /${req.params.groupId}/members error:`, error);
      res.status(500).json({ 
          error: "Failed to fetch members",
          details: error.message 
      });
  }
});

router.get('/assigned-by-me/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const tasks = await assignedTaskModel.getAssignedByUser(userId);
    res.json(tasks);
  } catch (error) {
    console.error("GET /assigned-by-me error:", error);
    res.status(500).json({ error: "Failed to fetch assigned tasks", details: error.message });
  }
});


router.get('/assigned-to-me/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const tasks = await assignedTaskModel.getAssignedToUser(userId);
    res.json(tasks);
  } catch (error) {
    console.error("GET /assigned-to-me error:", error);
    res.status(500).json({ 
      error: "Failed to fetch tasks",
      details: error.message 
    });
  }
});

//  the POST /assign endpoint

router.post('/assign/:id', async (req, res) => {
  try {
    console.log('Received assignment request:', req.body);

    const assignment = await assignedTaskModel.createAssignment({
      ...req.body,
      assignerId: req.params.id,
      assigneeId: req.body.assigneeId // Changed to singular
    });

    console.log('Assignment created successfully:', assignment);
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error in /assign endpoint:', error);
  }
});
   

router.put('/:id', async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updatedTask = await assignedTaskModel.updateAssignment(taskId, req.body);
      
      if (req.body.status === 'ACCEPTED') {
        await assignedTaskModel.convertToTodo(taskId);
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500);
      console.error("PUT /:id error:", error);
    }
  });

module.exports = router;
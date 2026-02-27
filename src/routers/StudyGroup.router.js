const express = require("express");
const router = express.Router();
const {
  getAllStudyGroups,
  createStudyGroup,
  addUserToGroup,
  getUserJoinedGroups,
  removeUserFromGroup,
  deleteStudyGroupAsCreator,
  getStudyGroupById,
  getGroupNameById
} = require('../models/StudyGroup.model');

// Retrieve all study groups
router.get("/", (req, res, next) => {
  getAllStudyGroups()
    .then((groups) => res.status(200).json(groups))
    .catch(next);
});

// Create a new study group
router.post("/", (req, res, next) => {
  const { name, description, createdBy } = req.body; // Ensure these fields are passed in the request
  createStudyGroup({ name, description, createdBy })
    .then((group) => res.status(201).json(group))
    .catch(next);
});

// Add user to a study group
router.post("/join", (req, res) => {

  const { userId, groupId } = req.body;
  
  console.log("userid: ", userId);
  console.log("groupid: ", groupId);
  if (!userId || !groupId) {
    return res.status(400).json({ error: "userId and groupId are required" });
  }

  addUserToGroup(userId, groupId)
    .then((membership) =>
      res
        .status(201)
        .json({ message: "Joined study group successfully", membership })
    )
    .catch((error) => res.status(400).json({ error: error.message }));
});

// Retrieve groups joined by a specific user
router.get("/joined/:userId", (req, res) => {
  const { userId } = req.params;
  console.log("Requested userId:", userId); 
  getUserJoinedGroups(parseInt(userId))
    .then((groups) => res.status(200).json(groups))
    .catch((error) =>
      res.status(400).json({ error: error.message || "Error fetching joined groups" })
    );
});

// Remove user from a study group
router.post("/leave", (req, res) => {
  const { userId, groupId } = req.body;

  if (!userId || !groupId) {
    return res.status(400).json({ error: "userId and groupId are required" });
  }

  removeUserFromGroup(userId, groupId)
    .then(() => res.status(200).json({ message: "Left study group successfully" }))
    .catch((error) => res.status(400).json({ error: error.message }));
});

// Delete a study group
router.post("/delete", (req, res) => {
  const { userId, groupId } = req.body;

  if (!userId || !groupId) {
    return res.status(400).json({ error: "userId and groupId are required" });
  }

  deleteStudyGroupAsCreator(userId, groupId)
    .then(() => res.status(200).json({ message: "Deleted study group successfully" }))
    .catch((error) => res.status(400).json({ error: error.message }));
});

// Retrieve a study group by groupId
router.get("/:groupId", (req, res) => {
  const { groupId } = req.params;

  getStudyGroupById(groupId)
    .then((group) => res.status(200).json(group))
    .catch((error) => {
      console.error(error);
      res.status(404).json({ error: error.message || "Study group not found" });
    });
});

router.get("/getGroupName/:groupId", (req, res) => {
  const { groupId } = req.params;

  getGroupNameById(groupId)
    .then((group) => res.status(200).json(group))
    .catch((error) => {
      console.error(error);
      res.status(404).json({ error: error.message || "Study group not found" });
    });
});



module.exports = router;
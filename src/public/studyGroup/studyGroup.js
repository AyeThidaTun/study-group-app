const apiUrl = "."; // Adjust this if your API is hosted elsewhere

// Fetch and display all study groups
function populateStudyGroupsTable() {
  const userId = parseInt(localStorage.getItem("userId")); // Fetch logged-in user's ID
  console.log("User ID:", userId); // Log the user ID to make sure it's being fetched

  fetch(`${apiUrl}/`)
    .then((response) => {
      console.log("Response received:", response); // Log the response before parsing
      return response.json();
    })
    .then((groups) => {
      console.log("Groups data:", groups); // Log the data fetched from the API

      const container = document.getElementById("studyGroupsContainer");
      container.innerHTML = ""; // Clear existing cards

      groups.forEach((group) => {
        console.log("Group:", group); // Log each group for debugging

        const members = Array.isArray(group.members) ? group.members : [];
        console.log("Members of group:", members); // Log members of each group

        // Debugging step: Check each member and log their userId
        members.forEach((member) => {
          console.log("Checking member:", member); // Log each member
          console.log(
            "Member UserId:",
            member.userId,
            "Type:",
            typeof member.userId
          );
        });

        // Check if the userId is in the members array (direct comparison)
        const hasJoined = members.includes(userId);
        console.log("Has the user joined this group?", hasJoined); // Log the result

        // Check if the logged-in user created the group
        const isCreator = group.createdBy === userId;
        
        // Create a card element
        const card = document.createElement("div");
        card.className = "col-md-4";
        //made card clickable which connects to details page
        card.innerHTML = `
          
                <div class="card h-100 shadow-sm">
                  
                    <div class="card-body" onclick="goToGroupDetails(${group.groupId})"> 
                      <h5 class="card-title">${group.name}</h5>
                      <p class="card-text">${group.description}</p>
                      ${
                        isCreator
                          ? `<span class="text-danger">(Created By You)</span>`
                          : ``
                      }
                    </div>
                  <div class="card-footer text-center p-2">
                    ${
                      hasJoined
                        ? `<span class="badge bg-success">Joined</span>`
                        : `<button class="btn btn-custom join-button" data-group-id="${group.groupId}">Join</button>`
                    }
                  </div>
                </div>
            
            `;

            if (!isCreator || !hasJoined) {
              const joinButton = card.querySelector(".join-button");
    
              // Debugging: Check if joinButton exists
              if (joinButton) {
                console.log("Join button found for group:", group.groupId);
                joinButton.onclick = (event) => {               
                  event.preventDefault(); // Prevent the default anchor behavior
    
                  const groupId = joinButton.getAttribute("data-group-id");
                  joinStudyGroup(userId, parseInt(groupId));
                };
              } else {
                console.error(
                  "Join button not found for group:",
                  group.groupId,
                  "Card:",
                  card.innerHTML
                );
              }
            }

        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error fetching study groups:", error);
    });
}

// Fetch and display joined groups
function populateJoinedGroupsTable() {
  const userId = parseInt(localStorage.getItem("userId")); // Fetch logged-in user's ID
  fetch(`/studyGroup/joined/${userId}`)
    .then((response) => response.json())
    .then((groups) => {
      const container = document.getElementById("joinedGroupsContainer");
      container.innerHTML = ""; // Clear existing cards
      if (Array.isArray(groups)) {
        groups.forEach((group) => {
          // Create a card element
          const card = document.createElement("div");
          card.className = "col-md-4";

          const isCreator = group.createdBy === userId; // Check if user is the creator

          card.innerHTML = `
            <div class="card h-100 shadow-sm">
              <div class="card-body" onclick="goToGroupDetails(${group.groupId})">
                <h5 class="card-title">${group.name}</h5>
                <p class="card-text">${group.description}</p>
              </div>
              <div class="card-footer text-center">
                ${
                  isCreator
                    ? `<button class="btn btn-danger delete-button" data-group-id="${group.groupId}">Delete</button>
                    <button class="btn btn-danger leave-button" data-group-id="${group.groupId}">Leave</button>`
                    : `<button class="btn btn-danger leave-button" data-group-id="${group.groupId}">Leave</button>`
                }
              </div>
            </div>
          `;

          // Add event listeners for Leave and Delete buttons
          const leaveButton = card.querySelector(".leave-button");
          if (leaveButton) {
            leaveButton.onclick = () => {
              const groupId = leaveButton.getAttribute("data-group-id");
              console.log("Leaving group with ID:", groupId);
              leaveStudyGroup(userId, parseInt(groupId));
              // window.location.reload();
            };
          }

          const deleteButton = card.querySelector(".delete-button");
          if (deleteButton) {
            deleteButton.onclick = () => {
              const groupId = deleteButton.getAttribute("data-group-id");
              console.log("Deleting group with ID:", groupId);
              deleteStudyGroup(userId, parseInt(groupId));
              // window.location.reload();
            };
          }

          container.appendChild(card);
        });
      } else {
        console.error("Expected an array, but got:", groups);
      }
    })
    .catch((error) => console.error("Error fetching joined groups:", error));
}

// Function to delete a study group
function deleteStudyGroup(userId, groupId) {
  fetch(`${apiUrl}/studyGroup/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, groupId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error("Error deleting study group:", data.error);
        alert(data.error);
      } else {
        alert("Successfully deleted the study group!");
        window.location.reload();
        populateJoinedGroupsTable(); // Refresh the table
      }
    })
    .catch((error) => console.error("Error deleting study group:", error));
}


// Join a study group
function joinStudyGroup(userId, groupId) {
  // var userId = parseInt(localStorage.getItem("userId")); // Fetch userId from localStorage
  fetch(`${apiUrl}/studyGroup/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      groupId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error("Error joining study group:", data.error);
        alert(data.error);
      } else {
        alert("Successfully joined the study group!");
        window.location.reload();
        populateStudyGroupsTable(); // Refresh the table
        populateJoinedGroupsTable();
      }
    })
    .catch((error) => console.error("Error joining study group:", error));
}

// Leave a study group
function leaveStudyGroup(userId, groupId) {
  fetch(`${apiUrl}/studyGroup/leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, groupId }),
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.error) {
      console.error("Error leaving study group:", data.error);
    } else {
      alert("Successfully left group!");
      window.location.reload();
      populateStudyGroupsTable(); // Refresh the groups table
      populateJoinedGroupsTable(); // Refresh the joined groups table
    }
  })
  .catch((error) => console.error("Error leaving study group:", error));
}

// Function to add a new study group
function addStudyGroup(event) {
  event.preventDefault();

  const groupName = document.getElementById("groupName").value.trim();
  const groupDescription = document.getElementById("groupDescription").value.trim();

  if (groupName === "" || groupDescription === "") {
    alert("Group name and description cannot be empty or only spaces.");
    return; 
  }
  
  fetch(`${apiUrl}/studyGroup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: groupName,
      description: groupDescription,
      createdBy: parseInt(localStorage.getItem("userId")),
    }),
  })
    .then((response) => response.json())
    .then(() => {
      alert("Successfully created a new group!");
      populateStudyGroupsTable(); // Refresh the table
      document.getElementById("studyGroupForm").reset(); // Reset the form
      window.location.reload();
    })
    .catch((error) => console.error("Error adding study group:", error));
}
// eslint-disable-next-line no-unused-vars
function goToGroupDetails(groupId) {
  localStorage.setItem("selectedGroupId", groupId);
  console.log("clicked the card");
  window.location.href = "../studyGroup/studyGroupDetails.html"; 
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Populate the study groups table on page load
  populateStudyGroupsTable();

  // Populate the joined groups table on page load
  populateJoinedGroupsTable();

  const form = document.getElementById("studyGroupForm");
  form.addEventListener("submit", addStudyGroup);
});

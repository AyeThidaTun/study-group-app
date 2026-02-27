/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

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
                <div class="card-body" onclick="goToGroupDetails(${
                  group.groupId
                })">
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

function goToGroupDetails(groupId) {
  localStorage.setItem("selectedGroupId", groupId);
  console.log("clicked the card");
  window.location.href = "../groupChat/groupChat.html";
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Populate the joined groups table on page load
  populateJoinedGroupsTable();
});

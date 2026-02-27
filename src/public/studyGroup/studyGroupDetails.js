const apiUrl = "."; // Adjust this if your API is hosted elsewhere

function populateStudyGroupDetails(groupId) {
    console.log("Populating data for details...");
  
    const userId = parseInt(localStorage.getItem("userId")); // Fetch logged-in user's ID
  
    if (!groupId) {
      alert("No group selected!");
      return;
    }
  
    // Fetch the details of the study group by its ID
    fetch(`${apiUrl}/${groupId}`)
      .then((response) => response.json())
      .then((groupDetails) => {
        // Debugging: Log the fetched group details
        console.log("Fetched Group Details:", groupDetails);
  
        if (!groupDetails || !groupDetails.name) {
          console.error("Invalid group details received!");
          alert("Error: Unable to fetch study group details.");
          return;
        }
  
        // Populate group name
        const groupNameElement = document.getElementById("groupName");
        groupNameElement.innerHTML = `<i class="bi bi-people-fill"></i> ${groupDetails.name}`
  
        // Populate group description
        const groupDescriptionElement = document.getElementById("groupDescription");
        groupDescriptionElement.textContent += groupDetails.description;
  
        // Populate group members
        const groupMembersElement = document.getElementById("groupMembers");
        groupMembersElement.innerHTML = ""; // Clear existing members, if any
  
        const members = groupDetails.members || []; // Handle cases with no members
        if (members.length > 0) {
          groupMembersElement.innerHTML = "<p>Members</p>";
          members.forEach((member) => {           
            const listItem = document.createElement("li");
            listItem.textContent = member.name; // Assuming `name` is a property of each member
            groupMembersElement.appendChild(listItem);
          });
        }
  
        // Display the total number of members
        const memberCount = document.createElement("p");
        memberCount.className = "mt-3";
        memberCount.innerHTML = `<span><b>Total Members: ${members.length}</b></span>`;
        groupMembersElement.parentElement.appendChild(memberCount);
  
        // Check if the user has joined the group
        const hasJoined = members.some((member) => member.userId === userId);
  
        // Check if the logged-in user created the group
        const isCreator = groupDetails.createdBy === userId;
  
        const creatorElement = document.getElementById("creatorText");

        if (isCreator) {
            creatorElement.innerHTML += `<span class="text-danger">(Created by You)</span>`;
          } 

        // Populate status or action button
        const groupStatusElement = document.getElementById("groupStatus");
        
        if (hasJoined) {
          groupStatusElement.innerHTML = `<span class="badge bg-success">Joined</span>`;
        } else {
          groupStatusElement.innerHTML = `
            <button class="btn btn-custom" id="joinGroupButton" data-group-id="${groupId}" type="submit">Join Group</button>
          `;
        }

        if (!isCreator || !hasJoined) {
            const joinButton = document.getElementById("joinGroupButton");
  
            // Debugging: Check if joinButton exists
            if (joinButton) {
              console.log("Join button found for group:", groupId);
              joinButton.onclick = (event) => {               
                event.preventDefault(); // Prevent the default anchor behavior
  
                const groupId = joinButton.getAttribute("data-group-id");
                joinStudyGroup(userId, parseInt(groupId));
              };
            } else {
              console.error(
                "Join button not found for group:",
                groupId
              );
            }
          }
      })
      .catch((error) => {
        console.error("Error fetching group details:", error);
        alert("Error: Unable to load study group details.");
      });
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
          /* global populateStudyGroupsTable, populateJoinedGroupsTable */
          populateStudyGroupsTable(); // Refresh the table
          populateJoinedGroupsTable();
        }
      })
      .catch((error) => console.error("Error joining study group:", error));
  }

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  var groupId = localStorage.getItem("selectedGroupId");
  console.log("Group id in study group details: ", groupId);
  populateStudyGroupDetails(groupId);
});

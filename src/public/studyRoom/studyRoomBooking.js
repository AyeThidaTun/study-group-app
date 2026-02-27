const apiUrl = "."; // Adjust this if your API is hosted elsewhere
// const urlParams = new URLSearchParams(window.location.search);

// Fetch and display joined groups
function populateJoinedGroupsTable() {
  const userId = parseInt(localStorage.getItem("userId"));
  const roomId = localStorage.getItem("roomId"); // Fetch logged-in user's ID

  fetch(`/studyGroup/joined/${userId}`)
    .then((response) => response.json())
    .then((groups) => {
      const container = document.getElementById("studyGroupContainer");
      container.innerHTML = ""; // Clear existing cards
      if (Array.isArray(groups)) {
        groups.forEach((group) => {
          // Create a card element
          const card = document.createElement("div");
          card.className = "col-md-4";

          card.innerHTML = `
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">${group.name}</h5>
                  <p class="card-text">${group.description}</p>
                </div>
                <div class="card-footer text-center">
                  <button class="btn btn-custom" id="selectGroup" onclick="showConfirmationModal(${roomId}, ${group.groupId}, '${group.name}')">Select</button>
                </div>
              </div>
            `;

          container.appendChild(card);
        });
      } else {
        console.error("Expected an array, but got:", groups);
      }
    })
    .catch((error) => console.error("Error fetching joined groups:", error));
}

// Function to show the confirmation modal
// eslint-disable-next-line no-unused-vars
function showConfirmationModal(roomId, groupId, groupName) {
  const modal = document.getElementById("confirmationModal");
  const confirmationText = document.getElementById("confirmationText");
  const slotId = localStorage.getItem("slotId");
  const selectedDate = localStorage.getItem("selectedDate");
  const startTime = localStorage.getItem("startTime");
  console.log('start time: ', startTime);

  // Combine the selected date and time to create a valid Date object
  const bookingStartDateTime = new Date(`${selectedDate}T${startTime}:00`);
  console.log('booking date time: ', bookingStartDateTime);
  // Check if the Date objects are valid
  if (isNaN(bookingStartDateTime)) {
    console.error("Invalid date or time format");
    return;
  }
  // Format as ISO string
  const formattedStartDateTime = bookingStartDateTime.toISOString();

  // Log to see the result
  console.log(formattedStartDateTime, formattedStartDateTime);
  // Update modal content dynamically
  confirmationText.textContent = `Are you sure you want to reserve the room for your group, "${groupName}" on ${selectedDate}?`;

  // Set up the Confirm button's action
  const confirmBookingBtn = document.getElementById("confirmBookingBtn");
  confirmBookingBtn.onclick = () => {
    closeConfirmationModal(); // Close modal before proceeding
    bookRoom(roomId, groupId, formattedStartDateTime, slotId); // Perform the booking
  };

  modal.style.display = "flex"; // Show the modal
}

// Function to close the confirmation modal
function closeConfirmationModal() {
  const modal = document.getElementById("confirmationModal");
  modal.style.display = "none";
}

// Book the room for the selected group
function bookRoom(roomId, groupId, selectedDate, slotId) {
  console.log(`Booking room ${roomId} for group ${groupId}`);
  fetch(`${apiUrl}/studyRoom/bookRoom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, groupId, selectedDate, slotId: parseInt(slotId) }),
  })
    .then((response) => {
      if (response.ok) {
        // alert("Room successfully reserved! Pls proceed to your bookings page to confirm your booking within 30 minutes.");
        // window.location.href = "../studyRoom/studyRoom.html"; // Redirect to confirmation page
        // Show the notification on successful booking
        const notification = document.getElementById("bookingNotification");
        notification.style.display = "block"; // Display the notification

        // Optionally, hide the notification after a few seconds
        setTimeout(() => {
          notification.style.display = "none"; // Hide the notification
        }, 5000); // Hide after 5 seconds (adjust as needed)

        // window.location.href = "../studyRoom/studyRoom.html";
      } else {
        return response.json().then((err) => {
          throw new Error(err.message || "Booking failed");
        });
      }
    })
    .catch((error) => alert(`Error booking room: ${error.message}`));
}


// Function to display the booking details on the booking page
function displayBookingDetails() {
  const roomId = localStorage.getItem("roomId");
  const slotId = localStorage.getItem("slotId");
  const selectedDate = localStorage.getItem("selectedDate");

  // Fetch room and slot details using roomId, slotId, and selectedDate
  fetch(`${apiUrl}/slots/${roomId}?selectedDate=${selectedDate}`)
    .then((response) => response.json())
    .then((room) => {
      const slot = room.slots.find((s) => s.slotId === parseInt(slotId));

      const bookingDetails = document.getElementById("bookingDetails");
      bookingDetails.innerHTML = `
        <h5>You are booking for: ${room.name} on ${selectedDate} from ${slot.startTime} - ${slot.endTime}.</h5>
        <p>Pls choose the group you want to book with.</p>
      `;
    })
    .catch((error) => console.error("Error fetching booking details:", error));
}

// Function to confirm booking (this could be an API call to finalize the booking)
// function confirmBooking(roomId, slotId, selectedDate) {
//   // Perform booking logic, e.g., API call to create a booking
//   alert("Booking confirmed!");
// }

document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("Error: userId not found in localStorage.");
    return;
  }
  console.log("userId fetched:", userId);
  displayBookingDetails();
  populateJoinedGroupsTable();
});

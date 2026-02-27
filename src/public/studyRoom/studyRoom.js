const apiUrl = "."; // Adjust this if your API is hosted elsewhere

// Function to populate study rooms (you may replace with an actual API call)
function populateAllStudyRooms(query = "") {
  console.log("Fetching all study rooms...");
  const container = document.getElementById("studyRoomContainer");
  container.innerHTML = ""; // Clear existing content

  fetch(`${apiUrl}/${query}/all`)
    .then((response) => response.json())
    .then((rooms) => {
      if (rooms.error) {
        console.error("Error fetching study room:", rooms.error);
        alert(rooms.error);
      } else {
        console.log('rooms from js file: ', rooms);
        rooms.forEach((room) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                            <td>${room.name}</td>
                            <td><span class="room-type-badge">${room.roomType}</span></td>
                            <td>${room.location}</td>
                            <td><button class="btn btn-custom" onclick="viewRoomDetails(${room.roomId})">View Slots</button></td>
                        `;
            container.appendChild(row);
        });;
      }
    })
    .catch((error) => console.error("Error joining study group:", error));

}

// Function to populate filtered study rooms
function populateFilteredStudyRooms(filter) {
  const container = document.getElementById("studyRoomContainer");
  container.innerHTML = ""; // Clear existing content

  fetch(`${apiUrl}/studyRoom/${filter}`)
    .then((response) => response.json())
    .then((rooms) => {
      if (rooms.error) {
        console.error("Error fetching study rooms:", rooms.error);
        alert(rooms.error);
      } else {
        console.log(`Filtered rooms by ${filter}:`, rooms);
        if (rooms.length === 0) {
          container.innerHTML = `<tr><td colspan="4" class="text-center">No rooms available for the selected type.</td></tr>`;
          return;
        }
        
        rooms.forEach((room) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${room.name}</td>
              <td><span class="room-type-badge">${room.roomType}</span></td>
              <td>${room.location}</td>
              <td><button class="btn btn-custom" onclick="viewRoomDetails(${room.roomId})">View Slots</button></td>
          `;
          container.appendChild(row);
        });
      }
    })
    .catch((error) => console.error("Error fetching study rooms:", error));
}


// Function to filter rooms based on the selected room type
function filterRooms() {
  const selectedType = document.getElementById("roomTypeFilter").value;
  console.log('selected type in filter: ', selectedType);
  if (selectedType === "all") {
    console.log("Fetching all study rooms...");
    populateAllStudyRooms("studyRoom"); // Show all rooms
  } else {
    console.log("User choosed a filter option!")
    populateFilteredStudyRooms(selectedType); // Show filtered rooms
  }
}

// Function to simulate viewing room details (you can replace this with actual navigation)
// eslint-disable-next-line no-unused-vars
function viewRoomDetails(roomId) {
  console.log("View details for room ID:", roomId);
  localStorage.setItem("roomId", roomId);
  // Redirect to room details page (replace with your actual page)
  window.location.href = "../studyRoom/studyRoomSlots.html";
}

// Function to populate filter options dynamically from the database
function populateRoomTypeFilter() {
  fetch(`${apiUrl}/types`) // Endpoint to fetch unique room types
    .then((response) => response.json())
    .then((types) => {
      const filterDropdown = document.getElementById("roomTypeFilter");

      filterDropdown.innerHTML = `<option value="all" selected>All</option>`; // Default option

      types.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        filterDropdown.appendChild(option);
      });
    })
    .catch((error) =>
      console.error("Error fetching room types for filter:", error)
    );
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  populateRoomTypeFilter(); // Populate filter dropdown on page load
  populateAllStudyRooms(); // Populate all rooms on page load
  // Add event listener for the filter dropdown
  document.getElementById("roomTypeFilter").addEventListener("change", filterRooms);
});

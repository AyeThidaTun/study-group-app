// const apiUrl = "."; // Adjust this if your API is hosted elsewhere

document.addEventListener("DOMContentLoaded", () => {
  var calendarEl = document.getElementById("calendar");
/* global FullCalendar */
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    dateClick: function (info) {
      const clickedDate = new Date(info.dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to midnight for comparison

      if (clickedDate >= today) {
        openModal(info.dateStr); // Open modal only for today or future dates
      } else {
        alert("You cannot book past dates."); // Show a message for past dates
      }
    },
    height: "auto",
    contentHeight: "auto",
  });

  calendar.render();
});

// Fetch and display available slots in the modal
function openModal(selectedDate) {
  const roomId = localStorage.getItem("roomId");  // Get roomId from localStorage
  fetchAvailableSlots(roomId, selectedDate);

  // Show modal
  const modal = document.getElementById('roomModal');
  modal.style.display = 'flex';
}

// Function to fetch available slots for the selected room and date
function fetchAvailableSlots(roomId, selectedDate) {
  fetch(`/studyRoom/slots/${roomId}?selectedDate=${selectedDate}`)
    .then((response) => response.json())
    .then((room) => {
      const roomsContainer = document.getElementById("roomsContainer");
      roomsContainer.innerHTML = ""; // Clear the container before adding new data
    
      const roomCard = document.createElement("div");
      roomCard.classList.add("room-card");

      roomCard.innerHTML = `
    <h5>Selected date: ${selectedDate}</h5><br>
    <h4>${room.name}</h4>
    <p>Location: ${room.location}</p>
    <p>Capacity: ${room.capacity}</p>
    <h4>Available Slots:</h4>
    <form id="slotSelectionForm">
        <ul>
            ${room.slots
              .map(
                (slot) => `
                <li class="m-3">
                    <label class="${!slot.isAvailable ? "disabled-slot" : ""}">
                        <input 
                            type="radio" 
                            name="slotSelection" 
                            value="${slot.slotId}" 
                            ${!slot.isAvailable ? "disabled" : ""}>
                        ${slot.startTime} - ${slot.endTime}
                        ${
                          !slot.isAvailable
                            ? '<span class="unavailable m-3">(Booked)</span>'
                            : ""
                        }
                    </label>
                </li>`
              )
              .join("")}
        </ul>
        <button type="button" class="btn btn-custom" id="bookRoomButton" onclick="handleSlotSelection(${
          room.roomId
        }, '${selectedDate}')">
           Book this room    <i class="bi bi-calendar-check"></i>
        </button>
    </form>
`;

      roomsContainer.appendChild(roomCard);
    })
    .catch((error) => console.error("Error fetching available slots:", error));
}
// eslint-disable-next-line no-unused-vars
function handleSlotSelection(roomId, selectedDate) {
  // Get the selected radio button
  const selectedRadio = document.querySelector(
    'input[name="slotSelection"]:checked'
  );

  if (!selectedRadio) {
    alert("Please select a slot.");
    return;
  }

  const selectedSlotId = selectedRadio.value;
  // Find the closest label that contains the start and end time
  const slotLabel = selectedRadio.closest("label");
  if (!slotLabel) {
    alert("Unable to find the slot details.");
    return;
  }

  // Extract start and end time from the label
  const timeText = slotLabel.textContent.trim();
  const timeParts = timeText.split(" - ");
  if (timeParts.length < 2) {
    alert("Invalid slot time format.");
    return;
  }

  const startTime = timeParts[0].trim();
  // Store the booking details in localStorage
  localStorage.setItem("roomId", roomId);
  localStorage.setItem("selectedDate", selectedDate);
  localStorage.setItem("slotId", selectedSlotId);
  localStorage.setItem("startTime", startTime);

  // Example: Redirect to the booking page without query parameters
  window.location.href = "../studyRoom/studyRoomBooking.html";
}



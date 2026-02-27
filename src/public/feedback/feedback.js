/* eslint-disable no-unused-vars */
// Function to display the feedback action button or status based on the FeedbackState enum
function displayFeedbackButton(feedbackState, bookingId) {
  console.log('feedback state UI ', feedbackState);
    switch (feedbackState) {
      case "UNACTIVATED":
        return '<span class="text-secondary">Not Available</span>';
      case "PENDING":
        return `<button class="btn btn-custom" onclick="openFeedbackForm(${bookingId})">Give Feedback</button>`;
      case "COMPLETED":
        return '<span class="text-success">Completed</span>';
      case "EXPIRED":
        return '<span class="text-danger">Expired</span>';
      default:
        return '<span class="text-secondary">Unknown Status</span>';
    }
  }
  
  // Function to load bookings and dynamically display them in the table
  async function loadBookings(userId, groupFilter = "all") {
    const bookingsTableBody = document.getElementById("bookingsTableBody");
    bookingsTableBody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

    try {
        const response = await fetch(`/studyRoom/confirmedBookings/${userId}?groupFilter=${groupFilter}`);
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const bookings = await response.json();
        bookingsTableBody.innerHTML = ""; // Clear table
        console.log('group filter in loadbookings: ', groupFilter);
        bookings.forEach((booking) => {
          if (groupFilter && groupFilter !== "all" && booking.groupName !== groupFilter) return; // Fix filter check
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${booking.roomName}</td>
              <td>${booking.bookingDate}</td>
              <td>${booking.startTime} - ${booking.endTime}</td>
              <td>${booking.roomLocation}</td>
              <td>${booking.groupName}</td>
              <td>${displayFeedbackButton(booking.feedbackState, booking.bookingId)}</td>
          `;
          bookingsTableBody.appendChild(row);
      });
    } catch (error) {
        console.error("Error loading bookings:", error);
        bookingsTableBody.innerHTML = `<tr><td colspan="6">Error loading bookings.</td></tr>`;
    }
}
  
  // Function to handle the opening of the feedback form
  function openFeedbackForm(bookingId) {
    console.log("Opening feedback form for booking:", bookingId);
    localStorage.setItem('bookingId', bookingId);
    window.location.href="../feedback/feedbackForm.html";
  }

  async function loadPendingFeedbacks(userId, groupFilter = "all") {
    const pendingFeedbackList = document.getElementById("pendingFeedbackList");
    pendingFeedbackList.innerHTML = `<p class="text-center">Loading pending feedbacks...</p>`;
  
    try {
      const response = await fetch(`/feedback/pendingFeedbacks/${userId}?groupFilter=${groupFilter}`);
  
      // Handle non-200 status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // In case the error response isn't JSON
        const errorMessage = errorData.message || "Failed to fetch pending feedbacks.";
        throw new Error(errorMessage);
      }
  
      const feedbacks = await response.json();
      pendingFeedbackList.innerHTML = ""; // Clear previous content
      console.log("Pending Feedbacks:", feedbacks);
  
      // Handle no pending feedbacks
      if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
        pendingFeedbackList.innerHTML = `
        <div class="container">
          <div class="card col-md-5 shadow-sm">
            <div class="card-body">
              <p class="text-center">No pending feedbacks yet.</p>
            </div>
          </div>
        </div>
        `;
        return;
      }
  
      // Display feedback cards
      feedbacks.forEach((feedback) => {
        if (groupFilter && groupFilter !== "all" && feedback.groupName !== groupFilter) return;
        const card = document.createElement("div");
        card.className = "col-md-4"; // Each card takes up 4 columns (3 cards per row)
        card.innerHTML = `
          <div class="card mb-3 shadow-sm">
            <div class="card-body">
              <h5 class="card-title"><i class="bi bi-people-fill"></i> ${feedback.groupName}</h5>
              <p class="card-text">
                <strong>Room:</strong> ${feedback.roomName || "N/A"}<br>
                <strong>Date:</strong> ${feedback.bookingDate || "N/A"}<br>
                <strong>Time:</strong> ${feedback.startTime || "-"} - ${feedback.endTime || "-"}<br>
                <strong>Location:</strong> ${feedback.roomLocation || "N/A"}
              </p>
              <button class="btn btn-custom" onclick="openFeedbackForm(${feedback.bookingId})">Give Feedback</button>
            </div>
          </div>
        `;
        pendingFeedbackList.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading pending feedbacks:", error);
      pendingFeedbackList.innerHTML = `<p class="text-center text-danger">Error: ${error.message}</p>`;
    }
  }

  async function loadDisclosedFeedbacks(userId, groupFilter = "all") {
    const disclosedFeedbackList = document.getElementById("disclosedFeedbackList");
    disclosedFeedbackList.innerHTML = `<p class="text-center">Loading disclosed feedbacks...</p>`;
  
    try {
      const response = await fetch(`/feedback/disclosedFeedbacks/${userId}?groupFilter=${groupFilter}`);
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to fetch disclosed feedbacks.";
        throw new Error(errorMessage);
      }
  
      const feedbacks = await response.json();
      disclosedFeedbackList.innerHTML = "";
  
      if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
        disclosedFeedbackList.innerHTML = `
          <div class="container">
            <div class="card col-md-5 shadow-sm">
              <div class="card-body">
                <p class="text-center">No disclosed feedbacks yet.</p>
              </div>
            </div>
          </div>
        `;
        return;
      }
  
      feedbacks.forEach((feedback) => {
        if (groupFilter && groupFilter !== "all" && feedback.groupName !== groupFilter) return;
        const card = document.createElement("div");
        card.className = "col-md-4"; // Each card takes up 4 columns (3 cards per row)
        card.innerHTML = `
          <div class="card mb-3 shadow-sm">
            <div class="card-body">
            <h5 class="card-title"><i class="bi bi-chat-left-text-fill"></i> Feedback from ${feedback.feedbackGiver}</h5>
            <p class="card-text">
              <strong>Group:</strong> ${feedback.groupName}<br>
              <strong>Session Date:</strong> ${feedback.bookingDate || "N/A"}<br>
              <strong>Comments:</strong> ${feedback.feedbackComments || "No comments"}<br>
              <strong><i class="bi bi-star-fill text-warning"></i> Rating:</strong> ${feedback.feedbackRating || "No rating"}
            </p>
          </div>
        `;
        disclosedFeedbackList.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading disclosed feedbacks:", error);
      disclosedFeedbackList.innerHTML = `<p class="text-center text-danger">Error: ${error.message}</p>`;
    }
  }

  async function loadJoinedStudyGroups(userId) {
    try {
        const response = await fetch(`/studyGroup/joined/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch study groups");

        const groups = await response.json();
        const filterDropdown = document.getElementById("studyGroupFilter");

        filterDropdown.innerHTML = `<option value="all">All Groups</option>`; // Reset dropdown
        console.log('loaded joined study groups')
        console.log('groups: ', groups);
        groups.forEach(group => {
            const option = document.createElement("option");
            option.value = group.name;
            option.textContent = group.name;
            filterDropdown.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading study groups:", error);
    }
}

async function loadFilteredDisclosedFeedbacks(userId, startDate, endDate) {
  const disclosedFeedbackList = document.getElementById("disclosedFeedbackList");
  disclosedFeedbackList.innerHTML = `<p class="text-center">Loading disclosed feedbacks...</p>`;

  console.log('userid: ', userId);
  console.log('startDate: ', startDate);
  console.log('endDate: ', endDate);

  try {
    const response = await fetch(`/feedback/filteredFeedbacks/${userId}?startDate=${startDate}&endDate=${endDate}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Failed to fetch disclosed feedbacks.";
      throw new Error(errorMessage);
    }

    const feedbacks = await response.json();
    disclosedFeedbackList.innerHTML = "";

    if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
      disclosedFeedbackList.innerHTML = `
        <div class="container">
          <div class="card col-md-5 shadow-sm">
            <div class="card-body">
              <p class="text-center">No disclosed feedbacks yet.</p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    feedbacks.forEach((feedback) => {
      const card = document.createElement("div");
      card.className = "col-md-4"; // Each card takes up 4 columns (3 cards per row)
      card.innerHTML = `
        <div class="card mb-3 shadow-sm">
          <div class="card-body">
          <h5 class="card-title"><i class="bi bi-chat-left-text-fill"></i> Feedback from ${feedback.feedbackGiver}</h5>
          <p class="card-text">
            <strong>Group:</strong> ${feedback.groupName}<br>
            <strong>Session Date:</strong> ${feedback.bookingDate || "N/A"}<br>
            <strong>Comments:</strong> ${feedback.feedbackComments || "No comments"}<br>
            <strong><i class="bi bi-star-fill text-warning"></i> Rating:</strong> ${feedback.feedbackRating || "No rating"}
          </p>
        </div>
      `;
      disclosedFeedbackList.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading disclosed feedbacks:", error);
    disclosedFeedbackList.innerHTML = `<p class="text-center text-danger">Error: ${error.message}</p>`;
  }
}

function applyFilters() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  const userId = localStorage.getItem("userId");
  
  // Convert the start and end dates to local date objects.
  const startDateTime = new Date(startDate);
  startDateTime.setHours(0, 0, 0, 0); // Set to start of the day in local time

  const endDateTime = new Date(endDate);
  endDateTime.setHours(23, 59, 59, 999); // Set to end of the day in local time

  // Convert these local dates to UTC for comparison
  const startDateUTC = new Date(startDateTime.getTime() - startDateTime.getTimezoneOffset() * 60000);
  const endDateUTC = new Date(endDateTime.getTime() - endDateTime.getTimezoneOffset() * 60000);

  console.log('startDateTime (local): ', startDateTime);
  console.log('endDateTime (local): ', endDateTime);
  console.log('startDateUTC: ', startDateUTC);
  console.log('endDateUTC: ', endDateUTC);

  // Load the feedbacks with the selected date range.
  loadFilteredDisclosedFeedbacks(userId, startDateUTC.toISOString(), endDateUTC.toISOString());
}

  
document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User ID not found.");
    return;
  }

  await loadJoinedStudyGroups(userId); // Ensure dropdown options are loaded first

  const filterDropdown = document.getElementById("studyGroupFilter");
  const selectedGroup = filterDropdown.value || ""; // Get the selected group after loading options

  // Proceed if both dates are either filled or both are empty
  loadBookings(userId, selectedGroup);
  loadDisclosedFeedbacks(userId, selectedGroup);
  loadPendingFeedbacks(userId, selectedGroup);

  // Attach event listener after options are available
  filterDropdown.addEventListener("change", async function () {
    const selectedGroup = this.value; // Update selected group
    console.log("Filtering by group:", selectedGroup);
    await loadBookings(userId, selectedGroup);
    await loadDisclosedFeedbacks(userId, selectedGroup);
    await loadPendingFeedbacks(userId, selectedGroup);
  });

  const applyButton = document.getElementById("applyButton");
  // Add event listener for the Apply button
  applyButton.addEventListener("click", applyFilters);

  const resetButton = document.getElementById("resetButton");
  resetButton.addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent form submission if applicable
    document.getElementById("startDate").value = ''; // Clear the start date
    document.getElementById("endDate").value = '';
    
    const selectedGroup = this.value; // Update selected group
    console.log("Filtering by group:", selectedGroup);
    await loadBookings(userId, selectedGroup);
    await loadDisclosedFeedbacks(userId, selectedGroup);
    await loadPendingFeedbacks(userId, selectedGroup);
  })
});

  
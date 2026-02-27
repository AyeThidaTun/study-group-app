//fetch user bookings including sorting feature
function displayUserBookings(userId, sortOrder = "all", statusFilter = "all") {
  const container = document.getElementById("bookingsList");
  const tableBody = document.getElementById("bookingsTableBody");
  
  // Check if the tableBody exists, and clear the table body if it does
  if (tableBody) {
    tableBody.innerHTML = ""; // Clear the table body
  }
  
  fetch(`/studyRoom/myBookings/${userId}?sortOrder=${sortOrder}&statusFilter=${statusFilter}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      return response.json();
    })
    .then((bookings) => {
      if (bookings.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
      
        // Set colspan to span all columns in the table
        cell.setAttribute("colspan", "6"); // Adjust the colspan value based on the number of columns
      
        // Add the message to the cell
        cell.innerHTML = '<p class="text-center text-danger">No bookings found.</p>';
      
        // Append the cell to the row
        row.appendChild(cell);
      
        // Append the row to the table body
        tableBody.appendChild(row);
        return;
      }

      bookings.forEach((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isPastDate = bookingDate < today;
        const isToday = bookingDate.toDateString() === today.toDateString();

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${booking.roomName}</td>
          <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
          <td>${booking.startTime} - ${booking.endTime}</td>
          <td>${booking.roomLocation}</td>
          <td>${booking.groupName}</td>
          ${
            isPastDate || isToday
              ? `<td class="${
                  booking.status === "confirmed" ? "status-confirmed" : "status-cancelled"
                }">
                   ${booking.status === "confirmed" ? "Confirmed" : "Cancelled"}
                 </td>`
              : booking.status === "pending"
              ? `<td>
                  <button class="btn btn-success btn-sm confirm-booking" data-booking-id="${booking.bookingId}">
                  Confirm Booking
                  </button>
                 </td>`
              : booking.status === "confirmed"
              ? `<td>
                   <button 
                    class="btn btn-danger btn-sm cancel-booking" data-booking-id="${booking.bookingId}">
                     Cancel Booking
                   </button>
                 </td>`
              : booking.status === "cancelled"
              ? `<td class="status-cancelled">
              Cancelled  
                </td>`
              : `<td></td>` // Default case, no action
          }
        `;
        
        tableBody.appendChild(row);
        
      });
      attachBookingButtonListeners();
    })
    .catch((error) => {
      console.error("Error fetching bookings:", error);
      container.innerHTML = `
        <p class="text-danger">
          An error occurred while fetching your bookings. Please try again later.
        </p>
      `;
    });
}

// Attach event listeners for booking buttons
function attachBookingButtonListeners() {
  document.querySelectorAll(".confirm-booking").forEach((button) => {
    button.addEventListener("click", () => {
      const bookingId = button.getAttribute("data-booking-id");
      showConfirmBookingModal(bookingId); // Show the confirm booking modal
      console.log('bookingId: ', bookingId);
    });
  });

  document.querySelectorAll(".cancel-booking").forEach((button) => {
    button.addEventListener("click", () => {
      const bookingId = button.getAttribute("data-booking-id");
      showCancelBookingModal(bookingId); // Show the cancel booking modal
    });
  });
}

// Function to display the modal for confirming booking
function showConfirmBookingModal(bookingId) {
  // Show the confirm booking modal
  /* global bootstrap */
  var confirmBookingModal = new bootstrap.Modal(document.getElementById('confirmBookingModal'));
  confirmBookingModal.show();

  // When the user clicks "Confirm Booking"
  document.getElementById('confirmBookingButton').onclick = function () {
    const userName = document.getElementById('userName').value;
    const userPhone = document.getElementById('userPhone').value;

    if (userName && userPhone) {
      // Call the confirmBooking function with the user input
      confirmBooking(bookingId);
      // Hide the modal after confirmation
      confirmBookingModal.hide();
    } else {
      // alert('Please fill in both name and phone number');
    }
  };
}

// Function to display the modal for canceling booking
function showCancelBookingModal(bookingId) {
  // Show the cancel booking modal
  var cancelBookingModal = new bootstrap.Modal(document.getElementById('cancelBookingModal'));
  cancelBookingModal.show();

  // When the user clicks "Cancel Booking"
  document.getElementById('cancelBookingButton').onclick = function () {
    cancelBooking(bookingId);

    // Hide the modal after cancellation
    cancelBookingModal.hide();
  };
}


// Confirm booking function
function confirmBooking(bookingId) {
  fetch(`/studyRoom/confirmBooking/${bookingId}`, {
    method: "PUT",
  })
    .then((response) => {
      return response.json().then((data) => {
        if (!response.ok) {
          throw new Error(data.error || "Failed to confirm booking");
        }
        return data;
      });
    })
    .then((data) => {
      alert(data.message); // Success message
      location.reload(); // Reload to update UI
    })
    .catch((error) => {
      console.error("Error confirming booking:", error.message);
      alert(error.message); // Display specific error
    });
}

// Cancel booking function
function cancelBooking(bookingId) {
  fetch(`/studyRoom/cancelBooking/${bookingId}`, {
    method: "PUT",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }
      return response.json();
    })
    .then(() => {
      alert("Booking cancelled successfully!");
      location.reload(); // Reload the page to update the table
    })
    .catch((error) => {
      console.error("Error cancelling booking:", error);
      alert("Error cancelling booking. Please try again later.");
    });
}

function displayUserConfirmedBookingsCount(userId, statusFilter = 'all') {
  const countContainer = document.getElementById("confirmedBookingsCount");

  fetch(`/studyRoom/userBookingsCount/${userId}?statusFilter=${statusFilter}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch confirmed bookings count");
      }
      return response.json();
    })
    .then((data) => {
      const count = data.confirmedBookingsCount || 0; // Default to 0 if no count is returned
      countContainer.innerHTML = `<p><b>Total Bookings: ${count}</b></p>`;
    })
    .catch((error) => {
      console.error("Error fetching confirmed bookings count:", error);
      countContainer.textContent = "Error fetching confirmed bookings count.";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId"); // Get userId from local storage

  // Add event listener for sorting
  document.getElementById("sortOrder").addEventListener("change", () => {
    const sortOrder = document.getElementById("sortOrder").value;
    const statusFilter = document.getElementById("filterStatus").value;
    displayUserBookings(userId, sortOrder, statusFilter);
    displayUserConfirmedBookingsCount(userId, statusFilter);
  });

  // Add event listener for filtering
  document.getElementById("filterStatus").addEventListener("change", () => {
    const sortOrder = document.getElementById("sortOrder").value;
    const statusFilter = document.getElementById("filterStatus").value;
    displayUserBookings(userId, sortOrder, statusFilter);
    displayUserConfirmedBookingsCount(userId, statusFilter);
  });

  // Default load of bookings
  const sortOrder = document.getElementById("sortOrder").value || "all"; // Default to "all" if no value
  const statusFilter = document.getElementById("filterStatus").value || "all"; 
  displayUserBookings(userId, sortOrder, statusFilter);
  displayUserConfirmedBookingsCount(userId, statusFilter);
});
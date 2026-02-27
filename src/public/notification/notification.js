/* eslint-disable no-undef */
const apiUrl = "/notifications"; // Adjust this if your API is hosted elsewhere

// Function to display the modal
function showModal(notification) {
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalFooter = document.getElementById("modalFooter");

  modalTitle.textContent = notification.title;
  modalBody.innerHTML = `
    <p>${notification.message}</p>
    <small class="text-muted">Sent at: ${new Date(notification.createdAt).toLocaleString()}</small>
  `;
  modalFooter.innerHTML = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    <button type="button" class="btn btn-primary mark-as-read" data-id="${notification.id}">Mark as Read</button>
  `;

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("notificationModal"));
  modal.show();

  // Event listener for the "Mark as Read" button
  document.querySelector(".mark-as-read").addEventListener("click", () => {
    markAsRead(notification.id);
  });
}

// Function to mark a notification as read
function markAsRead(notificationId) {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    console.error("User ID not found in localStorage.");
    return;
  }

  fetch(`${apiUrl}/markAsRead`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationId: notificationId,
      userId: parseInt(userId),
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to mark notification as read");
      console.log(`Notification ${notificationId} marked as read`);

      populateAnnouncements();
      populatePersonalNotifications();

      const modalElement = document.querySelector("#notificationModal");
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
      }
    })
    .catch((error) => console.error(error));
}

// Function to mark a notification as unread
function markAsUnread(notificationId) {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    console.error("User ID not found in localStorage.");
    return;
  }

  fetch(`${apiUrl}/markAsUnread`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationId: notificationId,
      userId: parseInt(userId),
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to mark notification as unread");
      console.log(`Notification ${notificationId} marked as unread`);

      populateAnnouncements();
      populatePersonalNotifications();
    })
    .catch((error) => console.error(error));
}

// Fetch and display announcements
function populateAnnouncements(filters = {}) {
  const userId = localStorage.getItem("userId"); // Get userId from localStorage
  if (!userId) {
    console.error("User ID not found in localStorage");
    return;
  }

  const queryParams = new URLSearchParams({ userId, ...filters }).toString();

  fetch(`${apiUrl}/announcements?${queryParams}`)
    .then((response) => response.json())
    .then((notifications) => {
      const container = document.getElementById("announcementsContainer");
      container.innerHTML = "";

      if (notifications.length === 0) {
        // Display message if no announcements are found
        container.innerHTML = `<h2 class="text-center mb-4 h1 title col-12">No announcements made yet</h2>`;
        return;
      }

      notifications.forEach((notification) => {
        const styles = getCardStyle(notification.status);

        const card = document.createElement("div");
        card.className = "col-md-4";
        card.innerHTML = `
          <div class="card1 h-100 shadow-sm" style="cursor: pointer; background-color: ${styles.backgroundColor};">
            <div class="dropdown position-absolute top-0 start-0 m-2">
              <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu">
                <li><button class="dropdown-item mark-as-unread" data-id="${notification.id}">Mark as Unread</button></li>
              </ul>
            </div>
            <div class="card-body">
              <h5 class="mt-2 card-title ${styles.titleClass}">${notification.title}</h5>
              <p class="card-text text-muted">Sent at: ${new Date(notification.createdAt).toLocaleString()}</p>
            </div>
            <div class="go-corner">
              <div class="go-arrow">→</div>
            </div>
          </div>
        `;
        card.addEventListener("click", () => showModal(notification));
        container.appendChild(card);

        // Add event listener for "Mark as Unread" button
        card.querySelector(".mark-as-unread").addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent card click event
          markAsUnread(notification.id);
        });
      });
    })
    .catch((error) => console.error("Error fetching announcements:", error));
}

// Fetch and display personal notifications
function populatePersonalNotifications(filters = {}) {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    console.error("User ID not found in localStorage");
    return;
  }

  const queryParams = new URLSearchParams({ userId, ...filters }).toString();

  fetch(`${apiUrl}/personal?${queryParams}`)
    .then((response) => response.json())
    .then((notifications) => {
      const container = document.getElementById("personalNotificationsContainer");
      container.innerHTML = "";

      if (notifications.length === 0) {
        // Display message if no personal notifications are found
        container.innerHTML = `<h2 class="text-center mb-4 h1 title col-12">No personal notifications made yet</h2>`;
        return;
      }

      notifications.forEach(({ id, title, createdAt, status, message }) => {
        const styles = getCardStyle(status);

        const card = document.createElement("div");
        card.className = "col-md-4";
        card.innerHTML = `
          <div class="card1 h-100 shadow-sm" style="cursor: pointer; background-color: ${styles.backgroundColor};">
            <div class="dropdown position-absolute top-0 start-0 m-2">
              <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu">
                <li><button class="dropdown-item mark-as-unread" data-id="${id}">Mark as Unread</button></li>
              </ul>
            </div>
            <div class="card-body">
              <h5 class="mt-2 card-title ${styles.titleClass}">${title || "No Title"}</h5>
              <p class="card-text text-muted">Sent at: ${new Date(createdAt).toLocaleString()}</p>
            </div>
            <div class="go-corner">
              <div class="go-arrow">→</div>
            </div>
          </div>
        `;
        // Use the correct data directly here
        card.addEventListener("click", () => showModal({ id, title, createdAt, status, message }));
        container.appendChild(card);

        // Add event listener for "Mark as Unread" button
        card.querySelector(".mark-as-unread").addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent card click event
          markAsUnread(id);
        });
      });
    })
    .catch((error) => console.error("Error fetching personal notifications:", error));
}



// Function to dynamically set card styles based on notification status
function getCardStyle(status) {
  console.log(status);
  if (status === "UNREAD") {
    return {
      backgroundColor: "#fefae0", // Beige color
      titleClass: "fw-bold text-primary", // Bold and blue title
    };
  }
  return {
    backgroundColor: "#ffffff", // White background
    titleClass: "fw-normal text-dark", // Normal weight and black title
  };
}

// Function to handle filter changes
function handleFilterChange() {
  const filterRead = document.getElementById("filterRead").checked;
  const filterUnread = document.getElementById("filterUnread").checked;

  const filters = {};

  if (filterRead) filters.status = "READ";
  if (filterUnread) filters.status = "UNREAD";

  const sortBy = document.getElementById("sortOptions").value;
  if (sortBy !== "all") {
    filters.sortBy = sortBy; // Sorting by 'READ' or 'UNREAD' or 'DATEDESC' or 'DATEASC'
  }

  console.log("Filters:", filters);

  populateAnnouncements(filters);
  populatePersonalNotifications(filters);
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  populateAnnouncements();
  populatePersonalNotifications();

  document.getElementById("applyFilterBtn").addEventListener("click", () => {
    const filterOptions = document.getElementById("filterOptions");
    filterOptions.classList.toggle("d-none");
  });

  document.getElementById("sortOptions").addEventListener("change", handleFilterChange);
  document.getElementById("filterRead").addEventListener("change", handleFilterChange);
  document.getElementById("filterUnread").addEventListener("change", handleFilterChange);
});


/* eslint-disable prefer-template */
const bookingId = localStorage.getItem("bookingId");
const giverId = localStorage.getItem("userId");
var groupId = 0;

function generateRadioButtons(memberId, category, iconClass) {
  let radioHtml = ''; // Initialize radioHtml to an empty string

  radioHtml += `
  <div class="d-flex align-items-center justify-content-center">
    <i class="mx-2 ${iconClass}" style="font-size: 1.2rem;"></i>
  </div>`;

  for (let i = 1; i <= 5; i++) {
    radioHtml += `
      <label class="mx-1">
        <input type="radio" name="ratings_${memberId}_${category}" value="${i}" required> ${i}
      </label>
    `;
  }
  radioHtml += `</div>`;
  return radioHtml;
}

document.addEventListener("DOMContentLoaded", () => {
  // Function to dynamically load group name and members' names
  async function loadFeedbackForm() {
    try {
      // Fetch the groupId based on the bookingId
      const response = await fetch(
        `/feedback/getGroupIdByBookingId/${bookingId}`
      );
      const result = await response.json();

      if (result.success) {
        groupId = result.groupId;
        console.log("Group ID:", groupId);

        // You can now use this groupId in your feedback form or any other logic
        // Proceed with fetching group members or other operations as required
      } else {
        alert("Error fetching group ID");
      }
    } catch (error) {
      console.error("Error fetching groupId:", error);
      alert("Failed to retrieve group ID");
    }
    // Fetch group data from backend (assuming the route exists)
    const response = await fetch(`/feedback/getGroupMembers/${groupId}`);
    const groupData = await response.json();

    if (groupData.success) {
      console.log("group data: ", groupData);
      // Set the group name
      document.getElementById("groupName").value = groupData.name;
      console.log("name ", groupData.name);
      const groupNameElement = document.getElementById("groupName");
      console.log("group element ", groupNameElement.value);
      document.getElementById("groupName").innerText += ` ${groupData.name}`;
      if (groupNameElement) {
        groupNameElement.value = groupData.name; // Set the group name in the input field
      }
      // Dynamically create feedback form for each member
      const feedbackForm = document.getElementById("feedbackForm");

      groupData.members.forEach((member) => {
        console.log("member: ", member);
        const memberId = member.userId;

        if (member.userId === parseInt(giverId)) {
          return; // Skip this member
        }

        // Create feedback fields for each member
        const memberFields = `
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5 class="card-title text-center fw-bold">${member.user.name}</h5>
            <hr class="my-3">

            <div class="form-group">
              <label for="comments_${memberId}" class="form-label fw-bold">Comments:</label>
              <textarea class="form-control" id="comments_${memberId}" name="comments_${memberId}" rows="3" placeholder="Write your feedback here..." required></textarea>
            </div>

            <div class="form-group mt-3">
              <label class="form-label fw-bold ratingLabel">Contributions:</label>
              <div class="d-flex justify-content-center">
                ${generateRadioButtons(memberId, "contributions")}
              </div>
            </div>

            <div class="form-group mt-3">
              <label class="form-label fw-bold ratingLabel">Teamwork:</label>
              <div class="d-flex justify-content-center">
                ${generateRadioButtons(memberId, "teamwork")}
              </div>
            </div>

            <div class="form-group mt-3">
              <label class="form-label fw-bold ratingLabel">Knowledge:</label>
              <div class="d-flex justify-content-center">
                ${generateRadioButtons(memberId, "knowledge")}
              </div>
            </div>
          </div>
        </div>
      `;

    feedbackForm.innerHTML += memberFields;

        
      });
      feedbackForm.innerHTML += `
      <div class="text-center">
        <button type="submit" class="btn btn-custom mb-5">Submit Feedback</button>
      </div>
    `;

    }
  }

  // Call the function to load the feedback form
  loadFeedbackForm();
});

// Handle form submission
document.addEventListener("DOMContentLoaded", () => {
  const feedbackForm = document.getElementById("feedbackForm"); // Select the form element

  if (!feedbackForm) {
    console.error("Form element with id 'feedbackForm' not found.");
    return; // Stop if the form doesn't exist
  }

  feedbackForm.addEventListener("submit", async (event) => {
    console.log("Submit button clicked");
    event.preventDefault(); // Prevent the default form submission behavior

    try {
      // Create a FormData object from the form element
      const formData = new FormData(feedbackForm);

      const feedbackData = {
        bookingId: localStorage.getItem("bookingId"),
        giverId: localStorage.getItem("userId"),
        members: {},
      };

      // Process the formData to build the feedbackData object
      formData.forEach((value, key) => {
        const [field, memberId, category] = key.split("_");

        if (!feedbackData.members[memberId]) {
          feedbackData.members[memberId] = {};
        }

        if (field === "comments") {
          feedbackData.members[memberId].comments = value;
        } else if (field === "ratings") {
          feedbackData.members[memberId].ratings =
            feedbackData.members[memberId].ratings || {};
          feedbackData.members[memberId].ratings[category] = value;
        }
      });

      console.log("Feedback Data:", feedbackData);

      // Send the feedback data to the server
      const response = await fetch("/feedback/submitFeedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });

      const result = await response.json();

      if (result.success) {
        alert("Feedback submitted successfully!");

        // Update feedback state to completed
        const bookingId = parseInt(feedbackData.bookingId);
        const giverId = parseInt(feedbackData.giverId);

        for (const receiverId in feedbackData.members) {
          await updateFeedbackState(
            bookingId,
            giverId,
            parseInt(receiverId),
            "COMPLETED"
          );
        }

        // Redirect after successful submission
        window.location.href = "../feedback/feedback.html";
      } else {
        alert("Error submitting feedback: " + result.message);
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      alert("Failed to submit feedback.");
    }
  });

  // Function to call the API to update feedback state
  async function updateFeedbackState(bookingId, giverId, receiverId, state) {
    try {
      const response = await fetch("/feedback/updateFeedbackState", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId, giverId, receiverId, state }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(
          `Feedback state updated to "${state}" for receiverId: ${receiverId}`
        );
      } else {
        console.error("Failed to update feedback state:", result.message);
      }
    } catch (error) {
      console.error("Error updating feedback state:", error);
    }
  }
});

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const apiUrl = "."; // Replace with your server URL
const socket = io(); // Initialize WebSocket connection
const userId = localStorage.getItem("userId");

// let userId = sessionStorage.getItem("userId");

// if (!userId) {
//   // Generate a unique random userId for this session
//   userId = 'user-' + Math.random().toString(36).substr(2, 9);
//   sessionStorage.setItem("userId", userId);  // Store the user ID in sessionStorage for this session
//   console.log('User ', userId, 'chatting')
// }

// Function to send a message
async function sendMessage(content, groupId, userId) {
  try {
    const response = await fetch(`/messages/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, groupId, userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send message");
    }

    const message = await response.json();

    // Emit the message immediately after saving it
    socket.emit("chat message", message);
    return message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Function to display a message in the UI
function displayMessage(content, senderName = "Unknown", isUserMessage = false) {
  const item = document.createElement("li");
  item.classList.add(isUserMessage ? "user-message" : "other-message");
  item.innerHTML = `<strong>${senderName}:</strong> ${content}`;
  document.getElementById("messages").appendChild(item);

  // Auto-scroll to the bottom
  const messagesContainer = document.getElementById("messages");
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event listener for sending messages
document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("message");
  const messageContent = input.value.trim();
  const groupId = localStorage.getItem("selectedGroupId");

  if (!groupId || !userId) {
    alert("Missing group or user information. Please log in again.");
    return;
  }

  if (messageContent) {
    try {
      // Send the message and display it on the right as a user message
      const message = await sendMessage(messageContent, groupId, userId);
      console.log('displaying right after sent 1')
      input.value = ""; // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
});

// Fetch and display previous messages
async function loadMessages(groupId) {
  try {
    const response = await fetch(`/messages/${groupId}`);
    if (!response.ok) throw new Error("Failed to load messages");

    const messages = await response.json();
    console.log('Messages: ', messages);
    messages.forEach((message) => {
      const isUserMessage = message.senderId === parseInt(userId); // Align based on userId
      console.log('userid from storage: ', userId);
      console.log('userid from message: ', message.senderId);
      console.log('isUserMessage ?:', isUserMessage);
      console.log('displaying after loading messages 2')
      displayMessage(message.content, isUserMessage ? "You" : message.senderName, isUserMessage);
    });
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}

async function loadMessagesAndPolls(groupId) {
  try {
    const [messagesResponse, pollsResponse] = await Promise.all([
      fetch(`/messages/${groupId}`),
      fetch(`/messages/getPoll/${groupId}`)
    ]);

    if (!messagesResponse.ok) throw new Error("Failed to load messages");
    if (!pollsResponse.ok) throw new Error("Failed to load polls");

    const messages = await messagesResponse.json();
    const polls = await pollsResponse.json();
    console.log('poll from load: ', polls)
    console.log('Messages:', messages);
    console.log('Polls:', polls);

    // Combine messages and polls into one array and sort by timestamp
    const combinedData = [...messages, ...polls].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    combinedData.forEach((item) => {
      if (item.content) {
        // It's a message
        const isUserMessage = parseInt(item.senderId) === parseInt(userId);
        displayMessage(item.content, isUserMessage ? "You" : item.senderName, isUserMessage);
      } else if (item.question) {
        // It's a poll
        displayPoll(item);
      }
    });
  } catch (error) {
    console.error("Error loading messages and polls:", error);
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  const groupId = localStorage.getItem("selectedGroupId");

  if (groupId) {
      try {
          // Fetch group details
          const response = await fetch(`/studyGroup/getGroupName/${groupId}`);
          if (!response.ok) throw new Error("Failed to fetch group details");

          const group = await response.json();
          console.log("Fetched group details:", group);

          // Update the group name in the UI
          document.getElementById("group-name").textContent = group.name;

          // Load message and poll at the same time
          loadMessagesAndPolls(groupId);
      } catch (error) {
          console.error("Error fetching group details:", error);
      }
  } else {
      console.error("Group ID not found in local storage");
  }
});

// Update socket event to align other users' messages
socket.on("chat message", (msg) => {
  console.log("Message received:", msg);

  // Check if the message belongs to the current user
  const isUserMessage = parseInt(msg.senderId) === parseInt(userId);

  // Display the message with proper styling
  displayMessage(msg.content, isUserMessage ? "You" : msg.senderName, isUserMessage);
});

document.getElementById("add-option-btn").addEventListener("click", () => {
  // Get the number of current options
  const pollOptions = document.querySelectorAll(".poll-option").length;

  // Limit max options (optional)
  if (pollOptions >= 10) {
      alert("You can add up to 10 options only.");
      return;
  }

  // Create a new option div
  const newOption = document.createElement("div");
  newOption.classList.add("poll-option", "d-flex", "align-items-center", "mb-2"); // Flexbox for alignment
  const optionNumber = pollOptions + 1;
  newOption.id = `poll-option-${optionNumber}`;

  // Create new radio button, label, input field, and remove button
  newOption.innerHTML = `
      <label for="option-${optionNumber}" class="me-2">Option ${optionNumber}:</label>
      <input type="text" class="form-control me-2" required style="width: 200px;" />
      <button type="button" class="remove-option-btn btn btn-danger btn-sm" data-option-id="${optionNumber}">x</button>
      <br><br>
  `;

  // Append the new option to the poll options container
  document.getElementById("poll-options").appendChild(newOption);

  // Add event listener to remove button
  const removeButton = newOption.querySelector(".remove-option-btn");
  removeButton.addEventListener("click", () => {
      newOption.remove();
  });
});

// Function to create a poll
async function createPoll(question, options, groupId, userId) {
  try {
    const response = await fetch('/messages/createPoll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options, groupId, userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create poll');
    }

    const poll = await response.json();
    socket.emit("pollUpdate", poll);
    displayPoll(poll);
    return poll;

  } catch (error) {
    console.error('Error creating poll:', error);
    alert("Error creating poll!");
  }
}

// Listen for real-time poll updates
socket.on("pollUpdate", (poll) => {
  displayPoll(poll);
});

function closeModal() {
  document.getElementById("pollModal").style.display = "none";
}


// Event listener for creating a poll

document.getElementById("createPollBtn").addEventListener("click", async (event) => {
  event.preventDefault();

  const question = document.getElementById('poll-question').value;
  const optionElements = document.querySelectorAll("#poll-options input[type='text']");
  const options = Array.from(optionElements).map(input => input.value).filter(text => text.trim() !== "");
  
  const groupId = localStorage.getItem("selectedGroupId");
  const userId = localStorage.getItem("userId");

  if (!question.trim() || options.length < 2) {
    alert("Please enter a question and at least two options.");
    return;
  }

  await createPoll(question, options, groupId, userId);

  closeModal();
});

const userVote = {}; 

// Function to display poll options and handle user interaction
function displayPoll(poll) {
  console.log('poll fetched: ', poll);

  const existingPoll = document.querySelector(`[data-poll-id="${poll.pollId}"]`);
  if (existingPoll) {
    existingPoll.remove(); // Remove the old poll before adding the new one
  }

  const userId = localStorage.getItem("userId"); // Get the current user ID
  const userVoteForPoll = userVote[poll.pollId]; // Check the user's previous vote for this poll

  const isUserPoll = parseInt(poll.createdBy) === parseInt(userId);

  const pollElement = document.createElement("li");
  pollElement.classList.add("poll-message");
  pollElement.setAttribute("data-poll-id", poll.pollId); // Mark it with a unique ID

  // Apply the class for user-created polls (align right and background color)
  if (isUserPoll) {
    pollElement.classList.add("user-poll");
  } else {
    pollElement.classList.add("other-poll");
  }

  // Display the options and mark the already voted one
  pollElement.innerHTML = `
    <div class="poll-box">
      <p class="d-flex justify-content-start">
        <strong>${poll.creatorName || "Unknown"}:</strong>&nbsp; ${poll.question}
      </p>
      <ul class="poll-options">
        ${poll.options.map(option => {
          const isVoted = option.pollOptionId === userVoteForPoll;
          return `
            <li>
              <label class="poll-option-label">
                <input type="radio" name="poll-${poll.pollId}" value="${option.pollOptionId}" 
                  onchange="votePoll('${poll.pollId}', '${option.pollOptionId}')"
                  ${isVoted ? 'disabled' : ''}>
                ${option.text} &nbsp;<span class="vote-count">(${option.votes} votes)</span>
              </label>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;

  document.getElementById("messages").appendChild(pollElement);
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
}

// Function to send the vote update to the backend and update the frontend
async function votePoll(pollId, pollOptionId) {
  console.log('user vote array: ', userVote);

  // If the user has already voted for this poll, prevent further voting
  if (userVote[pollId]) {
    console.log(`User has already voted and cannot change their vote.`);
    return;
  }

  // Update the user's vote selection
  userVote[pollId] = pollOptionId;

  // Increment the selected option's vote count
  console.log(`Incrementing vote count for option: ${pollOptionId}`);
  await updateVoteOnBackend(pollId, pollOptionId, 'increment');
  updateVoteOnFrontend(pollId, pollOptionId, 'increment');

  // Disable all radio buttons in this poll to prevent further selection
  const pollElement = document.querySelector(`[data-poll-id="${pollId}"]`);
  const allRadioButtons = pollElement.querySelectorAll(`input[type="radio"]`);
  allRadioButtons.forEach(radio => radio.disabled = true);
}




// Function to update the vote on the backend
async function updateVoteOnBackend(pollId, pollOptionId, action) {
  try {
    const response = await fetch('/messages/vote', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pollId: pollId,
        pollOptionId: pollOptionId,
        action: action,  // Either 'increment' or 'decrement'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update vote');
    }

    const data = await response.json();
    console.log(`${action} vote successful`, data);
  } catch (error) {
    console.error('Error updating vote:', error);
  }
}

// Function to update the vote count on the frontend
function updateVoteOnFrontend(pollId, pollOptionId, action) {
  const pollElement = document.querySelector(`[data-poll-id="${pollId}"]`);
  const selectedOption = pollElement.querySelector(`input[value="${pollOptionId}"]`);
  const voteCountElement = selectedOption.closest('label').querySelector('span.vote-count');
  console.log('vote count text: ', voteCountElement.innerText);
  let currentVoteCount = parseInt(voteCountElement.innerText.replace(/[^\d]/g, ''));

  if (action === 'increment') {
    currentVoteCount++;
  } else if (action === 'decrement') {
    currentVoteCount--;
  }

  console.log('current vote count: ', currentVoteCount);

  voteCountElement.innerText = `(${currentVoteCount} votes)`;
}




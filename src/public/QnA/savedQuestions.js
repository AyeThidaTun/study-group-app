document.addEventListener('DOMContentLoaded', loadSavedQuestions);

// Retrieve `userId` from localStorage
const userId = parseInt(localStorage.getItem('userId'));

// Load saved questions with answers and features
function loadSavedQuestions() {
  if (!userId) {
    alert('User is not logged in. Redirecting to login page.');
    window.location.href = '../login.html'; // Redirect to login page if `userId` is not available
    return;
  }

  fetch(`/savedQuestions?userID=${userId}`)
    .then((response) => {
      if (!response.ok) throw new Error('Failed to fetch saved questions.');
      return response.json();
    })
    .then((data) => {
      const container = document.getElementById('saved-questions-container');
      container.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p>No saved questions found.</p>';
        return;
      }

      // Render each saved question with answers and features
      data.forEach((savedQuestion) => {
        const { question } = savedQuestion;

        const questionDiv = document.createElement('div');
        questionDiv.classList.add('card', 'p-3', 'mb-3');

        // Check if the file is an image
        const isImage = question.filePath && /\.(jpg|jpeg|png)$/i.test(question.filePath);

        // HTML structure for the saved question
        questionDiv.innerHTML = `
          <div class="d-flex justify-content-between">
            <div>
              <h3>${question.title}</h3>
              <p class="text-muted">Posted by: ${question.user.name}</p>
              <textarea class="form-control mb-2" readonly>${question.content}</textarea>
              <small>Module: ${question.module.modName}</small>
              <div class="metadata text-muted">
                Posted: ${new Date(question.createdAt).toLocaleString()}
                ${question.updatedAt != null ? `<span class="updated-tag">Updated</span>` : ''}
              </div>
              <div class="question-actions">
                ${
                  question.userID === userId
                    ? `
                      <button onclick="enableEditQuestion(${question.questionID})" class="btn btn-warning btn-sm" id="edit-question-btn-${question.questionID}">Edit</button>
                      <button onclick="saveQuestion(${question.questionID})" class="btn btn-success btn-sm d-none" id="save-question-btn-${question.questionID}">Save</button>
                      <button onclick="cancelEditQuestion(${question.questionID})" class="btn btn-secondary btn-sm d-none mx-3" id="cancel-question-btn-${question.questionID}">Cancel</button>
                      <button onclick="confirmDeleteQuestion(${question.questionID})" class="btn btn-danger btn-sm">Delete</button>
                    `
                    : ''
                }
              </div>
              ${isImage ? `<img src="${question.filePath}" alt="Uploaded Image" class="uploaded-image mt-3" />` : ''}
              ${question.filePath && !isImage ? `<a href="${question.filePath}" target="_blank">View Document</a>` : ''}
            </div>
            <div>
              <button onclick="removeBookmark(${savedQuestion.id})" class="btn btn-danger btn-sm">
                <i class="fa fa-trash"></i> Remove
              </button>
            </div>
          </div>
          <div class="answer-form mt-3">
            <textarea id="answer-content-${question.questionID}" placeholder="Your answer here..." class="form-control mb-2"></textarea>
            <button onclick="submitAnswer(${question.questionID})" class="btn btn-warning btn-sm">Answer</button>
          </div>
          <div class="answers-list mt-3">
            <h5>Answers:</h5>
            ${question.answers.length > 0
              ? question.answers.map((answer) => `
                <div class="answer mt-3 p-2 border rounded">
                  <textarea class="form-control mb-2" readonly>${answer.content}</textarea>
                  <div class="metadata text-muted">
                    Answered: ${new Date(answer.createdAt).toLocaleString()}
                    ${answer.updatedAt != null ? `<span class="updated-tag">Updated</span>` : ''}
                    <br><span class="posted-by">Posted by: ${answer.user.name}</span>
                    <div class="answer-actions mt-2">
                      ${
                        answer.userID === userId
                          ? `
                            <button onclick="enableEditAnswer(${answer.answerID})" class="btn btn-warning btn-sm" id="edit-answer-btn-${answer.answerID}">Edit</button>
                            <button onclick="saveAnswer(${answer.answerID})" class="btn btn-success btn-sm d-none" id="save-answer-btn-${answer.answerID}">Save</button>
                            <button onclick="cancelEditAnswer(${answer.answerID})" class="btn btn-secondary btn-sm d-none mx-3" id="cancel-answer-btn-${answer.answerID}">Cancel</button>
                            <button onclick="confirmDeleteAnswer(${answer.answerID})" class="btn btn-danger btn-sm">Delete</button>
                          `
                          : ''
                      }
                    </div>
                  </div>
                </div>
              `).join('')
              : '<p>No answers yet.</p>'
            }
          </div>
        `;

        container.appendChild(questionDiv);
      });
    })
    .catch((error) => console.error('Error loading saved questions:', error));
}

// Remove a saved question
function removeBookmark(savedQuestionID) {
  fetch(`/savedQuestions/${savedQuestionID}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID: userId }),
  })
    .then((response) => response.json())
    .then((result) => {
      alert(result.message);
      loadSavedQuestions(); // Reload after removing
    })
    .catch((error) => console.error('Error removing bookmark:', error));
}

// Function to enable editing of a question
function enableEditQuestion(questionID) {
  const textArea = document.getElementById(`question-content-${questionID}`);
  textArea.removeAttribute('readonly');
  document.getElementById(`edit-question-btn-${questionID}`).classList.add('d-none');
  document.getElementById(`save-question-btn-${questionID}`).classList.remove('d-none');
  document.getElementById(`cancel-question-btn-${questionID}`).classList.remove('d-none');
}

// Function to save the edited question
function saveQuestion(questionID) {
  const textArea = document.getElementById(`question-content-${questionID}`);
  const content = textArea.value;

  fetch(`/qnas/questions/${questionID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID: userId, content }),
  })
    .then(loadSavedQuestions)
    .catch((error) => console.error('Error updating question:', error));
}

function submitAnswer(questionID) {
  const content = document.getElementById(`answer-content-${questionID}`).value;

  if (!content) {
    alert("Answer content is required.");
    return;
  }

  fetch('/qnas/answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID: userId, questionID, content }),
  })
    .then(loadSavedQuestions)
    .catch((error) => console.error('Error posting answer:', error));
}

// Function to cancel the question edit
function cancelEditQuestion() {
  loadSavedQuestions();
}

// Function to enable editing of an answer
function enableEditAnswer(answerID) {
  const textArea = document.getElementById(`answer-content-${answerID}`);
  textArea.removeAttribute('readonly');
  document.getElementById(`edit-answer-btn-${answerID}`).classList.add('d-none');
  document.getElementById(`save-answer-btn-${answerID}`).classList.remove('d-none');
  document.getElementById(`cancel-answer-btn-${answerID}`).classList.remove('d-none');
}

// Function to cancel the question edit
function manageQuestion() {
  removeBookmark();
  saveQuestion();
  enableEditQuestion();
  submitAnswer();
  cancelEditQuestion();
  enableEditAnswer();
  saveAnswer();
  cancelEditAnswer();
  confirmDeleteQuestion();
  confirmDeleteAnswer();
  goBack();
}

// Function to save the edited answer
function saveAnswer(answerID) {
  const textArea = document.getElementById(`answer-content-${answerID}`);
  const content = textArea.value;

  fetch(`/qnas/answers/${answerID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID: userId, content }),
  })
    .then(loadSavedQuestions)
    .catch((error) => console.error('Error updating answer:', error));
    manageQuestion();
}

// Function to cancel the answer edit
function cancelEditAnswer() {
  loadSavedQuestions();
}

// Function to confirm deletion of a question
function confirmDeleteQuestion(questionID) {
  if (confirm('Are you sure you want to delete this question?')) {
    fetch(`/qnas/questions/${questionID}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: userId }),
    })
      .then(loadSavedQuestions)
      .catch((error) => console.error('Error deleting question:', error));
  }
}

// Function to confirm deletion of an answer
function confirmDeleteAnswer(answerID) {
  if (confirm('Are you sure you want to delete this answer?')) {
    fetch(`/qnas/answers/${answerID}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: userId }),
    })
      .then(loadSavedQuestions)
      .catch((error) => console.error('Error deleting answer:', error));
  }
}

// Go back to the main page
function goBack() {
  window.location.href = 'QnA/index.html'; // Update the redirection as needed
}

// Load navbar from navbar.html
fetch('../navbar.html')
  .then((response) => response.text())
  .then((html) => {
    document.getElementById('navbar-container').innerHTML = html;
  })
  .catch((error) => console.error('Error loading navbar:', error));

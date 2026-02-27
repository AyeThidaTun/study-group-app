document.addEventListener('DOMContentLoaded', loadQuestions); // Load questions when the page loads

const userId = parseInt(localStorage.getItem('userId')); // Get the user ID from local storage

// Fetch schools for the school dropdown
function fetchSchools() {
  fetch('/qnas/schools')
    .then((response) => response.json())
    .then((data) => {
      const schoolDropdown = document.getElementById('school-dropdown');
      schoolDropdown.innerHTML = '<option value="">Select School</option>';
      data.forEach(school => {
        const option = document.createElement('option');
        option.value = school.id;
        option.textContent = school.shortName;
        schoolDropdown.appendChild(option);
      });
    })
    .catch((error) => console.error('Error fetching schools:', error));
}

// Fetch modules based on selected school
function fetchModules(schoolId) {
  fetch(`/qnas/modules?schoolId=${schoolId}`)
    .then((response) => response.json())
    .then((data) => {
      const moduleDropdown = document.getElementById('module-dropdown');
      moduleDropdown.innerHTML = '<option value="">Select Module</option>';  // Reset options
      data.forEach(module => {
        const option = document.createElement('option');
        option.value = module.modCode;  // Send modCode instead of modName
        option.textContent = module.modName;
        moduleDropdown.appendChild(option);
      });
      moduleDropdown.disabled = false;  // Enable the module dropdown
    })
    .catch((error) => console.error('Error fetching modules:', error));
}

// Event listener for school dropdown change
document.getElementById('school-dropdown').addEventListener('change', (event) => {
  const schoolId = event.target.value;
  if (schoolId) {
    fetchModules(schoolId);
  } else {
    // If no school selected, disable module dropdown
    document.getElementById('module-dropdown').disabled = true;
  }
});

fetchSchools();

// Function to load questions with answers, likes, and other features
function loadQuestions() {
  const searchInput = document.getElementById('search-input').value || ''; // Get search query
  const schoolId = document.getElementById('school-filter').value || ''; // Get selected school
  const moduleId = document.getElementById('module-filter').value || ''; // Get selected module
  const statusFilter = document.getElementById('status-filter').value || 'ACTIVE,SOLVED'; // Default status
  const sortBy = document.getElementById('sort-by').value; // Get sorting option

  // Log the query parameters for debugging
  console.log("Query Params:", {
    userID: userId,
    search: searchInput,
    schoolId,
    moduleId,
    status: statusFilter,
    sortBy,
  });

  // Create the URLSearchParams object to construct the query string
  const queryParams = new URLSearchParams({
    userID: userId,
    search: searchInput,
    schoolId,
    moduleId,
    status: statusFilter,
    sortBy,
  });
  
  fetch(`/qnas/questions?${queryParams.toString()}`)
    .then((response) => response.json())
    .then((data) => {
      const questionsContainer = document.getElementById('questions-container');
      questionsContainer.innerHTML = ''; // Clear previous content

      data.forEach((question) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question', 'card', 'p-3', 'mb-3');
        questionDiv.id = `question-${question.questionID}`; // Set unique ID

        // Check if the file is an image
        const isImage = question.filePath && /\.(jpg|jpeg|png)$/i.test(question.filePath);

        // Check if the question is liked by the user
        const isLikedByUser = question.likesList.some((like) => like.userID === userId);

        // HTML structure for each question
        questionDiv.innerHTML = `
         <div class="d-flex justify-content-between align-items-start">
            <div class="question-content" style="flex: 9;">
              <h3 id="question-title-${question.questionID}">${question.title}</h3>
              <h5 id="question-content-${question.questionID}" class="mb-2">Q: ${question.content}</h5>
              <small>Module: ${question.module.modName}</small>

              <div class="metadata text-muted">
                Posted: ${new Date(question.createdAt).toLocaleString()}
                ${question.updatedAt ? `<span class="updated-tag">Updated</span>` : ''}
              </div>

              <p class="text-muted">Posted by: ${question.user.name || 'Unknown'}</p>
            
              <div class="image-container mt-3">
                ${isImage ? `<img src="${question.filePath}" alt="Uploaded Image" class="uploaded-image" />` : ''}
                ${question.filePath && !isImage ? `<a href="${question.filePath}" target="_blank">View Document</a>` : ''}
              </div>
            </div>

            <div class="question-actions">
              ${
                question.userID === userId
                  ? `
                    <button onclick="enableEditQuestion(${question.questionID})" class="btn btn-warning btn-sm" id="edit-question-btn-${question.questionID}">Edit</button>
                    <button onclick="confirmDeleteQuestion(${question.questionID})" class="btn btn-danger btn-sm">Delete</button>
                  `
                  : ''
              }

              ${question.userID === userId && question.status === 'ACTIVE' ? `
                <button onclick="markAsSolved(${question.questionID})" class="btn btn-success btn-sm">
                  <i class="fa fa-check-circle"></i> Mark as Solved
                </button>
              ` : ''}

              
              <div class="tags mb-2">
                ${question.status === 'SOLVED' ? '<span class="badge bg-success">Solved</span>' : ''}
                ${question.status === 'ARCHIVED' ? '<span class="badge bg-secondary">Archived</span>' : ''}
              </div>

              <button onclick="toggleLikeQuestion(${question.questionID})" class="btn btn-sm like-btn" id="like-btn-${question.questionID}">
                <i class="fa fa-heart ${isLikedByUser ? 'red' : ''}" id="like-icon-${question.questionID}"></i>
                <span id="like-count-${question.questionID}">${question.likesList.length}</span> Likes
              </button>
              <button onclick="bookmarkQuestion(${question.questionID})" class="btn btn-sm bookmark-btn" id="bookmark-btn-${question.questionID}">
                <i class="fa fa-bookmark" id="bookmark-icon-${question.questionID}" data-bookmarked="${question.savedBy.includes(userId) ? 'true' : 'false'}"></i> Bookmark
              </button>
            </div>
          </div>
          <div class="answer-form mt-3">
            <textarea id="answer-content-${question.questionID}" placeholder="Your answer here..." class="form-control mb-2"></textarea>
            <label>
              <input type="checkbox" id="draft-checkbox-${question.questionID}"> Save as Draft
            </label>
            <button onclick="submitAnswer(${question.questionID})" class="btn btn-warning btn-sm">Answer</button>
          </div>

          <div class="answers-list">
            ${question.answers.map((answer) => {
              const isAnswerLikedByUser = answer.likesList.some((like) => like.userID === userId);
              return `
              <div class="answer mt-3 p-2 border rounded">
                <textarea class="form-control mb-2" id="answer-content-${answer.answerID}" readonly>${answer.content}</textarea>
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

                  ${answer.userID === userId && answer.status === 'DRAFT' ? `
                        <button onclick="publishAnswer(${answer.answerID})" class="btn btn-success btn-sm">
                          <i class="fa fa-paper-plane"></i> Publish
                        </button>
                      ` : ''
                  }

                  <div class="metadata text-muted">
                    Answered: ${new Date(answer.createdAt).toLocaleString()}
                    ${answer.status === 'DRAFT' ? `<span class="badge bg-warning">Draft</span>` : ''}
                    ${answer.updatedAt ? `<span class="updated-tag">Updated</span>` : ''}
                    <br>Posted by: ${answer.user.name}
                  </div>

                  <button onclick="toggleLikeAnswer(${answer.answerID})" class="btn btn-sm like-btn" id="like-btn-${answer.answerID}">
                    <i class="fa fa-heart ${isAnswerLikedByUser ? 'red' : ''}" id="like-icon-${answer.answerID}"></i>
                    <span id="like-count-${answer.answerID}">${answer.likesList.length}</span> Likes
                  </button>
                </div>
              </div>`;
            }).join('')}
          </div>
        `;

        questionsContainer.appendChild(questionDiv);
      });
    })
    .catch((error) => console.error('Error fetching questions:', error));
}

// Populate dropdowns for school and module filters dynamically
function populateSchoolAndModuleFilters() {
  fetch('/qnas/schools')
    .then((response) => response.json())
    .then((schools) => {
      const schoolSelect = document.getElementById('school-filter');
      schools.forEach((school) => {
        const option = document.createElement('option');
        option.value = school.id;
        option.textContent = school.shortName;
        schoolSelect.appendChild(option);
      });

      schoolSelect.addEventListener('change', (e) => {
        const schoolId = e.target.value;
        fetch(`/qnas/modules?schoolId=${schoolId}`)
          .then((response) => response.json())
          .then((modules) => {
            const moduleSelect = document.getElementById('module-filter');
            moduleSelect.innerHTML = '<option value="">-- Select Module --</option>';
            modules.forEach((module) => {
              const option = document.createElement('option');
              option.value = module.modCode;
              option.textContent = module.modName;
              moduleSelect.appendChild(option);
            });
          });
      });
    })
    .catch((error) => console.error('Error populating school/module filters:', error));
}

// Call this on page load to initialize filters
document.addEventListener('DOMContentLoaded', populateSchoolAndModuleFilters);

function markAsSolved(questionID) {
  fetch(`/qnas/questions/${questionID}/solve`, { method: 'POST' })
    .then(loadQuestions)
    .catch((error) => console.error('Error marking as solved:', error));
    cancelEditQuestion();
}

function publishAnswer(answerID) {
  fetch(`/qnas/answers/${answerID}/publish`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID: userId }),
  })
    .then((response) => response.json())
    .then(() => {
      alert('Answer published successfully!');
      loadQuestions(); // Reload questions to reflect the updated answer state
    })
    .catch((error) => console.error('Error publishing answer:', error));
}


// Function to toggle like on a question
function toggleLikeQuestion(questionID) {
  const likeIcon = document.getElementById(`like-icon-${questionID}`);
  const likeCount = document.getElementById(`like-count-${questionID}`);

  fetch(`/qnas/questions/${questionID}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID: userId }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.liked) {
        likeIcon.classList.add('red');
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
      } else {
        likeIcon.classList.remove('red');
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
      }
    })
    .catch((error) => console.error('Error toggling like:', error));
}

// Function to toggle like on an answer
function toggleLikeAnswer(answerID) {
  const likeIcon = document.getElementById(`like-icon-${answerID}`);
  const likeCount = document.getElementById(`like-count-${answerID}`);

  fetch(`/qnas/answers/${answerID}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID: userId }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.liked) {
        likeIcon.classList.add('red');
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
      } else {
        likeIcon.classList.remove('red');
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
      }
    })
    .catch((error) => console.error('Error toggling like:', error));
}


// Function to bookmark a question
function bookmarkQuestion(questionID) {
  const bookmarkIcon = document.getElementById(`bookmark-icon-${questionID}`);

  fetch(`/savedQuestions/${questionID}/bookmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID: userId }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.message === 'Bookmarked') {
        alert('Question saved to bookmarks!');
        bookmarkIcon.classList.add('bookmarked'); // Add bookmarked class to change the icon style
        bookmarkIcon.dataset.bookmarked = 'true';
      } else if (result.message === 'Unbookmarked') {
        alert('Question already in bookmarks. Removed.');
        bookmarkIcon.classList.remove('bookmarked');
        bookmarkIcon.dataset.bookmarked = 'false';
      }
    })
    .catch((error) => console.error('Error bookmarking question:', error));
}

// Function to clear the question form after posting
function clearQuestionForm() {
  document.getElementById('question-title').value = '';
  document.getElementById('question-content').value = '';
  document.getElementById('school-dropdown').value = '';
  document.getElementById('module-dropdown').value = '';
  document.getElementById('document-upload').value = '';  // Clear file input if any
}

// Submit the question
function submitQuestion() {
  const title = document.getElementById('question-title').value;
  const content = document.getElementById('question-content').value;
  const moduleCode = document.getElementById('module-dropdown').value;
  const fileInput = document.getElementById('document-upload');

  if (!title || !content || !moduleCode) {
    alert("Title, content, and module fields are required.");
    return;
  }

  const formData = new FormData();
  formData.append('userID', userId); // Ensure you have userId available
  formData.append('title', title);
  formData.append('content', content);
  formData.append('moduleCode', moduleCode);

  if (fileInput.files[0]) {
    formData.append('image', fileInput.files[0]); // Attach the file
  }

  fetch('/qnas/questions', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      console.log('Question posted successfully:', result);
      window.location.reload(); // Reload the page after posting
    })
    .catch((error) => {
      console.error('Error posting question:', error);
    });
}


// Function to enable editing question
function enableEditQuestion(questionID) {
  const questionDiv = document.getElementById(`question-${questionID}`);
  if (!questionDiv) {
    console.error(`Question div with ID "question-${questionID}" not found.`);
    return;
  }

  const title = questionDiv.querySelector(`#question-title-${questionID}`).textContent;
  const content = questionDiv.querySelector(`#question-content-${questionID}`).textContent;

  // Show modal for editing
  const modal = document.getElementById('editQuestionModal');
  document.getElementById('edit-question-title').value = title;
  document.getElementById('edit-question-content').value = content;

  modal.style.display = 'block';
  document.getElementById('save-edited-question').onclick = function () {
    saveQuestion(questionID);
  };
}

// Function to close the modal
function closeEditModal() {
  const modal = document.getElementById('editQuestionModal');
  modal.style.display = 'none';
}

// Function to save the edited question
function saveQuestion(questionID) {
  const title = document.getElementById('edit-question-title').value;
  const content = document.getElementById('edit-question-content').value;

  // Ensure title and content are filled in
  if (!title || !content) {
    alert('Please provide both a title and content.');
    return;
  }

  // Send the updated data to the backend
  fetch(`/qnas/questions/${questionID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),  // Sending the updated title and content
  })
    .then(response => response.json())
    .then(() => {
      loadQuestions();  // Reload questions after saving
      closeEditModal(); // Close the modal
    })
    .catch((error) => console.error('Error updating question:', error));
}

// Function to submit the answer
function submitAnswer(questionID) {
  const content = document.getElementById(`answer-content-${questionID}`).value;
  const draftCheckbox = document.getElementById(`draft-checkbox-${questionID}`);
  const isDraft = draftCheckbox ? draftCheckbox.checked : false;

  if (!content) {
    alert("Answer content is required.");
    return;
  }

  // Set the status based on checkbox
  const status = isDraft ? 'DRAFT' : 'PUBLISHED';
  console.log(`Submitting answer with status: ${status}`); // Debugging line

  fetch('/qnas/answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID: userId, questionID, content, status }), // Pass the correct status
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to submit the answer.');
      }
      return response.json();
    })
    .then((result) => {
      console.log('Answer submission response:', result); // Debugging line
      alert('Answer submitted successfully!');
      loadQuestions(); // Reload questions after posting the answer
    })
    .catch((error) => console.error('Error posting answer:', error));
}

// Function to cancel the question edit
function cancelEditQuestion() {
  loadQuestions();
  markAsSolved();
  publishAnswer();
  toggleLikeQuestion();
  toggleLikeAnswer();
  bookmarkQuestion();
  clearQuestionForm();
  submitQuestion();
  enableEditQuestion();
  submitAnswer();
  cancelEditQuestion();
  enableEditAnswer();
  saveAnswer();
  cancelEditAnswer();
  confirmDeleteQuestion();
  confirmDeleteAnswer();
}

// Function to enable editing of an answer
function enableEditAnswer(answerID) {
  const textArea = document.getElementById(`answer-content-${answerID}`);
  const editButton = document.getElementById(`edit-answer-btn-${answerID}`);
  const saveButton = document.getElementById(`save-answer-btn-${answerID}`);
  const cancelButton = document.getElementById(`cancel-answer-btn-${answerID}`);

  textArea.removeAttribute('readonly'); // Allow editing
  editButton.classList.add('d-none'); // Hide edit button
  saveButton.classList.remove('d-none'); // Show save button
  cancelButton.classList.remove('d-none'); // Show cancel button
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
    .then(loadQuestions)
    .catch((error) => console.error('Error updating answer:', error));
}

// Function to cancel the answer edit
function cancelEditAnswer() {
  loadQuestions();
}

// Function to confirm deletion of a question
function confirmDeleteQuestion(questionID) {
  if (confirm('Are you sure you want to delete this question?')) {
    fetch(`/qnas/questions/${questionID}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: userId }),
    })
      .then(loadQuestions)
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
      .then(loadQuestions)
      .catch((error) => console.error('Error deleting answer:', error));
  }
}


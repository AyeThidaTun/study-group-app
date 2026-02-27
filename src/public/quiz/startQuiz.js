/* eslint-disable no-undef */
/* 
    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
*/

const apiUrl = '/quizzes'; // Base API URL
const quizId = new URLSearchParams(window.location.search).get('quizId'); // Get quizId from URL
const userId = parseInt(localStorage.getItem('userId'), 10); // Convert to an integer

// Fetch quiz questions and populate the form
function fetchQuizQuestions() {
    fetch(`${apiUrl}/questions?quizId=${quizId}`)
        .then((response) => response.json())
        .then((questions) => {
            const questionsContainer = document.getElementById('questions-container');
            const quizForm = document.getElementById('quiz-form');

            questionsContainer.innerHTML = ''; // Clear previous questions if any

            if (questions.length === 0) {
                questionsContainer.innerHTML = `<p class="text-center text-muted">No questions available for this quiz.</p>`;
                
                // Replace the "Submit Quiz" button with "Return to Quizzes" button
                quizForm.innerHTML = `
                    <div class="text-center mt-4">
                        <button type="button" class="btn btn-secondary" id="return-to-quizzes-btn">Return to Quizzes</button>
                    </div>
                `;
                document.getElementById('return-to-quizzes-btn').addEventListener('click', () => {
                    const redirectUrl = localStorage.getItem('previousUrl') || '/quizzes';
                    window.location.href = redirectUrl;
                });

                return;
            }

            console.log('Questions:', questions);

            // Generate questions and options
            questions.forEach((question, index) => {
                const questionHtml = `
                    <div class="mb-4">
                        <h5>Question ${index + 1}: ${question.text}</h5>
                        <div>
                            ${question.options
                                .map(
                                    (option, i) => `
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="radio"
                                        name="question-${question.itemId}"
                                        value="${option}"
                                        id="question-${question.itemId}-option-${i}"
                                    >
                                    <label
                                        class="form-check-label"
                                        for="question-${question.itemId}-option-${i}">
                                        ${option}
                                    </label>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                `;
                questionsContainer.insertAdjacentHTML('beforeend', questionHtml);
            });
        })
        .catch((error) => console.error('Error fetching questions:', error));
}


// Function to show the custom alert modal
function showAlertModal(message, title = "Notification") {
    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'), {
        backdrop: true, // Ensure a backdrop is used
    });
    const alertModalTitle = document.getElementById('alertModalLabel');
    const alertModalBody = document.getElementById('alertModalBody');

    // Update modal title and message
    alertModalTitle.textContent = title;
    alertModalBody.textContent = message;

    // Show the modal
    alertModal.show();

    // Handle custom backdrop logic specifically for alertModal
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.classList.add('alert-backdrop'); // Add custom class
    }

    // Clean up the custom backdrop and restore Bootstrap's default behavior
    const alertModalElement = document.getElementById('alertModal');
    const removeCustomBackdrop = () => {
        const customBackdrop = document.querySelector('.modal-backdrop.alert-backdrop');
        if (customBackdrop) {
            customBackdrop.classList.remove('alert-backdrop'); // Remove custom class
        }
        alertModalElement.removeEventListener('hidden.bs.modal', removeCustomBackdrop); // Cleanup listener
    };

    alertModalElement.addEventListener('hidden.bs.modal', removeCustomBackdrop);
}

// Handle form submission
document.getElementById('quiz-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Gather all unique questions and checked answers
    const allQuestions = document.querySelectorAll('input[type="radio"]');
    const uniqueQuestions = new Set(Array.from(allQuestions).map((input) => input.name));
    const answeredQuestions = Array.from(allQuestions).filter((input) => input.checked);

    const totalQuestions = uniqueQuestions.size; // Count unique question names
    const totalAnswered = new Set(answeredQuestions.map((input) => input.name)).size;

    console.log('Total Questions:', totalQuestions);
    console.log('Total Answered:', totalAnswered);

    if (totalAnswered < totalQuestions) {
        // If not all questions are answered, show the first confirmation modal
        const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        confirmationModal.show();

        // Handle "Confirm Submission" button click
        document.getElementById('confirmSubmitButton').onclick = () => {
            confirmationModal.hide();
            submitQuiz(); // Proceed with submission
        };
    } else {
        // If all questions are answered, show the second confirmation modal
        const fullAnswerModal = new bootstrap.Modal(document.getElementById('fullAnswerModal'));
        fullAnswerModal.show();

        // Handle "Confirm Submission" button click for full answered modal
        document.getElementById('confirmFullSubmitButton').onclick = () => {
            fullAnswerModal.hide();
            submitQuiz(); // Proceed with submission
        };
    }
});


// Function to submit the quiz
function submitQuiz() {
    const answers = Array.from(
        document.querySelectorAll('input[type="radio"]:checked')
    ).map((input) => ({
        itemId: input.name.split('-')[1], // Extract question ID
        answer: input.value, // User-selected answer
    }));

    const progress = {};
    answers.forEach((ans) => (progress[ans.itemId] = ans.answer));

    console.log("Progress:", progress);

    // Make a fetch request to the backend to get the correct answers and calculate the score
    fetch(`${apiUrl}/calculateScore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: progress }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Calculated score:", data.score);
            const score = data.score;

            // Submit the quiz with the calculated score
            fetch(`${apiUrl}/submitAttempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attemptId: sessionStorage.getItem('attemptId'),
                    progress: progress,
                    score: score, // Use the score calculated by the backend
                }),
            })
                .then((response) => response.json())
                .then(() => {
                    const attemptId = sessionStorage.getItem('attemptId');
                    if (attemptId) {
                        window.location.href = `quiz/quizResults.html?attemptId=${attemptId}`;
                    } else {
                        showAlertModal('Error: Missing attempt ID. Please try again.');
                    }
                })
                .catch((error) => console.error('Error submitting quiz:', error));
        })
        .catch((error) => console.error('Error calculating score:', error));
}




// Start quiz attempt when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load the navbar
    fetch('../navbar.html')
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('navbar-container').innerHTML = html;
        })
        .catch((error) => console.error('Error loading navbar:', error));

    // Start quiz attempt
    fetch(`${apiUrl}/startAttempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quizId, userId: userId }),
    })
        .then((response) => response.json())
        .then((attempt) => {
            sessionStorage.setItem('attemptId', attempt.attemptId); // Save attempt ID
            console.log('Attempt started:', attempt);
            document.getElementById('quiz-title').innerText = `Quiz: ${localStorage.getItem('quizTopic')}`;
            fetchQuizQuestions(); // Fetch questions after starting the attempt
        })
        .catch((error) => console.error('Error starting quiz attempt:', error));
});


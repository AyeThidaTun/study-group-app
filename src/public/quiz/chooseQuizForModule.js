/* eslint-disable no-undef */
/* 

    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
	
*/

const apiUrl = '/quizzes';

// Function to fetch all attempts for a specific quiz
function fetchAttempts(quizId) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('User ID is not found in localStorage.');
        return;
    }

    // Fetch attempts for the given quiz and user
    fetch(`${apiUrl}/getAttempts?quizId=${quizId}&userId=${userId}`)
        .then((response) => response.json())
        .then((attempts) => {
            if (attempts.message === 'No attempts found for this quiz and user') {
                showAlertModal('No previous attempts for this quiz.');
                return;
            }

            // Populate modal with attempts data
            const attemptsModalBody = document.getElementById('attempts-modal-body');
            attemptsModalBody.innerHTML = ''; // Clear previous content

            attempts.forEach((attempt, index) => {
                if (attempt.score === null) {
                    attempt.score = 'Did not submit'
                }

                const attemptHtml = `
                    <div class="mb-3 p-3 border rounded">
                        <h5>Attempt ${index + 1}</h5>
                        <p>Score: ${attempt.score} / ${attempt.questionCount}</p>
                        <p>Status: ${attempt.status}</p>
                        <p>Started At: ${new Date(attempt.startedAt).toLocaleString()}</p>
                        <p>Ended At: ${attempt.endedAt ? new Date(attempt.endedAt).toLocaleString() : 'In Progress'}</p>
                    </div>
                `;
                attemptsModalBody.insertAdjacentHTML('beforeend', attemptHtml);
            });

            // Show the modal
            const attemptsModal = new bootstrap.Modal(document.getElementById('attemptsModal'));
            attemptsModal.show();
        })
        .catch((error) => {
            console.error('Error fetching attempts:', error);
            showAlertModal('Failed to load attempts. Please try again.');
        });
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

// Function to retrieve quizzes for the selected module (updated with "View All Attempts" button)
// Fetch quizzes with optional filters
function fetchQuizzesWithFilters(filters = {}) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('User ID is not found in localStorage.');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const modCode = urlParams.get('modCode');
    if (!modCode) {
        console.error('modCode is missing in the URL.');
        return;
    }

    // Construct query string from filters
    const queryParams = new URLSearchParams({ modCode, userId, ...filters });

    fetch(`${apiUrl}/quizForModule?${queryParams.toString()}`)
        .then((response) => response.json())
        .then((quizzes) => {
            const quizContainer = document.getElementById('quizzes');
            quizContainer.innerHTML = ''; // Clear previous quizzes

            if (quizzes.length === 0) {
                const noQuizzesCard = document.createElement('div');
                noQuizzesCard.classList.add('col-12', 'text-center', 'my-5');
                noQuizzesCard.innerHTML = `
                    <div class="card1 h-75">
                        <h5 class="card-title">No quizzes available for this module yet</h5>
                    </div>
                `;
                quizContainer.appendChild(noQuizzesCard);
            } else {
                quizzes.forEach((quiz) => {
                    const quizCard = document.createElement('div');
                    quizCard.classList.add('col-12', 'col-md-4', 'mb-4');
                    quizCard.innerHTML = `
                        <a class="card1" href="/quiz/startQuiz.html?quizId=${quiz.quizId}" onclick="storeQuizTopic('${quiz.topic}')">
                            <h5 class="card-title mb-4">Topic: ${quiz.topic}</h5>
                            <p class="card-text">School: ${quiz.schoolFullName}</p>
                            <p class="card-text">Year: ${quiz.year}, ${quiz.semester}</p>
                            <p class="card-text">Status: ${quiz.status}</p>
                            <p class="card-text">Highest Score: ${quiz.highestScore} / ${quiz.questionCount}</p>
                            <small class="text-muted">Created on: ${new Date(quiz.createdAt).toLocaleDateString()}</small>
                            <div class="go-corner">
                                <div class="go-arrow">→</div>
                            </div>
                        </a>
                        <button class="btn btn-secondary mt-2" onclick="fetchAttempts(${quiz.quizId})">View All Attempts</button>
                    `;
                    quizContainer.appendChild(quizCard);
                });
            }
        })
        .catch((error) => console.error('Error fetching quizzes:', error));
}

// Function to handle filter changes
function handleFilterChange() {
    const filters = {};

    // Collect selected filters
    document.querySelectorAll('.filter-checkbox:checked').forEach((checkbox) => {
        const filterType = checkbox.getAttribute('data-filter');
        if (!filters[filterType]) {
            filters[filterType] = [];
        }
        filters[filterType].push(checkbox.value);
    });

    // Convert arrays to comma-separated strings for the query parameters
    for (const key in filters) {
        filters[key] = filters[key].join(',');
    }

    // Fetch quizzes with the selected filters
    fetchQuizzesWithFilters(filters);
    retrieveFlashcardsForModule(filters);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const currentUrl = window.location.href;
    localStorage.setItem('previousUrl', currentUrl);

    const urlParams = new URLSearchParams(window.location.search);
    const schoolName = urlParams.get('schoolName') || 'Unknown School';
    const schoolId = urlParams.get('schoolId') || 'Unknown School ID';
    const modName = urlParams.get('modName') || 'Unknown Module';

    document.getElementById('breadcrumb-school').textContent = schoolName;
    document.getElementById('breadcrumb-module').textContent = `Select Module: ${modName}`;
    const chooseModuleLink = document.getElementById('choose-module-link');
    chooseModuleLink.href = `/quiz/chooseModuleForQuiz.html?schoolId=${schoolId}&schoolName=${encodeURIComponent(schoolName)}`;

    // Attach change event listeners to all filter checkboxes
    document.querySelectorAll('.filter-checkbox').forEach((checkbox) => {
        checkbox.addEventListener('change', handleFilterChange);
    });

    fetch('../navbar.html')
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('navbar-container').innerHTML = html;
        })
        .catch((error) => console.error('Error loading navbar:', error));

        fetchQuizzesWithFilters();
    retrieveFlashcardsForModule();
});


// Function to store the selected quiz topic in localStorage
function storeQuizTopic(topic) {
    localStorage.setItem('quizTopic', topic);
}

// Attach them to the window object
window.fetchAttempts = fetchAttempts;
window.storeQuizTopic = storeQuizTopic;
window.apiUrl = '/quizzes'; // Now available globally
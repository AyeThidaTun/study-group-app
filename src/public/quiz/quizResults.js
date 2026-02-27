/* 
    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
*/

const apiUrl = '/quizzes'; // Base API URL
const attemptId = new URLSearchParams(window.location.search).get('attemptId'); // Get attemptId from URL

function fetchResults() {
    fetch(`${apiUrl}/getResults?attemptId=${attemptId}`)
        .then((response) => response.json())
        .then((results) => {
            const resultsContainer = document.getElementById('results-container');
            resultsContainer.innerHTML = ''; // Clear previous content if any

            if (!results || results.questions.length === 0) {
                resultsContainer.innerHTML = `<p class="text-center text-muted">No results available.</p>`;
                return;
            }

            let correctCount = 0;
            const totalQuestions = results.questions.length;

            results.questions.forEach((question, index) => {
                console.log('Question:', question);
                const isCorrect = question.userAnswer === question.correctAnswer;
                if (isCorrect) correctCount++;

                // Create HTML for options
                const optionsHtml = question.options.map((option, i) => {
                    const optionLabel = `Option ${i + 1}`;
                    return `<li>${optionLabel} - ${option}</li>`;
                }).join('');

                // Mapping userAnswer and correctAnswer to actual options
                const userAnswerIndex = question.options.indexOf(question.userAnswer);
                const correctAnswerIndex = question.options.indexOf(question.correctAnswer);

                // If userAnswer exists, map it to corresponding option label and text
                const userAnswerText = userAnswerIndex !== -1 
                    ? `Option ${userAnswerIndex + 1} - ${question.options[userAnswerIndex]}`
                    : 'No Answer';

                // Correct answer as Option label and text
                const correctAnswerText = correctAnswerIndex !== -1 
                    ? `Option ${correctAnswerIndex + 1} - ${question.options[correctAnswerIndex]}`
                    : 'No Answer';

                // Construct HTML for each question
                const questionHtml = `
                    <div class="mb-4 p-3 border ${isCorrect ? 'border-success' : 'border-danger'} rounded">
                        <h5>Question ${index + 1}: ${question.text}</h5>
                        <ul>${optionsHtml}</ul>
                        <p>Your Answer: <strong>${userAnswerText}</strong></p>
                        <p>Correct Answer: <strong>${correctAnswerText}</strong></p>
                        ${
                            isCorrect
                                ? `<p class="text-success">Correct!</p>`
                                : `<p class="text-danger">Incorrect.</p>`
                        }
                    </div>
                `;
                resultsContainer.insertAdjacentHTML('beforeend', questionHtml);
            });

            // Summary of the score
            const summaryHtml = `
                <div class="alert alert-info text-center">
                    <h4>Score: ${correctCount}/${totalQuestions}</h4>
                </div>
            `;
            resultsContainer.insertAdjacentHTML('afterbegin', summaryHtml);
        })
        .catch((error) => console.error('Error fetching results:', error));
}




// Handle "Back to Quizzes" button
document.getElementById('go-back-btn').addEventListener('click', () => {
    const redirectUrl = localStorage.getItem('previousUrl') || '/'; // Default to homepage
    window.location.href = redirectUrl;
});

// Load the navbar and fetch results on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load navbar
    fetch('../navbar.html')
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('navbar-container').innerHTML = html;
        })
        .catch((error) => console.error('Error loading navbar:', error));

    // Fetch and display results
    fetchResults();
});

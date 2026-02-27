
/* 
    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
*/

const apiUrl = '/quizzes'; // Base API URL
const deckId = new URLSearchParams(window.location.search).get('deckId'); // Get deckId from URL

let flashcards = []; // Array to store flashcards
let currentIndex = 0; // Track the current flashcard index
let showingQuestion = true; // Track whether the card is showing the question or answer
let flashcardsReviewed = 0; // To track how many flashcards the user has reviewed
console.log(flashcardsReviewed); // Add this temporarily to see if it's tracked
let lastReviewedIndex = null; // Store the last reviewed index
let isCompletionScreen = false; // Flag to track if all cards are reviewed

// Fetch flashcards from the API
function fetchFlashcards() {
    fetch(`${apiUrl}/${deckId}/flashcards`)
        .then((response) => response.json())
        .then((data) => {
            console.log('Flashcards:', data); // Log to see what the backend is returning
            flashcards = data;
            if (flashcards.length === 0) {
                document.getElementById('flashcard-content').innerText =
                    'No flashcards available for this deck.';
                disableNavigationButtons();
            } else {
                displayFlashcard(currentIndex);
            }
        })
        .catch((error) => console.error('Error fetching flashcards:', error));
}

// Update the counter that shows the current flashcard number
function updateCounter() {
    const counterElement = document.getElementById('flashcard-counter');
    counterElement.innerText = `${currentIndex + 1} / ${flashcards.length}`; // Display actual position out of total flashcards
}

// Toggle between question and answer
function toggleFlashcard() {
    if (isCompletionScreen) return; // Prevent card click if on completion screen

    const flashcard = flashcards[currentIndex];
    const flashcardElement = document.getElementById('flashcard');
    const flashcardContent = document.getElementById('flashcard-content');
    
    if (showingQuestion) {
        flashcardContent.innerText = flashcard.content; // Show the answer
        flashcardElement.classList.add('show-answer'); // Add answer class
    } else {
        flashcardContent.innerText = flashcard.title; // Show the question
        flashcardElement.classList.remove('show-answer'); // Remove answer class
    }
    showingQuestion = !showingQuestion; // Toggle between question and answer
}

// Navigate to the previous flashcard
function showPreviousFlashcard() {
    if (currentIndex > 0) {
        currentIndex--;
        flashcardsReviewed--; // Decrement the reviewed count when going back
        displayFlashcard(currentIndex);
    }
}

// Navigate to the next flashcard
function showNextFlashcard() {
    if (currentIndex < flashcards.length - 1) {
        currentIndex++;
        flashcardsReviewed++; // Increment the reviewed count when going forward
        displayFlashcard(currentIndex);
    } else {
        // When counter exceeds the last card, go to completion
        displayCompletionMessage();
    }
}

// Display the current flashcard
function displayFlashcard(index) {
    const flashcard = flashcards[index];
    const flashcardContent = document.getElementById('flashcard-content');
    const flashcardElement = document.getElementById('flashcard');


    // Reset background to default color and remove show-answer class
    flashcardElement.classList.remove('show-answer');
    flashcardContent.innerText = flashcard.title; // Show the question
    showingQuestion = true;

    updateCounter();
    flashcardsReviewed = index + 1;

    // Store the last reviewed index
    lastReviewedIndex = index;
}

// Display message when all flashcards have been reviewed
function displayCompletionMessage() {
    isCompletionScreen = true; // Set flag to prevent further card clicks
    const flashcardContent = document.getElementById('flashcard-content');
    flashcardContent.innerHTML = `
        <h4>Way to go! You’ve reviewed all the cards.</h4>
        <p>How you're doing</p>
        <p>Completed: ${flashcards.length}</p>
        <p>Terms left: 0</p>
    `;

    // Hide navigation buttons
    document.getElementById('prev-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';

    // Get user ID from localStorage and deck ID
    const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
    const deckId = new URLSearchParams(window.location.search).get('deckId')

    // Update deck progress to 2 (completed)
    if (userId && deckId) {
        fetch(`${apiUrl}/deck/completeDeckProgress`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                deckId: deckId,
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('Deck progress updated successfully!');
            } else {
                console.error('Failed to update deck progress');
            }
        })
        .catch(error => {
            console.error('Error during the fetch request:', error);
        });
    }

    // Check if the "Back to last question" button already exists
    if (!document.getElementById('back-to-last-btn')) {
        // Show "Back to last question" button
        const backToLastButton = document.createElement('button');
        backToLastButton.id = 'back-to-last-btn';
        backToLastButton.classList.add('btn', 'btn-primary');
        backToLastButton.innerText = 'Back to last question';
        document.getElementById('flashcard').appendChild(backToLastButton);

        // Add event listener for back button
        backToLastButton.addEventListener('click', () => {
            if (lastReviewedIndex !== null) {
                displayFlashcard(lastReviewedIndex); // Show the last reviewed flashcard
            }
            document.getElementById('prev-btn').style.display = 'inline-block';
            document.getElementById('next-btn').style.display = 'inline-block';
            backToLastButton.remove();
            isCompletionScreen = false; // Reset flag
        });
    }
}

// Disable navigation buttons if no flashcards are available
function disableNavigationButtons() {
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('next-btn').disabled = true;
}

// Handle "Back to Decks" button
document.getElementById('go-back-btn').addEventListener('click', () => {
    const redirectUrl = localStorage.getItem('previousUrl') || '/'; // Default to homepage
    window.location.href = redirectUrl;
});

// Add event listeners for interactions
document.addEventListener('DOMContentLoaded', () => {
    // Load the navbar
    fetch('../navbar.html')
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('navbar-container').innerHTML = html;
        })
        .catch((error) => console.error('Error loading navbar:', error));

    // Fetch and display flashcards
    fetchFlashcards();

    // Add event listener for flashcard click
    document.getElementById('flashcard').addEventListener('click', toggleFlashcard);

    // Add event listeners for navigation buttons
    document.getElementById('prev-btn').addEventListener('click', showPreviousFlashcard);
    document.getElementById('next-btn').addEventListener('click', showNextFlashcard);
});

// Function to retrieve flashcards for the selected module with filters
function retrieveFlashcardsForModule(filters = {}) {
    const urlParams = new URLSearchParams(window.location.search);
    const modCode = urlParams.get('modCode');

    if (!modCode) {
        console.error('modCode is missing in the URL.');
        return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('User ID is not found in localStorage.');
        return;
    }

    // Construct the query parameters for the API request
    const queryParams = new URLSearchParams({
        modCode,
        userId,
        ...filters
    });

    console.log('Query Params:', queryParams.toString());

    fetch(`${window.apiUrl}/flashcardForModule?${queryParams.toString()}`)
        .then((response) => response.json())
        .then((data) => {
            const deckContainer = document.getElementById('flashcards');
            console.log("Clearing content in deck container.");
            deckContainer.innerHTML = '';
            console.log("Content cleared.");

            console.log('Decks:', data); // Log to see what the backend is returning
            const decks = data;

            if (!Array.isArray(decks) || decks.length === 0) {
                const noDecksMessage = document.createElement('div');
                noDecksMessage.classList.add('text-center', 'my-5');
                noDecksMessage.innerHTML = `
                    <div class="card2">
                        <h5 class="card-title">No decks available for this module yet</h5>
                    </div>
                `;
                deckContainer.appendChild(noDecksMessage);
            } else {                

                decks.forEach((deck) => {
                    const deckCard = document.createElement('div');
                    deckCard.classList.add('col-12', 'col-md-4', 'mb-4');
                    deckCard.innerHTML = `
                        <div class="card2" data-deck-id="${deck.deckId}">
                            <h5 class="card-title mb-4">Topic: ${deck.topic}</h5>
                            <p class="card-text">Name: ${deck.name}</p>
                            <p class="card-text">Description: ${deck.description || 'No description provided.'}</p>
                            <p class="card-text">Year: ${deck.year}, ${deck.semester}</p>
                            <p class="card-text">Status: ${deck.progress}</p>
                            <div class="go-corner">
                              <div class="go-arrow">→</div>
                            </div>
                        </div>
                    `;

                    deckContainer.appendChild(deckCard);
                });

                // Add event listeners for deck cards
                document.querySelectorAll('.card2').forEach((card) => {
                    card.addEventListener('click', () => {
                        const deckId = card.getAttribute('data-deck-id');
                        const userId = localStorage.getItem('userId');
                        // Send userId and deckId to the server before redirecting
                        fetch(`${window.apiUrl}/deck/startDeckProgress`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                userId: userId,
                                deckId: deckId
                            })
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                // Handle response if necessary, then redirect
                                console.log('Deck view logged:', data);
                                window.location.href = `/quiz/flashcard.html?deckId=${deckId}`;
                            })
                            .catch((error) => {
                                console.error('Error logging deck view:', error);
                                // window.location.href = `/quiz/flashcard.html?deckId=${deckId}`;
                            });
                    });
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching decks:', error);
            const deckContainer = document.getElementById('deck-container');
            deckContainer.innerHTML = '<p>Error loading decks. Please try again later.</p>';
        });
}

// Attach them to the window object
window.retrieveFlashcardsForModule = retrieveFlashcardsForModule;
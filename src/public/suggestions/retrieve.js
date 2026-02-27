const apiUrl = '/suggestions'; // Assuming API URL for suggestions

// Function to fetch suggestions based on parameters (search term, sort options, tags)
function fetchSuggestions(searchTerm = '', sortBy = 'createdAt', sortOrder = 'desc', selectedTags = []) {
    // Log the inputs for debugging
    console.log('Fetch Suggestions called with:');
    console.log('Search Term:', searchTerm);
    console.log('Sort By:', sortBy);
    console.log('Sort Order:', sortOrder);

    // Build query parameters based on inputs
    const queryParams = new URLSearchParams({
        searchTerm,
        sortBy,
        sortOrder,
        tags: selectedTags.join(','), // Join selected tags into a comma-separated string
    }).toString();

    // Log the final query string
    console.log('Query Parameters:', queryParams);

    // Make the fetch request
    fetch(`${apiUrl}?${queryParams}`)
        .then(response => response.json())
        .then(data => {
            console.log('Suggestions Data:', data); // Log the response data
            const suggestionsContainer = document.getElementById('suggestions-container');
            suggestionsContainer.innerHTML = ''; // Clear existing content

            // Render the suggestions
            data.forEach(suggestion => {
                const suggestionElement = document.createElement('div');
                suggestionElement.classList.add('card', 'mb-4');

                // Determine the color class based on the status
                let statusClass = '';
                switch (suggestion.status) {
                    case 'PENDING':
                        statusClass = 'text-warning';
                        break;
                    case 'REJECTED':
                        statusClass = 'text-danger';
                        break;
                    case 'APPROVED':
                        statusClass = 'text-success';
                        break;
                    default:
                        statusClass = 'text-muted';
                        break;
                }

                suggestionElement.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${suggestion.title}</h5>
                        <p class="card-text">${suggestion.description}</p>
                        <p class="card-text"><small class="text-muted">Status: <span class="${statusClass}">${suggestion.status}</span></small></p>
                        <p class="card-text"><small class="text-muted">Tags: ${suggestion.tags.join(', ')}</small></p>
                        <p class="card-text"><small class="text-muted">Posted on: ${new Date(suggestion.createdAt).toLocaleDateString()}</small></p>
                        ${suggestion.reason
                        ? `<p class="card-text reason-text">${suggestion.reason} - Admin</p>`
                        : ''}
                    </div>
                `;
                suggestionsContainer.appendChild(suggestionElement);
            });
        })
        .catch(error => console.error('Error fetching suggestions:', error));
}

// Utility function to get the current search, sort, and order values
function getCurrentSearchParams() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const sortBy = document.getElementById('sort-view').value;
    const sortOrder = document.querySelector('input[name="sort-order"]:checked').id;
    return { searchTerm, sortBy, sortOrder };
}

// Event listener for search bar
document.getElementById('search-bar').addEventListener('input', (event) => {
    const { sortBy, sortOrder } = getCurrentSearchParams();
    fetchSuggestions(event.target.value.toLowerCase(), sortBy, sortOrder); // Use the updated parameters
});

// Event listener for Sort & View dropdown and radio buttons
document.getElementById('sort-view').addEventListener('change', () => {
    const { searchTerm } = getCurrentSearchParams();
    const sortBy = document.getElementById('sort-view').value;
    const sortOrder = document.querySelector('input[name="sort-order"]:checked').id;
    fetchSuggestions(searchTerm, sortBy, sortOrder); // Use the updated parameters
});

// Event listener for sorting order (ASC/DESC)
document.querySelectorAll('input[name="sort-order"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const { searchTerm, sortBy } = getCurrentSearchParams();
        const sortOrder = document.querySelector('input[name="sort-order"]:checked').id;
        fetchSuggestions(searchTerm, sortBy, sortOrder); // Use the updated parameters
    });
});

// Event listener for tag filters (main page)
document.querySelectorAll('.retrieve-section .btn-group .btn').forEach(button => {
    button.addEventListener('click', (event) => {
        event.target.classList.toggle('selected');

        const selectedTags = Array.from(document.querySelectorAll('.retrieve-section .btn-group .btn.selected'))
            .map(button => button.textContent.trim());

        const { searchTerm, sortBy, sortOrder } = getCurrentSearchParams();
        console.log('Selected Tags after click at retrieve:', selectedTags);

        fetchSuggestions(searchTerm, sortBy, sortOrder, selectedTags); // Use the updated parameters
    });
});



// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar-container').innerHTML = html;
        })
        .catch(error => console.error('Error loading navbar:', error));

    fetchSuggestions(); // Fetch initial suggestions
});

/* eslint-disable no-undef */
/* 
    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
*/

const apiUrl = '/suggestions'; // Assuming API URL for suggestions

// Function to open the modal with the selected suggestion details
function openManageSuggestionModal(suggestionId) {
    const modal = new bootstrap.Modal(document.getElementById('manageSuggestionModal'));
    document.getElementById('suggestionIdInput').value = suggestionId; // Set suggestion ID
    document.getElementById('approveRadio').checked = false; // Reset radio buttons
    document.getElementById('rejectRadio').checked = false;
    document.getElementById('reasonInput').value = ''; // Reset reason
    modal.show();
}

// Function to handle modal form submission
document.getElementById('manageSuggestionForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    const suggestionId = document.getElementById('suggestionIdInput').value;
    const actionElement = document.querySelector('input[name="action"]:checked');
    const reason = document.getElementById('reasonInput').value.trim();

    if (!actionElement) {
        // Show alert if no action is selected
        showAlertModal('Please select either "Approve" or "Reject" before submitting.');
        return;
    }

    if (!reason) {
        // Show alert if no reason is provided
        showAlertModal('Please provide a reason for your decision.');
        return;
    }

    const action = actionElement.value; // "APPROVED" or "REJECTED"

    fetch(`${apiUrl}/admin/${suggestionId}/manage`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action, reason }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update suggestion');
            }
            return response.json();
        })
        .then(data => {
            console.log('Suggestion updated:', data);
            showAlertModal('Suggestion successfully updated!', 'Success'); // Optional success message
            fetchSuggestions(); // Refresh suggestions after update
            const modal = bootstrap.Modal.getInstance(document.getElementById('manageSuggestionModal'));
            modal.hide(); // Hide the modal after successful submission
        })
        .catch(error => {
            console.error('Error updating suggestion:', error);
            showAlertModal('Failed to update suggestion. Please try again.');
        });
});


// Function to fetch suggestions based on parameters (search term, sort options, tags)
function fetchSuggestions(searchTerm = '', sortBy = 'createdAt', sortOrder = 'asc', selectedTags = []) {
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
                        <br><button class="btn btn-primary" onclick="openManageSuggestionModal(${suggestion.id})">Manage Suggestion</button>
                    </div>
                `;
                suggestionsContainer.appendChild(suggestionElement);
            });
        })
        .catch(error => console.error('Error fetching suggestions:', error));
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




// Function to load the navbar into the profile.html
window.addEventListener('DOMContentLoaded', () => {
    // Load the navbar
    fetch('../adminNavbar.html')
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('navbar-container').innerHTML = html;
        })
        .catch((error) => console.error('Error loading navbar:', error));

    // Fetch initial suggestions
    fetchSuggestions();
});

// Attach them to the window object
window.openManageSuggestionModal = openManageSuggestionModal;


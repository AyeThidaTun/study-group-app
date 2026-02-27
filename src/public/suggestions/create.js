/* eslint-disable no-undef */
let draftId = null;

// Function to load the latest draft into the modal
function loadDraftIntoModal() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("No token found in localStorage");
        return;
    }

    fetch(`${apiUrl}/draft`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    // If no draft exists (404), create a new draft
                    return createNewDraft();
                }
                throw new Error("Failed to fetch draft");
            }
            return response.json();
        })
        .then(draft => {
            console.log("Draft loaded:", draft);
            draftId = draft.id; // Save the draft ID for updates
            document.getElementById("post-title").value = draft.title || "";
            document.getElementById("post-description").value = draft.description || "";

            if (draft.tags && Array.isArray(draft.tags)) {
                // Clear any previously selected tags
                document.querySelectorAll('#createPostModal #post-tags .btn.selected').forEach(button => {
                    button.classList.remove('selected');
                    button.setAttribute('aria-pressed', 'false'); // Accessibility reset
                });
            
                // Select the tags from the draft
                draft.tags.forEach(tag => {
                    const matchingButton = document.querySelector(`#createPostModal #post-tags .btn[data-tag="${tag}"]`);
                    if (matchingButton) {
                        matchingButton.classList.add('selected');
                        matchingButton.setAttribute('aria-pressed', 'true'); // Accessibility update
                    }
                });
            }
            
        })
        .catch(error => console.error("Error loading draft:", error));
}

// Function to create a new draft
function createNewDraft() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("No token found in localStorage");
        return;
    }

    fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: "", description: "", tag: "" })
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to create draft");
            return response.json();
        })
        .then(draft => {
            draftId = draft.id;
        })
        .catch(error => console.error("Error creating draft:", error));
}

// Handle "New Post" button click
document.getElementById("new-post-btn").addEventListener("click", () => {
    const createPostModal = new bootstrap.Modal(document.getElementById("createPostModal"));

    console.log("New Post button clicked", draftId);

    // Fetch the latest draft and load it into the modal, or create a new one if none exists
    loadDraftIntoModal();  // Always attempt to load the draft first

    createPostModal.show();
});


// Function to toggle tag selection (modal only)
document.querySelectorAll('#createPostModal #post-tags .btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const tagButton = event.target;
        tagButton.classList.toggle('selected'); // Toggle selected class

        // Add or remove the 'aria-pressed' attribute for accessibility
        const isSelected = tagButton.classList.contains('selected');
        tagButton.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

        // Get all currently selected tags
        const selectedTags = Array.from(document.querySelectorAll('#createPostModal #post-tags .btn.selected'))
            .map(selectedButton => selectedButton.dataset.tag);

        // Log the selected tags
        console.log('Currently selected tags (modal):', selectedTags);

        // Manually trigger the form update logic
        triggerDraftUpdate();
    });
});



// Function to update the draft when fields change
function triggerDraftUpdate() {
    if (!draftId) return;

    const token = localStorage.getItem("token");
    const title = document.getElementById("post-title").value.trim();
    const description = document.getElementById("post-description").value.trim();
    const selectedTags = Array.from(document.querySelectorAll('#createPostModal #post-tags .btn.selected'))
        .map(selectedButton => selectedButton.dataset.tag);

    const updateData = {
        title,
        description,
        tags: selectedTags
    };

    fetch(`${apiUrl}/${draftId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
    }).catch(error => console.error("Error updating draft:", error));
}

// Listen for input changes and trigger updates
document.getElementById("create-post-form").addEventListener("input", triggerDraftUpdate);

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

// Handle final submission
document.getElementById("submit-post-btn").addEventListener("click", () => {
    if (!draftId) return;

    const token = localStorage.getItem("token");
    const title = document.getElementById("post-title").value.trim();
    const description = document.getElementById("post-description").value.trim();
    const selectedTags = Array.from(document.querySelectorAll('#post-tags .btn.selected'))
        .map(button => button.dataset.tag);

    // Prevent submission if fields are not filled
    if (!title) {
        showAlertModal("Please fill in the title.");
        return;
    }
    if (!description) {
        showAlertModal("Please fill in the description.");
        return;
    }
    if (selectedTags.length === 0) {
        showAlertModal("Please select at least one tag.");
        return;
    }

    fetch(`${apiUrl}/${draftId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "PENDING", tags: selectedTags })
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to submit post");
            location.reload(); // Reload to reflect the newly added post
            return response.json();
        })
        .then(() => {
            // Reset modal and draftId
            draftId = null;
            document.getElementById("create-post-form").reset();
            bootstrap.Modal.getInstance(document.getElementById("createPostModal")).hide();
        })
        .catch(error => console.error("Error submitting post:", error));
});

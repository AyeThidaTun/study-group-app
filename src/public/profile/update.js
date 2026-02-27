/* eslint-disable no-undef */
/* 
    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
*/

// Function to save the selected avatar
function saveAvatar() {
    if (selectedAvatar) {
        // Get the token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
            console.error('No token found in localStorage');
            showAlertModal('You need to be logged in to change your avatar');
            return;
        }

        // Prepare the data to send to the backend
        const avatarData = {
            imageName: selectedAvatar
        };

        // Send a PUT request to update the profile with the selected avatar
        fetch(`${apiUrl}/profile/avatar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`, // Include the token for authentication
                'Content-Type': 'application/json' // Specify the content type
            },
            body: JSON.stringify(avatarData) // Send the selected avatar as JSON
        })
            .then(response => response.json())
            .then((data) => {
                console.log('Avatar updated successfully:', data);
                const modal = new bootstrap.Modal(document.getElementById('avatarModal'));
                modal.hide(); // Hide the modal programmatically
                location.reload(); // Reload the page to reflect the changes
            })
            .catch((error) => {
                console.error('Error updating avatar:', error);
                showAlertModal('Failed to update avatar. Please try again.');
            });
    } else {
        showAlertModal('Please select an avatar!');
    }
}

// Function to handle field updates using a modal
function updateField(field, currentValue) {
    const modal = new bootstrap.Modal(document.getElementById('updateModal'));
    const modalTitle = document.getElementById('updateModalLabel');
    const inputField = document.getElementById('updateInput');
    const saveButton = document.getElementById('saveChangesButton');
    const infoText = document.getElementById('infoText');
    const academicLevelRadio = document.getElementById('academicLevelRadio');
    const updateFieldContainer = document.getElementById('updateFieldContainer');

    // Hide text input and show radio buttons if the field is academicLevel
    if (field === "academicLevel") {
        inputField.classList.add('d-none');
        academicLevelRadio.classList.remove('d-none');
        updateFieldContainer.querySelector('label').textContent = 'Select Academic Level';
    } else {
        inputField.classList.remove('d-none');
        academicLevelRadio.classList.add('d-none');
        updateFieldContainer.querySelector('label').textContent = 'New Value';
    }

    // Set the modal title and input placeholder dynamically
    modalTitle.textContent = `Update ${capitalize(field)}`;
    inputField.value = currentValue;
    inputField.placeholder = `Enter new ${field}`;
    infoText.textContent = field === "name" ? "Names can only contain alphabets and spaces." : "";

    // Attach save button logic
    saveButton.onclick = () => {
        let newValue;

        if (field === "academicLevel") {
            const selectedRadio = document.querySelector('input[name="academicLevel"]:checked');
            if (selectedRadio) {
                newValue = selectedRadio.value;
            } else {
                showAlertModal('Please select an academic level.');
                return;
            }
        } else {
            newValue = inputField.value.trim();
        }

        if (!newValue) {
            showAlertModal(`Please enter a valid ${field}.`);
            return;
        }

        // Validate field-specific constraints
        if (field === "name" && !/^[A-Za-z\s]+$/.test(newValue)) {
            showAlertModal("Names can only contain alphabets and spaces.");
            return;
        }

        // Perform the API call to update the field
        fetch(`${apiUrl}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ [field]: newValue }),
        })
            .then((response) => {
                if (response.ok) {
                    showAlertModal(`${capitalize(field)} updated successfully!`);
                    fetchUserProfile(); // Refresh the profile data
                    modal.hide();
                } else {
                    return response.json().then((data) => {
                        throw new Error(data.message || "Failed to update profile.");
                    });
                }
            })
            .catch((error) => showAlertModal(error.message));
    };

    modal.show();
}

// Function to verify the old password
function verifyOldPassword() {
    const oldPassword = document.getElementById('oldPasswordInput').value.trim();
    const oldPasswordError = document.getElementById('oldPasswordError');

    if (!oldPassword) {
        oldPasswordError.textContent = "Old password is required!";
        return;
    } else {
        oldPasswordError.textContent = ""; // Clear error

        // Send a request to verify the old password
        fetch(`${apiUrl}/profile/verifyPassword`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ oldPassword: oldPassword }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Retrieve and hide the existing "Verify Password" modal instance
                    const verifyModal = bootstrap.Modal.getInstance(document.getElementById('verifyPasswordModal'));
                    if (verifyModal) verifyModal.hide();

                    // Show the "New Password" modal
                    const newPasswordModal = new bootstrap.Modal(document.getElementById('newPasswordModal'));
                    newPasswordModal.show();
                } else {
                    showAlertModal("Old password is incorrect.");
                }
            })
            .catch(error => {
                console.error('Error verifying old password:', error);
                showAlertModal("An error occurred. Please try again.");
            });
    }
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




// Function to update the new password
function updatePassword() {
    const newPassword = document.getElementById('newPasswordInput').value.trim();
    const confirmPassword = document.getElementById('confirmPasswordInput').value.trim();
    const passwordError = document.getElementById('passwordError');

    // Regex for password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!newPassword || !confirmPassword) {
        passwordError.textContent = "Both password fields are required!";
        return;
    } else if (!passwordRegex.test(newPassword)) {
        passwordError.textContent = "Password must be at least 8 characters long, include a lowercase letter, an uppercase letter, a special character, and a number.";
        return;
    } else if (newPassword !== confirmPassword) {
        passwordError.textContent = "Passwords do not match!";
        return;
    } else {
        passwordError.textContent = ""; // Clear error

        // Send a request to update the password
        fetch(`${apiUrl}/profile/updatePassword`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPassword: newPassword }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Close all open modals
                    document.querySelectorAll('.modal.show').forEach(modal => {
                        const modalInstance = bootstrap.Modal.getInstance(modal);
                        if (modalInstance) modalInstance.hide();
                    });

                    // After ensuring all modals are closed, show the alert modal
                    showAlertModal("Password updated successfully!");
                } else {
                    showAlertModal("Failed to update password. Please try again.");
                }
            })
            .catch(error => {
                console.error('Error updating password:', error);
                showAlertModal("An error occurred. Please try again.");
            });
    }
}



// Function to load the navbar into the profile.html
window.addEventListener('DOMContentLoaded', () => {
    // Add event listener to the "Save" button
    const saveButton = document.getElementById('save-avatar-btn');
    if (saveButton) {
        saveButton.addEventListener('click', saveAvatar);
    } else {
        console.error('Save button not found');
    }
});

// Attach them to the window object
window.updateField = updateField;
window.verifyOldPassword = verifyOldPassword;
window.updatePassword = updatePassword;

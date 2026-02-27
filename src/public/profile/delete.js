/* 
    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
*/

/* global logout */ // Let ESLint know logout is defined globally
/* eslint-disable no-undef */

// Function to handle profile deletion
function deleteProfile() {
    fetch(`${apiUrl}/profile`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}` // Include auth token if necessary
        }
    })
        .then((response) => {
            if (response.ok) {
                showAlertModal('Profile deleted successfully! Logging out now...');

                setTimeout(() => {
                    logout(); // Call the logout function after 3 seconds
                }, 3000); // 3000 milliseconds = 3 seconds                
            } else {
                return response.json().then((data) => {
                    throw new Error(data.message || 'Failed to delete profile');
                });
            }
        })
        .catch((error) => {
            console.error('Error deleting profile:', error);
            showAlertModal('An error occurred while deleting your profile. Please try again.');
        });
}

// Add event listener to the "Delete" confirmation button
document.addEventListener('DOMContentLoaded', () => {
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', deleteProfile);
    } else {
        console.error('Confirm Delete button not found');
    }
});

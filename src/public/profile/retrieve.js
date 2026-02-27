/* eslint-disable no-undef */
/* 
    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
*/

const apiUrl = '/users'; // Base API URL
let selectedAvatar = null; // To store selected avatar

// Function to fetch and display logged-in user profile data
function fetchUserProfile() {
    const token = localStorage.getItem("token"); // Get the token from localStorage

    // Check if the token exists
    if (!token) {
        console.error('No token found in localStorage');
        return;
    }

    fetch(`${apiUrl}/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Pass the token from localStorage
        }
    })
        .then((response) => response.json())
        .then((userData) => {
            console.log('User data:', userData); // Log the user data for debugging

            if (userData) {
                const profileContainer = document.getElementById('profile-container');
                profileContainer.innerHTML = `
                    <!-- Welcome Message -->
                    <h1 class="text-center mb-4 title">Welcome back, ${userData.name}</h1>


                    <!-- Avatar Row with Plus Icon -->
                    <div class="text-center mb-4 position-relative">
                        <img 
                            src="../images/${userData.imageName}" 
                            alt="${userData.name}'s Avatar" 
                            class="profile-image img-fluid"
                             data-bs-toggle="modal" data-bs-target="#avatarModal"
                        />
                        <i class="bi bi-plus-circle-fill plus-icon" data-bs-toggle="modal" data-bs-target="#avatarModal"></i>
                    </div>

                    <!-- User Profile Table -->
                <table class="table table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th scope="col">Field</th>
                            <th scope="col">Value</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Name</strong></td>
                            <td>${userData.name}</td>
                            <td><button class="btn btn-outline-brown" onclick="updateField('name', '${userData.name}')">Update</button></td>
                        </tr>
                        <tr>
                            <td><strong>Email</strong></td>
                            <td>${userData.email}</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td><strong>Password</strong></td>
                            <td>********</td>
                            <td><button class="btn btn-outline-brown" onclick="showVerifyPasswordModal()">Update</button></td>
                        </tr>
                        <tr>
                            <td><strong>Academic Level</strong></td>
                            <td>${userData.academicLevel || 'Not provided'}</td>
                            <td><button class="btn btn-outline-brown" onclick="updateField('academicLevel', '${userData.academicLevel || ''}')">Update</button></td>
                        </tr>
                        <tr>
                            <td><strong>Bio</strong></td>
                            <td>${userData.bio || 'No bio available'}</td>
                            <td><button class="btn btn-outline-brown" onclick="updateField('bio', '${userData.bio || ''}')">Update</button></td>
                        </tr>
                        <tr>
                            <td><strong>Skills</strong></td>
                            <td>${userData.skills || 'No skills listed'}</td>
                            <td><button class="btn btn-outline-brown" onclick="updateField('skills', '${userData.skills || ''}')">Update</button></td>
                        </tr>
                        <tr>
                            <td><strong>Points</strong></td>
                            <td>${userData.points}</td>
                            <td>--</td>
                        </tr>
                    </tbody>
                </table>
            `;
            } else {
                console.error('User data not found');
            }
        })
        .catch((error) => console.error('Error fetching user data:', error));
}



// Function to retrieve all profile pictures and display them in a modal
function fetchAllProfilePictures() {
    console.log('Fetching all profile pictures...');

    // Example API call to get all profile pictures
    fetch(`${apiUrl}/avatars`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}` // Use the token from localStorage
        }
    })
        .then((response) => response.json())
        .then((avatars) => {
            console.log('Available avatars:', avatars);

            // Create the modal content dynamically
            const modalBody = document.querySelector('#avatarModal .modal-body');
            modalBody.innerHTML = '';  // Clear any existing content

            // Loop through the avatars and add them to the modal body
            avatars.forEach((avatar) => {
                const avatarImage = document.createElement('img');
                avatarImage.src = `../images/${avatar.imageName}`;  // Use the avatar image name
                avatarImage.alt = `Avatar ${avatar.imageName}`;
                avatarImage.classList.add('img-fluid', 'rounded-circle', 'm-2', 'avatar-option');  // Add Bootstrap classes for styling
                avatarImage.style.maxWidth = '75px';  // Limit the image size
                avatarImage.style.cursor = 'pointer';  // Make it clickable

                // Append the image to the modal body
                modalBody.appendChild(avatarImage);

                // Add a click event listener to each image (if you want to change the user's avatar)
                avatarImage.addEventListener('click', () => {
                    console.log(`Selected avatar: ${avatar.imageName}`);

                    // Reset the border of all avatars in the modal
                    const allAvatars = document.querySelectorAll('#avatarModal .avatar-option');
                    allAvatars.forEach(img => {
                        img.style.border = '';  // Remove border from all avatars
                    });

                    // Highlight the selected avatar
                    avatarImage.style.border = '5px solid #d4a373';  // Highlight the selected avatar
                    selectedAvatar = avatar.imageName;  // Store the selected avatar image name
                });
            });
        })
        .catch((error) => console.error('Error fetching profile pictures:', error));
}


// Helper to capitalize the first letter of a field
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to show the old password verification modal
function showVerifyPasswordModal() {
    const verifyModal = new bootstrap.Modal(document.getElementById('verifyPasswordModal'));
    verifyModal.show();
}

// Function to close the old password verification modal
function hideVerifyPasswordModal() {
    const verifyModal = new bootstrap.Modal(document.getElementById('verifyPasswordModal'));
    verifyModal.hide();
}


// Function to load the navbar into the profile.html
window.addEventListener('DOMContentLoaded', () => {

    // Determine which navbar to load based on userRole
    const userRole = localStorage.getItem("userRole");
    const isTutor = localStorage.getItem("isTutor");

    let navbarPath = "../navbar.html"; // Default navbar

    if (userRole === "ADMIN") {
        navbarPath = "../adminNavbar.html";
    } else if (isTutor === "true") { // Check if the user is a tutor
        navbarPath = "../tutorNavbar.html";
    }
    // const navbarPath = userRole === "ADMIN" ? "../adminNavbar.html" : "../navbar.html";

    // Load the navbar
    fetch(navbarPath)
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('navbar-container').innerHTML = html;
        })
        .catch((error) => console.error('Error loading navbar:', error));

    // Fetch user profile data
    fetchUserProfile();
    fetchAllProfilePictures();
});

// Attach them to the window object
window.capitalize = capitalize;
window.showVerifyPasswordModal = showVerifyPasswordModal;
window.hideVerifyPasswordModal = hideVerifyPasswordModal;
window.selectedAvatar = selectedAvatar;
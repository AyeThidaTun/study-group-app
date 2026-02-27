
// Check if user is logged in and not an admin
if (!localStorage.getItem('token') || localStorage.getItem('userRole') !== 'ADMIN') {
    console.log('User is not admin')
    window.location.href = '/login.html'; // Redirect to login page
}


// Function to handle logout
async function logout() {
    try {
        // Send a fetch request to update the user's status to OFFLINE
        // Note: This does not support firefox browser
        const response = await fetch('/users/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token for authentication
            },
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to logout:', error.message);
            return;
        }

        console.log('User successfully logged out');
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        // Clear the authentication token from localStorage
        localStorage.clear();

        // Redirect the user to the login page
        window.location.href = '/login.html';
    }
}

let inactivityTimer;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 mins of inactivity before the user is logged out

// Function to update the user's last activity timestamp on the server
function updateLastActivity() {
    fetch('/users/last-activity', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ lastActivity: new Date().toISOString() }),
    }).catch((err) => console.error('Error updating last activity:', err));
}

// Throttle function to limit the frequency of updates
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// Attach event listeners for user interaction with throttling
function monitorUserActivity() {
    const throttledUpdate = throttle(updateLastActivity, 5000); // 5 seconds
    document.addEventListener('mousemove', throttledUpdate);
    document.addEventListener('keypress', throttledUpdate);

    // Reset inactivity timer on any user activity
    resetInactivityTimer();
}

// Function to reset inactivity timer
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logout, INACTIVITY_TIMEOUT); // Set to logout after 1 minute
}

// Start monitoring user activity
monitorUserActivity();
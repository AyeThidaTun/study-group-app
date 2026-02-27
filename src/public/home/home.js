/* eslint-disable no-undef */
/* 

    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
	
*/


const apiUrl = '/users';

// Updated retrieveUserCount function to call the /count route
function retrieveUserCount() {
    // const userId = parseInt(localStorage.getItem('userId')); // Fetch logged-in user's ID
    fetch(`${apiUrl}/count`)
        .then((response) => response.json())
        .then((data) => {
            const userCount = data.userCount;
            console.log(`Total number of users: ${userCount}`);
            
            // Update the UI with the user count
            const userCountElement = document.getElementById('userCount');
            userCountElement.innerHTML = `
            <p class="text-center h1 title">Total number of users</p>
                <div class="userCount-container text-center">
                    <p class="userCount-number display-1">${userCount}</p>
                </div>`;
        })
        .catch((error) => console.error('Error fetching user count:', error));
}



// Function to retrieve the top 5 users by points and render a bar chart
function retrieveTopUsers() {
    fetch(`${apiUrl}/topUsers`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data, 'data');
            const topUsers = data;
            
            // Prepare data for the bar chart
            const userNames = topUsers.map(user => user.name);
            const userPoints = topUsers.map(user => user.points);

            // Define custom colors
            const backgroundColors = [
                'rgba(204, 213, 174, 0.6)', // CCD5AE
                'rgba(233, 237, 201, 0.6)', // E9EDC9
                'rgba(254, 250, 224, 0.6)', // FEFAE0
                'rgba(250, 237, 205, 0.6)', // FAEDCD
                'rgba(212, 163, 115, 0.6)'  // D4A373
            ];

            const borderColors = [
                'rgba(172, 181, 144, 1)', // Darker version of CCD5AE
                'rgba(203, 207, 171, 1)', // Darker version of E9EDC9
                'rgba(224, 220, 194, 1)', // Darker version of FEFAE0
                'rgba(220, 207, 175, 1)', // Darker version of FAEDCD
                'rgba(182, 133, 85, 1)'   // Darker version of D4A373
            ];

            // Render chart using Chart.js
            const ctx = document.getElementById('topUsersChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: userNames,
                    datasets: [{
                        label: 'Points',
                        data: userPoints,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch((error) => console.error('Error fetching top users:', error));
}


// Function to fetch quiz completion trends from the server
function fetchQuizCompletionTrends(timeInterval = 'week') {
    fetch(`${apiUrl}/quizCompletionTrends?timeInterval=${timeInterval}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Completion Trends:', data);
        renderQuizTrendsChart(data);
      })
      .catch((error) => console.error('Error fetching completion trends:', error));
}

// Function to render the quiz trends chart using Chart.js
function renderQuizTrendsChart(data) {
    const ctx = document.getElementById('quizTrendsChart').getContext('2d');
    console.log(data, "data");

    // Check if a chart already exists with the same ID, and destroy it if necessary
    if (Chart.getChart('quizTrendsChart')) {
        Chart.getChart('quizTrendsChart').destroy(); // Destroy existing chart before creating a new one
    }

    // Format intervals to display as YYYY-MM-DD
    const labels = data.map((d) => {
        const date = new Date(d.interval);
        return date.toISOString().split('T')[0]; // Extracts the date part (YYYY-MM-DD)
    });

    const values = data.map((d) => d.completedQuizzes); // Y-axis: Number of completions
  
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Quizzes Completed',
            data: values,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: { display: true, text: 'Time Interval' },
          },
          y: {
            title: { display: true, text: 'Number of Completed Quizzes' },
            beginAtZero: true,
          },
        },
      },
    });
}

// Function to update quiz trends chart based on selected time interval
function updateQuizTrends(timeInterval) {
    fetchQuizCompletionTrends(timeInterval); // Call the fetch function with the selected time interval
}
  



// Initialize the page
document.addEventListener('DOMContentLoaded', () => {

    // Load the navbar
    fetch('../navbar.html')
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('navbar-container').innerHTML = html;
        })
        .catch((error) => console.error('Error loading navbar:', error));


    // Call functions to populate data on page load
    retrieveUserCount();
    retrieveTopUsers();
    fetchQuizCompletionTrends(); // Fetch data for default time interval
});

// Attach them to the window object
window.updateQuizTrends = updateQuizTrends;

/* 

    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
	
*/

const apiUrl = '/quizzes';

// Function to retrieve schools for the quiz and display them in cards
function retrieveSchoolsForQuiz() {
    fetch(`${apiUrl}/school`)
        .then((response) => response.json())
        .then((data) => {
            const schools = data; // Assuming the data is an array of schools
            const schoolContainer = document.getElementById('school');

            // Loop through schools and create a card for each one
            schools.forEach((school) => {
                const schoolCard = document.createElement('div');
                schoolCard.classList.add('col-12', 'col-md-4', 'mb-4');
                schoolCard.innerHTML = `
                    <a class="card1 h-75" href="/quiz/chooseModuleForQuiz.html?schoolId=${school.id}&schoolName=${encodeURIComponent(school.fullName)}">
                        <h5 class="card-title">${school.fullName} (${school.shortName})</h5>
                        <div class="go-corner">
                            <div class="go-arrow">→</div>
                        </div>
                    </a>
                `;
                schoolContainer.appendChild(schoolCard);
            });
        })
        .catch((error) => console.error('Error fetching schools:', error));
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

    // Call function to populate data on page load
    retrieveSchoolsForQuiz();
});

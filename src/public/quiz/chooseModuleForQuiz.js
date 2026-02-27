/* 

    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT1B09
	
*/

const apiUrl = '/quizzes';

const urlParams = new URLSearchParams(window.location.search);
const schoolName = urlParams.get('schoolName') || 'Unknown School';
const schoolId = urlParams.get('schoolId');

// Function to retrieve modules for a selected school and display them in cards
function retrieveModulesForQuiz(query = '') {
    if (!schoolId) {
        console.error('schoolId is missing in the URL.');
        return;
    }

    // Fetch modules filtered by schoolId and optional search query
    fetch(`${apiUrl}/module/?schoolId=${schoolId}&search=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((modules) => {
            const moduleContainer = document.getElementById('modules');
            moduleContainer.innerHTML = ''; // Clear previous modules

            console.log('Modules:', modules);

            if (modules.length === 0) {
                // Display a message if no modules match the search
                moduleContainer.innerHTML = `
                    <div class="col-12 text-center my-5">
                        <div class="card1 h-75">
                            <h5 class="card-title">No modules found</h5>
                        </div>
                    </div>
                `;
            } else {
                // Populate the module cards
                modules.forEach((module) => {
                    const moduleCard = document.createElement('div');
                    moduleCard.classList.add('col-12', 'col-md-4', 'mb-4');
                    moduleCard.innerHTML = `
                        <a class="card1 h-75" href="/quiz/chooseQuizForModule.html?modCode=${module.modCode}&modName=${encodeURIComponent(module.modName)}&schoolId=${schoolId}&schoolName=${encodeURIComponent(schoolName)}">
                            <h5 class="card-title">${module.modCode}</h5>
                            <p class="card-text">${module.modName}</p>
                            <div class="go-corner">
                                <div class="go-arrow">→</div>
                            </div>
                        </a>
                    `;
                    moduleContainer.appendChild(moduleCard);
                });
            }
        })
        .catch((error) => console.error('Error fetching modules:', error));
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set dynamic breadcrumb
    const currentSchoolBreadcrumb = document.getElementById('current-school');
    currentSchoolBreadcrumb.textContent = `${schoolName} > Choose Module`;

    // Load the navbar
    fetch('../navbar.html')
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('navbar-container').innerHTML = html;
        })
        .catch((error) => console.error('Error loading navbar:', error));

    // Populate initial data
    retrieveModulesForQuiz();

    // Add search functionality
    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('input', (event) => {
        const query = event.target.value.trim();
        retrieveModulesForQuiz(query); // Fetch filtered data
    });
});


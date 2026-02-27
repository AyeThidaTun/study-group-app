document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const navbar = document.querySelector('.navbar');
  
    if (!darkModeToggle || !navbar) {
      console.error('Dark mode toggle or navbar not found!');
      return;
    }
  
    // Function to enable/disable dark mode
    function toggleDarkMode(enable) {
      if (enable) {
        document.body.classList.add('dark-mode');
        navbar.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
        navbar.classList.remove('dark-mode');
      }
    }
  
    // Load saved dark mode state
    const darkModeState = localStorage.getItem('darkMode');
    if (darkModeState === 'enabled') {
      toggleDarkMode(true);
    }
  
    // Toggle dark mode on button click
    darkModeToggle.addEventListener('click', () => {
      console.log('Dark mode toggle clicked!'); // Debug statement
      const isDarkMode = document.body.classList.contains('dark-mode');
      toggleDarkMode(!isDarkMode);
      localStorage.setItem('darkMode', isDarkMode ? 'disabled' : 'enabled');
    });
  });
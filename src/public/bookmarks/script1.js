document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch and display all bookmarks for the user
    function fetchBookmarks() {
      fetch('/bookmarks', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
        },
      })
        .then(response => response.json())
        .then(bookmarks => {
          displayBookmarks(bookmarks);
        })
        .catch(error => {
          console.error('Error fetching bookmarks:', error);
        });
    }
  
    // Function to display bookmarks in the UI
    function displayBookmarks(bookmarks) {
      const bookmarksContainer = document.getElementById('bookmarks-list');
      bookmarksContainer.innerHTML = ''; // Clear the container before rendering new data
  
      bookmarks.forEach(bookmark => {
        const bookmarkElement = document.createElement('div');
        bookmarkElement.classList.add('bookmark');
        bookmarkElement.innerHTML = `
          <div class="bookmark-info">
            <h3>${bookmark.resource.title}</h3>
            <p>${bookmark.resource.description}</p>
          </div>
          <div class="bookmark-status">
            <select id="status-${bookmark.id}" class="status-dropdown">
              <option value="UNREAD" ${bookmark.status === 'UNREAD' ? 'selected' : ''}>Unread</option>
              <option value="READING" ${bookmark.status === 'READING' ? 'selected' : ''}>Reading</option>
              <option value="FINISHED" ${bookmark.status === 'FINISHED' ? 'selected' : ''}>Finished</option>
            </select>
            <button onclick="deleteBookmark(${bookmark.id})">Delete</button>
          </div>
        `;
        bookmarksContainer.appendChild(bookmarkElement);
  
        // Attach event listener for the status dropdown
        const statusDropdown = document.getElementById(`status-${bookmark.id}`);
        statusDropdown.addEventListener('change', (event) => {
          const newStatus = event.target.value;
          updateBookmarkStatus(bookmark.id, newStatus);
        });
      });
    }
  
    // Function to update bookmark status
    function updateBookmarkStatus(bookmarkId, newStatus) {
      fetch(`/bookmarks/${bookmarkId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
        },
        body: JSON.stringify({ status: newStatus }),
      })
        .then(response => response.json())
        .then(updatedBookmark => {
          console.log('Bookmark status updated:', updatedBookmark);
          fetchBookmarks(); // Re-fetch the bookmarks to show updated status
        })
        .catch(error => {
          console.error('Error updating bookmark status:', error);
        });
    }
  
    // Function to delete a bookmark
    // function deleteBookmark(bookmarkId) {
    //   fetch(`/bookmarks/${bookmarkId}`, {
    //     method: 'DELETE',
    //     headers: {
    //       'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
    //     },
    //   })
    //     .then(response => response.json())
    //     .then(deletedBookmark => {
    //       console.log('Bookmark deleted:', deletedBookmark);
    //       fetchBookmarks(); // Re-fetch the bookmarks after deletion
    //     })
    //     .catch(error => {
    //       console.error('Error deleting bookmark:', error);
    //     });
    // }
  
    // Function to create a bookmark
    function createBookmark(resourceId) {
      fetch('/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
        },
        body: JSON.stringify({ resourceId }),
      })
        .then(response => response.json())
        .then(bookmark => {
          console.log('Bookmark created:', bookmark);
          fetchBookmarks(); // Re-fetch bookmarks after adding a new one
        })
        .catch(error => {
          console.error('Error creating bookmark:', error);
        });
    }
  
    // Attach event listener to the form or button to create a bookmark
    document.getElementById('create-bookmark-button').addEventListener('click', () => {
      const resourceId = document.getElementById('resource-id-input').value;
      if (resourceId) {
        createBookmark(resourceId);
      }
    });
  
    // Initial fetch when the page loads
    fetchBookmarks();
  });
  
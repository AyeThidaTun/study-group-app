const resourceId = 1; // Replace with dynamic value if necessary

// Function to fetch resource details
async function fetchResourceDetails(resourceId) {
  try {
    const response = await fetch(`/resources/Res/${resourceId}`);
    const resource = await response.json();

    // Populate the resource details
    document.getElementById('resource-title').innerText = resource.title;
    document.getElementById('resource-creator').innerText = `Created by: ${resource.User.name}`;
    document.getElementById('resource-description').innerText = resource.description;
    document.getElementById('bookmark-info').innerText = `Bookmarked by ${resource.bookmark.length} users`;

    // Add tags
    const tagsContainer = document.getElementById('tags');
    tagsContainer.innerHTML = ''; // Clear previous tags
    resource.resourceTag.forEach((tagObj) => {
      const tagElement = document.createElement('span');
      tagElement.classList.add('tag');
      tagElement.textContent = tagObj.tag.name;
      tagsContainer.appendChild(tagElement);
    });

    // Attach actions
    document.getElementById('start-reading').onclick = () => updateBookmarkStatus(resource.id, 'READING');
    document.getElementById('remove').onclick = () => deleteBookmark(resource.id);
  } catch (error) {
    console.error('Error fetching resource:', error);
  }
}

// Function to update bookmark status
async function updateBookmarkStatus(resourceId, status) {
  try {
    const response = await fetch(`/bookmarks/${resourceId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      alert('Bookmark status updated successfully!');
    } else {
      alert('Failed to update bookmark status.');
    }
  } catch (error) {
    console.error('Error updating bookmark status:', error);
  }
}

// Function to delete a bookmark
async function deleteBookmark(resourceId) {
  try {
    const response = await fetch(`/bookmarks/${resourceId}`, { method: 'DELETE' });

    if (response.ok) {
      alert('Bookmark removed successfully!');
    } else {
      alert('Failed to remove bookmark.');
    }
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
}

// Fetch and display the resource details
fetchResourceDetails(resourceId);

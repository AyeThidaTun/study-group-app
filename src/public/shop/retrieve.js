/* eslint-disable no-undef */
/* 
    Name: Isaac Kwok
    Admin No: p2317665
    Class: DIT2B22
*/

const apiUrl = '/shop'; // Base API URL
 
// Function to retrieve all products and display them in the shop
function fetchAllProducts() {
    console.log('Fetching all Products for shop...');

    // Get filter values
    const sortValue = document.querySelector('input[name="sort"]:checked')?.value || "";
    const categoryValues = [...document.querySelectorAll('input[name="category"]:checked')].map(cb => cb.value);
    const statusValues = [...document.querySelectorAll('input[name="status"]:checked')].map(cb => cb.value);

    console.log('categoryValues', categoryValues);
    
    // Construct query params
    const params = new URLSearchParams();
    if (sortValue) params.append("sort", sortValue);
    if (categoryValues) params.append("categories", categoryValues);
    if (statusValues) params.append("status", statusValues);

    // Fetch with filters
    fetch(`${apiUrl}/products?${params.toString()}`, { // Ensure your backend supports filtering
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    })
    .then(response => response.json())
    .then(products => {
        const shopContainer = document.getElementById('shop-container');
        shopContainer.innerHTML = ''; // Clear existing content

        if (products.length === 0) {
            shopContainer.innerHTML = `<div class="alert alert-warning">No products found.</div>`;
            return;
        }

        console.log('Fetched products:', products);

        products.forEach(product => {
            // Skip products that are NOT_RELEASED
            if (product.status === "NOT_RELEASED") {
                return;
            }
    
            const buyButton = product.stock > 0 
                ? `<button class="btn btn-primary buy-btn" data-id="${product.productId}" data-name="${product.name}"
                     data-price="${product.price}" data-stock="${product.stock}" data-image="${product.image}">Buy</button>`
                : `<span class="badge bg-danger">Sold Out</span>`;
    
            const productCard = `
                <div class="card shadow-sm m-3" style="width: 18rem;">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description || "No description available."}</p>
                        <p class="card-text"><strong>Category:</strong> ${product.category}</p>
                        <p class="card-text"><strong>Price:</strong> ${product.price} Points</p>
                        <p class="card-text"><strong>Stock:</strong> ${product.stock > 0 ? product.stock : "Sold Out"}</p>
                        <p class="card-text"><strong>Number Sold:</strong> ${product.numberSold}</p>
                        ${buyButton} <!-- Buy button or Sold Out tag -->
                    </div>
                </div>
            `;
            shopContainer.innerHTML += productCard;
        });

        // Add event listeners for all Buy buttons
        document.querySelectorAll('.buy-btn').forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.getAttribute('data-id');
                const productName = this.getAttribute('data-name');
                const productPrice = this.getAttribute('data-price');
                const productStock = parseInt(this.getAttribute('data-stock'));
                const productImage = this.getAttribute('data-image');

                if (productStock <= 0) {
                    showAlertModal("This product is sold out!");
                    return;
                }

                showPurchaseModal(productId, productName, productPrice, productStock, productImage);
            });
        });
    })
    .catch(error => console.error('Error fetching products:', error));
}

// Attach event listeners for real-time filtering
document.querySelectorAll('input[name="sort"], input[name="category"], input[name="status"]').forEach(filter => {
    filter.addEventListener('change', fetchAllProducts);
});

// Initial fetch when page loads
fetchAllProducts();


// Function to fetch and display user points
function fetchUserPoints() {
    console.log('Fetching user points...');

    fetch(`${apiUrl}/user/points`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched data:", data); // Log full data response

            if (data && typeof data.points === 'number') {  // Ensure points exist
                const pointsContainer = document.getElementById('points-container');
                pointsContainer.innerHTML = ''; // Clear existing content
                pointsContainer.innerHTML = `
                    <div class="points-display d-flex align-items-center">
                        <span class="badge bg-brown fs-4">${data.points} Points
                        </span>
                        <img src="../images/points.gif" alt="User Image" class="rounded-circle me-2" width="50" height="50">
                    </div>
            `;
            } else {
                console.error('Unexpected data format:', data);
            }
        })
        .catch(error => console.error('Error fetching user points:', error));
}

document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', function () {
        const productId = this.getAttribute('data-id');
        const productName = this.getAttribute('data-name');
        const productPrice = parseInt(this.getAttribute('data-price'));
        const productStock = parseInt(this.getAttribute('data-stock'));
        const productImage = this.parentElement.parentElement.querySelector("img").src;

        if (productStock <= 0) {
            showAlertModal("This product is sold out!");
            return;
        }

        showPurchaseModal(productId, productName, productPrice, productImage);
    });
});



function confirmPurchase(productId, productName, quantity, productPrice) {
    fetch(`${apiUrl}/user/points`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const userPoints = data.points;
        const totalCost = quantity * productPrice;

        if (userPoints < totalCost) {
            showAlertModal("You do not have enough points!");
            return;
        }

        // Proceed with purchase
        fetch(`${apiUrl}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ productId, quantity })
        })
        .then(response => response.json())
        .then(result => {
            console.log("resulkt", result);
            if (result.success) {
                showAlertModal(`Successfully purchased ${quantity} x ${productName}!`);
                fetchUserPoints(); // Refresh user points
                fetchAllProducts(); // Refresh product availability
                bootstrap.Modal.getInstance(document.getElementById('purchaseModal')).hide();
            } else {
                showAlertModal(result.message || "Purchase failed.");
            }
        })
        .catch(error => console.error('Error processing purchase:', error));
    })
    .catch(error => console.error('Error fetching user points:', error));
}

function showPurchaseModal(productId, productName, productPrice, productStock, productImage) {
    const modal = new bootstrap.Modal(document.getElementById('purchaseModal'));

    console.log("productImage", productImage);

    document.getElementById('modalProductImage').src = productImage;
    document.getElementById('modalProductName').textContent = productName;
    document.getElementById('modalProductPrice').textContent = productPrice;
    document.getElementById('modalTotalPoints').textContent = productPrice;
    document.getElementById('modalStockLeft').textContent = productStock - 1; // Default display

    const quantityInput = document.getElementById('quantityInput');
    quantityInput.value = 1;
    quantityInput.max = productStock; // Ensure correct stock limit

    // ✅ Remove old event listener before adding a new one
    quantityInput.replaceWith(quantityInput.cloneNode(true));
    
    const newQuantityInput = document.getElementById('quantityInput');

    newQuantityInput.addEventListener('input', () => {
        const value = newQuantityInput.value.trim();

        // Ensure input is a number
        if (!/^\d+$/.test(value)) {
            newQuantityInput.value = "1";  // Reset to default
        }

        let quantity = parseInt(newQuantityInput.value) || 1;

        // Prevent values outside allowed range
        if (quantity > productStock) {
            quantity = productStock;
        } else if (quantity < 1) {
            quantity = 1;
        }

        newQuantityInput.value = quantity;
        document.getElementById('modalTotalPoints').textContent = quantity * productPrice;
        document.getElementById('modalStockLeft').textContent = productStock - quantity;
    });

    document.getElementById('confirmPurchaseBtn').onclick = function () {
        const quantity = parseInt(newQuantityInput.value);
        confirmPurchase(productId, productName, quantity, productPrice);
    };

    modal.show();
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

// Load shop products and user points when page loads
window.addEventListener('DOMContentLoaded', () => {
    fetchAllProducts();
    fetchUserPoints();
});
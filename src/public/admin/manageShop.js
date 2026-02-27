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
            const productCard = `
                <div class="card shadow-sm m-3" style="width: 18rem;">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description || "No description available."}</p>
                        <p class="card-text"><strong>Category:</strong> ${product.category}</p>
                        <p class="card-text"><strong>Price:</strong> ${product.price} Points</p>
                        <p class="card-text">
                        <strong>Stock:</strong> 
                        ${product.status === "NOT_RELEASED" ? "Not Released" : product.stock > 0 ? product.stock : "Sold Out"}
                        </p>
                        <p class="card-text"><strong>Number Sold:</strong> ${product.numberSold}</p>
                       <p class="card-text">
                            <strong>Status:</strong> 
                            ${product.status === "IN_STOCK" 
                                ? '<span class="badge bg-success">In Stock</span>' 
                                : product.status === "SOLD_OUT" 
                                ? '<span class="badge bg-danger">Sold Out</span>' 
                                : product.status === "NOT_RELEASED" 
                                ? '<span class="badge bg-secondary">Unreleased</span>' 
                                : '<span class="badge bg-warning">Unknown</span>'}
                        </p>
                        <button class="btn btn-primary buy-btn" data-id="${product.productId}" data-name="${product.name}"
                         data-price="${product.price}" data-stock="${product.stock}" data-image="${product.image}">Buy</button><br><br>
                         <label for="stock-input-${product.productId}" class="mt- 5 form-label">Update Stock:</label>
                               <input type="number" id="stock-input-${product.productId}" class="form-control stock-input" 
                               data-id="${product.productId}" min="0" value="${product.stock}">
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

        // Add event listeners for stock input fields (Admin only)
        document.querySelectorAll('.stock-input').forEach(input => {
            input.addEventListener('input', function () {
                const productId = this.getAttribute('data-id');
                const newStock = parseInt(this.value);

                if (newStock < 0 || isNaN(newStock)) return; // Prevent invalid values

                updateStock(productId, newStock);
            });
        });
    })
    .catch(error => console.error('Error fetching products:', error));
}

// Function to update stock in the backend
function updateStock(productId, newStock) {
    fetch(`${apiUrl}/admin/updateStock`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ productId, stock: newStock })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlertModal(`Stock updated successfully for product ${productId}`);
            fetchAllProducts(); // Refresh product list. Mainly for status update
            fetchUserPoints();
        } else {
            console.error('Failed to update stock:', data.message);
            showAlertModal(`Error: ${data.message}`);
        }
    })
    .catch(error => console.error('Error updating stock:', error));
}



// Handle form submission
document.getElementById("submitProduct").addEventListener("click", () => {
    // Get input values
    const name = document.getElementById("productName").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const category = document.getElementById("productCategory").value;
    const price = document.getElementById("productPrice").value.trim();
    const image = document.getElementById("productImage").files[0];

    let isValid = true;

    // Name Validation
    if (name === "") {
        document.getElementById("nameError").classList.remove("d-none");
        isValid = false;
    } else {
        document.getElementById("nameError").classList.add("d-none");
    }

    // Description Validation
    if (description === "") {
        document.getElementById("descriptionError").classList.remove("d-none");
        isValid = false;
    } else {
        document.getElementById("descriptionError").classList.add("d-none");
    }

    // Category Validation
    if (category === "") {
        document.getElementById("categoryError").classList.remove("d-none");
        isValid = false;
    } else {
        document.getElementById("categoryError").classList.add("d-none");
    }

    // Price Validation
    if (price === "" || isNaN(price) || parseFloat(price) <= 0) {
        document.getElementById("priceError").classList.remove("d-none");
        isValid = false;
    } else {
        document.getElementById("priceError").classList.add("d-none");
    }

    // Image Validation (only allow .png, .jpg, .jpeg, .webp)
    if (!image) {
        document.getElementById("imageError").innerText = "Please select an image.";
        document.getElementById("imageError").classList.remove("d-none");
        isValid = false;
    } else {
        const validExtensions = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        if (!validExtensions.includes(image.type)) {
            document.getElementById("imageError").innerText = "Only .png, .jpg, .jpeg, and .webp files are allowed.";
            document.getElementById("imageError").classList.remove("d-none");
            isValid = false;
        } else {
            document.getElementById("imageError").classList.add("d-none");
        }
    }

    // If all fields are valid, proceed with submission
    if (isValid) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("price", price);
        formData.append("image", image);
        formData.append("stock", 0);

        // Simulate API call (Replace with actual fetch request)
        fetch(`${apiUrl}/admin/products`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            body: formData,
        })
        .then(async response => {
            const responseData = await response.json(); // Try parsing JSON response
        
            if (!response.ok) {
                // Throw backend-provided message if available, else use generic error
                throw new Error(responseData.message || `Error: ${response.status} - ${response.statusText}`);
            }
        
            return responseData;
        })
        .then(data => {
            console.log("Product added:", data);
            if (data.success) {
                showAlertModal("Product added successfully!");
                document.getElementById("addProductForm").reset();
                document.getElementById("addProductModal").classList.remove("show");
                fetchAllProducts();
                window.location.reload();
            } else {
                throw new Error(data.message || "Unknown error occurred.");
            }
        })
        .catch(error => {
            console.error("Error adding product:", error);
            showAlertModal(`Failed to add product: ${error.message}`);
        });
    }
});



// Attach event listeners for real-time filtering
document.querySelectorAll('input[name="sort"], input[name="category"], input[name="status"]').forEach(filter => {
    filter.addEventListener('change', fetchAllProducts);
});



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
        // Load the navbar
        fetch('../adminNavbar.html')
        .then((response) => response.text())
        .then((html) => {
            document.getElementById('navbar-container').innerHTML = html;
        })
        .catch((error) => console.error('Error loading navbar:', error));

    fetchAllProducts();
    fetchUserPoints();
});
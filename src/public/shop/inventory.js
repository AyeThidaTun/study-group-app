/* eslint-disable no-undef */
const apiUrl = '/shop'; // Base API URL

// Function to fetch user inventory and display it
function fetchUserInventory() {
    console.log('Fetching user inventory...');

    fetch(`${apiUrl}/user/inventory`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    })
    .then(response => response.json())
    .then(inventoryData => {
        console.log('User inventory:', inventoryData);
        const unredeemedContainer = document.getElementById('unredeemed-container');
        const redeemedContainer = document.getElementById('redeemed-container');

        // Clear existing content
        unredeemedContainer.innerHTML = '';
        redeemedContainer.innerHTML = '';

        // Function to create a product card
        function createProductCard(item) {
            return `
                <div class="col-lg-4 col-md-6 col-12">
                    <div class="card shadow-sm m-3">
                        <img src="${item.image}" class="card-img-top" alt="${item.name}">
                        <div class="card-body">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text">${item.description || "No description available."}</p>
                            <p class="card-text"><strong>Quantity:</strong> ${item.quantity}</p>
                            <p class="card-text"><strong>Purchased At:</strong> ${new Date(item.purchasedAt).toLocaleString()}</p>
                            ${!item.redeemed 
                                ? `<button class="btn btn-success redeem-btn" data-id="${item.inventoryId}">Redeem</button>` 
                                : `<span class="badge bg-secondary">Redeemed</span>`}
                        </div>
                    </div>
                </div>
            `;
        }        

        // Populate unredeemed items
        if (inventoryData.unredeemed.length > 0) {
            inventoryData.unredeemed.forEach(item => {
                unredeemedContainer.innerHTML += createProductCard(item);
            });
        } else {
            unredeemedContainer.innerHTML = `
                <div class="alert alert-info text-center m-3" role="alert">
                    You have no unredeemed items.
                </div>
            `;
        }

        // Populate redeemed items
        if (inventoryData.redeemed.length > 0) {
            inventoryData.redeemed.forEach(item => {
                redeemedContainer.innerHTML += createProductCard(item);
            });
        } else {
            redeemedContainer.innerHTML = `
                <div class="alert alert-secondary text-center m-3" role="alert">
                    No redeemed items found.
                </div>
            `;
        }

        // Add event listeners for redeem buttons
        document.querySelectorAll('.redeem-btn').forEach(button => {
            button.addEventListener('click', function () {
                const inventoryId = this.getAttribute('data-id');
                showQRCodeModal(inventoryId);
            });
        });
    })
    .catch(error => console.error('Error fetching user inventory:', error));
}


// Function to show QR code modal for redemption
function showQRCodeModal(inventoryId) {
    // Generate the redemption URL
    const redeemUrl = `${window.location.origin}/shop/redeem.html?inventoryId=${inventoryId}`;

    // Clear the previous QR code
    const qrcodeContainer = document.getElementById("qrcode");
    qrcodeContainer.innerHTML = "";

    // Store the URL as a hidden attribute for Playwright to access
    qrcodeContainer.setAttribute("data-url", redeemUrl);

    // Generate new QR code
    new QRCode(document.getElementById("qrcode"), {
        text: redeemUrl,
        width: 200,
        height: 200
    });

    // Show Bootstrap modal
    const qrCodeModal = new bootstrap.Modal(document.getElementById("qrCodeModal"));
    qrCodeModal.show();
}


// Load user inventory when page loads
window.addEventListener('DOMContentLoaded', () => {
    fetchUserInventory();
});

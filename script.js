document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application based on current page
    if (document.querySelector('.product-grid')) {
        initProductPage();
    } else if (document.getElementById('orders-container')) {
        initOrdersPage();
    }
    
    // Update cart count on all pages
    updateCartCount();
});

function initProductPage() {
    // Set up category filtering
    setupCategoryFiltering();
    
    // Set up quantity controls
    setupQuantityControls();
    
    // Set up buy buttons
    setupBuyButtons();
    
    // Set up prescription modal
    setupPrescriptionModal();
}

function initOrdersPage() {
    // Display orders
    displayOrders();
    
    // Set up order status filtering
    setupOrderStatusFilter();
}

function setupCategoryFiltering() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterProductsByCategory(category);
        });
    });
}

function filterProductsByCategory(category) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        if (category === 'all' || product.getAttribute('data-category') === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function setupQuantityControls() {
    document.querySelectorAll('.quantity-controls').forEach(control => {
        const minusBtn = control.querySelector('.minus');
        const plusBtn = control.querySelector('.plus');
        const quantityInput = control.querySelector('.quantity');
        
        minusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > parseInt(quantityInput.min)) {
                quantityInput.value = value - 1;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value < parseInt(quantityInput.max)) {
                quantityInput.value = value + 1;
            }
        });
    });
}

function setupBuyButtons() {
    const buyButtons = document.querySelectorAll('.buy-btn');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isPrescription = this.getAttribute('data-prescription') === 'true';
            
            if (isPrescription) {
                // Show prescription modal for prescription medicines
                document.getElementById('prescriptionModal').style.display = 'block';
                // Store the product info in a temporary variable
                window.tempProduct = getProductInfo(this);
            } else {
                // Add regular product directly to cart
                addToCart(getProductInfo(this));
            }
        });
    });
}

function getProductInfo(button) {
    const productCard = button.closest('.product-card');
    const quantity = parseInt(productCard.querySelector('.quantity').value);
    
    return {
        id: button.getAttribute('data-id'),
        name: button.getAttribute('data-name'),
        price: parseFloat(button.getAttribute('data-price')),
        prescription: button.getAttribute('data-prescription') === 'true',
        quantity: quantity,
        totalPrice: (parseFloat(button.getAttribute('data-price')) * quantity).toFixed(2),
        date: new Date().toISOString()
    };
}

function setupPrescriptionModal() {
    const modal = document.getElementById('prescriptionModal');
    const closeBtn = modal.querySelector('.close');
    const form = document.getElementById('prescriptionForm');
    
    // Close modal when clicking X
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // In a real app, you would upload the prescription file here
        // For demo, we'll just add the product to cart
        if (window.tempProduct) {
            addToCart(window.tempProduct);
            window.tempProduct = null;
        }
        
        // Close modal
        modal.style.display = 'none';
        alert('Prescription uploaded successfully! Your order has been added to cart.');
    });
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
        // Update quantity if product exists
        cart[existingIndex].quantity += product.quantity;
        cart[existingIndex].totalPrice = (parseFloat(cart[existingIndex].price) * cart[existingIndex].quantity).toFixed(2);
    } else {
        // Add new product to cart
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show confirmation
    alert(`${product.quantity} ${product.name} has been added to your cart!`);
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    let totalItems = 0;
    cart.forEach(item => {
        totalItems += item.quantity;
    });
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function displayOrders() {
    const ordersContainer = document.getElementById('orders-container');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <p>You haven't placed any orders yet.</p>
                <a href="index.html" class="shop-btn">Browse Medicines</a>
            </div>
        `;
        return;
    }
    
    ordersContainer.innerHTML = '';
    
    orders.forEach((order, index) => {
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Determine order status (for demo purposes)
        const statuses = ['processing', 'shipped', 'delivered'];
        const daysPassed = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
        let status = statuses[Math.min(daysPassed, 2)];
        let statusText = status.charAt(0).toUpperCase() + status.slice(1);
        
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.setAttribute('data-status', status);
        orderElement.innerHTML = `
            <div class="order-header">
                <div>
                    <span class="order-id">Order #${1000 + index}</span>
                    <span class="order-date">${formattedDate}</span>
                </div>
                <span class="order-status status-${status}">${statusText}</span>
            </div>
            <div class="order-products">
                <div class="product-row">
                    <span class="product-name">${order.name}</span>
                    <span class="product-quantity">Qty: ${order.quantity}</span>
                    <span class="product-price">$${order.totalPrice}</span>
                </div>
            </div>
            <div class="order-total">
                Total: $${order.totalPrice}
            </div>
        `;
        
        ordersContainer.appendChild(orderElement);
    });
}

function setupOrderStatusFilter() {
    const statusButtons = document.querySelectorAll('.status-btn');
    
    statusButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            statusButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const status = this.getAttribute('data-status');
            filterOrdersByStatus(status);
        });
    });
}

function filterOrdersByStatus(status) {
    const orders = document.querySelectorAll('.order-item');
    
    orders.forEach(order => {
        if (status === 'all' || order.getAttribute('data-status') === status) {
            order.style.display = 'block';
        } else {
            order.style.display = 'none';
        }
    });
    
    // Show "no orders" message if all are filtered out
    const visibleOrders = document.querySelectorAll('.order-item[style="display: block"]');
    const noOrdersMessage = document.querySelector('.no-orders');
    
    if (visibleOrders.length === 0 && noOrdersMessage) {
        noOrdersMessage.style.display = 'block';
    } else if (noOrdersMessage) {
        noOrdersMessage.style.display = 'none';
    }
}

// Checkout function (would be called from a checkout page)
function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Get existing orders or create empty array
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Create new order
    const newOrder = {
        id: Date.now(), // Simple unique ID
        date: new Date().toISOString(),
        items: [...cart], // Copy cart items
        total: cart.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0).toFixed(2)
    };
    
    // Add to orders
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();
    
    // Redirect to orders page
    window.location.href = 'orders.html';
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(checkLocation, showError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    function checkLocation(position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
            .then(response => response.json())
            .then(data => {
                let country = data.address.country;
                if (country !== "Rwanda") {
                    alert("You're not allowed to login from outside Rwanda.");
                } else {
                    document.getElementById("productSection").style.display = "block";
                    showMap(lat, lon);
                }
            })
            .catch(error => {
                console.error("Error fetching location data:", error);
            });
    }

    function showError(error) {
        alert("Unable to retrieve your location.");
    }

    function showMap(lat, lon) {
        let mapFrame = document.getElementById("map");
        mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lon}`;
        document.getElementById("mapContainer").style.display = "block";
    }
}

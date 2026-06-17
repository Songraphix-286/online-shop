// State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('checkoutBtn').addEventListener('click', showCheckout);
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    document.querySelector('.cart-link').addEventListener('click', (e) => {
        e.preventDefault();
        displayCart();
    });
}

// Load Products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Không thể tải sản phẩm. Vui lòng thử lại!');
    }
}

// Display Products
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Không tìm thấy sản phẩm</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">📦</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description || 'Không có mô tả'}</div>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-stock">Kho: ${product.stock} sản phẩm</div>
                <button 
                    class="add-to-cart-btn" 
                    onclick="addToCart(${product.id}, '${product.name}', ${product.price})"
                    ${product.stock <= 0 ? 'disabled' : ''}
                >
                    ${product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Add to Cart
function addToCart(id, name, price) {
    const product = allProducts.find(p => p.id === id);
    if (product && product.stock <= 0) {
        alert('Sản phẩm đã hết hàng');
        return;
    }

    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    alert('✅ Đã thêm vào giỏ hàng!');
}

// Save Cart
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Display Cart
function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSection = document.getElementById('cart');

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">Giỏ hàng trống. Hãy thêm sản phẩm!</div>';
        document.getElementById('checkoutBtn').disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Xóa</button>
            </div>
        `).join('');
        document.getElementById('checkoutBtn').disabled = false;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = formatPrice(total);

    hideAllSections();
    cartSection.classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Update Quantity
function updateQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartCount();
            displayCart();
        }
    }
}

// Remove from Cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    displayCart();
}

// Close Cart Section
function closeSectionCart() {
    document.getElementById('cart').classList.add('hidden');
    document.getElementById('checkout').classList.add('hidden');
    document.getElementById('success').classList.add('hidden');
    window.scrollTo(0, 0);
}

// Show Checkout
function showCheckout() {
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    const checkoutSection = document.getElementById('checkout');
    const orderItems = document.getElementById('orderItems');

    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.name} x${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('orderTotal').textContent = formatPrice(total);

    hideAllSections();
    checkoutSection.classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Back to Cart
function backToCart() {
    displayCart();
}

// Handle Checkout
async function handleCheckout(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                total: total,
                items: cart
            })
        });

        if (!response.ok) throw new Error('Lỗi khi đặt hàng');

        const data = await response.json();

        // Show Success
        document.getElementById('orderId').textContent = data.id;
        hideAllSections();
        document.getElementById('success').classList.remove('hidden');

        // Clear Cart
        cart = [];
        saveCart();
        updateCartCount();

        // Reset Form
        document.getElementById('checkoutForm').reset();

        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Lỗi khi đặt hàng: ' + error.message);
    }
}

// Search Products
function handleSearch(e) {
    const keyword = e.target.value.toLowerCase();
    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        (product.description && product.description.toLowerCase().includes(keyword))
    );
    displayProducts(filtered);
}

// Hide All Sections
function hideAllSections() {
    document.getElementById('cart').classList.add('hidden');
    document.getElementById('checkout').classList.add('hidden');
    document.getElementById('success').classList.add('hidden');
}

// Format Price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}
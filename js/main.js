// State Management
let cart = JSON.parse(localStorage.getItem('ak_organics_cart')) || [];

// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const cartCount = document.querySelector('.cart-count');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    setupMobileMenu();
    setupSmartNavbar();
});

// Smart Navbar (Hide/Show on Scroll)
function setupSmartNavbar() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    const threshold = 100; // Only start hiding after scrolling this much

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > threshold) {
            // Scrolling Down
            navbar.classList.add('navbar-hidden');
        } else {
            // Scrolling Up
            navbar.classList.remove('navbar-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });
}

// Mobile Menu
function setupMobileMenu() {
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navLinks.classList.contains('active') ? '✕' : '☰';
            mobileMenuBtn.textContent = icon;
        });
    }
}

// Cart Functions
function addToCart(productId, size, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === size);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            size: size,
            price: product.prices[size],
            image: product.image,
            quantity: quantity
        });
    }

    saveCart();
    updateCartCount();
    showNotification(`Added ${quantity} x ${product.name} (${size}) to cart`);
}

function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    saveCart();
    updateCartCount();
    // If we are on the cart page, we might want to re-render the cart list
    if (typeof renderCart === 'function') {
        renderCart();
    }
}

function updateQuantity(productId, size, newQuantity) {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (item) {
        item.quantity = parseInt(newQuantity);
        if (item.quantity <= 0) {
            removeFromCart(productId, size);
        } else {
            saveCart();
            updateCartCount();
            if (typeof renderCart === 'function') {
                renderCart();
            }
        }
    }
}

function saveCart() {
    localStorage.setItem('ak_organics_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getShippingCost() {
    const total = getCartTotal();
    if (total === 0) return 0;
    return total > 999 ? 0 : 50;
}

function getFinalTotal() {
    return getCartTotal() + getShippingCost();
}

// Utility: Simple Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Add styles dynamically if not in CSS
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        zIndex: '2000',
        animation: 'slideIn 0.3s ease'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Formatting
function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN');
}

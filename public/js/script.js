/**
 * QuickBite – Main JavaScript (Node.js API version)
 * Handles: Cart AJAX, Category Filters, Search, Navbar, Animations, Toasts, Auth
 */

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/* ============================================================
   NAVBAR – Scroll effect & hamburger
   ============================================================ */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
});

hamburger?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
    hamburger.classList.toggle('active');
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = spans[2].style.transform = '';
        spans[1].style.opacity = '';
    }
});

/* ============================================================
   TOAST NOTIFICATION SYSTEM
   ============================================================ */
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

/* ============================================================
   CART BADGE UPDATE
   ============================================================ */
function updateCartBadge(count) {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    badge.textContent = count;
    if (count > 0) {
        badge.classList.remove('hidden');
        badge.style.animation = 'none';
        requestAnimationFrame(() => { badge.style.animation = 'popIn 0.3s ease'; });
    } else {
        badge.classList.add('hidden');
    }
}

/* ============================================================
   ADD TO CART (Node.js API)
   ============================================================ */
function addToCart(foodId, btn) {
    fetch('/api/cart/add', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify({ food_id: foodId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message || 'Added to cart!', 'success');
                updateCartBadge(data.cart_count);
                if (btn) {
                    btn.classList.add('added');
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        btn.classList.remove('added');
                        btn.innerHTML = '<i class="fas fa-plus"></i>';
                    }, 1500);
                }
            } else if (data.redirect) {
                showToast(data.message || 'Please login to continue.', 'info');
                setTimeout(() => window.location.href = data.redirect, 1500);
            } else {
                showToast(data.message || 'Something went wrong', 'error');
            }
        })
        .catch(() => showToast('Network error. Please try again.', 'error'));
}

/* ============================================================
   CART PAGE – Quantity Controls (Node.js API)
   ============================================================ */
function updateQuantity(cartId, change) {
    fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify({ cart_id: cartId, change })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                updateCartBadge(data.cart_count);
                refreshCartUI(data);
            } else {
                showToast(data.message || 'Error updating cart', 'error');
            }
        });
}

function removeFromCart(cartId) {
    if (!confirm('Remove this item from cart?')) return;
    fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify({ cart_id: cartId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const row = document.getElementById(`cart-row-${cartId}`);
                if (row) {
                    row.style.animation = 'slideOut 0.3s ease forwards';
                    setTimeout(() => { row.remove(); refreshCartUI(data); }, 300);
                }
                updateCartBadge(data.cart_count);
                showToast('Item removed from cart', 'info');
            }
        });
}

function refreshCartUI(data) {
    if (data.item_qty !== undefined && data.cart_id) {
        const qtyEl = document.getElementById(`qty-${data.cart_id}`);
        const subtotalEl = document.getElementById(`subtotal-${data.cart_id}`);
        if (qtyEl) qtyEl.textContent = data.item_qty;
        if (subtotalEl) subtotalEl.textContent = '₹' + parseFloat(data.item_subtotal).toFixed(2);
    }
    if (data.cart_total !== undefined) {
        const totalEl = document.getElementById('cartTotal');
        const grandTotalEl = document.getElementById('cartGrandTotal');
        const deliveryCharge = 30;
        if (totalEl) totalEl.textContent = '₹' + parseFloat(data.cart_total).toFixed(2);
        if (grandTotalEl) grandTotalEl.textContent = '₹' + (parseFloat(data.cart_total) + (data.cart_count > 0 ? deliveryCharge : 0)).toFixed(2);
    }
    if (data.cart_count === 0) setTimeout(() => location.reload(), 400);
}

/* ============================================================
   FOOD CARD HTML BUILDER (used by index.html and menu.html)
   ============================================================ */
function foodCard(f) {
    const isRestaurantOnline = f.restaurantId && f.restaurantId.isLoggedIn && f.restaurantId.isActive;
    const offlineOverlay = !isRestaurantOnline ? '<div class="offline-overlay">Restaurant Currently Offline</div>' : '';
    const disabledAttr = !isRestaurantOnline ? 'disabled style="background: #cbd5e0; cursor: not-allowed; opacity: 0.6;"' : '';
    const offlineTitle = !isRestaurantOnline ? 'title="Restaurant is offline"' : 'title="Add to Cart"';

    return `
    <div class="food-card-wrapper food-card ${!isRestaurantOnline ? 'offline' : ''}" data-category="${f.category}" data-name="${f.food_name.toLowerCase()}">
        ${offlineOverlay}
        <div class="food-card-img-wrapper">
            <img src="${f.image}" alt="${f.food_name}" class="food-card-img"
                 onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=75'">
            <span class="food-category-tag">${f.category}</span>
        </div>
        <div class="food-card-body">
            <h3 class="food-card-title">${f.food_name}</h3>
            <p class="food-card-desc">${f.description || ''}</p>
            <div class="food-card-footer">
                <div class="food-price">₹${parseFloat(f.price).toFixed(2)}</div>
                <button class="add-to-cart-btn" ${offlineTitle} ${disabledAttr} onclick="addToCart('${f._id}', this)">
                    ${isRestaurantOnline ? '<i class="fas fa-plus"></i>' : '<i class="fas fa-moon"></i>'}
                </button>
            </div>
        </div>
    </div>`;
}

/* ============================================================
   MENU PAGE – Category Filter & Search
   ============================================================ */
function filterFoodCards() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const foodCards = document.querySelectorAll('.food-card-wrapper');
    const searchInput = document.getElementById('searchInput');
    const activeBtn = document.querySelector('.filter-btn.active');
    const activeCategory = activeBtn ? activeBtn.dataset.category : 'All';
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let visibleCount = 0;
    foodCards.forEach(wrapper => {
        const cardCategory = wrapper.dataset.category || '';
        const cardName = wrapper.dataset.name?.toLowerCase() || '';
        const categoryMatch = activeCategory === 'All' || cardCategory === activeCategory;
        const searchMatch = !searchTerm || cardName.includes(searchTerm);
        if (categoryMatch && searchMatch) {
            wrapper.style.display = '';
            wrapper.style.animation = 'fadeInUp 0.35s ease';
            visibleCount++;
        } else {
            wrapper.style.display = 'none';
        }
    });

    const noResults = document.getElementById('noResults');
    if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

function initMenuFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterFoodCards();
        });
    });
    document.getElementById('searchInput')?.addEventListener('input', filterFoodCards);
}

/* ============================================================
   SCROLL ANIMATIONS
   ============================================================ */
function initScrollAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideOut { to{opacity:0;transform:translateX(20px)} }
        .animate-on-scroll { opacity: 0; transform: translateY(24px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
        
        .food-card.offline { filter: grayscale(0.5); position: relative; }
        .offline-overlay {
            position: absolute; top: 0; left: 0; right: 0; height: 160px;
            background: rgba(0,0,0,0.4); color: white; display: flex;
            align-items: center; justify-content: center; font-weight: 700;
            z-index: 10; font-size: 0.9rem; text-transform: uppercase;
            letter-spacing: 1px; pointer-events: none; border-radius: 12px 12px 0 0;
        }
    `;
    document.head.appendChild(style);

    const items = document.querySelectorAll('.food-card, .step-card, .stat-card');
    items.forEach((el, i) => {
        el.style.transitionDelay = `${(i % 4) * 0.08}s`;
        el.classList.add('animate-on-scroll');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

/* ============================================================
   AUTH STATE – Load user info & cart badge on every page
   ============================================================ */
async function initAuth() {
    try {
        const meRes = await fetch('/api/me', {
            headers: getAuthHeaders()
        });
        const me = await meRes.json();

        const authLinks = document.getElementById('authLinks');
        const userMenuWrapper = document.getElementById('userMenuWrapper');
        const userNameNav = document.getElementById('userNameNav');
        const navOrderHistory = document.getElementById('navOrderHistory');

        if (me.loggedIn) {
            if (authLinks) authLinks.style.display = 'none';
            if (userMenuWrapper) userMenuWrapper.style.display = 'block';
            if (userNameNav) userNameNav.textContent = me.user_name;
            if (navOrderHistory) navOrderHistory.style.display = '';

            // Load cart count
            const cartRes = await fetch('/api/cart', {
                headers: getAuthHeaders()
            });
            const cartData = await cartRes.json();
            if (cartData.success) updateCartBadge(cartData.count || 0);
        } else {
            if (authLinks) authLinks.style.display = 'flex';
            if (userMenuWrapper) userMenuWrapper.style.display = 'none';
        }
    } catch (e) {
        // Server might be down
    }
}
function initForms() {
    // Signup
    const signupForm = document.getElementById('signupForm');
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(signupForm);
        const body = Object.fromEntries(formData.entries());
        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                showToast('Registration successful!', 'success');
                setTimeout(() => window.location.href = data.redirect, 1000);
            } else {
                showToast(data.message || 'Signup failed', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    });

    // Login
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const body = Object.fromEntries(formData.entries());
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                showToast('Welcome back!', 'success');
                setTimeout(() => window.location.href = data.redirect, 1000);
            } else {
                showToast(data.message || 'Login failed', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initForms();
    initScrollAnimations();
});

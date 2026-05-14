// Elements
let cartIcon = document.querySelector(".bi-cart");
let heartIcon = document.querySelector(".nav-icons .bi-heart");
let cartCount = document.querySelector(".cart-count");
let wishlistCount = document.querySelector(".wishlist-count");
let cartBox = document.getElementById("cart-window");
let wishlistBox = document.getElementById("wishlist-window");
let paymentPopup = document.getElementById("payment-popup");
let closePaymentBtn = document.querySelector(".close-payment");

// Storage
let cart = [];
let wishlist = [];

// Toast notification function
function showToast(message, type = "success") {
    // Remove existing toast if any
    let existingToast = document.querySelector(".toast-notification");
    if (existingToast) existingToast.remove();
    
    // Create toast element
    let toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === "success" ? "" : ""}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#4CAF50" : "#ff9800"};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        font-family: Arial, sans-serif;
        min-width: 250px;
    `;
    
    // toasts style
    if (!document.querySelector("#toast-styles")) {
        let style = document.createElement("style");
        style.id = "toast-styles";
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .toast-notification {
                cursor: pointer;
            }
            .toast-notification:hover {
                opacity: 0.9;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);

    
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
    
    // Click to dismiss
    toast.onclick = () => {
        toast.style.animation = "slideOut 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    };
}

//  Update badge numbers on the navbar icons
function updateNumbers() {
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;
    wishlistCount.innerText = wishlist.length;
}

// card products description
function getInfo(card) {
    let img = card.querySelector("img").src;
    let text = card.querySelector("p").innerHTML;
    let name = text.split("<br>")[0];
    let priceMatch = text.match(/Price: R([\d,]+)/) || text.match(/Current Price: R([\d,]+)/);
    let price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : 0;
    return { name, price, img };
}

// Give each product an ID
document.querySelectorAll(".section").forEach((card, i) => {
    card.setAttribute("data-id", i);
    card.info = getInfo(card);
});

// ----- CART FUNCTIONS -----
function addToCart(id) {
    let card = document.querySelector(`.section[data-id="${id}"]`);
    let existing = cart.find(item => item.productId == id);
    
    if (existing) {
        existing.quantity++;
        showToast(`${card.info.name} quantity updated!`, "success");
    } else {
        cart.push({
            uniqueId: Date.now(),
            productId: id,
            ...card.info,
            quantity: 1
        });
        showToast(`${card.info.name} added to cart!`, "success");
    }
    updateNumbers();
    showCart();
}

function updateQuantity(uniqueId, change) {
    let item = cart.find(i => i.uniqueId == uniqueId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) cart = cart.filter(i => i.uniqueId != uniqueId);
        updateNumbers();
        showCart();
        if (cart.length == 0) cartBox.classList.add("hidden");
    }
}

function showCart() {
    let list = document.querySelector(".cart-items-list");
    let totalDiv = document.querySelector(".cart-total");
    
    if (cart.length == 0) {
        list.innerHTML = "<p>Cart empty</p>";
        totalDiv.innerHTML = "";
        return;
    }
    
    let total = 0;
    list.innerHTML = cart.map(item => {
        let itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <div class="item-info">
                    <img src="${item.img}" width="40">
                    <div><div>${item.name}</div><div>R${item.price.toFixed(2)} each</div></div>
                </div>
                <div class="quantity-controls">
                    <button class="qty-btn minus" data-id="${item.uniqueId}">-</button>
                    <span class="qty-num">${item.quantity}</span>
                    <button class="qty-btn plus" data-id="${item.uniqueId}">+</button>
                    <button class="remove-btn" data-id="${item.uniqueId}">Remove</button>
                </div>
                <div class="item-total">R${itemTotal.toFixed(2)}</div>
            </div>
        `;
    }).join("");
    totalDiv.innerHTML = "<strong>Total: R" + total.toFixed(2) + "</strong>";
    
    // Attach events
    document.querySelectorAll(".qty-btn.minus, .qty-btn.plus, .remove-btn").forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            let id = btn.getAttribute("data-id");
            if (btn.classList.contains("minus")) updateQuantity(id, -1);
            else if (btn.classList.contains("plus")) updateQuantity(id, 1);
            else updateQuantity(id, -999);
        };
    });
}


// ----- WISHLIST FUNCTIONS -----
function addToWishlist(id) {
    let card = document.querySelector(`.section[data-id="${id}"]`);
    if (!wishlist.find(item => item.id == id)) {
        wishlist.push({ id, ...card.info });
        let heart = card.querySelector(".wishlist-icon i");
        heart.classList.remove("bi-heart");
        heart.classList.add("bi-heart-fill");
        heart.style.color = "red";
        updateNumbers();
        showWishlist();
        showToast(`${card.info.name} added to wishlist!`, "success");
    }
}

function removeFromWishlist(id) {
    wishlist = wishlist.filter(item => item.id != id);
    let card = document.querySelector(`.section[data-id="${id}"]`);
    if (card) {
        let heart = card.querySelector(".wishlist-icon i");
        heart.classList.remove("bi-heart-fill");
        heart.classList.add("bi-heart");
        heart.style.color = "black";
    }
    updateNumbers();
    showWishlist();
    if (wishlist.length == 0) wishlistBox.classList.add("hidden");
}

function showWishlist() {
    let list = document.querySelector(".wishlist-items-list");
    if (wishlist.length == 0) {
        list.innerHTML = "<p>Wishlist empty</p>";
        return;
    }
    list.innerHTML = wishlist.map(item => `
        <div class="wishlist-item">
            <div class="item-info">
                <img src="${item.img}" width="40">
                <span>${item.name} - R${item.price.toFixed(2)}</span>
            </div>
            <button class="remove-wishlist-btn" data-id="${item.id}">Remove</button>
        </div>
    `).join("");
    document.querySelectorAll(".remove-wishlist-btn").forEach(btn => {
        btn.onclick = () => removeFromWishlist(btn.getAttribute("data-id"));
    });
}
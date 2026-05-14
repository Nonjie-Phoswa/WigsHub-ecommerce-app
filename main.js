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
// ----- OPEN/CLOSE WINDOWS -----
function openCart() { 
    showCart(); 
    cartBox.classList.remove("hidden"); 
    wishlistBox.classList.add("hidden"); 
    if (paymentPopup) paymentPopup.classList.add("hidden"); 
}

function openWishlist() { 
    showWishlist(); 
    wishlistBox.classList.remove("hidden"); 
    cartBox.classList.add("hidden"); 
    if (paymentPopup) paymentPopup.classList.add("hidden"); 
}

function closeAll() { 
    cartBox.classList.add("hidden"); 
    wishlistBox.classList.add("hidden"); 
    if (paymentPopup) paymentPopup.classList.add("hidden"); 
}

// ----- PAYMENT VALIDATION -----
function validatePayment() {
    let isValid = true;
    
    // Get all fields
    let name = document.getElementById("cardName");
    let cardNumber = document.getElementById("cardNumber");
    let expiry = document.getElementById("expiry");
    let cvv = document.getElementById("cvv");
    
    // Get error message elements
    let nameError = document.getElementById("nameError");
    let cardError = document.getElementById("cardError");
    let expiryError = document.getElementById("expiryError");
    let cvvError = document.getElementById("cvvError");
    
    // Clear previous errors
    nameError.innerHTML = "";
    cardError.innerHTML = "";
    expiryError.innerHTML = "";
    cvvError.innerHTML = "";
    
    name.classList.remove("error", "success");
    cardNumber.classList.remove("error", "success");
    expiry.classList.remove("error", "success");
    cvv.classList.remove("error", "success");
    
    // 1. Validate Cardholder Name
    let nameValue = name.value.trim();
    if (nameValue === "") {
        nameError.innerHTML = "Cardholder name is required";
        name.classList.add("error");
        isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(nameValue)) {
        nameError.innerHTML = "Name must contain only letters and spaces";
        name.classList.add("error");
        isValid = false;
    } else {
        name.classList.add("success");
    }
    
    // 2. Validate Card Number
    let cardValue = cardNumber.value.trim();
    if (cardValue === "") {
        cardError.innerHTML = "Card number is required";
        cardNumber.classList.add("error");
        isValid = false;
    } else if (!/^\d{13}$/.test(cardValue)) {
        cardError.innerHTML = "Card number must be exactly 13 digits";
        cardNumber.classList.add("error");
        isValid = false;
    } else {
        cardNumber.classList.add("success");
    }
    
    // 3. Validate Expiry Date
    let expiryValue = expiry.value.trim();
    if (expiryValue === "") {
        expiryError.innerHTML = "Expiry date is required";
        expiry.classList.add("error");
        isValid = false;
    } else if (!/^\d{2}\/\d{2}$/.test(expiryValue)) {
        expiryError.innerHTML = "Expiry date must be in MM/YY format (example: 12/25)";
        expiry.classList.add("error");
        isValid = false;
    } else {
        let parts = expiryValue.split("/");
        let expMonth = parseInt(parts[0], 10);
        let expYear = parseInt(parts[1], 10);
        let today = new Date();
        let currentYear = today.getFullYear() % 100;
        let currentMonth = today.getMonth() + 1;
        
        if (expMonth < 1 || expMonth > 12) {
            expiryError.innerHTML = "Month must be between 01 and 12";
            expiry.classList.add("error");
            isValid = false;
        } else if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            expiryError.innerHTML = "Card has expired! Please use a valid date";
            expiry.classList.add("error");
            isValid = false;
        } else {
            expiry.classList.add("success");
        }
    }
    
    // 4. Validate CVV
    let cvvValue = cvv.value.trim();
    if (cvvValue === "") {
        cvvError.innerHTML = "CVV is required";
        cvv.classList.add("error");
        isValid = false;
    } else if (!/^\d{3}$/.test(cvvValue)) {
        cvvError.innerHTML = "CVV must be exactly 3 numbers";
        cvv.classList.add("error");
        isValid = false;
    } else {
        cvv.classList.add("success");
    }
    
    return isValid;
}

// ----- SETUP PAYMENT BUTTONS -----
let checkoutBtn = document.querySelector(".checkout-btn");
if (checkoutBtn) {
    checkoutBtn.onclick = () => {
        if (cart.length === 0) {
            showToast("Your cart is empty! Add some items first.", "warning");
            return;
        }
        let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let popupTotal = document.getElementById("popupTotal");
        if (popupTotal) popupTotal.innerHTML = "Total: R" + total.toFixed(2);
        if (paymentPopup) paymentPopup.classList.remove("hidden");
        cartBox.classList.add("hidden");
        
        // Clear form
        let fields = ["cardName", "cardNumber", "expiry", "cvv"];
        fields.forEach(id => {
            let el = document.getElementById(id);
            if (el) el.value = "";
            let errorEl = document.getElementById(id + "Error");
            if (errorEl) errorEl.innerHTML = "";
            if (el) el.classList.remove("error", "success");
        });
    };
}

if (closePaymentBtn) {
    closePaymentBtn.onclick = () => {
        if (paymentPopup) paymentPopup.classList.add("hidden");
    };
}

let payNowBtn = document.querySelector(".pay-now-btn");
if (payNowBtn) {
    payNowBtn.onclick = () => {
        if (validatePayment()) {
            showToast("Payment successful! Thank you for shopping at Wigs Hub!", "success");
            cart = [];
            updateNumbers();
            showCart();
            if (paymentPopup) paymentPopup.classList.add("hidden");
            cartBox.classList.add("hidden");
            
            // Clear all fields
            ["cardName", "cardNumber", "expiry", "cvv"].forEach(id => {
                let el = document.getElementById(id);
                if (el) el.value = "";
            });
        }
    };
}

// ----- FORM INPUT RESTRICTIONS -----
// Name - letters only
let nameInput = document.getElementById("cardName");
if (nameInput) {
    nameInput.addEventListener("input", function() {
        this.value = this.value.replace(/[^A-Za-z\s]/g, "");
    });
}

// Card Number - digits only, max 13
let cardInput = document.getElementById("cardNumber");
if (cardInput) {
    cardInput.addEventListener("input", function() {
        this.value = this.value.replace(/\D/g, "").slice(0, 13);
    });
}

// CVV - digits only, max 3
let cvvInput = document.getElementById("cvv");
if (cvvInput) {
    cvvInput.addEventListener("input", function() {
        this.value = this.value.replace(/\D/g, "").slice(0, 3);
    });
}

// Expiry - auto format MM/YY
let expiryInput = document.getElementById("expiry");
if (expiryInput) {
    expiryInput.addEventListener("input", function() {
        let value = this.value.replace(/\D/g, "").slice(0, 4);
        if (value.length >= 3) {
            this.value = value.slice(0, 2) + "/" + value.slice(2);
        } else {
            this.value = value;
        }
    });
}

// ----- CONNECT BUTTONS -----
document.querySelectorAll(".section button").forEach(btn => {
    btn.onclick = (e) => {
        e.stopPropagation();
        let section = btn.closest(".section");
        if (section) addToCart(section.getAttribute("data-id"));
    };
});

document.querySelectorAll(".section .wishlist-icon").forEach(icon => {
    icon.onclick = (e) => {
        e.stopPropagation();
        let section = icon.closest(".section");
        if (section) addToWishlist(section.getAttribute("data-id"));
    };
});

if (cartIcon) cartIcon.onclick = openCart;
if (heartIcon) heartIcon.onclick = openWishlist;

document.querySelectorAll(".close-window").forEach(btn => {
    btn.onclick = closeAll;
});


// Back arrow from the payment form
let backArrow = document.getElementById("back-arrow");
if (backArrow) {
    backArrow.onclick = () => {
        if (paymentPopup) paymentPopup.classList.add("hidden");
        cartBox.classList.remove("hidden");
    };
}

// SEARCH FUNCTION
let searchInput = document.getElementById("search-input");
if (searchInput) {
    searchInput.addEventListener("input", function() {
        let value = searchInput.value.toLowerCase();
        document.querySelectorAll(".section").forEach(card => {
            let text = card.innerText.toLowerCase();
            card.style.display = text.includes(value) ? "block" : "none";
        });
    });
}
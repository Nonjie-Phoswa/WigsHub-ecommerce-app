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

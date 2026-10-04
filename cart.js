// cart.js
const cartCount = document.querySelector(".cart-count");

// Initialize cart count from localStorage
let count = localStorage.getItem("cartCount") || 0;
cartCount.textContent = count;

// Add to cart buttons
const addToCartButtons = document.querySelectorAll(".product-card button");
addToCartButtons.forEach(button => {
  button.addEventListener("click", () => {
    count++;
    cartCount.textContent = count;
    localStorage.setItem("cartCount", count); // save to localStorage
    alert("Added to cart!");
  });
});
<script src="js/cart.js"></script>

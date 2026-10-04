// ===== AUTHENTICATION VARIABLES =====
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let cart = [];
let wishlist = []; // global wishlist storage

// ===== GET CART KEY (GUEST OR USER) =====
function getCartKey() {
  return currentUser ? `cart_${currentUser.email}` : "guestCart";
}

// ===== MIGRATE GUEST CART TO USER CART =====
function migrateGuestCart() {
  const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
  if (guestCart.length > 0 && currentUser) {
    const userCart = JSON.parse(localStorage.getItem(`cart_${currentUser.email}`)) || [];
    const mergedCart = [...userCart, ...guestCart];
    localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(mergedCart));
    localStorage.removeItem("guestCart");
    cart = mergedCart;
  }
}

// ===== MIGRATE GUEST WISHLIST TO USER WISHLIST =====
function migrateGuestWishlist() {
  const guestList = JSON.parse(localStorage.getItem("guestWishlist")) || [];
  if (guestList.length > 0 && currentUser) {
    const key = `wishlist_${currentUser.email}`;
    const userList = JSON.parse(localStorage.getItem(key)) || [];
    const merged = [...userList];
    guestList.forEach(item => {
      if (!merged.find(i => i.name === item.name)) merged.push(item);
    });
    localStorage.setItem(key, JSON.stringify(merged));
    localStorage.removeItem("guestWishlist");
    wishlist = merged;
  }
}

// ===== INITIALIZE AUTH =====
function initializeAuth() {
  const cartCount = document.querySelector('.cart-count');
  // distinguish cart vs wishlist buttons
  const addToCartButtons = document.querySelectorAll('.product-card button:not(.wishlist-button)');
  const wishlistButtons = document.querySelectorAll('.product-card .wishlist-button');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartTotal = document.querySelector('.cart-total');
  const authModal = document.getElementById('authModal');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Load user's cart if logged in
  if (currentUser) {
    cart = JSON.parse(localStorage.getItem(`cart_${currentUser.email}`)) || [];
  } else {
    cart = JSON.parse(localStorage.getItem("guestCart")) || [];
  }

  // ===== LOAD CART =====
  function loadUserCart() {
    const cartKey = getCartKey();
    cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    updateCartUI();
    // also load wishlist data when user/cart is loaded
    loadWishlist();
  }

  // ===== SAVE CART =====
  function saveCart() {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }

  // ===== WISHLIST SUPPORT =====
  function getWishlistKey() {
    return currentUser ? `wishlist_${currentUser.email}` : "guestWishlist";
  }

  function loadWishlist() {
    const key = getWishlistKey();
    wishlist = JSON.parse(localStorage.getItem(key)) || [];
  }

  function saveWishlist() {
    const key = getWishlistKey();
    localStorage.setItem(key, JSON.stringify(wishlist));
  }

  function addToWishlist(item) {
    if (wishlist.find(i => i.name === item.name && i.size === item.size)) {
      alert("Item already in wishlist.");
      return false;
    }
    wishlist.push(item);
    saveWishlist();
    updateWishlistUI();
    return true;
  }

  function removeFromWishlist(index) {
    wishlist.splice(index,1);
    saveWishlist();
    updateWishlistUI();
  }
  window.removeFromWishlist = removeFromWishlist;

  function updateWishlistUI() {
    const container = document.querySelector('.wishlist-items');
    if (!container) return;
    container.innerHTML = '';
    wishlist.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'wishlist-item';
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="wishlist-item-details">
          <h4>${item.name}</h4>
          <p style="font-size:12px;color:#999;">Size: ${item.size || 'N/A'}</p>
          <p>₱${item.price}</p>
        </div>
        <button onclick="addToCartFromWishlist({name:'${item.name}',price:${item.price},image:'${item.image}',size:'${item.size}'}, ${idx})">Add to Cart</button>
        <button onclick="removeFromWishlist(${idx})" style="margin-left:8px;background:#ff6b6b;">Remove</button>
      `;
      container.appendChild(div);
    });
  }

  // ===== UPDATE CART UI =====
  function updateCartUI() {
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Your cart is empty</p>';
    } else {
      cart.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        
        // Check if item has image (from shop) or not (from home)
        if (item.image) {
          itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
              <h4>${item.name}</h4>
              <p style="font-size:12px;color:#999;">Size: ${item.size || 'N/A'}</p>
              <p class="cart-item-price">₱${item.price}</p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">
              <i class="fa-solid fa-trash"></i>
            </button>
          `;
        } else {
          // Fallback for items without image
          itemDiv.innerHTML = `
            <div class="cart-item-details" style="width: 100%;">
              <h4>${item.name}</h4>
              <p class="cart-item-price">₱${item.price}</p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">
              <i class="fa-solid fa-trash"></i>
            </button>
          `;
        }
        cartItemsContainer.appendChild(itemDiv);
        total += item.price;
      });
    }

    if (cartCount) {
      cartCount.textContent = cart.length;
    }
    if (cartTotal) {
      cartTotal.textContent = "Total: ₱" + total.toLocaleString();
    }
  }

  // ===== REMOVE FROM CART =====
  window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
  }

  // ===== SWITCH AUTH TABS =====
  window.switchTab = function(tab) {
    document.getElementById('loginTab').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('signupTab').style.display = tab === 'signup' ? 'block' : 'none';
    document.getElementById('accountTab').style.display = tab === 'account' ? 'block' : 'none';
    document.getElementById('wishlistTab').style.display = tab === 'wishlist' ? 'block' : 'none';
    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
    if (tab === 'wishlist') updateWishlistUI();
  }

  // ===== OPEN AUTH MODAL =====
  window.openAuthModal = function() {
    if (authModal) {
      if (currentUser) {
        // Show account tab if logged in
        document.getElementById('loginTab').style.display = 'none';
        document.getElementById('signupTab').style.display = 'none';
        document.getElementById('accountTab').style.display = 'block';
        
        // Update account info
        document.getElementById('accountName').textContent = currentUser.name || 'User';
        document.getElementById('accountEmail').textContent = currentUser.email;
      } else {
        // Show login tab if not logged in
        document.getElementById('loginTab').style.display = 'block';
        document.getElementById('signupTab').style.display = 'none';
        document.getElementById('accountTab').style.display = 'none';
      }
      
      authModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  // ===== CLOSE AUTH MODAL =====
  window.closeAuthModal = function() {
    if (authModal) {
      authModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  // ===== LOGOUT USER =====
  window.logoutUser = function() {
    if (confirm("Are you sure you want to logout?")) {
      currentUser = null;
      localStorage.removeItem("currentUser");
      cart = JSON.parse(localStorage.getItem("guestCart")) || [];
      wishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
      window.closeAuthModal();
      alert("Logged out successfully!");
      updateCartUI();
      updateWishlistUI();
      window.location.reload();
    }
  }

  // ===== OPEN ACCOUNT/WISHLIST HELPERS =====
  window.openAccountTab = function() {
    window.openAuthModal();
    switchTab('account');
  }

  window.openWishlistTab = function() {
    if (!currentUser) {
      // user will be prompted to login first
      window.requestedWishlistTab = true;
      window.openAuthModal();
    } else {
      window.openAuthModal();
      switchTab('wishlist');
    }
  }

  // ===== TOGGLE CART SIDEBAR =====
  window.toggleCart = function() {
    if (cartSidebar) {
      cartSidebar.classList.toggle("open");
    }
  }

  // ===== GOOGLE LOGIN =====
  window.loginWithGoogle = function() {
    const email = prompt("Demo: Enter email for Google login:");
    if (email) {
      const user = { name: email.split('@')[0], email, password: "google_auth", provider: "google" };
      currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      
      // Auto-create user if not exists
      let users = JSON.parse(localStorage.getItem("users")) || [];
      if (!users.find(u => u.email === email)) {
        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));
      }
      
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify([]));
      migrateGuestCart();
      migrateGuestWishlist();
      window.closeAuthModal();
      alert("Logged in with Google!");
      window.location.reload();
    }
  }

  // ===== FACEBOOK LOGIN =====
  window.loginWithFacebook = function() {
    const email = prompt("Demo: Enter email for Facebook login:");
    if (email) {
      const user = { name: email.split('@')[0], email, password: "facebook_auth", provider: "facebook" };
      currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      
      // Auto-create user if not exists
      let users = JSON.parse(localStorage.getItem("users")) || [];
      if (!users.find(u => u.email === email)) {
        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));
      }
      
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify([]));
      migrateGuestCart();
      migrateGuestWishlist();
      window.closeAuthModal();
      alert("Logged in with Facebook!");
      window.location.reload();
    }
  }

  // ===== GOOGLE SIGNUP =====
  window.signupWithGoogle = function() {
    const email = prompt("Demo: Enter email for Google signup:");
    if (email) {
      let users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.find(u => u.email === email)) {
        alert("Email already registered!");
        return;
      }
      
      const user = { name: email.split('@')[0], email, password: "google_auth", provider: "google" };
      users.push(user);
      localStorage.setItem("users", JSON.stringify(users));
      
      currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify([]));
      
      migrateGuestCart();
      migrateGuestWishlist();
      window.closeAuthModal();
      alert("Account created with Google!");
      window.location.reload();
    }
  }

  // ===== FACEBOOK SIGNUP =====
  window.signupWithFacebook = function() {
    const email = prompt("Demo: Enter email for Facebook signup:");
    if (email) {
      let users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.find(u => u.email === email)) {
        alert("Email already registered!");
        return;
      }
      
      const user = { name: email.split('@')[0], email, password: "facebook_auth", provider: "facebook" };
      users.push(user);
      localStorage.setItem("users", JSON.stringify(users));
      
      currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify([]));
      
      migrateGuestCart();
      migrateGuestWishlist();
      window.closeAuthModal();
      alert("Account created with Facebook!");
      window.location.reload();
    }
  }

  // ===== LOGIN HANDLER =====
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      // Get all users from localStorage
      let users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        migrateGuestCart();
        migrateGuestWishlist();
        loadUserCart();
        window.closeAuthModal();
        alert("Login successful!");
        
        // Add the pending item to cart if it exists
        if (window.pendingCartItem) {
          addItemToCart(window.pendingCartItem);
          delete window.pendingCartItem;
        }
        // process pending wishlist if any
        if (window.pendingWishlistItem) {
          addToWishlist(window.pendingWishlistItem);
          delete window.pendingWishlistItem;
        }
        // if user originally wanted to see wishlist tab, reopen modal
        if (window.requestedWishlistTab) {
          window.openAuthModal();
          switchTab('wishlist');
          delete window.requestedWishlistTab;
        }
      } else {
        alert("Invalid email or password");
      }
      loginForm.reset();
    });
  }

  // ===== SIGNUP HANDLER =====
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;

      let users = JSON.parse(localStorage.getItem("users")) || [];

      // Check if user already exists
      if (users.find(u => u.email === email)) {
        alert("Email already registered!");
        return;
      }

      // Create new user
      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      // Log in the new user
      currentUser = newUser;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify([]));
      
      migrateGuestCart();
      migrateGuestWishlist();
      window.closeAuthModal();
      alert("Account created and logged in!");

      // Add the pending item to cart if it exists
      if (window.pendingCartItem) {
        cart.push(window.pendingCartItem);
        saveCart();
        updateCartUI();
        animateCartIcon();
        delete window.pendingCartItem;
      }
      // add pending wishlist if any
      if (window.pendingWishlistItem) {
        wishlist.push(window.pendingWishlistItem);
        saveWishlist();
        delete window.pendingWishlistItem;
      }
      // reopen modal showing wishlist if requested
      if (window.requestedWishlistTab) {
        window.openAuthModal();
        switchTab('wishlist');
        delete window.requestedWishlistTab;
      }
      signupForm.reset();
    });
  }

  // ===== ADD TO CART BUTTON HANDLERS (FOR SHOP PAGE) =====
  function animateCartIcon() {
    const icon = document.querySelector('.cart-container');
    if (!icon) return;
    icon.classList.add('bump');
    setTimeout(() => icon.classList.remove('bump'), 300);
  }

  // helper to add item with duplicates check
  function addItemToCart(item) {
    const exists = cart.find(i => i.name === item.name && i.size === item.size);
    if (exists) {
      alert("You already added that item in this size to your cart.");
      animateCartIcon();
      return false;
    }
    cart.push(item);
    saveCart();
    updateCartUI();
    animateCartIcon();
    return true;
  }
  // expose globally for inline handlers
  window.addItemToCart = addItemToCart;

  // helper to add item to cart and remove from wishlist
  function addToCartFromWishlist(item, index) {
    if (addItemToCart(item)) {
      removeFromWishlist(index);
    }
  }
  window.addToCartFromWishlist = addToCartFromWishlist;

  if (addToCartButtons.length > 0) {
    addToCartButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.product-card');
        const sizeSelect = card.querySelector('.size-selector');
        
        // Show size selector if hidden
        if (sizeSelect && sizeSelect.style.display === 'none') {
          sizeSelect.style.display = 'block';
          alert('Please select a size first.');
          return;
        }
        
        const name = card.querySelector("h3").textContent;
        const price = parseInt(card.dataset.price);
        const image = card.querySelector("img").src;
        const size = sizeSelect ? sizeSelect.value : '';
        
        if (!size) {
          alert('Please select a size');
          return;
        }
        
        const item = { name, price, image, size };

        // Check if user is logged in
        if (!currentUser) {
          window.pendingCartItem = item;
          window.openAuthModal();
        } else {
          addItemToCart(item);
        }
      });
    });
  }

  if (wishlistButtons.length > 0) {
    wishlistButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.product-card');
        const sizeSelect = card.querySelector('.size-selector');
        const icon = button.querySelector('i');

        // Show size selector if hidden
        if (sizeSelect && sizeSelect.style.display === 'none') {
          sizeSelect.style.display = 'block';
          alert('Please select a size first.');
          return;
        }

        const name = card.querySelector("h3").textContent;
        const price = parseInt(card.dataset.price);
        const image = card.querySelector("img").src;
        const size = sizeSelect ? sizeSelect.value : '';

        if (!size) {
          alert('Please select a size');
          return;
        }

        const item = { name, price, image, size };

        if (!currentUser) {
          window.pendingWishlistItem = item;
          window.requestedWishlistTab = true;
          window.openAuthModal();
        } else {
          if (addToWishlist(item)) {
            const isActive = !button.classList.contains('active');
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
            if (icon) {
              icon.classList.toggle('fa-solid', isActive);
              icon.classList.toggle('fa-regular', !isActive);
            }
            alert('Added to wishlist.');
          }
        }
      });
    });
  }

  // ===== INITIALIZE =====
  loadUserCart();
}

// ===== PAYMENT MODAL FUNCTIONS =====
window.openPaymentModal = function() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const modal = document.getElementById('paymentModal');
  if (!modal) return;

  // Populate order summary
  const paymentItems = document.getElementById('paymentItems');
  const paymentTotal = document.getElementById('paymentTotal');
  
  paymentItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'payment-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="payment-item-details">
        <h4>${item.name}</h4>
        <p>Size: ${item.size || 'N/A'} | ₱${item.price}</p>
      </div>
    `;
    paymentItems.appendChild(itemDiv);
    total += item.price;
  });

  paymentTotal.textContent = `Total: ₱${total.toLocaleString()}`;

  // Pre-fill address form if user is logged in
  if (currentUser) {
    document.getElementById('shippingName').value = currentUser.name || '';
    document.getElementById('shippingEmail').value = currentUser.email || '';
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

window.closePaymentModal = function() {
  const modal = document.getElementById('paymentModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    const form = document.getElementById('addressForm');
    if (form) form.reset();
  }
}

window.confirmPayment = function() {
  const form = document.getElementById('addressForm');
  if (!form.checkValidity()) {
    alert('Please fill in all required fields.');
    return;
  }

  // Get form data
  const orderData = {
    customerName: document.getElementById('shippingName').value,
    email: document.getElementById('shippingEmail').value,
    phone: document.getElementById('shippingPhone').value,
    address: document.getElementById('shippingAddress1').value,
    address2: document.getElementById('shippingAddress2').value,
    city: document.getElementById('shippingCity').value,
    province: document.getElementById('shippingProvince').value,
    zip: document.getElementById('shippingZip').value,
    country: document.getElementById('shippingCountry').value,
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price, 0)
  };

  // Send order to backend
  fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('✅ Payment successful! Your order #' + data.order.id + ' has been placed.\n\nOrder details have been sent to ' + orderData.email);

      // Clear cart after successful payment
      cart = [];
      saveCart();
      updateCartUI();
      
      // Close modal
      closePaymentModal();
      
      // Close cart sidebar
      toggleCart();
    } else {
      alert('❌ Error processing order: ' + (data.error || 'Unknown error'));
    }
  })
  .catch(error => {
    console.error('Order error:', error);
    alert('⚠️ Error processing your order. Please try again.');
  });
}

function initializeStoreSearch() {
  const dialog = document.getElementById('storeSearchDialog');
  const input = document.getElementById('storeSearchInput');
  const form = document.getElementById('storeSearchForm');
  const results = document.getElementById('storeSearchResults');
  const discovery = document.getElementById('storeSearchDiscovery');
  const trending = document.getElementById('storeSearchTrending');
  const historyContainer = document.getElementById('storeSearchHistory');
  const clearHistoryButton = document.getElementById('clearSearchHistory');

  if (!dialog || !input || !form || !results || !discovery || !trending || !historyContainer || !clearHistoryButton) {
    return;
  }

  const historyKey = 'doingGoodSearchHistory';
  let catalog = [];
  let opener = null;
  let closeTimer = null;
  let previousBodyOverflow = '';

  function readHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(historyKey) || '[]');
      return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    } catch (error) {
      console.error('Unable to read search history:', error);
      return [];
    }
  }

  function saveHistory(history) {
    try {
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Unable to save search history:', error);
    }
  }

  function recordSearch(term) {
    const value = term.trim();
    if (!value) return;
    const history = readHistory().filter(item => item.toLowerCase() !== value.toLowerCase());
    history.unshift(value);
    saveHistory(history.slice(0, 8));
    renderHistory();
  }

  function renderHistory() {
    const history = readHistory();
    historyContainer.replaceChildren();
    clearHistoryButton.hidden = history.length === 0;

    if (history.length === 0) {
      const message = document.createElement('p');
      message.textContent = 'You can see your search history here.';
      historyContainer.appendChild(message);
      return;
    }

    history.forEach(term => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'store-search__history-item';
      button.innerHTML = '<i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>';
      const label = document.createElement('span');
      label.textContent = term;
      button.appendChild(label);
      button.addEventListener('click', () => {
        input.value = term;
        renderResults(term);
        input.focus();
      });
      historyContainer.appendChild(button);
    });
  }

  function normalizeProduct(card, sourceUrl) {
    const image = card.querySelector('img');
    const name = card.querySelector('h3')?.textContent.trim();
    const price = card.querySelector('p')?.textContent.trim();
    if (!name) return null;

    return {
      name,
      price: price || '',
      category: card.dataset.category || '',
      image: image ? new URL(image.getAttribute('src'), sourceUrl).href : ''
    };
  }

  async function loadCatalog() {
    const currentCards = Array.from(document.querySelectorAll('.product-card'));
    if (currentCards.length) {
      catalog = currentCards.map(card => normalizeProduct(card, window.location.href)).filter(Boolean);
      return;
    }

    try {
      const shopUrl = new URL('shop.html', window.location.href);
      const response = await fetch(shopUrl);
      if (!response.ok) {
        throw new Error(`Product catalog request failed with status ${response.status}`);
      }
      const html = await response.text();
      const shopDocument = new DOMParser().parseFromString(html, 'text/html');
      catalog = Array.from(shopDocument.querySelectorAll('.product-card'))
        .map(card => normalizeProduct(card, shopUrl.href))
        .filter(Boolean);
    } catch (error) {
      console.error('Unable to load the store product catalog:', error);
      catalog = [];
    }
  }

  function renderTrending() {
    trending.replaceChildren();
    const names = [...new Set(catalog.map(product => product.name))].slice(0, 8);
    names.forEach(name => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'store-search__chip';
      chip.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
      const label = document.createElement('span');
      label.textContent = name;
      chip.appendChild(label);
      chip.addEventListener('click', () => {
        input.value = name;
        recordSearch(name);
        renderResults(name);
        input.focus();
      });
      trending.appendChild(chip);
    });
  }

  function renderResults(query) {
    const term = query.trim().toLowerCase();
    const showingResults = term.length > 0;
    discovery.hidden = showingResults;
    results.hidden = !showingResults;
    results.replaceChildren();
    if (!showingResults) return;

    const matches = catalog.filter(product =>
      `${product.name} ${product.category}`.toLowerCase().includes(term)
    );
    if (matches.length === 0) {
      const message = document.createElement('p');
      message.className = 'store-search__empty';
      message.textContent = 'No products found.';
      results.appendChild(message);
      return;
    }

    matches.forEach(product => {
      const link = document.createElement('a');
      link.className = 'store-search__result';
      link.href = `shop.html?search=${encodeURIComponent(product.name)}#shop-section`;
      if (product.image) {
        const image = document.createElement('img');
        image.src = product.image;
        image.alt = '';
        image.loading = 'lazy';
        link.appendChild(image);
      }
      const copy = document.createElement('span');
      copy.className = 'store-search__result-copy';
      const name = document.createElement('strong');
      name.textContent = product.name;
      const price = document.createElement('span');
      price.textContent = product.price;
      copy.append(name, price);
      link.appendChild(copy);
      link.addEventListener('click', event => {
        event.preventDefault();
        recordSearch(input.value || product.name);
        closeSearch();
        window.setTimeout(() => {
          window.location.assign(link.href);
        }, 80);
      });
      results.appendChild(link);
    });
  }

  function openSearch(button) {
    if (!dialog.hidden) return;
    opener = button;
    clearTimeout(closeTimer);
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.hidden = false;
    dialog.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      dialog.classList.add('is-open');
      window.setTimeout(() => input.focus(), 50);
    });
    renderHistory();
    renderResults(input.value);
    loadCatalog().then(renderTrending);
  }

  function closeSearch() {
    if (dialog.hidden) return;
    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousBodyOverflow;
    if (opener) opener.focus();
    closeTimer = window.setTimeout(() => {
      dialog.hidden = true;
      input.value = '';
      renderResults('');
    }, 280);
  }

  document.querySelectorAll('[data-open-search]').forEach(button => {
    button.addEventListener('click', () => openSearch(button));
  });
  dialog.querySelectorAll('[data-close-search]').forEach(button => {
    button.addEventListener('click', closeSearch);
  });
  dialog.querySelectorAll('a:not(.store-search__result)').forEach(link => {
    link.addEventListener('click', closeSearch);
  });
  input.addEventListener('input', () => renderResults(input.value));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const term = input.value.trim();
    if (!term) return;
    recordSearch(term);
    renderResults(term);
    input.focus();
  });
  clearHistoryButton.addEventListener('click', () => {
    saveHistory([]);
    renderHistory();
  });
  document.addEventListener('keydown', event => {
    if (dialog.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])'))
        .filter(element => !element.closest('[hidden]'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  loadCatalog().then(renderTrending);
  renderHistory();
}

document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          navLinks.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
});

// ===== RUN WHEN DOM IS READY =====
document.addEventListener('DOMContentLoaded', initializeAuth);
document.addEventListener('DOMContentLoaded', initializeStoreSearch);

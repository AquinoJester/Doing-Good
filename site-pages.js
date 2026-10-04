(function () {
  const footerLinks = {
    shop: [
      ['New Arrivals', 'new-arrivals.html'],
      ['Essentials', 'essentials.html'],
      ['Outerwear', 'outerwear.html'],
      ['Denim', 'denim.html']
    ],
    about: [
      ['Our Story', 'our-story.html'],
      ['Sustainability', 'sustainability.html'],
      ['Supply Chain', 'supply-chain.html'],
      ['Impact Report', 'impact-report.html']
    ],
    help: [
      ['Contact Us', 'contact.html'],
      ['Shipping & Returns', 'shipping-returns.html'],
      ['Size Guide', 'size-guide.html'],
      ['FAQ', 'faq.html']
    ]
  };

  function initFooter() {
    document.querySelectorAll('[data-footer-links]').forEach(list => {
      const links = footerLinks[list.dataset.footerLinks] || [];
      links.forEach(([label, href]) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        item.appendChild(link);
        list.appendChild(item);
      });
    });
  }

  function initMobileNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initCartCount() {
    const count = document.querySelector('.cart-count');
    if (!count) return;

    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      const key = user && user.email ? `cart_${user.email}` : 'guestCart';
      const cart = JSON.parse(localStorage.getItem(key) || '[]');
      count.textContent = String(Array.isArray(cart) ? cart.length : 0);
    } catch (error) {
      console.error('Unable to read the saved cart:', error);
      count.textContent = '0';
    }
  }

  function ensureStoreSearch() {
    if (document.getElementById('storeSearchDialog')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div class="store-search" id="storeSearchDialog" role="dialog" aria-modal="true" aria-labelledby="storeSearchTitle" aria-hidden="true" hidden>
        <div class="store-search__panel">
          <header class="store-search__top">
            <button class="store-search__back" type="button" aria-label="Close search" data-close-search>
              <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            </button>
            <form class="store-search__form" id="storeSearchForm" role="search">
              <label class="visually-hidden" id="storeSearchTitle" for="storeSearchInput">Search Doing Good products</label>
              <input id="storeSearchInput" type="search" placeholder="What are you looking for?" autocomplete="off" enterkeyhint="search">
              <button type="submit" aria-label="Search products"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button>
            </form>
          </header>
          <nav class="store-search__quick-links" aria-label="Quick links">
            <a href="shop.html"><i class="fa-solid fa-store" aria-hidden="true"></i> Store</a>
            <a href="faq.html"><i class="fa-regular fa-circle-question" aria-hidden="true"></i> FAQ</a>
          </nav>
          <div class="store-search__content">
            <div class="store-search__results" id="storeSearchResults" aria-live="polite" hidden></div>
            <div class="store-search__discovery" id="storeSearchDiscovery">
              <section class="store-search__section" aria-labelledby="storeSearchTrendingTitle">
                <h2 id="storeSearchTrendingTitle">Trending</h2>
                <div class="store-search__chips" id="storeSearchTrending"></div>
              </section>
              <section class="store-search__section" aria-labelledby="storeSearchHistoryTitle">
                <div class="store-search__section-heading">
                  <h2 id="storeSearchHistoryTitle">Search History</h2>
                  <button class="store-search__clear" id="clearSearchHistory" type="button" hidden>Clear</button>
                </div>
                <div class="store-search__history" id="storeSearchHistory"><p>You can see your search history here.</p></div>
              </section>
            </div>
            <footer class="store-search__footer">
              <p>Can't find what you're looking for?</p>
              <a href="shop.html#shop-section">SEARCH BY CATEGORY</a>
            </footer>
          </div>
        </div>
      </div>
    `);
  }

  function initCollections() {
    const productGrid = document.querySelector('[data-collection-grid]');
    if (!productGrid) return;

    const type = productGrid.dataset.collectionGrid;
    const status = document.querySelector('[data-collection-status]');
    const emptyState = document.querySelector('[data-collection-empty]');
    const categoryRules = {
      essentials: product => /t-shirt|tee|basic|everyday/i.test(product.name),
      outerwear: product => /jacket|hoodie|coat|outerwear/i.test(product.name),
      denim: product => /jean|denim/i.test(product.name),
      'new-arrivals': () => true
    };

    async function loadProducts() {
      try {
        const response = await fetch(new URL('shop.html', window.location.href));
        if (!response.ok) {
          throw new Error(`Product catalog request failed with status ${response.status}`);
        }
        const html = await response.text();
        const documentFromShop = new DOMParser().parseFromString(html, 'text/html');
        const products = Array.from(documentFromShop.querySelectorAll('.product-card'))
          .map(card => {
            const image = card.querySelector('img');
            const name = card.querySelector('h3')?.textContent.trim();
            const priceText = card.querySelector('p')?.textContent.trim() || '';
            const price = Number(card.dataset.price);
            if (!name || !Number.isFinite(price)) return null;
            return {
              name,
              price,
              priceText,
              category: card.dataset.category || '',
              image: image ? new URL(image.getAttribute('src'), response.url || window.location.href).href : ''
            };
          })
          .filter(Boolean);
        const matching = products.filter(categoryRules[type] || (() => false));

        if (matching.length === 0) {
          productGrid.hidden = true;
          if (emptyState) emptyState.hidden = false;
          return;
        }

        productGrid.replaceChildren(...matching.map(createProductCard));
      } catch (error) {
        console.error('Unable to load products from the shop catalog:', error);
        if (status) {
          status.textContent = 'Products could not be loaded. Please try again later.';
          status.classList.add('is-error');
        }
      }
    }

    function createProductCard(product) {
      const card = document.createElement('article');
      card.className = 'collection-product';

      if (product.image) {
        const image = document.createElement('img');
        image.src = product.image;
        image.alt = product.name;
        image.loading = 'lazy';
        card.appendChild(image);
      }

      const body = document.createElement('div');
      body.className = 'collection-product__body';
      const heading = document.createElement('h2');
      heading.textContent = product.name;
      const price = document.createElement('p');
      price.className = 'collection-product__price';
      price.textContent = `₱${product.price.toLocaleString()}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'info-product-button';
      button.textContent = 'Add to Cart';
      button.addEventListener('click', () => addToCart(product));
      body.append(heading, price, button);
      card.appendChild(body);
      return card;
    }

    function addToCart(product) {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const storageKey = user && user.email ? `cart_${user.email}` : 'guestCart';
        const savedCart = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const cart = Array.isArray(savedCart) ? savedCart : [];
        const existing = cart.find(item => item.name === product.name && !item.size);
        if (existing) {
          if (status) status.textContent = `${product.name} is already in your cart.`;
          return;
        }
        cart.push({
          name: product.name,
          price: product.price,
          image: product.image,
          size: ''
        });
        localStorage.setItem(storageKey, JSON.stringify(cart));
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = String(cart.length);
        if (status) {
          status.classList.remove('is-error');
          status.textContent = `${product.name} added to your cart.`;
        }
      } catch (error) {
        console.error('Unable to add the product to the cart:', error);
        if (status) {
          status.textContent = 'Unable to add this item to your cart. Please try again.';
          status.classList.add('is-error');
        }
      }
    }

    loadProducts();
  }

  function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;

    const status = document.querySelector('[data-contact-status]');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const endpoint = form.dataset.formspreeEndpoint.trim();
      if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
        status.textContent = 'Add your Formspree endpoint to enable message delivery.';
        status.classList.add('is-error');
        return;
      }

      const submitButton = form.querySelector('[type="submit"]');
      submitButton.disabled = true;
      status.textContent = 'Sending your message…';
      status.classList.remove('is-error');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        if (!response.ok) {
          throw new Error(`Message submission failed with status ${response.status}`);
        }
        form.reset();
        status.textContent = 'Message sent. Thank you for getting in touch!';
      } catch (error) {
        console.error('Unable to send the contact form:', error);
        status.textContent = 'Your message could not be sent. Please check your connection or contact us by email.';
        status.classList.add('is-error');
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureStoreSearch();
    initFooter();
    initCartCount();
    initCollections();
    initContactForm();
  });
})();

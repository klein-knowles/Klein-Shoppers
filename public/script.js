let products = [
  {
    id: 1,
    name: "Echo Bluetooth Speaker with room-filling bass",
    category: "electronics",
    price: 200000,
    rating: 4.6,
    badge: "28% off",
    tags: ["deals", "audio"],
    details: ["Portable wireless sound", "Rechargeable battery", "Great for bedrooms, shops, and small events"],
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 2,
    name: "AeroPods wireless earbuds with charging case",
    category: "electronics",
    price: 205000,
    rating: 4.4,
    badge: "Deal",
    tags: ["deals", "audio"],
    details: ["Compact charging case", "Clear calls and music", "Lightweight daily carry"],
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 3,
    name: "UltraView 27-inch monitor for work and gaming",
    category: "electronics",
    price: 680000,
    rating: 4.7,
    badge: "Limited time",
    tags: ["deals", "office"],
    details: ["Wide workspace display", "Sharp color and contrast", "Useful for work, school, and gaming"],
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 4,
    name: "Smart home hub with voice control",
    category: "electronics",
    price: 260000,
    rating: 4.5,
    badge: "Best seller",
    tags: ["smart home"],
    details: ["Control compatible devices", "Hands-free voice commands", "Compact bedside-friendly design"],
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 5,
    name: "Nonstick ceramic cookware set, 10 pieces",
    category: "home",
    price: 340000,
    rating: 4.8,
    badge: "30% off",
    tags: ["deals", "kitchen", "appliances"],
    details: ["Easy-clean cooking surface", "Saucepans, frying pans, and lids", "Good starter set for any kitchen"],
    image: "https://images.unsplash.com/photo-1584990347449-a2d4cfe5cf5f?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 6,
    name: "Cotton hotel towel bundle, soft absorbent set",
    category: "home",
    price: 125000,
    rating: 4.3,
    badge: "Deal",
    tags: ["deals", "bath"],
    details: ["Soft cotton feel", "Multiple towel sizes", "Fresh upgrade for home or guest rooms"],
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 7,
    name: "Adjustable LED desk lamp with USB charging",
    category: "home",
    price: 95000,
    rating: 4.4,
    badge: "Coupon",
    tags: ["office", "lighting"],
    details: ["Flexible lamp arm", "Built-in USB charging", "Useful for reading, study, and work desks"],
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 8,
    name: "Compact espresso maker with milk frother",
    category: "appliances",
    price: 455000,
    rating: 4.6,
    badge: "15% off",
    tags: ["home", "deals", "coffee"],
    details: ["Compact counter footprint", "Steam wand for milk drinks", "Cafe-style drinks at home"],
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 9,
    name: "Everyday canvas tote with zip pocket",
    category: "fashion",
    price: 105000,
    rating: 4.2,
    badge: "Under UGX 120k",
    tags: ["bags"],
    details: ["Durable canvas body", "Secure zip pocket", "Easy for errands, campus, or travel"],
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 10,
    name: "Minimal white sneakers for travel and weekends",
    category: "fashion",
    price: 180000,
    rating: 4.5,
    badge: "Deal",
    tags: ["deals", "shoes"],
    details: ["Clean everyday style", "Comfortable walking sole", "Pairs well with casual outfits"],
    image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 11,
    name: "Classic cotton hoodie in soft fleece",
    category: "fashion",
    price: 162000,
    rating: 4.4,
    badge: "New",
    tags: ["clothing"],
    details: ["Soft fleece lining", "Relaxed daily fit", "Layer for cool evenings"],
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 12,
    name: "Hydrating skincare starter kit for daily glow",
    category: "beauty",
    price: 139000,
    rating: 4.7,
    badge: "Best seller",
    tags: ["wellness"],
    details: ["Daily cleanser and moisturizer", "Travel-friendly starter sizes", "Simple routine for morning and evening"],
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 13,
    name: "Fresh fruit and vegetable family box",
    category: "grocery",
    price: 85000,
    rating: 4.6,
    badge: "Fresh",
    tags: ["fresh", "deals"],
    details: ["Seasonal fruit and vegetables", "Packed for family meals", "Good for weekly kitchen top-ups"],
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 14,
    name: "Ugandan roasted coffee beans, 1kg",
    category: "bubu",
    price: 68000,
    rating: 4.8,
    badge: "BUBU",
    tags: ["grocery", "coffee", "local"],
    details: ["Locally roasted coffee", "Rich aroma for home brewing", "Supports Ugandan growers and roasters"],
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 15,
    name: "Pantry staples bundle with rice, beans and oil",
    category: "grocery",
    price: 118000,
    rating: 4.5,
    badge: "Bundle",
    tags: ["fresh", "deals"],
    details: ["Useful everyday staples", "Great for monthly shopping", "Packed for easy delivery"],
    image: "https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 16,
    name: "Baby care starter pack with wipes and lotion",
    category: "baby",
    price: 98000,
    rating: 4.6,
    badge: "Parent pick",
    tags: ["care"],
    details: ["Daily baby care essentials", "Gentle wipe and lotion bundle", "Handy gift for new parents"],
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 17,
    name: "Wireless keyboard and mouse office combo",
    category: "office",
    price: 135000,
    rating: 4.3,
    badge: "Office deal",
    tags: ["electronics", "deals"],
    details: ["Reliable wireless desk setup", "Comfortable full-size keyboard", "Useful for home offices and business desks"],
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 18,
    name: "Fitness training mat with carry strap",
    category: "sports",
    price: 76000,
    rating: 4.4,
    badge: "Active",
    tags: ["wellness"],
    details: ["Comfortable exercise surface", "Easy carry strap", "Good for yoga, stretching, and home workouts"],
    image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 19,
    name: "Car interior cleaning and care kit",
    category: "automotive",
    price: 89000,
    rating: 4.2,
    badge: "Car care",
    tags: ["deals"],
    details: ["Dashboard and interior cleaners", "Microfiber cloths included", "Keeps daily drives looking neat"],
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 20,
    name: "Children's learning blocks and puzzle set",
    category: "toys",
    price: 72000,
    rating: 4.5,
    badge: "Kids",
    tags: ["baby"],
    details: ["Colorful learning activities", "Builds coordination and focus", "Good gift for young children"],
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 21,
    name: "Bestselling business and personal finance books",
    category: "books",
    price: 64000,
    rating: 4.4,
    badge: "Read more",
    tags: ["office"],
    details: ["Practical reading picks", "Useful for entrepreneurs and students", "A compact shelf upgrade"],
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 22,
    name: "Garden herb planter with starter seeds",
    category: "garden",
    price: 58000,
    rating: 4.3,
    badge: "Grow",
    tags: ["home"],
    details: ["Starter herbs for balcony or kitchen", "Compact planter size", "Fresh flavor close at hand"],
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 23,
    name: "Pet feeding bowl and grooming brush set",
    category: "pets",
    price: 54000,
    rating: 4.2,
    badge: "Pet care",
    tags: ["home"],
    details: ["Daily feeding and grooming basics", "Easy-clean bowl", "Useful for cats and small dogs"],
    image: "https://images.unsplash.com/photo-1601758063890-1167f394febb?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 24,
    name: "Handwoven Ugandan storage basket",
    category: "bubu",
    price: 74000,
    rating: 4.9,
    badge: "BUBU",
    tags: ["home", "local"],
    details: ["Handwoven local design", "Decorative and practical storage", "Supports Ugandan craft makers"],
    image: "https://images.unsplash.com/photo-1601933470096-0e34634ffcde?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 25,
    name: "Locally made shea butter body cream",
    category: "bubu",
    price: 42000,
    rating: 4.7,
    badge: "BUBU",
    tags: ["beauty", "local"],
    details: ["Rich body cream texture", "Made with local ingredients", "Everyday moisture for dry skin"],
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 26,
    name: "Air fryer family-size kitchen appliance",
    category: "appliances",
    price: 360000,
    rating: 4.6,
    badge: "Hot deal",
    tags: ["home", "deals"],
    details: ["Family-size basket", "Crisp meals with less oil", "Easy controls and cleanup"],
    image: "https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 27,
    name: "Smartphone power bank, 20000mAh",
    category: "electronics",
    price: 155000,
    rating: 4.5,
    badge: "Travel pick",
    tags: ["deals", "phones"],
    details: ["High-capacity backup power", "Useful for travel and busy work days", "Charges phones and small devices"],
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 28,
    name: "Kampala weekend travel backpack",
    category: "fashion",
    price: 149000,
    rating: 4.4,
    badge: "Travel",
    tags: ["bags"],
    details: ["Spacious compartments", "Comfortable shoulder straps", "Good for school, work, or weekend trips"],
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=640&q=80",
  },
];
async function loadProducts() {
    try {
        const response = await fetch("/products");
        products = await response.json();

        console.log("Products loaded:", products);

        // Refresh the page with database products
        if (typeof renderProducts === "function") {
            renderProducts();
        }
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

const state = {
  filter: "all",
  query: "",
  cart: [],
};

const productGrid = document.querySelector("#productGrid");
const dealRow = document.querySelector("#dealRow");
const freshRow = document.querySelector("#freshRow");
const electronicsRow = document.querySelector("#electronicsRow");
const homeRow = document.querySelector("#homeRow");
const fashionRow = document.querySelector("#fashionRow");
const beautyRow = document.querySelector("#beautyRow");
const bubuRow = document.querySelector("#bubuRow");
const resultCount = document.querySelector("#resultCount");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const filterButtons = document.querySelectorAll(".filter");
const filterLinks = document.querySelectorAll("[data-filter-link]");
const filterShortcuts = document.querySelectorAll("[data-filter-shortcut]");
const cartButton = document.querySelector("#cartButton");
const closeCart = document.querySelector("#closeCart");
const checkoutButton = document.querySelector("#checkoutButton");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const mobileCartCount = document.querySelector("#mobileCartCount");
const cartTotal = document.querySelector("#cartTotal");
const installButton = document.querySelector("#installButton");
const cartShortcuts = document.querySelectorAll("[data-cart-shortcut]");
const productModal = document.querySelector("#productModal");
const productModalContent = document.querySelector("#productModalContent");
const closeProductModal = document.querySelector("#closeProductModal");
let installPromptEvent;

function money(value) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(value);
}

function stars(rating) {
  const full = Math.round(rating);
  return "*".repeat(full) + "-".repeat(5 - full);
}

function matchesCategory(product, filter) {
  return filter === "all" || product.category === filter || product.tags.includes(filter);
}

function productCard(product) {
  const localBadge = product.tags.includes("local") ? `<span class="badge local-badge">Local seller</span>` : "";

  return `
    <article class="product-card" data-category="${product.category}">
      <button class="product-card-main" type="button" data-view="${product.id}" aria-label="View ${product.name}">
        <img class="product-image" alt="${product.name}" src="${product.image}" loading="lazy" />
        <div class="badge-row">
          <span class="badge">${product.badge}</span>
          ${localBadge}
        </div>
        <h3>${product.name}</h3>
        <div class="rating" aria-label="${product.rating} out of 5 stars">${stars(product.rating)} <span>${product.rating}</span></div>
        <div class="price">${money(product.price)}</div>
        <div class="shipping">FREE delivery by Wednesday</div>
      </button>
      <div class="product-actions">
        <button type="button" data-add="${product.id}">Add to cart</button>
        <button class="details-button" type="button" data-view="${product.id}">Quick view</button>
      </div>
    </article>
  `;
}

function visibleProducts() {
  return products.filter((product) => {
    const matchesFilter = matchesCategory(product, state.filter);
    const searchText = `${product.name} ${product.category} ${product.badge} ${product.tags.join(" ")} ${product.details.join(" ")}`.toLowerCase();
    const matchesQuery = searchText.includes(state.query);
    return matchesFilter && matchesQuery;
  });
}

function renderProducts() {
  if (!productGrid || !resultCount) {
    return;
  }

  const visible = visibleProducts();
  resultCount.textContent = `${visible.length} result${visible.length === 1 ? "" : "s"}`;

  if (!visible.length) {
    productGrid.innerHTML = `<p class="empty-results">No products matched your search. Try a broader category or shorter keyword.</p>`;
    return;
  }

  productGrid.innerHTML = visible.map(productCard).join("");
}

function renderRow(row, filter, limit = 8) {
  if (!row) {
    return;
  }

  row.innerHTML = products
    .filter((product) => matchesCategory(product, filter))
    .slice(0, limit)
    .map(productCard)
    .join("");
}

function renderRows() {
  renderRow(dealRow, "deals", 10);
  renderRow(freshRow, "grocery", 8);
  renderRow(electronicsRow, "electronics", 8);
  renderRow(homeRow, "home", 8);
  renderRow(fashionRow, "fashion", 8);
  renderRow(beautyRow, "beauty", 8);
  renderRow(bubuRow, "bubu", 8);
}

function openCart() {
  cartDrawer?.classList.add("is-open");
  cartDrawer?.setAttribute("aria-hidden", "false");
}

function closeCartPanel() {
  cartDrawer?.classList.remove("is-open");
  cartDrawer?.setAttribute("aria-hidden", "true");
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  const existing = state.cart.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }

  renderCart();
}

function changeCartQuantity(productId, change) {
  const item = state.cart.find((cartItem) => cartItem.id === productId);
  if (!item) {
    return;
  }

  item.quantity += change;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((cartItem) => cartItem.id !== productId);
  }

  renderCart();
}

function renderCart() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartCount) cartCount.textContent = totalItems;
  if (mobileCartCount) mobileCartCount.textContent = totalItems;
  if (cartTotal) cartTotal.textContent = money(total);

  if (!cartItems) {
    return;
  }

  if (!state.cart.length) {
    cartItems.innerHTML = `<p class="empty-cart">Your cart is empty. Add a few finds from the deals and recommendations.</p>`;
    return;
  }

  cartItems.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-line">
          <img alt="${item.name}" src="${item.image}" />
          <div>
            <h3>${item.name}</h3>
            <p>${money(item.price)} each</p>
            <div class="cart-quantity" aria-label="Quantity controls for ${item.name}">
              <button type="button" data-cart-change="-1" data-cart-id="${item.id}">-</button>
              <strong>${item.quantity}</strong>
              <button type="button" data-cart-change="1" data-cart-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function setFilter(filter) {
  state.filter = filter;
  if (categorySelect) {
    categorySelect.value = Array.from(categorySelect.options).some((option) => option.value === filter) ? filter : "all";
  }
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });
  renderProducts();
}

function openProductModal(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || !productModal || !productModalContent) {
    return;
  }

  productModalContent.innerHTML = `
    <div class="product-detail">
      <img alt="${product.name}" src="${product.image}" />
      <div>
        <span class="detail-category">${product.category}</span>
        <h2>${product.name}</h2>
        <div class="rating" aria-label="${product.rating} out of 5 stars">${stars(product.rating)} <span>${product.rating}</span></div>
        <strong class="detail-price">${money(product.price)}</strong>
        <p class="shipping">FREE delivery by Wednesday in selected Kampala areas.</p>
        <ul>
          ${product.details.map((detail) => `<li>${detail}</li>`).join("")}
        </ul>
        <button type="button" data-add="${product.id}">Add to cart</button>
      </div>
    </div>
  `;
  productModal.classList.add("is-open");
  productModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  productModal?.classList.remove("is-open");
  productModal?.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    addToCart(Number(addButton.dataset.add));
    openCart();
    return;
  }

  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    openProductModal(Number(viewButton.dataset.view));
    return;
  }

  const cartChange = event.target.closest("[data-cart-change]");
  if (cartChange) {
    changeCartQuantity(Number(cartChange.dataset.cartId), Number(cartChange.dataset.cartChange));
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

filterLinks.forEach((link) => {
  link.addEventListener("click", () => setFilter(link.dataset.filterLink));
});

filterShortcuts.forEach((button) => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filterShortcut);
    document.querySelector("#catalogTop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = searchInput.value.trim().toLowerCase();
  setFilter(categorySelect.value);
});

searchInput?.addEventListener("input", () => {
  state.query = searchInput.value.trim().toLowerCase();
  renderProducts();
});

categorySelect?.addEventListener("change", () => setFilter(categorySelect.value));

cartButton?.addEventListener("click", openCart);

cartShortcuts.forEach((shortcut) => {
  shortcut.addEventListener("click", openCart);
});

closeCart?.addEventListener("click", closeCartPanel);

cartDrawer?.addEventListener("click", (event) => {
  if (event.target === cartDrawer) {
    closeCartPanel();
  }
});

closeProductModal?.addEventListener("click", closeModal);

productModal?.addEventListener("click", (event) => {
  if (event.target === productModal) {
    closeModal();
  }
});

checkoutButton?.addEventListener("click", () => {
  if (!state.cart.length) {
    return;
  }

  localStorage.setItem("klein_cart", JSON.stringify(state.cart));
  window.location.href = "/checkout.html";
});

window.addEventListener("beforeinstallprompt", (event) => {
  if (!installButton) {
    return;
  }

  event.preventDefault();
  installPromptEvent = event;
  installButton.hidden = false;
});

installButton?.addEventListener("click", async () => {
  if (!installPromptEvent) {
    return;
  }

  installButton.hidden = true;
  installPromptEvent.prompt();
  await installPromptEvent.userChoice;
  installPromptEvent = undefined;
});

window.addEventListener("appinstalled", () => {
  installPromptEvent = undefined;
  if (installButton) {
    installButton.hidden = true;
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}

renderRows();
renderProducts();
renderCart();

const search = document.getElementById("search");
const category = document.getElementById("category");
const brand = document.getElementById("brand");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const rating = document.getElementById("rating");
const stock = document.getElementById("stock");
const sort = document.getElementById("sort");
const container = document.getElementById("productsContainer");
const message = document.getElementById("productsMessage");

function setMessage(text, isError = false) {
    if (!message) return;
    message.textContent = text;
    message.classList.toggle("error", isError);
    message.hidden = !text;
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

function productImage(product) {
    if (!product.image) return "/icons/icon.png";
    if (/^https?:\/\//.test(product.image) || product.image.startsWith("/")) return product.image;
    return `/uploads/${product.image}`;
}

async function loadSelectOptions(endpoint, select, key) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Unable to load filters.");
        const items = await response.json();

        items.forEach(item => {
            const value = item[key];
            if (!value) return;
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}

async function loadProducts() {
    const params = new URLSearchParams({
        search: search.value,
        category: category.value,
        brand: brand.value,
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
        rating: rating.value,
        stock: stock.checked ? "1" : "",
        sort: sort.value
    });

    setMessage("Loading products...");

    try {
        const response = await fetch(`/products?${params.toString()}`);
        if (!response.ok) throw new Error("Unable to load products.");
        const products = await response.json();

        container.innerHTML = "";
        if (!products.length) {
            setMessage("No products match these filters.");
            return;
        }

        setMessage("");
        container.innerHTML = products.map(product => `
            <article class="product-card">
                <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(product.name)}">
                <div class="product-card-body">
                    <p class="product-meta">${escapeHtml(product.brand || product.category || "Klein Shoppers")}</p>
                    <h2>${escapeHtml(product.name)}</h2>
                    <p class="product-rating">${Number(product.rating || 0).toFixed(1)} stars</p>
                    <p class="product-price">UGX ${Number(product.price || 0).toLocaleString()}</p>
                    <div class="product-actions">
                        <button type="button" onclick="addToCart(${Number(product.id)})">Add to Cart</button>
                        <button type="button" class="secondary" onclick="addToWishlist(${Number(product.id)})">Wishlist</button>
                    </div>
                </div>
            </article>
        `).join("");
    } catch (error) {
        console.error(error);
        container.innerHTML = "";
        setMessage(error.message, true);
    }
}

async function postJson(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Please sign in and try again.");
    }

    return result;
}

async function addToCart(productId) {
    try {
        const result = await postJson("/cart/add", { product_id: productId, quantity: 1 });
        setMessage(result.message || "Product added to cart.");
    } catch (error) {
        setMessage(error.message, true);
    }
}

async function addToWishlist(productId) {
    try {
        const result = await postJson("/wishlist/add", { product_id: productId });
        setMessage(result.message || "Product added to wishlist.");
    } catch (error) {
        setMessage(error.message, true);
    }
}

[search, category, brand, minPrice, maxPrice, rating, stock, sort].forEach(item => {
    item.addEventListener("input", loadProducts);
    item.addEventListener("change", loadProducts);
});

loadSelectOptions("/filters/categories", category, "category");
loadSelectOptions("/filters/brands", brand, "brand");
loadProducts();

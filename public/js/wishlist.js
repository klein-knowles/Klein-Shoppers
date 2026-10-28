const wishlistContainer = document.getElementById("wishlist");

function showWishlistMessage(text) {
    wishlistContainer.innerHTML = `<p class="catalog-message">${text}</p>`;
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

function imageUrl(product) {
    if (!product.image) return "/icons/icon.png";
    if (/^https?:\/\//.test(product.image) || product.image.startsWith("/")) return product.image;
    return `/uploads/${product.image}`;
}

async function loadWishlist() {
    try {
        const response = await fetch("/wishlist");
        const items = await response.json();

        if (!response.ok) {
            showWishlistMessage(items.message || "Please sign in to view your wishlist.");
            return;
        }

        if (!items.length) {
            showWishlistMessage("Your wishlist is empty.");
            return;
        }

        wishlistContainer.innerHTML = items.map(item => {
            const productId = Number(item.product_id || item.id);
            return `
                <article class="product-card">
                    <img src="${escapeHtml(imageUrl(item))}" alt="${escapeHtml(item.name)}">
                    <div class="product-card-body">
                        <p class="product-meta">${escapeHtml(item.brand || item.category || "Saved item")}</p>
                        <h2>${escapeHtml(item.name)}</h2>
                        <p class="product-price">UGX ${Number(item.price || 0).toLocaleString()}</p>
                        <div class="product-actions">
                            <button type="button" onclick="moveToCart(${productId})">Add to Cart</button>
                            <button type="button" class="secondary" onclick="removeFromWishlist(${productId})">Remove</button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    } catch (error) {
        console.error(error);
        showWishlistMessage("Unable to load your wishlist right now.");
    }
}

async function moveToCart(productId) {
    try {
        const response = await fetch("/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        const result = await response.json();

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Unable to add item to cart.");
        }

        showWishlistMessage(result.message || "Product added to cart.");
        loadWishlist();
    } catch (error) {
        showWishlistMessage(error.message);
    }
}

async function removeFromWishlist(productId) {
    try {
        const response = await fetch(`/wishlist/remove/${productId}`, { method: "DELETE" });
        const result = await response.json();

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Unable to remove item.");
        }

        loadWishlist();
    } catch (error) {
        showWishlistMessage(error.message);
    }
}

loadWishlist();

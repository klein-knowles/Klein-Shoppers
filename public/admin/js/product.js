// ==========================================
// Klein Shoppers
// Manage Products
// ==========================================

initLayout("Manage Products");

const tbody = document.querySelector("#productsTable tbody");

// ==========================================
// Load Products
// ==========================================

async function loadProducts() {

    try {

        const response = await fetch("/products");

        const products = await response.json();

        tbody.innerHTML = "";

        products.forEach(product => {

            tbody.innerHTML += `

            <tr>

                <td>${product.id}</td>

                <td>
                    <img
                        src="/uploads/${product.image}"
                        style="
                            width:60px;
                            height:60px;
                            object-fit:cover;
                            border-radius:6px;
                        ">
                </td>

                <td>${product.name}</td>

                <td>${product.category}</td>

                <td>${product.brand || ""}</td>

                <td>UGX ${Number(product.price).toLocaleString()}</td>

                <td>${product.stock}</td>

                <td>

                    <a
                        href="/admin/edit-product.html?id=${product.id}"
                        class="btn-edit">

                        Edit

                    </a>

                    <button
                        class="btn-delete"
                        onclick="deleteProduct(${product.id})">

                        Delete

                    </button>

                </td>

            </tr>

            `;

        });

    }

    catch (err) {

        console.error(err);

        alert("Unable to load products.");

    }

}

loadProducts();


// ==========================================
// Delete Product
// ==========================================

async function deleteProduct(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmDelete)
        return;

    try {

        const response = await fetch(
            "/admin/products/delete/" + id,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok)
            throw new Error(result.message);

        alert(result.message);

        loadProducts();

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}
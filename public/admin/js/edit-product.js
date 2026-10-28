// =============================================
// Klein Shoppers
// Edit Product
// =============================================

initLayout("Edit Product");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const form = document.getElementById("editProductForm");
const previewImage = document.getElementById("previewImage");
const imageInput = document.getElementById("image");

if (!productId) {

    alert("No product selected.");

    window.location.href = "/admin/products.html";

}

// =============================================
// Load Product
// =============================================

async function loadProduct() {

    try {

        const response = await fetch("/products/" + productId);

        if (!response.ok)
            throw new Error("Unable to load product.");

        const product = await response.json();

        document.getElementById("productId").value = product.id;
        document.getElementById("name").value = product.name || "";
        document.getElementById("category").value = product.category || "";
        document.getElementById("brand").value = product.brand || "";
        document.getElementById("price").value = product.price || "";
        document.getElementById("stock").value = product.stock || "";
        document.getElementById("badge").value = product.badge || "";
        document.getElementById("rating").value = product.rating || "";
        document.getElementById("tags").value = product.tags || "";
        document.getElementById("description").value = product.description || "";
        document.getElementById("specifications").value =
            product.specifications || "";

        if (product.image) {

            previewImage.src = "/uploads/" + product.image;

        } else {

            previewImage.src = "/images/no-image.png";

        }

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

loadProduct();


// =============================================
// Live Image Preview
// =============================================

imageInput.addEventListener("change", function () {

    if (!this.files.length) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        previewImage.src = e.target.result;

    };

    reader.readAsDataURL(this.files[0]);

});


// =============================================
// Update Product
// =============================================

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const button = form.querySelector("button");

    button.disabled = true;

    button.innerHTML = "Saving...";

    const formData = new FormData();

    formData.append("name", document.getElementById("name").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("category", document.getElementById("category").value);
    formData.append("brand", document.getElementById("brand").value);
    formData.append("price", document.getElementById("price").value);
    formData.append("stock", document.getElementById("stock").value);
    formData.append("badge", document.getElementById("badge").value);
    formData.append("rating", document.getElementById("rating").value);
    formData.append("tags", document.getElementById("tags").value);
    formData.append("specifications",
        document.getElementById("specifications").value);

    if (imageInput.files.length > 0) {

        formData.append("image", imageInput.files[0]);

    }

    try {

        const response = await fetch(
            "/admin/products/update/" + productId,
            {
                method: "PUT",
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok)
            throw new Error(result.message);

        alert(result.message);

        window.location.href = "/admin/products.html";

    }

    catch (err) {

        console.error(err);

        alert(err.message);

        button.disabled = false;

        button.innerHTML = "Update Product";

    }

});
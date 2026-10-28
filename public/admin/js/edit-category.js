// ==========================================
// Klein Shoppers
// Edit Category
// ==========================================

initLayout("Edit Category");

const params = new URLSearchParams(window.location.search);

const categoryId = params.get("id");

const form = document.getElementById("editCategoryForm");

const imageInput = document.getElementById("image");

const previewImage = document.getElementById("previewImage");

if (!categoryId) {

    alert("No category selected.");

    window.location.href = "/admin/categories.html";

}


// ==========================================
// Load Category
// ==========================================

async function loadCategory() {

    try {

        const response = await fetch("/categories/" + categoryId);

        if (!response.ok) {

            throw new Error("Unable to load category.");

        }

        const category = await response.json();

        document.getElementById("categoryId").value = category.id;

        document.getElementById("name").value =
            category.name || "";

        document.getElementById("description").value =
            category.description || "";

        if (category.image && category.image !== "") {

            previewImage.src =
                "/uploads/" + category.image;

        } else {

            previewImage.src =
                "/images/no-image.png";

        }

    }

    catch (err) {

        console.error(err);

        alert("Unable to load category.");

    }

}

loadCategory();


// ==========================================
// Live Preview
// ==========================================

imageInput.addEventListener("change", function () {

    if (this.files.length === 0)
        return;

    const reader = new FileReader();

    reader.onload = function (e) {

        previewImage.src = e.target.result;

    };

    reader.readAsDataURL(this.files[0]);

});


// ==========================================
// Update Category
// ==========================================

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const button = document.querySelector("button");

    button.disabled = true;

    button.innerHTML = "Saving...";

    const formData = new FormData();

    formData.append(
        "name",
        document.getElementById("name").value
    );

    formData.append(
        "description",
        document.getElementById("description").value
    );

    if (imageInput.files.length > 0) {

        formData.append(
            "image",
            imageInput.files[0]
        );

    }

    try {

        const response = await fetch(

            "/admin/categories/update/" + categoryId,

            {

                method: "PUT",

                body: formData

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(result.message);

        }

        alert(result.message);

        window.location.href =
            "/admin/categories.html";

    }

    catch (err) {

        console.error(err);

        alert(err.message);

        button.disabled = false;

        button.innerHTML = "Update Category";

    }

});
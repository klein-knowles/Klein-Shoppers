// =======================================
// Add Category
// =======================================

initLayout("Add Category");

const form = document.getElementById("categoryForm");

const imageInput = document.getElementById("image");

const previewImage = document.getElementById("previewImage");


// =======================================
// Image Preview
// =======================================

imageInput.addEventListener("change", function () {

    if (this.files.length === 0)
        return;

    const reader = new FileReader();

    reader.onload = function (e) {

        previewImage.src = e.target.result;

    };

    reader.readAsDataURL(this.files[0]);

});


// =======================================
// Save Category
// =======================================

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
            "/admin/categories/add",
            {
                method: "POST",
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

        button.innerHTML = "Save Category";

    }

});
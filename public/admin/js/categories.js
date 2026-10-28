// ==========================================
// Klein Shoppers
// Manage Categories
// ==========================================

initLayout("Manage Categories");

const tbody = document.querySelector("#categoriesTable tbody");

// ==========================================
// Load Categories
// ==========================================

async function loadCategories() {

    try {

        const response = await fetch("/categories");

        if (!response.ok) {
            throw new Error("Unable to load categories.");
        }

        const categories = await response.json();

        tbody.innerHTML = "";

        if (categories.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:30px;">
                        No categories found.
                    </td>
                </tr>
            `;

            return;

        }

        categories.forEach(category => {

            const image = category.image
                ? "/uploads/" + category.image
                : "/images/no-image.png";

            tbody.innerHTML += `

                <tr>

                    <td>${category.id}</td>

                    <td>

                        <img
                            src="${image}"
                            alt="${category.name}"
                            style="
                                width:60px;
                                height:60px;
                                object-fit:cover;
                                border-radius:8px;
                                border:1px solid #ddd;
                            ">

                    </td>

                    <td>${category.name}</td>

                    <td>${category.description || ""}</td>

                    <td>

                        <a
                            href="/admin/edit-category.html?id=${category.id}"
                            class="btn-edit">

                            Edit

                        </a>

                        <button
                            class="btn-delete"
                            onclick="deleteCategory(${category.id})">

                            Delete

                        </button>

                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

        alert("Unable to load categories.");

    }

}

loadCategories();


// ==========================================
// Delete Category
// ==========================================

async function deleteCategory(id) {

    const answer = confirm(
        "Are you sure you want to delete this category?"
    );

    if (!answer)
        return;

    try {

        const response = await fetch(
            "/admin/categories/delete/" + id,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert(result.message);

        loadCategories();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}
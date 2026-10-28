// ============================================
// Load HTML Components
// ============================================

async function loadComponent(id, file) {

    try {

        const response = await fetch(file);

        if (!response.ok) {
            throw new Error("Unable to load " + file);
        }

        document.getElementById(id).innerHTML =
            await response.text();

    } catch (error) {

        console.error(error);

    }

}

// ============================================
// Initialize Admin Layout
// ============================================

async function initLayout(title) {

    await loadComponent(
        "sidebar",
        "/admin/components/sidebar.html"
    );

    await loadComponent(
        "topbar",
        "/admin/components/topbar.html"
    );

    const pageTitle = document.getElementById("pageTitle");

    if (pageTitle) {

        pageTitle.innerText = title;

    }

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.onclick = async function () {

            try {

                await fetch("/auth/logout");

            } catch (error) {

                console.error(error);

            }

            window.location.href = "/admin/login.html";

        };

    }

}
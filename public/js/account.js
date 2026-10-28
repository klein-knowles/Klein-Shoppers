async function loadCustomer() {

    try {

        const response = await fetch("/customers/me");

        if (!response.ok) {

            window.location.href = "/login.html";

            return;

        }

        const customer = await response.json();

        document.getElementById("customerName").textContent =
            customer.first_name;

        document.getElementById("email").textContent =
            customer.email;

    }

    catch {

        window.location.href = "/login.html";

    }

}

loadCustomer();

document
.getElementById("logout")
.addEventListener("click", async () => {

    await fetch("/customers/logout", {

        method: "POST"

    });

    window.location.href = "/login.html";

});
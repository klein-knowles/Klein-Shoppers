const form = document.getElementById("loginForm");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const button = document.querySelector("button");

    button.disabled = true;

    button.innerHTML = "Logging in...";

    try {

        const response = await fetch("/customers/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                email: document.getElementById("email").value,

                password: document.getElementById("password").value

            })

        });

        const result = await response.json();

        if (!response.ok) {

            throw new Error(result.message);

        }

        alert(result.message);

        window.location.href = "/account.html";

    }

    catch (err) {

        alert(err.message);

        button.disabled = false;

        button.innerHTML = "Login";

    }

});
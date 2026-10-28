function getToken() {
    return localStorage.getItem("token");
}

function getAuthHeaders() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    };
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

function money(value) {
    return `UGX ${Number(value || 0).toLocaleString()}`;
}

function showMessage(message, type = "success") {
    const msgDiv = document.getElementById("message");
    msgDiv.textContent = message;
    msgDiv.className = `message ${type}`;
    msgDiv.style.display = "block";

    setTimeout(() => {
        msgDiv.style.display = "none";
    }, 5000);
}

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        document.querySelectorAll(".tab-btn").forEach(item => item.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(item => item.classList.remove("active"));

        this.classList.add("active");
        document.getElementById(`tab-${this.dataset.tab}`).classList.add("active");
        document.getElementById("message").style.display = "none";

        if (this.dataset.tab === "my-cards") {
            loadMyGiftCards();
        }
    });
});

document.getElementById("createForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const amount = document.getElementById("amount").value;
    const recipientEmail = document.getElementById("recipientEmail").value;
    const recipientName = document.getElementById("recipientName").value;
    const giftMessage = document.getElementById("giftMessage").value;
    const expiryDays = document.getElementById("expiryDays").value;

    try {
        const response = await fetch("/api/giftcards/create", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ amount, recipientEmail, recipientName, message: giftMessage, expiryDays })
        });
        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(data.error || data.message || "Unable to create gift card.");
        }

        showMessage(`${data.message || "Gift card created successfully."} Code: ${data.giftCard.code}`);
        this.reset();
    } catch (error) {
        showMessage(error.message, "error");
    }
});

document.getElementById("checkForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const code = document.getElementById("checkCode").value;
    const cardInfoDiv = document.getElementById("cardInfo");

    try {
        const response = await fetch("/api/giftcards/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
        });
        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(data.error || data.message || "Gift card not found.");
        }

        const card = data.giftCard;
        cardInfoDiv.style.display = "block";
        cardInfoDiv.innerHTML = `
            <div class="card-info">
                <h3>Card Information</h3>
                <div class="card-info-grid">
                    <div><span class="label">Code:</span> <span class="value">${escapeHtml(card.code)}</span></div>
                    <div><span class="label">Amount:</span> <span class="value">${money(card.amount)}</span></div>
                    <div><span class="label">Balance:</span> <span class="value">${money(card.remainingBalance)}</span></div>
                    <div><span class="label">Status:</span> <span class="value">${escapeHtml(card.status)}</span></div>
                    <div><span class="label">Expiry:</span> <span class="value">${new Date(card.expiryDate).toLocaleDateString()}</span></div>
                    <div><span class="label">Recipient:</span> <span class="value">${escapeHtml(card.recipientName || "-")}</span></div>
                </div>
                ${card.message ? `<p class="card-details">${escapeHtml(card.message)}</p>` : ""}
                ${card.isExpired ? '<p class="card-details error">This card has expired.</p>' : ""}
            </div>
        `;
        showMessage("Card found.");
    } catch (error) {
        cardInfoDiv.style.display = "none";
        showMessage(error.message, "error");
    }
});

document.getElementById("redeemForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const code = document.getElementById("redeemCode").value;
    const amount = document.getElementById("redeemAmount").value;
    const orderId = `ORDER-${Date.now()}`;

    try {
        const response = await fetch("/api/giftcards/redeem", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ code, orderId, amount })
        });
        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(data.error || data.message || "Unable to redeem gift card.");
        }

        showMessage(`${data.message || "Gift card redeemed."} Remaining: ${money(data.remainingBalance)}`);
        this.reset();
    } catch (error) {
        showMessage(error.message, "error");
    }
});

async function loadMyGiftCards() {
    const container = document.getElementById("myCardsList");
    container.innerHTML = '<p class="catalog-message">Loading gift cards...</p>';

    try {
        const response = await fetch("/api/giftcards/my-gift-cards", {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(data.error || data.message || "Please log in to view your gift cards.");
        }

        if (!data.giftCards.length) {
            container.innerHTML = '<p class="catalog-message">You do not have any gift cards yet.</p>';
            return;
        }

        container.innerHTML = data.giftCards.map(card => `
            <article class="my-card-item ${card.isExpired ? "expired" : ""}">
                <div>
                    <div class="card-code">${escapeHtml(card.code)}</div>
                    <div class="card-details">Amount: ${money(card.amount)} | Remaining: ${money(card.remainingBalance)}</div>
                    <div class="card-details">Expires: ${new Date(card.expiryDate).toLocaleDateString()}</div>
                    ${card.message ? `<div class="card-details">${escapeHtml(card.message)}</div>` : ""}
                </div>
                <span class="card-status ${card.isExpired ? "expired" : card.status}">
                    ${card.isExpired ? "Expired" : escapeHtml(card.status)}
                </span>
            </article>
        `).join("");
    } catch (error) {
        container.innerHTML = `<p class="catalog-message error">${escapeHtml(error.message)}</p>`;
    }
}

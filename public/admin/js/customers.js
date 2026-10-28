initLayout("Customers");

const customersTable = document.getElementById("customersTable");
const customerSearch = document.getElementById("customerSearch");
const refreshCustomers = document.getElementById("refreshCustomers");

let customers = [];

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

function renderCustomers() {
    const query = customerSearch.value.trim().toLowerCase();
    const filtered = customers.filter(customer => {
        const haystack = [
            customer.first_name,
            customer.last_name,
            customer.email,
            customer.phone
        ].join(" ").toLowerCase();

        return haystack.includes(query);
    });

    if (!filtered.length) {
        customersTable.innerHTML = '<tr><td colspan="5" class="empty-message">No customers found.</td></tr>';
        return;
    }

    customersTable.innerHTML = filtered.map(customer => `
        <tr>
            <td>${Number(customer.id)}</td>
            <td>${escapeHtml([customer.first_name, customer.last_name].filter(Boolean).join(" "))}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${escapeHtml(customer.phone || "-")}</td>
            <td>${customer.created_at ? new Date(customer.created_at).toLocaleDateString() : "-"}</td>
        </tr>
    `).join("");
}

async function loadCustomers() {
    customersTable.innerHTML = '<tr><td colspan="5" class="empty-message">Loading customers...</td></tr>';

    try {
        const response = await fetch("/admin/customers");
        if (!response.ok) throw new Error("Unable to load customers.");

        customers = await response.json();
        renderCustomers();
    } catch (error) {
        console.error(error);
        customersTable.innerHTML = `<tr><td colspan="5" class="empty-message">${escapeHtml(error.message)}</td></tr>`;
    }
}

customerSearch.addEventListener("input", renderCustomers);
refreshCustomers.addEventListener("click", loadCustomers);

loadCustomers();

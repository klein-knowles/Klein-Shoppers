// ===========================================
// Klein Shoppers Dashboard
// ===========================================

let dashboard = {};

let revenueChart = null;

let bestChart = null;

// ===========================================
// Initialize
// ===========================================

document.addEventListener("DOMContentLoaded", async () => {

    if (typeof initLayout === "function") {

        await initLayout("Dashboard");

    }

    await loadDashboard();

    setInterval(loadDashboard, 60000);

});

// ===========================================
// Load Dashboard
// ===========================================

async function loadDashboard() {

    try {

        const response = await fetch("/dashboard");

        if (!response.ok) {

            throw new Error("Failed to load dashboard");

        }

        dashboard = await response.json();

        loadCards();

        loadRecentOrders();

        loadLowStock();

        drawRevenueChart();

        drawBestSellingChart();

    }

    catch (err) {

        console.error(err);

    }

}

// ===========================================
// KPI Cards
// ===========================================

function loadCards() {

    const stats = dashboard.stats;

    animateValue(

        "products",

        Number(stats.totalProducts || 0)

    );

    animateValue(

        "customers",

        Number(stats.totalCustomers || 0)

    );

    animateValue(

        "orders",

        Number(stats.totalOrders || 0)

    );

    animateMoney(

        "revenue",

        Number(stats.totalRevenue || 0)

    );

}

// ===========================================
// Animated Number
// ===========================================

function animateValue(id, value) {

    const el = document.getElementById(id);

    let current = 0;

    const step = Math.max(1, Math.ceil(value / 50));

    const timer = setInterval(() => {

        current += step;

        if (current >= value) {

            current = value;

            clearInterval(timer);

        }

        el.innerText = current.toLocaleString();

    }, 20);

}

// ===========================================
// Animated Currency
// ===========================================

function animateMoney(id, value) {

    const el = document.getElementById(id);

    let current = 0;

    const step = Math.max(100, Math.ceil(value / 50));

    const timer = setInterval(() => {

        current += step;

        if (current >= value) {

            current = value;

            clearInterval(timer);

        }

        el.innerText =

            "UGX " +

            current.toLocaleString();

    }, 20);

}

// ===========================================
// Recent Orders
// ===========================================

function loadRecentOrders() {

    const tbody =

        document.getElementById("recentOrders");

    tbody.innerHTML = "";

    dashboard.recentOrders.forEach(order => {

        tbody.innerHTML += `

        <tr>

            <td>${order.id}</td>

            <td>${order.customer_name}</td>

            <td>

                UGX ${Number(order.total_amount).toLocaleString()}

            </td>

            <td>

                <span class="badge bg-success">

                    ${order.payment_status}

                </span>

            </td>

        </tr>

        `;

    });

}

// ===========================================
// Low Stock
// ===========================================

function loadLowStock() {

    const tbody =

        document.getElementById("lowStock");

    tbody.innerHTML = "";

    dashboard.lowStock.forEach(product => {

        tbody.innerHTML += `

        <tr>

            <td>${product.name}</td>

            <td>

                <span class="badge bg-danger">

                    ${product.stock}

                </span>

            </td>

        </tr>

        `;

    });

}

// ===========================================
// Revenue Chart
// ===========================================

function drawRevenueChart() {

    const ctx =

        document.getElementById("revenueChart");

    const labels =

        dashboard.monthlyRevenue.map(

            r => r.month

        );

    const values =

        dashboard.monthlyRevenue.map(

            r => Number(r.revenue)

        );

    if (revenueChart) {

        revenueChart.destroy();

    }

    revenueChart = new Chart(ctx, {

        type: "line",

        data: {

            labels,

            datasets: [

                {

                    label: "Revenue",

                    data: values,

                    borderWidth: 3,

                    tension: 0.4,

                    fill: true

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

// ===========================================
// Best Sellers
// ===========================================

function drawBestSellingChart() {

    const ctx =

        document.getElementById("bestChart");

    const labels =

        dashboard.bestSelling.map(

            p => p.name

        );

    const values =

        dashboard.bestSelling.map(

            p => Number(p.sold)

        );

    if (bestChart) {

        bestChart.destroy();

    }

    bestChart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels,

            datasets: [

                {

                    data: values

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}
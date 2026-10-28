// ======================================================
// Klein Shoppers Sales Reports
// ======================================================

let reportChart = null;

let reportData = {};

let orders = [];

let filteredOrders = [];

// ======================================================
// Initialize
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {

    if (typeof initLayout === "function") {

        await initLayout("Sales Reports");

    }

    registerEvents();

    loadDefaultDates();

    await generateReport();

});

// ======================================================
// Register Events
// ======================================================

function registerEvents() {

    document
        .getElementById("loadReport")
        .addEventListener("click", generateReport);

    document
        .getElementById("searchOrder")
        .addEventListener("keyup", searchOrders);

    document
        .getElementById("csvBtn")
        .addEventListener("click", exportCSV);

    document
        .getElementById("printBtn")
        .addEventListener("click", printReport);

}

// ======================================================
// Default Dates
// ======================================================

function loadDefaultDates() {

    const today = new Date();

    const yyyy = today.getFullYear();

    const mm = String(today.getMonth() + 1).padStart(2, "0");

    const dd = String(today.getDate()).padStart(2, "0");

    const date = `${yyyy}-${mm}-${dd}`;

    document.getElementById("startDate").value = date;

    document.getElementById("endDate").value = date;

}

// ======================================================
// Generate Report
// ======================================================

async function generateReport() {

    try {

        showLoading();

        const type = document
            .getElementById("reportType")
            .value;

        const start =
            document.getElementById("startDate").value;

        const end =
            document.getElementById("endDate").value;

        let reportURL = "";

        switch(type){

            case "daily":

                reportURL="/reports/daily";

                break;

            case "weekly":

                reportURL="/reports/weekly";

                break;

            case "monthly":

                reportURL="/reports/monthly";

                break;

            case "custom":

                reportURL=
                `/reports/custom?start=${start}&end=${end}`;

                break;

        }

        const response =
            await fetch(reportURL);

        reportData =
            await response.json();

        updateCards();

        await loadOrders();

        drawChart();

    }

    catch(err){

        console.error(err);

        notify(

            "Unable to generate report",

            "danger"

        );

    }

}

// ======================================================
// Load Orders
// ======================================================

async function loadOrders(){

    const start =
        document.getElementById("startDate").value;

    const end =
        document.getElementById("endDate").value;

    const response =
        await fetch(

            `/reports/orders?start=${start}&end=${end}`

        );

    orders =
        await response.json();

    filteredOrders = orders;

    renderOrders();

}

// ======================================================
// KPI Cards
// ======================================================

function updateCards(){

    animateMoney(

        "revenue",

        Number(reportData.revenue || 0)

    );

    animateNumber(

        "orders",

        Number(reportData.orders || 0)

    );

    animateMoney(

        "average",

        Number(reportData.average || 0)

    );

}

// ======================================================
// Animated Number
// ======================================================

function animateNumber(id,value){

    const el=document.getElementById(id);

    let current=0;

    const step=Math.max(1,Math.ceil(value/40));

    const timer=setInterval(()=>{

        current+=step;

        if(current>=value){

            current=value;

            clearInterval(timer);

        }

        el.innerText=current.toLocaleString();

    },20);

}

// ======================================================
// Animated Money
// ======================================================

function animateMoney(id,value){

    const el=document.getElementById(id);

    let current=0;

    const step=Math.max(100,Math.ceil(value/50));

    const timer=setInterval(()=>{

        current+=step;

        if(current>=value){

            current=value;

            clearInterval(timer);

        }

        el.innerText=

        "UGX "+current.toLocaleString();

    },20);

}

// ======================================================
// Revenue Chart
// ======================================================

function drawChart(){

    const ctx=

    document.getElementById("reportChart");

    if(reportChart){

        reportChart.destroy();

    }

    reportChart=new Chart(ctx,{

        type:"bar",

        data:{

            labels:["Orders","Revenue","Average"],

            datasets:[{

                label:"Sales Report",

                data:[

                    reportData.orders,

                    reportData.revenue,

                    reportData.average

                ],

                borderWidth:2

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

}

// ======================================================
// Render Orders Table
// ======================================================

function renderOrders() {

    const tbody =
        document.getElementById("ordersTable");

    tbody.innerHTML = "";

    if (filteredOrders.length === 0) {

        tbody.innerHTML = `

        <tr>

            <td colspan="5"
                class="text-center p-5 text-muted">

                No orders found.

            </td>

        </tr>

        `;

        return;

    }

    filteredOrders.forEach(order => {

        tbody.innerHTML += `

        <tr>

            <td>

                #${order.id}

            </td>

            <td>

                ${order.customer_name}

            </td>

            <td>

                UGX ${Number(order.total_amount).toLocaleString()}

            </td>

            <td>

                ${statusBadge(order.payment_status)}

            </td>

            <td>

                ${formatDate(order.created_at)}

            </td>

        </tr>

        `;

    });

}

// ======================================================
// Search Orders
// ======================================================

function searchOrders() {

    const keyword =

        document
        .getElementById("searchOrder")
        .value
        .toLowerCase();

    filteredOrders = orders.filter(order =>

        String(order.id)
        .includes(keyword)

        ||

        (order.customer_name || "")
        .toLowerCase()
        .includes(keyword)

        ||

        (order.payment_status || "")
        .toLowerCase()
        .includes(keyword)

        ||

        String(order.total_amount)
        .includes(keyword)

    );

    renderOrders();

}

// ======================================================
// Payment Status Badge
// ======================================================

function statusBadge(status){

    switch((status || "").toLowerCase()){

        case "paid":

            return `

            <span class="badge bg-success">

                Paid

            </span>

            `;

        case "pending":

            return `

            <span class="badge bg-warning text-dark">

                Pending

            </span>

            `;

        case "failed":

            return `

            <span class="badge bg-danger">

                Failed

            </span>

            `;

        case "cancelled":

            return `

            <span class="badge bg-secondary">

                Cancelled

            </span>

            `;

        default:

            return `

            <span class="badge bg-info">

                ${status}

            </span>

            `;

    }

}

// ======================================================
// Date Format
// ======================================================

function formatDate(date){

    if(!date){

        return "-";

    }

    return new Date(date)
        .toLocaleDateString(

            "en-UG",

            {

                year:"numeric",

                month:"short",

                day:"numeric"

            }

        );

}

// ======================================================
// Loading
// ======================================================

function showLoading(){

    document
    .getElementById("ordersTable")
    .innerHTML=`

    <tr>

        <td colspan="5"
            class="text-center p-5">

            <div class="spinner-border text-primary">

            </div>

            <br><br>

            Loading report...

        </td>

    </tr>

    `;

}

// ======================================================
// Refresh Table
// ======================================================

async function refreshTable(){

    await loadOrders();

}

// ======================================================
// Quick Report Buttons
// ======================================================

function loadToday(){

    document
    .getElementById("reportType")
    .value="daily";

    generateReport();

}

function loadWeek(){

    document
    .getElementById("reportType")
    .value="weekly";

    generateReport();

}

function loadMonth(){

    document
    .getElementById("reportType")
    .value="monthly";

    generateReport();

}

// ======================================================
// Auto Refresh Every Minute
// ======================================================

setInterval(()=>{

    generateReport();

},60000);

// ======================================================
// Export CSV
// ======================================================

function exportCSV() {

    if (filteredOrders.length === 0) {

        notify("No data available to export.", "warning");

        return;

    }

    let csv =
        "Order ID,Customer,Total Amount,Payment Status,Date\n";

    filteredOrders.forEach(order => {

        csv += `"${order.id}",`;

        csv += `"${order.customer_name}",`;

        csv += `"${order.total_amount}",`;

        csv += `"${order.payment_status}",`;

        csv += `"${formatDate(order.created_at)}"\n`;

    });

    const blob = new Blob(

        [csv],

        {

            type: "text/csv;charset=utf-8;"

        }

    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =

        "sales-report-" +

        new Date().toISOString().split("T")[0] +

        ".csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    notify("CSV exported successfully.");

}

// ======================================================
// Print Report
// ======================================================

function printReport() {

    window.print();

}

// ======================================================
// Toast Notification
// ======================================================

function notify(message, type = "success") {

    const existing = document.getElementById("reportToast");

    if (existing) {

        existing.remove();

    }

    const toast = document.createElement("div");

    toast.id = "reportToast";

    toast.className =
        `toast align-items-center text-bg-${type} border-0 position-fixed`;

    toast.style.top = "20px";

    toast.style.right = "20px";

    toast.style.zIndex = "99999";

    toast.innerHTML = `

    <div class="d-flex">

        <div class="toast-body">

            ${message}

        </div>

        <button

            type="button"

            class="btn-close btn-close-white me-2 m-auto"

            data-bs-dismiss="toast">

        </button>

    </div>

    `;

    document.body.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast);

    bsToast.show();

    toast.addEventListener("hidden.bs.toast", () => {

        toast.remove();

    });

}

// ======================================================
// Report Summary
// ======================================================

function reportSummary() {

    console.table({

        Orders: reportData.orders,

        Revenue: reportData.revenue,

        Average: reportData.average

    });

}

// ======================================================
// Keyboard Shortcuts
// ======================================================

document.addEventListener("keydown", function(e) {

    // Ctrl + P

    if (e.ctrlKey && e.key === "p") {

        e.preventDefault();

        printReport();

    }

    // Ctrl + E

    if (e.ctrlKey && e.key === "e") {

        e.preventDefault();

        exportCSV();

    }

    // F5 refresh report only

    if (e.key === "F5") {

        e.preventDefault();

        generateReport();

    }

});

// ======================================================
// Chart Resize
// ======================================================

window.addEventListener("resize", () => {

    if (reportChart) {

        reportChart.resize();

    }

});

// ======================================================
// Currency Formatter
// ======================================================

function formatCurrency(amount) {

    return "UGX " +

        Number(amount || 0).toLocaleString(

            "en-UG"

        );

}

// ======================================================
// Total Orders Amount
// ======================================================

function calculateTotalRevenue() {

    return filteredOrders.reduce(

        (sum, order) =>

            sum + Number(order.total_amount || 0),

        0

    );

}

// ======================================================
// Footer Statistics
// ======================================================

function footerStatistics() {

    console.log({

        totalOrders: filteredOrders.length,

        totalRevenue: calculateTotalRevenue()

    });

}

// ======================================================
// End
// ======================================================

console.log(

    "✅ Klein Shoppers Sales Reports Loaded"

);
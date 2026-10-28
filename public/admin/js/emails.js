// ======================================================
// KLEIN SHOPPERS
// EMAIL CENTER
// ======================================================

const API = "/emails";

let emails = [];

let filteredEmails = [];

let currentEmail = null;

let refreshInterval = null;

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    loadStatistics();

    loadEmails();

    registerEvents();

    startAutoRefresh();

});

// ======================================================
// REGISTER EVENTS
// ======================================================

function registerEvents() {

    const search = document.getElementById("search");

    if (search) {

        search.addEventListener("keyup", filterEmails);

    }

    const status = document.getElementById("statusFilter");

    if (status) {

        status.addEventListener("change", filterEmails);

    }

    const type = document.getElementById("typeFilter");

    if (type) {

        type.addEventListener("change", filterEmails);

    }

    const refresh = document.getElementById("refreshBtn");

    if (refresh) {

        refresh.addEventListener("click", () => {

            loadStatistics();

            loadEmails();

        });

    }

}

// ======================================================
// LOAD DASHBOARD STATISTICS
// ======================================================

async function loadStatistics() {

    try {

        const response = await fetch(`${API}/stats`);

        const stats = await response.json();

        document.getElementById("totalEmails").textContent =
            stats.total || 0;

        document.getElementById("sentEmails").textContent =
            stats.sent || 0;

        document.getElementById("pendingEmails").textContent =
            stats.pending || 0;

        document.getElementById("failedEmails").textContent =
            stats.failed || 0;

        document.getElementById("newsletterCount").textContent =
            stats.newsletters || 0;

        document.getElementById("promotionCount").textContent =
            stats.promotions || 0;

    }

    catch (err) {

        console.error(err);

    }

}

// ======================================================
// LOAD EMAILS
// ======================================================

async function loadEmails() {

    try {

        showLoading();

        const response = await fetch(API);

        emails = await response.json();

        filteredEmails = [...emails];

        renderEmails();

        hideLoading();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(

            "Unable to load emails.",

            "danger"

        );

    }

}

// ======================================================
// FILTER EMAILS
// ======================================================

function filterEmails() {

    const keyword =
        document.getElementById("search")
            .value
            .toLowerCase();

    const status =
        document.getElementById("statusFilter").value;

    const type =
        document.getElementById("typeFilter").value;

    filteredEmails = emails.filter(email => {

        const searchMatch =

            email.recipient.toLowerCase().includes(keyword)

            ||

            email.subject.toLowerCase().includes(keyword);

        const statusMatch =

            status === ""

            ||

            email.status === status;

        const typeMatch =

            type === ""

            ||

            email.type === type;

        return (

            searchMatch

            &&

            statusMatch

            &&

            typeMatch

        );

    });

    renderEmails();

}

// ======================================================
// RENDER TABLE
// ======================================================

function renderEmails() {

    const table = document.getElementById("emailTable");

    if (!filteredEmails.length) {

        table.innerHTML = `

        <tr>

            <td colspan="7"

                class="text-center py-5">

                No emails found.

            </td>

        </tr>

        `;

        return;

    }

    table.innerHTML = "";

    filteredEmails.forEach(email => {

        table.innerHTML += `

        <tr>

            <td>

                ${email.id}

            </td>

            <td>

                ${email.recipient}

            </td>

            <td>

                ${email.subject}

            </td>

            <td>

                <span class="badge bg-info">

                    ${email.type}

                </span>

            </td>

            <td>

                ${statusBadge(email.status)}

            </td>

            <td>

                ${formatDate(email.sent_at)}

            </td>

            <td>

                <button

                    class="btn btn-sm btn-primary"

                    onclick="previewEmail(${email.id})">

                    <i class="bi bi-eye-fill"></i>

                </button>

                <button

                    class="btn btn-sm btn-danger"

                    onclick="confirmDelete(${email.id})">

                    <i class="bi bi-trash-fill"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================================
// STATUS BADGE
// ======================================================

function statusBadge(status) {

    switch (status) {

        case "Sent":

            return `<span class="badge bg-success">Sent</span>`;

        case "Pending":

            return `<span class="badge bg-warning text-dark">Pending</span>`;

        case "Failed":

            return `<span class="badge bg-danger">Failed</span>`;

        default:

            return `<span class="badge bg-secondary">${status}</span>`;

    }

}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleString();

}

// ======================================================
// SEND SINGLE EMAIL
// ======================================================

async function sendEmail() {

    const recipient =
        document.getElementById("recipient").value.trim();

    const subject =
        document.getElementById("subject").value.trim();

    const message =
        document.getElementById("message").value.trim();

    const type =
        document.getElementById("emailType").value;

    if (!recipient || !subject || !message) {

        showToast(
            "Please complete all fields.",
            "danger"
        );

        return;

    }

    try {

        showLoading();

        const response = await fetch(`${API}/send`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                recipient,

                subject,

                message,

                type

            })

        });

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                result.message ||

                "Unable to send email.",

                "danger"

            );

            return;

        }

        bootstrap.Modal
            .getInstance(
                document.getElementById("composeModal")
            )
            .hide();

        document.getElementById("recipient").value = "";

        document.getElementById("subject").value = "";

        document.getElementById("message").value = "";

        showToast(
            "Email sent successfully.",
            "success"
        );

        loadStatistics();

        loadEmails();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(
            "Server error.",
            "danger"
        );

    }

}

// ======================================================
// SEND NEWSLETTER
// ======================================================

async function sendNewsletter() {

    const subject =
        document
            .getElementById("newsletterSubject")
            .value
            .trim();

    const message =
        document
            .getElementById("newsletterMessage")
            .value
            .trim();

    const audience =
        document
            .getElementById("newsletterAudience")
            .value;

    if (!subject || !message) {

        showToast(
            "Complete the newsletter.",
            "danger"
        );

        return;

    }

    try {

        showLoading();

        const response = await fetch(

            `${API}/newsletter`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    audience,

                    subject,

                    message

                })

            }

        );

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                result.message ||

                "Unable to send newsletter.",

                "danger"

            );

            return;

        }

        bootstrap.Modal
            .getInstance(
                document.getElementById("newsletterModal")
            )
            .hide();

        showToast(

            "Newsletter sent.",

            "success"

        );

        loadStatistics();

        loadEmails();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(
            "Server error.",
            "danger"
        );

    }

}

// ======================================================
// SEND BULK EMAIL
// ======================================================

async function sendBulkEmail() {

    const subject =
        document
            .getElementById("bulkSubject")
            .value
            .trim();

    const message =
        document
            .getElementById("bulkMessage")
            .value
            .trim();

    const type =
        document
            .getElementById("bulkType")
            .value;

    const recipients =
        document
            .getElementById("bulkRecipients")
            .value
            .split("\n")
            .map(email => email.trim())
            .filter(email => email !== "");

    if (

        recipients.length === 0 ||

        !subject ||

        !message

    ) {

        showToast(

            "Please complete all fields.",

            "danger"

        );

        return;

    }

    try {

        showLoading();

        const response = await fetch(

            `${API}/bulk`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    recipients,

                    subject,

                    message,

                    type

                })

            }

        );

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                result.message ||

                "Bulk email failed.",

                "danger"

            );

            return;

        }

        bootstrap.Modal
            .getInstance(
                document.getElementById("bulkEmailModal")
            )
            .hide();

        showToast(

            `Sent to ${result.report.sent} recipient(s).`,

            "success"

        );

        loadStatistics();

        loadEmails();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(
            "Server error.",
            "danger"
        );

    }

}

// ======================================================
// SEND TEST SMTP EMAIL
// ======================================================

async function sendTestEmail() {

    const email =
        document
            .getElementById("testEmail")
            .value
            .trim();

    if (!email) {

        showToast(

            "Enter an email address.",

            "danger"

        );

        return;

    }

    try {

        showLoading();

        const response = await fetch(

            `${API}/test`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    email

                })

            }

        );

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                result.message ||

                "SMTP test failed.",

                "danger"

            );

            return;

        }

        bootstrap.Modal
            .getInstance(
                document.getElementById("smtpModal")
            )
            .hide();

        showToast(

            "SMTP test email sent.",

            "success"

        );

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(
            "Server error.",
            "danger"
        );

    }

}

// ======================================================
// PREVIEW EMAIL
// ======================================================

async function previewEmail(id) {

    try {

        showLoading();

        const response = await fetch(`${API}/${id}`);

        const email = await response.json();

        hideLoading();

        currentEmail = email;

        document.getElementById("previewRecipient").textContent =
            email.recipient;

        document.getElementById("previewStatus").innerHTML =
            statusBadge(email.status);

        document.getElementById("previewType").textContent =
            email.type;

        document.getElementById("previewDate").textContent =
            formatDate(email.sent_at);

        document.getElementById("previewSubject").textContent =
            email.subject;

        document.getElementById("previewMessage").innerHTML =
            email.message;

        new bootstrap.Modal(

            document.getElementById("previewModal")

        ).show();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(

            "Unable to load email.",

            "danger"

        );

    }

}

// ======================================================
// DELETE EMAIL
// ======================================================

function confirmDelete(id) {

    document.getElementById("deleteEmailId").value = id;

    new bootstrap.Modal(

        document.getElementById("deleteModal")

    ).show();

}

async function deleteEmail() {

    const id =

        document.getElementById("deleteEmailId").value;

    try {

        showLoading();

        const response = await fetch(

            `${API}/${id}`,

            {

                method: "DELETE"

            }

        );

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                result.message ||

                "Unable to delete.",

                "danger"

            );

            return;

        }

        bootstrap.Modal
            .getInstance(

                document.getElementById("deleteModal")

            ).hide();

        showToast(

            "Email deleted successfully.",

            "success"

        );

        loadStatistics();

        loadEmails();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(

            "Server error.",

            "danger"

        );

    }

}

// ======================================================
// LOADING MODAL
// ======================================================

function showLoading() {

    const modal =

        new bootstrap.Modal(

            document.getElementById("loadingModal")

        );

    modal.show();

}

function hideLoading() {

    const element =

        document.getElementById("loadingModal");

    const modal =

        bootstrap.Modal.getInstance(element);

    if (modal) {

        modal.hide();

    }

}

// ======================================================
// TOAST
// ======================================================

function showToast(

    message,

    type = "success"

) {

    const toast =

        document.getElementById("toast");

    const body =

        document.getElementById("toastMessage");

    body.textContent = message;

    toast.className =

        "toast align-items-center border-0";

    switch (type) {

        case "success":

            toast.classList.add("text-bg-success");

            break;

        case "danger":

            toast.classList.add("text-bg-danger");

            break;

        case "warning":

            toast.classList.add("text-bg-warning");

            break;

        default:

            toast.classList.add("text-bg-primary");

    }

    new bootstrap.Toast(toast).show();

}

// ======================================================
// AUTO REFRESH
// ======================================================

function startAutoRefresh() {

    stopAutoRefresh();

    refreshInterval =

        setInterval(() => {

            loadStatistics();

            loadEmails();

        }, 60000);

}

function stopAutoRefresh() {

    if (refreshInterval) {

        clearInterval(refreshInterval);

    }

}

// ======================================================
// EXPORT EMAILS
// ======================================================

function exportEmails() {

    let csv =

        "ID,Recipient,Subject,Type,Status,Sent At\n";

    filteredEmails.forEach(email => {

        csv +=

            `"${email.id}","${email.recipient}","${email.subject}","${email.type}","${email.status}","${formatDate(email.sent_at)}"\n`;

    });

    const blob =

        new Blob(

            [csv],

            {

                type: "text/csv"

            }

        );

    const url =

        URL.createObjectURL(blob);

    const link =

        document.createElement("a");

    link.href = url;

    link.download = "emails.csv";

    link.click();

    URL.revokeObjectURL(url);

}

// ======================================================
// RESET COMPOSE FORM
// ======================================================

function clearComposeForm() {

    document.getElementById("recipient").value = "";

    document.getElementById("subject").value = "";

    document.getElementById("message").value = "";

    document.getElementById("emailType").selectedIndex = 0;

}

// ======================================================
// RESET BULK FORM
// ======================================================

function clearBulkForm() {

    document.getElementById("bulkRecipients").value = "";

    document.getElementById("bulkSubject").value = "";

    document.getElementById("bulkMessage").value = "";

    document.getElementById("bulkType").selectedIndex = 0;

}

// ======================================================
// RESET NEWSLETTER FORM
// ======================================================

function clearNewsletterForm() {

    document.getElementById("campaignName").value = "";

    document.getElementById("newsletterSubject").value = "";

    document.getElementById("newsletterMessage").value = "";

    document.getElementById("newsletterDate").value = "";

    document.getElementById("newsletterAudience").selectedIndex = 0;

}
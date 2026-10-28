// ======================================
// Admin Management
// ======================================

let admins = [];

let filteredAdmins = [];

let editMode = false;

let currentAdminId = null;

let adminModal;

let passwordModal;

// ======================================
// Initialize
// ======================================

document.addEventListener("DOMContentLoaded", async () => {

    if (typeof initLayout === "function") {

        await initLayout("Administrators");

    }

    adminModal = new bootstrap.Modal(
        document.getElementById("adminModal")
    );

    passwordModal = new bootstrap.Modal(
        document.getElementById("passwordModal")
    );

    await loadAdmins();

    registerEvents();

});

// ======================================
// Register Events
// ======================================

function registerEvents() {

    document
        .getElementById("search")
        .addEventListener("keyup", searchAdmins);

    document
        .getElementById("saveAdmin")
        .addEventListener("click", saveAdmin);

    document
        .getElementById("savePassword")
        .addEventListener("click", updatePassword);

}

// ======================================
// Load Admins
// ======================================

async function loadAdmins() {

    try {

        const response = await fetch("/admins");

        admins = await response.json();

        filteredAdmins = admins;

        renderTable();

        updateCards();

    }

    catch (err) {

        console.error(err);

        alert("Unable to load administrators.");

    }

}

// ======================================
// Dashboard Cards
// ======================================

function updateCards() {

    document.getElementById("totalAdmins").innerText =
        admins.length;

    document.getElementById("superAdmins").innerText =
        admins.filter(a => a.role === "Super Admin").length;

    document.getElementById("managers").innerText =
        admins.filter(a => a.role === "Manager").length;

    document.getElementById("staff").innerText =
        admins.filter(a => a.role === "Staff").length;

}

// ======================================
// Search
// ======================================

function searchAdmins() {

    const keyword = document
        .getElementById("search")
        .value
        .toLowerCase();

    filteredAdmins = admins.filter(admin =>

        admin.full_name.toLowerCase().includes(keyword) ||

        admin.email.toLowerCase().includes(keyword) ||

        admin.role.toLowerCase().includes(keyword)

    );

    renderTable();

}

// ======================================
// Render Table
// ======================================

function renderTable() {

    const tbody =
        document.getElementById("adminTable");

    tbody.innerHTML = "";

    filteredAdmins.forEach(admin => {

        tbody.innerHTML += `

        <tr>

            <td>${admin.id}</td>

            <td>${admin.full_name}</td>

            <td>${admin.email}</td>

            <td>

                <span class="badge bg-primary">

                    ${admin.role}

                </span>

            </td>

            <td>

                <span class="badge ${admin.status=="Active"?"bg-success":"bg-danger"}">

                    ${admin.status}

                </span>

            </td>

            <td>

                ${formatDate(admin.created_at)}

            </td>

            <td>

                <button
                class="btn btn-sm btn-warning me-1"
                onclick="editAdmin(${admin.id})">

                    <i class="bi bi-pencil"></i>

                </button>

                <button
                class="btn btn-sm btn-success me-1"
                onclick="changePassword(${admin.id})">

                    <i class="bi bi-key"></i>

                </button>

                <button
                class="btn btn-sm btn-danger"
                onclick="deleteAdmin(${admin.id})">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================
// Edit
// ======================================

function editAdmin(id){

    const admin =
        admins.find(a => a.id == id);

    editMode = true;

    currentAdminId = id;

    document.getElementById("adminId").value =
        admin.id;

    document.getElementById("full_name").value =
        admin.full_name;

    document.getElementById("email").value =
        admin.email;

    document.getElementById("password").value =
        "";

    document.getElementById("role").value =
        admin.role;

    document.getElementById("status").value =
        admin.status;

    adminModal.show();

}

// ======================================
// Save Administrator
// ======================================

async function saveAdmin() {

    const full_name =
        document.getElementById("full_name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const role =
        document.getElementById("role").value;

    const status =
        document.getElementById("status").value;

    if (full_name === "") {

        return alert("Full name is required.");

    }

    if (email === "") {

        return alert("Email is required.");

    }

    if (!editMode && password === "") {

        return alert("Password is required.");

    }

    const data = {

        full_name,

        email,

        role,

        status

    };

    if (!editMode) {

        data.password = password;

    }

    try {

        let response;

        if (editMode) {

            response = await fetch(

                "/admins/" + currentAdminId,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(data)

                }

            );

        } else {

            response = await fetch(

                "/admins",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(data)

                }

            );

        }

        const result = await response.json();

        notify(result.message);

        adminModal.hide();

        clearForm();

        await loadAdmins();

    }

    catch (err) {

        console.error(err);

        alert("Unable to save administrator.");

    }

}

// ======================================
// Delete Administrator
// ======================================

async function deleteAdmin(id) {

    const confirmDelete = confirm(

        "Delete this administrator?"

    );

    if (!confirmDelete) {

        return;

    }

    try {

        const response = await fetch(

            "/admins/" + id,

            {

                method: "DELETE"

            }

        );

        const result = await response.json();

        alert(result.message);

        await loadAdmins();

    }

    catch (err) {

        console.error(err);

     notify("Delete failed.","danger");   

    }

}

// ======================================
// Change Password
// ======================================

function changePassword(id) {

    document.getElementById(

        "passwordAdminId"

    ).value = id;

    document.getElementById(

        "newPassword"

    ).value = "";

    passwordModal.show();

}

// ======================================
// Update Password
// ======================================

async function updatePassword() {

    const id =

        document.getElementById(

            "passwordAdminId"

        ).value;

    const password =

        document.getElementById(

            "newPassword"

        ).value;

    if (password === "") {

        return alert(

            "Enter a password."

        );

    }

    try {

        const response = await fetch(

            "/admins/" + id + "/password",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    password

                })

            }

        );

        const result = await response.json();

        alert(result.message);

        passwordModal.hide();

    }

    catch (err) {

        console.error(err);

        alert("Password update failed.");

    }

}

// ======================================
// Clear Form
// ======================================

function clearForm() {

    editMode = false;

    currentAdminId = null;

    document.getElementById("adminId").value = "";

    document.getElementById("full_name").value = "";

    document.getElementById("email").value = "";

    document.getElementById("password").value = "";

    document.getElementById("role").selectedIndex = 0;

    document.getElementById("status").selectedIndex = 0;

}

// ======================================
// Reset Form When Modal Closes
// ======================================

document
    .getElementById("adminModal")
    .addEventListener("hidden.bs.modal", () => {

        clearForm();

    });

    // ======================================
// Format Date
// ======================================

function formatDate(date) {

    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleDateString("en-UG", {

        year: "numeric",

        month: "short",

        day: "numeric"

    });

}

// ======================================
// Loading
// ======================================

function showLoading() {

    const tbody = document.getElementById("adminTable");

    tbody.innerHTML = `

    <tr>

        <td colspan="7" class="text-center p-5">

            <div class="spinner-border text-primary"></div>

            <br><br>

            Loading administrators...

        </td>

    </tr>

    `;

}

// ======================================
// Empty Table
// ======================================

function showEmpty() {

    const tbody = document.getElementById("adminTable");

    tbody.innerHTML = `

    <tr>

        <td colspan="7"

        class="text-center text-muted p-5">

            No administrators found.

        </td>

    </tr>

    `;

}

// ======================================
// Refresh
// ======================================

async function refreshAdmins(){

    showLoading();

    await loadAdmins();

}

// ======================================
// Override Render
// ======================================

const oldRenderTable = renderTable;

renderTable = function(){

    if(filteredAdmins.length===0){

        showEmpty();

        return;

    }

    oldRenderTable();

}

// ======================================
// Toast
// ======================================

function notify(message,type="success"){

    const toast=document.createElement("div");

    toast.className=

    `toast align-items-center text-bg-${type}
    border-0 position-fixed`;

    toast.style.top="20px";

    toast.style.right="20px";

    toast.style.zIndex="99999";

    toast.innerHTML=`

    <div class="d-flex">

        <div class="toast-body">

            ${message}

        </div>

        <button

        class="btn-close btn-close-white me-2 m-auto"

        data-bs-dismiss="toast">

        </button>

    </div>

    `;

    document.body.appendChild(toast);

    const bsToast=new bootstrap.Toast(toast);

    bsToast.show();

    toast.addEventListener(

        "hidden.bs.toast",

        ()=>toast.remove()

    );

}

// ======================================
// Export CSV
// ======================================

function exportAdmins(){

    let csv=

    "ID,Name,Email,Role,Status,Created\n";

    admins.forEach(a=>{

        csv+=`${a.id},"${a.full_name}",${a.email},${a.role},${a.status},${formatDate(a.created_at)}\n`;

    });

    const blob=new Blob(

        [csv],

        {type:"text/csv"}

    );

    const url=window.URL.createObjectURL(blob);

    const link=document.createElement("a");

    link.href=url;

    link.download="administrators.csv";

    link.click();

}

// ======================================
// Print
// ======================================

function printAdmins(){

    window.print();

}

// ======================================
// Keyboard Shortcut
// Ctrl + N
// ======================================

document.addEventListener(

"keydown",

function(e){

    if(e.ctrlKey && e.key==="n"){

        e.preventDefault();

        clearForm();

        adminModal.show();

    }

});

// ======================================
// ESC closes modal
// ======================================

document.addEventListener(

"keydown",

function(e){

    if(e.key==="Escape"){

        adminModal.hide();

        passwordModal.hide();

    }

});

// ======================================
// Auto Refresh Every Minute
// ======================================

setInterval(()=>{

    loadAdmins();

},60000);

// ======================================
// End
// ======================================
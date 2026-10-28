// =====================================================
// Klein Shoppers Delivery Management
// =====================================================

let deliveries = [];

let filteredDeliveries = [];

document.addEventListener("DOMContentLoaded", async () => {

    if (typeof initLayout === "function") {

        await initLayout("Delivery Management");

    }

    registerEvents();

    await loadStatistics();

    await loadDeliveries();

});

// =====================================================
// Register Events
// =====================================================

function registerEvents() {

    document

        .getElementById("search")

        .addEventListener(

            "keyup",

            searchDeliveries

        );

    document

        .getElementById("statusFilter")

        .addEventListener(

            "change",

            filterStatus

        );

    document

        .getElementById("refreshBtn")

        .addEventListener(

            "click",

            refreshPage

        );

}

// =====================================================
// Load Statistics
// =====================================================

async function loadStatistics(){

    try{

        const response=

            await fetch(

                "/deliveries/stats"

            );

        const stats=

            await response.json();

        document.getElementById(

            "totalDeliveries"

        ).innerText=

            stats.total || 0;

        document.getElementById(

            "pending"

        ).innerText=

            stats.pending || 0;

        document.getElementById(

            "pickedUp"

        ).innerText=

            stats.pickedUp || 0;

        document.getElementById(

            "inTransit"

        ).innerText=

            stats.inTransit || 0;

        document.getElementById(

            "delivered"

        ).innerText=

            stats.delivered || 0;

        document.getElementById(

            "returned"

        ).innerText=

            stats.returned || 0;

    }

    catch(err){

        console.error(err);

    }

}

// =====================================================
// Load Deliveries
// =====================================================

async function loadDeliveries(){

    try{

        const response=

            await fetch(

                "/deliveries"

            );

        deliveries=

            await response.json();

        filteredDeliveries=

            deliveries;

        renderTable();

    }

    catch(err){

        console.error(err);

    }

}

// =====================================================
// Render Table
// =====================================================

function renderTable(){

    const tbody=

        document.getElementById(

            "deliveryTable"

        );

    tbody.innerHTML="";

    if(filteredDeliveries.length===0){

        tbody.innerHTML=`

        <tr>

            <td colspan="10"

            class="text-center p-5">

            No deliveries found.

            </td>

        </tr>

        `;

        return;

    }

    filteredDeliveries.forEach(delivery=>{

        tbody.innerHTML+=`

        <tr>

            <td>

                ${delivery.id}

            </td>

            <td>

                ${delivery.tracking_number}

            </td>

            <td>

                #${delivery.order_id}

            </td>

            <td>

                ${delivery.customer_name}

            </td>

            <td>

                ${delivery.courier_name}

            </td>

            <td>

                ${delivery.courier_phone}

            </td>

            <td>

                UGX

                ${Number(

                    delivery.delivery_fee

                ).toLocaleString()}

            </td>

            <td>

                ${statusBadge(

                    delivery.status

                )}

            </td>

            <td>

                ${formatDate(

                    delivery.estimated_date

                )}

            </td>

            <td>

                <button

                class="btn btn-sm btn-warning"

                onclick="editDelivery(

                    ${delivery.id}

                )">

                <i class="bi bi-pencil"></i>

                </button>

                <button

                class="btn btn-sm btn-danger"

                onclick="deleteDelivery(

                    ${delivery.id}

                )">

                <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

// =====================================================
// Status Badge
// =====================================================

function statusBadge(status){

    switch(status){

        case "Pending":

            return '<span class="badge bg-warning">Pending</span>';

        case "Picked Up":

            return '<span class="badge bg-info">Picked Up</span>';

        case "In Transit":

            return '<span class="badge bg-primary">In Transit</span>';

        case "Out For Delivery":

            return '<span class="badge bg-secondary">Out For Delivery</span>';

        case "Delivered":

            return '<span class="badge bg-success">Delivered</span>';

        case "Returned":

            return '<span class="badge bg-danger">Returned</span>';

        case "Cancelled":

            return '<span class="badge bg-dark">Cancelled</span>';

        default:

            return status;

    }

}

// =====================================================
// Date Format
// =====================================================

function formatDate(date){

    if(!date){

        return "-";

    }

    return new Date(date)

        .toLocaleDateString(

            "en-UG"

        );

}


// =====================================================
// Search Deliveries
// =====================================================

function searchDeliveries() {

    const keyword =

        document

        .getElementById("search")

        .value

        .toLowerCase()

        .trim();

    const status =

        document

        .getElementById("statusFilter")

        .value;

    filteredDeliveries = deliveries.filter(delivery => {

        const matchKeyword =

            String(delivery.id).includes(keyword)

            ||

            (delivery.tracking_number || "")

            .toLowerCase()

            .includes(keyword)

            ||

            (delivery.customer_name || "")

            .toLowerCase()

            .includes(keyword)

            ||

            (delivery.courier_name || "")

            .toLowerCase()

            .includes(keyword)

            ||

            (delivery.courier_phone || "")

            .includes(keyword);

        const matchStatus =

            status === ""

            ||

            delivery.status === status;

        return matchKeyword && matchStatus;

    });

    renderTable();

}

// =====================================================
// Status Filter
// =====================================================

function filterStatus(){

    searchDeliveries();

}

// =====================================================
// Refresh Page
// =====================================================

async function refreshPage(){

    await loadStatistics();

    await loadDeliveries();

}

// =====================================================
// Add Delivery
// =====================================================

async function saveDelivery(){

    const data={

        order_id:

        document.getElementById("orderId").value,

        tracking_number:

        document.getElementById("trackingNumber").value,

        courier_name:

        document.getElementById("courierName").value,

        courier_phone:

        document.getElementById("courierPhone").value,

        delivery_address:

        document.getElementById("deliveryAddress").value,

        delivery_fee:

        document.getElementById("deliveryFee").value,

        estimated_date:

        document.getElementById("estimatedDate").value,

        status:

        document.getElementById("deliveryStatus").value,

        notes:

        document.getElementById("notes").value

    };

    const response = await fetch(

        "/deliveries",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(data)

        }

    );

    const result = await response.json();

    notify(result.message);

    await refreshPage();

}

// =====================================================
// Edit Delivery
// =====================================================

async function editDelivery(id){

    const response =

    await fetch(

        "/deliveries/"+id

    );

    const delivery =

    await response.json();

    document.getElementById(

        "editId"

    ).value=

    delivery.id;

    document.getElementById(

        "editCourier"

    ).value=

    delivery.courier_name;

    document.getElementById(

        "editPhone"

    ).value=

    delivery.courier_phone;

    document.getElementById(

        "editFee"

    ).value=

    delivery.delivery_fee;

    document.getElementById(

        "editEstimated"

    ).value=

    delivery.estimated_date;

    document.getElementById(

        "editStatus"

    ).value=

    delivery.status;

    document.getElementById(

        "editNotes"

    ).value=

    delivery.notes;

    const modal =

    new bootstrap.Modal(

        document.getElementById(

            "editDeliveryModal"

        )

    );

    modal.show();

}

// =====================================================
// Update Delivery
// =====================================================

async function updateDelivery(){

    const id=

    document.getElementById(

        "editId"

    ).value;

    const data={

        courier_name:

        document.getElementById(

            "editCourier"

        ).value,

        courier_phone:

        document.getElementById(

            "editPhone"

        ).value,

        delivery_fee:

        document.getElementById(

            "editFee"

        ).value,

        estimated_date:

        document.getElementById(

            "editEstimated"

        ).value,

        delivered_date:

        "",

        status:

        document.getElementById(

            "editStatus"

        ).value,

        notes:

        document.getElementById(

            "editNotes"

        ).value,

        delivery_address:""

    };

    const response=

    await fetch(

        "/deliveries/"+id,

        {

            method:"PUT",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(data)

        }

    );

    const result=

    await response.json();

    notify(result.message);

    await refreshPage();

}

// =====================================================
// Delete Delivery
// =====================================================

async function deleteDelivery(id){

    if(

        !confirm(

            "Delete this delivery?"

        )

    ){

        return;

    }

    const response=

    await fetch(

        "/deliveries/"+id,

        {

            method:"DELETE"

        }

    );

    const result=

    await response.json();

    notify(result.message);

    await refreshPage();

}
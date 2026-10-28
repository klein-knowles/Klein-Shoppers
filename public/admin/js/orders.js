initLayout("Orders");

async function loadOrders() {

    try {

        const response = await fetch("/admin/orders");

        const orders = await response.json();

        const table = document.getElementById("ordersTable");

        table.innerHTML = "";

        orders.forEach(order => {

            table.innerHTML += `

<tr>

<td>#${order.id}</td>

<td>${order.first_name} ${order.last_name}</td>

<td>${order.email}</td>

<td>UGX ${Number(order.total).toLocaleString()}</td>

<td>${order.payment_status}</td>

<td>

<span class="status">

${order.status}

</span>

</td>

<td>

${new Date(order.created_at).toLocaleDateString()}

</td>

<td>

<a href="/admin/order-details.html?id=${order.id}">

<button>

View

</button>

</a>

</td>

</tr>

`;

        });

    }

    catch (err) {

        console.error(err);

        alert("Unable to load orders.");

    }

}

loadOrders();
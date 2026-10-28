async function loadOrders() {

    const response = await fetch("/orders/my-orders");

    if (!response.ok) {

        window.location.href = "/login.html";

        return;

    }

    const orders = await response.json();

    const body = document.getElementById("ordersBody");

    body.innerHTML = "";

    orders.forEach(order => {

        body.innerHTML += `

<tr>

<td>#${order.id}</td>

<td>UGX ${Number(order.total).toLocaleString()}</td>

<td>${order.status}</td>

<td>${order.payment_method}</td>

<td>${new Date(order.created_at).toLocaleString()}</td>

</tr>

`;

    });

}

loadOrders();
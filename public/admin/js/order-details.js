initLayout("Order Details");

const params = new URLSearchParams(window.location.search);

const orderId = params.get("id");

async function loadOrder(){

    const response = await fetch("/admin/orders/" + orderId);

    const data = await response.json();

    const order = data.order;

    const items = data.items;

    document.getElementById("customerInfo").innerHTML = `

<h3>Customer Information</h3>

<p><strong>Name:</strong> ${order.first_name} ${order.last_name}</p>

<p><strong>Email:</strong> ${order.email}</p>

<p><strong>Phone:</strong> ${order.phone}</p>

<p><strong>Total:</strong> UGX ${Number(order.total).toLocaleString()}</p>

<p><strong>Status:</strong> ${order.status}</p>

<p><strong>Payment:</strong> ${order.payment_status}</p>

`;

    document.getElementById("status").value = order.status;

    document.getElementById("paymentStatus").value = order.payment_status;

    let tbody = document.getElementById("itemsTable");

    tbody.innerHTML = "";

    items.forEach(item=>{

        tbody.innerHTML += `

<tr>

<td>

<img

class="product-img"

src="/uploads/${item.image}">

</td>

<td>${item.name}</td>

<td>${item.quantity}</td>

<td>UGX ${Number(item.price).toLocaleString()}</td>

<td>UGX ${(item.price*item.quantity).toLocaleString()}</td>

</tr>

`;

    });

}

loadOrder();

document

.getElementById("updateStatus")

.onclick = async function(){

    await fetch(

        "/admin/orders/status/" + orderId,

        {

            method:"PUT",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                status:document.getElementById("status").value

            })

        }

    );

    alert("Order status updated.");

    loadOrder();

};

document

.getElementById("updatePayment")

.onclick = async function(){

    await fetch(

        "/admin/orders/payment/" + orderId,

        {

            method:"PUT",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                payment_status:

                document.getElementById("paymentStatus").value

            })

        }

    );

    alert("Payment status updated.");

    loadOrder();

};
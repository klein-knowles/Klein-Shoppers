async function loadCart() {

    const response = await fetch("/cart");

    if (!response.ok) {

        window.location.href="/login.html";

        return;

    }

    const cart = await response.json();

    const tbody=document.getElementById("cartBody");

    tbody.innerHTML="";

    let grandTotal=0;

    cart.forEach(item=>{

        const total=item.price*item.quantity;

        grandTotal+=total;

        tbody.innerHTML+=`

<tr>

<td>

<img src="/uploads/${item.image}">

</td>

<td>

${item.name}

</td>

<td>

UGX ${Number(item.price).toLocaleString()}

</td>

<td>

<button

class="qty-btn"

onclick="decrease(${item.id})">

-

</button>

<b>

${item.quantity}

</b>

<button

class="qty-btn"

onclick="increase(${item.id})">

+

</button>

</td>

<td>

UGX ${total.toLocaleString()}

</td>

<td>

<button

class="remove"

onclick="removeItem(${item.id})">

Remove

</button>

</td>

</tr>

`;

    });

    document.getElementById("grandTotal").innerHTML=

        grandTotal.toLocaleString();

}

loadCart();

async function increase(id){

    await fetch("/cart/increase/"+id,{

        method:"PUT"

    });

    loadCart();

}

async function decrease(id){

    await fetch("/cart/decrease/"+id,{

        method:"PUT"

    });

    loadCart();

}

async function removeItem(id){

    if(!confirm("Remove this product?"))

        return;

    await fetch("/cart/remove/"+id,{

        method:"DELETE"

    });

    loadCart();

}

document

.getElementById("checkout")

.onclick=function(){

    window.location="/checkout.html";

};
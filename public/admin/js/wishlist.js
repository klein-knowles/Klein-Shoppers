async function loadWishlist(){

    const response=await fetch("/wishlist");

    if(!response.ok){

        window.location="/login.html";

        return;

    }

    const products=await response.json();

    const wishlist=document.getElementById("wishlist");

    wishlist.innerHTML="";

    if(products.length===0){

        wishlist.innerHTML="<h2>Your wishlist is empty.</h2>";

        return;

    }

    products.forEach(product=>{

        wishlist.innerHTML+=`

<div class="card">

<img src="/uploads/${product.image}">

<h3>${product.name}</h3>

<p>${product.description}</p>

<div class="price">

UGX ${Number(product.price).toLocaleString()}

</div>

<button

class="cart"

onclick="moveToCart(${product.id})">

Move To Cart

</button>

<button

class="remove"

onclick="removeWishlist(${product.id})">

Remove

</button>

</div>

`;

    });

}

loadWishlist();

async function removeWishlist(productId){

    if(!confirm("Remove this item?")) return;

    await fetch(

        "/wishlist/remove/"+productId,

        {

            method:"DELETE"

        }

    );

    loadWishlist();

}

async function moveToCart(productId){

    await fetch(

        "/cart/add",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                product_id:productId,

                quantity:1

            })

        }

    );

    await fetch(

        "/wishlist/remove/"+productId,

        {

            method:"DELETE"

        }

    );

    alert("Product moved to cart.");

    loadWishlist();

}
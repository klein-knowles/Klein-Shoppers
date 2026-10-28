initLayout("Inventory");

// ======================================
// Load Inventory
// ======================================

async function loadInventory() {

    const response = await fetch("/stock");

    const products = await response.json();

    const table = document.getElementById("inventoryTable");

    table.innerHTML = "";

    products.forEach(product => {

        let status = "";

        if (product.stock == 0) {

            status = "<span style='color:red;font-weight:bold;'>Out of Stock</span>";

        }

        else if (product.stock <= 5) {

            status = "<span style='color:orange;font-weight:bold;'>Low Stock</span>";

        }

        else {

            status = "<span style='color:green;font-weight:bold;'>In Stock</span>";

        }

        table.innerHTML += `

<tr>

<td>${product.id}</td>

<td>${product.name}</td>

<td>${product.category}</td>

<td>UGX ${Number(product.price).toLocaleString()}</td>

<td>${product.stock}</td>

<td>${status}</td>

<td>

<button onclick="restock(${product.id})">

Restock

</button>

</td>

</tr>

`;

    });

}

// ======================================
// Load History
// ======================================

async function loadHistory(){

    const response=await fetch("/stock/history");

    const history=await response.json();

    const table=document.getElementById("historyTable");

    table.innerHTML="";

    history.forEach(item=>{

        table.innerHTML+=`

<tr>

<td>${item.name}</td>

<td>${item.movement_type}</td>

<td>${item.quantity}</td>

<td>${item.previous_stock}</td>

<td>${item.new_stock}</td>

<td>${item.notes}</td>

<td>${new Date(item.created_at).toLocaleString()}</td>

</tr>

`;

    });

}

// ======================================
// Restock Product
// ======================================

async function restock(id){

    const quantity=prompt("Enter quantity to add:");

    if(quantity===null) return;

    const notes=prompt("Notes","Stock replenishment");

    const response=await fetch("/stock/restock/"+id,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            quantity,

            notes

        })

    });

    const result=await response.json();

    alert(result.message);

    loadInventory();

    loadHistory();

}

// ======================================

loadInventory();

loadHistory();
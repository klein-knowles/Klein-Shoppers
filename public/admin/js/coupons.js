initLayout("Coupons");

// ======================================
// Load Coupons
// ======================================

async function loadCoupons() {

    const response = await fetch("/coupons");

    const coupons = await response.json();

    const table = document.getElementById("couponTable");

    table.innerHTML = "";

    coupons.forEach(coupon => {

        table.innerHTML += `

<tr>

<td>${coupon.code}</td>

<td>${coupon.discount_type}</td>

<td>${coupon.discount_value}</td>

<td>UGX ${Number(coupon.minimum_order).toLocaleString()}</td>

<td>${coupon.expiry_date.substring(0,10)}</td>

<td>${coupon.status}</td>

<td>

<button onclick="deleteCoupon(${coupon.id})">

Delete

</button>

</td>

</tr>

`;

    });

}

loadCoupons();

// ======================================
// Add Coupon
// ======================================

document.getElementById("couponForm")

.addEventListener("submit", async function(e){

e.preventDefault();

const body={

code:document.getElementById("code").value,

discount_type:document.getElementById("discount_type").value,

discount_value:document.getElementById("discount_value").value,

minimum_order:document.getElementById("minimum_order").value,

expiry_date:document.getElementById("expiry_date").value,

status:document.getElementById("status").value

};

const response=await fetch(

"/coupons/add",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(body)

}

);

const result=await response.json();

alert(result.message);

this.reset();

loadCoupons();

});

// ======================================
// Delete Coupon
// ======================================

async function deleteCoupon(id){

if(!confirm("Delete coupon?")) return;

await fetch(

"/coupons/"+id,

{

method:"DELETE"

}

);

loadCoupons();

}
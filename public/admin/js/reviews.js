const params = new URLSearchParams(window.location.search);

const productId = params.get("id");

// =========================================
// Submit Review
// =========================================

async function submitReview() {

    const rating =
        document.getElementById("rating").value;

    const review =
        document.getElementById("review").value;

    const response = await fetch(

        "/reviews/add",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                product_id:productId,

                rating,

                review

            })

        }

    );

    const result = await response.json();

    alert(result.message);

    if(response.ok){

        document.getElementById("review").value="";

        loadReviews();

        loadAverage();

    }

}

// =========================================
// Load Reviews
// =========================================

async function loadReviews(){

    const response = await fetch(

        "/reviews/product/"+productId

    );

    const reviews = await response.json();

    const container =

        document.getElementById("reviews");

    container.innerHTML="";

    reviews.forEach(r=>{

        container.innerHTML += `

<div class="review">

<h4>

${"⭐".repeat(r.rating)}

</h4>

<p>

${r.review}

</p>

<small>

${r.first_name} ${r.last_name}

</small>

<hr>

</div>

`;

    });

}

// =========================================
// Average Rating
// =========================================

async function loadAverage(){

    const response = await fetch(

        "/reviews/average/"+productId

    );

    const avg = await response.json();

    document.getElementById("averageRating").innerHTML =

        `⭐ ${avg.average || 0} (${avg.total} Reviews)`;

}

loadReviews();

loadAverage();

initLayout("Reviews");

async function loadReviews(){

    const response=await fetch("/admin/reviews");

    const reviews=await response.json();

    const table=document.getElementById("reviewsTable");

    table.innerHTML="";

    reviews.forEach(review=>{

        table.innerHTML+=`

<tr>

<td>${review.product}</td>

<td>${review.first_name} ${review.last_name}</td>

<td>${"⭐".repeat(review.rating)}</td>

<td>${review.review}</td>

<td>${new Date(review.created_at).toLocaleDateString()}</td>

<td>

<button onclick="deleteReview(${review.id})">

Delete

</button>

</td>

</tr>

`;

    });

}

loadReviews();

async function deleteReview(id){

    if(!confirm("Delete this review?")) return;

    await fetch(

        "/admin/reviews/"+id,

        {

            method:"DELETE"

        }

    );

    loadReviews();

}
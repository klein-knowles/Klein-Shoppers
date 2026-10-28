let appliedCoupon = null;
let discountAmount = 0;
const localCart = JSON.parse(localStorage.getItem("klein_cart") || "[]");
const checkoutSummary = document.getElementById("checkoutSummary");

if (checkoutSummary && localCart.length) {

    const subtotal = localCart.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
    );

    checkoutSummary.innerHTML = `
        <div style="margin:20px 0;padding:18px;border:1px solid #ddd;border-radius:8px;background:#f8fafc;">
            <h2 style="margin-top:0;">Order Summary</h2>
            ${localCart.map(item => `
                <p style="display:flex;justify-content:space-between;gap:16px;">
                    <span>${item.name} x ${item.quantity || 1}</span>
                    <strong>UGX ${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</strong>
                </p>
            `).join("")}
            <hr>
            <p style="display:flex;justify-content:space-between;font-size:20px;">
                <span>Total</span>
                <strong>UGX ${subtotal.toLocaleString()}</strong>
            </p>
            <p style="color:#667085;">Sign in and add these items to your cart to place a tracked order.</p>
        </div>
    `;

}

async function applyCoupon() {

    const code = document
        .getElementById("couponCode")
        .value
        .trim();

    if (!code) {

        alert("Enter a coupon code.");

        return;

    }

    const response = await fetch("/coupons/validate", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            code
        })

    });

    const result = await response.json();

    if (!response.ok) {

        document.getElementById("couponMessage").innerHTML =
            result.message;

        return;

    }

    appliedCoupon = result.coupon;

    calculateTotals();

}

function calculateTotals() {

    let subtotal = cartTotal;

    discountAmount = 0;

    if (appliedCoupon) {

        if (subtotal >= Number(appliedCoupon.minimum_order)) {

            if (appliedCoupon.discount_type === "percentage") {

                discountAmount =
                    subtotal *
                    Number(appliedCoupon.discount_value) /
                    100;

            } else {

                discountAmount =
                    Number(appliedCoupon.discount_value);

            }

        }

    }

    const total = subtotal - discountAmount;

    document.getElementById("couponMessage").innerHTML =
        "Discount: UGX " +
        discountAmount.toLocaleString();

    document.getElementById("orderTotal").innerHTML =
        "UGX " +
        total.toLocaleString();

}

const button = document.getElementById("placeOrder");

button.addEventListener("click", async function () {

    button.disabled = true;

    button.innerHTML = "Processing Order...";

    try {

        const response = await fetch("/orders/checkout", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                payment_method:
                    document.getElementById("paymentMethod").value

            })

        });

        const result = await response.json();

        if (!response.ok) {

            throw new Error(result.message);

        }

        alert(

            "Order #" +

            result.order_id +

            " placed successfully!"

        );

        localStorage.removeItem("klein_cart");

        window.location.href = "/orders.html";

    }

    catch (err) {

        alert(err.message);

        button.disabled = false;

        button.innerHTML = "Place Order";

    }

});

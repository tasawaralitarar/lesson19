document.addEventListener("DOMContentLoaded", () => {
    displayCart();
});

function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function displayCart() {
    const cart = getCart();
    const cartItemsDiv = document.getElementById("cart-items");
    const summaryDiv = document.getElementById("cart-summary");

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p>カートに商品はありません。</p>";
        summaryDiv.innerHTML = "";
        return;
    }

    let html = `
        <table border="1" cellpadding="8" style="border-collapse: collapse;">
            <thead>
                <tr>
                    <th>商品名</th>
                    <th>価格</th>
                    <th>数量</th>
                    <th>小計</th>
                </tr>
            </thead>
            <tbody>
    `;

    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
            <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>¥${item.price.toLocaleString()}</td>
                <td>${item.quantity}</td>
                <td>¥${subtotal.toLocaleString()}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    cartItemsDiv.innerHTML = html;

    summaryDiv.innerHTML = `
        <h3>合計金額: ¥${total.toLocaleString()}</h3>
        <button id="checkout-btn" onclick="submitOrder()">注文を確定する</button>
    `;
}

async function submitOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("カートが空です。");
        return;
    }

    const btn = document.getElementById("checkout-btn");
    if (btn) btn.disabled = true;

    try {
        for (const item of cart) {
            const payload = {
                product_id: item.id,
                quantity: item.quantity
            };

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("注文処理に失敗しました。");
            }
        }

        localStorage.removeItem("cart");
        displayCart();

        const msgDiv = document.getElementById("message");
        msgDiv.innerText = "注文しました";
        msgDiv.style.display = "block";

        setTimeout(() => {
            msgDiv.style.display = "none";
        }, 3000);

    } catch (error) {
        console.error("Error submitting order:", error);
        alert("注文に失敗しました。");
        if (btn) btn.disabled = false;
    }
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m];
    });
}
document.addEventListener("DOMContentLoaded", () => {
    fetchOrders();
});

function fetchOrders() {
    fetch("/api/orders")
        .then(response => {
            if (!response.ok) {
                throw new Error("注文履歴の取得に失敗しました。");
            }
            return response.json();
        })
        .then(orders => {
            const listDiv = document.getElementById("orders-list");

            if (!orders || orders.length === 0) {
                listDiv.innerHTML = "<p>注文履歴はありません。</p>";
                return;
            }

            let html = `
                <table border="1" cellpadding="8" style="border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th>注文日時</th>
                            <th>商品名</th>
                            <th>価格</th>
                            <th>数量</th>
                            <th>小計</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            orders.forEach(item => {
                const subtotal = item.price * item.quantity;
                html += `
                    <tr>
                        <td>${escapeHtml(item.created_at)}</td>
                        <td>${escapeHtml(item.product_name)}</td>
                        <td>¥${item.price.toLocaleString()}</td>
                        <td>${item.quantity}</td>
                        <td>¥${subtotal.toLocaleString()}</td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
            listDiv.innerHTML = html;
        })
        .catch(error => {
            console.error("Error fetching orders:", error);
            document.getElementById("orders-list").innerText = "注文履歴の取得に失敗しました。";
        });
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
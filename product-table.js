const BASE_URL = "https://storehub-backend-1d97.onrender.com";

const isLoggedIn = localStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true") {
    window.location.href = "/create.html";
}

const storeId = localStorage.getItem("storeId");

if (!storeId) {
    alert("No store found");
    window.location.href = "/create.html";
}

let products = [];

/* =========================
   LOAD PRODUCTS FAST
========================= */

window.onload = async function () {

    const body = document.getElementById("productBody");

    body.innerHTML = "<tr><td colspan='6'>Loading products...</td></tr>";

    try {

        const res = await fetch(
            `${BASE_URL}/api/store/${storeId}`,
            { cache: "no-store" }
        );

        const data = await res.json();

        if (!data.success) {
            body.innerHTML = "<tr><td colspan='6'>Store not found</td></tr>";
            return;
        }

        products = data.store.products || [];

        renderTable();

    } catch (error) {
        console.log(error);
        body.innerHTML = "<tr><td colspan='6'>Error loading products</td></tr>";
    }
};

/* =========================
   RENDER TABLE
========================= */

function renderTable() {

    const body = document.getElementById("productBody");
    const storeUsername = localStorage.getItem("storeUsername");

    body.innerHTML = "";

    if (products.length === 0) {
        body.innerHTML = "<p>No products yet</p>";
        return;
    }

    [...products].reverse().forEach((product, index) => {
        
        const realIndex = products.length - 1 - index;
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${product.productImage}" />

            <div class="product-info">

                <div class="product-name">
                    ${product.productName}
                </div>

                <div class="product-price">
                    ${product.productPrice}
                </div>

                <div class="product-status">
                    ${product.productStatus} • @${storeUsername}
                </div>

                <div class="actions">
                    <button class="edit-btn" onclick="editProduct(${realIndex})">
                        Edit
                    </button>

                    <button class="delete-btn" onclick="deleteProduct(${realIndex})">
                        Delete
                    </button>
                </div>

            </div>
        `;

        body.appendChild(card);
    });
}

/* =========================
   DELETE (FAST + NO RELOAD)
========================= */

async function deleteProduct(index) {

    try {

        const res = await fetch(
            `${BASE_URL}/api/product/${storeId}/${index}`,
            { method: "DELETE" }
        );

        const data = await res.json();

        if (!data.success) {
            alert(data.error || "Delete failed");
            return;
        }

        // remove instantly from UI (NO reload)
        await reloadProducts();

    } catch (error) {
        console.log(error);
        alert("Server error");
    }
}

/* =========================
   EDIT (FAST FIX)
========================= */

async function editProduct(index) {

    const newName = prompt("Enter new product name");
    const newPrice = prompt("Enter new price");
    const newStatus = prompt("Enter new status");

    if (!newName && !newPrice && !newStatus) return;

    // update local instantly
    if (newName) products[index].productName = newName;
    if (newPrice) products[index].productPrice = newPrice;
    if (newStatus) products[index].productStatus = newStatus;

    try {

        await fetch(
            `${BASE_URL}/api/store/${storeId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    products
                })
            }
        );

        await reloadProducts();

    } catch (error) {
        console.log(error);
        alert("Server error");
    }
}

async function reloadProducts() {

    const res = await fetch(
        `${BASE_URL}/api/store/${storeId}`,
        { cache: "no-store" }
    );

    const data = await res.json();

    if (data.success) {
        products = data.store.products || [];
        renderTable();
    }
}
    window.refreshProductTable = reloadProducts;
/* =========================
   BACK BUTTON
========================= */

function goBack() {
    window.location.href = "dashboard.html";
}
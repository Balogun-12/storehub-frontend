const BASE_URL = "https://storehub-backend-1d97.onrender.com";

console.log("SETUP 3 JS LOADED");

const username = localStorage.getItem("storeUsername");
const storeId = localStorage.getItem("storeId");

window.onload = function () {

    const input = document.getElementById("storeUser");
    if (input) {
        input.value = username || "";
    }
};

/* =========================
   IMAGE COMPRESSION
========================= */

function compressImage(file, callback) {

    const reader = new FileReader();

    reader.onload = function (e) {

        const img = new Image();

        img.onload = function () {

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = 200;
            canvas.height = 200;

            ctx.drawImage(img, 0, 0, 200, 200);

            const compressed =
                canvas.toDataURL("image/jpeg", 0.6);

            callback(compressed);
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}


/* =========================
   SAVE PRODUCT → MONGODB
========================= */

function saveProduct(event) {

    event.preventDefault();

    if (!username || !storeId) {
        alert("Missing store session");
        return;
    }

    const productName =
        document.getElementById("productName").value;

    const productPrice =
        document.getElementById("productPrice").value;

    const productStatus =
        document.getElementById("productStatus").value;

    const file =
        document.getElementById("productImage").files[0];

    if (!file) {
        alert("Select product image");
        return;
    }

    compressImage(file, function (image) {

        const data = {
            productName,
            productPrice,
            productStatus,
            productImage: image
        };

       const storeId = localStorage.getItem("storeId");

fetch(`${BASE_URL}/api/product/${storeId}`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
})
        .then(res => res.json())
        .then(result => {

            if (result.success) {

                alert("Product saved successfully");

                /* ✅ FIXED REDIRECT */
                window.location.href =
                    `dashboard.html?id=${storeId}`;

            } else {

                alert(result.error || "Failed to save product");
            }
        })
        .catch(err => {

            console.log(err);
            alert("Server error");
        });
    });
}
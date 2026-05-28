const BASE_URL =
  window.location.hostname.includes("192.168")
    ? "http://192.168.225.154:5000"
    : "https://storehub-backend-1d97.onrender.com";

const isLoggedIn = localStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true") {
    window.location.href = "Create.html";
}

/* =========================
   LOAD USER INFO (FAST)
========================= */

window.onload = function () {

    const storeUsername = localStorage.getItem("storeUsername");

    const storeUserInput = document.getElementById("storeUser");

    if (storeUserInput) {
        storeUserInput.value = storeUsername || "";
    }
};

/* =========================
   IMAGE COMPRESSION (OPTIMIZED)
   FIX: prevents UI freeze
========================= */

function compressImage(file) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = function (e) {

            const img = new Image();

            img.onload = function () {

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // 🔥 FIX: keep ORIGINAL ratio
                const maxWidth = 800;
                const scaleSize = maxWidth / img.width;

                canvas.width = img.width > maxWidth ? maxWidth : img.width;
                canvas.height = img.height > maxWidth ? img.height * scaleSize : img.height;

                ctx.drawImage(
                    img,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                const compressed =
                    canvas.toDataURL("image/jpeg", 0.8);

                resolve(compressed);
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    });
}

/* =========================
   SAVE PRODUCT (FAST UX VERSION)
========================= */

async function saveProduct(event) {

    event.preventDefault();

    const storeId = localStorage.getItem("storeId");

    if (!storeId) {
        alert("No store found");
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

    if (!productName || !productPrice || !productStatus || !file) {
        alert("Fill all fields");
        return;
    }

    // optional UX feedback
    const btn = document.querySelector(".button1");
    btn.innerText = "Saving...";
    btn.disabled = true;

    try {

        const image = await compressImage(file);

        const res = await fetch(
            `${BASE_URL}/api/product/${storeId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productName,
                    productPrice,
                    productStatus,
                    productImage: image
                })
            }
        );

        const result = await res.json();

        if (!result.success) {
            alert(result.error || "Failed to save product");
            return;
        }

        alert("Product added successfully");

        // IMPORTANT FIX → no forced dashboard reload delay feeling
        window.location.href =
            `dashboard.html?id=${storeId}`;

    } catch (error) {
        console.log(error);
        alert("Server error");
    } finally {
        btn.innerText = "Save Product";
        btn.disabled = false;
    }
}
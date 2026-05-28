const BASE_URL = "https://storehub-backend-1d97.onrender.com";

let selectedImageBase64 = null;
let currentBrightness = 1;

/* =========================
   GET STORE ID
========================= */

const storeId = localStorage.getItem("storeId");

if (!storeId) {
    alert("Store not found. Please login again.");
    window.location.href = "create.html";
}

/* =========================
   LOAD EXISTING BACKGROUND (IMPORTANT FIX)
========================= */

window.onload = async function () {

    try {

        const res = await fetch(
            `${BASE_URL}/api/store/${storeId}`,
            { cache: "no-store" }
        );

        const data = await res.json();

        if (!data.success) return;

        const store = data.store;

        selectedImageBase64 = store.backgroundImage || null;
        currentBrightness = store.brightness || 1;

        document.getElementById("brightness").value = currentBrightness;

        applyPreview();

    } catch (err) {
        console.log(err);
    }
};

/* =========================
   IMAGE UPLOAD + PREVIEW
========================= */

    document.getElementById("bgImage").addEventListener("change", function (event) {

        const file = event.target.files[0];
        if (!file) return;

        // LIMIT IMAGE SIZE (IMPORTANT FIX)
        if (file.size > 1500000) {
            alert("Image too large. Please use a smaller background image.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {

            selectedImageBase64 = e.target.result;

            applyPreview();
        };

        reader.readAsDataURL(file);
    });

/* =========================
   BRIGHTNESS CONTROL (LIVE)
========================= */

document.getElementById("brightness").addEventListener("input", function () {

    currentBrightness = this.value;
    applyPreview();
});

/* =========================
   PREVIEW ENGINE (FAST UI UPDATE)
========================= */

function applyPreview() {

    const preview = document.getElementById("previewBox");

    if (selectedImageBase64) {

        preview.style.backgroundImage = `url(${selectedImageBase64})`;
        preview.style.backgroundSize = "cover";
        preview.style.backgroundPosition = "center";
        preview.innerText = "";

    } else {
        preview.style.backgroundImage = "none";
        preview.innerText = "Preview will show here";
    }

    preview.style.filter = `brightness(${currentBrightness})`;
}

/* =========================
   SAVE BACKGROUND (OPTIMIZED)
========================= */

async function saveChanges() {

    try {

        const res = await fetch(
            `${BASE_URL}/api/store/background/${storeId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    backgroundImage: selectedImageBase64,
                    brightness: currentBrightness
                })
            }
        );

        const result = await res.json();

        if (!result.success) {
            alert(result.error || "Failed to update background");
            return;
        }

        alert("Background updated successfully!");

    } catch (err) {
        console.log(err);
        alert("Server error");
    }
}

/* =========================
   RESET BACKGROUND (FAST UI)
========================= */

async function deleteBackground() {

    try {

        const res = await fetch(
            `${BASE_URL}/api/store/background/reset/${storeId}`,
            { method: "PUT" }
        );

        const result = await res.json();

        if (!result.success) {
            alert("Failed to reset background");
            return;
        }

        // instant UI reset (NO reload)
        selectedImageBase64 = null;
        currentBrightness = 1;

        document.getElementById("brightness").value = 1;

        applyPreview();

        alert("Background reset to default!");

    } catch (err) {
        console.log(err);
        alert("Server error");
    }
}
/* =========================
   BACK BUTTON
========================= */

function goBack() {
    window.location.href = "dashboard.html";
}
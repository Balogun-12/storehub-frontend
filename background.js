const BASE_URL =
  window.location.hostname.includes("192.168")
    ? "http://192.168.225.154:5000"
    : "https://storehub-backend-1d97.onrender.com";

const storeId = localStorage.getItem("storeId");

if (!storeId) {
    alert("Store not found");
    window.location.href = "create.html";
}

/* =========================
   LOAD THEME FAST
========================= */

window.onload = async function () {
    await loadTheme();
};

/* =========================
   LOAD CURRENT THEME
========================= */

async function loadTheme() {

    try {

        const res = await fetch(
            `${BASE_URL}/api/store/${storeId}`,
            { cache: "no-store" }
        );

        const data = await res.json();

        if (!data.success) return;

        const store = data.store;

        setInputs(store);

    } catch (error) {
        console.log(error);
    }
}

/* =========================
   SET INPUT VALUES (FAST UI SYNC)
========================= */

function setInputs(store) {

    document.getElementById("productsBgColor").value =
        store.productsBgColor || "#f7c4c4";

    document.getElementById("businessNameColor").value =
        store.businessNameColor || "#ffffff";

    document.getElementById("descriptionColor").value =
        store.descriptionColor || "#ffffff";

    document.getElementById("smallTextColor").value =
        store.smallTextColor || "#f1f1f1";

    document.getElementById("enableShadow").checked =
        store.enableShadow || false;
}

/* =========================
   SAVE THEME (OPTIMIZED)
========================= */

async function saveTheme() {

    try {

        const res = await fetch(
            `${BASE_URL}/api/store/theme/${storeId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productsBgColor: document.getElementById("productsBgColor").value,
                    businessNameColor: document.getElementById("businessNameColor").value,
                    descriptionColor: document.getElementById("descriptionColor").value,
                    smallTextColor: document.getElementById("smallTextColor").value,
                    enableShadow: document.getElementById("enableShadow").checked
                })
            }
        );

        const data = await res.json();

        if (data.success) {
            alert("Theme updated successfully");
        } else {
            alert("Failed to update theme");
        }

    } catch (error) {
        console.log(error);
        alert("Server error");
    }
}

/* =========================
   RESET THEME (FAST UI UPDATE)
========================= */

async function resetTheme() {

    try {

        const res = await fetch(
            `${BASE_URL}/api/store/theme/reset/${storeId}`,
            { method: "PUT" }
        );

        const data = await res.json();

        if (!data.success) return;

        // instant UI reset (NO reload)
        setInputs({
            productsBgColor: "#f7c4c4",
            businessNameColor: "#ffffff",
            descriptionColor: "#ffffff",
            smallTextColor: "#f1f1f1",
            enableShadow: false
        });

        alert("Theme reset successfully");

    } catch (error) {
        console.log(error);
        alert("Server error");
    }
}
/* =========================
   BACK BUTTON
========================= */

function goBack() {
    window.location.href = "dashboard.html";
}
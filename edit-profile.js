const BASE_URL =
  window.location.hostname.includes("192.168")
    ? "http://192.168.225.154:5000"
    : "https://storehub-backend-1d97.onrender.com";

const isLoggedIn = localStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true") {
    window.location.href = "Create.html";
}

let storeId = localStorage.getItem("storeId");

// 🔥 FIXED: stronger session validation
if (!storeId || storeId === "undefined" || storeId === "null") {
    alert("Session expired. Please login again.");
    window.location.href = "Create.html";
}

/* =========================
   LOADING STATE (ADDED)
========================= */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    if (form) {
        form.insertAdjacentHTML(
            "beforebegin",
            `<p id="loadingText" style="text-align:center;">Loading profile...</p>`
        );
    }
});

/* =========================
   LOAD PROFILE (OPTIMIZED)
========================= */

window.addEventListener("DOMContentLoaded", function () {

    // run async separately so UI doesn't freeze
    loadProfile();
});

async function loadProfile() {

    try {

        const res = await fetch(
            `${BASE_URL}/api/store/${storeId}`,
            { cache: "no-store" }
        );

        const data = await res.json();

        document.getElementById("loadingText")?.remove();

        if (!data.success || !data.store) {
            alert("Store not found");
            window.location.href = "dashboard.html";
            return;
        }

        // faster rendering: do UI update immediately
        requestAnimationFrame(() => {
            fillForm(data.store);
        });

    } catch (error) {
        console.log(error);
        document.getElementById("loadingText")?.remove();
        alert("Failed to load profile");
    }
}

/* =========================
   FILL FORM
========================= */

function fillForm(store = {}) {

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || "";
    };

    const img = document.getElementById("logoImage");
    if (img) {
        img.src = store.logo || "https://via.placeholder.com/100";
    }

    set("businessName", store.businessName);
    set("storeUsername", store.storeUsername);
    set("email", store.email);
    set("whatsapp", store.whatsapp);
    set("description", store.description);
}

/* =========================
   LOGO PREVIEW
========================= */

const logoInput = document.getElementById("businessLogo");

if (logoInput) {
    logoInput.addEventListener("change", function () {

        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.getElementById("logoImage");
            if (img) img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    });
}

/* =========================
   SAVE PROFILE (UNCHANGED LOGIC - ONLY SAFE FIX)
========================= */

async function saveProfile(event) {
    event.preventDefault();

    try {

        const fileInput = document.getElementById("businessLogo");

        let logo = null;

        if (fileInput && fileInput.files.length > 0) {

            const file = fileInput.files[0];

            const MAX_SIZE = 1 * 1024 * 1024;

            if (file.size > MAX_SIZE) {
                alert("Image too large. Please compress or use a smaller image.");
                return;
            }

            logo = await new Promise((resolve, reject) => {

                const reader = new FileReader();

                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject("Failed to read image");

                reader.readAsDataURL(file);
            });
        }

        const updateData = {
            businessName: document.getElementById("businessName")?.value || "",
            email: document.getElementById("email")?.value || "",
            whatsapp: document.getElementById("whatsapp")?.value || "",
            description: document.getElementById("description")?.value || "",
            storeUsername: document.getElementById("storeUsername")?.value?.trim() || ""
        };

        if (logo) updateData.logo = logo;

        const res = await fetch(`${BASE_URL}/api/store/${storeId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateData)
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
            alert(data?.error || "Update failed");
            return;
        }

        localStorage.setItem("storeId", data.store._id);
        localStorage.setItem("storeUsername", data.store.storeUsername);

        alert("Saving changes...");

        setTimeout(() => {
            window.location.href = `dashboard.html?id=${storeId}`;
        }, 300);

    } catch (error) {
        console.log("FETCH ERROR:", error);
        alert("Network error. Check backend or internet.");
    }
}

/* =========================
   BACK BUTTON
========================= */

function goDashboard() {
    const storeId = localStorage.getItem("storeId");

    if (!storeId) {
        window.location.href = "create.html";
        return;
    }

    window.location.href = "dashboard.html?id=" + storeId;
}
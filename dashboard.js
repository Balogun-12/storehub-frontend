/* =========================
   CONFIG
========================= */

const BASE_URL = "https://storehub-backend-1d97.onrender.com";

/* =========================
   GET STORE ID
========================= */

const params = new URLSearchParams(window.location.search);

let storeId =
params.get("id") ||
localStorage.getItem("storeId");

if (!storeId) {
    window.location.href = "/create.html";
}

/* =========================
   SAFE DOM HELPERS
========================= */

const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
};

const setSrc = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.src = value;
};

/* =========================
   RENDER DASHBOARD
========================= */

function renderDashboard(store) {

    if (!store) return;

    setText("helloUsername", store.storeUsername || "");

    setText("businessName", store.businessName || "");

    setText(
        "qrUsername",
        "Storehub_" + (store.storeUsername || "")
    );

    /* LOGO */

    setSrc(
        "businessLogo",
        store.logo || "https://via.placeholder.com/80"
    );

    /* STORE LINK */

    const storeURL =
    `htpps://storehub.com/${store.storeUsername}`;

    const publicLink = storeURL;

    const linkEl =
    document.getElementById("storeLink");

    if (linkEl) {

        linkEl.innerText = publicLink;

        linkEl.onclick = () => {
            window.open(storeURL, "_blank");
        };
    }

    /* QR CODE */

    const qrBox = document.getElementById("qrcode");

    if (qrBox) {

        qrBox.innerHTML = "";

        const username =
        localStorage.getItem("storeUsername");

        const publicLink =
        `https://storehub-backend-1d97.onrender.com/s/${username}`;

        if (typeof QRCode !== "undefined") {

            new QRCode(qrBox, {
                text: publicLink,
                width: 120,
                height: 120
            });

            trackEvent("qr_generated", {
                storeId,
                link: publicLink
            });
        }
    }
    /* ANALYTICS */

    const products =
    Array.isArray(store.products)
    ? store.products
    : [];

    setText("totalProducts", products.length);

    setText(
        "customerViews",
        store.customerViews || 0
    );

    setText(
        "totalOrders",
        store.totalOrders || 0
    );
}

/* =========================
   LOAD CACHED DATA FIRST
========================= */

const cachedStore =
localStorage.getItem("cachedDashboard");

if (cachedStore) {

    try {

        renderDashboard(
            JSON.parse(cachedStore)
        );

    } catch (err) {
        console.log(err);
    }
}

/* =========================
   FETCH TIMEOUT
========================= */

async function fetchWithTimeout(
    url,
    timeout = 8000
) {

    return Promise.race([

        fetch(url),

        new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error("Timeout")),
                timeout
            )
        )
    ]);
}

/* =========================
   LOAD FRESH DASHBOARD
========================= */

async function loadDashboard() {

    try {

        const res =
        await fetchWithTimeout(
            `${BASE_URL}/api/store/${storeId}`
        );

        const data = await res.json();

        if (
            !data ||
            !data.store
        ) {
            return;
        }

        const store = data.store;

        /* SAVE CACHE */

        localStorage.setItem(
            "cachedDashboard",
            JSON.stringify(store)
        );

        localStorage.setItem(
            "storeId",
            store._id
        );

        localStorage.setItem(
            "storeUsername",
            store.storeUsername || ""
        );

        /* RENDER */

        renderDashboard(store);

    } catch (error) {

        console.log(
            "Dashboard fetch error:",
            error
        );
    }
}

/* =========================
   COPY LINK
========================= */

function copyLink() {

    const username = localStorage.getItem("storeUsername");

    if (!username) {
        alert("Store username not found");
        return;
    }

    const link = `https://storehub-backend-1d97.onrender.com/s/${username}`;

    const textArea = document.createElement("textarea");
    textArea.value = link;

    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    alert(
        "✅ Store link copied successfully!\n\nShare it with customers to start receiving orders."
    );

    trackEvent("store_link_copied", {
        link
    });
}

/* =========================
   SHARE STORE
========================= */

function shareStore() {

    const username = localStorage.getItem("storeUsername");

    if (!username) {
        alert("Store username not found");
        return;
    }

    const url = `https://storehub-backend-1d97.onrender.com/s/${username}`;

    trackEvent("store_shared", {
        method: "share_button",
        url
    });

    if (navigator.share) {

        navigator.share({
            title: "My StoreHub Store",
            text: "Browse my products and order directly on WhatsApp.",
            url: url
        }).catch(err => console.log(err));

    } else {

        window.open(
            `https://wa.me/?text=${encodeURIComponent(url)}`,
            "_blank"
        );
    }
}
/* =========================
   NAVIGATION
========================= */

function viewStore() {
    window.location.href =
    `/view-store.html?id=${storeId}`;
}

function viewUpdates() {
    window.location.href =
    `/homepagecolor.html?id=${storeId}`;
}

function toggleMenu() {
    document
    .getElementById("dropdownMenu")
    ?.classList.toggle("show");
}

function addProduct() {
    window.location.href =
    "/addproduct.html";
}

function editProfile() {
    window.location.href =
    `/edit-profile.html?id=${storeId}`;
}

function videoComingSoon() {
    window.location.href =
    "/create-post.html";
}

function openStore() {
    window.location.href =
    `/view-store.html?id=${storeId}`;
}

function goBack() {
    window.location.href =
    "/index.html";
}

function logout() {

    localStorage.removeItem("storeId");

    localStorage.removeItem("storeUsername");

    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("cachedDashboard");

    window.location.href = "/create.html";
}

function trackEvent(eventName, data = {}) {

    fetch(`${BASE_URL}/api/analytics`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            event: eventName,
            storeId,
            ...data,
            time: Date.now()
        })
    }).catch(() => {});
}

/* =========================
   INIT
========================= */

loadDashboard();
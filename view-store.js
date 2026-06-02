const username = window.location.pathname.split("/")[1];

if (!username) {
    alert("Store not found");
    window.location.href = "/create.html";
}

let storeId;
/* =========================
   BASE URL
========================= */

const BASE_URL = "https://storehub-backend-1d97.onrender.com";

/* =========================
   LOAD STORE (FAST VERSION)
========================= */

async function loadStore() {

    try {

        /* =========================
           SHOW CACHED DATA FIRST
        ========================= */

        const cachedStore = localStorage.getItem(`store_${username}`);

        if (cachedStore) {

            const parsedStore = JSON.parse(cachedStore);

            renderStore(parsedStore);
        }

        /* =========================
           FETCH FRESH DATA
        ========================= */

        const res = await fetch(
            `${BASE_URL}/api/store/username/${username}`,
            {
                cache: "force-cache"
            }
        );

        const data = await res.json();

        if (!data || !data.store) {
            alert("Store not found");
            return;
        }

        const store = data.store;
        storeId = store._id;

        /* =========================
           SAVE CACHE
        ========================= */

        localStorage.setItem(`store_${username}`, JSON.stringify(store));

        /* =========================
           RENDER STORE
        ========================= */

        renderStore(store);

        /* =========================
           TRACK VIEW (NON BLOCKING)
        ========================= */

        fetch(`${BASE_URL}/api/store/view/${storeId}`, {
            method: "PUT"
        }).catch(() => {});

    } catch (err) {

        console.log(err);

        if (!localStorage.getItem(`store_${username}`)) {
            alert("Server error loading store");
        }
    }
}

/* =========================
   RENDER STORE
========================= */

function renderStore(store) {

    /* =========================
       BASIC INFO
    ========================= */

    const nameEl = document.getElementById("businessName");
    const descEl = document.getElementById("storeDescription");
    const logoEl = document.getElementById("storeLogo");

    if (nameEl) {
        nameEl.innerText = store.businessName || "";
    }

    if (descEl) {
        descEl.innerText = store.description || "";
    }

    if (logoEl) {

        logoEl.loading = "lazy";

        logoEl.src =
            store.logo ||
            "https://via.placeholder.com/80";
    }

    localStorage.setItem(
        "whatsapp",
        store.whatsapp || ""
    );

    /* =========================
       BACKGROUND
    ========================= */

    const hero = document.querySelector(".hero-section");

    if (hero && store.backgroundImage) {

        hero.style.backgroundImage = `
            linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.55)),
            url(${store.backgroundImage})
        `;

        hero.style.backgroundSize = "cover";
        hero.style.backgroundPosition = "center";
        hero.style.filter = `brightness(${store.brightness || 1})`;
    }

    /* =========================
       THEME
    ========================= */

    const productSection = document.querySelector(".products-section");

    if (productSection) {
        productSection.setAttribute(
            "style",
            "background:#f3f4f6 !important"
        );
    }

    if (nameEl) {

        nameEl.style.color =
            store.businessNameColor || "#1f2937";

        nameEl.style.textShadow =
            store.enableShadow
                ? "0 2px 10px rgba(0,0,0,0.6)"
                : "none";
    }

    if (descEl) {

        descEl.style.color =
            store.descriptionColor || "#374151";
    }

    const smallText =
        document.querySelector(".hero-small-text");

    if (smallText) {

        smallText.style.color =
            store.smallTextColor || "#4b5563";
    }

    /* =========================
       PRODUCTS
    ========================= */

    const grid =
        document.getElementById("productsGrid");

    if (!grid) return;

    grid.innerHTML = "";

    const products =
        (store.products || []).slice().reverse();

    if (products.length === 0) {

        grid.innerHTML =
            "<p style='text-align:center'>No products yet</p>";

        return;
    }

    const fragment =
        document.createDocumentFragment();

    products.forEach((p) => {

        const card = document.createElement("div");

        card.className = "product-card";

        card.onclick = () => {

            openProduct(
                p.productImage,
                p.productName,
                p.productPrice
            );
        };

        card.innerHTML = `
            <div class="product-image-wrap">

                <img
                    src="${p.productImage}"
                    class="product-image"
                    loading="lazy"
                    decoding="async"
                />

            </div>

            <div class="love-icon">❤</div>

            <div class="product-info">

                <div class="product-name">
                    ${p.productName}
                </div>

                <div class="product-price">
                    ${p.productPrice}
                </div>

                <button
                    class="cart-btn"
                    onclick="event.stopPropagation(); addToWhatsApp(
                        '${p.productName}',
                        '${p.productPrice}'
                    )">

                    🛒 Chat to order

                </button>

            </div>
        `;

        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
}

/* =========================
   OPEN PRODUCT
========================= */

function openProduct(image, name, price) {

    const storePhone =
        localStorage.getItem("whatsapp");

    localStorage.setItem(
        "selectedProduct",
        JSON.stringify({
            image,
            name,
            price,
            whatsapp: storePhone
        })
    );

    window.location.href =
        "product-display.html";
}

/* =========================
   WHATSAPP
========================= */

function addToWhatsApp(name, price) {

    const storePhone =
        localStorage.getItem("whatsapp");

    if (!storePhone) {

        alert("Store WhatsApp not found");

        return;
    }

    fetch(`${BASE_URL}/api/store/order/${storeId}`, {
        method: "PUT"
    }).catch(() => {});

    const message =
        `Hi, I'm interested in this ${name} priced at ${price}, is it still available?`;

    window.open(
        `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
}

/* =========================
   INIT
========================= */

loadStore();

async function refreshStore() {

    try {

        const res = await fetch(
            `${BASE_URL}/api/store/username/${username}`,
            { cache: "no-store" }
        );

        const data = await res.json();

        if (data && data.store) {

            // update cache
            localStorage.setItem(
                `store_${username}`,
                JSON.stringify(data.store)
            );

            // re-render UI
            renderStore(data.store);
        }

    } catch (err) {
        console.log("Refresh error:", err);
    }
}

function copyStoreLink() {

    const link = `${window.location.origin}/s/${username}`;

    navigator.clipboard.writeText(link);

    alert("Store link copied!");
}

setInterval(() => {
    refreshStore();
}, 5000); // every 5 seconds
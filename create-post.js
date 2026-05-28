const BASE_URL = "https://storehub-backend-1d97.onrender.com";

const isLoggedIn = localStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true") {
    window.location.href = "Create.html";
}

/* =========================
   SESSION
========================= */

const storeId = localStorage.getItem("storeId");
const storeUsername = localStorage.getItem("storeUsername");

if (!storeId || !storeUsername) {
    console.log("No store session found");
    window.location.replace("dashboard.html");
    throw new Error("Missing store session");
}

/* =========================
   STORE LOAD
========================= */

async function loadStore() {
    try {
        const res = await fetch(`${BASE_URL}/api/store/${storeId}`);
        const data = await res.json();

        if (!data.success || !data.store) return;

        const store = data.store;

        document.getElementById("storeName").innerText = store.businessName || "";
        document.getElementById("storeUsernameText").innerText = store.storeUsername || "";
        document.getElementById("storeLogo").src = store.logo || "";

    } catch (error) {
        console.log("LOAD STORE ERROR:", error);
    }
}

/* =========================
   IMAGE STATE
========================= */

let imagesArray = [];
let currentIndex = 0;

/* =========================
   INIT
========================= */

window.addEventListener("DOMContentLoaded", () => {

    loadStore();

    const captionInput = document.getElementById("caption");
    captionInput?.addEventListener("input", () => {
        const preview = document.getElementById("captionPreview");
        if (preview) preview.innerText = captionInput.value;
    });

    const musicSelect = document.getElementById("musicSelect");
    musicSelect?.addEventListener("change", () => {
        const preview = document.getElementById("musicPreview");
        if (preview) preview.innerText = musicSelect.value;
    });

    const imageInput = document.getElementById("postImages");

    imageInput?.addEventListener("change", function () {

        imagesArray = [];
        currentIndex = 0;

        const files = Array.from(this.files);

        if (!files.length) return;

        let loadedCount = 0;

        files.forEach(file => {

            const reader = new FileReader();

            reader.onload = function (e) {

                const img = new Image();

                img.onload = function () {

                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    const maxWidth = 800;
                    const scale = maxWidth / img.width;

                    canvas.width = maxWidth;
                    canvas.height = img.height * scale;

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const compressed = canvas.toDataURL("image/jpeg", 0.7);

                    imagesArray.push(compressed);

                    loadedCount++;

                    // ✅ ONLY render ONCE after ALL images are ready
                    if (loadedCount === files.length) {
                        renderSlider();
                    }
                };

                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        });
    });

}); 

/* =========================
   SLIDER RENDER
========================= */

function renderSlider() {

    const box = document.getElementById("imageBox");
    if (!box || imagesArray.length === 0) return;

    box.innerHTML = "";

    const wrapper = document.createElement("div");

    const img = document.createElement("img");
    img.src = imagesArray[currentIndex];
    img.style.width = "100%";
    img.style.borderRadius = "10px";
    img.style.display = "block";

    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.justifyContent = "space-between";
    controls.style.marginTop = "8px";

    const prevBtn = document.createElement("button");
    prevBtn.innerText = "Prev";

    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Next";

    prevBtn.onclick = () => {
        if (currentIndex > 0) {
            currentIndex--;
            renderSlider();
        }
    };

    nextBtn.onclick = () => {
        if (currentIndex < imagesArray.length - 1) {
            currentIndex++;
            renderSlider();
        }
    };

    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);

    wrapper.appendChild(img);
    wrapper.appendChild(controls);
    box.appendChild(wrapper);
}

/* =========================
   SAVE POST
========================= */

async function savePost(event) {
    event.preventDefault();

    const caption = document.getElementById("caption")?.value || "";
    const music = document.getElementById("musicSelect")?.value || "";

    if (!imagesArray.length) {
        alert("Please select images");
        return;
    }

    const payload = {
        storeId,
        storeUsername,
        caption,
        music,
        images: imagesArray
    };

    try {

        const res = await fetch('${BASE_URL}/api/post', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.error || "Failed to publish post");
            return;
        }

        alert("Post published successfully");

        window.location.href = `index.html?id=${storeId}`;

    } catch (error) {
        console.log("POST ERROR:", error);
        alert("Server error");
    }
}
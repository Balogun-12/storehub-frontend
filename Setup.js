const BASE_URL = "https://storehub-backend-1d97.onrender.com";

console.log("JS LOADED");

/* =========================
   IMAGE COMPRESSION FUNCTION
========================= */

function compressImage(file, callback) {

    const reader = new FileReader();

    reader.onload = function (e) {

        const img = new Image();

        img.onload = function () {

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = 300;
            canvas.height = 300;

            ctx.drawImage(img, 0, 0, 300, 300);

            const compressed =
                canvas.toDataURL("image/jpeg", 0.7);

            callback(compressed);
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}


/* =========================
   CREATE STORE → MONGODB
========================= */

function createStore(event) {
    event.preventDefault();

    let businessName = document.getElementById("businessName").value;
    let description = document.getElementById("description").value;
    let file = document.getElementById("logo").files[0];

    if (!businessName || !description) {
        alert("Please fill all fields");
        return;
    }

    if (!file) {
        alert("Please select a logo image");
        return;
    }

    compressImage(file, async function (compressedImage) {

        try {

            const data = {
                businessName,
                description,
                logo: compressedImage
            };

            const res = await fetch(`${BASE_URL}/api/store`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            // safety check (prevents JSON crash)
            const text = await res.text();
            let result;

            try {
                result = JSON.parse(text);
            } catch (e) {
                console.log("Backend response:", text);
                alert("Server returned invalid response");
                return;
            }

            if (res.ok && result.success) {

                alert("Store created successfully");

                // SAVE STORE ID FOR STEP 2
                localStorage.setItem("storeId", result.store._id);

                // OPTIONAL: also store step 1 data (useful for recovery)
                localStorage.setItem("businessName", businessName);
                localStorage.setItem("description", description);
                localStorage.setItem("logo", compressedImage);

                window.location.href = "/setup2.html";

            } else {
                alert(result.error || "Failed to create store");
            }

        } catch (error) {
            console.log(error);
            alert("Server error");
        }
    });
}

const BASE_URL = "https://storehub-backend-1d97.onrender.com";

function continueSetup(event) {

    event.preventDefault();

    let whatsapp = document.getElementById("whatsapp").value.trim();
    let email = document.getElementById("email").value.trim();

    let storeUsername = document.getElementById("storeUsername")
        .value
        .trim()
        .toLowerCase();

    /* =========================
       VALIDATION
    ========================= */

    const usernamePattern = /^[a-z0-9_]+$/;

    if (!usernamePattern.test(storeUsername)) {

        alert(
            "Invalid username!\n\n" +
            "Only lowercase letters, numbers, and underscore (_) allowed."
        );

        return;
    }

    /* =========================
       GET STORE ID
    ========================= */

    let storeId = localStorage.getItem("storeId");

    if (!storeId) {

        alert("Missing store ID. Go back to Step 1.");

        return;
    }

    /* =========================
       SEND TO BACKEND
    ========================= */

    const data = {
        storeUsername,
        whatsapp,
        email
    };

    fetch(`${BASE_URL}/api/store/${storeId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    .then(res => res.json())
    .then(result => {

        if (result.success) {

            alert(
                "🎉 Store setup completed!\n\n" +
                "Username created successfully:\n" +
                `${storeUsername}\n\n` +
                "Your store link is now active."
            );

            // SAVE SESSION
            localStorage.setItem("storeUsername", storeUsername);
            localStorage.setItem("isLoggedIn", "true");

            window.location.href = "setup3.html";

        } else {

            // 🔥 IMPORTANT: backend duplicate username error
            alert(
                result.error ||
                "Failed to update store. Try another username."
            );
        }
    })

    .catch(err => {

        console.log("SETUP ERROR:", err);
        alert("Server error. Please try again.");
    });
}
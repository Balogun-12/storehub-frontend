const BASE_URL = "https://storehub-backend-1d97.onrender.com";

const isLoggedIn =
    localStorage.getItem("isLoggedIn");

const storeId =
    localStorage.getItem("storeId");

if (isLoggedIn === "true" && storeId) {

    window.location.href =
        `dashboard.html?id=${storeId}`;
}

async function loginUser(event) {

    event.preventDefault();

    const storeUsername =
        document.getElementById("storeUsername")
        .value.trim()
        .toLowerCase();

    const whatsapp =
        document.getElementById("whatsapp")
        .value.trim();

    if (!storeUsername || !whatsapp) {

        alert("Fill all fields");
        return;
    }

    try {

        const res = await fetch(
            '${BASE_URL}/api/login',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    storeUsername,
                    whatsapp
                })
            }
        );

        const data = await res.json();

        if (!data.success) {

            alert(data.error || "Invalid login details");
            return;
        }

        /* =========================
           SAVE SESSION
        ========================= */

        localStorage.setItem(
            "storeUsername",
            data.store.storeUsername
        );

        localStorage.setItem(
            "storeId",
            data.store._id
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        alert("Login successful");

        /* =========================
           GO TO USER DASHBOARD
        ========================= */

        window.location.href =
            `dashboard.html?id=${data.store._id}`;

    } catch (error) {

        console.log(error);

        alert("Server error");
    }
}
/* =========================
   CONFIG
========================= */

const BASE_URL = "https://storehub-backend-1d97.onrender.com";

/* =========================
   AUTH DATA
========================= */

const storeId = localStorage.getItem("storeId");
const username = localStorage.getItem("storeUsername");
const userEmail = localStorage.getItem("email");

/* =========================
   SUBMIT FEEDBACK
========================= */

async function sendFeedback(event) {

    event.preventDefault();

    /* LOGIN CHECK */

    if (!storeId || !username) {
        alert("Please login first");
        return;
    }

    const type =
        document.getElementById("feedbackType").value;

    const message =
        document.getElementById("feedbackMessage")
        .value
        .trim();

    if (!type || !message) {
        alert("Please fill all fields");
        return;
    }

    const submitBtn =
        document.getElementById("submitBtn");

    submitBtn.disabled = true;

    submitBtn.innerText = "Sending...";

    try {

        const payload = {
            storeId,
            username,
            userEmail,
            type,
            message,
            emailTo: "storehubofficials1@gmail.com",
            createdAt: Date.now()
        };

        const res = await fetch(
            `${BASE_URL}/api/feedback`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                    "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await res.json();

        if (!data.success) {

            alert(
                data.error ||
                "Failed to send feedback"
            );

            return;
        }

        alert("Feedback sent successfully!");

        document
        .getElementById("feedbackForm")
        .reset();

    } catch (error) {

        console.log(error);

        alert("Network error. Try again.");

    } finally {

        submitBtn.disabled = false;

        submitBtn.innerText =
        "Send Feedback";
    }
}

/* =========================
   BACK BUTTON
========================= */

function goBack() {

    window.location.href =
    "/dashboard.html?id=" + storeId;
}
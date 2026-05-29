const BASE_URL = "https://storehub-backend-1d97.onrender.com";

/* =========================
   CONTACT PAGE JS
========================= */

document.getElementById("supportForm").addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("userEmail").value;
    const message = document.getElementById("complaint").value;

    const supportEmail = "storehubofficials1@gmail.com";

    const subject = "Storehub Support Request";
    const body =
`Email: ${email}

Message:
${message}`;


/* =========================
   OPEN EMAIL APP (GMAIL STYLE)
========================= */

const mailtoLink =
`mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

window.location.href = mailtoLink;


/* =========================
   SUCCESS MESSAGE
========================= */

alert("Message ready! Sending to Storehub support...");
});

/* =========================
   BACK BUTTON FIX
========================= */

function goDashboard() {
    const storeId = localStorage.getItem("storeId");

    if (!storeId) {
        window.location.href = "/create.html";
        return;
    }

    window.location.href = "dashboard.html?id=" + storeId;
}
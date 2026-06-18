const businessesList = document.getElementById("businesses-list");

async function loadStores() {
    try {

        const response = await fetch(
            "https://storehub-backend-1d97.onrender.com/api/stores"
        );

        const data = await response.json();

        if (!data.success) return;

        businessesList.innerHTML = "";

        data.stores.forEach(store => {

            businessesList.innerHTML += `
                <div class="business-card">
                    <strong>${store.businessName}</strong>
                    <p>${store.description}</p>
                </div>
            `;

        });

    } catch (err) {

        console.log(err);

        businessesList.innerHTML =
            "Unable to load stores";

    }
}

loadStores();
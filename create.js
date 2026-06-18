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
                <a href="view-store.html?id=${store._id}" class="store-card">

                    <div class="store-preview"
                         style="background-image:url('${store.backgroundImage}')">
                    </div>

                    <div class="store-name">
                        ${store.businessName}
                    </div>

                </a>
            `;

        });

    } catch (err) {

        console.log(err);

        businessesList.innerHTML =
            "Unable to load stores";

    }
}

loadStores();
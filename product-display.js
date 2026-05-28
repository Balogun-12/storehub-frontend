const BASE_URL =
  window.location.hostname.includes("192.168")
    ? "http://192.168.225.154:5000"
    : "https://storehub-backend-1d97.onrender.com";

const product = JSON.parse(localStorage.getItem("selectedProduct"));

window.product = product;

if (!product) {
    window.location.href = "view-store.html";
}

/* SAFE DOM UPDATE */
const img = document.getElementById("productImage");
const name = document.getElementById("productName");
const price = document.getElementById("productPrice");

if (img) img.src = product.image;
if (name) name.innerText = product.name;
if (price) price.innerText = product.price;

/* =========================
   BUY NOW / WHATSAPP
========================= */

function buyNow(productName, price, whatsapp) {

    if (!whatsapp) {
        alert("Seller WhatsApp number not available");
        return;
    }

    whatsapp = whatsapp.replace(/\s+/g, "");
    whatsapp = whatsapp.replace(/\+/g, "");

    if (whatsapp.startsWith("0")) {
        whatsapp = "234" + whatsapp.substring(1);
    }

    const message =
        `Hi, I'm interested in this ${productName} priced at ${price}, is it still available?`;

    const url =
        `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
}
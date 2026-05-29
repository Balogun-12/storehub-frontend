/* =========================
   CONFIG
========================= */

const BASE_URL = "https://storehub-backend-1d97.onrender.com";

/* =========================
   ANALYTICS (NEW)
========================= */

function trackEvent(eventName, extra = {}) {

    fetch(`${BASE_URL}/api/analytics`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: currentUser,
            event: eventName,
            storeId,
            ...extra,
            time: Date.now()
        })
    }).catch(err => console.log("Analytics error:", err));
}

/* =========================
   CURRENT USER
========================= */

let currentUser = localStorage.getItem("storeUsername");
let storeId = localStorage.getItem("storeId");
let isLoggedIn = localStorage.getItem("isLoggedIn");

/* =========================
   SAFE AUTH CHECK
========================= */

function checkAuth() {
    return storeId && isLoggedIn === "true";
}

/* =========================
   USER ICON CLICK
========================= */

function handleUserClick() {

    if (!storeId || isLoggedIn !== "true") {
        window.location.href = "/create.html";
        return;
    }

    window.location.href = `dashboard.html?id=${storeId}`;
}

/* =========================
   POSTS DATA
========================= */

let posts = [];

/* =========================
   LOAD FEED
========================= */

window.addEventListener("DOMContentLoaded", async function () {

    const feed = document.getElementById("feed");
    if (!feed) return;
    trackEvent("feed_viewed");

    if (!checkAuth()) {
        feed.innerHTML = "<p style='text-align:center'>Loading feed...</p>";
    }

    feed.innerHTML = "<p style='text-align:center'>Loading feed...</p>";

    try {

        const res = await fetch(`${BASE_URL}/api/posts`, {
            cache: "no-cache"
        });

        const data = await res.json();

        if (!data.success) {
            feed.innerHTML = "<p>Failed to load posts</p>";
            return;
        }

        posts = data.posts || [];

        if (posts.length === 0) {
            feed.innerHTML = "<p style='text-align:center'>No posts yet</p>";
            return;
        }

        feed.innerHTML = "";

        const fragment = document.createDocumentFragment();

        posts.forEach((post, index) => {

            const postCard = document.createElement("div");
            postCard.className = "post";
            postCard.dataset.index = index;

            let imagesHTML = "";

            if (Array.isArray(post.images) && post.images.length > 0) {

                imagesHTML = `
                    <div class="feed-slider">
                        <img 
                            src="${post.images[0]}"
                            id="feed-img-${index}"
                            data-index="0"
                            loading="lazy"
                            style="width:100%; border-radius:10px; background:#eee;"
                        >

                        <div style="display:flex; justify-content:space-between; margin-top:6px;">
                            <button type="button" onclick="changeFeedImage(${index}, -1)">Prev</button>

                            <button type="button" onclick="changeFeedImage(${index}, 1)">Next</button>
                        </div>
                    </div>
                `;
            }

            postCard.innerHTML = `
                <div class="post-info">
                    <strong>@${post.storeUsername || "unknown"}</strong><br>
                    ${post.caption || ""}
                </div>

                ${imagesHTML}

                <div class="post-actions">
                    <button onclick="toggleLike(this)">❤️ Like</button>

                    <button onclick="openComments(this)">💬 Comment</button>

                    <button onclick="toggleSave(this)">🔖 Save</button>

                    <button onclick="sharePost()">🔗 Share</button>
                </div>
            `;

            /* =========================
            🔥 STOREHUB ADDITION (NEW - SAFE)
            ========================= */

            postCard.addEventListener("click", (e) => {

                // Prevent buttons inside card from triggering store open
                if (e.target.tagName === "BUTTON") return;

                trackEvent("store_opened_from_feed", {
                    storeId: post.storeId
                });

                window.location.href = `view-store.html?id=${post.storeId}`;
            });

            fragment.appendChild(postCard);
        });

        feed.appendChild(fragment);

        } catch (error) {

            console.log("FEED ERROR:", error);

            feed.innerHTML = "<p>Error loading feed</p>";
        }
});

/* =========================
   IMAGE SLIDER FUNCTION
========================= */

function changeFeedImage(postIndex, direction) {

    const post = posts[postIndex];
    if (!post || !post.images) return;

    const img = document.getElementById(`feed-img-${postIndex}`);
    if (!img) return;

    let current = parseInt(img.dataset.index || "0");

    current += direction;

    if (current < 0) current = 0;
    if (current >= post.images.length) current = post.images.length - 1;

    img.dataset.index = current;
    img.src = post.images[current];
}

/* =========================
   LIKE
========================= */

function toggleLike(el) {

    el.classList.toggle("liked");

    let postEl = el.closest(".post");
    let postIndex = postEl.dataset.index;

    let likes = JSON.parse(localStorage.getItem("storehub_likes")) || {};

    if (!likes[postIndex]) likes[postIndex] = [];

    const alreadyLiked = likes[postIndex].some(l => l.user === currentUser);

    if (!alreadyLiked) {
        likes[postIndex].push({
            user: currentUser,
            time: Date.now()
        });
    }

    localStorage.setItem("storehub_likes", JSON.stringify(likes));
}

/* =========================
   SAVE
========================= */

function toggleSave(el) {

    el.classList.toggle("saved");

    let postEl = el.closest(".post");
    let postIndex = postEl.dataset.index;

    let saved = JSON.parse(localStorage.getItem("storehub_saved")) || [];

    const exists = saved.some(s => s.postIndex == postIndex && s.user === currentUser);

    if (!exists) {
        saved.push({
            postIndex,
            user: currentUser,
            time: Date.now()
        });
    }

    localStorage.setItem("storehub_saved", JSON.stringify(saved));
}

/* =========================
   COMMENTS
========================= */

function openComments(el) {

    let postEl = el.closest(".post");
    let postIndex = postEl.dataset.index;

    let post = posts[postIndex];

    if (!post) return alert("Post not found");

    let comment = prompt("Write comment");
    if (!comment) return;

    let comments = JSON.parse(localStorage.getItem("storehub_comments")) || [];

    comments.push({
        postIndex,
        storeUsername: post.storeUsername,
        fromUser: currentUser,
        message: comment,
        time: Date.now()
    });

    localStorage.setItem("storehub_comments", JSON.stringify(comments));

    alert("Comment added!");
}

/* =========================
   SHARE
========================= */

function sharePost() {

    const url = window.location.href;

    if (navigator.share) {
        trackEvent("post_shared");
        navigator.share({
            title: "StoreHub",
            text: "Check this post",
            url
        });

    } else {
        navigator.clipboard.writeText(url);
        trackEvent("post_shared")
        alert("Link copied!");
    }
}

/* =========================
   SEARCH
========================= */

function openSearch() {

    let query = prompt("Search posts:");
    if (!query) return;

    query = query.toLowerCase();

    let results = posts.filter(p =>
        p.storeUsername?.toLowerCase().includes(query) ||
        p.caption?.toLowerCase().includes(query)
    );

    if (!results.length) {
        alert("No results found");
        return;
    }

    const selectedStoreId = results[0].storeId;

    // TRACK SEARCH ACTION (NEW)
    trackEvent("search_used", {
        query: query
    });

    if (!selectedStoreId) {
        alert("Store not found");
        return;
    }

    // TRACK STORE OPEN FROM SEARCH (NEW)
    trackEvent("store_opened_from_search", {
        storeId: selectedStoreId
    });

    window.location.href =
        `view-store.html?id=${selectedStoreId}`;
}

document.addEventListener("DOMContentLoaded", () => {

    const currentPage = window.location.pathname;

    const homeIcon = document.querySelector('.nav-item[href="index.html"]');
    const userIcon = document.querySelector('.nav-item[onclick]');

    // FEED PAGE ACTIVE
    if (currentPage.includes("index.html") && homeIcon) {
        homeIcon.classList.add("active");
    }

    // DASHBOARD ACTIVE
    if (currentPage.includes("dashboard") && userIcon) {
        userIcon.classList.add("active");
    }
});

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
        .register("service-worker.js")

        .then(() => {
            console.log("Service Worker Registered");
        })

        .catch((error) => {
            console.log(error);
        });

    });

}

/* =========================
   DASHBOARD NAV
========================= */

function goDashboard() {

    const storeId = localStorage.getItem("storeId");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!storeId || isLoggedIn !== "true") {
        window.location.href = "/create.html";
        return;
    }

    window.location.href = "/dashboard.html?id=" + storeId;
}
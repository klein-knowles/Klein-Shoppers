const featuredVideo = document.getElementById("featuredVideo");
const publicVideosGrid = document.getElementById("publicVideosGrid");
const sellerVideoForm = document.getElementById("sellerVideoForm");
const sellerProductSelect = document.getElementById("sellerProductId");
const sellerUploadButton = document.getElementById("sellerUploadButton");
const sellerUploadMessage = document.getElementById("sellerUploadMessage");
const sellerUploadProgressBar = document.getElementById("sellerUploadProgressBar");
const sellerUploadProgress = document.querySelector(".seller-upload-progress");

let publicVideos = [];
let productsById = new Map();

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
}

function publicVideoSource(video) {
    if (video.videoType === "embed") {
        return video.embedUrl;
    }

    return video.streamUrl || `/api/videos/${video._id}/stream`;
}

function productName(video) {
    return video.productName || productsById.get(String(video.productId)) || "";
}

function renderFeatured(video) {
    if (!video) {
        featuredVideo.innerHTML = "<p>No videos are available yet.</p>";
        return;
    }

    if (video.videoType === "embed") {
        featuredVideo.innerHTML = `
            <iframe
                src="${escapeAttribute(publicVideoSource(video))}"
                title="${escapeAttribute(video.title)}"
                allowfullscreen
                style="aspect-ratio:16/9;width:100%;border:0;border-radius:8px;background:#020617"
            ></iframe>
            <h2>${escapeHtml(video.title)}</h2>
            <p>${escapeHtml(video.description || "")}</p>
            ${productName(video) ? `<p class="video-product-link">Product: <a href="/products.html">${escapeHtml(productName(video))}</a></p>` : ""}
        `;
        return;
    }

    featuredVideo.innerHTML = `
        <video src="${escapeAttribute(publicVideoSource(video))}" controls preload="metadata"></video>
        <h2>${escapeHtml(video.title)}</h2>
        <p>${escapeHtml(video.description || "")}</p>
        ${productName(video) ? `<p class="video-product-link">Product: ${escapeHtml(productName(video))}</p>` : ""}
    `;
}

function renderPublicVideos() {
    if (!publicVideos.length) {
        publicVideosGrid.innerHTML = "";
        renderFeatured(null);
        return;
    }

    renderFeatured(publicVideos[0]);

    publicVideosGrid.innerHTML = publicVideos.map(video => `
        <article class="public-video-card">
            <button type="button" data-video-id="${escapeAttribute(video._id)}">
                <div class="public-video-thumb">Play Video</div>
                <div class="public-video-body">
                    <h2>${escapeHtml(video.title)}</h2>
                    <p>${productName(video) ? `${escapeHtml(productName(video))} · ` : ""}${Number(video.views || 0).toLocaleString()} views</p>
                </div>
            </button>
        </article>
    `).join("");
}

async function loadPublicVideos() {
    try {
        const response = await fetch("/api/videos?limit=48");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load videos.");
        }

        publicVideos = result.videos || [];
        renderPublicVideos();
    } catch (error) {
        featuredVideo.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    }
}

async function loadSellerProducts() {
    try {
        const response = await fetch("/products");
        const products = await response.json();
        if (!response.ok || !Array.isArray(products)) {
            throw new Error("Products are unavailable right now.");
        }

        productsById = new Map(products.map(product => [String(product.id), product.name]));
        sellerProductSelect.innerHTML = '<option value="">Choose the product</option>' +
            products.map(product => `<option value="${escapeAttribute(product.id)}">${escapeHtml(product.name)}</option>`).join("");
        renderPublicVideos();
    } catch (error) {
        sellerProductSelect.innerHTML = '<option value="">Products could not be loaded</option>';
        sellerUploadMessage.textContent = error.message;
        sellerUploadMessage.className = "seller-upload-message error";
    }
}

function setSellerUploadMessage(message, type = "") {
    sellerUploadMessage.textContent = message;
    sellerUploadMessage.className = `seller-upload-message ${type}`.trim();
}

sellerVideoForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!sellerVideoForm.reportValidity()) return;

    const formData = new FormData(sellerVideoForm);
    const xhr = new XMLHttpRequest();
    sellerUploadButton.disabled = true;
    sellerUploadButton.textContent = "Uploading…";
    sellerUploadProgressBar.style.width = "0%";
    sellerUploadProgress.setAttribute("aria-valuenow", "0");
    setSellerUploadMessage("Your video is uploading.");

    xhr.upload.addEventListener("progress", event => {
        if (!event.lengthComputable) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        sellerUploadProgressBar.style.width = `${percent}%`;
        sellerUploadProgress.setAttribute("aria-valuenow", String(percent));
    });

    xhr.addEventListener("load", async () => {
        let result = {};
        try {
            result = JSON.parse(xhr.responseText || "{}");
        } catch (error) {
            result = {};
        }

        if (xhr.status < 200 || xhr.status >= 300) {
            setSellerUploadMessage(result.message || "Upload failed. Please try again.", "error");
            sellerUploadButton.disabled = false;
            sellerUploadButton.textContent = "Upload product video";
            return;
        }

        sellerVideoForm.reset();
        setSellerUploadMessage("Your product video is now in the Video Library.", "success");
        await loadPublicVideos();
        sellerUploadButton.disabled = false;
        sellerUploadButton.textContent = "Upload product video";
    });

    xhr.addEventListener("error", () => {
        setSellerUploadMessage("Upload failed. Check your connection and try again.", "error");
        sellerUploadButton.disabled = false;
        sellerUploadButton.textContent = "Upload product video";
    });

    xhr.open("POST", "/api/videos/seller-upload");
    xhr.send(formData);
});

publicVideosGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-video-id]");
    if (!button) return;

    const video = publicVideos.find(item => item._id === button.dataset.videoId);
    renderFeatured(video);
    window.scrollTo({ top: 0, behavior: "smooth" });
});

Promise.all([loadPublicVideos(), loadSellerProducts()]);

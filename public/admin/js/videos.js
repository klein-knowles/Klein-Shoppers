initLayout("Videos");

const form = document.getElementById("videoUploadForm");
const uploadButton = document.getElementById("uploadButton");
const uploadMessage = document.getElementById("uploadMessage");
const uploadProgressBar = document.getElementById("uploadProgressBar");
const videosGrid = document.getElementById("videosGrid");
const selectedVideo = document.getElementById("selectedVideo");
const refreshVideos = document.getElementById("refreshVideos");
const productSelect = document.getElementById("productId");

let videos = [];
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

function setMessage(text, type) {
    uploadMessage.textContent = text;
    uploadMessage.className = type ? `form-message ${type}` : "form-message";
}

function formatBytes(bytes) {
    if (!bytes) return "0 MB";
    return `${(Number(bytes) / (1024 * 1024)).toFixed(1)} MB`;
}

function videoSource(video) {
    if (video.videoType === "embed") {
        return video.embedUrl;
    }

    return video.streamUrl || `/api/videos/${video._id}/stream`;
}

function showVideo(video) {
    const source = escapeAttribute(videoSource(video));

    selectedVideo.innerHTML = `
        <video src="${source}" controls preload="metadata"></video>
        <h4>${escapeHtml(video.title)}</h4>
        <p class="muted">${escapeHtml(video.description || "No description added.")}</p>
        <p class="muted">${escapeHtml(video.category || "general")} | ${escapeHtml(productsById.get(String(video.productId)) || (video.productId ? `Product ${video.productId}` : "Store video"))} | ${Number(video.views || 0).toLocaleString()} views</p>
    `;
}

function renderVideos() {
    if (!videos.length) {
        videosGrid.innerHTML = '<p class="muted">No videos uploaded yet.</p>';
        selectedVideo.innerHTML = '<p class="muted">Upload a video to preview it here.</p>';
        return;
    }

    videosGrid.innerHTML = videos.map(video => `
        <article class="video-card">
            <button type="button" data-preview="${escapeAttribute(video._id)}">
                <div class="video-thumb">Play</div>
                <div class="video-card-body">
                    <h4>${escapeHtml(video.title)}</h4>
            <p>${escapeHtml(video.category || "general")} | ${escapeHtml(productsById.get(String(video.productId)) || (video.productId ? `Product ${video.productId}` : "Store video"))} | ${formatBytes(video.size)} | ${Number(video.views || 0).toLocaleString()} views</p>
                </div>
            </button>
            <div class="video-card-actions">
                <a href="${escapeAttribute(videoSource(video))}" target="_blank" rel="noopener">Stream</a>
                <button type="button" data-delete="${escapeAttribute(video._id)}">Delete</button>
            </div>
        </article>
    `).join("");

    showVideo(videos[0]);
}

async function loadVideos() {
    videosGrid.innerHTML = '<p class="muted">Loading videos...</p>';

    try {
        const response = await fetch("/api/videos?limit=60");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load videos.");
        }

        videos = result.videos || [];
        renderVideos();
    } catch (error) {
        videosGrid.innerHTML = `<p class="form-message error">${escapeHtml(error.message)}</p>`;
    }
}

async function loadProducts() {
    try {
        const response = await fetch("/products");
        if (!response.ok) throw new Error("Unable to load products.");
        const products = await response.json();
        productsById = new Map(products.map(product => [String(product.id), product.name]));
        productSelect.innerHTML = '<option value="">Store video (not linked to a product)</option>' +
            products.map(product => `<option value="${escapeAttribute(product.id)}">${escapeHtml(product.name)}</option>`).join("");
    } catch (error) {
        productSelect.innerHTML = '<option value="">Store video (not linked to a product)</option>';
        console.error(error);
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const xhr = new XMLHttpRequest();

    uploadButton.disabled = true;
    uploadButton.textContent = "Uploading...";
    uploadProgressBar.style.width = "0";
    setMessage("", "");

    xhr.upload.addEventListener("progress", (event) => {
        if (!event.lengthComputable) return;

        const percent = Math.round((event.loaded / event.total) * 100);
        uploadProgressBar.style.width = `${percent}%`;
    });

    xhr.addEventListener("load", async () => {
        uploadButton.disabled = false;
        uploadButton.textContent = "Upload Video";

        let result = {};
        try {
            result = JSON.parse(xhr.responseText || "{}");
        } catch (error) {
            result = {};
        }

        if (xhr.status >= 200 && xhr.status < 300) {
            form.reset();
            document.getElementById("category").value = "general";
            setMessage(result.message || "Video uploaded successfully.", "success");
            await loadVideos();
        } else {
            setMessage(result.message || "Upload failed.", "error");
        }
    });

    xhr.addEventListener("error", () => {
        uploadButton.disabled = false;
        uploadButton.textContent = "Upload Video";
        setMessage("Upload failed. Please try again.", "error");
    });

    xhr.open("POST", "/api/videos/upload");
    xhr.send(formData);
});

videosGrid.addEventListener("click", async (event) => {
    const previewButton = event.target.closest("[data-preview]");
    const deleteButton = event.target.closest("[data-delete]");

    if (previewButton) {
        const video = videos.find(item => item._id === previewButton.dataset.preview);
        if (video) showVideo(video);
    }

    if (deleteButton) {
        const video = videos.find(item => item._id === deleteButton.dataset.delete);
        if (!video || !confirm(`Delete "${video.title}"?`)) return;

        const response = await fetch(`/api/videos/${video._id}`, { method: "DELETE" });
        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Unable to delete video.");
            return;
        }

        await loadVideos();
    }
});

refreshVideos.addEventListener("click", loadVideos);
Promise.all([loadProducts(), loadVideos()]);

if (typeof initLayout !== "function") {
    const script = document.createElement("script");
    script.src = "/admin/js/admin.js";
    script.defer = false;
    document.head.appendChild(script);
}

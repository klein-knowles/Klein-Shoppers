// ======================================================
// KLEIN SHOPPERS
// WEBSITE SETTINGS
// ======================================================

const API = "/settings";

let settings = {};

let hasChanges = false;

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    loadSettings();

    registerEvents();

});

// ======================================================
// LOAD SETTINGS
// ======================================================

async function loadSettings() {

    try {

        showLoading();

        const response = await fetch(API);

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                "Unable to load settings.",

                "danger"

            );

            return;

        }

        settings = result.settings;

        populateForm();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(

            "Server error.",

            "danger"

        );

    }

}

// ======================================================
// POPULATE FORM
// ======================================================

function populateForm() {

    setValue("website_name");

    setValue("tagline");

    setValue("email");

    setValue("phone");

    setValue("address");

    setValue("theme");

    setValue("currency");

    setValue("currency_symbol");

    setValue("decimal_places");

    setValue("thousand_separator");

    setValue("tax_rate");

    setValue("tax_name");

    setValue("tax_included");

    setValue("shipping_fee");

    setValue("free_shipping");

    setValue("delivery_days");

    setValue("shipping_method");

    setValue("shipping_country");

    setValue("facebook");

    setValue("instagram");

    setValue("twitter");

    setValue("youtube");

    setValue("linkedin");

    setValue("tiktok");

    setValue("whatsapp");

    setValue("meta_title");

    setValue("meta_description");

    setValue("meta_keywords");

    setValue("google_analytics");

    setValue("google_console");

    setValue("smtp_host");

    setValue("smtp_port");

    setValue("smtp_email");

    setValue("smtp_password");

    setValue("smtp_secure");

    setValue("maintenance_message");

    setCheckbox("maintenance");

    setCheckbox("enable_shipping");

    setCheckbox("enable_seo");

    setCheckbox("animations");

    setCheckbox("roundedCorners");

    updateSummaryCards();

    loadLogo();

}

// ======================================================
// SET INPUT VALUE
// ======================================================

function setValue(id) {

    const element = document.getElementById(id);

    if (!element) return;

    element.value = settings[id] || "";

}

// ======================================================
// SET CHECKBOX
// ======================================================

function setCheckbox(id) {

    const element = document.getElementById(id);

    if (!element) return;

    element.checked =

        settings[id] == 1 ||

        settings[id] === "1" ||

        settings[id] === true ||

        settings[id] === "true";

}

// ======================================================
// LOAD LOGO
// ======================================================

function loadLogo() {

    const image =

        document.getElementById("logoPreview");

    if (!image) return;

    if (settings.logo) {

        image.src =

            "/uploads/logo/" +

            settings.logo +

            "?t=" +

            Date.now();

    }

}

// ======================================================
// UPDATE SUMMARY CARDS
// ======================================================

function updateSummaryCards() {

    const theme =

        settings.theme || "Light";

    const currency =

        settings.currency || "UGX";

    const tax =

        settings.tax_rate || "18";

    const maintenance =

        settings.maintenance == 1

        ? "ON"

        : "OFF";

    document.getElementById("themeLabel").textContent =

        theme.toUpperCase();

    document.getElementById("currencyLabel").textContent =

        currency;

    document.getElementById("taxLabel").textContent =

        tax + "%";

    document.getElementById("maintenanceLabel").textContent =

        maintenance;

}

// ======================================================
// REGISTER EVENTS
// ======================================================

function registerEvents() {

    document

        .querySelectorAll(

            "input, textarea, select"

        )

        .forEach(control => {

            control.addEventListener(

                "change",

                () => {

                    hasChanges = true;

                }

            );

        });

    const logo =

        document.getElementById("logoFile");

    if (logo) {

        logo.addEventListener(

            "change",

            previewLogo

        );

    }

}

// ======================================================
// PREVIEW LOGO
// ======================================================

function previewLogo() {

    const file =

        document.getElementById("logoFile")

        .files[0];

    if (!file) return;

    const reader =

        new FileReader();

    reader.onload = e => {

        document.getElementById(

            "logoPreview"

        ).src = e.target.result;

    };

    reader.readAsDataURL(file);

}

// ======================================================
// WARN BEFORE LEAVING
// ======================================================

window.addEventListener(

    "beforeunload",

    e => {

        if (!hasChanges) return;

        e.preventDefault();

        e.returnValue = "";

    }

);

// ======================================================
// COLLECT ALL FORM VALUES
// ======================================================

function collectSettings() {

    return {

        website_name:
            getValue("website_name"),

        tagline:
            getValue("tagline"),

        email:
            getValue("email"),

        phone:
            getValue("phone"),

        address:
            getValue("address"),

        theme:
            getValue("theme"),

        currency:
            getValue("currency"),

        currency_symbol:
            getValue("currency_symbol"),

        decimal_places:
            getValue("decimal_places"),

        thousand_separator:
            getValue("thousand_separator"),

        tax_rate:
            getValue("tax_rate"),

        tax_name:
            getValue("tax_name"),

        tax_included:
            getValue("tax_included"),

        shipping_fee:
            getValue("shipping_fee"),

        free_shipping:
            getValue("free_shipping"),

        delivery_days:
            getValue("delivery_days"),

        shipping_method:
            getValue("shipping_method"),

        shipping_country:
            getValue("shipping_country"),

        facebook:
            getValue("facebook"),

        instagram:
            getValue("instagram"),

        twitter:
            getValue("twitter"),

        youtube:
            getValue("youtube"),

        linkedin:
            getValue("linkedin"),

        tiktok:
            getValue("tiktok"),

        whatsapp:
            getValue("whatsapp"),

        meta_title:
            getValue("meta_title"),

        meta_description:
            getValue("meta_description"),

        meta_keywords:
            getValue("meta_keywords"),

        google_analytics:
            getValue("google_analytics"),

        google_console:
            getValue("google_console"),

        smtp_host:
            getValue("smtp_host"),

        smtp_port:
            getValue("smtp_port"),

        smtp_email:
            getValue("smtp_email"),

        smtp_password:
            getValue("smtp_password"),

        smtp_secure:
            getValue("smtp_secure"),

        maintenance_message:
            getValue("maintenance_message"),

        maintenance:
            getCheckbox("maintenance"),

        enable_shipping:
            getCheckbox("enable_shipping"),

        enable_seo:
            getCheckbox("enable_seo"),

        animations:
            getCheckbox("animations"),

        roundedCorners:
            getCheckbox("roundedCorners")

    };

}

// ======================================================
// SAVE SETTINGS
// ======================================================

async function saveSettings() {

    try {

        showLoading();

        const response = await fetch(

            `${API}/save`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(

                    collectSettings()

                )

            }

        );

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                result.message ||

                "Unable to save settings.",

                "danger"

            );

            return;

        }

        hasChanges = false;

        showToast(

            "Settings saved successfully.",

            "success"

        );

        loadSettings();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(

            "Server error.",

            "danger"

        );

    }

}

// ======================================================
// UPLOAD WEBSITE LOGO
// ======================================================

async function uploadLogo() {

    const file =

        document.getElementById("logoFile")

        .files[0];

    if (!file) {

        showToast(

            "Please choose a logo.",

            "warning"

        );

        return;

    }

    const form = new FormData();

    form.append(

        "logo",

        file

    );

    try {

        showLoading();

        const response = await fetch(

            `${API}/logo`,

            {

                method: "POST",

                body: form

            }

        );

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                result.message ||

                "Upload failed.",

                "danger"

            );

            return;

        }

        showToast(

            "Logo uploaded successfully.",

            "success"

        );

        loadSettings();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(

            "Server error.",

            "danger"

        );

    }

}

// ======================================================
// DELETE LOGO
// ======================================================

async function deleteLogo() {

    if (!confirm(

        "Delete website logo?"

    )) {

        return;

    }

    try {

        showLoading();

        const response = await fetch(

            `${API}/logo`,

            {

                method: "DELETE"

            }

        );

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                result.message ||

                "Unable to remove logo.",

                "danger"

            );

            return;

        }

        document.getElementById(

            "logoPreview"

        ).src =

        "/images/no-image.png";

        document.getElementById(

            "logoFile"

        ).value = "";

        showToast(

            "Logo removed.",

            "success"

        );

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(

            "Server error.",

            "danger"

        );

    }

}

// ======================================================
// RESET TO DEFAULTS
// ======================================================

async function resetSettings() {

    try {

        showLoading();

        const response = await fetch(

            `${API}/reset`,

            {

                method: "POST"

            }

        );

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                result.message ||

                "Reset failed.",

                "danger"

            );

            return;

        }

        bootstrap.Modal
            .getInstance(
                document.getElementById(
                    "resetModal"
                )
            )
            .hide();

        showToast(

            "Factory settings restored.",

            "success"

        );

        hasChanges = false;

        loadSettings();

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(

            "Server error.",

            "danger"

        );

    }

}

// ======================================================
// TEST SMTP CONNECTION
// ======================================================

async function testSMTP() {

    try {

        showLoading();

        const response = await fetch(

            "/emails/test",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    host: getValue("smtp_host"),

                    port: getValue("smtp_port"),

                    email: getValue("smtp_email"),

                    password: getValue("smtp_password"),

                    secure: getValue("smtp_secure")

                })

            }

        );

        const result = await response.json();

        hideLoading();

        if (!result.success) {

            showToast(

                result.message ||

                "SMTP test failed.",

                "danger"

            );

            return;

        }

        showToast(

            "SMTP connection successful.",

            "success"

        );

    }

    catch (err) {

        console.error(err);

        hideLoading();

        showToast(

            "Unable to test SMTP.",

            "danger"

        );

    }

}

// ======================================================
// GET INPUT VALUE
// ======================================================

function getValue(id) {

    const element = document.getElementById(id);

    if (!element) return "";

    return element.value.trim();

}

// ======================================================
// GET CHECKBOX VALUE
// ======================================================

function getCheckbox(id) {

    const element = document.getElementById(id);

    if (!element) return 0;

    return element.checked ? 1 : 0;

}

// ======================================================
// SHOW LOADING MODAL
// ======================================================

function showLoading() {

    const modal = document.getElementById("loadingModal");

    if (!modal) return;

    bootstrap.Modal.getOrCreateInstance(modal).show();

}

// ======================================================
// HIDE LOADING MODAL
// ======================================================

function hideLoading() {

    const modal = document.getElementById("loadingModal");

    if (!modal) return;

    bootstrap.Modal.getOrCreateInstance(modal).hide();

}

// ======================================================
// SHOW TOAST MESSAGE
// ======================================================

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    const body = document.getElementById("toastMessage");

    if (!toast || !body) {

        alert(message);

        return;

    }

    body.textContent = message;

    toast.classList.remove(

        "text-bg-success",

        "text-bg-danger",

        "text-bg-warning",

        "text-bg-info"

    );

    switch (type) {

        case "danger":

            toast.classList.add("text-bg-danger");

            break;

        case "warning":

            toast.classList.add("text-bg-warning");

            break;

        case "info":

            toast.classList.add("text-bg-info");

            break;

        default:

            toast.classList.add("text-bg-success");

            break;

    }

    bootstrap.Toast

        .getOrCreateInstance(toast)

        .show();

}

// ======================================================
// LIVE SUMMARY UPDATE
// ======================================================

document.addEventListener("input", () => {

    const currency = document.getElementById("currency");

    const theme = document.getElementById("theme");

    const tax = document.getElementById("tax_rate");

    const maintenance = document.getElementById("maintenance");

    if (currency) {

        document.getElementById("currencyLabel").textContent =

            currency.value || "UGX";

    }

    if (theme) {

        document.getElementById("themeLabel").textContent =

            theme.value.toUpperCase();

    }

    if (tax) {

        document.getElementById("taxLabel").textContent =

            (tax.value || "0") + "%";

    }

    if (maintenance) {

        document.getElementById("maintenanceLabel").textContent =

            maintenance.checked ? "ON" : "OFF";

    }

});

// ======================================================
// SIMPLE VALIDATION
// ======================================================

function validateSettings() {

    if (!getValue("website_name")) {

        showToast(

            "Website name is required.",

            "warning"

        );

        return false;

    }

    if (!getValue("currency")) {

        showToast(

            "Currency is required.",

            "warning"

        );

        return false;

    }

    return true;

}

// ======================================================
// OVERRIDE SAVE WITH VALIDATION
// ======================================================

const originalSaveSettings = saveSettings;

saveSettings = async function () {

    if (!validateSettings()) {

        return;

    }

    await originalSaveSettings();

};

// ======================================================
// END OF SETTINGS.JS
// ======================================================
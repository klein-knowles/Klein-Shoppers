(() => {
    const links = [
        ["Home", "/", "site-nav-home"],
        ["Shop", "/products.html"],
        ["Departments", "/departments.html"],
        ["Digital Services", "/digital-services.html"],
        ["Device Support", "/device-support.html"],
        ["Deals", "/deals.html"],
        ["Videos", "/videos.html"],
        ["Wishlist", "/wishlist.html"],
        ["Cart", "/cart.html"],
        ["Account", "/account.html"],
        ["Orders", "/orders.html"],
        ["Support", "/customer-service.html"],
        ["Sell", "/sell.html"],
        ["Ask Klein Assistant", "/#ask-klein-ai"]
    ];
    const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
    const nav = document.createElement("nav");
    nav.className = "site-universal-nav";
    nav.setAttribute("aria-label", "Main site navigation");

    for (const [label, href, className = ""] of links) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        if (className) link.classList.add(className);
        const linkPath = href.split("#")[0].replace(/\/$/, "") || "/";
        if (href !== "/#ask-klein-ai" && currentPath === linkPath) link.setAttribute("aria-current", "page");
        nav.appendChild(link);
    }

    const languageControl = document.createElement("label");
    languageControl.className = "site-language-control";
    languageControl.htmlFor = "siteLanguageSelect";
    languageControl.textContent = "Language";

    const languageSelect = document.createElement("select");
    languageSelect.id = "siteLanguageSelect";
    languageSelect.setAttribute("aria-label", "Choose website language");
    languageSelect.innerHTML = `
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="sw">Kiswahili</option>
        <option value="es">Español</option>
        <option value="pa">ਪੰਜਾਬੀ</option>
        <option value="zh">中文</option>
    `;
    languageControl.appendChild(languageSelect);
    nav.appendChild(languageControl);

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/css/site-nav.css";
    document.head.appendChild(stylesheet);

    const existingMenu = document.querySelector(".site-header .menubar");
    if (existingMenu) {
        for (const link of nav.querySelectorAll("a")) {
            const href = new URL(link.href).pathname.replace(/\/$/, "") || "/";
            const exists = [...existingMenu.querySelectorAll("a")].some(item =>
                (new URL(item.href).pathname.replace(/\/$/, "") || "/") === href
            );
            if (!exists) existingMenu.appendChild(link);
        }
        existingMenu.appendChild(languageControl);
    } else {
        const header = document.querySelector("body > header");
        if (header) header.insertAdjacentElement("afterend", nav);
        else document.body.insertAdjacentElement("afterbegin", nav);
    }

    const translationsScript = document.createElement("script");
    translationsScript.src = "/js/i18n.js";
    document.head.appendChild(translationsScript);
})();

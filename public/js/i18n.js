(() => {
    const selector = document.getElementById("siteLanguageSelect");
    if (!selector) return;

    const supportedLocales = new Set(["en", "fr", "sw", "es", "pa", "zh"]);
    const storageKey = "klein-shoppers-language";
    const translationsCache = new Map();
    const originalText = new WeakMap();
    const originalAttributes = new WeakMap();
    let activeTranslations = {};

    function getSavedLocale() {
        try {
            const saved = localStorage.getItem(storageKey);
            return supportedLocales.has(saved) ? saved : "en";
        } catch (error) {
            return "en";
        }
    }

    function replaceTextNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return;
        if (!originalText.has(node)) originalText.set(node, node.nodeValue);
        const source = originalText.get(node);
        const leading = source.match(/^\s*/)[0];
        const trailing = source.match(/\s*$/)[0];
        const text = source.trim();
        const translated = activeTranslations[text] || text;
        const replacement = `${leading}${translated}${trailing}`;
        if (node.nodeValue !== replacement) node.nodeValue = replacement;
    }

    function translateElement(root) {
        if (!root) return;
        const elements = root.nodeType === Node.ELEMENT_NODE
            ? [root, ...root.querySelectorAll("*")]
            : [];

        for (const element of elements) {
            if (["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(element.tagName)) continue;
            if (!originalAttributes.has(element)) originalAttributes.set(element, new Map());
            const sourceAttributes = originalAttributes.get(element);
            for (const attribute of ["alt", "aria-label", "placeholder", "title", "value"]) {
                const value = element.getAttribute(attribute);
                if (value !== null && !sourceAttributes.has(attribute)) {
                    sourceAttributes.set(attribute, value);
                }
                if (!sourceAttributes.has(attribute)) continue;
                const source = sourceAttributes.get(attribute);
                const translated = activeTranslations[source.trim()] || source;
                if (translated !== value) element.setAttribute(attribute, translated);
            }
        }

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent || parent.closest("script, style, noscript, textarea")) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        while (walker.nextNode()) replaceTextNode(walker.currentNode);
    }

    async function loadTranslations(locale) {
        if (locale === "en") return {};
        if (translationsCache.has(locale)) return translationsCache.get(locale);

        const response = await fetch(`/i18n/${locale}.json`, { cache: "force-cache" });
        if (!response.ok) throw new Error("Translations could not be loaded.");
        const translations = await response.json();
        translationsCache.set(locale, translations);
        return translations;
    }

    async function applyLocale(locale) {
        if (!supportedLocales.has(locale)) locale = "en";
        selector.disabled = true;
        try {
            activeTranslations = await loadTranslations(locale);
            document.documentElement.lang = locale;
            translateElement(document.head);
            translateElement(document.body);
            try {
                localStorage.setItem(storageKey, locale);
            } catch (error) {
                // The current page still uses this language when storage is unavailable.
            }
        } catch (error) {
            selector.value = "en";
            activeTranslations = {};
            document.documentElement.lang = "en";
            console.error(error);
        } finally {
            selector.disabled = false;
        }
    }

    selector.value = getSavedLocale();
    selector.addEventListener("change", () => applyLocale(selector.value));

    const observer = new MutationObserver(records => {
        for (const record of records) {
            if (record.type === "characterData") {
                replaceTextNode(record.target);
            } else {
                for (const node of record.addedNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        replaceTextNode(node);
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        translateElement(node);
                    }
                }
            }
        }
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });

    if (selector.value !== "en") applyLocale(selector.value);
})();

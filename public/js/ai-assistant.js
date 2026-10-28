(() => {
    const toggle = document.getElementById("aiAssistantToggle");
    const panel = document.getElementById("aiAssistantPanel");
    const close = document.getElementById("aiAssistantClose");
    const form = document.getElementById("aiAssistantForm");
    const input = document.getElementById("aiAssistantInput");
    const messages = document.getElementById("aiAssistantMessages");
    if (!toggle || !panel || !form || !input || !messages) return;

    function setOpen(open) {
        panel.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
        if (open) input.focus();
    }

    function addMessage(text, role, isError = false) {
        const message = document.createElement("p");
        message.className = `ai-message ${role}${isError ? " error" : ""}`;
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
        return message;
    }

    toggle.addEventListener("click", () => setOpen(panel.hidden));
    close.addEventListener("click", () => setOpen(false));
    if (window.location.hash === "#ask-klein-ai") setOpen(true);

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        addMessage(message, "user");
        input.value = "";
        input.disabled = true;
        const submit = form.querySelector("button[type='submit']");
        submit.disabled = true;
        const pending = addMessage("Thinking…", "assistant");

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || result.message || "I couldn't answer just now. Please try again.");
            pending.textContent = result.reply || "I don't have an answer for that yet.";
        } catch (error) {
            pending.classList.add("error");
            pending.textContent = error.message || "Connection problem. Please try again.";
        } finally {
            input.disabled = false;
            submit.disabled = false;
            input.focus();
            messages.scrollTop = messages.scrollHeight;
        }
    });
})();

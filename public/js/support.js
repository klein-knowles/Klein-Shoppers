const SupportSystem = {
    user: null,
    currentTicketId: null,
    chatInterval: null,

    init() {
        this.user = JSON.parse(localStorage.getItem("support_user") || "null");
        if (this.user) this.showDashboard();
    },

    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/customers/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Login failed.");
            }

            this.user = {
                id: result.customer.id,
                name: [result.customer.first_name, result.customer.last_name].filter(Boolean).join(" ") || result.customer.email,
                email: result.customer.email,
                role: "customer"
            };
            localStorage.setItem("support_user", JSON.stringify(this.user));
            this.showDashboard();
        } catch (error) {
            alert(error.message);
        }
    },

    logout() {
        this.user = null;
        localStorage.removeItem("support_user");
        if (this.chatInterval) clearInterval(this.chatInterval);
        fetch("/customers/logout", { method: "POST" }).catch(() => {});
        document.getElementById("loginForm").style.display = "block";
        document.getElementById("dashboard").style.display = "none";
        document.getElementById("welcomeMessage").textContent = "";
    },

    showDashboard() {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("welcomeMessage").textContent = `Welcome, ${this.user.name}`;
        this.showTab("tickets");
    },

    showTab(tabName) {
        ["ticketsTab", "newTicketTab", "chatTab", "ticketDetail"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });

        const tabMap = { tickets: "ticketsTab", newTicket: "newTicketTab", chat: "chatTab" };
        if (tabMap[tabName]) document.getElementById(tabMap[tabName]).style.display = "block";

        document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
        const activeButton = document.querySelector(`.nav-btn[onclick="showTab('${tabName}')"]`);
        if (activeButton) activeButton.classList.add("active");

        if (tabName === "tickets") this.loadTickets();
        if (tabName === "chat") this.startChat();
    },

    async loadTickets() {
        const container = document.getElementById("ticketsList");
        container.innerHTML = "<p>Loading tickets...</p>";

        try {
            const status = document.getElementById("statusFilter")?.value || "";
            const response = await fetch(`/api/tickets?status=${encodeURIComponent(status)}`);
            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Unable to load tickets.");
            }

            if (!data.tickets.length) {
                container.innerHTML = "<p>No tickets found. Create a new one when you need help.</p>";
                return;
            }

            container.innerHTML = data.tickets.map(ticket => `
                <article class="ticket-card" onclick="SupportSystem.viewTicket(${Number(ticket.id)})">
                    <h3>${this.escapeHtml(ticket.subject)}</h3>
                    <div class="ticket-meta">
                        <span class="status-badge status-${this.escapeHtml(ticket.status)}">${this.escapeHtml(ticket.status)}</span>
                        <span class="priority-badge priority-${this.escapeHtml(ticket.priority)}">${this.escapeHtml(ticket.priority)}</span>
                        <span>${new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                </article>
            `).join("");
        } catch (error) {
            container.innerHTML = `<p>${this.escapeHtml(error.message)}</p>`;
        }
    },

    async createTicket(event) {
        event.preventDefault();
        const subject = document.getElementById("subject").value;
        const description = document.getElementById("description").value;
        const priority = document.getElementById("priority").value;

        try {
            const response = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, description, priority })
            });
            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Unable to create ticket.");
            }

            document.getElementById("subject").value = "";
            document.getElementById("description").value = "";
            this.showTab("tickets");
        } catch (error) {
            alert(error.message);
        }
    },

    async viewTicket(id) {
        this.currentTicketId = id;
        document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
        document.getElementById("ticketDetail").style.display = "block";

        try {
            const response = await fetch(`/api/tickets/${id}`);
            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Unable to load ticket.");
            }

            document.getElementById("ticketInfo").innerHTML = `
                <h2>${this.escapeHtml(data.ticket.subject)}</h2>
                <div class="ticket-meta" style="margin: 15px 0;">
                    <span class="status-badge status-${this.escapeHtml(data.ticket.status)}">${this.escapeHtml(data.ticket.status)}</span>
                    <span class="priority-badge priority-${this.escapeHtml(data.ticket.priority)}">${this.escapeHtml(data.ticket.priority)}</span>
                </div>
                <p style="background:#f8f9fa;padding:15px;border-radius:8px;">${this.escapeHtml(data.ticket.description)}</p>
            `;

            const repliesContainer = document.getElementById("ticketReplies");
            if (data.replies && data.replies.length) {
                repliesContainer.innerHTML = "<h3>Replies</h3>" + data.replies.map(reply => `
                    <article class="reply-card ${reply.is_agent ? "agent" : ""}">
                        <div class="reply-header">
                            <strong>${reply.is_agent ? "Support Agent" : "You"}</strong>
                            <span>${new Date(reply.created_at).toLocaleString()}</span>
                        </div>
                        <p>${this.escapeHtml(reply.message)}</p>
                    </article>
                `).join("");
            } else {
                repliesContainer.innerHTML = "<p>No replies yet.</p>";
            }
        } catch (error) {
            document.getElementById("ticketInfo").innerHTML = `<p>${this.escapeHtml(error.message)}</p>`;
        }
    },

    async addReply(event) {
        event.preventDefault();
        const message = document.getElementById("replyMessage").value;

        try {
            const response = await fetch(`/api/replies/${this.currentTicketId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });
            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Unable to add reply.");
            }

            document.getElementById("replyMessage").value = "";
            this.viewTicket(this.currentTicketId);
        } catch (error) {
            alert(error.message);
        }
    },

    startChat() {
        this.loadChatMessages();
        if (this.chatInterval) clearInterval(this.chatInterval);
        this.chatInterval = setInterval(() => this.loadChatMessages(), 3000);
    },

    async loadChatMessages() {
        const container = document.getElementById("chatMessages");
        if (!container) return;

        try {
            const response = await fetch("/api/chats");
            const data = await response.json();

            if (data.success && data.messages) {
                container.innerHTML = data.messages.map(msg => `
                    <div class="chat-message ${msg.is_agent ? "agent" : "user"}">
                        <div class="message-bubble">${this.escapeHtml(msg.message)}</div>
                        <div class="message-time">${new Date(msg.created_at).toLocaleTimeString()}</div>
                    </div>
                `).join("");
                container.scrollTop = container.scrollHeight;
            }
        } catch (error) {
            console.error("Error loading chat:", error);
        }
    },

    async sendMessage() {
        const input = document.getElementById("chatInput");
        const message = input.value.trim();
        if (!message) return;

        try {
            const response = await fetch("/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });
            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Unable to send message.");
            }

            input.value = "";
            this.loadChatMessages();
        } catch (error) {
            alert(error.message);
        }
    },

    escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char]));
    }
};

function handleLogin(event) { SupportSystem.handleLogin(event); }
function logout() { SupportSystem.logout(); }
function showTab(tab) { SupportSystem.showTab(tab); }
function loadTickets() { SupportSystem.loadTickets(); }
function createTicket(event) { SupportSystem.createTicket(event); }
function viewTicket(id) { SupportSystem.viewTicket(id); }
function addReply(event) { SupportSystem.addReply(event); }
function sendMessage() { SupportSystem.sendMessage(); }

document.addEventListener("DOMContentLoaded", () => SupportSystem.init());

// ============================================
// CMS SYSTEM
// Self-contained module
// ============================================

const CMS = {
    token: null,
    isAdmin: false,
    pageAliases: {
        about: 'about-us',
        privacy: 'privacy-policy',
        terms: 'terms'
    },
    pageFallbacks: {
        about: {
            title: 'About Klein Shoppers',
            meta_description: 'Learn about Klein Shoppers, an online shopping destination for customers in Uganda.',
            content: `
                <h2>Shopping made simple for Uganda</h2>
                <p>Klein Shoppers brings everyday essentials, electronics, fashion, beauty, home goods, and thoughtful gifts into one convenient online store.</p>
                <p>We focus on clear prices, helpful product information, responsive customer care, and reliable order handling from cart to delivery.</p>
                <h2>What we care about</h2>
                <ul>
                    <li>Products customers can compare and choose with confidence.</li>
                    <li>Checkout and support flows that are direct and easy to use.</li>
                    <li>Local service that respects customers' time, money, and trust.</li>
                </ul>
                <p>Whether you are replacing a daily-use item or sending a gift card to someone special, Klein Shoppers is built to make the process feel steady and familiar.</p>
            `
        },
        privacy: {
            title: 'Privacy Policy',
            meta_description: 'How Klein Shoppers collects, uses, and protects customer information.',
            content: `
                <h2>Your privacy matters</h2>
                <p>We collect the information needed to create accounts, process orders, deliver purchases, provide support, prevent fraud, and improve the shopping experience.</p>
                <h2>Information we may use</h2>
                <ul>
                    <li>Account details such as name, email address, and phone number.</li>
                    <li>Delivery details used to fulfill orders.</li>
                    <li>Order, payment status, support, and communication records.</li>
                    <li>Basic device and usage information that helps us secure and improve the site.</li>
                </ul>
                <h2>How we protect it</h2>
                <p>We limit access to customer information to authorized use, keep operational records for legitimate business needs, and avoid selling personal information.</p>
                <p>Customers can contact Klein Shoppers support for account, order, or privacy-related questions.</p>
            `
        },
        terms: {
            title: 'Terms & Conditions',
            meta_description: 'Terms for shopping with Klein Shoppers.',
            content: `
                <h2>Using Klein Shoppers</h2>
                <p>By using this website, you agree to provide accurate account, delivery, and payment information and to use the store only for lawful purchases.</p>
                <h2>Orders and availability</h2>
                <p>Prices, stock, promotions, and delivery timelines may change. If an item becomes unavailable after checkout, our team may contact you about replacement, delay, or refund options.</p>
                <h2>Returns and support</h2>
                <p>Return and refund requests are reviewed according to the product condition, order record, and applicable store policy. Keep order details and receipts for faster support.</p>
                <p>Klein Shoppers may update these terms as the store grows. Continued use of the site means you accept the latest version shown here.</p>
            `
        }
    },
    faqFallbacks: [
        { question: 'How do I place an order?', answer: 'Browse products, add items to your cart, then continue to checkout and provide your delivery and payment details.' },
        { question: 'Can I track my order?', answer: 'Yes. Sign in and open your orders page to review order status updates. You can also contact customer service with your order number.' },
        { question: 'What payment options are supported?', answer: 'Available payment options are shown during checkout. Some methods may depend on your location and order type.' },
        { question: 'How do gift cards work?', answer: 'Gift cards can be created for a chosen amount, checked for balance, and redeemed during eligible purchases.' },
        { question: 'How do I request help?', answer: 'Use the customer service page to create a support ticket or start a chat when support is available.' }
    ],
    blogFallbacks: [
        { title: 'How to choose the right electronics online', category: 'Shopping Guides', excerpt: 'Compare warranty, specifications, delivery timing, and real daily-use needs before choosing your next phone, laptop, or accessory.', published_at: new Date().toISOString() },
        { title: 'Smart ways to use gift cards', category: 'Gift Cards', excerpt: 'Gift cards are useful for birthdays, school shopping, office rewards, and letting someone choose exactly what they need.', published_at: new Date().toISOString() },
        { title: 'Preparing for a smoother delivery', category: 'Delivery', excerpt: 'Use a reachable phone number, clear address details, and order notes to help the delivery process move quickly.', published_at: new Date().toISOString() }
    ],

    init() {
        this.token = localStorage.getItem('support_token');
        const user = JSON.parse(localStorage.getItem('support_user') || 'null');
        this.isAdmin = user?.role === 'admin';

        if (window.location.pathname.includes('/admin/cms')) {
            this.initAdmin();
        } else {
            this.initPublic();
        }
    },

    // ========== PUBLIC VIEWS ==========
    initPublic() {
        const path = window.location.pathname;
        
        if (path.includes('/blog')) {
            this.loadBlogList();
        } else if (path.includes('/faq')) {
            this.loadFAQ();
        } else if (path.includes('/pages/') || ['/about', '/privacy', '/terms'].includes(path)) {
            this.loadPublicPage();
        }
    },

    async loadPublicPage() {
        const slug = window.location.pathname.split('/').pop().replace('.html', '');
        const apiSlug = this.pageAliases[slug] || slug;
        const fallback = this.pageFallbacks[slug];
        try {
            const response = await fetch(`/api/cms/page/${apiSlug}`);
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('pageTitle').textContent = data.page.title;
                document.getElementById('pageContent').innerHTML = data.page.content;
                if (data.page.meta_description) {
                    document.querySelector('meta[name="description"]').content = data.page.meta_description;
                }
            } else if (fallback) {
                this.renderFallbackPage(fallback);
            }
        } catch (error) {
            console.error('Error loading page:', error);
            if (fallback) this.renderFallbackPage(fallback);
        }
    },

    renderFallbackPage(page) {
        const pageTitle = document.getElementById('pageTitle');
        const pageContent = document.getElementById('pageContent');
        const meta = document.querySelector('meta[name="description"]');

        if (pageTitle) pageTitle.textContent = page.title;
        if (pageContent) pageContent.innerHTML = page.content;
        if (meta && page.meta_description) meta.content = page.meta_description;
    },

    async loadBlogList() {
        try {
            const response = await fetch('/api/cms/blog');
            const data = await response.json();
            
            if (data.success && data.posts.length) {
                this.renderBlogPosts(data.posts);
            } else {
                this.renderBlogPosts(this.blogFallbacks);
            }
        } catch (error) {
            console.error('Error loading blog:', error);
            this.renderBlogPosts(this.blogFallbacks);
        }
    },

    renderBlogPosts(posts) {
        const grid = document.getElementById('blogGrid');
        if (!grid) return;

        grid.innerHTML = posts.map(post => {
            const title = this.escapeHtml(post.title);
            const slug = post.slug || '#';
            const link = slug === '#' ? '#' : `/blog/${slug}`;
            const image = post.featured_image
                ? `<img src="${this.escapeAttribute(post.featured_image)}" class="blog-card-image" alt="${title}">`
                : '';

            return `
                <div class="blog-card">
                    ${image}
                    <div class="blog-card-content">
                        <span class="category">${this.escapeHtml(post.category || 'General')}</span>
                        <h3><a href="${link}">${title}</a></h3>
                        <p class="excerpt">${this.escapeHtml(post.excerpt || '')}</p>
                        <small>${new Date(post.published_at || Date.now()).toLocaleDateString()}</small>
                    </div>
                </div>
            `;
        }).join('');
    },

    async loadFAQ() {
        try {
            const response = await fetch('/api/cms/faq');
            const data = await response.json();
            
            if (data.success && data.faqs.length) {
                this.renderFAQs(data.faqs);
            } else {
                this.renderFAQs(this.faqFallbacks);
            }
        } catch (error) {
            console.error('Error loading FAQ:', error);
            this.renderFAQs(this.faqFallbacks);
        }
    },

    renderFAQs(faqs) {
        const container = document.getElementById('faqList');
        if (!container) return;

        container.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <button class="faq-question" type="button" onclick="this.closest('.faq-item').classList.toggle('active')">
                    <span>${this.escapeHtml(faq.question)}</span>
                    <span class="faq-toggle">+</span>
                </button>
                <div class="faq-answer">
                    <p>${this.escapeHtml(faq.answer)}</p>
                </div>
            </div>
        `).join('');
    },

    escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    },

    escapeAttribute(value) {
        return this.escapeHtml(value).replace(/`/g, '&#96;');
    },

    // ========== ADMIN PANEL ==========
    initAdmin() {
        if (!this.isAdmin) {
            window.location.href = '/support';
            return;
        }
        this.showSection('pages');
        this.loadPages();
    },

    showSection(section) {
        document.querySelectorAll('.cms-section').forEach(s => s.style.display = 'none');
        document.getElementById(`${section}Section`).style.display = 'block';

        document.querySelectorAll('.cms-nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === section) btn.classList.add('active');
        });

        if (section === 'pages') this.loadPages();
        if (section === 'blog') this.loadBlogPosts();
        if (section === 'faq') this.loadFAQs();
    },

    // Pages Management
    async loadPages() {
        try {
            const response = await fetch('/api/cms/admin/pages', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                const tbody = document.getElementById('pagesTableBody');
                tbody.innerHTML = data.pages.map(page => `
                    <tr>
                        <td>${page.title}</td>
                        <td>/${page.slug}</td>
                        <td><span class="status-badge status-${page.status}">${page.status}</span></td>
                        <td>${new Date(page.updated_at).toLocaleDateString()}</td>
                        <td class="action-group">
                            <button class="cms-btn cms-btn-primary cms-btn-sm" onclick="CMS.editPage(${page.id})">Edit</button>
                            <button class="cms-btn cms-btn-danger cms-btn-sm" onclick="CMS.deletePage(${page.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading pages:', error);
        }
    },

    async editPage(id) {
        try {
            const response = await fetch(`/api/cms/page/${id}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('pageId').value = data.page.id;
                document.getElementById('pageTitle').value = data.page.title;
                document.getElementById('pageSlug').value = data.page.slug;
                document.getElementById('pageContent').value = data.page.content;
                document.getElementById('pageStatus').value = data.page.status;
                this.showModal('pageModal');
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    },

    async savePage(event) {
        event.preventDefault();
        const id = document.getElementById('pageId').value;
        const formData = {
            title: document.getElementById('pageTitle').value,
            slug: document.getElementById('pageSlug').value,
            content: document.getElementById('pageContent').value,
            status: document.getElementById('pageStatus').value
        };

        const url = id ? `/api/cms/admin/page/${id}` : '/api/cms/admin/page';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                this.hideModal('pageModal');
                this.loadPages();
            }
        } catch (error) {
            console.error('Error saving page:', error);
        }
    },

    async deletePage(id) {
        if (!confirm('Are you sure you want to delete this page?')) return;
        
        try {
            await fetch(`/api/cms/admin/page/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            this.loadPages();
        } catch (error) {
            console.error('Error deleting page:', error);
        }
    },

    // Blog Management
    async loadBlogPosts() {
        try {
            const response = await fetch('/api/cms/admin/blog', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                const tbody = document.getElementById('blogTableBody');
                tbody.innerHTML = data.posts.map(post => `
                    <tr>
                        <td>${post.title}</td>
                        <td>${post.category || '-'}</td>
                        <td><span class="status-badge status-${post.status}">${post.status}</span></td>
                        <td>${post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}</td>
                        <td class="action-group">
                            <button class="cms-btn cms-btn-primary cms-btn-sm" onclick="CMS.editBlogPost(${post.id})">Edit</button>
                            <button class="cms-btn cms-btn-danger cms-btn-sm" onclick="CMS.deleteBlogPost(${post.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    },

    async saveBlogPost(event) {
        event.preventDefault();
        const id = document.getElementById('blogId').value;
        const formData = {
            title: document.getElementById('blogTitle').value,
            content: document.getElementById('blogContent').value,
            excerpt: document.getElementById('blogExcerpt').value,
            category: document.getElementById('blogCategory').value,
            status: document.getElementById('blogStatus').value
        };

        const url = id ? `/api/cms/admin/blog/${id}` : '/api/cms/admin/blog';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                this.hideModal('blogModal');
                this.loadBlogPosts();
            }
        } catch (error) {
            console.error('Error saving blog post:', error);
        }
    },

    // FAQ Management
    async loadFAQs() {
        try {
            const response = await fetch('/api/cms/admin/faq', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                const tbody = document.getElementById('faqTableBody');
                tbody.innerHTML = data.faqs.map(faq => `
                    <tr>
                        <td>${faq.question}</td>
                        <td>${faq.category || '-'}</td>
                        <td>${faq.sort_order}</td>
                        <td><span class="status-badge status-${faq.status}">${faq.status}</span></td>
                        <td class="action-group">
                            <button class="cms-btn cms-btn-primary cms-btn-sm" onclick="CMS.editFAQ(${faq.id})">Edit</button>
                            <button class="cms-btn cms-btn-danger cms-btn-sm" onclick="CMS.deleteFAQ(${faq.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading FAQs:', error);
        }
    },

    // Modal Management
    showModal(id) {
        document.getElementById(id).classList.add('active');
    },

    hideModal(id) {
        document.getElementById(id).classList.remove('active');
    },

    newPage() {
        document.getElementById('pageForm').reset();
        document.getElementById('pageId').value = '';
        this.showModal('pageModal');
    },

    newBlogPost() {
        document.getElementById('blogForm').reset();
        document.getElementById('blogId').value = '';
        this.showModal('blogModal');
    },

    newFAQ() {
        document.getElementById('faqForm').reset();
        document.getElementById('faqId').value = '';
        this.showModal('faqModal');
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => CMS.init());

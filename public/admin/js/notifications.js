class NotificationCenter {
    constructor() {
        this.notifications = [];
        this.currentFilter = 'all';
        this.page = 1;
        this.limit = 10;
        this.hasMore = true;
        this.isLoading = false;
        this.apiBase = '/api/notifications';

        this.init();
    }

    init() {
        this.cacheDom();
        this.bindEvents();
        this.loadNotifications();
        this.startAutoRefresh();
        this.updateBadge();
    }

    cacheDom() {
        this.notificationList = document.getElementById('notificationList');
        this.emptyState = document.getElementById('emptyState');
        this.totalCount = document.getElementById('totalCount');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.loadMoreContainer = document.getElementById('loadMoreContainer');
        this.markAllBtn = document.getElementById('markAllRead');
        this.refreshBtn = document.getElementById('refreshNotifications');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.modal = document.getElementById('notificationModal');
        this.modalClose = document.getElementById('modalClose');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalBody = document.getElementById('modalBody');
    }

    bindEvents() {
        // Filter tabs
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.page = 1;
                this.hasMore = true;
                this.notifications = [];
                this.loadNotifications();
            });
        });

        // Load more
        this.loadMoreBtn.addEventListener('click', () => {
            if (!this.isLoading && this.hasMore) {
                this.page++;
                this.loadNotifications(true);
            }
        });

        // Mark all as read
        this.markAllBtn.addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Refresh
        this.refreshBtn.addEventListener('click', () => {
            this.page = 1;
            this.hasMore = true;
            this.notifications = [];
            this.loadNotifications();
            this.animateRefresh();
        });

        // Modal
        this.modalClose.addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshBtn.click();
            }
        });
    }

    async loadNotifications(append = false) {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const queryParams = new URLSearchParams({
                filter: this.currentFilter,
                page: this.page,
                limit: this.limit
            });

            const response = await fetch(`${this.apiBase}?${queryParams}`);
            const result = await response.json();

            if (result.success) {
                const newNotifications = result.data;
                
                if (append) {
                    this.notifications = [...this.notifications, ...newNotifications];
                } else {
                    this.notifications = newNotifications;
                }

                this.hasMore = result.hasMore || false;
                this.renderNotifications();
                this.updateCount();
                
                if (!this.hasMore) {
                    this.loadMoreContainer.style.display = 'none';
                } else {
                    this.loadMoreContainer.style.display = 'block';
                }
            } else {
                this.showError(result.error || 'Failed to load notifications');
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showError('Failed to load notifications');
        } finally {
            this.isLoading = false;
        }
    }

    renderNotifications() {
        if (this.notifications.length === 0) {
            this.notificationList.innerHTML = '';
            this.emptyState.style.display = 'block';
            this.loadMoreContainer.style.display = 'none';
            return;
        }

        this.emptyState.style.display = 'none';
        
        const html = this.notifications.map(notification => {
            const iconClass = this.getIconClass(notification.type);
            const priorityClass = `priority-${notification.priority}`;
            const statusClass = notification.status === 'unread' ? 'unread' : 'read';
            const timeAgo = this.getTimeAgo(notification.time);

            return `
                <div class="notification-item ${statusClass} ${priorityClass}" 
                     data-id="${notification.id}"
                     onclick="notificationCenter.viewNotification('${notification.id}')">
                    <div class="notification-icon ${iconClass}">
                        <i class="${this.getIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">
                            <i class="fas fa-clock"></i> ${timeAgo}
                        </div>
                        <div class="notification-action">
                            <button class="btn-action" onclick="event.stopPropagation(); notificationCenter.handleAction('${notification.id}')">
                                ${notification.action?.label || 'View Details'}
                            </button>
                            ${notification.status === 'unread' ? 
                                `<button class="btn-action" onclick="event.stopPropagation(); notificationCenter.markAsRead('${notification.id}')">
                                    <i class="fas fa-check"></i> Mark as Read
                                </button>` : 
                                ''
                            }
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.notificationList.innerHTML = html;
    }

    async markAsRead(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}/read`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                const notification = this.notifications.find(n => n.id == id);
                if (notification) {
                    notification.status = 'read';
                    this.renderNotifications();
                    this.updateCount();
                    this.updateBadge();
                }
            } else {
                this.showError(result.error || 'Failed to mark as read');
            }
        } catch (error) {
            console.error('Error marking as read:', error);
            this.showError('Failed to mark as read');
        }
    }

    async markAllAsRead() {
        try {
            const response = await fetch(`${this.apiBase}/read-all`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.notifications.forEach(n => n.status = 'read');
                this.renderNotifications();
                this.updateCount();
                this.updateBadge();
                this.showToast(`Marked ${result.count || 0} notifications as read`, 'success');
            } else {
                this.showError(result.error || 'Failed to mark all as read');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            this.showError('Failed to mark all as read');
        }
    }

    async viewNotification(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`);
            const result = await response.json();
            
            if (!result.success) {
                this.showError(result.error || 'Failed to load notification');
                return;
            }

            const notification = result.data;
            
            // Mark as read when viewed
            if (notification.status === 'unread') {
                this.markAsRead(id);
            }

            this.modalTitle.textContent = notification.title;
            this.modalBody.innerHTML = `
                <div class="detail-item">
                    <span class="detail-label">Type:</span> 
                    <span>${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Priority:</span> 
                    <span class="priority-${notification.priority}">${notification.priority.toUpperCase()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Message:</span> 
                    <p style="margin-top: 5px;">${notification.message}</p>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Time:</span> 
                    <span>${new Date(notification.time).toLocaleString()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span> 
                    <span>${notification.status}</span>
                </div>
                ${notification.metadata ? `
                    <div class="detail-item">
                        <span class="detail-label">Additional Info:</span>
                        <div style="margin-top: 5px; background: #f8f9fa; padding: 10px; border-radius: 6px; font-size: 13px;">
                            ${Object.entries(notification.metadata).map(([key, value]) => 
                                `<div><strong>${key}:</strong> ${value}</div>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button class="btn-action" onclick="notificationCenter.handleAction('${notification.id}')">
                        ${notification.action?.label || 'View Details'}
                    </button>
                    <button class="btn-action danger" onclick="notificationCenter.deleteNotification('${notification.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;

            this.modal.style.display = 'block';
        } catch (error) {
            console.error('Error viewing notification:', error);
            this.showError('Failed to load notification details');
        }
    }

    async deleteNotification(id) {
        if (!confirm('Are you sure you want to delete this notification?')) return;
        
        try {
            const response = await fetch(`${this.apiBase}/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.notifications = this.notifications.filter(n => n.id != id);
                this.renderNotifications();
                this.updateCount();
                this.updateBadge();
                this.closeModal();
                this.showToast('Notification deleted successfully', 'success');
            } else {
                this.showError(result.error || 'Failed to delete notification');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            this.showError('Failed to delete notification');
        }
    }

    async handleAction(id) {
        const notification = this.notifications.find(n => n.id == id);
        if (notification && notification.action?.url) {
            window.location.href = notification.action.url;
        } else {
            this.showToast('Opening notification details...', 'info');
        }
    }

    async updateBadge() {
        try {
            const response = await fetch(`${this.apiBase}/unread-count`);
            const result = await response.json();
            
            if (result.success) {
                const badge = document.getElementById('notificationBadge');
                if (badge) {
                    const count = result.count || 0;
                    badge.textContent = count;
                    badge.style.display = count > 0 ? 'inline-block' : 'none';
                }
            }
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    // Utility methods (getIcon, getIconClass, getTimeAgo, updateCount, etc.)
    getIcon(type) {
        const icons = {
            orders: 'fa-shopping-cart',
            stock: 'fa-boxes',
            customers: 'fa-users',
            reviews: 'fa-star',
            delivery: 'fa-truck'
        };
        return icons[type] || 'fa-bell';
    }

    getIconClass(type) {
        const classes = {
            orders: 'icon-orders',
            stock: 'icon-stock',
            customers: 'icon-customers',
            reviews: 'icon-reviews',
            delivery: 'icon-delivery'
        };
        return classes[type] || 'icon-orders';
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    updateCount() {
        const unreadCount = this.notifications.filter(n => n.status === 'unread').length;
        this.totalCount.textContent = unreadCount;
        this.totalCount.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        
        document.title = unreadCount > 0 ? `(${unreadCount}) Notification Center` : 'Notification Center';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 2000;
            animation: slideDown 0.3s ease;
            max-width: 400px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    animateRefresh() {
        this.refreshBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.refreshBtn.style.transform = 'rotate(0deg)';
        }, 500);
    }

    startAutoRefresh() {
        setInterval(() => {
            this.refreshBtn.click();
        }, 60000);
    }
}

// Initialize
const notificationCenter = new NotificationCenter();

// Make available globally
window.notificationCenter = notificationCenter;
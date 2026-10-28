class ReturnManager {
    constructor() {
        this.returns = [];
        this.currentPage = 1;
        this.limit = 10;
        this.total = 0;
        this.filters = {
            status: 'all',
            dateFrom: '',
            dateTo: '',
            search: ''
        };
        this.isLoading = false;
        this.apiBase = '/api/returns';

        this.init();
    }

    init() {
        this.cacheDom();
        this.bindEvents();
        this.loadReturns();
        this.loadStatistics();
        this.startAutoRefresh();
    }

    cacheDom() {
        this.returnsList = document.getElementById('returnsList');
        this.emptyState = document.getElementById('emptyState');
        this.totalCount = document.getElementById('totalCount');
        this.paginationContainer = document.getElementById('paginationContainer');
        this.paginationInfo = document.getElementById('paginationInfo');
        this.paginationButtons = document.getElementById('paginationButtons');

        // Stats
        this.pendingReturns = document.getElementById('pendingReturns');
        this.approvedReturns = document.getElementById('approvedReturns');
        this.rejectedReturns = document.getElementById('rejectedReturns');
        this.totalRefunded = document.getElementById('totalRefunded');

        // Filters
        this.statusFilter = document.getElementById('statusFilter');
        this.dateFrom = document.getElementById('dateFrom');
        this.dateTo = document.getElementById('dateTo');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');

        // Modals
        this.returnModal = document.getElementById('returnModal');
        this.modalClose = document.getElementById('modalClose');
        this.returnDetails = document.getElementById('returnDetails');

        this.statusModal = document.getElementById('statusModal');
        this.statusModalClose = document.getElementById('statusModalClose');
        this.statusForm = document.getElementById('statusForm');
        this.statusReturnId = document.getElementById('statusReturnId');
        this.updateStatus = document.getElementById('updateStatus');
        this.statusNote = document.getElementById('statusNote');

        // Buttons
        this.refreshBtn = document.getElementById('refreshBtn');
    }

    bindEvents() {
        // Refresh
        this.refreshBtn.addEventListener('click', () => {
            this.loadReturns();
            this.loadStatistics();
            this.animateRefresh();
        });

        // Modal close
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.statusModalClose.addEventListener('click', () => this.closeStatusModal());

        window.addEventListener('click', (e) => {
            if (e.target === this.returnModal) this.closeModal();
            if (e.target === this.statusModal) this.closeStatusModal();
        });

        // Filters
        this.statusFilter.addEventListener('change', () => {
            this.filters.status = this.statusFilter.value;
            this.currentPage = 1;
            this.loadReturns();
        });

        this.dateFrom.addEventListener('change', () => {
            this.filters.dateFrom = this.dateFrom.value;
            this.currentPage = 1;
            this.loadReturns();
        });

        this.dateTo.addEventListener('change', () => {
            this.filters.dateTo = this.dateTo.value;
            this.currentPage = 1;
            this.loadReturns();
        });

        this.searchBtn.addEventListener('click', () => {
            this.filters.search = this.searchInput.value.trim();
            this.currentPage = 1;
            this.loadReturns();
        });

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchBtn.click();
            }
        });

        // Status form
        this.statusForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateReturnStatus();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeStatusModal();
            }
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshBtn.click();
            }
        });
    }

    async loadReturns() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                limit: this.limit,
                ...this.filters
            });

            const response = await fetch(`${this.apiBase}?${queryParams}`);
            const result = await response.json();

            if (result.success) {
                this.returns = result.data;
                this.total = result.pagination.total;
                this.renderReturns();
                this.renderPagination();
                this.updateCount();
            } else {
                this.showError(result.error || 'Failed to load returns');
            }
        } catch (error) {
            console.error('Error loading returns:', error);
            this.showError('Failed to load returns');
        } finally {
            this.isLoading = false;
        }
    }

    async loadStatistics() {
        try {
            const response = await fetch(`${this.apiBase}/statistics`);
            const result = await response.json();

            if (result.success) {
                const stats = result.data.returns;
                this.pendingReturns.textContent = stats.pending || 0;
                this.approvedReturns.textContent = stats.approved || 0;
                this.rejectedReturns.textContent = stats.rejected || 0;
                this.totalRefunded.textContent = `$${(stats.total_refund_amount || 0).toFixed(2)}`;
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    renderReturns() {
        if (this.returns.length === 0) {
            this.returnsList.innerHTML = '';
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';

        const html = this.returns.map(returnData => {
            const statusClass = `status-${returnData.status}`;
            const reasonLabel = this.getReasonLabel(returnData.return_reason);
            const statusLabel = returnData.status.toUpperCase();

            return `
                <div class="return-card ${statusClass}" data-id="${returnData.id}">
                    <div class="card-top">
                        <div>
                            <div class="return-number">
                                <i class="fas fa-hashtag"></i> ${returnData.return_number}
                            </div>
                            <div style="font-size:13px;color:#7f8c8d;margin-top:3px;">
                                Order #${returnData.order_id} • ${returnData.customer_name}
                            </div>
                        </div>
                        <span class="return-status-badge ${statusClass}">${statusLabel}</span>
                    </div>

                    <div class="return-details">
                        <div class="detail-item">
                            <i class="fas fa-box"></i> <strong>Product:</strong> ${returnData.product_name}
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-hashtag"></i> <strong>Qty:</strong> ${returnData.quantity}
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-tag"></i> <strong>Reason:</strong> ${reasonLabel}
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-dollar-sign"></i> <strong>Refund:</strong> 
                            <span class="refund-amount">$${parseFloat(returnData.refund_amount).toFixed(2)}</span>
                        </div>
                    </div>

                    ${returnData.return_reason_detail ? `
                        <div class="return-reason">
                            <i class="fas fa-comment"></i> ${returnData.return_reason_detail}
                        </div>
                    ` : ''}

                    <div style="font-size:12px;color:#95a5a6;margin-top:5px;">
                        <i class="fas fa-clock"></i> ${new Date(returnData.created_at).toLocaleString()}
                    </div>

                    <div class="card-actions">
                        <button class="btn-view" onclick="returnManager.viewReturn(${returnData.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-status" onclick="returnManager.showStatusModal(${returnData.id})">
                            <i class="fas fa-exchange-alt"></i> Status
                        </button>
                        ${returnData.status === 'approved' ? `
                            <button class="btn-refund" onclick="returnManager.processRefund(${returnData.id})">
                                <i class="fas fa-dollar-sign"></i> Process Refund
                            </button>
                        ` : ''}
                        <button class="btn-print" onclick="returnManager.printReturn(${returnData.id})">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.returnsList.innerHTML = html;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.total / this.limit);
        
        if (totalPages <= 1) {
            this.paginationContainer.style.display = 'none';
            return;
        }

        this.paginationContainer.style.display = 'flex';
        
        const start = (this.currentPage - 1) * this.limit + 1;
        const end = Math.min(this.currentPage * this.limit, this.total);
        this.paginationInfo.textContent = `Showing ${start}-${end} of ${this.total}`;

        let buttonsHtml = '';
        
        // Previous
        buttonsHtml += `
            <button onclick="returnManager.goToPage(${this.currentPage - 1})" 
                    class="${this.currentPage === 1 ? 'disabled' : ''}">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            buttonsHtml += `<button onclick="returnManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                buttonsHtml += `<button disabled>...</button>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            buttonsHtml += `
                <button onclick="returnManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttonsHtml += `<button disabled>...</button>`;
            }
            buttonsHtml += `<button onclick="returnManager.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // Next
        buttonsHtml += `
            <button onclick="returnManager.goToPage(${this.currentPage + 1})" 
                    class="${this.currentPage === totalPages ? 'disabled' : ''}">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        this.paginationButtons.innerHTML = buttonsHtml;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.total / this.limit);
        if (page < 1 || page > totalPages || page === this.currentPage) return;
        
        this.currentPage = page;
        this.loadReturns();
    }

    getReasonLabel(reason) {
        const labels = {
            'defective': 'Defective Product',
            'wrong_item': 'Wrong Item Received',
            'size_issue': 'Size Issue',
            'damaged': 'Damaged in Transit',
            'not_as_described': 'Not as Described',
            'changed_mind': 'Changed Mind',
            'other': 'Other'
        };
        return labels[reason] || reason;
    }

    updateCount() {
        this.totalCount.textContent = this.total;
    }

    async viewReturn(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`);
            const result = await response.json();

            if (result.success) {
                const data = result.data;
                this.renderReturnDetails(data);
                this.returnModal.style.display = 'block';
            } else {
                this.showError(result.error || 'Failed to load return details');
            }
        } catch (error) {
            console.error('Error viewing return:', error);
            this.showError('Failed to load return details');
        }
    }

    renderReturnDetails(data) {
        const statusClass = `status-${data.status}`;
        const reasonLabel = this.getReasonLabel(data.return_reason);
        const timelineHtml = data.timeline.map(item => `
            <div class="timeline-item">
                <div class="time">${new Date(item.created_at).toLocaleString()}</div>
                <div>
                    <div class="status-label">${item.status.toUpperCase()}</div>
                    ${item.note ? `<div class="note">${item.note}</div>` : ''}
                </div>
            </div>
        `).join('');

        const html = `
            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> Return Information</h3>
                <div class="detail-row">
                    <div><span class="detail-label">Return Number:</span> <span class="detail-value">${data.return_number}</span></div>
                    <div><span class="detail-label">Status:</span> <span class="return-status-badge ${statusClass}">${data.status.toUpperCase()}</span></div>
                    <div><span class="detail-label">Order ID:</span> <span class="detail-value">#${data.order_id}</span></div>
                    <div><span class="detail-label">Date:</span> <span class="detail-value">${new Date(data.created_at).toLocaleString()}</span></div>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-user"></i> Customer Information</h3>
                <div class="detail-row">
                    <div><span class="detail-label">Name:</span> <span class="detail-value">${data.customer_name}</span></div>
                    <div><span class="detail-label">Email:</span> <span class="detail-value">${data.customer_email || 'N/A'}</span></div>
                    <div><span class="detail-label">Phone:</span> <span class="detail-value">${data.customer_phone || 'N/A'}</span></div>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-box"></i> Product Details</h3>
                <div class="detail-row">
                    <div><span class="detail-label">Product:</span> <span class="detail-value">${data.product_name}</span></div>
                    <div><span class="detail-label">SKU:</span> <span class="detail-value">${data.product_sku || 'N/A'}</span></div>
                    <div><span class="detail-label">Quantity:</span> <span class="detail-value">${data.quantity}</span></div>
                    <div><span class="detail-label">Reason:</span> <span class="detail-value">${reasonLabel}</span></div>
                </div>
                ${data.return_reason_detail ? `
                    <div style="margin-top:10px;padding:10px;background:#f8f9fa;border-radius:6px;">
                        <span class="detail-label">Details:</span> ${data.return_reason_detail}
                    </div>
                ` : ''}
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-dollar-sign"></i> Refund Information</h3>
                <div class="detail-row">
                    <div><span class="detail-label">Refund Amount:</span> <span class="refund-amount">$${parseFloat(data.refund_amount).toFixed(2)}</span></div>
                    <div><span class="detail-label">Refund Method:</span> <span class="detail-value">${data.refund_method || 'Original Payment'}</span></div>
                    ${data.refund_transaction_id ? `
                        <div><span class="detail-label">Transaction ID:</span> <span class="detail-value">${data.refund_transaction_id}</span></div>
                    ` : ''}
                    ${data.refund_processed_at ? `
                        <div><span class="detail-label">Refund Date:</span> <span class="detail-value">${new Date(data.refund_processed_at).toLocaleString()}</span></div>
                    ` : ''}
                </div>
            </div>

            ${data.timeline && data.timeline.length > 0 ? `
                <div class="detail-section">
                    <h3><i class="fas fa-history"></i> Timeline</h3>
                    ${timelineHtml}
                </div>
            ` : ''}

            ${data.notes ? `
                <div class="detail-section">
                    <h3><i class="fas fa-comment"></i> Notes</h3>
                    <p style="color:#7f8c8d;">${data.notes}</p>
                </div>
            ` : ''}

            <div style="display:flex;gap:10px;margin-top:20px;padding-top:20px;border-top:1px solid #ecf0f1;">
                <button class="btn-status" onclick="returnManager.showStatusModal(${data.id})">
                    <i class="fas fa-exchange-alt"></i> Update Status
                </button>
                ${data.status === 'approved' ? `
                    <button class="btn-refund" onclick="returnManager.processRefund(${data.id})">
                        <i class="fas fa-dollar-sign"></i> Process Refund
                    </button>
                ` : ''}
                <button class="btn-print" onclick="returnManager.printReturn(${data.id})">
                    <i class="fas fa-print"></i> Print
                </button>
                <button class="btn-cancel" onclick="returnManager.closeModal()">Close</button>
            </div>
        `;

        this.returnDetails.innerHTML = html;
    }

    showStatusModal(id) {
        this.statusReturnId.value = id;
        this.updateStatus.value = 'pending';
        this.statusNote.value = '';
        this.statusModal.style.display = 'block';
    }

    async updateReturnStatus() {
        const id = this.statusReturnId.value;
        const status = this.updateStatus.value;
        const note = this.statusNote.value;

        try {
            const response = await fetch(`${this.apiBase}/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, note })
            });

            const result = await response.json();

            if (result.success) {
                this.showToast(result.message, 'success');
                this.closeStatusModal();
                this.loadReturns();
                this.loadStatistics();
            } else {
                this.showError(result.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            this.showError('Failed to update status');
        }
    }

    async processRefund(id) {
        if (!confirm('Process refund for this return?')) return;

        try {
            const response = await fetch(`${this.apiBase}/refund/${id}/process`, {
                method: 'POST'
            });

            const result = await response.json();

            if (result.success) {
                this.showToast(result.message, 'success');
                this.loadReturns();
                this.loadStatistics();
                this.closeModal();
            } else {
                this.showError(result.error || 'Failed to process refund');
            }
        } catch (error) {
            console.error('Error processing refund:', error);
            this.showError('Failed to process refund');
        }
    }

    printReturn(id) {
        const returnData = this.returns.find(r => r.id === id);
        if (!returnData) {
            this.showError('Return not found');
            return;
        }

        // Create print window
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Return #${returnData.return_number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #e67e22; }
                        .details { margin-bottom: 20px; }
                        .row { display: flex; margin: 5px 0; }
                        .label { font-weight: bold; width: 150px; }
                        .status { padding: 3px 10px; border-radius: 4px; background: #f39c12; color: white; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Return Request</h1>
                        <p>${returnData.return_number}</p>
                        <p>Date: ${new Date(returnData.created_at).toLocaleString()}</p>
                    </div>
                    <div class="details">
                        <div class="row"><span class="label">Status:</span> <span class="status">${returnData.status.toUpperCase()}</span></div>
                        <div class="row"><span class="label">Customer:</span> ${returnData.customer_name}</div>
                        <div class="row"><span class="label">Email:</span> ${returnData.customer_email || 'N/A'}</div>
                        <div class="row"><span class="label">Product:</span> ${returnData.product_name}</div>
                        <div class="row"><span class="label">Quantity:</span> ${returnData.quantity}</div>
                        <div class="row"><span class="label">Reason:</span> ${this.getReasonLabel(returnData.return_reason)}</div>
                        <div class="row"><span class="label">Refund Amount:</span> $${parseFloat(returnData.refund_amount).toFixed(2)}</div>
                    </div>
                    ${returnData.return_reason_detail ? `
                        <div style="margin-top:20px;padding:15px;background:#f8f9fa;border-radius:5px;">
                            <strong>Details:</strong> ${returnData.return_reason_detail}
                        </div>
                    ` : ''}
                    <div style="margin-top:40px;text-align:center;color:#95a5a6;font-size:12px;">
                        Generated on ${new Date().toLocaleString()}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    closeModal() {
        this.returnModal.style.display = 'none';
    }

    closeStatusModal() {
        this.statusModal.style.display = 'none';
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
const returnManager = new ReturnManager();

// Make available globally
window.returnManager = returnManager;
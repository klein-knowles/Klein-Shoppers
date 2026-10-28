class CourierManager {
    constructor() {
        this.couriers = [];
        this.currentPage = 1;
        this.limit = 10;
        this.total = 0;
        this.filters = {
            type: 'all',
            status: 'all',
            search: ''
        };
        this.isLoading = false;
        this.apiBase = '/api/couriers';

        this.init();
    }

    init() {
        this.cacheDom();
        this.bindEvents();
        this.loadCouriers();
        this.loadStatistics();
    }

    cacheDom() {
        this.courierList = document.getElementById('courierList');
        this.emptyState = document.getElementById('emptyState');
        this.totalCount = document.getElementById('totalCount');
        this.paginationContainer = document.getElementById('paginationContainer');
        this.paginationInfo = document.getElementById('paginationInfo');
        this.paginationButtons = document.getElementById('paginationButtons');

        // Stats
        this.totalCouriers = document.getElementById('totalCouriers');
        this.activeCouriers = document.getElementById('activeCouriers');
        this.avgRating = document.getElementById('avgRating');
        this.totalDeliveries = document.getElementById('totalDeliveries');

        // Filters
        this.typeFilter = document.getElementById('typeFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');

        // Modal
        this.modal = document.getElementById('courierModal');
        this.modalClose = document.getElementById('modalClose');
        this.modalTitle = document.getElementById('modalTitle');
        this.courierForm = document.getElementById('courierForm');
        this.submitBtn = document.getElementById('submitBtn');

        // Form fields
        this.courierId = document.getElementById('courierId');
        this.courierName = document.getElementById('courierName');
        this.courierType = document.getElementById('courierType');
        this.courierEmail = document.getElementById('courierEmail');
        this.courierPhone = document.getElementById('courierPhone');
        this.baseCharge = document.getElementById('baseCharge');
        this.perKmCharge = document.getElementById('perKmCharge');
        this.deliveryTime = document.getElementById('deliveryTime');
        this.serviceArea = document.getElementById('serviceArea');
        this.courierAddress = document.getElementById('courierAddress');
        this.contactPerson = document.getElementById('contactPerson');
        this.courierStatus = document.getElementById('courierStatus');

        // Tracking modal
        this.trackingModal = document.getElementById('trackingModal');
        this.trackingModalClose = document.getElementById('trackingModalClose');
        this.trackingBody = document.getElementById('trackingBody');

        // Buttons
        this.addBtn = document.getElementById('addCourierBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
    }

    bindEvents() {
        // Add courier
        this.addBtn.addEventListener('click', () => this.showAddModal());

        // Refresh
        this.refreshBtn.addEventListener('click', () => {
            this.loadCouriers();
            this.loadStatistics();
            this.animateRefresh();
        });

        // Modal close
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.trackingModalClose.addEventListener('click', () => this.closeTrackingModal());

        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
            if (e.target === this.trackingModal) this.closeTrackingModal();
        });

        // Form submit
        this.courierForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCourier();
        });

        // Filters
        this.typeFilter.addEventListener('change', () => {
            this.filters.type = this.typeFilter.value;
            this.currentPage = 1;
            this.loadCouriers();
        });

        this.statusFilter.addEventListener('change', () => {
            this.filters.status = this.statusFilter.value;
            this.currentPage = 1;
            this.loadCouriers();
        });

        this.searchBtn.addEventListener('click', () => {
            this.filters.search = this.searchInput.value.trim();
            this.currentPage = 1;
            this.loadCouriers();
        });

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchBtn.click();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeTrackingModal();
            }
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshBtn.click();
            }
        });
    }

    async loadCouriers() {
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
                this.couriers = result.data;
                this.total = result.pagination.total;
                this.renderCouriers();
                this.renderPagination();
                this.updateCount();
            } else {
                this.showError(result.error || 'Failed to load couriers');
            }
        } catch (error) {
            console.error('Error loading couriers:', error);
            this.showError('Failed to load couriers');
        } finally {
            this.isLoading = false;
        }
    }

    async loadStatistics() {
        try {
            const response = await fetch(`${this.apiBase}/statistics`);
            const result = await response.json();

            if (result.success) {
                const stats = result.data;
                this.totalCouriers.textContent = stats.couriers.total || 0;
                this.activeCouriers.textContent = stats.couriers.active || 0;
                this.avgRating.textContent = (stats.couriers.avg_rating || 0).toFixed(1);
                this.totalDeliveries.textContent = stats.couriers.total_deliveries || 0;
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    renderCouriers() {
        if (this.couriers.length === 0) {
            this.courierList.innerHTML = '';
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';

        const html = this.couriers.map(courier => {
            const statusClass = `status-${courier.status}`;
            const typeBadgeClass = `badge-${courier.type}`;
            const typeLabel = this.getTypeLabel(courier.type);
            const stars = this.getStars(courier.rating);

            return `
                <div class="courier-card ${statusClass}" data-id="${courier.id}">
                    <div class="card-header">
                        <div>
                            <div class="courier-name">${courier.name}</div>
                            <span class="courier-type-badge ${typeBadgeClass}">${typeLabel}</span>
                            <span style="font-size:12px;color:#95a5a6;margin-left:8px;">${courier.code}</span>
                        </div>
                        <span class="courier-status-badge status-${courier.status}">${courier.status}</span>
                    </div>

                    <div class="courier-details">
                        <div class="detail-item">
                            <i class="fas fa-phone"></i> ${courier.phone}
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-envelope"></i> ${courier.email || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-dollar-sign"></i> $${courier.base_charge} base
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-road"></i> $${courier.per_km_charge}/km
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i> ${courier.delivery_time_estimate || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i> ${courier.service_area || 'N/A'}
                        </div>
                    </div>

                    <div class="courier-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-value">${courier.rating.toFixed(1)}</span>
                        <span style="margin-left:auto;font-size:12px;color:#95a5a6;">
                            Deliveries: ${courier.total_deliveries || 0}
                        </span>
                    </div>

                    <div class="card-actions">
                        <button class="btn-view" onclick="courierManager.viewCourier(${courier.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-track" onclick="courierManager.viewTracking(${courier.id})">
                            <i class="fas fa-map-marked-alt"></i> Track
                        </button>
                        <button class="btn-edit" onclick="courierManager.editCourier(${courier.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="courierManager.deleteCourier(${courier.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.courierList.innerHTML = html;
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
            <button onclick="courierManager.goToPage(${this.currentPage - 1})" 
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
            buttonsHtml += `<button onclick="courierManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                buttonsHtml += `<button disabled>...</button>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            buttonsHtml += `
                <button onclick="courierManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttonsHtml += `<button disabled>...</button>`;
            }
            buttonsHtml += `<button onclick="courierManager.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // Next
        buttonsHtml += `
            <button onclick="courierManager.goToPage(${this.currentPage + 1})" 
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
        this.loadCouriers();
    }

    getTypeLabel(type) {
        const labels = {
            'MTN_UGANDA': 'MTN Uganda',
            'dhl': 'DHL',
            'fedex': 'FedEx',
            'ups': 'UPS',
            'rider': 'Rider',
            'company_driver': 'Company Driver'
        };
        return labels[type] || type;
    }

    getStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    updateCount() {
        this.totalCount.textContent = this.total;
    }

    showAddModal() {
        this.modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Courier';
        this.submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Courier';
        this.courierForm.reset();
        this.courierId.value = '';
        this.modal.style.display = 'block';
    }

    async editCourier(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`);
            const result = await response.json();

            if (result.success) {
                const courier = result.data;
                this.modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Courier';
                this.submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Courier';
                
                this.courierId.value = courier.id;
                this.courierName.value = courier.name;
                this.courierType.value = courier.type;
                this.courierEmail.value = courier.email || '';
                this.courierPhone.value = courier.phone;
                this.baseCharge.value = courier.base_charge;
                this.perKmCharge.value = courier.per_km_charge;
                this.deliveryTime.value = courier.delivery_time_estimate || '';
                this.serviceArea.value = courier.service_area || '';
                this.courierAddress.value = courier.address || '';
                this.contactPerson.value = courier.contact_person || '';
                this.courierStatus.value = courier.status;
                
                this.modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading courier for edit:', error);
            this.showError('Failed to load courier details');
        }
    }

    async viewCourier(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`);
            const result = await response.json();

            if (result.success) {
                const courier = result.data;
                this.modalTitle.innerHTML = '<i class="fas fa-eye"></i> Courier Details';
                this.submitBtn.innerHTML = '<i class="fas fa-check"></i> Close';
                this.submitBtn.onclick = () => this.closeModal();
                
                this.courierId.value = courier.id;
                this.courierName.value = courier.name;
                this.courierType.value = courier.type;
                this.courierEmail.value = courier.email || '';
                this.courierPhone.value = courier.phone;
                this.baseCharge.value = courier.base_charge;
                this.perKmCharge.value = courier.per_km_charge;
                this.deliveryTime.value = courier.delivery_time_estimate || '';
                this.serviceArea.value = courier.service_area || '';
                this.courierAddress.value = courier.address || '';
                this.contactPerson.value = courier.contact_person || '';
                this.courierStatus.value = courier.status;
                
                // Disable form fields
                this.courierForm.querySelectorAll('input, select, textarea').forEach(el => {
                    el.disabled = true;
                });
                
                this.modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error viewing courier:', error);
            this.showError('Failed to load courier details');
        }
    }

    async saveCourier() {
        const id = this.courierId.value;
        const data = {
            name: this.courierName.value,
            type: this.courierType.value,
            email: this.courierEmail.value,
            phone: this.courierPhone.value,
            base_charge: parseFloat(this.baseCharge.value) || 0,
            per_km_charge: parseFloat(this.perKmCharge.value) || 0,
            delivery_time_estimate: this.deliveryTime.value,
            service_area: this.serviceArea.value,
            address: this.courierAddress.value,
            contact_person: this.contactPerson.value,
            status: this.courierStatus.value
        };

        try {
            const url = id ? `${this.apiBase}/${id}` : this.apiBase;
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showToast(result.message, 'success');
                this.closeModal();
                this.loadCouriers();
                this.loadStatistics();
            } else {
                this.showError(result.error || 'Failed to save courier');
            }
        } catch (error) {
            console.error('Error saving courier:', error);
            this.showError('Failed to save courier');
        }
    }

    async deleteCourier(id) {
        if (!confirm('Are you sure you want to delete this courier?')) return;

        try {
            const response = await fetch(`${this.apiBase}/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showToast(result.message, 'success');
                this.loadCouriers();
                this.loadStatistics();
            } else {
                this.showError(result.error || 'Failed to delete courier');
            }
        } catch (error) {
            console.error('Error deleting courier:', error);
            this.showError('Failed to delete courier');
        }
    }

    async viewTracking(courierId) {
        try {
            const response = await fetch(`${this.apiBase}/${courierId}`);
            const result = await response.json();

            if (result.success) {
                const courier = result.data;
                const tracking = courier.tracking_history || [];

                let html = `
                    <div class="tracking-summary">
                        <h3>${courier.name}</h3>
                        <p><strong>Code:</strong> ${courier.code}</p>
                        <p><strong>Type:</strong> ${this.getTypeLabel(courier.type)}</p>
                        <p><strong>Total Deliveries:</strong> ${courier.total_deliveries || 0}</p>
                        <p><strong>Success Rate:</strong> ${courier.total_deliveries > 0 ? 
                            Math.round((courier.successful_deliveries / courier.total_deliveries) * 100) : 0}%</p>
                    </div>
                    <hr style="margin: 20px 0;">
                    <h4>Recent Tracking History</h4>
                    <div class="tracking-timeline">
                `;

                if (tracking.length === 0) {
                    html += `<p>No tracking history available.</p>`;
                } else {
                    tracking.slice(0, 10).forEach(t => {
                        const statusClass = t.status === 'delivered' ? 'completed' : 
                                           t.status === 'failed' ? 'failed' : '';
                        html += `
                            <div class="tracking-event ${statusClass}">
                                <div class="event-title">${t.status.replace('_', ' ').toUpperCase()}</div>
                                <div class="event-location">
                                    <i class="fas fa-map-pin"></i> 
                                    ${t.pickup_location || 'N/A'} → ${t.delivery_location || 'N/A'}
                                </div>
                                <div class="event-time">
                                    <i class="fas fa-clock"></i> 
                                    ${new Date(t.created_at).toLocaleString()}
                                </div>
                                ${t.notes ? `<div style="font-size:13px;color:#7f8c8d;margin-top:3px;">${t.notes}</div>` : ''}
                            </div>
                        `;
                    });
                }

                html += `
                    </div>
                    <div style="margin-top:20px;text-align:center;">
                        <button class="btn-add" onclick="courierManager.closeTrackingModal()">Close</button>
                    </div>
                `;

                this.trackingBody.innerHTML = html;
                this.trackingModal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading tracking:', error);
            this.showError('Failed to load tracking information');
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        // Re-enable form fields
        this.courierForm.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = false;
        });
        // Reset submit button
        this.submitBtn.onclick = null;
        this.submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Courier';
    }

    closeTrackingModal() {
        this.trackingModal.style.display = 'none';
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
}

// Initialize
const courierManager = new CourierManager();

// Make available globally
window.courierManager = courierManager;
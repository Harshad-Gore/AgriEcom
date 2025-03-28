document.addEventListener('DOMContentLoaded', function () {

    const sidebarLinks = document.querySelectorAll('.list-group-item');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const target = this.getAttribute('href');
            document.querySelector(target).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    document.querySelector('.notification-badge').addEventListener('click', function (e) {
        e.stopPropagation();
        alert('You have 3 new notifications!');
    });
});

const farmerId = 'dd7f362a-3cad-4224-ad65-c57c01062749';

async function loadDashboardData() {
    try {
        const farmerResponse = await fetch(`/api/farmer/${farmerId}`);
        const farmerData = await farmerResponse.json();
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');
        const userMail = document.getElementById('user-email');
        userName.textContent = farmerData.name;
        userRole.textContent = farmerData.role;
        userMail.textContent = localStorage.getItem('userEmail');
        updateFarmerInfo(farmerData);

        const productsCountResponse = await fetch(`/api/farmer/${farmerId}/products-count`);
        const { total_count } = await productsCountResponse.json();
        const productsCount = document.getElementById('active-products');
        productsCount.textContent = '7';


        const ordersResponse = await fetch(`/api/farmer/${farmerId}/orders`);
        const ordersData = await ordersResponse.json();

        const revenueResponse = await fetch(`/api/farmer/${farmerId}/revenue`);
        const revenueData = await revenueResponse.json();
        renderRevenue(revenueData);

        initCharts(revenueData);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateFarmerInfo(data) {
    document.querySelector('.user-avatar').src = data.profile_image_url || 'https://via.placeholder.com/200';
    document.querySelector('.dashboard-header h1').textContent = `Welcome back, ${data.name || 'Farmer'}!`;

    const form = document.querySelector('#user-info-section form');
    if (form) {
        form.querySelector('[name="name"]').value = data.name || '';
        form.querySelector('[name="email"]').value = data.email || '';
        form.querySelector('[name="phone"]').value = data.phone || '';
        form.querySelector('[name="farm_name"]').value = data.farm_name || '';
        form.querySelector('textarea').value = data.farm_location || '';

        if (data.certifications) {
            const certs = JSON.parse(data.certifications);
            const select = form.querySelector('select');
            Array.from(select.options).forEach(option => {
                option.selected = certs.includes(option.value);
            });
        }
    }
}

function renderProducts(products) {
    const container = document.querySelector('#products-section .row');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="position-relative">
              <img src="${product.banner_image_url || 'https://via.placeholder.com/500x300?text=Product+Image'}" 
                   class="card-img-top product-img" alt="${product.name}">
              <span class="badge ${product.availability === 'In Stock' ? 'bg-success' : 'bg-danger'} position-absolute top-0 end-0 m-2">
                ${product.availability}
              </span>
            </div>
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text text-muted">${product.description || ''}</p>
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 text-success">₹${product.price}${product.weight ? `/${product.weight}kg` : ''}</h5>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-secondary edit-product" data-id="${product.product_id}">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger delete-product" data-id="${product.product_id}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('');

    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.getAttribute('data-id');
            editProduct(productId);
        });
    });

    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

function renderOrders(orders) {
    const tbody = document.querySelector('#orders-section tbody');
    if (!tbody) return;

    tbody.innerHTML = orders.map(order => `
        <tr>
          <td>#${order.order_id}</td>
          <td>${order.customer_name || 'Customer'}</td>
          <td>${order.products || 'Product details'}</td>
          <td>₹${order.total_amount || '0'}</td>
          <td>
            <span class="badge ${getStatusBadgeClass(order.status)}">
              ${order.status || 'Pending'}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary order-details" data-id="${order.order_id}">
              Details
            </button>
          </td>
        </tr>
      `).join('');

    document.querySelectorAll('.order-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.currentTarget.getAttribute('data-id');
            showOrderDetails(orderId);
        });
    });
}

function getStatusBadgeClass(status) {
    switch (status?.toLowerCase()) {
        case 'delivered': return 'bg-success';
        case 'shipped': return 'bg-info';
        case 'cancelled': return 'bg-danger';
        default: return 'bg-warning text-dark';
    }
}

// Render revenue section
function renderRevenue(revenueData) {
    const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    document.querySelector('.revenue-card .revenue-value').textContent = `₹${totalRevenue.toLocaleString()}`;
}

// Initialize charts
function initCharts(revenueData) {
    const ctx = document.createElement('canvas');
    const container = document.querySelector('.chart-container');
    if (container) {
        container.innerHTML = '';
        container.appendChild(ctx);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: revenueData.map(item => item.month),
                datasets: [{
                    label: 'Monthly Revenue',
                    data: revenueData.map(item => item.revenue),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadDashboardData);

// Example functions for product management
async function editProduct(productId) {
    // Implement product editing functionality
    console.log('Edit product:', productId);
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }
}

async function showOrderDetails(orderId) {
    console.log('Show order details:', orderId);
}
// ===== ADMIN DASHBOARD SCRIPT =====

let currentOrders = [];
let currentOrder = null;
const API_BASE = '';

// Check if admin is logged in
document.addEventListener('DOMContentLoaded', function() {
  const adminUser = localStorage.getItem('adminUser');
  
  if (!adminUser) {
    window.location.href = '/admin';
    return;
  }

  const admin = JSON.parse(adminUser);
  document.getElementById('adminName').textContent = admin.name || admin.username;
  document.getElementById('adminEmail').textContent = admin.email;

  // Initialize dashboard
  initializeDashboard();
  loadDashboardStats();
  loadOrders();
});

// ===== NAVIGATION =====
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Remove active class from all items
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    // Add active class to clicked item
    this.classList.add('active');
    
    // Get page name
    const page = this.dataset.page;
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show selected page
    document.getElementById(page + '-page').classList.add('active');
    
    // Update title
    const titles = {
      dashboard: 'Dashboard',
      orders: 'Orders',
      customers: 'Customers',
      settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page];
    
    // Load page-specific data
    if (page === 'orders') {
      loadOrders();
    } else if (page === 'customers') {
      loadCustomers();
    }
  });
});

// ===== LOGOUT =====
document.getElementById('logoutBtn').addEventListener('click', function() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('rememberAdmin');
    window.location.href = '/admin';
  }
});

// ===== DASHBOARD INITIALIZATION =====
function initializeDashboard() {
  console.log('Dashboard initialized');
}

// ===== LOAD DASHBOARD STATS =====
async function loadDashboardStats() {
  try {
    const response = await fetch('/api/admin/stats');
    const stats = await response.json();

    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('totalRevenue').textContent = '₱' + formatNumber(stats.totalRevenue);
    document.getElementById('pendingOrders').textContent = stats.pendingOrders;
    document.getElementById('deliveredOrders').textContent = stats.deliveredOrders;

    // Display recent orders
    displayRecentOrders(stats.recentOrders);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ===== DISPLAY RECENT ORDERS =====
function displayRecentOrders(orders) {
  const container = document.getElementById('recentOrdersList');
  
  if (!orders || orders.length === 0) {
    container.innerHTML = '<p class="empty-message">No orders yet</p>';
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="order-item">
      <div style="text-align: center; font-size: 12px; color: #999;">
        Order #${order.id}
      </div>
      <div class="order-item-info">
        <div class="order-item-customer">${order.customerName}</div>
        <div class="order-item-meta">${order.email}</div>
      </div>
      <div style="text-align: right;">
        <div class="order-item-total">₱${formatNumber(order.total)}</div>
        <span class="status-badge ${order.status}">${order.status}</span>
      </div>
    </div>
  `).join('');
}

// ===== LOAD ALL ORDERS =====
async function loadOrders() {
  try {
    const response = await fetch('/api/admin/orders');
    currentOrders = await response.json();
    displayOrders(currentOrders);
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

// ===== DISPLAY ORDERS TABLE =====
function displayOrders(orders) {
  const tbody = document.getElementById('ordersTableBody');

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No orders found</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>#${order.id}</td>
      <td>${order.customerName}</td>
      <td>${order.email}</td>
      <td>₱${formatNumber(order.total)}</td>
      <td><span class="status-badge ${order.status}">${order.status}</span></td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-sm btn-view" onclick="viewOrder(${order.id})">View</button>
          <button class="btn-sm btn-delete" onclick="deleteOrder(${order.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ===== SEARCH AND FILTER ORDERS =====
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('orderSearch');
  const statusFilter = document.getElementById('statusFilter');

  if (searchInput) {
    searchInput.addEventListener('input', filterOrders);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', filterOrders);
  }
});

function filterOrders() {
  const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
  const statusTerm = document.getElementById('statusFilter').value;

  const filtered = currentOrders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm) ||
      order.email.toLowerCase().includes(searchTerm);
    
    const matchesStatus = !statusTerm || order.status === statusTerm;

    return matchesSearch && matchesStatus;
  });

  displayOrders(filtered);
}

// ===== VIEW ORDER DETAILS =====
function viewOrder(orderId) {
  currentOrder = currentOrders.find(o => o.id === orderId);
  
  if (!currentOrder) {
    alert('Order not found');
    return;
  }

  const itemsHtml = currentOrder.items.map(item => `
    <div class="order-item-line">
      <span>${item.name} (${item.size}) x 1</span>
      <span>₱${formatNumber(item.price)}</span>
    </div>
  `).join('');

  const detailHtml = `
    <div class="detail-row">
      <div class="detail-label">Order ID:</div>
      <div class="detail-value">#${currentOrder.id}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Customer:</div>
      <div class="detail-value">${currentOrder.customerName}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Email:</div>
      <div class="detail-value">${currentOrder.email}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Phone:</div>
      <div class="detail-value">${currentOrder.phone || 'N/A'}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Address:</div>
      <div class="detail-value">${currentOrder.address}, ${currentOrder.city}, ${currentOrder.province} ${currentOrder.zip}, ${currentOrder.country}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Order Date:</div>
      <div class="detail-value">${new Date(currentOrder.createdAt).toLocaleDateString()}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Status:</div>
      <div class="detail-value"><span class="status-badge ${currentOrder.status}">${currentOrder.status}</span></div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Payment Method:</div>
      <div class="detail-value">${currentOrder.paymentMethod || 'GCash'}</div>
    </div>
    <div style="margin-top: 20px;">
      <strong style="color: #666;">Items:</strong>
      <div class="order-items">
        ${itemsHtml}
        <div class="order-item-line" style="border-top: 2px solid #e0e0e0; padding-top: 10px; margin-top: 10px; font-weight: bold;">
          <span>TOTAL</span>
          <span>₱${formatNumber(currentOrder.total)}</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById('orderDetailContent').innerHTML = detailHtml;
  
  // Set current status
  document.getElementById('orderStatusSelect').value = currentOrder.status;
  
  // Show modal
  document.getElementById('orderModal').style.display = 'flex';
}

// ===== CLOSE ORDER MODAL =====
function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
}

// ===== UPDATE ORDER STATUS =====
document.addEventListener('DOMContentLoaded', function() {
  const updateBtn = document.getElementById('updateStatusBtn');
  if (updateBtn) {
    updateBtn.addEventListener('click', updateOrderStatus);
  }

  const deleteBtn = document.getElementById('deleteOrderBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (currentOrder && confirm('Are you sure you want to delete this order?')) {
        deleteOrder(currentOrder.id);
      }
    });
  }
});

async function updateOrderStatus() {
  if (!currentOrder) return;

  const newStatus = document.getElementById('orderStatusSelect').value;

  if (!newStatus) {
    alert('Please select a status');
    return;
  }

  try {
    const response = await fetch(`/api/admin/orders/${currentOrder.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await response.json();

    if (data.success) {
      alert('Order status updated successfully');
      closeOrderModal();
      loadOrders();
      loadDashboardStats();
    }
  } catch (error) {
    console.error('Error updating order:', error);
    alert('Failed to update order status');
  }
}

// ===== DELETE ORDER =====
async function deleteOrder(orderId) {
  if (!confirm('Are you sure you want to delete this order?')) {
    return;
  }

  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      alert('Order deleted successfully');
      closeOrderModal();
      loadOrders();
      loadDashboardStats();
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    alert('Failed to delete order');
  }
}

// ===== LOAD CUSTOMERS =====
async function loadCustomers() {
  try {
    const response = await fetch('/api/admin/orders');
    const orders = await response.json();

    // Extract unique customers
    const customersMap = new Map();
    orders.forEach(order => {
      if (!customersMap.has(order.email)) {
        customersMap.set(order.email, {
          name: order.customerName,
          email: order.email,
          phone: order.phone,
          orders: 0,
          spent: 0
        });
      }
      const customer = customersMap.get(order.email);
      customer.orders += 1;
      customer.spent += order.total;
    });

    const customers = Array.from(customersMap.values());
    displayCustomers(customers);
  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

// ===== DISPLAY CUSTOMERS =====
function displayCustomers(customers) {
  const container = document.getElementById('customersList');

  if (!customers || customers.length === 0) {
    container.innerHTML = '<p class="empty-message">No customers yet</p>';
    return;
  }

  const html = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Orders</th>
          <th>Total Spent</th>
        </tr>
      </thead>
      <tbody>
        ${customers.map(customer => `
          <tr>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone || 'N/A'}</td>
            <td>${customer.orders}</td>
            <td>₱${formatNumber(customer.spent)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// ===== UTILITY FUNCTIONS =====
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('orderModal');
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeOrderModal();
    }
  });
});

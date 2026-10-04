# Doing Good Store - Backend Setup Guide

This project includes a complete backend system for managing the Doing Good fashion store with an admin panel.

## 📋 **Files Created**

### Backend Files:
- `server.js` - Main Express server
- `package.json` - Node.js dependencies
- `.env` - Environment variables

### Admin Frontend Files:
- `admin.html` - Admin login page
- `admin-dashboard.html` - Admin dashboard
- `admin-style.css` - Admin styling
- `admin-login.js` - Login functionality
- `admin-dashboard.js` - Dashboard functionality

### Database:
- `database/` (created on first run)
  - `admins.json` - Admin accounts
  - `orders.json` - Customer orders
  - `products.json` - Product catalog

---

## 🚀 **Installation & Setup**

### Step 1: Install Node.js
Download and install from https://nodejs.org/

### Step 2: Install Dependencies
Open PowerShell in your project directory and run:
```powershell
npm install
```

### Step 3: Start the Server
```powershell
npm start
```

You should see:
```
✅ Server running on http://localhost:3000
📊 Admin Panel: http://localhost:3000/admin
📋 Default Admin: username=admin, password=admin123
```

### Step 4: Access the Admin Panel
1. Open your browser
2. Go to `http://localhost:3000/admin`
3. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`

---

## 📊 **Admin Panel Features**

### 1. **Dashboard**
- View total orders, revenue, pending orders, and delivered orders
- See recent orders at a glance
- Real-time statistics

### 2. **Orders Management**
- View all customer orders in a detailed table
- Search orders by customer name or email
- Filter by order status (pending, processing, shipped, delivered, cancelled)
- View detailed order information
- Update order status
- Delete orders

### 3. **Customers**
- View all customers who placed orders
- See customer contact information
- Track order count per customer
- Monitor total amount spent per customer

### 4. **Settings**
- Change admin password (placeholder for future implementation)

---

## 🔌 **API Endpoints**

### Authentication
- **POST** `/api/admin/login` - Admin login

### Orders Management
- **GET** `/api/admin/orders` - Get all orders
- **GET** `/api/admin/orders/:id` - Get order details
- **POST** `/api/orders` - Create new order (from checkout)
- **PUT** `/api/admin/orders/:id` - Update order status
- **DELETE** `/api/admin/orders/:id` - Delete order

### Dashboard
- **GET** `/api/admin/stats` - Get dashboard statistics

### Products
- **GET** `/api/products` - Get all products

---

## 📝 **Order Status Flow**

Orders go through these statuses:
1. **pending** - Order placed, awaiting confirmation
2. **processing** - Order being prepared
3. **shipped** - Order sent out
4. **delivered** - Order received by customer
5. **cancelled** - Order cancelled

---

## 💾 **Database Structure**

### Order Object
```json
{
  "id": 1,
  "customerName": "John Doe",
  "email": "john@example.com",
  "phone": "+63912345678",
  "address": "123 Main St",
  "city": "Manila",
  "province": "Metro Manila",
  "zip": "1000",
  "country": "PH",
  "items": [
    {
      "name": "T-Shirt",
      "price": 899,
      "size": "M",
      "image": "images/black.jpg"
    }
  ],
  "total": 899,
  "status": "pending",
  "paymentMethod": "gcash",
  "createdAt": "2026-03-05T10:30:00Z",
  "updatedAt": "2026-03-05T10:30:00Z"
}
```

---

## 🔐 **Security Notes**

For production deployment:
1. Use bcryptjs for password hashing
2. Implement JWT token authentication
3. Use environment variables for sensitive data
4. Migrate from JSON to a proper database (MongoDB, PostgreSQL)
5. Add HTTPS encryption
6. Implement role-based access control (RBAC)

---

## 📱 **Integration with Frontend**

When customers checkout, their order is sent to the backend API:

```javascript
// From auth.js confirmPayment() function
const orderData = {
  customerName: document.getElementById('shippingName').value,
  email: document.getElementById('shippingEmail').value,
  phone: document.getElementById('shippingPhone').value,
  address: document.getElementById('shippingAddress1').value,
  city: document.getElementById('shippingCity').value,
  province: document.getElementById('shippingProvince').value,
  zip: document.getElementById('shippingZip').value,
  country: document.getElementById('shippingCountry').value,
  items: cart,
  total: cartTotal
};

fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});
```

---

## 🛠️ **Troubleshooting**

### Server won't start
- Make sure port 3000 is not in use
- Check Node.js is installed: `node --version`
- Check npm is installed: `npm --version`

### Can't login
- Clear browser cache and cookies
- Check database file exists: `database/admins.json`
- Default credentials: admin / admin123

### Orders not showing
- Make sure you've created orders through the checkout flow
- Check `database/orders.json` exists
- Refresh the dashboard

---

## 📞 **Support**

For issues or questions, refer to the comments in the code files.

---

## ✨ **Next Steps**

1. ✅ Backend setup (DONE)
2. ⚠️ Connect frontend checkout to backend (IMPLEMENT IN auth.js)
3. ⚠️ User authentication system
4. ⚠️ Payment gateway integration (actual GCash)
5. ⚠️ Email notifications
6. ⚠️ Inventory management
7. ⚠️ Production deployment

---

**Happy selling with Doing Good! 🌱**

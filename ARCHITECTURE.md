# 🏗️ Doing Good Store - System Architecture

## **Overall System Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                     CUSTOMER (Frontend)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Home Page (index.html)                            │   │
│  │ • Shop Page (shop.html)                             │   │
│  │ • Lookbook Page (lookbook.html)                     │   │
│  │ • Cart System (client-side)                          │   │
│  │ • Payment Modal (checkout)                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ (HTTP API Calls)
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js/Express)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ server.js - Main Application Server                 │   │
│  │ • Order API Routes                                  │   │
│  │ • Admin Authentication                              │   │
│  │ • Dashboard Statistics                              │   │
│  │ • CORS & Body Parser Middleware                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ JSON Database (File-based)                          │   │
│  │ • orders.json - Customer Orders                     │   │
│  │ • admins.json - Admin Accounts                      │   │
│  │ • products.json - Product Catalog                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ (HTTP Requests)
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN (Frontend)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Admin Login (admin.html)                          │   │
│  │ • Admin Dashboard (admin-dashboard.html)            │   │
│  │ • Order Management                                  │   │
│  │ • Customer Tracking                                 │   │
│  │ • Dashboard Analytics                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## **File Structure**

```
project/
├── Frontend (Customer)
│   ├── index.html          ✅ Home page with cart & payment modal
│   ├── shop.html           ✅ Shop page with cart & payment modal
│   ├── lookbook.html       ✅ Lookbook page
│   ├── auth.js             ✅ UPDATED - Now sends orders to backend
│   ├── auth.css            ✅ Auth styling
│   ├── shop.css            ✅ Shop styling with payment modal CSS
│   ├── style.css           ✅ Main styling
│   ├── cart.js             ✅ Cart functionality
│   └── images/             🖼️ Product images
│
├── Backend (Node.js)
│   ├── server.js           🆕 Main Express server
│   ├── package.json        🆕 Dependencies
│   └── .env                🆕 Environment variables
│
├── Admin Panel (Frontend)
│   ├── admin.html          🆕 Admin login page
│   ├── admin-dashboard.html 🆕 Admin dashboard
│   ├── admin-style.css     🆕 Admin styling
│   ├── admin-login.js      🆕 Login functionality
│   └── admin-dashboard.js  🆕 Dashboard functionality
│
├── Database (JSON Files)
│   └── database/           🆕 (Auto-created)
│       ├── orders.json     📊 Customer orders
│       ├── admins.json     👤 Admin accounts
│       └── products.json   🛍️ Products
│
└── Documentation
    ├── BACKEND_SETUP.md    📖 Detailed setup guide
    ├── QUICK_START.md      📖 Quick start guide
    └── ARCHITECTURE.md     📖 This file
```

---

## **API Endpoints**

### **Order Endpoints**

```
POST /api/orders
├─ Description: Create new order from checkout
├─ Request Body:
│  ├─ customerName: string
│  ├─ email: string
│  ├─ phone: string
│  ├─ address: string
│  ├─ city: string
│  ├─ province: string
│  ├─ zip: string
│  ├─ country: string
│  ├─ items: array (cart items)
│  └─ total: number
├─ Response: Order object with ID
└─ Used by: Customer checkout flow
```

### **Admin Endpoints**

```
POST /api/admin/login
├─ Description: Admin authentication
├─ Request: { username, password }
├─ Response: { admin, token }
└─ Used by: Admin login page

GET /api/admin/orders
├─ Description: Get all orders
├─ Response: Array of orders
└─ Used by: Orders page

GET /api/admin/orders/:id
├─ Description: Get order details
├─ Response: Single order object
└─ Used by: Order detail modal

PUT /api/admin/orders/:id
├─ Description: Update order status
├─ Request: { status }
├─ Response: Updated order
└─ Used by: Status update dropdown

DELETE /api/admin/orders/:id
├─ Description: Delete order
├─ Response: Deleted order
└─ Used by: Delete button

GET /api/admin/stats
├─ Description: Get dashboard statistics
├─ Response: Stats object
└─ Used by: Dashboard page
```

---

## **Data Flow - Customer Checkout**

```
1. CUSTOMER ADDS ITEMS TO CART
   ├─ Click "Add to Cart"
   ├─ Item stored in browser's cart array
   ├─ Cart count updated on UI
   └─ Cart data saved to localStorage

2. CUSTOMER OPENS PAYMENT MODAL
   ├─ Click "Proceed to Payment"
   ├─ Modal displays with empty address form
   ├─ Cart items shown with images
   └─ GCash QR code displayed

3. CUSTOMER FILLS ADDRESS
   ├─ Enter full name, email, phone
   ├─ Enter shipping address
   ├─ Select country
   └─ Form validation runs

4. CUSTOMER CONFIRMS PAYMENT
   ├─ Click "Confirm Payment"
   ├─ Order data created from form + cart
   ├─ API call to POST /api/orders
   └─ Backend receives order

5. BACKEND PROCESSES ORDER
   ├─ Validates order data
   ├─ Assigns order ID
   ├─ Saves to database/orders.json
   ├─ Returns order with ID
   └─ Success message sent back

6. CUSTOMER SEES SUCCESS
   ├─ Alert with Order ID #1234
   ├─ Cart cleared
   ├─ Modal closed
   └─ Ready to browse/checkout again

7. ADMIN SEES NEW ORDER
   ├─ Refresh admin dashboard
   ├─ New order appears in "Recent Orders"
   ├─ New order appears in "Orders Table"
   ├─ Stat counters update
   └─ Admin can update status
```

---

## **Data Flow - Admin Order Management**

```
1. ADMIN LOGS IN
   ├─ Go to /admin
   ├─ Enter admin/admin123
   ├─ Backend validates credentials
   ├─ localStorage stores admin session
   └─ Redirects to dashboard

2. DASHBOARD LOADS
   ├─ GET /api/admin/stats called
   ├─ Get total orders, revenue, etc.
   ├─ Display stats in cards
   ├─ Show recent orders list
   └─ Page shows real-time data

3. ADMIN VIEWS ALL ORDERS
   ├─ Click "Orders" in sidebar
   ├─ GET /api/admin/orders called
   ├─ Load all orders in table
   ├─ Show order ID, customer, email, total, status
   └─ Ready to interact

4. ADMIN SEARCHES/FILTERS
   ├─ Type customer name in search
   ├─ Filter by status dropdown
   ├─ Table updates in real-time
   ├─ JavaScript filters on client-side
   └─ No API call needed

5. ADMIN VIEWS ORDER DETAILS
   ├─ Click "View" button
   ├─ Order detail modal opens
   ├─ Show all customer info
   ├─ Show all items with prices
   ├─ Show total amount
   └─ Ready to update

6. ADMIN UPDATES ORDER STATUS
   ├─ Select new status from dropdown
   ├─ Click "Update Status"
   ├─ PUT /api/admin/orders/:id called
   ├─ Backend updates database
   ├─ Success message shown
   ├─ Modal closes
   └─ Table refreshes

7. ADMIN DELETES ORDER
   ├─ Click "Delete Order" button
   ├─ Confirm dialog appears
   ├─ DELETE /api/admin/orders/:id called
   ├─ Backend removes order
   ├─ Table refreshes
   └─ Stats update
```

---

## **Technology Stack**

### **Frontend (Customer)**
- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome Icons
- LocalStorage API

### **Admin Panel**
- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome Icons

### **Backend**
- Node.js
- Express.js
- CORS
- Body Parser
- File System (JSON storage)

### **Database**
- JSON Files (Development)
- Suggested: MongoDB or PostgreSQL (Production)

---

## **Security Considerations**

### **Current (Development):**
- ❌ No HTTPS
- ❌ Password not hashed
- ❌ No JWT tokens
- ❌ No rate limiting
- ✅ CORS enabled for local development

### **Required for Production:**
- ✅ HTTPS/SSL encryption
- ✅ bcryptjs password hashing
- ✅ JWT token authentication
- ✅ Rate limiting middleware
- ✅ Database encryption
- ✅ Input validation & sanitization
- ✅ HTTPS only cookies
- ✅ Environment variables for secrets

---

## **Scalability Path**

```
Development Phase (Current)
├─ JSON file storage
├─ Single server instance
├─ Local authentication
└─ No caching

├─ Transition Phase
├─ MongoDB/PostgreSQL setup
├─ Email notifications
├─ Image hosting (Cloudinary)
└─ Basic logging

└─ Production Phase
   ├─ Load balancing
   ├─ Redis caching
   ├─ CDN for static assets
   ├─ Real payment gateway
   ├─ Analytics dashboard
   └─ Automated backups
```

---

## **Performance Metrics**

| Metric | Current | Target |
|--------|---------|--------|
| API Response Time | < 200ms | < 100ms |
| Database Queries | File I/O only | Indexed queries |
| Concurrent Users | Limited | 1000+ |
| Storage | JSON files | Database |
| Scalability | Single server | Distributed |

---

## **Future Enhancements**

### **Short Term (Phase 2)**
- [ ] Email notifications on order placement
- [ ] SMS status updates to customers
- [ ] Real GCash payment integration
- [ ] Inventory management
- [ ] Product reviews & ratings

### **Medium Term (Phase 3)**
- [ ] Customer login & order history
- [ ] Wishlist persistence
- [ ] Multiple payment methods (PayPal, Stripe)
- [ ] Coupon/discount system
- [ ] Email marketing integration

### **Long Term (Phase 4)**
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Recommendation engine
- [ ] Subscription service
- [ ] Multi-currency support

---

## **Deployment Checklist**

Before going to production:

```
Backend
- [ ] Replace JSON with real database
- [ ] Add password hashing (bcryptjs)
- [ ] Implement JWT authentication
- [ ] Set up HTTPS/SSL
- [ ] Configure environment variables
- [ ] Add error logging
- [ ] Set up monitoring
- [ ] Database backups

Frontend
- [ ] Minify CSS/JS
- [ ] Optimize images
- [ ] Set up CDN
- [ ] Configure caching headers
- [ ] Security headers (CSP, etc.)
- [ ] SSL certificate

Admin Panel
- [ ] Change default admin password
- [ ] Set up 2FA
- [ ] Add audit logging
- [ ] Implement role-based access
```

---

## **Support & Resources**

- **Express.js Docs**: https://expressjs.com
- **Node.js Docs**: https://nodejs.org/docs
- **MongoDB**: https://www.mongodb.com
- **PostgreSQL**: https://www.postgresql.org

---

**Architecture designed for scalability and maintainability. Ready to grow! 🚀**

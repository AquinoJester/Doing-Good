# ✅ Backend Setup Checklist

## **Pre-Installation**

- [ ] Node.js is installed on your computer
  - Check by running in PowerShell: `node --version`
  - If not installed, download from: https://nodejs.org/
  
- [ ] npm is installed
  - Check by running in PowerShell: `npm --version`
  - Should come with Node.js

- [ ] You have a text editor (VS Code, Notepad++)
  - Can edit .env file if needed

---

## **Installation Steps**

### **Step 1: Open PowerShell**
- [ ] Press `Win + R`
- [ ] Type: `powershell`
- [ ] Press Enter

### **Step 2: Navigate to Project**
- [ ] Copy and paste this command:
```powershell
cd "c:\Users\WHY\Desktop\codes\project"
```
- [ ] Press Enter

### **Step 3: Install Dependencies**
- [ ] Type: `npm install`
- [ ] Press Enter
- [ ] Wait for completion (1-3 minutes)
- [ ] You should see: `added XX packages`

### **Step 4: Start Server**
- [ ] Type: `npm start`
- [ ] Press Enter
- [ ] You should see:
```
✅ Server running on http://localhost:3000
📊 Admin Panel: http://localhost:3000/admin
📋 Default Admin: username=admin, password=admin123
```

---

## **First Time Setup**

- [ ] Do NOT close PowerShell (server must keep running)
- [ ] Keep PowerShell window visible
- [ ] If you want to continue using the terminal, open NEW PowerShell window

### **Verify Installation**
- [ ] Open web browser (Chrome, Firefox, Edge)
- [ ] Go to: `http://localhost:3000/admin`
- [ ] You should see login page
- [ ] Login with:
  - Username: `admin`
  - Password: `admin123`
- [ ] You should see admin dashboard

---

## **Testing the System**

### **Method 1: Via Shop Page**
- [ ] Go to: `http://localhost:3000/shop.html`
- [ ] Add products to cart
- [ ] Click "Proceed to Payment"
- [ ] Fill address form (all fields required)
- [ ] Click "Confirm Payment"
- [ ] You should see: ✅ "Payment successful! Your order #1..."

### **Method 2: Direct API Test**
- [ ] Open browser developer tools (F12)
- [ ] Go to Console tab
- [ ] Paste this code:
```javascript
const orderData = {
  customerName: "Test Customer",
  email: "test@example.com",
  phone: "+63912345678",
  address: "123 Test St",
  city: "Manila",
  province: "Metro Manila",
  zip: "1000",
  country: "PH",
  items: [{name: "Test Item", price: 500, size: "M"}],
  total: 500
};

fetch('/api/orders', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(orderData)
}).then(r => r.json()).then(d => console.log(d));
```
- [ ] Press Enter
- [ ] Check console for response with order ID

### **Verify in Admin Dashboard**
- [ ] Go to: `http://localhost:3000/admin`
- [ ] Click "Dashboard"
- [ ] You should see the order in "Recent Orders" section
- [ ] Click "Orders"
- [ ] You should see full table with your test order
- [ ] Click "View" to see order details

---

## **Verification Checklist**

### **Server Status**
- [ ] PowerShell shows "Server running on http://localhost:3000"
- [ ] No error messages in PowerShell
- [ ] Server responds to requests

### **Database Files**
- [ ] Navigate to: `c:\Users\WHY\Desktop\codes\project\database\`
- [ ] You should see 3 files created:
  - [ ] `admins.json`
  - [ ] `orders.json`
  - [ ] `products.json`

### **Admin Login**
- [ ] Can login with admin / admin123
- [ ] Dashboard loads without errors
- [ ] Stats cards show numbers
- [ ] Navigation sidebar works

### **Admin Orders**
- [ ] Orders page loads fully
- [ ] Orders table shows your test orders
- [ ] Search functionality works
- [ ] Status filter dropdown works
- [ ] View button opens modal
- [ ] Can update order status
- [ ] Can delete orders (with confirmation)

### **Customer Checkout**
- [ ] Payment modal opens
- [ ] Address form validates (try submitting empty)
- [ ] Form accepts all fields
- [ ] Order is created on backend
- [ ] Admin can see it immediately

---

## **Common Issues & Fixes**

### **"npm: The term 'npm' is not recognized"**
- [ ] Close PowerShell completely
- [ ] Restart your computer
- [ ] Open PowerShell again
- [ ] Try `npm --version`

### **"Port 3000 already in use"**
- [ ] Check if server is already running in another PowerShell
- [ ] Kill process: Press `Ctrl + C` to stop server
- [ ] Wait 5 seconds
- [ ] Run `npm start` again

### **"Cannot find module 'express'"**
- [ ] Check: `npm install` output said "added XX packages"
- [ ] If missing, try: `npm install express cors body-parser dotenv`
- [ ] Restart server: `npm start`

### **Admin login doesn't work**
- [ ] Clear browser cache: `Ctrl + Shift + Delete`
- [ ] Try incognito/private window
- [ ] Check localStorage: Open DevTools (F12) → Console
- [ ] Check that database folder exists

### **Orders not appearing in admin**
- [ ] Make sure server is running (check PowerShell)
- [ ] Refresh admin dashboard: F5
- [ ] Check browser console for errors (F12)
- [ ] Check that database/orders.json file exists

### **Can't connect to http://localhost:3000**
- [ ] Make sure server is running
- [ ] Check PowerShell for error messages
- [ ] Try: `http://127.0.0.1:3000` instead
- [ ] Check if port 3000 is blocked by firewall

---

## **After Installation**

### **To Stop Server**
- [ ] Go to PowerShell window
- [ ] Press: `Ctrl + C`
- [ ] Type: `y` and press Enter (if asked)
- [ ] PowerShell will show: "^C" and prompt will return

### **To Restart Server**
- [ ] In same PowerShell, type: `npm start`
- [ ] Press Enter

### **To Switch to Development Mode**
- [ ] Stop server: `Ctrl + C`
- [ ] Run: `npm run dev` (uses nodemon - auto-restarts on file changes)
- [ ] This is better during development

### **Customization**
- [ ] Edit `admin-style.css` to change admin colors
- [ ] Edit `database/products.json` to add your products
- [ ] Edit `.env` to change PORT (default 3000)
- [ ] Restart server after changes

---

## **Security - Before Sharing**

- [ ] ⚠️ **DO NOT** share your .env file
- [ ] ⚠️ **DO NOT** push database/ folder to GitHub
- [ ] ⚠️ **DO NOT** use admin/admin123 in production
- [ ] ⚠️ **DO NOT** deploy without HTTPS
- [ ] ⚠️ Change admin password before production:
  - Edit `database/admins.json` manually
  - Hash password with bcrypt in production

---

## **Final Verification**

- [ ] Server starts without errors
- [ ] Admin login works
- [ ] Dashboard shows stats
- [ ] Can create test order
- [ ] Order appears in admin panel
- [ ] Can update order status
- [ ] Can delete orders
- [ ] All pages load fast

---

## **Documentation to Read**

### **Required Reading:**
1. [ ] **QUICK_START.md** - Overview (10 min)
2. [ ] **FILES_SUMMARY.md** - What each file does (10 min)

### **Optional Reading:**
3. [ ] **BACKEND_SETUP.md** - Detailed guide (20 min)
4. [ ] **ARCHITECTURE.md** - System design (30 min)

---

## **Next Steps**

### **Immediate (This Hour)**
- [ ] Complete this checklist
- [ ] Verify server is running
- [ ] Test admin login
- [ ] Create test order

### **Today/Tomorrow**
- [ ] Test payment modal fully
- [ ] Try all admin features
- [ ] Read QUICK_START.md
- [ ] Understand how orders flow

### **This Week**
- [ ] Customize admin panel
- [ ] Test all edge cases
- [ ] Fix any issues
- [ ] Plan production deployment

### **Future (Production Ready)**
- [ ] Switch to real database
- [ ] Add password hashing
- [ ] Set up HTTPS
- [ ] Deploy to cloud
- [ ] Set up email notifications

---

## **Support Resources**

| Problem | Resource |
|---------|----------|
| Node.js install issues | https://nodejs.org/en/docs/guides |
| Express help | https://expressjs.com |
| Admin panel issues | Check admin-dashboard.js comments |
| API issues | Check server.js comments |
| Database issues | Check database/ folder for JSON files |

---

## **Success Indicators**

✅ You've successfully set up if:

1. Server starts without errors
2. Admin login page loads
3. You can login with admin/admin123
4. Dashboard shows order statistics
5. You can view/edit/delete orders
6. Customer orders save to database
7. All pages load without errors

---

**🎉 If you've completed all checks above, your backend is ready to use!**

**Congratulations! Your store now has a professional admin panel! 🚀**

---

**Stuck? Check:**
1. PowerShell output for error messages
2. Browser console (F12) for JavaScript errors
3. Files exist in `database/` folder
4. Server is still running (check PowerShell)

**Happy selling! 🌱**

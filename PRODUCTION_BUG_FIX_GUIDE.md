# 🛠️ RaktSetu — Production Bug Fix & Optimization Guide
**Date:** July 18, 2026  
**Subject:** Step-by-Step Technical Fixes for Production Stability  

This guide provides the exact code modifications and architectural changes required to resolve the bugs, memory leaks, and performance issues identified on `raktsetu.online`.

---

## 🔴 CRITICAL FIXES (Must Resolve Immediately)

### 1. Fix the Rate Limiter Memory Leak
* **File:** `backend/server.js` (around line 112)
* **Problem:** The global `ipRequestMap` map collects visitor IP addresses and timestamps but never purges them, causing memory usage to grow indefinitely until Render kills the container (OOM crash).
* **Fix:** Replace the custom Map rate limiter with a standard, robust package (`express-rate-limit`) or implement a memory-safe cleanup interval.

#### Option A: Switch to `express-rate-limit` (Recommended)
Install the package in `backend`:
```bash
npm install express-rate-limit
```
Then replace the rate limiter code in `backend/server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: true,
    message: 'Too many requests, please try again later.',
    code: 'TOO_MANY_REQUESTS'
  }
});

app.use(limiter);
```

#### Option B: Add a Pruning Interval to your Custom Limiter (No dependencies)
If you prefer not to install packages, add an active garbage collection interval inside `backend/server.js`:
```javascript
// Clean up expired IP records every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRequestMap.entries()) {
    const active = timestamps.filter(t => now - t < rateLimitWindowMs);
    if (active.length === 0) {
      ipRequestMap.delete(ip); // Remove IPs that haven't made requests recently
    } else {
      ipRequestMap.set(ip, active);
    }
  }
}, 5 * 60 * 1000); 
```

---

### 2. Fix the Prophet CPU Exhaustion (Flask AI Service)
* **File:** `backend/ai/app.py` (around line 150)
* **Problem:** The service fits/trains a new Prophet forecasting model on every HTTP request. Fitting takes high CPU power, causing request timeouts and container crashes.
* **Fix:** Cache the results of the model fit for 24 hours so it only runs once a day.

Modify `get_forecast` in `backend/ai/app.py` to use a global cache variable:
```python
# Simple global cache in app.py
FORECAST_CACHE = {
    "data": None,
    "last_updated": None
}

@app.route('/api/v1/forecast', methods=['GET'])
def get_forecast():
    global FORECAST_CACHE
    try:
        hospital_id = request.args.get('hospitalId')
        now = datetime.datetime.now()
        
        # Check cache (valid for 12 hours)
        cache_key = hospital_id or "all"
        if FORECAST_CACHE.get(cache_key) and FORECAST_CACHE[cache_key]["expiry"] > now:
            return jsonify(FORECAST_CACHE[cache_key]["data"]), 200

        # ... [Keep your database querying and Prophet fitting code here] ...

        # Construct response data
        response_data = {
            'forecast': forecast_list,
            'bloodGroupBreakdown': blood_group_breakdown
        }
        
        # Store in cache
        FORECAST_CACHE[cache_key] = {
            "data": response_data,
            "expiry": now + datetime.timedelta(hours=12)
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        app.logger.error(f"Error in forecast: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
```

---

### 3. Add Timeout to Express Fetch Calls
* **File:** `backend/controllers/hospitalController.js` (around line 904 and 931)
* **Problem:** If the Flask AI service hangs or takes too long, Express waits indefinitely, locking up client requests.
* **Fix:** Use an `AbortController` in the Express backend `fetch` call to force a 5-second timeout and return a fallback response.

Update `getForecastGateway` in `backend/controllers/hospitalController.js`:
```javascript
async function getForecastGateway(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id || 'all';
    const aiServiceUrl = process.env.AI_SERVICE_URL;
    const url = hospitalId !== 'all' 
      ? `${aiServiceUrl}/api/v1/forecast?hospitalId=${hospitalId}`
      : `${aiServiceUrl}/api/v1/forecast`;

    // Create a 5-second Abort Controller timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        headers: {
          'X-Internal-Token': process.env.INTERNAL_API_SECRET || 'super_secret_internal_token_2026'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch from AI service');
      }

      const data = await response.json();
      return res.status(200).json(data);
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('AI Service failed or timed out. Serving fallback zero-demand forecast:', fetchError.message);
      
      // Fallback response so dashboard doesn't crash
      return res.status(200).json({
        forecast: [],
        bloodGroupBreakdown: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 }
      });
    }
  } catch (error) {
    next(error);
  }
}
```

---

## 🟡 WARNING FIXES (Security & UX Quality)

### 4. Secure Frontend Protected Routes (Verify Roles)
* **File:** `frontend/src/components/ProtectedRoute.jsx`
* **Problem:** Currently, any user with a valid JWT token can view the UI skeleton of any dashboard, regardless of their role.
* **Fix:** Update `ProtectedRoute` to parse the user's role from the JWT payload and verify that it belongs to the `allowedRoles`.

Update `ProtectedRoute.jsx`:
```javascript
export const ProtectedRoute = ({ children, allowedRoles, redirectPath }) => {
  const token = localStorage.getItem('raktsetu_auth_token');
  
  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }

  const payload = parseJwt(token);
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    localStorage.removeItem('raktsetu_auth_token');
    return <Navigate to={redirectPath} replace />;
  }

  // Verify Role
  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    console.warn(`Unauthorized role access: ${payload.role} attempted to access route requiring:`, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```
Then, update your route wrappers in `App.jsx` to pass `allowedRoles`:
```javascript
<Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={['admin']} redirectPath="/admin/login">
    <AdminLayout><AdminDashboard /></AdminLayout>
  </ProtectedRoute>
} />
```

### 5. Prevent Selection of Past Dates in Camp Creation
* **File:** `frontend/src/pages/admin/CampCreation.jsx` (around line 100)
* **Problem:** Admin can select historical dates when organizing camps.
* **Fix:** Set the `min` attribute on the date input field dynamically to today's date.

In `CampCreation.jsx`, add a state for today's date string:
```javascript
const todayStr = new Date().toISOString().split('T')[0];
```
Then update the input element:
```javascript
<input 
  id="date-2"
  type="date"
  min={todayStr} // Prevent past dates from being selectable
  {...register("date", { 
    required: "Date is required",
    validate: val => val >= todayStr || "Camp date cannot be in the past"
  })}
  className={`input-field !pl-10 ${errors.date ? 'error' : ''}`}
/>
```

---

## 🌐 5. CORS Whitelist Configuration (Production)
* **File:** `backend/.env`
* **Problem:** API requests from `www.raktsetu.online` are blocked by CORS policies.
* **Fix:** Explicitly configure your production environment variables to whitelist both the naked domain and the `www` subdomain.

Update `CORS_ORIGIN` in your production environments (Render Dashboard -> Environment Variables):
```env
CORS_ORIGIN=https://raktsetu.online,https://www.raktsetu.online
```

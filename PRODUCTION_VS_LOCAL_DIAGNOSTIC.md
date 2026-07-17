# 🔍 RaktSetu — Local vs. Production Diagnostic Report
**Date:** July 18, 2026  
**Subject:** Analyzing Performance Degradation and Production-Only Bugs on `raktsetu.online`  

---

## 📊 Summary of the Problem

Developers often face the classic **"works on my machine"** phenomenon. In RaktSetu, the project runs rapidly and without errors on your local machine, but exhibits latency (slowness), timeouts, and bugs once deployed to the production environment (`raktsetu.online`).

This report details the architectural, network, and environmental reasons behind this difference and provides recommendations to align production performance with local performance.

---

## 1. 🌐 Network Latency & Multi-Region "Round-Trips"

### The Local Environment (Zero Latency)
* Locally, your React frontend, Express backend, Python AI service, and MySQL database all reside on the **same physical machine** (localhost).
* Network requests have an average round-trip time (RTT) of **< 1ms**.
* If a backend route performs 3 sequential database queries, the total network overhead is `3 × 0.5ms = 1.5ms`.

### The Production Environment (High Latency)
* **Client (India):** The user browsing the website is in India.
* **Server (Render Free Tier):** Typically hosted in the United States (Oregon/Ohio) or Europe (Frankfurt) due to free tier location availability.
* **Database (Aiven MySQL / TiDB Cloud):** Hosted in another region (e.g., AWS us-east-1).
* **The Math of Slowness:**
  1. **Frontend to Backend Request:** Travels from India to the US server (**~150–250ms RTT**).
  2. **Backend to Database Queries:** Travels from Render to Aiven/TiDB (**~10–50ms RTT** per query).
  3. If a route makes 4 sequential database queries without caching or parallelization, the backend blocks for `4 × 30ms = 120ms` just waiting for data.
  4. Total time before the user sees a response: `200ms (to server) + 120ms (queries) + 200ms (back to client) = 520ms`.
  5. If the Flask AI service is called sequentially, add another **100–300ms** of inter-service network overhead.

---

## 2. ⚡ Resource Constraints & Cold Starts (Render Free Tier)

### Local Machine (High Capacity)
* Your local MacBook Air (M1/M2/M3) has **8GB to 16GB of RAM** and multiple high-performance CPU cores.
* Running CPU-heavy operations (like fitting the Prophet forecasting model) takes less than a second.

### Production Server (Severely Throttled)
* **Cold Starts (Spin Down):** Render’s free tier automatically spins down web services after **15 minutes of inactivity**. The first user visiting the site triggers a boot from scratch, causing a **30-second to 1-minute delay** where the website appears frozen or returns `504 Gateway Timeout`.
* **RAM Cap (512MB Limit):** Render free tier limits memory to **512MB**. 
  * Running Node.js, Gunicorn/Python, Pandas, and Prophet in a single container easily exceeds 512MB under load.
  * When memory usage crosses 512MB, Render’s supervisor instantly terminates the process (**OOM Kill**), resulting in a `502 Bad Gateway` error for users.
* **CPU Throttling:** Free instances get shared, heavily throttled CPU cycles. A Prophet model fit that takes `0.5s` locally can take `10s` on Render, exceeding Nginx's timeout thresholds.

---

## 3. 🔐 Production Security Enforcement (CORS, SSL, JWT)

Locally, settings are relaxed (`NODE_ENV=development`). In production (`NODE_ENV=production`), strict security protocols are enforced:

### SSL Handshakes
* Production MySQL requires SSL certificate validation (`rejectUnauthorized: true`). The SSL handshake adds another **~50-100ms** to connection initialization. If connection pooling is misconfigured or connections are established on-demand, this handshake repeats on every API request.

### CORS Blockages
* In development, CORS allows wildcard access or broad localhost port listings. 
* In production, CORS strictly enforces the `CORS_ORIGIN` env variable. If the frontend redirects or uses a subdomain (e.g., `www.raktsetu.online` instead of `raktsetu.online`) that is not whitelisted, the browser blocks the request with a **CORS Network Error**, which never occurs locally.

### Production JWT Verification
* In production, JWT token signatures are verified strictly. If the token expires or if server clocks are slightly out of sync (causing `iat` validation failures), the backend throws `401 Unauthorized` errors, resulting in sudden logouts.

---

## 4. 🛠️ External Service Failures (OTP and Emails)

* **Locally:** OTP verification is bypassed or uses simulated mock outputs (like logs or TOTP defaults of `123456`).
* **Production:** The system attempts to trigger real external APIs (Resend for welcome emails, Twilio/Msg91 for OTPs).
* **Why it fails in Production:** If the API keys in your production environment variables (`EMAIL_API_KEY`, `TWILIO_ACCOUNT_SID`) are expired, incorrect, or unpaid, the registration and login flows will throw unhandled server errors (500) and fail in production while working perfectly in local mock environments.

---

## 🚀 Priority Action Plan to Match Local Performance

To make `raktsetu.online` run as fast and stably as your local machine, apply the following fixes:

1. **Pre-calculate and Cache AI Forecasts:**
   * Never train/fit the Prophet model on a live request.
   * Train models nightly as a cron job, write results to a database table, and serve read-only predictions to the frontend instantly.
2. **Move to a Closer Region:**
   * Migrate your database and backend servers to an **Asia-Pacific (Mumbai/Singapore)** region to reduce network RTT from 200ms to < 30ms.
3. **Upgrade Render Tier / Add Keep-Alives:**
   * Upgrade to Render's starter tier ($7/month) to disable spin-downs and double RAM to 512MB/1GB.
   * If keeping the free tier, ensure the backend self-ping scheduler is running (pings `/health` every 14 minutes to keep the container awake).
4. **Implement Production Caching:**
   * Deploy a Redis instance (e.g., Upstash Redis) to cache static lists (districts, hospitals, camp details) so the backend does not query MySQL on every page load.
5. **Widen CORS Whitelists:**
   * Explicitly configure `CORS_ORIGIN` to include all variations of your domain: `https://raktsetu.online,https://www.raktsetu.online`.

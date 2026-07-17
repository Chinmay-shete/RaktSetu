# Phase 4: Step-by-Step Clean Redeployment Guide

Follow these instructions to redeploy all services for free in the correct order.

---

## A) Aiven MySQL (Free Tier)
Create a new MySQL database service on Aiven's free tier. Here is how to configure it:

1.  Log in to the **Aiven Console** (https://console.aiven.io) (e.g., using your friend's new account).
2.  Click **Create Service** → select **MySQL**.
3.  Choose the **Free tier** plan and select a cloud region closest to where you will deploy Render (e.g., `Singapore` or `Frankfurt`).
4.  Wait a few minutes for the service status to show **Running**.
5.  Under the **Overview** tab, copy the connection credentials:
    *   **Host (Connection URI)**
    *   **Port**
    *   **User** (default: `avnadmin`)
    *   **Password**
    *   **Database Name** (default: `defaultdb`)
6.  *Note:* You do NOT need to manually run any SQL imports or schemas against the new database. The new backend startup script automatically creates all tables, applies migrations, and seeds the default admin users on launch.

---

## B) Render — Node.js Backend (Free Web Service)

1.  Log in to the **Render Dashboard** (https://dashboard.render.com).
2.  Click **New +** → select **Web Service**.
3.  Connect your GitHub repository.
4.  Set the following settings:
    *   **Name:** `raktsetu-backend`
    *   **Environment:** `Node`
    *   **Region:** Select the region closest to your Aiven MySQL database (e.g., `Singapore` or `Frankfurt`).
    *   **Branch:** `main`
    *   **Base Directory:** `backend`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
    *   **Instance Type:** `Free`
5.  Click **Advanced** and add the following **Environment Variables**:
    *   `PORT` = `5000`
    *   `NODE_ENV` = `production`
    *   `DB_HOST` = `mysql-raktsetu-raktsetu69.j.aivencloud.com`
    *   `DB_PORT` = `15490`
    *   `DB_USER` = `avnadmin`
    *   `DB_PASSWORD` = `<your-aiven-password>`
    *   `DB_NAME` = `defaultdb`
    *   `DB_SSL` = `true`
    *   `DB_SSL_REJECT_UNAUTHORIZED` = `false`
    *   `DB_POOL_SIZE` = `30`
    *   `DB_READ_POOL_SIZE` = `30`
    *   `JWT_SECRET` = `66c5d1faee1bc4229983fcf64562c129e924a9a089d31154c1f2e1a38f32bc42`
    *   `JWT_REFRESH_SECRET` = `a9e144a1f33f993d0c2ee1ae6e745678cd1faee1bc4229983fcf64562c129e92`
    *   `JWT_OTP_SECRET` = `9d1e3a4bcf64562c129e924a9a089d31154c1f2e1a38f32bc42a6d1681eae2ff`
    *   `CORS_ORIGIN` = `https://raktsetu.online,https://www.raktsetu.online`
    *   `AI_SERVICE_URL` = `https://raktsetu-ai.onrender.com`
    *   `INTERNAL_API_SECRET` = `3d9f859597cf64562c129e924a9a089d31154c1f2e1a38f32bc42a6d1681eae`
    *   `EMAIL_API_KEY` = *(your Resend API key)*
    *   `EMAIL_FROM_ADDRESS` = `[email protected]`
    *   `ALLOW_PRODUCTION_SEED` = `true`
6.  Click **Create Web Service**.
7.  **SSL Verification:** Check Render's logs. You should see `Database connection pool established successfully` and `All migrations already applied.`

---

## C) Render — Python AI Service (Free Web Service)

1.  Click **New +** → select **Web Service** on Render.
2.  Connect your GitHub repository.
3.  Set the following settings:
    *   **Name:** `raktsetu-ai`
    *   **Environment:** `Python`
    *   **Region:** Same region as your Node.js backend.
    *   **Branch:** `main`
    *   **Base Directory:** `backend/ai`
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `gunicorn -c gunicorn.conf.py app:app`
    *   **Instance Type:** `Free`
4.  Add the following **Environment Variables**:
    *   `PORT` = `10000`
    *   `FLASK_ENV` = `production`
    *   `DB_HOST` = `mysql-raktsetu-raktsetu69.j.aivencloud.com`
    *   `DB_PORT` = `15490`
    *   `DB_USER` = `avnadmin`
    *   `DB_PASSWORD` = `<your-aiven-password>`
    *   `DB_NAME` = `defaultdb`
    *   `DB_SSL` = `true`
    *   `DB_SSL_REJECT_UNAUTHORIZED` = `false`
    *   `INTERNAL_API_SECRET` = `3d9f859597cf64562c129e924a9a089d31154c1f2e1a38f32bc42a6d1681eae`
5.  Click **Create Web Service**.
6.  **Health Check:** Access `https://raktsetu-ai.onrender.com/api/v1/health` in your browser once deployment finishes. It should return a JSON status of `healthy`.

---

## D) Vercel — Frontend (Free Tier)

1.  Log in to the **Vercel Dashboard** (https://vercel.com).
2.  Click **Add New...** → **Project**.
3.  Import your GitHub repository.
4.  Set the following settings:
    *   **Root Directory:** `frontend`
    *   **Framework Preset:** `Vite`
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
5.  Add the following **Environment Variables**:
    *   `VITE_API_URL` = `https://<node-backend>.onrender.com/api/v1` *(your Render Node backend URL)*
    *   `VITE_API_BASE_URL` = `https://<node-backend>.onrender.com/api/v1`
    *   `VITE_FIREBASE_API_KEY` = *(your Firebase Web API Key)*
    *   `VITE_FIREBASE_AUTH_DOMAIN` = *(your Firebase project domain)*
    *   `VITE_FIREBASE_PROJECT_ID` = *(your Firebase project ID)*
    *   `VITE_FIREBASE_STORAGE_BUCKET` = *(your Firebase storage bucket)*
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID` = *(your Firebase messaging sender ID)*
    *   `VITE_FIREBASE_APP_ID` = *(your Firebase app ID)*
6.  Click **Deploy**.

---

## E) Hostinger Domain DNS
Point your Hostinger domain to Vercel and Render services:

1.  Log in to **Hostinger hPanel** → **DNS / Nameservers** page for `<yourdomain>.online`.
2.  Add/modify the following records to point to your **Vercel Frontend**:
    *   **Type:** `A` | **Name:** `@` | **Points to:** `76.76.21.21` | **TTL:** `Default`
    *   **Type:** `CNAME` | **Name:** `www` | **Points to:** `cname.vercel-dns.com` | **TTL:** `Default`
3.  Add the following record to point to your **Render Backend** under a subdomain:
    *   **Type:** `CNAME` | **Name:** `api` | **Points to:** `raktsetu-backend.onrender.com` *(your Node backend Render URL)*
    *   *Note:* Ensure you add `https://api.<yourdomain>.online` to the `CORS_ORIGIN` env variable in the Node backend on Render.
4.  Configure Vercel custom domain:
    *   In the Vercel project dashboard → **Settings** → **Domains**.
    *   Add `<yourdomain>.online` and `www.<yourdomain>.online`. Vercel will automatically verify the records.

---

## F) Resend Email Domain Setup
To send transactional OTP emails from `[email protected]<yourdomain>.online`:

1.  Log in to **Resend Dashboard** (https://resend.com) → **Domains**.
2.  Click **Add Domain** → enter `<yourdomain>.online` and select your region.
3.  Resend will display **3 DNS records** (DKIM, SPF, MX). Copy them.
4.  Go to **Hostinger DNS / Nameservers** and add these records exactly:
    *   **DKIM (TXT):** Host: `resend._domainkey` | Value: `...`
    *   **SPF (TXT):** Host: `@` | Value: `v=spf1 include:feedback.resend.com ~all`
    *   **MX:** Host: `feedback` | Points to: `feedback.resend.com` | Priority: `10`
5.  Wait 2–5 minutes and click **Verify** in Resend. It should show a green **Verified** badge.

### 📧 Resend Delivery Test Script
Once deployed, you can verify Resend delivery by hitting your Node backend API. Log in as System Admin and test from the console, or execute this test script locally:

```bash
# Set your production Resend API key and execute this to verify email sending:
RESEND_API_KEY="re_..." EMAIL_FROM_ADDRESS="[email protected]<yourdomain>.online" node -e "
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
resend.emails.send({
  from: process.env.EMAIL_FROM_ADDRESS,
  to: 'your-personal-email@example.com',
  subject: 'RaktSetu Resend Integration Test',
  html: '<p>Resend is integrated and sending successfully! 🎉</p>'
}).then(res => console.log('Email sent:', res))
  .catch(err => console.error('Email failed:', err));
"
```

---

### **Phase 4 is complete.** Please confirm once all services are redeployed and verified so we can run Phase 5.

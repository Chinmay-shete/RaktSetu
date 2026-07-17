# RaktSetu — Automated Production Fix Guide
**Last Updated:** 2026-07-17 | **All code is already pushed to GitHub (`main` branch)**

---

> [!IMPORTANT]
> The database migration and database seeding are now **fully automated** on startup!
> When the backend restarts on Render, it will automatically connect to your Aiven MySQL database, apply the latest migrations (adding missing columns like `address` and `district`), and seed missing system accounts and hospitals.
> **You do NOT need any SSH shell command access on Render (which is a paid feature).**

---

## How to Apply the Fix to Production

### Step 1: Trigger a Deploy on Render
1. Go to your **Render Dashboard** (https://dashboard.render.com).
2. Select your **raktsetu-backend** (or Web Service) project.
3. Click the **Manual Deploy** button at the top right, and choose **Clear build cache & deploy** (or just **Deploy latest commit**).
4. Render will pull the latest code from GitHub and start the server. During startup, it will run the migrations and seeds automatically. You can watch this in the **Logs** tab of Render!

---

## Verification Checklist

Open your browser to the production website (`raktsetu.online`) and verify:

1. **SPA Routing / Login Page:**
   - Go to `https://raktsetu.online/login` — it should load successfully (no 404 error).
   
2. **System Admin Login:**
   - Email: `system@raktsetu.gov`
   - Password: `password123`
   - Should log in successfully and load the system administrator dashboard.

3. **Hospital Admin Login:**
   - Email: `hospital_admin@example.com`
   - Password: `password123`
   - Should log in successfully and load the KEM Hospital Pune dashboard.

4. **Donor Portal Profile & Location Save:**
   - Register or login as a donor.
   - Proceed through the steps, set location, and click the final step.
   - It should successfully transition to the dashboard without showing "Failed to save profile".

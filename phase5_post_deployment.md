# Phase 5: Post-Deployment Verification & Rollback Plan

Follow these steps once all services have been redeployed to confirm the system is healthy and fully operational on your live `<yourdomain>.online` domain.

---

## 1. Live Domain End-to-End Verification

Perform these steps directly on the live website to verify core functionality:

1.  Open your browser and navigate to `https://<yourdomain>.online/register-donor`.
2.  Enter a test email address (e.g., `[email protected]`) and click **Send OTP**.
3.  Because Resend is active, check your inbox for the OTP code. (If using development keys or sandbox, check the Render backend logs for the generated OTP code).
4.  Enter the 6-digit OTP code to verify and proceed to the password creation step.
5.  Set a secure password and click **Complete Registration**.
6.  You will be redirected to the login page. Enter your email and password, then click **Login**.
7.  Proceed through the profile setup step: Enter Name, Age, Blood Group, Weight, and click **Next**.
8.  On the location screen, allow browser geolocation access (or enter Pune/Mumbai manually), then click **Final Step: Dashboard**.
9.  Verify you are redirected to the Dashboard and no `"Failed to save profile"` alert appears.
10. Click **Refresh** or reload the page. Confirm all dashboard stats (Total Donations, Lives Impacted, Next Eligible Date) load and display your data correctly.

---

## 2. Page Load Time Testing

Assess the load speeds using Chrome DevTools:

1.  Open Chrome DevTools (press `F12` or `Cmd + Option + I`).
2.  Go to the **Network** tab and check **Disable cache**.
3.  Reload the page and check the bottom stats bar:
    *   **DOMContentLoaded:** Should be `< 1.2s` (time to load structure).
    *   **Load:** Should be `< 2.5s` (assets and images loaded).
4.  **Note on Cold Starts:** If the website has not been accessed for 15 minutes, the very first API call will take `30–60s` due to Render's free tier sleep behavior. Once active, subsequent requests will resolve instantly (under `150ms`).
5.  *Alternative:* Run a test on **Google PageSpeed Insights** (https://pagespeed.web.dev) using `https://<yourdomain>.online` to evaluate Core Web Vitals.

---

## 3. Transactional Email Verification

Confirm the Resend integration by triggering a system email:

1.  Log in to your dashboard as the Hospital Administrator (`[email protected]` / `password123`).
2.  Go to the **Staff Management** or **Invite Staff** page.
3.  Enter a real email address you own, choose a staff role, and click **Send Invite**.
4.  Verify that an invitation email containing the initial password and setup link is delivered to your inbox from `[email protected]<yourdomain>.online`.

---

## 4. Rollback Plan

If any critical features fail post-deployment, execute these steps immediately to return to a stable state:

### A) Vercel Frontend Rollback
If the new frontend build contains visual bugs or client-side crashes:
1.  Go to the **Vercel Dashboard** → select your project.
2.  Navigate to the **Deployments** tab.
3.  Locate the previous stable deployment.
4.  Click the **three dots (...)** next to it and select **Promote to Production**. Vercel will instantly route traffic back to the old stable build without requiring a rebuild.

### B) Render Backend / AI Service Rollback
If the live server crashes or fails to connect to the database:
1.  Go to **Render Dashboard** → select `raktsetu-backend` or `raktsetu-ai`.
2.  Go to the **Events** or **Deployments** tab.
3.  Click the previous successful deployment and select **Rollback to this deploy**.
4.  *Alternative:* If the issue is related to the database connection, verify that `DB_SSL=true` and `DB_SSL_REJECT_UNAUTHORIZED=false` are correctly set in the environment variables, then click **Manual Deploy** → **Clear build cache & deploy**.

### C) DNS Records Rollback
If the custom domain stops resolving or returns routing errors:
1.  Go to **Hostinger hPanel** → **DNS / Nameservers**.
2.  If the custom domain doesn't load Vercel, restore Hostinger's default nameservers.
3.  Confirm that Vercel configuration has not been modified. If necessary, remove the custom domain from Vercel and access the frontend via the default `.vercel.app` subdomain to verify if the Vercel hosting instance itself is functional.

---

### **Phase 5 is complete.** Please perform these checks and keep this rollback plan handy for reference.

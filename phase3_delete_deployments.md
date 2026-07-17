# Phase 3: Deleting Old Deployments & DNS Cleanup

This document outlines the manual steps to delete your old services and clean up your DNS records.

---

## 1. Render Services Deletion
Perform these steps for both the **Node.js Backend** and **Python AI Service** on Render:

1.  Log in to the **Render Dashboard** (https://dashboard.render.com).
2.  Click on the Web Service you want to delete (e.g., `raktsetu-api`).
3.  Navigate to the **Settings** tab in the service sub-menu.
4.  Scroll to the very bottom of the page to the section marked with red borders.
5.  Click the **Delete Web Service** button.
6.  Confirm the deletion by typing the name of the service when prompted, and click **Delete**.
7.  Repeat this process for the Python AI Web Service (e.g., `raktsetu-ai`).

---

## 2. Vercel Project Deletion
Perform these steps to delete your old Vercel project:

1.  Log in to the **Vercel Dashboard** (https://vercel.com).
2.  Select the Vercel project containing your old frontend deployment.
3.  Click the **Settings** tab at the top of the project view.
4.  Ensure **General** is selected in the left sidebar.
5.  Scroll to the very bottom of the page to the **Delete Project** section.
6.  Click **Delete**.
7.  Type the name of the project to confirm, and click the final **Delete** button.

---

## 3. Database Recommendation (Aiven MySQL)
> [!IMPORTANT]
> **Recommendation:** Keep and REUSE your existing Aiven MySQL instance. Do NOT delete or recreate it.

### Why?
1.  **Free Service Limits:** Aiven limits accounts to **one active free service**. Deleting and recreating the service can trigger service creation delays or limits.
2.  **No Configuration Overhead:** Reusing the database means you do not have to update hostnames, credentials, or re-download CA certificates.
3.  **Automatic Synchronization:** The new backend code runs `run_migrations.js` and `safe_seed.js` automatically on startup. When you redeploy the backend, it will automatically configure the missing tables, add new columns (`address`/`district`), add indexes, and restore default admin users safely without deleting any data.

---

## 4. Hostinger DNS Cleanup
To prevent routing issues, remove old DNS records pointing to previous deployments before setting up Vercel/Render:

1.  Log in to your **Hostinger Account** (https://hpanel.hostinger.com).
2.  Go to the **Domains** section and select your `<yourdomain>.online` domain.
3.  Click on **DNS / Nameservers** in the left menu.
4.  Locate and **Delete** any old records pointing to Vercel or Render:
    *   Any `A` record pointing to Vercel's IP (`76.76.21.21`).
    *   Any `CNAME` record for `www` pointing to `cname.vercel-dns.com`.
    *   Any `CNAME` or `A` records for `api` pointing to Render (`onrender.com` or static IPs).

---

### **Phase 3 is complete.** Please follow these steps and confirm when you are ready to proceed with Phase 4 (Redeploy).

# 🩸 RaktSetu — Complete Deployment Guide
**Version:** 1.0  
**Date:** July 12, 2026  
**Developer:** Solo · Zero-Budget · First Deployment  
**Stack:** React/Vite · Node.js/Express · Python Flask · MySQL · Redis  

---

## 🗺️ Deployment Architecture Overview

Below is the network topology and service layout for **RaktSetu** in production:

```
                  +-----------------------------------+
                  |      User's Browser (Client)      |
                  +-----------------+-----------------+
                                    |
                        HTTPS (Port 443 / CDN)
                                    |
                                    v
                  +-----------------+-----------------+
                  |      Vercel / Nginx (Frontend)    |
                  +-----------------+-----------------+
                                    |
                         API Requests (REST)
                                    |
                                    v
                  +-----------------+-----------------+
                  |      Node.js Express (Backend)     |
                  +-------+---------+--------+--------+
                          |         |        |
         MySQL (Port 3306)|         |        | Redis (Port 6379)
                          |         |        |
                          v         |        v
    +---------------------+---+     |  +-----+-----------------+
    |  MySQL (Primary DB)     |     |  |  Redis (Cache/Session)|
    +-------------------------+     |  +-----------------------+
                                    |
                         HTTP POST  | (Port 5000 / Celery Broker)
                                    v
                  +-----------------+-----------------+
                  |     Python Flask (AI Service)     |
                  +-----------------+-----------------+
                                    |
                             Celery background
                                    |
                                    v
                  +-----------------+-----------------+
                  |       Celery Worker Daemon        |
                  +-----------------------------------+
```

---

## ☁️ Option A: 100% Free-Tier Cloud Deployment

For student and solo developers starting with zero budget, RaktSetu can be deployed entirely for free using modern serverless platforms.

### 1. Database — TiDB Cloud Serverless (5GB Free)
1. Sign up at [TiDB Cloud](https://tidbcloud.com/).
2. Create a free **Serverless Cluster**.
3. Under the **Connect** tab, copy your connection details:
   - **Host:** e.g., `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
   - **Port:** `4000`
   - **User:** e.g., `xxxxxx.root`
   - **Password:** `[YourPassword]`
   - **Database Name:** `raktsetu`

### 2. Cache — Upstash Redis (10,000 requests/day Free)
1. Sign up at [Upstash](https://upstash.com/).
2. Create a **Redis Database**.
3. Select the closest region (e.g., `ap-south-1` for India).
4. Under the **Connection Details** tab, copy the **Redis URI**:
   - `rediss://default:password@endpoint.upstash.io:6379`

### 3. AI Service — Railway or Render (Free Python Runtime)
1. Sign up at [Render](https://render.com/).
2. Click **New +** -> **Web Service** and connect your GitHub repository.
3. Set the following configuration:
   - **Name:** `raktsetu-ai`
   - **Language:** `Python`
   - **Root Directory:** `backend/ai`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
4. Add the following **Environment Variables** in the UI:
   - `PORT`: `5001`
   - `REDIS_URL`: `rediss://default:password@endpoint.upstash.io:6379`
   - `DB_HOST`: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
   - `DB_PORT`: `4000`
   - `DB_USER`: `xxxxxx.root`
   - `DB_PASSWORD`: `[YourPassword]`
   - `DB_NAME`: `raktsetu`
5. Deploy and copy the public URL (e.g., `https://raktsetu-ai.onrender.com`).

### 4. Express Backend — Render (Free Node Web Service)
1. Click **New +** -> **Web Service** on Render and connect your repository.
2. Set configuration:
   - **Name:** `raktsetu-backend`
   - **Language:** `Node`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. Add **Environment Variables**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `DB_HOST`: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
   - `DB_PORT`: `4000`
   - `DB_USER`: `xxxxxx.root`
   - `DB_PASSWORD`: `[YourPassword]`
   - `DB_NAME`: `raktsetu`
   - `REDIS_URL`: `rediss://default:password@endpoint.upstash.io:6379`
   - `JWT_SECRET`: `[Generate a secure 32-character string]`
   - `JWT_REFRESH_SECRET`: `[Generate a secure 32-character string]`
   - `JWT_OTP_SECRET`: `[Generate a secure 32-character string]`
   - `AI_SERVICE_URL`: `https://raktsetu-ai.onrender.com`
   - `CORS_ORIGIN`: `https://raktsetu.vercel.app`
   - `EMAIL_API_KEY`: `[Your Resend API Key]`
   - `EMAIL_FROM_ADDRESS`: `onboarding@resend.dev`
4. Deploy and copy the API endpoint (e.g., `https://raktsetu-backend.onrender.com`).

### 5. React Frontend — Vercel (Free React Host)
1. Sign up at [Vercel](https://vercel.com/) and link your repository.
2. Select the `/frontend` folder as the **Root Directory**.
3. Set **Framework Preset** to `Vite`.
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://raktsetu-backend.onrender.com/api/v1`
   - `VITE_API_BASE_URL`: `https://raktsetu-backend.onrender.com/api/v1`
5. Click **Deploy**. Vercel will build the files and serve them over a globally fast CDN.

---

## 🖥️ Option B: Cheap VPS Deployment (DigitalOcean / Hetzner)

A single $4/month VPS (1 vCPU, 1GB RAM) running Ubuntu 22.04 LTS can host all five services using PM2, local MySQL, Redis, Nginx, and systemd.

### 1. Server Provisioning & Initial Setup
Log into your VPS via SSH and update package lists:
```bash
ssh root@your_vps_ip
sudo apt update && sudo apt upgrade -y
```

### 2. Install and Secure MySQL Database
Install MySQL Server:
```bash
sudo apt install mysql-server -y
```
Secure the installation and configure password parameters:
```bash
sudo mysql_secure_installation
```
Log in to MySQL as root:
```bash
sudo mysql
```
Execute these SQL commands inside the MySQL shell to create the database, user, and schema:
```sql
CREATE DATABASE raktsetu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'raktsetu_user'@'localhost' IDENTIFIED BY 'a_very_strong_password_123';
GRANT ALL PRIVILEGES ON raktsetu.* TO 'raktsetu_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
Import the schema files:
```bash
mysql -u raktsetu_user -p raktsetu < /var/www/RaktSetu/backend/models/migrations/001_initial_schema.sql
```

### 3. Install and Configure Redis
Install Redis server:
```bash
sudo apt install redis-server -y
```
Open the Redis configuration file:
```bash
sudo nano /etc/redis/redis.conf
```
Change `supervised no` to `supervised systemd`. Save and close the file, then restart Redis:
```bash
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### 4. Install Node.js & Set Up PM2 Backend Daemon
Install Node.js LTS (v20+):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
Install PM2 globally:
```bash
sudo npm install -g pm2
```
Navigate to your backend directory and run dependencies setup:
```bash
cd /var/www/RaktSetu/backend
npm install --production
```
Configure backend env parameters:
```bash
nano .env
```
Paste these variables:
```env
PORT=5000
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=raktsetu_user
DB_PASSWORD=a_very_strong_password_123
DB_NAME=raktsetu
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your_jwt_secret_key_here_must_be_at_least_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_must_be_at_least_32_chars
JWT_OTP_SECRET=your_jwt_otp_secret_key_here_must_be_at_least_32_chars
CORS_ORIGIN=https://raktsetu.org
AI_SERVICE_URL=http://127.0.0.1:5001
EMAIL_API_KEY=re_your_api_key_here
EMAIL_FROM_ADDRESS=onboarding@resend.dev
```
Start backend processes using PM2:
```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

### 5. Set Up Python Flask & Celery AI Daemon
Install Python, virtual environment builders, and build dependencies:
```bash
sudo apt install python3 python3-pip python3-venv build-essential libssl-dev libffi-dev python3-dev -y
```
Navigate to `/var/www/RaktSetu/backend/ai` and initialize environment:
```bash
cd /var/www/RaktSetu/backend/ai
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```
Create the AI environment file:
```bash
nano .env
```
Paste these variables:
```env
FLASK_ENV=production
FLASK_DEBUG=0
AI_PORT=5001
REDIS_URL=redis://127.0.0.1:6379
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=raktsetu_user
DB_PASSWORD=a_very_strong_password_123
DB_NAME=raktsetu
```

#### Define the Systemd Services for Flask & Celery Worker
Create a systemd unit file for the Flask API service:
```bash
sudo nano /etc/systemd/system/raktsetu-ai.service
```
Paste this configuration:
```ini
[Unit]
Description=RaktSetu Flask AI Service
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/RaktSetu/backend/ai
EnvironmentFile=/var/www/RaktSetu/backend/ai/.env
ExecStart=/var/www/RaktSetu/backend/ai/.venv/bin/gunicorn --config gunicorn.conf.py app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Create a systemd unit file for the Celery task runner daemon:
```bash
sudo nano /etc/systemd/system/raktsetu-celery.service
```
Paste this configuration:
```ini
[Unit]
Description=RaktSetu Celery Background Worker
After=network.target redis-server.service

[Service]
User=root
WorkingDirectory=/var/www/RaktSetu/backend/ai
EnvironmentFile=/var/www/RaktSetu/backend/ai/.env
ExecStart=/var/www/RaktSetu/backend/ai/.venv/bin/celery -A tasks.celery_app worker --loglevel=info
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the services:
```bash
sudo systemctl daemon-reload
sudo systemctl start raktsetu-ai raktsetu-celery
sudo systemctl enable raktsetu-ai raktsetu-celery
```

### 6. Build the Frontend Assets
Navigate to `/var/www/RaktSetu/frontend`:
```bash
cd /var/www/RaktSetu/frontend
npm install
```
Create a `.env.production` file:
```bash
nano .env.production
```
Paste:
```env
VITE_API_URL=https://raktsetu.org/api/v1
VITE_API_BASE_URL=https://raktsetu.org/api/v1
```
Build Vite assets:
```bash
npm run build
```
This generates static compiled files in `/var/www/RaktSetu/frontend/dist`.

### 7. Configure Nginx Reverse Proxy & SSL (Let's Encrypt)
Install Nginx and Certbot:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```
Create an Nginx configuration file for RaktSetu:
```bash
sudo nano /etc/nginx/sites-available/raktsetu
```
Paste this server configuration:
```nginx
server {
    listen 80;
    server_name raktsetu.org www.raktsetu.org;

    # Static Frontend
    location / {
        root /var/www/RaktSetu/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend Proxy
    location /api/v1 {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static uploads (Hospital licenses)
    location /uploads {
        alias /var/www/RaktSetu/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```
Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/raktsetu /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```
Obtain a free SSL certificate from Let's Encrypt:
```bash
sudo certbot --nginx -d raktsetu.org -d www.raktsetu.org
```

---

## 🔍 Post-Deployment Verification Tests

Confirm everything is fully active by running these commands on your VPS server:

### 1. Check Service Statuses
* **Check Node.js / PM2:**
  ```bash
  pm2 status
  ```
* **Check Flask Service:**
  ```bash
  sudo systemctl status raktsetu-ai
  ```
* **Check Celery Background Worker:**
  ```bash
  sudo systemctl status raktsetu-celery
  ```
* **Check MySQL Database Connection:**
  ```bash
  mysqladmin -u raktsetu_user -p ping
  ```

### 2. Verify REST APIs via cURL
Run a test request against the backend server's health check route:
```bash
curl -i https://raktsetu.org/api/v1/health
```
**Expected JSON response:**
```json
{
  "status": "UP",
  "database": "CONNECTED",
  "redis": "CONNECTED"
}
```
Validate that the Flask AI service is active and listening locally:
```bash
curl -i http://127.0.0.1:5001/api/v1/forecast/status/test-task-id
```
**Expected Response:** `200 OK` or `404 Not Found` (representing Celery integration status rather than a gateway connection timeout).

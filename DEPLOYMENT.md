# 🚀 Nova Credit - Cloud Deployment Guide

This guide will help you deploy your application to the cloud for **free** and keep it running **24/7** with a **custom domain**.

## Prerequisites
- [GitHub Account](https://github.com)
- [Vercel Account](https://vercel.com) (Log in with GitHub)
- [Turso Account](https://turso.tech) (Log in with GitHub)

---

## Step 1: Push Code to GitHub
Since you want to move off your laptop, the code needs to live in a repository.

1.  Create a **new repository** on GitHub (e.g., `nova-credit`).
2.  Run these commands in your terminal (inside the project folder):
    ```bash
    git init
    git add .
    git commit -m "Initial commit for cloud deployment"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/nova-credit.git
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` with your actual GitHub username)*

---

## Step 2: Set up Turso Database
Turso provides a free, persistent SQLite database in the cloud.

1.  **Install the Turso CLI** (if you haven't):
    ```bash
    brew install tursodatabase/tap/turso
    ```
2.  **Login to Turso**:
    ```bash
    turso auth login
    ```
3.  **Create a Database**:
    ```bash
    turso db create nova-credit-db
    ```
4.  **Get the Database URL**:
    ```bash
    turso db show nova-credit-db --url
    ```
    *Copy this URL (starts with `libsql://`). You'll need it for Vercel.*
5.  **Create an Auth Token**:
    ```bash
    turso db tokens create nova-credit-db
    ```
    *Copy this long string. You'll need it for Vercel.*

---

## Step 3: Deploy to Vercel
Vercel will host your Node.js backend and frontend.

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `nova-credit` repository from GitHub.
4.  **Configure Project**:
    *   **Framework Preset**: Select `Other` (or leave default, Vercel detects `package.json`).
    *   **Root Directory**: `./` (default).
    *   **Environment Variables**: Expand this section and add:
        *   `TURSO_DATABASE_URL`: Paste the URL from Step 2.4.
        *   `TURSO_AUTH_TOKEN`: Paste the Token from Step 2.5.
        *   `JWT_SECRET`: Enter a secure random string (e.g., `my-super-secret-key-123`).
5.  Click **"Deploy"**.

---

## Step 4: Verify & Custom Domain
1.  Wait for the deployment to finish (usually < 1 minute).
2.  Click on the **Domain** provided by Vercel (e.g., `nova-credit.vercel.app`).
3.  **Test it**: Try registering a new user. If it works, your database is connected!
4.  **Custom Domain**:
    *   Go to **Settings** -> **Domains** in your Vercel project.
    *   Enter your custom domain (e.g., `novacredit.com`).
    *   Follow the DNS instructions provided by Vercel to update your domain registrar (GoDaddy, Namecheap, etc.).

---

## ☁️ You are now fully cloud-native!
You can close your laptop. The app is running on Vercel's servers and the data is safe in Turso's cloud.

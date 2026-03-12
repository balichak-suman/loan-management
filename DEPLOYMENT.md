# 🚀 Nova Credit - Cloud Deployment Guide

This guide will help you deploy your application to the cloud for **free** and keep it running **24/7** with a **custom domain**.

## Prerequisites
- [GitHub Account](https://github.com)
- [Render Account](https://render.com) (Log in with GitHub)
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
    *Copy this URL (starts with `libsql://`). You'll need it for Render.*
5.  **Create an Auth Token**:
    ```bash
    turso db tokens create nova-credit-db
    ```
    *Copy this long string. You'll need it for Render.*

---

## Step 3: Set up Brevo for Email OTPs
Since registration requires OTPs, you need an email service.

1.  Sign up for a free account at [Brevo (formerly Sendinblue)](https://www.brevo.com/).
2.  Go to **SMTP & API** settings and generate a new **API Key**.
3.  Go to **Senders & IP** and verify the email address you want to send from (e.g., your personal email).
4.  Copy the **API Key** and the **Sender Email**. You'll need these for Step 4.

---

## Step 4: Deploy to Render
Render will host your Node.js backend and frontend.

1.  Go to your [Render Dashboard](https://dashboard.render.com).
2.  Click **"New"** -> **"Web Service"**.
3.  Connect your GitHub account and select your `nova-credit` repository.
4.  **Configure Web Service**:
    *   **Name**: `nova-credit`
    *   **Region**: Select the closest one to you
    *   **Branch**: `main`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Instance Type**: `Free`
5.  **Environment Variables**: Click "Advanced" and add:
    *   `TURSO_DATABASE_URL`: Paste the URL from Step 2.4.
    *   `TURSO_AUTH_TOKEN`: Paste the Token from Step 2.5.
    *   `JWT_SECRET`: Enter a secure random string (e.g., `my-super-secret-key-123`).
    *   `BREVO_API_KEY`: Paste your API Key from Step 3.2.
    *   `BREVO_SENDER_EMAIL`: Paste your verified sender email from Step 3.3.
    *   `PORT`: `3000`
6.  Click **"Create Web Service"**.

---

## Step 5: Verify & Custom Domain
1.  Wait for the deployment to finish (it may take a few minutes on the Free plan).
2.  Click on the **URL** provided by Render (e.g., `https://nova-credit-xxxx.onrender.com`).
3.  **Test it**: Try registering a new user. If you receive an OTP in your email, everything is working!
4.  **Custom Domain**:
    *   Go to the **Settings** tab of your Web Service in Render.
    *   Scroll down to **Custom Domains** and click "Add Custom Domain".
    *   Enter your custom domain (e.g., `novacredit.com`).
    *   Follow the DNS instructions provided by Render to update your domain registrar.

---

## ☁️ You are now fully cloud-native!
You can close your laptop. The app is running on Render's servers and the data is safe in Turso's cloud.

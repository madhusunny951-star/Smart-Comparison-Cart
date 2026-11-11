# SmartCart - Grocery Price Comparison & Express Shopping Platform

SmartCart is a full-stack, professional e-commerce platform inspired by Flipkart and Amazon. It compares real-time grocery prices across **Blinkit**, **Zepto**, **Swiggy Instamart**, **BigBasket**, **DMart**, and **Flipkart**, while providing direct shopping with **Razorpay payment**, **order management**, **live delivery tracking**, and an **Admin Dashboard**.

---

## 🛠️ Step 1: Running in VS Code (Local Development)

### 1. Prerequisites
- **Node.js** (v18 or v20+ recommended)
- **Git**
- **VS Code** with recommended extensions:
  - *Tailwind CSS IntelliSense*
  - *ESLint*
  - *TypeScript and JavaScript Language Features*

### 2. Setup Project
```bash
# 1. Clone or download your repository
git clone <your-repo-url>
cd smartcart

# 2. Open in VS Code
code .

# 3. Install dependencies
npm install

# 4. Copy sample environment variables
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The app runs Express backend APIs (`/api/*`) and Vite frontend together seamlessly with hot reloading.

### 4. Build for Production
```bash
npm run build
```
This produces optimized production assets inside the `/dist` directory.

---

## 🚀 Step 2: Deploying to Netlify

Netlify is specialized for high-speed static frontend and serverless hosting.

### Method A: Connect via GitHub / GitLab (Recommended - Continuous Deployment)
1. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of SmartCart"
   git remote add origin https://github.com/your-username/smartcart.git
   git push -u origin main
   ```
2. Go to **[Netlify Dashboard](https://app.netlify.com/)** and click **"Add new site"** > **"Import an existing project"**.
3. Select your GitHub repository.
4. Netlify will automatically detect `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy SmartCart"**.

### Method B: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Backend API Architecture with Netlify:
SmartCart has an Express backend (`server.ts`) connecting to PostgreSQL. When deploying to Netlify:
1. **Frontend**: Netlify hosts the React SPA from `/dist` with the redirect rules configured in `netlify.toml`.
2. **Backend**: You can deploy `server.ts` to free backend hosts like **Render**, **Railway**, **Fly.io**, or **Google Cloud Run**, and configure the proxy in `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-backend-api.onrender.com/api/:splat"
     status = 200
     force = true
   ```

---

## 📦 Key Technologies
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, jsPDF, Canvas Confetti.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (Cloud SQL) with Drizzle ORM.
- **Authentication**: Firebase Auth (Google Sign-In) + Demo Mode.
- **Payment**: Razorpay Gateway (UPI, Cards, NetBanking, Wallets).

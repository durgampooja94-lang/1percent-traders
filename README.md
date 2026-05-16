# 1% Traders — Stock Market Learning Platform

A full-stack Next.js 14 course platform for stock market education. Built with Firebase, Razorpay, and Bunny.net.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Auth | Firebase Authentication (Phone OTP) |
| Database | Firebase Firestore |
| File Storage | Firebase Storage (thumbnails/PDFs only) |
| Video CDN | Bunny.net Stream |
| Payments | Razorpay |
| Hosting | Vercel (frontend) |
| Security | Cloudflare |

---

## Setup Instructions

### 1. Clone and install

```bash
git clone <your-repo>
cd 1percent-traders
npm install
```

### 2. Firebase setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database** (production mode)
4. Enable **Authentication → Phone** sign-in method
5. Enable **Storage**
6. Go to Project Settings → Service accounts → Generate new private key
7. Copy your web app config

### 3. Bunny.net setup

1. Sign up at [bunny.net](https://bunny.net)
2. Go to **Stream → Video Libraries → Create library**
3. In library settings, enable **Token Authentication** and copy the token key
4. Note your Library ID and CDN hostname

### 4. Razorpay setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC with your GST and bank details
3. Go to Settings → API Keys → Generate test keys
4. Set up a webhook at `https://yourdomain.com/api/razorpay/webhook`
   - Events: `payment.captured`, `payment.failed`
   - Copy the webhook secret

### 5. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

### 6. Firestore security rules

Deploy the rules:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

Or paste `firestore.rules` content directly in the Firebase Console.

### 7. Set admin role

After logging in once with your phone number, go to Firestore Console:
- Open `users` collection
- Find your user document
- Change `role` field from `"user"` to `"admin"`

### 8. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
1percent-traders/
├── app/
│   ├── (public)/          # Landing, login, courses
│   ├── (auth)/            # Dashboard, cart, learn, payment
│   ├── (admin)/           # Admin panel
│   └── api/               # API routes
├── components/
│   ├── ui/                # Button, Badge, Modal, Card, Spinner
│   ├── layout/            # Navbar, Footer
│   ├── course/            # CourseCard, VideoPlayer
│   ├── auth/              # OtpForm
│   └── checkout/          # RazorpayButton
├── lib/                   # Firebase, Bunny.net, Razorpay utils
├── hooks/                 # useAuth, useCart
├── types/                 # TypeScript types
└── firestore.rules        # Firestore security rules
```

---

## How Video Access Control Works

1. User purchases course → Razorpay webhook fires → server writes purchase record to Firestore
2. User opens course → `/api/video/signed-url` is called with Firebase ID token
3. Server verifies token → checks `users/{uid}/purchases/{courseId}` exists
4. If purchased → returns Bunny.net embed URL (domain-locked to your domain)
5. If not purchased → returns 403 Forbidden

**Course content is never unlocked from the frontend.** All access checks happen server-side.

---

## Deploying to Vercel

```bash
vercel
```

Add all `.env.local` variables to Vercel's environment variables dashboard.

---

## Adding a Course (Admin workflow)

1. Upload videos to Bunny.net → copy each Video ID
2. Log in as admin → go to `/admin/courses`
3. Click **New Course** → fill in title, description, price
4. Expand the course → **Add Playlist** (e.g. "Module 1: Basics")
5. Under each playlist → **Add Video** → paste the Bunny.net Video ID
6. Once ready → click the **eye icon** to publish

---

## Support

Contact: admin@1percenttraders.in

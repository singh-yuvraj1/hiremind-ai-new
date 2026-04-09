# 🧠 HireMind AI

> AI-Powered Interview Preparation Platform — Practice interviews, get honest AI feedback, track your improvement.

**Made with ❤️ by Yuvraj Singh** — yuvraj.singh.95928@gmail.com

---

## 📁 Folder Structure
```
hiremind-ai/
├── package.json
├── .gitignore
├── README.md
│
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ThemeToggle.jsx
│       │   ├── Footer.jsx
│       │   ├── ScoreRing.jsx
│       │   ├── AICharacter.jsx
│       │   └── InterviewCamera.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── services/
│       │   └── api.js
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Signup.jsx
│           ├── Dashboard.jsx
│           ├── Interview.jsx
│           ├── MockTest.jsx
│           ├── Feedback.jsx
│           ├── History.jsx
│           └── Profile.jsx
│
└── server/
    ├── server.js
    ├── package.json
    ├── .env
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   ├── InterviewSession.js
    │   └── MockTest.js
    ├── controllers/
    │   ├── authController.js
    │   ├── interviewController.js
    │   └── mockController.js
    ├── middleware/
    │   └── authMiddleware.js
    └── routes/
        ├── authRoutes.js
        ├── interviewRoutes.js
        └── mockRoutes.js
```

---

## ⚙️ Setup Instructions

### Step 1 — Clone or create the project
```bash
mkdir hiremind-ai
cd hiremind-ai
```

### Step 2 — Install all dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Step 3 — Setup environment variables

**Create `server/.env`**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hiremind
JWT_SECRET=change_this_to_something_long_and_random_123
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**Create `client/.env`**
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Step 4 — Run the project

Open two terminals:

**Terminal 1 — Start server**
```bash
cd server
npm run dev
```

**Terminal 2 — Start client**
```bash
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🗄️ MongoDB Setup

### Option A — Local MongoDB
1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install and start the MongoDB service
3. Use this in `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/hiremind
```

### Option B — MongoDB Atlas (Free Cloud)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and free M0 cluster
3. Click Connect → Drivers → Copy connection string
4. Use in `server/.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hiremind
```

---

## 🤖 OpenRouter AI Setup (Free)

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up for free
3. Go to Keys → Create API key
4. Add to `server/.env`:
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
```

Without this key the app still works using rule-based scoring as fallback.

---

## 🔑 Google OAuth Setup (Optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Go to APIs and Services → Credentials
4. Create OAuth 2.0 Client ID → Web application
5. Add `http://localhost:5173` to Authorized JavaScript origins
6. Copy Client ID and paste in both `.env` files

---

## 🎨 Themes Available

| Theme | Emoji | Style |
|-------|-------|-------|
| Cyber Dark | 🌑 | Default dark blue |
| Neon | 🟣 | Purple neon |
| Cyberpunk | ⚡ | Gold and red |
| Ocean | 🌊 | Blue and teal |
| Glass | 🪟 | Frosted glass |
| Light | ☀️ | Clean white |

---

## 📊 How Scoring Works

### With OpenRouter API Key
AI reads every answer and checks if it is correct and relevant.

| Answer Quality | Score |
|---------------|-------|
| Blank or no answer | 0 – 5 |
| Off-topic or wrong answer | 0 – 15 |
| Very short correct answer | 20 – 35 |
| Partial correct answer | 35 – 55 |
| Good answer with examples | 55 – 70 |
| Strong detailed answer | 70 – 82 |
| Excellent with STAR format | 82 – 92 |

### Score Categories

| Category | Weight |
|----------|--------|
| Answer Quality | 35% |
| Communication | 25% |
| Confidence | 20% |
| Posture | 20% |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Routing | React Router v6 |
| HTTP | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| OAuth | Google Identity Services |
| AI Evaluation | OpenRouter — Mistral-7B free |
| Speech Input | Web Speech API |
| Text to Speech | Web Speech Synthesis API |
| Camera | getUserMedia WebRTC |

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Upload dist folder to Vercel
```

### Backend → Render
1. Push code to GitHub
2. Connect repo to Render
3. Set environment variables in Render dashboard
4. Deploy

### Database → MongoDB Atlas
Use Atlas free tier connection string in production `.env`

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

> Built with ❤️ by **Yuvraj Singh**
> 📧 yuvraj.singh.95928@gmail.com
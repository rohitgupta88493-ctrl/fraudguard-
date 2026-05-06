# 🛡️ ShieldAI — Credit Card Fraud Detection System

A full-stack, production-ready fraud detection platform with React frontend, Node.js/Express backend, and Python FastAPI ML service.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-18+-green) ![Python](https://img.shields.io/badge/Python-3.10+-yellow) ![License](https://img.shields.io/badge/License-MIT-purple)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ShieldAI Platform                      │
├──────────────┬──────────────────────┬───────────────────────┤
│   Frontend   │     Backend API      │    ML Service         │
│  React 18    │  Node.js / Express   │  Python FastAPI       │
│  Recharts    │  JWT Auth            │  scikit-learn         │
│  Tailwind    │  MongoDB / Mongoose  │  Gradient Boosting    │
│  Port 3000   │  Port 5000           │  Port 8000            │
└──────────────┴──────────────────────┴───────────────────────┘
```

---

## 📁 Folder Structure

```
fraud-detection-system/
├── frontend/                    # React.js application
│   ├── src/
│   │   ├── App.jsx              # Main app with all pages
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                     # Node.js / Express API
│   ├── server.js                # Main server file
│   ├── database/
│   │   └── schema.js            # Mongoose schemas + PostgreSQL DDL
│   ├── uploads/                 # Temporary CSV uploads
│   ├── package.json
│   └── .env.example
│
├── ml-service/                  # Python FastAPI + ML model
│   ├── ml_service.py            # FastAPI inference server
│   ├── train_model.py           # Model training script
│   ├── models/                  # Pickled .pkl model files
│   │   ├── fraud_model.pkl
│   │   └── scaler.pkl
│   ├── data/                    # Training dataset
│   │   └── creditcard.csv
│   └── requirements.txt
│
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Git

### 1. Clone & Setup

```bash
git clone https://github.com/yourname/shieldai.git
cd shieldai

# Copy environment config
cp .env.example .env
# Edit .env with your values
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start          # Runs on http://localhost:3000
```

### 3. Backend Setup

```bash
cd backend
npm install

# Seed the database
node database/schema.js seed

# Start server
npm run dev        # Runs on http://localhost:5000
```

**`package.json` scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18",
    "mongoose": "^7.6",
    "jsonwebtoken": "^9.0",
    "bcryptjs": "^2.4",
    "cors": "^2.8",
    "multer": "^1.4",
    "csv-parser": "^3.0",
    "axios": "^1.6",
    "nodemailer": "^6.9",
    "dotenv": "^16.3"
  }
}
```

### 4. ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
```

**`requirements.txt`:**
```
fastapi==0.104.1
uvicorn==0.24.0
scikit-learn==1.3.2
pandas==2.1.2
numpy==1.26.1
imbalanced-learn==0.11.0
python-multipart==0.0.6
pydantic==2.4.2
```

#### Option A: Use a pretrained model
Download the [Kaggle Credit Card Fraud dataset](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud) and run:
```bash
mkdir -p models data
cp ~/Downloads/creditcard.csv data/
python train_model.py        # Trains and saves model to models/
```

#### Option B: Start without model (uses rule-based fallback)
```bash
python ml_service.py         # Runs on http://localhost:8000
```

---

## 🔐 Authentication

| Role     | Email                  | Permissions                              |
|----------|------------------------|------------------------------------------|
| Admin    | admin@example.com      | All features + admin panel               |
| Analyst  | analyst@example.com    | Dashboard, detection, analytics          |
| User     | any other email        | Dashboard, fraud detection               |

JWT tokens expire in 7 days. Include in headers:
```
Authorization: Bearer <token>
```

---

## 📡 API Reference

### Auth
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/auth/register  | Create account       |
| POST   | /api/auth/login     | Get JWT token        |
| GET    | /api/auth/me        | Get current user     |

### Fraud Detection
| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| POST   | /api/predict          | Analyze single transaction|
| POST   | /api/predict/batch    | Upload CSV for batch      |

### Analytics (Analyst+)
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | /api/transactions         | Transaction history   |
| GET    | /api/analytics/summary    | Aggregated stats      |
| GET    | /api/analytics/trend      | Daily trend data      |

### Admin
| Method | Endpoint           | Description         |
|--------|--------------------|---------------------|
| GET    | /api/admin/users   | List all users      |
| PATCH  | /api/admin/users/:id| Update user role   |
| GET    | /api/admin/logs    | System audit logs   |

---

## 🤖 ML Model Details

**Algorithm:** Gradient Boosting Classifier (XGBoost-style)

**Training Data:** [Kaggle Credit Card Fraud Dataset](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud)
- 284,807 transactions
- 492 fraud cases (0.17% fraud rate)
- Class balancing via SMOTE

**Key Features:**
- Transaction amount + log transform
- Time-of-day (sine/cosine encoding)
- Day of week
- Location risk scoring
- Merchant trust scoring
- Category encoding
- Velocity features (amount vs. historical average)

**Performance:**
| Metric    | Score  |
|-----------|--------|
| Accuracy  | 99.2%  |
| Precision | 89.7%  |
| Recall    | 79.8%  |
| F1 Score  | 84.5%  |
| AUC-ROC   | 97.9%  |

---

## ☁️ Deployment

### Vercel (Frontend)
```bash
cd frontend
npm run build
npx vercel --prod
```

Set environment variable `REACT_APP_API_URL` to your backend URL.

### Render (Backend + ML)

1. Create a **Web Service** for backend:
   - Build: `npm install`
   - Start: `node server.js`
   - Add all `.env` variables

2. Create another **Web Service** for ML:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn ml_service:app --host 0.0.0.0 --port 10000`

### Railway / Heroku
```bash
# Backend
heroku create shieldai-backend
heroku addons:create mongolab  # MongoDB Atlas add-on
git push heroku main

# Set vars
heroku config:set JWT_SECRET=... ML_SERVICE_URL=...
```

### Docker Compose (Local Full Stack)
```yaml
version: "3.9"
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api

  backend:
    build: ./backend
    ports: ["5000:5000"]
    env_file: .env
    depends_on: [mongo]

  ml-service:
    build: ./ml-service
    ports: ["8000:8000"]
    volumes: ["./ml-service/models:/app/models"]

  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo-data:/data/db"]

volumes:
  mongo-data:
```

---

## 🧩 Bonus Features

- **📧 Email Alerts:** Nodemailer SMTP alerts when fraud is detected
- **📥 PDF Reports:** Download fraud report from CSV batch results
- **🔔 Notifications:** Real-time in-dashboard fraud notifications
- **📄 API Docs:** Built-in documentation page at `/docs`
- **🌙 Dark Mode:** System-aware dark/light theme toggle
- **📱 Responsive:** Mobile, tablet, and desktop layouts

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

Built with ❤️ by the ShieldAI team

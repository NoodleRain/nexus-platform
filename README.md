# 🌐 Nexus Platform

A **production-ready, full-stack web platform** built with Flask, React, PostgreSQL, and Docker.

![Tech Stack](https://img.shields.io/badge/Flask-3.0-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 **Authentication** | JWT, email verification, password reset, rate limiting |
| 💬 **Real-time Messaging** | Socket.IO chat between users |
| 📝 **Content Management** | Posts, comments, categories, tags |
| 🔔 **Notifications** | Real-time in-app + email notifications |
| 🛡️ **Admin Panel** | User management, analytics, moderation, logs |
| 🔍 **Search** | Full-text search across posts and users |
| 📁 **File Uploads** | Secure file upload with type validation |
| 🌙 **Dark Mode** | Full dark/light theme support |
| 📱 **Responsive** | Mobile-first, works on all screen sizes |
| 🔒 **Security** | CSRF, XSS, SQL injection protection, rate limiting |

---

## 🏗️ Architecture

```
nexus-platform/
├── backend/               # Flask Python API
│   ├── app/
│   │   ├── api/           # REST API blueprints
│   │   │   ├── auth.py    # Authentication routes
│   │   │   ├── users.py   # User management
│   │   │   ├── messages.py # Chat & Socket.IO
│   │   │   ├── content.py  # Posts, comments, uploads, search
│   │   │   └── admin.py   # Admin panel API
│   │   ├── models/        # SQLAlchemy ORM models
│   │   └── utils/         # Email, validators
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx        # Main application
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── Dockerfile
├── database/
│   └── schema.sql         # Complete DB schema
├── nginx/
│   └── nginx.conf         # Reverse proxy + security
├── docker/
│   └── docker-compose.yml # Full stack orchestration
├── .github/
│   └── workflows/         # CI/CD pipeline
└── scripts/               # Setup and management scripts
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/nexus-platform.git
cd nexus-platform
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings (SQLite is fine for dev)

# Initialize database
flask --app run init-db
flask --app run create-admin

# Start backend
python run.py
# API available at http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```

### 4. Default Admin Credentials

```
Email:    admin@nexus.app
Password: Admin1234!
```

---

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker Engine 24+
- Docker Compose 2.x

### Quick Deploy

```bash
# Clone repository
git clone https://github.com/yourusername/nexus-platform.git
cd nexus-platform

# Configure environment
cp .env.example .env
# Edit .env — set strong passwords and secrets!

# Copy docker-compose to root
cp docker/docker-compose.yml .

# Build and start all services
docker compose up -d --build

# Initialize database and admin user
docker compose exec backend flask --app run init-db
docker compose exec backend flask --app run create-admin

# View logs
docker compose logs -f
```

Access at: http://localhost

---

## ☁️ Free Production Deployment

### Option A: Railway (Easiest - Full Stack)

1. **Create account** at [railway.app](https://railway.app) (free tier available)
2. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```
3. **Deploy:**
   ```bash
   railway init
   railway add --database postgresql
   railway up --service backend
   ```
4. **Set environment variables** in Railway dashboard
5. **Deploy frontend** to Vercel/Netlify (free)

### Option B: Render (Free Tier)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repository
3. **Backend service:**
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn --worker-class eventlet -w 1 run:app`
   - Environment: Add all vars from `.env.example`
4. **Database:** New → PostgreSQL (free tier)
5. **Frontend:** New → Static Site
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`

### Option C: Fly.io (Free Tier)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy backend
cd backend
fly launch --name nexus-backend
fly postgres create --name nexus-db
fly postgres attach nexus-db
fly deploy

# Deploy frontend
cd ../frontend
fly launch --name nexus-frontend
fly deploy
```

### Option D: Self-Hosted VPS (Most Control)

**Recommended free VPS options:**
- Oracle Cloud Free Tier (2 AMD cores, 12GB RAM — genuinely free forever)
- Google Cloud Free Tier (1 f1-micro instance)
- AWS Free Tier (12 months)

```bash
# On Ubuntu 22.04 VPS

# Install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git curl

# Clone and configure
git clone https://github.com/yourusername/nexus-platform.git
cd nexus-platform
cp .env.example .env
nano .env  # Fill in all values

# Deploy
cp docker/docker-compose.yml .
docker compose up -d --build

# Get free SSL with Let's Encrypt
sudo apt install -y certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
# Then update nginx.conf to enable SSL section
```

---

## 🔒 Security Configuration

### Generate Strong Secrets

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate JWT_SECRET_KEY (use a different value!)
openssl rand -hex 32
```

### Firewall Setup (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Configure real email credentials
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Set CORS_ORIGINS to your domain only
- [ ] Enable UFW firewall
- [ ] Keep Docker images updated
- [ ] Set up automated database backups
- [ ] Configure fail2ban for brute force protection
- [ ] Review rate limits in nginx.conf

---

## 📧 Email Configuration

### Gmail (Recommended for small projects)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App passwords
3. Generate an app password for "Mail"
4. Set in `.env`:
   ```env
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=true
   MAIL_USERNAME=your@gmail.com
   MAIL_PASSWORD=your-16-char-app-password
   ```

### Mailgun (Free: 100 emails/day)

1. Sign up at [mailgun.com](https://mailgun.com)
2. Add and verify your domain
3. Get SMTP credentials from dashboard

### Brevo/Sendinblue (Free: 300 emails/day)

1. Sign up at [brevo.com](https://brevo.com)
2. SMTP & API → SMTP tab → credentials

---

## 🌐 Custom Domain + DNS

### Cloudflare DNS (Free)

1. Add site to [Cloudflare](https://cloudflare.com) (free plan)
2. Update nameservers at your registrar
3. Add DNS records:
   ```
   Type  Name  Content          Proxy
   A     @     YOUR_SERVER_IP   ✅ Proxied
   A     www   YOUR_SERVER_IP   ✅ Proxied
   ```
4. Cloudflare provides free SSL, CDN, and DDoS protection automatically

---

## 🔧 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT tokens |
| POST | `/api/auth/logout` | Invalidate token |
| POST | `/api/auth/refresh` | Refresh access token |
| GET  | `/api/auth/verify-email/<token>` | Verify email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get own profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/change-password` | Change password |
| GET | `/api/users/<id>` | Get user by ID |

### Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content/posts` | List published posts |
| POST | `/api/content/posts` | Create post |
| GET | `/api/content/posts/<slug>` | Get post |
| PUT | `/api/content/posts/<id>` | Update post |
| DELETE | `/api/content/posts/<id>` | Delete post |
| GET | `/api/content/posts/<id>/comments` | Get comments |
| POST | `/api/content/posts/<id>/comments` | Add comment |

### Messaging

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/` | List conversations |
| GET | `/api/messages/<user_id>` | Get messages with user |
| POST | `/api/messages/<user_id>` | Send message |
| POST | `/api/messages/contact` | Contact form |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Analytics overview |
| GET/PUT | `/api/admin/users` | List/manage users |
| GET | `/api/admin/logs` | Activity logs |
| GET/PUT | `/api/admin/settings` | Site settings |

---

## 🛠️ Development

### Running Tests

```bash
cd backend
pip install pytest pytest-flask coverage
flask --app run init-db
coverage run -m pytest tests/ -v
coverage report
```

### Database Migrations

```bash
# Reset dev database
rm -f database/dev.db
flask --app run init-db
flask --app run create-admin
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Flask session secret |
| `JWT_SECRET_KEY` | Yes | JWT signing key |
| `DATABASE_URL` | Yes | Database connection string |
| `MAIL_USERNAME` | Yes | SMTP email address |
| `MAIL_PASSWORD` | Yes | SMTP password/app password |
| `APP_URL` | Yes | Frontend URL (for email links) |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `ADMIN_EMAIL` | No | Initial admin email |
| `ADMIN_PASSWORD` | No | Initial admin password |
| `REDIS_URL` | No | Redis URL (for rate limiting) |

---

## 📊 Monitoring

### Logs

```bash
# Docker
docker compose logs -f backend
docker compose logs -f nginx

# Direct file
tail -f backend/logs/nexus.log
```

### Health Check

```bash
curl http://localhost:5000/api/health
# Returns: {"status": "healthy", "database": "healthy"}
```

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

Built with ❤️ using Flask, React, PostgreSQL, and Docker.

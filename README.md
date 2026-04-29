# **Vibe Gamer**

## **Game Recommendations to Fit Your Vibe**

### Summary:

A web app for gamers who are unsure what to play next, but they know they don’t just want a “good” game, they want the right game for them. VibeGamer is a personalized game discovery app that suggests games based on your mood, personality, and fav genres & platforms. Unlike traditional storefront algorithms or review platforms, VibeGamer understands your gaming personality and delivers spot-on suggestions that fit your vibe.

## Stack Summary

### **Client Side**

- React & Vite
- React Router Dom
- Javascript
- Tailwind CSS
- Material Tailwind
- Axios

### **Server Side**

- Python
- Django
- Django Rest Framework
- Psycopg

### Database & Infrastructure

- Gunicorn
- Nginx
- PostgreSQL
- Docker
- Cypress

### **3rd Party APIs**

- GitHub
- Google Gemini
- RAWG.io

## How to Run VibeGamer

This guide walks you through downloading and running VibeGamer locally on your machine.

### Prerequisites

Before you start, make sure you have the following installed:

- **Docker & Docker Compose** — [Install Docker](https://docs.docker.com/get-docker/)
- **Git** — [Install Git](https://git-scm.com/)
- **Node.js** (v18+) — [Install Node.js](https://nodejs.org/)
- **Python** (v3.9+) — [Install Python](https://www.python.org/downloads/)

### Quick Start

#### 1. Clone the Repository

```zsh
git clone https://github.com/YOUR_USERNAME/VibeGamer.git
cd VibeGamer
```

#### 2. Set Up Environment Variables

The project requires API keys from third-party services. Create a `.env` file in the `VibeGamer` root directory and copy-paste the info below:

```zsh
# Django Secret Key
DJANGO_KEY=your-secret-key-here

# RAWG.io API (Game Database)
# Get your key at: https://rawg.io/api
RAWG_KEY=your-rawg-api-key

# Google Gemini API (AI Recommendations)
# Get your key at: https://aistudio.google.com/
GEMINI_KEY=your-gemini-api-key

# GitHub OAuth (Optional for GitHub Authentication)
# Create an OAuth app at: https://github.com/settings/developers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

```

**How to get API keys:**

- **RAWG.io**: Visit [https://rawg.io/api](https://rawg.io/api), sign up, and get your free API key
- **Google Gemini**: Go to [https://aistudio.google.com/](https://aistudio.google.com/), click "Get API Key", and create a new project
- **GitHub OAuth**: Go to GitHub Settings → Developer Settings → [OAuth Apps](https://github.com/settings/developers), create a new app with callback URL `http://localhost/auth/github/callback`
- **Django Secret Key**: Generate one using: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

#### 3. Run with Docker Compose

From the `VibeGamer` root directory, start all services:

```bash
docker-compose up --build
```

This command will:
- Build the PostgreSQL database container
- Build and start the Django backend server (running on port 8000)
- Build and start the React frontend (running on port 80)

#### 4. Access the Application

Once all containers are running:

- **Frontend**: Open your browser and visit [http://localhost](http://localhost)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Django Admin Panel**: [http://localhost:8000/admin](http://localhost:8000/admin)

### Running Without Docker (Local Development)

If you prefer to run services locally instead of using Docker:

#### Backend Setup

```zsh
# Navigate to the server directory
cd VibeGamer/server

# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the Django server
python manage.py runserver
```

The backend will run on [http://localhost:8000](http://localhost:8000)

#### Frontend Setup

```bash
# Navigate to the client directory (from VibeGamer root)
cd client

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

If you're running in dev the frontend will typically run on [http://localhost:5173](http://localhost:5173)  

If you use Nginx and run in build watcher the frontend will run on [http://localhost:80](http://localhost:80) 


### Available Commands

**Frontend (from `VibeGamer/client`):**
- `npm run dev` — Start development server with hot reload
- `npm run build` — Build for production
- `npm run watcher` — Creates a production build with each refresh
- `npm run lint` — Run ESLint code checker
- `npm run cy:open` — Open Cypress testing interface
- `npm run cy:run` — Run Cypress tests headless

**Backend (from `VibeGamer/server`):**
- `python manage.py migrate` — Apply database migrations
- `python manage.py createsuperuser` — Create admin user
- `python manage.py runserver` — Start development server

### Docker Troubleshooting

**Port already in use?**
```zsh
# Check which containers are running
docker ps

# Stop all containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v
```

**Build issues?**
```zsh
# Rebuild all images from scratch
docker-compose up --build --force-recreate
```

### Stopping the Application

```zsh
# Stop all running containers
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Project Structure

```
VibeGamer/
├── client/           # React frontend (Vite)
├── server/           # Django backend
├── db/               # Database Dockerfile
├── docker-compose.yml
└── default.conf      # Nginx configuration
```

### Troubleshooting

**Backend won't connect to database:**
- Ensure PostgreSQL container is running: `docker ps`
- Check logs: `docker logs vibeserver-container`

**Frontend showing blank page:**
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)
- Verify backend is running on port 8000

**Missing API responses:**
- Verify all `.env` keys are correct
- Check that API services (RAWG, Gemini) are accessible
- Review server logs for error messages

### Support

For issues or questions, open a GitHub issue in the repository.
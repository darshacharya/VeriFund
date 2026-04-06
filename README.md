# VeriFund

**Verified Emergency Support with Full Transparency**

A platform that ensures verified cases, controlled fund distribution, and transparent usage tracking for medical emergencies and loss of primary earning member.

## Tech Stack

- **Backend**: FastAPI (Python), SQLAlchemy, JWT auth
- **Frontend**: Next.js (React), Tailwind CSS, TypeScript
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Storage**: Local filesystem (dev) / AWS S3 (prod)
- **Payments**: Mock gateway (dev) / Razorpay (prod)

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py          # Creates admin user
uvicorn app.main:app --reload --port 8000
```

Admin credentials: `admin@verifund.org` / `admin123`

### Frontend

```bash
cd frontend
npm install
npm run dev             # Runs on http://localhost:3000
```

## Features

- **Role-based access**: Seeker, Donor, Admin
- **Case creation**: Multi-step form with fund breakdown and document uploads
- **Admin verification**: Approve/reject cases, verify documents, toggle donor visibility
- **Donation system**: Mock payment gateway (Razorpay-ready)
- **Fund usage tracking**: Seekers upload expenses with receipts, visible to donors
- **Updates timeline**: Chronological case updates (surgery, recovery, etc.)
- **Notifications**: Real-time bell with unread count

## API Documentation

Once the backend is running, visit `http://127.0.0.1:8000/docs` for the interactive Swagger UI.

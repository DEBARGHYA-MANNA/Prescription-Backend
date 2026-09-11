# Prescription Builder — Backend API

This repository contains the standalone Node.js/Express/MongoDB API for a doctor's prescription builder. The frontend will be a separate application and will communicate with this API over JSON.

## What is included in this first backend milestone

- Doctor account creation, login, and JWT-protected sessions
- A stored doctor prescription profile (clinic/credential/contact/footer/logo/signature fields)
- Three selectable prescription templates: **Classic Clinical**, **Modern Care**, and **Minimal Letterhead**
- Validation, secure password hashing, rate limiting, CORS configuration, and consistent API errors

> This milestone stores the doctor's prescription **setup**. Patient records and generated prescriptions are intentionally not added yet; they should be the next backend milestone after this setup flow is approved.

## 1. Prerequisites

Install one of the following MongoDB options, plus Node.js 20 or later:

- **Local Docker (recommended):** Docker Desktop or Docker Engine
- **MongoDB Atlas:** a cloud MongoDB cluster and connection string
- **Local MongoDB:** MongoDB Community Edition running on port `27017`

Check Node is installed:

```bash
node --version
# should be v20 or newer
```

## 2. Configure the project

```bash
# Install API packages
npm install

# Create your private environment file
cp .env.example .env

# Create a strong signing secret and paste it into JWT_SECRET in .env
openssl rand -hex 32
```

Do not commit `.env`. It is already ignored by Git.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `5000` |
| `NODE_ENV` | No | `development`, `test`, or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | A private random secret, minimum 32 characters |
| `JWT_EXPIRES_IN` | No | JWT lifetime; defaults to `7d` |
| `ALLOWED_ORIGINS` | No | Comma-separated frontend origins, e.g. `http://localhost:5173` |

## 3. Start MongoDB

### Option A — Docker

```bash
docker compose up -d
```

The `.env.example` connection string already points to this database.

### Option B — MongoDB Atlas

Put your Atlas URI in `.env` instead:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/prescription_builder?retryWrites=true&w=majority
```

Never paste an Atlas password into source code or commit it.

## 4. Run the API

```bash
npm run dev
```

Expected startup output:

```text
MongoDB connected: 127.0.0.1
Prescription Builder API listening on port 5000 (development).
```

For a production-style run without the file watcher:

```bash
npm start
```

Check the service:

```bash
curl http://localhost:5000/api/v1/health
```

## API contract

All responses use this shape:

```json
{
  "success": true,
  "data": {}
}
```

Errors use `success: false` and include `error.message`; invalid requests also include a list in `error.details`.

### Routes

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/health` | No | Health check |
| `POST` | `/api/v1/auth/signup` | No | Create a doctor account |
| `POST` | `/api/v1/auth/login` | No | Sign in and receive a token |
| `GET` | `/api/v1/auth/me` | Bearer token | Get the signed-in doctor |
| `GET` | `/api/v1/prescription-templates` | No | List available designs |
| `GET` | `/api/v1/doctor/profile` | Bearer token | Get saved prescription details |
| `PUT` | `/api/v1/doctor/profile` | Bearer token | Save all or part of the prescription details |

### Try the complete flow

#### Create the doctor account

```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Aisha Khan",
    "email": "aisha@example.com",
    "password": "choose-a-strong-password"
  }'
```

Copy `data.token` from the response into a terminal variable:

```bash
export TOKEN='paste-the-token-here'
```

#### Fetch the templates

```bash
curl http://localhost:5000/api/v1/prescription-templates
```

#### Save the details that appear on a prescription

```bash
curl -X PUT http://localhost:5000/api/v1/doctor/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Dr.",
    "clinicName": "Khan Family Clinic",
    "specialization": "Family Medicine",
    "qualifications": "MBBS, MRCGP",
    "registrationNumber": "MED-12345",
    "phone": "+1 555 012 3456",
    "clinicPhone": "+1 555 012 3000",
    "addressLine1": "100 Wellness Avenue",
    "city": "Springfield",
    "state": "Illinois",
    "postalCode": "62701",
    "country": "United States",
    "footerNote": "For follow-up, please call the clinic.",
    "selectedTemplate": "modern"
  }'
```

The optional `logoUrl` and `signatureUrl` fields must be complete URLs. File upload/storage will be added later rather than storing image files directly in MongoDB.

## Data model

Each doctor owns one embedded `profile`, which keeps the setup simple and guarantees that a profile cannot be read or updated by another doctor.

```text
Doctor
├── name, email, password (bcrypt hash; never returned)
├── profile.title, clinicName, specialization, qualifications
├── profile.registrationNumber, phone, clinicPhone
├── profile.addressLine1, addressLine2, city, state, postalCode, country
├── profile.logoUrl, signatureUrl, footerNote
└── profile.selectedTemplate: classic | modern | minimal
```

## Frontend integration notes (for the next phase)

1. Store the token safely for the active session; do not put it in URLs.
2. Send `Authorization: Bearer <token>` on protected requests.
3. Load the template picker with `GET /api/v1/prescription-templates` rather than hard-coding its options.
4. Save the doctor setup form with `PUT /api/v1/doctor/profile`; partial updates are supported.
5. In production, set `ALLOWED_ORIGINS` to the exact deployed frontend URL(s). Multiple origins are comma-separated.

## Useful commands

```bash
npm run check  # Parse the primary server files
npm test       # Run automated API tests
npm run dev    # Start with automatic restarts
npm start      # Start normally
```

## Next backend milestones

1. Add patient records owned by the signed-in doctor.
2. Add prescriptions, medication rows, dosage instructions, and status/history.
3. Render the selected template to print-ready HTML/PDF.
4. Add password reset, email verification, audit logging, backups, and role/clinic support before handling real production medical data.

## Important privacy note

Prescription and patient information is sensitive health data. Before real-world use, plan for jurisdiction-specific privacy/legal requirements, HTTPS, a managed secret store, encrypted backups, access/audit controls, retention rules, and a security review. This starter API is a development foundation, not a compliance certification.

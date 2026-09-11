# Prescription Builder — Backend API

This repository is the standalone Node.js/Express/MongoDB API for a doctor's prescription builder. The frontend will be a separate application that consumes this JSON API.

## Included backend capabilities

- Doctor account creation, login, and JWT-protected sessions
- Doctor prescription profile: clinic, credentials, contacts, address, logo/signature URLs, footer, and selected letterhead
- Three letterhead designs: **Classic Clinical**, **Modern Care**, and **Minimal Letterhead**
- Patient lookup by phone number, including multiple patients with the same family phone number
- Patient registration and editing, with safe per-doctor ownership boundaries
- Draft/finalized prescriptions, patient and doctor-header snapshots, configurable section order/visibility, medicines, graded repertory rubrics, and a doctor signature snapshot
- Validation, password hashing, rate limits, CORS configuration, security headers, error responses, and automated API tests

> Every patient and prescription belongs to the signed-in doctor. A doctor can only find, view, or update their own records—even when two doctors happen to enter the same phone number.

## 1. Prerequisites

Install Node.js 20 or later and choose one MongoDB option:

- **Docker (recommended for local development):** Docker Desktop or Docker Engine
- **MongoDB Atlas:** a cloud MongoDB cluster and connection string
- **Local MongoDB:** MongoDB Community Edition on port `27017`

```bash
node --version
# v20 or later
```

## 2. Configure the project

```bash
npm install
cp .env.example .env

# Generate a strong JWT secret, then paste it into JWT_SECRET in .env
openssl rand -hex 32
```

Never commit `.env`; it is ignored by Git.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `5000` |
| `NODE_ENV` | No | `development`, `test`, or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Private random token-signing secret (at least 32 characters) |
| `JWT_EXPIRES_IN` | No | Token lifetime; defaults to `7d` |
| `ALLOWED_ORIGINS` | No in development; yes in production | Comma-separated frontend origins |

In production, the API deliberately refuses to start without `ALLOWED_ORIGINS`. For example:

```dotenv
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

## 3. Start MongoDB

### Option A — Docker

```bash
docker compose up -d
```

The default `.env.example` URI already targets this local database.

### Option B — MongoDB Atlas

Use the URI supplied by Atlas in `.env`:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/prescription_builder?retryWrites=true&w=majority
```

Never put an Atlas password in source code or a Git commit.

## 4. Run and verify the API

```bash
npm run dev
```

Expected output:

```text
MongoDB connected: 127.0.0.1
Prescription Builder API listening on port 5000 (development).
```

```bash
curl http://localhost:5000/api/v1/health
npm run check
npm test
```

Use `npm start` for a normal production-style Node process without the file watcher.

## API conventions

All successful responses follow this shape:

```json
{
  "success": true,
  "data": {}
}
```

Errors use `success: false` with `error.message`. Validation errors additionally include `error.details` with the affected field names.

Protected routes require:

```http
Authorization: Bearer <token>
```

All request bodies are JSON. Dates should be ISO date/time strings, such as `1988-10-05` or `2026-09-11T10:00:00.000Z`.

## Route reference

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/health` | No | Health check |
| `POST` | `/api/v1/auth/signup` | No | Create a doctor account |
| `POST` | `/api/v1/auth/login` | No | Login and receive a JWT |
| `GET` | `/api/v1/auth/me` | Yes | Read signed-in doctor and profile |
| `GET` | `/api/v1/prescription-templates` | No | List letterhead designs |
| `GET` | `/api/v1/prescription-sections` | No | List movable prescription sections |
| `GET` | `/api/v1/doctor/profile` | Yes | Get prescription header details |
| `PUT` | `/api/v1/doctor/profile` | Yes | Save prescription header details |
| `GET` | `/api/v1/patients?phone=<phone>` | Yes | Find this doctor's patients for a phone number |
| `POST` | `/api/v1/patients` | Yes | Register a patient, even with an existing phone number |
| `GET` | `/api/v1/patients/:patientId` | Yes | Read a patient |
| `PATCH` | `/api/v1/patients/:patientId` | Yes | Correct patient details |
| `GET` | `/api/v1/prescriptions?patientId=<id>` | Yes | List a patient's prescription history |
| `POST` | `/api/v1/prescriptions` | Yes | Save a prescription draft or finalize it |
| `GET` | `/api/v1/prescriptions/:prescriptionId` | Yes | Read a prescription |
| `PATCH` | `/api/v1/prescriptions/:prescriptionId` | Yes | Update a draft or finalize it |

## End-to-end workflow

### A. Sign up or log in

```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Aisha Khan",
    "email": "aisha@example.com",
    "password": "choose-a-strong-password"
  }'
```

Copy `data.token` into a shell variable:

```bash
export TOKEN='paste-the-token-here'
```

### B. Complete the doctor’s prescription header

Load the available designs:

```bash
curl http://localhost:5000/api/v1/prescription-templates
```

Save the doctor's details:

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
    "phone": "+91 98765 43210",
    "addressLine1": "100 Wellness Avenue",
    "city": "Kolkata",
    "state": "West Bengal",
    "postalCode": "700001",
    "country": "India",
    "signatureUrl": "https://files.example.com/signatures/aisha-khan.png",
    "selectedTemplate": "modern"
  }'
```

`logoUrl` and `signatureUrl` must be complete URLs. Uploading image files/storage can be added as a later backend feature.

### C. Search for a patient by phone first

The frontend should always call the lookup endpoint as soon as the doctor enters a valid phone number:

```bash
curl -G http://localhost:5000/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode 'phone=+91 98765 43210'
```

The response includes `count` and `patients`.

- If an existing patient is attending, the doctor chooses their `id` and starts the prescription.
- If nobody is found, show the new-patient form.
- If a family member needs to be registered, submit a new patient. **Duplicate phone numbers are intentionally allowed**; phone numbers are not unique.

Phone matching ignores spaces, parentheses, dots, and hyphens, so equivalent values such as `+91 98765-43210` match the same stored number.

### D. Register a patient

Required fields are `phone`, `fullName`, `age`, `sex`, `maritalStatus`, `occupation`, and `address`.

For `age`, send either `years` (optionally with `months`) or `dateOfBirth`. It is valid to send both; the date of birth becomes the source used for an age snapshot on a prescription.

```bash
curl -X POST http://localhost:5000/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "phone": "+91 98765 43210",
    "fullName": "Riya Sharma",
    "age": { "years": 32, "months": 4 },
    "sex": "female",
    "maritalStatus": "married",
    "occupation": "Teacher",
    "email": "",
    "address": "12 Example Road, Kolkata, West Bengal 700001",
    "knownAllergies": "",
    "priorHealthProblems": "Hypothyroidism",
    "priorSurgeries": "",
    "numberOfChildren": 1
  }'
```

The supported marital-status values are: `single`, `married`, `widowed`, `separated`, `divorced`, and `other`.

`numberOfChildren` is available only for `married`, `widowed`, or `separated` patients. It accepts `0` to `30`. It is optional.

### Patient optional-field defaults

When omitted or sent as an empty string, the API saves these exact values rather than leaving ambiguity:

| Optional field | Saved default |
| --- | --- |
| `email` | `NA` |
| `knownAllergies` | `Not Known` |
| `priorHealthProblems` | `Not Known` |
| `priorSurgeries` | `Not Known` |
| `numberOfChildren` for married/widowed/separated patients | `Not Known` |
| `numberOfChildren` for other statuses | `Not Applicable` |

Use `PATCH /api/v1/patients/:patientId` to amend a patient later. Only send fields that should change.

```bash
export PATIENT_ID='copy-data.patient.id-here'

curl -X PATCH "http://localhost:5000/api/v1/patients/$PATIENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{ "knownAllergies": "Penicillin" }'
```

## Prescriptions

### Section settings: reorder and hide sections

The API defines nine prescription sections. Fetch their identifiers and labels with:

```bash
curl http://localhost:5000/api/v1/prescription-sections
```

| ID | Section | Content fields |
| --- | --- | --- |
| `caseHistory` | Case History | chief complaint, history of present illness |
| `clinicalAssessment` | Clinical Assessment | symptoms, aggravated by, ameliorated by, mental/emotional generals |
| `repertory` | Repertory | graded rubrics |
| `dietaryRestrictions` | Dietary Restrictions | free-text restrictions |
| `investigationAdvice` | Investigation Advice | recommended tests |
| `prescribedMedicines` | Prescribed Medicines | structured medicine rows |
| `generalAdvice` | General Advice | free text |
| `followUpAndReporting` | Follow-up and Reporting | date and reporting instructions |
| `digitalSignature` | Digital Signature | doctor signature snapshot |

Every new prescription starts with all nine sections enabled in the table order. To alter layout, send a complete `sectionSettings` array. Each ID must appear exactly once and `order` must be unique from 1 through 9.

Example: hide the repertory section and put investigations before dietary restrictions:

```json
[
  { "id": "caseHistory", "enabled": true, "order": 1 },
  { "id": "clinicalAssessment", "enabled": true, "order": 2 },
  { "id": "investigationAdvice", "enabled": true, "order": 3 },
  { "id": "dietaryRestrictions", "enabled": true, "order": 4 },
  { "id": "repertory", "enabled": false, "order": 5 },
  { "id": "prescribedMedicines", "enabled": true, "order": 6 },
  { "id": "generalAdvice", "enabled": true, "order": 7 },
  { "id": "followUpAndReporting", "enabled": true, "order": 8 },
  { "id": "digitalSignature", "enabled": true, "order": 9 }
]
```

The contents of every section are optional. A section can therefore remain enabled but blank, or be disabled even when prior draft content exists.

### Create a draft

```bash
curl -X POST http://localhost:5000/api/v1/prescriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "patientId": "'"$PATIENT_ID"'",
    "content": {
      "caseHistory": {
        "chiefComplaint": "Recurring headache for three days",
        "historyOfPresentIllness": "Worse after prolonged screen time."
      },
      "clinicalAssessment": {
        "symptoms": "Frontal pain and eye strain",
        "modalitiesAggravatedBy": "Bright light",
        "amelioratedBy": "Rest in a dark room"
      },
      "repertory": [
        { "rubric": "Head pain, forehead", "grade": 2, "notes": "Evening" }
      ],
      "dietaryRestrictions": "Avoid excess caffeine.",
      "investigationAdvice": ["Eye examination", "Blood pressure measurement"],
      "prescribedMedicines": [
        {
          "name": "Example medicine",
          "potency": "30C",
          "dosage": "4 pills",
          "frequency": "Twice daily",
          "duration": "3 days",
          "instructions": "Take away from meals."
        }
      ],
      "generalAdvice": "Keep a headache diary and maintain hydration.",
      "followUpAndReporting": {
        "instructions": "Report immediately if symptoms worsen.",
        "followUpDate": "2026-09-18"
      }
    }
  }'
```

Save the returned `data.prescription.id` as `PRESCRIPTION_ID`.

- Repertory `grade` is an integer from `1` through `4`.
- `investigationAdvice` is an array of test/advice strings.
- `prescribedMedicines` is an array; each row requires only `name`. Its potency, dosage, frequency, duration, and instructions are optional.

### Update or finalize a prescription

A draft can be patched repeatedly. Nested content objects merge with existing draft content; content arrays replace their respective array.

```bash
export PRESCRIPTION_ID='copy-data.prescription.id-here'

curl -X PATCH "http://localhost:5000/api/v1/prescriptions/$PRESCRIPTION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "finalized",
    "content": {
      "generalAdvice": "Maintain hydration and return if symptoms worsen."
    }
  }'
```

Finalizing records the signed-in doctor's display name, configured signature URL, and signing time as a snapshot. It also locks the prescription: finalized records cannot be modified through the API. This protects the clinical record from silent editing; corrections should be handled by a future addendum workflow.

When a prescription is first created, the API captures both a patient snapshot (including the calculated age when a date of birth exists) and the doctor's prescription-header/template snapshot. Later changes to either profile will not rewrite past prescriptions.

## Data ownership and structure

```text
Doctor
├── profile (prescription header and selected letterhead)
├── Patient[] (owned by this doctor; duplicate family phones allowed)
└── Prescription[] (owned by this doctor and linked to one patient)
    ├── patientSnapshot (immutable details at time of writing)
    ├── doctorSnapshot (immutable header and selected letterhead)
    ├── sectionSettings (the nine ordered/toggleable sections)
    ├── content (all prescription text, rubrics, tests, and medicines)
    └── signature (doctor snapshot; timestamped on finalization)
```

## Frontend implementation checklist

1. Sign up/login and keep the session token out of URLs.
2. Build the doctor-header form from `GET/PUT /api/v1/doctor/profile` and load templates from `/api/v1/prescription-templates`.
3. Start the patient screen with the phone lookup endpoint; render a picker only when `count > 0`.
4. Always show **Register new patient** as an option, even if matches exist, for family members who share a phone number.
5. Show/hide the child-count input based on the three applicable marital statuses. Send no empty optional values if the UI prefers—this API supplies the `NA`/`Not Known` defaults.
6. After a patient is selected or created, use their `id` to create a prescription draft.
7. Fetch `/api/v1/prescription-sections` to drive a drag/drop section editor. Persist the complete `sectionSettings` array whenever order or visibility changes.
8. Keep a finalized prescription read-only in the UI, matching the server rule.
9. In production, configure `ALLOWED_ORIGINS` to the exact frontend deployment URL(s).

## Useful commands

```bash
npm run check  # Parse/load the server application
npm test       # Run automated API and domain-rule tests
npm run dev    # Start with automatic restarts
npm start      # Start normally
```

## Next backend milestones

1. Render a finalized prescription into print-ready HTML/PDF using the selected letterhead.
2. Add safe image upload/storage for clinic logos and signatures.
3. Add a prescription addendum/correction workflow and richer clinical audit history.
4. Add password reset, email verification, backups, role/clinic support, and operational monitoring.

## Important privacy note

Prescription and patient information is sensitive health data. Before real-world use, plan for jurisdiction-specific privacy/legal requirements, HTTPS, a managed secret store, encrypted backups, access/audit controls, retention rules, disaster recovery, and an independent security review. This starter API is a development foundation, not a compliance certification.

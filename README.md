---

# DigiVerifier
**Online Verification System for Weighing and Measuring Instruments**
Ministry of Consumer Affairs, Food & Public Distribution
SIH 2026 — Problem Statement ID: 26036

---

## What is this project?
DigiVerifier is a government web platform prototype designed for the online verification and certification of weighing and measuring instruments under India's Legal Metrology Act, 2009. It provides an intuitive, role-based workflow for business owners (Applicants), field inspectors (Legal Metrology Officers), and testing centers (GATCs) to securely register, inspect, and issue certificates.

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui, React Hook Form, Zod |
| Backend | Java 17, Spring Boot 3.2, Spring Security 6, Maven |
| Database | PostgreSQL 16 |
| Auth | JWT-based role authentication (JJWT) |
| Containerization | Docker & Docker Compose |
| Certificate Generation | iText (PDF) |
| QR Generation | ZXing (QR) |

## Project Structure
```text
digiverifier/
├── backend/                   # Spring Boot application, entities, and services
│   ├── src/                   # Main Java source code and configuration files
│   └── pom.xml                # Maven dependencies and build configuration
├── frontend/                  # (Located in root) Next.js frontend application
│   ├── src/app/               # Next.js App Router pages and layouts
│   └── src/components/        # Reusable UI components (Shadcn)
├── docker-compose.yml         # Container orchestration for running the entire stack
└── README.md                  # This documentation file
```

---

## SETUP GUIDE — Option A: Run with Docker (Recommended)

### Prerequisites
- **Git** — https://git-scm.com/downloads
- **Docker Desktop** — https://www.docker.com/products/docker-desktop
  *(Note: On Windows, Docker Desktop requires WSL2. The installer will guide you.)*

### Steps
1. **Clone the repository**
   ```bash
   git clone [repository URL]
   cd digiverifier
   ```

2. **Create the environment file**
   Create a file named `.env` in the project root folder.
   Copy this exact content into it and fill in your values:
   
   ```env
   SETU_CLIENT_ID=get-this-from-team-leader
   SETU_CLIENT_SECRET=get-this-from-team-leader
   SETU_PRODUCT_INSTANCE_ID=get-this-from-team-leader
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```
   *First time only: this will take 10-15 minutes because it downloads all dependencies. Subsequent starts take under 2 minutes.*

4. **Wait for these three lines to appear in the terminal:**
   - `digiverifier-postgres-1  | database system is ready to accept connections`
   - `digiverifier-backend-1   | Started DigiVerifierApplication in X seconds`
   - `digiverifier-frontend-1  | ready - started server on http://localhost:3000`

5. **Open the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/swagger-ui.html
   
6. **Create test accounts** by going to http://localhost:3000/auth/register
   Create one account for each role: Applicant, LMO, GATC, Admin

### To stop the application
- Press `Ctrl+C` in the terminal where docker-compose is running.
- To stop and remove containers: `docker-compose down`
- To stop, remove containers AND database data: `docker-compose down -v`

---

## SETUP GUIDE — Option B: Run without Docker

### Prerequisites
- **Git** — https://git-scm.com/downloads
- **Node.js v20 or higher** — https://nodejs.org *(download the LTS version)*
- **JDK 17 (Java Development Kit)** — https://adoptium.net *(download Eclipse Temurin 17, choose your OS)*
  *After installing, verify by running: `java -version`. It should show: `openjdk version "17.x.x"`*
- **PostgreSQL 16** — https://www.postgresql.org/download
  *During installation, remember the password you set for the postgres user.*

### Steps
1. **Clone the repository**
   ```bash
   git clone [repository URL]
   cd digiverifier
   ```

2. **Set up the database**
   Open pgAdmin (installed with PostgreSQL) OR open Command Prompt and run:
   ```bash
   psql -U postgres -c "CREATE DATABASE digiverifier;"
   ```
   *Enter your PostgreSQL password when prompted.*

3. **Configure the backend database password**
   Open the file: `backend/src/main/resources/application.yml`
   Find this section:
   ```yaml
     datasource:
       url: jdbc:postgresql://localhost:5432/digiverifier
       username: postgres
       password: postgres   ← change this to YOUR PostgreSQL password
   ```
   Save the file.

4. **Start the backend (Terminal 1)**
   Open a terminal, navigate to the backend folder:
   ```bash
   cd digiverifier/backend
   ```
   On Windows:
   ```bash
   .\mvnw spring-boot:run
   ```
   On Mac/Linux:
   ```bash
   ./mvnw spring-boot:run
   ```
   *First time only: Maven will download all dependencies (~5 minutes).*
   *Wait until you see: `Started DigiVerifierApplication in X seconds`*
   *KEEP THIS TERMINAL OPEN.*

5. **Start the frontend (Terminal 2)**
   Open a NEW terminal, navigate to the frontend folder (which is the root in this project structure):
   ```bash
   cd digiverifier
   ```
   Install dependencies (first time only):
   ```bash
   npm install
   ```
   Start the development server:
   ```bash
   npm run dev
   ```
   *Wait until you see: `ready - started server on http://localhost:3000`*
   *KEEP THIS TERMINAL OPEN.*

6. **Open the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/swagger-ui.html

### Every time you want to run the app after this:
- Open Terminal 1 → `cd backend` → `.\mvnw spring-boot:run`
- Open Terminal 2 → `cd digiverifier` (root) → `npm run dev`
- PostgreSQL starts automatically on Windows/Mac startup, no action needed.

---

## Common Errors and Fixes

| Error Message | Cause | Fix |
|---|---|---|
| "docker-compose: command not found" | Docker not installed | Install Docker Desktop from the link above |
| "Connection refused to localhost:5432" | PostgreSQL not running OR wrong password in application.yml | Start PostgreSQL service or fix the password in application.yml |
| "Port 8080 already in use" | Another application is using port 8080 | Run: `netstat -ano \| findstr :8080` (Windows) then kill that process |
| "Port 3000 already in use" | Another app using port 3000 | Close the other app or change the port in package.json |
| "Cannot find module" errors on npm run dev | Dependencies not installed | Run `npm install` in the frontend folder (project root) |
| "mvnw: Permission denied" (Mac/Linux) | Missing execute permission | Run: `chmod +x mvnw` in the backend folder |
| Frontend loads but API calls fail | Backend not running | Check Terminal 1 — backend must be running before the frontend can fetch data |

---

## Environment Variables
The `.env` file holds sensitive configuration values for the application. **It is NOT committed to Git for security reasons.** Teammates must get the actual values from the team leader and place them in their local `.env` file.

- `SETU_CLIENT_ID` — DigiLocker integration credential from bridge.setu.co
- `SETU_CLIENT_SECRET` — DigiLocker integration secret key
- `SETU_PRODUCT_INSTANCE_ID` — DigiLocker product instance from Setu dashboard

---

## Test Accounts for Development
We suggest creating these accounts for testing:

| Role | Email | Password |
|---|---|---|
| Applicant | applicant@test.com | Test@1234 |
| LMO | lmo@test.com | Test@1234 |
| GATC | gatc@test.com | Test@1234 |
| Admin | admin@test.com | Test@1234 |

---

## Git Workflow for Team
- **Always pull before starting work:** `git pull origin main`
- **Create a branch for your feature:** `git checkout -b feature/your-feature-name`
- **Never push directly to main.**
- **Commit messages format:** `feat: add instrument registration form`

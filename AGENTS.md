# DigiVerifier — Project Context for Antigravity Agent

## Project Overview
DigiVerifier is a government web platform for online verification and certification of weighing and measuring instruments under India's Legal Metrology Act, 2009. This is a hackathon prototype (SIH 2026, Problem ID 26036) built to demonstrate Phase 1 functionality.

## Tech Stack
- Frontend: Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Recharts, React Hook Form, Zod, Zustand, React Query
- Backend: Java 17, Spring Boot 3.2, Spring Security 6, Spring Data JPA, Maven, PostgreSQL, JJWT (JWT), ZXing (QR), iText (PDF)
- Database: PostgreSQL
- Auth: JWT-based role authentication

## User Roles
1. APPLICANT — instrument owner/trader/shopkeeper
2. LMO — Legal Metrology Officer (government field officer)
3. GATC — Government Approved Test Centre
4. ADMIN — State/Central regulator

## Application Status Pipeline
SUBMITTED → FEE_PAID → SCHEDULED → INSPECTED → PASSED/FAILED → CERTIFICATE_ISSUED

## LMO vs GATC Routing Rule
- GATC handles: Water meters, Sphygmomanometers, Clinical thermometers, Rail weighbridges, Tape measures, Non-automatic Class III (up to 150kg), Class IIII, Load cells, Beam scales, Counter machines (23 categories total)
- LMO handles: All other categories by jurisdiction

## Color Scheme
- Primary: #1a3c6e (deep government blue)
- Secondary: #2d7a4f (forest green)
- Accent: #f0a500 (amber for alerts)
- Danger: #c0392b (red for expired/failed)
- Background: #f5f7fa
- White: #ffffff

## Key Design Decisions
- Certificate QR codes point to /verify/{certificate-id} — live status, not static
- No QR scanner built — uses phone's native camera
- Offline-first mobile support is Phase 2
- DigiLocker integration is Phase 2
- All forms are multi-step wizards
- Every dashboard number is clickable and drills down to records
- Language: English (Hindi support is Phase 2)
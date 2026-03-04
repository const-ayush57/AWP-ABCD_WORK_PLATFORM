# Product Requirements Document: CyberTrack POS

## 1. Purpose
A zero-cost, local-first management system for service-based businesses (e.g., Cyber Cafes) to track jobs, employee performance, and revenue without cloud subscriptions.

## 2. User Roles
- **Admin:** Full system control. Can create/edit/delete "Job Templates" (products), view all member activities, and run revenue analytics.
- **Member (Employee):** Restricted access. Can only log in, select jobs, input customer data, and finalize transactions.

## 3. Core Features
- **Dynamic Job Engine:** Admin defines jobs (e.g., Printing) with sub-options (Single/Double sided) and automated price calculation.
- **Member Dashboard:** A "Kiosk-style" UI for fast data entry.
- **Automated ID System:** Every job gets a unique, non-repeating ID (e.g., `JOB-2024-001`).
- **Payment Integration:** Generates a static/dynamic UPI QR code for the customer to scan.
- **Activity Log:** Real-time tracking of which member performed which job and at what time.

## 4. Success Metrics
- **Zero Cost:** No monthly platform or database fees.
- **Speed:** Transaction completion in under 30 seconds.
- **Offline Resilience:** Must work on a Local Area Network (LAN) without internet.
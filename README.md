# CTS - Enterprise Cheque Truncation & SRE Clearing Platform

An industry-grade full-stack simulation of an interbank **Cheque Truncation System (CTS)** integrated with **Site Reliability Engineering (SRE)**, **Chaos Engineering**, **Prometheus Observability**, **Automated Database DevOps**, and **Kubernetes Cloud-Native Orchestration**.

---

## 🚀 Unique Enterprise & DevOps Highlights

Unlike conventional demo apps, this system incorporates enterprise-grade banking governance, resilience testing, and cloud-native observability:

### 1. Advanced Fintech & Enterprise Innovations
- **AI / OCR Cheque Scanning & Auto-Extraction:** Optical character recognition extracts 6-digit cheque number, IFSC, account number, and transaction code from cheque images, instantly populating presentation forms.
- **Interactive UV Light & Invert Cheque Viewer:** Zoom (up to 250%), pan, and inspect cheques under simulated Ultraviolet (UV) Blacklight to reveal fluorescent security fibers and void pantographs, or switch to Inverted Grayscale for E-13B MICR alignment verification.
- **Cryptographic Hash-Chained Audit Ledger (SHA-256):** Every clearing event is cryptographically sealed into a sequential blockchain-style SHA-256 ledger. Any manual DB tampering is flagged immediately by the built-in ledger integrity verifier.
- **Real-Time Live Clearing Feed & Settlement Ticker (SSE):** Native Server-Sent Events (`/api/events`) with zero page refreshes, audio chime alerts, animated toasts, and a live multilateral net settlement ticker.
- **ISO 20022 Banking Export & PDF Clearance Certificate:** Generates compliant `pacs.008.001.10` (credit transfer) and `pacs.002.001.12` (return message) XML documents, alongside printable official Clearance Certificates with QR verification codes and bank seals.
- **Financial Intelligence Analytics:** Interactive dashboards detailing 7-day clearing velocity, return reasons breakdown, and an interbank liquidity matrix.

### 2. Enterprise Banking Mechanics
- **Clearing Sessions & Batches:** Manage atomic clearing windows (e.g. *Standard Morning Session*, *Afternoon Session*) with session locking and atomic bulk clearing.
- **Maker-Checker Dual Authorization (4-Eyes Principle):** Cheques exceeding ₹1,00,000 or marked HIGH risk require secondary approval from an independent verifier (`checker@hdb.com`). Self-clearance by the initial maker is strictly prohibited.
- **Dynamic Fraud Risk Scoring Engine (0–100):** Real-time multi-factor scoring evaluating velocity (24h account history), amount z-score deviation, SHA-256 image fingerprint collisions, and account return history.
- **Multi-Lateral Net Settlement:** End-of-day net bilateral ledger calculation between participating financial institutions.

### 2. Full-Stack SRE & DevOps Integration
- **Live SRE & SLO Observability Console:** Interactive dashboard directly within the Admin panel tracking a **99.9% SLO Availability Target**, **Error Budget remaining**, **P50 / P95 / P99 latency percentiles**, **Mean Time to Clear (MTTC)**, and Node.js heap memory.
- **Interactive Chaos Engineering Simulator:** Live fault-injection console allowing evaluators to inject synthetic database network lag (+1200ms), 500 error storms (40% error rate), or trip the downstream circuit breaker, observing live system resilience and error budget deductions.
- **Distributed Correlation Tracing (`X-Request-Id`):** UUID tracing across all HTTP transactions and background database events.
- **Prometheus Standard Metrics (`/metrics`):** Exporting request counters, latency percentiles, and memory metrics compatible with Prometheus and Grafana.
- **Cloud-Native Probes:** Kubernetes `livenessProbe` (`/health/live`) and deep database `readinessProbe` (`/health/ready`).
- **Global Error Boundary & Telemetry:** Client-side runtime crashes are caught and dispatched to `/api/telemetry/report` for real-time monitoring.

### 3. Automated Database DevOps & Cloud-Native
- **Automated Backup & Retention Pruning:** PowerShell and Bash scripts (`scripts/backup-db.ps1`, `scripts/backup-db.sh`) creating timestamped dumps with automated 7-day retention cleanup.
- **One-Command Database Restore:** (`scripts/restore-db.ps1`, `scripts/restore-db.sh`).
- **Standalone CLI Database Health Probe:** (`scripts/db-health.js`).
- **Production Kubernetes Suite (`k8s/`):** Full manifests for Deployments, StatefulSets, PVCs, Ingress, and Horizontal Pod Autoscalers (HPA).
- **GitHub Actions Multi-Stage CI/CD (`.github/workflows/ci.yml`):** Automated linting, database migrations, Vite bundle verification, and security scanning.

---

## 🛠 Tech Stack

- **Backend:** Node.js 20, Express 4, Prisma ORM 5, PostgreSQL 16, JWT Authentication, Prometheus Exporter
- **Frontend:** React 18, Vite 5, Tailwind CSS, Axios with Interceptors, React Router 6
- **DevOps & Infra:** Docker, Docker Compose, Kubernetes, Nginx Reverse Proxy, GitHub Actions

---

## ⚡ Quick Start with Docker

Run the complete multi-tier system with one command:

```bash
docker compose up --build
```

- **Frontend Web Application:** [http://localhost:8080](http://localhost:8080)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Prometheus Metrics Feed:** [http://localhost:5000/metrics](http://localhost:5000/metrics)
- **Liveness Probe:** [http://localhost:5000/health/live](http://localhost:5000/health/live)
- **Readiness Probe:** [http://localhost:5000/health/ready](http://localhost:5000/health/ready)

---

## 🔑 Demo Role Accounts

All accounts use the password: **`password123`**

| Role | Email | Bank | Purpose |
|---|---|---|---|
| **Presenting Bank** | `presenting@snb.com` | Surat Local Bank | Cheque capture, MICR entry, risk scoring |
| **Drawee Bank (Maker)** | `drawee@hdb.com` | Horizon Digital Bank | Primary verification & clearance review |
| **Drawee Bank (Checker)** | `checker@hdb.com` | Horizon Digital Bank | **Maker-Checker 4-Eyes** secondary sign-off |
| **System Administrator** | `admin@cts.com` | System Clearing House | Operations, SRE Console, Chaos simulator, Settlement |

---

## 🧪 Interactive Testing & Evaluation Walkthrough

### 1. Test Dynamic Risk Scoring & Batch Clearing
1. Log in as `presenting@snb.com`.
2. Present a cheque with amount `₹1,50,000`, Payee `Acme Corp`, Drawee IFSC `HDFC0005678`.
3. Notice the **Risk Badge** updates dynamically and assigns the cheque to the active **Clearing Session**. Click the risk pill to inspect algorithmic risk deductions.

### 2. Test Maker-Checker 4-Eyes Governance
1. Log out and log in as `drawee@hdb.com` (Maker).
2. Find the ₹1,50,000 cheque. Click **Verify (Send to Checker)**.
3. The cheque transitions to `AWAITING_CHECKER`.
4. Try to click **Clear** with the same account: the system rejects with:
   > *"Maker-Checker Violation: The same officer cannot act as both Maker and Checker."*
5. Log out and log in as `checker@hdb.com` (Senior Approver).
6. Click **Authorize & Clear (Checker)**: the cheque transitions to `CLEARED`.

### 3. Test Live SRE Console & Chaos Engineering
1. Log in as `admin@cts.com` and open the **⚡ DevOps & SRE Console** tab.
2. Observe live **99.9% SLO Target**, **P95 Latency**, and **Resource Usage**.
3. Under **Chaos Engineering**, click **"Inject +1200ms DB Lag"**.
4. Click **"Send Live Probe"**: notice latency spikes directly on the gauge.
5. Click **"Simulate 500 Error Storm"** and observe the **Error Budget** deplete in real time.
6. Click **"Restore Normal Operations"**: the system immediately returns to green.
7. Click **"Simulate Client Error"**: notice the telemetry event captured in real time.

### 4. Database DevOps CLI Tools
Run standalone database diagnostics from your terminal:
```bash
# Database health & connection pool diagnostic:
node scripts/db-health.js

# Backup the database:
./scripts/backup-db.ps1   # Windows PowerShell
./scripts/backup-db.sh    # Linux / Bash

# Restore the database:
./scripts/restore-db.ps1
```

---

## 📁 Repository Structure

```
cts-system/
├── .github/workflows/ci.yml       # Multi-stage CI/CD pipeline
├── k8s/                           # Production Kubernetes manifests (Deployments, HPA, Ingress)
│   ├── 01-namespace.yaml
│   ├── 02-config-secret.yaml
│   ├── 03-postgres.yaml
│   ├── 04-backend.yaml
│   ├── 05-frontend.yaml
│   └── 06-ingress.yaml
├── scripts/                       # Database reliability & automation toolkit
│   ├── backup-db.ps1 / .sh
│   ├── restore-db.ps1 / .sh
│   └── db-health.js
├── docker-compose.yml             # Enhanced Docker Compose with probes and log rotation
├── backend/
│   ├── prisma/schema.prisma       # Cheque, Batch, User, Bank, FraudFlag, TelemetryEvent
│   ├── prisma/seed.js             # Demo accounts and clearing sessions
│   ├── src/
│   │   ├── controllers/           # auth, cheque, clearing, batch, settlement, devops
│   │   ├── middleware/            # tracer (X-Request-Id), chaos, auth
│   │   ├── utils/                 # metrics (Prometheus/SLO), chaos, risk scoring, micr
│   │   ├── app.js
│   │   └── server.js              # Production graceful shutdown handlers
└── frontend/
    └── src/
        ├── components/
        │   ├── DevOpsConsole.jsx       # Interactive SRE, SLO, & Chaos dashboard
        │   ├── BatchManagementPanel.jsx# Multi-session clearing management
        │   ├── RiskBadge.jsx           # Algorithmic risk visualizer modal
        │   ├── ErrorBoundary.jsx       # Client crash catcher with auto-telemetry
        │   └── ClearingStatusTable.jsx
        └── pages/
            └── AdminDashboard.jsx      # Multi-tab operations & SRE console
```

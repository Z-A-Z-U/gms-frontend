# Gate Management System (GMS) - Frontend

An enterprise-grade, modern **Gate Management System (GMS)** frontend built specifically for industrial parks and commercial business facilities.

---

## 🛠 Technology Stack

* **HTML5** (Semantic layout, OSD overlays, responsive viewports)
* **CSS3** (CSS custom properties / variables, dark sidebar, clean dashboard, SVG graphics, responsive flex/grid)
* **Vanilla JavaScript (ES6+)** (No frameworks, lightweight, zero build-step dependencies)
* **Architecture**: Ready for drop-in **PHP + MySQL** API backend integration.

---

## 🚀 Quick Launch

You can open the system directly in any modern browser without installing any dependencies or running any build scripts:

1. Double-click or open **`index.html`** in your browser.
2. It will automatically load the **Security Dashboard** (`pages/dashboard.html`).
3. You can also directly open any page in `pages/`, `admin/`, or `company/`.

> **Recommended Active Workspace:**  
> `C:\Users\hp\.gemini\antigravity\scratch\gms-frontend`

---

## 📂 Project Structure

```text
gms-frontend/
│
├── index.html                   # Root launchpad & redirect
│
├── pages/                       # Security Officer Core Operations
│   ├── dashboard.html           # Main Security Dashboard & ANPR card
│   ├── gate-monitoring.html     # Live Entry & Exit Gate Optical Feeds & Barrier Actuators
│   ├── vehicles.html            # Facility Vehicle Registry & Search/Filter
│   ├── visitors.html            # Announced vs Walk-in Visitor Desk & ID Upload
│   ├── qr-access.html           # Dedicated "Scan Visitor QR" Terminal & Two-Scan Engine
│   ├── logistics.html           # Inbound/Outbound Freight & Cargo Manifests
│   ├── items-out.html           # Asset Protection & "Verify Items Out" Checklist
│   ├── cameras.html             # 4-Camera CCTV Matrix (RTSP/WebRTC placeholders)
│   ├── access-logs.html         # Audit Logs Ledger with CSV Export & Print
│   ├── companies.html           # Park Tenant Directory & Shed Allocations
│   ├── reports.html             # Peak Hour Traffic Analytics & SVG Charts
│   └── settings.html            # ANPR Sensitivity, Barrier Delays & Reset
│
├── admin/                       # Executive & Root Admin Portal
│   ├── dashboard.html           # Global Park Metrics, Quotas & Shift Rosters
│   ├── companies.html           # Tenant Provisioning & Fleet Allocation
│   └── users.html               # Guard Users & Shift Commander Scheduling
│
├── company/                     # Tenant Company Office Portal (e.g. ABC Manufacturing)
│   ├── dashboard.html           # Tenant Visitor & Vehicle Overview
│   ├── visitors.html            # Pre-Register Upcoming Guests & Issue QR Passes
│   ├── vehicles.html            # Manage Company Fleet & Assigned Drivers
│   └── logistics.html           # Authorize Outbound Items-Out Gate Passes
│
├── css/                         # Design System & Styling
│   ├── style.css                # Base variables, typography, sidebar, top header
│   ├── components.css           # Buttons, Badges, Modals, Tables, Forms, Toasts
│   ├── dashboard.css            # ANPR cards, dual gates, camera streams, QR viewfinder
│   └── responsive.css           # Desktop, laptop, tablet, and mobile breakpoints
│
├── js/                          # Application Logic & API Layer
│   ├── app.js                   # Mock Store (LocalStorage), Centralized API Adapter Layer
│   ├── dashboard.js             # Live Stats, ANPR simulation, alerts feed
│   ├── gates.js                 # Entry/Exit barriers, camera telemetry, presets
│   ├── vehicles.js              # Vehicle CRUD, filters, modal forms
│   ├── visitors.js              # Walk-in workflow, ID upload preview, QR generation
│   ├── qr.js                    # Optical laser scan simulator, Two-Scan rule enforcement
│   ├── cameras.js               # CCTV matrix, snapshots, PTZ optical zoom
│   └── logs.js                  # Audit ledger, multi-filter, CSV generation
│
└── assets/
    ├── images/                  # Photo placeholders
    └── icons/                   # Vector graphic assets
```

---

## 🔑 Key Features & User Roles

### 1. Security Officer (Main Focus)
* **Real-time Metrics**: Live stats for *Vehicles Inside*, *Entered Today*, *Exited Today*, *Visitors Inside*, *Visitors Today*, *Pending Requests*, and *Alerts*.
* **Live Dual Gate Monitoring**: Dedicated Lane 1 (Entry Gate) and Lane 2 (Exit Gate) views with camera viewports, live OSD telemetry, barrier arm status (OPEN / CLOSED / MOVING), and manual override buttons.
* **Automatic Plate Recognition (ANPR)**: Optical character read simulation via `handlePlateDetection(plateNumber)` with realistic Ethiopian plates (`3-A12345`, `3-B54321`, `4-C67890`, `3-D11223`, `2-E99881`, `3-X99999`).
* **Visitor Clearance Desk**:
  * **Announced Visitors**: Verified pre-bookings with automated date-based QR activation.
  * **Walk-in Visitors**: Quick on-site registration form with photo ID document upload preview and instant generation of Two-Scan QR codes.
* **Dedicated QR Scanning Screen**:
  * Camera viewfinder with targeting brackets and animated scanning laser line.
  * Enforces the **Two-Scan Lifecycle Rule**:
    1. Scan 1 = **ENTRY** (`Action: OPEN GATE` -> Status becomes `Inside`)
    2. Scan 2 = **EXIT** (`Action: OPEN GATE` -> Status becomes `Expired`)
    3. Scan 3+ / Expired / Invalid = `Action: DENY ACCESS` (Alarm raised)
* **Logistics & Items Out**:
  * Digital manifests for cargo trucks.
  * Gate Pass verification with security officer physical inspection checklist before allowing outbound asset exit.
* **CCTV Surveillance Matrix**: 4-channel live matrix with snapshot capture, stream refresh, and PTZ zoom simulator.
* **Access Audit Logs**: Comprehensive ledger with instant search, multi-parameter filtering (Gate, Direction, Event Type, Result), and **one-click CSV export**.

### 2. Administrator Portal (`/admin`)
* Park-wide executive oversight over all 6 tenant companies.
* Quota management for tenant fleet vehicles.
* Security officer roster management, station lane assignments, and shift scheduling.

### 3. Tenant Company Portal (`/company`)
* Tailored for industrial tenants (e.g. *ABC Manufacturing*).
* Pre-register expected guests and automatically dispatch QR vouchers via Email or WhatsApp.
* Register company vehicles and monitor gate pass approvals for outbound equipment.

---

## 🔌 Future PHP + MySQL Backend Integration Guide

All API calls are abstracted in **`js/app.js`** inside the `GMS_API` object. Currently, they operate against an in-memory/LocalStorage store (`GMS_STORE`).

To connect to PHP and MySQL, simply update `GMS_API` to point to your PHP endpoints:

### Standard API Signatures

| JavaScript Function | Future PHP Endpoint | Method | Expected Request / Query |
|---|---|---|---|
| `getVehicleByPlate(plate)` | `/api/vehicles.php` | `GET` | `?action=lookup&plate=3-A12345` |
| `registerVisitor(data)` | `/api/visitors.php` | `POST` | `JSON: { name, phone, company, ... }` |
| `validateQR(token)` | `/api/qr.php` | `POST` | `JSON: { token: 'GMS-QR-8F3A92K1' }` |
| `openGate(gateId, reason)` | `/api/gates.php` | `POST` | `JSON: { gate: 'entry', reason: '...' }` |
| `recordGateEvent(event)` | `/api/logs.php` | `POST` | `JSON: { type, identifier, gate, ... }` |
| `getAccessLogs(filters)` | `/api/logs.php` | `GET` | `?gate=entry&direction=IN&result=...` |
| `getCompanies()` | `/api/companies.php` | `GET` | `?action=list` |
| `getCameras()` | `/api/cameras.php` | `GET` | `?action=list` |
| `getStats()` | `/api/stats.php` | `GET` | `?action=dashboard` |

### Sample MySQL Schema Draft

```sql
-- Vehicles Table
CREATE TABLE `vehicles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `plate_number` VARCHAR(20) NOT NULL UNIQUE,
  `company_id` INT NOT NULL,
  `driver_name` VARCHAR(100) NOT NULL,
  `driver_phone` VARCHAR(30),
  `vehicle_type` VARCHAR(50),
  `model` VARCHAR(100),
  `authorization_status` ENUM('Authorized', 'Denied', 'Suspended') DEFAULT 'Authorized',
  `is_inside` TINYINT(1) DEFAULT 0,
  `last_entry` DATETIME NULL,
  `last_exit` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitors & QR Tokens Table
CREATE TABLE `visitors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100),
  `company_id` INT NOT NULL,
  `plate_number` VARCHAR(20),
  `visit_date` DATE NOT NULL,
  `purpose` VARCHAR(255),
  `qr_token` VARCHAR(64) NOT NULL UNIQUE,
  `scan_count` INT DEFAULT 0,
  `status` ENUM('Scheduled', 'Active', 'Inside', 'Expired', 'Revoked') DEFAULT 'Active',
  `entry_time` DATETIME NULL,
  `exit_time` DATETIME NULL,
  `id_type` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Access Logs Ledger Table
CREATE TABLE `access_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `event_type` VARCHAR(50) NOT NULL,
  `identifier` VARCHAR(50) NOT NULL,
  `subject_name` VARCHAR(100),
  `company_name` VARCHAR(100),
  `gate_lane` VARCHAR(50) NOT NULL,
  `direction` ENUM('IN', 'OUT', 'N/A') NOT NULL,
  `method` VARCHAR(50),
  `result` ENUM('Authorized', 'Denied', 'Valid', 'Expired', 'Registered') NOT NULL,
  `gate_action` VARCHAR(100)
);
```

---

## 🇪🇹 Demo Data Context
The frontend utilizes authentic Ethiopian industrial park entities:
* **Companies**: *ABC Manufacturing* (Textiles), *XYZ Industries* (Plastics), *Ethiopian Engineering Company* (Steel/Machinery), *Sunrise Construction* (Materials), *Ethio Cement PLC*, and *Rift Valley Agro-Processing*.
* **Plates**: Standard commercial and private formats (`3-A12345`, `3-B54321`, `4-C67890`, `3-D11223`, `2-E99881`).
* **Timezone**: East Africa Time (UTC+3, EAT).

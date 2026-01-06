# PipePouch---Pipeline-Monitoring-System-MVP-
PipePouch is a **Node.js–based pipeline monitoring application** to help safeguard critical oil and gas infrastructure. It simulates, detects, and visualizes pipeline operating conditions such as pressure, flow rate, wall thickness, and rupture thresholds to support early identification of abnormal behaviour that could threaten pipeline integrity.

This project is currently an **MVP (Minimum Viable Product)** Focuses on clarity, transparency, and extensibility rather than full industrial integration, providing a practical foundation that will be later  expanded to support real sensor data, historical analysis, and commercial-scale deployment**.

---

## 🚀 Features (Current MVP)

- Real-time pipeline condition simulation
- Rupture detection logic using engineering-based thresholds
- Severity-based alerts (Normal, Warning, Alert, Critical)
- Interactive dashboard and monitoring views
- Safety score calculation
- Modular EJS-based UI with reusable layouts
- Logging with Winston (errors & combined logs)
- Secure Express setup using Helmet

---

## 🧱 Technology Stack

- **Backend:** Node.js, Express.js
- **Templating:** EJS + express-ejs-layouts
- **Frontend:** HTML, CSS, JavaScript
- **Charts:** Chart.js
- **Security:** Helmet
- **Logging:** Winston, Morgan

---

## 📁 Project Structure

```text
PipePouch/
│
├── app.js                     # Main Express server entry point and routing logic
├── package.json               # Project metadata, dependencies, and npm scripts
├── README.md                  # Project documentation and usage guide
│
├── views/
│   ├── layout.ejs              # Base HTML layout (used by express-ejs-layouts)
│   ├── index.ejs               # Dashboard overview and system summary page
│   ├── monitor.ejs             # Detailed real-time pipeline monitoring page
│   ├── alerts.ejs              # Alerts listing and alert status page
│   ├── history.ejs             # Historical data placeholder page
│   ├── settings.ejs            # System configuration placeholder page
│   ├── about.ejs               # Application overview and purpose page
│   ├── documentation.ejs       # In-app technical documentation page
│   ├── 404.ejs                 # Custom 404 (Not Found) error page
│   ├── 500.ejs                 # Custom 500 (Server Error) error page
│   └── partials/
│       └── header.ejs          # Reusable navigation header component
│
├── public/
│   ├── css/
│   │   └── style.css           # Global styles and severity-based UI theming
│   └── js/
│       ├── charts.js           # Chart.js visualizations for pressure and trends
│       ├── alerts.js           # Client-side alert handling and interactions
│       ├── monitor.js          # Real-time monitoring UI logic
│       ├── history.js          # Reserved for historical data logic (future use)
│       └── settings.js         # Reserved for configuration logic (future use)
│
├── logs/
│   ├── combined.log            # Combined application activity logs
│   └── error.log               # Error and exception logs
│
└── node_modules/               # Installed npm dependencies (auto-generated)
```

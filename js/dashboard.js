/**
 * GATE MANAGEMENT SYSTEM (GMS) - SECURITY DASHBOARD CONTROLLER
 * 
 * Handles real-time metrics, latest ANPR detection banner,
 * quick gate status indicators, and recent gate activity ledger.
 */

document.addEventListener("DOMContentLoaded", async () => {
  await renderDashboardStats();
  renderLatestANPR();
  renderRecentActivity();
  renderDashboardAlerts();
  setupANPRSimulator();
});

/**
 * 1. Fetch & display real-time statistics
 */
async function renderDashboardStats() {
  const stats = await GMS_API.getStats();

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setVal("statVehiclesInside", stats.vehiclesInside);
  setVal("statVehiclesEnteredToday", stats.vehiclesEnteredToday);
  setVal("statVehiclesExitedToday", stats.vehiclesExitedToday);
  setVal("statVisitorsInside", stats.visitorsInside);
  setVal("statVisitorsToday", stats.visitorsToday);
  setVal("statPendingRequests", stats.pendingRequests);
  setVal("statAlertsCount", stats.alertsCount);
}

/**
 * 2. Render latest ANPR vehicle detection preview
 */
function renderLatestANPR(plate = "3-A12345") {
  const state = GMS_STORE.gateStates.entryGate;

  const plateDisplay = document.getElementById("anprPlateDisplay");
  const compDisplay = document.getElementById("anprCompany");
  const driverDisplay = document.getElementById("anprDriver");
  const vehicleDisplay = document.getElementById("anprVehicle");
  const authBadge = document.getElementById("anprAuthBadge");
  const actionText = document.getElementById("anprGateAction");

  if (plateDisplay) plateDisplay.textContent = state.lastPlate || plate;
  if (compDisplay) compDisplay.textContent = state.company || "ABC Manufacturing";
  if (driverDisplay) driverDisplay.textContent = state.driver || "Abebe Kebede";
  if (vehicleDisplay) vehicleDisplay.textContent = state.vehicle || "Toyota Hilux (White)";

  if (authBadge) {
    if (state.authStatus === "AUTHORIZED") {
      authBadge.className = "gate-action-status status-authorized";
      authBadge.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        AUTHORIZED
      `;
    } else {
      authBadge.className = "gate-action-status status-denied";
      authBadge.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        ACCESS DENIED
      `;
    }
  }

  if (actionText) {
    actionText.textContent = state.authStatus === "AUTHORIZED" ? "Gate Opening • Barrier Raised" : "Gate Locked • Alarm Triggered";
  }
}

/**
 * 3. Render recent gate activity table
 */
async function renderRecentActivity() {
  const tableBody = document.getElementById("recentActivityTableBody");
  if (!tableBody) return;

  const logs = await GMS_API.getAccessLogs();
  const recentLogs = logs.slice(0, 7);

  if (recentLogs.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #94a3b8;">No recent gate activity</td></tr>`;
    return;
  }

  tableBody.innerHTML = recentLogs.map(log => {
    const isAuth = log.result === "Authorized" || log.result === "Valid";
    const resultBadgeClass = isAuth ? "badge-authorized" : "badge-denied";
    const dirBadgeClass = log.direction === "IN" ? "badge-info" : "badge-neutral";

    return `
      <tr>
        <td><span style="font-family: ui-monospace; font-weight: 600; color: #475569;">${log.timestamp.split(" ")[1] || log.timestamp}</span></td>
        <td><strong>${log.type}</strong></td>
        <td><span class="plate-badge">${log.identifier}</span></td>
        <td>${log.company}</td>
        <td>${log.gate}</td>
        <td><span class="badge ${dirBadgeClass}">${log.direction}</span></td>
        <td><span class="badge ${resultBadgeClass}">${log.result}</span></td>
      </tr>
    `;
  }).join("");
}

/**
 * 4. Render security alerts on dashboard
 */
function renderDashboardAlerts() {
  const alertsContainer = document.getElementById("dashboardAlertsList");
  if (!alertsContainer) return;

  const alerts = GMS_STORE.alerts;
  if (!alerts || alerts.length === 0) {
    alertsContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #94a3b8;">No active security alerts</div>`;
    return;
  }

  alertsContainer.innerHTML = alerts.map(a => {
    let alertClass = "badge-info";
    if (a.level === "Error") alertClass = "badge-denied";
    if (a.level === "Warning") alertClass = "badge-scheduled";

    return `
      <div style="display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); gap: 12px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge ${alertClass}">${a.level}</span>
            <strong style="font-size: 0.88rem; color: var(--text-main);">${a.title}</strong>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${a.description}</p>
          <span style="font-size: 0.72rem; color: var(--text-light);">${a.timestamp} • ${a.gate}</span>
        </div>
        ${!a.resolved ? `<button class="btn btn-sm btn-outline" onclick="resolveAlert('${a.id}')">Acknowledge</button>` : `<span class="badge badge-authorized" style="font-size: 0.68rem;">Resolved</span>`}
      </div>
    `;
  }).join("");
}

function resolveAlert(alertId) {
  const alert = GMS_STORE.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
    saveStore(GMS_STORE);
    renderDashboardAlerts();
    renderDashboardStats();
    showToast("Alert Acknowledged", `Security alert ${alertId} has been marked as resolved.`, "info");
  }
}

/**
 * 5. ANPR Quick Simulation on Dashboard
 */
function setupANPRSimulator() {
  const btnSimulate = document.getElementById("btnSimulateDashboardANPR");
  const selectPlate = document.getElementById("simDashboardPlateSelect");

  if (btnSimulate && selectPlate) {
    btnSimulate.addEventListener("click", async () => {
      const selectedPlate = selectPlate.value;
      if (!selectedPlate) return;

      // Call the centralized ANPR handler
      await handlePlateDetection(selectedPlate, "Entry Gate");
      renderLatestANPR(selectedPlate);
      await renderDashboardStats();
      renderRecentActivity();
    });
  }
}

/**
 * Central Plate Detection Handler
 * Required by specification: handlePlateDetection(plateNumber)
 * Structured to integrate cleanly with future PHP backend and ANPR camera hardware trigger.
 */
async function handlePlateDetection(plateNumber, gateName = "Entry Gate") {
  plateNumber = plateNumber.trim().toUpperCase();
  const vehicle = await GMS_API.getVehicleByPlate(plateNumber);

  const isEntry = gateName.toLowerCase().includes("entry");
  const direction = isEntry ? "IN" : "OUT";

  if (vehicle && vehicle.authorization === "Authorized" && vehicle.status === "Active") {
    // Authorized Vehicle Detected
    if (isEntry) {
      GMS_STORE.gateStates.entryGate = {
        status: "OPEN",
        lastPlate: vehicle.plateNumber,
        company: vehicle.company,
        driver: vehicle.driver,
        vehicle: vehicle.model,
        authStatus: "AUTHORIZED",
        lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      vehicle.isInside = true;
      vehicle.lastEntry = new Date().toISOString().replace("T", " ").substring(0, 16);
    } else {
      GMS_STORE.gateStates.exitGate = {
        status: "OPEN",
        lastPlate: vehicle.plateNumber,
        company: vehicle.company,
        driver: vehicle.driver,
        vehicle: vehicle.model,
        authStatus: "AUTHORIZED",
        lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      vehicle.isInside = false;
      vehicle.lastExit = new Date().toISOString().replace("T", " ").substring(0, 16);
    }

    GMS_API.recordGateEvent({
      type: "Plate Detection",
      identifier: vehicle.plateNumber,
      subjectName: `${vehicle.driver} (${vehicle.model})`,
      company: vehicle.company,
      gate: gateName,
      direction: direction,
      method: "ANPR Optical",
      result: "Authorized",
      gateAction: "Gate Opening"
    });

    saveStore(GMS_STORE);
    showToast("Vehicle Authorized", `Plate ${vehicle.plateNumber} (${vehicle.company}) authorized. Gate opening.`, "success");
    return { authorized: true, vehicle };
  } else {
    // Unauthorized / Blacklisted Vehicle Detected
    const alertId = "ALT-" + String(GMS_STORE.alerts.length + 1).padStart(2, "0");
    const newAlert = {
      id: alertId,
      title: "Unauthorized Vehicle Detected",
      description: `Unrecognized or blacklisted vehicle ${plateNumber} detected at ${gateName}.`,
      level: "Error",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      gate: gateName,
      resolved: false
    };

    GMS_STORE.alerts.unshift(newAlert);

    if (isEntry) {
      GMS_STORE.gateStates.entryGate = {
        status: "CLOSED",
        lastPlate: plateNumber,
        company: "UNAUTHORIZED / UNKNOWN",
        driver: "Unregistered",
        vehicle: "Unregistered Vehicle",
        authStatus: "DENIED",
        lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    GMS_API.recordGateEvent({
      type: "Plate Detection",
      identifier: plateNumber,
      subjectName: "Unregistered Vehicle",
      company: "Unknown",
      gate: gateName,
      direction: direction,
      method: "ANPR Optical",
      result: "Denied",
      gateAction: "Gate Locked (Access Denied)"
    });

    saveStore(GMS_STORE);
    showToast("Access Denied", `Plate ${plateNumber} is not authorized! Gate remains locked.`, "error");
    return { authorized: false, vehicle: null };
  }
}

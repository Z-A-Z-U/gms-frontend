/**
 * GATE MANAGEMENT SYSTEM (GMS) - QR ACCESS & SCANNING CONTROLLER
 * 
 * Implements the Two-Scan Lifecycle rule:
 * 1st Scan = ENTRY -> Status 'Inside' -> Action: OPEN GATE
 * 2nd Scan = EXIT -> Status 'Expired' -> Action: OPEN GATE
 * Scan 3+ / Expired / Invalid -> Action: DENY ACCESS
 * 
 * Separated Core Function: handleQRScan(qrToken) for future PHP integration.
 */

document.addEventListener("DOMContentLoaded", () => {
  renderQRDirectoryTable();
  initQRScannerTriggers();
});

/**
 * 1. Render QR Directory Ledger
 */
function renderQRDirectoryTable() {
  const tableBody = document.getElementById("qrTableBody");
  if (!tableBody) return;

  const visitors = GMS_STORE.visitors;

  tableBody.innerHTML = visitors.map(v => {
    let qrStatusBadge = "badge-valid";
    if (v.qrStatus === "Scheduled") qrStatusBadge = "badge-scheduled";
    if (v.qrStatus === "Inside") qrStatusBadge = "badge-inside";
    if (v.qrStatus === "Expired") qrStatusBadge = "badge-expired";

    return `
      <tr>
        <td>
          <div style="font-weight: 700;">${v.name}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${v.phone}</div>
        </td>
        <td><strong>${v.companyVisiting}</strong></td>
        <td><span style="font-family: ui-monospace;">${v.visitDate}</span></td>
        <td><span class="badge ${qrStatusBadge}">${v.qrStatus}</span></td>
        <td><span class="badge ${v.entryTime ? 'badge-authorized' : 'badge-neutral'}">${v.entryTime || 'Not Used'}</span></td>
        <td><span class="badge ${v.exitTime ? 'badge-authorized' : 'badge-neutral'}">${v.exitTime || 'Not Used'}</span></td>
        <td><strong style="font-family: ui-monospace; font-size: 0.95rem;">${v.scanCount} / 2</strong></td>
        <td>
          <code style="background: #f1f5f9; padding: 3px 6px; border-radius: 4px; font-size: 0.78rem;">${v.qrToken}</code>
        </td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="simulateSpecificScan('${v.qrToken}')">
            Scan Token
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

/**
 * 2. Dedicated QR Scan Handler
 * Required by specification: handleQRScan(qrToken)
 * Separated for direct connection to PHP API endpoint.
 */
async function handleQRScan(qrToken) {
  qrToken = (qrToken || "").trim().toUpperCase();
  const result = await GMS_API.validateQR(qrToken);

  const resultBadge = document.getElementById("qrScanResultBadge");
  const actionBadge = document.getElementById("qrGateActionText");
  const visitorName = document.getElementById("qrResVisitorName");
  const companyName = document.getElementById("qrResCompany");
  const dateText = document.getElementById("qrResVisitDate");
  const purposeText = document.getElementById("qrResPurpose");
  const reasonWrap = document.getElementById("qrResReasonWrap");
  const reasonText = document.getElementById("qrResReason");
  const scanCountText = document.getElementById("qrResScanCount");
  const avatarInitials = document.getElementById("qrResAvatar");

  if (result.valid) {
    // Valid Scan (Entry or Exit)
    if (resultBadge) {
      resultBadge.className = "qr-result-badge badge-authorized";
      resultBadge.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> QR VALID (${result.type})`;
    }
    if (actionBadge) {
      actionBadge.className = "gate-action-status status-authorized";
      actionBadge.textContent = "ACTION: OPEN GATE";
    }

    if (visitorName) visitorName.textContent = result.visitor.name;
    if (companyName) companyName.textContent = result.visitor.companyVisiting;
    if (dateText) dateText.textContent = result.visitor.visitDate;
    if (purposeText) purposeText.textContent = result.visitor.purpose || "Official Visit";
    if (scanCountText) scanCountText.textContent = `${result.visitor.scanCount} of 2 (Status: ${result.visitor.qrStatus})`;
    if (reasonWrap) reasonWrap.style.display = "none";

    if (avatarInitials) {
      const parts = result.visitor.name.split(" ");
      avatarInitials.textContent = parts.map(p => p[0]).join("").substring(0, 2).toUpperCase();
    }

    showToast("QR Verified", `${result.type}: ${result.visitor.name} - Gate Opening`, "success");

  } else {
    // Invalid / Expired / Denied Scan
    if (resultBadge) {
      resultBadge.className = "qr-result-badge badge-denied";
      resultBadge.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> QR INVALID`;
    }
    if (actionBadge) {
      actionBadge.className = "gate-action-status status-denied";
      actionBadge.textContent = "ACTION: DENY ACCESS";
    }

    if (result.visitor) {
      if (visitorName) visitorName.textContent = result.visitor.name;
      if (companyName) companyName.textContent = result.visitor.companyVisiting;
      if (dateText) dateText.textContent = result.visitor.visitDate;
      if (purposeText) purposeText.textContent = result.visitor.purpose;
      if (scanCountText) scanCountText.textContent = `${result.visitor.scanCount} of 2 (Status: ${result.visitor.qrStatus})`;
    } else {
      if (visitorName) visitorName.textContent = "Unknown Visitor";
      if (companyName) companyName.textContent = "Not Registered";
      if (dateText) dateText.textContent = "N/A";
      if (purposeText) purposeText.textContent = "N/A";
      if (scanCountText) scanCountText.textContent = "0 / 2";
    }

    if (reasonWrap && reasonText) {
      reasonWrap.style.display = "block";
      reasonText.textContent = result.reason;
    }

    showToast("Access Denied", result.reason, "error");
  }

  // Refresh table to reflect updated scan counts
  renderQRDirectoryTable();
  return result;
}

/**
 * 3. Setup Interactive QR Scanner Controls & Quick Simulation Buttons
 */
function initQRScannerTriggers() {
  const btnManualScan = document.getElementById("btnSubmitManualToken");
  const inputManual = document.getElementById("inputManualQRToken");

  if (btnManualScan && inputManual) {
    btnManualScan.addEventListener("click", () => {
      const token = inputManual.value.trim();
      if (!token) {
        showToast("Token Missing", "Please enter a QR Token (e.g. GMS-QR-8F3A92K1)", "warning");
        return;
      }
      handleQRScan(token);
    });
  }

  // Preset token testing buttons
  document.querySelectorAll("[data-test-token]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const token = e.currentTarget.getAttribute("data-test-token");
      if (inputManual) inputManual.value = token;
      handleQRScan(token);
    });
  });
}

function simulateSpecificScan(token) {
  const scannerCard = document.querySelector(".qr-scanner-layout");
  if (scannerCard) {
    scannerCard.scrollIntoView({ behavior: "smooth" });
  }
  const inputManual = document.getElementById("inputManualQRToken");
  if (inputManual) inputManual.value = token;
  handleQRScan(token);
}

/**
 * GATE MANAGEMENT SYSTEM (GMS) - ACCESS AUDIT LOGS CONTROLLER
 * 
 * Manages full historical audit log ledger with dynamic search,
 * multi-attribute filters, CSV export, and print formatting.
 */

let activeLogFilters = {
  search: "",
  gate: "all",
  direction: "all",
  result: "all",
  type: "all"
};

document.addEventListener("DOMContentLoaded", () => {
  renderAccessLogs();
  initLogFilters();
});

/**
 * 1. Fetch & Render Access Logs Table
 */
async function renderAccessLogs() {
  const tableBody = document.getElementById("accessLogsTableBody");
  const counter = document.getElementById("logsResultCount");
  if (!tableBody) return;

  const logs = await GMS_API.getAccessLogs(activeLogFilters);

  if (counter) counter.textContent = `Displaying ${logs.length} audit records`;

  if (logs.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: #94a3b8;">No matching gate access records found</td></tr>`;
    return;
  }

  tableBody.innerHTML = logs.map(l => {
    const isAuth = l.result === "Authorized" || l.result === "Valid" || l.result === "Registered";
    const resultBadgeClass = isAuth ? "badge-authorized" : "badge-denied";
    const dirClass = l.direction === "IN" ? "badge-info" : l.direction === "OUT" ? "badge-neutral" : "badge-neutral";

    return `
      <tr>
        <td>
          <div style="font-family: ui-monospace; font-weight: 600; font-size: 0.82rem;">${l.timestamp}</div>
          <small style="color: #64748b; font-size: 0.72rem;">${l.id}</small>
        </td>
        <td><strong>${l.type}</strong></td>
        <td>
          <span class="plate-badge">${l.identifier}</span>
          <div style="font-size: 0.75rem; color: #475569; margin-top: 2px;">${l.subjectName}</div>
        </td>
        <td><strong>${l.company}</strong></td>
        <td>${l.gate}</td>
        <td><span class="badge ${dirClass}">${l.direction}</span></td>
        <td><span style="font-size: 0.8rem; color: #64748b;">${l.method}</span></td>
        <td>
          <span class="badge ${resultBadgeClass}">${l.result}</span>
          <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">${l.gateAction}</div>
        </td>
      </tr>
    `;
  }).join("");
}

/**
 * 2. Filter Listeners
 */
function initLogFilters() {
  const searchInput = document.getElementById("logSearchInput");
  const gateSelect = document.getElementById("logGateFilter");
  const dirSelect = document.getElementById("logDirectionFilter");
  const resultSelect = document.getElementById("logResultFilter");
  const typeSelect = document.getElementById("logTypeFilter");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeLogFilters.search = e.target.value.trim();
      renderAccessLogs();
    });
  }

  if (gateSelect) {
    gateSelect.addEventListener("change", (e) => {
      activeLogFilters.gate = e.target.value;
      renderAccessLogs();
    });
  }

  if (dirSelect) {
    dirSelect.addEventListener("change", (e) => {
      activeLogFilters.direction = e.target.value;
      renderAccessLogs();
    });
  }

  if (resultSelect) {
    resultSelect.addEventListener("change", (e) => {
      activeLogFilters.result = e.target.value;
      renderAccessLogs();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", (e) => {
      activeLogFilters.type = e.target.value;
      renderAccessLogs();
    });
  }

  // Export CSV
  const btnExport = document.getElementById("btnExportLogsCSV");
  if (btnExport) {
    btnExport.addEventListener("click", exportLogsToCSV);
  }

  // Print
  const btnPrint = document.getElementById("btnPrintLogs");
  if (btnPrint) {
    btnPrint.addEventListener("click", () => {
      window.print();
    });
  }
}

/**
 * 3. CSV Export Generator
 */
async function exportLogsToCSV() {
  const logs = await GMS_API.getAccessLogs(activeLogFilters);
  if (logs.length === 0) {
    showToast("Export Notice", "No logs available to export.", "warning");
    return;
  }

  const headers = ["Log ID", "Date Time", "Type", "Identifier", "Subject Name", "Company", "Gate", "Direction", "Method", "Result", "Gate Action"];
  
  const csvRows = [headers.join(",")];

  logs.forEach(l => {
    const row = [
      l.id,
      `"${l.timestamp}"`,
      `"${l.type}"`,
      `"${l.identifier}"`,
      `"${l.subjectName}"`,
      `"${l.company}"`,
      `"${l.gate}"`,
      l.direction,
      `"${l.method}"`,
      l.result,
      `"${l.gateAction}"`
    ];
    csvRows.push(row.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `GMS_Access_Logs_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("CSV Exported", `Downloaded ${logs.length} access logs records.`, "success");
}

/**
 * GATE MANAGEMENT SYSTEM (GMS) - VEHICLE MANAGEMENT CONTROLLER
 * 
 * Manages vehicles table, live search & filtering, Add/Edit modals,
 * and view vehicle details with Ethiopian fleet data.
 */

let currentVehicleFilter = {
  search: "",
  company: "all",
  authorization: "all"
};

document.addEventListener("DOMContentLoaded", () => {
  renderVehiclesTable();
  initVehicleFilters();
  initAddVehicleModal();
  populateCompanySelects();
});

/**
 * 1. Render Vehicles Table with Search & Filter
 */
function renderVehiclesTable() {
  const tableBody = document.getElementById("vehiclesTableBody");
  const countDisplay = document.getElementById("vehicleTotalCount");
  if (!tableBody) return;

  let vehicles = [...GMS_STORE.vehicles];

  // Apply Search
  if (currentVehicleFilter.search) {
    const q = currentVehicleFilter.search.toLowerCase();
    vehicles = vehicles.filter(v => 
      v.plateNumber.toLowerCase().includes(q) ||
      v.driver.toLowerCase().includes(q) ||
      v.company.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q)
    );
  }

  // Apply Company Filter
  if (currentVehicleFilter.company !== "all") {
    vehicles = vehicles.filter(v => v.company === currentVehicleFilter.company);
  }

  // Apply Authorization Filter
  if (currentVehicleFilter.authorization !== "all") {
    vehicles = vehicles.filter(v => v.authorization === currentVehicleFilter.authorization);
  }

  if (countDisplay) countDisplay.textContent = `Showing ${vehicles.length} of ${GMS_STORE.vehicles.length} vehicles`;

  if (vehicles.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 24px; color: #94a3b8;">No matching vehicle records found</td></tr>`;
    return;
  }

  tableBody.innerHTML = vehicles.map(v => {
    const authBadgeClass = v.authorization === "Authorized" ? "badge-authorized" : "badge-denied";
    const statusBadgeClass = v.status === "Active" ? "badge-active" : "badge-danger";

    return `
      <tr>
        <td><span class="plate-badge">${v.plateNumber}</span></td>
        <td><strong>${v.company}</strong></td>
        <td>
          <div>${v.driver}</div>
          <small style="color: #64748b; font-size: 0.75rem;">${v.driverPhone}</small>
        </td>
        <td>${v.vehicleType} <br><small style="color: #64748b;">${v.model}</small></td>
        <td><span class="badge ${statusBadgeClass}">${v.status}</span></td>
        <td><span class="badge ${authBadgeClass}">${v.authorization}</span></td>
        <td><small style="font-family: ui-monospace;">${v.lastEntry}</small></td>
        <td><small style="font-family: ui-monospace;">${v.lastExit}</small></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-outline" title="View Details" onclick="viewVehicleDetails('${v.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="btn btn-sm btn-outline" title="Edit Vehicle" onclick="editVehicle('${v.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

/**
 * 2. Filter & Search Event Listeners
 */
function initVehicleFilters() {
  const searchInput = document.getElementById("vehicleSearchInput");
  const compSelect = document.getElementById("vehicleCompanyFilter");
  const authSelect = document.getElementById("vehicleAuthFilter");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentVehicleFilter.search = e.target.value.trim();
      renderVehiclesTable();
    });
  }

  if (compSelect) {
    compSelect.addEventListener("change", (e) => {
      currentVehicleFilter.company = e.target.value;
      renderVehiclesTable();
    });
  }

  if (authSelect) {
    authSelect.addEventListener("change", (e) => {
      currentVehicleFilter.authorization = e.target.value;
      renderVehiclesTable();
    });
  }
}

/**
 * 3. Populate Company Select Dropdowns
 */
function populateCompanySelects() {
  const selects = [
    document.getElementById("vehicleCompanyFilter"),
    document.getElementById("addVehCompany"),
    document.getElementById("editVehCompany")
  ];

  selects.forEach(sel => {
    if (!sel) return;
    const isFilter = sel.id.includes("Filter");
    let optionsHtml = isFilter ? `<option value="all">All Companies</option>` : `<option value="">Select Company</option>`;

    GMS_STORE.companies.forEach(c => {
      optionsHtml += `<option value="${c.name}">${c.name}</option>`;
    });

    sel.innerHTML = optionsHtml;
  });
}

/**
 * 4. Add Vehicle Modal Logic
 */
function initAddVehicleModal() {
  const form = document.getElementById("addVehicleForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const plate = document.getElementById("addVehPlate").value.trim();
    const company = document.getElementById("addVehCompany").value;
    const driver = document.getElementById("addVehDriver").value.trim();
    const phone = document.getElementById("addVehPhone").value.trim();
    const type = document.getElementById("addVehType").value;
    const model = document.getElementById("addVehModel").value.trim();
    const auth = document.getElementById("addVehAuth").value;

    if (!plate || !company || !driver) {
      showToast("Validation Error", "Please fill in all required fields.", "warning");
      return;
    }

    const newVeh = await GMS_API.addVehicle({
      plateNumber: plate,
      company: company,
      driver: driver,
      driverPhone: phone,
      vehicleType: type,
      model: model,
      authorization: auth
    });

    closeModal("addVehicleModal");
    form.reset();
    renderVehiclesTable();
    showToast("Vehicle Registered", `Vehicle ${newVeh.plateNumber} added to registry.`, "success");
  });
}

/**
 * 5. View Vehicle Details Modal
 */
function viewVehicleDetails(vehicleId) {
  const veh = GMS_STORE.vehicles.find(v => v.id === vehicleId);
  if (!veh) return;

  const content = document.getElementById("viewVehicleDetailsBody");
  if (content) {
    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
          <span class="plate-badge" style="font-size: 1.2rem; padding: 6px 14px;">${veh.plateNumber}</span>
          <span class="badge ${veh.authorization === 'Authorized' ? 'badge-authorized' : 'badge-denied'}">${veh.authorization}</span>
        </div>
        <div class="form-row">
          <div><label class="form-label">Company</label><strong>${veh.company}</strong></div>
          <div><label class="form-label">Driver Name</label><strong>${veh.driver}</strong></div>
        </div>
        <div class="form-row">
          <div><label class="form-label">Driver Phone</label><span>${veh.driverPhone}</span></div>
          <div><label class="form-label">Vehicle Type</label><span>${veh.vehicleType}</span></div>
        </div>
        <div class="form-row">
          <div><label class="form-label">Model & Color</label><span>${veh.model}</span></div>
          <div><label class="form-label">Current Status</label><span>${veh.status} (${veh.isInside ? 'Currently Inside' : 'Outside Facility'})</span></div>
        </div>
        <div class="form-row">
          <div><label class="form-label">Last Facility Entry</label><span>${veh.lastEntry}</span></div>
          <div><label class="form-label">Last Facility Exit</label><span>${veh.lastExit}</span></div>
        </div>
      </div>
    `;
  }

  openModal("viewVehicleModal");
}

/**
 * 6. Edit Vehicle Modal
 */
function editVehicle(vehicleId) {
  const veh = GMS_STORE.vehicles.find(v => v.id === vehicleId);
  if (!veh) return;

  document.getElementById("editVehId").value = veh.id;
  document.getElementById("editVehPlate").value = veh.plateNumber;
  document.getElementById("editVehCompany").value = veh.company;
  document.getElementById("editVehDriver").value = veh.driver;
  document.getElementById("editVehPhone").value = veh.driverPhone;
  document.getElementById("editVehType").value = veh.vehicleType;
  document.getElementById("editVehModel").value = veh.model;
  document.getElementById("editVehAuth").value = veh.authorization;

  openModal("editVehicleModal");
}

const editForm = document.getElementById("editVehicleForm");
if (editForm) {
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("editVehId").value;
    const veh = GMS_STORE.vehicles.find(v => v.id === id);
    if (!veh) return;

    veh.plateNumber = document.getElementById("editVehPlate").value.trim().toUpperCase();
    veh.company = document.getElementById("editVehCompany").value;
    veh.driver = document.getElementById("editVehDriver").value.trim();
    veh.driverPhone = document.getElementById("editVehPhone").value.trim();
    veh.vehicleType = document.getElementById("editVehType").value;
    veh.model = document.getElementById("editVehModel").value.trim();
    veh.authorization = document.getElementById("editVehAuth").value;

    saveStore(GMS_STORE);
    closeModal("editVehicleModal");
    renderVehiclesTable();
    showToast("Vehicle Updated", `Record for ${veh.plateNumber} has been updated.`, "success");
  });
}

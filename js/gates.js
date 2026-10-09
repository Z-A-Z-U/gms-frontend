/**
 * GATE MANAGEMENT SYSTEM (GMS) - LIVE GATE MONITORING CONTROLLER
 * 
 * Manages Entry Gate & Exit Gate live monitoring, camera overlays,
 * ANPR plate detection triggers, barrier arm animations, and manual override.
 */

document.addEventListener("DOMContentLoaded", () => {
  renderGateStates();
  initGateSimulators();
  initCameraClocks();
});

/**
 * 1. Render Entry and Exit Gate states in the UI
 */
function renderGateStates() {
  const entry = GMS_STORE.gateStates.entryGate;
  const exit = GMS_STORE.gateStates.exitGate;

  // ENTRY GATE
  updateGateCard("entry", entry);

  // EXIT GATE
  updateGateCard("exit", exit);
}

function updateGateCard(gateType, data) {
  const isEntry = gateType === "entry";
  const prefix = isEntry ? "entry" : "exit";

  // Elements
  const statusBadge = document.getElementById(`${prefix}GateStatusBadge`);
  const plateText = document.getElementById(`${prefix}DetectedPlate`);
  const compText = document.getElementById(`${prefix}Company`);
  const driverText = document.getElementById(`${prefix}Driver`);
  const vehicleText = document.getElementById(`${prefix}Vehicle`);
  const authBadge = document.getElementById(`${prefix}AuthBadge`);
  const timeText = document.getElementById(`${prefix}Time`);
  const barrierArm = document.getElementById(`${prefix}BarrierArm`);

  if (statusBadge) {
    statusBadge.textContent = data.status;
    statusBadge.className = `gate-physical-state state-${data.status.toLowerCase()}`;
  }

  if (plateText) plateText.textContent = data.lastPlate || "---";
  if (compText) compText.textContent = data.company || "---";
  if (driverText) driverText.textContent = data.driver || "---";
  if (vehicleText) vehicleText.textContent = data.vehicle || "---";
  if (timeText) timeText.textContent = data.lastTime || "--:--";

  if (authBadge) {
    authBadge.textContent = data.authStatus;
    authBadge.className = data.authStatus === "AUTHORIZED" ? "badge badge-authorized" : "badge badge-denied";
  }

  // Physical barrier visual arm
  if (barrierArm) {
    if (data.status === "OPEN") {
      barrierArm.classList.add("arm-open");
    } else {
      barrierArm.classList.remove("arm-open");
    }
  }
}

/**
 * 2. Manual Barrier Control
 */
async function triggerManualGate(gateType, action) {
  const gateTitle = gateType === "entry" ? "Entry Gate" : "Exit Gate";
  const barrierArm = document.getElementById(`${gateType}BarrierArm`);

  if (action === "OPEN") {
    // Show moving state briefly
    const stateBadge = document.getElementById(`${gateType}GateStatusBadge`);
    if (stateBadge) {
      stateBadge.textContent = "MOVING";
      stateBadge.className = "gate-physical-state state-moving";
    }

    setTimeout(async () => {
      await GMS_API.openGate(gateType, "Security Manual Override Button");
      renderGateStates();
      showToast("Barrier Gate Opened", `${gateTitle} has been raised by manual command.`, "success");
    }, 600);

  } else {
    const stateBadge = document.getElementById(`${gateType}GateStatusBadge`);
    if (stateBadge) {
      stateBadge.textContent = "MOVING";
      stateBadge.className = "gate-physical-state state-moving";
    }

    setTimeout(async () => {
      await GMS_API.closeGate(gateType);
      renderGateStates();
      showToast("Barrier Gate Closed", `${gateTitle} barrier arm lowered and locked.`, "info");
    }, 600);
  }
}

/**
 * 3. ANPR Simulation Handlers for Entry and Exit
 */
function initGateSimulators() {
  // Preset simulation buttons
  document.querySelectorAll("[data-sim-plate]").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const plate = e.currentTarget.getAttribute("data-sim-plate");
      const gateType = e.currentTarget.getAttribute("data-sim-gate") || "entry";
      const gateTitle = gateType === "entry" ? "Entry Gate" : "Exit Gate";

      await handlePlateDetection(plate, gateTitle);
      renderGateStates();
    });
  });

  // Custom plate form trigger
  const btnCustomSim = document.getElementById("btnTriggerCustomPlate");
  const inputCustom = document.getElementById("inputCustomPlate");
  const selectGate = document.getElementById("selectCustomGate");

  if (btnCustomSim && inputCustom) {
    btnCustomSim.addEventListener("click", async () => {
      const plate = inputCustom.value.trim();
      const gateTitle = selectGate ? selectGate.value : "Entry Gate";
      if (!plate) {
        showToast("Input Required", "Please type a vehicle plate number to simulate.", "warning");
        return;
      }

      await handlePlateDetection(plate, gateTitle);
      renderGateStates();
      inputCustom.value = "";
    });
  }
}

/**
 * 4. Camera OSD Timestamp Clock
 */
function initCameraClocks() {
  const updateCamTime = () => {
    const now = new Date();
    const isoTime = now.toISOString().replace("T", " ").substring(0, 19);
    document.querySelectorAll(".cam-timestamp").forEach(el => {
      el.textContent = isoTime + " UTC+3";
    });
  };
  updateCamTime();
  setInterval(updateCamTime, 1000);
}

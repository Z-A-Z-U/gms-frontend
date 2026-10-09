/**
 * GATE MANAGEMENT SYSTEM (GMS) - CCTV CAMERA MATRIX CONTROLLER
 * 
 * Manages CCTV camera placeholders, OSD telemetry, PTZ controls,
 * snapshots, and stream protocol placeholders (RTSP/WebRTC/HLS).
 */

document.addEventListener("DOMContentLoaded", () => {
  renderCamerasGrid();
  initCameraClocks();
});

/**
 * 1. Render Cameras Matrix
 */
async function renderCamerasGrid() {
  const container = document.getElementById("camerasMatrixContainer");
  if (!container) return;

  const cameras = await GMS_API.getCameras();

  container.innerHTML = cameras.map(cam => {
    return `
      <div class="cctv-card" id="card-${cam.id}">
        <div class="cctv-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="cam-live-badge"><span style="width:5px; height:5px; border-radius:50%; background:#fff;"></span> LIVE</span>
            <span>${cam.name}</span>
          </div>
          <span class="badge badge-authorized" style="font-size:0.68rem;">${cam.status}</span>
        </div>

        <div class="camera-stream-box" style="aspect-ratio: 16/10;">
          <div class="camera-canvas-sim">
            <div class="camera-reticle">
              <div class="reticle-corner tl"></div>
              <div class="reticle-corner tr"></div>
              <div class="reticle-corner bl"></div>
              <div class="reticle-corner br"></div>
              <div class="camera-vehicle-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span style="font-size: 0.78rem; letter-spacing: 0.5px;">STREAM PROTOCOL: ${cam.streamProtocol}</span>
                <span style="font-size: 0.68rem; color: #64748b;">${cam.ip} • ${cam.resolution}</span>
              </div>
            </div>
          </div>

          <div class="camera-overlay-top">
            <span class="cam-name-tag">${cam.id} | ${cam.gate}</span>
            <span class="cam-fps">${cam.fps}</span>
          </div>

          <div class="camera-overlay-bottom">
            <span class="cam-timestamp">${new Date().toISOString().replace('T', ' ').substring(0, 19)} EAT</span>
            <span style="font-size: 0.68rem; color: #38bdf8; background: rgba(0,0,0,0.6); padding: 2px 6px; border-radius: 3px;">UPTIME: ${cam.uptime}</span>
          </div>
        </div>

        <div class="cctv-toolbar">
          <div class="cctv-btn-group">
            <button class="cctv-btn" onclick="captureSnapshot('${cam.name}')" title="Snapshot Frame">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Snapshot
            </button>
            <button class="cctv-btn" onclick="reconnectStream('${cam.name}')" title="Reload Feed">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Sync
            </button>
          </div>

          <div class="cctv-btn-group">
            <button class="cctv-btn" onclick="adjustZoom('${cam.name}', 'IN')" title="Digital Zoom In">+</button>
            <button class="cctv-btn" onclick="adjustZoom('${cam.name}', 'OUT')" title="Digital Zoom Out">-</button>
            <button class="cctv-btn" onclick="toggleFullscreenStream('card-${cam.id}')" title="Fullscreen">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * 2. Camera Controls & Helpers
 */
function captureSnapshot(camName) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  showToast("Snapshot Saved", `Still frame from [${camName}] captured to /snapshots/${ts}.jpg`, "success");
}

function reconnectStream(camName) {
  showToast("Stream Reconnecting", `Re-negotiating RTSP/WebRTC handshake for ${camName}...`, "info");
}

function adjustZoom(camName, dir) {
  showToast("PTZ Optical Zoom", `${camName}: Zoom level adjusted ${dir}.`, "info");
}

function toggleFullscreenStream(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (!document.fullscreenElement) {
    el.requestFullscreen().catch(err => {
      showToast("Fullscreen Error", "Could not enter fullscreen mode.", "warning");
    });
  } else {
    document.exitFullscreen();
  }
}

function initCameraClocks() {
  setInterval(() => {
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + " EAT";
    document.querySelectorAll(".cam-timestamp").forEach(el => el.textContent = timeStr);
  }, 1000);
}

/**
 * GATE MANAGEMENT SYSTEM (GMS) - CORE APPLICATION & API SERVICE LAYER
 * 
 * Technology: Pure Vanilla JavaScript (ES6+)
 * Backend Preparation: Structured for direct transition to PHP + MySQL endpoints.
 */

// ============================================================================
// 1. INITIAL MOCK DATABASE (Stored in LocalStorage for persistence across pages)
// ============================================================================

const DEFAULT_GMS_DATA = {
  // Ethiopian Industrial Park Tenant Companies
  companies: [
    {
      id: "COMP-001",
      name: "ABC Manufacturing",
      category: "Textiles & Garments",
      contactPerson: "Solomon Tadesse",
      phone: "+251 91 123 4567",
      email: "info@abc-mfg.et",
      building: "Shed 4, Zone A",
      vehicleCount: 8,
      activeVisitors: 3,
      status: "Active"
    },
    {
      id: "COMP-002",
      name: "XYZ Industries",
      category: "Plastics & Packaging",
      contactPerson: "Bethlehem Haile",
      phone: "+251 92 345 6789",
      email: "security@xyz-ind.et",
      building: "Shed 7, Zone B",
      vehicleCount: 6,
      activeVisitors: 1,
      status: "Active"
    },
    {
      id: "COMP-003",
      name: "Ethiopian Engineering Company",
      category: "Machinery & Steel Fabrication",
      contactPerson: "Kassahun Desta",
      phone: "+251 93 456 7890",
      email: "gate@eec-steel.et",
      building: "Heavy Shed 12, Zone C",
      vehicleCount: 14,
      activeVisitors: 4,
      status: "Active"
    },
    {
      id: "COMP-004",
      name: "Sunrise Construction",
      category: "Building Materials & Heavy Fleet",
      contactPerson: "Mulugeta Assefa",
      phone: "+251 91 765 4321",
      email: "logistics@sunrise-et.com",
      building: "Yard 2, East Gate",
      vehicleCount: 11,
      activeVisitors: 2,
      status: "Active"
    },
    {
      id: "COMP-005",
      name: "Ethio Cement PLC",
      category: "Cement & Aggregates",
      contactPerson: "Genet Worku",
      phone: "+251 92 888 9900",
      email: "dispatch@ethiocement.et",
      building: "Bulk Terminal 1",
      vehicleCount: 19,
      activeVisitors: 0,
      status: "Active"
    },
    {
      id: "COMP-006",
      name: "Rift Valley Agro-Processing",
      category: "Food, Grain & Oil Packaging",
      contactPerson: "Tariku Kebede",
      phone: "+251 94 555 1212",
      email: "operations@riftvalleyagro.et",
      building: "Shed 9, Agro Zone",
      vehicleCount: 5,
      activeVisitors: 1,
      status: "Active"
    }
  ],

  // Registered Fleet and Tenant Vehicles (Realistic Ethiopian Plates)
  vehicles: [
    {
      id: "VEH-101",
      plateNumber: "3-A12345",
      company: "ABC Manufacturing",
      driver: "Abebe Kebede",
      driverPhone: "+251 91 111 2233",
      vehicleType: "Pickup",
      model: "Toyota Hilux (White)",
      authorization: "Authorized",
      status: "Active",
      isInside: true,
      lastEntry: "2026-09-25 08:14",
      lastExit: "2026-09-24 17:30"
    },
    {
      id: "VEH-102",
      plateNumber: "3-B54321",
      company: "XYZ Industries",
      driver: "Dawit Alemu",
      driverPhone: "+251 92 222 3344",
      vehicleType: "Light Truck",
      model: "Isuzu NPR (Blue)",
      authorization: "Authorized",
      status: "Active",
      isInside: false,
      lastEntry: "2026-09-24 14:10",
      lastExit: "2026-09-25 11:22"
    },
    {
      id: "VEH-103",
      plateNumber: "4-C67890",
      company: "Sunrise Construction",
      driver: "Chala Tadesse",
      driverPhone: "+251 93 333 4455",
      vehicleType: "Heavy Tipper",
      model: "Sinotruk Howo 371",
      authorization: "Authorized",
      status: "Active",
      isInside: true,
      lastEntry: "2026-09-25 09:45",
      lastExit: "2026-09-24 16:15"
    },
    {
      id: "VEH-104",
      plateNumber: "3-D11223",
      company: "Ethiopian Engineering Company",
      driver: "Yohannes Girma",
      driverPhone: "+251 94 444 5566",
      vehicleType: "SUV",
      model: "Ford Ranger Wildtrak",
      authorization: "Authorized",
      status: "Active",
      isInside: true,
      lastEntry: "2026-09-25 07:55",
      lastExit: "2026-09-24 18:05"
    },
    {
      id: "VEH-105",
      plateNumber: "2-E99881",
      company: "Ethio Cement PLC",
      driver: "Almaz Bekele",
      driverPhone: "+251 91 555 6677",
      vehicleType: "Flatbed Truck",
      model: "Mitsubishi Fuso Fighter",
      authorization: "Authorized",
      status: "Active",
      isInside: false,
      lastEntry: "2026-09-23 10:20",
      lastExit: "2026-09-24 15:40"
    },
    {
      id: "VEH-106",
      plateNumber: "3-X99999",
      company: "Blacklisted / Unknown",
      driver: "Unregistered Driver",
      driverPhone: "N/A",
      vehicleType: "Sedan",
      model: "Toyota Corolla (Grey)",
      authorization: "Denied",
      status: "Suspended",
      isInside: false,
      lastEntry: "N/A",
      lastExit: "N/A"
    }
  ],

  // Visitors (Announced & Walk-ins)
  visitors: [
    {
      id: "VIS-001",
      name: "John Smith",
      phone: "+251 91 700 8090",
      email: "jsmith@global-advisory.com",
      companyVisiting: "ABC Manufacturing",
      plateNumber: "3-A12345",
      type: "Announced",
      visitDate: "2026-09-25",
      purpose: "Technical Audit & Inspection",
      qrToken: "GMS-QR-8F3A92K1",
      scanCount: 1, // 1st scan done (Entry)
      qrStatus: "Inside", // Scheduled, Active, Inside, Expired, Invalid
      entryTime: "2026-09-25 08:35",
      exitTime: null,
      idType: "Passport / Foreign ID",
      registeredBy: "ABC Receptionist"
    },
    {
      id: "VIS-002",
      name: "Meron Tesfaye",
      phone: "+251 92 110 3344",
      email: "meron.t@taxconsult.et",
      companyVisiting: "XYZ Industries",
      plateNumber: "3-B98765",
      type: "Announced",
      visitDate: "2026-09-25",
      purpose: "Financial Audit Q3",
      qrToken: "GMS-QR-4B7C19M3",
      scanCount: 0,
      qrStatus: "Active", // Ready to enter today
      entryTime: null,
      exitTime: null,
      idType: "National ID (Kebele)",
      registeredBy: "Bethlehem Haile"
    },
    {
      id: "VIS-003",
      name: "Dr. Samuel Kassa",
      phone: "+251 93 888 2211",
      email: "samuel.kassa@aau.edu.et",
      companyVisiting: "Ethiopian Engineering Company",
      plateNumber: "3-D55667",
      type: "Announced",
      visitDate: "2026-10-02",
      purpose: "R&D Metallurgy Review",
      qrToken: "GMS-QR-9D2E84P7",
      scanCount: 0,
      qrStatus: "Scheduled", // Future date
      entryTime: null,
      exitTime: null,
      idType: "University Staff ID",
      registeredBy: "Kassahun Desta"
    },
    {
      id: "VIS-004",
      name: "Hanna Wolde",
      phone: "+251 91 444 7799",
      email: "hanna.w@supplier-raw.et",
      companyVisiting: "Sunrise Construction",
      plateNumber: "3-E33445",
      type: "Walk-in",
      visitDate: "2026-09-25",
      purpose: "Urgent Invoice Submission",
      qrToken: "GMS-QR-6A5F33L2",
      scanCount: 2, // Used for Entry and Exit
      qrStatus: "Expired",
      entryTime: "2026-09-25 09:10",
      exitTime: "2026-09-25 11:30",
      idType: "Driver License",
      registeredBy: "Officer Tadesse (Gate 1)"
    },
    {
      id: "VIS-005",
      name: "Brook Mulugeta",
      phone: "+251 94 666 9922",
      email: "brook.m@ethiofreight.com",
      companyVisiting: "Ethio Cement PLC",
      plateNumber: "2-E99881",
      type: "Walk-in",
      visitDate: "2026-09-25",
      purpose: "Dispatch Manifest Signoff",
      qrToken: "GMS-QR-7K1J44N8",
      scanCount: 1,
      qrStatus: "Inside",
      entryTime: "2026-09-25 10:15",
      exitTime: null,
      idType: "National ID",
      registeredBy: "Officer Girma (Gate 2)"
    }
  ],

  // Logistics & Inbound/Outbound Freight Records
  logistics: [
    {
      id: "LOG-501",
      plate: "3-A12345",
      company: "ABC Manufacturing",
      driver: "Abebe Kebede",
      goods: "20 Boxes of Industrial Sewing Machines & Spare Parts",
      quantity: "20 Units",
      direction: "IN",
      timestamp: "2026-09-25 08:20",
      status: "Verified",
      waybillNumber: "WB-2026-0914",
      verifiedBy: "Officer Tadesse"
    },
    {
      id: "LOG-502",
      plate: "4-C67890",
      company: "Sunrise Construction",
      driver: "Chala Tadesse",
      goods: "Crushed Aggregate & Reinforcement Steel Bars",
      quantity: "28 Tons",
      direction: "IN",
      timestamp: "2026-09-25 09:50",
      status: "Verified",
      waybillNumber: "WB-2026-0919",
      verifiedBy: "Officer Tadesse"
    },
    {
      id: "LOG-503",
      plate: "3-B54321",
      company: "XYZ Industries",
      driver: "Dawit Alemu",
      goods: "Finished High-Density Polyethylene Crates (Packaged)",
      quantity: "1,200 Crates",
      direction: "OUT",
      timestamp: "2026-09-25 11:20",
      status: "Verified",
      waybillNumber: "WB-2026-0922",
      verifiedBy: "Officer Girma"
    },
    {
      id: "LOG-504",
      plate: "2-E99881",
      company: "Ethio Cement PLC",
      driver: "Almaz Bekele",
      goods: "Bulk Portland Cement (50kg Bags)",
      quantity: "400 Bags",
      direction: "IN",
      timestamp: "2026-09-25 13:05",
      status: "Pending Inspection",
      waybillNumber: "WB-2026-0930",
      verifiedBy: "Pending"
    }
  ],

  // Items Out (Gate Pass / Facility Exit Clearance)
  itemsOut: [
    {
      id: "ITEM-801",
      vehicle: "3-B54321",
      company: "XYZ Industries",
      driver: "Dawit Alemu",
      item: "4 Industrial Injection Molding Molds (Sent for Precision CNC Tooling)",
      quantity: "4 Steel Molds",
      authorizedBy: "Bethlehem Haile (Plant Manager)",
      securityOfficer: "Officer Girma Haile",
      timestamp: "2026-09-25 11:15",
      status: "Verified & Cleared",
      gatePassNo: "GP-2026-041"
    },
    {
      id: "ITEM-802",
      vehicle: "3-A12345",
      company: "ABC Manufacturing",
      driver: "Abebe Kebede",
      item: "Defective Electronic Fabric Laser Cutter Controller (Repair Return)",
      quantity: "1 Electronic Unit",
      authorizedBy: "Solomon Tadesse (Tech Director)",
      securityOfficer: "Pending Verification",
      timestamp: "2026-09-25 14:00",
      status: "Pending Verification",
      gatePassNo: "GP-2026-044"
    },
    {
      id: "ITEM-803",
      vehicle: "3-D11223",
      company: "Ethiopian Engineering Company",
      driver: "Yohannes Girma",
      item: "Hydraulic Pump Testing Rig & Calibrated Pressure Gauges",
      quantity: "2 Cases",
      authorizedBy: "Kassahun Desta",
      securityOfficer: "Officer Tadesse Belay",
      timestamp: "2026-09-24 16:30",
      status: "Verified & Cleared",
      gatePassNo: "GP-2026-039"
    }
  ],

  // CCTV Gate Camera Directory
  cameras: [
    {
      id: "CAM-01",
      name: "Entry ANPR Camera",
      gate: "Main Entry Gate",
      ip: "192.168.10.101",
      resolution: "4K UHD (3840x2160)",
      fps: "30 FPS",
      streamProtocol: "RTSP / WebRTC",
      status: "ONLINE",
      uptime: "99.9%"
    },
    {
      id: "CAM-02",
      name: "Exit ANPR Camera",
      gate: "Main Exit Gate",
      ip: "192.168.10.102",
      resolution: "4K UHD (3840x2160)",
      fps: "30 FPS",
      streamProtocol: "RTSP / WebRTC",
      status: "ONLINE",
      uptime: "99.8%"
    },
    {
      id: "CAM-03",
      name: "Visitor QR Terminal Camera",
      gate: "Pedestrian / Reception Gate",
      ip: "192.168.10.103",
      resolution: "1080p Full HD",
      fps: "25 FPS",
      streamProtocol: "HLS / WebRTC",
      status: "ONLINE",
      uptime: "100%"
    },
    {
      id: "CAM-04",
      name: "Perimeter & Barrier Overview",
      gate: "North Gate Plaza",
      ip: "192.168.10.104",
      resolution: "1080p PTZ",
      fps: "30 FPS",
      streamProtocol: "RTSP",
      status: "ONLINE",
      uptime: "99.5%"
    }
  ],

  // Master Access Logs (Plate Detections, QR Scans, Barrier Operations)
  accessLogs: [
    {
      id: "LOG-9001",
      timestamp: "2026-09-25 14:15:32",
      type: "Plate Detection",
      identifier: "3-A12345",
      subjectName: "Abebe Kebede (Toyota Hilux)",
      company: "ABC Manufacturing",
      gate: "Entry Gate",
      direction: "IN",
      method: "ANPR Optical",
      result: "Authorized",
      gateAction: "Gate Opened"
    },
    {
      id: "LOG-9002",
      timestamp: "2026-09-25 13:42:10",
      type: "QR Scan",
      identifier: "GMS-QR-8F3A92K1",
      subjectName: "John Smith",
      company: "ABC Manufacturing",
      gate: "Pedestrian Gate 1",
      direction: "IN",
      method: "QR Scanner",
      result: "Valid",
      gateAction: "Gate Opened"
    },
    {
      id: "LOG-9003",
      timestamp: "2026-09-25 11:22:45",
      type: "Plate Detection",
      identifier: "3-B54321",
      subjectName: "Dawit Alemu (Isuzu Truck)",
      company: "XYZ Industries",
      gate: "Exit Gate",
      direction: "OUT",
      method: "ANPR Optical",
      result: "Authorized",
      gateAction: "Gate Opened"
    },
    {
      id: "LOG-9004",
      timestamp: "2026-09-25 11:30:18",
      type: "QR Scan",
      identifier: "GMS-QR-6A5F33L2",
      subjectName: "Hanna Wolde",
      company: "Sunrise Construction",
      gate: "Exit Gate",
      direction: "OUT",
      method: "QR Scanner",
      result: "Valid",
      gateAction: "Gate Opened (QR Expired)"
    },
    {
      id: "LOG-9005",
      timestamp: "2026-09-25 10:15:04",
      type: "Plate Detection",
      identifier: "3-X99999",
      subjectName: "Unregistered Vehicle",
      company: "Unknown",
      gate: "Entry Gate",
      direction: "IN",
      method: "ANPR Optical",
      result: "Denied",
      gateAction: "Gate Locked (Alert Raised)"
    },
    {
      id: "LOG-9006",
      timestamp: "2026-09-25 09:45:12",
      type: "Plate Detection",
      identifier: "4-C67890",
      subjectName: "Chala Tadesse (Sinotruk)",
      company: "Sunrise Construction",
      gate: "Entry Gate",
      direction: "IN",
      method: "ANPR Optical",
      result: "Authorized",
      gateAction: "Gate Opened"
    },
    {
      id: "LOG-9007",
      timestamp: "2026-09-25 07:55:00",
      type: "Plate Detection",
      identifier: "3-D11223",
      subjectName: "Yohannes Girma (Ford Ranger)",
      company: "Ethiopian Engineering Company",
      gate: "Entry Gate",
      direction: "IN",
      method: "ANPR Optical",
      result: "Authorized",
      gateAction: "Gate Opened"
    }
  ],

  // System Security Alerts
  alerts: [
    {
      id: "ALT-01",
      title: "Unauthorized Vehicle Detected",
      description: "Plate 3-X99999 detected at Main Entry Gate without active authorization credential.",
      level: "Error",
      timestamp: "2026-09-25 10:15:04",
      gate: "Entry Gate",
      resolved: false
    },
    {
      id: "ALT-02",
      title: "Item-Out Gate Pass Pending Verification",
      description: "ABC Manufacturing has 1 outbound laser cutting unit awaiting security sign-off at Exit Gate.",
      level: "Warning",
      timestamp: "2026-09-25 14:02:10",
      gate: "Exit Gate",
      resolved: false
    },
    {
      id: "ALT-03",
      title: "Visitor QR Second Scan Completed",
      description: "Visitor Hanna Wolde completed exit checkout. QR Token GMS-QR-6A5F33L2 marked EXPIRED.",
      level: "Information",
      timestamp: "2026-09-25 11:30:18",
      gate: "Exit Gate",
      resolved: true
    },
    {
      id: "ALT-04",
      title: "Scheduled Maintenance Notification",
      description: "North Gate hydraulic arm oil pressure routine inspection scheduled tonight at 23:00.",
      level: "Information",
      timestamp: "2026-09-25 07:00:00",
      gate: "All Gates",
      resolved: true
    }
  ],

  // Gate Hardware Simulation States
  gateStates: {
    entryGate: {
      status: "OPEN", // OPEN, CLOSED, MOVING
      lastPlate: "3-A12345",
      company: "ABC Manufacturing",
      driver: "Abebe Kebede",
      vehicle: "Toyota Hilux (White)",
      authStatus: "AUTHORIZED",
      lastTime: "14:15"
    },
    exitGate: {
      status: "OPEN",
      lastPlate: "3-B54321",
      company: "XYZ Industries",
      driver: "Dawit Alemu",
      vehicle: "Isuzu NPR (Blue)",
      authStatus: "AUTHORIZED",
      lastTime: "11:22"
    }
  }
};

// ============================================================================
// 2. DATA STORE INITIALIZATION & LOCALSTORAGE SYNC
// ============================================================================

const GMS_STORAGE_KEY = "GMS_ENTERPRISE_DATA_V1";

function loadStore() {
  try {
    const raw = localStorage.getItem(GMS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not parse LocalStorage data, using defaults.", e);
  }
  // Initialize with default
  localStorage.setItem(GMS_STORAGE_KEY, JSON.stringify(DEFAULT_GMS_DATA));
  return JSON.parse(JSON.stringify(DEFAULT_GMS_DATA));
}

function saveStore(data) {
  try {
    localStorage.setItem(GMS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed saving to LocalStorage", e);
  }
}

// Global active in-memory data
let GMS_STORE = loadStore();

// ============================================================================
// 3. BACKEND INTEGRATION PREPARATION (STANDARDIZED API ADAPTER LAYER)
// ============================================================================

/**
 * PHP BACKEND NOTE:
 * When PHP endpoints are created, simply uncomment the fetch() requests
 * and return the parsed JSON response. The frontend components interact
 * exclusively through these functions.
 */

const GMS_API = {
  /**
   * Look up vehicle information by Ethiopian plate number.
   * Future PHP route: GET /api/vehicles/lookup.php?plate={plateNumber}
   * @param {string} plateNumber 
   * @returns {Promise<Object|null>}
   */
  async getVehicleByPlate(plateNumber) {
    /* FUTURE PHP IMPLEMENTATION:
    try {
      const resp = await fetch(`../api/vehicles.php?action=lookup&plate=${encodeURIComponent(plateNumber)}`);
      return await resp.json();
    } catch(err) {
      console.error("API error", err);
      return null;
    }
    */

    // CURRENT FRONTEND DEMO DATA:
    plateNumber = (plateNumber || "").trim().toUpperCase();
    const found = GMS_STORE.vehicles.find(v => v.plateNumber.toUpperCase() === plateNumber);
    return found || null;
  },

  /**
   * Register a new announced or walk-in visitor.
   * Future PHP route: POST /api/visitors/register.php
   * @param {Object} visitorData 
   * @returns {Promise<Object>}
   */
  async registerVisitor(visitorData) {
    /* FUTURE PHP IMPLEMENTATION:
    const resp = await fetch('../api/visitors.php?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData)
    });
    return await resp.json();
    */

    // Generate safe mock QR Token
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    const qrToken = `GMS-QR-${randomHex}`;

    const newVisitor = {
      id: "VIS-" + String(GMS_STORE.visitors.length + 1).padStart(3, "0"),
      name: visitorData.name,
      phone: visitorData.phone,
      email: visitorData.email || "N/A",
      companyVisiting: visitorData.companyVisiting,
      plateNumber: visitorData.plateNumber || "N/A",
      type: visitorData.type || "Walk-in",
      visitDate: visitorData.visitDate || new Date().toISOString().split("T")[0],
      purpose: visitorData.purpose || "Business Meeting",
      qrToken: qrToken,
      scanCount: 0,
      qrStatus: "Active", // For walk-ins arriving today, immediately Active
      entryTime: null,
      exitTime: null,
      idType: visitorData.idType || "National ID",
      registeredBy: visitorData.registeredBy || "Gate Security Officer"
    };

    GMS_STORE.visitors.unshift(newVisitor);

    // Also log this event
    GMS_API.recordGateEvent({
      type: "Visitor Registration",
      identifier: qrToken,
      subjectName: newVisitor.name,
      company: newVisitor.companyVisiting,
      gate: "Visitor Terminal",
      direction: "N/A",
      method: "Manual Desk Register",
      result: "Registered",
      gateAction: "QR Generated"
    });

    saveStore(GMS_STORE);
    return { success: true, visitor: newVisitor };
  },

  /**
   * Validate visitor QR token according to the Two-Scan Lifecycle rule:
   * Scan 1: ENTRY -> status 'Inside' (Gate Opens)
   * Scan 2: EXIT -> status 'Expired' (Gate Opens)
   * Scan 3+: QR EXPIRED -> Deny Access
   * Future PHP route: POST /api/qr/validate.php
   * @param {string} qrToken 
   * @returns {Promise<Object>}
   */
  async validateQR(qrToken) {
    /* FUTURE PHP IMPLEMENTATION:
    const resp = await fetch('../api/qr.php?action=validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: qrToken })
    });
    return await resp.json();
    */

    qrToken = (qrToken || "").trim().toUpperCase();
    const visitor = GMS_STORE.visitors.find(v => v.qrToken.toUpperCase() === qrToken);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!visitor) {
      return {
        valid: false,
        reason: "Invalid QR Token: Code not found in facility database",
        visitor: null,
        action: "DENY ACCESS"
      };
    }

    // Check visit date rule
    const today = new Date().toISOString().split("T")[0];
    if (visitor.visitDate > today) {
      return {
        valid: false,
        reason: `QR Not Active Yet (Scheduled for ${visitor.visitDate})`,
        visitor: visitor,
        action: "DENY ACCESS"
      };
    }

    // Check max 2 scans rule
    if (visitor.scanCount >= 2 || visitor.qrStatus === "Expired") {
      return {
        valid: false,
        reason: "QR EXPIRED: Maximum allowable gate usages (2/2) reached",
        visitor: visitor,
        action: "DENY ACCESS"
      };
    }

    // First scan: Entry
    if (visitor.scanCount === 0) {
      visitor.scanCount = 1;
      visitor.qrStatus = "Inside";
      visitor.entryTime = `${today} ${nowStr}`;

      GMS_API.recordGateEvent({
        type: "QR Scan",
        identifier: visitor.qrToken,
        subjectName: visitor.name,
        company: visitor.companyVisiting,
        gate: "Entry Gate",
        direction: "IN",
        method: "QR Optical Scan",
        result: "Valid",
        gateAction: "Gate Opened"
      });

      saveStore(GMS_STORE);
      return {
        valid: true,
        type: "ENTRY",
        visitor: visitor,
        action: "OPEN GATE",
        message: "Visitor Checked In (1 of 2 Scans Used)"
      };
    }

    // Second scan: Exit
    if (visitor.scanCount === 1) {
      visitor.scanCount = 2;
      visitor.qrStatus = "Expired";
      visitor.exitTime = `${today} ${nowStr}`;

      GMS_API.recordGateEvent({
        type: "QR Scan",
        identifier: visitor.qrToken,
        subjectName: visitor.name,
        company: visitor.companyVisiting,
        gate: "Exit Gate",
        direction: "OUT",
        method: "QR Optical Scan",
        result: "Valid",
        gateAction: "Gate Opened (QR Expired)"
      });

      saveStore(GMS_STORE);
      return {
        valid: true,
        type: "EXIT",
        visitor: visitor,
        action: "OPEN GATE",
        message: "Visitor Checked Out (2 of 2 Scans Used - Expired)"
      };
    }

    return {
      valid: false,
      reason: "QR state corrupted or revoked",
      visitor: visitor,
      action: "DENY ACCESS"
    };
  },

  /**
   * Request physical barrier gate open command via backend controller
   * Future PHP route: POST /api/gates/control.php
   * @param {string} gateId ('entry' or 'exit')
   * @param {string} reason 
   * @returns {Promise<Object>}
   */
  async openGate(gateId, reason = "Manual Security Override") {
    /* FUTURE PHP IMPLEMENTATION:
    const resp = await fetch('../api/gates.php?action=open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gate: gateId, reason: reason })
    });
    return await resp.json();
    */

    if (gateId === "entry") {
      GMS_STORE.gateStates.entryGate.status = "OPEN";
    } else {
      GMS_STORE.gateStates.exitGate.status = "OPEN";
    }

    GMS_API.recordGateEvent({
      type: "Manual Gate Control",
      identifier: gateId.toUpperCase() + "_GATE",
      subjectName: "Officer Override",
      company: "GMS Command Center",
      gate: gateId === "entry" ? "Entry Gate" : "Exit Gate",
      direction: gateId === "entry" ? "IN" : "OUT",
      method: "Manual Relay Switch",
      result: "Authorized",
      gateAction: `Barrier Opened: ${reason}`
    });

    saveStore(GMS_STORE);
    return { success: true, gate: gateId, status: "OPEN" };
  },

  /**
   * Request physical barrier gate close command
   * Future PHP route: POST /api/gates/control.php
   */
  async closeGate(gateId) {
    if (gateId === "entry") {
      GMS_STORE.gateStates.entryGate.status = "CLOSED";
    } else {
      GMS_STORE.gateStates.exitGate.status = "CLOSED";
    }
    saveStore(GMS_STORE);
    return { success: true, gate: gateId, status: "CLOSED" };
  },

  /**
   * Record gate access event into persistent audit ledger
   * Future PHP route: POST /api/logs/create.php
   * @param {Object} eventData 
   */
  recordGateEvent(eventData) {
    const newLog = {
      id: "LOG-" + (9000 + GMS_STORE.accessLogs.length + 1),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      type: eventData.type || "System Event",
      identifier: eventData.identifier || "N/A",
      subjectName: eventData.subjectName || "N/A",
      company: eventData.company || "N/A",
      gate: eventData.gate || "Main Gate",
      direction: eventData.direction || "IN",
      method: eventData.method || "ANPR Optical",
      result: eventData.result || "Authorized",
      gateAction: eventData.gateAction || "Gate Opened"
    };

    GMS_STORE.accessLogs.unshift(newLog);
    saveStore(GMS_STORE);
    return newLog;
  },

  /**
   * Fetch access audit logs with optional filters
   * Future PHP route: GET /api/logs/list.php
   */
  async getAccessLogs(filters = {}) {
    let logs = [...GMS_STORE.accessLogs];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(l => 
        l.identifier.toLowerCase().includes(q) ||
        l.subjectName.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q)
      );
    }
    if (filters.gate && filters.gate !== "all") {
      logs = logs.filter(l => l.gate.toLowerCase().includes(filters.gate.toLowerCase()));
    }
    if (filters.direction && filters.direction !== "all") {
      logs = logs.filter(l => l.direction === filters.direction);
    }
    if (filters.result && filters.result !== "all") {
      logs = logs.filter(l => l.result.toLowerCase() === filters.result.toLowerCase());
    }
    if (filters.type && filters.type !== "all") {
      logs = logs.filter(l => l.type.toLowerCase().includes(filters.type.toLowerCase()));
    }

    return logs;
  },

  /**
   * Fetch registered tenant companies
   * Future PHP route: GET /api/companies/list.php
   */
  async getCompanies() {
    return [...GMS_STORE.companies];
  },

  /**
   * Fetch camera stream status and RTSP metadata
   * Future PHP route: GET /api/cameras/list.php
   */
  async getCameras() {
    return [...GMS_STORE.cameras];
  },

  /**
   * Fetch real-time dashboard analytics counters
   * Future PHP route: GET /api/stats/dashboard.php
   */
  async getStats() {
    const vehiclesInside = GMS_STORE.vehicles.filter(v => v.isInside).length;
    const visitorsInside = GMS_STORE.visitors.filter(v => v.qrStatus === "Inside").length;
    const pendingItems = GMS_STORE.itemsOut.filter(i => i.status.includes("Pending")).length;
    const activeAlerts = GMS_STORE.alerts.filter(a => !a.resolved).length;

    return {
      vehiclesInside: vehiclesInside,
      vehiclesEnteredToday: 18,
      vehiclesExitedToday: 14,
      visitorsInside: visitorsInside,
      visitorsToday: 9,
      pendingRequests: pendingItems,
      alertsCount: activeAlerts
    };
  },

  /**
   * Add a new vehicle to the registry
   */
  async addVehicle(vehicleData) {
    const newVeh = {
      id: "VEH-" + (100 + GMS_STORE.vehicles.length + 1),
      plateNumber: vehicleData.plateNumber.trim().toUpperCase(),
      company: vehicleData.company,
      driver: vehicleData.driver,
      driverPhone: vehicleData.driverPhone || "+251 91 000 0000",
      vehicleType: vehicleData.vehicleType || "General Vehicle",
      model: vehicleData.model || "Toyota Hilux",
      authorization: vehicleData.authorization || "Authorized",
      status: "Active",
      isInside: false,
      lastEntry: "Never",
      lastExit: "Never"
    };
    GMS_STORE.vehicles.unshift(newVeh);
    saveStore(GMS_STORE);
    return newVeh;
  },

  /**
   * Add logistics freight manifest
   */
  async addLogisticsRecord(record) {
    const newLog = {
      id: "LOG-" + (500 + GMS_STORE.logistics.length + 1),
      plate: record.plate,
      company: record.company,
      driver: record.driver,
      goods: record.goods,
      quantity: record.quantity,
      direction: record.direction || "IN",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Verified",
      waybillNumber: record.waybillNumber || "WB-2026-" + Math.floor(1000 + Math.random() * 9000),
      verifiedBy: record.verifiedBy || "Officer Tadesse"
    };
    GMS_STORE.logistics.unshift(newLog);
    saveStore(GMS_STORE);
    return newLog;
  },

  /**
   * Security officer approves and verifies items leaving the facility
   */
  async verifyItemOut(itemId, officerNotes = "Inspected and verified against Gate Pass") {
    const item = GMS_STORE.itemsOut.find(i => i.id === itemId);
    if (item) {
      item.status = "Verified & Cleared";
      item.securityOfficer = "Officer Girma Haile";
      item.verificationNotes = officerNotes;

      GMS_API.recordGateEvent({
        type: "Item-Out Verification",
        identifier: item.gatePassNo,
        subjectName: item.item,
        company: item.company,
        gate: "Exit Gate",
        direction: "OUT",
        method: "Physical Inspection",
        result: "Authorized",
        gateAction: "Goods Released"
      });

      saveStore(GMS_STORE);
      return { success: true, item: item };
    }
    return { success: false };
  }
};

// ============================================================================
// 4. TOAST NOTIFICATION SYSTEM
// ============================================================================

function showToast(title, message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconSvg = {
    success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  }[type] || "";

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hiding");
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// ============================================================================
// 5. COMMON UI INITIALIZERS (CLOCK, SIDEBAR, NOTIFICATIONS, MODALS)
// ============================================================================

function initCommonUI() {
  // 1. Live Digital Clock (Ethiopian local time display)
  const clockEl = document.getElementById("liveSystemClock");
  if (clockEl) {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
      const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      clockEl.textContent = `${dateStr} • ${timeStr} EAT`;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 2. Mobile / Tablet Sidebar Drawer Toggle
  const toggleBtn = document.getElementById("btnSidebarToggle");
  const sidebar = document.querySelector(".sidebar");
  let backdrop = document.querySelector(".sidebar-backdrop");

  if (toggleBtn && sidebar) {
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "sidebar-backdrop";
      document.body.appendChild(backdrop);
    }

    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
      backdrop.classList.toggle("active");
    });

    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("active");
    });
  }

  // 3. Top Header Notifications Dropdown
  const notifBtn = document.getElementById("btnNotificationBell");
  const notifPanel = document.getElementById("notificationsPanel");
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifPanel.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!notifPanel.contains(e.target) && e.target !== notifBtn) {
        notifPanel.classList.remove("active");
      }
    });

    // Populate notifications from store
    renderNotificationsList();
  }

  // 4. Role Switcher in Top Navigation
  const roleSelect = document.getElementById("globalRoleSelect");
  if (roleSelect) {
    roleSelect.addEventListener("change", (e) => {
      const selected = e.target.value;
      const currentPath = window.location.pathname;

      // Determine relative base
      let basePath = "";
      if (currentPath.includes("/pages/") || currentPath.includes("/admin/") || currentPath.includes("/company/")) {
        basePath = "../";
      }

      if (selected === "admin") {
        window.location.href = basePath + "admin/dashboard.html";
      } else if (selected === "company") {
        window.location.href = basePath + "company/dashboard.html";
      } else {
        window.location.href = basePath + "pages/dashboard.html";
      }
    });
  }
}

function renderNotificationsList() {
  const listEl = document.getElementById("headerNotificationsList");
  if (!listEl) return;

  const alerts = GMS_STORE.alerts;
  if (!alerts || alerts.length === 0) {
    listEl.innerHTML = `<div style="padding: 16px; text-align: center; color: #94a3b8; font-size: 0.82rem;">No pending alerts</div>`;
    return;
  }

  listEl.innerHTML = alerts.map(a => {
    const iconClass = a.level === "Error" ? "icon-danger" : a.level === "Warning" ? "icon-warning" : "icon-info";
    return `
      <div class="notification-item ${!a.resolved ? 'unread' : ''}">
        <div class="notif-icon ${iconClass}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${a.level === 'Error' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
          </svg>
        </div>
        <div class="notif-content">
          <div class="notif-title">${a.title}</div>
          <div class="notif-desc">${a.description}</div>
          <div class="notif-time">${a.timestamp} • ${a.gate}</div>
        </div>
      </div>
    `;
  }).join("");
}

// Modal open/close helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
}

// Global modal background dismiss listener
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) {
    e.target.classList.remove("active");
  }
});

// Run common initializers once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initCommonUI();
});

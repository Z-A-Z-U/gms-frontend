/**
 * GATE MANAGEMENT SYSTEM (GMS) - VISITOR MANAGEMENT CONTROLLER
 *
 * Handles:
 * - Pre-Scheduled Visitors
 * - Walk-in Visitor Registration
 * - ID document upload preview
 * - QR code generation
 * - QR sharing
 */

let currentVisitorTab = "announced"; // 'announced' or 'walkin'


document.addEventListener("DOMContentLoaded", () => {

  renderVisitors();

  initVisitorTabs();

  initPreScheduledVisitor();

  initWalkinRegistration();

  initIdImageUpload();

  populateVisitorCompanyDropdown();

});


/**
 * ============================================================
 * 1. SWITCH BETWEEN VISITOR TABS
 * ============================================================
 */
function initVisitorTabs() {

  const tabAnnounced = document.getElementById("tabBtnAnnounced");
  const tabWalkin = document.getElementById("tabBtnWalkin");

  if (!tabAnnounced || !tabWalkin) return;


  tabAnnounced.addEventListener("click", () => {

    currentVisitorTab = "announced";

    tabAnnounced.classList.add("active");
    tabWalkin.classList.remove("active");

    document
      .getElementById("tabContentAnnounced")
      .classList.add("active");

    document
      .getElementById("tabContentWalkin")
      .classList.remove("active");

    renderVisitors();

  });


  tabWalkin.addEventListener("click", () => {

    currentVisitorTab = "walkin";

    tabWalkin.classList.add("active");
    tabAnnounced.classList.remove("active");

    document
      .getElementById("tabContentWalkin")
      .classList.add("active");

    document
      .getElementById("tabContentAnnounced")
      .classList.remove("active");

    renderVisitors();

  });

}


/**
 * ============================================================
 * 2. RENDER VISITOR TABLES
 * ============================================================
 */
function renderVisitors() {

  const announcedBody =
    document.getElementById("announcedVisitorsTableBody");

  const walkinBody =
    document.getElementById("walkinVisitorsTableBody");


  /*
   * Use the browser's local date for the prototype.
   * The final PHP/MySQL version will use Africa/Addis_Ababa.
   */
  const today =
    new Date().toISOString().split("T")[0];


  /* ==========================================================
   * PRE-SCHEDULED VISITORS
   * ========================================================== */

  if (announcedBody) {

    const announcedList =
      GMS_STORE.visitors.filter(
        v => v.type === "Announced"
      );


    if (announcedList.length === 0) {

      announcedBody.innerHTML = `
        <tr>
          <td colspan="8"
              style="text-align:center; padding:20px; color:#94a3b8;">
            No pre-scheduled visitors
          </td>
        </tr>
      `;

    } else {

      announcedBody.innerHTML =
        announcedList.map(v => {

          let badgeStatus = v.qrStatus;
          let badgeClass = "badge-info";


          /*
           * Visitor scheduled for a future date.
           * QR must NOT be valid yet.
           */
          if (v.visitDate > today) {

            badgeStatus = "Scheduled";
            badgeClass = "badge-scheduled";

          }

          /*
           * Visitor has used both QR scans.
           */
          else if (
            v.scanCount >= 2 ||
            v.qrStatus === "Expired"
          ) {

            badgeStatus = "Expired";
            badgeClass = "badge-expired";

          }

          /*
           * Visitor is currently inside.
           */
          else if (v.scanCount === 1) {

            badgeStatus = "Inside Facility";
            badgeClass = "badge-inside";

          }

          /*
           * Visitor can enter today.
           */
          else if (v.visitDate === today) {

            badgeStatus = "Active (Ready)";
            badgeClass = "badge-valid";

          }


          return `
            <tr>

              <td>

                <strong>${v.name}</strong>

                <div style="
                  font-size:0.75rem;
                  color:#64748b;
                ">
                  ${v.email || "No email"}
                </div>

              </td>


              <td>
                ${v.phone}
              </td>


              <td>
                <strong>
                  ${v.companyVisiting}
                </strong>
              </td>


              <td>

                <span class="plate-badge">
                  ${v.plateNumber || "Pedestrian"}
                </span>

              </td>


              <td>

                <span style="font-family:ui-monospace;">
                  ${v.visitDate}
                </span>

              </td>


              <td>

                <span class="badge ${badgeClass}">
                  ${badgeStatus}
                </span>

              </td>


              <td>

                <span class="badge ${
                  v.scanCount > 0
                    ? "badge-authorized"
                    : "badge-neutral"
                }">

                  ${
                    v.scanCount === 0
                      ? "Not Arrived"
                      : v.scanCount === 1
                      ? "Entered"
                      : "Departed"
                  }

                </span>

              </td>


              <td>

                <button
                  class="btn btn-sm btn-outline"
                  onclick="previewVisitorQR('${v.id}')">

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2">

                    <rect
                      x="3"
                      y="3"
                      width="7"
                      height="7"/>

                    <rect
                      x="14"
                      y="3"
                      width="7"
                      height="7"/>

                    <rect
                      x="14"
                      y="14"
                      width="7"
                      height="7"/>

                    <rect
                      x="3"
                      y="14"
                      width="7"
                      height="7"/>

                  </svg>

                  View QR

                </button>

              </td>

            </tr>
          `;

        }).join("");

    }

  }


  /* ==========================================================
   * WALK-IN VISITORS
   * ========================================================== */

  if (walkinBody) {

    const walkinList =
      GMS_STORE.visitors.filter(
        v => v.type === "Walk-in"
      );


    if (walkinList.length === 0) {

      walkinBody.innerHTML = `
        <tr>
          <td colspan="8"
              style="text-align:center; padding:20px; color:#94a3b8;">
            No walk-in visitors registered today
          </td>
        </tr>
      `;

    } else {

      walkinBody.innerHTML =
        walkinList.map(v => {

          let badgeClass =
            v.qrStatus === "Inside"
              ? "badge-inside"
              : v.qrStatus === "Expired"
              ? "badge-expired"
              : "badge-valid";


          return `
            <tr>

              <td>

                <strong>
                  ${v.name}
                </strong>

                <div style="
                  font-size:0.75rem;
                  color:#64748b;
                ">
                  ${v.idType || "ID Verified"}
                </div>

              </td>


              <td>
                ${v.phone}
              </td>


              <td>
                <strong>
                  ${v.companyVisiting}
                </strong>
              </td>


              <td>

                <span class="plate-badge">
                  ${v.plateNumber}
                </span>

              </td>


              <td>

                <span style="font-family:ui-monospace;">
                  ${v.entryTime || "Just Registered"}
                </span>

              </td>


              <td>

                <span class="badge ${badgeClass}">
                  ${v.qrStatus}
                </span>

              </td>


              <td>

                <span class="badge ${
                  v.scanCount === 2
                    ? "badge-expired"
                    : "badge-authorized"
                }">

                  ${v.scanCount} / 2 Scans

                </span>

              </td>


              <td>

                <button
                  class="btn btn-sm btn-outline"
                  onclick="previewVisitorQR('${v.id}')">

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2">

                    <rect
                      x="3"
                      y="3"
                      width="7"
                      height="7"/>

                    <rect
                      x="14"
                      y="3"
                      width="7"
                      height="7"/>

                    <rect
                      x="14"
                      y="14"
                      width="7"
                      height="7"/>

                    <rect
                      x="3"
                      y="14"
                      width="7"
                      height="7"/>

                  </svg>

                  View QR

                </button>

              </td>

            </tr>
          `;

        }).join("");

    }

  }

}


/**
 * ============================================================
 * 3. PRE-SCHEDULED VISITOR REGISTRATION
 * ============================================================
 */
function initPreScheduledVisitor() {

  const addButton =
    document.getElementById(
      "btnAddPreScheduledVisitor"
    );

  const form =
    document.getElementById(
      "preScheduledVisitorForm"
    );


  /*
   * Add Pre-Scheduled Visitor button
   */
  if (addButton) {

    addButton.addEventListener("click", () => {

      /*
       * Reset the form before opening it.
       */
      if (form) {
        form.reset();
      }


      /*
       * Populate company list every time
       * the modal is opened.
       */
      populatePreScheduledCompanyDropdown();


      /*
       * Prevent selecting a date in the past.
       */
      const dateInput =
        document.getElementById("preVisitorDate");

      if (dateInput) {

        const today =
          new Date().toISOString().split("T")[0];

        dateInput.min = today;

      }


      openModal("preScheduledVisitorModal");

    });

  }


  /*
   * Submit Pre-Scheduled Visitor form
   */
  if (form) {

    form.addEventListener("submit", async (e) => {

      e.preventDefault();


      const name =
        document
          .getElementById("preVisitorName")
          .value
          .trim();


      const phone =
        document
          .getElementById("preVisitorPhone")
          .value
          .trim();


      const email =
        document
          .getElementById("preVisitorEmail")
          .value
          .trim();


      const company =
        document
          .getElementById("preVisitorCompany")
          .value;


      const visitDate =
        document
          .getElementById("preVisitorDate")
          .value;


      const plate =
        document
          .getElementById("preVisitorPlate")
          .value
          .trim();


      const idType =
        document
          .getElementById("preVisitorIdType")
          .value;


      /*
       * Basic validation
       */
      if (!name || !phone || !company || !visitDate) {

        showToast(
          "Validation Error",
          "Please provide the visitor name, phone, company, and visit date.",
          "warning"
        );

        return;

      }


      /*
       * Prevent past dates.
       */
      const today =
        new Date().toISOString().split("T")[0];


      if (visitDate < today) {

        showToast(
          "Invalid Visit Date",
          "The visit date cannot be in the past.",
          "warning"
        );

        return;

      }


      /*
       * Register visitor through the existing API.
       */
      const result =
        await GMS_API.registerVisitor({

          name: name,

          phone: phone,

          email: email,

          companyVisiting: company,

          plateNumber:
            plate || "Pedestrian",

          idType:
            idType || "Not Provided",

          type: "Announced",

          visitDate: visitDate

        });


      /*
       * Close registration modal.
       */
      closeModal(
        "preScheduledVisitorModal"
      );


      /*
       * Refresh visitor table.
       */
      renderVisitors();


      /*
       * Tell the officer the pass was generated.
       */
      showToast(
        "Digital Pass Generated",
        `Pre-scheduled visitor ${name} has been registered for ${visitDate}.`,
        "success"
      );


      /*
       * Immediately show the QR pass.
       */
      if (
        result &&
        result.visitor &&
        result.visitor.id
      ) {

        previewVisitorQR(
          result.visitor.id
        );

      }

    });

  }

}


/**
 * ============================================================
 * 4. POPULATE PRE-SCHEDULED COMPANY DROPDOWN
 * ============================================================
 */
function populatePreScheduledCompanyDropdown() {

  const select =
    document.getElementById(
      "preVisitorCompany"
    );


  if (!select) return;


  let options = `
    <option value="">
      -- Select Company / Organization --
    </option>
  `;


  GMS_STORE.companies.forEach(company => {

    options += `
      <option value="${company.name}">
        ${company.name}
      </option>
    `;

  });


  select.innerHTML = options;

}


/**
 * ============================================================
 * 5. WALK-IN VISITOR REGISTRATION
 * ============================================================
 */
function initWalkinRegistration() {

  const form =
    document.getElementById(
      "walkinRegistrationForm"
    );


  if (!form) return;


  form.addEventListener("submit", async (e) => {

    e.preventDefault();


    const name =
      document
        .getElementById("walkinName")
        .value
        .trim();


    const phone =
      document
        .getElementById("walkinPhone")
        .value
        .trim();


    const email =
      document
        .getElementById("walkinEmail")
        .value
        .trim();


    const company =
      document
        .getElementById("walkinCompany")
        .value;


    const plate =
      document
        .getElementById("walkinPlate")
        .value
        .trim();


    const idType =
      document
        .getElementById("walkinIdType")
        .value;


    const purpose =
      document
        .getElementById("walkinPurpose")
        .value
        .trim();


    if (!name || !phone || !company) {

      showToast(
        "Validation Error",
        "Please provide visitor name, phone, and company.",
        "warning"
      );

      return;

    }


    const result =
      await GMS_API.registerVisitor({

        name,

        phone,

        email,

        companyVisiting: company,

        plateNumber:
          plate || "Pedestrian",

        idType,

        purpose,

        type: "Walk-in"

      });


    form.reset();


    document
      .getElementById("idImagePreview")
      .style.display = "none";


    renderVisitors();


    showToast(
      "Registration Complete",
      `Visitor ${name} registered. QR code generated.`,
      "success"
    );


    if (
      result &&
      result.visitor &&
      result.visitor.id
    ) {

      previewVisitorQR(
        result.visitor.id
      );

    }

  });

}


/**
 * ============================================================
 * 6. ID IMAGE UPLOAD & PREVIEW
 * ============================================================
 */
function initIdImageUpload() {

  const fileInput =
    document.getElementById(
      "walkinIdFile"
    );


  const previewBox =
    document.getElementById(
      "idImagePreview"
    );


  const previewImg =
    document.getElementById(
      "idPreviewImg"
    );


  if (
    fileInput &&
    previewBox &&
    previewImg
  ) {

    fileInput.addEventListener(
      "change",
      (e) => {

        const file =
          e.target.files[0];


        if (file) {

          const reader =
            new FileReader();


          reader.onload =
            (event) => {

              previewImg.src =
                event.target.result;

              previewBox.style.display =
                "block";

            };


          reader.readAsDataURL(file);

        }

      }
    );

  }

}


/**
 * ============================================================
 * 7. DISPLAY VISITOR QR CODE
 * ============================================================
 */
function previewVisitorQR(visitorId) {

  const visitor =
    GMS_STORE.visitors.find(
      v => v.id === visitorId
    );


  if (!visitor) return;


  const modalBody =
    document.getElementById(
      "qrPreviewModalBody"
    );


  if (!modalBody) return;


  const qrSvg =
    generateMockQRSvg(
      visitor.qrToken
    );


  modalBody.innerHTML = `

    <div class="qr-preview-card">

      <div class="qr-code-graphic">
        ${qrSvg}
      </div>


      <div class="qr-token-text">
        ${visitor.qrToken}
      </div>


      <div style="
        font-size:1.15rem;
        font-weight:700;
        color:#0f172a;
        margin-bottom:4px;
      ">

        ${visitor.name}

      </div>


      <div style="
        font-size:0.85rem;
        color:#64748b;
        margin-bottom:12px;
      ">

        Visiting:
        <strong>
          ${visitor.companyVisiting}
        </strong>

      </div>


      <div style="
        display:flex;
        gap:8px;
        margin-bottom:16px;
      ">

        <span class="badge ${
          visitor.qrStatus === "Inside"
            ? "badge-inside"
            : visitor.qrStatus === "Expired"
            ? "badge-expired"
            : "badge-valid"
        }">

          Status:
          ${visitor.qrStatus}

        </span>


        <span class="badge badge-neutral">

          Usage:
          ${visitor.scanCount}
          of 2 Scans

        </span>

      </div>


      <div style="
        display:flex;
        gap:10px;
        width:100%;
        justify-content:center;
      ">

        <button
          class="btn btn-outline"
          onclick="sendQRShare(
            'Email',
            '${visitor.name}',
            '${visitor.qrToken}'
          )">

          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">

            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-0.9-2-2V6c0-1.1.9-2 2-2z"/>

            <polyline points="22,6 12,13 2,6"/>

          </svg>

          Send by Email

        </button>


        <button
          class="btn btn-success"
          onclick="sendQRShare(
            'WhatsApp',
            '${visitor.name}',
            '${visitor.qrToken}'
          )">

          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">

            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>

          </svg>

          Send by WhatsApp

        </button>

      </div>

    </div>

  `;


  openModal(
    "qrPreviewModal"
  );

}


/**
 * ============================================================
 * 8. QR SHARE
 * ============================================================
 */
function sendQRShare(
  channel,
  visitorName,
  token
) {

  showToast(
    "QR Shared",
    `Visitor QR pass (${token}) dispatched to ${visitorName} via ${channel}.`,
    "success"
  );

}


/**
 * ============================================================
 * 9. WALK-IN COMPANY DROPDOWN
 * ============================================================
 */
function populateVisitorCompanyDropdown() {

  const select =
    document.getElementById(
      "walkinCompany"
    );


  if (!select) return;


  let options = `
    <option value="">
      -- Choose Company / Organization --
    </option>
  `;


  GMS_STORE.companies.forEach(company => {

    options += `
      <option value="${company.name}">
        ${company.name}
      </option>
    `;

  });


  select.innerHTML = options;

}


/**
 * ============================================================
 * 10. MOCK QR GRAPHIC
 * ============================================================
 */
function generateMockQRSvg(token) {

  return `

    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style="width:100%; height:100%;">

      <!-- Outer Finder Corners -->

      <rect
        x="5"
        y="5"
        width="24"
        height="24"
        rx="3"
        fill="#0f172a"/>

      <rect
        x="8"
        y="8"
        width="18"
        height="18"
        fill="#ffffff"/>

      <rect
        x="11"
        y="11"
        width="12"
        height="12"
        fill="#0284c7"/>


      <rect
        x="71"
        y="5"
        width="24"
        height="24"
        rx="3"
        fill="#0f172a"/>

      <rect
        x="74"
        y="8"
        width="18"
        height="18"
        fill="#ffffff"/>

      <rect
        x="77"
        y="11"
        width="12"
        height="12"
        fill="#0284c7"/>


      <rect
        x="5"
        y="71"
        width="24"
        height="24"
        rx="3"
        fill="#0f172a"/>

      <rect
        x="8"
        y="74"
        width="18"
        height="18"
        fill="#ffffff"/>

      <rect
        x="11"
        y="77"
        width="12"
        height="12"
        fill="#0284c7"/>


      <!-- Data Dots -->

      <rect x="34" y="6" width="6" height="6" fill="#0f172a"/>
      <rect x="44" y="6" width="6" height="6" fill="#0f172a"/>
      <rect x="54" y="6" width="6" height="6" fill="#0f172a"/>

      <rect x="34" y="16" width="6" height="6" fill="#0f172a"/>
      <rect x="50" y="16" width="12" height="6" fill="#0f172a"/>

      <rect x="40" y="26" width="6" height="6" fill="#0f172a"/>
      <rect x="54" y="26" width="8" height="6" fill="#0f172a"/>


      <!-- Center -->

      <rect
        x="6"
        y="36"
        width="6"
        height="10"
        fill="#0f172a"/>

      <rect
        x="18"
        y="42"
        width="10"
        height="6"
        fill="#0f172a"/>

      <rect
        x="36"
        y="36"
        width="28"
        height="28"
        rx="4"
        fill="#0f172a"/>

      <rect
        x="40"
        y="40"
        width="20"
        height="20"
        rx="2"
        fill="#ffffff"/>

      <text
        x="50"
        y="54"
        font-size="9"
        font-family="monospace"
        font-weight="900"
        text-anchor="middle"
        fill="#0284c7">

        GMS

      </text>


      <!-- Bottom / Right Data -->

      <rect x="72" y="36" width="8" height="6" fill="#0f172a"/>
      <rect x="86" y="42" width="8" height="6" fill="#0f172a"/>

      <rect x="36" y="72" width="6" height="8" fill="#0f172a"/>
      <rect x="48" y="72" width="14" height="6" fill="#0f172a"/>

      <rect x="70" y="70" width="6" height="6" fill="#0f172a"/>
      <rect x="82" y="70" width="12" height="6" fill="#0f172a"/>

      <rect x="72" y="82" width="8" height="8" fill="#0f172a"/>
      <rect x="86" y="84" width="8" height="6" fill="#0f172a"/>

    </svg>

  `;

}
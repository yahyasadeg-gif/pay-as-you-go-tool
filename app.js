// ================================
// GLOBAL DATA
// ================================
let stores = [];

// ================================
// LOAD CSV (SAFE PARSING)
// ================================
Papa.parse("data/stores.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    stores = results.data;
  }
});

// ================================
// LOAD STORE BY ID
// ================================
function loadStore() {
  const id = document.getElementById("storeIdInput").value.trim();
const store = stores.find(
  s => String(s["Store ID"]).trim() === id
);

  if (!store) {
    alert("Store not found");
    return;
  }

  renderSnapshot(store);
  renderQuestions(store);
}

// ================================
// SNAPSHOT RENDER
// ================================
function renderSnapshot(store) {
  const snap = document.getElementById("snapshot");
  snap.classList.remove("hidden");

  const flags = getFlags(store);

  const flagFor = field => {
    const f = flags.find(x => x.field === field);
    return f
      ? `<span class="flag ${f.type}" title="${f.text}">●</span>`
      : "";
  };

  // POS competitors ONLY (not delivery platforms)
  const posCompetitors = getPosCompetitors(store);
  const posCompetitorsText =
    posCompetitors.length > 0 ? posCompetitors.join(" / ") : "None";

  // Google page ownership logic
  let googleOwner = "Unknown";
  if (store["Competitor Name"]) {
    googleOwner = store["Competitor Name"];
  }

  const showGoogleOwner =
    store["Gpin Status"] === "Unverified"
      ? `<small><i>Managed by: ${googleOwner}</i></small>`
      : "";

  snap.innerHTML = `
    <div class="section-title">Store Snapshot</div>

    <div class="snapshot-grid">

      <!-- LEFT COLUMN -->
      <div class="snapshot-col">
        <p><b>System:</b> ${store["System Type"]}</p>
        <p>
          <b>Subscribed Tech:</b> ${store["Subscribed Tech"]}
          ${flagFor("Subscribed Tech")}
        </p>
        <p><b>Mandate:</b> ${store["Mandate"]}</p>
        <p>
          <b>Foodhub Weekly Rental:</b>
          £${store["Payemnt Info [ System Rentals ] [ FoodHub ]"]}
        </p>
        <p>
          <b>Datman Weekly Rental:</b>
          £${store["Payemnt Info [ System Rentals ] [ Datman ]"]}
        </p>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="snapshot-col">
        <p>
          <b>Google Pin:</b> ${store["Gpin Status"]}
          ${flagFor("Gpin Status")} <br>
          ${showGoogleOwner}
        </p>

        <p>
          <b>Rating:</b>
          ${store["Google Rating"]}
          (${store["Number of Google Reviews"]})
          ${flagFor("Google Rating")}
        </p>

        <p>
          <b>POS Competitors:</b> ${posCompetitorsText}
          ${flagFor("POS Competitors")}
        </p>

        <p><b>Avg Online Orders:</b> ${store["Avverage Online"]}</p>

        <p>
          <b>Offline Orders:</b> ${store["Offline Online"]}
          ${flagFor("Offline Online")}
        </p>
      </div>

    </div>
  `;
}

// ================================
// QUESTIONS RENDER (ADAPTIVE)
// ================================
function renderQuestions(store) {
  const form = document.getElementById("callForm");
  form.classList.remove("hidden");
  form.innerHTML = "";

  // ---- GROUP A: BUSINESS REALITY ----
  addSection(form, "Business Reality");
  addRadio(form, "How busy is the business overall?", [
    "Very busy",
    "Steady",
    "Quiet"
  ]);

  // ---- GROUP B: ORDER VOLUME ----
  addSection(form, "Order Volume");
  addRadio(form, "Total orders per day (all channels)?", [
    "0–20",
    "21–50",
    "50+"
  ]);

  addRadio(form, "Online orders per week (all platforms)?", [
    "0–10",
    "11–30",
    "30+"
  ]);

  // ---- GROUP C: COMPETITORS & COSTS ----
  const posCompetitors = getPosCompetitors(store);

  if (posCompetitors.length > 0) {
    addSection(form, "Competitors & Costs");

    addRadio(form, "Which platform brings the most online orders?", [
      "Foodhub",
      "Just Eat",
      "Uber Eats",
      "Deliveroo",
      ...posCompetitors
    ]);

    addRadio(form, "Roughly how many orders per week from that platform?", [
      "0–10",
      "11–30",
      "30+"
    ]);

    addText(form, "What commission or transaction fees do they take?");
    addText(form, "Any special deal or agreement with them? (optional)");
  }

  // ---- GROUP D: OFFLINE OPERATIONS ----
  addSection(form, "Offline Operations");

  addRadio(form, "How do you take walk-in and phone orders?", [
    "Foodhub EPOS only",
    "Foodhub EPOS + another company",
    "Another company EPOS only",
    "Pen & paper"
  ]);

  // EPOS installed but not used
  if (
    store["System Type"] === "EPOS" &&
    parseInt(store["Offline Online"] || 0) === 0
  ) {
    addRadio(
      form,
      "You have Foodhub EPOS — why isn’t it being used for offline orders?",
      [
        "Staff don’t use it",
        "Owner prefers another system",
        "Setup was never completed",
        "Didn’t know it should be used",
        "Other"
      ]
    );
  }

  // ---- GROUP E: FOODHUB ISSUES ----
  addSection(form, "Foodhub Issues");

  addRadio(form, "Do you face any issues with Foodhub systems?", [
    "No issues",
    "Minor issues",
    "Major issues"
  ]);

  addText(form, "If yes, what kind of issues?");

  document.getElementById("submitBtn").classList.remove("hidden");
}

// ================================
// HELPERS (UI)
// ================================
function addSection(form, title) {
  const h = document.createElement("div");
  h.className = "section-title";
  h.innerText = title;
  form.appendChild(h);
}

function addRadio(form, question, options) {
  const d = document.createElement("div");
  d.className = "question";
  d.innerHTML =
    `<p>${question}</p>` +
    options
      .map(
        opt =>
          `<label><input type="radio" name="${question}"> ${opt}</label><br>`
      )
      .join("");
  form.appendChild(d);
}

function addText(form, question) {
  const d = document.createElement("div");
  d.className = "question";
  d.innerHTML = `<p>${question}</p><textarea></textarea>`;
  form.appendChild(d);
}

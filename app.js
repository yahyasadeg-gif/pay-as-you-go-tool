// ================================
// GLOBAL DATA
// ================================
let stores = [];
let currentStore = null;


// ================================
// LOAD CSV
// ================================
Papa.parse("data/stores.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    stores = results.data;
    console.log("Stores loaded:", stores.length);
  }
});


// ================================
// LOAD STORE
// ================================
function loadStore() {

  if (!stores.length) {
    alert("Data still loading...");
    return;
  }

  const id = document.getElementById("storeIdInput").value.trim();

  const store = stores.find(
    s => String(s["Store ID"]).trim() === id
  );

  if (!store) {
    alert("Store not found");
    return;
  }

  currentStore = store;

  renderSnapshot(store);
  renderQuestions(store);
}



// ================================
// SNAPSHOT
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

  const posCompetitors = getPosCompetitors(store);
  const competitorsText =
    posCompetitors.length > 0 ? posCompetitors.join(" / ") : "None";

  const googleOwner =
    store["Gpin Status"] === "Unverified"
      ? `<small><i>Managed by: ${store["Competitor Name"] || "Unknown"}</i></small>`
      : "";

  snap.innerHTML = `
    <div class="section-title">Store Snapshot</div>

    <div class="snapshot-grid">

      <div class="snapshot-col">
        <p><b>System:</b> ${store["System Type"]}</p>
        <p><b>Subscribed Tech:</b> ${store["Subscribed Tech"]} ${flagFor("Subscribed Tech")}</p>
        <p><b>Mandate:</b> ${store["Mandate"]}</p>
        <p><b>Foodhub Weekly Rental:</b> £${store["Payemnt Info [ System Rentals ] [ FoodHub ]"]}</p>
        <p><b>Datman Weekly Rental:</b> £${store["Payemnt Info [ System Rentals ] [ Datman ]"]}</p>
      </div>

      <div class="snapshot-col">
        <p><b>Google Pin:</b> ${store["Gpin Status"]} ${flagFor("Gpin Status")} <br>${googleOwner}</p>
        <p><b>Rating:</b> ${store["Google Rating"]} (${store["Number of Google Reviews"]}) ${flagFor("Google Rating")}</p>
        <p><b>POS Competitors:</b> ${competitorsText} ${flagFor("POS Competitors")}</p>
        <p><b>Avg Online Orders:</b> ${store["Avverage Online"]}</p>
        <p><b>Offline Orders:</b> ${store["Offline Online"]} ${flagFor("Offline Online")}</p>
      </div>

    </div>
  `;
}



// ================================
// QUESTIONS
// ================================
function renderQuestions(store) {

  const form = document.getElementById("callForm");
  form.classList.remove("hidden");
  form.innerHTML = "";

  // -------- GROUP A ----------
  addSection(form, "Business Volume");

  addRadio(form,
    "How many offline orders do you typically handle per day?",
    ["0–20", "21–50", "50+"]
  );

  addRadio(form,
    "How many online orders do you receive per week across all platforms?",
    ["0–10", "11–30", "30+"]
  );


  // -------- GROUP B ----------
  addSection(form, "Online Sources");

  addCheckbox(form,
    "Which delivery marketplaces are you currently using?",
    ["Just Eat", "Uber Eats", "Deliveroo", "None"]
  );

  addRadio(form,
    "Are you using another online ordering or POS provider besides Foodhub?",
    ["Yes", "No"]
  );


  const competitors = getPosCompetitors(store);

  if (competitors.length > 0) {

    addDropdown(form,
      "Which provider are you using?",
      competitors
    );

    addRadio(form,
      "Roughly how many orders per week come through that provider?",
      ["0–10", "11–30", "30+"]
    );

    addText(form, "What commission or transaction fees do they take?");
    addText(form, "Are you receiving any special deal or incentive from them?");
  }


  // -------- GROUP C ----------
  addSection(form, "Offline Operations");

  addRadio(form,
    "How are walk-in and phone orders currently processed?",
    [
      "Foodhub EPOS only",
      "Foodhub EPOS + another provider",
      "Another provider only",
      "Pen & paper"
    ]
  );


  if (
    store["System Type"] === "EPOS" &&
    parseInt(store["Offline Online"] || 0) === 0
  ) {
    addRadio(form,
      "We can see Foodhub EPOS is installed — could you share why it isn’t being used for offline orders?",
      [
        "Staff not trained",
        "Prefer another system",
        "Setup incomplete",
        "Didn’t realise it should be used",
        "Other"
      ]
    );
  }


  // -------- GROUP D ----------
  addSection(form, "Foodhub Experience");

  addRadio(form,
    "Are you experiencing any issues or limitations with the Foodhub system?",
    ["No issues", "Minor limitations", "Major issues"]
  );

  addText(form, "Could you briefly describe the issue?");


  // ⭐ SHOW SUBMIT BUTTON
  document.getElementById("submitBtn").classList.remove("hidden");
}



// ================================
// SUBMIT TO GOOGLE SHEET
// ================================
function submitCall() {

  if (!currentStore) {
    alert("Load a store first.");
    return;
  }

  const selected = q =>
    document.querySelector(`input[name="${q}"]:checked`)?.parentElement.textContent.trim() || "";

  const checkboxes = q =>
    Array.from(document.querySelectorAll(`input[name="${q}"]:checked`))
      .map(el => el.value)
      .join(", ");

  const textAreas = document.querySelectorAll("textarea");

  const payload = {

    storeId: currentStore["Store ID"],
    systemType: currentStore["System Type"],
    subscribedTech: currentStore["Subscribed Tech"],
    foodhubRental: currentStore["Payemnt Info [ System Rentals ] [ FoodHub ]"],
    datmanRental: currentStore["Payemnt Info [ System Rentals ] [ Datman ]"],
    googlePin: currentStore["Gpin Status"],
    googleOwner: currentStore["Competitor Name"] || "Unknown",
    posCompetitors: getPosCompetitors(currentStore).join(", "),
    avgOnline: currentStore["Avverage Online"],
    offlineOrders: currentStore["Offline Online"],

    offlinePerDay: selected("How many offline orders do you typically handle per day?"),
    onlinePerWeek: selected("How many online orders do you receive per week across all platforms?"),
    marketplaces: checkboxes("Which delivery marketplaces are you currently using?"),
    usingCompetitor: selected("Are you using another online ordering or POS provider besides Foodhub?"),
    competitorName: selected("Which provider are you using?"),
    competitorOrders: selected("Roughly how many orders per week come through that provider?"),
    competitorFees: textAreas[0]?.value || "",
    competitorDeal: textAreas[1]?.value || "",
    offlineMethod: selected("How are walk-in and phone orders currently processed?"),
    eposWhyNotUsed: selected("We can see Foodhub EPOS is installed — could you share why it isn’t being used for offline orders?"),
    foodhubIssues: selected("Are you experiencing any issues or limitations with the Foodhub system?"),
    issueDetails: textAreas[textAreas.length-1]?.value || ""
  };


  // 🔴 PASTE YOUR APPS SCRIPT URL HERE
  fetch("https://script.google.com/macros/s/AKfycbyKRf7hE25n4Ha9bE3c1FEVDzyAnh24o5Z97tskuF-yf8n_MnffItj6zuhy2DNCrG_t/exec", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  alert("Call saved successfully ✅");
}



// ================================
// UI HELPERS
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

  d.innerHTML = `<p>${question}</p>` +
    options.map(o =>
      `<label><input type="radio" name="${question}"> ${o}</label><br>`
    ).join("");

  form.appendChild(d);
}

function addCheckbox(form, question, options) {
  const d = document.createElement("div");
  d.className = "question";

  d.innerHTML = `<p>${question}</p>` +
    options.map(o =>
      `<label><input type="checkbox" name="${question}" value="${o}"> ${o}</label><br>`
    ).join("");

  form.appendChild(d);
}

function addDropdown(form, question, options) {
  const d = document.createElement("div");
  d.className = "question";

  d.innerHTML = `
    <p>${question}</p>
    <select name="${question}">
      ${options.map(o => `<option>${o}</option>`).join("")}
    </select>
  `;

  form.appendChild(d);
}

function addText(form, question) {
  const d = document.createElement("div");
  d.className = "question";
  d.innerHTML = `<p>${question}</p><textarea></textarea>`;
  form.appendChild(d);
}

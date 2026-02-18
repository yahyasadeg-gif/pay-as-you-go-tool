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

  const posCompetitors = getPosCompetitors(store);
  const competitorsText =
    posCompetitors.length > 0 ? posCompetitors.join(" / ") : "None";

  snap.innerHTML = `
    <div class="section-title">Store Snapshot</div>

    <div class="snapshot-grid">
      <div>
        <p><b>System:</b> ${store["System Type"]}</p>
        <p><b>Subscribed Tech:</b> ${store["Subscribed Tech"]}</p>
        <p><b>Foodhub Weekly Rental:</b> £${store["Payemnt Info [ System Rentals ] [ FoodHub ]"]}</p>
        <p><b>Datman Weekly Rental:</b> £${store["Payemnt Info [ System Rentals ] [ Datman ]"]}</p>
      </div>

      <div>
        <p><b>Google Pin:</b> ${store["Gpin Status"]}</p>
        <p><b>POS Competitors:</b> ${competitorsText}</p>
        <p><b>Avg Online:</b> ${store["Avverage Online"]}</p>
        <p><b>Offline Orders:</b> ${store["Offline Online"]}</p>
      </div>
    </div>
  `;
}



// ================================
// QUESTIONS (NO CONDITIONS)
// ================================
function renderQuestions(store) {

  const form = document.getElementById("callForm");
  form.classList.remove("hidden");
  form.innerHTML = "";

  // CALL OWNER
  addSection(form, "Call Owner");

  addDropdown(form,
    "Agent",
    ["Kareem","Mansour","Ibrahim","Hossam"]
  );


  // BUSINESS
  addSection(form, "Business Volume");

  addRadio(form,
    "Offline orders per day",
    ["0–20","21–50","50+"]
  );

  addRadio(form,
    "Online orders per week",
    ["0–10","11–30","30+"]
  );


  // MARKETPLACES
  addSection(form, "Online Sources");

  addCheckbox(form,
    "Delivery platforms",
    ["Just Eat","Uber Eats","Deliveroo","None"]
  );

  addRadio(form,
    "Using another POS?",
    ["Yes","No"]
  );

  addText(form,"Competitor name");
  addText(form,"Competitor weekly orders");
  addText(form,"Competitor fees");
  addText(form,"Special deal");


  // OFFLINE OPS
  addSection(form, "Offline Operations");

  addRadio(form,
    "Offline order method",
    [
      "Foodhub EPOS only",
      "Foodhub + other POS",
      "Other POS only",
      "Pen & paper"
    ]
  );

  addText(form,"Why EPOS not used?");


  // FOODHUB EXPERIENCE
  addSection(form, "Foodhub Experience");

  addRadio(form,
    "Any Foodhub issues?",
    ["No","Minor","Major"]
  );

  addText(form,"Issue details");


  // CALL OUTCOME
  addSection(form, "Call Outcome");

  addRadio(form,
    "Deal status",
    ["Accepted","Considering","Rejected","Not offered"]
  );

  addRadio(form,
    "Upsell attempted?",
    ["Yes","No"]
  );

  addText(form,"Upsell product");


  document.getElementById("submitBtn").classList.remove("hidden");
}



// ================================
// SUBMIT
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

  const texts = document.querySelectorAll("textarea");

  const payload = {

    agent: document.querySelector('select[name="Agent"]')?.value || "",

    storeId: currentStore["Store ID"],

    offlinePerDay: selected("Offline orders per day"),
    onlinePerWeek: selected("Online orders per week"),

    platforms: checkboxes("Delivery platforms"),
    usingPos: selected("Using another POS?"),

    competitorName: texts[0]?.value || "",
    competitorOrders: texts[1]?.value || "",
    competitorFees: texts[2]?.value || "",
    competitorDeal: texts[3]?.value || "",

    offlineMethod: selected("Offline order method"),
    eposWhyNotUsed: texts[4]?.value || "",

    issues: selected("Any Foodhub issues?"),
    issueDetails: texts[5]?.value || "",

    dealStatus: selected("Deal status"),
    upsellAttempted: selected("Upsell attempted?"),
    upsellProduct: texts[6]?.value || ""
  };


  fetch("https://script.google.com/macros/s/AKfycbwm6O0NEfH7UhLfWtBSrMq9KX1p7_U1N643AWiLouuMzNS6ih2tNAPYEH_VYLuAPCxA/exec", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  alert("Saved ✅");
}



// ================================
// UI HELPERS
// ================================
function addSection(form,title){
  const h=document.createElement("div");
  h.className="section-title";
  h.innerText=title;
  form.appendChild(h);
}

function addRadio(form,q,opts){
  const d=document.createElement("div");
  d.className="question";
  d.innerHTML=`<p>${q}</p>`+
    opts.map(o=>`<label><input type="radio" name="${q}"> ${o}</label><br>`).join("");
  form.appendChild(d);
}

function addCheckbox(form,q,opts){
  const d=document.createElement("div");
  d.className="question";
  d.innerHTML=`<p>${q}</p>`+
    opts.map(o=>`<label><input type="checkbox" name="${q}" value="${o}"> ${o}</label><br>`).join("");
  form.appendChild(d);
}

function addDropdown(form,q,opts){
  const d=document.createElement("div");
  d.className="question";
  d.innerHTML=`<p>${q}</p>
  <select name="${q}">
  <option value="">--Select--</option>
  ${opts.map(o=>`<option>${o}</option>`).join("")}
  </select>`;
  form.appendChild(d);
}

function addText(form,q){
  const d=document.createElement("div");
  d.className="question";
  d.innerHTML=`<p>${q}</p><textarea></textarea>`;
  form.appendChild(d);
}

let stores = [];

fetch("data/stores.csv")
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").map(r => r.split(","));
    const headers = rows.shift();

    stores = rows.map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h.trim()] = r[i]?.trim());
      return obj;
    });
  });

function loadStore() {
  const id = document.getElementById("storeIdInput").value.trim();
  const store = stores.find(s => s["Store ID"] === id);

  if (!store) {
    alert("Store not found");
    return;
  }

  renderSnapshot(store);
  renderQuestions(store);
}

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

  const competitors = getCompetitors(store).join(", ") || "None";

  snap.innerHTML = `
    <div class="section-title">Store Snapshot</div>

    <p><b>System:</b> ${store["System Type"]}</p>
    <p><b>Subscribed Tech:</b> ${store["Subscribed Tech"]}</p>
    <p><b>Mandate:</b> ${store["Mandate"]}</p>

    <p><b>Google Pin:</b> ${store["Gpin Status"]} ${flagFor("Gpin Status")}</p>
    <p><b>Rating:</b> ${store["Google Rating"]} (${store["Number of Google Reviews"]}) ${flagFor("Google Rating")}</p>

    <p><b>Foodhub Weekly Rental:</b> £${store["Payemnt Info [ System Rentals ] [ FoodHub ]"]}</p>
    <p><b>Datman Weekly Rental:</b> £${store["Payemnt Info [ System Rentals ] [ Datman ]"]}</p>

    <p><b>Competitors:</b> ${competitors} ${flagFor("Competitors")}</p>

    <p><b>Avg Online Orders:</b> ${store["Avverage Online"]}</p>
    <p><b>Offline Orders:</b> ${store["Offline Online"]} ${flagFor("Offline Online")}</p>
  `;
}

function renderQuestions(store) {
  const form = document.getElementById("callForm");
  form.classList.remove("hidden");
  form.innerHTML = "";

  addSection(form, "Business Reality");
  addRadio(form, "How busy is the business overall?", [
    "Very busy", "Steady", "Quiet"
  ]);

  addSection(form, "Order Volume");
  addRadio(form, "Total orders per day (all channels)?", [
    "0–20", "21–50", "50+"
  ]);

  addRadio(form, "Online orders per week (all platforms)?", [
    "0–10", "11–30", "30+"
  ]);

  const competitors = getCompetitors(store);
  if (competitors.length > 0) {
    addSection(form, "Online Platforms & Costs");

    addRadio(form, "Which platform brings the most orders?", [
      "Foodhub",
      "Just Eat",
      "Uber Eats",
      "Deliveroo",
      ...competitors
    ]);

    addRadio(form, "Orders per week from that platform?", [
      "0–10", "11–30", "30+"
    ]);

    addText(form, "Commission or transaction fees they take?");
    addText(form, "Any special deal with competitors? (optional)");
  }

  addSection(form, "Offline Orders");
  addRadio(form, "How do you take walk-in & phone orders?", [
    "Foodhub EPOS only",
    "Foodhub EPOS + another company",
    "Another company EPOS only",
    "Pen & paper"
  ]);

  addSection(form, "Foodhub Issues");
  addRadio(form, "Do you face issues with Foodhub system?", [
    "No issues",
    "Minor issues",
    "Major issues"
  ]);

  addText(form, "What kind of issues?");

  document.getElementById("submitBtn").classList.remove("hidden");
}

function addSection(form, title) {
  const h = document.createElement("div");
  h.className = "section-title";
  h.innerText = title;
  form.appendChild(h);
}

function addRadio(form, q, opts) {
  const d = document.createElement("div");
  d.className = "question";
  d.innerHTML = `<p>${q}</p>` +
    opts.map(o =>
      `<label><input type="radio" name="${q}"> ${o}</label><br>`
    ).join("");
  form.appendChild(d);
}

function addText(form, q) {
  const d = document.createElement("div");
  d.className = "question";
  d.innerHTML = `<p>${q}</p><textarea></textarea>`;
  form.appendChild(d);
}

let storeData = [];

fetch("data/stores.json")
  .then(res => res.json())
  .then(data => storeData = data);

function loadStore() {
  const storeId = document.getElementById("storeIdInput").value;
  const store = storeData.find(s => s.storeId === storeId);

  if (!store) {
    alert("Store not found");
    return;
  }

  showSnapshot(store);
  generateFlags(store);
  generateQuestions(store);
}

function showSnapshot(store) {
  const div = document.getElementById("storeSnapshot");
  div.classList.remove("hidden");

  div.innerHTML = `
    <h3>Store Snapshot</h3>
    <p><b>System:</b> ${store.systemType}</p>
    <p><b>Subscribed Tech:</b> ${store.subscribedTech.join(", ")}</p>
    <p><b>Google:</b> ${store.googleRating} ⭐ (${store.googleReviews})</p>
    <p><b>Google Pin:</b> ${store.gpinStatus}</p>
    <p><b>Competitor:</b> ${store.competitor || "None"}</p>
    <p><b>Avg Online:</b> ${store.avgOnline}</p>
    <p><b>Offline Orders:</b> ${store.offlineOrders}</p>
  `;
}

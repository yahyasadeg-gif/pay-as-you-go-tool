// ---- POS COMPETITORS ONLY (NOT DELIVERY PLATFORMS) ----
function getPosCompetitors(store) {
  const raw = [
    store["Other POS Providers"],
    store["Others"]
  ];

  return raw
    .flatMap(v => v ? v.split(",") : [])
    .map(v => v.trim())
    .filter(v =>
      v &&
      !["none", "others", "none visible"].includes(v.toLowerCase())
    );
}

// ---- FLAGS ENGINE ----
function getFlags(store) {
  const flags = [];

  // 🟢 Google Pin Opportunity
  if (store["Gpin Status"] === "Unverified") {
    flags.push({
      field: "Gpin Status",
      type: "green",
      text: "GO GET THE GOOGLE PIN"
    });
  }

  // 🟢 No subscribed tech (upsell opportunity)
  if (
    !store["Subscribed Tech"] ||
    store["Subscribed Tech"].toLowerCase() === "none"
  ) {
    flags.push({
      field: "Subscribed Tech",
      type: "green",
      text: "No Foodhub tech active — upsell opportunity"
    });
  }

  // 🔴 Low Google rating
  if (parseFloat(store["Google Rating"]) < 4) {
    flags.push({
      field: "Google Rating",
      type: "red",
      text: "Low rating may reduce online conversion"
    });
  }

  // 🔴 POS competitor detected
  if (getPosCompetitors(store).length > 0) {
    flags.push({
      field: "POS Competitors",
      type: "red",
      text: "Client already paying another POS provider"
    });
  }

  // 🔴 EPOS installed but not used
  if (
    store["System Type"] === "EPOS" &&
    parseInt(store["Offline Online"] || 0) === 0
  ) {
    flags.push({
      field: "Offline Online",
      type: "red",
      text: "Foodhub EPOS installed but not used for offline orders"
    });
  }

  // 🟢 High offline, low online
  if (
    parseInt(store["Offline Online"] || 0) > 30 &&
    parseInt(store["Avverage Online"] || 0) < 10
  ) {
    flags.push({
      field: "Offline Online",
      type: "green",
      text: "Offline demand exists — online can be grown"
    });
  }

  return flags;
}

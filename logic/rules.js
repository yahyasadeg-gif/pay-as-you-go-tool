function getFlags(store) {
  const flags = [];

  if (store["Gpin Status"] === "Unverified") {
    flags.push({
      field: "Gpin Status",
      type: "green",
      text: "GO GET THE GOOGLE PIN"
    });
  }

  if (parseFloat(store["Google Rating"]) < 4) {
    flags.push({
      field: "Google Rating",
      type: "red",
      text: "Low rating may reduce online conversion"
    });
  }

  if (getCompetitors(store).length > 0) {
    flags.push({
      field: "Competitors",
      type: "red",
      text: "Client already paying another provider"
    });
  }

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

function getCompetitors(store) {
  const raw = [
    store["Competitor Name"],
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

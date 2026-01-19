function generateFlags(store) {
  const flagsDiv = document.getElementById("flags");
  flagsDiv.innerHTML = "";

  if (store.avgOnline < 5 && store.offlineOrders > 50) {
    addFlag("Low online, strong offline", "red");
  }

  if (store.googleReviews > 100) {
    addFlag("Strong Google presence", "green");
  }

  if (store.gpinStatus === "Unverified") {
    addFlag("Unverified Google Pin", "yellow");
  }
}

function addFlag(text, color) {
  const span = document.createElement("span");
  span.className = `flag-${color}`;
  span.innerText = text;
  document.getElementById("flags").appendChild(span);
}

function generateQuestions(store) {
  const form = document.getElementById("callForm");
  form.classList.remove("hidden");
  form.innerHTML = "";

  addQuestion(form, "How busy is the business overall?", ["Very busy", "Steady", "Quiet", "Very quiet"]);
  addQuestion(form, "Total orders per day (approx)?", "number");

  if (store.systemType === "EPOS") {
    addQuestion(form, "Are walk-ins going through EPOS?", ["Yes", "Some", "No"]);
  } else {
    addQuestion(form, "How do you take walk-in orders?", ["Paper", "Memory", "Other"]);
  }

  if (store.gpinStatus === "Unverified") {
    addQuestion(form, "Are you aware Google pin is unverified?", ["Yes", "No"]);
  }

  addQuestion(form, "If you could change one thing about online ordering, what would it be?", "text");

  document.getElementById("submitBtn").classList.remove("hidden");
}

function addQuestion(form, label, options) {
  const div = document.createElement("div");
  div.innerHTML = `<label>${label}</label>`;

  if (Array.isArray(options)) {
    const select = document.createElement("select");
    options.forEach(o => {
      const opt = document.createElement("option");
      opt.value = o;
      opt.text = o;
      select.appendChild(opt);
    });
    div.appendChild(select);
  } else {
    const input = document.createElement("input");
    input.type = options;
    div.appendChild(input);
  }

  form.appendChild(div);
}

import { createCountryDisplayElement } from "../components/available-queue-item.js";
import { renderAvailableQueue, renderCountryPresence, renderSpeakerQueue } from "./speaker-list.js";

async function getCommitteeInfo() {
  try {
    const response = await fetch("assets/committees.json");

    if (!response.ok) {
      throw new Error("Failure to obtain committee information");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
async function getCommitteePresets() {
  try {
    const response = await fetch("assets/committee-presets.json");

    if (!response.ok) {
      throw new Error("Failure to obtain committee information");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function renderCommitteeSelection(session) {
  const select = document.getElementById("committee-selection");

  const committees = await getCommitteeInfo();
  for (const data of committees) {
    const item = document.createElement("option");
    item.style.fontFamily = "monospace";

    const abbrev = data.abbreviation;
    const name = data.longName;
    item.dataset.abbreviation = data.abbreviation;
    item.dataset.name = data.longName;
    item.textContent = `${String(abbrev).padEnd(11, " ")} | ${name}`;

    if (abbrev === "GA") item.selected = "selected";
    select.append(item);
  }
}

export function renderCountrySelection(session) {
  const selected = document.getElementById("active-country-list");
  const missing = document.getElementById("missing-country-list");

  selected.replaceChildren();
  missing.replaceChildren();

  for (const [countryKey, data] of Object.entries(
    session.availableCountries,
  ).sort()) {
    const item = createCountryDisplayElement(data, false);
    item.dataset.countryKey = countryKey;

    if (session.selectedCountries[countryKey]) continue;
    missing.append(item);
  }

  for (const countryKey of Object.keys(session.selectedCountries).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  )) {
    const data = session.selectedCountries[countryKey];
    const item = createCountryDisplayElement(data, false);
    item.dataset.countryKey = countryKey;

    selected.append(item);
  }

  document.getElementById("active-country-count").textContent =
    `${selected.children.length} countries`;
  document.getElementById("missing-country-count").textContent =
    `${missing.children.length} countries`;
}

export async function setupSessionSettingsControls(session) {
  const committeeSelection = document.getElementById("committee-selection");
  const committeeTitle = document.getElementById("committee-title");
  const committeeName = document.getElementById("committee-name");

  committeeSelection.addEventListener("change", (e) => {
    const selected = committeeSelection.selectedOptions[0];
    committeeTitle.placeholder = selected.dataset.name;
  });

  const committeePresetContainer = document.getElementById(
    "committee-preset-container",
  );
  const committeePresets = await getCommitteePresets();

  for (const preset of committeePresets) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "committee-preset";
    item.tabIndex = 0;
    item.setAttribute("role", "button");

    const img = document.createElement("img");
    img.className = "icon";
    img.style.maxHeight = "16px";
    img.src = preset.imgUrl;

    const span = document.createElement("span");
    span.textContent = preset.abbrev;

    item.append(img, span);

    item.addEventListener("click", (e) => {
      for (const countryKey of preset.countries) {
        session.selectCountry(countryKey);
      }

      renderCountryPresence(session);
      renderCountrySelection(session);
      renderAvailableQueue(session);
      renderSpeakerQueue(session);
    });

    committeePresetContainer.append(item);
  }
}

export function setupCountrySelectionControls(session) {
  const missing = document.getElementById("missing-country-list");
  const selected = document.getElementById("active-country-list");
  if (!missing || !selected) return;

  missing.addEventListener("click", (e) => {
    const option = e.target.closest(".listbox-option");
    if (!option || !missing.contains(option)) return;

    const countryKey = option.dataset.countryKey;
    session.selectCountry(countryKey);

    renderCountryPresence(session);
    renderCountrySelection(session);
    renderAvailableQueue(session);
    renderSpeakerQueue(session);
  });

  selected.addEventListener("click", (e) => {
    const option = e.target.closest(".listbox-option");
    if (!option || !selected.contains(option)) return;

    const countryKey = option.dataset.countryKey;
    session.deselectCountry(countryKey);

    renderCountryPresence(session);
    renderCountrySelection(session);
    renderAvailableQueue(session);
    renderSpeakerQueue(session);
  });

  const clearButton = document.getElementById("remove-all-countries");
  clearButton.addEventListener("click", () => {
    session.clearCountries();

    renderCountryPresence(session);
    renderCountrySelection(session);
    renderAvailableQueue(session);
    renderSpeakerQueue(session);
  });

  const customCountryButton = document.getElementById("add-custom-country");
  customCountryButton?.addEventListener("click", () => {
    const countryKey = document.getElementById("custom-country-name").value;
    if (!countryKey) return;

    session.selectCountry(countryKey);
    renderCountrySelection(session);
  });
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
function parseCSV(csv) {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const next = csv[i + 1];

        if (char === '"' && quoted && next === '"') {
            value += '"';
            i++;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (char === "," && !quoted) {
            row.push(value);
            value = "";
        } else if ((char === "\n" || char === "\r") && !quoted) {
            if (char === "\r" && next === "\n") i++;

            row.push(value);
            rows.push(row);

            row = [];
            value = "";
        } else {
            value += char;
        }
    }

    if (value || row.length) {
        row.push(value);
        rows.push(row);
    }

    const headers = rows.shift()?.map(header => header.trim()) ?? [];

    return Object.fromEntries(
        rows
            .filter(row => row.some(cell => cell !== ""))
            .map(row => {
                const country = Object.fromEntries(
                    headers.slice(1).map((header, i) => [
                        header,
                        row[i + 1] ?? ""
                    ])
                );

                // Restore basic boolean values
                for (const key of ["observerStatus", "p5status"]) {
                    if (country[key] === "true") country[key] = true;
                    if (country[key] === "false") country[key] = false;
                }

                return [row[0], country];
            })
    );
}
export function setupSessionMemoryControls(session) {
  const saveCsv = document.getElementById("save-button-csv");
  const saveJson = document.getElementById("save-button-json");
  if (!saveCsv || !saveJson) return;

  saveCsv.addEventListener("click", () => {
    const countries = Object.entries(session.selectedCountries);

    const escapeCSV = (value) => {
      if (value == null) return "";

      const text =
        typeof value === "object" ? JSON.stringify(value) : String(value);

      return `"${text.replace(/"/g, '""')}"`;
    };

    const headers = [
      "id",
      ...new Set(countries.flatMap(([, country]) => Object.keys(country))),
    ];
    const rows = countries.map(([id, country]) => [
      id,
      ...headers.slice(1).map((header) => country[header] ?? ""),
    ]);

    const body = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");
    const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
    downloadFile(blob, "currentCommittee.csv");
  });

  saveJson.addEventListener("click", () => {
    const body = JSON.stringify(session.selectedCountries, null, 4);
    const blob = new Blob([body], { type: "application/json" });
    downloadFile(blob, "currentCommittee.json");
  });

  const loadCsv = document.getElementById("load-button-csv");
  const csvInput = document.getElementById("file-input-csv");
  loadCsv.addEventListener('click', () => csvInput.click());
  csvInput.addEventListener('change', async () => {
    const file = csvInput.files[0];
    if (!file) return;
    try {
        const csv = await file.text();
        const data = parseCSV(csv);
        session.selectedCountries = data;
        renderCountrySelection(session);
        renderAvailableQueue(session);
        renderSpeakerQueue(session);
    } catch (error) {
    } finally {
        csvInput.value = "";
    }
  });
  
  const loadJson = document.getElementById("load-button-json");
  const jsonInput = document.getElementById("file-input-json");
  loadJson.addEventListener('click', () => jsonInput.click());
  jsonInput.addEventListener('change', async () => {
    const file = jsonInput.files[0];
    if (!file) return;
    try {
        const data = JSON.parse(await file.text());
        session.selectedCountries = data;
        renderCountrySelection(session);
        renderAvailableQueue(session);
        renderSpeakerQueue(session);
    } catch (error) {
    } finally {
        jsonInput.value = "";
    }
  });
}

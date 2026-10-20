import { createSession, saveSession, loadSession } from "./models/session.js";
import { CaucusTimer, Timer } from "./models/timer.js";

const DEBUG_MODE = true;

const url = new URL(window.location.href);
const cookies = new Map(
  document.cookie
    .split("; ")
    .filter(Boolean)
    .map((cookie) => {
      const [name, ...value] = cookie.split("=");
      return [name, decodeURIComponent(value.join("="))];
    }),
);

const params = url.searchParams;
const sessionId = params.get("sessionId");
if (!sessionId) {
  console.error(`No session ID provided to create / load`);
  window.location.href = "index.html";
}

var mode = params.get("mode");
if (!mode) {
  console.error(`No session ID provided to create / load`);
} else if (cookies.get("lastSession") === sessionId) {
  url.searchParams.set("mode", "load");
  window.history.pushState({}, "", url);
  mode = "load";
}

const session = await createSession(sessionId);
if (!session) console.error(`Unable to create session`);

switch (mode) {
  case "new":
    await saveSession(session);
    document.cookie = `lastSession=${sessionId}`;
    break;
  case "load":
    await loadSession(session);
    break;
}

session.showStage("config");

function createCountryListItemDiv(countryKey, data, showVoting) {
  const item = document.createElement("div");
  item.className = "list-item";

  const img = document.createElement("img");
  img.src = data.img ?? "../assets/logo.png";
  img.alt = data.shortName;
  img.style.marginRight = "5px";
  item.appendChild(img);

  const name = document.createElement("span");
  name.textContent = data.shortName;
  item.appendChild(name);

  if (!showVoting) {
    return item;
  }

  const voting = document.createElement("div");
  voting.className = "voting";
  voting.style.alignItems = "center";
  voting.style.display = "flex";
  voting.style.gap = "3px";
  voting.style.marginLeft = "auto";
  voting.style.padding = "5px";

  const observerButton = document.createElement("button");
  observerButton.textContent = "Observer";
  observerButton.style.backgroundColor = "#6c6";
  observerButton.style.width = "auto";
  observerButton.style.whiteSpace = "nowrap";

  observerButton.addEventListener("click", (event) => {
    event.stopPropagation();
    data.votingObserver = !data.votingObserver;
    observerButton.classList.toggle("selected", data.votingObserver);
  });
  voting.appendChild(observerButton);

  const buttons = [
    { label: "A", color: "#c66" },
    { label: "P", color: "#c86" },
    { label: "PV", color: "#99f" },
  ];

  for (const buttonData of buttons) {
    const button = document.createElement("button");
    button.textContent = buttonData.label;
    button.style.backgroundColor = buttonData.color;

    button.classList.toggle("selected", data.votingStatus === buttonData.label);
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      data.votingStatus = buttonData.label;
      voting.querySelectorAll("button").forEach((btn) => {
        if (btn.textContent !== "Observer") {
          btn.classList.toggle(
            "selected",
            btn.textContent === data.votingStatus,
          );
        }
      });
    });

    voting.appendChild(button);
  }
  item.appendChild(voting);

  return item;
}

/*
 * Session Configuration Template page functions
 */
function sessionConfigRenderAvailableCountryList() {
  const listbox = document.getElementById("availableCountryList");
  listbox.replaceChildren();

  const searchBox = document.getElementById("availableCountrySearch");
  searchBox.addEventListener("keydown", (e) => {
    let value = searchBox.value;
    // enter or backspace
    if (e.key === "Enter") {
      sessionConfigRenderAvailableCountryList();
    }
  });

  const countries = session.countries.availableCountries;
  for (const countryKey of Object.keys(countries).sort()) {
    const data = countries[countryKey];

    let searchValue = searchBox.value.trim().toLowerCase();
    if (searchValue && !countryKey.toLowerCase().startsWith(searchValue)) {
      continue;
    }

    const item = createCountryListItemDiv(countryKey, data, false);
    item.addEventListener("click", () => {
      session.countries.selectCountry(countryKey);

      sessionConfigRenderAvailableCountryList();
      sessionConfigRenderSelectedCountryList();
    });

    listbox.appendChild(item);
  }
}
function sessionConfigRenderSelectedCountryList() {
  const label = document.getElementById("selectedCountries");
  label.innerText = `(${session.countries.selectedCount}) Selected Countries`;

  const clearSelectionButton = document.getElementById("clearSelection");
  clearSelectionButton.addEventListener("click", () => {
    session.countries.clearSelection();

    sessionConfigRenderAvailableCountryList();
    sessionConfigRenderSelectedCountryList();
  });

  const listbox = document.getElementById("selectedCountryList");
  listbox.replaceChildren();

  const countries = session.countries.selectedCountries;
  for (const countryKey of Object.keys(countries).sort()) {
    const data = countries[countryKey];

    const item = createCountryListItemDiv(countryKey, data, true);
    item.addEventListener("click", () => {
      session.countries.deselectCountry(countryKey);

      sessionConfigRenderAvailableCountryList();
      sessionConfigRenderSelectedCountryList();
    });

    listbox.appendChild(item);
  }
}
function sessionConfigRenderCountrySelectionPresets() {
  const presets = session.countries.presets;
  const container = document.getElementById("countrySelectionPresets");

  for (const name of Object.keys(presets).sort()) {
    const data = presets[name];
    const item = document.createElement("div");
    item.className = "country-preset";

    const img = document.createElement("img");
    img.src = data.img;
    img.style.width = "20px";
    img.style.height = "20px";
    item.appendChild(img);

    const button = document.createElement("button");
    button.textContent = name;
    item.appendChild(button);

    item.addEventListener("click", () => {
      for (const party of data.countries ?? []) {
        session.countries.selectCountry(party);
      }

      sessionConfigRenderAvailableCountryList();
      sessionConfigRenderSelectedCountryList();
    });
    container.appendChild(item);
  }
}
async function renderSessionConfig() {
  const committeeList = document.getElementById("committeeSelection");
  const committees = await fetch("assets/committees.json");
  const data = await committees.json();

  for (const committee of data) {
    const option = document.createElement("option");
    option.innerText = committee.toString();
    if (committee.startsWith("(GA)")) option.selected = "selected";
    committeeList.appendChild(option);
  }

  committeeList.addEventListener("change", (e) => {
    const index = committeeList.selectedIndex;
    const name = committeeList.options[index].textContent;

    const re = /\((.*)\)\s*(.*)$/;
    const matches = name.match(re);

    session.committeeShortName = matches[1];
    session.committeeLongName = matches[2];
  });

  sessionConfigRenderAvailableCountryList();
  sessionConfigRenderSelectedCountryList();
  sessionConfigRenderCountrySelectionPresets();

  const createCustomCountryButton = document.getElementById(
    "avaiableCountryCreateCustom",
  );
  createCustomCountryButton.addEventListener("click", () => {
    const customCountryInput = document.getElementById("avaiableCountryCustom");
    const name = customCountryInput.value;
    if (!name) {
      return;
    }

    session.countries.selectCustom(name, {
      shortName: name,
      longName: name,
      votingStatus: "Absent",
      votingObserver: false,
    });
    sessionConfigRenderSelectedCountryList();
    customCountryInput.value = "";
  });

  const createSessionButton = document.getElementById("createSession");
  createSessionButton.addEventListener("click", async () => {
    if (session.countries.selectedCount === 0) {
      console.error("Can't create a session with no selected members");
      return;
    }

    session.showStage("session");
    await saveSession(session);
    renderSessionApp();
  });

  const saveSessionButton = document.getElementById("saveSessionFile");
  saveSessionButton.addEventListener("click", async () => {
    // TODO: Save to config file...
  });
  const loadSessionButton = document.getElementById("loadSessionFile");
  loadSessionButton.addEventListener("click", async () => {
    // TODO: Load from config file...
  });

}

/*
 * Session page functions
 */
function renderSessionApp() {
  const caucus = new CaucusTimer(
    15,
    function () {
      document.getElementById("caucusTimeRemaining").textContent =
        `${caucus.formatCurrentTime()} / ${caucus.formatCapacityTime()}`;
    },
    function () {
      console.log("WOOOOOO");
    },
  );
  const timer = new Timer(
    10,
    1000,
    function () {
      caucus.tick(true);
      document.getElementById("speakerTimeRemaining").textContent =
        `${timer.formatCurrentTime()} / ${timer.formatCapacityTime()}`;
    },
    function () {
      console.log("AHHH");
      timer.restart();
      timer.start();
    },
  );
  timer.start();

  // countdownTimer();
  sessionConfigRenderSelectedCountryList();
}

  const exportData = {
    example: "Hello world"
  };

  // Export selected format.
  document.querySelector("#to_file").addEventListener("click", event => {
    const type = event.target.dataset.type;
    if (!type) return;

    let content;
    switch (type) {
        case "json":
            const obj = {
                committee: `(${session.committeeShortName}) ${session.committeeLongName}`,
                title: session.name,
                selected: session.countries.selectedCountries,
            }
            content = String(JSON.stringify(obj, null, 2));
            break;
        case "csv":
            content = "TODO: Implement CSV saving"
            breakl
        default:
            content = String(JSON.stringify(exportData, null, 2));
            break
    }

    const mimeTypes = {
      json: "application/json",
      csv: "text/csv",
      txt: "text/plain"
    };

    const blob = new Blob([content], {
      type: mimeTypes[type]
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `export.${type}`;
    link.click();

    URL.revokeObjectURL(url);
  });

  // Import selected format.
  const fileInput = document.querySelector("#file_input");

  document.querySelector("#from_file").addEventListener("click", event => {
    const type = event.target.dataset.type;
    if (!type) return;

    fileInput.accept = `.${type}`;
    fileInput.value = "";
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (!file) return;

      const content = await file.text();
      try {
        switch (type) {
            case "json":
                const data = JSON.parse(content);
                console.log(data);

                session.committee = data.committee;
                session.name = data.title;
                for (const countryKey of Object.keys(data.selected)) {
                    const element = data.selected[countryKey];
                    if (countryKey in session.countries.availableCountries) {
                        session.countries.selectCountry(countryKey);
                    } else if (!(countryKey in session.countries.nations)) {
                        session.countries.selectCustom(countryKey, {
                            shortName: element.shortName,
                            longName: element.longName ?? element.shortName,
                            votingStatus: element.votingStatus,
                            votingObserver: element.votingObserver
                        })

                        continue;
                    }

                    const country = session.countries.selectedCountries[countryKey];
                    country.votingStatus = element.votingStatus;
                    country.votingObserver = element.votingObserver;
                }
                break;
            case "csv":
                throw Error("TODO: Handle CSV session config submission");
            default:
                throw Error(`Can't handle filetype '${type}'`);
        }
        renderSessionConfig();
      } catch (error) {
        console.error("Failed to parse file:", error);
      }
    };

    fileInput.click();
  });
async function createSession(sessionId) {
    const time = performance.now();
    console.log(`TODO: create session ${sessionId}`);
}
async function loadSession(sessionId) {
    console.log(`TODO: load session ${sessionId}`);
}


function createCountryListItemDiv(countryKey, data, showVoting) {
    const item = document.createElement("div");
    item.className = "list-item";

    const img = document.createElement("img");
    img.src = data.img;
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

    observerButton.addEventListener("click", event => {
        event.stopPropagation();
        data.votingObserver = !data.votingObserver;
        observerButton.classList.toggle("selected", data.votingObserver);
    });
    voting.appendChild(observerButton);

    const buttons = [
        { label: "A", color: "#c66" },
        { label: "P", color: "#c86" },
        { label: "PV", color: "#99f" }
    ];

    for (const buttonData of buttons) {
        const button = document.createElement("button");
        button.textContent = buttonData.label;
        button.style.backgroundColor = buttonData.color;

        button.classList.toggle("selected", data.votingStatus === buttonData.label);
        button.addEventListener("click", event => {
            event.stopPropagation();

            data.votingStatus = buttonData.label;
            voting.querySelectorAll("button").forEach(btn => {
                if (btn.textContent !== "Observer") {
                    btn.classList.toggle(
                        "selected",
                        btn.textContent === data.votingStatus
                    );
                }
            });
        });

        voting.appendChild(button);
    }
    item.appendChild(voting);

    return item;
}

function renderAvailableCountryList(countries) {
    const listbox = document.getElementById("availableCountryList");
    listbox.replaceChildren();

    for (const countryKey of Object.keys(countries).sort()) {
        const data = nations[countryKey];

        const item = createCountryListItemDiv(countryKey, data, false);
        item.addEventListener("click", () => {
            selectedCountries[countryKey] = availableCountries[countryKey];
            delete availableCountries[countryKey];

            renderAvailableCountryList(availableCountries);
            renderSelectedCountryList(selectedCountries);
        });

        listbox.appendChild(item);
    }
}
function renderSelectedCountryList(countries) {
    const clearSelectionButton = document.getElementById("clearSelection");
    clearSelectionButton.addEventListener("click", () => {
        for (const name of Object.keys(selectedCountries)) {
            availableCountries[name] = structuredClone(nations[name]);
            delete selectedCountries[name];
        }

        renderAvailableCountryList(availableCountries);
        renderSelectedCountryList(selectedCountries);
    });

    const listbox = document.getElementById("selectedCountryList");
    listbox.replaceChildren();

    for (const countryKey of Object.keys(countries).sort()) {
        const data = countries[countryKey];

        const item = createCountryListItemDiv(countryKey, data, true);
        item.addEventListener("click", () => {
            availableCountries[countryKey] = structuredClone(nations[countryKey]);
            delete selectedCountries[countryKey];

            renderAvailableCountryList(availableCountries);
            renderSelectedCountryList(selectedCountries);
        });

        listbox.appendChild(item);
    }
}
function renderCountrySelectionPresets(presets) {
    const container = document.getElementById("countrySelectionPresets");

    for (const name of Object.keys(presets).sort()) {
        const data = committeePresets[name];
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
                if (!(party in selectedCountries)) {
                    selectedCountries[party] = availableCountries[party];
                    delete availableCountries[party];
                }
            };

            renderAvailableCountryList(availableCountries);
            renderSelectedCountryList(selectedCountries);
        });
        container.appendChild(item);
    }
}
function renderSessionConfig(
    availableCountries,
    selectedCountries,
    committeePresets
) {
    const main = document.getElementById("mainContent");
    const template = document.getElementById("sessionConfigTemplate");

    const configBoard = template.content.cloneNode(true);
    main.replaceChildren(configBoard);

    renderAvailableCountryList(availableCountries);
    renderSelectedCountryList(selectedCountries);
    renderCountrySelectionPresets(committeePresets);

    const createSessionButton = document.getElementById("createSession");
    createSessionButton.addEventListener("click", () => {
        console.log(selectedCountries);
    });
}

let nations;
let committeePresets;
let availableCountries;
let selectedCountries;
function initSession() {
    fetch('assets/country-info.json')
        .then(response => response.json())
        .then(data => {
            nations = data.nations;
            committeePresets = data.committeePresets;

            availableCountries = structuredClone(nations);
            selectedCountries = {};
            renderSessionConfig(
                availableCountries,
                selectedCountries,
                committeePresets
            );
        })
        .catch(error => console.error("Failed to load JSON:", error));
}

function cleanParams(value) {
    if (!value) { return null; }

    if (value.startsWith("?")) {
        value = value.slice(1)
    }
    return value
}
const params = new URLSearchParams(window.location.search);
const sessionId = cleanParams(params.get("sessionId"));
if (!sessionId) { console.error(`No session ID provided to create / load`) }


const mode = cleanParams(params.get("mode"));
if (!mode) { console.error(`No session ID provided to create / load`) }
switch (mode) {
    case "new":
        createSession(sessionId);
        initSession();
        break;
    case "load":
        loadSession(sessionId);
        break;
    default:
        console.error(`Can't handle session mode ${mode}`);
}

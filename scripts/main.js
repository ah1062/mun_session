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

/* 
* Session Configuration Template page functions 
*/
function sessionConfigRenderAvailableCountryList(countries) {
    const listbox = document.getElementById("availableCountryList");
    listbox.replaceChildren();

    const searchBox = document.getElementById("availableCountrySearch");
    searchBox.addEventListener("keydown", (e) => {
        let value = searchBox.value;
        // enter or backspace
        if (e.key === "Enter") {
            sessionConfigRenderAvailableCountryList(availableCountries);
        }
    });

    for (const countryKey of Object.keys(countries).sort()) {
        const data = nations[countryKey];
        
        let searchValue = searchBox.value;
        if (searchValue && countryKey.slice(0, searchValue.length).toLowerCase() !== searchValue.toLowerCase()) {
            continue;
        }

        const item = createCountryListItemDiv(countryKey, data, false);
        item.addEventListener("click", () => {
            selectedCountries[countryKey] = availableCountries[countryKey];
            delete availableCountries[countryKey];

            sessionConfigRenderAvailableCountryList(availableCountries);
            sessionConfigRenderSelectedCountryList(selectedCountries);
        });

        listbox.appendChild(item);
    }
}
function sessionConfigRenderSelectedCountryList(countries) {
    const clearSelectionButton = document.getElementById("clearSelection");
    clearSelectionButton.addEventListener("click", () => {
        for (const name of Object.keys(selectedCountries)) {
            availableCountries[name] = structuredClone(nations[name]);
            delete selectedCountries[name];
        }

        sessionConfigRenderAvailableCountryList(availableCountries);
        sessionConfigRenderSelectedCountryList(selectedCountries);
    });

    const listbox = document.getElementById("selectedCountryList");
    listbox.replaceChildren();

    for (const countryKey of Object.keys(countries).sort()) {
        const data = countries[countryKey];

        const item = createCountryListItemDiv(countryKey, data, true);
        item.addEventListener("click", () => {
            availableCountries[countryKey] = structuredClone(nations[countryKey]);
            delete selectedCountries[countryKey];

            sessionConfigRenderAvailableCountryList(availableCountries);
            sessionConfigRenderSelectedCountryList(selectedCountries);
        });

        listbox.appendChild(item);
    }
}
function sessionConfigRenderCountrySelectionPresets(presets) {
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

            sessionConfigRenderAvailableCountryList(availableCountries);
            sessionConfigRenderSelectedCountryList(selectedCountries);
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

    sessionConfigRenderAvailableCountryList(availableCountries);
    sessionConfigRenderSelectedCountryList(selectedCountries);
    sessionConfigRenderCountrySelectionPresets(committeePresets);

    const createSessionButton = document.getElementById("createSession");
    createSessionButton.addEventListener("click", () => {
        console.log(selectedCountries);
    });
}

/*
* Session page functions
*/
let caucusTimeRemaining = 900;
let caucusTimeCapacity = 900;
let speakerTimeRemaining = 15;
let speakerTimeCapacity = 60;

function secondsToTime(secondsAmount) {
    const hours = Math.floor(secondsAmount / 3600);
    const minutes = Math.floor(secondsAmount / 60);
    const seconds = secondsAmount % 60;

    let comps = [];
    if (hours) {
        let text = String(hours).padEnd(2, '0');
        comps.push(text);
    }
    if (minutes) {
        let text = String(minutes);
        if (minutes >= 10) {
            text = text.padEnd(2, '0');
        }
        comps.push(text);
    } else {
        if (hours) {
            comps.push('00');
        } else {
            comps.push('0');
        }
    }
    if (seconds) {
        let text = String(seconds);
        if (seconds < 10) {
            text = text.padStart(2, '0');
        }
        comps.push(text);
    } else {
        comps.push('00');
    }

    let string = comps.join(':');
    return `${string}`;
}

function countdownTimer() {
    caucusTimeRemaining -= 1;
    speakerTimeRemaining -= 1;

    const caucusTimeLeft = document.getElementById("caucusTimeRemaining");
    caucusTimeLeft.innerText = 
        `${secondsToTime(caucusTimeRemaining)} / ${secondsToTime(caucusTimeCapacity)}`;

    const speakerTimeLeft = document.getElementById("speakerTimeRemaining");
    speakerTimeLeft.innerText = 
        `${secondsToTime(speakerTimeRemaining)} / ${secondsToTime(speakerTimeCapacity)}`;

    if (speakerTimeRemaining !== 0) {
        setTimeout(countdownTimer, 1000);
    }
}

function renderSessionApp(selectedCountries) {
    const main = document.getElementById("mainContent");
    const template = document.getElementById("sessionAppTemplate");

    const appBoard = template.content.cloneNode(true);
    main.replaceChildren(appBoard);
    countdownTimer();
}


var nations;
var committeePresets;
var availableCountries;
var selectedCountries;
function initSession() {
    fetch('assets/country-info.json')
        .then(response => response.json())
        .then(data => {
            nations = data.nations;
            committeePresets = data.committeePresets;

            availableCountries = structuredClone(nations);
            selectedCountries = {};
        })
        .catch(error => console.error("Failed to load JSON:", error));

    renderSessionConfig(
        availableCountries,
        selectedCountries,
        committeePresets
    );
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
        renderSessionApp(selectedCountries);
        break;
    default:
        console.error(`Can't handle session mode ${mode}`);
}
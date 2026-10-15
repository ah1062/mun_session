import { CountrySelection } from './models/selection.js';
import { Session, saveSession, loadSession} from './models/session.js';
import { CaucusTimer, Timer } from './models/timer.js';

const urlString = window.location.search;
const paramString = urlString.split('?')[1];

const cookie = document.cookie;
const params = new URLSearchParams(paramString);
const sessionId = params.get("sessionId");
if (!sessionId) {
    console.error(`No session ID provided to create / load`);
    window.location.href = "index.html";
}

var mode = params.get("mode");
if (!mode) {
    console.error(`No session ID provided to create / load`);
} else if (cookie.lastSession === session.sessionId) {
    mode = "load";
}

async function createSession(sessionId) {
    try {
        const response = await fetch("assets/country-info.json");

        if (!response.ok) {
            throw new Error(`Failed to load country data: ${response.status}`);
        }

        const data = await response.json();
        const selection = new CountrySelection(
            data.nations,
            data.committeePresets,
        );

        const main = document.getElementById("mainContent");
        const session = new Session(sessionId, main, selection);
        return session;

    } catch (error) {
        console.error("Failed to initialize session:", error);
        return null;
    }
}

const session = await createSession(sessionId);
if (!session) {
    console.error(`Unable to create session`);   
} 

switch (mode) {
    case "new": 
        await saveSession(session);
        cookie.lastSession = session.sessionId;
        break;
    case "load":
        await loadSession(session);
}

session.showStage("config");
await renderSessionConfig(
    session.countries.availableCountries,
    session.countries.selectedCountries,
    session.countries.presets
)

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

        button.classList.toggle(
            "selected",
            data.votingStatus === buttonData.label,
        );
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
    const committees = await fetch('assets/committees.json');
    const data = await committees.json();

    for (const committee of data) {
        const option = document.createElement('option');
        option.innerText = committee.toString();
        if (committee.startsWith("(GA)")) option.selected = "selected";
        committeeList.appendChild(option)
    }
    
    committeeList.addEventListener('change', (e) => {
        const index = committeeList.selectedIndex;
        const name = committeeList.options[index].textContent;

        const re = /\((.*)\)\s*(.*)$/;
        const matches = name.match(re);

        session.committeeShortName = matches[1];
        session.committeeLongName = matches[2];
    })

    sessionConfigRenderAvailableCountryList();
    sessionConfigRenderSelectedCountryList();
    sessionConfigRenderCountrySelectionPresets();

    const createCustomCountryButton = document.getElementById(
        "avaiableCountryCreateCustom",
    );
    createCustomCountryButton.addEventListener("click", () => {
        const customCountryInput = document.getElementById(
            "avaiableCountryCustom",
        );
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
        await session.save();
        renderSessionApp();
    });
}

/*
 * Session page functions
 */
let caucusTimeRemaining = 900;
let caucusTimeCapacity = 900;
let speakerTimeRemaining = 15;
let speakerTimeCapacity = 60;

function secondsToTime(totalSeconds) {
    const seconds = Math.max(0, totalSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
    }

    return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

let countdownInterval;
function countdownTimer() {
    clearInterval(countdownInterval);

    function updateDisplay() {
        document.getElementById("caucusTimeRemaining").textContent =
            `${secondsToTime(caucusTimeRemaining)} / ${secondsToTime(caucusTimeCapacity)}`;

        document.getElementById("speakerTimeRemaining").textContent =
            `${secondsToTime(speakerTimeRemaining)} / ${secondsToTime(speakerTimeCapacity)}`;
    }

    updateDisplay();

    countdownInterval = setInterval(() => {
        if (caucusTimeRemaining > 0) caucusTimeRemaining--;
        if (speakerTimeRemaining > 0) speakerTimeRemaining--;

        updateDisplay();

        if (caucusTimeRemaining === 0 && speakerTimeRemaining === 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

function renderSessionApp() {
    const caucus = new CaucusTimer(
        15,
        function() {
            document.getElementById("caucusTimeRemaining").textContent =
                `${caucus.formatCurrentTime()} / ${caucus.formatCapacityTime()}`
        },
        function() {
            console.log("WOOOOOO");
        }
    )
    const timer = new Timer(
        10, 
        1000, 
        function() {
            caucus.tick(true);
            document.getElementById("speakerTimeRemaining").textContent =
                `${timer.formatCurrentTime()} / ${timer.formatCapacityTime()}`
        },
        function() {
            console.log("AHHH");
            timer.restart();
            timer.start();
        }
    );
    timer.start();

    // countdownTimer();
    sessionConfigRenderSelectedCountryList();
}


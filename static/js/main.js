import { createSession, saveSession, loadSession } from "./models/session.js";

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
const sessionId = params.get("sessionId") ?? -1;

var mode = params.get("mode") ?? "new";
if (cookies.get("lastSession") === sessionId) {
  url.searchParams.set("mode", "load");
  window.history.pushState({}, "", url);
  mode = "load";
}

var session = await createSession(sessionId);
if (!session) console.error(`Unable to create session`);

switch (mode) {
  case "new":
    await saveSession(session);
    document.cookie = `lastSession=${sessionId}`;
    break;
  case "load":
    session = await loadSession(sessionId);
    break;
}

const randomEntries = Object.entries(session.availableCountries)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
const randomElements = Object.fromEntries(randomEntries);
session.selectedCountries = randomElements;

const root = document.documentElement;
const $ = id => document.getElementById(id);

$("theme-toggle").addEventListener("click", () => {
    const isLight = root.dataset.theme !== "light";

    root.dataset.theme = isLight ? "light" : "dark";

    themeToggle.textContent = isLight ? "Dark mode" : "Light mode";
    themeToggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark mode" : "Switch to light mode"
    );
});

function renderSpeakerQueueElement(data) {
    const actions = [
        { action: "top", text: "⮤", label: "Move to top" },
        { action: "up", text: "⮝", label: "Move up" },
        { action: "down", text: "⮟", label: "Move down" },
        { action: "bottom", text: "⮧", label: "Move to bottom" },
        { action: "remove", text: "⤬", label: "Remove from list" }
    ];

    const item = document.createElement('div');    
    item.className = "listbox-option";
    item.role = "option";
    item.tabIndex = 0;

    const img = document.createElement('img');
    img.className = 'icon';
    img.src = data.imgUrl;
    img.style.maxHeight = '20px';
    item.appendChild(img);

    const name = document.createElement('span');
    name.className = 'speaker-name';
    name.textContent = data.shortName;
    item.appendChild(name);

    const controls = document.createElement("div");
    controls.className = "queue-controls";
    actions.forEach(({ action, text, label }) => {
        const button = document.createElement("button");

        button.type = "button";
        button.dataset.action = action;
        button.setAttribute("aria-label", label);
        button.title = label;
        button.textContent = text;

        controls.appendChild(button);
    });

    item.appendChild(name);
    item.appendChild(controls);

    return item;
}
function renderSpeakerQueue() {
    $("queue-list").replaceChildren();
    
    for (const countryKey of session.speakerQueue) {
        const data = session.selectedCountries[countryKey];
        if (!data) continue;
        
        const element = renderSpeakerQueueElement(data);
        $("queue-list").appendChild(element);
    }
}

function renderAvailableCountries() {
    $("available-list").replaceChildren();
    
    for (const [countryKey, data] of Object.entries(session.selectedCountries).sort()) {
        console.log(`Rendering ${countryKey} success = ${session.speakerQueue.includes(countryKey)}`);
        if (session.speakerQueue.includes(countryKey)) continue;

        const item = document.createElement('div');    
        item.className = "listbox-option";
        item.role = "option";
        item.tabIndex = 0;

        const img = document.createElement('img');
        img.className = 'icon';
        img.src = data.imgUrl;
        img.style.maxHeight = '20px';
        item.appendChild(img);

        const name = document.createElement('span');
        name.className = 'speaker-name';
        name.textContent = data.shortName;
        item.appendChild(name);

        $("available-list").appendChild(item);
    }
}

function renderActiveSpeaker(country) {
    if (!country) {
        $("timerMain").style.visibility = 'hidden';
        return;
    }

    $("timerMain").style.visibility = 'auto';
    $("speaker-flag").src = country.imgUrl;
    $("speaker-name").textContent = country.shortName;
}

$("queue-list").addEventListener("click", (event) => {
    const queueList = $("queue-list");

    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const option = event.target.closest(".listbox-option");
    if (!option || !queueList.contains(option)) return;

    const optionName = option.querySelector(".speaker-name").textContent;

    const items = [...queueList.querySelectorAll(".listbox-option")];
    const index = items.indexOf(option);
    const action = button.dataset.action;

    switch (action) {
        case "top":
            queueList.prepend(option);
            break;
        case "up":
            if (index > 0) {
                queueList.insertBefore(option, items[index - 1]);
            }
            break;
        case "down":
            if (index < items.length - 1) {
                queueList.insertBefore(items[index + 1], option);
            }
            break;
        case "bottom":
            queueList.appendChild(option);
            break;
        case "remove":
            option.remove();

            session.dequeueCountry(optionName);
            renderAvailableCountries();
            break;
    }
});

$("available-list").addEventListener("click", (e) => {
    const availableList = $("available-list");

    const option = e.target.closest(".listbox-option");
    if (!option || !availableList.contains(option)) return;

    const optionName = option.querySelector(".speaker-name").textContent;

    option.remove();

    session.enqueueCountry(optionName);
    renderSpeakerQueue();
});

$("next-speaker").addEventListener("click", () => {
    if (session.speakerQueue.length === 0) {
        renderActiveSpeaker(null);
        return;
    }

    const countryKey = session.speakerQueue.shift();
    const country = session.selectedCountries[countryKey];

    renderActiveSpeaker(country);
    renderSpeakerQueue();
    renderAvailableCountries();
});

const country = session.availableCountries["Afghanistan"];
renderActiveSpeaker(country);

const randomElement = Object.keys(session.selectedCountries)[0];
session.enqueueCountry(randomElement);
renderSpeakerQueue();
renderAvailableCountries();
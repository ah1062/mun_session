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

function renderSpeaker(country) {
    if (!country) {
        $("speaker-flag-container").hidden = true;
        return;
    }

    $("speaker-flag-container").hidden = false;
    $("speaker-flag").src = country.imgUrl;
    $("speaker-name").textContent = country.shortName;
}

$("queue-list").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const option = event.target.closest(".listbox-option");
    if (!option || !queueList.contains(option)) return;

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
            break;
    }
});

$("available-list").addEventListener("click", (e) => {
    const option = e.target.closest(".listbox-option");
    const optionName = option.children[0].textContent;

    session.enqueueCountry(optionName);
});

$("next-speaker").addEventListener("click", () => {
    const nextSpeaker = session.speakerQueue.pop();
    renderSpeaker(nextSpeaker);
});

const country = session.availableCountries["Afghanistan"];
renderSpeaker(country);
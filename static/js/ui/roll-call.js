import { createRollCallElement } from "../components/roll-call-item.js";
import { renderAvailableQueue, renderCountryPresence, renderSpeakerQueue } from "./speaker-list.js";

export function setupRollCallControls(session) {
    const list = document.getElementById("roll-call-list");
    list?.addEventListener("click", (e) => {
        const button = e.target.closest(".attendance-toggle");
        if (!button) return;

        const item = button.closest(".listbox-option");
        const countryKey = item?.dataset.countryKey;
        if (!countryKey) return;

        const country = session.selectedCountries[countryKey];
        if (!country) return;

        const status = button.dataset.status;
        if (status === 'observerStatus') {
            country.observerStatus = !country.observerStatus;
        } else if (status === 'p5status') {
            country.p5status = !country.p5status;
        } else {
            country.votingStatus = status;
        }

        if (status === "A") session.dequeueCountry(countryKey);

        renderCountryPresence(session);
        renderRollCallList(session);
        renderAvailableQueue(session);
        renderSpeakerQueue(session);
    });

    document.getElementById("absent-all-button")?.addEventListener("click", (e) => {
        for (const [_, data] of Object.entries(session.selectedCountries)) {
            data.votingStatus = "A";
        }
        renderCountryPresence(session);
        renderRollCallList(session);
        renderAvailableQueue(session);

        session.speakerQueue = [];
        renderSpeakerQueue(session);
        
    });
    document.getElementById("present-all-button")?.addEventListener("click", (e) => {
        for (const [_, data] of Object.entries(session.selectedCountries)) {
            data.votingStatus = "P";
        }
        renderCountryPresence(session);
        renderRollCallList(session);
        renderAvailableQueue(session);
    });
    document.getElementById("present-voting-all-button")?.addEventListener("click", (e) => {
        for (const [_, data] of Object.entries(session.selectedCountries)) {
            data.votingStatus = "PV";
        }
        renderCountryPresence(session);
        renderRollCallList(session);
        renderAvailableQueue(session);
    });
}

export function renderRollCallList(session) {
    const list = document.getElementById("roll-call-list");
    if (!list) return;

    const countDisplay = document.getElementById("roll-call-count");
    countDisplay.textContent = 
        `${Object.entries(session.selectedCountries).length} countries`;

    list.replaceChildren();
    for (const [countryKey, data] of Object.entries(
        session.selectedCountries,
    ).sort()) {
        const item = createRollCallElement(data);

        item.dataset.countryKey = countryKey;
        list.append(item);
    }
}

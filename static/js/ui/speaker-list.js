import { createCountryDisplayElement } from "../components/available-queue-item.js";
import { createSpeakerQueueElement } from "../components/speaker-queue-item.js";

export function renderCountryPresence(session) {
    const count = Object.values(session.selectedCountries).filter(
        (data) => data.votingStatus !== "A",
    ).length;
    document.getElementById("simple-majority-value").textContent =
        Math.ceil(count * 0.5);
    document.getElementById("super-majority-value").textContent =
        Math.ceil(count * 0.66);

    document.getElementById("unanimity-value").textContent = count;
}

export function renderAvailableQueue(session, searchValue) {
    const list = document.getElementById("available-list");
    if (!list) return;

    var count = 0;
    list.replaceChildren();
    for (const [countryKey, data] of Object.entries(
        session.selectedCountries,
    ).sort()) {
        if (data.votingStatus === "A") continue;
        if (searchValue && !countryKey.toLowerCase().startsWith(searchValue))
            continue;
        if (countryKey === session.currentSpeaker) continue;
        if (session.speakerQueue.includes(countryKey)) continue;

        const item = createCountryDisplayElement(data);
        list.append(item);
        count++;
    }

    const label = document.getElementById("available-speakers-label");
    if (label) label.textContent = `${count} Available Speakers`;
}

export function renderSpeakerQueue(session) {
    const label = document.getElementById("upcoming-speakers-label");
    const list = document.getElementById("queue-list");
    if (!list) return;

    if (label) {
        label.textContent = `${session.speakerQueue.length} Upcoming Speakers`;
    }

    list.replaceChildren();
    for (const countryKey of session.speakerQueue) {
        const data = session.selectedCountries[countryKey];
        if (!data) continue;

        const item = createSpeakerQueueElement(data);
        item.dataset.countryKey = countryKey;
        list.append(item);
    }
}

export function renderActiveSpeaker(session, countryKey) {
    if (!countryKey) {
        $("timerMain").style.visibility = "hidden";
        return;
    }

    if (!Object.keys(session.selectedCountries).includes(countryKey)) {
        $("timerMain").style.visibility = "hidden";
        return;
    }

    $("timerMain").style.visibility = "visible";
    const country = session.selectedCountries[countryKey];

    const container = $("speaker-flag-container");
    if (container) {
        const img = document.createElement("img");
        img.id = "speaker-flag";
        img.src = country.imgUrl;

        container.replaceChildren(img);
    }

    $("speaker-name").textContent = country.shortName;
}

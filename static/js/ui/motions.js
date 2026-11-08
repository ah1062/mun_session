import { createCountryDisplayElement } from "../components/available-queue-item.js";

export function renderMotionSubmissions(session) {

}

var CURRENT_SUBMITTER = null;

export function setupMotionControls(session) {
    const searchInput = document.getElementById("motion-country-search");
    searchInput?.addEventListener('input', () => {
        renderMotionAvailableSubmitters(session);
    }) 

    const submission = document.getElementById("submission-field");
    submission?.addEventListener('click', (e) => {
        const option = e.target.closest("#motion-submitter");
        if (!option|| !submission.contains(option)) return;

        option.remove();
        document.getElementById("template-motion-submitter").hidden = false;
        
        CURRENT_SUBMITTER = null;
        renderMotionAvailableSubmitters(session);
    });

    const listbox = document.getElementById("motion-available-list");
    listbox?.addEventListener('click', (e) => {
        const option = e.target.closest(".listbox-option");
        if (!option|| !listbox.contains(option)) return;

        const countryKey = option.dataset.countryKey;
        const data = session.selectedCountries[countryKey];
        if (!data) return;

        CURRENT_SUBMITTER = countryKey;

        const existing = document.getElementById('motion-submitter');
        if (existing) existing.remove();

        const item = createCountryDisplayElement(data, false);
        item.id = "motion-submitter";
        item.style.flex = 1;

        const submission = document.getElementById("submission-field");
        submission?.append(item);
        document.getElementById("template-motion-submitter").hidden = true;

        renderMotionAvailableSubmitters(session)
    });
}

export function renderMotionAvailableSubmitters(session) {
    const listbox = document.getElementById("motion-available-list");
    if (!listbox) return;

    const searchInput = document.getElementById("motion-country-search");
    const searchValue = searchInput.value.toLowerCase();

    listbox.replaceChildren();
    const countries = Object.entries(session.selectedCountries);
    for (const [countryKey, data] of countries.sort()) {
        if (countryKey === CURRENT_SUBMITTER) continue;
        if (searchValue && !countryKey.toLowerCase().startsWith(searchValue)) continue;
        if (data.votingStatus === "A") continue;

        const item = createCountryDisplayElement(data, false);
        listbox.append(item);
    }
}
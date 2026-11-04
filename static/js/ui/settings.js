import { createCountryDisplayElement } from "../components/available-queue-item.js";

async function getCommitteeInfo() {
    try {
        const response = await fetch('assets/committees.json');

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
        const response = await fetch('assets/committee-presets.json');

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
        const item = document.createElement('option');
        item.style.fontFamily = 'monospace';
        
        const abbrev = data.abbreviation;
        const name = data.longName;
        item.dataset.abbreviation = data.abbreviation;
        item.dataset.name = data.longName;
        item.textContent = `${String(abbrev).padEnd(11, ' ')} | ${name}`

        if (abbrev === 'GA') item.selected = "selected";
        select.append(item);
    }
}

export function renderCountrySelection(session) {
    const selected = document.getElementById("active-country-list");
    const missing = document.getElementById("missing-country-list");
    
    selected.replaceChildren();
    missing.replaceChildren();

    for (const [countryKey, data] of Object.entries(session.availableCountries).sort()) {
        const item = createCountryDisplayElement(data, false);
        item.dataset.countryKey = countryKey;

        if (session.selectedCountries[countryKey]) continue; 
        missing.append(item);
    }

    for (const countryKey of Object.keys(session.selectedCountries).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))) {
        const data = session.selectedCountries[countryKey];
        const item = createCountryDisplayElement(data, false);
        item.dataset.countryKey = countryKey;

        selected.append(item);
    }

    document.getElementById("active-country-count").textContent = `${selected.children.length} countries`;
    document.getElementById("missing-country-count").textContent = `${missing.children.length} countries`;
}

export async function setupSessionSettingsControls(session) {
    const committeeSelection = document.getElementById("committee-selection");
    const committeeTitle = document.getElementById("committee-title");
    const committeeName = document.getElementById("committee-name");

    committeeSelection.addEventListener('change', (e) => {
        const selected = committeeSelection.selectedOptions[0];
        committeeTitle.placeholder = selected.dataset.name;
    });

    const committeePresetContainer = document.getElementById("committee-preset-container");
    const committeePresets = await getCommitteePresets();

    for (const preset of committeePresets) {
        const item = document.createElement("button");
        item.type = 'button';
        item.className = 'committee-preset';
        item.tabIndex = 0;
        item.setAttribute('role', 'button');

        const img = document.createElement('img');
        img.className = 'icon';
        img.style.maxHeight = '16px';
        img.src = preset.imgUrl;

        const span = document.createElement('span');
        span.textContent = preset.abbrev;

        item.append(img, span);

        item.addEventListener('click', (e) => {
            for (const countryKey of preset.countries) {
                if (session.selectedCountries[countryKey]) continue;

                const country = session.availableCountries[countryKey];
                session.selectedCountries[countryKey] = structuredClone(country);       
            }

            renderCountrySelection(session);
        });

        committeePresetContainer.append(item);
    }
}

export function setupCountrySelectionControls(session) {
    const missing = document.getElementById("missing-country-list");
    const selected = document.getElementById("active-country-list");

    if (!missing || !selected) return;

    missing.addEventListener('click', (e) => {
        const option = e.target.closest('.listbox-option');
        if (!option || !missing.contains(option)) return;
    
        const countryKey = option.dataset.countryKey;
        if (session.selectedCountries[countryKey]) return;

        const country = session.availableCountries[countryKey];
        if (!country) return; 

        session.selectedCountries[countryKey] = structuredClone(country);       
        renderCountrySelection(session);
    });

    selected.addEventListener('click', (e) => {
        const option = e.target.closest('.listbox-option');
        if (!option || !selected.contains(option)) return;
    
        const countryKey = option.dataset.countryKey;
        if (!session.selectedCountries[countryKey]) return;

        delete session.selectedCountries[countryKey];
        renderCountrySelection(session);
    });

    const clearButton = document.getElementById("remove-all-countries");
    clearButton.addEventListener('click', () => {
        session.selectedCountries = {};
        renderCountrySelection(session);
    });


    const customCountryButton = document.getElementById("add-custom-country");
    if (!customCountryButton) return;

    customCountryButton.addEventListener('click', () => {
        const countryKey = document.getElementById('custom-country-name').value;
        if (!countryKey) return;

        session.selectedCountries[countryKey] = {
            imgUrl: 'assets/logo.png',
            shortName: countryKey,
            longName: countryKey,
            votingStatus: "A",
            votingObserver: false,
            isoCode: "--",
            iso3code: "---"
        }

        renderCountrySelection(session);
    })
}
import { createCountryListItem } from "../components/countryListItem.js";

export class SessionAppView {
    constructor(session, { onCreateSession = () => {} } = {}) {
        this.root = document;
        this.templateName = "sessionAppTemplate";

        this.session = session;
        this.countries = session.countries;
        this.onCreateSession = onCreateSession;
    }

    async render() {
        this.bindEvents();


        const listbox = document.getElementById("selectedCountryList");
        listbox.replaceChildren();

        const countries = this.countries.selectedCountries;
        for (const countryKey of Object.keys(countries).sort()) {
            const data = countries[countryKey];

            if (data.votingStatus == "A") {
                continue;
            }

            const item = createCountryListItem(countryKey, data, {
                showVoting: false,
                onClick: () => {
                    this.countries.deselectCountry(countryKey);
                    this.renderAvailableCountryList();
                    this.renderSelectedCountryList();
                }
            });

            listbox.appendChild(item);
        }
    }

    bindEvents() {}
}
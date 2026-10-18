import { createCountryListItem } from "../components/countryListItem.js";

export class SessionConfigView {
    constructor(session, { onCreateSession = () => {} } = {}) {
        this.root = document;
        this.templateName = "sessionConfigTemplate";

        this.session = session;
        this.countries = session.countries;
        this.onCreateSession = onCreateSession;
    }

    async render() {
        await this.renderCommitteeNames();
        this.renderCommitteePresets();
        this.renderAvailableCountryList();
        this.renderSelectedCountryList();

        this.bindEvents();
    }
    
    bindEvents() {
        const createSessionButton = document.getElementById("createSession");
        createSessionButton.addEventListener("click", this.onCreateSession);

        const clearSelectionButton = document.getElementById("clearSelection");
        clearSelectionButton.addEventListener("click", () => {
            this.countries.clearSelection();
            this.renderAvailableCountryList();
            this.renderSelectedCountryList();
        });
    }

    async renderCommitteeNames() {
      const committeeList = document.getElementById("committeeSelection");
      const committees = await fetch("assets/committees.json");
      const data = await committees.json();

      for (const committee of data) {
        const option = document.createElement("option");
        option.innerText = committee.toString();
        if (committee.startsWith("(GA)")) option.selected = "selected";
        committeeList.appendChild(option);
      }

      committeeList.addEventListener("change", (e) => {
        const index = committeeList.selectedIndex;
        const name = committeeList.options[index].textContent;

        const re = /\((.*)\)\s*(.*)$/;
        const matches = name.match(re);

        session.committeeShortName = matches[1];
        session.committeeLongName = matches[2];
      });
    }
    renderCommitteePresets () {
      const presets = this.session.countries.presets;
      const container = document.getElementById("countrySelectionPresets");
      container.replaceChildren();

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
            this.countries.selectCountry(party);
          }

          this.renderAvailableCountryList();
          this.renderSelectedCountryList();
        });
        container.appendChild(item);
      }
    }
    renderAvailableCountryList() {
        const listbox = document.getElementById("availableCountryList");
        listbox.replaceChildren();

        const searchValue = document.getElementById("availableCountrySearch")
            .value.trim().toLowerCase();

        const countries = this.countries.availableCountries;
        for (const countryKey of Object.keys(countries).sort()) {
            if (searchValue && !countryKey.toLowerCase().startsWith(searchValue)) {
                continue;
            }

            const data = countries[countryKey];
            const item = createCountryListItem(countryKey, data, {
                onClick: () => {
                    this.countries.selectCountry(countryKey);
                    this.renderAvailableCountryList();
                    this.renderSelectedCountryList();
                }
            });

            listbox.appendChild(item);
        }
    }
    renderSelectedCountryList() {
        const listbox = document.getElementById("selectedCountryList");
        listbox.replaceChildren();

        const countries = this.countries.selectedCountries;
        for (const countryKey of Object.keys(countries).sort()) {
            const data = countries[countryKey];
            const item = createCountryListItem(countryKey, data, {
                showVoting: true,
                onClick: () => {
                    this.countries.deselectCountry(countryKey);
                    this.renderAvailableCountryList();
                    this.renderSelectedCountryList();
                }
            });

            listbox.appendChild(item);
        }
    }
}

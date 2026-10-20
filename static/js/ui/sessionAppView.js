import { createCountryListItem } from "../components/countryListItem.js";
import { Timer } from "../models/timer.js";

export class SessionAppView {
    constructor(session, { onCreateSession = () => {} } = {}) {
        this.root = document;
        this.templateName = "sessionAppTemplate";

        this.session = session;
        this.onCreateSession = onCreateSession;

        const timer = new Timer(
            900, 
            1000,
            function() {
                timer.render(document.getElementById("speakerTimeRemaining"));
            }
        );
        this.timer = timer;
    }

    async render() {
        this.bindEvents();

        this.renderSelectedCountryList();
    }

    bindEvents() {
        const obj = document.getElementById("speakerTimeRemaining")
        const startSpeakerButton = document.getElementById("startSpeaker");
        startSpeakerButton.addEventListener("click", () => {
            this.timer.start();
        });      
        const stopSpeakerButton = document.getElementById("stopSpeaker");
        stopSpeakerButton.addEventListener("click", () => {
            this.timer.stop();
            this.timer.render(obj);
        });      
        const restartSpeakerButton = document.getElementById("restartSpeaker");
        restartSpeakerButton.addEventListener("click", () => {
            this.timer.restart();
            this.timer.render(obj);
        });      
    }

    renderSelectedCountryList() {
        const listbox = document.getElementById("selectedCountryList");
        listbox.replaceChildren();

        const countries = this.session.countries.selectedCountries;
        for (const countryKey of Object.keys(countries).sort()) {
            const data = countries[countryKey];

            if (data.votingStatus == "A") {
                continue;
            }

            const item = createCountryListItem(countryKey, data, {
                showVoting: false,
                onClick: () => {
                }
            });

            listbox.appendChild(item);
        }
    }
}
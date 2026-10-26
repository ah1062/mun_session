import { createCountryListItem } from "../components/countryListItem.js";
import { Timer } from "../models/timer.js";

const DEFAULT_SPEAKER_TIME = 90;
export class SessionGSLView {
    constructor(session, { onCreateSession = () => {} } = {}) {
        this.root = document;
        this.templateName = "sessionGSLTemplate";

        this.session = session;
        this.onCreateSession = onCreateSession;

        // Countries selected during session configuration
        this.availableSpeakers = Object.entries(
            session.countries.selectedCountries
        ).map(([name, country]) => ({ name, country }));

        // Ordered speaking queue
        this.speakerQueue = [];
        this.currentSpeaker = null;

        this.timer = new Timer(DEFAULT_SPEAKER_TIME, {
            onTick: () => this.renderTimer(),
            onFinish: () => {
                console.log("Speaker time finished");
                this.nextSpeaker();
            }
        });
    }

    async render() {
        this.bindEvents();
        this.renderTimer();
        this.renderSelectedCountryList();
        this.renderSpeakerQueue();
    }

    bindEvents() {
        const startButton = document.getElementById("startSpeaker");
        startButton?.addEventListener("click", () => {
            if (this.timer.active) {
                this.timer.stop();
            } else {
                this.timer.start();
            }
        });

        const restartButton = document.getElementById("restartSpeaker");
        restartButton?.addEventListener("click", () => {
            this.timer.restart();
        });

        document.getElementById("gslSettings")
        .addEventListener("click", () => this.openSettings());

        document.getElementById("cancelGslSettings")
        .addEventListener("click", () => {
            document.getElementById("gslSettingsDialog").close();
        });

        document.getElementById("gslSettingsForm")
        .addEventListener("submit", (event) => {
            event.preventDefault();
            this.saveSettings();
        });

        const searchInput = document.getElementById("availableCountrySearch");
        searchInput?.addEventListener("input", () => {
            this.renderSelectedCountryList();
        });

        const nextButton = document.getElementById("nextSpeaker");
        nextButton?.addEventListener("click", () => {
            this.nextSpeaker();
        });


        document.getElementById("motionsView")?.addEventListener("click", () => {
            this.session.showStage("motions");
        });
    }

    openSettings() {
        const dialog = document.getElementById("gslSettingsDialog");
        const minutesInput = document.getElementById("speakerTimeMinutes");
        const secondsInput = document.getElementById("speakerTimeSeconds");

        minutesInput.value = Math.floor(this.speakerTime / 60);
        secondsInput.value = this.speakerTime % 60;

        dialog.showModal();
    }

    saveSettings() {
        const minutesInput = document.getElementById("speakerTimeMinutes");
        const secondsInput = document.getElementById("speakerTimeSeconds");

        const minutes = Number(minutesInput.value || 1);
        const seconds = Number(secondsInput.value || 30);

        if (minutes < 0 || seconds < 0 || seconds > 59) {
          alert("Please enter a valid speaking time.");
          return;
        }

        const totalSeconds = minutes * 60 + seconds;

        if (totalSeconds <= 0) {
            alert("Speaker time must be greater than zero.");
            return;
        }

        this.speakerTime = totalSeconds;

        this.timer.stop();
        this.timer.capacity = totalSeconds;
        this.timer.restart();

        document.getElementById("gslSettingsDialog").close();

        this.renderTimer();
    }

    renderTimer() {
        const element = document.getElementById("speakerTimeRemaining");
        if (element) this.timer.render(element);
    }

    addSpeaker(name) {
        const speaker = this.availableSpeakers.find(
            item => item.name === name
        );

        if (!speaker) return;
        if (this.speakerQueue.some(item => item.name === name)) return;
        if (this.currentSpeaker?.name === name) return;

        this.speakerQueue.push(speaker);
        this.renderSelectedCountryList();
        this.renderSpeakerQueue();
    }

    removeSpeaker(name) {
        this.speakerQueue = this.speakerQueue.filter(
            speaker => speaker.name !== name
        );

        this.renderSelectedCountryList();
        this.renderSpeakerQueue();
    }

    moveSpeaker(name, newIndex) {
        const oldIndex = this.speakerQueue.findIndex(
            speaker => speaker.name === name
        );

        if (oldIndex === -1) return;

        const [speaker] = this.speakerQueue.splice(oldIndex, 1);
        const index = Math.max(
            0,
            Math.min(newIndex, this.speakerQueue.length)
        );

        this.speakerQueue.splice(index, 0, speaker);
        this.renderSpeakerQueue();
    }

    nextSpeaker() {
        this.timer.stop();
        this.currentSpeaker = this.speakerQueue.shift() ?? null;

        this.timer.restart();

        const currentElement = document.getElementById("currentSpeaker");

        if (currentElement) {
            currentElement.textContent = this.currentSpeaker
                ? this.currentSpeaker.name
                : "No speakers in queue";
        }

        this.renderSelectedCountryList();
        this.renderSpeakerQueue();
    }

    renderSelectedCountryList() {
        const listbox = document.getElementById("selectedCountryList");
        const searchInput = document.getElementById("availableCountrySearch");

        if (!listbox) return;

        listbox.replaceChildren();

        const searchValue = searchInput?.value.trim().toLowerCase() ?? "";

        for (const speaker of this.availableSpeakers) {
            if (speaker.name.toLowerCase().includes(searchValue) === false) {
                continue;
            }

            if (this.speakerQueue.some(item => item.name === speaker.name)) {
                continue;
            }

            if (this.currentSpeaker?.name === speaker.name) {
                continue;
            }

            const item = createCountryListItem(
                speaker.name,
                speaker.country,
                {
                    showVoting: false,
                    onClick: () => this.addSpeaker(speaker.name)
                }
            );

            listbox.appendChild(item);
        }
    }

    renderSpeakerQueue() {
        const queueElement = document.getElementById("upcomingSpeakers");
        if (!queueElement) return;

        queueElement.replaceChildren();

        this.speakerQueue.forEach((speaker, index) => {
            const row = document.createElement("div");
            row.className = "list-item";

            const name = document.createElement("span");
            name.textContent = `${index + 1}. ${speaker.name}`;
            name.style.flex = "1";

            const upButton = document.createElement("button");
            upButton.textContent = "↑";
            upButton.disabled = index === 0;
            upButton.addEventListener("click", () => {
                this.moveSpeaker(speaker.name, index - 1);
            });

            const downButton = document.createElement("button");
            downButton.textContent = "↓";
            downButton.disabled = index === this.speakerQueue.length - 1;
            downButton.addEventListener("click", () => {
                this.moveSpeaker(speaker.name, index + 1);
            });

            const removeButton = document.createElement("button");
            removeButton.textContent = "×";
            removeButton.addEventListener("click", () => {
                this.removeSpeaker(speaker.name);
            });

            row.append(name, upButton, downButton, removeButton);
            queueElement.appendChild(row);
        });
    }
}
import { renderActiveSpeaker, renderAvailableQueue, renderSpeakerQueue } from "./speaker-list.js";

export function setupSpeakerControls(session) {
    const middleColumn = document.getElementById("middle-column");
    middleColumn.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;

        switch (button.id) {
            case "start-timer":
                startSpeaker(session);
                break;
            case "stop-timer":
                stopSpeaker(session);
                break;
            case "next-speaker":
                nextSpeaker(session);
                break;
            case "yield-speaker":
                yieldSpeaker(session);
                break;
        }
    });

    function startSpeaker(session) {
        console.log("start");
    }

    function stopSpeaker(session) {
        console.log("stop");
    }

    function nextSpeaker(session) {
        const countryKey = session.speakerQueue.shift();
        console.log(countryKey);
        if (!countryKey) {
            renderActiveSpeaker(null);
            session.currentSpeaker = null;
            renderAvailableQueue(session);
            return;
        }

        session.currentSpeaker = countryKey;
        renderActiveSpeaker(session, countryKey);
        renderSpeakerQueue(session);
        renderAvailableQueue(session);
    }

    function yieldSpeaker(session) {
        console.log("yield");
    }
}

export function setupSpeakerQueueControls(session) {
    if (session.view === 'roll-call') return;

    const queueList = document.getElementById("queue-list");
    if (!queueList) return;

    queueList.addEventListener("click", (e) => {
        const button = e.target.closest("button[data-action]");
        if (!button) return;

        const option = button.closest(".listbox-option");
        if (!option || !queueList.contains(option)) return;

        const countryKey = option.dataset.countryKey;
        const index = session.speakerQueue.indexOf(countryKey);

        if (index === -1) return;

        switch (button.dataset.action) {
            case "top":
                moveCountry(session, index, 0);
                break;

            case "up":
                moveCountry(session, index, index - 1);
                break;

            case "down":
                moveCountry(session, index, index + 1);
                break;

            case "bottom":
                moveCountry(session, index, session.speakerQueue.length - 1);
                break;

            case "remove":
                session.dequeueCountry(countryKey);
                renderAvailableQueue(session);
                break;

            default:
                return;
        }

        renderSpeakerQueue(session);
    });
}
function moveCountry(session, fromIndex, toIndex) {
    const queue = session.speakerQueue;
    if (toIndex < 0 || toIndex >= queue.length || fromIndex === toIndex) {
        return;
    }

    const [countryKey] = queue.splice(fromIndex, 1);
    queue.splice(toIndex, 0, countryKey);
}

export function setupAvailableQueueControls(session) {
    const availableList = document.getElementById("available-list");
    if (!availableList) return;

    availableList.addEventListener('click', (e) => {
        if (session.view === 'roll-call') return;

        const option = e.target.closest(".listbox-option");
        if (!option || !availableList.contains(option)) return;

        const optionName = option.querySelector(".speaker-name").textContent;
        option.remove();

        session.enqueueCountry(optionName);
        renderSpeakerQueue(session);
        renderAvailableQueue(session);
    })
}
import { createCountryDisplayElement } from "../components/available-queue-item.js";
import { _createMotionElement } from "../components/motion.js";
import { DebateMotion, MOTION_PRIORITY } from "../models/motion.js";

var CURRENT_SUBMITTER = null;

function toggleDurationElements(value) {
    const durationMinutes = document.getElementById("motion-total-duration-minutes");
    const durationSeconds = document.getElementById("motion-total-duration-seconds");
    const speakerMinutes = document.getElementById("motion-speaker-duration-minutes");
    const speakerSeconds = document.getElementById("motion-speaker-duration-seconds");

    switch (value) {
        case "Moderated Caucus":
            durationMinutes.style.filter = 'brightness(1)';
            durationSeconds.style.filter = 'brightness(1)';
            speakerMinutes.style.filter = 'brightness(1)';
            speakerSeconds.style.filter = 'brightness(1)';
            break;
        case "Unmoderated Caucus":
            speakerMinutes.style.filter = 'brightness(0.6)';
            speakerSeconds.style.filter = 'brightness(0.6)';
            break;
        case "Close Debate":
            durationMinutes.style.filter = 'brightness(0.6)';
            durationSeconds.style.filter = 'brightness(0.6)';
            speakerMinutes.style.filter = 'brightness(0.6)';
            speakerSeconds.style.filter = 'brightness(0.6)';
        default:
            console.error(`unhandled motion type ${value}`);
    }
}

function buildMotion() {
    if (!CURRENT_SUBMITTER) throw new Error("no submitter for motion");

    const motionTypeSelect = document.getElementById("motion-type");
    const motionType = motionTypeSelect.selectedOptions[0].textContent.trim();
    const motionTopic = document.getElementById("motion-name").value ?? "Discussion";
        
    var durationMinutes = document.getElementById("motion-total-duration-minutes").value.trim()
    if (!durationMinutes) durationMinutes = 10;
    var durationSeconds = document.getElementById("motion-total-duration-seconds").value.trim() ?? 0;
    if (!durationSeconds) durationSeconds = 0;
    const totalDuration = (durationMinutes * 60) + durationSeconds;

    var speakerMinutes = document.getElementById("motion-speaker-duration-minutes").value.trim() ?? 1;
    if (!speakerMinutes) speakerMinutes = 1;
    var speakerSeconds = document.getElementById("motion-speaker-duration-seconds").value.trim() ?? 0;
    if (!speakerSeconds) speakerSeconds = 0;
    const speakerDuration = (speakerMinutes * 60) + speakerSeconds;
    
    const motion = new DebateMotion(
        CURRENT_SUBMITTER, 
        motionType, 
        motionTopic, 
        totalDuration, 
        speakerDuration
    );
        
    return motion;
}

export function setupMotionControls(session) {
    const searchInput = document.getElementById("motion-country-search");
    searchInput?.addEventListener('input', () => {
        renderMotionAvailableSubmitters(session);
    })

    const submitter = document.getElementById("submission-field");
    submitter?.addEventListener('click', (e) => {
        const option = e.target.closest("#motion-submitter");
        if (!option|| !submitter.contains(option)) return;

        option.remove();
        document.getElementById("template-motion-submitter").hidden = false;
        
        CURRENT_SUBMITTER = null;
        renderMotionAvailableSubmitters(session);
    });

    const motionTypeSelect = document.getElementById("motion-type");
    for (const element of Object.keys(MOTION_PRIORITY)) {
        const item = document.createElement('option');
        item.textContent = element;
        item.style.fontFamily = 'monospace';
        motionTypeSelect.append(item);   
    }
    motionTypeSelect?.addEventListener('change', (e) => {
        const value = motionTypeSelect.selectedOptions[0].textContent.trim();
        toggleDurationElements(value);
    });

    const submitButton = document.getElementById("submit-motion");
    submitButton?.addEventListener('click', (e) => {
        try {
            const motion = buildMotion();
            session.motions.push(motion);
            
            const submitter = document.getElementById("motion-submitter");
            submitter?.remove()
            
            document.getElementById("template-motion-submitter").hidden = false;

            renderMotionAvailableSubmitters(session);
            renderMotionTray(session);
        } catch (error) {
            console.error(error);
        }
    });

    const disruptive = document.getElementById("most-disruptive-container");
    disruptive?.addEventListener('click', (e) => {});

    const tray = document.getElementById("motions-tray");
    tray?.addEventListener('click', (e) => {
        const option = e.target.closest('.motion-option');
        const button = e.target.closest('button[data-action]');
        if (!button || !tray.contains(button)) return;

        console.log(option);
        console.log(button);

        renderMotionTray(session.motions);
    });

    const history = document.getElementById("motions-history");
    history?.addEventListener('click', (e) => {});

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

function sortTray(motions) {
    return [...motions].sort((a, b) => {
        // motion priority
        const priorityA = a.priority;
        const priorityB = b.priority;
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        
        // duration
        const durationA = a.duration;
        const durationB = b.duration;
        if (durationA !== durationB) {
            return durationA - durationB;
        } 
        // individual_duration 
        const speakerA = a.individualDuration;
        const speakerB = b.individualDuration;
        if (speakerA !== speakerB) {
            return speakerA - speakerB;
        } 

        // submission sequence
        return a.sequence - b.sequence;
    });
}
export function renderMotionTray(session) {
    const tray = document.getElementById("motions-tray");
    tray.replaceChildren();
    
    const container = document.getElementById("most-disruptive-container");
    const existing = document.getElementById("most-disruptive");
    if (existing) existing.remove();
    
    const motions = sortTray(structuredClone(session.motions));
    motions.reverse();

    const priority = motions.shift();
    if (priority) {
        document.getElementById("template-motion-disruptive").hidden = true;

        const data = session.selectedCountries[priority.submitter] ?? {};
        const disruptive = _createMotionElement(priority, data);
        disruptive.id="most-disruptive";
        container.append(disruptive);
    } else {
        document.getElementById("template-motion-disruptive").hidden = false;
        return;
    }

    for (const motion of motions) {
        const data = session.selectedCountries[motion.submitter] ?? {};
        const item = _createMotionElement(motion, data);
        item.id = "active-motion";
        tray.append(item);
    };
}

export function renderMotionHistory(session) {
    const history = document.getElementById("motions-history");
    history.replaceChildren();

    for (const motion of session.motionHistory.sort(s => s.sequence)) {
        const data = session.selectedCountries[motion.submitter] ?? null;

        const item = _createMotionElement(motion, data);
        item.id = "past-motion";
        history.append(item);
    }
}

export function renderMotionAvailableSubmitters(session) {
    const listbox = document.getElementById("motion-available-list");
    if (!listbox) return;

    const searchInput = document.getElementById("motion-country-search");
    const searchValue = searchInput.value.toLowerCase();

    listbox.replaceChildren();
    const keys = Object.keys(session.selectedCountries).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    console.log("keys")
    for (const countryKey of keys) {
        const data = session.selectedCountries[countryKey];
        if (countryKey === CURRENT_SUBMITTER) continue;
        if (searchValue && !countryKey.toLowerCase().startsWith(searchValue)) continue;
        if (data.votingStatus === "A") continue;
        if (session.motions.some(s => s.submitter === countryKey)) continue;

        const item = createCountryDisplayElement(data, false);
        listbox.append(item);
    }
}
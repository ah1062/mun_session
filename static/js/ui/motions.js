import { createCountryDisplayElement } from "../components/available-queue-item.js";
import { _createMotionElement, createMotionElement } from "../components/motion.js";

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

function sortTray(motions) {
    return [...motions].sort((a, b) => {
        // motion priority
        const priorityA = a.priority;
        const priorityB = b.priority;
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        
        // duration / individual_duration 
        const ratioA = a.duration / a.individual_duration;
        const ratioB = b.duration / b.individual_duration;
        if (ratioA !== ratioB) {
            return ratioA - ratioB;
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
    
    const motions = sortTray = structuredClone(session.motions);
    const priority = motions.pop();
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
    const countries = Object.entries(session.selectedCountries);
    for (const [countryKey, data] of countries.sort()) {
        if (countryKey === CURRENT_SUBMITTER) continue;
        if (searchValue && !countryKey.toLowerCase().startsWith(searchValue)) continue;
        if (data.votingStatus === "A") continue;
        if (session.motions.some(s => s.submitter === countryKey)) continue;

        const item = createCountryDisplayElement(data, false);
        listbox.append(item);
    }
}
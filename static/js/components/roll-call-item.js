import { createCountryDisplayElement } from "./available-queue-item.js";

const actions = [
    { symbol: 'P5', status: 'p5status', group: 'independent' },
    { symbol: 'OBV', status: 'observerStatus', group: 'independent' },
    { symbol: 'A', status: 'A', group: 'attendance' },
    { symbol: 'P', status: 'P', group: 'attendance' },
    { symbol: 'P+V', status: 'PV', group: 'attendance' },
];

export function createRollCallElement(data, countryKey) {
    const item = createCountryDisplayElement(data, false);
    item.dataset.countryKey = countryKey;

    const controls = document.createElement('div');
    controls.className = 'attendance-controls';

    for (const action of actions) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `attendance-toggle status-${action.status}`;
        button.textContent = action.symbol;

        button.dataset.status = action.status;
        button.dataset.group = action.group;
        const isActive = action.group === 'independent'
            ? data[action.status]
            : data.votingStatus === action.status;

        button.classList.toggle('active', Boolean(isActive));
        button.setAttribute('aria-pressed', String(Boolean(isActive)));

        controls.append(button);
    }

    item.append(controls);
    return item;
}
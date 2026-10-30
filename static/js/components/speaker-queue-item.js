import { createCountryDisplayElement } from "./available-queue-item.js";

const actions = [
    { action: 'top', text: '⮤', label: 'Move to top' },
    { action: 'up', text: '⮝', label: 'Move up' },
    { action: 'down', text: '⮟', label: 'Move down' },
    { action: 'bottom', text: '⮧', label: 'Move to bottom' },
    { action: 'remove', text: '⤬', label: 'Remove from list' }
];

export function createSpeakerQueueElement(data) {
    const item = createCountryDisplayElement(data);

    const controls = document.createElement('div');
    controls.className = 'queue-controls';
    actions.forEach(({ action, text, label }) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.dataset.action = action;
        button.setAttribute('aria-label', label);
        button.title = label;
        button.textContent = text;

        controls.appendChild(button);
    });

    item.appendChild(controls);

    return item;
}


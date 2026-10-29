import { createSession, saveSession, loadSession } from './models/session.js';

const url = new URL(window.location.href);
const cookies = new Map(
  document.cookie
    .split('; ')
    .filter(Boolean)
    .map((cookie) => {
      const [name, ...value] = cookie.split('=');
      return [name, decodeURIComponent(value.join('='))];
    }),
);

const params = url.searchParams;
const sessionId = params.get('sessionId') ?? -1;

var mode = params.get('mode') ?? 'new';
if (cookies.get('lastSession') === sessionId) {
  url.searchParams.set('mode', 'load');
  window.history.pushState({}, '', url);
  mode = 'load';
}

var session = await createSession(sessionId);
if (!session) console.error(`Unable to create session`);

switch (mode) {
  case 'new':
    await saveSession(session);
    document.cookie = `lastSession=${sessionId}`;
    break;
  case 'load':
    session = await loadSession(sessionId);
    break;
}

const numEntries = 50;
const randomEntries = Object.entries(session.availableCountries)
    .sort(() => Math.random() - 0.5)
    .slice(0, numEntries);
const randomElements = Object.fromEntries(randomEntries);
session.selectedCountries = randomElements;

for (const [countryKey, data] of Object.entries(session.selectedCountries)) {
    data.votingStatus = "A";
    if (Math.random() < 0.3) {
        data.votingStatus = "P";
    } else if (Math.random() < 0.6) {
        data.votingStatus = "PV";
    }

    if (Math.random() < 0.2) {
        data.observerStatus = true;
    }
    if (Math.random() < 0.2) {
        data.p5status = true;
    }
}

const firstSpeaker = Object.keys(session.selectedCountries)[0];
session.currentSpeaker = firstSpeaker;

const root = document.documentElement;
const $ = id => document.getElementById(id);

$('theme-toggle').addEventListener('click', () => {
    const themeToggle = $('theme-toggle');
    const isLight = root.dataset.theme !== 'light';

    $("header-logo").src = isLight ? 'assets/logo_dark.png' : 'assets/logo.png';
    root.dataset.theme = isLight ? 'light' : 'dark';

    themeToggle.textContent = isLight ? 'Dark mode' : 'Light mode';
    themeToggle.setAttribute(
        'aria-label',
        isLight ? 'Switch to dark mode' : 'Switch to light mode'
    );
});

function createCountryDisplayElement(data) {
    const item = document.createElement('div');    
    item.className = 'listbox-option';
    item.role = 'option';
    item.tabIndex = 0;

    const img = document.createElement('img');
    img.className = 'icon';
    img.src = data.imgUrl;
    img.style.height = '24px';
    img.style.width = '32px';
    img.style.border = '1px solid var(--indigo)'
    img.style.borderRadius = '8px';
    img.style.outline = '1px solid var(--muted)';
    img.style.outlineOffset = '1px';
    item.appendChild(img);

    const name = document.createElement('span');
    name.className = 'speaker-name';
    name.textContent = data.shortName;
    item.appendChild(name);

    if (data.p5status) {
        const status = document.createElement('span');
        status.textContent = '●';
        status.style.color = "var(--p5-status)";
        status.style.marginRight = "2px";

        item.appendChild(status);
    }
    if (data.observerStatus) {
        const status = document.createElement('span');
        status.textContent = '●';
        status.style.color = "var(--observer-status)";
        status.style.marginRight = "2px";

        item.appendChild(status);
    }

    const status = document.createElement('span');
    status.textContent = '●';
    status.style.marginRight = "2px";
    if (data.votingStatus === 'A') {
        status.style.color = 'var(--voting-absent)';
    } else if (data.votingStatus === 'P') {
        status.style.color = 'var(--voting-present)';
    } else if (data.votingStatus === 'PV') {
        status.style.color = 'var(--voting-present-and-voting)';
    }
    item.appendChild(status);

    return item;
}
function createSpeakerQueueElement(data) {
    const actions = [
        { action: 'top', text: '⮤', label: 'Move to top' },
        { action: 'up', text: '⮝', label: 'Move up' },
        { action: 'down', text: '⮟', label: 'Move down' },
        { action: 'bottom', text: '⮧', label: 'Move to bottom' },
        { action: 'remove', text: '⤬', label: 'Remove from list' }
    ];

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

function renderPresence() {
    const count = Object.values(session.selectedCountries)
        .filter(data => data.votingStatus !== "A")
        .length;
    if (count === 0) return;

    $('simple-majority-value').textContent = Math.ceil(count * 0.5) + 1;
    $('super-majority-value').textContent = Math.ceil(count * 0.66) + 1;
    $('unanimity-value').textContent = count;
}

function renderAvailableCountries() {
    $('available-list').replaceChildren();
    
    var displayCount = 0;
    const searchValue = $('country-search').value.toLowerCase();
    for (const [countryKey, data] of Object.entries(session.selectedCountries).sort()) {
        if (data.votingStatus === "A") continue;
        if (searchValue && !(countryKey.toLowerCase().startsWith(searchValue))) continue;
        if (countryKey === session.currentSpeaker) continue;
        if (session.speakerQueue.includes(countryKey)) continue;

        const item = createCountryDisplayElement(data);
        $('available-list').appendChild(item);
        displayCount++;
    }

    $("available-speakers-label").textContent = 
        `${displayCount} Available Speakers`;
}

function renderSpeakerQueue() {
    $("upcoming-speakers-label").textContent = `${session.speakerQueue.length} Upcoming Speakers`;
    $('queue-list').replaceChildren();
    
    for (const countryKey of session.speakerQueue) {
        const data = session.selectedCountries[countryKey];
        if (!data) continue;
        
        const element = createSpeakerQueueElement(data);
        $('queue-list').appendChild(element);
    }
}
function renderActiveSpeaker(countryKey) {
    if (!countryKey) {
        $('timerMain').style.visibility = 'hidden';
        return;
    }

    if (!(Object.keys(session.selectedCountries).includes(countryKey))) {
        $('timerMain').style.visibility = 'hidden';
        return;
    }
    
    $('timerMain').style.visibility = 'visible';
    const country = session.selectedCountries[countryKey];
    $('speaker-flag').src = country.imgUrl;
    $('speaker-name').textContent = country.shortName;
}

$('queue-list').addEventListener('click', (event) => {
    const queueList = $('queue-list');

    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const option = event.target.closest('.listbox-option');
    if (!option || !queueList.contains(option)) return;

    const optionName = option.querySelector('.speaker-name').textContent;

    const items = [...queueList.querySelectorAll('.listbox-option')];
    const index = items.indexOf(option);
    const action = button.dataset.action;

    switch (action) {
        case 'top':
            queueList.prepend(option);
            break;
        case 'up':
            if (index > 0) {
                queueList.insertBefore(option, items[index - 1]);
            }
            break;
        case 'down':
            if (index < items.length - 1) {
                queueList.insertBefore(items[index + 1], option);
            }
            break;
        case 'bottom':
            queueList.appendChild(option);
            break;
        case 'remove':
            option.remove();

            session.dequeueCountry(optionName);
            renderSpeakerQueue();
            renderAvailableCountries();
            break;
    }
});

$('country-search').addEventListener('input', renderAvailableCountries);
$('available-list').addEventListener('click', (e) => {
    const availableList = $('available-list');

    const option = e.target.closest('.listbox-option');
    if (!option || !availableList.contains(option)) return;

    const optionName = option.querySelector('.speaker-name').textContent;
    option.remove();

    session.enqueueCountry(optionName);
    renderSpeakerQueue();
    renderAvailableCountries();
});

$('next-speaker').addEventListener('click', () => {
    if (session.speakerQueue.length === 0) {
        renderActiveSpeaker(null);
        session.currentSpeaker = null;
        renderAvailableCountries();
        return;
    }

    const countryKey = session.speakerQueue.shift();
    session.currentSpeaker = countryKey;
    renderActiveSpeaker(countryKey);
    renderSpeakerQueue();
    renderAvailableCountries();
});

renderPresence();
renderActiveSpeaker(session.currentSpeaker);
renderSpeakerQueue();
renderAvailableCountries();
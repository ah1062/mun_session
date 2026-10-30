import { createSession, saveSession, loadSession } from './models/session.js';
import { setupNavigation, showView } from './ui/navigation.js';
import { renderRollCallList, setupRollCallControls } from './ui/roll-call.js';
import { setupAvailableQueueControls, setupSpeakerControls, setupSpeakerQueueControls } from './ui/speaker-controls.js';
import { renderActiveSpeaker, renderAvailableQueue, renderCountryPresence, renderSpeakerQueue } from './ui/speaker-list.js';
import { setupTheme } from './ui/theme.js';

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
const sessionId = params.get('sessionId') ?? crypto.randomUUID().substring(0, 8);

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
}

// const firstSpeaker = Object.keys(session.selectedCountries)[0];
// session.currentSpeaker = firstSpeaker;

const root = document.documentElement;
const $ = id => document.getElementById(id);
$("session-existence").textContent += sessionId;

function onViewChange(viewName) {
    session.view = viewName;

    switch (viewName) {
        case "gsl":
            $("right-column").style.filter = 'brightness(1)';

            renderActiveSpeaker(session, session.currentSpeaker);
            
            renderCountryPresence(session);
            renderSpeakerQueue(session);
            renderAvailableQueue(session);
            break;
        case "roll-call":
            $("right-column").style.filter = 'brightness(0.8)';

            renderRollCallList(session);
            break;
    }
}

async function main() {
    setupTheme(session);
    setupNavigation(onViewChange);

    setupRollCallControls(session);
    setupSpeakerControls(session);
    setupAvailableQueueControls(session);
    setupSpeakerQueueControls(session);

    renderCountryPresence(session);
    renderRollCallList(session);
    renderAvailableQueue(session);
    renderSpeakerQueue(session);
}

main().catch(console.error);
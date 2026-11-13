import { createSession, saveSession, loadSession } from './models/session.js';
import { DebateMotion, Motion, ProceduralMotion } from "./models/motion.js";

import { renderMotionAvailableSubmitters, renderMotionHistory, renderMotionTray, setupMotionControls } from './ui/motions.js';
import { setupNavigation} from './ui/navigation.js';
import { renderRollCallList, setupRollCallControls } from './ui/roll-call.js';
import { renderCommitteeSelection, renderCountrySelection, setupCountrySelectionControls, setupSessionMemoryControls, setupSessionSettingsControls } from './ui/settings.js';
import { setupAvailableQueueControls, setupSpeakerControls, setupSpeakerQueueControls } from './ui/speaker-controls.js';
import { renderActiveSpeaker, renderAvailableQueue, renderCountryPresence, renderSpeakerQueue } from './ui/speaker-list.js';
import { setupLanguages, setupTheme } from './ui/theme.js';

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
const randomEntries = Object.entries(session.countryDataset)
    .sort(() => Math.random() - 0.5)
    .slice(0, numEntries);
const randomElements = Object.fromEntries(randomEntries);
for (const [countryKey, _] of Object.entries(randomElements)) {
    session.selectCountry(countryKey);
}

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

const names = Object.keys(session.selectedCountries);
session.motions.push(
    new DebateMotion(names[0], "Moderated Caucus", "Topic A", 900, 50),
    new DebateMotion(names[1], "Moderated Caucus", "Topic B", 300, 150),
    new DebateMotion(names[2], "Moderated Caucus", "Topic C", 500, 50),
);
session.motionHistory.push(
    new DebateMotion(names[3], "Moderated Caucus", "Topic D", 900, 50),
    new DebateMotion(names[4], "Moderated Caucus", "Topic E", 300, 150),
    new DebateMotion(names[5], "Moderated Caucus", "Topic F", 500, 50),
);
for (const motion of session.motionHistory) {
    motion.history = !motion.history;

    if (Math.random() < 0.5) {
        motion.status = false;
    }
}

const root = document.documentElement;
const $ = id => document.getElementById(id);
$("session-existence").textContent += sessionId;

function onViewChange(viewName) {
    session.view = viewName;

    for (const item of document.querySelectorAll('#topleft-heading')) 
        item.textContent = session.committeeTitle;
    for (const item of document.querySelectorAll('#bottomleft-heading')) 
        item.textContent = session.committeeCode;
    for (const item of document.querySelectorAll('#topright-heading'))
        item.textContent = session.name;
    for (const item of document.querySelectorAll('#bottomright-heading'))
        item.textContent = session.topic;

    if (viewName === "settings") {
        document.getElementById("session-settings").hidden = false;
        document.getElementById("session-attendance").hidden = true;           
        document.getElementById("motion-availability").hidden = true;           
    } else if (viewName === "motions") {
        document.getElementById("session-settings").hidden = true;
        document.getElementById("session-attendance").hidden = true;           
        document.getElementById("motion-availability").hidden = false;           
    } else {
        document.getElementById("session-settings").hidden = true;
        document.getElementById("motion-availability").hidden = true;
        document.getElementById("session-attendance").hidden = false;           
    }

    for (const [name, timer] of Object.entries(session.timers)) {
        timer.pause();
    }
    switch (viewName) {
        case "gsl":
            $("session-attendance").style.filter = 'brightness(1)';
            renderActiveSpeaker(session, session.currentSpeaker);
            renderCountryPresence(session);
            renderSpeakerQueue(session);
            renderAvailableQueue(session);
            break;
        case "single-speaker":
            $("session-attendance").style.filter = 'brightness(0.8)';
            break;
        case "roll-call":
            $("session-attendance").style.filter = 'brightness(0.8)';

            //setupRollCallControls(session);
            renderRollCallList(session);
            break;
        case "motions":
            renderMotionAvailableSubmitters(session);
            break;
        case "caucus": 
            $("session-attendance").style.filter = 'brightness(1)';
            renderActiveSpeaker(session, session.currentSpeaker);
            renderCountryPresence(session);
            renderSpeakerQueue(session);
            renderAvailableQueue(session);
            break;
        case "unmod-caucus":
            $("session-attendance").style.filter = 'brightness(0.8)';
            break;
        case "settings":
            renderCountrySelection(session);
            break;
        case _:
            console.error(`Unhandled viewName: ${viewName}`);
    }
}

async function main() {
    await setupLanguages(session);
    setupTheme(session);
    setupNavigation(session, onViewChange);
    
    setupRollCallControls(session);
    setupSpeakerControls(session);
    setupAvailableQueueControls(session);
    setupSpeakerQueueControls(session);

    await renderCommitteeSelection(session);
    await setupSessionSettingsControls(session);
    setupCountrySelectionControls(session);
    setupSessionMemoryControls(session);
    renderCountrySelection(session);

    renderRollCallList(session);

    setupMotionControls(session);
    
    renderMotionAvailableSubmitters(session);
    renderMotionTray(session);
    renderMotionHistory(session);

    renderCountryPresence(session);
    renderAvailableQueue(session);
    renderSpeakerQueue(session);
}

main().catch(console.error);
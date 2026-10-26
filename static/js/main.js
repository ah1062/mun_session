import { createSession, saveSession, loadSession } from "./models/session.js";

const url = new URL(window.location.href);
const cookies = new Map(
  document.cookie
    .split("; ")
    .filter(Boolean)
    .map((cookie) => {
      const [name, ...value] = cookie.split("=");
      return [name, decodeURIComponent(value.join("="))];
    }),
);

const params = url.searchParams;
const sessionId = params.get("sessionId");
if (!sessionId) {
  console.error(`No session ID provided to create / load`);
  window.location.href = "index.html";
}

var mode = params.get("mode");
if (!mode) {
  console.error(`No session ID provided to create / load`);
} else if (cookies.get("lastSession") === sessionId) {
  url.searchParams.set("mode", "load");
  window.history.pushState({}, "", url);
  mode = "load";
}

var session = await createSession(sessionId);
if (!session) console.error(`Unable to create session`);

switch (mode) {
  case "new":
    await saveSession(session);
    document.cookie = `lastSession=${sessionId}`;
    session.showStage("config");
    break;
  case "load":
    session = await loadSession(session);
    session.showStage("motions")    
    break;
}
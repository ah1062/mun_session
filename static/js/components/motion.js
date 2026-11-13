import { formatTime } from "../models/timer.js";

function _createMotionTopElement(motion, data) {
    const item = document.createElement("div");
    item.className = "motion-information-element";

    const type = document.createElement("span");
    type.textContent = motion.type;
    item.append(type);

    return item;
}

function _createMotionMiddleElement(motion, data) {
    const item = document.createElement("div");
    item.className = "motion-information-element motion-description";

    const flag = document.createElement("div");
    flag.className = "motion-flag";

    const img = document.createElement("img");
    img.src = data.imgUrl ?? "assets/logo.png";
    img.alt = "";
    flag.append(img);

    const name = document.createElement("p");
    name.className = "speaker-name";
    name.textContent = motion.topic ?? "";

    item.append(flag, name);
    return item;
}

function _createMotionBottomElement(motion, data) {
    const item = document.createElement("div");
    item.className = "motion-information-element motion-bottom";

    const time = document.createElement("span");
    time.textContent = 
        `${formatTime(motion.duration) ?? ""} / 
        ${formatTime(motion.individual_duration) ?? ""}`;

    const actions = document.createElement("div");
    actions.className = "motion-actions";

    if (motion.status === null) {
        const approve = document.createElement("button");
        approve.type = "button";
        approve.className = "motion-approve";
        approve.textContent = motion.history === true ? "Re-Submit": "Approve";
        actions.append(approve);
    }

    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "motion-reject";
    reject.textContent = motion.history === true ? "Clear": "Reject";
    actions.append(reject);

    item.append(time, actions);

    return item;
}

export function _createMotionElement(motion, data) {
    const item = document.createElement("div");
    item.className = "motion-option";
    item.dataset.sequence = motion.sequence;
    item.dataset.type = motion.type;
    item.dataset.countryKey = motion.submitter;
    item.setAttribute("role", "option")
    item.tabIndex = 0;

    const info = document.createElement("div");
    info.className = "motion-information";

    const top = _createMotionTopElement(motion, data);
    const middle = _createMotionMiddleElement(motion, data);
    const bottom = _createMotionBottomElement(motion, data);

    info.append(top, middle, bottom);
    item.append(info);

    return item;
}

export function createMotionElement(data) {
    const CURRENT = false;

    const item = document.createElement("div");
    item.id = "most-disruptive";
    item.dataset.countryKey = data.shortName;
    item.className = "motion-option";
    item.setAttribute("role", "option");
    item.tabIndex = 0;

    const info = document.createElement("div");
    info.className = "motion-information";

    const top = document.createElement("div");
    top.className = "motion-information-element";

    const type = document.createElement("span");
    type.textContent = "Moderated Caucus";
    top.append(type);

    const middle = document.createElement("div");
    middle.className = "motion-information-element motion-description";

    const flag = document.createElement("div");
    flag.className = "motion-flag";

    const img = document.createElement("img");
    img.src = data.imgUrl ?? "assets/logo.png";
    img.alt = "";
    flag.append(img);

    const name = document.createElement("p");
    name.className = "speaker-name";
    name.textContent = "Discuss the merits and demerits of the repatriation";

    middle.append(flag, name);

    const bottom = document.createElement("div");
    bottom.className = "motion-information-element motion-bottom";

    const time = document.createElement("span");
    time.textContent = "10:00 / 01:00";

    const actions = document.createElement("div");
    actions.className = "motion-actions";

    const approve = document.createElement("button");
    approve.type = "button";
    approve.className = "motion-approve";
    approve.textContent = CURRENT ? "Approve" : "Re-Submit";

    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "motion-reject";
    reject.textContent = CURRENT ? "Reject": "Clear";

    actions.append(approve, reject);
    bottom.append(time, actions);

    info.append(top, middle, bottom);
    item.append(info);

    return item;
}
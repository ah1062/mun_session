export function createCountryDisplayElement(data, status=true) {
    const item = document.createElement("div");
    item.className = "listbox-option";
    item.setAttribute("role", "option");
    item.tabIndex = 0;

    const img = document.createElement("img");
    img.className = "icon";
    img.src = data.imgUrl ?? 'assets/logo.png';
    img.alt = "";
    img.style.height = "24px";
    img.style.width = "32px";
    img.style.border = "1px solid var(--indigo)";
    img.style.borderRadius = "8px";
    item.append(img);

    const name = document.createElement("span");
    name.className = "speaker-name";
    name.textContent = data.shortName;
    item.append(name);

    if (!status) return item;

    if (data.p5status) {
        const icon = createStatusIndicator('var(--p5-status)');
        item.append(icon);
    }
    if (data.observerStatus) {
        const icon = createStatusIndicator('var(--observer-status)');
        item.append(icon);
    }

    const votingColors = {
        "A": "var(--voting-absent)",
        "P": "var(--voting-present)",
        "PV": "var(--voting-present-and-voting)",
    }
    const color = votingColors[data.votingStatus];
    const icon = createStatusIndicator(color);
    item.append(icon);

    return item;
}

function createStatusIndicator(color) {
    const icon = document.createElement("span");
    icon.textContent = "●";
    icon.style.color = color;
    icon.style.marginRight = "2px";
    icon.setAttribute("aria-hidden", "true");

    return icon;
}

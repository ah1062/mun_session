export function createCommitteePresetElement(imgUrl, abbrev) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "committee-preset";
    item.tabIndex = 0;
    item.setAttribute("role", "button");

    const img = document.createElement("img");
    img.className = "icon";
    img.style.maxHeight = "16px";
    img.src = imgUrl;

    const span = document.createElement("span");
    span.textContent = abbrev;

    item.append(img, span);
    return item;
}
// components/CountryListItem.js

export function createCountryListItem(
    countryKey,
    data,
    { showVoting = false, onClick = () => {} } = {}
) {
    const item = document.createElement("div");
    item.className = "list-item";

    const img = document.createElement("img");
    img.src = data.img ?? "../assets/logo.png";
    img.alt = data.shortName ?? countryKey;
    img.style.marginRight = "5px";

    const name = document.createElement("span");
    name.textContent = data.shortName ?? countryKey;

    item.append(img, name);

    if (!showVoting) {
        item.addEventListener("click", onClick);
        return item;
    }

    const voting = document.createElement("div");
    voting.className = "voting";
    voting.style.alignItems = "center";
    voting.style.display = "flex";
    voting.style.gap = "3px";
    voting.style.marginLeft = "auto";
    voting.style.padding = "5px";

    const observerButton = document.createElement("button");
    observerButton.textContent = "Observer";
    observerButton.style.backgroundColor = "#6c6";
    observerButton.style.width = "auto";
    observerButton.style.whiteSpace = "nowrap";

    observerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      data.votingObserver = !data.votingObserver;
      observerButton.classList.toggle("selected", data.votingObserver);
    });
    voting.appendChild(observerButton);

    const buttons = [
      { label: "A", color: "#c66" },
      { label: "P", color: "#c86" },
      { label: "PV", color: "#99f" },
    ];

    for (const buttonData of buttons) {
      const button = document.createElement("button");
      button.textContent = buttonData.label;
      button.style.backgroundColor = buttonData.color;

      button.classList.toggle("selected", data.votingStatus === buttonData.label);
      button.addEventListener("click", (event) => {
        event.stopPropagation();

        data.votingStatus = buttonData.label;
        voting.querySelectorAll("button").forEach((btn) => {
          if (btn.textContent !== "Observer") {
            btn.classList.toggle(
              "selected",
              btn.textContent === data.votingStatus,
            );
          }
        });
      });

      voting.appendChild(button);
    }
    item.appendChild(voting);

    item.addEventListener("click", onClick);
    return item;
}

export function createCountriesListBox() {

}
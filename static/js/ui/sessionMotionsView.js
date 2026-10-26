
import { Motion } from "../models/motion.js";

export class SessionMotionsView {
  constructor(session) {
    this.session = session;
    this.templateName = "sessionMotionsTemplate";
    this.root = null;
    this.motions = [];
  }

  async render() {
    this.bindEvents();
    this.renderMotions();
  }

  bindEvents() {
    const openButton = document.getElementById("openMotionDialog");
    openButton?.addEventListener("click", () => {
      document.getElementById("motionDialog").showModal();
    });

    const cancelButton = document.getElementById("cancelMotion");
    const form = document.getElementById("motionForm");
    const typeSelect = document.getElementById("motionType");

    cancelButton?.addEventListener("click", () => {
      document.getElementById("motionDialog").close();
    });

    typeSelect?.addEventListener("change", () => {
      this.updateMotionFields(typeSelect.value);
    });

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.submitMotion(form);
    });

    // Event delegation for buttons on submitted motions.
    document.getElementById("#motionList")?.addEventListener(
      "click",
      (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const motion = this.motions.find(
          (item) => item.id === button.dataset.motionId
        );

        if (!motion) return;

        if (button.dataset.action === "present") {
          this.presentMotion(motion);
        }
      }
    );

    const dialog = document.getElementById("motionDialog");
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  }

  updateMotionFields(type) {
    const speakerField = document.getElementById("speakerDurationField");
    const durationFields = document.getElementById("motionDurationFields");

    if (speakerField) {
      speakerField.hidden = type !== "moderated_caucus";
    }

    if (durationFields) {
      durationFields.hidden = type === "other";
    }
  }

  submitMotion(form) {
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const type = data.get("type");
    const duration = Number(data.get("duration") || 0);
    const speakerDuration = Number(data.get("speakerDuration") || 0);

    if (
      type === "moderated_caucus" &&
      (duration <= 0 || speakerDuration <= 0)
    ) {
      alert("Enter a valid caucus duration and speaking time.");
      return;
    }

    if (
      type === "unmoderated_caucus" &&
      duration <= 0
    ) {
      alert("Enter a valid caucus duration.");
      return;
    }

    const motion = new Motion({
      type,
      topic: String(data.get("topic") || "").trim(),
      duration,
      proposedBy: String(data.get("proposedBy") || "").trim()
    });

    motion.speakerDuration = speakerDuration;

    this.motions.push(motion);

    document.getElementById("#motionDialog").close();
    form.reset();

    this.updateMotionFields("");

    const durationInput = form.elements.duration;
    const speakerInput = form.elements.speakerDuration;

    if (durationInput) durationInput.value = 10;
    if (speakerInput) speakerInput.value = 60;

    this.renderMotions();
  }

  presentMotion(motion) {
    motion.status = "presented";
    this.renderMotions();

    // Add chair presentation or voting logic here.
  }

  renderMotions() {
    const list = document.getElementById("#motionList");
    if (!list) return;

    list.replaceChildren();

    if (this.motions.length === 0) {
      list.textContent = "No motions have been submitted.";
      return;
    }

    for (const motion of this.motions) {
      const card = document.createElement("article");
      card.className = "motion-card";

      const title = document.createElement("h3");
      title.textContent = this.formatType(motion.type);

      const proposer = document.createElement("p");
      proposer.textContent = `Proposed by: ${motion.proposedBy}`;

      const topic = document.createElement("p");
      topic.textContent = motion.topic || "No topic specified";

      const duration = document.createElement("p");
      duration.textContent =
        motion.duration > 0
          ? `Duration: ${motion.duration} minutes`
          : "No duration specified";

      const status = document.createElement("p");
      status.textContent = `Status: ${motion.status}`;

      card.append(title, proposer, topic, duration, status);

      if (motion.type === "moderated_caucus") {
        const speakerTime = document.createElement("p");
        speakerTime.textContent =
          `Individual speaking time: ${motion.speakerDuration} seconds`;
        card.appendChild(speakerTime);
      }

      const presentButton = document.createElement("button");
      presentButton.type = "button";
      presentButton.dataset.action = "present";
      presentButton.dataset.motionId = motion.id;
      presentButton.textContent = "Present motion";
      presentButton.disabled = motion.status === "presented";

      card.appendChild(presentButton);
      list.appendChild(card);
    }
  }

  formatType(type) {
    const labels = {
      moderated_caucus: "Moderated Caucus",
      unmoderated_caucus: "Unmoderated Caucus",
      extension: "Extension",
      other: "Other Motion"
    };

    return labels[type] ?? type;
  }
}

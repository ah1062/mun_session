const templateMap = {
    "roll-call": "roll-call-template",
    "single-speaker": "single-speaker-template",
    "gsl": "gsl-template",
    "motions": "motions-template",
    "caucus": "moderated-caucus-template",
    "unmod-caucus": "unmoderated-caucus-template",
}

export function showView(viewName) {
    const templateId = templateMap[viewName];
    const template = document.getElementById(templateId);
    const middleColumn = document.getElementById("middle-column");
    
    if (!template || !middleColumn) return;

    const content = template.content.cloneNode(true);
    middleColumn.replaceChildren(content);

    document.querySelectorAll(".view-nav-item").forEach(button => {
        const isActive = button.dataset.view === viewName;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-current", isActive ? "page" : "false");
    });

    return viewName;
}

export function setupNavigation(onViewChange = () => {}) {
    const navbar = document.getElementById("view-navbar");
    
    navbar?.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-view]');
        if (!button || !navbar.contains(button)) return;

        const viewName = showView(button.dataset.view); 
        if (viewName) {
            onViewChange(viewName);
        }
    });
}
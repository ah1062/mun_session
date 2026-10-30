const panelMap = {
    "roll-call": "roll-call-panel",
    "single-speaker": "single-speaker-panel",
    "gsl": "gsl-panel",
}

export function showView(viewName) {
    const panelId = panelMap[viewName];
    const panel = document.getElementById(panelId);
    if (!panel) return;

    document.querySelectorAll("[id$='-panel']").forEach(item => {
        item.hidden = item.id !== panelId;
    })

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
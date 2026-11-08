const panelMap = {
    "roll-call": "roll-call-panel",
    "single-speaker": "single-speaker-panel",
    "gsl": "gsl-panel",
    "motions": "motions-panel",
    "settings": "settings-panel"
}

function showView(viewName) {
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

export function setupNavigation(session, onViewChange = () => {}) {
    const navbarItems = document.querySelectorAll('.view-nav-item');
    for (const item of navbarItems) {
        if (item.dataset.view === "settings") continue;
        item.style.filter = 'brightness(0.4)';
    }

    const navbar = document.getElementById("view-navbar");
    navbar?.addEventListener('click', (event) => {
        if (!session.created) return;

        const button = event.target.closest('button[data-view]');
        if (!button || !navbar.contains(button)) return;

        const viewName = showView(button.dataset.view); 
        if (viewName) {
            onViewChange(viewName);
        }
    });
}
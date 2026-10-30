export function setupTheme(session) {
    const themeToggle = document.getElementById("theme-toggle");
    themeToggle?.addEventListener('click', () => {
        const isLight = root.dataset.theme !== 'light';

        const logo = document.getElementById("header-logo");
        if (!logo) return;

        logo.src = isLight ? 'assets/logo_dark.png' : 'assets/logo.png';
        root.dataset.theme = isLight ? 'light' : 'dark';

        themeToggle.textContent = isLight ? 'Dark mode' : 'Light mode';
        themeToggle.setAttribute(
            'aria-label',
            isLight ? 'Switch to dark mode' : 'Switch to light mode'
        );
    });
}
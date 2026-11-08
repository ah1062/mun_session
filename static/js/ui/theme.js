async function fetchLanguageDictionaries() {
    return ["EN"];
}

export async function setupLanguages(session) {
    const languages = await fetchLanguageDictionaries();

    const languageSelect = document.getElementById("language-select");
    languageSelect.replaceChildren();
    for (const theme of languages) {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);

        languageSelect.append(option);
    }
}

function isLightTheme() {
    const colorScheme = getComputedStyle(document.documentElement)
        .getPropertyValue("color-scheme")
        .trim();

    console.log(colorScheme);
    return colorScheme === "light";
}

export function setupTheme(session) {
    const themes = new Set();
    const theme_re = /html\[data-theme=["']([^"']+)["']\]/;
    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules) {
                const match = rule.selectorText?.match(theme_re);
                if(!match) continue;

                themes.add(match[1]);
            }
        } catch {
            continue;
        }
    }
    themes.add('LIMUN');
    
    const themeSelect = document.getElementById("theme-select");
    themeSelect.replaceChildren();
    for (const theme of themes) {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);

        themeSelect.append(option);
    }

    const currentTheme = root.dataset.theme || 'LIMUN';
    themeSelect.value = currentTheme;
    themeSelect?.addEventListener('change', () => {
        const value = themeSelect.value;
        root.dataset.theme = value;       
        
        const isLight = isLightTheme();

        const logo = document.getElementById("header-logo");
        if (logo) {
            logo.src = isLight ? 'assets/logo_dark.png' : 'assets/logo.png';
        }

        const themeIcon = document.getElementById("theme-icon");
        if (themeIcon) {
            themeIcon.textContent = isLight ? '☀' : '☼';
        }


        const presetsContainer = document.getElementById("committee-preset-container");
        if (presetsContainer) {
            for (const child of presetsContainer.getElementsByTagName('img')) {
                child.src = isLight ? 'assets/logo_dark.png' : 'assets/logo.png';
            }
        }
    });
}
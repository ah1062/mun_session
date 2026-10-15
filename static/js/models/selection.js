export class CountrySelection {
    constructor(nations, committeePresets) {
        this.nations = nations;
        this.presets = committeePresets;

        this.availableCount = Object.keys(this.nations).length;
        this.availableCountries = structuredClone(this.nations);
        this.selectedCount = 0;
        this.selectedCountries = {};
    }

    selectCustom(name, data) {
        if (name in this.selectedCountries) {
            return;
        } else if (name in this.nations) {
            this.selectCountry(name);
            return;
        }
        
        this.selectedCount++;
        this.selectedCountries[name] = data;
    }
    selectCountry(name) {
        const country = this.availableCountries[name];
        if (!country) return;

        this.selectedCount++;
        this.selectedCountries[name] = country;

        this.availableCount--;
        delete this.availableCountries[name];
    }
    deselectCountry(name) {
        const country = this.selectedCountries[name];
        if (!country) return;

        if (!(name in this.nations)) {
            this.selectedCount--;
            delete this.selectedCountries[name];
            return;
        }

        this.availableCount++;
        this.availableCountries[name] = structuredClone(this.nations[name]);

        this.selectedCount--;
        delete this.selectedCountries[name];
    }
    clearSelection() {
        for (const countryKey of Object.keys(this.selectedCountries)) {
            this.deselectCountry(countryKey);
        }
    }

    applyPreset(name) {
        const preset = this.presets[name];
        if (!preset) return;

        for (const countryKey of preset.countries ?? []) {
            this.selectCountry(countryKey);
        }
    }
    removePreset(name) {
        const preset = this.presets[name];
        if (!preset) return;
        
        for (const countryKey of preset.countries ?? []) {
            this.deselectCountry(countryKey);
        }
    }
}
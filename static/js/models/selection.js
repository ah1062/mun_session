export class CountrySelection {
    constructor(nations, committeePresets) {
        this.nations = nations;
        this.presets = committeePresets;

        this.availableCountries = structuredClone(this.nations);
        this.selectedCountries = {};
    }

    selectCountry(name) {
        const country = this.availableCountries[name];
        if (!country) return;

        this.selectedCountries[name] = country;
        delete this.availableCountries[name];
    }
    deselectCountry(name) {
        const country = this.availableCountries[name];
        if (!country) return;

        this.availableCountries[name] = structuredClone(this.nations[name]);
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
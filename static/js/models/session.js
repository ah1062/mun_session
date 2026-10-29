import { Country } from "./country.js";

const supabase = null;

class Session {
    constructor(sessionId, countries) {
        this.id = sessionId;
        
        this.availableCountries = countries;

        this.selectedCountries = {};
        this.currentSpeaker = null;
        this.speakerQueue = [];
    }

    enqueueCountry(countryKey) {
        if (!(countryKey in this.selectedCountries)) return;
        // if (this.speakerQueue.includes(countryKey)) return;

        this.speakerQueue.push(countryKey);
    }

    dequeueCountry(countryKey) {
        const index = this.speakerQueue.indexOf(countryKey);
        if (index === -1) return;

        this.speakerQueue.splice(index, 1);
    }
}

export async function saveSession() {
    if (!supabase) {
        console.error("TODO: No supabase client...");
        return;
    }
}

export async function loadSession(sessionId) {
    if (!supabase) {
        console.error("TODO: No supabase client...");
        return;
    }
}

export async function createSession(sessionId) {
    const countries = await fetchCountryData();

    const session = new Session(sessionId, countries);
    return session;
}

async function fetchCountryData() {
    const countries = {};
    await fetch("./assets/country-info.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            for (const [countryKey, data] of Object.entries(result.nations)) {
                const isoCode = data.isoCode;
                const imgUrl = data.img ?? 'assets/logo.png';
                const shortName = data.shortName;
                const longName = data.longName ?? shortName;
                const country = new Country(imgUrl, shortName, longName);
                countries[countryKey] = country;
            }
        })
        .catch(error => {
            console.error(error.message);
        });

    return countries;
}